import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { BOTTOM_NAV_HEIGHT } from '../theme/theme';

export type TabKey = 'Home' | 'Favorite' | 'History' | 'Profile';

type Props = {
  active: TabKey;
  onNavigate: (tab: TabKey) => void;
  onAddPress: () => void;
};

const TABS: { key: TabKey }[] = [
  { key: 'Home' },
  { key: 'Favorite' },
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
      ) : (
        <View style={styles.iconBox}>
          <NavigationIcon type={tab.key} active={active} />
        </View>
      )}
    </TouchableOpacity>
  );
}

function NavigationIcon({ type, active }: { type: Exclude<TabKey, 'History'>; active: boolean }) {
  const stroke = active ? '#000000' : '#777777';

  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      {type === 'Home' ? (
        <>
          <Path
            d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : type === 'Favorite' ? (
        <Path
          d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
          stroke={stroke}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <Circle cx={12} cy={8} r={5} stroke={stroke} strokeWidth={2} />
          <Path
            d="M20 21a8 8 0 0 0-16 0"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </Svg>
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
  addButton: {
    position: 'absolute',
    bottom: BOTTOM_NAV_HEIGHT - 11,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#36FF4A',
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
