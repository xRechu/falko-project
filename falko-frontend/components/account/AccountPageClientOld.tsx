'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
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
import { useCustomerOrders, useCustomerAddresses, useCustomerProfile } from '@/lib/hooks/use-customer-data';
import { getOrderStatusLabel, getOrderStatusColor } from '@/lib/api/orders';
import { OrderDetailsModal } from './OrderDetailsModal';

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

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                Falko Project
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                Moje Konto
              </h1>
              <p className="text-gray-600">
                Witaj, {state.user?.first_name || state.user?.email}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Wyloguj się
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
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="font-medium">{tab.label}</div>
                        <div className={`text-xs ${
                          activeTab === tab.id ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {tab.description}
                        </div>
                      </div>
                      {activeTab !== tab.id && <ChevronRight className="h-4 w-4" />}
                    </button>
                  );
                })}
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
      
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={state.user}
      />
      
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Order Details Modal */}
      {selectedOrderId && (
        <OrderDetailsModal 
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}

// Komponenty dla poszczególnych tabów
import { Order } from '@/lib/api/orders';
import { CustomerAddress } from '@/lib/api/addresses';
import { CustomerProfile } from '@/lib/api/profile';

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
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Historia zamówień</h3>

        <div className="space-y-4">
          {orders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <div key={order.id} className="border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="h-6 w-6 text-gray-400" />
                    <div>
                      <h4 className="font-semibold">{order.number}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('pl-PL', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Produkty:</p>
                    <p className="font-medium">{order.items_count} sztuk</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Wartość:</p>
                    <p className="font-medium">{formatPrice(order.total, 'PLN')}</p>
                  </div>
                  {order.tracking_number && (
                    <div>
                      <p className="text-gray-600">Numer przesyłki:</p>
                      <p className="font-medium">{order.tracking_number}</p>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Zobacz szczegóły
                  </Button>
                  {order.status === 'shipped' && (
                    <Button variant="outline" size="sm">
                      <Truck className="h-4 w-4 mr-2" />
                      Śledź przesyłkę
                    </Button>
                  )}
                  {order.status === 'delivered' && (
                    <Button variant="outline" size="sm">
                      Zamów ponownie
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function ProfileTab({ user, onEditProfile }: { user: any; onEditProfile: () => void }) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Dane osobowe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imię
            </label>
            <input
              type="text"
              value={user?.first_name || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nazwisko
            </label>
            <input
              type="text"
              value={user?.last_name || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefon
            </label>
            <input
              type="tel"
              value={user?.phone || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              readOnly
            />
          </div>
        </div>
        <Button className="mt-6" onClick={onEditProfile}>
          Edytuj dane
        </Button>
      </Card>
    </div>
  );
}

function AddressesTab({ addresses, onAddressesUpdate }: { addresses: Address[]; onAddressesUpdate: (addresses: Address[]) => void }) {
  return (
    <div className="space-y-6">
      <AddressManager addresses={addresses} onAddressUpdate={onAddressesUpdate} />
    </div>
  );
}

function FavoritesTab({ 
  favorites, 
  onRemoveFromFavorites, 
  onAddToCart 
}: { 
  favorites: FavoriteProduct[]; 
  onRemoveFromFavorites: (productId: string) => Promise<void>;
  onAddToCart: (productId: string) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
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
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Ustawienia konta</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Powiadomienia email</p>
              <p className="text-sm text-gray-600">Otrzymuj informacje o zamówieniach</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Newsletter</p>
              <p className="text-sm text-gray-600">Otrzymuj informacje o nowościach</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6 text-red-600">Strefa niebezpieczna</h3>
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={onChangePassword}
          >
            Zmień hasło
          </Button>
          <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
            Usuń konto
          </Button>
        </div>
      </Card>
    </div>
  );
}
