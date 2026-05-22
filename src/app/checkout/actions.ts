/**
 * Server Actions para el checkout.
 *
 * ⛔ La creación de pedidos se hace en el servidor para:
 * - Validar precios contra la base de datos (evitar manipulación)
 * - Usar el cliente Supabase admin (service role) para INSERT
 * - Garantizar integridad de los datos
 *
 * NUNCA confiar en los precios enviados desde el cliente.
 *
 * Se permite checkout como invitado (sin cuenta).
 * Si el usuario está autenticado, se vincula user_id.
 * Si no, se usa customer_email como referencia.
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
  variantId?: number;
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
  orderNumber?: string;
  error?: string;
}

/**
 * Genera un número de pedido único: TFP-YYYYMMDD-XXXXX
 */
function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 99999).toString().padStart(5, "0");
  return `TFP-${dateStr}-${random}`;
}

/**
 * Crea un pedido en Supabase.
 *
 * Flujo:
 * 1. Verifica que haya items en el carrito
 * 2. Identifica al usuario (autenticado o invitado)
 * 3. Valida los precios contra la base de datos (anti-manipulación)
 * 4. Crea el pedido en la tabla `orders` con order_number
 * 5. Crea las líneas de pedido en `order_items` con datos de producto local
 * 6. Envía emails de confirmación (cliente + admin) — no bloqueante
 */
export async function createOrder(payload: CheckoutPayload): Promise<CheckoutResult> {
  try {
    console.log("[CHECKOUT] Iniciando creación de pedido...");
    console.log("[CHECKOUT] Customer:", payload.customer.email, "| Items:", payload.items.length);

    const supabase = await createClient();

    // 1. Verificar autenticación (opcional — invitados permitidos)
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? null;
    console.log("[CHECKOUT] Usuario:", userId ? `autenticado (${userId.substring(0, 8)}...)` : "invitado");

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
      console.error("[CHECKOUT] Error consultando productos:", dbError);
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
      order_id: string;
      product_id: string | null;
      product_slug: string;
      product_name: string;
      variant_id: string;
      color_name: string;
      size: string;
      image_url: string;
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
      image?: string;
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

      // Guardar datos para order_items (se completará order_id después)
      orderItems.push({
        order_id: "", // Se rellenará después del INSERT de orders
        product_id: dbProduct.id,
        product_slug: item.slug,
        product_name: item.name,
        variant_id: item.variantId?.toString() ?? "0",
        color_name: item.colorName ?? "",
        size: item.selectedSize ?? "",
        image_url: item.image ?? "",
        quantity: item.quantity,
        unit_price: serverPrice,
        total: lineTotal,
      });

      emailItems.push({
        name: `${item.name} (${item.colorName}${item.selectedSize ? `, Talla ${item.selectedSize}` : ""})`,
        quantity: item.quantity,
        unit_price: serverPrice,
        total: lineTotal,
        image: item.image,
      });
    }

    // 4. Generar order_number
    const orderNumber = generateOrderNumber();
    console.log("[CHECKOUT] Order number generado:", orderNumber);

    // 5. Crear el pedido con admin client (service role) para bypass RLS
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
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
      console.error("[CHECKOUT] Error creando pedido:", orderError);
      return { success: false, error: `Error al crear el pedido: ${orderError.message}` };
    }

    if (!orderData?.id) {
      console.error("[CHECKOUT] No se obtuvo ID del pedido creado");
      return { success: false, error: "Error al crear el pedido. Inténtalo de nuevo." };
    }

    const finalOrderNumber = orderData.order_number || orderNumber;
    console.log("[CHECKOUT] Pedido creado:", { id: orderData.id, orderNumber: finalOrderNumber });

    // 6. Crear las líneas de pedido con order_id real
    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: orderData.id,
    }));

    console.log("[CHECKOUT ORDER_ITEMS] Insertando", itemsWithOrderId.length, "items:", JSON.stringify(itemsWithOrderId.map(i => ({
      product_slug: i.product_slug,
      product_name: i.product_name,
      variant_id: i.variant_id,
      quantity: i.quantity,
      unit_price: i.unit_price,
    }))));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsError) {
      console.error("[CHECKOUT] Error creando líneas de pedido:", itemsError);
      // El pedido principal ya se creó, no lanzamos error
    } else {
      console.log("[CHECKOUT] Order items creados correctamente");
    }

    // 7. Enviar emails de notificación (no bloqueante pero con await para logging)
    console.log("[CHECKOUT] Enviando emails de notificación...");
    try {
      const emailPayload = {
        orderId: finalOrderNumber,
        customerName: payload.customer.name,
        customerEmail: payload.customer.email,
        customerPhone: payload.customer.phone,
        items: emailItems,
        total: serverTotal,
        shippingAddress: payload.address,
      };

      const [clientResult, adminResult] = await Promise.allSettled([
        sendOrderConfirmationEmail(emailPayload),
        sendNewOrderAdminEmail(emailPayload),
      ]);

      if (clientResult.status === "fulfilled") {
        console.log("[CHECKOUT] Email cliente enviado correctamente");
      } else {
        console.error("[CHECKOUT] Error enviando email al cliente:", clientResult.reason);
      }

      if (adminResult.status === "fulfilled") {
        console.log("[CHECKOUT] Email admin enviado correctamente");
      } else {
        console.error("[CHECKOUT] Error enviando email al admin:", adminResult.reason);
      }
    } catch (emailErr) {
      console.error("[CHECKOUT] Error en envío de emails:", emailErr);
      // No interrumpir el flujo
    }

    return { success: true, orderId: orderData.id, orderNumber: finalOrderNumber };
  } catch (err) {
    console.error("[CHECKOUT] Error inesperado en createOrder:", err);
    return { success: false, error: "Error interno del servidor." };
  }
}
