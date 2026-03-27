import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { useLocation } from '../../src/hooks/useLocation';
import { useRestaurants, RestaurantFilters } from '../../src/hooks/useRestaurants';
import RestaurantCard from '../../src/components/RestaurantCard';
import { CUISINE_OPTIONS, TAG_OPTIONS, DISTANCE_OPTIONS } from '../../src/constants/data';

const PRICE_SEGMENTS = [
  { label: '\u20AC', value: 1 },
  { label: '\u20AC\u20AC', value: 2 },
  { label: '\u20AC\u20AC\u20AC', value: 3 },
  { label: '\u20AC\u20AC\u20AC\u20AC', value: 4 },
];

const TAG_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  vegan: 'leaf',
  halal: 'moon',
  fast: 'flash',
  brunch: 'cafe',
  terrasse: 'sunny',
  livraison: 'bicycle',
  'sans gluten': 'ban',
  bio: 'nutrition',
  romantique: 'heart',
  famille: 'people',
};

type ViewMode = 'list' | 'map';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [searchQuery, setSearchQuery] = useState(params.q ?? '');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const { location } = useLocation();

  const filters = useMemo<RestaurantFilters>(
    () => ({
      searchQuery: searchQuery || undefined,
      cuisineType: selectedCuisines.length === 1 ? selectedCuisines[0] : undefined,
      priceRange: selectedPrice ? [selectedPrice, selectedPrice] as [number, number] : undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      maxDistance: selectedDistance ?? undefined,
      sortBy: 'distance',
      userLocation: location,
    }),
    [searchQuery, selectedCuisines, selectedPrice, selectedTags, selectedDistance, location]
  );

  const { restaurants, loading } = useRestaurants(filters);

  function toggleCuisine(cuisine: string) {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  }

  function togglePrice(value: number) {
    setSelectedPrice((prev) => (prev === value ? null : value));
  }

  function toggleDistance(km: number) {
    setSelectedDistance((prev) => (prev === km ? null : km));
  }

  function clearAll() {
    setSearchQuery('');
    setSelectedCuisines([]);
    setSelectedPrice(null);
    setSelectedTags([]);
    setSelectedDistance(null);
  }

  function clearCuisines() {
    setSelectedCuisines([]);
  }

  const hasFilters = selectedCuisines.length > 0
    || selectedPrice !== null
    || selectedTags.length > 0
    || selectedDistance !== null
    || searchQuery.length > 0;

  function renderFilters() {
    return (
      <View style={styles.filtersContainer}>
        {/* View Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="list"
              size={16}
              color={viewMode === 'list' ? Colors.light.primary : Colors.light.textSecondary}
            />
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
              Liste
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
            onPress={() => setViewMode('map')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="map"
              size={16}
              color={viewMode === 'map' ? Colors.light.primary : Colors.light.textSecondary}
            />
            <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
              Carte
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cuisine Type */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Type de cuisine</Text>
            {selectedCuisines.length > 0 && (
              <TouchableOpacity onPress={clearCuisines} activeOpacity={0.7}>
                <Text style={styles.clearText}>Effacer</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.chipsRow}>
            {CUISINE_OPTIONS.map((cuisine) => {
              const isActive = selectedCuisines.includes(cuisine);
              return (
                <TouchableOpacity
                  key={cuisine}
                  style={[styles.cuisineChip, isActive && styles.cuisineChipActive]}
                  onPress={() => toggleCuisine(cuisine)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cuisineChipText, isActive && styles.cuisineChipTextActive]}>
                    {cuisine}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Fourchette de prix</Text>
          <View style={styles.priceContainer}>
            {PRICE_SEGMENTS.map((seg) => {
              const isActive = selectedPrice === seg.value;
              return (
                <TouchableOpacity
                  key={seg.value}
                  style={[styles.priceBtn, isActive && styles.priceBtnActive]}
                  onPress={() => togglePrice(seg.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.priceText, isActive && styles.priceTextActive]}>
                    {seg.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Allergies & Diets */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Allergies & regimes</Text>
          <View style={styles.tagsGrid}>
            {TAG_OPTIONS.map((tag) => {
              const isActive = selectedTags.includes(tag);
              const iconName = TAG_ICONS[tag] ?? 'pricetag';
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagCard, isActive && styles.tagCardActive]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.tagIconCircle, isActive && styles.tagIconCircleActive]}>
                    <Ionicons
                      name={iconName}
                      size={18}
                      color={isActive ? Colors.light.secondary : Colors.light.textSecondary}
                    />
                  </View>
                  <Text style={[styles.tagCardText, isActive && styles.tagCardTextActive]}>
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Distance Range */}
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Distance</Text>
            {selectedDistance !== null && (
              <Text style={styles.distanceValue}>{selectedDistance} km</Text>
            )}
          </View>
          <View style={styles.chipsRow}>
            {DISTANCE_OPTIONS.map((km) => {
              const isActive = selectedDistance === km;
              return (
                <TouchableOpacity
                  key={km}
                  style={[styles.distanceChip, isActive && styles.distanceChipActive]}
                  onPress={() => toggleDistance(km)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.distanceChipText, isActive && styles.distanceChipTextActive]}>
                    {km} km
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recherche</Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={Colors.light.primary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Nom, cuisine, quartier..."
              placeholderTextColor={Colors.light.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={18} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.filterSquareBtn} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={18} color={Colors.light.textOnPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results list with filters as header */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RestaurantCard restaurant={item} variant="wide" />
          )}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.resultsSeparator} />}
          ListHeaderComponent={
            <View>
              {renderFilters()}
              {restaurants.length > 0 && (
                <Text style={styles.resultsCount}>
                  <Text style={styles.resultsCountBold}>{restaurants.length}</Text>
                  {' resultats'}
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color={Colors.light.border} />
              <Text style={styles.emptyText}>Aucun resultat</Text>
            </View>
          }
        />
      )}

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.clearAllBtn}
          onPress={clearAll}
          activeOpacity={0.7}
          disabled={!hasFilters}
        >
          <Text style={[styles.clearAllText, !hasFilters && styles.clearAllTextDisabled]}>
            Tout effacer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.showResultsBtn} activeOpacity={0.85}>
          <Text style={styles.showResultsText}>
            {loading ? 'Recherche...' : `Afficher ${restaurants.length} resultats`}
          </Text>
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
  },

  /* Header */
  header: {
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 14,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  filterSquareBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Filters */
  filtersContainer: {
    gap: 28,
    paddingBottom: 200,
  },

  /* Toggle */
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.borderLight,
    borderRadius: 16,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  toggleBtnActive: {
    backgroundColor: Colors.light.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
    }),
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textSecondary,
  },
  toggleTextActive: {
    color: Colors.light.text,
  },

  /* Filter section */
  filterSection: {
    gap: 12,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.3,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
  },

  /* Cuisine chips */
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cuisineChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  cuisineChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      default: {
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  cuisineChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  cuisineChipTextActive: {
    color: Colors.light.textOnPrimary,
  },

  /* Price */
  priceContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.borderLight,
    borderRadius: 16,
    padding: 4,
    overflow: 'hidden',
  },
  priceBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  priceBtnActive: {
    backgroundColor: Colors.light.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
    }),
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.light.textSecondary,
  },
  priceTextActive: {
    color: Colors.light.text,
  },

  /* Tags grid */
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagCard: {
    width: '48%' as unknown as number,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  tagCardActive: {
    backgroundColor: Colors.light.accentLight,
    borderWidth: 2,
    borderColor: Colors.light.secondary,
  },
  tagIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagIconCircleActive: {
    backgroundColor: 'rgba(15, 118, 110, 0.1)',
  },
  tagCardText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.light.text,
    flexShrink: 1,
  },
  tagCardTextActive: {
    color: Colors.light.text,
  },

  /* Distance */
  distanceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  distanceChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  distanceChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  distanceChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  distanceChipTextActive: {
    color: Colors.light.textOnPrimary,
  },

  /* Results */
  resultsList: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 200,
  },
  resultsSeparator: {
    height: 10,
  },
  resultsCount: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    fontWeight: '400',
  },
  resultsCountBold: {
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },

  /* Bottom CTA bar */
  bottomBar: {
    position: 'absolute',
    bottom: 112,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 20,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  clearAllBtn: {
    flex: 1,
    backgroundColor: Colors.light.borderLight,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearAllText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.text,
  },
  clearAllTextDisabled: {
    color: Colors.light.textSecondary,
  },
  showResultsBtn: {
    flex: 2,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      default: {
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  showResultsText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.textOnPrimary,
  },
});
