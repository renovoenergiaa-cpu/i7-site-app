'use client';

import { useState, useEffect } from 'react';
import { PropertyDTO } from '@i7/types';

export function useFavorites() {
  const [favorites, setFavorites] = useState<PropertyDTO[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('i7_favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing favorites', e);
      }
    }
  }, []);

  const toggleFavorite = (property: PropertyDTO) => {
    setFavorites((prev) => {
      const exists = prev.some((p) => p.id === property.id);
      let updated;
      if (exists) {
        updated = prev.filter((p) => p.id !== property.id);
      } else {
        updated = [...prev, property];
      }
      localStorage.setItem('i7_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const isFavorite = (id: string) => {
    return favorites.some((p) => p.id === id);
  };

  return { favorites, toggleFavorite, isFavorite };
}
