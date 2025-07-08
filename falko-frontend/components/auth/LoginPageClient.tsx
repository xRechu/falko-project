'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { useRateLimit } from '@/lib/hooks/useRateLimit';
import { RateLimitWarning } from './RateLimitWarning';

/**
 * Strona logowania dla Falko Project
 * Premium design z walidacją i UX feedback
 */
export function LoginPageClient() {
  const { state, login, isRemembered } = useAuth();
  const router = useRouter();
  
  // Rate limiting hook
  const rateLimit = useRateLimit('login', {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minut
    blockDurationMs: 15 * 60 * 1000, // 15 minut blokady (mniej niż przy rejestracji)
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Wczytaj zapamiętane dane przy ładowaniu komponentu
  useEffect(() => {
    const wasRemembered = isRemembered();
    if (wasRemembered) {
      setRememberMe(true);
      // Wczytaj zapamiętany email jeśli istnieje
      const savedEmail = localStorage.getItem('remembered_email');
      if (savedEmail) {
        setFormData(prev => ({ ...prev, email: savedEmail }));
      }
    }
  }, [isRemembered]);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Podaj prawidłowy adres email';
    }
    
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Hasło musi mieć co najmniej 6 znaków';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sprawdź rate limiting
    if (!rateLimit.canSubmit) {
      toast.error('Przekroczono limit prób logowania. Spróbuj ponownie później.');
      return;
    }
    
    if (!validateForm()) {
      // Zapisz nieudaną próbę walidacji
      rateLimit.recordAttempt();
      return;
    }
    
    const result = await login(formData.email, formData.password, rememberMe);
    
    if (result.success) {
      // Zapisz email jeśli użytkownik chce być zapamiętany
      if (rememberMe) {
        localStorage.setItem('remembered_email', formData.email);
      } else {
        localStorage.removeItem('remembered_email');
      }
      
      // Reset rate limiting przy udanym logowaniu
      rateLimit.reset();
      
      toast.success('Zalogowano pomyślnie!');
      // Przekieruj do strony głównej lub poprzedniej strony
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
      router.push(returnUrl || '/');
    } else {
      // Zapisz nieudaną próbę logowania
      rateLimit.recordAttempt();
      toast.error(result.error || 'Błąd logowania');
    }
  };

  const updateField = (field: 'email' | 'password', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="h-4 w-4" />
            <span>Powrót do sklepu</span>
          </Link>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Falko Project
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Zaloguj się do konta
            </h2>
            <p className="text-gray-600">
              Nie masz konta?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Zarejestruj się
              </Link>
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="p-6 shadow-lg">
          <div className="px-2 py-2">
            {/* Rate Limit Warning */}
            <RateLimitWarning
              attempts={rateLimit.attempts}
              maxAttempts={5}
              isBlocked={rateLimit.isBlocked}
              timeRemaining={rateLimit.timeRemaining}
              className="mb-6"
            />
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Adres email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="twoj@email.com"
                    className={`pl-11 h-12 text-base placeholder:pl-1 ${errors.email ? 'border-red-500' : ''}`}
                    disabled={state.isLoading}
                    style={{ textIndent: '0px' }}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 mt-2">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Hasło
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    placeholder="Twoje hasło"
                    className={`pl-11 pr-11 h-12 text-base placeholder:pl-1 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={state.isLoading}
                    style={{ textIndent: '0px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 mt-2">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label 
                    htmlFor="remember-me" 
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Zapamiętaj mnie
                  </Label>
                </div>
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Zapomniałeś hasła?
                  </Link>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                  disabled={state.isLoading || !rateLimit.canSubmit}
                >
                  {state.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Logowanie...
                    </>
                  ) : !rateLimit.canSubmit ? (
                    'Logowanie tymczasowo zablokowane'
                  ) : (
                    'Zaloguj się'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Lub kontynuuj jako gość
                  </span>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                <Button
                  variant="outline"
                  className="w-full h-12 text-base"
                  size="lg"
                  onClick={() => router.push('/checkout')}
                >
                  Zakupy bez konta
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Trust indicators */}
        <div className="mt-10 text-center">
          <div className="grid grid-cols-3 gap-6 text-xs text-gray-500">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Lock className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-medium">Bezpieczne logowanie</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-medium">Ochrona danych</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <span className="font-medium">Prywatność</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
