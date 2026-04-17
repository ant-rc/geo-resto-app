import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  Modal,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Colors } from '../../src/constants/colors';
import { Profile, UserPreferences } from '../../src/types/database';
import { useFavoritesContext } from '../../src/context/FavoritesContext';

interface Reservation {
  id: string;
  restaurant: string;
  date: string;
  time: string;
  guests: number;
  status: 'confirmée' | 'en attente' | 'passée';
}

const MOCK_RESERVATIONS: Reservation[] = [
  { id: 'r1', restaurant: 'Le Potager de Charlotte', date: '22 avril 2026', time: '20:00', guests: 2, status: 'confirmée' },
  { id: 'r2', restaurant: 'Sakura Ramen', date: '28 avril 2026', time: '12:30', guests: 4, status: 'en attente' },
  { id: 'r3', restaurant: 'La Trattoria Romana', date: '10 avril 2026', time: '19:30', guests: 3, status: 'passée' },
];

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  { id: 'n1', title: 'Nouvelle offre disponible', message: '-20% chez Le Potager de Charlotte ce soir', time: 'Il y a 2h', unread: true, icon: 'pricetag' },
  { id: 'n2', title: 'Réservation confirmée', message: 'Votre table pour 2 le 22 avril à 20:00', time: 'Hier', unread: true, icon: 'calendar' },
  { id: 'n3', title: 'Jam Session ce soir', message: 'Le Potager de Charlotte organise une jam jazz à 21:00', time: 'Il y a 4h', unread: true, icon: 'musical-notes' },
  { id: 'n4', title: 'Concert à venir', message: 'Chez Janou : quartet acoustique samedi 27 avril à 20:00', time: 'Hier', unread: false, icon: 'mic' },
  { id: 'n5', title: 'Dégustation de vins', message: 'Sakura Ramen : dégustation saké-sushi jeudi 2 mai', time: 'Il y a 2 jours', unread: false, icon: 'wine' },
  { id: 'n6', title: 'Nouveau restaurant', message: 'L\'Atelier Végétal vient d\'ouvrir près de chez vous', time: 'Il y a 3 jours', unread: false, icon: 'restaurant' },
];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { favorites } = useFavoritesContext();
  const [reservationsModalVisible, setReservationsModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<Reservation | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [reviewService, setReviewService] = useState<'up' | 'down' | null>(null);
  const [reviewQuality, setReviewQuality] = useState<'up' | 'down' | null>(null);
  const [reviewAmbiance, setReviewAmbiance] = useState<'up' | 'down' | null>(null);
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
          <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.8}>
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
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>RÉSERVATIONS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{favoritesCount}</Text>
            <Text style={styles.statLabel}>FAVORIS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
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
        >
          <Ionicons name="log-out-outline" size={22} color={Colors.light.error} />
          <Text style={styles.signOutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 120 }} />

      {/* Reservations Modal */}
      <Modal
        visible={reservationsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setReservationsModalVisible(false)}
      >
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <TouchableOpacity onPress={() => setReservationsModalVisible(false)} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={modalStyles.headerTitle}>Mes réservations</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={modalStyles.content}>
            {MOCK_RESERVATIONS.map((r) => (
              <View key={r.id} style={modalStyles.reservationCard}>
                <View style={modalStyles.reservationHeader}>
                  <Text style={modalStyles.reservationName}>{r.restaurant}</Text>
                  <View style={[
                    modalStyles.statusBadge,
                    r.status === 'confirmée' && modalStyles.statusConfirmed,
                    r.status === 'en attente' && modalStyles.statusPending,
                    r.status === 'passée' && modalStyles.statusPast,
                  ]}>
                    <Text style={modalStyles.statusText}>{r.status}</Text>
                  </View>
                </View>
                <View style={modalStyles.reservationMeta}>
                  <View style={modalStyles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.light.textSecondary} />
                    <Text style={modalStyles.metaText}>{r.date}</Text>
                  </View>
                  <View style={modalStyles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={Colors.light.textSecondary} />
                    <Text style={modalStyles.metaText}>{r.time}</Text>
                  </View>
                  <View style={modalStyles.metaItem}>
                    <Ionicons name="people-outline" size={14} color={Colors.light.textSecondary} />
                    <Text style={modalStyles.metaText}>{r.guests} pers.</Text>
                  </View>
                </View>
                {r.status === 'passée' && !reviewedIds.has(r.id) && (
                  <TouchableOpacity
                    style={modalStyles.reviewBtn}
                    onPress={() => openReview(r)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="star-outline" size={16} color={Colors.light.primary} />
                    <Text style={modalStyles.reviewBtnText}>Noter ce restaurant</Text>
                  </TouchableOpacity>
                )}
                {r.status === 'passée' && reviewedIds.has(r.id) && (
                  <View style={modalStyles.reviewedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.light.primary} />
                    <Text style={modalStyles.reviewedText}>Avis publié</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <TouchableOpacity onPress={() => setReviewModalVisible(false)} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={modalStyles.headerTitle}>Votre avis</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={modalStyles.content}>
            {reviewTarget && (
              <>
                <View style={modalStyles.reviewTargetCard}>
                  <Text style={modalStyles.reviewTargetName}>{reviewTarget.restaurant}</Text>
                  <Text style={modalStyles.reviewTargetSub}>Visité le {reviewTarget.date}</Text>
                </View>

                {[
                  { label: 'Service', value: reviewService, setter: setReviewService },
                  { label: 'Qualité des plats', value: reviewQuality, setter: setReviewQuality },
                  { label: 'Ambiance', value: reviewAmbiance, setter: setReviewAmbiance },
                ].map((criteria) => (
                  <View key={criteria.label} style={modalStyles.criteriaBlock}>
                    <Text style={modalStyles.criteriaLabel}>{criteria.label}</Text>
                    <View style={modalStyles.thumbsRow}>
                      <TouchableOpacity
                        style={[
                          modalStyles.thumbBtn,
                          criteria.value === 'down' && modalStyles.thumbBtnDownActive,
                        ]}
                        onPress={() => criteria.setter(criteria.value === 'down' ? null : 'down')}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="thumbs-down"
                          size={26}
                          color={criteria.value === 'down' ? '#fff' : Colors.light.textSecondary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          modalStyles.thumbBtn,
                          criteria.value === 'up' && modalStyles.thumbBtnUpActive,
                        ]}
                        onPress={() => criteria.setter(criteria.value === 'up' ? null : 'up')}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="thumbs-up"
                          size={26}
                          color={criteria.value === 'up' ? '#fff' : Colors.light.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <Text style={modalStyles.noteLabel}>Note personnelle (facultatif)</Text>
                <TextInput
                  style={modalStyles.noteInput}
                  value={reviewNote}
                  onChangeText={(t) => t.length <= 200 && setReviewNote(t)}
                  placeholder="Partagez votre expérience..."
                  placeholderTextColor={Colors.light.textSecondary}
                  multiline
                  numberOfLines={4}
                />
                <Text style={modalStyles.charCount}>{reviewNote.length} / 200</Text>

                <TouchableOpacity
                  style={modalStyles.publishBtn}
                  onPress={submitReview}
                  activeOpacity={0.85}
                >
                  <Text style={modalStyles.publishBtnText}>Publier</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={notificationsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setNotificationsModalVisible(false)}
      >
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <TouchableOpacity onPress={() => setNotificationsModalVisible(false)} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={modalStyles.headerTitle}>Notifications</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={modalStyles.content}>
            {/* Settings section */}
            <Text style={modalStyles.sectionLabel}>PRÉFÉRENCES</Text>
            <View style={modalStyles.settingsCard}>
              <View style={modalStyles.settingRow}>
                <View style={modalStyles.settingLeft}>
                  <Ionicons name="phone-portrait" size={18} color={Colors.light.primary} />
                  <Text style={modalStyles.settingText}>Push</Text>
                </View>
                <Switch
                  value={pushEnabled}
                  onValueChange={setPushEnabled}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  thumbColor="#fff"
                />
              </View>
              <View style={modalStyles.settingSeparator} />
              <View style={modalStyles.settingRow}>
                <View style={modalStyles.settingLeft}>
                  <Ionicons name="mail" size={18} color={Colors.light.primary} />
                  <Text style={modalStyles.settingText}>Email</Text>
                </View>
                <Switch
                  value={emailEnabled}
                  onValueChange={setEmailEnabled}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  thumbColor="#fff"
                />
              </View>
              <View style={modalStyles.settingSeparator} />
              <View style={modalStyles.settingRow}>
                <View style={modalStyles.settingLeft}>
                  <Ionicons name="pricetag" size={18} color={Colors.light.primary} />
                  <Text style={modalStyles.settingText}>Promotions</Text>
                </View>
                <Switch
                  value={promoEnabled}
                  onValueChange={setPromoEnabled}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* Notifications list */}
            <Text style={modalStyles.sectionLabel}>RÉCENTES</Text>
            {MOCK_NOTIFICATIONS.map((n) => (
              <View key={n.id} style={[modalStyles.notifCard, n.unread && modalStyles.notifCardUnread]}>
                <View style={modalStyles.notifIcon}>
                  <Ionicons name={n.icon} size={18} color={Colors.light.primary} />
                </View>
                <View style={modalStyles.notifBody}>
                  <Text style={modalStyles.notifTitle}>{n.title}</Text>
                  <Text style={modalStyles.notifMessage} numberOfLines={2}>{n.message}</Text>
                  <Text style={modalStyles.notifTime}>{n.time}</Text>
                </View>
                {n.unread && <View style={modalStyles.unreadDot} />}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    paddingHorizontal: 18, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.light.surfaceWarm,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.light.text },
  content: { padding: 18, gap: 12 },
  sectionLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.light.textSecondary,
    letterSpacing: 2, marginTop: 6, marginBottom: 4, paddingHorizontal: 4,
  },
  reservationCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    gap: 10,
  },
  reservationHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10,
  },
  reservationName: { fontSize: 15, fontWeight: '800', color: Colors.light.text, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  statusConfirmed: { backgroundColor: '#D1FAE5' },
  statusPending: { backgroundColor: '#FEF3C7' },
  statusPast: { backgroundColor: Colors.light.borderLight },
  statusText: { fontSize: 11, fontWeight: '800', color: Colors.light.text, textTransform: 'capitalize' },
  reservationMeta: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.light.textSecondary, fontWeight: '600' },
  settingsCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingText: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  settingSeparator: { height: 1, backgroundColor: Colors.light.borderLight, marginLeft: 44 },
  notifCard: {
    flexDirection: 'row', gap: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    alignItems: 'flex-start',
  },
  notifCardUnread: { backgroundColor: Colors.light.primaryLight, borderColor: Colors.light.primary },
  notifIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.light.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  notifBody: { flex: 1, gap: 2 },
  notifTitle: { fontSize: 13, fontWeight: '800', color: Colors.light.text },
  notifMessage: { fontSize: 12, color: Colors.light.textSecondary, lineHeight: 16 },
  notifTime: { fontSize: 10, color: Colors.light.textSecondary, marginTop: 2, fontWeight: '600' },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.light.primary,
    marginTop: 6,
  },

  /* Review — button on reservation card */
  reviewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.light.primaryLight,
    paddingVertical: 10, borderRadius: 12, marginTop: 6,
  },
  reviewBtnText: { color: Colors.light.primary, fontSize: 13, fontWeight: '800' },
  reviewedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6,
  },
  reviewedText: { color: Colors.light.primary, fontSize: 12, fontWeight: '700' },

  /* Review — modal */
  reviewTargetCard: {
    backgroundColor: Colors.light.primaryLight,
    borderRadius: 14, padding: 14, marginBottom: 20,
  },
  reviewTargetName: { fontSize: 17, fontWeight: '800', color: Colors.light.text },
  reviewTargetSub: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },
  criteriaBlock: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  criteriaLabel: { fontSize: 14, fontWeight: '800', color: Colors.light.text, marginBottom: 12 },
  thumbsRow: { flexDirection: 'row', gap: 10 },
  thumbBtn: {
    flex: 1,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceWarm,
    borderWidth: 1.5, borderColor: Colors.light.borderLight,
  },
  thumbBtnUpActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  thumbBtnDownActive: { backgroundColor: Colors.light.error, borderColor: Colors.light.error },
  noteLabel: { fontSize: 13, fontWeight: '800', color: Colors.light.text, marginTop: 12, marginBottom: 8 },
  noteInput: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    fontSize: 14, color: Colors.light.text,
    minHeight: 90, textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, color: Colors.light.textSecondary, textAlign: 'right', marginTop: 6 },
  publishBtn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', marginTop: 20,
  },
  publishBtnText: { color: Colors.light.textOnPrimary, fontSize: 15, fontWeight: '800' },
});

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
