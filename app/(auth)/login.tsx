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
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';
import { Colors } from '../../src/constants/colors';

export default function LoginScreen() {
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
      setLoading(false);
      return;
    }
    router.replace('/(tabs)');
  }

  function handleDemoLogin() {
    router.replace('/(tabs)');
  }

  function handleSSOGoogle() {
    Alert.alert(
      'Connexion Google',
      'Continuer en mode demonstration ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Mode Demo', onPress: handleDemoLogin },
      ]
    );
  }

  function handleSSOApple() {
    Alert.alert(
      'Connexion Apple',
      'Continuer en mode demonstration ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Mode Demo', onPress: handleDemoLogin },
      ]
    );
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
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroGradient}>
            <View style={styles.logoCircle}>
              <Ionicons name="restaurant" size={32} color={Colors.light.textOnPrimary} />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Bienvenue sur Tastly</Text>
        <Text style={styles.subtitle}>
          Decouvrez les meilleurs restaurants autour de vous
        </Text>

        {/* SSO Buttons */}
        <View style={styles.ssoSection}>
          <TouchableOpacity
            style={styles.ssoButtonGoogle}
            onPress={handleSSOGoogle}
            activeOpacity={0.75}
          >
            <Ionicons name="logo-google" size={20} color={Colors.light.text} />
            <Text style={styles.ssoButtonGoogleText}>Continuer avec Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ssoButtonApple}
            onPress={handleSSOApple}
            activeOpacity={0.75}
          >
            <Ionicons name="logo-apple" size={20} color={Colors.light.textOnPrimary} />
            <Text style={styles.ssoButtonAppleText}>Continuer avec Apple</Text>
          </TouchableOpacity>
        </View>

        {/* Separator */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>ou</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Email/Password Form */}
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
              placeholder="Email"
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
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>S'inscrire</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Pro Link */}
        <View style={styles.proLinkWrap}>
          <Text style={styles.proLinkText}>
            Vous etes restaurateur ?{' '}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(restaurant)/login-pro')}
          >
            <Text style={styles.proLinkAction}>Acceder a l'espace pro</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  /* Hero */
  hero: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 72 : 56,
    marginBottom: 28,
  },
  heroGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Title */
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },

  /* SSO */
  ssoSection: {
    gap: 12,
    marginBottom: 24,
  },
  ssoButtonGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  ssoButtonGoogleText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  ssoButtonApple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.light.text,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  ssoButtonAppleText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.textOnPrimary,
  },

  /* Separator */
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.borderLight,
  },
  separatorText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },

  /* Form */
  form: {
    gap: 14,
    marginBottom: 28,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
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
  submitButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: Colors.light.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  footerText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  /* Pro Link */
  proLinkWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  proLinkText: {
    color: Colors.light.textSecondary,
    fontSize: 12,
  },
  proLinkAction: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
