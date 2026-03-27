import { Platform, Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export const Layout = {
  headerTopPadding: Platform.OS === 'ios' ? 64 : 52,
  backButtonTop: Platform.OS === 'ios' ? 56 : 44,
  screenHeight: SCREEN_HEIGHT,
  screenWidth: SCREEN_WIDTH,
  horizontalPadding: 20,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 20,
    pill: 24,
    card: 20,
    sheet: 28,
  },
} as const;
