"use client";

import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCartStore, useCartTotals } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import Link from "next/link";

/**
 * Sidebar del carrito — se desliza desde la derecha.
 * Muestra los productos del carrito con controles de cantidad,
 * el subtotal y un enlace a la página de checkout.
 */
export default function CartSidebar() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const { totalItems, total } = useCartTotals();

  const cartSidebarOpen = useUIStore((s) => s.cartSidebarOpen);
  const setCartSidebarOpen = useUIStore((s) => s.setCartSidebarOpen);

  return (
    <Sheet open={cartSidebarOpen} onOpenChange={setCartSidebarOpen}>
      <SheetContent
        side="right"
        className="bg-dark-gray border-white/5 w-full sm:max-w-md flex flex-col"
      >
        {/* Cabecera */}
        <SheetHeader className="pb-0">
          <SheetTitle className="flex items-center gap-2 text-white">
            <ShoppingBag className="h-5 w-5 text-electric" />
            Mi Carrito
            {totalItems > 0 && (
              <span className="ml-auto text-sm font-semibold text-electric">
                {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Carrito vacío */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-white/20" />
            </div>
            <p className="text-white/60 font-semibold mb-1">
              Tu carrito está vacío
            </p>
            <p className="text-sm text-white/30 mb-6">
              Añade productos para empezar a comprar
            </p>
            <Button
              asChild
              onClick={() => setCartSidebarOpen(false)}
              className="bg-electric hover:bg-electric/90 text-white font-bold uppercase tracking-wider rounded-xl"
            >
              <Link href="/productos">Ver Productos</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.cartKey}
                  className="flex items-center gap-3 p-3 rounded-xl bg-mid-gray border border-white/5"
                >
                  {/* Imagen */}
                  <div className="w-14 h-14 rounded-lg bg-dark-gray overflow-hidden shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/90 truncate">
                      {item.product.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {item.product.colorName && (
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2.5 h-2.5 rounded-full border border-white/20"
                            style={{ backgroundColor: item.product.color }}
                          />
                          <span className="text-xs text-white/40">{item.product.colorName}</span>
                        </div>
                      )}
                      {item.product.selectedSize && (
                        <>
                          {item.product.colorName && <span className="text-white/20 text-xs">·</span>}
                          <span className="text-xs text-white/40">Talla {item.product.selectedSize}</span>
                        </>
                      )}
                      {!item.product.colorName && !item.product.selectedSize && (
                        <p className="text-xs text-electric/60 uppercase tracking-wider">
                          {item.product.category}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-white">
                        {item.product.price.toFixed(2)} €
                      </span>
                      {item.product.oldPrice && (
                        <span className="text-xs text-white/30 line-through">
                          {item.product.oldPrice.toFixed(2)} €
                        </span>
                      )}
                    </div>

                    {/* Controles de cantidad */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10 rounded-md"
                        onClick={() =>
                          updateQuantity(item.product.cartKey, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-xs font-bold text-white w-5 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white/50 hover:text-white hover:bg-white/10 rounded-md"
                        onClick={() =>
                          updateQuantity(item.product.cartKey, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Precio total + eliminar */}
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-md"
                      onClick={() => removeItem(item.product.cartKey)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-black text-white">
                      {(item.product.price * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pie: subtotal y acciones */}
            <div className="border-t border-white/5 px-4 pt-4 pb-2 space-y-4">
              <Separator className="bg-white/5" />

              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-white/60 font-medium">Subtotal</span>
                <span className="text-xl font-black text-white">
                  {total.toFixed(2)} €
                </span>
              </div>

              <p className="text-xs text-white/30 text-center">
                Envío calculado en el checkout
              </p>

              {/* Botones */}
              <div className="space-y-2">
                <Button
                  asChild
                  onClick={() => setCartSidebarOpen(false)}
                  className="w-full bg-electric hover:bg-electric/90 text-white font-bold py-5 rounded-xl shadow-[0_0_20px_rgba(0,153,255,0.3)] uppercase tracking-wider"
                >
                  <Link href="/checkout">Ver Carrito</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  onClick={() => setCartSidebarOpen(false)}
                  className="w-full text-white/50 hover:text-white hover:bg-white/5 font-semibold rounded-xl"
                >
                  <Link href="/productos">Seguir Comprando</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
