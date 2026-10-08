import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import BottomTabBar from '../components/BottomTabBar';
import CoinBadge from '../components/CoinBadge';
import DecorativeBlob from '../components/DecorativeBlob';
import { BOTTOM_NAV_HEIGHT, cardShadow, colors, radius } from '../theme/theme';

import {
  useAppData,
  purchaseTheme,
  purchaseFrame,
  selectFrame,
  selectTheme,
  showApiError,
} from '../services/appApi';

type Props = NativeStackScreenProps<RootStackParamList, 'ThemeShop'>;
type ShopItem = {
  id: string;
  name: string;
  price: number;
  type: 'frame' | 'theme';
  color: string;
  owned?: boolean;
  decoration?: string;
};

export default function ShopScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const username = route.params?.username;
  const { coins: coin, themes, frames, user } = useAppData(['themes', 'frames', 'user']);
  const themeItems: ShopItem[] = themes.map(t => ({
    ...t,
    type: 'theme',
    color: t.colorPreview,
  }));
  const [buying, setBuying] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  const buyItem = async () => {
    if (
      !selectedItem ||
      buying ||
      (!selectedItem.owned && coin < selectedItem.price)
    )
      return;
    setBuying(true);
    try {
      if (selectedItem.type === 'frame') {
        if (!selectedItem.owned) await purchaseFrame(selectedItem.id);
        await selectFrame(selectedItem.id);
      } else {
        if (!selectedItem.owned) await purchaseTheme(selectedItem.id);
        await selectTheme(selectedItem.id);
      }
      setSelectedItem(null);
      Alert.alert('Success', 'Selected successfully!');
    } catch (error) {
      showApiError(error);
    } finally {
      setBuying(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop</Text>
        <CoinBadge amount={coin} />
      </View>

      <ScrollView
        style={styles.contentLayer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Frame</Text>
        {user && frames.length === 0 && <Text>ยังไม่มีข้อมูล Frame จากเซิร์ฟเวอร์</Text>}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:12,paddingBottom:16}}>
          {frames.map(frame => (
            <TouchableOpacity key={frame.id} disabled={!user} onPress={()=>setSelectedItem({...frame,type:'frame'})} style={{alignItems:'center'}}>
              <View style={styles.framePreviewArea}>
                <View style={[styles.frameCircle,{borderColor:frame.color}]} />
                <Text style={styles.frameDecoration}>{frame.decoration}</Text>
              </View>
              <Text>{frame.name}</Text>
              <Text>{frame.owned ? 'Owned' : frame.price + ' Coins'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={styles.sectionTitle}>Theme</Text>
        {!user && (
          <Text>ร้านค้าใช้งานได้เมื่อต่ออินเทอร์เน็ตและลงชื่อเข้าใช้</Text>
        )}
        <View style={styles.themeGrid}>
          {themeItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.themeCard}
              onPress={() => setSelectedItem(item)}
              activeOpacity={0.82}
            >
              <View
                style={[styles.themePreview, { backgroundColor: item.color }]}
              />
            </TouchableOpacity>
          ))}
          <View style={styles.moreThemeCard}>
            <Text style={styles.moreArrow}>→</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={selectedItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedItem(null)}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
            {selectedItem?.type === 'frame' ? (
              <View style={styles.modalFrameArea}>
                <View style={[styles.modalFrameCircle,{borderColor:selectedItem.color}]} />
                <Text style={styles.modalDecoration}>{selectedItem.decoration}</Text>
              </View>
            ) : (
              <View style={[styles.modalThemePreview,{backgroundColor:selectedItem?.color}]} />
            )}
            <Text style={styles.modalQuestion}>
              {selectedItem?.owned ? 'Select' : 'Buy'} {selectedItem?.name}?
            </Text>
            <TouchableOpacity
              style={[
                styles.buyButton,
                selectedItem !== null &&
                  !selectedItem.owned &&
                  coin < selectedItem.price &&
                  styles.buyDisabled,
              ]}
              disabled={
                !user || buying ||
                (selectedItem !== null &&
                  !selectedItem.owned &&
                  coin < selectedItem.price)
              }
              onPress={buyItem}
            >
              <Text style={styles.buyText}>
                {buying
                  ? 'Please wait…'
                  : selectedItem?.owned
                  ? 'SELECT'
                  : `${selectedItem?.price} Coins`}
              </Text>
            </TouchableOpacity>
            {selectedItem !== null &&
            !selectedItem.owned &&
            coin < selectedItem.price ? (
              <Text style={styles.errorText}>*Coins is not enough</Text>
            ) : null}
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
  header: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: { flex: 1, fontSize: 26, fontWeight: '800', color: colors.text },
  scrollContent: { paddingHorizontal: 20, paddingTop: 2 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginTop: 10,
    marginBottom: 10,
  },
  framePreviewArea: {
    width: 100,
    height: 112,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  frameCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    backgroundColor: '#fff',
  },
  frameDecoration: { position: 'absolute', top: 0, fontSize: 39, zIndex: 2 },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 2,
    paddingBottom: 16,
  },
  themeCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: radius.sm,
    padding: 3,
    ...cardShadow,
  },
  themePreview: { flex: 1, borderRadius: radius.sm },
  moreThemeCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreArrow: { fontSize: 34, color: colors.textMuted, fontWeight: '400' },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    width: '100%',
    borderRadius: radius.lg,
    backgroundColor: '#ebebeb',
    padding: 24,
    alignItems: 'center',
    ...cardShadow,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 28, color: colors.danger },
  modalFrameArea: {
    width: 120,
    height: 128,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginVertical: 5,
  },
  modalFrameCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    backgroundColor: '#fff',
  },
  modalDecoration: { position: 'absolute', top: -2, fontSize: 48 },
  modalThemePreview: {
    width: 115,
    height: 115,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    marginVertical: 14,
  },
  modalQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  buyButton: {
    minWidth: 170,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ffa800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyDisabled: { opacity: 0.55 },
  buyText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 9,
  },
});
