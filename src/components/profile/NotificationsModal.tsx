import { View, Text, TouchableOpacity, Modal, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { MOCK_NOTIFICATIONS } from './profileData';
import { modalStyles } from './profileModalStyles';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  pushEnabled: boolean;
  onPushChange: (value: boolean) => void;
  emailEnabled: boolean;
  onEmailChange: (value: boolean) => void;
  promoEnabled: boolean;
  onPromoChange: (value: boolean) => void;
}

export default function NotificationsModal({
  visible,
  onClose,
  pushEnabled,
  onPushChange,
  emailEnabled,
  onEmailChange,
  promoEnabled,
  onPromoChange,
}: NotificationsModalProps) {
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
          <Text style={modalStyles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={modalStyles.content}>
          {/* Settings section */}
          <Text style={modalStyles.sectionLabel}>PRÉFÉRENCES</Text>
          <View style={modalStyles.settingsCard}>
            <View style={modalStyles.settingRow}>
              <View style={modalStyles.settingLeft}>
                <Ionicons name="phone-portrait" size={18} color={Colors.light.primary} />
                <Text style={modalStyles.settingText}>Push</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={onPushChange}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                thumbColor="#fff"
              />
            </View>
            <View style={modalStyles.settingSeparator} />
            <View style={modalStyles.settingRow}>
              <View style={modalStyles.settingLeft}>
                <Ionicons name="mail" size={18} color={Colors.light.primary} />
                <Text style={modalStyles.settingText}>Email</Text>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={onEmailChange}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                thumbColor="#fff"
              />
            </View>
            <View style={modalStyles.settingSeparator} />
            <View style={modalStyles.settingRow}>
              <View style={modalStyles.settingLeft}>
                <Ionicons name="pricetag" size={18} color={Colors.light.primary} />
                <Text style={modalStyles.settingText}>Promotions</Text>
              </View>
              <Switch
                value={promoEnabled}
                onValueChange={onPromoChange}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Notifications list */}
          <Text style={modalStyles.sectionLabel}>RÉCENTES</Text>
          {MOCK_NOTIFICATIONS.map((n) => (
            <View key={n.id} style={[modalStyles.notifCard, n.unread && modalStyles.notifCardUnread]}>
              <View style={modalStyles.notifIcon}>
                <Ionicons name={n.icon} size={18} color={Colors.light.primary} />
              </View>
              <View style={modalStyles.notifBody}>
                <Text style={modalStyles.notifTitle}>{n.title}</Text>
                <Text style={modalStyles.notifMessage} numberOfLines={2}>{n.message}</Text>
                <Text style={modalStyles.notifTime}>{n.time}</Text>
              </View>
              {n.unread && <View style={modalStyles.unreadDot} />}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
