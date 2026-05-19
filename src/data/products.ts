export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
  category: string;
}

export const featuredProducts: Product[] = [
  {
    id: 1,
    name: "Pro Resistance Bands Set",
    price: 29.99,
    originalPrice: 49.99,
    image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 324,
    badge: "SALE",
    category: "Fitness & Gym",
  },
  {
    id: 2,
    name: "Carbon Padel Racket Pro",
    price: 189.99,
    originalPrice: 249.99,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 187,
    badge: "BESTSELLER",
    category: "Padel",
  },
  {
    id: 3,
    name: "Ultra Comfort Running Shoes",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 512,
    category: "Sportswear",
  },
  {
    id: 4,
    name: "Whey Protein Isolate 2kg",
    price: 59.99,
    originalPrice: 79.99,
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2c989?w=400&h=400&fit=crop",
    rating: 4.6,
    reviews: 891,
    badge: "SALE",
    category: "Supplements",
  },
  {
    id: 5,
    name: "Smart Fitness Watch X1",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 267,
    badge: "NEW",
    category: "Accessories",
  },
  {
    id: 6,
    name: "Compression Training Shorts",
    price: 44.99,
    originalPrice: 64.99,
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop",
    rating: 4.5,
    reviews: 198,
    badge: "SALE",
    category: "Sportswear",
  },
  {
    id: 7,
    name: "Adjustable Dumbbell Set 24kg",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 445,
    badge: "TOP RATED",
    category: "Fitness & Gym",
  },
  {
    id: 8,
    name: "BCAA Recovery Complex",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop",
    rating: 4.4,
    reviews: 156,
    category: "Supplements",
  },
];
