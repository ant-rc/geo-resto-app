import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Restaurant } from '../types/database';

interface MapSectionProps {
  restaurants: Restaurant[];
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onMarkerPress?: (restaurant: Restaurant) => void;
}

export default function MapSection({ restaurants, region, onMarkerPress }: MapSectionProps) {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
