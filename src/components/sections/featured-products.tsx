"use client";

import { motion } from "framer-motion";
import { Star, ShoppingCart, Check, Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Product, ProductBadge } from "@/data/types";
import { brandingConfig } from "@/config/branding";
import { fadeInUpShort } from "@/lib/animations";
import { useCartStore } from "@/store/cart-store";

/** Botón de añadir al carrito con feedback visual */
function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) => s.isInCart);
  const [justAdded, setJustAdded] = useState(false);
  const inCart = isInCart(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <Button
      size="sm"
      onClick={handleAdd}
      className={`rounded-full font-bold uppercase tracking-wider text-xs transition-all duration-300 ${
        justAdded
          ? "bg-lime text-black shadow-[0_0_20px_rgba(170,255,0,0.4)]"
          : inCart
          ? "bg-electric/80 text-white shadow-[0_0_20px_rgba(0,153,255,0.3)]"
          : "bg-electric hover:bg-electric/90 text-white shadow-[0_0_20px_rgba(0,153,255,0.4)]"
      }`}
    >
      {justAdded ? (
        <>
          <Check className="h-3.5 w-3.5 mr-1.5" />
          Añadido
        </>
      ) : (
        <>
          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
          {inCart ? "En el Carrito" : "Añadir"}
        </>
      )}
    </Button>
  );
}

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

export default function FeaturedProductsClient({ products }: { products: Product[] }) {
  const { slogans, cta } = brandingConfig;

  return (
    <section id="products" className="relative py-16 md:py-24 bg-deep">
      {/* Section background accents */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-electric/3 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-lime/3 rounded-full blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          variants={fadeInUpShort}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-10 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-electric/10 border border-electric/30 text-electric text-xs md:text-sm font-semibold tracking-wider uppercase mb-4">
            {slogans.products.eyebrow}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
            Lo Mejor <span className="text-electric">de</span> la Semana
          </h2>
          <p className="mt-3 text-white/40 max-w-md mx-auto text-sm md:text-base">
            {slogans.products.description}
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {products.map((product, i) => (
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
              <a
                href={`/productos/${product.slug}`}
                className="block relative aspect-square overflow-hidden bg-dark-gray"
              >
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

                {/* Color swatch */}
                {product.color && (
                  <div className="absolute top-2 right-2 md:top-3 md:right-3">
                    <div
                      className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-white/30 shadow-md"
                      style={{ backgroundColor: product.color }}
                      title={product.colorName ?? product.color}
                    />
                  </div>
                )}

                {/* Quick action overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-4 gap-2 z-10">
                  <a
                    href={`/productos/${product.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-white/90 transition-colors shadow-lg"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver Producto
                  </a>
                  <AddToCartButton product={product} />
                </div>
              </a>

              {/* Product Info */}
              <div className="p-3 md:p-4">
                <p className="text-[10px] md:text-xs text-electric/60 font-semibold uppercase tracking-wider mb-1">
                  {product.subcategoryName ?? product.categoryName ?? product.category}
                </p>
                <h3 className="text-xs md:text-sm font-bold text-white/90 group-hover:text-white transition-colors line-clamp-2 mb-1.5 leading-tight">
                  {product.name}
                </h3>

                {/* Sizes preview */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="flex gap-1 mb-2">
                    {product.sizes.map((size) => (
                      <span
                        key={size}
                        className="inline-flex items-center justify-center w-5 h-5 md:w-6 md:h-6 text-[8px] md:text-[10px] font-semibold text-white/40 border border-white/10 rounded"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                )}

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
