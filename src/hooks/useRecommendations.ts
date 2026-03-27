import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Coordinates,
  Restaurant,
  RestaurantWithDistance,
  UserPreferences,
} from '@/types/database';
import { enrichWithDistance } from '@/utils/distance';
import { rankRestaurants } from '@/utils/recommendation';

const DEFAULT_PREFERENCES: UserPreferences = {
  cuisineTypes: [],
  priceRange: [1, 4],
  maxDistance: 5,
  onboardingCompleted: false,
};

interface UseRecommendationsResult {
  recommended: RestaurantWithDistance[];
  nearby: RestaurantWithDistance[];
  topRated: RestaurantWithDistance[];
  loading: boolean;
  preferences: UserPreferences;
}

export function useRecommendations(
  userLocation: Coordinates | null
): UseRecommendationsResult {
  const [recommended, setRecommended] = useState<RestaurantWithDistance[]>([]);
  const [nearby, setNearby] = useState<RestaurantWithDistance[]>([]);
  const [topRated, setTopRated] = useState<RestaurantWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  const fetchData = useCallback(async () => {
    if (!userLocation) return;

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    let userPrefs = DEFAULT_PREFERENCES;

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single() as { data: { preferences: UserPreferences | null } | null };

      if (profile?.preferences) {
        userPrefs = profile.preferences;
      }
    }

    setPreferences(userPrefs);

    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('*')
      .limit(50) as { data: Restaurant[] | null };

    if (!restaurants) {
      setLoading(false);
      return;
    }

    const withDistance = enrichWithDistance(restaurants, userLocation);

    const ranked = rankRestaurants(withDistance, userPrefs);
    setRecommended(ranked.slice(0, 10));

    const sortedByDistance = [...withDistance].sort(
      (a, b) => a.distance - b.distance
    );
    setNearby(sortedByDistance.slice(0, 10));

    const sortedByRating = [...withDistance].sort(
      (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
    );
    setTopRated(sortedByRating.slice(0, 10));

    setLoading(false);
  }, [userLocation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { recommended, nearby, topRated, loading, preferences };
}
