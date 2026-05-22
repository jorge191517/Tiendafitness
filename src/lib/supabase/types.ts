/**
 * Tipos generados para la base de datos Supabase.
 * Reflejan las tablas: profiles, categories, products, orders, order_items, cart_items.
 */

export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string; // uuid references auth.users
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: string; // uuid
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
  created_at: string;
}

export type ProductStockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type ProductBadgeType = 'OFERTA' | 'NUEVO' | 'MÁS VENDIDO' | 'TOP VALORADO' | null;

export interface ProductDB {
  id: string; // uuid
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  gallery: string[] | null; // jsonb array of URLs
  rating: number;
  reviews_count: number;
  badge: ProductBadgeType;
  stock_status: ProductStockStatus;
  stock_quantity: number;
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields (optional)
  category?: Category;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string; // uuid
  user_id: string;
  order_number: string | null;
  status: OrderStatus;
  total: number;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: ShippingAddress | null; // jsonb
  shipping_company: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  admin_notes: string | null;
  created_at: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

export interface OrderItem {
  id: string; // uuid
  order_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  variant_id: string;
  color_name: string;
  size: string;
  image_url: string;
  quantity: number;
  unit_price: number;
  total: number;
  // Joined
  product?: ProductDB;
}

export interface CartItemDB {
  id: string; // uuid
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  // Joined
  product?: ProductDB;
}

/** Tipo para la respuesta del cliente Supabase */
export interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
  } | null;
}
