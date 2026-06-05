import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Reservation, ThumbValue } from './profileData';
import { modalStyles } from './profileModalStyles';

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  target: Reservation | null;
  service: ThumbValue;
  onServiceChange: (value: ThumbValue) => void;
  quality: ThumbValue;
  onQualityChange: (value: ThumbValue) => void;
  ambiance: ThumbValue;
  onAmbianceChange: (value: ThumbValue) => void;
  note: string;
  onNoteChange: (value: string) => void;
}

export default function ReviewModal({
  visible,
  onClose,
  onSubmit,
  target,
  service,
  onServiceChange,
  quality,
  onQualityChange,
  ambiance,
  onAmbianceChange,
  note,
  onNoteChange,
}: ReviewModalProps) {
  const criteria: { label: string; value: ThumbValue; setter: (value: ThumbValue) => void }[] = [
    { label: 'Service', value: service, setter: onServiceChange },
    { label: 'Qualité des plats', value: quality, setter: onQualityChange },
    { label: 'Ambiance', value: ambiance, setter: onAmbianceChange },
  ];

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
          <Text style={modalStyles.headerTitle}>Votre avis</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={modalStyles.content}>
          {target && (
            <>
              <View style={modalStyles.reviewTargetCard}>
                <Text style={modalStyles.reviewTargetName}>{target.restaurant}</Text>
                <Text style={modalStyles.reviewTargetSub}>Visité le {target.date}</Text>
              </View>

              {criteria.map((criterion) => (
                <View key={criterion.label} style={modalStyles.criteriaBlock}>
                  <Text style={modalStyles.criteriaLabel}>{criterion.label}</Text>
                  <View style={modalStyles.thumbsRow}>
                    <TouchableOpacity
                      style={[
                        modalStyles.thumbBtn,
                        criterion.value === 'down' && modalStyles.thumbBtnDownActive,
                      ]}
                      onPress={() => criterion.setter(criterion.value === 'down' ? null : 'down')}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="thumbs-down"
                        size={26}
                        color={criterion.value === 'down' ? '#fff' : Colors.light.textSecondary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        modalStyles.thumbBtn,
                        criterion.value === 'up' && modalStyles.thumbBtnUpActive,
                      ]}
                      onPress={() => criterion.setter(criterion.value === 'up' ? null : 'up')}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="thumbs-up"
                        size={26}
                        color={criterion.value === 'up' ? '#fff' : Colors.light.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <Text style={modalStyles.noteLabel}>Note personnelle (facultatif)</Text>
              <TextInput
                style={modalStyles.noteInput}
                value={note}
                onChangeText={(t) => t.length <= 200 && onNoteChange(t)}
                placeholder="Partagez votre expérience..."
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                numberOfLines={4}
              />
              <Text style={modalStyles.charCount}>{note.length} / 200</Text>

              <TouchableOpacity
                style={modalStyles.publishBtn}
                onPress={onSubmit}
                activeOpacity={0.85}
              >
                <Text style={modalStyles.publishBtnText}>Publier</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
