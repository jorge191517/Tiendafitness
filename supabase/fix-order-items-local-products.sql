-- ============================================
-- TIENDA FITNESS PRO — FIX ORDER ITEMS
-- ============================================
-- PROBLEMA:
-- Error 22P02: invalid input syntax for type uuid
--
-- CAUSA:
-- La tabla order_items tiene product_id UUID NOT NULL REFERENCES products(id),
-- pero los productos locales usan IDs numéricos (101, 102, 103, 104).
-- Al insertar String(localProduct.id) = "101" en una columna UUID → error 22P02.
--
-- SOLUCIÓN:
-- Rediseñar order_items para trabajar tanto con productos de Supabase (UUID)
-- como con productos locales (slug-based). Usar product_slug como identificador
-- universal y hacer product_id nullable.
--
-- También añadir campos para variant, color, talla e imagen que antes no existían.
--
-- ⚠️ IMPORTANTE: Ejecutar en el SQL Editor de Supabase.
-- Si ya hay datos en order_items, hacer backup antes.
-- ============================================

-- ─── Paso 1: Eliminar tabla order_items existente y recrear ─────────────
-- (Si hay datos que quieres preservar, haz backup primero:
--  CREATE TABLE order_items_backup AS SELECT * FROM order_items;)

DROP TABLE IF EXISTS public.order_items CASCADE;

-- ─── Paso 2: Crear order_items con estructura nueva ─────────────────────

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_slug TEXT NOT NULL,           -- slug del producto (universal: funciona con local y Supabase)
  product_name TEXT NOT NULL,           -- nombre del producto al momento de la compra
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,  -- nullable: solo si existe en Supabase
  variant_id TEXT,                      -- ID de la variante (text, no UUID — los locales son numéricos)
  color_name TEXT,                      -- nombre del color
  size TEXT,                            -- talla seleccionada
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  image TEXT,                           -- URL de la imagen del producto
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Paso 3: Índices ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_slug ON public.order_items(product_slug);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id) WHERE product_id IS NOT NULL;

-- ─── Paso 4: Añadir campos de seguimiento a orders ─────────────────────

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS shipping_company TEXT,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS tracking_url TEXT;

-- ─── Verificación ───────────────────────────────────────────────────────
-- Después de ejecutar, verificar:
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'order_items' ORDER BY ordinal_position;
