import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, spacing, radius, cardShadow } from '../theme/theme';
import PrimaryButton from '../components/PrimaryButton';
import DecorativeBlob from '../components/DecorativeBlob';

// หน้าแสดงผลลัพธ์การสุ่ม (เฟรม "Gacha page-Result" ใน Figma)
type Props = NativeStackScreenProps<RootStackParamList, 'GachaResult'>;

export default function GachaResultScreen({ navigation, route }: Props) {
  const { gachaId, resultElement } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.congrats}>Congratulations !</Text>

        <View style={styles.banner}>
          <Text style={styles.resultEmoji}>🎉</Text>
        </View>

        <Text style={styles.resultLabel}>Result</Text>
        <Text style={styles.resultValue}>{resultElement}</Text>
        <Text style={styles.description}>คุณสุ่มได้ผลลัพธ์นี้จากรายการที่กำหนดไว้</Text>

        <PrimaryButton
          title="Pull Again"
          style={styles.button}
          onPress={() => navigation.replace('GachaDetail', { gachaId })}
        />
        <PrimaryButton
          title="Back to Homepage"
          variant="outline"
          style={styles.button}
          onPress={() => navigation.navigate('Home', {})}
        />
      </View>

      <DecorativeBlob />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  congrats: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: spacing.lg, textAlign: 'center' },
  banner: {
    width: '100%',
    height: 242,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...cardShadow,
  },
  resultEmoji: { fontSize: 72 },
  resultLabel: { fontSize: 15, color: colors.textMuted, marginBottom: 4 },
  resultValue: { fontSize: 32, fontWeight: '800', color: colors.primary, marginBottom: spacing.sm },
  description: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  button: { width: '100%', marginBottom: spacing.md },
});
