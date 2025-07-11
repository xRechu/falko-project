'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Package, 
  Heart, 
  Settings, 
  CreditCard, 
  MapPin, 
  Bell,
  LogOut,
  ChevronRight,
  Edit,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Link from 'next/link';
import { EditProfileModal } from './EditProfileModal';
import { AddressManager } from './AddressManager';
import { FavoritesManager } from './FavoritesManager';
import { ChangePasswordModal } from './ChangePasswordModal';
import { OrderDetailsModal } from './OrderDetailsModal';
import { useCustomerOrders, useCustomerAddresses, useCustomerProfile } from '@/lib/hooks/use-customer-data';
import { Order, getOrderStatusLabel, getOrderStatusColor, formatPrice } from '@/lib/api/orders';
import { CustomerAddress, formatAddress } from '@/lib/api/addresses';
import { CustomerProfile, formatFullName } from '@/lib/api/profile';

/**
 * Panel użytkownika dla Falko Project
 * Premium design z wszystkimi funkcjami e-commerce
 */

type TabType = 'overview' | 'orders' | 'profile' | 'addresses' | 'favorites' | 'settings';

export function AccountPageClient() {
  const { state, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Pobieranie rzeczywistych danych z API
  const { orders, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useCustomerOrders();
  const { addresses, loading: addressesLoading, error: addressesError, refetch: refetchAddresses } = useCustomerAddresses();
  const { profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useCustomerProfile();

  // Mock data dla ulubionych (będzie zastąpione gdy dostępne w API)
  const [favorites, setFavorites] = useState<any[]>([]);

  // Sprawdź czy użytkownik jest zalogowany
  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.push('/login?returnUrl=/konto');
    }
  }, [state.isAuthenticated, state.isLoading, router]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      toast.success('Wylogowano pomyślnie');
      router.push('/');
    } catch (error) {
      toast.error('Błąd podczas wylogowywania');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFromFavorites = async (productId: string) => {
    // Mock API call
    setFavorites(prev => prev.filter(fav => fav.id !== productId));
    toast.success('Usunięto z ulubionych');
  };

  const handleAddToCart = async (productId: string) => {
    // Mock API call
    toast.success('Dodano do koszyka');
  };

  const handleProfileUpdate = () => {
    refetchProfile();
    setIsEditProfileOpen(false);
    toast.success('Profil zaktualizowany pomyślnie');
  };

  const handleAddressesUpdate = () => {
    refetchAddresses();
    toast.success('Adresy zaktualizowane pomyślnie');
  };

  if (state.isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Ładowanie danych konta...</span>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return null; // Przekierowanie już się dzieje w useEffect
  }

  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Przegląd',
      icon: User,
      description: 'Podsumowanie konta'
    },
    {
      id: 'orders' as TabType,
      label: 'Zamówienia',
      icon: Package,
      description: 'Historia zakupów'
    },
    {
      id: 'profile' as TabType,
      label: 'Profil',
      icon: Edit,
      description: 'Dane osobowe'
    },
    {
      id: 'addresses' as TabType,
      label: 'Adresy',
      icon: MapPin,
      description: 'Adresy dostawy'
    },
    {
      id: 'favorites' as TabType,
      label: 'Ulubione',
      icon: Heart,
      description: 'Zapisane produkty'
    },
    {
      id: 'settings' as TabType,
      label: 'Ustawienia',
      icon: Settings,
      description: 'Preferencje konta'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Moje konto</h1>
              <div className="hidden sm:block">
                <p className="text-sm text-gray-600">
                  Witaj, {profile ? formatFullName(profile) : state.user?.email}!
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              Wyloguj
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{tab.label}</p>
                      <p className="text-xs text-gray-500 truncate">{tab.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && <OverviewTab orders={orders} ordersLoading={ordersLoading} profile={profile} />}
                {activeTab === 'orders' && <OrdersTab orders={orders} ordersLoading={ordersLoading} onOrderSelect={setSelectedOrderId} />}
                {activeTab === 'profile' && <ProfileTab profile={profile} profileLoading={profileLoading} onEditProfile={() => setIsEditProfileOpen(true)} />}
                {activeTab === 'addresses' && <AddressesTab addresses={addresses} addressesLoading={addressesLoading} onAddressesUpdate={handleAddressesUpdate} />}
                {activeTab === 'favorites' && (
                  <FavoritesTab 
                    favorites={favorites} 
                    onRemoveFromFavorites={handleRemoveFromFavorites}
                    onAddToCart={handleAddToCart}
                  />
                )}
                {activeTab === 'settings' && <SettingsTab onChangePassword={() => setIsChangePasswordOpen(true)} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        profile={profile}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSuccess={handleProfileUpdate}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Order Details Modal */}
      {selectedOrderId && (
        <OrderDetailsModal 
          order={{ id: selectedOrderId } as Order}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}

// Komponenty dla poszczególnych tabów
function OverviewTab({ 
  orders, 
  ordersLoading, 
  profile 
}: { 
  orders: Order[]; 
  ordersLoading: boolean; 
  profile: CustomerProfile | null; 
}) {
  const recentOrders = orders.slice(0, 3);
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Ładowanie danych...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Wszystkie zamówienia</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Łącznie wydano</p>
              <p className="text-2xl font-bold">{formatPrice(totalSpent)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <User className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Klient od</p>
              <p className="text-2xl font-bold">
                {profile ? new Date(profile.created_at).getFullYear() : '---'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ostatnie zamówienia</h3>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Brak zamówień</p>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Package className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">#{order.display_id}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getOrderStatusColor(order.status)}>
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                  <p className="text-sm font-medium mt-1">{formatPrice(order.total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function OrdersTab({ 
  orders, 
  ordersLoading,
  onOrderSelect 
}: { 
  orders: Order[]; 
  ordersLoading: boolean;
  onOrderSelect: (orderId: string) => void;
}) {
  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Ładowanie zamówień...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Moje zamówienia</h2>
        <div className="text-sm text-gray-600">
          {orders.length} zamówień
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Brak zamówień</h3>
          <p className="text-gray-600 mb-4">Nie masz jeszcze żadnych zamówień.</p>
          <Button asChild>
            <Link href="/sklep">Rozpocznij zakupy</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold">#{order.display_id}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString('pl-PL')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getOrderStatusColor(order.status)}>
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onOrderSelect(order.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Szczegóły
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Kwota</p>
                  <p className="font-medium">{formatPrice(order.total)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Produkty</p>
                  <p className="font-medium">{order.items.length} pozycji</p>
                </div>
                <div>
                  <p className="text-gray-600">Status płatności</p>
                  <Badge className={getOrderStatusColor(order.payment_status, 'payment')}>
                    {getOrderStatusLabel(order.payment_status, 'payment')}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileTab({ 
  profile, 
  profileLoading, 
  onEditProfile 
}: { 
  profile: CustomerProfile | null; 
  profileLoading: boolean; 
  onEditProfile: () => void; 
}) {
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Ładowanie profilu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mój profil</h2>
        <Button onClick={onEditProfile}>
          <Edit className="h-4 w-4 mr-2" />
          Edytuj profil
        </Button>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Imię</label>
            <p className="mt-1 text-sm text-gray-900">{profile?.first_name || '---'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Nazwisko</label>
            <p className="mt-1 text-sm text-gray-900">{profile?.last_name || '---'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{profile?.email || '---'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Telefon</label>
            <p className="mt-1 text-sm text-gray-900">{profile?.phone || '---'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Data rejestracji</label>
            <p className="mt-1 text-sm text-gray-900">
              {profile ? new Date(profile.created_at).toLocaleDateString('pl-PL') : '---'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AddressesTab({ 
  addresses, 
  addressesLoading, 
  onAddressesUpdate 
}: { 
  addresses: CustomerAddress[]; 
  addressesLoading: boolean; 
  onAddressesUpdate: () => void; 
}) {
  if (addressesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Ładowanie adresów...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Moje adresy</h2>
      </div>

      <AddressManager 
        addresses={addresses}
        onAddressesUpdate={onAddressesUpdate}
      />
    </div>
  );
}

function FavoritesTab({ 
  favorites, 
  onRemoveFromFavorites, 
  onAddToCart 
}: { 
  favorites: any[]; 
  onRemoveFromFavorites: (productId: string) => void; 
  onAddToCart: (productId: string) => void; 
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ulubione produkty</h2>
        <div className="text-sm text-gray-600">
          {favorites.length} produktów
        </div>
      </div>

      <FavoritesManager 
        favorites={favorites}
        onRemoveFromFavorites={onRemoveFromFavorites}
        onAddToCart={onAddToCart}
      />
    </div>
  );
}

function SettingsTab({ onChangePassword }: { onChangePassword: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Ustawienia konta</h2>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Bezpieczeństwo</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Hasło</p>
              <p className="text-sm text-gray-600">Zmień hasło dostępu do konta</p>
            </div>
            <Button variant="outline" onClick={onChangePassword}>
              Zmień hasło
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Powiadomienia</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Powiadomienia email</p>
              <p className="text-sm text-gray-600">Otrzymuj powiadomienia o statusie zamówień</p>
            </div>
            <Button variant="outline">
              Zarządzaj
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
