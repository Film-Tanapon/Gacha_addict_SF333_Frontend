import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOTTOM_NAV_HEIGHT, colors } from '../theme/theme';

export type TabKey = 'Home' | 'Favorite' | 'History' | 'Profile';

type Props = {
  active: TabKey;
  onNavigate: (tab: TabKey) => void;
  onAddPress: () => void;
};

const TABS: { key: TabKey; icon?: string }[] = [
  { key: 'Home', icon: '⌂' },
  { key: 'Favorite', icon: '♡' },
  { key: 'History' },
  { key: 'Profile' },
];

export default function BottomTabBar({ active, onNavigate, onAddPress }: Props) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);

  return (
    <View
      style={[styles.wrapper, { height: BOTTOM_NAV_HEIGHT + bottomInset }]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.bar,
          {
            height: BOTTOM_NAV_HEIGHT + bottomInset,
            paddingBottom: bottomInset,
          },
        ]}
      >
        {TABS.slice(0, 2).map(tab => (
          <TabItem key={tab.key} tab={tab} active={active === tab.key} onPress={() => onNavigate(tab.key)} />
        ))}
        <View style={styles.centerSpacer} />
        {TABS.slice(2).map(tab => (
          <TabItem key={tab.key} tab={tab} active={active === tab.key} onPress={() => onNavigate(tab.key)} />
        ))}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.86}
        onPress={onAddPress}
        accessibilityRole="button"
        accessibilityLabel="Create new gacha"
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function TabItem({
  tab,
  active,
  onPress,
}: {
  tab: { key: TabKey; icon?: string };
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
      {tab.key === 'History' ? (
        <View style={[styles.historyIcon, active && styles.iconBorderActive]}>
          <View style={[styles.historyHourHand, active && styles.iconFillActive]} />
          <View style={[styles.historyMinuteHand, active && styles.iconFillActive]} />
        </View>
      ) : tab.key === 'Profile' ? (
        <View style={styles.profileIcon}>
          <View style={[styles.profileHead, active && styles.iconBorderActive]} />
          <View style={[styles.profileBody, active && styles.iconBorderActive]} />
        </View>
      ) : (
        <View style={styles.iconBox}>
          <Text style={[styles.icon, active && styles.iconActive]}>{tab.icon}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    borderBottomWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#6875aa',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 0,
  },
  tabItem: {
    flex: 1,
    height: BOTTOM_NAV_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -10 }],
  },
  centerSpacer: { width: 70 },
  iconBox: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 34, lineHeight: 36, color: '#777777', textAlign: 'center' },
  iconActive: { color: '#000000' },
  iconBorderActive: { borderColor: '#000000' },
  iconFillActive: { backgroundColor: '#000000' },
  historyIcon: {
    width: 29,
    height: 29,
    borderRadius: 15,
    borderWidth: 2.2,
    borderColor: '#777777',
  },
  historyHourHand: {
    position: 'absolute',
    left: 12,
    top: 5,
    width: 2.2,
    height: 9,
    borderRadius: 2,
    backgroundColor: '#777777',
  },
  historyMinuteHand: {
    position: 'absolute',
    left: 13,
    top: 13,
    width: 8,
    height: 2.2,
    borderRadius: 2,
    backgroundColor: '#777777',
    transform: [{ rotate: '25deg' }],
    transformOrigin: 'left center',
  },
  profileIcon: { width: 30, height: 34, alignItems: 'center' },
  profileHead: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2.2,
    borderColor: '#777777',
  },
  profileBody: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 14,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 2.2,
    borderBottomWidth: 0,
    borderColor: '#777777',
  },
  addButton: {
    position: 'absolute',
    bottom: BOTTOM_NAV_HEIGHT - 11,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 9,
  },
  addButtonText: { fontSize: 46, lineHeight: 50, color: '#ffffff', fontWeight: '300' },
});
