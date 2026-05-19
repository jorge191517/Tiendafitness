import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, verifyAdmin } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ⛔ Verificar que el usuario es admin
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Acceso denegado. Se requiere rol de administrador." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(id, name, slug)")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ⛔ Verificar que el usuario es admin
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Acceso denegado. Se requiere rol de administrador." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = await createAdminClient();
    const body = await request.json();

    const allowedFields = [
      "name", "slug", "category_id", "description", "price", "old_price",
      "image_url", "badge", "stock_quantity", "stock_status", "featured", "active",
    ];

    const updates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) {
        if (key === "price" || key === "old_price" || key === "stock_quantity") {
          updates[key] = body[key] !== null && body[key] !== "" ? Number(body[key]) : null;
        } else {
          updates[key] = body[key];
        }
      }
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ⛔ Verificar que el usuario es admin
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Acceso denegado. Se requiere rol de administrador." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const supabase = await createAdminClient();

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
