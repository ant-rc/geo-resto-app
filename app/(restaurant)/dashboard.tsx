import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  Modal,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { Colors } from '../../src/constants/colors';

interface StatCard {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const STATS: StatCard[] = [
  { label: 'Vues', value: '1.2k', icon: 'eye' },
  { label: 'Clics', value: '342', icon: 'hand-left' },
  { label: 'Réservations', value: '28', icon: 'calendar' },
];

interface SubscriptionPlan {
  id: 'free' | 'pro' | 'premium';
  name: string;
  price: string;
  period: string;
  tagline: string;
  popular: boolean;
  features: string[];
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0 €',
    period: '/mois',
    tagline: 'Pour démarrer',
    popular: false,
    features: [
      'Fiche restaurant basique',
      'Visibilité standard dans la recherche',
      "Jusqu'à 5 photos",
      'Informations de contact',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '49 €',
    period: '/mois',
    tagline: 'Le plus populaire',
    popular: true,
    features: [
      'Tout du plan Gratuit',
      'Mise en avant dans les recommandations',
      'Photos illimitées + menu détaillé',
      '5 promotions actives par mois',
      'Évènements à venir (jam, concerts...)',
      'Statistiques détaillées (vues, clics)',
      'Badge « Vérifié » sur la fiche',
      'Support prioritaire par email',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '129 €',
    period: '/mois',
    tagline: 'Maximisez vos revenus',
    popular: false,
    features: [
      'Tout du plan Pro',
      'Promotions et évènements illimités',
      'Analytics avancées (conversion, ROI)',
      'Campagnes marketing ciblées',
      'Placement top résultats (x3 visibilité)',
      'Gestion multi-établissements',
      'API Réservations intégrée',
      'Account Manager dédié',
    ],
  },
];

interface MenuArticle {
  id: string;
  name: string;
  price: number;
}

const MENU_ARTICLES: MenuArticle[] = [
  { id: 'a1', name: 'Entrée du chef', price: 14 },
  { id: 'a2', name: 'Plat du jour', price: 19 },
  { id: 'a3', name: 'Menu complet', price: 32 },
  { id: 'a4', name: 'Dessert maison', price: 9 },
  { id: 'a5', name: 'Bouteille de vin', price: 28 },
  { id: 'a6', name: 'Cocktail signature', price: 12 },
];

type EventType = 'jam' | 'concert' | 'spectacle' | 'degustation' | 'autre';

interface EventOption {
  key: EventType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const EVENT_TYPES: EventOption[] = [
  { key: 'jam', label: 'Jam session', icon: 'musical-notes' },
  { key: 'concert', label: 'Concert', icon: 'mic' },
  { key: 'spectacle', label: 'Spectacle', icon: 'sparkles' },
  { key: 'degustation', label: 'Dégustation', icon: 'wine' },
  { key: 'autre', label: 'Autre', icon: 'ellipsis-horizontal' },
];

export default function DashboardScreen() {
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'premium'>('free');
  const [plansModalVisible, setPlansModalVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [cancelSubVisible, setCancelSubVisible] = useState(false);

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
  const [boostDuration, setBoostDuration] = useState<7 | 14 | 30>(7);

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
    const prices: Record<number, string> = { 7: '19 €', 14: '35 €', 30: '69 €' };
    Alert.alert(
      'Mise en avant activée',
      `Votre restaurant sera boosté pendant ${boostDuration} jours (${prices[boostDuration]}).`,
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

  function selectPlan(planId: 'free' | 'pro' | 'premium') {
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
    Alert.alert(
      'Résilier votre abonnement',
      'Vous perdrez l\'accès aux fonctionnalités premium à la fin de la période en cours. Êtes-vous sûr ?',
      [
        { text: 'Garder mon abonnement', style: 'cancel' },
        {
          text: 'Résilier l\'abonnement',
          style: 'destructive',
          onPress: () => {
            setCurrentPlan('free');
            setCancelSubVisible(false);
            Alert.alert('Résiliation effectuée', 'Votre abonnement prendra fin à la prochaine échéance. Vous pouvez le réactiver à tout moment.');
          },
        },
      ]
    );
  }

  function saveProfile() {
    setEditProfileVisible(false);
    Alert.alert('Profil mis à jour', 'Les modifications de votre restaurant ont été enregistrées.');
  }

  function currentPlanData() {
    return PLANS.find((p) => p.id === currentPlan) ?? PLANS[0];
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
              {currentPlanData().name}
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
            Alert.alert('Plan Pro requis', 'Passez au plan Pro pour créer des promotions.', [
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
                <Text style={styles.lockBadgeText}>Pro</Text>
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
          if (currentPlan !== 'premium') {
            Alert.alert('Plan Premium requis', 'Passez au plan Premium pour booster votre visibilité.', [
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
            {currentPlan !== 'premium' && (
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={10} color={Colors.light.primary} />
                <Text style={styles.lockBadgeText}>Premium</Text>
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
            Alert.alert('Plan Pro requis', 'Passez au plan Pro pour publier des évènements.', [
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
                <Text style={styles.lockBadgeText}>Pro</Text>
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
          {currentPlan === 'premium' ? 'Analytics avancées disponibles' : 'Statistiques détaillées disponibles avec Pro'}
        </Text>
        <Text style={styles.analyticsDesc}>
          {currentPlan === 'premium'
            ? 'Consultez vos analytics avancées : conversion, ROI, heatmaps.'
            : "Vues, clics, conversions. Visualisez l'impact de votre fiche."}
        </Text>
        {currentPlan !== 'premium' && (
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

      {/* ============ PLANS MODAL ============ */}
      <Modal
        visible={plansModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPlansModalVisible(false)}
      >
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <TouchableOpacity onPress={() => setPlansModalVisible(false)} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={modalStyles.headerTitle}>Nos abonnements</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={modalStyles.content}>
            <Text style={modalStyles.intro}>
              Choisissez le plan qui correspond à vos ambitions. Plus votre restaurant est visible, plus vous attirez de clients.
            </Text>

            {/* Why upgrade section */}
            <View style={modalStyles.whyCard}>
              <Text style={modalStyles.whyTitle}>Pourquoi passer Premium ?</Text>
              <View style={modalStyles.whyItem}>
                <Ionicons name="trending-up" size={18} color={Colors.light.primary} />
                <Text style={modalStyles.whyText}>
                  <Text style={modalStyles.whyBold}>+250% de visibilité</Text> vs plan gratuit
                </Text>
              </View>
              <View style={modalStyles.whyItem}>
                <Ionicons name="people" size={18} color={Colors.light.primary} />
                <Text style={modalStyles.whyText}>
                  <Text style={modalStyles.whyBold}>3x plus de réservations</Text> avec la mise en avant
                </Text>
              </View>
              <View style={modalStyles.whyItem}>
                <Ionicons name="cash" size={18} color={Colors.light.primary} />
                <Text style={modalStyles.whyText}>
                  <Text style={modalStyles.whyBold}>ROI moyen x4</Text> sur nos restaurateurs Pro
                </Text>
              </View>
              <View style={modalStyles.whyItem}>
                <Ionicons name="star" size={18} color={Colors.light.primary} />
                <Text style={modalStyles.whyText}>
                  Satisfaction clients <Text style={modalStyles.whyBold}>4.8/5</Text> (420 avis)
                </Text>
              </View>
            </View>

            {/* Plans */}
            {PLANS.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              return (
                <View
                  key={plan.id}
                  style={[
                    modalStyles.planCard,
                    plan.popular && modalStyles.planCardPopular,
                    isCurrent && modalStyles.planCardCurrent,
                  ]}
                >
                  {plan.popular && (
                    <View style={modalStyles.popularBadge}>
                      <Text style={modalStyles.popularBadgeText}>LE PLUS POPULAIRE</Text>
                    </View>
                  )}
                  <View style={modalStyles.planHeader}>
                    <View>
                      <Text style={modalStyles.planName}>{plan.name}</Text>
                      <Text style={modalStyles.planTagline}>{plan.tagline}</Text>
                    </View>
                    <View style={modalStyles.planPriceWrap}>
                      <Text style={modalStyles.planPrice}>{plan.price}</Text>
                      <Text style={modalStyles.planPeriod}>{plan.period}</Text>
                    </View>
                  </View>
                  <View style={modalStyles.planFeatures}>
                    {plan.features.map((feat, i) => (
                      <View key={i} style={modalStyles.planFeatureRow}>
                        <Ionicons name="checkmark-circle" size={16} color={Colors.light.primary} />
                        <Text style={modalStyles.planFeatureText}>{feat}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={[
                      modalStyles.planCTA,
                      isCurrent && modalStyles.planCTACurrent,
                      plan.popular && !isCurrent && modalStyles.planCTAPopular,
                    ]}
                    onPress={() => selectPlan(plan.id)}
                    activeOpacity={0.85}
                    disabled={isCurrent}
                  >
                    <Text
                      style={[
                        modalStyles.planCTAText,
                        isCurrent && modalStyles.planCTATextCurrent,
                        plan.popular && !isCurrent && modalStyles.planCTATextPopular,
                      ]}
                    >
                      {isCurrent ? '✓ Plan actuel' : `Passer au plan ${plan.name}`}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}

            {/* Cancel subscription link */}
            {currentPlan !== 'free' && (
              <TouchableOpacity
                style={modalStyles.cancelLink}
                onPress={() => {
                  setPlansModalVisible(false);
                  setCancelSubVisible(true);
                }}
              >
                <Text style={modalStyles.cancelLinkText}>Résilier mon abonnement</Text>
              </TouchableOpacity>
            )}

            <Text style={modalStyles.disclaimer}>
              Engagement mensuel, sans frais cachés. Résiliable à tout moment.
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* ============ EDIT PROFILE MODAL ============ */}
      <Modal
        visible={editProfileVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditProfileVisible(false)}
      >
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <TouchableOpacity onPress={() => setEditProfileVisible(false)} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={modalStyles.headerTitle}>Modifier la fiche</Text>
            <TouchableOpacity onPress={saveProfile}>
              <Text style={modalStyles.saveBtn}>Enregistrer</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={modalStyles.content}>
            <Text style={modalStyles.fieldLabel}>NOM DU RESTAURANT</Text>
            <TextInput
              style={modalStyles.input}
              value={restaurantName}
              onChangeText={setRestaurantName}
              placeholder="Nom du restaurant"
              placeholderTextColor={Colors.light.textSecondary}
            />

            <Text style={modalStyles.fieldLabel}>ADRESSE</Text>
            <TextInput
              style={modalStyles.input}
              value={restaurantAddress}
              onChangeText={setRestaurantAddress}
              placeholder="Adresse complète"
              placeholderTextColor={Colors.light.textSecondary}
            />

            <Text style={modalStyles.fieldLabel}>TÉLÉPHONE</Text>
            <TextInput
              style={modalStyles.input}
              value={restaurantPhone}
              onChangeText={setRestaurantPhone}
              placeholder="+33 1 00 00 00 00"
              keyboardType="phone-pad"
              placeholderTextColor={Colors.light.textSecondary}
            />

            <Text style={modalStyles.fieldLabel}>DESCRIPTION</Text>
            <TextInput
              style={[modalStyles.input, modalStyles.textArea]}
              value={restaurantDesc}
              onChangeText={setRestaurantDesc}
              placeholder="Décrivez votre restaurant..."
              multiline
              numberOfLines={4}
              placeholderTextColor={Colors.light.textSecondary}
            />

            <TouchableOpacity style={modalStyles.photoPickBtn} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={18} color={Colors.light.primary} />
              <Text style={modalStyles.photoPickText}>Ajouter des photos</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* ============ SETTINGS MODAL ============ */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <TouchableOpacity onPress={() => setSettingsVisible(false)} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={modalStyles.headerTitle}>Paramètres</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={modalStyles.content}>
            <Text style={modalStyles.settingsLabel}>NOTIFICATIONS</Text>
            <View style={modalStyles.settingsCard}>
              <View style={modalStyles.settingsRow}>
                <View style={modalStyles.settingsLeft}>
                  <Ionicons name="calendar" size={18} color={Colors.light.primary} />
                  <Text style={modalStyles.settingsText}>Nouvelles réservations</Text>
                </View>
                <Switch
                  value={notifReservations}
                  onValueChange={setNotifReservations}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  thumbColor="#fff"
                />
              </View>
              <View style={modalStyles.settingsSeparator} />
              <View style={modalStyles.settingsRow}>
                <View style={modalStyles.settingsLeft}>
                  <Ionicons name="star" size={18} color={Colors.light.primary} />
                  <Text style={modalStyles.settingsText}>Nouveaux avis</Text>
                </View>
                <Switch
                  value={notifReviews}
                  onValueChange={setNotifReviews}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  thumbColor="#fff"
                />
              </View>
              <View style={modalStyles.settingsSeparator} />
              <View style={modalStyles.settingsRow}>
                <View style={modalStyles.settingsLeft}>
                  <Ionicons name="pricetag" size={18} color={Colors.light.primary} />
                  <Text style={modalStyles.settingsText}>Promotions Tastly</Text>
                </View>
                <Switch
                  value={notifPromo}
                  onValueChange={setNotifPromo}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <Text style={modalStyles.settingsLabel}>GESTION</Text>
            <View style={modalStyles.settingsCard}>
              <View style={modalStyles.settingsRow}>
                <View style={modalStyles.settingsLeft}>
                  <Ionicons name="flash" size={18} color={Colors.light.primary} />
                  <View>
                    <Text style={modalStyles.settingsText}>Acceptation auto</Text>
                    <Text style={modalStyles.settingsSubtext}>Confirmer les réservations automatiquement</Text>
                  </View>
                </View>
                <Switch
                  value={autoAccept}
                  onValueChange={setAutoAccept}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  thumbColor="#fff"
                />
              </View>
              <View style={modalStyles.settingsSeparator} />
              <View style={modalStyles.settingsRow}>
                <View style={modalStyles.settingsLeft}>
                  <Ionicons name="eye" size={18} color={Colors.light.primary} />
                  <View>
                    <Text style={modalStyles.settingsText}>Profil public</Text>
                    <Text style={modalStyles.settingsSubtext}>Visible dans la recherche</Text>
                  </View>
                </View>
                <Switch
                  value={publicProfile}
                  onValueChange={setPublicProfile}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            <Text style={modalStyles.settingsLabel}>COMPTE</Text>
            <View style={modalStyles.settingsCard}>
              <TouchableOpacity
                style={modalStyles.settingsRow}
                onPress={() => Alert.alert('Mot de passe', 'Un email de réinitialisation vous a été envoyé.')}
                activeOpacity={0.7}
              >
                <View style={modalStyles.settingsLeft}>
                  <Ionicons name="key" size={18} color={Colors.light.primary} />
                  <Text style={modalStyles.settingsText}>Changer le mot de passe</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
              </TouchableOpacity>
              <View style={modalStyles.settingsSeparator} />
              <TouchableOpacity
                style={modalStyles.settingsRow}
                onPress={() => Alert.alert('Facturation', 'Aucune facture en attente. Prochaine échéance le 1er mai 2026.')}
                activeOpacity={0.7}
              >
                <View style={modalStyles.settingsLeft}>
                  <Ionicons name="card" size={18} color={Colors.light.primary} />
                  <Text style={modalStyles.settingsText}>Facturation & paiement</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
              </TouchableOpacity>
              <View style={modalStyles.settingsSeparator} />
              <TouchableOpacity
                style={modalStyles.settingsRow}
                onPress={() => Alert.alert('Support', 'Contactez-nous à pro@tastly.fr ou au 01 42 00 00 00.')}
                activeOpacity={0.7}
              >
                <View style={modalStyles.settingsLeft}>
                  <Ionicons name="help-circle" size={18} color={Colors.light.primary} />
                  <Text style={modalStyles.settingsText}>Support & aide</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={modalStyles.dangerBtn}
              onPress={() =>
                Alert.alert(
                  'Supprimer le compte',
                  'Cette action est irréversible. Vos données et votre fiche seront supprimées.',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Supprimer',
                      style: 'destructive',
                      onPress: () => {
                        setSettingsVisible(false);
                        router.replace('/(auth)/login');
                      },
                    },
                  ]
                )
              }
            >
              <Ionicons name="trash" size={16} color={Colors.light.error} />
              <Text style={modalStyles.dangerBtnText}>Supprimer mon compte restaurateur</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* ============ PROMOTION MODAL ============ */}
      <Modal
        visible={promoModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPromoModalVisible(false)}
      >
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <TouchableOpacity onPress={() => setPromoModalVisible(false)} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={modalStyles.headerTitle}>Créer une promotion</Text>
            <TouchableOpacity onPress={submitPromotion}>
              <Text style={modalStyles.saveBtn}>Publier</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={modalStyles.content}>
            <Text style={modalStyles.fieldLabel}>TITRE</Text>
            <TextInput
              style={modalStyles.input}
              value={promoTitle}
              onChangeText={setPromoTitle}
              placeholder="ex : Happy Hour -20%"
              placeholderTextColor={Colors.light.textSecondary}
            />

            <Text style={modalStyles.fieldLabel}>RÉDUCTION (%)</Text>
            <TextInput
              style={modalStyles.input}
              value={promoDiscount}
              onChangeText={setPromoDiscount}
              placeholder="20"
              keyboardType="number-pad"
              placeholderTextColor={Colors.light.textSecondary}
            />

            <Text style={modalStyles.fieldLabel}>VALABLE JUSQU'AU</Text>
            <TextInput
              style={modalStyles.input}
              value={promoEndDate}
              onChangeText={setPromoEndDate}
              placeholder="31 mai 2026"
              placeholderTextColor={Colors.light.textSecondary}
            />

            <Text style={modalStyles.fieldLabel}>ARTICLES CONCERNÉS</Text>
            <View style={{ gap: 8 }}>
              {MENU_ARTICLES.map((article) => {
                const isSelected = promoArticles.includes(article.id);
                return (
                  <TouchableOpacity
                    key={article.id}
                    onPress={() => toggleArticle(article.id)}
                    activeOpacity={0.8}
                    style={[modalStyles.articleRow, isSelected && modalStyles.articleRowActive]}
                  >
                    <View style={[modalStyles.checkbox, isSelected && modalStyles.checkboxActive]}>
                      {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    <Text style={modalStyles.articleName}>{article.name}</Text>
                    <Text style={modalStyles.articlePrice}>{article.price} €</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={modalStyles.disclaimer}>
              Sélectionnez les articles sur lesquels la réduction s'applique. Laissez vide pour appliquer à toute la carte.
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* ============ EVENT MODAL ============ */}
      <Modal
        visible={eventModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEventModalVisible(false)}
      >
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <TouchableOpacity onPress={() => setEventModalVisible(false)} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={modalStyles.headerTitle}>Nouvel évènement</Text>
            <TouchableOpacity onPress={submitEvent}>
              <Text style={modalStyles.saveBtn}>Publier</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={modalStyles.content}>
            <Text style={modalStyles.fieldLabel}>TYPE D'ÉVÈNEMENT</Text>
            <View style={modalStyles.eventTypes}>
              {EVENT_TYPES.map((opt) => {
                const isSelected = eventType === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[modalStyles.eventTypeCard, isSelected && modalStyles.eventTypeCardActive]}
                    onPress={() => setEventType(opt.key)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={18}
                      color={isSelected ? Colors.light.textOnPrimary : Colors.light.primary}
                    />
                    <Text style={[modalStyles.eventTypeLabel, isSelected && modalStyles.eventTypeLabelActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={modalStyles.fieldLabel}>TITRE</Text>
            <TextInput
              style={modalStyles.input}
              value={eventTitle}
              onChangeText={setEventTitle}
              placeholder="ex : Jam Session Jazz - Quartet Paris"
              placeholderTextColor={Colors.light.textSecondary}
            />

            <Text style={modalStyles.fieldLabel}>DATE</Text>
            <TextInput
              style={modalStyles.input}
              value={eventDate}
              onChangeText={setEventDate}
              placeholder="25 avril 2026"
              placeholderTextColor={Colors.light.textSecondary}
            />

            <Text style={modalStyles.fieldLabel}>HORAIRE</Text>
            <TextInput
              style={modalStyles.input}
              value={eventTime}
              onChangeText={setEventTime}
              placeholder="21:00 - 23:30"
              placeholderTextColor={Colors.light.textSecondary}
            />

            <Text style={modalStyles.fieldLabel}>DESCRIPTION</Text>
            <TextInput
              style={[modalStyles.input, modalStyles.textArea]}
              value={eventDesc}
              onChangeText={setEventDesc}
              placeholder="Présentez votre évènement, les artistes, l'ambiance..."
              multiline
              numberOfLines={4}
              placeholderTextColor={Colors.light.textSecondary}
            />

            <Text style={modalStyles.disclaimer}>
              Votre évènement sera visible sur votre fiche et dans la section « Évènements à venir » des utilisateurs à proximité.
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* ============ BOOST MODAL ============ */}
      <Modal
        visible={boostModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setBoostModalVisible(false)}
      >
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <TouchableOpacity onPress={() => setBoostModalVisible(false)} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={modalStyles.headerTitle}>Mettre en avant</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={modalStyles.content}>
            <View style={modalStyles.whyCard}>
              <Text style={modalStyles.whyTitle}>Boostez votre visibilité</Text>
              <View style={modalStyles.whyItem}>
                <Ionicons name="trending-up" size={18} color={Colors.light.primary} />
                <Text style={modalStyles.whyText}>
                  <Text style={modalStyles.whyBold}>x3 visibilité</Text> dans les résultats
                </Text>
              </View>
              <View style={modalStyles.whyItem}>
                <Ionicons name="star" size={18} color={Colors.light.primary} />
                <Text style={modalStyles.whyText}>
                  Badge <Text style={modalStyles.whyBold}>« Mis en avant »</Text> sur votre fiche
                </Text>
              </View>
              <View style={modalStyles.whyItem}>
                <Ionicons name="people" size={18} color={Colors.light.primary} />
                <Text style={modalStyles.whyText}>
                  <Text style={modalStyles.whyBold}>+40% de clics</Text> en moyenne
                </Text>
              </View>
            </View>

            <Text style={modalStyles.fieldLabel}>DURÉE DU BOOST</Text>
            <View style={{ gap: 10 }}>
              {([7, 14, 30] as const).map((days) => {
                const prices: Record<number, string> = { 7: '19 €', 14: '35 €', 30: '69 €' };
                const isActive = boostDuration === days;
                return (
                  <TouchableOpacity
                    key={days}
                    style={[modalStyles.boostOption, isActive && modalStyles.boostOptionActive]}
                    onPress={() => setBoostDuration(days)}
                    activeOpacity={0.85}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={modalStyles.boostDays}>{days} jours</Text>
                      <Text style={modalStyles.boostSubtext}>
                        {days === 7 ? 'Idéal pour un lancement' : days === 14 ? 'Visibilité prolongée' : 'Impact maximal, meilleur prix/jour'}
                      </Text>
                    </View>
                    <Text style={modalStyles.boostPrice}>{prices[days]}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={modalStyles.keepBtn} onPress={submitBoost} activeOpacity={0.85}>
              <Text style={modalStyles.keepBtnText}>Activer le boost</Text>
            </TouchableOpacity>

            <Text style={modalStyles.disclaimer}>
              Paiement unique. Le boost démarre immédiatement après activation.
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* ============ CANCEL SUB MODAL ============ */}
      <Modal
        visible={cancelSubVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCancelSubVisible(false)}
      >
        <View style={modalStyles.container}>
          <View style={modalStyles.header}>
            <TouchableOpacity onPress={() => setCancelSubVisible(false)} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={modalStyles.headerTitle}>Résiliation</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={modalStyles.content}>
            <View style={modalStyles.cancelHero}>
              <Ionicons name="sad-outline" size={48} color={Colors.light.primary} />
              <Text style={modalStyles.cancelTitle}>Désolé de vous voir partir</Text>
              <Text style={modalStyles.cancelDesc}>
                Avant de confirmer la résiliation, voici ce que vous perdrez avec le plan {currentPlanData().name} :
              </Text>
            </View>

            <View style={modalStyles.lossList}>
              {currentPlanData().features.slice(0, 5).map((f, i) => (
                <View key={i} style={modalStyles.lossItem}>
                  <Ionicons name="close-circle" size={16} color={Colors.light.error} />
                  <Text style={modalStyles.lossText}>{f}</Text>
                </View>
              ))}
            </View>

            <View style={modalStyles.infoBox}>
              <Ionicons name="information-circle" size={18} color={Colors.light.primary} />
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.infoTitle}>Votre droit de résiliation</Text>
                <Text style={modalStyles.infoText}>
                  Conformément à l&apos;article L221-18 du Code de la consommation, vous disposez d&apos;un délai de 14 jours pour résilier sans justification. Votre abonnement reste actif jusqu&apos;à la fin de la période facturée.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={modalStyles.keepBtn}
              onPress={() => setCancelSubVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={modalStyles.keepBtnText}>Garder mon abonnement {currentPlanData().name}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={modalStyles.cancelConfirmBtn} onPress={confirmCancelSubscription}>
              <Text style={modalStyles.cancelConfirmText}>Confirmer la résiliation</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.light.text },
  saveBtn: { color: Colors.light.primary, fontSize: 14, fontWeight: '800' },
  content: { padding: 18, paddingBottom: 60 },
  intro: { fontSize: 14, color: Colors.light.textSecondary, marginBottom: 16, lineHeight: 20 },

  /* Why upgrade */
  whyCard: {
    backgroundColor: Colors.light.primaryLight,
    borderRadius: 18, padding: 16, marginBottom: 20, gap: 12,
  },
  whyTitle: { fontSize: 15, fontWeight: '800', color: Colors.light.text, marginBottom: 4 },
  whyItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  whyText: { flex: 1, fontSize: 13, color: Colors.light.text, lineHeight: 18 },
  whyBold: { fontWeight: '800' },

  /* Plan card */
  planCard: {
    backgroundColor: Colors.light.surface, borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: Colors.light.borderLight,
    marginBottom: 14,
  },
  planCardPopular: { borderWidth: 2, borderColor: Colors.light.primary },
  planCardCurrent: { opacity: 0.7 },
  popularBadge: {
    position: 'absolute', top: -10, alignSelf: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99,
  },
  popularBadgeText: { color: Colors.light.textOnPrimary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  planName: { fontSize: 20, fontWeight: '800', color: Colors.light.text },
  planTagline: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },
  planPriceWrap: { flexDirection: 'row', alignItems: 'baseline' },
  planPrice: { fontSize: 22, fontWeight: '800', color: Colors.light.primary },
  planPeriod: { fontSize: 12, color: Colors.light.textSecondary, marginLeft: 2 },
  planFeatures: { gap: 8, marginBottom: 16 },
  planFeatureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  planFeatureText: { flex: 1, fontSize: 13, color: Colors.light.text, lineHeight: 18 },
  planCTA: {
    paddingVertical: 12, borderRadius: 12,
    backgroundColor: Colors.light.surfaceWarm, alignItems: 'center',
  },
  planCTAPopular: { backgroundColor: Colors.light.primary },
  planCTACurrent: { backgroundColor: Colors.light.borderLight },
  planCTAText: { fontSize: 13, fontWeight: '800', color: Colors.light.text },
  planCTATextPopular: { color: Colors.light.textOnPrimary },
  planCTATextCurrent: { color: Colors.light.textSecondary },

  cancelLink: { alignItems: 'center', paddingVertical: 14 },
  cancelLinkText: { fontSize: 13, color: Colors.light.error, fontWeight: '700', textDecorationLine: 'underline' },
  disclaimer: { fontSize: 11, color: Colors.light.textSecondary, textAlign: 'center', marginTop: 10, lineHeight: 16 },

  /* Edit profile */
  fieldLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.light.textSecondary,
    letterSpacing: 1.5, marginBottom: 6, marginTop: 14,
  },
  input: {
    backgroundColor: Colors.light.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    padding: 14, fontSize: 14, color: Colors.light.text,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  photoPickBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 20, padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.light.primary, borderStyle: 'dashed',
  },
  photoPickText: { fontSize: 13, fontWeight: '700', color: Colors.light.primary },

  /* Settings modal */
  settingsLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.light.textSecondary,
    letterSpacing: 2, marginBottom: 6, marginTop: 18,
  },
  settingsCard: {
    backgroundColor: Colors.light.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.light.borderLight, overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14,
  },
  settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingsText: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  settingsSubtext: { fontSize: 11, color: Colors.light.textSecondary, marginTop: 2 },
  settingsSeparator: { height: 1, backgroundColor: Colors.light.borderLight, marginLeft: 44 },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 14, marginTop: 20, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.light.error,
  },
  dangerBtnText: { fontSize: 13, fontWeight: '800', color: Colors.light.error },

  /* Cancel sub modal */
  cancelHero: { alignItems: 'center', marginTop: 12, marginBottom: 20, gap: 8 },
  cancelTitle: { fontSize: 22, fontWeight: '800', color: Colors.light.text, marginTop: 8 },
  cancelDesc: { fontSize: 13, color: Colors.light.textSecondary, textAlign: 'center', paddingHorizontal: 20 },
  lossList: { gap: 10, marginBottom: 20 },
  lossItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lossText: { flex: 1, fontSize: 13, color: Colors.light.text, textDecorationLine: 'line-through' },
  infoBox: {
    flexDirection: 'row', gap: 10, padding: 14,
    backgroundColor: Colors.light.primaryLight, borderRadius: 14, marginBottom: 20,
  },
  infoTitle: { fontSize: 13, fontWeight: '800', color: Colors.light.text, marginBottom: 4 },
  infoText: { fontSize: 12, color: Colors.light.textSecondary, lineHeight: 16 },
  keepBtn: {
    backgroundColor: Colors.light.primary, padding: 14, borderRadius: 14,
    alignItems: 'center', marginBottom: 10,
  },
  keepBtnText: { color: Colors.light.textOnPrimary, fontSize: 14, fontWeight: '800' },
  cancelConfirmBtn: { padding: 14, alignItems: 'center' },
  cancelConfirmText: { color: Colors.light.error, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },

  /* Promotion - Article rows */
  articleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  articleRowActive: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primary,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: Colors.light.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.light.surface,
  },
  checkboxActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  articleName: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.light.text },
  articlePrice: { fontSize: 14, fontWeight: '800', color: Colors.light.primary },

  /* Event - Type cards */
  eventTypes: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  eventTypeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  eventTypeCardActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  eventTypeLabel: { fontSize: 13, fontWeight: '700', color: Colors.light.text },
  eventTypeLabelActive: { color: Colors.light.textOnPrimary },

  /* Boost options */
  boostOption: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 14,
    backgroundColor: Colors.light.surface,
    borderWidth: 2, borderColor: Colors.light.borderLight,
  },
  boostOptionActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  boostDays: { fontSize: 16, fontWeight: '800', color: Colors.light.text },
  boostSubtext: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },
  boostPrice: { fontSize: 18, fontWeight: '800', color: Colors.light.primary },
});
