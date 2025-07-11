'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  X, 
  ArrowLeft,
  MapPin,
  CreditCard,
  FileText,
  Download
} from 'lucide-react';
import Image from 'next/image';

/**
 * Komponent do wyświetlania szczegółów zamówienia
 * Premium design z timeline statusu zamówienia
 */

interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  product_handle: string;
  variant_title?: string;
  quantity: number;
  unit_price: number;
  total: number;
  image_url?: string;
}

interface OrderDetails {
  id: string;
  number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  created_at: string;
  updated_at: string;
  tracking_number?: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
  billing_address: {
    first_name: string;
    last_name: string;
    address_1: string;
    address_2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
  payment_method: string;
  items: OrderItem[];
  timeline: Array<{
    status: string;
    timestamp: string;
    description: string;
  }>;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetails | null;
}

export function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'Dostarczone';
      case 'shipped': return 'Wysłane';
      case 'processing': return 'W realizacji';
      case 'pending': return 'Oczekuje';
      case 'cancelled': return 'Anulowane';
      default: return 'Nieznany';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return CheckCircle;
      case 'shipped': return Truck;
      case 'processing': return Package;
      case 'pending': return Clock;
      case 'cancelled': return X;
      default: return Clock;
    }
  };

  const formatAddress = (address: OrderDetails['shipping_address']) => {
    const parts = [
      `${address.first_name} ${address.last_name}`,
      address.address_1,
      address.address_2,
      `${address.postal_code} ${address.city}`,
      address.country
    ].filter(Boolean);
    return parts.join('\n');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl my-8 bg-white">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h3 className="text-xl font-semibold">Zamówienie {order.number}</h3>
                <p className="text-sm text-gray-600">
                  Złożone {formatDate(order.created_at)}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Order Timeline */}
          <div>
            <h4 className="font-semibold mb-4">Status zamówienia</h4>
            <div className="space-y-4">
              {order.timeline.map((event, index) => {
                const StatusIcon = getStatusIcon(event.status);
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <StatusIcon className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{event.description}</p>
                      <p className="text-sm text-gray-600">{formatDate(event.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tracking Information */}
          {order.tracking_number && (
            <div>
              <h4 className="font-semibold mb-3">Informacje o przesyłce</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Numer przesyłki: {order.tracking_number}</span>
                </div>
                <Button variant="outline" size="sm">
                  Śledź przesyłkę
                </Button>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h4 className="font-semibold mb-4">Produkty w zamówieniu</h4>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {item.image_url && (
                      <Image
                        src={item.image_url}
                        alt={item.product_title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium">{item.product_title}</h5>
                    {item.variant_title && (
                      <p className="text-sm text-gray-600">{item.variant_title}</p>
                    )}
                    <p className="text-sm text-gray-600">Ilość: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.total.toFixed(2)} zł</p>
                    <p className="text-sm text-gray-600">{item.unit_price.toFixed(2)} zł/szt.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h4 className="font-semibold mb-4">Podsumowanie zamówienia</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Produkty:</span>
                <span>{order.subtotal.toFixed(2)} zł</span>
              </div>
              <div className="flex justify-between">
                <span>Dostawa:</span>
                <span>{order.shipping_cost.toFixed(2)} zł</span>
              </div>
              <div className="flex justify-between">
                <span>Podatek:</span>
                <span>{order.tax_amount.toFixed(2)} zł</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Razem:</span>
                <span>{order.total.toFixed(2)} zł</span>
              </div>
            </div>
          </div>

          {/* Addresses & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Address */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adres wysyłki
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-line font-sans">
                  {formatAddress(order.shipping_address)}
                </pre>
              </div>
            </div>

            {/* Billing Address */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Adres rozliczeniowy
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-line font-sans">
                  {formatAddress(order.billing_address)}
                </pre>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Metoda płatności
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-sm">{order.payment_method}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex gap-3 justify-end">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Pobierz fakturę
            </Button>
            {order.status === 'delivered' && (
              <Button>
                Zamów ponownie
              </Button>
            )}
            {order.status === 'pending' && (
              <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                Anuluj zamówienie
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
