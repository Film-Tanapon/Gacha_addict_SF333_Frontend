import React, { useMemo } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, spacing, radius, cardShadow, absoluteFill } from '../theme/theme';
import PrimaryButton from '../components/PrimaryButton';
import DecorativeBlob from '../components/DecorativeBlob';
import CoinBadge from '../components/CoinBadge';
import { getGachaById, spendCoins, getCoins, addHistoryEntry, createId } from '../data/mockStore';

// หน้ารายละเอียด Gacha: ชื่อ, Banner, ปุ่ม Pull 1 Role และ Pull หลาย Role
type Props = NativeStackScreenProps<RootStackParamList, 'GachaDetail'>;

export default function GachaDetailScreen({ navigation, route }: Props) {
  const { gachaId } = route.params;
  const gacha = useMemo(() => getGachaById(gachaId), [gachaId]);

  if (!gacha) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.notFound}>ไม่พบ Gacha นี้</Text>
          <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  const pickRandomElement = () => {
    const list = gacha.randomList;
    if (list.length === 0) return 'Unknown';
    const index = Math.floor(Math.random() * list.length);
    return list[index].element;
  };

  const handlePull = (cost: number, times: number) => {
    if (!spendCoins(cost)) {
      Alert.alert('เหรียญไม่พอ', 'คุณมีเหรียญไม่เพียงพอสำหรับการสุ่มนี้');
      return;
    }

    // สุ่มผลลัพธ์ตามจำนวนครั้งที่ Pull แล้วบันทึกลงประวัติทุกครั้ง
    const results = Array.from({ length: times }, () => pickRandomElement());
    results.forEach(result => {
      addHistoryEntry({
        id: createId('h'),
        gachaName: gacha.name,
        resultElement: result,
        pulledAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
    });

    navigation.navigate('GachaResult', { gachaId: gacha.id, resultElement: results.join(', ') });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <CoinBadge amount={getCoins()} />
        </View>

        <Text style={styles.name}>{gacha.name}</Text>

        <View style={styles.banner}>
          {gacha.bannerUri ? (
            <Image source={{ uri: gacha.bannerUri }} style={styles.bannerImage} resizeMode="cover" />
          ) : (
            <Text style={styles.bannerEmoji}>{gacha.emoji ?? '🎴'}</Text>
          )}
        </View>
        <Text style={styles.bannerCaption}>Banner</Text>

        <PrimaryButton
          title={`Pull 1 Role  ·  ${gacha.pullOneCost} 🪙`}
          onPress={() => handlePull(gacha.pullOneCost, 1)}
          style={styles.pullButton}
        />
        <PrimaryButton
          title={`Pull ${gacha.pullManyCount} Role  ·  ${gacha.pullManyCost} 🪙`}
          variant="outline"
          onPress={() => handlePull(gacha.pullManyCost, gacha.pullManyCount)}
          style={styles.pullButton}
        />

        <Text style={styles.listTitle}>Random List</Text>
        {gacha.randomList.map(item => (
          <View key={item.id} style={styles.listRow}>
            <Text style={styles.listElement}>{item.element}</Text>
            <Text style={styles.listRate}>{item.rate}</Text>
          </View>
        ))}
      </ScrollView>

      <DecorativeBlob />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  notFound: { fontSize: 16, color: colors.textMuted },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  backArrow: { fontSize: 32, color: colors.text, fontWeight: '300' },
  name: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: spacing.lg },
  banner: {
    height: 242,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...cardShadow,
  },
  bannerImage: { ...absoluteFill },
  bannerEmoji: { fontSize: 64 },
  bannerCaption: { fontSize: 15, color: colors.text, marginTop: spacing.sm, marginBottom: spacing.lg },
  pullButton: { alignSelf: 'center', width: '80%', marginBottom: spacing.md },
  listTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  listElement: { fontSize: 15, color: colors.text, fontWeight: '600' },
  listRate: { fontSize: 15, color: colors.textMuted },
});
