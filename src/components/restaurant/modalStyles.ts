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
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.light.text },
  saveBtn: { color: Colors.light.primary, fontSize: 14, fontWeight: '800' },
  content: { padding: 18, paddingBottom: 60 },
  intro: { fontSize: 14, color: Colors.light.textSecondary, marginBottom: 16, lineHeight: 20 },

  /* Why upgrade */
  whyCard: {
    backgroundColor: Colors.light.primaryLight,
    borderRadius: 18, padding: 16, marginBottom: 20, gap: 12,
  },
  whyTitle: { fontSize: 15, fontWeight: '800', color: Colors.light.text, marginBottom: 4 },
  whyItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  whyText: { flex: 1, fontSize: 13, color: Colors.light.text, lineHeight: 18 },
  whyBold: { fontWeight: '800' },

  /* Plan card */
  planCard: {
    backgroundColor: Colors.light.surface, borderRadius: 20,
    padding: 20, borderWidth: 1, borderColor: Colors.light.borderLight,
    marginBottom: 14,
  },
  planCardPopular: { borderWidth: 2, borderColor: Colors.light.primary },
  planCardCurrent: { opacity: 0.7 },
  popularBadge: {
    position: 'absolute', top: -10, alignSelf: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99,
  },
  popularBadgeText: { color: Colors.light.textOnPrimary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  planName: { fontSize: 20, fontWeight: '800', color: Colors.light.text },
  planTagline: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },
  planPriceWrap: { flexDirection: 'row', alignItems: 'baseline' },
  planPrice: { fontSize: 22, fontWeight: '800', color: Colors.light.primary },
  planPeriod: { fontSize: 12, color: Colors.light.textSecondary, marginLeft: 2 },
  planFeatures: { gap: 8, marginBottom: 16 },
  planFeatureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  planFeatureText: { flex: 1, fontSize: 13, color: Colors.light.text, lineHeight: 18 },
  planCTA: {
    paddingVertical: 12, borderRadius: 12,
    backgroundColor: Colors.light.surfaceWarm, alignItems: 'center',
  },
  planCTAPopular: { backgroundColor: Colors.light.primary },
  planCTACurrent: { backgroundColor: Colors.light.borderLight },
  planCTAText: { fontSize: 13, fontWeight: '800', color: Colors.light.text },
  planCTATextPopular: { color: Colors.light.textOnPrimary },
  planCTATextCurrent: { color: Colors.light.textSecondary },

  cancelLink: { alignItems: 'center', paddingVertical: 14 },
  cancelLinkText: { fontSize: 13, color: Colors.light.error, fontWeight: '700', textDecorationLine: 'underline' },
  disclaimer: { fontSize: 11, color: Colors.light.textSecondary, textAlign: 'center', marginTop: 10, lineHeight: 16 },

  /* Edit profile */
  fieldLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.light.textSecondary,
    letterSpacing: 1.5, marginBottom: 6, marginTop: 14,
  },
  input: {
    backgroundColor: Colors.light.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.light.borderLight,
    padding: 14, fontSize: 14, color: Colors.light.text,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  photoPickBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 20, padding: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.light.primary, borderStyle: 'dashed',
  },
  photoPickText: { fontSize: 13, fontWeight: '700', color: Colors.light.primary },

  /* Settings modal */
  settingsLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.light.textSecondary,
    letterSpacing: 2, marginBottom: 6, marginTop: 18,
  },
  settingsCard: {
    backgroundColor: Colors.light.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.light.borderLight, overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14,
  },
  settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingsText: { fontSize: 14, fontWeight: '600', color: Colors.light.text },
  settingsSubtext: { fontSize: 11, color: Colors.light.textSecondary, marginTop: 2 },
  settingsSeparator: { height: 1, backgroundColor: Colors.light.borderLight, marginLeft: 44 },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: 14, marginTop: 20, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.light.error,
  },
  dangerBtnText: { fontSize: 13, fontWeight: '800', color: Colors.light.error },

  /* Cancel sub modal */
  cancelHero: { alignItems: 'center', marginTop: 12, marginBottom: 20, gap: 8 },
  cancelTitle: { fontSize: 22, fontWeight: '800', color: Colors.light.text, marginTop: 8 },
  cancelDesc: { fontSize: 13, color: Colors.light.textSecondary, textAlign: 'center', paddingHorizontal: 20 },
  lossList: { gap: 10, marginBottom: 20 },
  lossItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lossText: { flex: 1, fontSize: 13, color: Colors.light.text, textDecorationLine: 'line-through' },
  infoBox: {
    flexDirection: 'row', gap: 10, padding: 14,
    backgroundColor: Colors.light.primaryLight, borderRadius: 14, marginBottom: 20,
  },
  infoTitle: { fontSize: 13, fontWeight: '800', color: Colors.light.text, marginBottom: 4 },
  infoText: { fontSize: 12, color: Colors.light.textSecondary, lineHeight: 16 },
  keepBtn: {
    backgroundColor: Colors.light.primary, padding: 14, borderRadius: 14,
    alignItems: 'center', marginBottom: 10,
  },
  keepBtnText: { color: Colors.light.textOnPrimary, fontSize: 14, fontWeight: '800' },
  cancelConfirmBtn: { padding: 14, alignItems: 'center' },
  cancelConfirmText: { color: Colors.light.error, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },

  /* Promotion - Article rows */
  articleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  articleRowActive: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primary,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: Colors.light.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.light.surface,
  },
  checkboxActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  articleName: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.light.text },
  articlePrice: { fontSize: 14, fontWeight: '800', color: Colors.light.primary },

  /* Event - Type cards */
  eventTypes: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  eventTypeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1, borderColor: Colors.light.borderLight,
  },
  eventTypeCardActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  eventTypeLabel: { fontSize: 13, fontWeight: '700', color: Colors.light.text },
  eventTypeLabelActive: { color: Colors.light.textOnPrimary },

  /* Boost options */
  boostOption: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 14,
    backgroundColor: Colors.light.surface,
    borderWidth: 2, borderColor: Colors.light.borderLight,
  },
  boostOptionActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  boostDays: { fontSize: 16, fontWeight: '800', color: Colors.light.text },
  boostSubtext: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },
  boostPrice: { fontSize: 18, fontWeight: '800', color: Colors.light.primary },
});
