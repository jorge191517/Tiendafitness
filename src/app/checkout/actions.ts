/**
 * Server Actions para el checkout.
 *
 * ⛔ La creación de pedidos se hace en el servidor para:
 * - Validar precios contra la base de datos (evitar manipulación)
 * - Usar el cliente Supabase con sesión autenticada
 * - Garantizar integridad de los datos
 *
 * NUNCA confiar en los precios enviados desde el cliente.
 *
 * Estrategia de validación de precios:
 * 1. Buscar producto en Supabase por slug
 * 2. Si Supabase no tiene el producto (tabla vacía o error), usar datos locales
 * 3. Siempre usar el precio del SERVIDOR, nunca del cliente
 *
 * Tras crear el pedido correctamente, se envían emails de notificación
 * tanto al cliente como al admin. Si el envío de email falla,
 * NO se interrumpe el flujo del pedido (se registra el error en servidor).
 */

"use server";

import { createClient } from "@/lib/supabase/server";
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

/**
 * Obtiene el precio de un producto desde el servidor.
 * Primero busca en Supabase, si no lo encuentra usa datos locales.
 * Siempre devuelve el precio del servidor (anti-manipulación).
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
 * 1. Verifica que el usuario esté autenticado
 * 2. Valida los precios contra Supabase o datos locales (anti-manipulación)
 * 3. Crea el pedido en la tabla `orders`
 * 4. Crea las líneas de pedido en `order_items`
 * 5. Envía emails de confirmación (cliente + admin) — no bloqueante
 */
export async function createOrder(payload: CheckoutPayload): Promise<CheckoutResult> {
  try {
    const supabase = await createClient();

    // 1. Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Debes iniciar sesión para realizar un pedido." };
    }

    // 2. Validar que hay items
    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: "El carrito está vacío." };
    }

    // 3. Validar cada item del carrito contra Supabase o datos locales
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

    // 4. Crear el pedido
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
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
      console.error("Error creando pedido:", orderError);
      return { success: false, error: "Error al crear el pedido. Inténtalo de nuevo." };
    }

    // 5. Crear las líneas de pedido
    if (orderData?.id && orderItems.length > 0) {
      const itemsWithOrderId = orderItems.map((item) => ({
        ...item,
        order_id: orderData.id,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsWithOrderId);

      if (itemsError) {
        console.error("Error creando líneas de pedido:", itemsError);
        // El pedido principal ya se creó, no lanzamos error
      }
    }

    // 6. Enviar emails de notificación (no bloqueante)
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

    return { success: true, orderId: orderData.id };
  } catch (err) {
    console.error("Error inesperado en createOrder:", err);
    return { success: false, error: "Error interno del servidor." };
  }
}
