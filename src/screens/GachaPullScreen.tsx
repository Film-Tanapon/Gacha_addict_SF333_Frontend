import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { addHistoryEntry, createId, getGachaById } from '../data/mockStore';
import { absoluteFill, cardShadow, colors, radius } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GachaPull'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.62, 270);
const CARD_HEIGHT = CARD_WIDTH * 1.42;
const CARD_GAP = 18;
const CARD_INTERVAL = CARD_WIDTH + CARD_GAP;
const LOOP_CARD_COUNT = 60;
const LOOP_START_INDEX = 30;
const LOOP_START_OFFSET = LOOP_START_INDEX * CARD_INTERVAL;
const CARD_BACK = 'https://www.figma.com/api/mcp/asset/a47a4121-f6e3-4557-92b5-073db75bd734.png';

export default function GachaPullScreen({ navigation, route }: Props) {
  const gacha = getGachaById(route.params.gachaId);
  const requiredPulls = Math.max(1, route.params.pullCount ?? 1);
  const scrollX = useRef(new Animated.Value(LOOP_START_OFFSET)).current;
  const flip = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<React.ElementRef<typeof Animated.ScrollView>>(null);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [revealedResult, setRevealedResult] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [roundKey, setRoundKey] = useState(0);

  if (!gacha) return null;

  const drawItem = () => {
    const weighted = gacha.randomList.map(item => ({
      item,
      weight: Math.max(Number.parseFloat(item.rate.replace('%', '')) || 0, 0),
    }));
    const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
    let cursor = Math.random() * total;
    return weighted.find(entry => (cursor -= entry.weight) <= 0)?.item ?? weighted[weighted.length - 1]?.item;
  };

  const revealCard = (index: number) => {
    if (isAnimating || results.length >= requiredPulls) return;
    const result = drawItem();
    if (!result) return;
    const nextResults = [...results, result.element];
    setSelectedCard(index);
    setResults(nextResults);
    setRevealedResult(result.element);
    setIsAnimating(true);
    flip.setValue(0);
    addHistoryEntry({
      id: createId('history'),
      gachaName: gacha.name,
      resultElement: result.element,
      pulledAt: new Date().toLocaleString(),
    });
    Animated.timing(flip, { toValue: 1, duration: 420, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        if (nextResults.length === requiredPulls) {
          navigation.replace('GachaResult', {
            gachaId: gacha.id,
            resultElements: nextResults,
          });
          return;
        }
        setSelectedCard(null);
        setRevealedResult('');
        flip.setValue(0);
        scrollX.setValue(LOOP_START_OFFSET);
        setRoundKey(current => current + 1);
        setIsAnimating(false);
      }, 650);
    });
  };

  const cards = Array.from({ length: LOOP_CARD_COUNT });

  const keepCarouselLooping = (offsetX: number) => {
    const currentIndex = Math.round(offsetX / CARD_INTERVAL);
    if (currentIndex > 8 && currentIndex < LOOP_CARD_COUNT - 8) return;
    const loopedIndex = LOOP_START_INDEX + (currentIndex % 7);
    const loopedOffset = loopedIndex * CARD_INTERVAL;
    carouselRef.current?.scrollTo({ x: loopedOffset, animated: false });
    scrollX.setValue(loopedOffset);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{gacha.name}</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.intro}>
        <Text style={styles.instruction}>Pull {selectedCard === null ? results.length + 1 : results.length} of {requiredPulls}</Text>
        <Text style={styles.helper}>Swipe, then choose one card for this pull</Text>
      </View>

      <Animated.ScrollView
        key={roundKey}
        ref={carouselRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_INTERVAL}
        contentOffset={{ x: LOOP_START_OFFSET, y: 0 }}
        contentContainerStyle={styles.cardRail}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        onMomentumScrollEnd={event => keepCarouselLooping(event.nativeEvent.contentOffset.x)}
        scrollEventThrottle={16}
      >
        {cards.map((_, index) => {
          const inputRange = [(index - 1) * CARD_INTERVAL, index * CARD_INTERVAL, (index + 1) * CARD_INTERVAL];
          const scale = scrollX.interpolate({ inputRange, outputRange: [0.86, 1, 0.86], extrapolate: 'clamp' });
          const isSelected = selectedCard === index;
          const rotateY = isSelected
            ? flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] })
            : '0deg';
          return (
            <TouchableOpacity key={index} activeOpacity={0.92} onPress={() => revealCard(index)} disabled={isAnimating}>
              <Animated.View style={[styles.card, isSelected && styles.selectedCard, { transform: [{ scale }, { perspective: 900 }, { rotateY }] }]}>
                {isSelected ? (
                  <View style={styles.revealFace}>
                    <Text style={styles.sparkle}>✦</Text>
                    <Text style={styles.resultText}>{revealedResult}</Text>
                    <Text style={styles.sparkleBottom}>✦</Text>
                  </View>
                ) : (
                  <>
                    <Image source={{ uri: gacha.bannerUri || CARD_BACK }} style={styles.cardImage} resizeMode="cover" />
                    <View style={styles.cardTint} />
                    <Text style={styles.cardMark}>?</Text>
                  </>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </Animated.ScrollView>

      <View style={styles.dots}>
        <View style={styles.activeDot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { height: 58, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 42, height: 42, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 40, lineHeight: 42, color: colors.text },
  title: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '800', color: colors.text },
  intro: { alignItems: 'center', paddingTop: 28, paddingHorizontal: 24 },
  instruction: { fontSize: 30, fontWeight: '800', color: colors.text },
  helper: { marginTop: 8, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  cardRail: { paddingLeft: 24, paddingRight: 24, alignItems: 'center', gap: CARD_GAP, paddingVertical: 42 },
  card: { width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: radius.lg, backgroundColor: '#4c409d', overflow: 'hidden', borderWidth: 5, borderColor: '#fff', ...cardShadow },
  selectedCard: { borderColor: colors.primary },
  cardImage: { width: '100%', height: '100%' },
  cardTint: { ...absoluteFill, backgroundColor: 'rgba(47, 39, 128, 0.35)' },
  cardMark: { position: 'absolute', alignSelf: 'center', top: '34%', fontSize: 96, lineHeight: 108, fontWeight: '800', color: '#fff' },
  revealFace: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff', transform: [{ rotateY: '180deg' }] },
  resultText: { fontSize: 30, fontWeight: '900', color: colors.text, textAlign: 'center' },
  sparkle: { position: 'absolute', top: 42, right: 34, fontSize: 34, color: colors.gold },
  sparkleBottom: { position: 'absolute', bottom: 42, left: 34, fontSize: 28, color: colors.primary },
  dots: { height: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  activeDot: { width: 24, height: 8, borderRadius: 4, backgroundColor: '#3bb9f4' },
});
