-- ============================================
-- FASE 2 — Migración: order_number, tracking fields, order_items extra
-- ============================================
-- Ejecutar en el SQL Editor de Supabase.
-- Es seguro ejecutarlo múltiples veces (IF NOT EXISTS / IF NOT).

-- ─── Añadir order_number a orders ──────────────────────────────────────────
-- Formato: TFP-YYYYMMDD-XXXXX (único, legible para el cliente)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN order_number TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
  END IF;
END $$;

-- ─── Añadir campos de seguimiento a orders ─────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'shipping_company'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN shipping_company TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'tracking_number'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'tracking_url'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN tracking_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'admin_note'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN admin_note TEXT;
  END IF;
END $$;

-- ─── Añadir campos extra a order_items ─────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'product_slug'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN product_slug TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'product_name'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN product_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN image_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'color_name'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN color_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'size'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN size TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'variant_id'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN variant_id UUID;
  END IF;
END $$;

-- ─── Generar order_number para pedidos existentes ──────────────────────────
-- Solo actualiza los que aún no tienen order_number

UPDATE public.orders
SET order_number = 'TFP-' || to_char(created_at, 'YYYYMMDD') || '-' || lpad(floor(random() * 100000)::text, 5, '0')
WHERE order_number IS NULL;

-- ─── Permitir status 'preparing' ──────────────────────────────────────────
-- El CHECK original usa 'processing'. Añadimos 'preparing' como valor válido.

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pending', 'confirmed', 'preparing', 'processing', 'shipped', 'delivered', 'cancelled'));

-- ─── RLS: Clientes pueden confirmar entrega de sus pedidos ─────────────────
-- Permite que un usuario cambie status a 'delivered' si:
-- - Es el dueño del pedido
-- - El pedido está en estado 'shipped'

CREATE POLICY "Los clientes pueden confirmar entrega de sus pedidos"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND status = 'shipped'
  )
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'delivered'
  );

-- ─── RLS: Admin puede eliminar pedidos ─────────────────────────────────────

CREATE POLICY "Los admins pueden eliminar pedidos"
  ON public.orders FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Los admins pueden eliminar items de cualquier pedido"
  ON public.order_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── Backfill: Actualizar order_items existentes con datos de products ──────
-- Para pedidos creados antes de la Fase 2 (sin product_name, image_url, etc.)

UPDATE public.order_items oi
SET
  product_name = COALESCE(oi.product_name, p.name),
  product_slug = COALESCE(oi.product_slug, p.slug),
  image_url = COALESCE(oi.image_url, p.image_url)
FROM public.products p
WHERE oi.product_id = p.id
  AND (oi.product_name IS NULL OR oi.image_url IS NULL);
