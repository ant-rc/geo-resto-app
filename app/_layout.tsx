import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { supabase } from '../src/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Colors } from '../src/constants/colors';
import { UserPreferences } from '../src/types/database';
import WebContainer from '../src/components/WebContainer';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkOnboarding(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          await checkOnboarding(session.user.id);
        } else {
          setNeedsOnboarding(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function checkOnboarding(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', userId)
      .single() as { data: { preferences: UserPreferences | null } | null };

    const prefs = data?.preferences ?? null;
    const completed = prefs?.onboardingCompleted ?? false;
    setNeedsOnboarding(!completed);
    setLoading(false);
  }

  useEffect(() => {
    if (!loading && session && needsOnboarding) {
      router.replace('/(auth)/onboarding');
    }
  }, [loading, session, needsOnboarding]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <WebContainer>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        {session && !needsOnboarding ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
        <Stack.Screen
          name="restaurant/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
      </Stack>
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
});
