import { sdk, TokenManager, handleApiError, withRetry } from '@/lib/medusa-client';
import { ApiResponse } from './products';
import type { HttpTypes } from "@medusajs/types";

/**
 * API functions dla zarządzania koszykiem w Medusa.js 2.0 JS SDK
 * Używamy typów z @medusajs/types dla kompatybilności
 */

// Podstawowe typy requesta
export interface AddToCartRequest {
  variant_id: string;
  quantity: number;
  metadata?: Record<string, any>;
}

export interface UpdateCartItemRequest {
  quantity: number;
  metadata?: Record<string, any>;
}

export interface CreateCartRequest {
  region_id?: string;
  sales_channel_id?: string;
  country_code?: string;
  metadata?: Record<string, any>;
}

/**
 * API functions dla zarządzania koszykiem w Medusa.js
 */

/**
 * Tworzy nowy koszyk
 */
export async function createCart(data: CreateCartRequest = {}): Promise<ApiResponse<any>> {
  try {
    console.log('🔄 Creating new cart...');
    
    const response = await withRetry(async () => {
      return await sdk.store.cart.create({
        region_id: data.region_id || 'reg_01JZ0ACKJ42QHCZB0XFKBKNG8N' // ID regionu Polski
      });
    });

    console.log('✅ Cart created successfully:', response.cart.id);
    return { data: response.cart };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('❌ createCart error:', apiError);
    return { error: apiError };
  }
}

/**
 * Pobiera koszyk po ID
 */
export async function getCart(cartId: string): Promise<ApiResponse<any>> {
  try {
    console.log(`🔄 Fetching cart ${cartId}...`);
    
    const response = await withRetry(async () => {
      return await sdk.store.cart.retrieve(cartId);
    });

    console.log(`✅ Cart ${cartId} fetched successfully`);
    return { data: response.cart };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error(`❌ getCart error for ${cartId}:`, apiError);
    return { error: apiError };
  }
}

/**
 * Dodaje produkt do koszyka
 */
export async function addToCart(
  cartId: string, 
  item: AddToCartRequest
): Promise<ApiResponse<any>> {
  try {
    console.log(`🔄 Adding item to cart ${cartId}:`, item);
    
    const response = await withRetry(async () => {
      return await sdk.store.cart.createLineItem(cartId, {
        variant_id: item.variant_id,
        quantity: item.quantity,
      });
    });

    console.log(`✅ Item added to cart ${cartId}`, response);
    return { data: response.cart };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error(`❌ addToCart error for ${cartId}:`, apiError);
    console.error('Full error object:', error);
    return { error: apiError };
  }
}

/**
 * Aktualizuje ilość produktu w koszyku
 */
export async function updateCartItem(
  cartId: string,
  lineItemId: string,
  data: UpdateCartItemRequest
): Promise<ApiResponse<any>> {
  try {
    console.log(`🔄 Updating cart item ${lineItemId} in cart ${cartId}:`, data);
    
    const response = await withRetry(async () => {
      return await sdk.store.cart.updateLineItem(cartId, lineItemId, {
        quantity: data.quantity,
      });
    });

    console.log(`✅ Cart item ${lineItemId} updated`);
    return { data: response.cart };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error(`❌ updateCartItem error for ${lineItemId}:`, apiError);
    return { error: apiError };
  }
}

/**
 * Usuwa produkt z koszyka
 */
export async function removeFromCart(
  cartId: string,
  lineItemId: string
): Promise<ApiResponse<any>> {
  try {
    console.log(`🔄 Removing item ${lineItemId} from cart ${cartId}...`);
    
    const response = await withRetry(async () => {
      return await sdk.store.cart.deleteLineItem(cartId, lineItemId);
    });

    console.log(`✅ Item ${lineItemId} removed from cart`);
    console.log('Full response:', response);
    console.log('Response keys:', Object.keys(response));
    
    // DeleteLineItem zwraca pustą odpowiedź, pobierz koszyk ponownie
    console.log('🔄 Fetching cart after removal...');
    const cartResponse = await getCart(cartId);
    if (cartResponse.data) {
      return { data: cartResponse.data };
    } else {
      return { error: { message: 'Failed to fetch cart after removal' } };
    }
  } catch (error) {
    const apiError = handleApiError(error);
    console.error(`❌ removeFromCart error for ${lineItemId}:`, apiError);
    return { error: apiError };
  }
}

/**
 * Usuwa wszystkie produkty z koszyka
 */
export async function clearCart(cartId: string): Promise<ApiResponse<any>> {
  try {
    console.log(`🔄 Clearing cart ${cartId}...`);
    
    // Pobierz koszyk żeby zobaczyć wszystkie items
    const cartResponse = await getCart(cartId);
    if (!cartResponse.data) {
      return { error: { message: 'Cart not found' } };
    }

    // Usuń wszystkie items jeden po drugim
    let updatedCart = cartResponse.data;
    for (const item of updatedCart.items) {
      const removeResponse = await removeFromCart(cartId, item.id);
      if (removeResponse.data) {
        updatedCart = removeResponse.data;
      }
    }

    console.log(`✅ Cart ${cartId} cleared`);
    return { data: updatedCart };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error(`❌ clearCart error for ${cartId}:`, apiError);
    return { error: apiError };
  }
}

/**
 * Dodaje email do koszyka (dla gości)
 */
export async function setCartEmail(
  cartId: string, 
  email: string
): Promise<ApiResponse<any>> {
  try {
    console.log(`🔄 Setting email for cart ${cartId}: ${email}`);
    
    const response = await withRetry(async () => {
      return await sdk.store.cart.update(cartId, {
        email,
      });
    });

    console.log(`✅ Email set for cart ${cartId}`);
    return { data: response.cart };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error(`❌ setCartEmail error for ${cartId}:`, apiError);
    return { error: apiError };
  }
}

/**
 * Dodaje region do koszyka
 */
export async function setCartRegion(
  cartId: string, 
  regionId: string
): Promise<ApiResponse<any>> {
  try {
    console.log(`🔄 Setting region for cart ${cartId}: ${regionId}`);
    
    const response = await withRetry(async () => {
      return await sdk.store.cart.update(cartId, {
        region_id: regionId,
      });
    });

    console.log(`✅ Region set for cart ${cartId}`);
    return { data: response.cart };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error(`❌ setCartRegion error for ${cartId}:`, apiError);
    return { error: apiError };
  }
}

/**
 * Pobiera dostępne regiony
 */
export async function getRegions(): Promise<ApiResponse<any[]>> {
  try {
    console.log('🔄 Fetching regions...');
    
    const response = await withRetry(async () => {
      return await sdk.store.region.list();
    });

    console.log(`✅ Fetched ${response.regions.length} regions`);
    return { data: response.regions };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('❌ getRegions error:', apiError);
    return { error: apiError };
  }
}
