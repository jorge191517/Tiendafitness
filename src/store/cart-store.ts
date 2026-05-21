/**
 * Store del carrito con Zustand + persistencia en sessionStorage.
 * Compatible con modelo base+variantes.
 * Key compuesta: productId-variantId-size para unicidad.
 *
 * Se usa sessionStorage (no localStorage) para que:
 * - Al cerrar el navegador se borre automáticamente
 * - Al cerrar sesión se pueda limpiar fácilmente
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProductBySlug } from "@/data/products";

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

/** Storage key para sessionStorage */
const CART_STORAGE_KEY = "tiendafitnesspro-cart";

/**
 * Limpia el almacenamiento del carrito en sessionStorage y localStorage.
 * Útil al cerrar sesión o al cambiar de usuario.
 */
export function clearCartStorage(): void {
  try {
    sessionStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // sessionStorage puede no estar disponible en SSR
  }
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch {
    // localStorage puede no estar disponible en SSR
  }
}

/**
 * Valida y limpia items inválidos del carrito.
 * Un item es inválido si:
 * - No tiene slug o productId
 * - No tiene variantId válido
 * - Su slug no corresponde a ningún producto del catálogo
 * - Tiene precio <= 0
 * - No tiene nombre
 *
 * Retorna el número de items eliminados.
 */
export function sanitizeCart(): number {
  const state = useCartStore.getState();
  const invalidKeys: string[] = [];

  for (const item of state.items) {
    const hasSlug = !!item.slug && item.slug.trim() !== "";
    const hasProductId = item.productId !== undefined && item.productId !== null && item.productId !== "";
    const hasVariantId = item.variantId !== undefined && item.variantId !== null && item.variantId > 0;
    const hasName = !!item.name && item.name.trim() !== "";
    const hasPrice = typeof item.price === "number" && item.price > 0;

    // Verificar que el producto existe en el catálogo
    const productExists = hasSlug ? !!getProductBySlug(item.slug) : false;

    if (!hasSlug || !hasProductId || !hasVariantId || !hasName || !hasPrice || !productExists) {
      console.warn(
        `[CartSanitize] Item inválido eliminado: name="${item.name}" slug="${item.slug}" productId=${item.productId} variantId=${item.variantId} price=${item.price} productExists=${productExists}`
      );
      invalidKeys.push(item.cartKey);
    }
  }

  if (invalidKeys.length > 0) {
    // Eliminar todos los items inválidos de una vez
    const validItems = state.items.filter(
      (i) => !invalidKeys.includes(i.cartKey)
    );
    useCartStore.setState({ items: validItems });
    console.log(`[CartSanitize] ${invalidKeys.length} item(s) inválido(s) eliminado(s) del carrito.`);
  }

  return invalidKeys.length;
}

/**
 * Custom storage API for Zustand persist middleware using sessionStorage.
 * Falls back gracefully in SSR environments.
 */
const sessionStorageAPI = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    try {
      const str = sessionStorage.getItem(name);
      return str;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(name, value);
    } catch {
      // sessionStorage full or unavailable — ignore silently
    }
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(name);
    } catch {
      // ignore
    }
  },
};

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

      clearCart: () => {
        set({ items: [] });
        // También limpiar sessionStorage directamente
        clearCartStorage();
      },

      totalItems: 0,

      total: 0,
    }),
    {
      name: CART_STORAGE_KEY,
      storage: sessionStorageAPI,
      onRehydrateStorage: () => (state) => {
        // Migración: limpiar datos antiguos de localStorage
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem(CART_STORAGE_KEY);
          } catch {
            // ignore
          }
        }
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
