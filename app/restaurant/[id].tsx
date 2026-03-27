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
  Platform,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { supabase } from '../../src/lib/supabase';
import { Restaurant, Review, Profile } from '../../src/types/database';
import { useFavorites } from '../../src/hooks/useFavorites';
import DetailMapSection from '../../src/components/DetailMapSection';
import ImageCarousel from '../../src/components/ImageCarousel';
import TagChip from '../../src/components/TagChip';

interface ReviewWithProfile extends Review {
  profile: Pick<Profile, 'full_name' | 'avatar_url'>;
}

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { favoriteIds, toggleFavorite } = useFavorites();

  const isFavorite = favoriteIds.has(id);

  useEffect(() => {
    fetchRestaurant();
    fetchReviews();
  }, [id]);

  async function fetchRestaurant() {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      Alert.alert('Erreur', 'Impossible de charger le restaurant');
    } else if (data) {
      setRestaurant(data);
    }
    setLoading(false);
  }

  async function fetchReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*, profile:profiles (full_name, avatar_url)')
      .eq('restaurant_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setReviews(data as unknown as ReviewWithProfile[]);
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
        <Ionicons name="alert-circle-outline" size={40} color={Colors.light.border} />
        <Text style={styles.errorText}>Restaurant non trouvé</Text>
      </View>
    );
  }

  const allImages = restaurant.images?.length > 0
    ? restaurant.images
    : restaurant.image_url
      ? [restaurant.image_url]
      : [];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="chevron-back" size={20} color={Colors.light.text} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero: image carousel or map */}
        {allImages.length > 0 ? (
          <ImageCarousel images={allImages} height={280} />
        ) : (
          <DetailMapSection restaurant={restaurant} />
        )}

        <View style={styles.content}>
          {/* Title row */}
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{restaurant.name}</Text>
              <View style={styles.metaRow}>
                {restaurant.rating != null && (
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color={Colors.light.warning} />
                    <Text style={styles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
                  </View>
                )}
                <Text style={styles.price}>{'$'.repeat(restaurant.price_range)}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => toggleFavorite(id)}
              style={styles.favButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? Colors.light.error : Colors.light.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Cuisine tags */}
          <View style={styles.tags}>
            {restaurant.cuisine_type?.map((type) => (
              <TagChip key={type} label={type} />
            ))}
          </View>

          {/* Extra tags */}
          {restaurant.tags?.length > 0 && (
            <View style={styles.tags}>
              {restaurant.tags.map((tag) => (
                <TagChip key={tag} label={tag} size="small" />
              ))}
            </View>
          )}

          {/* Description */}
          {restaurant.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>À propos</Text>
              <Text style={styles.description}>{restaurant.description}</Text>
            </View>
          )}

          {/* Info card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations</Text>
            <View style={styles.infoCard}>
              <TouchableOpacity style={styles.infoRow} onPress={openMaps} activeOpacity={0.7}>
                <View style={styles.infoIcon}>
                  <Ionicons name="location-outline" size={16} color={Colors.light.primary} />
                </View>
                <Text style={styles.infoText} numberOfLines={2}>{restaurant.address}</Text>
                <Ionicons name="navigate-outline" size={15} color={Colors.light.accent} />
              </TouchableOpacity>

              {restaurant.phone && (
                <>
                  <View style={styles.infoSeparator} />
                  <TouchableOpacity style={styles.infoRow} onPress={callRestaurant} activeOpacity={0.7}>
                    <View style={styles.infoIcon}>
                      <Ionicons name="call-outline" size={16} color={Colors.light.primary} />
                    </View>
                    <Text style={styles.infoText}>{restaurant.phone}</Text>
                    <Ionicons name="chevron-forward" size={15} color={Colors.light.border} />
                  </TouchableOpacity>
                </>
              )}

              {restaurant.website && (
                <>
                  <View style={styles.infoSeparator} />
                  <TouchableOpacity style={styles.infoRow} onPress={openWebsite} activeOpacity={0.7}>
                    <View style={styles.infoIcon}>
                      <Ionicons name="globe-outline" size={16} color={Colors.light.primary} />
                    </View>
                    <Text style={styles.infoText} numberOfLines={1}>{restaurant.website}</Text>
                    <Ionicons name="open-outline" size={15} color={Colors.light.border} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Map preview (if hero was images) */}
          {allImages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Localisation</Text>
              <View style={styles.mapPreview}>
                <DetailMapSection restaurant={restaurant} />
              </View>
            </View>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Avis ({reviews.length})
              </Text>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Ionicons name="person" size={14} color={Colors.light.primary} />
                    </View>
                    <View style={styles.reviewMeta}>
                      <Text style={styles.reviewAuthor}>
                        {review.profile?.full_name ?? 'Utilisateur'}
                      </Text>
                      <View style={styles.reviewStars}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Ionicons
                            key={i}
                            name={i < review.rating ? 'star' : 'star-outline'}
                            size={12}
                            color={i < review.rating ? Colors.light.warning : Colors.light.border}
                          />
                        ))}
                      </View>
                    </View>
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={callRestaurant}
              activeOpacity={0.8}
            >
              <Ionicons name="call-outline" size={17} color={Colors.light.primary} />
              <Text style={styles.secondaryBtnText}>Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={openMaps}
              activeOpacity={0.85}
            >
              <Ionicons name="navigate" size={17} color={Colors.light.textOnPrimary} />
              <Text style={styles.primaryBtnText}>Itinéraire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.light.background, gap: 12,
  },
  errorText: { fontSize: 15, color: Colors.light.textSecondary },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 44,
    left: 20, zIndex: 10,
    width: 40, height: 40, borderRadius: 14,
    backgroundColor: Colors.light.surfaceGlass,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.light.surfaceGlassBorder,
    ...(Platform.OS !== 'web'
      ? { elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }
      : {}),
  },
  content: { padding: 24, paddingTop: 20 },
  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 14,
  },
  titleBlock: { flex: 1, marginRight: 12, gap: 8 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.light.text, letterSpacing: -0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    backgroundColor: '#FEF3C7',
  },
  ratingText: { fontSize: 13, fontWeight: '600', color: Colors.light.text },
  price: { fontSize: 15, color: Colors.light.success, fontWeight: '600' },
  favButton: {
    width: 44, height: 44, borderRadius: 16,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 16, fontWeight: '600', color: Colors.light.text,
    marginBottom: 12, letterSpacing: -0.2,
  },
  description: { fontSize: 14, lineHeight: 22, color: Colors.light.textSecondary },
  infoCard: {
    backgroundColor: Colors.light.surface, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.light.borderLight, overflow: 'hidden',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  infoIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  infoText: { flex: 1, fontSize: 14, color: Colors.light.text, letterSpacing: -0.1 },
  infoSeparator: { height: 1, backgroundColor: Colors.light.borderLight, marginLeft: 58 },
  mapPreview: {
    height: 180, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  reviewCard: {
    backgroundColor: Colors.light.surface, borderRadius: 16,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  reviewMeta: { gap: 2 },
  reviewAuthor: { fontSize: 13, fontWeight: '600', color: Colors.light.text },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontSize: 13, lineHeight: 20, color: Colors.light.textSecondary },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', paddingVertical: 15, borderRadius: 16,
    borderWidth: 1.5, borderColor: Colors.light.primary,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  secondaryBtnText: {
    color: Colors.light.primary, fontSize: 15, fontWeight: '600', letterSpacing: -0.2,
  },
  primaryBtn: {
    flex: 1, flexDirection: 'row', paddingVertical: 15, borderRadius: 16,
    backgroundColor: Colors.light.primary,
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  primaryBtnText: {
    color: Colors.light.textOnPrimary, fontSize: 15, fontWeight: '600', letterSpacing: -0.2,
  },
});
