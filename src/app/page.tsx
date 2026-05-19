"use client";

import Header from "@/components/sections/header";
import Hero from "@/components/sections/hero";
import CategoryBar from "@/components/sections/category-bar";
import FeaturedProducts from "@/components/sections/featured-products";
import PromoBanner from "@/components/sections/promo-banner";
import Brands from "@/components/sections/brands";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-deep">
      <Header />
      <main className="flex-1">
        <Hero />
        <CategoryBar />
        <FeaturedProducts />
        <PromoBanner />
        <Brands />
      </main>
      <Footer />
    </div>
  );
}
