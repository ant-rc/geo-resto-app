import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../src/constants/colors';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');

  function handleLanguage() {
    Alert.alert('Langue', 'Choisir la langue', [
      { text: 'Français', onPress: () => setLanguage('fr') },
      { text: 'English', onPress: () => setLanguage('en') },
      { text: 'Annuler', style: 'cancel' },
    ]);
  }

  function handleClearCache() {
    Alert.alert('Cache vidé', 'Les données locales ont été supprimées.');
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Êtes-vous sûr ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => router.replace('/(auth)/login') },
      ],
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Apparence */}
        <Text style={styles.sectionLabel}>APPARENCE</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="moon" size={18} color={Colors.light.primary} />
              </View>
              <Text style={styles.rowText}>Mode sombre</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={handleLanguage} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="language" size={18} color={Colors.light.primary} />
              </View>
              <Text style={styles.rowText}>Langue</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{language === 'fr' ? 'Français' : 'English'}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Confidentialité */}
        <Text style={styles.sectionLabel}>CONFIDENTIALITÉ</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="location" size={18} color={Colors.light.primary} />
              </View>
              <Text style={styles.rowText}>Localisation</Text>
            </View>
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.separator} />
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="analytics" size={18} color={Colors.light.primary} />
              </View>
              <Text style={styles.rowText}>Analytics</Text>
            </View>
            <Switch
              value={analytics}
              onValueChange={setAnalytics}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Données */}
        <Text style={styles.sectionLabel}>DONNÉES</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleClearCache} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <View style={styles.iconWrap}>
                <Ionicons name="trash" size={18} color={Colors.light.primary} />
              </View>
              <Text style={styles.rowText}>Vider le cache</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} onPress={handleDeleteAccount} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, styles.iconDanger]}>
                <Ionicons name="trash-bin" size={18} color={Colors.light.error} />
              </View>
              <Text style={[styles.rowText, styles.rowDanger]}>Supprimer mon compte</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.error} />
          </TouchableOpacity>
        </View>

        {/* À propos */}
        <Text style={styles.sectionLabel}>À PROPOS</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowText}>Version</Text>
            <Text style={styles.rowValue}>1.2.0</Text>
          </View>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} activeOpacity={0.7}>
            <Text style={styles.rowText}>Conditions d'utilisation</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.row} activeOpacity={0.7}>
            <Text style={styles.rowText}>Politique de confidentialité</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.light.surfaceWarm,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.light.text },
  scroll: { padding: 18, gap: 8 },
  sectionLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.light.textSecondary,
    letterSpacing: 2, marginTop: 14, marginBottom: 6, paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  iconDanger: { backgroundColor: '#FEE2E2' },
  rowText: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  rowDanger: { color: Colors.light.error },
  rowValue: { fontSize: 13, color: Colors.light.textSecondary, fontWeight: '600' },
  separator: { height: 1, backgroundColor: Colors.light.borderLight, marginLeft: 58 },
});
