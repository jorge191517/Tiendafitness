"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore, useCartTotals } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Botón flotante de carrito para móvil/tablet.
 * Aparece cuando hay productos en el carrito y el usuario no está en checkout.
 * Permite abrir el sidebar o ir directamente a checkout.
 */
export default function MobileCartFloat() {
  const { totalItems, total } = useCartTotals();
  const setCartSidebarOpen = useUIStore((s) => s.setCartSidebarOpen);
  const pathname = usePathname();

  // No mostrar en checkout ni si no hay items
  if (totalItems === 0 || pathname === "/checkout") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-4 left-4 right-4 z-40 lg:hidden"
      >
        <div className="flex items-center gap-2">
          {/* Botón ver carrito (sidebar) */}
          <button
            onClick={() => setCartSidebarOpen(true)}
            className="flex items-center gap-3 flex-1 bg-mid-gray/95 backdrop-blur-xl border border-white/10 rounded-2xl pl-4 pr-3 py-3.5 shadow-[0_0_30px_rgba(0,0,0,0.5)] active:scale-[0.98] transition-transform"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5 text-electric" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-electric rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs text-white/60">
                {totalItems} {totalItems === 1 ? "producto" : "productos"}
              </p>
              <p className="text-sm font-bold text-white">{total.toFixed(2)} €</p>
            </div>
          </button>

          {/* Botón finalizar compra */}
          <Link
            href="/checkout"
            className="bg-electric hover:bg-electric/90 text-white font-bold px-5 py-3.5 rounded-2xl shadow-[0_0_20px_rgba(0,153,255,0.3)] active:scale-[0.98] transition-all text-sm uppercase tracking-wider whitespace-nowrap"
          >
            Comprar
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
