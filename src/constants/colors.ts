export const Colors = {
  light: {
    primary: '#FF6B35',
    secondary: '#004E64',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#1A1A1A',
    textSecondary: '#666666',
    border: '#E0E0E0',
    error: '#D32F2F',
    success: '#388E3C',
    warning: '#F57C00',
  },
  dark: {
    primary: '#FF8A5B',
    secondary: '#25A18E',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#333333',
    error: '#EF5350',
    success: '#66BB6A',
    warning: '#FFA726',
  },
};

export type ColorScheme = keyof typeof Colors;
