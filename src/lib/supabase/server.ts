/**
 * ⛔ WARNING: SERVER-ONLY FILE
 *
 * Este archivo NUNCA debe ser importado desde componentes con "use client".
 * Contiene la SUPABASE_SERVICE_ROLE_KEY que BYPASEA Row Level Security.
 *
 * Reglas de seguridad:
 * - SUPABASE_SERVICE_ROLE_KEY solo se usa en createAdminClient()
 * - createAdminClient() solo debe usarse en:
 *   - Server Actions
 *   - Route Handlers (API routes)
 *   - Scripts de servidor (seed, import)
 * - NUNCA exponer esta key en:
 *   - Componentes React de cliente
 *   - Hooks del navegador
 *   - window / localStorage
 *   - Código que se ejecuta en el browser
 *
 * Si un archivo tiene "use client" y necesita Supabase,
 * debe importar desde @/lib/supabase/client (anon key).
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cliente Supabase para uso en Server Components, Server Actions y Route Handlers.
 * Usa la anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) y respeta RLS.
 * Lee las cookies de la request para mantener la sesión del usuario.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // La cookie solo se puede establecer desde Server Action o Route Handler.
            // Este error es esperado en Server Components que solo leen.
          }
        },
      },
    }
  );
}

/**
 * ⛔ Cliente admin con SERVICE ROLE KEY — BYPASEA RLS.
 *
 * SOLO usar en:
 *   - Server Actions del panel admin
 *   - API Routes del panel admin (/api/admin/*)
 *   - Scripts de servidor (seed, import-products-csv)
 *
 * NUNCA usar en:
 *   - Componentes de cliente ("use client")
 *   - Código ejecutado en el navegador
 *   - Hooks o stores de Zustand
 *
 * Siempre verificar que el usuario sea admin ANTES de usar este cliente.
 */
export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

/**
 * Verifica que el usuario autenticado tenga rol de admin.
 * Usar en API routes y server actions antes de operaciones privilegiadas.
 *
 * @returns El perfil del usuario si es admin, o null si no lo es
 */
export async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') return null;

  return profile;
}
