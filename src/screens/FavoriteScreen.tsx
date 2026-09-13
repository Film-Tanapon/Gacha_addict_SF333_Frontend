import React, { useState } from 'react';
import { Image, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radius, glassCard, BOTTOM_NAV_HEIGHT } from '../theme/theme';
import CoinBadge from '../components/CoinBadge';
import BottomTabBar from '../components/BottomTabBar';
import DecorativeBlob from '../components/DecorativeBlob';
import { getCoins, getFavorites, toggleFavorite } from '../data/mockStore';

// หน้า Favorite: รายการ Gacha ที่บันทึกไว้ + ปุ่มหัวใจสำหรับลบออกจาก Favorite
type Props = NativeStackScreenProps<RootStackParamList, 'Favorite'>;

export default function FavoriteScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState(getFavorites());

  const handleRemove = (id: string) => {
    toggleFavorite(id);
    setFavorites(getFavorites());
  };

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
          <Text style={styles.title}>Favorite</Text>
          <CoinBadge amount={getCoins()} />
        </View>

        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>♡</Text>
            <Text style={styles.emptyText}>ยังไม่มี Gacha ที่บันทึกไว้</Text>
          </View>
        ) : (
          favorites.map(g => (
            <TouchableOpacity
              key={g.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('GachaDetail', { gachaId: g.id })}
            >
              {g.bannerUri ? (
                <View style={styles.avatar}>
                  <Image source={{ uri: g.bannerUri }} style={styles.avatarImage} resizeMode="cover" />
                </View>
              ) : g.category === 'Food' ? (
                <View style={styles.foodImageWrap}>
                  <Text style={styles.avatarEmoji}>{g.emoji ?? '🍜'}</Text>
                </View>
              ) : null}
              <Text
                style={[styles.cardName, !g.bannerUri && g.category !== 'Food' && styles.cardNameCentered]}
                numberOfLines={1}
              >
                {g.name}
              </Text>
              <TouchableOpacity
                style={styles.heartButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => handleRemove(g.id)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${g.name} from favorites`}
              >
                <View style={styles.heartShape}>
                  <View style={styles.heartRotated}>
                    <View style={styles.heartTopLobe} />
                    <View style={styles.heartSideLobe} />
                  </View>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <DecorativeBlob />

      <BottomTabBar
        active="Favorite"
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
    height: 130,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: 16,
    marginBottom: 14,
    ...glassCard,
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: colors.background,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: { width: '100%', height: '100%' },
  foodImageWrap: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarEmoji: { fontSize: 58 },
  cardName: { flex: 1, fontSize: 24, fontWeight: '400', color: colors.text },
  cardNameCentered: { textAlign: 'center' },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartShape: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartRotated: {
    width: 17,
    height: 17,
    marginTop: 3,
    borderRadius: 2,
    backgroundColor: '#ff1f32',
    transform: [{ rotate: '-45deg' }],
  },
  heartTopLobe: {
    position: 'absolute',
    left: 0,
    top: -8.5,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#ff1f32',
  },
  heartSideLobe: {
    position: 'absolute',
    right: -8.5,
    top: 0,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#ff1f32',
  },
  emptyState: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyEmoji: { fontSize: 48, color: colors.textFaint },
  emptyText: { fontSize: 15, color: colors.textMuted },
});
