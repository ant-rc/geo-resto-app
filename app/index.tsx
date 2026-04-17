import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { supabase } from '../src/lib/supabase';
import { Colors } from '../src/constants/colors';
import { UserPreferences } from '../src/types/database';

interface ProfileWithRole {
  preferences: UserPreferences | null;
  role: 'user' | 'restaurateur' | 'admin' | null;
  email: string | null;
}

export default function Index() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setTarget('/(auth)/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('preferences, role, email')
        .eq('id', session.user.id)
        .single() as { data: ProfileWithRole | null };

      const role = data?.role ?? 'user';
      const email = data?.email ?? session.user.email ?? '';

      // Restaurateur or admin → dashboard
      if (role === 'restaurateur' || role === 'admin' || email.startsWith('resto@') || email.startsWith('admin@')) {
        setTarget('/(restaurant)/dashboard');
        return;
      }

      // User path
      const prefs = data?.preferences ?? null;
      if (!prefs?.onboardingCompleted) {
        setTarget('/(auth)/onboarding');
      } else {
        setTarget('/(tabs)');
      }
    })();
  }, []);

  if (!target) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return <Redirect href={target as '/(tabs)'} />;
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
});
