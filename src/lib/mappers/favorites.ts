import { Restaurant } from '@/types/database';

export interface FavoriteWithRestaurant {
  id: string;
  restaurant: Restaurant;
}

interface RawFavoriteRow {
  id: string;
  restaurant_id: string;
  restaurant: Restaurant | Restaurant[] | null;
}

function normalizeRow(row: RawFavoriteRow): FavoriteWithRestaurant | null {
  const restaurant = Array.isArray(row.restaurant) ? row.restaurant[0] : row.restaurant;
  if (!restaurant) {
    return null;
  }
  return { id: row.id, restaurant };
}

export function mapFavoriteRows(data: unknown): FavoriteWithRestaurant[] {
  if (!Array.isArray(data)) {
    return [];
  }
  return (data as RawFavoriteRow[])
    .map(normalizeRow)
    .filter((fav): fav is FavoriteWithRestaurant => fav !== null);
}

export function mapFavoriteRow(data: unknown): FavoriteWithRestaurant | null {
  if (!data || typeof data !== 'object') {
    return null;
  }
  return normalizeRow(data as RawFavoriteRow);
}
