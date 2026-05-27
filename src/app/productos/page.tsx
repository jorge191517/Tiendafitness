import type { Metadata } from "next";
import Link from "next/link";
import { getProducts, getProductsByCategory } from "@/services/products";
import { getCategories } from "@/services/categories";
import ProductGrid from "./product-grid";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Explora nuestro catálogo de productos deportivos seleccionados. Ropa deportiva, conjuntos, shorts y más.",
};

interface Props {
  searchParams: Promise<{ categoria?: string; subcategoria?: string }>;
}

export default async function ProductosPage({ searchParams }: Props) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    params.categoria ? getProductsByCategory(params.categoria) : getProducts(),
    getCategories(),
  ]);

  const activeCategory = params.categoria ?? null;

  // Filter by subcategory if specified (client-side filtering on server data)
  let displayProducts = products;
  if (params.subcategoria) {
    displayProducts = products.filter(
      (p) => p.subcategory === params.subcategoria
    );
  }

  // Get subcategories for active category
  const subcategories = activeCategory
    ? Array.from(
        new Map(
          products
            .filter((p) => p.subcategory && p.subcategoryName)
            .map((p) => [p.subcategory, { slug: p.subcategory!, name: p.subcategoryName! }])
        ).values()
      )
    : [];

  return (
    <div className="min-h-screen bg-deep">
      {/* Header spacer */}
      <div className="h-20" />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-sm text-white/30">
          <Link href="/" className="hover:text-white/60 transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-white/60">Productos</span>
          {activeCategory && (
            <>
              <span>/</span>
              <span className="text-electric">
                {categories.find((c) => c.slug === activeCategory)?.name ?? activeCategory}
              </span>
            </>
          )}
          {params.subcategoria && (
            <>
              <span>/</span>
              <span className="text-electric">
                {subcategories.find((s) => s.slug === params.subcategoria)?.name ?? params.subcategoria}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Page header */}
      <section className="py-8 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
            Nuestros <span className="text-electric">Productos</span>
          </h1>
          <p className="text-white/50 max-w-xl text-sm md:text-base">
            Explora nuestro catálogo. Productos deportivos seleccionados para cada disciplina y nivel.
          </p>
        </div>
      </section>

      {/* Category filter pills */}
      <section className="pb-4 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap md:flex-wrap">
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

      {/* Subcategory filter pills (only when a category is active and has subcategories) */}
      {activeCategory && subcategories.length > 0 && (
        <section className="pb-8 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap md:flex-wrap">
              <a
                href={`/productos?categoria=${activeCategory}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-300 ${
                  !params.subcategoria
                    ? "bg-electric/10 border border-electric/30 text-electric"
                    : "bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-electric/30"
                }`}
              >
                Todos
              </a>
              {subcategories.map((sub) => (
                <a
                  key={sub.slug}
                  href={`/productos?categoria=${activeCategory}&subcategoria=${sub.slug}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-300 ${
                    params.subcategoria === sub.slug
                      ? "bg-electric/10 border border-electric/30 text-electric"
                      : "bg-white/5 border border-white/10 text-white/40 hover:text-white hover:border-electric/30"
                  }`}
                >
                  {sub.name}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProductGrid products={displayProducts} />
        </div>
      </section>
    </div>
  );
}
