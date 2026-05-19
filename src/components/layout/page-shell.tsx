import Header from "@/components/sections/header";
import Hero from "@/components/sections/hero";
import CategoryBar from "@/components/sections/category-bar";
import FeaturedProductsWrapper from "@/components/sections/featured-products-wrapper";
import PromoBanner from "@/components/sections/promo-banner";
import Brands from "@/components/sections/brands";
import Footer from "@/components/sections/footer";

/**
 * Ensambla todas las secciones de la página principal.
 * Server component — no usa estado ni efectos.
 */
export function PageShell() {
  return (
    <div className="min-h-screen flex flex-col bg-deep">
      <Header />
      <main className="flex-1">
        <Hero />
        <CategoryBar />
        <FeaturedProductsWrapper />
        <PromoBanner />
        <Brands />
      </main>
      <Footer />
    </div>
  );
}
