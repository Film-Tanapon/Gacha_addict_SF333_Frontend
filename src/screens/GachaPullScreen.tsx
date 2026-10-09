import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { getGachaById } from '../data/mockStore';
import { pullGacha, showApiError } from '../services/appApi';
import { absoluteFill, colors } from '../theme/theme';
const IMG_CARD = require('../assets/Card/card.png');
const IMG_TOP = require('../assets/Card/top-card-part.png');
const IMG_BOTTOM = require('../assets/Card/bottom-card-part.png');
const IMG_CUTTING = require('../assets/Card/cutting.png');

type Props = NativeStackScreenProps<RootStackParamList, 'GachaPull'>;

// รูปแบบ Animation ที่หน้านี้รองรับ (ตอนนี้มีเฉพาะ 'card')
type GachaAnimation = 'card';
const DEFAULT_ANIMATION: GachaAnimation = 'card';

// แปลงค่า animation ที่รับมา (จาก route หรือข้อมูล gacha) ให้เป็นค่าที่รองรับ
// ค่าเก่าอย่าง 'anim1' หรือค่าว่าง จะ fallback เป็น 'card'
function resolveAnimation(value?: string | null): GachaAnimation {
  switch (value) {
    case 'card':
      return 'card';
    default:
      return DEFAULT_ANIMATION;
  }
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ทุกรูป (card / top / bottom / cutting) เป็น canvas ขนาดเท่ากัน ซ้อนกันได้เลย
const cardAsset = Image.resolveAssetSource(IMG_CARD);
const IMAGE_RATIO =
  cardAsset?.width && cardAsset?.height ? cardAsset.height / cardAsset.width : 1.414;
const STAGE_WIDTH = SCREEN_WIDTH;
const STAGE_HEIGHT = STAGE_WIDTH * IMAGE_RATIO;

// ตำแหน่งตัวการ์ดภายใน canvas (คิดเป็น % ของรูป) ใช้วางข้อความผลลัพธ์
const CARD_AREA = { left: '27%', top: '30.5%', width: '47%', height: '50.5%' } as const;

// ปรับจังหวะ animation ได้ที่นี่
const TIMING = {
  shake: 750,
  cutReveal: 600,
  pauseAfterCut: 200,
  topOut: 500,
  bottomOut: 450,
  spin: 1800,
  stackIn: 250,
  dismiss: 320,
};
const SPIN_TURNS = 5;
const SHAKE_ANGLE = 4;
const SHAKE_DISTANCE = 8;
const SPIN_SCALE_PEAK = 1.18;
const SPIN_SCALE_END = 1.1;

// การ์ดที่ซ้อนอยู่ด้านหลังแต่ละชั้น เล็กลงและโผล่ขึ้นด้านบนเล็กน้อย
const STACK_SCALE_STEP = 0.045;
const STACK_OFFSET_STEP = STAGE_HEIGHT * 0.022;
const STACK_VISIBLE = 4; // จำนวนใบที่ render ซ้อนหลังใบบนสุด

// หน้าการ์ดด้านหน้า (ใช้ซ้ำกับทุกใบ)
function CardFront({ text }: { text: string }) {
  return (
    <View style={styles.fill}>
      <Image source={IMG_CARD} style={styles.fill} resizeMode="contain" />
      <View style={[styles.cardTextArea, CARD_AREA]}>
        <Text style={styles.sparkle}>✦</Text>
        <Text style={styles.resultText}>{text}</Text>
        <Text style={styles.sparkleBottom}>✦</Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* ตัวนอก: เรียก pullGacha (สุ่ม + บันทึกประวัติ) แล้วค่อยเริ่ม animation */
/* ------------------------------------------------------------------ */
export default function GachaPullScreen({ navigation, route }: Props) {
  const gachaId = route.params.gachaId;
  const requiredPulls = Math.max(1, route.params.pullCount ?? 1);
  const gacha = getGachaById(gachaId);

  // ลำดับความสำคัญ: ค่าที่ส่งมากับ route -> ค่าที่บันทึกไว้ใน gacha -> ค่าเริ่มต้น 'card'
  const routeAnimation = (route.params as { animation?: string }).animation;
  const animation = resolveAnimation(routeAnimation ?? gacha?.animation);

  const [results, setResults] = useState<string[] | null>(null);
  const startedRef = useRef(false); // กันเรียก pullGacha ซ้ำ (เช่น StrictMode ตอน dev)

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    pullGacha(gachaId, requiredPulls)
      .then(items => {
        if (items.length === 0) {
          navigation.goBack();
          return;
        }
        setResults(items);
      })
      .catch(error => {
        showApiError(error);
        navigation.goBack();
      });
    // เรียกครั้งเดียวตอน mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!gacha || !results) {
    // กำลังสุ่ม (เป็นการทำงานในเครื่อง จึงใช้เวลาสั้นมาก)
    return <SafeAreaView style={styles.safeArea} />;
  }

  switch (animation) {
    case 'card':
    default:
      return <PackOpening gachaId={gachaId} results={results} navigation={navigation} />;
  }
}

/* ------------------------------------------------------------------ */
/* ตัวใน: เล่น animation เปิดซอง แล้วแตะดูการ์ดทีละใบ                     */
/* ------------------------------------------------------------------ */
type PackOpeningProps = {
  gachaId: string;
  results: string[];
  navigation: Props['navigation'];
};

function PackOpening({ gachaId, results, navigation }: PackOpeningProps) {
  const total = results.length;

  // ค่า animation ของแต่ละขั้นตอน (0 -> 1)
  const shake = useRef(new Animated.Value(0)).current;
  const cutReveal = useRef(new Animated.Value(0)).current;
  const topOut = useRef(new Animated.Value(0)).current;
  const bottomOut = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const stackOpacity = useRef(new Animated.Value(0)).current;

  // ค่า animation รายใบ
  // slides[i]    = 0 -> 1 ตอนการ์ดใบที่ i สไลด์ออก
  // positions[i] = ลำดับความลึกในกอง (0 = ใบบนสุด)
  const [slides] = useState(() => results.map(() => new Animated.Value(0)));
  const [positions] = useState(() => results.map((_, i) => new Animated.Value(i)));

  const [phase, setPhase] = useState<'pack' | 'browse'>('pack');
  const [current, setCurrent] = useState(0); // ใบที่อยู่บนสุดตอนนี้
  const busyRef = useRef(false);

  // interpolation รายใบ สร้างครั้งเดียว
  const cardAnims = useMemo(
    () =>
      results.map((_, i) => ({
        poseScale: positions[i].interpolate({
          inputRange: [0, 1, 2, 3],
          outputRange: [1, 1 - STACK_SCALE_STEP, 1 - STACK_SCALE_STEP * 2, 1 - STACK_SCALE_STEP * 3],
          extrapolate: 'clamp',
        }),
        poseY: positions[i].interpolate({
          inputRange: [0, 1, 2, 3],
          outputRange: [0, -STACK_OFFSET_STEP, -STACK_OFFSET_STEP * 2, -STACK_OFFSET_STEP * 3],
          extrapolate: 'clamp',
        }),
        slideX: slides[i].interpolate({ inputRange: [0, 1], outputRange: [0, SCREEN_WIDTH] }),
        slideRotate: slides[i].interpolate({ inputRange: [0, 1], outputRange: ['0deg', '20deg'] }),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // เล่น animation เปิดซองครั้งเดียวตอน mount
  useEffect(() => {
    const animation = Animated.sequence([
      // 0) pack สั่นก่อนตัด
      Animated.timing(shake, { toValue: 1, duration: TIMING.shake, easing: Easing.linear, useNativeDriver: true }),
      // 1) cutting อยู่ตรงกลางตั้งแต่แรก แต่ค่อย ๆ เผยจากซ้ายไปขวา
      Animated.timing(cutReveal, { toValue: 1, duration: TIMING.cutReveal, easing: Easing.linear, useNativeDriver: true }),
      Animated.delay(TIMING.pauseAfterCut),
      // 2) cutting + top-card-part เลื่อนออกด้านบน
      Animated.timing(topOut, { toValue: 1, duration: TIMING.topOut, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      // 3) bottom-card-part เลื่อนออกด้านล่าง เหลือแต่ card
      Animated.timing(bottomOut, { toValue: 1, duration: TIMING.bottomOut, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      // 4) หมุน card พร้อมขยาย แล้วค่อย ๆ ช้าลงจนหยุด
      Animated.timing(spin, { toValue: 1, duration: TIMING.spin, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      // 5) การ์ดใบที่เหลือค่อย ๆ โผล่ซ้อนอยู่ด้านหลัง
      Animated.timing(stackOpacity, { toValue: 1, duration: TIMING.stackIn, useNativeDriver: true }),
    ]);

    animation.start(({ finished }) => {
      if (finished) setPhase('browse');
    });

    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // แตะเพื่อสไลด์การ์ดใบบนสุดออก / ถ้าเป็นใบสุดท้ายไปหน้าสรุปผล
  const handleNext = () => {
    if (phase !== 'browse' || busyRef.current) return;
    busyRef.current = true;

    const leaving = current;
    const isLast = leaving >= total - 1;

    const moves: Animated.CompositeAnimation[] = [
      Animated.timing(slides[leaving], {
        toValue: 1,
        duration: TIMING.dismiss,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ];
    // ใบที่เหลือขยับขึ้นมาหนึ่งชั้น
    for (let j = leaving + 1; j < total; j += 1) {
      moves.push(
        Animated.timing(positions[j], {
          toValue: j - leaving - 1,
          duration: TIMING.dismiss,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      );
    }

    Animated.parallel(moves).start(({ finished }) => {
      if (!finished) return;
      if (isLast) {
        navigation.replace('GachaResult', { gachaId, resultElements: results });
        return;
      }
      setCurrent(leaving + 1);
      busyRef.current = false;
    });
  };

  // ---- interpolations ----
  const shakeInput = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  const shakeRotate = shake.interpolate({
    inputRange: shakeInput,
    outputRange: [0, -0.5, 0.6, -0.8, 1, -1, 1, -0.7, 0.5, -0.2, 0].map(k => `${k * SHAKE_ANGLE}deg`),
  });
  const shakeX = shake.interpolate({
    inputRange: shakeInput,
    outputRange: [0, -0.5, 0.6, -0.8, 1, -1, 1, -0.7, 0.5, -0.2, 0].map(k => k * SHAKE_DISTANCE),
  });
  const shakeScale = shake.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.04, 1] });

  // เผยรอยตัดจากซ้ายไปขวา: กรอบ (overflow hidden) เลื่อนเข้ามา ส่วนรูปข้างในเลื่อนสวนทาง
  const revealFrameX = cutReveal.interpolate({ inputRange: [0, 1], outputRange: [-STAGE_WIDTH, 0] });
  const revealImageX = cutReveal.interpolate({ inputRange: [0, 1], outputRange: [STAGE_WIDTH, 0] });

  const topY = topOut.interpolate({ inputRange: [0, 1], outputRange: [0, -SCREEN_HEIGHT] });
  const bottomY = bottomOut.interpolate({ inputRange: [0, 1], outputRange: [0, SCREEN_HEIGHT] });

  // เริ่มที่ 180deg (เห็นด้านหลังการ์ด) หมุนหลายรอบ และจบที่ด้านหน้า
  const cardRotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', `${360 * SPIN_TURNS + 360}deg`],
  });
  const cardScale = spin.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [1, SPIN_SCALE_PEAK, SPIN_SCALE_END],
  });

  // render เฉพาะใบที่อยู่บนสุดและใบที่ซ้อนอยู่ด้านหลัง เรียงให้ใบบนสุดอยู่ท้ายสุด (วาดทับ)
  const visibleIndexes = results
    .map((_, i) => i)
    .filter(i => i >= current && i <= current + STACK_VISIBLE)
    .reverse();

  const isLastCard = current >= total - 1;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {phase === 'browse' && total > 1 && (
        <Text style={styles.counter}>
          {current + 1} / {total}
        </Text>
      )}

      <View style={styles.center}>
        <View style={styles.stage}>
          {/* กลุ่มที่สั่น: deck ของการ์ด + bottom + top */}
          <Animated.View
            style={[
              styles.fill,
              { transform: [{ translateX: shakeX }, { rotate: shakeRotate }, { scale: shakeScale }] },
            ]}
          >
            {/* deck: การ์ดทุกใบซ้อนกัน ขยายขนาดพร้อมกันตอนหมุน */}
            <Animated.View style={[styles.fill, { transform: [{ scale: cardScale }] }]}>
              {visibleIndexes.map(index => {
                const anim = cardAnims[index];
                return (
                  <Animated.View
                    key={index}
                    pointerEvents="none"
                    style={[
                      styles.fill,
                      {
                        // ใบแรกเห็นตั้งแต่ต้น ใบที่เหลือ fade เข้ามาหลังหมุนเสร็จ
                        opacity: index === 0 ? 1 : stackOpacity,
                        transform: [
                          { translateX: anim.slideX },
                          { translateY: anim.poseY },
                          { rotate: anim.slideRotate },
                          { scale: anim.poseScale },
                        ],
                      },
                    ]}
                  >
                    {index === 0 ? (
                      // ใบแรก: หมุนได้ 2 หน้า (หลัง = ? / หน้า = ผลลัพธ์)
                      <Animated.View
                        style={[styles.fill, { transform: [{ perspective: 1200 }, { rotateY: cardRotate }] }]}
                      >
                        <View style={[styles.fill, styles.backfaceHidden]}>
                          <CardFront text={results[0]} />
                        </View>
                        <View style={[styles.fill, styles.backfaceHidden, { transform: [{ rotateY: '180deg' }] }]}>
                          <Image source={IMG_CARD} style={styles.fill} resizeMode="contain" />
                          <View style={[styles.cardTextArea, CARD_AREA]}>
                            <Text style={styles.backMark}>?</Text>
                          </View>
                        </View>
                      </Animated.View>
                    ) : (
                      // ใบอื่น: แสดงด้านหน้าตรง ๆ รอใบก่อนหน้าสไลด์ออก
                      <CardFront text={results[index]} />
                    )}
                  </Animated.View>
                );
              })}
            </Animated.View>

            {/* bottom-card-part ทับ card -> เลื่อนลงล่าง */}
            <Animated.Image
              source={IMG_BOTTOM}
              resizeMode="contain"
              style={[styles.fill, { transform: [{ translateY: bottomY }] }]}
            />

            {/* top-card-part ทับ card -> เลื่อนขึ้นบน */}
            <Animated.Image
              source={IMG_TOP}
              resizeMode="contain"
              style={[styles.fill, { transform: [{ translateY: topY }] }]}
            />
          </Animated.View>

          {/* cutting: อยู่ตรงกลางตลอด ค่อย ๆ เผยจากซ้ายไปขวา แล้วเลื่อนขึ้นไปพร้อม top */}
          <Animated.View style={[styles.fill, { transform: [{ translateY: topY }] }]} pointerEvents="none">
            <Animated.View style={[styles.fill, styles.clip, { transform: [{ translateX: revealFrameX }] }]}>
              <Animated.Image
                source={IMG_CUTTING}
                resizeMode="contain"
                style={[styles.fill, { transform: [{ translateX: revealImageX }] }]}
              />
            </Animated.View>
          </Animated.View>
        </View>
      </View>

      {/* พื้นที่แตะเพื่อดูใบถัดไป (เปิดใช้งานหลังหมุนเสร็จ) */}
      {phase === 'browse' && (
        <>
          <Pressable style={styles.tapArea} onPress={handleNext} />
          <Text style={styles.hint} pointerEvents="none">
            {isLastCard ? 'Tap to see all results' : 'Tap to reveal next card'}
          </Text>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  center: { ...absoluteFill, alignItems: 'center', justifyContent: 'center' },
  counter: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 10,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  tapArea: { ...absoluteFill, zIndex: 5 },
  hint: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    zIndex: 10,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMuted,
  },
  stage: { width: STAGE_WIDTH, height: STAGE_HEIGHT },
  fill: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  clip: { overflow: 'hidden' },
  backfaceHidden: { backfaceVisibility: 'hidden' },
  cardTextArea: { position: 'absolute', alignItems: 'center', justifyContent: 'center', padding: 8 },
  resultText: { fontSize: STAGE_WIDTH * 0.07, fontWeight: '900', color: colors.text, textAlign: 'center' },
  backMark: { fontSize: STAGE_WIDTH * 0.25, fontWeight: '800', color: '#ffb3cf' },
  sparkle: { position: 'absolute', top: '12%', right: '10%', fontSize: 28, color: colors.gold },
  sparkleBottom: { position: 'absolute', bottom: '12%', left: '10%', fontSize: 24, color: colors.primary },
});