import type { Metadata } from "next";
import { allProducts } from "@/data/products";
import { categories } from "@/data/categories";
import ProductGrid from "./product-grid";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Explora nuestro catálogo completo de productos deportivos. Fitness, pádel, ropa deportiva, accesorios y suplementos.",
};

export default function ProductosPage() {
  return (
    <div className="min-h-screen bg-deep">
      {/* Header spacer */}
      <div className="h-20" />

      {/* Page header */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
            Nuestros <span className="text-electric">Productos</span>
          </h1>
          <p className="text-white/50 max-w-xl text-sm md:text-base">
            Explora nuestro catálogo completo. Equipamiento deportivo de alta calidad para cada disciplina y nivel.
          </p>
        </div>
      </section>

      {/* Category filter pills */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-full bg-electric/10 border border-electric/40 text-electric text-sm font-semibold cursor-pointer">
              Todos
            </span>
            {categories.map((cat) => (
              <span
                key={cat.slug}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-electric/40 hover:bg-electric/5 transition-all duration-300 text-sm font-medium cursor-pointer"
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductGrid products={allProducts} />
        </div>
      </section>
    </div>
  );
}
