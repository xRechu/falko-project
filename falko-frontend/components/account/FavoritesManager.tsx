'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Komponent do zarządzania ulubionymi produktami
 * Premium design z możliwością dodawania do koszyka
 */

interface FavoriteProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
  added_at: string;
}

interface FavoritesManagerProps {
  favorites: FavoriteProduct[];
  onRemoveFromFavorites: (productId: string) => void;
  onAddToCart: (productId: string) => void;
}

export function FavoritesManager({ favorites, onRemoveFromFavorites, onAddToCart }: FavoritesManagerProps) {
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemoveFromFavorites = async (productId: string) => {
    setRemovingId(productId);
    try {
      await onRemoveFromFavorites(productId);
    } finally {
      setRemovingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} zł`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (favorites.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Brak ulubionych produktów
        </h3>
        <p className="text-gray-600 mb-4">
          Dodaj produkty do ulubionych, aby łatwo je odnaleźć później
        </p>
        <Button asChild>
          <Link href="/sklep">
            Przeglądaj produkty
          </Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Ulubione produkty ({favorites.length})
        </h3>
        <Button variant="outline" asChild>
          <Link href="/sklep">
            <ExternalLink className="h-4 w-4 mr-2" />
            Przeglądaj więcej
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((product) => (
          <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="relative">
              <div className="aspect-square relative bg-gray-100">
                <Image
                  src={product.image_url || '/placeholder-product.jpg'}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {!product.is_available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Niedostępny
                    </Badge>
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFromFavorites(product.id)}
                disabled={removingId === product.id}
                className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
              >
                {removingId === product.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                ) : (
                  <Heart className="h-4 w-4 text-red-600 fill-current" />
                )}
              </Button>
            </div>

            <div className="p-4">
              <div className="mb-3">
                <Link
                  href={`/products/${product.handle}`}
                  className="font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                >
                  {product.title}
                </Link>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs text-gray-500">
                  Dodano {formatDate(product.added_at)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => onAddToCart(product.id)}
                  disabled={!product.is_available}
                  className="flex-1"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.is_available ? 'Do koszyka' : 'Niedostępny'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="px-3"
                >
                  <Link href={`/products/${product.handle}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          onClick={() => {
            favorites.forEach(product => handleRemoveFromFavorites(product.id));
          }}
          className="text-red-600 border-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Usuń wszystkie
        </Button>
      </div>
    </div>
  );
}
