import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { Colors } from '../../src/constants/colors';
import { supabase } from '../../src/lib/supabase';
import { Restaurant } from '../../src/types/database';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurant();
    checkFavorite();
  }, [id]);

  async function fetchRestaurant() {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching restaurant:', error);
    } else if (data) {
      setRestaurant(data);
    }
    setLoading(false);
  }

  async function checkFavorite() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('restaurant_id', id)
      .single();

    setIsFavorite(!!data);
  }

  async function toggleFavorite() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour ajouter des favoris');
      return;
    }

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('restaurant_id', id);
      setIsFavorite(false);
    } else {
      await supabase.from('favorites').insert({
        user_id: user.id,
        restaurant_id: id,
      });
      setIsFavorite(true);
    }
  }

  function openMaps() {
    if (!restaurant) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`;
    Linking.openURL(url);
  }

  function callRestaurant() {
    if (!restaurant?.phone) return;
    Linking.openURL(`tel:${restaurant.phone}`);
  }

  function openWebsite() {
    if (!restaurant?.website) return;
    Linking.openURL(restaurant.website);
  }

  function renderPriceRange(range: number) {
    return '€'.repeat(range);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Restaurant non trouvé</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            }}
          />
        </MapView>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{restaurant.name}</Text>
            <TouchableOpacity onPress={toggleFavorite}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={28}
                color={isFavorite ? Colors.light.error : Colors.light.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.metaContainer}>
            <Text style={styles.cuisine}>
              {restaurant.cuisine_type?.join(' • ')}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.price}>
                {renderPriceRange(restaurant.price_range)}
              </Text>
              {restaurant.rating && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color={Colors.light.warning} />
                  <Text style={styles.rating}>{restaurant.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {restaurant.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{restaurant.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoCard}>
            <TouchableOpacity style={styles.infoRow} onPress={openMaps}>
              <Ionicons
                name="location-outline"
                size={20}
                color={Colors.light.primary}
              />
              <Text style={styles.infoText}>{restaurant.address}</Text>
              <Ionicons
                name="navigate-outline"
                size={20}
                color={Colors.light.primary}
              />
            </TouchableOpacity>

            {restaurant.phone && (
              <>
                <View style={styles.separator} />
                <TouchableOpacity style={styles.infoRow} onPress={callRestaurant}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={Colors.light.primary}
                  />
                  <Text style={styles.infoText}>{restaurant.phone}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.light.textSecondary}
                  />
                </TouchableOpacity>
              </>
            )}

            {restaurant.website && (
              <>
                <View style={styles.separator} />
                <TouchableOpacity style={styles.infoRow} onPress={openWebsite}>
                  <Ionicons
                    name="globe-outline"
                    size={20}
                    color={Colors.light.primary}
                  />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {restaurant.website}
                  </Text>
                  <Ionicons
                    name="open-outline"
                    size={20}
                    color={Colors.light.textSecondary}
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.directionsButton} onPress={openMaps}>
          <Ionicons name="navigate" size={20} color="#FFFFFF" />
          <Text style={styles.directionsButtonText}>Itinéraire</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  errorText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  mapContainer: {
    height: 200,
  },
  map: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    flex: 1,
    marginRight: 16,
  },
  metaContainer: {
    marginTop: 8,
  },
  cuisine: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  price: {
    fontSize: 16,
    color: Colors.light.success,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.textSecondary,
  },
  infoCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: 48,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
