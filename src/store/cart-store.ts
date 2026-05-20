/**
 * Store del carrito con Zustand + persistencia en localStorage.
 * Compatible con modelo base+variantes.
 * Key compuesta: productId-variantId-size para unicidad.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/types";

/** Elemento del carrito con datos de variante */
export interface CartItem {
  /** Key única compuesta: productId-variantId-size */
  cartKey: string;
  /** ID del producto base */
  productId: number | string;
  /** Nombre del producto */
  name: string;
  /** Slug del producto */
  slug: string;
  /** Precio unitario */
  price: number;
  /** Precio anterior (tachado) */
  oldPrice?: number;
  /** Imagen de la variante seleccionada */
  image: string;
  /** Categoría */
  category: string;
  /** ID de la variante seleccionada */
  variantId: number;
  /** Nombre del color seleccionado */
  colorName: string;
  /** Valor CSS del color seleccionado */
  color: string;
  /** Talla seleccionada (vacío si no aplica) */
  selectedSize: string;
  /** Cantidad */
  quantity: number;
}

interface CartState {
  items: CartItem[];
  /** Añadir un item al carrito */
  addItem: (item: CartItem) => void;
  /** Eliminar un item del carrito por su cartKey */
  removeItem: (cartKey: string) => void;
  /** Actualizar la cantidad de un item */
  updateQuantity: (cartKey: string, quantity: number) => void;
  /** Vaciar el carrito por completo */
  clearCart: () => void;
  /** Número total de unidades en el carrito */
  totalItems: number;
  /** Importe total del carrito */
  total: number;
}

/** Genera la clave única del carrito */
export function buildCartKey(
  productId: number | string,
  variantId: number,
  selectedSize: string
): string {
  return `${productId}-${variantId}-${selectedSize || "nosize"}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.cartKey === item.cartKey
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.cartKey === item.cartKey
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (cartKey) => {
        set((state) => ({
          items: state.items.filter((i) => i.cartKey !== cartKey),
        }));
      },

      updateQuantity: (cartKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartKey);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.cartKey === cartKey ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: 0,

      total: 0,
    }),
    {
      name: "tiendafitnesspro-cart",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.totalItems = state.items.reduce(
            (acc, i) => acc + i.quantity,
            0
          );
          state.total = state.items.reduce(
            (acc, i) => acc + i.price * i.quantity,
            0
          );
        }
      },
      partialize: (state) => ({ items: state.items }) as CartState,
    }
  )
);

/**
 * Hook auxiliar para obtener totalItems y total reactivos.
 */
export function useCartTotals() {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  return { totalItems, total };
}
