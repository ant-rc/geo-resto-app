import { Platform, ViewStyle } from 'react-native';

export function platformShadow(elevation: number, color = '#000'): ViewStyle {
  if (Platform.OS === 'web') {
    return {
      shadowColor: color,
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.06 + elevation * 0.01,
      shadowRadius: elevation * 2,
    };
  }
  return {
    elevation,
    shadowColor: color,
    shadowOffset: { width: 0, height: elevation / 2 },
    shadowOpacity: 0.06 + elevation * 0.01,
    shadowRadius: elevation * 1.5,
  };
}

export function glassShadow(): ViewStyle {
  return platformShadow(8, '#1A3C34');
}
