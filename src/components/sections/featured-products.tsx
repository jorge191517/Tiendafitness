"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useState } from "react";
import type { Product, ProductBadge } from "@/data/types";
import { brandingConfig } from "@/config/branding";
import { fadeInUpShort } from "@/lib/animations";

function getBadgeColor(badge: ProductBadge | string) {
  switch (badge) {
    case "OFERTA": return "bg-red-500 text-white";
    case "NUEVO": return "bg-electric text-white";
    case "MÁS VENDIDO": return "bg-lime text-black";
    case "TOP VALORADO": return "bg-yellow-500 text-black";
    default: return "bg-white/20 text-white";
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`h-3 w-3 ${star <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-white/20 fill-white/20"}`} />
      ))}
      <span className="text-xs text-white/40 ml-1">({rating})</span>
    </div>
  );
}

export default function FeaturedProductsClient({ products }: { products: Product[] }) {
  const slogans = brandingConfig?.slogans ?? {};
  const productsSection = slogans?.products ?? {};

  return (
    <section id="products" className="relative py-16 md:py-24 bg-[#0f172a]">
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-electric/3 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-lime/3 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUpShort}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-10 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-electric/10 border border-electric/30 text-electric text-xs md:text-sm font-semibold tracking-wider uppercase mb-4">
            {productsSection?.eyebrow ?? ''}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
            Lo Mejor <span className="text-electric">de</span> la Semana
          </h2>
          <p className="mt-3 text-white/40 max-w-md mx-auto text-sm md:text-base">
            {productsSection?.description ?? ''}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {products.map((product, i) => (
            <FeaturedProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProductCard({ product, index }: { product: Product; index: number }) {
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const activeVariant = product.variants[activeVariantIdx];
  const displayImage = activeVariant?.image ?? product.image;

  return (
    <motion.a
      href={`/productos/${product.slug}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -8 }}
      className="group relative rounded-2xl bg-[#1e293b] border border-white/[0.08] hover:border-electric/30 transition-all duration-500 overflow-hidden block shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-electric/5"
    >
      <div className="relative aspect-square overflow-hidden bg-[#111827]">
        <img key={displayImage} src={displayImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        {product.badge && (
          <span className={`absolute top-2 left-2 md:top-3 md:left-3 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${getBadgeColor(product.badge)}`}>
            {product.badge}
          </span>
        )}
      </div>

      <div className="p-3 md:p-4">
        <p className="text-[10px] md:text-xs text-electric/70 font-semibold uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="text-xs md:text-sm font-bold text-white group-hover:text-electric transition-colors line-clamp-2 mb-2 leading-tight">{product.name}</h3>
        <StarRating rating={product.rating} />
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm md:text-lg font-black text-white">{product.price.toFixed(2)} €</span>
          {product.oldPrice && <span className="text-xs md:text-sm text-white/30 line-through">{product.oldPrice.toFixed(2)} €</span>}
        </div>

        {product.variants.length > 1 && (
          <div className="flex items-center gap-1.5 mt-3">
            {product.variants.map((variant, idx) => (
              <button
                key={variant.id}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveVariantIdx(idx); }}
                title={variant.colorName}
                className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 transition-all duration-200 ${
                  idx === activeVariantIdx ? "border-electric scale-110" : "border-white/20 hover:border-white/50"
                }`}
                style={{ backgroundColor: variant.color }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[inset_0_0_30px_rgba(0,153,255,0.05)]" />
    </motion.a>
  );
}
