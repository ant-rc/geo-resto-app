import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { supabase } from '../../src/lib/supabase';
import { Restaurant } from '../../src/types/database';
import MapSection from '../../src/components/MapSection';

const DEFAULT_REGION = {
  latitude: 48.8566,
  longitude: 2.3522,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardImagePlaceholder}>
        <Ionicons name="restaurant" size={28} color={Colors.light.primary} />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text style={styles.cardCuisine} numberOfLines={1}>
          {restaurant.cuisine_type?.join(', ')}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={styles.cardPrice}>
            {'$'.repeat(restaurant.price_range)}
          </Text>
          {restaurant.rating && (
            <View style={styles.cardRating}>
              <Ionicons name="star" size={12} color={Colors.light.warning} />
              <Text style={styles.cardRatingText}>
                {restaurant.rating.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.cardAddress}>
          <Ionicons
            name="location-outline"
            size={12}
            color={Colors.light.textSecondary}
          />
          <Text style={styles.cardAddressText} numberOfLines={1}>
            {restaurant.address}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission de localisation refusée');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  async function fetchRestaurants() {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .limit(50);

    if (error) {
      console.error('Error fetching restaurants:', error);
    } else if (data) {
      setRestaurants(data);
    }
  }

  function handleMarkerPress(restaurant: Restaurant) {
    router.push(`/restaurant/${restaurant.id}`);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  const region = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    : DEFAULT_REGION;

  return (
    <View style={styles.container}>
      <MapSection
        restaurants={restaurants}
        region={region}
        onMarkerPress={handleMarkerPress}
      />

      {errorMsg && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RestaurantCard restaurant={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="restaurant-outline"
              size={48}
              color={Colors.light.textSecondary}
            />
            <Text style={styles.emptyTitle}>Aucun restaurant</Text>
            <Text style={styles.emptyText}>
              Aucun restaurant trouvé dans cette zone
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 16,
    color: Colors.light.textSecondary,
    fontSize: 16,
  },
  errorBanner: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: Colors.light.warning,
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  // Card styles
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  cardImagePlaceholder: {
    width: 80,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBody: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  cardCuisine: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 13,
    color: Colors.light.success,
    fontWeight: '600',
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardRatingText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.text,
  },
  cardAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  cardAddressText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
});
