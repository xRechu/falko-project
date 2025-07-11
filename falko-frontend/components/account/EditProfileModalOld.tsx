'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { User, Mail, Phone, Save, X } from 'lucide-react';
import { CustomerProfile, updateCustomerProfile, validateProfileData } from '@/lib/api/profile';

/**
 * Komponent do edycji profilu użytkownika
 * Premium design z walidacją formularza
 */

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CustomerProfile | null;
  onSuccess: () => void;
}

export function EditProfileModal({ isOpen, onClose, profile, onSuccess }: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [errors, setErrors] = useState<{
    first_name?: string;
    last_name?: string;
    phone?: string;
  }>({});

  // Aktualizuj formData gdy profile się zmieni
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const validateForm = (): boolean => {
    const validation = validateProfileData(formData);
    const newErrors: typeof errors = {};

    if (!validation.isValid) {
      validation.errors.forEach(error => {
        if (error.includes('Imię')) newErrors.first_name = error;
        if (error.includes('Nazwisko')) newErrors.last_name = error;
        if (error.includes('telefon')) newErrors.phone = error;
      });
    }

    setErrors(newErrors);
    return validation.isValid;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Tu będzie API call do aktualizacji profilu
      // const response = await updateCustomerProfile(formData);
      
      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Profil zaktualizowany pomyślnie');
      await refreshUser();
      onClose();
    } catch (error) {
      toast.error('Błąd podczas aktualizacji profilu');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Edytuj profil</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">
              Imię
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
                placeholder="Twoje imię"
                className={`pl-10 ${errors.first_name ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.first_name && (
              <p className="text-sm text-red-500">{errors.first_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">
              Nazwisko
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
                placeholder="Twoje nazwisko"
                className={`pl-10 ${errors.last_name ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.last_name && (
              <p className="text-sm text-red-500">{errors.last_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email (nie można zmienić)
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                className="pl-10 bg-gray-50"
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Telefon (opcjonalnie)
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+48 123 456 789"
                className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Zapisz
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
