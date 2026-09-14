import React, { useRef, useState } from 'react';
import {
  Animated,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import BottomTabBar from '../components/BottomTabBar';
import CoinBadge from '../components/CoinBadge';
import DecorativeBlob from '../components/DecorativeBlob';
import { BOTTOM_NAV_HEIGHT, cardShadow, colors, radius } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ThemeShop'>;
type ShopItem = { id: string; name: string; price: number; type: 'frame' | 'theme'; color: string; decoration?: string };

const FRAMES: ShopItem[] = [
  { id: 'f1', name: 'Ribbon Frame', price: 50, type: 'frame', color: '#0080ff', decoration: '🎀' },
  { id: 'f2', name: 'Pink Heart Frame', price: 30, type: 'frame', color: '#ff4b82', decoration: '💗' },
  { id: 'f3', name: 'Gold Crown', price: 100, type: 'frame', color: '#eab308', decoration: '👑' },
  { id: 'f4', name: 'Flower Frame', price: 60, type: 'frame', color: '#a855f7', decoration: '🌸' },
  { id: 'f5', name: 'Star Frame', price: 75, type: 'frame', color: '#06b6d4', decoration: '⭐' },
];
const THEMES: ShopItem[] = [
  { id: 't1', name: 'Pastel Blue', price: 50, type: 'theme', color: '#e0e7ff' },
  { id: 't2', name: 'Soft Purple', price: 40, type: 'theme', color: '#f3e8ff' },
  { id: 't3', name: 'Mint Green', price: 40, type: 'theme', color: '#dcfce7' },
  { id: 't4', name: 'Warm Orange', price: 60, type: 'theme', color: '#ffedd5' },
  { id: 't5', name: 'Rose Pink', price: 60, type: 'theme', color: '#ffe4e6' },
  { id: 't6', name: 'Lemon Cream', price: 55, type: 'theme', color: '#fef9c3' },
  { id: 't7', name: 'Cloud Gray', price: 35, type: 'theme', color: '#e5e7eb' },
  { id: 't8', name: 'Sky Blue', price: 55, type: 'theme', color: '#bae6fd' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_CARD_WIDTH = 128;
const FRAME_CARD_GAP = 12;
const FRAME_INTERVAL = FRAME_CARD_WIDTH + FRAME_CARD_GAP;

export default function ShopScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const username = route.params?.username;
  const [coin, setCoin] = useState(route.params?.coin ?? 20);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const frameScrollX = useRef(new Animated.Value(0)).current;
  const frameInset = Math.max((SCREEN_WIDTH - 40 - FRAME_CARD_WIDTH) / 2, 0);

  const buyItem = () => {
    if (!selectedItem || coin < selectedItem.price) return;
    setCoin(value => value - selectedItem.price);
    setSelectedItem(null);
    Alert.alert('Success', `You purchased ${selectedItem.name}!`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
        <CoinBadge amount={coin} />
      </View>

      <ScrollView
        style={styles.contentLayer}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 34 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Frame</Text>
        <Animated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={FRAME_INTERVAL}
          snapToAlignment="center"
          contentContainerStyle={[styles.frameRow, { paddingHorizontal: frameInset }]}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: frameScrollX } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
        >
          {FRAMES.map((item, index) => {
            const inputRange = [
              (index - 1) * FRAME_INTERVAL,
              index * FRAME_INTERVAL,
              (index + 1) * FRAME_INTERVAL,
            ];
            const scale = frameScrollX.interpolate({
              inputRange,
              outputRange: [0.8, 1, 0.8],
              extrapolate: 'clamp',
            });
            const opacity = frameScrollX.interpolate({
              inputRange,
              outputRange: [0.58, 1, 0.58],
              extrapolate: 'clamp',
            });
            return (
              <TouchableOpacity key={item.id} onPress={() => setSelectedItem(item)} activeOpacity={0.82}>
                <Animated.View style={[styles.frameCard, { opacity, transform: [{ scale }] }]}>
                  <View style={styles.framePreviewArea}>
                    <View style={[styles.frameCircle, { borderColor: item.color }]} />
                    <Text style={styles.frameDecoration}>{item.decoration}</Text>
                  </View>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </Animated.ScrollView>

        <Text style={styles.sectionTitle}>Theme</Text>
        <View style={styles.themeGrid}>
          {THEMES.map(item => (
            <TouchableOpacity key={item.id} style={styles.themeCard} onPress={() => setSelectedItem(item)} activeOpacity={0.82}>
              <View style={[styles.themePreview, { backgroundColor: item.color }]} />
            </TouchableOpacity>
          ))}
          <View style={styles.moreThemeCard}>
            <Text style={styles.moreArrow}>→</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={selectedItem !== null} transparent animationType="fade" onRequestClose={() => setSelectedItem(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedItem(null)}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
            {selectedItem?.type === 'frame' ? (
              <View style={styles.modalFrameArea}>
                <View style={[styles.modalFrameCircle, { borderColor: selectedItem.color }]} />
                <Text style={styles.modalDecoration}>{selectedItem.decoration}</Text>
              </View>
            ) : (
              <View style={[styles.modalThemePreview, { backgroundColor: selectedItem?.color }]} />
            )}
            <Text style={styles.modalQuestion}>Do you want to buy {selectedItem?.name}?</Text>
            <TouchableOpacity
              style={[styles.buyButton, selectedItem !== null && coin < selectedItem.price && styles.buyDisabled]}
              disabled={selectedItem !== null && coin < selectedItem.price}
              onPress={buyItem}
            >
              <Text style={styles.buyText}>$  {selectedItem?.price} Coins</Text>
            </TouchableOpacity>
            {selectedItem !== null && coin < selectedItem.price ? <Text style={styles.errorText}>*Coins is not enough</Text> : null}
          </View>
        </View>
      </Modal>

      <DecorativeBlob />
      <BottomTabBar
        active="Profile"
        onNavigate={tab => navigation.replace(tab, { username } as any)}
        onAddPress={() => navigation.navigate('CreateCustom', { username })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  contentLayer: { zIndex: 1 },
  header: { height: 56, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 26, fontWeight: '800', color: colors.text },
  scrollContent: { paddingHorizontal: 20, paddingTop: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginTop: 10, marginBottom: 10 },
  frameRow: { gap: FRAME_CARD_GAP, paddingTop: 12, paddingBottom: 22 },
  frameCard: { width: FRAME_CARD_WIDTH, height: 142, backgroundColor: 'rgba(255,255,255,0.76)', borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', ...cardShadow },
  framePreviewArea: { width: 100, height: 112, alignItems: 'center', justifyContent: 'flex-end' },
  frameCircle: { width: 78, height: 78, borderRadius: 39, borderWidth: 3, backgroundColor: '#fff' },
  frameDecoration: { position: 'absolute', top: 0, fontSize: 39, zIndex: 2 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 2, paddingBottom: 16 },
  themeCard: { width: '30%', aspectRatio: 1, backgroundColor: '#fff', borderRadius: radius.sm, padding: 3, ...cardShadow },
  themePreview: { flex: 1, borderRadius: radius.sm },
  moreThemeCard: { width: '30%', aspectRatio: 1, backgroundColor: colors.card, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  moreArrow: { fontSize: 34, color: colors.textMuted, fontWeight: '400' },
  modalOverlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  modalCard: { width: '100%', borderRadius: radius.lg, backgroundColor: '#ebebeb', padding: 24, alignItems: 'center', ...cardShadow },
  closeButton: { position: 'absolute', top: 10, right: 12, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 28, color: colors.danger },
  modalFrameArea: { width: 120, height: 128, alignItems: 'center', justifyContent: 'flex-end', marginVertical: 5 },
  modalFrameCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, backgroundColor: '#fff' },
  modalDecoration: { position: 'absolute', top: -2, fontSize: 48 },
  modalThemePreview: { width: 115, height: 115, borderRadius: radius.md, borderWidth: 2, borderColor: colors.primary, marginVertical: 14 },
  modalQuestion: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 16 },
  buyButton: { minWidth: 170, height: 46, borderRadius: 23, backgroundColor: '#ffa800', alignItems: 'center', justifyContent: 'center' },
  buyDisabled: { opacity: 0.55 },
  buyText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  errorText: { color: colors.danger, fontSize: 12, fontWeight: '600', marginTop: 9 },
});
