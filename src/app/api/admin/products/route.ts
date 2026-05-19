import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, verifyAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // ⛔ Verificar que el usuario es admin antes de crear productos
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "Acceso denegado. Se requiere rol de administrador." },
        { status: 403 }
      );
    }

    const supabase = await createAdminClient();
    const body = await request.json();

    const { name, slug, category_id, description, price, old_price, image_url, badge, stock_quantity, stock_status, featured, active } = body;

    if (!name || !slug || price === undefined) {
      return NextResponse.json(
        { error: "Nombre, slug y precio son obligatorios" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        category_id: category_id || null,
        description: description || null,
        price: Number(price),
        old_price: old_price ? Number(old_price) : null,
        image_url: image_url || null,
        badge: badge || null,
        stock_quantity: stock_quantity ? Number(stock_quantity) : 0,
        stock_status: stock_status || "in_stock",
        featured: featured ?? false,
        active: active ?? true,
        rating: 0,
        reviews_count: 0,
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
