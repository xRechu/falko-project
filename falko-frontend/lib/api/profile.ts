import { API_CONFIG } from '@/lib/api-config';
import { ApiResponse } from './products';

/**
 * Helper funkcja do pobierania tokena z storage
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Sprawdź najpierw sessionStorage, potem localStorage
  const sessionToken = sessionStorage.getItem('auth_token');
  const localToken = localStorage.getItem('auth_token');
  
  console.log('🔍 Checking tokens:', {
    sessionToken: sessionToken ? `${sessionToken.substring(0, 10)}...` : null,
    localToken: localToken ? `${localToken.substring(0, 10)}...` : null
  });
  
  return sessionToken || localToken;
};

/**
 * API functions dla zarządzania profilem użytkownika w Medusa.js 2.0
 * Customer profile, password management
 */

export interface CustomerProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  has_account: boolean;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

/**
 * Helper do wysyłania żądań do Medusa 2.0 API
 */
const medusaFetch = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const url = `${API_CONFIG.MEDUSA_BACKEND_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'x-publishable-api-key': API_CONFIG.MEDUSA_PUBLISHABLE_KEY,
    ...options.headers,
  };

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
 * Pobiera profil zalogowanego użytkownika (Medusa 2.0)
 */
export async function getCustomerProfile(): Promise<ApiResponse<CustomerProfile>> {
  try {
    console.log('🔄 Fetching customer profile...');
    
    const response = await medusaFetch('/store/customers/me', {
      method: 'GET',
      // Usuwamy Authorization header - Medusa 2.0 używa cookies
    });

    console.log('✅ Customer profile fetched successfully');
    return { data: response.customer };
  } catch (error: any) {
    console.error('❌ getCustomerProfile error:', error);
    return { 
      error: { 
        message: error.message || 'Błąd pobierania profilu',
        status: 400 
      } 
    };
  }
}

/**
 * Aktualizuje profil zalogowanego użytkownika (Medusa 2.0)
 */
export async function updateCustomerProfile(
  updates: UpdateProfileRequest
): Promise<ApiResponse<CustomerProfile>> {
  try {
    console.log('🔄 Updating customer profile...');
    
    const response = await medusaFetch('/store/customers/me', {
      method: 'POST',
      // Usuwamy Authorization header - Medusa 2.0 używa cookies
      body: JSON.stringify(updates),
    });

    console.log('✅ Customer profile updated successfully');
    return { data: response.customer };
  } catch (error: any) {
    console.error('❌ updateCustomerProfile error:', error);
    return { 
      error: { 
        message: error.message || 'Błąd aktualizacji profilu',
        status: 400 
      } 
    };
  }
}

/**
 * Zmienia hasło użytkownika (Medusa 2.0)
 * W Medusa 2.0 może być dostępne przez oddzielny endpoint auth
 */
export async function changeCustomerPassword(
  passwordData: ChangePasswordRequest
): Promise<ApiResponse<void>> {
  try {
    console.log('🔄 Changing customer password...');
    
    const token = getAuthToken();
    if (!token) {
      throw new Error('No auth token found');
    }
    
    // W Medusa 2.0 może być inny endpoint dla zmiany hasła
    // Sprawdź dokumentację - może być /auth/customer/emailpass/update lub podobny
    const response = await medusaFetch('/store/auth/password-change', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      }),
    });

    console.log('✅ Customer password changed successfully');
    return { data: undefined };
  } catch (error: any) {
    console.error('❌ changeCustomerPassword error:', error);
    return { 
      error: { 
        message: error.message || 'Błąd zmiany hasła',
        status: 400 
      } 
    };
  }
}

/**
 * Waliduje dane profilu
 */
export const validateProfileData = (profile: Partial<UpdateProfileRequest>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (profile.first_name !== undefined && !profile.first_name?.trim()) {
    errors.push('Imię nie może być puste');
  }
  
  if (profile.last_name !== undefined && !profile.last_name?.trim()) {
    errors.push('Nazwisko nie może być puste');
  }
  
  if (profile.phone && !/^\+?[1-9]\d{1,14}$/.test(profile.phone.replace(/\s/g, ''))) {
    errors.push('Podaj prawidłowy numer telefonu');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Waliduje hasło
 */
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Hasło musi mieć co najmniej 8 znaków');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jedną wielką literę');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jedną małą literę');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Hasło musi zawierać co najmniej jedną cyfrę');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formatuje imię i nazwisko
 */
export const formatFullName = (profile: CustomerProfile): string => {
  const parts = [profile.first_name, profile.last_name].filter(Boolean);
  return parts.join(' ') || 'Użytkownik';
};
