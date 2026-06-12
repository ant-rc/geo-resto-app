import { Restaurant } from '@/types/database';
import { GooglePlace, GooglePriceLevel, buildPhotoUrl } from '@/lib/googlePlaces';

const PRICE_LEVEL_MAP: Record<GooglePriceLevel, number> = {
  PRICE_LEVEL_FREE: 1,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

const TYPE_TO_CUISINE: Record<string, string> = {
  bar: 'Bar',
  pub: 'Bar',
  wine_bar: 'Bar à vin',
  cafe: 'Café',
  coffee_shop: 'Café',
  bakery: 'Boulangerie',
  fast_food_restaurant: 'Fast-food',
  meal_takeaway: 'À emporter',
  meal_delivery: 'Livraison',
  food_court: 'Street food',
  ice_cream_shop: 'Glacier',
  restaurant: 'Restaurant',
  pizza_restaurant: 'Pizzeria',
  italian_restaurant: 'Italien',
  french_restaurant: 'Français',
  japanese_restaurant: 'Japonais',
  ramen_restaurant: 'Ramen',
  sushi_restaurant: 'Sushi',
  chinese_restaurant: 'Chinois',
  mexican_restaurant: 'Mexicain',
  indian_restaurant: 'Indien',
  thai_restaurant: 'Thaï',
  vietnamese_restaurant: 'Vietnamien',
  korean_restaurant: 'Coréen',
  spanish_restaurant: 'Espagnol',
  greek_restaurant: 'Grec',
  lebanese_restaurant: 'Libanais',
  turkish_restaurant: 'Turc',
  vegetarian_restaurant: 'Végétarien',
  vegan_restaurant: 'Vegan',
  seafood_restaurant: 'Fruits de mer',
  steak_house: 'Grill',
  brunch_restaurant: 'Brunch',
  breakfast_restaurant: 'Petit-déj',
  hamburger_restaurant: 'Burger',
  sandwich_shop: 'Sandwich',
  american_restaurant: 'Américain',
  african_restaurant: 'Africain',
  middle_eastern_restaurant: 'Moyen-orient',
  bistro: 'Bistrot',
};

// Ambiance/feature tags only — never dietary or allergen claims (see deriveTags).
const AMBIANCE_TAGS = ['terrasse', 'romantique', 'famille', 'fast', 'livraison', 'brunch'];

function stableHash(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Google Places does not expose dietary attributes. We never fabricate dietary
 * or allergen tags (vegan/halal/sans gluten/bio) from a hash — that would be
 * false and unsafe. Dietary tags are added ONLY when the place type explicitly
 * signals them; the remaining slots are filled with low-stakes ambiance tags.
 * In production these are declared by the owner or parsed from the menu.
 */
function deriveTags(place: GooglePlace): string[] {
  const types = [place.primaryType, ...(place.types ?? [])].filter(
    (t): t is string => Boolean(t),
  );
  const tags = new Set<string>();

  // Dietary tag only on an explicit type signal.
  if (types.some((t) => t === 'vegan_restaurant' || t === 'vegetarian_restaurant')) {
    tags.add('vegan');
  }
  if (types.some((t) => ['cafe', 'coffee_shop', 'bakery', 'brunch_restaurant', 'breakfast_restaurant'].includes(t))) {
    tags.add('brunch');
  }
  if (types.some((t) => ['fast_food_restaurant', 'meal_takeaway', 'meal_delivery', 'hamburger_restaurant', 'sandwich_shop'].includes(t))) {
    tags.add('fast');
    tags.add('livraison');
  }

  // Fill up to three with stable ambiance tags (never dietary/allergen).
  const hash = stableHash(place.id);
  const offset = hash % AMBIANCE_TAGS.length;
  const rotated = [...AMBIANCE_TAGS.slice(offset), ...AMBIANCE_TAGS.slice(0, offset)];
  for (const tag of rotated) {
    if (tags.size >= 3) break;
    tags.add(tag);
  }

  return Array.from(tags);
}

function extractCuisines(place: GooglePlace): string[] {
  const types = [place.primaryType, ...(place.types ?? [])].filter(
    (t): t is string => Boolean(t),
  );
  const cuisines = new Set<string>();
  for (const t of types) {
    const cuisine = TYPE_TO_CUISINE[t];
    if (cuisine) cuisines.add(cuisine);
  }
  if (cuisines.size === 0) {
    const display = place.primaryTypeDisplayName?.text;
    if (display) cuisines.add(display);
    else cuisines.add('Restaurant');
  }
  return Array.from(cuisines);
}

export function mapGooglePlaceToRestaurant(place: GooglePlace): Restaurant | null {
  // Google may omit location; a restaurant without coordinates can't be placed.
  if (!place.location) return null;

  const photos = (place.photos ?? [])
    .slice(0, 5)
    .map((p) => buildPhotoUrl(p.name, 800));
  const priceRange = place.priceLevel ? PRICE_LEVEL_MAP[place.priceLevel] ?? 2 : 2;
  const now = new Date().toISOString();

  return {
    id: place.id,
    name: place.displayName?.text ?? 'Sans nom',
    description: place.editorialSummary?.text ?? null,
    address: place.formattedAddress ?? '',
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    phone: place.nationalPhoneNumber ?? null,
    website: place.websiteUri ?? null,
    price_range: priceRange,
    cuisine_type: extractCuisines(place),
    opening_hours: place.regularOpeningHours
      ? { weekdayDescriptions: place.regularOpeningHours.weekdayDescriptions ?? [] }
      : null,
    image_url: photos[0] ?? null,
    images: photos,
    tags: deriveTags(place),
    rating: place.rating ?? null,
    created_at: now,
    updated_at: now,
  };
}
