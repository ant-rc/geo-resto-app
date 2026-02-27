import { View, StyleSheet, Platform } from 'react-native';
import { Colors } from '../constants/colors';

interface WebContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export default function WebContainer({ children, maxWidth = 480 }: WebContainerProps) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.outer}>
      <View style={[styles.inner, { maxWidth }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: Colors.light.backgroundWeb,
    alignItems: 'center',
  },
  inner: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.light.background,
    ...(Platform.OS === 'web'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: Colors.light.border,
        }
      : {}),
  },
});
