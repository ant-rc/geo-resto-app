import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { SubscriptionPlan } from './dashboardData';
import { modalStyles } from './modalStyles';

interface CancelSubModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planData: SubscriptionPlan;
}

export default function CancelSubModal({
  visible,
  onClose,
  onConfirm,
  planData,
}: CancelSubModalProps) {
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
          <Text style={modalStyles.headerTitle}>Résiliation</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={modalStyles.content}>
          <View style={modalStyles.cancelHero}>
            <Ionicons name="sad-outline" size={48} color={Colors.light.primary} />
            <Text style={modalStyles.cancelTitle}>Désolé de vous voir partir</Text>
            <Text style={modalStyles.cancelDesc}>
              Avant de confirmer la résiliation, voici ce que vous perdrez avec le plan {planData.name} :
            </Text>
          </View>

          <View style={modalStyles.lossList}>
            {planData.features.slice(0, 5).map((f, i) => (
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

          <TouchableOpacity style={modalStyles.keepBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={modalStyles.keepBtnText}>Garder mon abonnement {planData.name}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={modalStyles.cancelConfirmBtn} onPress={onConfirm}>
            <Text style={modalStyles.cancelConfirmText}>Confirmer la résiliation</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}
