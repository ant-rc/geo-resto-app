export const CUISINE_OPTIONS = [
  'Français', 'Italien', 'Japonais', 'Indien', 'Mexicain',
  'Libanais', 'Chinois', 'Thaïlandais', 'Coréen', 'Américain',
];

export const TAG_OPTIONS = [
  'vegan', 'halal', 'fast', 'brunch', 'terrasse',
  'livraison', 'sans gluten', 'bio', 'romantique', 'famille',
];

export const DISTANCE_OPTIONS = [1, 3, 5, 10, 20];

export const PRICE_OPTIONS = [
  { label: '$', value: 1 },
  { label: '$$', value: 2 },
  { label: '$$$', value: 3 },
  { label: '$$$$', value: 4 },
];

export const CUISINE_ICONS: Record<string, string> = {
  'Français': 'flag-outline',
  'Italien': 'pizza-outline',
  'Japonais': 'fish-outline',
  'Indien': 'flame-outline',
  'Mexicain': 'leaf-outline',
  'Libanais': 'nutrition-outline',
  'Chinois': 'restaurant-outline',
  'Thaïlandais': 'flower-outline',
  'Coréen': 'egg-outline',
  'Américain': 'fast-food-outline',
};
