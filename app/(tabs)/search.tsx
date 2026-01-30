import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { supabase } from '../../src/lib/supabase';
import { Restaurant } from '../../src/types/database';

const CUISINE_TYPES = [
  'Français',
  'Italien',
  'Japonais',
  'Chinois',
  'Mexicain',
  'Indien',
  'Libanais',
  'Thaïlandais',
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    searchRestaurants();
  }, [searchQuery, selectedCuisine]);

  async function searchRestaurants() {
    setLoading(true);
    let query = supabase.from('restaurants').select('*');

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    if (selectedCuisine) {
      query = query.contains('cuisine_type', [selectedCuisine]);
    }

    const { data, error } = await query.limit(20);

    if (error) {
      console.error('Error searching restaurants:', error);
    } else if (data) {
      setRestaurants(data);
    }
    setLoading(false);
  }

  function renderPriceRange(range: number) {
    return '€'.repeat(range);
  }

  function renderRestaurantItem({ item }: { item: Restaurant }) {
    return (
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => router.push(`/restaurant/${item.id}`)}
      >
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <Text style={styles.restaurantCuisine}>
            {item.cuisine_type?.join(', ')}
          </Text>
          <View style={styles.restaurantMeta}>
            <Text style={styles.priceRange}>
              {renderPriceRange(item.price_range)}
            </Text>
            {item.rating && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={Colors.light.warning} />
                <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={Colors.light.textSecondary}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={Colors.light.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un restaurant..."
          placeholderTextColor={Colors.light.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        horizontal
        data={CUISINE_TYPES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
        contentContainerStyle={styles.filterContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedCuisine === item && styles.filterChipActive,
            ]}
            onPress={() =>
              setSelectedCuisine(selectedCuisine === item ? null : item)
            }
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCuisine === item && styles.filterChipTextActive,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={renderRestaurantItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="restaurant-outline"
                size={48}
                color={Colors.light.textSecondary}
              />
              <Text style={styles.emptyText}>Aucun restaurant trouvé</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  filterList: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    color: Colors.light.text,
    fontSize: 14,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
});
