import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { RestaurantWithDistance } from '@/types/database';
import { formatDistance } from '@/utils/distance';
import TagChip from './TagChip';

interface RestaurantCardProps {
  restaurant: RestaurantWithDistance;
  variant: 'mini' | 'standard' | 'wide';
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}

export default function RestaurantCard({
  restaurant,
  variant,
  isFavorite,
  onFavoriteToggle,
}: RestaurantCardProps) {
  function handlePress() {
    router.push(`/restaurant/${restaurant.id}`);
  }

  if (variant === 'mini') {
    return <MiniVariant restaurant={restaurant} onPress={handlePress} />;
  }

  if (variant === 'wide') {
    return <WideVariant restaurant={restaurant} onPress={handlePress} />;
  }

  return (
    <StandardVariant
      restaurant={restaurant}
      onPress={handlePress}
      isFavorite={isFavorite}
      onFavoriteToggle={onFavoriteToggle}
    />
  );
}

function MiniVariant({
  restaurant,
  onPress,
}: {
  restaurant: RestaurantWithDistance;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={miniStyles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={miniStyles.imageWrap}>
        {restaurant.image_url ? (
          <Image source={{ uri: restaurant.image_url }} style={miniStyles.image} />
        ) : (
          <View style={miniStyles.imagePlaceholder}>
            <Ionicons name="restaurant" size={24} color={Colors.light.primaryMuted} />
          </View>
        )}
      </View>
      <View style={miniStyles.body}>
        <Text style={miniStyles.name} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={miniStyles.cuisine} numberOfLines={1}>
          {restaurant.cuisine_type?.join(' · ')}
        </Text>
        <View style={miniStyles.meta}>
          {restaurant.rating != null && (
            <View style={miniStyles.ratingBadge}>
              <Ionicons name="star" size={11} color={Colors.light.warning} />
              <Text style={miniStyles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
            </View>
          )}
          <Text style={miniStyles.price}>{'$'.repeat(restaurant.price_range)}</Text>
          <View style={miniStyles.dot} />
          <Ionicons name="location-outline" size={12} color={Colors.light.textSecondary} />
          <Text style={miniStyles.distance}>{formatDistance(restaurant.distance)}</Text>
        </View>
      </View>
      <View style={miniStyles.arrow}>
        <Ionicons name="chevron-forward" size={16} color={Colors.light.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

function StandardVariant({
  restaurant,
  onPress,
  isFavorite,
  onFavoriteToggle,
}: {
  restaurant: RestaurantWithDistance;
  onPress: () => void;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
}) {
  const imageSource = restaurant.images?.[0] ?? restaurant.image_url;

  return (
    <TouchableOpacity style={stdStyles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={stdStyles.imageWrap}>
        {imageSource ? (
          <Image source={{ uri: imageSource }} style={stdStyles.image} />
        ) : (
          <View style={stdStyles.imagePlaceholder}>
            <Ionicons name="restaurant" size={28} color={Colors.light.primaryMuted} />
          </View>
        )}
        {onFavoriteToggle && (
          <TouchableOpacity style={stdStyles.heartBtn} onPress={onFavoriteToggle}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? Colors.light.error : Colors.light.textSecondary}
            />
          </TouchableOpacity>
        )}
        {restaurant.distance > 0 && (
          <View style={stdStyles.distanceBadge}>
            <Ionicons name="location" size={10} color={Colors.light.textOnPrimary} />
            <Text style={stdStyles.distanceText}>
              {formatDistance(restaurant.distance)}
            </Text>
          </View>
        )}
      </View>
      <View style={stdStyles.body}>
        <Text style={stdStyles.name} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={stdStyles.cuisine} numberOfLines={1}>
          {restaurant.cuisine_type?.join(' · ')}
        </Text>
        <View style={stdStyles.meta}>
          {restaurant.rating != null && (
            <View style={stdStyles.ratingBadge}>
              <Ionicons name="star" size={11} color={Colors.light.warning} />
              <Text style={stdStyles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
            </View>
          )}
          <Text style={stdStyles.price}>{'$'.repeat(restaurant.price_range)}</Text>
        </View>
        {restaurant.tags?.length > 0 && (
          <View style={stdStyles.tags}>
            {restaurant.tags.slice(0, 2).map((tag) => (
              <TagChip key={tag} label={tag} size="small" />
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function WideVariant({
  restaurant,
  onPress,
}: {
  restaurant: RestaurantWithDistance;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={wideStyles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={wideStyles.imageWrap}>
        {restaurant.image_url ? (
          <Image source={{ uri: restaurant.image_url }} style={wideStyles.image} />
        ) : (
          <View style={wideStyles.imagePlaceholder}>
            <Ionicons name="restaurant" size={22} color={Colors.light.primaryMuted} />
          </View>
        )}
      </View>
      <View style={wideStyles.body}>
        <Text style={wideStyles.name} numberOfLines={1}>{restaurant.name}</Text>
        <Text style={wideStyles.cuisine} numberOfLines={1}>
          {restaurant.cuisine_type?.join(' · ')}
        </Text>
        <View style={wideStyles.meta}>
          {restaurant.rating != null && (
            <>
              <Ionicons name="star" size={12} color={Colors.light.warning} />
              <Text style={wideStyles.ratingText}>{restaurant.rating.toFixed(1)}</Text>
            </>
          )}
          <Text style={wideStyles.price}>{'$'.repeat(restaurant.price_range)}</Text>
          {restaurant.distance > 0 && (
            <>
              <View style={wideStyles.dot} />
              <Text style={wideStyles.distanceText}>
                {formatDistance(restaurant.distance)}
              </Text>
            </>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.light.border} />
    </TouchableOpacity>
  );
}

const miniStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  imageWrap: { width: 64, height: 64, borderRadius: 14, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  body: { flex: 1, paddingHorizontal: 12, gap: 3 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.light.text, letterSpacing: -0.2 },
  cuisine: { fontSize: 12, color: Colors.light.textSecondary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
  },
  ratingText: { fontSize: 11, fontWeight: '600', color: Colors.light.text },
  price: { fontSize: 12, fontWeight: '600', color: Colors.light.success },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.light.textSecondary },
  distance: { fontSize: 11, color: Colors.light.textSecondary },
  arrow: { paddingLeft: 4 },
});

const stdStyles = StyleSheet.create({
  card: {
    width: 180,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  imageWrap: { height: 130, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  heartBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
  },
  distanceBadge: {
    position: 'absolute', bottom: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(26, 60, 52, 0.8)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  distanceText: { fontSize: 10, fontWeight: '600', color: Colors.light.textOnPrimary },
  body: { padding: 12, gap: 3 },
  name: { fontSize: 14, fontWeight: '600', color: Colors.light.text, letterSpacing: -0.2 },
  cuisine: { fontSize: 11, color: Colors.light.textSecondary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#FEF3C7', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6,
  },
  ratingText: { fontSize: 11, fontWeight: '600', color: Colors.light.text },
  price: { fontSize: 12, fontWeight: '600', color: Colors.light.success },
  tags: { flexDirection: 'row', gap: 4, marginTop: 4 },
});

const wideStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  imageWrap: { width: 60, height: 60, borderRadius: 14, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: {
    width: '100%', height: '100%',
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  body: { flex: 1, paddingHorizontal: 12, gap: 2 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.light.text, letterSpacing: -0.2 },
  cuisine: { fontSize: 12, color: Colors.light.textSecondary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  ratingText: { fontSize: 12, fontWeight: '600', color: Colors.light.text },
  price: { fontSize: 12, fontWeight: '600', color: Colors.light.success },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.light.textSecondary },
  distanceText: { fontSize: 11, color: Colors.light.textSecondary },
});
