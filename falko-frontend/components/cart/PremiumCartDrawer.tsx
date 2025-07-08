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

  const formatPrice = (amount: number, currencyCode: string = 'PLN') => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount / 100);
  };

  const handleQuantityChange = async (lineItemId: string, newQuantity: number) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (newQuantity <= 0) {
        await removeItemFromCart(lineItemId);
        toast.success('Produkt usunięty z koszyka', {
          icon: '🗑️',
          style: {
            background: '#F3F4F6',
            color: '#1F2937',
            border: 'none',
          }
        });
      } else {
        await updateItemQuantity(lineItemId, newQuantity);
        toast.success('Zaktualizowano ilość', {
          icon: '✓',
          style: {
            background: '#F3F4F6',
            color: '#1F2937',
            border: 'none',
          }
        });
      }
    } catch (error) {
      console.error('Błąd aktualizacji koszyka:', error);
      toast.error('Nie udało się zaktualizować koszyka', {
        style: {
          background: '#FEF2F2',
          color: '#DC2626',
          border: 'none',
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCart = async () => {
    if (isLoading || !cart?.items.length) return;
    
    setIsLoading(true);
    try {
      await clearCartItems();
      toast.success('Koszyk został wyczyszczony', {
        icon: '🧹',
        style: {
          background: '#F3F4F6',
          color: '#1F2937',
          border: 'none',
        }
      });
    } catch (error) {
      console.error('Błąd czyszczenia koszyka:', error);
      toast.error('Nie udało się wyczyścić koszyka', {
        style: {
          background: '#FEF2F2',
          color: '#DC2626',
          border: 'none',
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const trigger = children || (
    <Button 
      variant="ghost" 
      size="sm" 
      className="relative group h-11 w-11 rounded-full bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 hover:scale-105"
    >
      <ShoppingCart className="h-5 w-5 text-gray-700 transition-transform group-hover:scale-110" />
      {itemCount > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-1 -right-1 bg-gradient-to-r from-gray-900 to-black text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg ring-2 ring-white"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </motion.div>
      )}
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full max-w-lg bg-gradient-to-br from-white via-gray-50/50 to-white backdrop-blur-xl border-none shadow-2xl overflow-hidden">
        {/* Elegant Header */}
        <SheetHeader className="relative pb-8 pt-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"
          />
          <SheetTitle className="flex items-center justify-between text-2xl font-light tracking-tight text-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Package className="h-5 w-5 text-gray-600" />
              </div>
              <span>Koszyk</span>
            </div>
            {itemCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClearCart}
                disabled={isLoading}
                className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors duration-200 px-3 py-1 rounded-full hover:bg-red-50"
              >
                Wyczyść
              </motion.button>
            )}
          </SheetTitle>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-gray-500 font-light"
          >
            {itemCount === 0 ? 'Brak produktów' : 
             itemCount === 1 ? '1 produkt' : 
             itemCount < 5 ? `${itemCount} produkty` : 
             `${itemCount} produktów`}
          </motion.p>
        </SheetHeader>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {cartLoading ? (
            <div className="flex items-center justify-center h-80">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full"
              />
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center h-80 text-center px-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mb-8 shadow-inner"
              >
                <ShoppingCart className="h-12 w-12 text-gray-300" />
              </motion.div>
              <motion.h3 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-light text-gray-900 mb-3"
              >
                Pusty koszyk
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs"
              >
                Odkryj naszą wyjątkową kolekcję i dodaj swoje ulubione produkty
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={() => setIsOpen(false)}
                  className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-full font-medium transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  Odkryj kolekcję
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <div className="space-y-6 py-2">
              <AnimatePresence mode="popLayout">
                {cart.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.05,
                      layout: { duration: 0.3 }
                    }}
                    className="group relative"
                  >
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-sm border border-gray-100/50 hover:shadow-md hover:border-gray-200/50 transition-all duration-300">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 shadow-sm">
                          {item.thumbnail ? (
                            <Image
                              src={item.thumbnail}
                              alt={item.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-xl" />
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-gray-900 text-sm leading-tight">
                                {item.title}
                              </h4>
                              {item.variant?.title && (
                                <p className="text-xs text-gray-500 mt-1 font-light">
                                  {item.variant.title}
                                </p>
                              )}
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleQuantityChange(item.id, 0)}
                              disabled={isLoading}
                              className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </motion.button>
                          </div>
                          
                          {/* Quantity Controls & Price */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={isLoading || item.quantity <= 1}
                                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                              >
                                <Minus className="h-3 w-3 text-gray-600" />
                              </motion.button>
                              
                              <span className="text-sm font-medium min-w-[2rem] text-center bg-gradient-to-r from-gray-50 to-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                                {item.quantity}
                              </span>
                              
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={isLoading}
                                className="h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
                              >
                                <Plus className="h-3 w-3 text-gray-600" />
                              </motion.button>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                {formatPrice(item.total, cart.region?.currency_code)}
                              </p>
                              <p className="text-xs text-gray-500 font-light">
                                {formatPrice(item.unit_price, cart.region?.currency_code)} × {item.quantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Premium Checkout Section */}
        {cart && cart.items.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative mt-6"
          >
            {/* Subtle gradient separator */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            
            <div className="bg-white/80 backdrop-blur-sm rounded-t-3xl p-6 space-y-6">
              {/* Trust indicators - minimalist style */}
              <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="font-light">Bezpieczne</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="font-light">Szybka dostawa</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-purple-400 rounded-full" />
                  <span className="font-light">Gwarancja</span>
                </div>
              </div>

              {/* Order summary - clean and spacious */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-light">Produkty</span>
                  <span className="font-medium">{formatPrice(cart.subtotal, cart.region?.currency_code)}</span>
                </div>
                
                {cart.tax_total > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-light">Podatek</span>
                    <span className="font-medium">{formatPrice(cart.tax_total, cart.region?.currency_code)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-light">Dostawa</span>
                  <span className="font-medium text-green-600">Gratis</span>
                </div>
                
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4" />
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-light text-gray-900">Razem</span>
                  <span className="text-2xl font-light text-gray-900 tracking-tight">
                    {formatPrice(cart.total, cart.region?.currency_code)}
                  </span>
                </div>
              </div>
              
              {/* Action buttons - Apple-inspired */}
              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    asChild 
                    className="w-full bg-gray-900 hover:bg-black text-white rounded-2xl py-4 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                    size="lg"
                  >
                    <Link href="/checkout" onClick={() => setIsOpen(false)}>
                      <div className="flex items-center justify-center gap-3">
                        <CreditCard className="h-5 w-5" />
                        <span>Przejdź do płatności</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </Link>
                  </Button>
                </motion.div>
                
                <Button
                  variant="ghost"
                  className="w-full rounded-2xl py-4 text-base font-light text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Kontynuuj zakupy
                </Button>
              </div>

              {/* Satisfaction guarantee - subtle */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-xs text-gray-500 font-light">
                  30-dniowa gwarancja zwrotu
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  );
}
