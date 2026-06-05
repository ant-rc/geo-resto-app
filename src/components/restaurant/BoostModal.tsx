import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { BOOST_PRICES, BoostDuration } from './dashboardData';
import { modalStyles } from './modalStyles';

interface BoostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  duration: BoostDuration;
  onSelectDuration: (days: BoostDuration) => void;
}

export default function BoostModal({
  visible,
  onClose,
  onSubmit,
  duration,
  onSelectDuration,
}: BoostModalProps) {
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
              const isActive = duration === days;
              return (
                <TouchableOpacity
                  key={days}
                  style={[modalStyles.boostOption, isActive && modalStyles.boostOptionActive]}
                  onPress={() => onSelectDuration(days)}
                  activeOpacity={0.85}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={modalStyles.boostDays}>{days} jours</Text>
                    <Text style={modalStyles.boostSubtext}>
                      {days === 7 ? 'Idéal pour un lancement' : days === 14 ? 'Visibilité prolongée' : 'Impact maximal, meilleur prix/jour'}
                    </Text>
                  </View>
                  <Text style={modalStyles.boostPrice}>{BOOST_PRICES[days]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={modalStyles.keepBtn} onPress={onSubmit} activeOpacity={0.85}>
            <Text style={modalStyles.keepBtnText}>Activer le boost</Text>
          </TouchableOpacity>

          <Text style={modalStyles.disclaimer}>
            Paiement unique. Le boost démarre immédiatement après activation.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}
