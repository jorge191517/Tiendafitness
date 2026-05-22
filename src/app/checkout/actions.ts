/**
 * Server Actions para el checkout.
 *
 * ⛔ La creación de pedidos se hace en el servidor para:
 * - Validar precios contra el catálogo local (evitar manipulación)
 * - Usar el cliente Supabase para INSERT
 * - Garantizar integridad de los datos
 *
 * NUNCA confiar en los precios enviados desde el cliente.
 *
 * Se permite checkout como invitado (sin cuenta).
 * Si el usuario está autenticado, se vincula user_id.
 * Si no, se usa customer_email como referencia.
 *
 * La validación de productos se hace contra ALL_PRODUCTS (catálogo local)
 * buscando SIEMPRE por slug. NO se usa id numérico ni UUID.
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { ALL_PRODUCTS } from "@/data/products";
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
 * 3. Valida los productos contra ALL_PRODUCTS por slug (anti-manipulación)
 * 4. Crea el pedido en la tabla `orders` con order_number
 * 5. Crea las líneas de pedido en `order_items`
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

    // 3. Validar cada item del carrito contra ALL_PRODUCTS por slug
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

    const emailItems: {
      name: string;
      quantity: number;
      unit_price: number;
      total: number;
      image?: string;
    }[] = [];

    for (const item of payload.items) {
      // ⛔ Validar SIEMPRE por slug contra el catálogo local
      const catalogProduct = ALL_PRODUCTS.find((p) => p.slug === item.slug);

      if (!catalogProduct) {
        console.error("[CHECKOUT] Producto no encontrado en catálogo local:", item.slug);
        return { success: false, error: `Producto "${item.name}" no encontrado en el catálogo.` };
      }

      // ⛔ Usar el precio del SERVIDOR (catálogo local), no el del cliente (anti-manipulación)
      const serverPrice = catalogProduct.price;
      const lineTotal = serverPrice * item.quantity;
      serverTotal += lineTotal;

      orderItems.push({
        order_id: "", // Se rellenará después del INSERT de orders
        product_id: null, // No usamos UUID de Supabase para productos locales
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

    // 5. Crear el pedido
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

    // 7. Enviar emails de notificación
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
    }

    return { success: true, orderId: orderData.id, orderNumber: finalOrderNumber };
  } catch (err) {
    console.error("[CHECKOUT] Error inesperado en createOrder:", err);
    return { success: false, error: "Error interno del servidor." };
  }
}
