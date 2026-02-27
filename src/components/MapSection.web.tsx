import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
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

export default function MapSection({ restaurants, region }: MapSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="map" size={32} color={Colors.light.primary} />
        </View>
        <Text style={styles.title}>Carte interactive</Text>
        <Text style={styles.subtitle}>
          Disponible sur l'application mobile
        </Text>
        <Text style={styles.count}>
          {restaurants.length} restaurants dans cette zone
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160,
    backgroundColor: Colors.light.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  count: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '500',
  },
});
