import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Favorite, Restaurant } from '@/types/database';
import { MOCK_RESTAURANTS } from '@/data/mockRestaurants';

export interface FavoriteWithRestaurant {
  id: string;
  restaurant: Restaurant;
}

interface FavoritesContextType {
  favorites: FavoriteWithRestaurant[];
  favoriteIds: Set<string>;
  loading: boolean;
  refreshing: boolean;
  toggleFavorite: (restaurantId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  favoriteIds: new Set(),
  loading: true,
  refreshing: false,
  toggleFavorite: async () => {},
  refresh: async () => {},
});

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteWithRestaurant[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setRefreshing(false);
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
      setFavoriteIds(new Set(data.map((f) => f.restaurant_id)));
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
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(restaurantId)) {
          next.delete(restaurantId);
          setFavorites((f) => f.filter((fav) => fav.restaurant.id !== restaurantId));
        } else {
          next.add(restaurantId);
          const restaurant = MOCK_RESTAURANTS.find((r) => r.id === restaurantId);
          if (restaurant) {
            setFavorites((f) => [...f, { id: `local-${Date.now()}`, restaurant }]);
          }
        }
        return next;
      });
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

  return (
    <FavoritesContext.Provider
      value={{ favorites, favoriteIds, loading, refreshing, toggleFavorite, refresh }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext(): FavoritesContextType {
  return useContext(FavoritesContext);
}
