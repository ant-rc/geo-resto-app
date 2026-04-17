import { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Animated,
  Dimensions,
  Platform,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { useLocation } from '../../src/hooks/useLocation';
import { useRecommendations } from '../../src/hooks/useRecommendations';
import { useFavoritesContext } from '../../src/context/FavoritesContext';
import { Restaurant } from '../../src/types/database';
import MapSection from '../../src/components/MapSection';
import RestaurantCard from '../../src/components/RestaurantCard';
import SectionHeader from '../../src/components/SectionHeader';
import { MOCK_RESTAURANTS } from '../../src/data/mockRestaurants';
import * as Location from 'expo-location';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_PEEK = Math.round(SCREEN_HEIGHT * 0.34);
const SHEET_FULL = SCREEN_HEIGHT * 0.75;

const QUICK_FILTERS = ['Tout', 'Vegan', 'Halal', 'Brunch', 'Terrasse'];

type NotificationIcon =
  | 'pricetag'
  | 'calendar'
  | 'restaurant'
  | 'diamond'
  | 'alert-circle'
  | 'musical-notes'
  | 'mic'
  | 'wine'
  | 'sparkles';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  icon: NotificationIcon;
  time: string;
  unread: boolean;
};

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Nouvelle offre',
    message: '-20% chez Le Potager de Charlotte ce soir',
    icon: 'pricetag',
    time: 'Il y a 2h',
    unread: true,
  },
  {
    id: 'notif-2',
    title: 'Réservation confirmée',
    message: 'Table pour 2 le 22 avril à 20:00 chez Chez Janou',
    icon: 'calendar',
    time: 'Hier',
    unread: true,
  },
  {
    id: 'notif-3',
    title: 'Nouveau restaurant',
    message: "L'Atelier Végétal vient d'ouvrir près de chez vous",
    icon: 'restaurant',
    time: 'Il y a 3 jours',
    unread: false,
  },
  {
    id: 'notif-4',
    title: 'Jam Session ce soir',
    message: 'Le Potager de Charlotte organise une jam jazz à 21:00',
    icon: 'musical-notes',
    time: 'Il y a 4 heures',
    unread: true,
  },
  {
    id: 'notif-5-event',
    title: 'Concert à venir',
    message: 'Chez Janou : quartet acoustique samedi 27 avril à 20:00',
    icon: 'mic',
    time: 'Hier',
    unread: false,
  },
  {
    id: 'notif-6-event',
    title: 'Dégustation de vins',
    message: 'Sakura Ramen : dégustation saké-sushi jeudi 2 mai',
    icon: 'wine',
    time: 'Il y a 2 jours',
    unread: false,
  },
  {
    id: 'notif-5',
    title: 'Promotion Tastly',
    message: 'Découvrez le plan Premium gratuit 7 jours',
    icon: 'diamond',
    time: 'Il y a 1 semaine',
    unread: false,
  },
  {
    id: 'notif-6',
    title: 'Restaurant fermé',
    message: "La Trattoria Romana est fermée aujourd'hui",
    icon: 'alert-circle',
    time: 'Il y a 1 semaine',
    unread: false,
  },
];

function extractCity(address: string): string {
  const match = address.match(/\d{5}\s+([^,]+)$/);
  if (match && match[1]) return match[1].trim();
  const parts = address.split(',');
  return parts[parts.length - 1]?.trim() || '';
}

function formatPrice(priceRange: number): string {
  return '€'.repeat(Math.max(1, Math.min(4, priceRange)));
}

export default function HomeScreen() {
  const { location, loading: locationLoading } = useLocation();
  const { recommended, nearby, topRated, loading: recsLoading } = useRecommendations(location);
  const { favoriteIds, toggleFavorite } = useFavoritesContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Tout');
  const [cityName, setCityName] = useState('Paris');
  const [userName, setUserName] = useState('U');
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const sheetAnim = useRef(new Animated.Value(SHEET_PEEK)).current;

  const showSuggestions = searchQuery.length > 0 && searchFocused;

  const suggestions = useMemo<Restaurant[]>(() => {
    if (searchQuery.length === 0) return [];
    const q = searchQuery.toLowerCase().trim();
    return MOCK_RESTAURANTS.filter((r) => {
      const nameMatch = r.name.toLowerCase().includes(q);
      const cuisineMatch = r.cuisine_type.some((c) => c.toLowerCase().includes(q));
      const addressMatch = r.address.toLowerCase().includes(q);
      return nameMatch || cuisineMatch || addressMatch;
    }).slice(0, 5);
  }, [searchQuery]);

  function handleSuggestionPress(id: string) {
    setSearchQuery('');
    setSearchFocused(false);
    router.push(`/restaurant/${id}`);
  }

  const allRestaurants = nearby;
  const loading = locationLoading || recsLoading;

  useEffect(() => {
    async function reverseGeocode() {
      if (!location) return;
      try {
        const [result] = await Location.reverseGeocodeAsync({
          latitude: location.latitude,
          longitude: location.longitude,
        });
        if (result) {
          const district = result.district || result.subregion || '';
          const city = result.city || 'Paris';
          setCityName(district ? `${district}, ${city}` : city);
        }
      } catch (_err) {
        setCityName('Paris');
      }
    }
    reverseGeocode();
  }, [location]);

  function handleMarkerPress(restaurant: Restaurant) {
    router.push(`/restaurant/${restaurant.id}`);
  }

  function toggleSheet() {
    const toValue = sheetExpanded ? SHEET_PEEK : SHEET_FULL;
    Animated.spring(sheetAnim, {
      toValue,
      useNativeDriver: false,
      tension: 65,
      friction: 11,
    }).start();
    setSheetExpanded(!sheetExpanded);
  }

  const region = location
    ? {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    : {
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

  if (loading) {
    return (
      <View style={styles.centered}>
        <View style={styles.loaderWrap}>
          <Ionicons name="compass" size={32} color={Colors.light.primary} />
          <ActivityIndicator size="small" color={Colors.light.accent} style={{ marginTop: 12 }} />
          <Text style={styles.loaderText}>Localisation...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapSection
        restaurants={allRestaurants}
        region={region}
        onMarkerPress={handleMarkerPress}
      />

      {/* Header: avatar + location + notification */}
      <View style={styles.headerFloat}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName}</Text>
            </View>
            <View style={styles.locationBlock}>
              <Text style={styles.locationLabel}>LOCALISATION</Text>
              <TouchableOpacity style={styles.locationRow} activeOpacity={0.7}>
                <Text style={styles.locationCity} numberOfLines={1}>
                  {cityName}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={14}
                  color={Colors.light.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            activeOpacity={0.7}
            onPress={() => setNotificationsModalVisible(true)}
          >
            <Ionicons name="notifications" size={20} color={Colors.light.text} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Restaurant, cuisine, quartier..."
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onSubmitEditing={() =>
              router.push({ pathname: '/(tabs)/search', params: { q: searchQuery } })
            }
          />
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Ionicons name="options-outline" size={17} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {/* Search suggestions */}
        {showSuggestions && (
          <View style={styles.suggestionsWrap}>
            {suggestions.length > 0 ? (
              suggestions.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.suggestionItem,
                    index < suggestions.length - 1 && styles.suggestionItemDivider,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => handleSuggestionPress(item.id)}
                >
                  <Image
                    source={{ uri: item.image_url ?? undefined }}
                    style={styles.suggestionThumb}
                  />
                  <View style={styles.suggestionTextBlock}>
                    <Text style={styles.suggestionName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.suggestionMeta} numberOfLines={1}>
                      {item.cuisine_type[0] ?? 'Restaurant'} · {formatPrice(item.price_range)} ·{' '}
                      {extractCity(item.address)}
                    </Text>
                  </View>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={Colors.light.textSecondary}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.suggestionEmpty}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={Colors.light.textSecondary}
                />
                <Text style={styles.suggestionEmptyText}>Aucun résultat</Text>
              </View>
            )}
          </View>
        )}

        {/* Quick filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {QUICK_FILTERS.map((label) => {
            const isActive = activeFilter === label;
            return (
              <TouchableOpacity
                key={label}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveFilter(label)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* My location button */}
      <TouchableOpacity style={styles.locateBtn} activeOpacity={0.8}>
        <Ionicons name="navigate" size={18} color={Colors.light.primary} />
      </TouchableOpacity>

      {/* Bottom sheet */}
      <Animated.View style={[styles.sheet, { height: sheetAnim }]}>
        <TouchableOpacity
          style={styles.sheetHandle}
          onPress={toggleSheet}
          activeOpacity={0.8}
        >
          <View style={styles.sheetHandleBar} />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          {/* Recommended section - "Parfait pour vous" */}
          {recommended.length > 0 && (
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderWrap}>
                <SectionHeader
                  title="Parfait pour vous"
                  subtitle="Basé sur vos préférences"
                  actionLabel="Voir tout"
                  onAction={() =>
                    router.push({ pathname: '/(tabs)/search', params: { filter: 'recommended' } })
                  }
                  icon="sparkles"
                />
              </View>
              <FlatList
                data={recommended}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <RestaurantCard
                    restaurant={item}
                    variant="standard"
                    isFavorite={favoriteIds.has(item.id)}
                    onFavoriteToggle={() => toggleFavorite(item.id)}
                  />
                )}
              />
            </View>
          )}

          {/* Nearby section */}
          {nearby.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderWrap}>
              <SectionHeader
                title="À proximité"
                subtitle={`${nearby.length} restaurants`}
                actionLabel="Voir tout"
                onAction={() =>
                  router.push({ pathname: '/(tabs)/search', params: { filter: 'nearby' } })
                }
                icon="location"
              />
            </View>
            <FlatList
              data={nearby.slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              keyExtractor={(item) => `nearby-${item.id}`}
              renderItem={({ item }) => (
                <RestaurantCard
                  restaurant={item}
                  variant="standard"
                  isFavorite={favoriteIds.has(item.id)}
                  onFavoriteToggle={() => toggleFavorite(item.id)}
                />
              )}
            />
          </View>
          )}

          {/* Top rated section */}
          {topRated.length > 0 && (
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderWrap}>
                <SectionHeader
                  title="Les mieux notés"
                  subtitle="Les favoris de la communauté"
                  actionLabel="Voir tout"
                  onAction={() =>
                    router.push({ pathname: '/(tabs)/search', params: { filter: 'top-rated' } })
                  }
                  icon="trophy"
                />
              </View>
              <FlatList
                data={topRated}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                keyExtractor={(item) => `top-${item.id}`}
                renderItem={({ item }) => (
                  <RestaurantCard
                    restaurant={item}
                    variant="standard"
                    isFavorite={favoriteIds.has(item.id)}
                    onFavoriteToggle={() => toggleFavorite(item.id)}
                  />
                )}
              />
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Notifications modal */}
      <Modal
        visible={notificationsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setNotificationsModalVisible(false)}
      >
        <View style={styles.notifModalContainer}>
          <View style={styles.notifModalHeader}>
            <TouchableOpacity
              style={styles.notifCloseBtn}
              onPress={() => setNotificationsModalVisible(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.notifModalTitle}>Notifications</Text>
            <View style={styles.notifCloseBtn} />
          </View>

          {MOCK_NOTIFICATIONS.every((n) => !n.unread) &&
          MOCK_NOTIFICATIONS.length === 0 ? (
            <View style={styles.notifEmpty}>
              <Ionicons
                name="notifications-off"
                size={40}
                color={Colors.light.textSecondary}
              />
              <Text style={styles.notifEmptyText}>Aucune notification</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.notifList}
              showsVerticalScrollIndicator={false}
            >
              {MOCK_NOTIFICATIONS.map((notif) => (
                <View key={notif.id} style={styles.notifCard}>
                  <View style={styles.notifIconWrap}>
                    <Ionicons
                      name={notif.icon}
                      size={20}
                      color={Colors.light.primary}
                    />
                  </View>
                  <View style={styles.notifTextBlock}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    <Text style={styles.notifMessage} numberOfLines={2}>
                      {notif.message}
                    </Text>
                    <Text style={styles.notifTime}>{notif.time}</Text>
                  </View>
                  {notif.unread && <View style={styles.notifUnreadDot} />}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>

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
  loaderWrap: {
    alignItems: 'center',
    gap: 4,
  },
  loaderText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.light.textSecondary,
    letterSpacing: 0.3,
  },

  /* ── Header ── */
  headerFloat: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: 'rgba(251, 255, 255, 0.85)',
    ...(Platform.OS !== 'web'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 8,
        }
      : {}),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primaryLight,
    borderWidth: 2.5,
    borderColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  locationBlock: {
    gap: 1,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationCity: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.3,
    maxWidth: 200,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.surfaceGlass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.surfaceGlassBorder,
    ...(Platform.OS !== 'web'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 4,
        }
      : {}),
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.accent,
    borderWidth: 1.5,
    borderColor: Colors.light.surface,
  },

  /* ── Search bar ── */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceGlass,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.light.surfaceGlassBorder,
    ...(Platform.OS === 'web'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
        }
      : {
          elevation: 12,
          shadowColor: '#1A3C34',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.14,
          shadowRadius: 20,
        }),
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    letterSpacing: 0.1,
    fontWeight: '600',
  },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* ── Filter chips ── */
  chipsRow: {
    gap: 8,
    paddingRight: 20,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
  },
  chipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  chipLabelActive: {
    color: Colors.light.textOnPrimary,
  },

  /* ── Locate button ── */
  locateBtn: {
    position: 'absolute',
    right: 20,
    bottom: SHEET_PEEK + 16,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...(Platform.OS !== 'web'
      ? {
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
        }
      : {}),
  },

  /* ── Bottom sheet ── */
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...(Platform.OS === 'web'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
        }
      : {
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
        }),
  },
  sheetHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  sheetHandleBar: {
    width: 36,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.light.border,
  },
  sheetContent: {
    paddingTop: 4,
    paddingBottom: 120,
  },
  sectionWrap: {
    marginBottom: 28,
  },
  sectionHeaderWrap: {
    paddingHorizontal: 20,
  },
  horizontalList: {
    paddingHorizontal: 20,
    gap: 14,
  },

  /* ── Search suggestions ── */
  suggestionsWrap: {
    marginTop: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
        }
      : {
          elevation: 14,
          shadowColor: '#1A3C34',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.16,
          shadowRadius: 22,
        }),
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  suggestionItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  suggestionThumb: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.light.primaryLight,
  },
  suggestionTextBlock: {
    flex: 1,
    gap: 2,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: -0.1,
  },
  suggestionMeta: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    letterSpacing: 0.1,
  },
  suggestionEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
  },
  suggestionEmptyText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },

  /* ── Notifications modal ── */
  notifModalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  notifModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  notifCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  notifModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.3,
  },
  notifList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  notifIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifTextBlock: {
    flex: 1,
    gap: 3,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.2,
  },
  notifMessage: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  notifUnreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.accent,
    marginTop: 6,
  },
  notifEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  notifEmptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
});
