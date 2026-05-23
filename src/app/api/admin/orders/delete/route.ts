import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, createAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/admin/orders/delete
 * Elimina un pedido y sus order_items (cascade).
 * Solo admin.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const { orderId } = await request.json();
    if (!orderId) return NextResponse.json({ error: "orderId es obligatorio" }, { status: 400 });

    const supabase = await createAdminClient();

    console.log("[ADMIN_DELETE_ORDER] Eliminando pedido:", orderId);

    // Delete order_items first (in case cascade is not set)
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("[ADMIN_DELETE_ORDER] Error eliminando items:", itemsError);
      // Continue anyway — the order might not have items
    }

    // Delete the order
    const { error: orderError } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (orderError) {
      console.error("[ADMIN_DELETE_ORDER] Error:", orderError);
      return NextResponse.json({ error: "Error al eliminar el pedido" }, { status: 500 });
    }

    console.log("[ADMIN_DELETE_ORDER] Eliminado:", orderId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[ADMIN_DELETE_ORDER] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
