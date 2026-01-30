import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { Colors } from '../../src/constants/colors';
import { Profile } from '../../src/types/database';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  }

  async function handleLogout() {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ]
    );
  }

  function MenuItem({
    icon,
    title,
    onPress,
    destructive = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
    destructive?: boolean;
  }) {
    return (
      <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuItemLeft}>
          <Ionicons
            name={icon}
            size={24}
            color={destructive ? Colors.light.error : Colors.light.text}
          />
          <Text
            style={[
              styles.menuItemText,
              destructive && styles.menuItemTextDestructive,
            ]}
          >
            {title}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.light.textSecondary}
        />
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color={Colors.light.primary} />
        </View>
        <Text style={styles.name}>
          {profile?.full_name || 'Utilisateur'}
        </Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="person-outline"
            title="Modifier le profil"
            onPress={() => Alert.alert('À venir', 'Cette fonctionnalité arrive bientôt')}
          />
          <View style={styles.separator} />
          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            onPress={() => Alert.alert('À venir', 'Cette fonctionnalité arrive bientôt')}
          />
          <View style={styles.separator} />
          <MenuItem
            icon="lock-closed-outline"
            title="Confidentialité"
            onPress={() => Alert.alert('À venir', 'Cette fonctionnalité arrive bientôt')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="restaurant-outline"
            title="Préférences culinaires"
            onPress={() => Alert.alert('À venir', 'Cette fonctionnalité arrive bientôt')}
          />
          <View style={styles.separator} />
          <MenuItem
            icon="location-outline"
            title="Rayon de recherche"
            onPress={() => Alert.alert('À venir', 'Cette fonctionnalité arrive bientôt')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="help-circle-outline"
            title="Aide"
            onPress={() => Alert.alert('À venir', 'Cette fonctionnalité arrive bientôt')}
          />
          <View style={styles.separator} />
          <MenuItem
            icon="chatbubble-outline"
            title="Nous contacter"
            onPress={() => Alert.alert('À venir', 'Cette fonctionnalité arrive bientôt')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.menuCard}>
          <MenuItem
            icon="log-out-outline"
            title="Déconnexion"
            onPress={handleLogout}
            destructive
          />
        </View>
      </View>

      <Text style={styles.version}>GeoResto v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  menuCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  menuItemTextDestructive: {
    color: Colors.light.error,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: 52,
  },
  version: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    fontSize: 12,
    marginVertical: 32,
  },
});
