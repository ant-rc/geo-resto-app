import { useState, useRef } from 'react';
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
import { Colors } from '../../src/constants/colors';
import { useLocation } from '../../src/hooks/useLocation';
import { useRecommendations } from '../../src/hooks/useRecommendations';
import { useFavorites } from '../../src/hooks/useFavorites';
import { RestaurantFilters } from '../../src/hooks/useRestaurants';
import { RestaurantWithDistance } from '../../src/types/database';
import MapSection from '../../src/components/MapSection';
import RestaurantCard from '../../src/components/RestaurantCard';
import SectionHeader from '../../src/components/SectionHeader';
import FilterModal from '../../src/components/FilterModal';
import { router } from 'expo-router';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_PEEK = 300;
const SHEET_FULL = SCREEN_HEIGHT * 0.75;

export default function HomeScreen() {
  const { location, loading: locationLoading } = useLocation();
  const { recommended, nearby, topRated, loading: recsLoading } = useRecommendations(location);
  const { favoriteIds, toggleFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<RestaurantFilters>({});
  const sheetAnim = useRef(new Animated.Value(SHEET_PEEK)).current;

  const allRestaurants = nearby;
  const loading = locationLoading || recsLoading;

  function handleMarkerPress(restaurant: RestaurantWithDistance) {
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

      {/* Floating search bar */}
      <View style={styles.searchFloat}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Restaurant, cuisine, quartier..."
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => router.push({ pathname: '/(tabs)/search', params: { q: searchQuery } })}
          />
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setFiltersVisible(true)}
          >
            <Ionicons name="options-outline" size={17} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
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
          {/* Recommended section */}
          {recommended.length > 0 && (
            <View style={styles.sectionWrap}>
              <SectionHeader
                title="Recommandés pour vous"
                subtitle="Basé sur vos préférences"
              />
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
          <View style={styles.sectionWrap}>
            <SectionHeader
              title="À proximité"
              subtitle={`${nearby.length} restaurants`}
            />
            <View style={styles.miniList}>
              {nearby.slice(0, 8).map((r) => (
                <RestaurantCard key={r.id} restaurant={r} variant="mini" />
              ))}
            </View>
          </View>

          {/* Top rated section */}
          {topRated.length > 0 && (
            <View style={styles.sectionWrap}>
              <SectionHeader
                title="Les mieux notés"
                subtitle="Les favoris de la communauté"
              />
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

          <View style={{ height: 120 }} />
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
  searchFloat: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 48,
    left: 20,
    right: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceGlass,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.light.surfaceGlassBorder,
    ...(Platform.OS === 'web'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.08,
          shadowRadius: 20,
        }
      : {
          elevation: 8,
          shadowColor: '#1A3C34',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
        }),
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    letterSpacing: 0.1,
  },
  filterBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
  },
  sheetContent: {
    paddingBottom: 20,
  },
  sectionWrap: {
    marginBottom: 24,
  },
  horizontalList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  miniList: {
    paddingHorizontal: 20,
    gap: 10,
  },
});
