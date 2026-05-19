import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, verifyAdmin } from "@/lib/supabase/server";

export async function GET() {
  try {
    // ⛔ Verificar que el usuario es admin
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Acceso denegado. Se requiere rol de administrador." },
        { status: 403 }
      );
    }

    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

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

export async function POST(request: NextRequest) {
  try {
    // ⛔ Verificar que el usuario es admin
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Acceso denegado. Se requiere rol de administrador." },
        { status: 403 }
      );
    }

    const supabase = await createAdminClient();
    const body = await request.json();

    const { name, slug, description, image_url, active } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Nombre y slug son obligatorios" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name,
        slug,
        description: description || null,
        image_url: image_url || null,
        active: active ?? true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
