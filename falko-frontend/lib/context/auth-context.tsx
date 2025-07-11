'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  loginCustomer, 
  registerCustomer, 
  getCustomer, 
  logoutCustomer, 
  isAuthenticated,
  clearAuthentication,
  type Customer,
  type LoginRequest,
  type RegisterRequest
} from '@/lib/api/auth-new';
import { TokenManager } from '@/lib/medusa-client';

/**
 * Context dla zarządzania autentykacją użytkowników - Medusa.js 2.0 JS SDK
 * Automatyczne zarządzanie tokenami JWT przez SDK
 */

// Używamy typu Customer z nowego API
export type { Customer } from '@/lib/api/auth-new';

export interface AuthState {
  user: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Actions dla reducer
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: Customer | null }
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
    loadUser();
  }, []);

  // Ładuje dane użytkownika jeśli token istnieje
  const loadUser = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Najpierw spróbuj załadować token z storage
      const token = TokenManager.initFromStorage();
      
      if (!token) {
        console.log('🔍 [AuthContext] No token found, user not logged in');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      console.log('🔍 [AuthContext] Token found, loading user data...');
      
      const response = await getCustomer();
      
      if (response.data) {
        console.log('✅ [AuthContext] User data loaded:', response.data);
        dispatch({ type: 'SET_USER', payload: response.data });
      } else {
        console.log('❌ [AuthContext] Failed to load user data, clearing auth');
        clearAuthentication();
        dispatch({ type: 'LOGOUT' });
      }
    } catch (error) {
      console.error('❌ [AuthContext] Error loading user:', error);
      clearAuthentication();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Funkcje pomocnicze dla "zapamiętaj mnie"
  const setRememberMe = (remember: boolean) => {
    if (remember) {
      localStorage.setItem('auth_remember', 'true');
    } else {
      localStorage.removeItem('auth_remember');
    }
  };

  const isRemembered = (): boolean => {
    return localStorage.getItem('auth_remember') === 'true';
  };

  const clearRememberMe = () => {
    localStorage.removeItem('auth_remember');
  };

  // API functions
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      console.log('🔄 [JS SDK] Logging in user:', email, 'Remember Me:', rememberMe);
      const response = await loginCustomer({ email, password });
      
      if (response.data) {
        // JS SDK już zapisał token automatycznie
        setRememberMe(rememberMe);
        
        dispatch({ type: 'SET_USER', payload: response.data.customer });
        console.log('✅ [JS SDK] User logged in successfully');
        return { success: true };
      } else {
        const errorMessage = response.error?.message || 'Błąd logowania';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('❌ [JS SDK] Login error:', error);
      const errorMessage = 'Wystąpił błąd podczas logowania';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      console.log('🔄 [JS SDK] Registering user:', userData.email);
      const response = await registerCustomer(userData);
      
      if (response.data) {
        // JS SDK już zarządza tokenem automatycznie
        dispatch({ type: 'SET_USER', payload: response.data.customer });
        console.log('✅ [JS SDK] User registered and logged in successfully');
        return { success: true };
      } else {
        const errorMessage = response.error?.message || 'Błąd rejestracji';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('❌ [JS SDK] Registration error:', error);
      const errorMessage = 'Wystąpił błąd podczas rejestracji';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await logoutCustomer(); // JS SDK automatycznie usuwa token
      clearRememberMe();
      dispatch({ type: 'LOGOUT' });
      console.log('✅ [JS SDK] User logged out successfully');
    } catch (error) {
      console.error('❌ [JS SDK] Logout error:', error);
      // Wyloguj lokalnie nawet jeśli API call failed
      clearAuthentication();
      clearRememberMe();
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
