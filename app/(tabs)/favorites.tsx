import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { supabase } from '../../src/lib/supabase';
import { Restaurant } from '../../src/types/database';

interface FavoriteWithRestaurant {
  id: string;
  restaurant: Restaurant;
}

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteWithRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
    }, [])
  );

  async function fetchFavorites() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        restaurant:restaurants (*)
      `)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching favorites:', error);
    } else if (data) {
      setFavorites(data as unknown as FavoriteWithRestaurant[]);
    }
    setLoading(false);
    setRefreshing(false);
  }

  async function removeFavorite(favoriteId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId);

    if (error) {
      console.error('Error removing favorite:', error);
    } else {
      setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
    }
  }

  function onRefresh() {
    setRefreshing(true);
    fetchFavorites();
  }

  function renderPriceRange(range: number) {
    return '€'.repeat(range);
  }

  function renderFavoriteItem({ item }: { item: FavoriteWithRestaurant }) {
    const restaurant = item.restaurant;
    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => router.push(`/restaurant/${restaurant.id}`)}
      >
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantCuisine}>
            {restaurant.cuisine_type?.join(', ')}
          </Text>
          <View style={styles.restaurantMeta}>
            <Text style={styles.priceRange}>
              {renderPriceRange(restaurant.price_range)}
            </Text>
            {restaurant.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={Colors.light.warning} />
                <Text style={styles.rating}>{restaurant.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFavorite(item.id)}
        >
          <Ionicons name="heart" size={24} color={Colors.light.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="heart-outline"
              size={64}
              color={Colors.light.textSecondary}
            />
            <Text style={styles.emptyTitle}>Aucun favori</Text>
            <Text style={styles.emptyText}>
              Ajoutez des restaurants à vos favoris pour les retrouver ici
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceRange: {
    color: Colors.light.success,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: Colors.light.text,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
