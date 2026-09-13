import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

type Props = {
  total: number;
  currentIndex: number; // 0-based, step ที่กำลังทำอยู่/เสร็จแล้วรวมด้วย
};

// แถบวงกลม ✓ ด้านบนของ flow "Create an account" (Figma: Username&Email / Password / Success)
export default function StepIndicator({ total, currentIndex }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => {
        const done = index <= currentIndex;
        return (
          <View
            key={index}
            style={[styles.circle, done ? styles.circleDone : styles.circlePending]}
          >
            <Text style={[styles.check, done && styles.checkDone]}>✓</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  circle: {
    width: 29,
    height: 29,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
  },
  circleDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  circlePending: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  check: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textFaint,
  },
  checkDone: {
    color: '#ffffff',
  },
});
