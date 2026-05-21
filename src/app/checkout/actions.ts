/**
 * Server Actions para el checkout.
 *
 * ⛔ La creación de pedidos se hace en el servidor para:
 * - Validar precios contra la base de datos (evitar manipulación)
 * - Usar el cliente Supabase con SERVICE ROLE KEY (bypass RLS)
 * - Garantizar integridad de los datos
 *
 * NUNCA confiar en los precios enviados desde el cliente.
 *
 * Estrategia de validación de precios:
 * 1. Buscar producto en Supabase por slug
 * 2. Si Supabase no tiene el producto (tabla vacía o error), usar datos locales
 * 3. Siempre usar el precio del SERVIDOR, nunca del cliente
 *
 * ⚠️ IMPORTANTE — Uso de createAdminClient() (service role):
 * - El INSERT en orders y order_items usa service role para BYPASS RLS
 * - Esto evita errores de infinite recursion en policies de profiles
 * - También permite guest checkout (user_id = null) sin necesitar
 *   policies RLS complejas para el rol anon
 * - La service role key NUNCA se expone al cliente
 * - El cliente solo llama este server action
 *
 * Tras crear el pedido correctamente, se envían emails de notificación
 * tanto al cliente como al admin. Si el envío de email falla,
 * NO se interrumpe el flujo del pedido (se registra el error en servidor).
 */

"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email/send-order-email";
import { getProductBySlug as getLocalProductBySlug } from "@/data/products";

export interface CheckoutItem {
  name: string;
  slug: string;
  price: number;
  colorName: string;
  selectedSize: string;
  quantity: number;
  image: string;
}

export interface CheckoutPayload {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
  };
  items: CheckoutItem[];
}

export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

/** Verifica si Supabase está configurado */
function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/** Verifica si el service role key está disponible para operaciones admin */
function isServiceRoleAvailable(): boolean {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

/**
 * Obtiene el precio de un producto desde el servidor.
 * Primero busca en Supabase, si no lo encuentra usa datos locales.
 * Siempre devuelve el precio del servidor (anti-manipulación).
 *
 * Usa createClient() (anon key) para leer products — la policy SELECT
 * de products es `active = true` y NO consulta profiles, así que no
 * hay riesgo de infinite recursion.
 */
async function getServerPrice(slug: string): Promise<{
  found: boolean;
  productId?: string;
  price?: number;
  active?: boolean;
  stockStatus?: string;
}> {
  // Intentar Supabase primero
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, price, active, stock_status")
        .eq("slug", slug)
        .single();

      if (!error && data) {
        return {
          found: true,
          productId: data.id,
          price: Number(data.price),
          active: data.active,
          stockStatus: data.stock_status,
        };
      }
    } catch (err) {
      console.warn("[Checkout] Error consultando Supabase para slug:", slug, err);
    }
  }

  // Fallback a datos locales
  const localProduct = getLocalProductBySlug(slug);
  if (localProduct) {
    console.log("[Checkout] Producto encontrado en datos locales:", slug);
    return {
      found: true,
      productId: String(localProduct.id),
      price: localProduct.price,
      active: true,
      stockStatus: localProduct.stock,
    };
  }

  return { found: false };
}

/**
 * Crea un pedido en Supabase.
 *
 * Flujo:
 * 1. Obtiene user_id si está autenticado (permite guest checkout)
 * 2. Valida los precios contra Supabase o datos locales (anti-manipulación)
 * 3. Crea el pedido en la tabla `orders` usando SERVICE ROLE (bypass RLS)
 * 4. Crea las líneas de pedido en `order_items` usando SERVICE ROLE
 * 5. Envía emails de confirmación (cliente + admin) — no bloqueante
 *
 * ⚠️ Los INSERT usan createAdminClient() (service role) para:
 * - Evitar infinite recursion en RLS policies de profiles
 * - Permitir guest checkout (user_id = null)
 * - Garantizar que el pedido se crea sin depender de policies complejas
 */
export async function createOrder(payload: CheckoutPayload): Promise<CheckoutResult> {
  try {
    // ─── 1. Verificar autenticación (opcional — permite guest checkout) ───
    const supabaseAuth = await createClient();
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    const userId = user?.id ?? null;

    if (authError) {
      console.warn("[Checkout] Error verificando autenticación:", authError);
      // No bloquear — permitir continuar como invitado
    }

    // ─── 2. Validar que hay items ───
    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: "El carrito está vacío." };
    }

    // ─── 3. Validar cada item del carrito contra Supabase o datos locales ───
    let serverTotal = 0;
    const orderItems: {
      product_id: string;
      quantity: number;
      unit_price: number;
      total: number;
    }[] = [];

    // Datos para emails (con nombres de producto)
    const emailItems: {
      name: string;
      quantity: number;
      unit_price: number;
      total: number;
    }[] = [];

    for (const item of payload.items) {
      const serverProduct = await getServerPrice(item.slug);

      if (!serverProduct.found) {
        return { success: false, error: `Producto "${item.name}" no encontrado en el catálogo.` };
      }

      if (serverProduct.active === false) {
        return { success: false, error: `Producto "${item.name}" no está disponible.` };
      }

      if (serverProduct.stockStatus === "out_of_stock") {
        return { success: false, error: `Producto "${item.name}" está agotado.` };
      }

      // ⛔ Usar el precio del SERVIDOR, no el del cliente (anti-manipulación)
      const serverPrice = serverProduct.price!;
      const lineTotal = serverPrice * item.quantity;

      serverTotal += lineTotal;

      orderItems.push({
        product_id: serverProduct.productId!,
        quantity: item.quantity,
        unit_price: serverPrice,
        total: lineTotal,
      });

      emailItems.push({
        name: `${item.name} (${item.colorName}${item.selectedSize ? `, Talla ${item.selectedSize}` : ""})`,
        quantity: item.quantity,
        unit_price: serverPrice,
        total: lineTotal,
      });
    }

    // ─── 4. Crear el pedido usando SERVICE ROLE (bypass RLS) ───
    // Usar createAdminClient() para evitar infinite recursion en RLS
    // y permitir guest checkout con user_id = null

    if (!isServiceRoleAvailable()) {
      console.error("[CHECKOUT_ERROR] SUPABASE_SERVICE_ROLE_KEY no configurada");
      return { success: false, error: "Error de configuración del servidor. Contacta al administrador." };
    }

    const adminClient = await createAdminClient();

    const { data: orderData, error: orderError } = await adminClient
      .from("orders")
      .insert({
        user_id: userId,
        status: "pending",
        total: serverTotal,
        customer_name: payload.customer.name,
        customer_email: payload.customer.email,
        customer_phone: payload.customer.phone,
        shipping_address: {
          street: payload.address.street,
          city: payload.address.city,
          province: payload.address.province,
          postal_code: payload.address.postal_code,
          country: payload.address.country,
        },
      })
      .select("id")
      .single();

    if (orderError) {
      console.error("[CHECKOUT_ERROR] Error creando pedido:", JSON.stringify({
        code: orderError.code,
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint,
      }));
      return { success: false, error: "Error al crear el pedido. Inténtalo de nuevo." };
    }

    // ─── 5. Crear las líneas de pedido usando SERVICE ROLE ───
    if (orderData?.id && orderItems.length > 0) {
      const itemsWithOrderId = orderItems.map((item) => ({
        ...item,
        order_id: orderData.id,
      }));

      const { error: itemsError } = await adminClient
        .from("order_items")
        .insert(itemsWithOrderId);

      if (itemsError) {
        console.error("[CHECKOUT_ERROR] Error creando líneas de pedido:", JSON.stringify({
          code: itemsError.code,
          message: itemsError.message,
          details: itemsError.details,
          hint: itemsError.hint,
        }));
        // El pedido principal ya se creó, no lanzamos error
        // pero sí lo registramos para revisión manual
      }
    }

    // ─── 6. Enviar emails de notificación (no bloqueante) ───
    // Si falla el envío de email, NO debe romper la creación del pedido.
    if (orderData?.id) {
      const orderIdShort = orderData.id.substring(0, 8).toUpperCase();

      const emailPayload = {
        orderId: orderIdShort,
        customerName: payload.customer.name,
        customerEmail: payload.customer.email,
        customerPhone: payload.customer.phone,
        items: emailItems,
        total: serverTotal,
        shippingAddress: payload.address,
      };

      // Ejecutar en paralelo sin await para no bloquear la respuesta
      // (fire-and-forget con catch interno)
      Promise.all([
        sendOrderConfirmationEmail(emailPayload),
        sendNewOrderAdminEmail(emailPayload),
      ]).catch((err) => {
        console.error("[Checkout] Error en envío de emails de notificación:", err);
      });
    }

    console.log("[Checkout] Pedido creado exitosamente:", orderData.id, "userId:", userId ?? "guest");

    return { success: true, orderId: orderData.id };
  } catch (err) {
    console.error("[CHECKOUT_ERROR] Error inesperado en createOrder:", err);
    return { success: false, error: "Error interno del servidor." };
  }
}
