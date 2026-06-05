import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { modalStyles } from './modalStyles';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  name: string;
  onChangeName: (value: string) => void;
  address: string;
  onChangeAddress: (value: string) => void;
  phone: string;
  onChangePhone: (value: string) => void;
  description: string;
  onChangeDescription: (value: string) => void;
}

export default function EditProfileModal({
  visible,
  onClose,
  onSave,
  name,
  onChangeName,
  address,
  onChangeAddress,
  phone,
  onChangePhone,
  description,
  onChangeDescription,
}: EditProfileModalProps) {
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
          <Text style={modalStyles.headerTitle}>Modifier la fiche</Text>
          <TouchableOpacity onPress={onSave}>
            <Text style={modalStyles.saveBtn}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modalStyles.content}>
          <Text style={modalStyles.fieldLabel}>NOM DU RESTAURANT</Text>
          <TextInput
            style={modalStyles.input}
            value={name}
            onChangeText={onChangeName}
            placeholder="Nom du restaurant"
            placeholderTextColor={Colors.light.textSecondary}
          />

          <Text style={modalStyles.fieldLabel}>ADRESSE</Text>
          <TextInput
            style={modalStyles.input}
            value={address}
            onChangeText={onChangeAddress}
            placeholder="Adresse complète"
            placeholderTextColor={Colors.light.textSecondary}
          />

          <Text style={modalStyles.fieldLabel}>TÉLÉPHONE</Text>
          <TextInput
            style={modalStyles.input}
            value={phone}
            onChangeText={onChangePhone}
            placeholder="+33 1 00 00 00 00"
            keyboardType="phone-pad"
            placeholderTextColor={Colors.light.textSecondary}
          />

          <Text style={modalStyles.fieldLabel}>DESCRIPTION</Text>
          <TextInput
            style={[modalStyles.input, modalStyles.textArea]}
            value={description}
            onChangeText={onChangeDescription}
            placeholder="Décrivez votre restaurant..."
            multiline
            numberOfLines={4}
            placeholderTextColor={Colors.light.textSecondary}
          />

          <TouchableOpacity style={modalStyles.photoPickBtn} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={18} color={Colors.light.primary} />
            <Text style={modalStyles.photoPickText}>Ajouter des photos</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}
