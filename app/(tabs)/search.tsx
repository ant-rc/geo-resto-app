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
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '../../src/constants/colors';
import { useLocation } from '../../src/hooks/useLocation';
import { useRestaurants, RestaurantFilters } from '../../src/hooks/useRestaurants';
import RestaurantCard from '../../src/components/RestaurantCard';
import FilterModal from '../../src/components/FilterModal';
import TagChip from '../../src/components/TagChip';

const CUISINE_TYPES = [
  { label: 'Français', icon: 'flag-outline' as const },
  { label: 'Italien', icon: 'pizza-outline' as const },
  { label: 'Japonais', icon: 'fish-outline' as const },
  { label: 'Indien', icon: 'flame-outline' as const },
  { label: 'Mexicain', icon: 'leaf-outline' as const },
  { label: 'Libanais', icon: 'nutrition-outline' as const },
];

const SORT_OPTIONS: { key: RestaurantFilters['sortBy']; label: string }[] = [
  { key: 'distance', label: 'Distance' },
  { key: 'rating', label: 'Note' },
  { key: 'price', label: 'Prix' },
];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [searchQuery, setSearchQuery] = useState(params.q ?? '');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<RestaurantFilters['sortBy']>('distance');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<RestaurantFilters>({});
  const { location } = useLocation();

  const filters = useMemo<RestaurantFilters>(
    () => ({
      searchQuery,
      cuisineType: selectedCuisine,
      sortBy,
      userLocation: location,
      ...advancedFilters,
    }),
    [searchQuery, selectedCuisine, sortBy, location, advancedFilters]
  );

  const { restaurants, loading } = useRestaurants(filters);

  function handleApplyFilters(newFilters: RestaurantFilters) {
    setAdvancedFilters(newFilters);
    if (newFilters.cuisineType) {
      setSelectedCuisine(newFilters.cuisineType);
    }
    if (newFilters.sortBy) {
      setSortBy(newFilters.sortBy);
    }
  }

  const activeFilterCount = [
    advancedFilters.priceRange,
    advancedFilters.maxDistance,
    advancedFilters.tags?.length,
    advancedFilters.minRating,
  ].filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recherche</Text>
        <Text style={styles.headerSubtitle}>Trouvez votre prochaine table</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Nom, cuisine, quartier..."
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.filterIconBtn}
            onPress={() => setFiltersVisible(true)}
          >
            <Ionicons name="options-outline" size={17} color={Colors.light.primary} />
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Sort pills */}
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((option) => (
          <TagChip
            key={option.key}
            label={option.label}
            selected={sortBy === option.key}
            onPress={() => setSortBy(option.key)}
            size="small"
          />
        ))}
      </View>

      {/* Cuisine grid */}
      {!searchQuery && !selectedCuisine && (
        <View style={styles.cuisineSection}>
          <Text style={styles.sectionLabel}>Catégories</Text>
          <View style={styles.cuisineGrid}>
            {CUISINE_TYPES.map((c) => (
              <TouchableOpacity
                key={c.label}
                style={styles.cuisineCard}
                onPress={() => setSelectedCuisine(c.label)}
                activeOpacity={0.75}
              >
                <View style={styles.cuisineIcon}>
                  <Ionicons name={c.icon} size={22} color={Colors.light.primary} />
                </View>
                <Text style={styles.cuisineLabel}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Active filter */}
      {selectedCuisine && (
        <View style={styles.activeFilter}>
          <TouchableOpacity
            style={styles.activeFilterChip}
            onPress={() => setSelectedCuisine(null)}
          >
            <Text style={styles.activeFilterText}>{selectedCuisine}</Text>
            <Ionicons name="close" size={14} color={Colors.light.textOnPrimary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Results */}
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
          ListHeaderComponent={
            restaurants.length > 0 ? (
              <Text style={styles.resultsCount}>
                {restaurants.length} résultats
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color={Colors.light.border} />
              <Text style={styles.emptyText}>Aucun résultat</Text>
            </View>
          }
        />
      )}

      <FilterModal
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        filters={filters}
        onApply={handleApplyFilters}
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
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 64 : 52,
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  searchWrap: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  filterIconBtn: {
    position: 'relative',
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.textOnPrimary,
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 16,
  },
  cuisineSection: {
    paddingHorizontal: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cuisineCard: {
    width: '30%',
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  cuisineIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cuisineLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
    letterSpacing: 0.1,
  },
  activeFilter: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeFilterText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.textOnPrimary,
  },
  resultsList: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  resultsCount: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
});
