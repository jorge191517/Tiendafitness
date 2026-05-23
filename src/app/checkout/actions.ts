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
 * Tras crear el pedido correctamente, se envían emails de notificación
 * tanto al cliente como al admin. Si el envío de email falla,
 * NO se interrumpe el flujo del pedido (se registra el error en servidor).
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email/send-order-email";

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

/**
 * Crea un pedido en Supabase.
 *
 * Flujo:
 * 1. Verifica que el usuario esté autenticado
 * 2. Valida los precios contra la base de datos (anti-manipulación)
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

    // 3. Buscar productos en la base de datos y validar precios
    const slugs = payload.items.map((i) => i.slug);
    const { data: dbProducts, error: dbError } = await supabase
      .from("products")
      .select("id, slug, price, active, stock_status, stock_quantity")
      .in("slug", slugs);

    if (dbError) {
      return { success: false, error: "Error al verificar productos." };
    }

    // Mapeo slug → producto DB
    const productMap = new Map<string, (typeof dbProducts)[0]>();
    for (const p of dbProducts ?? []) {
      productMap.set(p.slug, p);
    }

    // Validar cada item del carrito contra la DB
    let serverTotal = 0;
    const orderItems: {
      product_id: string;
      product_slug: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      total: number;
      image_url: string;
      color_name: string;
      size: string;
    }[] = [];

    // Datos para emails (con nombres de producto)
    const emailItems: {
      name: string;
      quantity: number;
      unit_price: number;
      total: number;
    }[] = [];

    for (const item of payload.items) {
      const dbProduct = productMap.get(item.slug);

      if (!dbProduct) {
        return { success: false, error: `Producto "${item.name}" no encontrado en el catálogo.` };
      }

      if (!dbProduct.active) {
        return { success: false, error: `Producto "${item.name}" no está disponible.` };
      }

      if (dbProduct.stock_status === "out_of_stock") {
        return { success: false, error: `Producto "${item.name}" está agotado.` };
      }

      // ⛔ Usar el precio del SERVIDOR, no el del cliente (anti-manipulación)
      const serverPrice = Number(dbProduct.price);
      const lineTotal = serverPrice * item.quantity;

      serverTotal += lineTotal;

      orderItems.push({
        product_id: dbProduct.id,
        product_slug: item.slug,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: serverPrice,
        total: lineTotal,
        image_url: item.image,
        color_name: item.colorName,
        size: item.selectedSize,
      });

      emailItems.push({
        name: `${item.name} (${item.colorName}${item.selectedSize ? `, Talla ${item.selectedSize}` : ""})`,
        quantity: item.quantity,
        unit_price: serverPrice,
        total: lineTotal,
      });
    }

    // 4. Generar order_number
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const rand = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
    const orderNumber = `TFP-${y}${m}${d}-${rand}`;

    // 5. Crear el pedido
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
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
      .select("id, order_number")
      .single();

    if (orderError) {
      console.error("Error creando pedido:", orderError);
      return { success: false, error: "Error al crear el pedido. Inténtalo de nuevo." };
    }

    // 6. Crear las líneas de pedido
    if (orderData?.id && orderItems.length > 0) {
      const itemsWithOrderId = orderItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_slug: item.product_slug,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
        image_url: item.image_url,
        color_name: item.color_name || null,
        size: item.size || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsWithOrderId);

      if (itemsError) {
        console.error("Error creando líneas de pedido:", itemsError);
        // El pedido principal ya se creó, no lanzamos error
      }
    }

    // 7. Enviar emails de notificación (no bloqueante)
    if (orderData?.id) {
      const emailOrderId = orderData.order_number ?? orderData.id.substring(0, 8).toUpperCase();

      const emailPayload = {
        orderId: emailOrderId,
        customerName: payload.customer.name,
        customerEmail: payload.customer.email,
        customerPhone: payload.customer.phone,
        items: emailItems,
        total: serverTotal,
        shippingAddress: payload.address,
      };

      Promise.allSettled([
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
