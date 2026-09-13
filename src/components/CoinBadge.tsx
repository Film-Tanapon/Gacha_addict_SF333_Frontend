import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius } from '../theme/theme';

type Props = {
  amount: number;
  onPress?: () => void; // เผื่ออยากกดแล้วพาไปหน้า Theme Shop / เติมเหรียญ
};

// เม็ดเหรียญมุมขวาบน ใช้ซ้ำได้ทุกหน้า (Home, Gacha, Profile, Shop ฯลฯ)
export default function CoinBadge({ amount, onPress }: Props) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper style={styles.badge} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.coinIcon}>
        <Text style={styles.coinIconText}>$</Text>
      </View>
      <Text style={styles.amount}>{amount}</Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  coinIcon: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
