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

const TYPE_GROUPS: string[][] = [
  ['restaurant', 'fast_food_restaurant', 'meal_takeaway', 'meal_delivery', 'food_court'],
  ['cafe', 'coffee_shop', 'bakery', 'ice_cream_shop'],
  ['bar', 'pub', 'wine_bar'],
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

async function fetchTypeGroup(
  types: string[],
  center: Coordinates,
  radius: number,
  apiKey: string,
): Promise<GooglePlace[]> {
  const response = await fetch(SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      includedPrimaryTypes: types,
      maxResultCount: 20,
      languageCode: 'fr',
      regionCode: 'fr',
      rankPreference: 'DISTANCE',
      locationRestriction: {
        circle: {
          center: { latitude: center.latitude, longitude: center.longitude },
          radius,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Places API error: ${response.status}`);
  }

  const data = (await response.json()) as { places?: GooglePlace[] };
  return data.places ?? [];
}

export async function searchNearbyFoodPlaces(
  center: Coordinates,
  radiusMeters: number = 1500,
): Promise<GooglePlace[]> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;
  if (!apiKey) {
    throw new Error('Missing EXPO_PUBLIC_GOOGLE_PLACES_KEY');
  }

  const results = await Promise.allSettled(
    TYPE_GROUPS.map((types) => fetchTypeGroup(types, center, radiusMeters, apiKey)),
  );

  const merged = new Map<string, GooglePlace>();
  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    for (const place of result.value) {
      if (place.businessStatus === undefined || place.businessStatus === 'OPERATIONAL') {
        merged.set(place.id, place);
      }
    }
  }

  if (merged.size === 0) {
    const firstError = results.find((r) => r.status === 'rejected');
    if (firstError && firstError.status === 'rejected') {
      throw firstError.reason;
    }
  }

  return Array.from(merged.values());
}

export function buildPhotoUrl(photoName: string, maxWidth: number = 800): string {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY ?? '';
  return `${MEDIA_BASE}/${photoName}/media?maxWidthPx=${maxWidth}&key=${apiKey}`;
}
