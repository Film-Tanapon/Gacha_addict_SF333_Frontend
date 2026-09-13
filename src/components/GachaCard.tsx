import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors, radius, cardShadow, absoluteFill } from '../theme/theme';

export type Gacha = {
  id: string;
  name: string;
  bannerUri?: string | null;
  emoji?: string; // ใช้แสดงแทนรูปเวลายังไม่มี banner จริง
  isFavorite?: boolean;
};

type Props = {
  gacha: Gacha;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  width?: number | '100%';
  height?: number;
};

// การ์ดตัวแทน Gacha หนึ่งรายการ ใช้ซ้ำใน Home (Custom/Yes-No/Food + carousel), Favorite, Custom Gacha list
export default function GachaCard({ gacha, onPress, onToggleFavorite, width = 167, height = 210 }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, { width, height }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {gacha.bannerUri ? (
        <Image source={{ uri: gacha.bannerUri }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>{gacha.emoji ?? '🎴'}</Text>
        </View>
      )}

      <Text style={styles.name} numberOfLines={2}>
        {gacha.name}
      </Text>

      {onToggleFavorite ? (
        <TouchableOpacity
          style={styles.heartButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onToggleFavorite}
        >
          <Text style={[styles.heart, gacha.isFavorite && styles.heartActive]}>
            {gacha.isFavorite ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    ...cardShadow,
  },
  image: {
    ...absoluteFill,
    borderRadius: radius.md,
  },
  placeholder: {
    ...absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  heart: {
    fontSize: 20,
    color: '#ffffff',
  },
  heartActive: {
    color: '#ef4444',
  },
});
