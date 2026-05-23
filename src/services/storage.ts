/**
 * Servicio de almacenamiento de imágenes con Supabase Storage.
 *
 * ⚠️ DEPRECADO: Este archivo usa el cliente del navegador (anon key).
 * Para uploads seguros desde el servidor, usar:
 *   import { uploadProductImage } from "@/lib/supabase/storage"
 *
 * Este archivo se mantiene por compatibilidad con componentes
 * que puedan necesitar obtener URL públicas desde el cliente.
 */

import { createClient } from '@/lib/supabase/client';

const BUCKET_NAME = 'product-images';

/** Obtiene la URL pública de una imagen */
export function getPublicImageUrl(path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
}
