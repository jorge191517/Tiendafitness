import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/supabase/server";
import { uploadProductImage } from "@/lib/supabase/storage";

/**
 * POST /api/admin/upload-image
 * Sube una imagen de producto a Supabase Storage.
 * Solo admin. Recibe FormData con campo "file".
 *
 * Respuesta: { success: true, url: string, path: string } | { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario sea admin
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    // Obtener el archivo del FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se ha proporcionado ningún archivo" }, { status: 400 });
    }

    // Validar tipo MIME
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Solo PNG, JPEG y WebP." },
        { status: 400 }
      );
    }

    // Validar tamaño (2 MB máximo)
    const maxSize = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo supera el límite de 2 MB." },
        { status: 400 }
      );
    }

    // Subir a Supabase Storage
    const buffer = await file.arrayBuffer();
    const result = await uploadProductImage(buffer, file.name, file.type);

    if (!result) {
      return NextResponse.json(
        { error: "Error al subir la imagen al almacenamiento." },
        { status: 500 }
      );
    }

    console.log("[UPLOAD_IMAGE] Imagen subida:", result.publicUrl);

    return NextResponse.json({
      success: true,
      url: result.publicUrl,
      path: result.path,
    });
  } catch (err) {
    console.error("[UPLOAD_IMAGE] Error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
