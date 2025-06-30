'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/context/cart-context';
import { useInventoryContext } from '@/lib/context/inventory-context';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { ProductPreview } from '@/lib/types/product';
import Link from 'next/link';

interface AddToCartButtonProps {
  product: ProductPreview;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showQuantity?: boolean;
  // Opcjonalne - jeśli nie podane, obliczane automatycznie
  requiresVariantSelection?: boolean; // Czy produkt ma wiele wariantów
  isInStock?: boolean; // Czy wariant jest dostępny
}

export function AddToCartButton({
  product,
  variant = 'default',
  size = 'default',
  className,
  showQuantity = false,
  requiresVariantSelection,
  isInStock,
}: AddToCartButtonProps) {
  const { state, addItemToCart } = useCart();
  const { isVariantAvailable } = useInventoryContext();
  const [isLoading, setIsLoading] = useState(false);
  
  // Użyj ID pierwszego wariantu jeśli dostępny, inaczej ID produktu jako fallback  
  const variantId = product.firstVariant?.id || product.id;
  
  // Oblicz czy wymaga wyboru wariantu (jeśli nie podano explicite)
  const needsVariantSelection = requiresVariantSelection ?? ((product.variantCount && product.variantCount > 1) || false);
  
  // Sprawdź dostępność (z parametru lub z inventory context)
  const variantInStock = isInStock ?? (product.firstVariant ? isVariantAvailable(product.firstVariant.id) : false);
  
  // Znajdź produkt w koszyku (szukaj po variant_id)
  const cartItem = state.cart?.items.find(item => item.variant_id === variantId);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isLoading || !variantInStock) return;
    
    setIsLoading(true);
    try {
      await addItemToCart(variantId, 1);
      
      toast.success('Produkt dodany do koszyka', {
        description: `${product.title} został dodany do koszyka`,
      });
    } catch (error) {
      console.error('Błąd dodawania do koszyka:', error);
      toast.error('Nie udało się dodać produktu do koszyka');
    } finally {
      setIsLoading(false);
    }
  };

  // Jeśli produkt wymaga wyboru wariantu, pokaż przycisk "Zobacz opcje"
  if (needsVariantSelection) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = `/products/${product.handle}`;
        }}
      >
        Zobacz opcje
      </Button>
    );
  }

  // Jeśli produkt nie jest dostępny
  if (!variantInStock) {
    return (
      <Button
        variant="outline"
        size={size}
        className={className}
        disabled
      >
        Wyprzedany
      </Button>
    );
  }

  // Tymczasowo wyłączamy funkcjonalność quantity - zaimplementujemy ją w kolejnym kroku
  if (showQuantity && quantity > 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">W koszyku: {quantity}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddToCart}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-1" />
          Dodaj więcej
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAddToCart}
      disabled={isLoading}
      className={className}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isLoading ? 'Dodawanie...' : 'Dodaj do koszyka'}
    </Button>
  );
}
