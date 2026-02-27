import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Restaurant } from '../types/database';

interface DetailMapSectionProps {
  restaurant: Restaurant;
}

export default function DetailMapSection({ restaurant }: DetailMapSectionProps) {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        <Marker
          coordinate={{
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          }}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
  },
  map: {
    flex: 1,
  },
});
