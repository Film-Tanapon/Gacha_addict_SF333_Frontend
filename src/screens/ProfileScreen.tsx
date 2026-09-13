import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import BottomTabBar from '../components/BottomTabBar';
import CoinBadge from '../components/CoinBadge';
import DecorativeBlob from '../components/DecorativeBlob';
import { BOTTOM_NAV_HEIGHT, colors } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, any>;

interface MissionItem {
  id: string;
  title: string;
  current: number;
  total: number;
  rewardCoin: number;
  completed: boolean;
  claimed: boolean;
}

export default function ProfileScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  // รับข้อมูลผู้ใช้ (ถ้าไม่มี username ถือว่าเป็น Guest Mode)
  const {
    username,
    profileImage,
    frameColor = '#0080ff',
    frameUrl,
    coin: initialCoin = 20,
  } = (route.params as any) ?? {};

  const isGuest = !username;

  const [coin, setCoin] = useState<number>(initialCoin);
  const [missions, setMissions] = useState<MissionItem[]>([
    {
      id: '1',
      title: 'Log In',
      current: 1,
      total: 1,
      rewardCoin: 1,
      completed: true,
      claimed: true, // ทำสำเร็จแล้ว (มีติ๊กถูกฟ้า)
    },
    {
      id: '2',
      title: 'Gacha',
      current: 1,
      total: 2,
      rewardCoin: 2,
      completed: false,
      claimed: false,
    },
    {
      id: '3',
      title: 'Gacha',
      current: 1,
      total: 10,
      rewardCoin: 3,
      completed: false,
      claimed: false,
    },
  ]);

  // ฟังก์ชันเมื่อกดรับรางวัลของ Mission
  const handleClaimReward = (mission: MissionItem) => {
    if (!mission.completed || mission.claimed) return;

    setCoin((prev) => prev + mission.rewardCoin);
    setMissions((prev) =>
      prev.map((m) => (m.id === mission.id ? { ...m, claimed: true } : m))
    );
    Alert.alert('Success', `You received ${mission.rewardCoin} Coins!`);
  };

  const handleProfilePress = () => {
    if (isGuest) return;
    // นำทางไปหน้าแก้ไข Profile (เมื่อทำหน้า EditProfileScreen แล้วสามารถใส่ navigation.navigate('EditProfile') ได้)
    Alert.alert('Edit Profile', 'Navigate to Edit Profile Screen');
  };

  const handleSignInToUnlock = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignIn' }],
    });
  };

  const handleLogOut = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'SignIn' }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>

      {/* Header Profile Title & Coin Badge */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>

        <CoinBadge amount={coin} onPress={() => navigation.navigate('ThemeShop')} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 34 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* กล่อง Profile Card ด้านบน */}
        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={isGuest ? 1 : 0.8}
          onPress={handleProfilePress}
        >
          <View
            style={[
              styles.avatarContainer,
              { borderColor: isGuest ? '#0080ff' : frameColor },
            ]}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.defaultAvatarIcon}>👤</Text>
            )}

            {/* ถ้ามีกรอบรูปภาพพิเศษจากหลังบ้าน */}
            {frameUrl && (
              <Image
                source={{ uri: frameUrl }}
                style={styles.frameOverlay}
                resizeMode="contain"
              />
            )}
          </View>

          <Text style={styles.usernameText} numberOfLines={1}>
            {isGuest ? 'Guest' : username}
          </Text>
        </TouchableOpacity>

        {/* กล่อง Mission Card */}
        <View style={styles.missionWrapperCard}>
          <View style={styles.missionHeaderRow}>
            <View style={styles.missionTitleGroup}>
              <Text style={styles.missionTitle}>Mission</Text>
              <Text style={styles.trophyIcon}>🏆</Text>
              <Text style={styles.infoIcon}>ⓘ</Text>
            </View>
            <Text style={styles.shopBagIcon}>🛍️</Text>
          </View>
          <Text style={styles.missionSubtitle}>
            ({missions.filter((m) => m.claimed).length}/{missions.length})
          </Text>

          {/* รายการภารกิจ */}
          <View style={styles.missionList}>
            {missions.map((item) => {
              const progressRatio = Math.min(item.current / item.total, 1);
              return (
                <View key={item.id} style={styles.missionItemCard}>
                  <View style={styles.missionLeft}>
                    <Text style={styles.missionItemName}>
                      {item.title} {item.total > 1 ? `(${item.current}/${item.total})` : ''}
                    </Text>

                    {/* Progress Bar หลอดความคืบหน้า */}
                    <View style={styles.missionProgressBarTrack}>
                      <View
                        style={[
                          styles.missionProgressBarFill,
                          { width: `${progressRatio * 100}%` },
                        ]}
                      />
                      {item.completed && (
                        <View style={styles.completeCheckCircle}>
                          <Text style={styles.completeCheckmark}>✓</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* ด้านขวา: เหรียญรางวัล */}
                  <TouchableOpacity
                    style={styles.rewardSection}
                    disabled={isGuest || !item.completed || item.claimed}
                    onPress={() => handleClaimReward(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.goldCoinCircle}>
                      <Text style={styles.goldCoinDollar}>$</Text>
                    </View>
                    <Text style={styles.rewardText}>{item.rewardCoin} Coins</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Overlay Lock สำหรับ Guest Mode */}
          {isGuest && (
            <View style={styles.lockOverlay}>
              <View style={styles.padlockIconWrapper}>
                <Text style={styles.padlockIcon}>🔒</Text>
              </View>

              <TouchableOpacity
                style={styles.unlockButton}
                activeOpacity={0.85}
                onPress={handleSignInToUnlock}
              >
                <Text style={styles.unlockButtonText}>Sign In to Unlock</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ปุ่ม Log Out สำหรับผู้ใช้ที่ล็อกอินแล้ว */}
        {!isGuest && (
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={handleLogOut}
          >
            <Text style={styles.logoutIcon}>➔]</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <DecorativeBlob />

      <BottomTabBar
        active="Profile"
        onNavigate={tab => navigation.replace(tab, { username } as any)}
        onAddPress={() => navigation.navigate('GachaForm', {})}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 110,
  },

  // --- Profile Card ---
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECEFF2',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: 24,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  defaultAvatarIcon: {
    fontSize: 42,
    color: '#4b5563',
  },
  frameOverlay: {
    position: 'absolute',
    width: '110%',
    height: '110%',
  },
  usernameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },

  // --- Mission Card ---
  missionWrapperCard: {
    backgroundColor: 'rgba(236, 239, 242, 0.85)',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  missionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  trophyIcon: {
    fontSize: 18,
  },
  infoIcon: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  shopBagIcon: {
    fontSize: 18,
  },
  missionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 12,
  },
  missionList: {
    gap: 12,
  },
  missionItemCard: {
    backgroundColor: '#DFE3E8',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  missionLeft: {
    flex: 1,
    marginRight: 14,
  },
  missionItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  missionProgressBarTrack: {
    width: '90%',
    height: 12,
    backgroundColor: '#CBD2D9',
    borderRadius: 6,
    position: 'relative',
    justifyContent: 'center',
  },
  missionProgressBarFill: {
    height: '100%',
    backgroundColor: '#56B8FF',
    borderRadius: 6,
  },
  completeCheckCircle: {
    position: 'absolute',
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#38ACFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  completeCheckmark: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  rewardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  goldCoinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EAB308',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#CA8A04',
  },
  goldCoinDollar: {
    color: '#78350F',
    fontSize: 24,
    fontWeight: '900',
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },

  // --- Lock Overlay (Guest Mode) ---
  lockOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(245, 247, 250, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  padlockIconWrapper: {
    marginBottom: 12,
  },
  padlockIcon: {
    fontSize: 70,
  },
  unlockButton: {
    backgroundColor: '#D900FF',
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 20,
    shadowColor: '#D900FF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  unlockButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  // --- Log Out Button ---
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1D5DB',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  logoutIcon: {
    fontSize: 20,
    color: '#111827',
    marginRight: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
});
