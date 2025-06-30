import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import CallToAction from "@/components/sections/CallToAction";
import ProductCard from "@/components/products/ProductCard";
import { mockProducts } from "@/lib/mock-data";

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero Parallax Section */}
      <Hero products={mockProducts} />

      {/* Features Section */}
      <Features />

      {/* Featured Products Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Najnowsze produkty
          </h2>
          <p className="mt-4 text-lg text-foreground/80">
            Sprawdź naszą najnowszą kolekcję premium streetwearu
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mockProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              className="mx-auto w-full max-w-sm"
            />
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <CallToAction />
    </div>
  );
}
