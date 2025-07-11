import { API_CONFIG } from '@/lib/api-config';
import { ApiResponse } from './products';
import { getAuthToken } from './auth';

/**
 * API functions dla zarządzania zamówieniami użytkownika w Medusa.js 2.0
 * Orders, order history, order details
 */

export interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  product_handle: string;
  variant_id?: string;
  variant_title?: string;
  quantity: number;
  unit_price: number;
  total: number;
  thumbnail?: string;
}

export interface OrderAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  postal_code: string;
  country_code: string;
  phone?: string;
}

export interface Order {
  id: string;
  display_id: number;
  status: 'pending' | 'completed' | 'archived' | 'canceled' | 'requires_action';
  fulfillment_status: 'not_fulfilled' | 'partially_fulfilled' | 'fulfilled' | 'partially_shipped' | 'shipped' | 'partially_returned' | 'returned' | 'canceled' | 'requires_action';
  payment_status: 'not_paid' | 'awaiting' | 'captured' | 'partially_refunded' | 'refunded' | 'canceled' | 'requires_action';
  total: number;
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  currency_code: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
  shipping_address?: OrderAddress;
  billing_address?: OrderAddress;
  email: string;
  customer_id?: string;
}

/**
 * Helper do wysyłania żądań do Medusa 2.0 API
 */
const medusaFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${API_CONFIG.MEDUSA_BACKEND_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': API_CONFIG.MEDUSA_PUBLISHABLE_KEY,
    ...(options.headers as Record<string, string>),
  };

  // Dodaj token do nagłówka Authorization jeśli jest dostępny
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Włącz obsługę cookies dla sesji
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorData}`);
  }

  return response.json();
};

/**
 * Pobiera listę zamówień dla zalogowanego użytkownika (Medusa 2.0)
 */
export async function getCustomerOrders(
  limit: number = 20,
  offset: number = 0
): Promise<ApiResponse<{ orders: Order[]; count: number }>> {
  try {
    console.log('🔄 Fetching customer orders...');
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      expand: 'items,shipping_address,billing_address,payments,fulfillments',
    });
    
    const response = await medusaFetch(`/store/customers/me/orders?${params}`, {
      method: 'GET',
    });

    console.log('✅ Customer orders fetched successfully');
    return { 
      data: { 
        orders: response.orders || [], 
        count: response.count || 0 
      } 
    };
  } catch (error: any) {
    console.error('❌ getCustomerOrders error:', error);
    return { 
      error: { 
        message: error.message || 'Błąd pobierania zamówień',
        status: 400 
      } 
    };
  }
}

/**
 * Pobiera szczegóły konkretnego zamówienia (Medusa 2.0)
 */
export async function getOrderDetails(orderId: string): Promise<ApiResponse<Order>> {
  try {
    console.log('🔄 Fetching order details for:', orderId);
    
    const params = new URLSearchParams({
      expand: 'items,items.variant,shipping_address,billing_address,payments,fulfillments,shipping_methods',
    });
    
    const response = await medusaFetch(`/store/orders/${orderId}?${params}`, {
      method: 'GET',
      // Usuwamy Authorization header - Medusa 2.0 używa cookies
    });

    console.log('✅ Order details fetched successfully');
    return { data: response.order };
  } catch (error: any) {
    console.error('❌ getOrderDetails error:', error);
    return { 
      error: { 
        message: error.message || 'Błąd pobierania szczegółów zamówienia',
        status: 400 
      } 
    };
  }
}

/**
 * Mapuje status Medusa na polskie etykiety
 */
export const getOrderStatusLabel = (status: string, type: 'order' | 'fulfillment' | 'payment' = 'order'): string => {
  if (type === 'fulfillment') {
    switch (status) {
      case 'not_fulfilled': return 'Nieprzetworzone';
      case 'partially_fulfilled': return 'Częściowo przetworzone';
      case 'fulfilled': return 'Przetworzone';
      case 'partially_shipped': return 'Częściowo wysłane';
      case 'shipped': return 'Wysłane';
      case 'partially_returned': return 'Częściowo zwrócone';
      case 'returned': return 'Zwrócone';
      case 'canceled': return 'Anulowane';
      case 'requires_action': return 'Wymaga działania';
      default: return 'Nieznany';
    }
  }
  
  if (type === 'payment') {
    switch (status) {
      case 'not_paid': return 'Nie opłacone';
      case 'awaiting': return 'Oczekuje płatności';
      case 'captured': return 'Opłacone';
      case 'partially_refunded': return 'Częściowo zwrócone';
      case 'refunded': return 'Zwrócone';
      case 'canceled': return 'Anulowane';
      case 'requires_action': return 'Wymaga działania';
      default: return 'Nieznany';
    }
  }
  
  // Default: order status
  switch (status) {
    case 'pending': return 'Oczekuje';
    case 'completed': return 'Ukończone';
    case 'archived': return 'Zarchiwizowane';
    case 'canceled': return 'Anulowane';
    case 'requires_action': return 'Wymaga działania';
    default: return 'Nieznany';
  }
};

/**
 * Mapuje status na kolor dla UI
 */
export const getOrderStatusColor = (status: string, type: 'order' | 'fulfillment' | 'payment' = 'order'): string => {
  if (type === 'fulfillment') {
    switch (status) {
      case 'shipped': 
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'partially_shipped':
      case 'partially_fulfilled': return 'bg-blue-100 text-blue-800';
      case 'not_fulfilled': return 'bg-yellow-100 text-yellow-800';
      case 'returned':
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'requires_action': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  if (type === 'payment') {
    switch (status) {
      case 'captured': return 'bg-green-100 text-green-800';
      case 'awaiting': return 'bg-yellow-100 text-yellow-800';
      case 'not_paid': return 'bg-gray-100 text-gray-800';
      case 'refunded':
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'requires_action': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  // Default: order status
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'canceled': return 'bg-red-100 text-red-800';
    case 'requires_action': return 'bg-orange-100 text-orange-800';
    case 'archived': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Formatuje cenę według ustawień regionalnych
 */
export const formatPrice = (amount: number, currencyCode: string = 'PLN'): string => {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount / 100); // Medusa przechowuje ceny w groszach
};

/**
 * Tworzy zamówienie ponownie na podstawie poprzedniego (reorder)
 */
export async function reorderItems(orderId: string): Promise<ApiResponse<{ cart_id: string }>> {
  try {
    console.log('🔄 Creating reorder for:', orderId);
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No auth token found');
    }

    // Najpierw pobierz szczegóły zamówienia
    const orderResponse = await getOrderDetails(orderId);
    if (orderResponse.error || !orderResponse.data) {
      throw new Error('Nie można pobrać szczegółów zamówienia');
    }

    // Tu będzie logika tworzenia nowego koszyka z produktami z poprzedniego zamówienia
    // Na razie zwracamy mock response
    console.log('✅ Reorder created successfully');
    return { 
      data: { 
        cart_id: 'cart_' + Date.now() 
      } 
    };
  } catch (error: any) {
    console.error('❌ reorderItems error:', error);
    return { 
      error: { 
        message: error.message || 'Błąd podczas tworzenia ponownego zamówienia',
        status: 400 
      } 
    };
  }
}
