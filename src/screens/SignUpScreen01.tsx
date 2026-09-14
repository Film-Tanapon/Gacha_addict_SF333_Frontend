import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, any>;

export interface FrameItem {
  id: string;
  name?: string;
  frameUrl?: string;
  borderColor?: string;
}

export default function SignUpScreen01({ navigation }: Props) {
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [isLoadingFrames, setIsLoadingFrames] = useState<boolean>(true);

  // สมมติ Mock data เริ่มต้นไว้ก่อนเพื่อให้เห็นหน้าตา Frame ชัดเจน
  useEffect(() => {
    fetchFramesFromBackend();
  }, []);

  const fetchFramesFromBackend = async () => {
    try {
      setIsLoadingFrames(true);
      // ตัวอย่าง Mock data ถ้ายังไม่ได้ยิง API
      const mockFrames: FrameItem[] = [
        { id: '1', borderColor: '#d1d5db' },
        { id: '2', borderColor: '#3b82f6' },
        { id: '3', borderColor: '#ec4899' },
        { id: '4', borderColor: '#8b5cf6' },
      ];
      setFrames(mockFrames);
      setSelectedFrameId(mockFrames[0].id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ไม่สามารถดึงข้อมูล Frame ได้';
      Alert.alert('Error', message);
    } finally {
      setIsLoadingFrames(false);
    }
  };

  const selectedFrame = frames.find((f) => f.id === selectedFrameId);

  const handlePickImage = () => {
    console.log('Open image picker');
  };

  const handleContinue = () => {
    navigation.navigate('SignUpScreen02', {
      profileImage: selectedImageUri,
      frameId: selectedFrameId,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <View style={styles.container}>
        {/* แถบสถานะ Progress Bar ตามแบบ Figma */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarWrapper}>
            {/* รางแถบสีเทาด้านหลัง */}
            <View style={styles.progressBarTrack}>
              {/* เส้นสีเขียววิ่งมา 1 ใน 4 (25%) */}
              <View style={styles.progressBarFill} />
            </View>

            {/* จุด Checkmark และ ป้าย Tooltip Profile ที่วิ่งมาหยุดตรง 25% */}
            <View style={styles.stepThumbWrapper}>
              <View style={styles.stepCheckCircle}>
                <Text style={styles.stepCheckmark}>✓</Text>
              </View>
              {/* ติ่งสามเหลี่ยมชี้ขึ้น */}
              <View style={styles.tooltipArrow} />
              {/* กล่องข้อความ Profile */}
              <View style={styles.tooltipBubble}>
                <Text style={styles.tooltipText}>Profile</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ส่วนเนื้อหาตรงกลาง (Avatar + Frame) */}
        <View style={styles.mainContent}>
          {/* ส่วนแสดง Avatar & Preview Frame */}
          <View style={styles.avatarSection}>
            <View
              style={[
                styles.avatarContainer,
                {
                  borderColor: selectedFrame?.borderColor ?? '#0080ff',
                  borderWidth: 3,
                },
              ]}
            >
              {selectedImageUri ? (
                <Image source={{ uri: selectedImageUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}

              {selectedFrame?.frameUrl && (
                <Image
                  source={{ uri: selectedFrame.frameUrl }}
                  style={styles.frameOverlayImage}
                  resizeMode="contain"
                />
              )}

              {/* ปุ่มกล้องถ่ายรูป */}
              <TouchableOpacity
                style={styles.cameraBadge}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                <Text style={styles.cameraIcon}>📷</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* รายการ Frame (ยกตำแหน่งขึ้นมาให้สมดุล) */}
          <View style={styles.frameSection}>
            <Text style={styles.frameHeading}>Frame</Text>

            {isLoadingFrames ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#00e65c" />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.frameList}
              >
                {frames.map((item) => {
                  const isSelected = item.id === selectedFrameId;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.frameCard,
                        isSelected && styles.selectedFrameCard,
                      ]}
                      onPress={() => setSelectedFrameId(item.id)}
                      activeOpacity={0.7}
                    >
                      {item.frameUrl ? (
                        <Image
                          source={{ uri: item.frameUrl }}
                          style={styles.frameThumbnail}
                          resizeMode="contain"
                        />
                      ) : (
                        <View
                          style={[
                            styles.frameInnerPreview,
                            { borderColor: item.borderColor ?? '#d1d5db' },
                          ]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>

        {/* ปุ่ม Continue (ปรับให้ลอยขึ้นมาจากขอบล่าง ไม่จม) */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue to Sign Up →</Text>
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
    // ป้องกันปัญหากล้องหน้าเจาะรูบน Android ทับส่วนหัว
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 40, // เพิ่มระยะจากขอบจอด้านล่าง เพื่อดันปุ่มขึ้นมา
  },
  progressSection: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 28,
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
    backgroundColor: '#E5E7EB', // สีเทาพื้นหลังราง
    borderRadius: 999,
    overflow: 'hidden',
    // เงาตกกระทบให้ดูนูนลอยแบบใน Figma
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressBarFill: {
    width: '15%', // แบ่ง 4 ส่วน -> ส่วนที่ 1 คือ 25%
    height: '100%',
    backgroundColor: '#10E759', // สีเขียวนีออนสดตาม Figma
    borderRadius: 999,
  },
  stepThumbWrapper: {
    position: 'absolute',
    left: '10%', // ยึดปลายของแถบ 25% พอดี
    transform: [{ translateX: -14 }], // ดึงกลับมากึ่งกลางของวงกลม (รัศมี 14px)
    top: -5,
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
  tooltipArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#D1D5DB', // สีเดียวกับพื้นหลังกล่อง tooltip
    marginTop: 2,
  },
  tooltipBubble: {
    backgroundColor: '#D1D5DB',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  tooltipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center', // จัดให้อยู่กึ่งกลางระหว่าง Bar กับ ปุ่มกด
    marginVertical: 10,
  },
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  avatarContainer: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#ffffff',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 95,
    backgroundColor: '#ffffff',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 95,
  },
  frameOverlayImage: {
    position: 'absolute',
    width: '105%',
    height: '105%',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    elevation: 4,
  },
  cameraIcon: {
    fontSize: 16,
    color: '#ffffff',
  },
  frameSection: {
    width: '100%',
    marginTop: 10,
  },
  frameHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    marginLeft: 4,
  },
  loadingContainer: {
    height: 76,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameList: {
    paddingHorizontal: 4,
    paddingBottom: 6,
    gap: 12,
  },
  frameCard: {
    width: 72,
    height: 72,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  selectedFrameCard: {
    borderColor: '#00e65c',
    backgroundColor: '#ffffff',
  },
  frameInnerPreview: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2.5,
    backgroundColor: '#ffffff',
  },
  frameThumbnail: {
    width: 44,
    height: 44,
  },
  footerSection: {
    width: '100%',
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    maxWidth: 320,
    height: 52,
    backgroundColor: '#00e65c',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00e65c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
