/**
 * Store del carrito con Zustand + persistencia en localStorage.
 * Compatible con IDs numéricos (datos estáticos) y UUID de Supabase.
 * Almacena productos simplificados para reducir el tamaño en localStorage.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/types";

/** Producto simplificado para almacenar en el carrito (reduce tamaño en localStorage) */
export interface CartProduct {
  id: number | string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  sizes?: string[];
  color?: string;
  colorName?: string;
}

/** Elemento del carrito */
export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  /** Añadir un producto al carrito (cantidad por defecto = 1) */
  addItem: (product: Product | CartProduct, quantity?: number) => void;
  /** Eliminar un producto del carrito por su ID */
  removeItem: (productId: number | string) => void;
  /** Actualizar la cantidad de un producto en el carrito */
  updateQuantity: (productId: number | string, quantity: number) => void;
  /** Vaciar el carrito por completo */
  clearCart: () => void;
  /** Número total de unidades en el carrito */
  totalItems: number;
  /** Importe total del carrito */
  total: number;
  /** Comprobar si un producto ya está en el carrito */
  isInCart: (productId: number | string) => boolean;
  /** Alternar producto: lo añade si no está, lo elimina si ya está */
  toggleItem: (product: Product | CartProduct) => void;
}

/** Convierte un Product completo en un CartProduct simplificado */
function toCartProduct(product: Product | CartProduct): CartProduct {
  // Si ya es un CartProduct (no tiene 'description', 'rating', etc.), lo devolvemos tal cual
  if ("description" in product) {
    const { id, name, slug, price, oldPrice, image, category, sizes, color, colorName } = product;
    return { id, name, slug, price, oldPrice, image, category, sizes, color, colorName };
  }
  return product as CartProduct;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const cartProduct = toCartProduct(product);
        set((state) => {
          const existing = state.items.find(
            (i) => String(i.product.id) === String(cartProduct.id)
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                String(i.product.id) === String(cartProduct.id)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product: cartProduct, quantity }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => String(i.product.id) !== String(productId)
          ),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            String(i.product.id) === String(productId)
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: 0,

      total: 0,

      isInCart: (productId) => {
        return get().items.some(
          (i) => String(i.product.id) === String(productId)
        );
      },

      toggleItem: (product) => {
        const cartProduct = toCartProduct(product);
        const inCart = get().isInCart(cartProduct.id);
        if (inCart) {
          get().removeItem(cartProduct.id);
        } else {
          get().addItem(cartProduct);
        }
      },
    }),
    {
      name: "tiendafitnesspro-cart",
      /** Calculamos valores derivados tras la hidratación */
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.totalItems = state.items.reduce(
            (acc, i) => acc + i.quantity,
            0
          );
          state.total = state.items.reduce(
            (acc, i) => acc + i.product.price * i.quantity,
            0
          );
        }
      },
      /** Partialize: solo persistimos los items, no las funciones ni los derivados */
      partialize: (state) => ({ items: state.items }) as CartState,
    }
  )
);

/**
 * Hook auxiliar para obtener totalItems y total reactivos.
 * Zustand persist no actualiza derivados automáticamente,
 * así que los recalculamos leyendo el estado en tiempo real.
 */
export function useCartTotals() {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const total = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  return { totalItems, total };
}
