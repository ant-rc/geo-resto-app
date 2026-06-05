import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { PLANS } from './dashboardData';
import { modalStyles } from './modalStyles';
import PlanAdvantages from './PlanAdvantages';

interface PlansInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Detailed, read-only view of the subscription plans.
 * Used where there is no active subscription yet (e.g. pro login screen).
 */
export default function PlansInfoModal({ visible, onClose }: PlansInfoModalProps) {
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
          <Text style={modalStyles.headerTitle}>Nos abonnements</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={modalStyles.content}>
          <Text style={modalStyles.intro}>
            Découvrez en détail ce que chaque formule vous apporte. Vous choisirez votre plan une fois connecté à votre espace.
          </Text>

          <PlanAdvantages />

          {PLANS.map((plan) => (
            <View
              key={plan.id}
              style={[modalStyles.planCard, plan.popular && modalStyles.planCardPopular]}
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
            </View>
          ))}

          <Text style={modalStyles.disclaimer}>
            Connectez-vous ou créez un compte partenaire pour souscrire. Engagement mensuel, sans frais cachés, résiliable à tout moment.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}
