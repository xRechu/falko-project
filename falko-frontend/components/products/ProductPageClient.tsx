"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { ProductDetail } from "@/lib/types/product";
import { ProductVariantSelector } from "@/components/cart/ProductVariantSelector";
import { useInventoryContext } from "@/lib/context/inventory-context";
import { usePricesContext } from "@/lib/context/prices-context";
import { Heart, Share2, Truck, Shield, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface ProductPageClientProps {
  product: ProductDetail;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  const { isVariantAvailable, getVariantQuantity } = useInventoryContext();
  const { getPriceInCurrency, formatPrice: formatPriceFromContext } = usePricesContext();

  // Oblicz cenę wybranego wariantu z PricesContext
  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
  const selectedPriceData = selectedVariant ? getPriceInCurrency(selectedVariant.id, 'pln') : null;

  // Sprawdź dostępność wybranego wariantu
  const isInStock = selectedVariant ? isVariantAvailable(selectedVariant.id) : false;
  const inventoryQuantity = selectedVariant ? getVariantQuantity(selectedVariant.id) : 0;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.subtitle || `Sprawdź ${product.title} w Falko Project`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Konwertuj ProductDetail do ProductPreview dla AddToCartButton
  const productPreview = {
    id: product.id, // ID produktu dla UI
    title: product.title,
    handle: product.handle,
    thumbnail: product.thumbnail,
    price: selectedPriceData ? {
      amount: selectedPriceData.amount,
      currency_code: selectedPriceData.currency_code,
    } : undefined,
    collection: product.collection,
    // Dodajemy wybrany wariant jako firstVariant
    firstVariant: selectedVariant ? {
      id: selectedVariant.id,
      title: selectedVariant.title,
      prices: selectedVariant.prices
    } : undefined
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Image Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <motion.div 
          className="aspect-square overflow-hidden rounded-lg bg-gray-100"
          layoutId="product-image"
        >
          <Image
            src={product.images[selectedImageIndex]?.url || product.thumbnail || ''}
            alt={product.title}
            width={600}
            height={600}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            priority
          />
        </motion.div>
        
        {/* Thumbnail Images */}
        {product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {product.images.map((image, index) => (
              <motion.div
                key={image.id}
                className={`aspect-square overflow-hidden rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedImageIndex === index 
                    ? 'ring-2 ring-primary' 
                    : 'hover:opacity-80'
                }`}
                onClick={() => setSelectedImageIndex(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Image
                  src={image.url}
                  alt={`${product.title} - zdjęcie ${index + 1}`}
                  width={150}
                  height={150}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumbs 
          items={[
            { label: "Sklep", href: "/sklep" },
            ...(product.collection ? [{ label: product.collection.title, href: `/sklep?collection=${product.collection.handle}` }] : []),
            { label: product.title }
          ]}
        />
        
        {/* Title & Subtitle */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            {product.title}
          </h1>
          {product.subtitle && (
            <p className="text-lg text-muted-foreground mb-4">
              {product.subtitle}
            </p>
          )}
        </div>
        
        {/* Selector wariantów z ceną i zarządzaniem koszykiem */}
        <ProductVariantSelector product={product} />
        
        {/* Akcje społecznościowe */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
            {isLiked ? 'W ulubionych' : 'Ulubione'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Udostępnij
          </Button>
        </div>
        
        {/* Features */}
        <div className="space-y-3 border-t pt-6">
          <div className="flex items-center gap-3 text-sm">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <span>Darmowa dostawa od 200 zł</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <RotateCcw className="h-5 w-5 text-muted-foreground" />
            <span>30 dni na zwrot</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <span>2 lata gwarancji</span>
          </div>
        </div>
        
        {/* Product Details */}
        {product.description && (
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-foreground">
              Opis produktu
            </h3>
            <div className="prose prose-sm text-muted-foreground whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}
        
        {/* Specifications */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-semibold text-foreground">
            Specyfikacja
          </h3>
          <dl className="grid grid-cols-1 gap-2 text-sm">
            {product.material && (
              <>
                <dt className="font-medium text-foreground">Materiał:</dt>
                <dd className="text-muted-foreground mb-2">{product.material}</dd>
              </>
            )}
            {product.origin_country && (
              <>
                <dt className="font-medium text-foreground">Kraj pochodzenia:</dt>
                <dd className="text-muted-foreground mb-2">{product.origin_country}</dd>
              </>
            )}
            {product.weight && (
              <>
                <dt className="font-medium text-foreground">Waga:</dt>
                <dd className="text-muted-foreground mb-2">{product.weight}g</dd>
              </>
            )}
            {selectedVariant?.sku && (
              <>
                <dt className="font-medium text-foreground">SKU:</dt>
                <dd className="text-muted-foreground mb-2">{selectedVariant.sku}</dd>
              </>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
