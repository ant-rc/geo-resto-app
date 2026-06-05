import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { EVENT_TYPES, EventType } from './dashboardData';
import { modalStyles } from './modalStyles';

interface EventModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  eventType: EventType;
  onSelectType: (type: EventType) => void;
  title: string;
  onChangeTitle: (value: string) => void;
  date: string;
  onChangeDate: (value: string) => void;
  time: string;
  onChangeTime: (value: string) => void;
  description: string;
  onChangeDescription: (value: string) => void;
}

export default function EventModal({
  visible,
  onClose,
  onSubmit,
  eventType,
  onSelectType,
  title,
  onChangeTitle,
  date,
  onChangeDate,
  time,
  onChangeTime,
  description,
  onChangeDescription,
}: EventModalProps) {
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
          <Text style={modalStyles.headerTitle}>Nouvel évènement</Text>
          <TouchableOpacity onPress={onSubmit}>
            <Text style={modalStyles.saveBtn}>Publier</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modalStyles.content}>
          <Text style={modalStyles.fieldLabel}>TYPE D'ÉVÈNEMENT</Text>
          <View style={modalStyles.eventTypes}>
            {EVENT_TYPES.map((opt) => {
              const isSelected = eventType === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[modalStyles.eventTypeCard, isSelected && modalStyles.eventTypeCardActive]}
                  onPress={() => onSelectType(opt.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={opt.icon}
                    size={18}
                    color={isSelected ? Colors.light.textOnPrimary : Colors.light.primary}
                  />
                  <Text style={[modalStyles.eventTypeLabel, isSelected && modalStyles.eventTypeLabelActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={modalStyles.fieldLabel}>TITRE</Text>
          <TextInput
            style={modalStyles.input}
            value={title}
            onChangeText={onChangeTitle}
            placeholder="ex : Jam Session Jazz - Quartet Paris"
            placeholderTextColor={Colors.light.textSecondary}
          />

          <Text style={modalStyles.fieldLabel}>DATE</Text>
          <TextInput
            style={modalStyles.input}
            value={date}
            onChangeText={onChangeDate}
            placeholder="25 avril 2026"
            placeholderTextColor={Colors.light.textSecondary}
          />

          <Text style={modalStyles.fieldLabel}>HORAIRE</Text>
          <TextInput
            style={modalStyles.input}
            value={time}
            onChangeText={onChangeTime}
            placeholder="21:00 - 23:30"
            placeholderTextColor={Colors.light.textSecondary}
          />

          <Text style={modalStyles.fieldLabel}>DESCRIPTION</Text>
          <TextInput
            style={[modalStyles.input, modalStyles.textArea]}
            value={description}
            onChangeText={onChangeDescription}
            placeholder="Présentez votre évènement, les artistes, l'ambiance..."
            multiline
            numberOfLines={4}
            placeholderTextColor={Colors.light.textSecondary}
          />

          <Text style={modalStyles.disclaimer}>
            Votre évènement sera visible sur votre fiche et dans la section « Évènements à venir » des utilisateurs à proximité.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}
