/**
 * Helper de almacenamiento para Supabase Storage.
 * Usa el admin client (service role) para subir/eliminar imágenes
 * sin depender de políticas RLS del navegador.
 *
 * ⛔ SOLO usar en Server Actions, API Routes o scripts de servidor.
 * NUNCA importar desde componentes "use client".
 */

import { createAdminClient } from "@/lib/supabase/server";

const BUCKET_NAME = "product-images";

/** Sube una imagen al bucket de productos y devuelve la ruta en Storage */
export async function uploadProductImage(
  fileBuffer: ArrayBuffer,
  fileName: string,
  contentType: string
): Promise<{ path: string; publicUrl: string } | null> {
  try {
    const supabase = await createAdminClient();

    // Generar nombre único para evitar colisiones
    const ext = fileName.split(".").pop() || "png";
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filePath = `products/${timestamp}-${randomStr}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("[STORAGE] Error subiendo imagen:", error.message);
      return null;
    }

    // Obtener URL pública
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl: data.publicUrl,
    };
  } catch (err) {
    console.error("[STORAGE] Error inesperado:", err);
    return null;
  }
}

/** Elimina una imagen del bucket por su ruta */
export async function deleteProductImage(path: string): Promise<boolean> {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error("[STORAGE] Error eliminando imagen:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Extrae la ruta Storage desde una URL pública del bucket */
export function extractStoragePath(publicUrl: string): string | null {
  try {
    // URL format: https://{project}.supabase.co/storage/v1/object/public/product-images/{path}
    const url = new URL(publicUrl);
    const parts = url.pathname.split("/");
    const bucketIdx = parts.indexOf(BUCKET_NAME);
    if (bucketIdx === -1 || bucketIdx === parts.length - 1) return null;
    return parts.slice(bucketIdx + 1).join("/");
  } catch {
    return null;
  }
}
