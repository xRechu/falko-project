'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, Truck, Mail, User, MapPin, Phone } from 'lucide-react';

interface CheckoutFormProps {
  onSubmit: (formData: CheckoutFormData) => Promise<void>;
  isProcessing: boolean;
}

export interface CheckoutFormData {
  // Dane osobowe
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  
  // Adres dostawy
  address: string;
  city: string;
  postalCode: string;
  country: string;
  
  // Opcje dostawy i płatności
  shippingMethod: string;
  paymentMethod: string;
  
  // Dodatkowe
  newsletter: boolean;
  terms: boolean;
  notes?: string;
}

interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  terms?: string;
}

/**
 * Formularz checkout z walidacją i premium UX
 * Podzielony na sekcje z ikonami i progress indicator
 */
export function CheckoutForm({ onSubmit, isProcessing }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'PL',
    shippingMethod: 'standard',
    paymentMethod: 'card',
    newsletter: false,
    terms: false,
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Walidacja email
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Podaj prawidłowy adres email';
    }
    
    // Walidacja wymaganych pól
    if (!formData.firstName.trim()) newErrors.firstName = 'Imię jest wymagane';
    if (!formData.lastName.trim()) newErrors.lastName = 'Nazwisko jest wymagane';
    if (!formData.phone.trim()) newErrors.phone = 'Telefon jest wymagany';
    if (!formData.address.trim()) newErrors.address = 'Adres jest wymagany';
    if (!formData.city.trim()) newErrors.city = 'Miasto jest wymagane';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Kod pocztowy jest wymagany';
    
    // Walidacja regulaminu
    if (!formData.terms) {
      newErrors.terms = 'Musisz zaakceptować regulamin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    await onSubmit(formData);
  };

  const updateField = (field: keyof CheckoutFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (field in errors) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dane kontaktowe */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold">Dane kontaktowe</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Adres email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="twoj@email.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Imię *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="Jan"
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="lastName">Nazwisko *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Kowalski"
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="phone">Telefon *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+48 123 456 789"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Adres dostawy */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <MapPin className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold">Adres dostawy</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="address">Ulica i numer *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="ul. Przykładowa 123"
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1">{errors.address}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Miasto *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Warszawa"
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-500 mt-1">{errors.city}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="postalCode">Kod pocztowy *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value)}
                placeholder="00-000"
                className={errors.postalCode ? 'border-red-500' : ''}
              />
              {errors.postalCode && (
                <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Dostawa */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Truck className="h-5 w-5 text-orange-600" />
          </div>
          <h2 className="text-lg font-semibold">Metoda dostawy</h2>
        </div>
        
        <RadioGroup 
          value={formData.shippingMethod} 
          onValueChange={(value) => updateField('shippingMethod', value)}
        >
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <RadioGroupItem value="standard" id="standard" />
            <Label htmlFor="standard" className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Dostawa standardowa</p>
                  <p className="text-sm text-gray-600">3-5 dni roboczych</p>
                </div>
                <p className="font-semibold">Darmowa</p>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <RadioGroupItem value="express" id="express" />
            <Label htmlFor="express" className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Dostawa ekspresowa</p>
                  <p className="text-sm text-gray-600">1-2 dni roboczych</p>
                </div>
                <p className="font-semibold">15,99 zł</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </Card>

      {/* Płatność */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold">Metoda płatności</h2>
        </div>
        
        <RadioGroup 
          value={formData.paymentMethod} 
          onValueChange={(value) => updateField('paymentMethod', value)}
        >
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <RadioGroupItem value="card" id="card" />
            <Label htmlFor="card" className="flex-1">
              <div>
                <p className="font-medium">Karta płatnicza</p>
                <p className="text-sm text-gray-600">Visa, Mastercard, BLIK</p>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <RadioGroupItem value="transfer" id="transfer" />
            <Label htmlFor="transfer" className="flex-1">
              <div>
                <p className="font-medium">Przelew bankowy</p>
                <p className="text-sm text-gray-600">Tradycyjny przelew</p>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 border rounded-lg">
            <RadioGroupItem value="cod" id="cod" />
            <Label htmlFor="cod" className="flex-1">
              <div>
                <p className="font-medium">Płatność przy odbiorze</p>
                <p className="text-sm text-gray-600">Gotówka lub karta</p>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </Card>

      {/* Dodatkowe opcje */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="newsletter"
              checked={formData.newsletter}
              onCheckedChange={(checked) => updateField('newsletter', !!checked)}
            />
            <Label htmlFor="newsletter" className="text-sm">
              Chcę otrzymywać newsletter z nowościami i promocjami
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.terms}
              onCheckedChange={(checked) => updateField('terms', !!checked)}
            />
            <Label htmlFor="terms" className="text-sm">
              Akceptuję{' '}
              <a href="/regulamin" className="text-blue-600 hover:underline">
                regulamin
              </a>{' '}
              i{' '}
              <a href="/polityka-prywatnosci" className="text-blue-600 hover:underline">
                politykę prywatności
              </a>{' '}
              *
            </Label>
          </div>
          {errors.terms && (
            <p className="text-sm text-red-500">{errors.terms}</p>
          )}
        </div>
      </Card>

      {/* Submit Button */}
      <Button 
        type="submit" 
        size="lg" 
        className="w-full"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Przetwarzanie...
          </>
        ) : (
          'Złóż zamówienie'
        )}
      </Button>
    </form>
  );
}
