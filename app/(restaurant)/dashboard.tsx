import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
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
  { label: 'Reservations', value: '28', icon: 'calendar' },
];

interface MarketingTool {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  alertMessage: string;
}

const MARKETING_TOOLS: MarketingTool[] = [
  {
    title: 'Creer une promotion',
    description: 'Offres speciales et reductions pour attirer de nouveaux clients',
    icon: 'pricetag',
    alertMessage: 'Promotion creee avec succes',
  },
  {
    title: 'Mettre en avant',
    description: 'Boostez votre visibilite dans les resultats de recherche',
    icon: 'trending-up',
    alertMessage: 'Votre restaurant est desormais mis en avant',
  },
];

export default function DashboardScreen() {
  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Erreur', error.message);
      return;
    }
    router.replace('/(auth)/login');
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
          onPress={() => Alert.alert('Parametres', 'Parametres du restaurant')}
        >
          <Ionicons name="settings-outline" size={22} color={Colors.light.text} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <Text style={styles.sectionLabel}>STATISTIQUES</Text>
      <View style={styles.statsRow}>
        {STATS.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name={stat.icon} size={20} color={Colors.light.primary} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Etablissement */}
      <Text style={styles.sectionLabel}>MON ETABLISSEMENT</Text>
      <View style={styles.establishmentCard}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop' }}
          style={styles.establishmentImage}
        />
        <View style={styles.establishmentContent}>
          <Text style={styles.establishmentName}>Mon Restaurant</Text>
          <Text style={styles.establishmentAddress}>123 Rue de la Gastronomie, Paris</Text>
          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.85}
            onPress={() => Alert.alert('Fiche restaurant', 'Modifications enregistrees')}
          >
            <Ionicons name="create-outline" size={16} color={Colors.light.primary} />
            <Text style={styles.editButtonText}>Modifier la fiche</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Outils marketing */}
      <Text style={styles.sectionLabel}>OUTILS MARKETING</Text>
      <View style={styles.marketingSection}>
        {MARKETING_TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.title}
            style={styles.marketingCard}
            activeOpacity={0.7}
            onPress={() => Alert.alert(tool.title, tool.alertMessage)}
          >
            <View style={styles.marketingIconWrap}>
              <Ionicons name={tool.icon} size={22} color={Colors.light.primary} />
            </View>
            <View style={styles.marketingContent}>
              <Text style={styles.marketingTitle}>{tool.title}</Text>
              <Text style={styles.marketingDescription}>{tool.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Analytics */}
      <Text style={styles.sectionLabel}>ANALYTICS</Text>
      <View style={styles.analyticsCard}>
        <View style={styles.analyticsIconWrap}>
          <Ionicons name="bar-chart" size={24} color={Colors.light.secondary} />
        </View>
        <Text style={styles.analyticsText}>
          Statistiques detaillees disponibles avec l'abonnement Premium
        </Text>
        <TouchableOpacity
          style={styles.premiumButton}
          activeOpacity={0.85}
          onPress={() => Alert.alert('Premium', 'Abonnement Premium active avec succes')}
        >
          <Ionicons name="diamond" size={16} color={Colors.light.textOnPrimary} />
          <Text style={styles.premiumButtonText}>Decouvrir Premium</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Ionicons name="log-out-outline" size={18} color={Colors.light.error} />
        <Text style={styles.logoutButtonText}>Deconnexion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },

  /* Section label */
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: 6,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },

  /* Etablissement */
  establishmentCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: 28,
  },
  establishmentImage: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.light.primaryLight,
  },
  establishmentContent: {
    padding: 16,
    gap: 6,
  },
  establishmentName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  establishmentAddress: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.light.primaryLight,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
  },

  /* Marketing tools */
  marketingSection: {
    gap: 12,
    marginBottom: 28,
  },
  marketingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: 14,
  },
  marketingIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marketingContent: {
    flex: 1,
  },
  marketingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  marketingDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 17,
  },

  /* Analytics */
  analyticsCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: 28,
    gap: 12,
  },
  analyticsIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  premiumButton: {
    flexDirection: 'row',
    backgroundColor: Colors.light.secondary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  premiumButtonText: {
    color: Colors.light.textOnPrimary,
    fontSize: 14,
    fontWeight: '700',
  },

  /* Logout */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.light.error,
    backgroundColor: 'transparent',
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.error,
  },
});
