import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/lib/types/product";
import ProductPageClient from "@/components/products/ProductPageClient";
import RelatedProducts from "@/components/products/RelatedProducts";
import { fetchProductByHandle as getProductByHandle, fetchProducts } from "@/lib/products-service";

/**
 * Props dla dynamic route
 */
interface ProductPageProps {
  params: {
    handle: string;
  };
}

/**
 * Generowanie metadata dla SEO
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductByHandle(params.handle);
  
  if (!product) {
    return {
      title: "Produkt nie znaleziony - Falko Project",
    };
  }
  
  return {
    title: `${product.title} - Falko Project`,
    description: product.subtitle || product.description?.substring(0, 160),
    openGraph: {
      title: product.title,
      description: product.subtitle || "Premium streetwear Falko Project",
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  };
}

/**
 * Async Server Component dla strony szczegółów produktu
 */
export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductByHandle(params.handle);
  const allProducts = await fetchProducts();
  
  if (!product) {
    notFound();
  }
  
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <ProductPageClient product={product} />
      </div>
      
      {/* Related Products */}
      <RelatedProducts 
        products={allProducts} 
        currentProductId={product.id} 
      />
    </div>
  );
}
