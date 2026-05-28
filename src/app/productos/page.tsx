import type { Metadata } from "next";
import { getProducts, getProductsByCategory } from "@/services/products";
import { getCategories } from "@/services/categories";
import ProductGrid from "./product-grid";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Explora nuestro catálogo completo de productos deportivos. Fitness, pádel, ropa deportiva, accesorios y suplementos.",
};

interface Props {
  searchParams: Promise<{ categoria?: string }>;
}

export default async function ProductosPage({ searchParams }: Props) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    params.categoria ? getProductsByCategory(params.categoria) : getProducts(),
    getCategories(),
  ]);

  const activeCategory = params.categoria ?? null;

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header spacer */}
      <div className="h-20" />

      {/* Page header */}
      <section className="py-6 sm:py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-2 sm:mb-4">
            Nuestros <span className="text-electric">Productos</span>
          </h1>
          <p className="text-white/50 max-w-xl text-xs sm:text-sm md:text-base">
            Explora nuestro catálogo completo. Equipamiento deportivo de alta calidad para cada disciplina y nivel.
          </p>
        </div>
      </section>

      {/* Category filter pills */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            <a
              href="/productos"
              className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-300 ${
                !activeCategory
                  ? "bg-electric/10 border border-electric/40 text-electric"
                  : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-electric/40 hover:bg-electric/5"
              }`}
            >
              Todos
            </a>
            {categories.map((cat) => (
              <a
                key={cat.slug}
                href={`/productos?categoria=${cat.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 ${
                  activeCategory === cat.slug
                    ? "bg-electric/10 border border-electric/40 text-electric"
                    : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-electric/40 hover:bg-electric/5"
                }`}
              >
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductGrid products={products} />
        </div>
      </section>
    </div>
  );
}
