import { API_CONFIG } from '@/lib/api-config';
import { ApiResponse } from './products';
import { sdk } from '@/lib/medusa-client';

/**
 * API functions dla autentykacji użytkowników w Medusa.js 2.0 SDK
 * Customer authentication, registration, profile management
 * 
 * UWAGA: SDK automatycznie zarządza tokenami i autoryzacją
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

/**
 * Logowanie użytkownika (Medusa 2.0 SDK) 
 * Używa sdk.auth.login() zamiast bezpośredniego fetch
 */
export async function loginCustomer(credentials: LoginRequest): Promise<ApiResponse<any>> {
  try {
    console.log('🔄 Logging in customer via SDK:', credentials.email);
    
    // Używamy SDK - automatycznie zapisuje token i zarządza sesją
    const response = await sdk.auth.login("customer", "emailpass", {
      email: credentials.email,
      password: credentials.password,
    });

    console.log('✅ SDK Login response:', response);
    console.log('✅ Customer logged in successfully via SDK');
    return { data: response };
  } catch (error: any) {
    console.error('❌ loginCustomer SDK error:', error);
    return { 
      error: { 
        message: error.message || 'Błąd logowania',
        status: 400 
      } 
    };
  }
}

/**
 * Rejestracja nowego użytkownika (Medusa 2.0 SDK)
 */
export async function registerCustomer(userData: RegisterRequest): Promise<ApiResponse<any>> {
  try {
    console.log('🔄 Registering customer via SDK:', userData.email);
    
    // Rejestracja w systemie auth przez SDK
    const authToken = await sdk.auth.register("customer", "emailpass", {
      email: userData.email,
      password: userData.password,
    });

    // Po udanej rejestracji, utwórz profil klienta przez SDK
    if (authToken) {
      try {
        const customerResponse = await sdk.store.customer.create({
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
        });
        
        console.log('✅ Customer registered and profile created successfully via SDK');
        return { 
          data: { 
            token: authToken, 
            customer: customerResponse.customer 
          } 
        };
      } catch (profileError) {
        console.warn('Customer registered but profile creation failed:', profileError);
        return { data: { token: authToken } };
      }
    }

    console.log('✅ Customer registered successfully');
    return { data: { token: authToken } };
  } catch (error: any) {
    console.error('❌ registerCustomer error:', error);
    return { 
      error: { 
        message: error.message || 'Błąd rejestracji',
        status: 400 
      } 
    };
  }
}

/**
 * Pobiera dane zalogowanego użytkownika (Medusa 2.0 SDK)
 */
export async function getCustomer(): Promise<ApiResponse<any>> {
  try {
    console.log('🔄 Fetching customer data via SDK...');
    
    // SDK automatycznie zarządza tokenami
    const response = await sdk.store.customer.retrieve();
    
    if (response.customer) {
      console.log('✅ Customer data fetched via SDK');
      return { data: response.customer };
    }
    
    throw new Error('No customer data returned');
  } catch (error: any) {
    console.error('❌ getCustomer SDK error:', error);
    return { 
      error: { 
        message: error.message || 'Błąd pobierania danych użytkownika',
        status: 401 
      } 
    };
  }
}

/**
 * Wylogowanie użytkownika (Medusa 2.0 SDK)
 */
export async function logoutCustomer(): Promise<ApiResponse<void>> {
  try {
    console.log('🔄 Logging out customer via SDK...');
    
    await sdk.auth.logout();

    console.log('✅ Customer logged out successfully via SDK');
    return { data: undefined };
  } catch (error: any) {
    console.error('❌ logoutCustomer SDK error:', error);
    // Wyloguj lokalnie nawet jeśli API call failed
    return { data: undefined };
  }
}

/**
 * Aktualizacja profilu użytkownika (Medusa 2.0 SDK)
 */
export async function updateCustomer(
  updates: Partial<Pick<RegisterRequest, 'first_name' | 'last_name' | 'phone'>>
): Promise<ApiResponse<any>> {
  try {
    console.log('🔄 Updating customer profile via SDK...');
    
    const response = await sdk.store.customer.update(updates);

    console.log('✅ Customer profile updated successfully via SDK');
    return { data: response.customer };
  } catch (error: any) {
    console.error('❌ updateCustomer SDK error:', error);
    return { 
      error: { 
        message: error.message || 'Błąd aktualizacji profilu',
        status: 400 
      } 
    };
  }
}

/**
 * Reset hasła - wysłanie emaila z linkiem (Medusa 2.0 SDK)
 */
export async function requestPasswordReset(email: string): Promise<ApiResponse<void>> {
  try {
    console.log('🔄 Requesting password reset for:', email);
    
    // Używamy bezpośredniego fetch dla reset password - SDK może nie mieć tej metody
    await sdk.client.fetch('/auth/customer/emailpass/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    console.log('✅ Password reset email sent successfully via SDK client');
    return { data: undefined };
  } catch (error: any) {
    console.error('❌ requestPasswordReset SDK error:', error);
    return { 
      error: { 
        message: error.message || 'Błąd wysyłania emaila resetującego',
        status: 400 
      } 
    };
  }
}

/**
 * Reset hasła z tokenem (Medusa 2.0 SDK)
 */
export async function resetPassword(
  email: string, 
  token: string, 
  password: string
): Promise<ApiResponse<any>> {
  try {
    console.log('🔄 Resetting password for:', email);
    
    const response = await sdk.client.fetch('/auth/customer/emailpass/update', {
      method: 'POST',
      body: JSON.stringify({
        email,
        token,
        password,
      }),
    });

    console.log('✅ Password reset successfully via SDK');
    return { data: response };
  } catch (error: any) {
    console.error('❌ resetPassword SDK error:', error);
    return { 
      error: { 
        message: error.message || 'Błąd resetowania hasła',
        status: 400 
      } 
    };
  }
}

/**
 * Sprawdzanie dostępności emaila (czy email już istnieje w systemie)
 */
export async function checkEmailAvailability(email: string): Promise<ApiResponse<{ available: boolean }>> {
  try {
    console.log('🔄 Checking email availability:', email);
    
    // Walidacja podstawowa
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { 
        error: { 
          message: 'Nieprawidłowy format emaila',
          status: 400 
        } 
      };
    }
    
    // Metoda 1: Próba sprawdzenia przez endpoint resetowania hasła
    // To jest bezpieczny sposób sprawdzenia czy użytkownik istnieje
    try {
      await sdk.client.fetch('/auth/customer/emailpass/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
        }),
      });
      
      // Jeśli żądanie się powiodło, znaczy że email istnieje
      console.log('❌ Email not available (user exists):', email);
      return { data: { available: false } };
      
    } catch (resetError: any) {
      console.log('Reset error details:', resetError.message);
      
      // Analizuj typ błędu
      const errorMessage = resetError.message?.toLowerCase() || '';
      
      if (errorMessage.includes('404') || 
          errorMessage.includes('not found') || 
          errorMessage.includes('user not found') ||
          errorMessage.includes('customer not found') ||
          errorMessage.includes('does not exist') ||
          errorMessage.includes('no customer found')) {
        // Email nie istnieje - jest dostępny
        console.log('✅ Email available (user not found):', email);
        return { data: { available: true } };
      }
      
      // Dla innych błędów (np. 400, 500) - spróbuj innej metody
      console.log('Trying alternative validation method...');
      
      // Metoda 2: Próba logowania z nieprawidłowym hasłem
      // Jeśli dostaniemy "Invalid credentials" - user istnieje
      // Jeśli dostaniemy "User not found" - user nie istnieje
      try {
        await sdk.client.fetch('/auth/customer/emailpass', {
          method: 'POST',
          body: JSON.stringify({
            email: email,
            password: 'invalid_password_' + Math.random(), // Losowe hasło
          }),
        });
        
        // Jeśli nie było błędu (dziwne, ale załóżmy że user istnieje)
        console.log('❌ Email not available (login succeeded):', email);
        return { data: { available: false } };
        
      } catch (loginError: any) {
        const loginErrorMessage = loginError.message?.toLowerCase() || '';
        
        if (loginErrorMessage.includes('invalid credentials') ||
            loginErrorMessage.includes('incorrect password') ||
            loginErrorMessage.includes('wrong password')) {
          // User istnieje ale hasło jest złe
          console.log('❌ Email not available (invalid credentials):', email);
          return { data: { available: false } };
        }
        
        if (loginErrorMessage.includes('not found') ||
            loginErrorMessage.includes('user not found') ||
            loginErrorMessage.includes('customer not found')) {
          // User nie istnieje
          console.log('✅ Email available (user not found in login):', email);
          return { data: { available: true } };
        }
        
        // Dla innych błędów - zachowawczy: załóż że email może być zajęty
        console.log('❓ Email availability uncertain, defaulting to unavailable:', email);
        return { data: { available: false } };
      }
    }
    
  } catch (error: any) {
    console.error('❌ checkEmailAvailability error:', error);
    return { 
      error: { 
        message: 'Nie można sprawdzić dostępności emaila. Spróbuj ponownie.',
        status: 500 
      } 
    };
  }
}

/**
 * Eksportowane funkcje do zarządzania tokenami
 */
// SDK zarządza tokenami automatycznie - nie eksportujemy starych funkcji token management
