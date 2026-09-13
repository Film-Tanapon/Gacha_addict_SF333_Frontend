import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, cardShadow } from '../theme/theme';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

// การ์ดพื้นฐานสีเทาอ่อน มุมโค้ง มีเงาบาง ใช้เป็นฐานของ GachaCard, การ์ดหมวดหมู่, การ์ด Theme ฯลฯ
export default function AppCard({ children, onPress, style }: Props) {
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    ...cardShadow,
  },
});
