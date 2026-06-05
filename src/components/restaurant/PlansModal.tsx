import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { PLANS, PlanId } from './dashboardData';
import { modalStyles } from './modalStyles';
import PlanAdvantages from './PlanAdvantages';

interface PlansModalProps {
  visible: boolean;
  onClose: () => void;
  currentPlan: PlanId;
  onSelectPlan: (planId: PlanId) => void;
  onOpenCancel: () => void;
}

export default function PlansModal({
  visible,
  onClose,
  currentPlan,
  onSelectPlan,
  onOpenCancel,
}: PlansModalProps) {
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
            Choisissez le plan qui correspond à vos ambitions. Plus votre restaurant est visible, plus vous attirez de clients.
          </Text>

          {/* Why upgrade section */}
          <PlanAdvantages />

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
                  onPress={() => onSelectPlan(plan.id)}
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
            <TouchableOpacity style={modalStyles.cancelLink} onPress={onOpenCancel}>
              <Text style={modalStyles.cancelLinkText}>Résilier mon abonnement</Text>
            </TouchableOpacity>
          )}

          <Text style={modalStyles.disclaimer}>
            Engagement mensuel, sans frais cachés. Résiliable à tout moment.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}
