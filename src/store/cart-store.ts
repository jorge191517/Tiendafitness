/**
 * Store del carrito con Zustand + persistencia por usuario.
 *
 * Compatible con modelo base+variantes.
 * Key compuesta: productId-variantId-size para unicidad.
 *
 * CARACTERÍSTICAS:
 * - Carrito aislado por usuario autenticado (clave: tiendafitnesspro-cart-${userId})
 * - Carrito guest para usuarios no autenticados (clave: tiendafitnesspro-cart-guest)
 * - Al iniciar sesión: migrar carrito guest → usuario autenticado (sin duplicados)
 * - Al cerrar sesión: limpiar carrito visual y storage
 * - Al cambiar de usuario: cargar carrito del nuevo usuario
 * - sessionStorage (no localStorage) para privacidad
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

// ─── Storage por usuario ────────────────────────────────────────────────────

const CART_BASE_KEY = "tiendafitnesspro-cart";
const GUEST_KEY = `${CART_BASE_KEY}-guest`;

/**
 * Obtiene la clave de storage para el usuario actual.
 * - Si hay userId → tiendafitnesspro-cart-${userId}
 * - Si es guest → tiendafitnesspro-cart-guest
 */
function getCartStorageKey(userId?: string | null): string {
  if (userId) {
    return `${CART_BASE_KEY}-${userId}`;
  }
  return GUEST_KEY;
}

/** ID del usuario actualmente activo en el carrito (para detectar cambios) */
let currentCartUserId: string | null = null;

/**
 * Storage API personalizada para Zustand persist con soporte por usuario.
 * Cambia la clave de storage según el usuario autenticado.
 */
const userSessionStorageAPI = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    try {
      // name es la clave default "tiendafitnesspro-cart" que zustand usa internamente
      // Pero nosotros leemos de la clave específica del usuario
      const key = getCartStorageKey(currentCartUserId);
      const str = sessionStorage.getItem(key);
      return str;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;
    try {
      const key = getCartStorageKey(currentCartUserId);
      sessionStorage.setItem(key, value);
    } catch {
      // sessionStorage full or unavailable
    }
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;
    try {
      const key = getCartStorageKey(currentCartUserId);
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

// ─── Store principal ────────────────────────────────────────────────────────

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
        // Limpiar storage del usuario actual
        clearCartStorage(currentCartUserId);
      },

      totalItems: 0,

      total: 0,
    }),
    {
      name: CART_BASE_KEY, // Zustand usa esto como nombre base, pero nuestro storage API lo redirige
      storage: userSessionStorageAPI,
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

// ─── Funciones de gestión de carrito por usuario ────────────────────────────

/**
 * Limpia el almacenamiento del carrito para un usuario específico o guest.
 * Elimina tanto de sessionStorage como de localStorage.
 */
export function clearCartStorage(userId?: string | null): void {
  const key = getCartStorageKey(userId);
  try {
    sessionStorage.removeItem(key);
  } catch {
    // SSR
  }
  try {
    localStorage.removeItem(key);
  } catch {
    // SSR o localStorage no disponible
  }
}

/**
 * Limpia TODOS los carritos almacenados (guest + todos los usuarios).
 * Útil para mantenimiento o cleanup completo.
 */
export function clearAllCartStorages(): void {
  if (typeof window === "undefined") return;
  try {
    // Limpiar todas las claves de carrito en sessionStorage
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(CART_BASE_KEY)) {
        sessionStorage.removeItem(key);
      }
    }
    // Limpiar todas las claves de carrito en localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(CART_BASE_KEY)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}

/**
 * Valida y limpia items inválidos del carrito.
 * Un item es inválido si:
 * - No tiene slug o productId
 * - Su slug no corresponde a ningún producto del catálogo
 * - Tiene precio <= 0
 * - Tiene cantidad <= 0
 *
 * Retorna el número de items eliminados.
 */
export function sanitizeCart(): number {
  const state = useCartStore.getState();
  const invalidKeys: string[] = [];

  for (const item of state.items) {
    const hasSlug = !!item.slug && item.slug.trim() !== "";
    const hasProductId = item.productId !== undefined && item.productId !== null && item.productId !== "";
    const hasPrice = typeof item.price === "number" && item.price > 0;
    const hasQuantity = typeof item.quantity === "number" && item.quantity > 0;

    // Verificar que el producto existe en el catálogo
    const productExists = hasSlug ? !!getProductBySlug(item.slug) : false;

    if (!hasSlug || !hasProductId || !hasPrice || !hasQuantity || !productExists) {
      console.warn(
        `[CartSanitize] Item inválido eliminado: name="${item.name}" slug="${item.slug}" productId=${item.productId} price=${item.price} qty=${item.quantity} exists=${productExists}`
      );
      invalidKeys.push(item.cartKey);
    }
  }

  if (invalidKeys.length > 0) {
    const validItems = state.items.filter(
      (i) => !invalidKeys.includes(i.cartKey)
    );
    useCartStore.setState({ items: validItems });
    console.log(`[CartSanitize] ${invalidKeys.length} item(s) inválido(s) eliminado(s).`);
  }

  return invalidKeys.length;
}

/**
 * Cambia el carrito al contexto de un usuario específico.
 * - Si el userId cambia, guarda el carrito actual y carga el del nuevo usuario.
 * - Si es un nuevo login (de guest a usuario), migra los items del guest.
 *
 * DEBE llamarse desde el listener de onAuthStateChange.
 *
 * @param userId - ID del usuario autenticado, o null para guest
 * @param event - Evento de auth que disparó el cambio (SIGNED_IN, SIGNED_OUT, etc.)
 */
export function switchCartToUser(userId: string | null, event?: string): void {
  const previousUserId = currentCartUserId;

  if (previousUserId === userId) {
    // No cambió el usuario, no hacer nada
    return;
  }

  console.log(`[CartSwitch] Cambiando carrito: ${previousUserId ?? "guest"} → ${userId ?? "guest"} (evento: ${event ?? "manual"})`);

  // 1. Guardar carrito actual ANTES de cambiar de contexto
  const currentItems = useCartStore.getState().items;

  if (previousUserId !== null && currentItems.length > 0) {
    // Guardar items del usuario anterior en su storage
    const prevKey = getCartStorageKey(previousUserId);
    try {
      sessionStorage.setItem(prevKey, JSON.stringify({ state: { items: currentItems }, version: 0 }));
    } catch {
      // ignore
    }
  }

  // 2. Si era guest y ahora hay usuario → migrar items del guest
  if (previousUserId === null && userId !== null && event === "SIGNED_IN") {
    const guestItems = currentItems;
    if (guestItems.length > 0) {
      console.log(`[CartSwitch] Migrando ${guestItems.length} item(s) del carrito guest → usuario ${userId.substring(0, 8)}...`);
      // Limpiar el carrito guest del storage
      clearCartStorage(null);
    }
  }

  // 3. Actualizar el userId actual
  currentCartUserId = userId;

  // 4. Cargar carrito del nuevo usuario
  const newKey = getCartStorageKey(userId);
  try {
    const savedData = sessionStorage.getItem(newKey);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      const newItems = parsed?.state?.items ?? [];

      if (previousUserId === null && userId !== null && event === "SIGNED_IN" && currentItems.length > 0) {
        // Migración guest → usuario: merge sin duplicados
        const existingKeys = new Set(newItems.map((i: CartItem) => i.cartKey));
        const itemsToAdd = currentItems.filter((i) => !existingKeys.has(i.cartKey));
        const mergedItems = [...newItems, ...itemsToAdd];
        useCartStore.setState({ items: mergedItems });
        console.log(`[CartSwitch] Migración completada: ${newItems.length} existentes + ${itemsToAdd.length} del guest = ${mergedItems.length} total`);
      } else {
        useCartStore.setState({ items: newItems });
      }
    } else {
      // No hay datos guardados para este usuario
      if (previousUserId === null && userId !== null && event === "SIGNED_IN" && currentItems.length > 0) {
        // Mantener los items del guest como base del usuario
        useCartStore.setState({ items: currentItems });
        console.log(`[CartSwitch] Carrito guest mantenido como base para el nuevo usuario`);
      } else {
        useCartStore.setState({ items: [] });
      }
    }
  } catch {
    // Error leyendo storage, iniciar vacío
    useCartStore.setState({ items: [] });
  }

  // 5. Forzar re-persist con la nueva clave
  const finalItems = useCartStore.getState().items;
  try {
    sessionStorage.setItem(newKey, JSON.stringify({ state: { items: finalItems }, version: 0 }));
  } catch {
    // ignore
  }
}

/**
 * Inicializa el contexto del carrito con el usuario actual.
 * Debe llamarse al montar la aplicación (layout o provider).
 */
export function initCartUser(userId: string | null): void {
  currentCartUserId = userId;
  // Cargar carrito del usuario
  const key = getCartStorageKey(userId);
  try {
    const savedData = sessionStorage.getItem(key);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      const items = parsed?.state?.items ?? [];
      useCartStore.setState({ items });
    }
  } catch {
    // ignore
  }
}

// ─── Hook auxiliar ──────────────────────────────────────────────────────────

/**
 * Hook auxiliar para obtener totalItems y total reactivos.
 */
export function useCartTotals() {
  const items = useCartStore((s) => s.items);
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  return { totalItems, total };
}
