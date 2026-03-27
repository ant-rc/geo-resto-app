import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Coordinates, Restaurant, RestaurantWithDistance } from '@/types/database';
import { enrichWithDistance } from '@/utils/distance';

export interface RestaurantFilters {
  searchQuery?: string;
  cuisineType?: string | null;
  priceRange?: [number, number];
  tags?: string[];
  maxDistance?: number;
  minRating?: number;
  sortBy?: 'distance' | 'rating' | 'price';
  userLocation?: Coordinates | null;
}

interface UseRestaurantsResult {
  restaurants: RestaurantWithDistance[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useRestaurants(filters: RestaurantFilters = {}): UseRestaurantsResult {
  const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('restaurants').select('*');

    if (filters.searchQuery) {
      query = query.ilike('name', `%${filters.searchQuery}%`);
    }

    if (filters.cuisineType) {
      query = query.contains('cuisine_type', [filters.cuisineType]);
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }

    if (filters.minRating) {
      query = query.gte('rating', filters.minRating);
    }

    const { data, error } = await query.limit(50) as unknown as { data: Restaurant[] | null; error: Error | null };

    if (error) {
      Alert.alert('Erreur', 'Impossible de charger les restaurants');
      setLoading(false);
      return;
    }

    if (!data) {
      setRestaurants([]);
      setLoading(false);
      return;
    }

    let results: RestaurantWithDistance[];

    if (filters.userLocation) {
      results = enrichWithDistance(data, filters.userLocation);
    } else {
      results = data.map((r) => ({ ...r, distance: 0 }));
    }

    if (filters.maxDistance && filters.userLocation) {
      results = results.filter((r) => r.distance <= filters.maxDistance!);
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      results = results.filter(
        (r) => r.price_range >= min && r.price_range <= max
      );
    }

    if (filters.sortBy === 'rating') {
      results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (filters.sortBy === 'price') {
      results.sort((a, b) => a.price_range - b.price_range);
    }

    setRestaurants(results);
    setLoading(false);
  }, [
    filters.searchQuery,
    filters.cuisineType,
    filters.tags,
    filters.maxDistance,
    filters.minRating,
    filters.priceRange,
    filters.sortBy,
    filters.userLocation,
  ]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return { restaurants, loading, refresh: fetchRestaurants };
}
