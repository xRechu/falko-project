'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/context/cart-context';
import { useInventoryContext } from '@/lib/context/inventory-context';
import { usePricesContext } from '@/lib/context/prices-context';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { ProductDetail } from '@/lib/types/product';

interface ProductVariantSelectorProps {
  product: ProductDetail;
  className?: string;
}

export function ProductVariantSelector({ product, className }: ProductVariantSelectorProps) {
  const { state, addItemToCart, updateItemQuantity, removeItemFromCart } = useCart();
  const { isVariantAvailable, getVariantQuantity } = useInventoryContext();
  const { getPriceInCurrency, formatPrice: formatPriceFromContext } = usePricesContext();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
  const selectedPriceData = selectedVariant ? getPriceInCurrency(selectedVariant.id, 'pln') : null;
  
  // Znajdź produkt w koszyku
  const cartItem = state.cart?.items.find(item => item.variant_id === selectedVariantId);
  const quantity = cartItem?.quantity || 0;

  // Sprawdź dostępność przez InventoryContext
  const isInStock = selectedVariant ? isVariantAvailable(selectedVariant.id) : false;
  const inventoryQuantity = selectedVariant ? getVariantQuantity(selectedVariant.id) : 0;
  const stockInfo = isInStock ? (
    inventoryQuantity > 5 
      ? 'Dostępny' 
      : inventoryQuantity > 0
        ? `Ostatnie ${inventoryQuantity} sztuk`
        : 'Dostępny'
  ) : 'Wyprzedany';

  // Grupuj opcje (Color, Size, etc.)
  const optionGroups: Record<string, any[]> = {};

  // Przygotuj opcje - zbierz wszystkie opcje ze wszystkich wariantów
  product.variants.forEach(variant => {
    variant.options?.forEach(option => {
      const optionTitle = option.option?.title || 'Option';
      
      if (!optionGroups[optionTitle]) {
        optionGroups[optionTitle] = [];
      }
      
      // Sprawdź czy ta wartość już istnieje
      const existingValue = optionGroups[optionTitle].find(v => v.value === option.value);
      if (!existingValue) {
        optionGroups[optionTitle].push({
          value: option.value,
          variantIds: [variant.id],
        });
      } else {
        // Dodaj wariant do istniejącej wartości jeśli jeszcze go nie ma
        if (!existingValue.variantIds.includes(variant.id)) {
          existingValue.variantIds.push(variant.id);
        }
      }
    });
  });

  const handleAddToCart = async (qty = 1) => {
    if (isLoading || !selectedVariantId || !isInStock) return;
    
    setIsLoading(true);
    try {
      await addItemToCart(selectedVariantId, qty);
      
      toast.success('Produkt dodany do koszyka', {
        description: `${product.title} (${selectedVariant.title}) został dodany do koszyka`,
      });
    } catch (error) {
      console.error('Błąd dodawania do koszyka:', error);
      toast.error('Nie udało się dodać produktu do koszyka');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (isLoading || !cartItem) return;
    
    setIsLoading(true);
    try {
      if (newQuantity <= 0) {
        await removeItemFromCart(cartItem.id);
        toast.success('Produkt usunięty z koszyka');
      } else {
        await updateItemQuantity(cartItem.id, newQuantity);
        toast.success('Zaktualizowano ilość w koszyku');
      }
    } catch (error) {
      console.error('Błąd aktualizacji koszyka:', error);
      toast.error('Nie udało się zaktualizować koszyka');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = (optionTitle: string, value: string) => {
    // Znajdź wariant, który ma tę wartość opcji
    const newVariant = product.variants.find(variant => {
      const hasOption = variant.options?.some(option => 
        option.option?.title === optionTitle && option.value === value
      );
      return hasOption;
    });
    
    if (newVariant) {
      setSelectedVariantId(newVariant.id);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cena */}
      <div>
        <p className="text-3xl font-bold text-foreground">
          {selectedPriceData ? formatPriceFromContext(selectedPriceData) : 'Brak ceny'}
        </p>
      </div>

      {/* Status dostępności */}
      <div className="flex items-center gap-2">
        {isInStock ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600">{stockInfo}</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-red-600">{stockInfo}</span>
          </>
        )}
      </div>

      {/* Opcje wariantów */}
      {Object.entries(optionGroups).map(([optionTitle, values]) => (
        <div key={optionTitle}>
          <h3 className="text-sm font-medium uppercase tracking-wider text-foreground mb-3">
            {optionTitle}
          </h3>
          <div className="flex flex-wrap gap-2">
            {values.map((optionValue) => {
              const isSelected = selectedVariant?.options?.some(
                option => option.option?.title === optionTitle && option.value === optionValue.value
              );
              
              return (
                <Button
                  key={optionValue.value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleOptionChange(optionTitle, optionValue.value)}
                  className="min-w-[3rem]"
                >
                  {optionValue.value}
                </Button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Ilość i dodawanie do koszyka */}
      <div className="space-y-4">
        {quantity > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">W koszyku:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={isLoading}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-[2rem] text-center font-medium">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={isLoading || !isInStock}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => handleAddToCart(1)}
              disabled={isLoading || !isInStock}
            >
              <Plus className="mr-2 h-5 w-5" />
              Dodaj więcej do koszyka
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            className="w-full"
            onClick={() => handleAddToCart(1)}
            disabled={isLoading || !isInStock}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {isInStock ? 'Dodaj do koszyka' : 'Wyprzedany'}
          </Button>
        )}
      </div>
    </div>
  );
}
