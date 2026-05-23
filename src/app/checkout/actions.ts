/**
 * Server Actions para el checkout.
 *
 * ⛔ La creación de pedidos se hace en el servidor para:
 * - Validar precios contra el catálogo local (evitar manipulación)
 * - Usar el cliente Supabase con sesión autenticada
 * - Garantizar integridad de los datos
 *
 * NUNCA confiar en los precios enviados desde el cliente.
 *
 * Los productos se validan contra el catálogo local (ALL_PRODUCTS).
 * La imagen se resuelve desde el producto local con prioridad:
 *   1. Variante seleccionada (selectedVariant.image)
 *   2. Imagen principal del producto (localProduct.image)
 *   3. Imagen enviada desde el carrito (item.image)
 *   4. null
 *
 * NO se depende de Supabase products.image_url porque los productos
 * son locales y no tienen UUID/product_id en Supabase.
 *
 * Tras crear el pedido correctamente, se envían emails de notificación
 * tanto al cliente como al admin. Si el envío de email falla,
 * NO se interrumpe el flujo del pedido (se registra el error en servidor).
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email/send-order-email";
import { allProducts } from "@/data/products";
import type { Product, ProductVariant } from "@/data/types";

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

// ─── Mapa de productos locales por slug ──────────────────────────────────────

const localProductMap = new Map<string, Product>();
for (const p of allProducts) {
  localProductMap.set(p.slug, p);
}

/**
 * Busca la variante de un producto local que coincide con el colorName.
 */
function findVariant(product: Product, colorName: string): ProductVariant | undefined {
  return product.variants.find((v) => v.colorName === colorName);
}

/**
 * Crea un pedido en Supabase.
 *
 * Flujo:
 * 1. Verifica que el usuario esté autenticado
 * 2. Valida los productos contra el catálogo local (anti-manipulación)
 * 3. Resuelve image_url desde producto local + variante seleccionada
 * 4. Crea el pedido en la tabla `orders`
 * 5. Crea las líneas de pedido en `order_items`
 * 6. Envía emails de confirmación (cliente + admin) — no bloqueante
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

    // 3. Validar productos contra el catálogo local y construir orderItems
    let serverTotal = 0;
    const orderItems: {
      product_id: string | null;
      product_slug: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      total: number;
      image_url: string | null;
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

    // Intentar obtener product_id de Supabase para FK (no bloqueante)
    const slugs = payload.items.map((i) => i.slug);
    const { data: dbProducts } = await supabase
      .from("products")
      .select("id, slug")
      .in("slug", slugs);

    const dbSlugToId = new Map<string, string>();
    for (const p of dbProducts ?? []) {
      dbSlugToId.set(p.slug, p.id);
    }

    for (const item of payload.items) {
      // Validar producto por slug en catálogo local
      const localProduct = localProductMap.get(item.slug);

      if (!localProduct) {
        return { success: false, error: `Producto "${item.name}" no encontrado en el catálogo.` };
      }

      // ⛔ Usar el precio del catálogo local, no el del cliente (anti-manipulación)
      const serverPrice = localProduct.price;
      const lineTotal = serverPrice * item.quantity;

      serverTotal += lineTotal;

      // Buscar variante seleccionada por colorName
      const selectedVariant = findVariant(localProduct, item.colorName);

      // Resolver imagen: prioridad 1) variante, 2) producto local, 3) carrito, 4) null
      const imageUrl = selectedVariant?.image || localProduct.image || item.image || null;

      // product_id: usar el de Supabase si existe (para FK), sino null
      const productId = dbSlugToId.get(item.slug) ?? null;

      console.log(
        `[CHECKOUT] Item: ${item.slug}, colorName: ${item.colorName}, ` +
        `variant: ${selectedVariant?.colorName ?? "none"}, ` +
        `image_url: ${imageUrl}`
      );

      orderItems.push({
        product_id: productId,
        product_slug: item.slug,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: serverPrice,
        total: lineTotal,
        image_url: imageUrl,
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
      console.error("[CHECKOUT] Error creando pedido:", orderError);
      return { success: false, error: "Error al crear el pedido. Inténtalo de nuevo." };
    }

    // 6. Crear las líneas de pedido
    if (orderData?.id && orderItems.length > 0) {
      const itemsWithOrderId = orderItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_slug: item.product_slug || null,
        product_name: item.product_name || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
        image_url: item.image_url || null,
        color_name: item.color_name || null,
        size: item.size || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsWithOrderId);

      if (itemsError) {
        console.error("[CHECKOUT] Error creando líneas de pedido:", itemsError);
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
        console.error("[CHECKOUT] Error en envío de emails de notificación:", err);
      });
    }

    return { success: true, orderId: orderData.id };
  } catch (err) {
    console.error("[CHECKOUT] Error inesperado en createOrder:", err);
    return { success: false, error: "Error interno del servidor." };
  }
}
