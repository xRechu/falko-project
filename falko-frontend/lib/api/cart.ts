import { medusaClient, handleApiError, withRetry } from '@/lib/medusa-client';
import { ApiResponse } from './products';

/**
 * API functions dla zarządzania koszykiem w Medusa.js
 * Używamy typów z @medusajs/medusa-js dla kompatybilności
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
      return await medusaClient.carts.create({
        country_code: data.country_code || 'PL',
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
      return await medusaClient.carts.retrieve(cartId);
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
      return await medusaClient.carts.lineItems.create(cartId, {
        variant_id: item.variant_id,
        quantity: item.quantity,
      });
    });

    console.log(`✅ Item added to cart ${cartId}`);
    return { data: response.cart };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error(`❌ addToCart error for ${cartId}:`, apiError);
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
      return await medusaClient.carts.lineItems.update(cartId, lineItemId, {
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
      return await medusaClient.carts.lineItems.delete(cartId, lineItemId);
    });

    console.log(`✅ Item ${lineItemId} removed from cart`);
    return { data: response.cart };
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
      return await medusaClient.carts.update(cartId, {
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
      return await medusaClient.carts.update(cartId, {
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
      return await medusaClient.regions.list();
    });

    console.log(`✅ Fetched ${response.regions.length} regions`);
    return { data: response.regions };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('❌ getRegions error:', apiError);
    return { error: apiError };
  }
}
