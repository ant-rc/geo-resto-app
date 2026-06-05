import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { modalStyles } from './modalStyles';

interface PlanAdvantagesProps {
  title?: string;
}

export default function PlanAdvantages({ title = 'Pourquoi passer Premium ?' }: PlanAdvantagesProps) {
  return (
    <View style={modalStyles.whyCard}>
      <Text style={modalStyles.whyTitle}>{title}</Text>
      <View style={modalStyles.whyItem}>
        <Ionicons name="trending-up" size={18} color={Colors.light.primary} />
        <Text style={modalStyles.whyText}>
          <Text style={modalStyles.whyBold}>+250% de visibilité</Text> vs plan gratuit
        </Text>
      </View>
      <View style={modalStyles.whyItem}>
        <Ionicons name="people" size={18} color={Colors.light.primary} />
        <Text style={modalStyles.whyText}>
          <Text style={modalStyles.whyBold}>3x plus de réservations</Text> avec la mise en avant
        </Text>
      </View>
      <View style={modalStyles.whyItem}>
        <Ionicons name="cash" size={18} color={Colors.light.primary} />
        <Text style={modalStyles.whyText}>
          <Text style={modalStyles.whyBold}>ROI moyen x4</Text> sur nos restaurateurs Pro
        </Text>
      </View>
      <View style={modalStyles.whyItem}>
        <Ionicons name="star" size={18} color={Colors.light.primary} />
        <Text style={modalStyles.whyText}>
          Satisfaction clients <Text style={modalStyles.whyBold}>4.8/5</Text> (420 avis)
        </Text>
      </View>
    </View>
  );
}
