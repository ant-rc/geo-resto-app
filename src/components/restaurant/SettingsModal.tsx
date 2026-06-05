import { View, Text, TouchableOpacity, Modal, ScrollView, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { modalStyles } from './modalStyles';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  notifReservations: boolean;
  onNotifReservations: (value: boolean) => void;
  notifReviews: boolean;
  onNotifReviews: (value: boolean) => void;
  notifPromo: boolean;
  onNotifPromo: (value: boolean) => void;
  autoAccept: boolean;
  onAutoAccept: (value: boolean) => void;
  publicProfile: boolean;
  onPublicProfile: (value: boolean) => void;
}

export default function SettingsModal({
  visible,
  onClose,
  notifReservations,
  onNotifReservations,
  notifReviews,
  onNotifReviews,
  notifPromo,
  onNotifPromo,
  autoAccept,
  onAutoAccept,
  publicProfile,
  onPublicProfile,
}: SettingsModalProps) {
  function handleDeleteAccount() {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Vos données et votre fiche seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            onClose();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
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
                onValueChange={onNotifReservations}
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
                onValueChange={onNotifReviews}
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
                onValueChange={onNotifPromo}
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
                onValueChange={onAutoAccept}
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
                onValueChange={onPublicProfile}
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

          <TouchableOpacity style={modalStyles.dangerBtn} onPress={handleDeleteAccount}>
            <Ionicons name="trash" size={16} color={Colors.light.error} />
            <Text style={modalStyles.dangerBtnText}>Supprimer mon compte restaurateur</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}
