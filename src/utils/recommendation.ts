import { RestaurantWithDistance, UserPreferences } from '@/types/database';

const WEIGHTS = {
  cuisineMatch: 0.35,
  rating: 0.25,
  distance: 0.20,
  priceMatch: 0.15,
  tagsBonus: 0.05,
};

function calculateCuisineScore(
  restaurantCuisines: string[],
  preferredCuisines: string[]
): number {
  if (preferredCuisines.length === 0) return 50;
  const matches = restaurantCuisines.filter((c) =>
    preferredCuisines.includes(c)
  ).length;
  return (matches / preferredCuisines.length) * 100;
}

function calculateRatingScore(rating: number | null): number {
  return ((rating ?? 0) / 5) * 100;
}

function calculateDistanceScore(
  distance: number,
  maxDistance: number
): number {
  return Math.max(0, (1 - distance / maxDistance)) * 100;
}

function calculatePriceScore(
  priceRange: number,
  preferredRange: [number, number]
): number {
  const [min, max] = preferredRange;
  return priceRange >= min && priceRange <= max ? 100 : 0;
}

export function calculateRecommendationScore(
  restaurant: RestaurantWithDistance,
  preferences: UserPreferences
): number {
  const cuisineScore = calculateCuisineScore(
    restaurant.cuisine_type,
    preferences.cuisineTypes
  );
  const ratingScore = calculateRatingScore(restaurant.rating);
  const distanceScore = calculateDistanceScore(
    restaurant.distance,
    preferences.maxDistance
  );
  const priceScore = calculatePriceScore(
    restaurant.price_range,
    preferences.priceRange
  );
  const tagsBonus = restaurant.tags.length > 0 ? 50 : 0;

  return Math.round(
    cuisineScore * WEIGHTS.cuisineMatch +
    ratingScore * WEIGHTS.rating +
    distanceScore * WEIGHTS.distance +
    priceScore * WEIGHTS.priceMatch +
    tagsBonus * WEIGHTS.tagsBonus
  );
}

export function rankRestaurants(
  restaurants: RestaurantWithDistance[],
  preferences: UserPreferences
): RestaurantWithDistance[] {
  return [...restaurants].sort((a, b) => {
    const scoreA = calculateRecommendationScore(a, preferences);
    const scoreB = calculateRecommendationScore(b, preferences);
    return scoreB - scoreA;
  });
}
