"use server";

import { createAdminClient, verifyAdmin } from "@/lib/supabase/server";
import { sendOrderStatusUpdateEmail, sendOrderConfirmationEmail } from "@/lib/email/send-order-email";

/**
 * Actualiza el estado de un pedido y envía email de notificación al cliente.
 */
export async function updateOrderStatus(orderId: string, newStatus: string) {
  const admin = await verifyAdmin();
  if (!admin) return { success: false, error: "No autorizado" };

  const supabase = await createAdminClient();

  // Get current order for email notification
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };

  // Send status update email (non-blocking)
  if (order) {
    try {
      await sendOrderStatusUpdateEmail({
        customerEmail: order.customer_email || "",
        customerName: order.customer_name || "Cliente",
        orderId: order.order_number || orderId.substring(0, 8),
        newStatus,
        trackingNumber: order.tracking_number || undefined,
        trackingUrl: order.tracking_url || undefined,
        shippingCompany: order.shipping_company || undefined,
      });
    } catch (err) {
      console.error("[PEDIDOS] Error enviando email de actualización de estado:", err);
    }
  }

  return { success: true };
}

/**
 * Actualiza los datos de seguimiento y notas de admin de un pedido.
 */
export async function updateOrderTracking(
  orderId: string,
  data: {
    shipping_company?: string;
    tracking_number?: string;
    tracking_url?: string;
    admin_notes?: string;
  }
) {
  const admin = await verifyAdmin();
  if (!admin) return { success: false, error: "No autorizado" };

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update(data)
    .eq("id", orderId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Reenvía el email de confirmación de pedido al cliente.
 */
export async function resendOrderEmail(orderId: string) {
  const admin = await verifyAdmin();
  if (!admin) return { success: false, error: "No autorizado" };

  const supabase = await createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (!order) return { success: false, error: "Pedido no encontrado" };

  try {
    await sendOrderConfirmationEmail({
      orderId: order.order_number || orderId.substring(0, 8),
      customerName: order.customer_name || "Cliente",
      customerEmail: order.customer_email || "",
      customerPhone: order.customer_phone || "",
      items: (order.order_items || []).map((item: Record<string, unknown>) => ({
        name: (item.product_name as string) || (item.name as string) || "Producto",
        quantity: item.quantity as number,
        unit_price: Number(item.unit_price),
        total: Number(item.total),
        image: (item.image_url as string) || undefined,
      })),
      total: Number(order.total),
      shippingAddress: order.shipping_address as {
        street: string;
        city: string;
        province: string;
        postal_code: string;
        country: string;
      } | undefined,
    });
  } catch (err) {
    console.error("[PEDIDOS] Error reenviando email de confirmación:", err);
    return { success: false, error: "Error al enviar el email" };
  }

  return { success: true };
}
