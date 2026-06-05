import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { MENU_ARTICLES } from './dashboardData';
import { modalStyles } from './modalStyles';

interface PromoModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  onChangeTitle: (value: string) => void;
  discount: string;
  onChangeDiscount: (value: string) => void;
  endDate: string;
  onChangeEndDate: (value: string) => void;
  selectedArticles: string[];
  onToggleArticle: (id: string) => void;
}

export default function PromoModal({
  visible,
  onClose,
  onSubmit,
  title,
  onChangeTitle,
  discount,
  onChangeDiscount,
  endDate,
  onChangeEndDate,
  selectedArticles,
  onToggleArticle,
}: PromoModalProps) {
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
          <Text style={modalStyles.headerTitle}>Créer une promotion</Text>
          <TouchableOpacity onPress={onSubmit}>
            <Text style={modalStyles.saveBtn}>Publier</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={modalStyles.content}>
          <Text style={modalStyles.fieldLabel}>TITRE</Text>
          <TextInput
            style={modalStyles.input}
            value={title}
            onChangeText={onChangeTitle}
            placeholder="ex : Happy Hour -20%"
            placeholderTextColor={Colors.light.textSecondary}
          />

          <Text style={modalStyles.fieldLabel}>RÉDUCTION (%)</Text>
          <TextInput
            style={modalStyles.input}
            value={discount}
            onChangeText={onChangeDiscount}
            placeholder="20"
            keyboardType="number-pad"
            placeholderTextColor={Colors.light.textSecondary}
          />

          <Text style={modalStyles.fieldLabel}>VALABLE JUSQU'AU</Text>
          <TextInput
            style={modalStyles.input}
            value={endDate}
            onChangeText={onChangeEndDate}
            placeholder="31 mai 2026"
            placeholderTextColor={Colors.light.textSecondary}
          />

          <Text style={modalStyles.fieldLabel}>ARTICLES CONCERNÉS</Text>
          <View style={{ gap: 8 }}>
            {MENU_ARTICLES.map((article) => {
              const isSelected = selectedArticles.includes(article.id);
              return (
                <TouchableOpacity
                  key={article.id}
                  onPress={() => onToggleArticle(article.id)}
                  activeOpacity={0.8}
                  style={[modalStyles.articleRow, isSelected && modalStyles.articleRowActive]}
                >
                  <View style={[modalStyles.checkbox, isSelected && modalStyles.checkboxActive]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                  </View>
                  <Text style={modalStyles.articleName}>{article.name}</Text>
                  <Text style={modalStyles.articlePrice}>{article.price} €</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={modalStyles.disclaimer}>
            Sélectionnez les articles sur lesquels la réduction s'applique. Laissez vide pour appliquer à toute la carte.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}
