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
        onPress && styles.chipInteractive,
        selected && styles.chipSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected } : undefined}
      accessibilityLabel={label}
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
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipInteractive: {
    minHeight: 44,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
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
