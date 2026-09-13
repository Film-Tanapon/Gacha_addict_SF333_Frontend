import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/theme';

// Decorative purple ellipse matching the lower-left graphic in the Figma home screen.
export default function DecorativeBlob() {
  return <View style={styles.blob} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    left: -265,
    bottom: -194,
    width: 471,
    height: 430,
    borderRadius: 235,
    backgroundColor: colors.decorativePurple,
    opacity: 0.52,
    zIndex: 0,
  },
});
