/**
 * Store de favoritos/wishlist con Zustand.
 * Preparado para ecommerce real — estructura base.
 */

import { create } from "zustand";
import type { Product } from "@/data/types";

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],

  addItem: (product) => {
    set((state) => {
      if (state.items.some((i) => i.id === product.id)) return state;
      return { items: [...state.items, product] };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== productId),
    }));
  },

  toggleItem: (product) => {
    const isIn = get().isInWishlist(product.id);
    if (isIn) {
      get().removeItem(product.id);
    } else {
      get().addItem(product);
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((i) => i.id === productId);
  },

  clearWishlist: () => set({ items: [] }),
}));
