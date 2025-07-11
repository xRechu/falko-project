import Medusa from "@medusajs/js-sdk";
import { API_CONFIG } from "./api-config";

// Debug log - sprawdź czy plik jest w ogóle ładowany
console.log('🚀 medusa-client.ts loading...');
console.log('📋 API_CONFIG:', API_CONFIG);

// Force inicjalizacja na starcie aplikacji
if (typeof window !== 'undefined') {
  console.log('🌐 Browser environment detected, initializing SDK...');
}

/**
 * Medusa.js 2.0 JS SDK client dla komunikacji z backend API
 * Używa endpointu z .env.local (domyślnie http://localhost:9000)
 * 
 * UWAGA: Ten klient automatycznie zarządza autoryzacją (JWT tokens)
 * Po zalogowaniu przez sdk.auth.login(), wszystkie kolejne requesty
 * będą automatycznie uwierzytelnianie.
 */
export const sdk = new Medusa({
  baseUrl: API_CONFIG.MEDUSA_BACKEND_URL,
  publishableKey: API_CONFIG.MEDUSA_PUBLISHABLE_KEY,
  debug: process.env.NODE_ENV === 'development',
  auth: {
    type: "jwt", // Używamy JWT dla Next.js storefront
    jwtTokenStorageMethod: "session", // Zmiana na session dla lepszej kompatybilności
    jwtTokenStorageKey: "medusa_auth_token",
  },
});

// Helper do ręcznego zarządzania tokenami w localStorage
export const TokenManager = {
  save: (token: string, rememberMe: boolean = false) => {
    if (typeof window !== 'undefined') {
      const storage = rememberMe ? localStorage : sessionStorage;
      console.log('💾 [TokenManager.save] Saving token to', rememberMe ? 'localStorage' : 'sessionStorage');
      console.log('💾 [TokenManager.save] Token length:', token.length);
      console.log('💾 [TokenManager.save] Token preview:', token.substring(0, 20) + '...');
      
      storage.setItem('medusa_auth_token', token);
      
      // Weryfikuj czy token został zapisany
      const saved = storage.getItem('medusa_auth_token');
      console.log('💾 [TokenManager.save] Verification - saved token:', saved ? `${saved.substring(0, 20)}...` : 'null');
      console.log('💾 [TokenManager.save] Save successful:', !!saved && saved === token);
    } else {
      console.error('💾 [TokenManager.save] Window not available - cannot save token');
    }
  },
  
  get: () => {
    if (typeof window !== 'undefined') {
      const localToken = localStorage.getItem('medusa_auth_token');
      const sessionToken = sessionStorage.getItem('medusa_auth_token');
      
      console.log('🔍 [TokenManager.get] Checking storage:');
      console.log('  - localStorage:', localToken ? `${localToken.substring(0, 20)}...` : 'null');
      console.log('  - sessionStorage:', sessionToken ? `${sessionToken.substring(0, 20)}...` : 'null');
      
      const token = localToken || sessionToken;
      console.log('  - returning:', token ? `${token.substring(0, 20)}...` : 'null');
      
      return token;
    }
    console.log('🔍 [TokenManager.get] Window not available, returning null');
    return null;
  },
  
  remove: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('medusa_auth_token');
      sessionStorage.removeItem('medusa_auth_token');
      console.log('🗑️ Token removed from storage');
    }
  },
  
  // Ustawia token w SDK dla kolejnych requestów
  setInSDK: (token: string) => {
    if (token) {
      // Próbujemy różne sposoby ustawienia tokena w SDK
      try {
        // Metoda 1: Ręcznie ustawiamy authorization header w SDK
        if ((sdk as any)._client) {
          (sdk as any)._client.config = {
            ...((sdk as any)._client.config || {}),
            headers: {
              ...((sdk as any)._client.config?.headers || {}),
              'Authorization': `Bearer ${token}`
            }
          };
        }
        
        // Metoda 2: Spróbuj ustawić token w auth storage SDK
        if ((sdk as any).auth && (sdk as any).auth.storage) {
          (sdk as any).auth.storage.setItem('medusa_auth_token', token);
        }
        
        console.log('🔑 Token set in SDK headers');
      } catch (error) {
        console.error('❌ Failed to set token in SDK:', error);
      }
    }
  },
  
  // Inicjalizuj token z storage przy starcie
  initFromStorage: () => {
    const token = TokenManager.get();
    if (token) {
      TokenManager.setInSDK(token);
      console.log('🔄 Token loaded from storage and set in SDK');
      return token;
    }
    return null;
  }
};

console.log('🔧 Medusa JS SDK config:', {
  baseUrl: API_CONFIG.MEDUSA_BACKEND_URL,
  publishableKey: API_CONFIG.MEDUSA_PUBLISHABLE_KEY ? API_CONFIG.MEDUSA_PUBLISHABLE_KEY.substring(0, 10) + '...' : 'NOT SET',
  authType: 'jwt',
  debug: process.env.NODE_ENV === 'development'
});

// Eksportuj też stary alias dla kompatybilności
export const medusaClient = sdk;

/**
 * Helper do obsługi błędów API - kompatybilny z JS SDK
 */
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const handleApiError = (error: any): ApiError => {
  console.error('Medusa JS SDK Error:', error);
  
  // JS SDK rzuca FetchError objects
  if (error?.status && error?.message) {
    return {
      message: error.message,
      status: error.status,
      code: error.statusText,
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
