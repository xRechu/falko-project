'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/context/cart-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { CheckoutForm } from './CheckoutForm';
import { OrderSummary } from './OrderSummary';

/**
 * Główny komponent strony checkout dla Falko Project
 * Premium, minimalistyczny design z pełną funkcjonalnością e-commerce
 */
export function CheckoutPageClient() {
  const { state } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'payment' | 'confirmation'>('form');

  const { cart, isLoading } = state;

  // Redirect jeśli koszyk jest pusty
  useEffect(() => {
    if (!isLoading && (!cart || cart.items.length === 0)) {
      toast.error('Koszyk jest pusty');
      router.push('/sklep');
    }
  }, [cart, isLoading, router]);

  const handleFormSubmit = async (formData: any) => {
    setIsProcessing(true);
    try {
      // TODO: Implementacja finalizacji zamówienia z Medusa.js
      console.log('Processing order:', formData);
      
      // Symulacja procesu płatności
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCurrentStep('confirmation');
      toast.success('Zamówienie zostało złożone!');
    } catch (error) {
      console.error('Błąd podczas składania zamówienia:', error);
      toast.error('Wystąpił błąd podczas składania zamówienia');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return null; // useEffect will redirect
  }

  if (currentStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dziękujemy za zamówienie!
              </h1>
              <p className="text-gray-600">
                Twoje zamówienie zostało przyjęte i jest przetwarzane
              </p>
            </div>
            
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Szczegóły zamówienia</h2>
              <div className="text-left space-y-2">
                <div className="flex justify-between">
                  <span>Numer zamówienia:</span>
                  <span className="font-mono">#FP{Date.now().toString().slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="outline" className="text-green-600">
                    Przyjęte
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Przewidywana dostawa:</span>
                  <span>3-5 dni roboczych</span>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/">
                  Powrót na stronę główną
                </Link>
              </Button>
              <br />
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/sklep">
                  Kontynuuj zakupy
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Finalizacja zamówienia</h1>
              <p className="text-gray-600 text-sm">
                Krok {currentStep === 'form' ? '1' : '2'} z 2
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <CheckoutForm 
              onSubmit={handleFormSubmit}
              isProcessing={isProcessing}
            />
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <OrderSummary cart={cart} />
              
              {/* Trust Badges */}
              <Card className="p-4 mt-6">
                <h3 className="font-semibold mb-4 text-center">
                  Bezpieczne zakupy
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <span className="text-xs text-gray-600">
                      Bezpieczne płatności
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Truck className="h-6 w-6 text-green-600" />
                    <span className="text-xs text-gray-600">
                      Szybka dostawa
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <CreditCard className="h-6 w-6 text-purple-600" />
                    <span className="text-xs text-gray-600">
                      Różne metody płatności
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
