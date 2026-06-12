import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { MOCK_RESTAURANTS } from '@/data/mockRestaurants';
import {
  FavoriteWithRestaurant,
  mapFavoriteRows,
  mapFavoriteRow,
} from '@/lib/mappers/favorites';

export type { FavoriteWithRestaurant };

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
  const pendingToggles = useRef<Set<string>>(new Set());

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
      .eq('user_id', user.id);

    if (error) {
      Alert.alert('Erreur', 'Impossible de charger les favoris');
    } else if (data) {
      const favs = mapFavoriteRows(data);
      setFavorites(favs);
      setFavoriteIds(new Set(favs.map((f) => f.restaurant.id)));
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [fetchFavorites])
  );

  // Reset on sign-out / refetch on sign-in so favorites never leak across users.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setFavorites([]);
        setFavoriteIds(new Set());
        pendingToggles.current.clear();
      } else if (event === 'SIGNED_IN') {
        fetchFavorites();
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(async (restaurantId: string) => {
    // Prevent inconsistent state from rapid double-taps on the same restaurant.
    if (pendingToggles.current.has(restaurantId)) {
      return;
    }
    pendingToggles.current.add(restaurantId);

    try {
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
              setFavorites((f) => [...f, { id: `local-${restaurantId}`, restaurant }]);
            }
          }
          return next;
        });
        return;
      }

      const isFav = favoriteIds.has(restaurantId);

      if (isFav) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId);

        // Only mutate local state once the server confirms — avoids UI/DB desync.
        if (error) {
          Alert.alert('Erreur', 'Impossible de retirer ce favori. Réessayez.');
          return;
        }

        setFavorites((prev) => prev.filter((f) => f.restaurant.id !== restaurantId));
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(restaurantId);
          return next;
        });
      } else {
        const { data, error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, restaurant_id: restaurantId } as never)
          .select('id, restaurant_id, restaurant:restaurants (*)')
          .single();

        if (error) {
          Alert.alert('Erreur', "Impossible d'ajouter ce favori. Réessayez.");
          return;
        }

        const fav = mapFavoriteRow(data);
        if (fav) {
          setFavorites((prev) => [...prev, fav]);
          setFavoriteIds((prev) => new Set(prev).add(restaurantId));
        }
      }
    } finally {
      pendingToggles.current.delete(restaurantId);
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
