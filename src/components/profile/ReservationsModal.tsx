import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { MOCK_RESERVATIONS, Reservation } from './profileData';
import { modalStyles } from './profileModalStyles';

interface ReservationsModalProps {
  visible: boolean;
  onClose: () => void;
  reviewedIds: Set<string>;
  onOpenReview: (reservation: Reservation) => void;
}

export default function ReservationsModal({
  visible,
  onClose,
  reviewedIds,
  onOpenReview,
}: ReservationsModalProps) {
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
          <Text style={modalStyles.headerTitle}>Mes réservations</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={modalStyles.content}>
          {MOCK_RESERVATIONS.map((r) => (
            <View key={r.id} style={modalStyles.reservationCard}>
              <View style={modalStyles.reservationHeader}>
                <Text style={modalStyles.reservationName}>{r.restaurant}</Text>
                <View style={[
                  modalStyles.statusBadge,
                  r.status === 'confirmée' && modalStyles.statusConfirmed,
                  r.status === 'en attente' && modalStyles.statusPending,
                  r.status === 'passée' && modalStyles.statusPast,
                ]}>
                  <Text style={modalStyles.statusText}>{r.status}</Text>
                </View>
              </View>
              <View style={modalStyles.reservationMeta}>
                <View style={modalStyles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.light.textSecondary} />
                  <Text style={modalStyles.metaText}>{r.date}</Text>
                </View>
                <View style={modalStyles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.light.textSecondary} />
                  <Text style={modalStyles.metaText}>{r.time}</Text>
                </View>
                <View style={modalStyles.metaItem}>
                  <Ionicons name="people-outline" size={14} color={Colors.light.textSecondary} />
                  <Text style={modalStyles.metaText}>{r.guests} pers.</Text>
                </View>
              </View>
              {r.status === 'passée' && !reviewedIds.has(r.id) && (
                <TouchableOpacity
                  style={modalStyles.reviewBtn}
                  onPress={() => onOpenReview(r)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="star-outline" size={16} color={Colors.light.primary} />
                  <Text style={modalStyles.reviewBtnText}>Noter ce restaurant</Text>
                </TouchableOpacity>
              )}
              {r.status === 'passée' && reviewedIds.has(r.id) && (
                <View style={modalStyles.reviewedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.light.primary} />
                  <Text style={modalStyles.reviewedText}>Avis publié</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
