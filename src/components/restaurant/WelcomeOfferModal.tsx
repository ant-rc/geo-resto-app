import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { modalStyles } from './modalStyles';
import PlanAdvantages from './PlanAdvantages';

interface WelcomeOfferModalProps {
  visible: boolean;
  onClose: () => void;
  onDiscover: () => void;
}

/**
 * Post-login upsell shown once to free-plan owners to highlight
 * the value of upgrading before they reach the dashboard.
 */
export default function WelcomeOfferModal({ visible, onClose, onDiscover }: WelcomeOfferModalProps) {
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
          <Text style={modalStyles.headerTitle}>Bienvenue</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={modalStyles.content}>
          <View style={modalStyles.cancelHero}>
            <Ionicons name="diamond" size={48} color={Colors.light.primary} />
            <Text style={modalStyles.cancelTitle}>Passez à la vitesse supérieure</Text>
            <Text style={modalStyles.cancelDesc}>
              Votre fiche est en ligne. Voici ce que les restaurateurs Pro gagnent en passant Premium.
            </Text>
          </View>

          <PlanAdvantages title="Les avantages Premium" />

          <TouchableOpacity style={modalStyles.keepBtn} onPress={onDiscover} activeOpacity={0.85}>
            <Text style={modalStyles.keepBtnText}>Découvrir les offres</Text>
          </TouchableOpacity>

          <TouchableOpacity style={modalStyles.cancelConfirmBtn} onPress={onClose}>
            <Text style={modalStyles.disclaimer}>Plus tard</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}
