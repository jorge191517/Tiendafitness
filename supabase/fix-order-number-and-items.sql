-- ============================================================
-- MIGRACIÓN: Añadir order_number a orders + ajustar order_items
-- ============================================================
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Añadir columna order_number a la tabla orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- 2. Crear índice para búsquedas rápidas por order_number
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- 3. Generar order_number para pedidos existentes que no tengan uno
-- Formato: TFP-YYYYMMDD-XXXXX
UPDATE orders
SET order_number = 'TFP-' || to_char(created_at, 'YYYYMMDD') || '-' || LPAD(id::text, 5, '0')
WHERE order_number IS NULL;

-- 4. Hacer order_number NOT NULL después de rellenar existentes
ALTER TABLE orders
ALTER COLUMN order_number SET NOT NULL;

-- 5. Añadir columnas faltantes a order_items para productos locales
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_slug TEXT;

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_name TEXT;

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS variant_id TEXT;

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS color_name TEXT;

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS size TEXT;

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 6. Hacer product_id nullable (para productos locales sin UUID)
ALTER TABLE order_items
ALTER COLUMN product_id DROP NOT NULL;

-- 7. Añadir campos de envío a orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_company TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_url TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 8. Función para generar order_number automáticamente al insertar
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'TFP-' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(
      (NEXTVAL('order_number_seq')::text), 5, '0'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Crear secuencia para order_number
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- 10. Crear trigger
DROP TRIGGER IF EXISTS trg_generate_order_number ON orders;
CREATE TRIGGER trg_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();
