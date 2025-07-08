import Medusa from "@medusajs/medusa-js";
import { API_CONFIG } from "./api-config";

/**
 * Singleton Medusa.js client dla komunikacji z backend API
 * Używa endpointu z .env.local (domyślnie http://localhost:9000)
 */
export const medusaClient = new Medusa({
  baseUrl: API_CONFIG.MEDUSA_BACKEND_URL,
  maxRetries: 3,
  publishableApiKey: API_CONFIG.MEDUSA_PUBLISHABLE_KEY,
});

console.log('🔧 Medusa client config:', {
  baseUrl: API_CONFIG.MEDUSA_BACKEND_URL,
  publishableApiKey: API_CONFIG.MEDUSA_PUBLISHABLE_KEY ? API_CONFIG.MEDUSA_PUBLISHABLE_KEY.substring(0, 10) + '...' : 'NOT SET',
  fullKey: API_CONFIG.MEDUSA_PUBLISHABLE_KEY
});

/**
 * Helper do obsługi błędów API
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const handleApiError = (error: any): ApiError => {
  console.error('Medusa API Error:', error);
  
  if (error?.response?.data?.message) {
    return {
      message: error.response.data.message,
      status: error.response.status,
      code: error.response.data.code,
    };
  }
  
  if (error?.message) {
    return {
      message: error.message,
      status: error?.status,
    };
  }
  
  return {
    message: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
    status: 500,
  };
};

/**
 * Helper do retry logic
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        continue;
      }
    }
  }
  
  throw lastError;
};
