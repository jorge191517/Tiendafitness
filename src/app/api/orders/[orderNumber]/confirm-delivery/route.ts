import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/orders/[orderNumber]/confirm-delivery
 * Permite al cliente confirmar que ha recibido su pedido.
 * Cambia status a "delivered" y envía email al admin.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    // Find the order
    const { data: order } = await supabase
      .from("orders")
      .select("id, order_number, status, user_id, customer_name, customer_email, customer_phone, total, shipping_address")
      .or(`order_number.eq.${orderNumber},id.eq.${orderNumber}`)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // Verify ownership
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Only allow confirmation if status is "shipped"
    if (order.status !== "shipped") {
      return NextResponse.json({ error: "El pedido debe estar en estado 'enviado' para confirmar la recepción" }, { status: 400 });
    }

    // Update status to delivered using admin client (bypasses RLS for update)
    const adminSupabase = await createAdminClient();
    const { error } = await adminSupabase
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", order.id);

    if (error) {
      console.error("[CONFIRM_DELIVERY] Error:", error);
      return NextResponse.json({ error: "Error al confirmar entrega" }, { status: 500 });
    }

    console.log("[CONFIRM_DELIVERY] Pedido", order.order_number ?? order.id, "confirmado como entregado por el cliente");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CONFIRM_DELIVERY] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
