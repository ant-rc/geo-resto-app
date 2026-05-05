import { Coordinates } from '@/types/database';

const SEARCH_URL = 'https://places.googleapis.com/v1/places:searchNearby';
const MEDIA_BASE = 'https://places.googleapis.com/v1';

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.types',
  'places.primaryType',
  'places.primaryTypeDisplayName',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.photos',
  'places.editorialSummary',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.regularOpeningHours',
  'places.businessStatus',
].join(',');

export const FOOD_PRIMARY_TYPES = [
  'restaurant',
  'cafe',
  'bar',
  'bakery',
  'fast_food_restaurant',
  'meal_takeaway',
  'meal_delivery',
  'coffee_shop',
  'pub',
  'wine_bar',
  'food_court',
  'ice_cream_shop',
];

export type GooglePriceLevel =
  | 'PRICE_LEVEL_FREE'
  | 'PRICE_LEVEL_INEXPENSIVE'
  | 'PRICE_LEVEL_MODERATE'
  | 'PRICE_LEVEL_EXPENSIVE'
  | 'PRICE_LEVEL_VERY_EXPENSIVE';

export interface GooglePlace {
  id: string;
  displayName?: { text?: string; languageCode?: string };
  formattedAddress?: string;
  location: { latitude: number; longitude: number };
  types?: string[];
  primaryType?: string;
  primaryTypeDisplayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: GooglePriceLevel;
  photos?: { name: string; widthPx?: number; heightPx?: number }[];
  editorialSummary?: { text?: string };
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  businessStatus?: string;
}

export async function searchNearbyFoodPlaces(
  center: Coordinates,
  radiusMeters: number = 1500,
  maxResults: number = 20,
): Promise<GooglePlace[]> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;
  if (!apiKey) {
    throw new Error('Missing EXPO_PUBLIC_GOOGLE_PLACES_KEY');
  }

  const response = await fetch(SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      includedPrimaryTypes: FOOD_PRIMARY_TYPES,
      maxResultCount: Math.min(maxResults, 20),
      languageCode: 'fr',
      regionCode: 'fr',
      rankPreference: 'DISTANCE',
      locationRestriction: {
        circle: {
          center: { latitude: center.latitude, longitude: center.longitude },
          radius: radiusMeters,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Places API error: ${response.status}`);
  }

  const data = (await response.json()) as { places?: GooglePlace[] };
  const places = data.places ?? [];

  return places.filter(
    (p) => p.businessStatus === undefined || p.businessStatus === 'OPERATIONAL',
  );
}

export function buildPhotoUrl(photoName: string, maxWidth: number = 800): string {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY ?? '';
  return `${MEDIA_BASE}/${photoName}/media?maxWidthPx=${maxWidth}&key=${apiKey}`;
}
