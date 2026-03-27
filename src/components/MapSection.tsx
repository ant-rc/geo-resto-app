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

export default function MapSection({ restaurants }: MapSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="compass" size={32} color={Colors.light.primary} />
        </View>
        <Text style={styles.title}>Carte interactive</Text>
        <Text style={styles.subtitle}>
          Disponible sur l'application mobile
        </Text>
        <View style={styles.badge}>
          <Ionicons name="restaurant-outline" size={13} color={Colors.light.primary} />
          <Text style={styles.badgeText}>{restaurants.length} restaurants</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primaryLight,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    padding: 24,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.primary,
  },
});
