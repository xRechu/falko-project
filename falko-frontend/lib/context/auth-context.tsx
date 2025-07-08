'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { loginCustomer, registerCustomer, getCustomer, logoutCustomer } from '@/lib/api/auth';

/**
 * Context dla zarządzania autentykacją użytkowników
 * Integracja z Medusa.js Customer API
 */

// Typy dla użytkownika
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  has_account: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Actions dla reducer
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        error: null,
        isLoading: false
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false
      };
    
    default:
      return state;
  }
}

// Initial state
const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// Context
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isRemembered: () => boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Sprawdź czy użytkownik jest zalogowany przy inicjalizacji
  useEffect(() => {
    const token = getToken();
    if (token) {
      loadUser();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Funkcje pomocnicze
  const saveToken = (token: string, rememberMe: boolean = false) => {
    if (rememberMe) {
      // Zapisz w localStorage dla długoterminowego przechowywania
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_remember', 'true');
      // Usuń z sessionStorage jeśli istnieje
      sessionStorage.removeItem('auth_token');
    } else {
      // Zapisz w sessionStorage tylko dla bieżącej sesji
      sessionStorage.setItem('auth_token', token);
      // Usuń z localStorage jeśli istnieje
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_remember');
    }
  };

  const getToken = (): string | null => {
    // Sprawdź najpierw sessionStorage, potem localStorage
    return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
  };

  const removeToken = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_remember');
    sessionStorage.removeItem('auth_token');
  };

  const isRemembered = (): boolean => {
    return localStorage.getItem('auth_remember') === 'true';
  };

  const loadUser = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await getCustomer();
      if (response.data) {
        dispatch({ type: 'SET_USER', payload: response.data });
      } else {
        // Token prawdopodobnie wygasł
        removeToken();
        dispatch({ type: 'SET_USER', payload: null });
      }
    } catch (error) {
      console.error('Błąd ładowania użytkownika:', error);
      removeToken();
      dispatch({ type: 'SET_USER', payload: null });
    }
  };

  // API functions
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      console.log('🔄 Logging in user:', email, 'Remember Me:', rememberMe);
      const response = await loginCustomer({ email, password });
      
      if (response.data && response.data.token) {
        // Medusa 2.0 zwraca token bezpośrednio
        saveToken(response.data.token, rememberMe);
        
        // Pobierz dane użytkownika po zalogowaniu
        const userResponse = await getCustomer();
        if (userResponse.data) {
          dispatch({ type: 'SET_USER', payload: userResponse.data });
          console.log('✅ User logged in successfully');
          return { success: true };
        } else {
          // Jeśli nie można pobrać danych użytkownika, ale mamy token
          // Utwórz podstawowy obiekt użytkownika
          const basicUser = {
            id: 'temp',
            email: email,
            first_name: '',
            last_name: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            has_account: true,
          };
          dispatch({ type: 'SET_USER', payload: basicUser });
          console.log('✅ User logged in successfully (basic profile)');
          return { success: true };
        }
      } else {
        const errorMessage = response.error?.message || 'Błąd logowania';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = 'Wystąpił błąd podczas logowania';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      console.log('🔄 Registering user:', userData.email);
      const response = await registerCustomer(userData);
      
      if (response.data && response.data.token) {
        // Po rejestracji automatycznie logujemy użytkownika
        saveToken(response.data.token);
        
        // Pobierz dane użytkownika lub utwórz podstawowe
        const userResponse = await getCustomer();
        const user = userResponse.data || {
          id: 'temp',
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          has_account: true,
        };
        
        dispatch({ type: 'SET_USER', payload: user });
        console.log('✅ User registered and logged in successfully');
        return { success: true };
      } else {
        const errorMessage = response.error?.message || 'Błąd rejestracji';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = 'Wystąpił błąd podczas rejestracji';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await logoutCustomer();
      removeToken();
      dispatch({ type: 'LOGOUT' });
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Wyloguj lokalnie nawet jeśli API call failed
      removeToken();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const refreshUser = async () => {
    if (state.isAuthenticated) {
      await loadUser();
    }
  };

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    refreshUser,
    isRemembered,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
