import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { RootStackParamList } from '../../App';
import BottomTabBar from '../components/BottomTabBar';
import DecorativeBlob from '../components/DecorativeBlob';
import { BOTTOM_NAV_HEIGHT, cardShadow, colors, radius } from '../theme/theme';
import {
  getGachaById,
  toggleFavorite,
} from '../data/mockStore';

type Props = NativeStackScreenProps<RootStackParamList, 'GachaDetail'>;

const DEFAULT_COVER =
  'https://www.figma.com/api/mcp/asset/a47a4121-f6e3-4557-92b5-073db75bd734.png';

export default function GachaDetailScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [gacha, setGacha] = useState(() => getGachaById(route.params.gachaId));
  const [pullAmount, setPullAmount] = useState('5');
  const [rateVisible, setRateVisible] = useState(false);

  useFocusEffect(useCallback(() => {
    setGacha(getGachaById(route.params.gachaId));
  }, [route.params.gachaId]));

  const amount = useMemo(() => {
    const parsed = Number.parseInt(pullAmount, 10);
    return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 100) : 1;
  }, [pullAmount]);

  if (!gacha) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundTitle}>Gacha not found</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.primaryButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleFavorite = () => {
    toggleFavorite(gacha.id);
    setGacha({ ...gacha, isFavorite: !gacha.isFavorite });
  };

  const handlePull = (count: number) => {
    if (gacha.randomList.length === 0) {
      Alert.alert('No items', 'This gacha does not have any items yet.');
      return;
    }
    navigation.navigate('GachaPull', { gachaId: gacha.id, pullCount: count });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.contentLayer}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 36 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} accessibilityLabel="Go back">
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={2}>{gacha.name}</Text>
              <View style={styles.titleActions}>
                <TouchableOpacity onPress={handleFavorite} style={styles.iconButton} accessibilityLabel="Toggle favorite">
                  <Text style={[styles.heart, gacha.isFavorite && styles.heartActive]}>{gacha.isFavorite ? '♥' : '♡'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('CreateCustom', { gachaId: gacha.id })}
                  style={styles.iconButton}
                  accessibilityLabel="Edit gacha"
                >
                  <Text style={styles.editIcon}>✎</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.coverWrap}>
              <Image source={{ uri: gacha.bannerUri || DEFAULT_COVER }} style={styles.cover} resizeMode="cover" />
              <View style={styles.coverShade} />
              <Text style={styles.bannerLabel}>Banner</Text>
              <TouchableOpacity style={styles.rateButton} onPress={() => setRateVisible(true)} accessibilityLabel="View item rates">
                <Text style={styles.rateInfo}>i</Text>
                <Text style={styles.rateButtonText}>Check rates</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={() => handlePull(1)} activeOpacity={0.82}>
              <Text style={styles.primaryButtonText}>Pull 1</Text>
            </TouchableOpacity>

            <View style={styles.amountLabelRow}>
              <Text style={styles.amountLabel}>Number of pulls</Text>
            </View>
            <View style={styles.pullRow}>
              <TouchableOpacity style={styles.stepButton} onPress={() => setPullAmount(String(Math.max(amount - 1, 1)))}>
                <Text style={styles.stepText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.amountInput}
                value={pullAmount}
                onChangeText={text => setPullAmount(text.replace(/[^0-9]/g, ''))}
                onBlur={() => setPullAmount(String(amount))}
                keyboardType="number-pad"
                maxLength={3}
                selectTextOnFocus
                accessibilityLabel="Number of pulls"
              />
              <TouchableOpacity style={styles.stepButton} onPress={() => setPullAmount(String(Math.min(amount + 1, 100)))}>
                <Text style={styles.stepText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.primaryButton, styles.manyButton]} onPress={() => handlePull(amount)} activeOpacity={0.82}>
              <Text style={styles.primaryButtonText}>Pull {amount}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <DecorativeBlob />
        <BottomTabBar
          active="Home"
          onNavigate={tab => navigation.replace(tab as any)}
          onAddPress={() => navigation.navigate('CreateCustom', {})}
        />
      </KeyboardAvoidingView>

      <Modal visible={rateVisible} transparent animationType="fade" onRequestClose={() => setRateVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.rateModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Random List</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setRateVisible(false)}>
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.columnLabels}>
              <Text style={styles.elementLabel}>Element</Text>
              <Text style={styles.rateLabel}>Rate</Text>
            </View>
            <ScrollView style={styles.rateList} showsVerticalScrollIndicator={false}>
              {gacha.randomList.map(item => (
                <View key={item.id} style={styles.rateRow}>
                  <View style={[styles.valuePill, styles.elementPill]}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.element}</Text>
                  </View>
                  <View style={[styles.valuePill, styles.ratePill]}>
                    <Text style={styles.itemRate}>{item.rate}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background },
  contentLayer: { zIndex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  topBar: { height: 44, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 38, lineHeight: 40, color: colors.text, fontWeight: '300' },
  detailCard: { backgroundColor: colors.card, borderRadius: radius.md, padding: 16, marginTop: 8 },
  titleRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { flex: 1, fontSize: 24, lineHeight: 30, fontWeight: '800', color: colors.text },
  titleActions: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  iconButton: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  heart: { fontSize: 31, lineHeight: 34, color: colors.danger },
  heartActive: { color: '#ff1734' },
  editIcon: { fontSize: 29, lineHeight: 32, color: colors.primary, transform: [{ rotate: '-8deg' }] },
  coverWrap: { width: '100%', aspectRatio: 1.45, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: '#d8d8d8', marginBottom: 28, ...cardShadow },
  cover: { width: '100%', height: '100%' },
  coverShade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 48, backgroundColor: 'rgba(0,0,0,0.18)' },
  bannerLabel: { position: 'absolute', left: 9, bottom: 7, color: '#fff', fontSize: 11, fontWeight: '600' },
  rateButton: { position: 'absolute', top: 10, right: 10, height: 34, paddingHorizontal: 10, borderRadius: 17, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.92)' },
  rateInfo: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.text, color: '#fff', textAlign: 'center', lineHeight: 18, fontSize: 12, fontWeight: '800' },
  rateButtonText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  primaryButton: { alignSelf: 'center', width: '66%', minHeight: 48, borderRadius: radius.pill, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#3bb9f4' },
  primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  amountLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, marginBottom: 8 },
  amountLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  pullRow: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  stepText: { fontSize: 24, lineHeight: 26, color: colors.textMuted, fontWeight: '500' },
  amountInput: { width: 92, height: 44, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, textAlign: 'center', color: colors.text, fontSize: 17, fontWeight: '700', paddingVertical: 0 },
  manyButton: { marginTop: 13, marginBottom: 2 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, padding: 30 },
  notFoundTitle: { color: colors.text, fontSize: 22, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.28)', justifyContent: 'center', paddingHorizontal: 26 },
  rateModal: {
    width: '100%',
    maxHeight: '58%',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.92)',
    ...cardShadow,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#1919f5' },
  closeButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 32, lineHeight: 33, color: '#ff1b2d', fontWeight: '400' },
  columnLabels: { flexDirection: 'row', gap: 10, paddingHorizontal: 2, marginBottom: 5 },
  elementLabel: { flex: 1, fontSize: 11, color: colors.textMuted },
  rateLabel: { width: 98, fontSize: 11, color: colors.textMuted },
  rateList: { flexGrow: 0 },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  valuePill: {
    height: 42,
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#8d8d8d',
    paddingHorizontal: 13,
  },
  elementPill: { flex: 1 },
  ratePill: { width: 98 },
  itemName: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  itemRate: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
});
