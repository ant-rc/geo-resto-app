import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../src/lib/supabase';
import { Colors } from '../../src/constants/colors';
import {
  STATS,
  PLANS,
  PlanId,
  EventType,
  BoostDuration,
  BOOST_PRICES,
  getPlanData,
} from '../../src/components/restaurant/dashboardData';
import PlansModal from '../../src/components/restaurant/PlansModal';
import EditProfileModal from '../../src/components/restaurant/EditProfileModal';
import SettingsModal from '../../src/components/restaurant/SettingsModal';
import PromoModal from '../../src/components/restaurant/PromoModal';
import EventModal from '../../src/components/restaurant/EventModal';
import BoostModal from '../../src/components/restaurant/BoostModal';
import CancelSubModal from '../../src/components/restaurant/CancelSubModal';
import WelcomeOfferModal from '../../src/components/restaurant/WelcomeOfferModal';

const WELCOME_SEEN_KEY = 'restaurant_welcome_offer_seen';

export default function DashboardScreen() {
  const [currentPlan, setCurrentPlan] = useState<PlanId>('free');
  const [plansModalVisible, setPlansModalVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [cancelSubVisible, setCancelSubVisible] = useState(false);
  // Post-login upsell, shown once to free-plan owners (persisted across launches).
  const [welcomeVisible, setWelcomeVisible] = useState(false);

  // Restaurant profile state
  const [restaurantName, setRestaurantName] = useState('Mon Restaurant');
  const [restaurantAddress, setRestaurantAddress] = useState('123 Rue de la Gastronomie, Paris');
  const [restaurantPhone, setRestaurantPhone] = useState('+33 1 42 00 00 00');
  const [restaurantDesc, setRestaurantDesc] = useState('Cuisine française traditionnelle dans un cadre chaleureux.');

  // Settings state
  const [notifReservations, setNotifReservations] = useState(true);
  const [notifReviews, setNotifReviews] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);

  // Promotion form state
  const [promoModalVisible, setPromoModalVisible] = useState(false);
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDiscount, setPromoDiscount] = useState('');
  const [promoEndDate, setPromoEndDate] = useState('');
  const [promoArticles, setPromoArticles] = useState<string[]>([]);

  // Event form state
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [eventType, setEventType] = useState<EventType>('jam');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventDesc, setEventDesc] = useState('');

  // Boost/highlight form state
  const [boostModalVisible, setBoostModalVisible] = useState(false);
  const [boostDuration, setBoostDuration] = useState<BoostDuration>(7);

  useEffect(() => {
    AsyncStorage.getItem(WELCOME_SEEN_KEY)
      .then((seen) => {
        if (!seen && currentPlan === 'free') setWelcomeVisible(true);
      })
      .catch(() => {});
    // Shown once on first dashboard visit; intentionally runs on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismissWelcome() {
    setWelcomeVisible(false);
    AsyncStorage.setItem(WELCOME_SEEN_KEY, '1').catch(() => {});
  }

  function toggleArticle(id: string) {
    setPromoArticles((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  }

  function submitPromotion() {
    if (!promoTitle.trim() || !promoDiscount.trim()) {
      Alert.alert('Champs requis', 'Indiquez un titre et un pourcentage de réduction.');
      return;
    }
    setPromoModalVisible(false);
    setPromoTitle('');
    setPromoDiscount('');
    setPromoEndDate('');
    setPromoArticles([]);
    Alert.alert('Promotion créée', 'Votre promotion est maintenant active sur votre fiche.');
  }

  function submitEvent() {
    if (!eventTitle.trim() || !eventDate.trim()) {
      Alert.alert('Champs requis', 'Indiquez un titre et une date.');
      return;
    }
    setEventModalVisible(false);
    setEventTitle('');
    setEventDate('');
    setEventTime('');
    setEventDesc('');
    setEventType('jam');
    Alert.alert('Évènement publié', 'Votre évènement est désormais visible par les utilisateurs.');
  }

  function submitBoost() {
    Alert.alert(
      'Mise en avant activée',
      `Votre restaurant sera boosté pendant ${boostDuration} jours (${BOOST_PRICES[boostDuration]}).`,
    );
    setBoostModalVisible(false);
  }

  async function handleLogout() {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert('Erreur', error.message);
            return;
          }
          router.replace('/(auth)/login');
        },
      },
    ]);
  }

  function selectPlan(planId: PlanId) {
    if (planId === currentPlan) {
      setPlansModalVisible(false);
      return;
    }
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return;

    if (planId === 'free' && currentPlan !== 'free') {
      setPlansModalVisible(false);
      setCancelSubVisible(true);
      return;
    }

    Alert.alert(
      `Passer au plan ${plan.name}`,
      `Vous allez être facturé ${plan.price}${plan.period}. Continuer ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            setCurrentPlan(planId);
            setPlansModalVisible(false);
            Alert.alert('Félicitations !', `Vous êtes maintenant en plan ${plan.name}. Profitez de tous les avantages !`);
          },
        },
      ]
    );
  }

  function confirmCancelSubscription() {
    // CancelSubModal is already the confirmation step — no second Alert prompt.
    setCurrentPlan('free');
    setCancelSubVisible(false);
    Alert.alert(
      'Résiliation effectuée',
      'Votre abonnement prendra fin à la prochaine échéance. Vous pouvez le réactiver à tout moment.',
    );
  }

  function saveProfile() {
    setEditProfileVisible(false);
    Alert.alert('Profil mis à jour', 'Les modifications de votre restaurant ont été enregistrées.');
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mon Restaurant</Text>
          <Text style={styles.headerSubtitle}>Tableau de bord</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          activeOpacity={0.7}
          onPress={() => setSettingsVisible(true)}
        >
          <Ionicons name="settings-outline" size={22} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      {/* Current Plan Badge */}
      <TouchableOpacity
        style={[styles.planBadge, currentPlan !== 'free' && styles.planBadgePremium]}
        activeOpacity={0.85}
        onPress={() => setPlansModalVisible(true)}
      >
        <View style={styles.planBadgeLeft}>
          <Ionicons
            name={currentPlan === 'free' ? 'gift-outline' : 'diamond'}
            size={20}
            color={currentPlan === 'free' ? Colors.light.primary : '#fff'}
          />
          <View>
            <Text style={[styles.planBadgeLabel, currentPlan !== 'free' && styles.planBadgeLabelPremium]}>
              PLAN ACTUEL
            </Text>
            <Text style={[styles.planBadgeName, currentPlan !== 'free' && styles.planBadgeNamePremium]}>
              {getPlanData(currentPlan).name}
            </Text>
          </View>
        </View>
        <View style={styles.planBadgeRight}>
          <Text style={[styles.planBadgeCTA, currentPlan !== 'free' && styles.planBadgeCTAPremium]}>
            {currentPlan === 'free' ? 'Découvrir' : 'Gérer'}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={currentPlan === 'free' ? Colors.light.primary : '#fff'}
          />
        </View>
      </TouchableOpacity>

      {/* Stats */}
      <Text style={styles.sectionLabel}>STATISTIQUES</Text>
      <View style={styles.statsRow}>
        {STATS.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name={stat.icon} size={18} color={Colors.light.primary} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Establishment card */}
      <Text style={styles.sectionLabel}>MON ÉTABLISSEMENT</Text>
      <View style={styles.estabCard}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop' }}
          style={styles.estabImage}
        />
        <View style={styles.estabBody}>
          <Text style={styles.estabName}>{restaurantName}</Text>
          <Text style={styles.estabAddress}>{restaurantAddress}</Text>
          <TouchableOpacity
            style={styles.editFicheBtn}
            onPress={() => setEditProfileVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={14} color={Colors.light.primary} />
            <Text style={styles.editFicheBtnText}>Modifier la fiche</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Marketing tools */}
      <Text style={styles.sectionLabel}>OUTILS MARKETING</Text>
      <TouchableOpacity
        style={styles.toolCard}
        activeOpacity={0.85}
        onPress={() => {
          if (currentPlan === 'free') {
            Alert.alert('Plan Essential requis', 'Passez au plan Essential pour créer des promotions.', [
              { text: 'Plus tard', style: 'cancel' },
              { text: 'Découvrir', onPress: () => setPlansModalVisible(true) },
            ]);
            return;
          }
          setPromoModalVisible(true);
        }}
      >
        <View style={styles.toolIconWrap}>
          <Ionicons name="pricetag" size={18} color={Colors.light.primary} />
        </View>
        <View style={styles.toolBody}>
          <View style={styles.toolTitleRow}>
            <Text style={styles.toolTitle}>Créer une promotion</Text>
            {currentPlan === 'free' && (
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={10} color={Colors.light.primary} />
                <Text style={styles.lockBadgeText}>Essential</Text>
              </View>
            )}
          </View>
          <Text style={styles.toolDesc}>Offres spéciales et réductions pour attirer de nouveaux clients</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.toolCard}
        activeOpacity={0.85}
        onPress={() => {
          if (currentPlan !== 'pro') {
            Alert.alert('Plan Pro requis', 'Passez au plan Pro pour booster votre visibilité.', [
              { text: 'Plus tard', style: 'cancel' },
              { text: 'Découvrir', onPress: () => setPlansModalVisible(true) },
            ]);
            return;
          }
          setBoostModalVisible(true);
        }}
      >
        <View style={styles.toolIconWrap}>
          <Ionicons name="trending-up" size={18} color={Colors.light.primary} />
        </View>
        <View style={styles.toolBody}>
          <View style={styles.toolTitleRow}>
            <Text style={styles.toolTitle}>Mettre en avant</Text>
            {currentPlan !== 'pro' && (
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={10} color={Colors.light.primary} />
                <Text style={styles.lockBadgeText}>Pro</Text>
              </View>
            )}
          </View>
          <Text style={styles.toolDesc}>Boostez votre visibilité dans les résultats de recherche</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
      </TouchableOpacity>

      {/* Tool - Évènement */}
      <TouchableOpacity
        style={styles.toolCard}
        activeOpacity={0.85}
        onPress={() => {
          if (currentPlan === 'free') {
            Alert.alert('Plan Essential requis', 'Passez au plan Essential pour publier des évènements.', [
              { text: 'Plus tard', style: 'cancel' },
              { text: 'Découvrir', onPress: () => setPlansModalVisible(true) },
            ]);
            return;
          }
          setEventModalVisible(true);
        }}
      >
        <View style={styles.toolIconWrap}>
          <Ionicons name="musical-notes" size={18} color={Colors.light.primary} />
        </View>
        <View style={styles.toolBody}>
          <View style={styles.toolTitleRow}>
            <Text style={styles.toolTitle}>Publier un évènement</Text>
            {currentPlan === 'free' && (
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={10} color={Colors.light.primary} />
                <Text style={styles.lockBadgeText}>Essential</Text>
              </View>
            )}
          </View>
          <Text style={styles.toolDesc}>Jam, concert, spectacle, dégustation - annoncez vos évènements</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
      </TouchableOpacity>

      {/* Analytics CTA */}
      <Text style={styles.sectionLabel}>ANALYTICS</Text>
      <View style={styles.analyticsCard}>
        <View style={styles.analyticsIconWrap}>
          <Ionicons name="bar-chart" size={24} color={Colors.light.primary} />
        </View>
        <Text style={styles.analyticsTitle}>
          {currentPlan === 'pro' ? 'Analytics avancées disponibles' : 'Statistiques détaillées disponibles avec Pro'}
        </Text>
        <Text style={styles.analyticsDesc}>
          {currentPlan === 'pro'
            ? 'Consultez vos analytics avancées : conversion, ROI, heatmaps.'
            : "Vues, clics, conversions. Visualisez l'impact de votre fiche."}
        </Text>
        {currentPlan !== 'pro' && (
          <TouchableOpacity
            style={styles.discoverPremiumBtn}
            activeOpacity={0.85}
            onPress={() => setPlansModalVisible(true)}
          >
            <Ionicons name="diamond" size={14} color={Colors.light.textOnPrimary} />
            <Text style={styles.discoverPremiumBtnText}>Découvrir les plans</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color={Colors.light.error} />
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>

      <PlansModal
        visible={plansModalVisible}
        onClose={() => setPlansModalVisible(false)}
        currentPlan={currentPlan}
        onSelectPlan={selectPlan}
        onOpenCancel={() => {
          setPlansModalVisible(false);
          setCancelSubVisible(true);
        }}
      />

      <EditProfileModal
        visible={editProfileVisible}
        onClose={() => setEditProfileVisible(false)}
        onSave={saveProfile}
        name={restaurantName}
        onChangeName={setRestaurantName}
        address={restaurantAddress}
        onChangeAddress={setRestaurantAddress}
        phone={restaurantPhone}
        onChangePhone={setRestaurantPhone}
        description={restaurantDesc}
        onChangeDescription={setRestaurantDesc}
      />

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        notifReservations={notifReservations}
        onNotifReservations={setNotifReservations}
        notifReviews={notifReviews}
        onNotifReviews={setNotifReviews}
        notifPromo={notifPromo}
        onNotifPromo={setNotifPromo}
        autoAccept={autoAccept}
        onAutoAccept={setAutoAccept}
        publicProfile={publicProfile}
        onPublicProfile={setPublicProfile}
      />

      <PromoModal
        visible={promoModalVisible}
        onClose={() => setPromoModalVisible(false)}
        onSubmit={submitPromotion}
        title={promoTitle}
        onChangeTitle={setPromoTitle}
        discount={promoDiscount}
        onChangeDiscount={setPromoDiscount}
        endDate={promoEndDate}
        onChangeEndDate={setPromoEndDate}
        selectedArticles={promoArticles}
        onToggleArticle={toggleArticle}
      />

      <EventModal
        visible={eventModalVisible}
        onClose={() => setEventModalVisible(false)}
        onSubmit={submitEvent}
        eventType={eventType}
        onSelectType={setEventType}
        title={eventTitle}
        onChangeTitle={setEventTitle}
        date={eventDate}
        onChangeDate={setEventDate}
        time={eventTime}
        onChangeTime={setEventTime}
        description={eventDesc}
        onChangeDescription={setEventDesc}
      />

      <BoostModal
        visible={boostModalVisible}
        onClose={() => setBoostModalVisible(false)}
        onSubmit={submitBoost}
        duration={boostDuration}
        onSelectDuration={setBoostDuration}
      />

      <CancelSubModal
        visible={cancelSubVisible}
        onClose={() => setCancelSubVisible(false)}
        onConfirm={confirmCancelSubscription}
        planData={getPlanData(currentPlan)}
      />

      <WelcomeOfferModal
        visible={welcomeVisible}
        onClose={dismissWelcome}
        onDiscover={() => {
          dismissWelcome();
          setPlansModalVisible(true);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  scrollContent: { padding: 20, paddingBottom: 60 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 20, marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.light.text },
  headerSubtitle: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
  settingsButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.light.surfaceWarm,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Plan badge */
  planBadge: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.light.surface, borderRadius: 18,
    borderWidth: 2, borderColor: Colors.light.primary,
    padding: 16, marginBottom: 24,
  },
  planBadgePremium: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  planBadgeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planBadgeRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  planBadgeLabel: {
    fontSize: 9, fontWeight: '800', color: Colors.light.textSecondary,
    letterSpacing: 1.5,
  },
  planBadgeLabelPremium: { color: 'rgba(255,255,255,0.8)' },
  planBadgeName: { fontSize: 17, fontWeight: '800', color: Colors.light.text, marginTop: 1 },
  planBadgeNamePremium: { color: '#fff' },
  planBadgeCTA: { fontSize: 13, fontWeight: '700', color: Colors.light.primary },
  planBadgeCTAPremium: { color: '#fff' },

  sectionLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.light.textSecondary,
    letterSpacing: 2, marginBottom: 10, marginTop: 8,
  },

  /* Stats */
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: Colors.light.surface, borderRadius: 14,
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  statIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.light.text },
  statLabel: { fontSize: 11, color: Colors.light.textSecondary, marginTop: 2, fontWeight: '600' },

  /* Establishment */
  estabCard: {
    backgroundColor: Colors.light.surface, borderRadius: 18,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    overflow: 'hidden', marginBottom: 24,
  },
  estabImage: { width: '100%', height: 130 },
  estabBody: { padding: 14 },
  estabName: { fontSize: 16, fontWeight: '800', color: Colors.light.text },
  estabAddress: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 4 },
  editFicheBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, alignSelf: 'flex-start',
  },
  editFicheBtnText: { fontSize: 13, fontWeight: '700', color: Colors.light.primary },

  /* Tools */
  toolCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.light.surface, borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: Colors.light.borderLight,
    marginBottom: 10,
  },
  toolIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  toolBody: { flex: 1, gap: 2 },
  toolTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toolTitle: { fontSize: 14, fontWeight: '800', color: Colors.light.text },
  toolDesc: { fontSize: 12, color: Colors.light.textSecondary, lineHeight: 16 },
  lockBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8,
  },
  lockBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.light.primary, letterSpacing: 0.5 },

  /* Analytics */
  analyticsCard: {
    backgroundColor: Colors.light.surface, borderRadius: 18,
    padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.light.borderLight,
    marginBottom: 24,
  },
  analyticsIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  analyticsTitle: { fontSize: 14, fontWeight: '800', color: Colors.light.text, textAlign: 'center' },
  analyticsDesc: { fontSize: 12, color: Colors.light.textSecondary, textAlign: 'center', marginTop: 4, lineHeight: 16 },
  discoverPremiumBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginTop: 14,
  },
  discoverPremiumBtnText: { color: Colors.light.textOnPrimary, fontSize: 13, fontWeight: '800' },

  /* Logout */
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 14, borderWidth: 1.5, borderColor: Colors.light.error,
    paddingVertical: 14,
  },
  logoutText: { fontSize: 14, fontWeight: '800', color: Colors.light.error },
});
