/**
 * Helper de Supabase para el middleware de Next.js.
 * Se encarga de:
 * - Refrescar la sesión del usuario en cada request
 * - Proteger rutas /admin (solo role='admin')
 * - Permitir acceso a /checkout tanto para usuarios autenticados como invitados
 * - Redirigir usuarios autenticados lejos de login/register
 *
 * Usa SOLO la anon key (NEXT_PUBLIC_) — nunca la service role key.
 *
 * ⚠️ La consulta a profiles para verificar admin usa anon key.
 * Si hay recursion en RLS de profiles, esta consulta fallará.
 * Ejecutar fix-rls-recursion.sql en Supabase para resolverlo.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Si Supabase no está configurado, continuar sin sesión
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refrescar la sesión — importante para que no caduque
  const { data: { user } } = await supabase.auth.getUser();

  // ─── Proteger rutas admin ──────────────────────────────────────────────
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Verificar rol de admin en la tabla profiles
    // ⚠️ Si hay infinite recursion (error 42P17), ejecutar fix-rls-recursion.sql
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("[Middleware] Error consultando profile:", profileError.code, profileError.message);
        // Si hay recursion, denegar acceso por seguridad
        return NextResponse.redirect(new URL('/', request.url));
      }

      if (!profile || profile.role !== 'admin') {
        // Usuario autenticado pero no admin — redirigir a home
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (err) {
      console.error("[Middleware] Excepción consultando profile:", err);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // ─── Ruta de checkout: acceso libre para autenticados e invitados ──────
  // Se eliminó la redirección a login para permitir guest checkout.
  // El server action createOrder() usa service role (bypass RLS)
  // y maneja tanto usuarios autenticados como invitados.

  // ─── Redirigir usuarios autenticados lejos de login/register ───────────
  if (user && (
    request.nextUrl.pathname.startsWith('/auth/login') ||
    request.nextUrl.pathname.startsWith('/auth/register')
  )) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}
