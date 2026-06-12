import AsyncStorage from '@react-native-async-storage/async-storage';
import { GooglePlace } from './googlePlaces';

const CACHE_PREFIX = '@tastly/places-cache:v2';
const TTL_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
  data: GooglePlace[];
  timestamp: number;
}

function buildKey(latitude: number, longitude: number, radius: number): string {
  const lat = latitude.toFixed(3);
  const lng = longitude.toFixed(3);
  return `${CACHE_PREFIX}:${lat}:${lng}:${radius}`;
}

export async function getCachedPlaces(
  latitude: number,
  longitude: number,
  radius: number,
): Promise<GooglePlace[] | null> {
  try {
    const raw = await AsyncStorage.getItem(buildKey(latitude, longitude, radius));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.timestamp > TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

async function purgeExpired(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length === 0) return;

    const entries = await AsyncStorage.multiGet(cacheKeys);
    const expired: string[] = [];
    for (const [key, raw] of entries) {
      if (!raw) {
        expired.push(key);
        continue;
      }
      try {
        const entry = JSON.parse(raw) as CacheEntry;
        if (Date.now() - entry.timestamp > TTL_MS) expired.push(key);
      } catch {
        expired.push(key);
      }
    }
    if (expired.length > 0) await AsyncStorage.multiRemove(expired);
  } catch {
    // best-effort cleanup
  }
}

export async function setCachedPlaces(
  latitude: number,
  longitude: number,
  radius: number,
  data: GooglePlace[],
): Promise<void> {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(
      buildKey(latitude, longitude, radius),
      JSON.stringify(entry),
    );
    // Fire-and-forget: drop stale entries so AsyncStorage doesn't grow unbounded.
    void purgeExpired();
  } catch {
    // Cache write failure is non-fatal
  }
}

export async function getCachedPlaceById(placeId: string): Promise<GooglePlace | null> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length === 0) return null;

    const entries = await AsyncStorage.multiGet(cacheKeys);
    for (const [, raw] of entries) {
      if (!raw) continue;
      try {
        const entry = JSON.parse(raw) as CacheEntry;
        const found = entry.data.find((p) => p.id === placeId);
        if (found) return found;
      } catch {
        // Skip corrupted entry
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearPlacesCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const toRemove = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    if (toRemove.length > 0) {
      await AsyncStorage.multiRemove(toRemove);
    }
  } catch {
    // Ignore
  }
}
