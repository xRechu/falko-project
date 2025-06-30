import { Metadata } from "next";
import ProductCard from "@/components/products/ProductCard";
import { fetchProducts } from "@/lib/products-service";

/**
 * Metadata dla strony sklepu
 */
export const metadata: Metadata = {
  title: "Sklep - Falko Project",
  description: "Przeglądaj pełną kolekcję premium streetwearu Falko Project. Bluzy, koszulki i czapki najwyższej jakości.",
};

/**
 * Server Component - Strona główna sklepu
 */
export default async function ShopPage() {
  const products = await fetchProducts();

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
            Sklep Falko Project
          </h1>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Odkryj naszą pełną kolekcję premium streetwearu. 
            Każdy produkt to połączenie najwyższej jakości z minimalistycznym designem.
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                className="mx-auto w-full max-w-sm"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-foreground/60 text-lg">
              Brak produktów do wyświetlenia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
