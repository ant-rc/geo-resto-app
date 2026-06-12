import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Colors } from '../../src/constants/colors';
import { Profile, UserPreferences } from '../../src/types/database';
import { useFavoritesContext } from '../../src/context/FavoritesContext';
import { Reservation, ThumbValue, MOCK_RESERVATIONS } from '../../src/components/profile/profileData';
import ReservationsModal from '../../src/components/profile/ReservationsModal';
import ReviewModal from '../../src/components/profile/ReviewModal';
import NotificationsModal from '../../src/components/profile/NotificationsModal';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { favorites } = useFavoritesContext();
  const [reservationsModalVisible, setReservationsModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<Reservation | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [reviewService, setReviewService] = useState<ThumbValue>(null);
  const [reviewQuality, setReviewQuality] = useState<ThumbValue>(null);
  const [reviewAmbiance, setReviewAmbiance] = useState<ThumbValue>(null);
  const [reviewNote, setReviewNote] = useState('');

  function openReview(reservation: Reservation) {
    setReviewTarget(reservation);
    setReviewService(null);
    setReviewQuality(null);
    setReviewAmbiance(null);
    setReviewNote('');
    setReviewModalVisible(true);
  }

  function submitReview() {
    if (!reviewTarget) return;
    const anyRating = reviewService || reviewQuality || reviewAmbiance;
    if (!anyRating) {
      Alert.alert('Note manquante', 'Donnez au moins un pouce avant de publier.');
      return;
    }
    setReviewedIds((prev) => new Set(prev).add(reviewTarget.id));
    setReviewModalVisible(false);
    Alert.alert('Merci pour votre avis !', 'Votre retour aide les autres utilisateurs à choisir.');
  }
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [promoEnabled, setPromoEnabled] = useState(true);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    fetchProfile();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mountedRef.current) {
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!mountedRef.current) return;

      if (error && error.code !== 'PGRST116') {
        Alert.alert('Erreur', 'Impossible de charger le profil');
      } else if (data) {
        setProfile(data);
      }
    } catch (_error) {
      if (mountedRef.current) Alert.alert('Erreur', 'Impossible de charger le profil');
    } finally {
      if (mountedRef.current) setLoading(false);
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
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  }

  const prefs = profile?.preferences as UserPreferences | null;
  const userName = profile?.full_name || 'Utilisateur';
  const userInitial = userName.charAt(0).toUpperCase();
  const favoritesCount = favorites.length;
  const reservationsCount = MOCK_RESERVATIONS.length;
  const reviewsCount = reviewedIds.size;
  const cuisineTypes = prefs?.cuisineTypes ?? [];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with avatar, name, subtitle */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{userInitial}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.cameraBtn}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Photo de profil', 'Le changement de photo arrive bientôt.')}
            accessibilityRole="button"
            accessibilityLabel="Changer la photo de profil"
          >
            <Ionicons name="camera" size={14} color={Colors.light.textOnPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.subtitle}>Gourmet Explorer</Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{reservationsCount}</Text>
            <Text style={styles.statLabel}>RÉSERVATIONS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{favoritesCount}</Text>
            <Text style={styles.statLabel}>FAVORIS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{reviewsCount}</Text>
            <Text style={styles.statLabel}>AVIS</Text>
          </View>
        </View>
      </View>

      <View style={styles.contentArea}>
        {/* Allergy / Cuisine Profile Card */}
        <View style={styles.allergyCard}>
          <View style={styles.allergyHeader}>
            <View style={styles.allergyHeaderLeft}>
              <View style={styles.shieldIcon}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.light.textOnPrimary} />
              </View>
              <Text style={styles.allergyTitle}>Mon profil culinaire</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/onboarding')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Éditer mon profil culinaire"
            >
              <Text style={styles.allergyEditBtn}>Éditer</Text>
            </TouchableOpacity>
          </View>

          {cuisineTypes.length > 0 ? (
            <View style={styles.allergyChips}>
              {cuisineTypes.map((cuisine) => (
                <View key={cuisine} style={styles.allergyChip}>
                  <Ionicons name="restaurant" size={12} color={Colors.light.secondary} />
                  <Text style={styles.allergyChipText}>{cuisine}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.allergyChips}>
              <View style={styles.allergyChip}>
                <Text style={styles.allergyChipText}>Non définies</Text>
              </View>
            </View>
          )}

          <Text style={styles.allergyDescription}>
            &quot;Nous filtrerons automatiquement les restaurants selon vos préférences.&quot;
          </Text>
        </View>

        {/* Activity Section */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>ACTIVITÉ</Text>

          <TouchableOpacity
            style={styles.activityItem}
            onPress={() => router.push('/(tabs)/favorites')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Mes favoris"
          >
            <View style={styles.activityItemLeft}>
              <View style={styles.activityIconPrimary}>
                <Ionicons name="heart" size={18} color={Colors.light.primary} />
              </View>
              <Text style={styles.activityItemText}>Mes favoris</Text>
            </View>
            <View style={styles.activityItemRight}>
              <Text style={styles.activityCount}>{favoritesCount}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.activityItem}
            onPress={() => setReservationsModalVisible(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Mes réservations"
          >
            <View style={styles.activityItemLeft}>
              <View style={styles.activityIconPrimary}>
                <Ionicons name="calendar" size={18} color={Colors.light.primary} />
              </View>
              <Text style={styles.activityItemText}>Mes réservations</Text>
            </View>
            <View style={styles.activityItemRight}>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>Nouveau</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.activityItem}
            onPress={() => Alert.alert('Offres', 'Aucune offre disponible pour le moment')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Offres et codes promo"
          >
            <View style={styles.activityItemLeft}>
              <View style={styles.activityIconPrimary}>
                <Ionicons name="pricetag" size={18} color={Colors.light.primary} />
              </View>
              <Text style={styles.activityItemText}>Offres & codes promo</Text>
            </View>
            <View style={styles.activityItemRight}>
              <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionLabel}>PRÉFÉRENCES</Text>

          <TouchableOpacity
            style={styles.activityItem}
            onPress={() => setNotificationsModalVisible(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <View style={styles.activityItemLeft}>
              <View style={styles.activityIconMuted}>
                <Ionicons name="notifications" size={18} color={Colors.light.text} />
              </View>
              <Text style={styles.activityItemText}>Notifications</Text>
            </View>
            <View style={styles.activityItemRight}>
              <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.activityItem}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Paramètres"
          >
            <View style={styles.activityItemLeft}>
              <View style={styles.activityIconMuted}>
                <Ionicons name="settings" size={18} color={Colors.light.text} />
              </View>
              <Text style={styles.activityItemText}>Paramètres</Text>
            </View>
            <View style={styles.activityItemRight}>
              <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Déconnexion"
        >
          <Ionicons name="log-out-outline" size={22} color={Colors.light.error} />
          <Text style={styles.signOutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 120 }} />

      <ReservationsModal
        visible={reservationsModalVisible}
        onClose={() => setReservationsModalVisible(false)}
        reviewedIds={reviewedIds}
        onOpenReview={openReview}
      />

      <ReviewModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={submitReview}
        target={reviewTarget}
        service={reviewService}
        onServiceChange={setReviewService}
        quality={reviewQuality}
        onQualityChange={setReviewQuality}
        ambiance={reviewAmbiance}
        onAmbianceChange={setReviewAmbiance}
        note={reviewNote}
        onNoteChange={setReviewNote}
      />

      <NotificationsModal
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
        pushEnabled={pushEnabled}
        onPushChange={setPushEnabled}
        emailEnabled={emailEnabled}
        onEmailChange={setEmailEnabled}
        promoEnabled={promoEnabled}
        onPromoChange={setPromoEnabled}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },

  /* Header */
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 64 : 52,
    paddingBottom: 24,
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: Colors.light.primary,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
    }),
  },
  avatar: {
    flex: 1,
    borderRadius: 50,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.light.background,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
  nameBlock: {
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
    marginTop: 4,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    letterSpacing: 1.2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.light.border,
  },

  /* Content area */
  contentArea: {
    paddingHorizontal: 20,
    gap: 24,
  },

  /* Allergy / Cuisine Profile Card */
  allergyCard: {
    backgroundColor: Colors.light.accentLight,
    borderWidth: 2,
    borderColor: Colors.light.secondary,
    borderRadius: 24,
    padding: 20,
    gap: 14,
  },
  allergyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  allergyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shieldIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      default: {
        shadowColor: Colors.light.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  allergyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.light.text,
  },
  allergyEditBtn: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.secondary,
  },
  allergyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.background,
    borderWidth: 2,
    borderColor: Colors.light.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  allergyChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.text,
  },
  allergyDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },

  /* Section */
  sectionBlock: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.light.textSecondary,
    letterSpacing: 2.2,
    marginLeft: 8,
    marginBottom: 4,
  },

  /* Activity items */
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  activityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  activityIconPrimary: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconMuted: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: Colors.light.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityItemText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  activityItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityCount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  newBadge: {
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textOnPrimary,
  },

  /* Sign out */
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.error,
  },
});
