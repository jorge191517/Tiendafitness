-- ============================================
-- TIENDA FITNESS PRO — Row Level Security (RLS)
-- ============================================
-- Ejecutar DESPUÉS de schema.sql en el SQL Editor de Supabase.

-- ─── Habilitar RLS en todas las tablas ──────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════════════════════════════════════════

-- Cualquier usuario puede ver su propio perfil
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil (excepto el rol)
CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Solo admin puede ver todos los perfiles
CREATE POLICY "Los admins pueden ver todos los perfiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admin puede cambiar roles
CREATE POLICY "Los admins pueden cambiar roles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- CATEGORIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Cualquier usuario (incluidos invitados) puede leer categorías activas
CREATE POLICY "Cualquier usuario puede leer categorías activas"
  ON public.categories FOR SELECT
  USING (active = true);

-- Solo admin puede crear categorías
CREATE POLICY "Solo admin puede crear categorías"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admin puede actualizar categorías
CREATE POLICY "Solo admin puede actualizar categorías"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admin puede eliminar categorías
CREATE POLICY "Solo admin puede eliminar categorías"
  ON public.categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- PRODUCTS
-- ═══════════════════════════════════════════════════════════════════════════

-- Cualquier usuario puede leer productos activos
CREATE POLICY "Cualquier usuario puede leer productos activos"
  ON public.products FOR SELECT
  USING (active = true);

-- Solo admin puede crear productos
CREATE POLICY "Solo admin puede crear productos"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admin puede actualizar productos
CREATE POLICY "Solo admin puede actualizar productos"
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admin puede eliminar productos
CREATE POLICY "Solo admin puede eliminar productos"
  ON public.products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- ORDERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Un usuario autenticado puede ver sus propios pedidos
CREATE POLICY "Los usuarios pueden ver sus propios pedidos"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Solo admin puede ver todos los pedidos
CREATE POLICY "Los admins pueden ver todos los pedidos"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Un usuario autenticado puede crear pedidos
CREATE POLICY "Los usuarios autenticados pueden crear pedidos"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Solo admin puede actualizar pedidos (cambiar estado)
CREATE POLICY "Solo admin puede actualizar pedidos"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- ORDER ITEMS
-- ═══════════════════════════════════════════════════════════════════════════

-- Un usuario puede ver los items de sus propios pedidos
CREATE POLICY "Los usuarios pueden ver items de sus pedidos"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

-- Solo admin puede ver todos los items
CREATE POLICY "Los admins pueden ver todos los items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Un usuario autenticado puede crear items en sus propios pedidos
CREATE POLICY "Los usuarios pueden crear items en sus pedidos"
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════
-- CART ITEMS
-- ═══════════════════════════════════════════════════════════════════════════

-- Un usuario puede ver su propio carrito
CREATE POLICY "Los usuarios pueden ver su carrito"
  ON public.cart_items FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Un usuario puede agregar items a su carrito
CREATE POLICY "Los usuarios pueden agregar items a su carrito"
  ON public.cart_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Un usuario puede actualizar items de su carrito
CREATE POLICY "Los usuarios pueden actualizar items de su carrito"
  ON public.cart_items FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Un usuario puede eliminar items de su carrito
CREATE POLICY "Los usuarios pueden eliminar items de su carrito"
  ON public.cart_items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
