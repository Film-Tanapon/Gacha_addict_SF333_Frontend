import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, spacing, radius, cardShadow, absoluteFill } from '../theme/theme';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import DecorativeBlob from '../components/DecorativeBlob';
import { getGachaById, upsertGacha, createId, RandomListItem } from '../data/mockStore';

// หน้าฟอร์มสร้าง/แก้ไข Gacha: ชื่อ, Banner, และ Random List (Element + Rate)
type Props = NativeStackScreenProps<RootStackParamList, 'GachaForm'>;

export default function GachaFormScreen({ navigation, route }: Props) {
  const editingGacha = route.params?.gachaId ? getGachaById(route.params.gachaId) : null;

  const [name, setName] = useState(editingGacha?.name ?? '');
  const [bannerUri, setBannerUri] = useState<string | null>(editingGacha?.bannerUri ?? null);
  const [randomList, setRandomList] = useState<RandomListItem[]>(
    editingGacha?.randomList ?? [
      { id: createId('r'), element: '', rate: '' },
      { id: createId('r'), element: '', rate: '' },
    ],
  );

  // TODO: เชื่อมกับ library เลือกรูปจริง เช่น react-native-image-picker
  // ตอนนี้ยังไม่ได้ติดตั้งไลบรารีดังกล่าวในโปรเจกต์ จึงจำลองด้วยรูปตัวอย่างไปก่อน
  // เมื่อพร้อมใช้งานจริง ให้แทนที่เนื้อหาในฟังก์ชันนี้ด้วยการเรียก launchImageLibrary() แล้ว setBannerUri(asset.uri)
  const handlePickImage = () => {
    Alert.alert(
      'เลือกรูปจากเครื่อง',
      'ฟีเจอร์นี้ต้องติดตั้งไลบรารีเลือกรูป เช่น react-native-image-picker จึงจะเลือกรูปจริงจากเครื่องได้ ตอนนี้ขอใส่รูปตัวอย่างแทนไปก่อน',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ใช้รูปตัวอย่าง',
          onPress: () => setBannerUri(`https://picsum.photos/seed/${createId('banner')}/400/300`),
        },
      ],
    );
  };

  const handleAddRow = () => {
    setRandomList(prev => [...prev, { id: createId('r'), element: '', rate: '' }]);
  };

  const handleRemoveRow = (id: string) => {
    setRandomList(prev => (prev.length <= 1 ? prev : prev.filter(item => item.id !== id)));
  };

  const handleChangeRow = (id: string, field: 'element' | 'rate', value: string) => {
    setRandomList(prev => prev.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณาตั้งชื่อ Gacha');
      return;
    }

    const cleanedList = randomList.filter(item => item.element.trim().length > 0);
    if (cleanedList.length === 0) {
      Alert.alert('แจ้งเตือน', 'กรุณาเพิ่มรายการสุ่มอย่างน้อย 1 รายการ');
      return;
    }

    const saved = upsertGacha({
      id: editingGacha?.id ?? createId('g'),
      name: name.trim(),
      category: 'Custom',
      bannerUri,
      emoji: editingGacha?.emoji ?? '🎴',
      pullOneCost: editingGacha?.pullOneCost ?? 1,
      pullManyCount: editingGacha?.pullManyCount ?? 5,
      pullManyCost: editingGacha?.pullManyCost ?? 4,
      randomList: cleanedList,
      isFavorite: editingGacha?.isFavorite ?? false,
    });

    navigation.replace('GachaDetail', { gachaId: saved.id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{editingGacha ? 'Edit Gacha' : 'Create Custom Gacha'}</Text>
          <View style={styles.topBarSpacer} />
        </View>

        {/* Banner picker */}
        <TouchableOpacity style={styles.bannerPicker} onPress={handlePickImage} activeOpacity={0.8}>
          {bannerUri ? (
            <Image source={{ uri: bannerUri }} style={styles.bannerImage} resizeMode="cover" />
          ) : (
            <>
              <Text style={styles.cameraEmoji}>📷</Text>
              <Text style={styles.bannerHint}>เลือกรูปจากเครื่อง</Text>
            </>
          )}
        </TouchableOpacity>

        <FormInput label="Gacha Name" placeholder="Gacha Name" value={name} onChangeText={setName} />

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Random List</Text>
          <TouchableOpacity onPress={handleAddRow}>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {randomList.map((item, index) => (
          <View key={item.id} style={styles.row}>
            <FormInput
              placeholder={`Element ${index + 1}`}
              value={item.element}
              onChangeText={v => handleChangeRow(item.id, 'element', v)}
              style={styles.rowInputElement}
            />
            <FormInput
              placeholder="Rate"
              value={item.rate}
              onChangeText={v => handleChangeRow(item.id, 'rate', v)}
              style={styles.rowInputRate}
            />
            <TouchableOpacity onPress={() => handleRemoveRow(item.id)} style={styles.removeButton}>
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <PrimaryButton title="Save" onPress={handleSave} style={styles.saveButton} />
      </ScrollView>

      <DecorativeBlob />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  backArrow: { fontSize: 32, color: colors.text, fontWeight: '300' },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  topBarSpacer: { width: 24 },
  bannerPicker: {
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...cardShadow,
  },
  bannerImage: { ...absoluteFill },
  cameraEmoji: { fontSize: 32, marginBottom: 6 },
  bannerHint: { fontSize: 13, color: colors.textMuted },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  listTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  addLink: { fontSize: 14, fontWeight: '700', color: colors.primary },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  rowInputElement: { flex: 2 },
  rowInputRate: { flex: 1 },
  removeButton: { height: 48, justifyContent: 'center', paddingHorizontal: 4 },
  removeText: { fontSize: 16, color: colors.danger },
  saveButton: { alignSelf: 'center', marginTop: spacing.lg, width: '60%' },
});
