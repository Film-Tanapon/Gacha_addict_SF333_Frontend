import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import BottomTabBar from '../components/BottomTabBar';
import DecorativeBlob from '../components/DecorativeBlob';
import { BOTTOM_NAV_HEIGHT, cardShadow, colors, radius } from '../theme/theme';
import { getGachaById } from '../data/mockStore';

type Props = NativeStackScreenProps<RootStackParamList, 'GachaResult'>;
const RESULT_ART = 'https://www.figma.com/api/mcp/asset/a47a4121-f6e3-4557-92b5-073db75bd734.png';
const RESULT_BACKGROUND = '#eeeeee';

export default function GachaResultScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const gacha = getGachaById(route.params.gachaId);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.contentLayer}
        contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 34 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.congratulations}>Congratulations !</Text>
            <TouchableOpacity style={styles.shareButton} onPress={() => Alert.alert('Share', `You got ${route.params.resultElements.join(', ')}!`)}>
              <Text style={styles.shareIcon}>⌯</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.resultsList}>
            {route.params.resultElements.map((result, index) => (
              <View key={`${result}-${index}`} style={styles.resultItem}>
                <View style={styles.resultImageWrap}>
                  <Image source={{ uri: gacha?.bannerUri || RESULT_ART }} style={styles.image} resizeMode="cover" />
                </View>
                <View style={styles.resultCopy}>
                  <Text style={styles.resultNumber}>Result {index + 1}</Text>
                  <Text style={styles.resultName}>{result}</Text>
                  <Text style={styles.description}>You got {result} from {gacha?.name ?? 'Gacha'}.</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.replace('GachaPull', { gachaId: route.params.gachaId, pullCount: route.params.resultElements.length })}>
          <Text style={styles.primaryText}>Pull Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.popTo('Home')}>
          <Text style={styles.secondaryText}>Back to Homepage</Text>
        </TouchableOpacity>
      </ScrollView>

      <DecorativeBlob />
      <BottomTabBar
        active="Home"
        onNavigate={tab => navigation.replace(tab as any)}
        onAddPress={() => navigation.navigate('CreateCustom', {})}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  contentLayer: { zIndex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 42, alignItems: 'center' },
  resultCard: {
    width: '100%',
    backgroundColor: RESULT_BACKGROUND,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
  },
  resultHeader: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  congratulations: { fontSize: 24, fontWeight: '800', color: '#00d64f', textAlign: 'center' },
  shareButton: { position: 'absolute', right: 0, top: 0, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  shareIcon: { fontSize: 28, color: colors.text, transform: [{ rotate: '-35deg' }] },
  resultsList: { width: '100%', gap: 10, marginTop: 8 },
  resultItem: { width: '100%', minHeight: 112, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.sm, padding: 9, ...cardShadow },
  resultImageWrap: { width: 94, height: 94, backgroundColor: '#fff', borderRadius: radius.sm, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  resultCopy: { flex: 1, paddingHorizontal: 14, paddingVertical: 4 },
  resultNumber: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  resultName: { marginTop: 3, fontSize: 22, fontWeight: '900', color: colors.text },
  description: { marginTop: 5, fontSize: 12, lineHeight: 17, color: colors.textMuted },
  primaryButton: { width: '62%', height: 48, borderRadius: radius.pill, backgroundColor: '#43c6f2', alignItems: 'center', justifyContent: 'center', marginTop: 32 },
  primaryText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  secondaryButton: { minWidth: '62%', height: 44, paddingHorizontal: 20, borderRadius: radius.pill, backgroundColor: '#3bb9f4', alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  secondaryText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
