import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpScreen04'>;

export default function SignUpScreen04({ navigation, route }: Props) {
  const { username = 'Username', profileImage } = route?.params ?? {};

  const handleGoToGacha = () => {
    // ล้าง Stack การสมัครสมาชิกออก แล้วเข้าสู่หน้า Home
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Home',
          params: { username },
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />

      <View style={styles.screenContainer}>
        {/* แถบ Progress Bar ด้านบน */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarTrack}>
              <View style={styles.progressBarFill} />
            </View>

            {/* Step 1 */}
            <View style={styles.step1ThumbWrapper}>
              <View style={styles.stepCheckCircle}>
                <Text style={styles.stepCheckmark}>✓</Text>
              </View>
            </View>

            {/* Step 2 */}
            <View style={styles.step2ThumbWrapper}>
              <View style={styles.stepCheckCircle}>
                <Text style={styles.stepCheckmark}>✓</Text>
              </View>
            </View>

            {/* Step 3 */}
            <View style={styles.step3ThumbWrapper}>
              <View style={styles.stepCheckCircle}>
                <Text style={styles.stepCheckmark}>✓</Text>
              </View>
            </View>

            {/* Step 4 */}
            <View style={styles.step4ThumbWrapper}>
              <View style={styles.stepCheckCircle}>
                <Text style={styles.stepCheckmark}>✓</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ส่วน Success และ Profile Card */}
        <View style={styles.contentContainer}>
          <Text style={styles.successTitle}>Success !</Text>

          <View style={styles.cardContainer}>
            <View style={styles.glassCard}>
              <View style={styles.avatarBorder}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder} />
                )}
              </View>

              <Text style={styles.usernameText}>{username}</Text>
            </View>
          </View>
        </View>

        {/* ปุ่ม Go to Gacha */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            style={styles.gachaButton}
            onPress={handleGoToGacha}
            activeOpacity={0.85}
          >
            <Text style={styles.gachaButtonText}>Go to Gacha →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 0,
  },
  screenContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },

  // --- แถบ Progress Bar ---
  progressSection: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 36,
  },
  progressBarWrapper: {
    width: '92%',
    height: 18,
    position: 'relative',
    justifyContent: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#10E759',
    borderRadius: 999,
  },
  step1ThumbWrapper: {
    position: 'absolute',
    left: '10%',
    transform: [{ translateX: -13 }],
    top: -5,
    width: 26,
    alignItems: 'center',
  },
  step2ThumbWrapper: {
    position: 'absolute',
    left: '40%',
    transform: [{ translateX: -13 }],
    top: -5,
    width: 26,
    alignItems: 'center',
  },
  step3ThumbWrapper: {
    position: 'absolute',
    left: '70%',
    transform: [{ translateX: -13 }],
    top: -5,
    width: 26,
    alignItems: 'center',
  },
  step4ThumbWrapper: {
    position: 'absolute',
    left: '100%',
    transform: [{ translateX: -13 }],
    top: -5,
    width: 26,
    alignItems: 'center',
  },
  stepCheckCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#10E759',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#ffffff',
    shadowColor: '#10E759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  stepCheckmark: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 15,
  },

  // --- Content Layout ---
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '-5%',
  },
  successTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#00D856',
    marginBottom: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 216, 86, 0.25)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  cardContainer: {
    width: '100%',
    position: 'relative',
  },
  glassCard: {
    width: '100%',
    backgroundColor: '#EBEFF2',
    borderRadius: 28,
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  avatarBorder: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 4,
    borderColor: '#0288F4',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  usernameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginTop: 26,
  },

  // --- ปุ่มล่าง ---
  footerSection: {
    width: '100%',
    alignItems: 'center',
  },
  gachaButton: {
    backgroundColor: '#1AE45D',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 999,
    shadowColor: '#1AE45D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  gachaButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
