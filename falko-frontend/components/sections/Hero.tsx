"use client";

import { HeroParallax } from "@/components/ui/hero-parallax";
import { ProductPreview } from "@/lib/types/product";

interface HeroProps {
  products: ProductPreview[];
}

export default function Hero({ products }: HeroProps) {
  // Przekształć ProductPreview na format wymagany przez HeroParallax
  const heroProducts = products.map(product => ({
    title: product.title,
    link: `/products/${product.handle}`,
    thumbnail: product.thumbnail || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop&crop=center'
  }));

  // Jeśli mamy mniej niż 15 produktów, duplikujemy je, aby zapełnić wszystkie rzędy
  const extendedProducts = [...heroProducts];
  while (extendedProducts.length < 15) {
    extendedProducts.push(...heroProducts.slice(0, Math.min(heroProducts.length, 15 - extendedProducts.length)));
  }

  return <HeroParallax products={extendedProducts.slice(0, 15)} />;
}
