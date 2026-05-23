import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, verifyAdmin } from "@/lib/supabase/server";

/**
 * GET /api/admin/orders
 * Lista todos los pedidos con sus items para el panel admin.
 */
export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const supabase = await createAdminClient();

    // Obtener pedidos ordenados por fecha descendente
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (ordersError) {
      console.error("[API_ADMIN_ORDERS] Error:", ordersError);
      return NextResponse.json({ error: "Error al cargar pedidos" }, { status: 500 });
    }

    // Obtener todos los order_items
    const orderIds = (orders ?? []).map((o: { id: string }) => o.id);
    let items: unknown[] = [];
    if (orderIds.length > 0) {
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);
      items = orderItems ?? [];
    }

    // Agrupar items por order_id
    const itemsByOrderId = new Map<string, unknown[]>();
    for (const item of items) {
      const oid = (item as { order_id: string }).order_id;
      if (!itemsByOrderId.has(oid)) itemsByOrderId.set(oid, []);
      itemsByOrderId.get(oid)!.push(item);
    }

    // Combinar
    const result = (orders ?? []).map((order: Record<string, unknown>) => ({
      ...order,
      order_items: itemsByOrderId.get(order.id as string) ?? [],
    }));

    return NextResponse.json({ orders: result });
  } catch (err) {
    console.error("[API_ADMIN_ORDERS] Error inesperado:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
