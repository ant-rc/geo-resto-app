import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { Colors } from '../../src/constants/colors';
import { Profile, UserPreferences } from '../../src/types/database';
import TagChip from '../../src/components/TagChip';

const CUISINE_OPTIONS = [
  'Français', 'Italien', 'Japonais', 'Indien', 'Mexicain',
  'Libanais', 'Chinois', 'Thaïlandais', 'Coréen', 'Américain',
];

const DISTANCE_OPTIONS = [1, 3, 5, 10, 20];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [prefsModalVisible, setPrefsModalVisible] = useState(false);
  const [editPrefs, setEditPrefs] = useState<UserPreferences | null>(null);

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
      Alert.alert('Erreur', 'Impossible de charger le profil');
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  }

  function openPreferences() {
    const currentPrefs = (profile?.preferences as UserPreferences | null) ?? {
      cuisineTypes: [],
      priceRange: [1, 4] as [number, number],
      maxDistance: 5,
      onboardingCompleted: true,
    };
    setEditPrefs(currentPrefs);
    setPrefsModalVisible(true);
  }

  async function savePreferences() {
    if (!profile || !editPrefs) return;

    const { error } = await supabase
      .from('profiles')
      .update({ preferences: { ...editPrefs, onboardingCompleted: true } })
      .eq('id', profile.id);

    if (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les préférences');
    } else {
      setProfile({ ...profile, preferences: { ...editPrefs, onboardingCompleted: true } });
      setPrefsModalVisible(false);
    }
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
    subtitle,
    onPress,
    destructive = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    destructive?: boolean;
  }) {
    return (
      <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.menuItemLeft}>
          <View style={[styles.menuIcon, destructive && styles.menuIconDestructive]}>
            <Ionicons
              name={icon}
              size={17}
              color={destructive ? Colors.light.error : Colors.light.primary}
            />
          </View>
          <View>
            <Text
              style={[
                styles.menuItemText,
                destructive && styles.menuItemTextDestructive,
              ]}
            >
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.light.border} />
      </TouchableOpacity>
    );
  }

  const prefs = profile?.preferences as UserPreferences | null;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile header */}
      <View style={styles.header}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={Colors.light.primary} />
          </View>
        </View>
        <Text style={styles.name}>
          {profile?.full_name || 'Utilisateur'}
        </Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      {/* Account */}
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

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="restaurant-outline"
            title="Préférences culinaires"
            subtitle={prefs?.cuisineTypes?.length
              ? prefs.cuisineTypes.slice(0, 3).join(', ')
              : 'Non définies'}
            onPress={openPreferences}
          />
          <View style={styles.separator} />
          <MenuItem
            icon="location-outline"
            title="Rayon de recherche"
            subtitle={prefs?.maxDistance ? `${prefs.maxDistance} km` : '5 km'}
            onPress={openPreferences}
          />
        </View>
      </View>

      {/* Support */}
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

      {/* Logout */}
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

      <Text style={styles.version}>Tastly v2.0.0</Text>
      <View style={{ height: 120 }} />

      {/* Preferences Modal */}
      <Modal
        visible={prefsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPrefsModalVisible(false)}
      >
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <TouchableOpacity onPress={() => setPrefsModalVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={modalStyles.headerTitle}>Préférences</Text>
            <TouchableOpacity onPress={savePreferences}>
              <Text style={modalStyles.saveText}>Sauvegarder</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={modalStyles.content}>
            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>Cuisines préférées</Text>
              <View style={modalStyles.grid}>
                {CUISINE_OPTIONS.map((cuisine) => (
                  <TagChip
                    key={cuisine}
                    label={cuisine}
                    selected={editPrefs?.cuisineTypes?.includes(cuisine)}
                    onPress={() => {
                      if (!editPrefs) return;
                      const current = editPrefs.cuisineTypes;
                      setEditPrefs({
                        ...editPrefs,
                        cuisineTypes: current.includes(cuisine)
                          ? current.filter((c) => c !== cuisine)
                          : [...current, cuisine],
                      });
                    }}
                  />
                ))}
              </View>
            </View>

            <View style={modalStyles.section}>
              <Text style={modalStyles.sectionTitle}>Distance max</Text>
              <View style={modalStyles.grid}>
                {DISTANCE_OPTIONS.map((km) => (
                  <TagChip
                    key={km}
                    label={`${km} km`}
                    selected={editPrefs?.maxDistance === km}
                    onPress={() => {
                      if (!editPrefs) return;
                      setEditPrefs({ ...editPrefs, maxDistance: km });
                    }}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 72 : 60,
    paddingBottom: 28,
  },
  avatarRing: { marginBottom: 16 },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2.5, borderColor: Colors.light.primary,
  },
  name: {
    fontSize: 24, fontWeight: '700', color: Colors.light.text,
    letterSpacing: -0.5, marginBottom: 4,
  },
  email: { fontSize: 14, color: Colors.light.textSecondary },
  section: { marginTop: 24, paddingHorizontal: 24 },
  sectionTitle: {
    fontSize: 12, fontWeight: '600', color: Colors.light.textSecondary,
    marginBottom: 10, marginLeft: 4,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  menuCard: {
    backgroundColor: Colors.light.surface, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.light.borderLight, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 13, paddingHorizontal: 14,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  menuIconDestructive: { backgroundColor: '#FEE2E2' },
  menuItemText: {
    fontSize: 15, color: Colors.light.text, fontWeight: '500', letterSpacing: -0.1,
  },
  menuItemTextDestructive: { color: Colors.light.error },
  menuItemSubtitle: {
    fontSize: 12, color: Colors.light.textSecondary, marginTop: 1,
  },
  separator: { height: 1, backgroundColor: Colors.light.borderLight, marginLeft: 60 },
  version: {
    textAlign: 'center', color: Colors.light.textSecondary,
    fontSize: 12, marginTop: 32, letterSpacing: 0.3,
  },
});

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 16 : 20, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.light.text },
  saveText: { fontSize: 15, fontWeight: '600', color: Colors.light.accent },
  content: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 28 },
  sectionTitle: {
    fontSize: 15, fontWeight: '600', color: Colors.light.text,
    marginBottom: 12, letterSpacing: -0.2,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
