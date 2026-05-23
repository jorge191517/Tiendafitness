/**
 * Server Actions para la gestión de pedidos en el panel admin.
 *
 * ⛔ Solo usar desde el panel de administración.
 * Verifica siempre que el usuario sea admin antes de ejecutar.
 */

"use server";

import { createAdminClient, verifyAdmin } from "@/lib/supabase/server";
import { sendOrderStatusEmail, sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email/send-order-email";

// ─── Types ──────────────────────────────────────────────────────────────────

interface TrackingData {
  shipping_company?: string;
  tracking_number?: string;
  tracking_url?: string;
  admin_note?: string;
}

// ─── Helper: generate order_number ──────────────────────────────────────────

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
  return `TFP-${y}${m}${d}-${rand}`;
}

// ─── Helper: get order with items ───────────────────────────────────────────

async function getOrderWithItems(orderId: string) {
  const supabase = await createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  return { order, items: items ?? [] };
}

// ─── Helper: build email payload ────────────────────────────────────────────

function buildEmailPayload(order: Record<string, unknown>, items: Record<string, unknown>[]) {
  const address = order.shipping_address as Record<string, string> | null;
  return {
    orderId: (order.order_number as string) ?? (order.id as string).substring(0, 8).toUpperCase(),
    customerName: (order.customer_name as string) ?? "",
    customerEmail: (order.customer_email as string) ?? "",
    customerPhone: (order.customer_phone as string) ?? "",
    items: items.map((item) => ({
      name: (item.product_name as string) ?? "Producto",
      quantity: item.quantity as number,
      unit_price: Number(item.unit_price),
      subtotal: Number(item.subtotal ?? Number(item.unit_price) * (item.quantity as number)),
      image_url: ((item.image_url as string) || (item.image as string)) ?? null,
    })),
    total: Number(order.total),
    shippingAddress: address
      ? {
          street: address.street ?? "",
          city: address.city ?? "",
          province: address.province ?? "",
          postal_code: address.postal_code ?? "",
          country: address.country ?? "",
        }
      : undefined,
  };
}

// ─── updateOrderStatus ──────────────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, status: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await verifyAdmin();
    if (!admin) return { success: false, error: "No autorizado." };

    const validStatuses = ["pending", "confirmed", "preparing", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Estado no válido." };
    }

    const supabase = await createAdminClient();

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      console.error("[ADMIN_PEDIDOS] Error actualizando estado:", error);
      return { success: false, error: "Error al actualizar el estado." };
    }

    // Enviar email de cambio de estado al cliente (no bloqueante)
    const result = await getOrderWithItems(orderId);
    if (result) {
      const emailPayload = buildEmailPayload(result.order, result.items);
      sendOrderStatusEmail({
        ...emailPayload,
        status,
        shippingCompany: result.order.shipping_company as string | undefined,
        trackingNumber: result.order.tracking_number as string | undefined,
        trackingUrl: result.order.tracking_url as string | undefined,
      }).catch((err) => {
        console.error("[ADMIN_PEDIDOS] Error enviando email de estado:", err);
      });
    }

    return { success: true };
  } catch (err) {
    console.error("[ADMIN_PEDIDOS] Error inesperado:", err);
    return { success: false, error: "Error interno." };
  }
}

// ─── updateOrderTracking ────────────────────────────────────────────────────

export async function updateOrderTracking(orderId: string, tracking: TrackingData): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await verifyAdmin();
    if (!admin) return { success: false, error: "No autorizado." };

    const supabase = await createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (tracking.shipping_company !== undefined) updateData.shipping_company = tracking.shipping_company;
    if (tracking.tracking_number !== undefined) updateData.tracking_number = tracking.tracking_number;
    if (tracking.tracking_url !== undefined) updateData.tracking_url = tracking.tracking_url;
    if (tracking.admin_note !== undefined) updateData.admin_note = tracking.admin_note;

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) {
      console.error("[ADMIN_PEDIDOS] Error actualizando tracking:", error);
      return { success: false, error: "Error al actualizar el seguimiento." };
    }

    return { success: true };
  } catch (err) {
    console.error("[ADMIN_PEDIDOS] Error inesperado:", err);
    return { success: false, error: "Error interno." };
  }
}

// ─── resendOrderEmail ───────────────────────────────────────────────────────

export async function resendOrderEmail(orderId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await verifyAdmin();
    if (!admin) return { success: false, error: "No autorizado." };

    const result = await getOrderWithItems(orderId);
    if (!result) return { success: false, error: "Pedido no encontrado." };

    const emailPayload = buildEmailPayload(result.order, result.items);

    const [,] = await Promise.allSettled([
      sendOrderConfirmationEmail(emailPayload),
      sendNewOrderAdminEmail(emailPayload),
    ]);

    return { success: true };
  } catch (err) {
    console.error("[ADMIN_PEDIDOS] Error reenviando email:", err);
    return { success: false, error: "Error interno." };
  }
}

// ─── assignOrderNumber ──────────────────────────────────────────────────────
/** Asigna un order_number a pedidos que aún no tengan uno. */

export async function assignOrderNumber(orderId: string): Promise<{ success: boolean; orderNumber?: string; error?: string }> {
  try {
    const admin = await verifyAdmin();
    if (!admin) return { success: false, error: "No autorizado." };

    const supabase = await createAdminClient();

    // Verificar si ya tiene order_number
    const { data: order } = await supabase
      .from("orders")
      .select("id, order_number")
      .eq("id", orderId)
      .single();

    if (!order) return { success: false, error: "Pedido no encontrado." };
    if (order.order_number) return { success: true, orderNumber: order.order_number };

    // Generar order_number único
    let orderNumber = generateOrderNumber();
    let attempts = 0;
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", orderNumber)
        .maybeSingle();

      if (!existing) break;
      orderNumber = generateOrderNumber();
      attempts++;
    }

    const { error } = await supabase
      .from("orders")
      .update({ order_number: orderNumber })
      .eq("id", orderId);

    if (error) {
      console.error("[ADMIN_PEDIDOS] Error asignando order_number:", error);
      return { success: false, error: "Error al asignar número de pedido." };
    }

    return { success: true, orderNumber };
  } catch (err) {
    console.error("[ADMIN_PEDIDOS] Error inesperado:", err);
    return { success: false, error: "Error interno." };
  }
}
