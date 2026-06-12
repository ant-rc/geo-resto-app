import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import WebContainer from '../src/components/WebContainer';
import { FavoritesProvider } from '../src/context/FavoritesContext';

export default function RootLayout() {
  // Central auth guard: any sign-out (from anywhere) bounces back to login,
  // so protected groups can't be left visible without a session.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/(auth)/login');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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
