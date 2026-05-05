import { Coordinates, Restaurant } from '@/types/database';
import { searchNearbyFoodPlaces } from './googlePlaces';
import { getCachedPlaces, getCachedPlaceById, setCachedPlaces } from './placesCache';
import { mapGooglePlaceToRestaurant } from '@/utils/googlePlacesMapper';
import { MOCK_RESTAURANTS } from '@/data/mockRestaurants';

const DEFAULT_RADIUS_M = 1500;

export async function getRestaurantsNear(
  location: Coordinates | null,
  radiusMeters: number = DEFAULT_RADIUS_M,
): Promise<Restaurant[]> {
  if (!location) return MOCK_RESTAURANTS;

  let places = await getCachedPlaces(location.latitude, location.longitude, radiusMeters);

  if (!places) {
    try {
      places = await searchNearbyFoodPlaces(location, radiusMeters);
      await setCachedPlaces(location.latitude, location.longitude, radiusMeters, places);
    } catch {
      places = null;
    }
  }

  if (!places || places.length === 0) return MOCK_RESTAURANTS;

  return places.map(mapGooglePlaceToRestaurant);
}

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const cached = await getCachedPlaceById(id);
  if (cached) return mapGooglePlaceToRestaurant(cached);

  const mock = MOCK_RESTAURANTS.find((r) => r.id === id);
  return mock ?? null;
}
