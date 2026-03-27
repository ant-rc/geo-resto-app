import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../src/constants/colors';
import { useFavorites } from '../../src/hooks/useFavorites';
import { RestaurantWithDistance } from '../../src/types/database';
import RestaurantCard from '../../src/components/RestaurantCard';

export default function FavoritesScreen() {
  const { favorites, favoriteIds, loading, refreshing, toggleFavorite, refresh } = useFavorites();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  const restaurantsWithDistance: RestaurantWithDistance[] = favorites.map((f) => ({
    ...f.restaurant,
    distance: 0,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favoris</Text>
        {favorites.length > 0 && (
          <Text style={styles.headerCount}>{favorites.length} sauvegardés</Text>
        )}
      </View>

      <FlatList
        data={restaurantsWithDistance}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[Colors.light.primary]}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <RestaurantCard
              restaurant={item}
              variant="standard"
              isFavorite={favoriteIds.has(item.id)}
              onFavoriteToggle={() => toggleFavorite(item.id)}
            />
          </View>
        )}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={36} color={Colors.light.accent} />
            </View>
            <Text style={styles.emptyTitle}>Pas encore de favoris</Text>
            <Text style={styles.emptyText}>
              Explorez la carte et sauvegardez{'\n'}vos restaurants préférés
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 64 : 52,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  headerCount: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  list: { paddingHorizontal: 20, paddingBottom: 120, flexGrow: 1 },
  row: { justifyContent: 'space-between', marginBottom: 14 },
  cardWrap: { width: '48%' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
