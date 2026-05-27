"use client";

import { motion } from "framer-motion";
import {
  Star,
  ShoppingCart,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Check,
  Heart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import type { Product } from "@/data/types";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { useCartStore, buildCartKey, type CartItem } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

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

/** Determines if a color is light (for contrast text) */
function isLightColor(color: string): boolean {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

export default function ProductDetail({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist);
  const { toast } = useToast();

  const inWishlist = isInWishlist(product.id);

  // Current variant index
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const currentVariant = product.variants[selectedVariantIdx];

  // Size selection
  const hasSizes = currentVariant.sizes.length > 0;
  const [selectedSize, setSelectedSize] = useState("");

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Feedback
  const [justAdded, setJustAdded] = useState(false);

  // When variant changes, reset size
  const handleVariantChange = (idx: number) => {
    setSelectedVariantIdx(idx);
    setSelectedSize("");
    setQuantity(1);
  };

  // Navigate variant with arrows
  const goNextVariant = () => {
    const next = (selectedVariantIdx + 1) % product.variants.length;
    handleVariantChange(next);
  };
  const goPrevVariant = () => {
    const prev = (selectedVariantIdx - 1 + product.variants.length) % product.variants.length;
    handleVariantChange(prev);
  };

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      toast({
        title: "Selecciona una talla",
        description: "Debes elegir una talla antes de añadir al carrito.",
        variant: "destructive",
      });
      return;
    }

    const cartKey = buildCartKey(product.id, currentVariant.id, selectedSize);

    const cartItem: CartItem = {
      cartKey,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      oldPrice: product.oldPrice,
      image: currentVariant.image,
      category: product.category,
      variantId: currentVariant.id,
      colorName: currentVariant.colorName,
      color: currentVariant.color,
      selectedSize,
      quantity,
    };

    addItem(cartItem);
    setJustAdded(true);
    toast({
      title: "Añadido al carrito",
      description: `${product.name} — ${currentVariant.colorName}${selectedSize ? ` · Talla ${selectedSize}` : ""} × ${quantity}`,
    });
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="h-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
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
          {/* ─── Product Image Gallery ─── */}
          <motion.div variants={fadeInUp} className="flex flex-col gap-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#111827] group">
              <img
                key={currentVariant.image}
                src={currentVariant.image}
                alt={`${product.name} — ${currentVariant.colorName}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {product.variants.length > 1 && (
                <>
                  <button
                    onClick={goPrevVariant}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={goNextVariant}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              {product.badge && (
                <span className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-electric text-white text-sm font-bold uppercase tracking-wider">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.variants.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.variants.map((variant, idx) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(idx)}
                    className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      idx === selectedVariantIdx
                        ? "border-electric shadow-[0_0_15px_rgba(0,153,255,0.4)]"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={variant.image}
                      alt={variant.colorName}
                      className="w-full h-full object-cover"
                    />
                    {idx === selectedVariantIdx && (
                      <div className="absolute inset-0 bg-electric/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ─── Product Info ─── */}
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

            <p className="text-white/60 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* ─── Color Selector ─── */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-white/70 mb-3">
                Color: <span className="text-white">{currentVariant.colorName}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant, idx) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(idx)}
                    title={variant.colorName}
                    className={`relative w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                      idx === selectedVariantIdx
                        ? "border-electric shadow-[0_0_15px_rgba(0,153,255,0.4)] scale-110"
                        : "border-white/20 hover:border-white/50 hover:scale-105"
                    }`}
                    style={{ backgroundColor: variant.color }}
                  >
                    {idx === selectedVariantIdx && (
                      <Check
                        className={`h-4 w-4 ${
                          isLightColor(variant.color) ? "text-black" : "text-white"
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Size Selector ─── */}
            {hasSizes && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-white/70 mb-3">
                  Talla:{" "}
                  {selectedSize ? (
                    <span className="text-white">{selectedSize}</span>
                  ) : (
                    <span className="text-yellow-400">Selecciona una talla</span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentVariant.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                        selectedSize === size
                          ? "bg-electric text-white shadow-[0_0_15px_rgba(0,153,255,0.4)] border-2 border-electric"
                          : "bg-white/5 text-white/70 border-2 border-white/10 hover:border-electric/50 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {hasSizes && !selectedSize && (
                  <div className="flex items-center gap-2 mt-2 text-yellow-400 text-xs">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Debes seleccionar una talla para continuar</span>
                  </div>
                )}
              </div>
            )}

            {/* ─── Quantity Selector ─── */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-white/70 mb-3">Cantidad</p>
              <div className="inline-flex items-center gap-0 rounded-xl border border-white/10 overflow-hidden bg-white/5">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="w-11 h-11 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-bold text-white text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= 10}
                  className="w-11 h-11 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ─── Stock status ─── */}
            <div className="mb-6">
              {currentVariant.stock === "in_stock" && (
                <span className="text-lime text-sm font-semibold">En stock</span>
              )}
              {currentVariant.stock === "low_stock" && (
                <span className="text-yellow-400 text-sm font-semibold">Últimas unidades</span>
              )}
              {currentVariant.stock === "out_of_stock" && (
                <span className="text-red-400 text-sm font-semibold">Agotado</span>
              )}
            </div>

            {/* ─── Add to cart + WhatsApp ─── */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Button
                onClick={handleAddToCart}
                disabled={currentVariant.stock === "out_of_stock"}
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
                    Añadir al Carrito
                  </>
                )}
              </Button>
              <WhatsAppButton
                message={`Hola, estoy interesado en: ${product.name} (${currentVariant.colorName}${selectedSize ? `, Talla ${selectedSize}` : ""})`}
                label="Consultar"
                variant="outline"
                className="py-6 px-6 text-base rounded-xl uppercase tracking-wider"
              />
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
