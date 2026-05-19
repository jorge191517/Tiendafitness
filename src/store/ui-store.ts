/**
 * Store de estado UI con Zustand.
 * Centraliza estados globales de la interfaz.
 */

import { create } from "zustand";

interface UIState {
  /** Menú móvil abierto */
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;

  /** Búsqueda abierta */
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  /** Sidebar/carrito lateral abierto */
  cartSidebarOpen: boolean;
  setCartSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: () => set({ mobileMenuOpen: !get().mobileMenuOpen }),

  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),

  cartSidebarOpen: false,
  setCartSidebarOpen: (open) => set({ cartSidebarOpen: open }),
}));
