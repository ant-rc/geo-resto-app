import { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Restaurant } from '../types/database';

export interface MapSectionRef {
  recenterTo: (region: Region) => void;
}

interface MapSectionProps {
  restaurants: Restaurant[];
  region: Region;
  onMarkerPress?: (restaurant: Restaurant) => void;
}

const MapSection = forwardRef<MapSectionRef, MapSectionProps>(
  ({ restaurants, region, onMarkerPress }, ref) => {
    const mapRef = useRef<MapView>(null);

    useImperativeHandle(ref, () => ({
      recenterTo: (target) => {
        mapRef.current?.animateToRegion(target, 500);
      },
    }));

    return (
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {restaurants.map((restaurant) => (
            <Marker
              key={restaurant.id}
              coordinate={{
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
              }}
              title={restaurant.name}
              description={restaurant.cuisine_type?.join(', ')}
              onCalloutPress={() => onMarkerPress?.(restaurant)}
            />
          ))}
        </MapView>
      </View>
    );
  },
);

MapSection.displayName = 'MapSection';
export default MapSection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
