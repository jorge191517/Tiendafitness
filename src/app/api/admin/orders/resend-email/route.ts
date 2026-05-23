import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, createAdminClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email/send-order-email";

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const { orderId } = await request.json();
    if (!orderId) return NextResponse.json({ error: "orderId es obligatorio" }, { status: 400 });

    const supabase = await createAdminClient();

    const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

    const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    const addr = order.shipping_address as Record<string, string> | null;

    const emailPayload = {
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
      shippingAddress: addr ? { street: addr.street ?? "", city: addr.city ?? "", province: addr.province ?? "", postal_code: addr.postal_code ?? "", country: addr.country ?? "" } : undefined,
    };

    await Promise.allSettled([
      sendOrderConfirmationEmail(emailPayload),
      sendNewOrderAdminEmail(emailPayload),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API_RESEND_EMAIL] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
