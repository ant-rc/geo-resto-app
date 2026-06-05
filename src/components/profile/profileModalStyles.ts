import { StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/colors';

export const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 16 : 20,
    paddingHorizontal: 18, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.light.borderLight,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.light.surfaceWarm,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.light.text },
  content: { padding: 18, gap: 12 },
  sectionLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.light.textSecondary,
    letterSpacing: 2, marginTop: 6, marginBottom: 4, paddingHorizontal: 4,
  },
  reservationCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    gap: 10,
  },
  reservationHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10,
  },
  reservationName: { fontSize: 15, fontWeight: '800', color: Colors.light.text, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  statusConfirmed: { backgroundColor: '#D1FAE5' },
  statusPending: { backgroundColor: '#FEF3C7' },
  statusPast: { backgroundColor: Colors.light.borderLight },
  statusText: { fontSize: 11, fontWeight: '800', color: Colors.light.text, textTransform: 'capitalize' },
  reservationMeta: { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.light.textSecondary, fontWeight: '600' },
  settingsCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingText: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  settingSeparator: { height: 1, backgroundColor: Colors.light.borderLight, marginLeft: 44 },
  notifCard: {
    flexDirection: 'row', gap: 12,
    backgroundColor: Colors.light.surface,
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    alignItems: 'flex-start',
  },
  notifCardUnread: { backgroundColor: Colors.light.primaryLight, borderColor: Colors.light.primary },
  notifIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.light.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  notifBody: { flex: 1, gap: 2 },
  notifTitle: { fontSize: 13, fontWeight: '800', color: Colors.light.text },
  notifMessage: { fontSize: 12, color: Colors.light.textSecondary, lineHeight: 16 },
  notifTime: { fontSize: 10, color: Colors.light.textSecondary, marginTop: 2, fontWeight: '600' },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.light.primary,
    marginTop: 6,
  },

  /* Review — button on reservation card */
  reviewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.light.primaryLight,
    paddingVertical: 10, borderRadius: 12, marginTop: 6,
  },
  reviewBtnText: { color: Colors.light.primary, fontSize: 13, fontWeight: '800' },
  reviewedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6,
  },
  reviewedText: { color: Colors.light.primary, fontSize: 12, fontWeight: '700' },

  /* Review — modal */
  reviewTargetCard: {
    backgroundColor: Colors.light.primaryLight,
    borderRadius: 14, padding: 14, marginBottom: 20,
  },
  reviewTargetName: { fontSize: 17, fontWeight: '800', color: Colors.light.text },
  reviewTargetSub: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },
  criteriaBlock: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  criteriaLabel: { fontSize: 14, fontWeight: '800', color: Colors.light.text, marginBottom: 12 },
  thumbsRow: { flexDirection: 'row', gap: 10 },
  thumbBtn: {
    flex: 1,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.light.surfaceWarm,
    borderWidth: 1.5, borderColor: Colors.light.borderLight,
  },
  thumbBtnUpActive: { backgroundColor: Colors.light.primary, borderColor: Colors.light.primary },
  thumbBtnDownActive: { backgroundColor: Colors.light.error, borderColor: Colors.light.error },
  noteLabel: { fontSize: 13, fontWeight: '800', color: Colors.light.text, marginTop: 12, marginBottom: 8 },
  noteInput: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    fontSize: 14, color: Colors.light.text,
    minHeight: 90, textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, color: Colors.light.textSecondary, textAlign: 'right', marginTop: 6 },
  publishBtn: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', marginTop: 20,
  },
  publishBtnText: { color: Colors.light.textOnPrimary, fontSize: 15, fontWeight: '800' },
});
