/**
 * API Route para actualizar pedidos (admin).
 * PATCH: cambia estado y/o datos de envío.
 * Al cambiar a "shipped", envía email al cliente con tracking info.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, verifyAdmin } from "@/lib/supabase/server";
import { sendEmail, getOrdersEmailTo } from "@/lib/email/resend";

export async function PATCH(request: NextRequest) {
  try {
    // Verificar que el usuario es admin
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, status, shipping_company, tracking_number, tracking_url } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId es requerido" }, { status: 400 });
    }

    const adminClient = await createAdminClient();

    // Construir update payload
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (shipping_company !== undefined) updateData.shipping_company = shipping_company || null;
    if (tracking_number !== undefined) updateData.tracking_number = tracking_number || null;
    if (tracking_url !== undefined) updateData.tracking_url = tracking_url || null;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No hay datos para actualizar" }, { status: 400 });
    }

    // Actualizar pedido
    const { data: updatedOrder, error: updateError } = await adminClient
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select("*, order_items(*)")
      .single();

    if (updateError) {
      console.error("[Admin Orders] Error updating:", updateError);
      return NextResponse.json({ error: "Error al actualizar el pedido" }, { status: 500 });
    }

    // Si se cambió a "shipped" y hay tracking, enviar email al cliente
    if (status === "shipped" && updatedOrder?.customer_email) {
      try {
        const shortId = orderId.substring(0, 8).toUpperCase();
        const trackingHtml = tracking_number
          ? `<p style="margin: 8px 0 0; font-size: 14px; color: #ffffff;">
              Nº de seguimiento: <strong style="font-family: monospace;">${tracking_number}</strong>
              ${tracking_url ? `<br/><a href="${tracking_url}" style="color: #0099FF;">Seguir mi pedido →</a>` : ""}
              ${shipping_company ? `<br/>Transportista: ${shipping_company}` : ""}
            </p>`
          : "";

        await sendMail({
          to: updatedOrder.customer_email,
          subject: `Tu pedido #${shortId} ha sido enviado — Tienda Fitness Pro`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #0099FF; padding: 24px 32px;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 1px;">TIENDA FITNESS PRO</h1>
                <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Tu pedido está en camino</p>
              </div>
              <div style="padding: 32px;">
                <p style="font-size: 16px; color: #ffffff; margin-bottom: 16px;">
                  Hola <strong>${updatedOrder.customer_name || ""}</strong>,
                </p>
                <p style="font-size: 14px; color: rgba(255,255,255,0.7); margin-bottom: 24px;">
                  ¡Buenas noticias! Tu pedido <strong>#${shortId}</strong> ha sido enviado y está en camino.
                </p>
                <div style="background-color: #111111; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <span style="background-color: rgba(0,153,255,0.15); color: #0099FF; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 600;">Enviado</span>
                  ${trackingHtml}
                </div>
                <p style="font-size: 12px; color: rgba(255,255,255,0.3); text-align: center;">Tienda Fitness Pro — Tu Mejor Versión Empieza Aquí</p>
              </div>
            </div>`,
        });
        console.log("[Admin Orders] Shipped email sent to:", updatedOrder.customer_email);
      } catch (emailErr) {
        console.error("[Admin Orders] Error sending shipped email:", emailErr);
        // No bloquear la actualización
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error("[Admin Orders] Error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

/** GET: listar pedidos (opcional, para filtros) */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const adminClient = await createAdminClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = adminClient
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(100);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: orders, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Error al cargar pedidos" }, { status: 500 });
    }

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("[Admin Orders] Error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
