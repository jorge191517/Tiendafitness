"use client";

import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { featuredProducts } from "@/data/products";
import type { ProductBadge } from "@/data/products";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-white/20 fill-white/20"
          }`}
        />
      ))}
      <span className="text-xs text-white/40 ml-1">({rating})</span>
    </div>
  );
}

function getBadgeColor(badge: ProductBadge | string) {
  switch (badge) {
    case "OFERTA":
      return "bg-red-500 text-white";
    case "NUEVO":
      return "bg-electric text-white";
    case "MÁS VENDIDO":
      return "bg-lime text-black";
    case "TOP VALORADO":
      return "bg-yellow-500 text-black";
    default:
      return "bg-white/20 text-white";
  }
}

export default function FeaturedProducts() {
  return (
    <section id="products" className="relative py-16 md:py-24 bg-deep">
      {/* Section background accents */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-electric/3 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-lime/3 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-electric/10 border border-electric/30 text-electric text-xs md:text-sm font-semibold tracking-wider uppercase mb-4">
            Productos Destacados
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
            Lo Mejor <span className="text-electric">de</span> la Semana
          </h2>
          <p className="mt-3 text-white/40 max-w-md mx-auto text-sm md:text-base">
            Selección curada del mejor equipamiento deportivo y suplementos para un rendimiento máximo.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {featuredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -8 }}
              className="group relative rounded-2xl bg-mid-gray border border-white/5 hover:border-electric/30 transition-all duration-500 overflow-hidden"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-dark-gray">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Badge */}
                {product.badge && (
                  <span
                    className={`absolute top-2 left-2 md:top-3 md:left-3 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${getBadgeColor(
                      product.badge
                    )}`}
                  >
                    {product.badge}
                  </span>
                )}

                {/* Quick add overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button
                    size="sm"
                    className="bg-electric hover:bg-electric/90 text-white rounded-full shadow-[0_0_20px_rgba(0,153,255,0.4)] font-bold uppercase tracking-wider text-xs"
                  >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                    Añadir al Carrito
                  </Button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 md:p-4">
                <p className="text-[10px] md:text-xs text-electric/60 font-semibold uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <h3 className="text-xs md:text-sm font-bold text-white/90 group-hover:text-white transition-colors line-clamp-2 mb-2 leading-tight">
                  {product.name}
                </h3>
                <StarRating rating={product.rating} />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm md:text-lg font-black text-white">
                    {product.price.toFixed(2)} €
                  </span>
                  {product.oldPrice && (
                    <span className="text-xs md:text-sm text-white/30 line-through">
                      {product.oldPrice.toFixed(2)} €
                    </span>
                  )}
                </div>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none shadow-[inset_0_0_30px_rgba(0,153,255,0.05)]" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
