/**
 * Store del carrito con Zustand + persistencia en localStorage.
 * Compatible con IDs numéricos (datos estáticos) y UUID de Supabase.
 * Almacena productos simplificados para reducir el tamaño en localStorage.
 *
 * Cada item del carrito se identifica por `cartKey`, que combina
 * producto + variante + talla, permitiendo el mismo producto en
 * diferentes colores/tallas como items separados.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/types";

/** Producto simplificado para almacenar en el carrito (reduce tamaño en localStorage) */
export interface CartProduct {
  id: number | string;
  /** Clave única: `${id}-${variantId}-${size}` para diferenciar mismo producto en distinto color/talla */
  cartKey: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  sizes?: string[];
  color?: string;
  colorName?: string;
  /** Talla seleccionada por el usuario */
  selectedSize?: string;
  /** ID de la variante seleccionada */
  variantId?: number;
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
  /** Eliminar un producto del carrito por su cartKey */
  removeItem: (cartKey: string) => void;
  /** Actualizar la cantidad de un producto en el carrito */
  updateQuantity: (cartKey: string, quantity: number) => void;
  /** Vaciar el carrito por completo */
  clearCart: () => void;
  /** Número total de unidades en el carrito */
  totalItems: number;
  /** Importe total del carrito */
  total: number;
  /** Comprobar si un item está en el carrito por su cartKey */
  isInCart: (cartKey: string) => boolean;
  /** Alternar producto: lo añade si no está, lo elimina si ya está */
  toggleItem: (product: Product | CartProduct) => void;
}

/** Convierte un Product completo en un CartProduct simplificado */
function toCartProduct(product: Product | CartProduct): CartProduct {
  // Si ya es un CartProduct (tiene cartKey), lo devolvemos tal cual
  if ("cartKey" in product && product.cartKey) {
    return product as CartProduct;
  }
  // Si es un Product completo, generar cartKey si no tiene
  if ("description" in product) {
    const p = product as Product;
    const variantId = (p as any).variantId ?? 0;
    const selectedSize = (p as any).selectedSize ?? "no-size";
    const cartKey = (p as any).cartKey ?? `${p.id}-${variantId}-${selectedSize}`;
    const { id, name, slug, price, oldPrice, image, category, sizes, color, colorName } = p;
    return {
      id,
      cartKey,
      name,
      slug,
      price,
      oldPrice,
      image,
      category,
      sizes,
      color,
      colorName,
      selectedSize: selectedSize === "no-size" ? undefined : selectedSize,
      variantId: variantId === 0 ? undefined : variantId,
    };
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
            (i) => i.product.cartKey === cartProduct.cartKey
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.cartKey === cartProduct.cartKey
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product: cartProduct, quantity }] };
        });
      },

      removeItem: (cartKey) => {
        set((state) => ({
          items: state.items.filter(
            (i) => i.product.cartKey !== cartKey
          ),
        }));
      },

      updateQuantity: (cartKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartKey);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.cartKey === cartKey
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: 0,

      total: 0,

      isInCart: (cartKey) => {
        return get().items.some(
          (i) => i.product.cartKey === cartKey
        );
      },

      toggleItem: (product) => {
        const cartProduct = toCartProduct(product);
        const inCart = get().isInCart(cartProduct.cartKey);
        if (inCart) {
          get().removeItem(cartProduct.cartKey);
        } else {
          get().addItem(cartProduct);
        }
      },
    }),
    {
      name: "tiendafitnesspro-cart-v2",
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
