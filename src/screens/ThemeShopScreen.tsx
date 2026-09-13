import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, spacing, radius, cardShadow } from '../theme/theme';
import CoinBadge from '../components/CoinBadge';
import ConfirmModal from '../components/ConfirmModal';
import DecorativeBlob from '../components/DecorativeBlob';
import { getCoins, getThemes, purchaseTheme, spendCoins, Theme } from '../data/mockStore';

// หน้า Theme Shop: รายการ Theme, ราคาเป็น Coins, Modal ยืนยันซื้อ, สถานะ Coins ไม่พอ
type Props = NativeStackScreenProps<RootStackParamList, 'ThemeShop'>;

export default function ThemeShopScreen({ navigation }: Props) {
  const [themes, setThemes] = useState(getThemes());
  const [coins, setCoins] = useState(getCoins());
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  const canAfford = selectedTheme ? coins >= selectedTheme.price : true;

  const handleConfirmPurchase = () => {
    if (!selectedTheme) return;

    if (!spendCoins(selectedTheme.price)) {
      return; // ปุ่ม confirm ถูก disable ไว้แล้วเมื่อเหรียญไม่พอ กันเหตุการณ์ผิดพลาดซ้ำ
    }

    purchaseTheme(selectedTheme.id);
    setThemes(getThemes());
    setCoins(getCoins());
    setSelectedTheme(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Shop</Text>
          <CoinBadge amount={coins} />
        </View>

        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={styles.grid}>
          {themes.map(theme => (
            <TouchableOpacity
              key={theme.id}
              style={styles.themeCard}
              activeOpacity={0.85}
              onPress={() => (theme.owned ? null : setSelectedTheme(theme))}
            >
              <View style={[styles.themePreview, { backgroundColor: theme.colorPreview }]} />
              <Text style={styles.themeName}>{theme.name}</Text>
              {theme.owned ? (
                <Text style={styles.ownedLabel}>Owned</Text>
              ) : (
                <Text style={styles.themePrice}>{theme.price} 🪙</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <DecorativeBlob />

      <ConfirmModal
        visible={!!selectedTheme}
        title={`Do you want to buy ${selectedTheme?.name ?? ''} ?`}
        description={`ราคา ${selectedTheme?.price ?? 0} Coins`}
        confirmLabel="Buy"
        confirmDisabled={!canAfford}
        disabledHint={!canAfford ? '*Coins is not enough' : undefined}
        onConfirm={handleConfirmPurchase}
        onClose={() => setSelectedTheme(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  backArrow: { fontSize: 32, color: colors.text, fontWeight: '300' },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  themeCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    ...cardShadow,
  },
  themePreview: { width: '70%', height: '45%', borderRadius: radius.sm, marginBottom: spacing.sm },
  themeName: { fontSize: 13, fontWeight: '600', color: colors.text },
  themePrice: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  ownedLabel: { fontSize: 12, color: colors.primary, fontWeight: '700', marginTop: 2 },
});
