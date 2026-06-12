import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { Coordinates } from '@/types/database';

const DEFAULT_LOCATION: Coordinates = {
  latitude: 48.8566,
  longitude: 2.3522,
};

interface UseLocationResult {
  location: Coordinates | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!mountedRef.current) return;
      if (status !== 'granted') {
        setError('Permission de localisation refusée');
        setLocation(DEFAULT_LOCATION);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      if (!mountedRef.current) return;
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (_error) {
      if (!mountedRef.current) return;
      setError('Position indisponible');
      setLocation(DEFAULT_LOCATION);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { location, loading, error, refresh: fetchLocation };
}
