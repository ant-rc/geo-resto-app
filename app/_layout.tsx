import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import WebContainer from '../src/components/WebContainer';
import { FavoritesProvider } from '../src/context/FavoritesContext';

export default function RootLayout() {
  return (
    <FavoritesProvider>
      <WebContainer>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(restaurant)" />
          <Stack.Screen
            name="restaurant/[id]"
            options={{
              headerShown: false,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="settings"
            options={{ headerShown: false, presentation: 'card' }}
          />
        </Stack>
      </WebContainer>
    </FavoritesProvider>
  );
}
