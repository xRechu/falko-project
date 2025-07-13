import { sdk } from '@/lib/medusa-client';
import { ApiResponse } from './products';
import { Customer, updateCustomer } from './auth'; // Zmienione z auth-new na auth

/**
 * API functions dla zarządzania profilem użytkownika w Medusa.js 2.0 JS SDK
 * Customer profile, password management
 */

// Używamy typu Customer z auth.ts 
export type CustomerProfile = Customer;

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

/**
 * Pobiera profil zalogowanego użytkownika (Medusa 2.0 JS SDK)
 */
export async function getCustomerProfile(): Promise<ApiResponse<CustomerProfile>> {
  try {
    console.log('🔄 [JS SDK] Fetching customer profile...');
    
    const response = await sdk.store.customer.retrieve();
    console.log('✅ [JS SDK] Customer profile fetched successfully');
    
    return { data: response.customer };
  } catch (error: any) {
    console.error('❌ [JS SDK] getCustomerProfile error:', error);
    return { 
      error: { 
        message: error.message || 'Błąd pobierania profilu',
        status: error.status || 400 
      } 
    };
  }
}

/**
 * Aktualizuje profil użytkownika (Medusa 2.0 JS SDK)
 */
export async function updateCustomerProfile(updates: UpdateProfileRequest): Promise<ApiResponse<CustomerProfile>> {
  try {
    console.log('🔄 [JS SDK] Updating customer profile...', updates);
    
    // Używamy funkcji z auth.ts która już używa JS SDK
    return await updateCustomer(updates);
  } catch (error: any) {
    console.error('❌ [JS SDK] updateCustomerProfile error:', error);
    return { 
      error: { 
        message: error.message || 'Błąd aktualizacji profilu',
        status: error.status || 400 
      } 
    };
  }
}

/**
 * Zmienia hasło użytkownika (Medusa 2.0)
 * UWAGA: Ta funkcja może wymagać dodatkowej implementacji w backend
 */
export async function changeCustomerPassword(passwords: ChangePasswordRequest): Promise<ApiResponse<void>> {
  try {
    console.log('🔄 [JS SDK] Changing customer password...');
    
    // To może wymagać custom endpointu w Medusa 2.0 backend
    // Póki co zwracamy błąd informujący o niedostępności
    return { 
      error: { 
        message: 'Zmiana hasła nie jest jeszcze dostępna. Skontaktuj się z obsługą klienta.',
        status: 501 
      } 
    };
  } catch (error: any) {
    console.error('❌ [JS SDK] changeCustomerPassword error:', error);
    return { 
      error: { 
        message: error.message || 'Błąd zmiany hasła',
        status: error.status || 400 
      } 
    };
  }
}

/**
 * Walidacja danych profilu
 */
export function validateProfileData(data: UpdateProfileRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.first_name && data.first_name.trim().length < 2) {
    errors.push('Imię musi mieć co najmniej 2 znaki');
  }

  if (data.last_name && data.last_name.trim().length < 2) {
    errors.push('Nazwisko musi mieć co najmniej 2 znaki');
  }

  if (data.phone && data.phone.trim().length > 0) {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{9,15}$/;
    if (!phoneRegex.test(data.phone.trim())) {
      errors.push('Nieprawidłowy format numeru telefonu');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Helper functions dla UI
 */
export function formatFullName(profile: CustomerProfile | null): string {
  if (!profile) return 'Nieznany użytkownik';
  
  const firstName = profile.first_name || '';
  const lastName = profile.last_name || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    return profile.email || 'Użytkownik';
  }
}

export function getProfileCompleteness(profile: CustomerProfile | null): number {
  if (!profile) return 0;
  
  let completed = 0;
  const total = 4;
  
  if (profile.email) completed++;
  if (profile.first_name) completed++;
  if (profile.last_name) completed++;
  if (profile.phone) completed++;
  
  return Math.round((completed / total) * 100);
}
