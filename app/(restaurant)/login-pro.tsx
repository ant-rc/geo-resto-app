import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { Colors } from '../../src/constants/colors';

interface ArgumentBlock {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const ARGUMENTS: ArgumentBlock[] = [
  {
    icon: 'eye-outline',
    title: 'Visibilité',
    description: 'Soyez visible par des milliers d\u2019utilisateurs',
  },
  {
    icon: 'people-outline',
    title: 'Acquisition',
    description: 'Attirez de nouveaux clients chaque jour',
  },
  {
    icon: 'megaphone-outline',
    title: 'Marketing',
    description: 'Promotions et offres en un clic',
  },
];

interface PlanFeature {
  text: string;
}

interface PricingPlan {
  name: string;
  features: PlanFeature[];
  popular: boolean;
}

const PLANS: PricingPlan[] = [
  {
    name: 'Gratuit',
    features: [
      { text: 'Fiche restaurant basique' },
      { text: 'Visibilité standard' },
    ],
    popular: false,
  },
  {
    name: 'Premium',
    features: [
      { text: 'Mise en avant' },
      { text: 'Analytics' },
      { text: 'Promos' },
    ],
    popular: true,
  },
];

export default function LoginProScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      router.replace('/(restaurant)/dashboard');
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Ionicons name="compass" size={28} color={Colors.light.textOnPrimary} />
          </View>
          <Text style={styles.brandName}>Tastly</Text>
          <Text style={styles.headerTitle}>Espace Restaurateur</Text>
        </View>

        {/* Argumentaire */}
        <View style={styles.argumentsSection}>
          {ARGUMENTS.map((item) => (
            <View key={item.title} style={styles.argumentCard}>
              <View style={styles.argumentIconWrap}>
                <Ionicons name={item.icon} size={22} color={Colors.light.primary} />
              </View>
              <View style={styles.argumentContent}>
                <Text style={styles.argumentTitle}>{item.title}</Text>
                <Text style={styles.argumentDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Plans */}
        <Text style={styles.sectionLabel}>ABONNEMENTS</Text>
        <View style={styles.plansRow}>
          {PLANS.map((plan) => (
            <View
              key={plan.name}
              style={[
                styles.planCard,
                plan.popular && styles.planCardPopular,
              ]}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Populaire</Text>
                </View>
              )}
              <Text
                style={[
                  styles.planName,
                  plan.popular && styles.planNamePopular,
                ]}
              >
                {plan.name}
              </Text>
              {plan.features.map((feature) => (
                <Text
                  key={feature.text}
                  style={[
                    styles.planFeature,
                    plan.popular && styles.planFeaturePopular,
                  ]}
                >
                  {feature.text}
                </Text>
              ))}
              <TouchableOpacity
                style={[
                  styles.planButton,
                  plan.popular ? styles.planButtonPrimary : styles.planButtonOutline,
                ]}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.planButtonText,
                    plan.popular
                      ? styles.planButtonTextPrimary
                      : styles.planButtonTextOutline,
                  ]}
                >
                  Choisir
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Login form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connexion Pro</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={Colors.light.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email professionnel"
                placeholderTextColor={Colors.light.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={Colors.light.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor={Colors.light.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.light.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Connexion...' : 'Accéder à mon espace'}
              </Text>
              {!loading && (
                <Ionicons name="arrow-forward" size={17} color={Colors.light.textOnPrimary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.footerLink}>
              Pas encore partenaire ? Créer un compte
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.footerBack}>Retour à l'app</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },

  /* Header */
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: -0.4,
  },

  /* Arguments */
  argumentsSection: {
    gap: 12,
    marginBottom: 28,
  },
  argumentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: 14,
  },
  argumentIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  argumentContent: {
    flex: 1,
  },
  argumentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  argumentDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },

  /* Plans */
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  plansRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  planCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: 6,
  },
  planCardPopular: {
    borderColor: Colors.light.secondary,
    borderWidth: 2,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.secondary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textOnPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 4,
  },
  planNamePopular: {
    color: Colors.light.secondary,
  },
  planFeature: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 17,
  },
  planFeaturePopular: {
    color: Colors.light.text,
  },
  planButton: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  planButtonPrimary: {
    backgroundColor: Colors.light.primary,
  },
  planButtonOutline: {
    borderWidth: 1.5,
    borderColor: Colors.light.primary,
    backgroundColor: 'transparent',
  },
  planButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  planButtonTextPrimary: {
    color: Colors.light.textOnPrimary,
  },
  planButtonTextOutline: {
    color: Colors.light.primary,
  },

  /* Form card */
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  form: {
    gap: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.light.text,
  },
  eyeButton: {
    padding: 4,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.light.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  /* Footer */
  footer: {
    alignItems: 'center',
    marginTop: 28,
    gap: 12,
  },
  footerLink: {
    color: Colors.light.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  footerBack: {
    color: Colors.light.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});
