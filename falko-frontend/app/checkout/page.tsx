import { Metadata } from 'next';
import { CheckoutPageClient } from '@/components/checkout/CheckoutPageClient';

export const metadata: Metadata = {
  title: 'Kasa - Falko Project',
  description: 'Finalizacja zamówienia w sklepie Falko Project',
};

/**
 * Strona checkout - finalizacja zamówienia
 * Server Component z delegacją do Client Component
 */
export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
