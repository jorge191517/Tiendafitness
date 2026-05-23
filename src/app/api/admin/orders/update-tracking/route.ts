import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const { orderId, shipping_company, tracking_number, tracking_url, admin_note } = await request.json();
    if (!orderId) return NextResponse.json({ error: "orderId es obligatorio" }, { status: 400 });

    const supabase = await createAdminClient();

    const updateData: Record<string, unknown> = {};
    if (shipping_company !== undefined) updateData.shipping_company = shipping_company || null;
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number || null;
    if (tracking_url !== undefined) updateData.tracking_url = tracking_url || null;
    if (admin_note !== undefined) updateData.admin_note = admin_note || null;

    const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);
    if (error) {
      console.error("[API_UPDATE_TRACKING] Error:", error);
      return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API_UPDATE_TRACKING] Error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
