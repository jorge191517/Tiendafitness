"use client";

import { motion } from "framer-motion";
import { Star, ShoppingCart, ArrowLeft, ShieldCheck, Truck, Check, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/data/types";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import Link from "next/link";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-white/20 fill-white/20"
          }`}
        />
      ))}
      <span className="text-sm text-white/50 ml-2">
        {rating} · {rating >= 4.5 ? "Excelente" : rating >= 4 ? "Muy bueno" : "Bueno"}
      </span>
    </div>
  );
}

export default function ProductDetail({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) => s.isInCart);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const [justAdded, setJustAdded] = useState(false);
  const inCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="min-h-screen bg-deep">
      {/* Header spacer */}
      <div className="h-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        {/* Back link */}
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a productos
        </Link>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16"
        >
          {/* Product Image */}
          <motion.div variants={fadeInUp} className="relative aspect-square rounded-2xl overflow-hidden bg-dark-gray">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-electric text-white text-sm font-bold uppercase tracking-wider">
                {product.badge}
              </span>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div variants={fadeInUp} className="flex flex-col justify-center">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-electric font-semibold uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleWishlist(product)}
                className="text-white/40 hover:text-red-400 transition-colors shrink-0"
              >
                <Heart className={`h-5 w-5 ${inWishlist ? "fill-red-400 text-red-400" : ""}`} />
              </Button>
            </div>
            <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight mb-4">
              {product.name}
            </h1>

            <StarRating rating={product.rating} />

            <div className="flex items-baseline gap-3 mt-4 mb-6">
              <span className="text-3xl md:text-4xl font-black text-white">
                {product.price.toFixed(2)} €
              </span>
              {product.oldPrice && (
                <span className="text-lg text-white/30 line-through">
                  {product.oldPrice.toFixed(2)} €
                </span>
              )}
              {product.oldPrice && (
                <span className="text-sm font-bold text-lime">
                  -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                </span>
              )}
            </div>

            <p className="text-white/60 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Stock status */}
            <div className="mb-6">
              {product.stock === "in_stock" && (
                <span className="text-lime text-sm font-semibold">En stock</span>
              )}
              {product.stock === "low_stock" && (
                <span className="text-yellow-400 text-sm font-semibold">Últimas unidades</span>
              )}
              {product.stock === "out_of_stock" && (
                <span className="text-red-400 text-sm font-semibold">Agotado</span>
              )}
            </div>

            {/* Add to cart */}
            <div className="flex gap-4 mb-8">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === "out_of_stock"}
                className={`font-bold px-8 py-6 text-base rounded-xl transition-all duration-300 uppercase tracking-wider ${
                  justAdded
                    ? "bg-lime hover:bg-lime/90 text-black shadow-[0_0_30px_rgba(170,255,0,0.3)]"
                    : "bg-electric hover:bg-electric/90 text-white shadow-[0_0_30px_rgba(0,153,255,0.3)] hover:shadow-[0_0_40px_rgba(0,153,255,0.5)]"
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Añadido al Carrito
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {inCart ? "Añadir Más" : "Añadir al Carrito"}
                  </>
                )}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-electric" />
                <span className="text-sm text-white/50">Calidad Garantizada</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-electric" />
                <span className="text-sm text-white/50">Envío Rápido</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
