import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Coordinates,
  RestaurantWithDistance,
  UserPreferences,
} from '@/types/database';
import { enrichWithDistance } from '@/utils/distance';
import { rankRestaurants } from '@/utils/recommendation';
import { getRestaurantsNear } from '@/lib/restaurantsService';

const DEFAULT_PREFERENCES: UserPreferences = {
  cuisineTypes: [],
  priceRange: [1, 4],
  maxDistance: 5,
  onboardingCompleted: false,
};

// preferences is an unvalidated jsonb column — normalize each field so a partial
// or corrupted object can't crash the scoring (destructuring/NaN/sort instability).
function sanitizePreferences(raw: Partial<UserPreferences> | null | undefined): UserPreferences {
  const priceRange =
    Array.isArray(raw?.priceRange) && raw!.priceRange.length === 2
      ? (raw!.priceRange as [number, number])
      : DEFAULT_PREFERENCES.priceRange;
  return {
    cuisineTypes: Array.isArray(raw?.cuisineTypes)
      ? raw!.cuisineTypes
      : DEFAULT_PREFERENCES.cuisineTypes,
    priceRange,
    maxDistance:
      typeof raw?.maxDistance === 'number' && raw!.maxDistance > 0
        ? raw!.maxDistance
        : DEFAULT_PREFERENCES.maxDistance,
    onboardingCompleted: Boolean(raw?.onboardingCompleted),
  };
}

interface UseRecommendationsResult {
  all: RestaurantWithDistance[];
  recommended: RestaurantWithDistance[];
  nearby: RestaurantWithDistance[];
  topRated: RestaurantWithDistance[];
  loading: boolean;
  preferences: UserPreferences;
}

export function useRecommendations(
  userLocation: Coordinates | null
): UseRecommendationsResult {
  const [all, setAll] = useState<RestaurantWithDistance[]>([]);
  const [recommended, setRecommended] = useState<RestaurantWithDistance[]>([]);
  const [nearby, setNearby] = useState<RestaurantWithDistance[]>([]);
  const [topRated, setTopRated] = useState<RestaurantWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  const reqIdRef = useRef(0);

  const fetchData = useCallback(async () => {
    const reqId = ++reqIdRef.current;

    if (!userLocation) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      let userPrefs = DEFAULT_PREFERENCES;

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single() as { data: { preferences: UserPreferences | null } | null };

        if (profile?.preferences) {
          userPrefs = sanitizePreferences(profile.preferences);
        }
      }

      const source = await getRestaurantsNear(userLocation);
      // Drop stale responses: a newer location request superseded this one.
      if (reqId !== reqIdRef.current) return;

      const withDistance = enrichWithDistance(source, userLocation);
      const ranked = rankRestaurants(withDistance, userPrefs);
      const sortedByDistance = [...withDistance].sort(
        (a, b) => a.distance - b.distance
      );
      const sortedByRating = [...withDistance].sort(
        (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
      );

      setPreferences(userPrefs);
      setAll(withDistance);
      setRecommended(ranked.slice(0, 10));
      setNearby(sortedByDistance.slice(0, 10));
      setTopRated(sortedByRating.slice(0, 10));
    } catch (_error) {
      if (reqId === reqIdRef.current) {
        setAll([]);
        setRecommended([]);
        setNearby([]);
        setTopRated([]);
      }
    } finally {
      if (reqId === reqIdRef.current) setLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { all, recommended, nearby, topRated, loading, preferences };
}
