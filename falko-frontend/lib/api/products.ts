import { ProductPreview, ProductDetail } from "@/lib/types/product";
import { medusaClient, handleApiError, withRetry } from "@/lib/medusa-client";

/**
 * API Response wrapper dla lepszego error handling
 */
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    status?: number;
    code?: string;
  };
  loading?: boolean;
}

/**
 * Pobiera listę produktów z Medusa.js API
 * @param options - opcje zapytania (limit, offset, collection_id, etc.)
 * @returns Promise z listą produktów lub błędem
 */
export async function fetchProductsFromAPI(options: {
  limit?: number;
  offset?: number;
  collection_id?: string;
  handle?: string;
} = {}): Promise<ApiResponse<ProductPreview[]>> {
  try {
    console.log('🔄 Fetching products from Medusa API...');
    
    const response = await withRetry(async () => {
      return await medusaClient.products.list({
        limit: options.limit || 20,
        offset: options.offset || 0,
        collection_id: options.collection_id ? [options.collection_id] : undefined,
        handle: options.handle,
      });
    });

    // Przekształć dane Medusa na nasze typy
    const products: ProductPreview[] = response.products.map(product => {
      // Pierwszy wariant dla ceny i ID
      const firstVariant = product.variants?.[0];
      
      // Znajdź cenę w PLN z pierwszego wariantu
      const priceInPLN = firstVariant?.prices?.find(price => 
        price.currency_code?.toLowerCase() === 'pln'
      );

      return {
        id: product.id || '',
        title: product.title || '',
        handle: product.handle || '',
        thumbnail: product.thumbnail || product.images?.[0]?.url || undefined,
        price: priceInPLN ? {
          amount: priceInPLN.amount || 0,
          currency_code: priceInPLN.currency_code || 'PLN'
        } : undefined,
        collection: product.collection ? {
          id: product.collection.id,
          title: product.collection.title
        } : undefined,
        firstVariant: firstVariant && firstVariant.id ? {
          id: firstVariant.id,
          title: firstVariant.title || '',
          prices: firstVariant.prices?.map(price => ({
            id: price.id,
            currency_code: price.currency_code,
            amount: price.amount,
            min_quantity: price.min_quantity || undefined,
            max_quantity: price.max_quantity || undefined
          }))
        } : undefined,
        // Dodaj informację o ilości wariantów
        variantCount: product.variants?.length || 0
      };
    });

    console.log(`✅ Fetched ${products.length} products from Medusa API`);
    return { data: products };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error('❌ fetchProductsFromAPI error:', apiError);
    return { error: apiError };
  }
}

/**
 * Pobiera pojedynczy produkt po ID z Medusa.js API
 * @param productId - ID produktu
 * @returns Promise z ProductDetail lub błędem
 */
export async function fetchProductByIdFromAPI(productId: string): Promise<ApiResponse<ProductDetail>> {
  try {
    console.log(`🔄 Fetching product ${productId} from Medusa API...`);
    
    const response = await withRetry(async () => {
      return await medusaClient.products.retrieve(productId);
    });

    const productDetail = transformMedusaProductToDetail(response.product);
    
    console.log(`✅ Fetched product ${productId} from Medusa API`);
    return { data: productDetail };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error(`❌ fetchProductByIdFromAPI error for ${productId}:`, apiError);
    return { error: apiError };
  }
}

/**
 * Pobiera szczegółowy produkt po handle z Medusa.js API
 * @param handle - handle produktu (SEO-friendly identifier)
 * @returns Promise z ProductDetail lub błędem
 */
export async function fetchProductByHandleFromAPI(handle: string): Promise<ApiResponse<ProductDetail>> {
  try {
    console.log(`🔄 Fetching product by handle ${handle} from Medusa API...`);
    
    const response = await withRetry(async () => {
      return await medusaClient.products.list({ handle });
    });

    // W Medusa.js produkty są zwracane jako tablica, nawet dla pojedynczego handle
    const product = response.products?.find((p: any) => p.handle === handle);
    
    if (!product) {
      return { error: { message: 'Produkt nie znaleziony', status: 404 } };
    }

    const productDetail = transformMedusaProductToDetail(product);
    
    console.log(`✅ Fetched product by handle ${handle} from Medusa API`);
    return { data: productDetail };
  } catch (error) {
    const apiError = handleApiError(error);
    console.error(`❌ fetchProductByHandleFromAPI error for ${handle}:`, apiError);
    return { error: apiError };
  }
}

/**
 * Transformuje pełny obiekt produktu z Medusa.js na ProductDetail dla UI
 * @param medusaProduct - pełny produkt z Medusa API
 * @returns ProductDetail
 */
function transformMedusaProductToDetail(medusaProduct: any): ProductDetail {
  return {
    id: medusaProduct.id || '',
    title: medusaProduct.title || '',
    subtitle: medusaProduct.subtitle || undefined,
    description: medusaProduct.description || undefined,
    handle: medusaProduct.handle || '',
    thumbnail: medusaProduct.thumbnail || undefined,
    images: medusaProduct.images?.map((img: any) => ({
      id: img.id || '',
      product_id: medusaProduct.id || '',
      url: img.url || '',
      created_at: img.created_at ? new Date(img.created_at) : new Date(),
      updated_at: img.updated_at ? new Date(img.updated_at) : new Date(),
    })) || [],
    variants: medusaProduct.variants?.map((variant: any) => ({
      id: variant.id || '',
      title: variant.title || '',
      product_id: medusaProduct.id || '',
      sku: variant.sku || undefined,
      allow_backorder: variant.allow_backorder || false,
      manage_inventory: variant.manage_inventory || true,
      prices: variant.prices?.map((price: any) => ({
        id: price.id || '',
        currency_code: price.currency_code || 'pln',
        amount: price.amount || 0,
      })) || [],
      options: variant.options?.map((optionValue: any) => ({
        id: optionValue.id || '',
        value: optionValue.value || '',
        option_id: optionValue.option_id || '',
        option: optionValue.option ? {
          id: optionValue.option.id || '',
          title: optionValue.option.title || '',
          product_id: optionValue.option.product_id || medusaProduct.id || '',
          created_at: optionValue.option.created_at ? new Date(optionValue.option.created_at) : new Date(),
          updated_at: optionValue.option.updated_at ? new Date(optionValue.option.updated_at) : new Date(),
        } : undefined,
        created_at: optionValue.created_at ? new Date(optionValue.created_at) : new Date(),
        updated_at: optionValue.updated_at ? new Date(optionValue.updated_at) : new Date(),
      })) || [],
      created_at: variant.created_at ? new Date(variant.created_at) : new Date(),
      updated_at: variant.updated_at ? new Date(variant.updated_at) : new Date(),
    })) || [],
    collection: medusaProduct.collection ? {
      id: medusaProduct.collection.id || '',
      title: medusaProduct.collection.title || '',
      handle: medusaProduct.collection.handle || '',
      created_at: medusaProduct.collection.created_at ? new Date(medusaProduct.collection.created_at) : new Date(),
      updated_at: medusaProduct.collection.updated_at ? new Date(medusaProduct.collection.updated_at) : new Date(),
    } : undefined,
    material: medusaProduct.material || undefined,
    origin_country: medusaProduct.origin_country || undefined,
    weight: medusaProduct.weight || undefined,
    created_at: medusaProduct.created_at ? new Date(medusaProduct.created_at) : new Date(),
    updated_at: medusaProduct.updated_at ? new Date(medusaProduct.updated_at) : new Date(),
  };
}

/**
 * Cache utility dla produktów
 * Next.js 15 ma built-in caching, ale ta funkcja pozwala na większą kontrolę
 */
export const revalidateProducts = () => {
  // W przyszłości można dodać revalidation logic
  // np. revalidateTag('products') jeśli używamy tagged cache
};
