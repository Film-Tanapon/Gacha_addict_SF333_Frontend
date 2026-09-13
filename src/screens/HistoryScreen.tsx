import React, { useState } from 'react';
import { Image, View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radius, glassCard, BOTTOM_NAV_HEIGHT } from '../theme/theme';
import CoinBadge from '../components/CoinBadge';
import BottomTabBar from '../components/BottomTabBar';
import DecorativeBlob from '../components/DecorativeBlob';
import { getCoins, getHistory } from '../data/mockStore';

// หน้า History: ประวัติรายการที่เคยสุ่มทั้งหมด
type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

const FIGMA_GACHA_ART =
  'https://www.figma.com/api/mcp/asset/a47a4121-f6e3-4557-92b5-073db75bd734.png';

export default function HistoryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [history] = useState(getHistory());

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.contentLayer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
          <CoinBadge amount={getCoins()} />
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🕘</Text>
            <Text style={styles.emptyText}>ยังไม่มีประวัติการสุ่ม</Text>
          </View>
        ) : (
          history.map(entry => (
            <View key={entry.id} style={styles.card}>
              {entry.gachaName === 'Food' ? (
                <View style={styles.foodImageWrap}>
                  <Text style={styles.foodEmoji}>🍜</Text>
                </View>
              ) : (
                <View style={styles.avatar}>
                  <Image source={{ uri: FIGMA_GACHA_ART }} style={styles.avatarImage} resizeMode="cover" />
                </View>
              )}
              <Text style={styles.result} numberOfLines={1}>{entry.resultElement}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <DecorativeBlob />

      <BottomTabBar
        active="History"
        onNavigate={tab => navigation.replace(tab as any)}
        onAddPress={() => navigation.navigate('GachaForm', {})}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  contentLayer: { zIndex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  header: {
    minHeight: 66,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { fontSize: 30, lineHeight: 38, fontWeight: '800', color: colors.text },
  card: {
    height: 96,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    marginBottom: 14,
    ...glassCard,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.background,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: { width: '100%', height: '100%' },
  foodImageWrap: {
    width: 76,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  foodEmoji: { fontSize: 52 },
  result: { flex: 1, fontSize: 22, fontWeight: '400', color: colors.text },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, color: colors.textMuted },
});
