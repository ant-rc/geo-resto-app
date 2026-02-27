import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Restaurant } from '../types/database';

interface DetailMapSectionProps {
  restaurant: Restaurant;
}

export default function DetailMapSection({ restaurant }: DetailMapSectionProps) {
  function openMaps() {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`;
    Linking.openURL(url);
  }

  return (
    <TouchableOpacity style={styles.container} onPress={openMaps} activeOpacity={0.8}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="map" size={32} color={Colors.light.primary} />
        </View>
        <Text style={styles.address}>{restaurant.address}</Text>
        <View style={styles.button}>
          <Ionicons name="navigate" size={14} color={Colors.light.primary} />
          <Text style={styles.buttonText}>Ouvrir dans Google Maps</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    backgroundColor: Colors.light.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  address: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.light.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  buttonText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '500',
  },
});
