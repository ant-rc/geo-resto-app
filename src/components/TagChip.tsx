import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface TagChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium';
}

export default function TagChip({
  label,
  selected = false,
  onPress,
  size = 'medium',
}: TagChipProps) {
  const isSmall = size === 'small';

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isSmall && styles.chipSmall,
        selected && styles.chipSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={!onPress}
    >
      <Text
        style={[
          styles.label,
          isSmall && styles.labelSmall,
          selected && styles.labelSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
  },
  chipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipSelected: {
    backgroundColor: Colors.light.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.primary,
    letterSpacing: -0.1,
  },
  labelSmall: {
    fontSize: 11,
  },
  labelSelected: {
    color: Colors.light.textOnPrimary,
  },
});
