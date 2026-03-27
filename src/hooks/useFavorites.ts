import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Favorite, Restaurant } from '@/types/database';

export interface FavoriteWithRestaurant {
  id: string;
  restaurant: Restaurant;
}

interface UseFavoritesResult {
  favorites: FavoriteWithRestaurant[];
  favoriteIds: Set<string>;
  loading: boolean;
  refreshing: boolean;
  toggleFavorite: (restaurantId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<FavoriteWithRestaurant[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('id, restaurant_id, restaurant:restaurants (*)')
      .eq('user_id', user.id) as unknown as { data: (Favorite & { restaurant: Restaurant })[] | null; error: Error | null };

    if (error) {
      Alert.alert('Erreur', 'Impossible de charger les favoris');
    } else if (data) {
      const favs = data as unknown as FavoriteWithRestaurant[];
      setFavorites(favs);
      setFavoriteIds(
        new Set(data.map((f) => f.restaurant_id))
      );
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [fetchFavorites])
  );

  const toggleFavorite = useCallback(async (restaurantId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour ajouter des favoris');
      return;
    }

    const isFav = favoriteIds.has(restaurantId);

    if (isFav) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('restaurant_id', restaurantId);

      setFavorites((prev) => prev.filter((f) => f.restaurant.id !== restaurantId));
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(restaurantId);
        return next;
      });
    } else {
      const { data } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, restaurant_id: restaurantId } as never)
        .select('id, restaurant_id, restaurant:restaurants (*)')
        .single();

      if (data) {
        const fav = data as unknown as FavoriteWithRestaurant;
        setFavorites((prev) => [...prev, fav]);
        setFavoriteIds((prev) => new Set(prev).add(restaurantId));
      }
    }
  }, [favoriteIds]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFavorites();
  }, [fetchFavorites]);

  return { favorites, favoriteIds, loading, refreshing, toggleFavorite, refresh };
}
