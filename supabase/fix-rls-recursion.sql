-- ============================================
-- TIENDA FITNESS PRO — FIX RLS INFINITE RECURSION
-- ============================================
--
-- PROBLEMA:
-- Error 42P17: infinite recursion detected in policy for relation "profiles"
--
-- CAUSA:
-- Las policies RLS de profiles se autoreferencian:
--   "Los admins pueden ver todos los perfiles" →
--     EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
--   Al consultar profiles, esta policy se evalúa, lo que requiere
--   consultar profiles de nuevo → loop infinito.
--
-- Lo mismo ocurre en las policies de categories, products, orders, order_items
-- que usan EXISTS (SELECT 1 FROM profiles ...) para verificar admin.
--
-- SOLUCIÓN:
-- 1. Crear función is_admin() con SECURITY DEFINER (bypass RLS)
-- 2. Reemplazar todos los EXISTS (SELECT 1 FROM profiles ...) por is_admin()
-- 3. Eliminar policies de profiles que causan autoreferencia
--
-- EJECUTAR en el SQL Editor de Supabase DESPUÉS de rls.sql
-- (o reemplazar las policies existentes)
--
-- ⚠️ IMPORTANTE: Ejecutar TODO este script de una vez.
-- Si falla alguna sentencia, las policies anteriores ya fueron eliminadas.
-- Asegurarse de que el entorno tenga acceso para ejecutar DDL.
-- ============================================

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 1: Crear función helper is_admin() — SECURITY DEFINER (bypass RLS)
-- ═══════════════════════════════════════════════════════════════════════════
-- Esta función consulta profiles SIN pasar por RLS (porque es SECURITY DEFINER),
-- eliminando la recursión infinita.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Otorgar permisos de ejecución a roles necesarios
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 2: Corregir policies de PROFILES (eliminando autoreferencia)
-- ═══════════════════════════════════════════════════════════════════════════

-- Eliminar policies anteriores (pueden tener nombres en español)
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Los admins pueden ver todos los perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Los admins pueden cambiar roles" ON public.profiles;

-- SELECT: usuarios ven su propio perfil + admins ven todos
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- UPDATE: usuarios actualizan su propio perfil + admins actualizan cualquiera
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 3: Corregir policies de CATEGORIES (usar is_admin en vez de EXISTS)
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Cualquier usuario puede leer categorías activas" ON public.categories;
DROP POLICY IF EXISTS "Solo admin puede crear categorías" ON public.categories;
DROP POLICY IF EXISTS "Solo admin puede actualizar categorías" ON public.categories;
DROP POLICY IF EXISTS "Solo admin puede eliminar categorías" ON public.categories;

-- SELECT: cualquiera puede leer categorías activas
CREATE POLICY "categories_select_active"
  ON public.categories FOR SELECT
  USING (active = true);

-- INSERT/UPDATE/DELETE: solo admin
CREATE POLICY "categories_insert_admin"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "categories_update_admin"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "categories_delete_admin"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 4: Corregir policies de PRODUCTS (usar is_admin en vez de EXISTS)
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Cualquier usuario puede leer productos activos" ON public.products;
DROP POLICY IF EXISTS "Solo admin puede crear productos" ON public.products;
DROP POLICY IF EXISTS "Solo admin puede actualizar productos" ON public.products;
DROP POLICY IF EXISTS "Solo admin puede eliminar productos" ON public.products;

-- SELECT: cualquiera puede leer productos activos
CREATE POLICY "products_select_active"
  ON public.products FOR SELECT
  USING (active = true);

-- INSERT/UPDATE/DELETE: solo admin
CREATE POLICY "products_insert_admin"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "products_update_admin"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "products_delete_admin"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 5: Corregir policies de ORDERS (usar is_admin + permitir guest INSERT)
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios pedidos" ON public.orders;
DROP POLICY IF EXISTS "Los admins pueden ver todos los pedidos" ON public.orders;
DROP POLICY IF EXISTS "Los usuarios autenticados pueden crear pedidos" ON public.orders;
DROP POLICY IF EXISTS "Solo admin puede actualizar pedidos" ON public.orders;

-- SELECT: usuarios ven sus propios pedidos + admins ven todos
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "orders_select_admin"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- INSERT: usuarios autenticados pueden crear sus pedidos
CREATE POLICY "orders_insert_authenticated"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- INSERT: invitados (anon) pueden crear pedidos (user_id = null)
CREATE POLICY "orders_insert_guest"
  ON public.orders FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- UPDATE: solo admin puede cambiar estado de pedidos
CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════════════
-- PASO 6: Corregir policies de ORDER_ITEMS (usar is_admin + permitir guest INSERT)
-- ═══════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Los usuarios pueden ver items de sus pedidos" ON public.order_items;
DROP POLICY IF EXISTS "Los admins pueden ver todos los items" ON public.order_items;
DROP POLICY IF EXISTS "Los usuarios pueden crear items en sus pedidos" ON public.order_items;

-- SELECT: usuarios ven items de sus pedidos + admins ven todos
CREATE POLICY "order_items_select_own"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "order_items_select_admin"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- INSERT: usuarios autenticados pueden crear items en sus pedidos
CREATE POLICY "order_items_insert_authenticated"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

-- INSERT: invitados (anon) pueden crear items en pedidos guest
CREATE POLICY "order_items_insert_guest"
  ON public.order_items FOR INSERT
  TO anon
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id IS NULL
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
-- ═══════════════════════════════════════════════════════════════════════════
-- Ejecutar después de aplicar para verificar que no hay recursion:
--
-- SELECT * FROM public.profiles WHERE id = auth.uid();
-- (como usuario autenticado — no debe dar error 42P17)
--
-- SELECT public.is_admin();
-- (debe devolver true si el usuario es admin, false si no)
