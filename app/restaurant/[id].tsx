import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Share,
  Dimensions,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { supabase } from '../../src/lib/supabase';
import { Restaurant, Review, Profile } from '../../src/types/database';
import { useFavoritesContext } from '../../src/context/FavoritesContext';
import { MOCK_RESTAURANTS } from '../../src/data/mockRestaurants';
import { MOCK_MENUS, MenuItem } from '../../src/data/mockMenus';
import DetailMapSection from '../../src/components/DetailMapSection';
import ImageCarousel from '../../src/components/ImageCarousel';
import TagChip from '../../src/components/TagChip';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = 320;

const MENU_CATEGORIES = [
  { key: 'entree', label: 'Entrées' },
  { key: 'plat', label: 'Plats' },
  { key: 'dessert', label: 'Desserts' },
  { key: 'boisson', label: 'Boissons' },
] as const;

interface ReviewWithProfile extends Review {
  profile: Pick<Profile, 'full_name' | 'avatar_url'>;
}

function formatDistance(distance: number | undefined): string {
  if (distance == null) return '\u2014';
  if (distance < 1) return `${Math.round(distance * 1000)} m`;
  return `${distance.toFixed(1)} km`;
}

function formatWalkTime(distance: number | undefined): string {
  if (distance == null) return '\u2014';
  const minutes = Math.round((distance / 5) * 60);
  if (minutes < 1) return '< 1 min';
  return `${minutes} min`;
}

function formatPriceRange(priceRange: number): string {
  return '\u20AC'.repeat(priceRange);
}

function formatMenuPrice(price: number): string {
  return `${price.toFixed(2).replace('.', ',')} \u20AC`;
}

function getMockReviews(restaurantId: string): ReviewWithProfile[] {
  return [
    {
      id: 'rev-1',
      user_id: 'u1',
      restaurant_id: restaurantId,
      rating: 5,
      comment: 'Excellent ! Les plats sont d\u00e9licieux et le service impeccable.',
      created_at: '2026-02-15T12:00:00Z',
      updated_at: '2026-02-15T12:00:00Z',
      profile: { full_name: 'Marie L.', avatar_url: null },
    },
    {
      id: 'rev-2',
      user_id: 'u2',
      restaurant_id: restaurantId,
      rating: 4,
      comment: 'Tr\u00e8s bon rapport qualit\u00e9-prix. La terrasse est agr\u00e9able.',
      created_at: '2026-03-01T18:00:00Z',
      updated_at: '2026-03-01T18:00:00Z',
      profile: { full_name: 'Thomas D.', avatar_url: null },
    },
    {
      id: 'rev-3',
      user_id: 'u3',
      restaurant_id: restaurantId,
      rating: 5,
      comment: 'Un vrai coup de c\u0153ur. Je recommande vivement la sp\u00e9cialit\u00e9 du chef.',
      created_at: '2026-03-10T20:00:00Z',
      updated_at: '2026-03-10T20:00:00Z',
      profile: { full_name: 'Sophie M.', avatar_url: null },
    },
  ];
}

export default function RestaurantDetailScreen() {
  const { id, distance: rawDistance } = useLocalSearchParams<{
    id: string;
    distance?: string;
  }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { favoriteIds, toggleFavorite } = useFavoritesContext();

  const isFavorite = favoriteIds.has(id);
  const distance = rawDistance ? parseFloat(rawDistance) : undefined;

  const menuItems = MOCK_MENUS[id] ?? [];
  const groupedMenu = MENU_CATEGORIES.reduce<
    Record<string, MenuItem[]>
  >((acc, { key, label }) => {
    const items = menuItems.filter((item: MenuItem) => item.category === key);
    if (items.length > 0) {
      acc[label] = items;
    }
    return acc;
  }, {});
  const hasMenu = Object.keys(groupedMenu).length > 0;

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

    if (data) {
      setRestaurant(data);
    } else {
      const mock = MOCK_RESTAURANTS.find((r) => r.id === id);
      if (mock) {
        setRestaurant(mock);
      } else if (error) {
        Alert.alert('Erreur', 'Impossible de charger le restaurant');
      }
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

    if (data && data.length > 0) {
      setReviews(data as unknown as ReviewWithProfile[]);
    } else {
      setReviews(getMockReviews(id));
    }
  }

  async function handleShare() {
    if (!restaurant) return;
    try {
      await Share.share({
        message: `${restaurant.name} - ${restaurant.address}`,
        title: restaurant.name,
      });
    } catch (_error) {
      // Share dismissed or failed silently
    }
  }

  function handleReservation() {
    Alert.alert(
      'R\u00e9servation envoy\u00e9e !',
      'Votre demande de r\u00e9servation a bien \u00e9t\u00e9 transmise au restaurant. Vous recevrez une confirmation prochainement.',
    );
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
        <Text style={styles.errorText}>Restaurant non trouv\u00e9</Text>
      </View>
    );
  }

  const allImages =
    restaurant.images?.length > 0
      ? restaurant.images
      : restaurant.image_url
        ? [restaurant.image_url]
        : [];

  const metaParts: string[] = [];
  if (restaurant.cuisine_type?.length > 0) {
    metaParts.push(restaurant.cuisine_type[0]);
  }
  if (restaurant.address) {
    const cityPart = restaurant.address.split(',').pop()?.trim() ?? '';
    if (cityPart) metaParts.push(cityPart);
  }
  metaParts.push(formatPriceRange(restaurant.price_range));

  // Allergy match placeholder: show if restaurant has matching tags
  // TODO: Compare restaurant.tags with user preferences when implemented
  const showAllergyMatch = false;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          {allImages.length > 0 ? (
            <ImageCarousel images={allImages} height={HERO_HEIGHT} />
          ) : (
            <View style={{ height: HERO_HEIGHT }}>
              <DetailMapSection restaurant={restaurant} />
            </View>
          )}

          {/* Floating buttons on hero */}
          <View style={styles.heroOverlay}>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => router.back()}
              activeOpacity={0.8}
              accessibilityLabel="Retour"
              accessibilityRole="button"
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.heroRightBtns}>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={handleShare}
                activeOpacity={0.8}
                accessibilityLabel="Partager"
                accessibilityRole="button"
              >
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => toggleFavorite(id)}
                activeOpacity={0.7}
                accessibilityLabel={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                accessibilityRole="button"
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? Colors.light.primary : '#FFFFFF'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content - overlaps hero with rounded top */}
        <View style={styles.content}>
          {/* Title + Rating badge */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {restaurant.name}
            </Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={Colors.light.primary} />
              <Text style={styles.ratingText}>
                {restaurant.rating != null ? restaurant.rating.toFixed(1) : '\u2014'}
              </Text>
            </View>
          </View>

          {/* Meta line: cuisine . city . price */}
          <View style={styles.metaRow}>
            {metaParts.map((part, index) => (
              <View key={`meta-${index}`} style={styles.metaItem}>
                {index > 0 && <View style={styles.metaDot} />}
                <Text style={styles.metaText}>{part}</Text>
              </View>
            ))}
          </View>

          {/* Allergy Match card (conditional placeholder) */}
          {showAllergyMatch && (
            <View style={styles.allergyCard}>
              <View style={styles.allergyIcon}>
                <Ionicons name="leaf" size={28} color={Colors.light.secondary} />
              </View>
              <View style={styles.allergyTextContainer}>
                <Text style={styles.allergyTitle}>Perfect Allergy Match</Text>
                <Text style={styles.allergyDescription}>
                  Ce restaurant est 100% compatible avec votre profil alimentaire.
                </Text>
              </View>
            </View>
          )}

          {/* Stats bar: Distance / Walk / Reviews */}
          <View style={styles.statsBar}>
            <View style={styles.statCol}>
              <Ionicons name="navigate" size={20} color={Colors.light.primary} />
              <Text style={styles.statValue}>{formatDistance(distance)}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCol}>
              <Ionicons name="time" size={20} color={Colors.light.primary} />
              <Text style={styles.statValue}>{formatWalkTime(distance)}</Text>
              <Text style={styles.statLabel}>Walk</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statCol}>
              <Ionicons name="chatbubble-ellipses" size={20} color={Colors.light.primary} />
              <Text style={styles.statValue}>{reviews.length}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>

          {/* Tags */}
          {(restaurant.cuisine_type?.length > 0 || restaurant.tags?.length > 0) && (
            <View style={styles.tags}>
              {restaurant.cuisine_type?.map((type) => (
                <TagChip key={type} label={type} />
              ))}
              {restaurant.tags?.map((tag) => (
                <TagChip key={tag} label={tag} size="small" />
              ))}
            </View>
          )}

          {/* Menu Section */}
          {hasMenu && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Menu</Text>
              {MENU_CATEGORIES.map(({ label }) => {
                const items = groupedMenu[label];
                if (!items) return null;
                return (
                  <View key={label} style={styles.menuCategory}>
                    <Text style={styles.menuCategoryTitle}>{label}</Text>
                    {items.map((item) => (
                      <View key={item.id} style={styles.menuItem}>
                        <Image
                          source={{ uri: item.image_url }}
                          style={styles.menuItemImage}
                          accessibilityLabel={item.name}
                        />
                        <View style={styles.menuItemContent}>
                          <View style={styles.menuItemHeader}>
                            <Text style={styles.menuItemName} numberOfLines={1}>
                              {item.name}
                            </Text>
                            <Text style={styles.menuItemPrice}>
                              {formatMenuPrice(item.price)}
                            </Text>
                          </View>
                          <Text
                            style={styles.menuItemDescription}
                            numberOfLines={2}
                          >
                            {item.description}
                          </Text>
                          {item.tags && item.tags.length > 0 && (
                            <View style={styles.menuItemTags}>
                              {item.tags.map((tag) => (
                                <TagChip key={tag} label={tag} size="small" />
                              ))}
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          )}

          {/* Description */}
          {restaurant.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>\u00c0 propos</Text>
              <Text style={styles.description}>{restaurant.description}</Text>
            </View>
          )}

          {/* Info card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations</Text>
            <View style={styles.infoCard}>
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`;
                  import('react-native').then(({ Linking: L }) => L.openURL(url));
                }}
                activeOpacity={0.7}
                accessibilityLabel={`Adresse : ${restaurant.address}`}
              >
                <View style={styles.infoIcon}>
                  <Ionicons name="location-outline" size={16} color={Colors.light.primary} />
                </View>
                <Text style={styles.infoText} numberOfLines={2}>
                  {restaurant.address}
                </Text>
                <Ionicons name="navigate-outline" size={15} color={Colors.light.accent} />
              </TouchableOpacity>

              {restaurant.phone && (
                <>
                  <View style={styles.infoSeparator} />
                  <TouchableOpacity
                    style={styles.infoRow}
                    onPress={() => {
                      import('react-native').then(({ Linking: L }) =>
                        L.openURL(`tel:${restaurant.phone}`),
                      );
                    }}
                    activeOpacity={0.7}
                  >
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
                  <TouchableOpacity
                    style={styles.infoRow}
                    onPress={() => {
                      import('react-native').then(({ Linking: L }) =>
                        L.openURL(restaurant.website!),
                      );
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.infoIcon}>
                      <Ionicons name="globe-outline" size={16} color={Colors.light.primary} />
                    </View>
                    <Text style={styles.infoText} numberOfLines={1}>
                      {restaurant.website}
                    </Text>
                    <Ionicons name="open-outline" size={15} color={Colors.light.border} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Map preview */}
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
              <Text style={styles.sectionTitle}>Avis ({reviews.length})</Text>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewInitial}>
                        {(review.profile?.full_name ?? 'U').charAt(0).toUpperCase()}
                      </Text>
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
                            color={
                              i < review.rating
                                ? Colors.light.warning
                                : Colors.light.border
                            }
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
        </View>
      </ScrollView>

      {/* Bottom fixed CTA */}
      <View style={styles.bottomCta}>
        <TouchableOpacity
          style={styles.ctaBtnMuted}
          onPress={handleShare}
          activeOpacity={0.8}
          accessibilityLabel="Partager"
          accessibilityRole="button"
        >
          <Ionicons name="share-social" size={20} color={Colors.light.text} />
          <Text style={styles.ctaBtnMutedText}>Partager</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ctaBtnPrimary}
          onPress={handleReservation}
          activeOpacity={0.8}
          accessibilityLabel="Réserver"
          accessibilityRole="button"
        >
          <Ionicons name="calendar" size={20} color={Colors.light.textOnPrimary} />
          <Text style={styles.ctaBtnPrimaryText}>Réserver</Text>
        </TouchableOpacity>
      </View>
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
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  /* Hero */
  heroContainer: {
    position: 'relative',
    height: HERO_HEIGHT,
  },
  heroOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 44,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroRightBtns: {
    flexDirection: 'row',
    gap: 12,
  },

  /* Content overlap */
  content: {
    marginTop: -24,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingHorizontal: 20,
    gap: 24,
  },

  /* Title + Rating */
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.primary,
  },

  /* Meta line */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(99, 115, 99, 0.4)',
    marginHorizontal: 8,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },

  /* Allergy Match card */
  allergyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.light.accentLight,
    borderWidth: 2,
    borderColor: Colors.light.secondary,
    borderRadius: 16,
    padding: 16,
  },
  allergyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 118, 110, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  allergyTextContainer: {
    flex: 1,
  },
  allergyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 2,
  },
  allergyDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },

  /* Stats bar */
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.light.border,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* Tags */
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  /* Sections */
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.textSecondary,
  },

  /* Menu */
  menuCategory: {
    gap: 8,
  },
  menuCategoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.secondary,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    padding: 12,
  },
  menuItemImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: Colors.light.surfaceWarm,
  },
  menuItemContent: {
    flex: 1,
    gap: 4,
  },
  menuItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  menuItemName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  menuItemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  menuItemDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.light.textSecondary,
  },
  menuItemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },

  /* Info Card */
  infoCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    letterSpacing: -0.1,
  },
  infoSeparator: {
    height: 1,
    backgroundColor: Colors.light.borderLight,
    marginLeft: 58,
  },

  /* Map */
  mapPreview: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },

  /* Reviews */
  reviewCard: {
    backgroundColor: Colors.light.surfaceWarm,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  reviewMeta: {
    gap: 2,
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.text,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.light.textSecondary,
  },

  /* Bottom CTA */
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    backgroundColor: 'rgba(251, 255, 255, 0.80)',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  ctaBtnMuted: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.light.surfaceWarm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaBtnMutedText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  ctaBtnPrimary: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...(Platform.OS !== 'web'
      ? {
          shadowColor: Colors.light.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        }
      : {}),
  },
  ctaBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.textOnPrimary,
  },
});
