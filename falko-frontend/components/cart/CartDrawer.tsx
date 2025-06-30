'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/lib/context/cart-context';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';

interface CartDrawerProps {
  children?: React.ReactNode;
}

export function CartDrawer({ children }: CartDrawerProps) {
  const { state, updateItemQuantity, removeItemFromCart, clearCartItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { cart, isLoading: cartLoading } = state;
  const itemCount = cart?.item_count || 0;

  const handleQuantityChange = async (lineItemId: string, newQuantity: number) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (newQuantity <= 0) {
        await removeItemFromCart(lineItemId);
        toast.success('Produkt usunięty z koszyka');
      } else {
        await updateItemQuantity(lineItemId, newQuantity);
        toast.success('Zaktualizowano ilość');
      }
    } catch (error) {
      console.error('Błąd aktualizacji koszyka:', error);
      toast.error('Nie udało się zaktualizować koszyka');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (isLoading || !cart?.items.length) return;
    
    setIsLoading(true);
    try {
      await clearCartItems();
      toast.success('Koszyk został wyczyszczony');
    } catch (error) {
      console.error('Błąd czyszczenia koszyka:', error);
      toast.error('Nie udało się wyczyścić koszyka');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: cart?.region?.currency_code || 'PLN',
    }).format(price / 100);
  };

  const trigger = children || (
    <Button variant="outline" size="sm" className="relative">
      <ShoppingCart className="h-4 w-4" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Koszyk ({itemCount})</span>
            {itemCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                disabled={isLoading}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {cartLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Twój koszyk jest pusty</p>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="mt-4"
              >
                Kontynuuj zakupy
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-3 py-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm truncate">
                          {item.title}
                        </h4>
                        {item.variant?.title && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.variant.title}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, 0)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={isLoading || item.quantity <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={isLoading}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatPrice(item.total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.unit_price)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart && cart.items.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Suma częściowa:</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                {cart.tax_total > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Podatek:</span>
                    <span>{formatPrice(cart.tax_total)}</span>
                  </div>
                )}
                {cart.shipping_total > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Dostawa:</span>
                    <span>{formatPrice(cart.shipping_total)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Razem:</span>
                  <span>{formatPrice(cart.total)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout" onClick={() => setIsOpen(false)}>
                    Przejdź do kasy
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Kontynuuj zakupy
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
