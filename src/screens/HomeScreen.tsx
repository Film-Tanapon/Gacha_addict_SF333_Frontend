import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radius, cardShadow, glassCard, BOTTOM_NAV_HEIGHT } from '../theme/theme';
import CoinBadge from '../components/CoinBadge';
import BottomTabBar from '../components/BottomTabBar';
import DecorativeBlob from '../components/DecorativeBlob';
import { getCoins, getGachas } from '../data/mockStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CENTER_CARD_WIDTH = 230;
const CENTER_CARD_HEIGHT = 310;
const CARD_GAP = 18;

// ภาพประกอบหลักจาก Home page ใน Figma
const FIGMA_GACHA_ART =
  'https://www.figma.com/api/mcp/asset/a47a4121-f6e3-4557-92b5-073db75bd734.png';

export default function HomeScreen({ navigation, route }: Props) {
  const username = (route.params as any)?.username ?? null;
  const insets = useSafeAreaInsets();
  const [coins] = useState(getCoins());
  const gachas = getGachas();
  const scrollX = useRef(new Animated.Value(0)).current;

  const carouselItems =
    gachas.length > 0
      ? gachas.slice(0, 5)
      : [{ id: 'fallback', name: 'Gacha', emoji: '🎴' } as any];

  const horizontalInset = Math.max((SCREEN_WIDTH - CENTER_CARD_WIDTH) / 2, 24);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.screen}>
        <ScrollView
          style={styles.contentLayer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 34 },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.greeting}>
              <Text style={styles.greetingTitle}>Hello!</Text>
              <Text style={styles.greetingSubtitle}>To Our Gacha Addict!</Text>
            </View>
            <CoinBadge
              amount={coins}
              onPress={() => navigation.navigate('ThemeShop')}
            />
          </View>

          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={CENTER_CARD_WIDTH + CARD_GAP}
            snapToAlignment="center"
            contentContainerStyle={[
              styles.carouselContent,
              { paddingHorizontal: horizontalInset },
            ]}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
          >
            {carouselItems.map((g, index) => {
              const inputRange = [
                (index - 1) * (CENTER_CARD_WIDTH + CARD_GAP),
                index * (CENTER_CARD_WIDTH + CARD_GAP),
                (index + 1) * (CENTER_CARD_WIDTH + CARD_GAP),
              ];

              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [0.82, 1, 0.82],
                extrapolate: 'clamp',
              });

              return (
                <TouchableOpacity
                  key={g.id}
                  activeOpacity={0.9}
                  onPress={() =>
                    g.id !== 'fallback' &&
                    navigation.navigate('GachaDetail', { gachaId: g.id })
                  }
                >
                  <Animated.View
                    style={[
                      styles.carouselCard,
                      { transform: [{ scale }] },
                    ]}
                  >
                    {g.bannerUri ? (
                      <Image
                        source={{ uri: g.bannerUri }}
                        style={styles.carouselImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={{ uri: FIGMA_GACHA_ART }}
                        style={styles.carouselImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.carouselOverlay}>
                      <Text style={styles.carouselTitle} numberOfLines={1}>
                        {g.name}
                      </Text>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </Animated.ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Custom</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('CustomGacha')}
              hitSlop={10}
            >
              <Text style={styles.moreLink}>More &gt;</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.customRow}
          >
            {gachas.map(g => (
              <TouchableOpacity
                key={g.id}
                activeOpacity={0.88}
                style={styles.customCard}
                onPress={() =>
                  navigation.navigate('GachaDetail', { gachaId: g.id })
                }
              >
                <View
                  style={[
                    styles.customImageWrap,
                    !g.bannerUri && styles.customEmptyWrap,
                  ]}
                >
                  {g.bannerUri ? (
                    <Image
                      source={{ uri: g.bannerUri }}
                      style={styles.customImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.customName} numberOfLines={2}>
                      {g.name}
                    </Text>
                  )}
                </View>
                {g.bannerUri ? (
                  <View style={styles.customNameWrap}>
                    <Text style={styles.customName} numberOfLines={2}>
                      {g.name}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>

        <DecorativeBlob />

        <BottomTabBar
          active="Home"
          onNavigate={tab => navigation.replace(tab, { username } as any)}
          onAddPress={() => navigation.navigate('CreateCustom', {})}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentLayer: { zIndex: 1 },
  scrollContent: {
    paddingTop: 12,
  },
  header: {
    minHeight: 82,
    paddingHorizontal: 19,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
  greetingSubtitle: {
    marginTop: 0,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '400',
    color: colors.text,
  },
  carouselContent: {
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 42,
    gap: CARD_GAP,
  },
  carouselCard: {
    width: CENTER_CARD_WIDTH,
    height: CENTER_CARD_HEIGHT,
    borderRadius: radius.md,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    ...cardShadow,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'flex-end',
  },
  carouselTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionHeader: {
    paddingHorizontal: 19,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '400',
    color: colors.text,
  },
  moreLink: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  customRow: {
    paddingHorizontal: 25,
    paddingTop: 0,
    paddingBottom: 8,
    gap: 28,
  },
  customCard: {
    width: 167,
    height: 210,
    borderRadius: radius.md,
    overflow: 'hidden',
    ...glassCard,
  },
  customImageWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 45,

    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  customImage: {
    width: 112,
    height: 112,
    aspectRatio: 1,
  },
  customNameWrap: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 7,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  customEmptyWrap: {
    bottom: 0,
  },
  customName: {
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '400',
    color: colors.text,
  },
});
