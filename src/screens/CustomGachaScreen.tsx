import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { BOTTOM_NAV_HEIGHT, colors, glassCard, radius } from '../theme/theme';
import BottomTabBar from '../components/BottomTabBar';
import CoinBadge from '../components/CoinBadge';
import DecorativeBlob from '../components/DecorativeBlob';
import { getCoins, getGachas } from '../data/mockStore';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomGacha'>;
const MINIMUM_CARD_SLOTS = 5;

export default function CustomGachaScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const gachas = getGachas();
  const emptySlots = Math.max(MINIMUM_CARD_SLOTS - gachas.length, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <ScrollView
          style={styles.contentLayer}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 34 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Custom</Text>
            <CoinBadge amount={getCoins()} />
          </View>

          <View style={styles.grid}>
            {gachas.map(gacha => (
              <TouchableOpacity
                key={gacha.id}
                style={styles.card}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('GachaDetail', { gachaId: gacha.id })}
              >
                <View style={[styles.imageWrap, !gacha.bannerUri && styles.emptyImageWrap]}>
                  {gacha.bannerUri ? (
                    <Image source={{ uri: gacha.bannerUri }} style={styles.image} resizeMode="contain" />
                  ) : (
                    <Text style={styles.centeredCardName} numberOfLines={2}>{gacha.name}</Text>
                  )}
                </View>
                {gacha.bannerUri ? (
                  <Text style={styles.cardName} numberOfLines={2}>{gacha.name}</Text>
                ) : null}
              </TouchableOpacity>
            ))}

            {Array.from({ length: emptySlots }, (_, index) => (
              <TouchableOpacity
                key={`empty-${index}`}
                style={styles.card}
                activeOpacity={0.75}
                accessibilityLabel="Create new gacha"
                onPress={() => navigation.navigate('CreateCustom', {})}
              />
            ))}
          </View>
        </ScrollView>

        <DecorativeBlob />
        <BottomTabBar
          active="Home"
          onNavigate={tab => navigation.replace(tab as any)}
          onAddPress={() => navigation.navigate('CreateCustom', {})}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, backgroundColor: colors.background },
  contentLayer: { zIndex: 1 },
  scrollContent: { paddingTop: 12, paddingHorizontal: 24 },
  header: {
    minHeight: 66,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { fontSize: 30, lineHeight: 38, fontWeight: '800', color: colors.text },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  card: {
    width: '47%',
    height: 210,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...glassCard,
  },
  imageWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 45,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  image: { width: 112, height: 112 },
  emptyImageWrap: { bottom: 0 },
  centeredCardName: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '400',
    color: colors.text,
  },
  cardName: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 14,
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '400',
    color: colors.text,
  },
});
