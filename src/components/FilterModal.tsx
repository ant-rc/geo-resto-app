import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { RestaurantFilters } from '@/hooks/useRestaurants';
import TagChip from './TagChip';
import { CUISINE_OPTIONS, TAG_OPTIONS, DISTANCE_OPTIONS } from '@/constants/data';

const SORT_OPTIONS: { key: RestaurantFilters['sortBy']; label: string }[] = [
  { key: 'distance', label: 'Distance' },
  { key: 'rating', label: 'Note' },
  { key: 'price', label: 'Prix' },
];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: RestaurantFilters;
  onApply: (filters: RestaurantFilters) => void;
}

export default function FilterModal({
  visible,
  onClose,
  filters,
  onApply,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<RestaurantFilters>(filters);

  function handleReset() {
    setLocalFilters({
      sortBy: 'distance',
    });
  }

  function handleApply() {
    onApply(localFilters);
    onClose();
  }

  function toggleCuisine(cuisine: string) {
    setLocalFilters((prev) => ({
      ...prev,
      cuisineType: prev.cuisineType === cuisine ? null : cuisine,
    }));
  }

  function toggleTag(tag: string) {
    setLocalFilters((prev) => {
      const current = prev.tags ?? [];
      const exists = current.includes(tag);
      return {
        ...prev,
        tags: exists ? current.filter((t) => t !== tag) : [...current, tag],
      };
    });
  }

  function selectPriceRange(min: number, max: number) {
    setLocalFilters((prev) => ({
      ...prev,
      priceRange: [min, max],
    }));
  }

  function selectDistance(km: number) {
    setLocalFilters((prev) => ({
      ...prev,
      maxDistance: prev.maxDistance === km ? undefined : km,
    }));
  }

  function selectSort(sort: RestaurantFilters['sortBy']) {
    setLocalFilters((prev) => ({
      ...prev,
      sortBy: sort,
    }));
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filtres</Text>
          <TouchableOpacity onPress={handleReset} activeOpacity={0.7}>
            <Text style={styles.resetText}>Réinitialiser</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Sort */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trier par</Text>
            <View style={styles.row}>
              {SORT_OPTIONS.map((option) => (
                <TagChip
                  key={option.key}
                  label={option.label}
                  selected={localFilters.sortBy === option.key}
                  onPress={() => selectSort(option.key)}
                />
              ))}
            </View>
          </View>

          {/* Cuisine */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type de cuisine</Text>
            <View style={styles.row}>
              {CUISINE_OPTIONS.map((cuisine) => (
                <TagChip
                  key={cuisine}
                  label={cuisine}
                  selected={localFilters.cuisineType === cuisine}
                  onPress={() => toggleCuisine(cuisine)}
                />
              ))}
            </View>
          </View>

          {/* Price range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fourchette de prix</Text>
            <View style={styles.row}>
              {[
                { label: '$', range: [1, 1] },
                { label: '$$', range: [2, 2] },
                { label: '$$$', range: [3, 3] },
                { label: '$$$$', range: [4, 4] },
                { label: 'Tous', range: [1, 4] },
              ].map((option) => {
                const isSelected =
                  localFilters.priceRange?.[0] === option.range[0] &&
                  localFilters.priceRange?.[1] === option.range[1];
                return (
                  <TagChip
                    key={option.label}
                    label={option.label}
                    selected={isSelected}
                    onPress={() =>
                      selectPriceRange(option.range[0], option.range[1])
                    }
                  />
                );
              })}
            </View>
          </View>

          {/* Distance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distance max</Text>
            <View style={styles.row}>
              {DISTANCE_OPTIONS.map((km) => (
                <TagChip
                  key={km}
                  label={`${km} km`}
                  selected={localFilters.maxDistance === km}
                  onPress={() => selectDistance(km)}
                />
              ))}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.row}>
              {TAG_OPTIONS.map((tag) => (
                <TagChip
                  key={tag}
                  label={tag}
                  selected={localFilters.tags?.includes(tag)}
                  onPress={() => toggleTag(tag)}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Apply button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={handleApply}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark" size={18} color={Colors.light.textOnPrimary} />
            <Text style={styles.applyText}>Appliquer les filtres</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
    letterSpacing: -0.2,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.accent,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    backgroundColor: Colors.light.background,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  applyBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textOnPrimary,
    letterSpacing: -0.2,
  },
});
