-- ============================================
-- TIENDA FITNESS PRO — Esquema de Base de Datos
-- ============================================
-- Ejecutar este SQL en el SQL Editor de Supabase.
-- Orden: primero tablas sin dependencias, luego las que referencian.

-- ─── PROFILES ──────────────────────────────────────────────────────────────
-- Perfil de usuario vinculado a auth.users.
-- Se crea automáticamente al registrarse (via trigger o desde la app).

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para buscar por rol (útil para el panel admin)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ─── CATEGORIES ────────────────────────────────────────────────────────────
-- Categorías de productos (Fitness, Pádel, Ropa, etc.)

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice por slug para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(active);

-- ─── PRODUCTS ──────────────────────────────────────────────────────────────
-- Productos del catálogo.

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  old_price NUMERIC(10,2) CHECK (old_price IS NULL OR old_price > price),
  image_url TEXT,
  gallery JSONB, -- Array de URLs de imágenes adicionales
  rating NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER NOT NULL DEFAULT 0 CHECK (reviews_count >= 0),
  badge TEXT CHECK (badge IS NULL OR badge IN ('OFERTA', 'NUEVO', 'MÁS VENDIDO', 'TOP VALORADO')),
  stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_products_badge ON public.products(badge) WHERE badge IS NOT NULL;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ─── ORDERS ────────────────────────────────────────────────────────────────
-- Pedidos de los clientes.

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address JSONB, -- { street, city, province, postal_code, country }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ─── ORDER ITEMS ───────────────────────────────────────────────────────────
-- Líneas de cada pedido.

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  total NUMERIC(10,2) NOT NULL CHECK (total >= 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);

-- ─── CART ITEMS ────────────────────────────────────────────────────────────
-- Carrito persistente para usuarios autenticados (opcional, el carrito
-- local de Zustand es la opción principal para invitados).

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id) -- Un usuario solo tiene una entrada por producto
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user ON public.cart_items(user_id);

-- ─── TRIGGER: Crear perfil automáticamente al registrarse ──────────────────
-- Cuando un usuario se registra en auth.users, se crea su perfil automáticamente.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
