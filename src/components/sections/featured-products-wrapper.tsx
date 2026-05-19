import { getFeaturedProducts } from "@/services/products";
import FeaturedProductsClient from "./featured-products";

export default async function FeaturedProductsWrapper() {
  const products = await getFeaturedProducts();
  return <FeaturedProductsClient products={products} />;
}
