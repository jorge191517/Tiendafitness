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
 * ⚠️ IMPORTANTE — Esquema de order_items:
 * - product_slug TEXT NOT NULL → identificador universal (local + Supabase)
 * - product_name TEXT NOT NULL → nombre al momento de compra
 * - product_id UUID NULLABLE → solo si existe en Supabase (UUID real)
 * - Los productos locales (IDs 101-104) NO se insertan en product_id
 * - variant_id TEXT → ID de variante como string (no UUID)
 * - subtotal en vez de total (para coincidir con el schema SQL)
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
  variantId?: number | string;
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

/** Valida si un string es un UUID válido */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Obtiene el precio de un producto desde el servidor.
 * Primero busca en Supabase, si no lo encuentra usa datos locales.
 * Siempre devuelve el precio del servidor (anti-manipulación).
 *
 * Retorna también si el product_id es un UUID válido de Supabase.
 */
async function getServerPrice(slug: string): Promise<{
  found: boolean;
  productId?: string;     // UUID de Supabase o string numérico local
  isUUID?: boolean;       // true si productId es un UUID real de Supabase
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
          productId: data.id,       // UUID real de Supabase
          isUUID: true,
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
      productId: String(localProduct.id),  // "101", "102", etc. — NO es UUID
      isUUID: false,
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
 *    - product_slug siempre se guarda (identificador universal)
 *    - product_id solo se guarda si es UUID válido de Supabase
 *    - NO se insertan IDs numéricos locales en columna UUID
 * 5. Envía emails de confirmación (cliente + admin) — no bloqueante
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

    // ─── 3. Validar cada item y construir payload de order_items ───
    let serverTotal = 0;
    const orderItemsPayload: {
      product_slug: string;
      product_name: string;
      product_id?: string;        // solo UUID válido de Supabase
      variant_id: string | null;
      color_name: string;
      size: string | null;
      quantity: number;
      unit_price: number;
      subtotal: number;
      image: string | null;
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

      // Construir item — product_id SOLO si es UUID válido de Supabase
      const orderItem: typeof orderItemsPayload[number] = {
        product_slug: item.slug,
        product_name: item.name,
        variant_id: item.variantId != null ? String(item.variantId) : null,
        color_name: item.colorName,
        size: item.selectedSize || null,
        quantity: item.quantity,
        unit_price: serverPrice,
        subtotal: lineTotal,
        image: item.image || null,
      };

      // Solo incluir product_id si es un UUID válido de Supabase
      // Los productos locales (101, 102, etc.) NO son UUID y causarían error 22P02
      if (serverProduct.isUUID && serverProduct.productId && isValidUUID(serverProduct.productId)) {
        orderItem.product_id = serverProduct.productId;
      }

      orderItemsPayload.push(orderItem);

      emailItems.push({
        name: `${item.name} (${item.colorName}${item.selectedSize ? `, Talla ${item.selectedSize}` : ""})`,
        quantity: item.quantity,
        unit_price: serverPrice,
        total: lineTotal,
      });
    }

    // ─── 4. Crear el pedido usando SERVICE ROLE (bypass RLS) ───
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
    if (orderData?.id && orderItemsPayload.length > 0) {
      const itemsWithOrderId = orderItemsPayload.map((item) => ({
        ...item,
        order_id: orderData.id,
      }));

      console.log("[CHECKOUT_ORDER_ITEMS_PAYLOAD]", JSON.stringify(itemsWithOrderId, null, 2));

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

    // ─── 6. Enviar emails de notificación ───
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

      // Enviar emails — no bloquear el checkout si fallan
      try {
        console.log("[ORDER_EMAIL_CLIENT] sending to:", payload.customer.email);
        await sendOrderConfirmationEmail(emailPayload);
        console.log("[ORDER_EMAIL_CLIENT] sent to:", payload.customer.email);
      } catch (err) {
        console.error("[ORDER_EMAIL_CLIENT] error:", err);
      }

      try {
        console.log("[ORDER_EMAIL_ADMIN] sending");
        await sendNewOrderAdminEmail(emailPayload);
        console.log("[ORDER_EMAIL_ADMIN] sent");
      } catch (err) {
        console.error("[ORDER_EMAIL_ADMIN] error:", err);
      }
    }

    console.log("[Checkout] Pedido creado exitosamente:", orderData.id, "userId:", userId ?? "guest");

    return { success: true, orderId: orderData.id };
  } catch (err) {
    console.error("[CHECKOUT_ERROR] Error inesperado en createOrder:", err);
    return { success: false, error: "Error interno del servidor." };
  }
}
