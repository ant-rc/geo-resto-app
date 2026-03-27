import { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { useLocation } from '../../src/hooks/useLocation';
import { useRecommendations } from '../../src/hooks/useRecommendations';
import { useFavorites } from '../../src/hooks/useFavorites';
import { RestaurantFilters } from '../../src/hooks/useRestaurants';
import { Restaurant } from '../../src/types/database';
import MapSection from '../../src/components/MapSection';
import RestaurantCard from '../../src/components/RestaurantCard';
import SectionHeader from '../../src/components/SectionHeader';
import FilterModal from '../../src/components/FilterModal';
import * as Location from 'expo-location';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_PEEK = Math.round(SCREEN_HEIGHT * 0.34);
const SHEET_FULL = SCREEN_HEIGHT * 0.75;

interface FilterChip {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const FILTER_CHIPS: FilterChip[] = [
  { key: 'open', label: 'Ouvert', icon: 'time' },
  { key: 'vegan', label: 'Vegan', icon: 'leaf' },
  { key: 'gluten-free', label: 'Sans gluten', icon: 'nutrition' },
  { key: 'reservable', label: 'Reservable', icon: 'calendar' },
];

export default function HomeScreen() {
  const { location, loading: locationLoading } = useLocation();
  const { recommended, nearby, topRated, loading: recsLoading } = useRecommendations(location);
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<RestaurantFilters>({});
  const [activeChips, setActiveChips] = useState<Set<string>>(new Set(['open']));
  const [cityName, setCityName] = useState('Paris');
  const [userName, setUserName] = useState('U');
  const sheetAnim = useRef(new Animated.Value(SHEET_PEEK)).current;

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

  function toggleChip(key: string) {
    setActiveChips((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
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
          <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
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
            onSubmitEditing={() =>
              router.push({ pathname: '/(tabs)/search', params: { q: searchQuery } })
            }
          />
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setFiltersVisible(true)}
          >
            <Ionicons name="options-outline" size={17} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTER_CHIPS.map((chip) => {
            const isActive = activeChips.has(chip.key);
            return (
              <TouchableOpacity
                key={chip.key}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => toggleChip(chip.key)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={chip.icon}
                  size={14}
                  color={isActive ? Colors.light.textOnPrimary : Colors.light.primary}
                />
                <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                  {chip.label}
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
          {/* Recommended section — "Parfait pour vous" */}
          {recommended.length > 0 && (
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderWrap}>
                <SectionHeader
                  title="Parfait pour vous"
                  subtitle="Base sur vos preferences"
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
                  title="Les mieux notes"
                  subtitle="Les favoris de la communaute"
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

      <FilterModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        filters={filters}
        onApply={setFilters}
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
});
