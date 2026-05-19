/**
 * Servicio de almacenamiento de imágenes con Supabase Storage.
 * Bucket recomendado: "product-images"
 */

import { createClient } from '@/lib/supabase/client';

const BUCKET_NAME = 'product-images';

/** Sube una imagen al bucket de productos y devuelve la ruta */
export async function uploadProductImage(file: File, folder?: string): Promise<string | null> {
  try {
    const supabase = createClient();
    
    // Generar nombre único
    const ext = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filePath = folder 
      ? `${folder}/${timestamp}-${randomStr}.${ext}`
      : `${timestamp}-${randomStr}.${ext}`;
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) {
      console.error('Error subiendo imagen:', error.message);
      return null;
    }
    
    return filePath;
  } catch (err) {
    console.error('Error inesperado subiendo imagen:', err);
    return null;
  }
}

/** Obtiene la URL pública de una imagen */
export function getPublicImageUrl(path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/** Elimina una imagen del bucket */
export async function deleteProductImage(path: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);
    
    if (error) {
      console.error('Error eliminando imagen:', error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
