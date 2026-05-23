import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, createAdminClient } from "@/lib/supabase/server";
import { sendOrderStatusEmail } from "@/lib/email/send-order-email";

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const { orderId, status } = await request.json();
    if (!orderId || !status) return NextResponse.json({ error: "orderId y status son obligatorios" }, { status: 400 });

    const validStatuses = ["pending", "confirmed", "preparing", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) return NextResponse.json({ error: "Estado no válido" }, { status: 400 });

    const supabase = await createAdminClient();

    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      console.error("[API_UPDATE_STATUS] Error:", error);
      return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
    }

    // Fetch order + items for email
    const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (order && status !== "pending") {
      const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);
      const addr = order.shipping_address as Record<string, string> | null;

      sendOrderStatusEmail({
        orderId: order.order_number ?? order.id.substring(0, 8).toUpperCase(),
        customerName: order.customer_name ?? "",
        customerEmail: order.customer_email ?? "",
        customerPhone: order.customer_phone ?? "",
        items: (items ?? []).map((i: Record<string, unknown>) => ({
          name: (i.product_name as string) ?? "Producto",
          quantity: i.quantity as number,
          unit_price: Number(i.unit_price),
          total: Number(i.total ?? Number(i.unit_price) * (i.quantity as number)),
        })),
        total: Number(order.total),
        status,
        shippingCompany: order.shipping_company as string | undefined,
        trackingNumber: order.tracking_number as string | undefined,
        trackingUrl: order.tracking_url as string | undefined,
        shippingAddress: addr ? { street: addr.street ?? "", city: addr.city ?? "", province: addr.province ?? "", postal_code: addr.postal_code ?? "", country: addr.country ?? "" } : undefined,
      }).catch((err) => console.error("[API_UPDATE_STATUS] Error email:", err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API_UPDATE_STATUS] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
