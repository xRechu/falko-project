'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Home, 
  Building, 
  Check,
  X,
  Loader2
} from 'lucide-react';
import { 
  CustomerAddress, 
  createCustomerAddress, 
  updateCustomerAddress, 
  deleteCustomerAddress,
  validateAddress,
  COUNTRIES,
  formatAddress
} from '@/lib/api/addresses';

/**
 * Komponent do zarządzania adresami użytkownika
 * Obsługuje adresy wysyłki i rozliczeniowe
 */

interface AddressManagerProps {
  addresses: CustomerAddress[];
  onAddressesUpdate: () => void;
}

export function AddressManager({ addresses, onAddressesUpdate }: AddressManagerProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [newAddress, setNewAddress] = useState<Omit<CustomerAddress, 'id'>>({
    type: 'shipping',
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    postal_code: '',
    country: 'PL',
    is_default: false,
  });

  const handleAddAddress = () => {
    if (!validateAddress(newAddress)) {
      return;
    }

    const address: Address = {
      ...newAddress,
      id: Date.now().toString(),
    };

    const updatedAddresses = [...addresses, address];
    setAddresses(updatedAddresses);
    onAddressUpdate(updatedAddresses);
    setIsAddingNew(false);
    resetNewAddress();
    toast.success('Adres dodany pomyślnie');
  };

  const handleDeleteAddress = (id: string) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== id);
    setAddresses(updatedAddresses);
    onAddressUpdate(updatedAddresses);
    toast.success('Adres usunięty');
  };

  const handleSetDefault = (id: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      is_default: addr.id === id ? true : false,
    }));
    setAddresses(updatedAddresses);
    onAddressUpdate(updatedAddresses);
    toast.success('Ustawiono jako domyślny');
  };

  const validateAddress = (address: Omit<Address, 'id'>): boolean => {
    if (!address.first_name.trim() || !address.last_name.trim()) {
      toast.error('Imię i nazwisko są wymagane');
      return false;
    }
    if (!address.address_1.trim()) {
      toast.error('Adres jest wymagany');
      return false;
    }
    if (!address.city.trim()) {
      toast.error('Miasto jest wymagane');
      return false;
    }
    if (!address.postal_code.trim() || !/^\d{2}-\d{3}$/.test(address.postal_code)) {
      toast.error('Podaj prawidłowy kod pocztowy (XX-XXX)');
      return false;
    }
    return true;
  };

  const resetNewAddress = () => {
    setNewAddress({
      type: 'shipping',
      first_name: '',
      last_name: '',
      company: '',
      address_1: '',
      address_2: '',
      city: '',
      postal_code: '',
      country: 'PL',
      is_default: false,
    });
  };

  const formatAddress = (address: Address) => {
    const parts = [
      address.address_1,
      address.address_2,
      `${address.postal_code} ${address.city}`,
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Zapisane adresy</h3>
        <Button
          onClick={() => setIsAddingNew(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Dodaj adres
        </Button>
      </div>

      {/* Existing Addresses */}
      <div className="grid gap-4">
        {addresses.map((address) => (
          <Card key={address.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  {address.type === 'shipping' ? (
                    <Home className="h-4 w-4 text-gray-600" />
                  ) : (
                    <Building className="h-4 w-4 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">
                      {address.first_name} {address.last_name}
                    </h4>
                    {address.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        Domyślny
                      </Badge>
                    )}
                  </div>
                  {address.company && (
                    <p className="text-sm text-gray-600 mb-1">{address.company}</p>
                  )}
                  <p className="text-sm text-gray-700">{formatAddress(address)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {address.type === 'shipping' ? 'Adres wysyłki' : 'Adres rozliczeniowy'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {!address.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(address.id)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAddress(address.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add New Address Form */}
      {isAddingNew && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Dodaj nowy adres</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingNew(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Imię</Label>
              <Input
                id="first_name"
                value={newAddress.first_name}
                onChange={(e) => setNewAddress(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="Imię"
              />
            </div>
            
            <div>
              <Label htmlFor="last_name">Nazwisko</Label>
              <Input
                id="last_name"
                value={newAddress.last_name}
                onChange={(e) => setNewAddress(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="Nazwisko"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="company">Firma (opcjonalnie)</Label>
              <Input
                id="company"
                value={newAddress.company}
                onChange={(e) => setNewAddress(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Nazwa firmy"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="address_1">Adres</Label>
              <Input
                id="address_1"
                value={newAddress.address_1}
                onChange={(e) => setNewAddress(prev => ({ ...prev, address_1: e.target.value }))}
                placeholder="Ulica i numer"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="address_2">Adres cd. (opcjonalnie)</Label>
              <Input
                id="address_2"
                value={newAddress.address_2}
                onChange={(e) => setNewAddress(prev => ({ ...prev, address_2: e.target.value }))}
                placeholder="Mieszkanie, numer lokalu"
              />
            </div>
            
            <div>
              <Label htmlFor="postal_code">Kod pocztowy</Label>
              <Input
                id="postal_code"
                value={newAddress.postal_code}
                onChange={(e) => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                placeholder="XX-XXX"
              />
            </div>
            
            <div>
              <Label htmlFor="city">Miasto</Label>
              <Input
                id="city"
                value={newAddress.city}
                onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Miasto"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Typ adresu</Label>
              <select
                id="type"
                value={newAddress.type}
                onChange={(e) => setNewAddress(prev => ({ ...prev, type: e.target.value as 'billing' | 'shipping' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="shipping">Adres wysyłki</option>
                <option value="billing">Adres rozliczeniowy</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={newAddress.is_default}
                onChange={(e) => setNewAddress(prev => ({ ...prev, is_default: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="is_default">Ustaw jako domyślny</Label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsAddingNew(false)}
              className="flex-1"
            >
              Anuluj
            </Button>
            <Button
              onClick={handleAddAddress}
              className="flex-1"
            >
              Dodaj adres
            </Button>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {addresses.length === 0 && !isAddingNew && (
        <Card className="p-8 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Brak zapisanych adresów
          </h3>
          <p className="text-gray-600 mb-4">
            Dodaj swój pierwszy adres, aby przyspieszyć proces zamówienia
          </p>
          <Button onClick={() => setIsAddingNew(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj adres
          </Button>
        </Card>
      )}
    </div>
  );
}
