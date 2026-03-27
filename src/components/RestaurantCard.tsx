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

/* ---------- Image placeholder shared ---------- */

function ImagePlaceholder({ size }: { size: number }) {
  return (
    <View style={sharedStyles.imagePlaceholder}>
      <Ionicons name="restaurant" size={size} color={Colors.light.primaryMuted} />
    </View>
  );
}

/* ---------- MiniVariant ---------- */

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
          <ImagePlaceholder size={24} />
        )}
      </View>
      <View style={miniStyles.body}>
        <Text style={miniStyles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>
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
        </View>
      </View>
      {restaurant.distance > 0 && (
        <Text style={miniStyles.distance}>{formatDistance(restaurant.distance)}</Text>
      )}
    </TouchableOpacity>
  );
}

/* ---------- StandardVariant ---------- */

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
      {/* Hero image */}
      <View style={stdStyles.imageWrap}>
        {imageSource ? (
          <Image source={{ uri: imageSource }} style={stdStyles.image} />
        ) : (
          <ImagePlaceholder size={28} />
        )}

        {/* Gradient overlay */}
        <View style={stdStyles.imageGradient} />

        {/* Rating badge — bottom-left */}
        {restaurant.rating != null && (
          <View style={stdStyles.ratingOverlay}>
            <Ionicons name="star" size={11} color={Colors.light.warning} />
            <Text style={stdStyles.ratingOverlayText}>
              {restaurant.rating.toFixed(1)}
            </Text>
          </View>
        )}

        {/* Distance badge — bottom-right */}
        {restaurant.distance > 0 && (
          <View style={stdStyles.distanceBadge}>
            <Ionicons name="location" size={10} color={Colors.light.textOnPrimary} />
            <Text style={stdStyles.distanceText}>
              {formatDistance(restaurant.distance)}
            </Text>
          </View>
        )}

        {/* Heart button — top-right */}
        {onFavoriteToggle && (
          <TouchableOpacity style={stdStyles.heartBtn} onPress={onFavoriteToggle}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? Colors.light.error : Colors.light.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Body */}
      <View style={stdStyles.body}>
        <Text style={stdStyles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text style={stdStyles.cuisine} numberOfLines={1}>
          {restaurant.cuisine_type?.join(' · ')}
        </Text>
        <Text style={stdStyles.price}>
          {'$'.repeat(restaurant.price_range)}
        </Text>
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

/* ---------- WideVariant ---------- */

function WideVariant({
  restaurant,
  onPress,
}: {
  restaurant: RestaurantWithDistance;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={wideStyles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Hero image */}
      <View style={wideStyles.imageWrap}>
        {restaurant.image_url ? (
          <Image source={{ uri: restaurant.image_url }} style={wideStyles.image} />
        ) : (
          <ImagePlaceholder size={26} />
        )}

        {/* Gradient overlay */}
        <View style={wideStyles.imageGradient} />

        {/* Rating badge — bottom-left */}
        {restaurant.rating != null && (
          <View style={wideStyles.ratingOverlay}>
            <Ionicons name="star" size={12} color={Colors.light.warning} />
            <Text style={wideStyles.ratingOverlayText}>
              {restaurant.rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={wideStyles.body}>
        <Text style={wideStyles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text style={wideStyles.metaLine} numberOfLines={1}>
          {[
            restaurant.cuisine_type?.join(', '),
            '$'.repeat(restaurant.price_range),
            restaurant.distance > 0 ? formatDistance(restaurant.distance) : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ---------- Shared Styles ---------- */

const sharedStyles = StyleSheet.create({
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/* ---------- Mini Styles ---------- */

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
  imageWrap: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  body: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: -0.2,
  },
  cuisine: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.light.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.text,
  },
  price: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  distance: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginRight: 4,
  },
});

/* ---------- Standard Styles ---------- */

const stdStyles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...(Platform.OS === 'web'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        }
      : {
          elevation: 3,
          shadowColor: '#1A3C34',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
        }),
  },
  imageWrap: {
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.surfaceGlass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingOverlayText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textOnPrimary,
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textOnPrimary,
  },
  body: {
    padding: 12,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: -0.2,
  },
  cuisine: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  price: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  tags: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
});

/* ---------- Wide Styles ---------- */

const wideStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  imageWrap: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  ratingOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingOverlayText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textOnPrimary,
  },
  body: {
    padding: 12,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    letterSpacing: -0.2,
  },
  metaLine: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
});
