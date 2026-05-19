/**
 * Cliente Supabase para uso en el navegador (client components).
 * Usa las variables NEXT_PUBLIC_ que son seguras para exponer en cliente.
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
