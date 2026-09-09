import React, { useState } from 'react';
import {
  SafeAreaView, //$$SafeAreaView
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App'; // path ตามจริงของ App.tsx เทียบกับไฟล์นี้
import { signInWithGoogle } from '../services/googleAuth';
import {
  loginWithGoogleIdToken,
  loginWithEmailPassword,
} from '../services/authApi';

// ผูก type ของ navigation prop กับ Stack ที่ประกาศใน App.tsx (route ปัจจุบันคือ "SignIn")
type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  //ส่วนเก็บข้อมูลผู้ใช้
  const [Email, setEmail] = useState(''); //พวก set เป็น function ตั้งชื่อให้ตรงกับ field "Email" ใน table User (backend)
  const [Password, setPassword] = useState(''); //ตั้งชื่อให้ตรงกับ field "Password" ใน table User (backend)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const handleSignIn = async () => {
    if (isEmailLoading) return;

    // 0. เช็คว่ากรอกครบก่อนยิง API
    if (!Email.trim() || !Password.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกอีเมลและรหัสผ่านให้ครบ');
      return;
    }

    setIsEmailLoading(true);

    try {
      // 1. ส่ง Email/Password ไป Backend เพื่อล็อกอินจริง
      const backendResult = await loginWithEmailPassword(Email.trim(), Password);

      console.log('Backend login success:', backendResult);

      // 2. แจ้งผู้ใช้ให้รู้ชัดเจนว่าล็อกอินสำเร็จจริง ก่อนพาไปหน้าถัดไป
      Alert.alert('เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับกลับมา!');

      // 3. เข้าแอปเมื่อ Backend login สำเร็จจริง (ไปหน้า WelcomeHome ก่อนแล้วค่อยต่อ Home)
      navigation.replace('WelcomeHome', {
        username:
          (backendResult.user?.username as string | undefined) ??
          (backendResult.user?.Username as string | undefined) ??
          Email,
        mode: 'login',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ';

      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', message);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Navigate to Forgot Password');
  };

  const handleCreateAccount = () => {
    navigation.navigate('SignUp'); // เชื่อม path จริงตามที่ประกาศไว้ใน App.tsx
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;

    setIsGoogleLoading(true);

    try {
      // 1. Google Sign-In
      const result = await signInWithGoogle();

      if (!result) {
        return;
      }

      // 2. ส่ง Firebase ID Token ไป Backend
      const backendResult = await loginWithGoogleIdToken(result.idToken);

      console.log('Backend login success:', backendResult);

      // 3. เข้าแอปเมื่อ Backend login สำเร็จจริง
      navigation.replace('WelcomeHome', {
        username:
          backendResult.user?.username?.toString() ??
          result.firebaseUser.displayName ??
          result.firebaseUser.email ??
          undefined,
        mode: 'login',
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ';

      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGuestContinue = () => {
    console.log('Continue as guest');
  };

  return (
    //SafeArea เพื่อเว้นระยะขอบบน-ล่าง และกล้อง
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ส่วนหัว: โลโก้ชื่อแอป Gacha Addict */}
          <View style={styles.brandContainer}>
            <Text style={styles.brandTitleTop}>Gacha</Text>
            <Text style={styles.brandTitleBottom}> Addict</Text>
          </View>

          {/* หัวข้อ Login */}
          <Text style={styles.loginHeading}>Login</Text>

          {/* ส่วนฟอร์มกรอกข้อมูล */}
          <View style={styles.formContainer}>
            {/* ช่องกรอก Email */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              value={Email}
              onChangeText={setEmail}
              keyboardType="email-address" //แป้นพิมพ์บนมือถือจะแสดงปุ่ม @ และ .com ขึ้นมาทันที
              autoCapitalize="none" //ปิดการแปลงอักษรตัวแรกเป็นตัวพิมพ์ใหญ่โดยอัตโนมัติ ซึ่งเหมาะกับ Email และ Password
              autoCorrect={false}
            />

            {/* ช่องกรอก Password */}
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              value={Password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {/* ลิงก์ Forgot your password? */}
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Forgot your password?</Text>
            </TouchableOpacity>

            {/* ปุ่ม Sign In */}
            <TouchableOpacity
              style={styles.signInButton}
              onPress={handleSignIn}
              activeOpacity={0.8}
              disabled={isEmailLoading}
            >
              {isEmailLoading ? (
                <ActivityIndicator size="small" color="#4b5563" />
              ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* ลิงก์ Create your account */}
            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={handleCreateAccount}
              activeOpacity={0.7}
            >
              <Text style={styles.createAccountText}>Create your account</Text>
            </TouchableOpacity>
          </View>

          {/* เส้นคั่น divider or Sign in with */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or Sign in with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ปุ่ม Sign in with Google */}
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleGoogleSignIn}
            activeOpacity={0.7}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator
                size="small"
                color="#4b5563"
                style={styles.googleIcon}
              />
            ) : (
              <Image
                source={require('../assets/google-logo.webp')}
                style={styles.googleIcon}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>

          {/* ส่วนล่างสุด: Continue as a guest */}
          <View style={styles.guestContainer}>
            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestContinue}
              activeOpacity={0.7}
            >
              <Text style={styles.guestText}>Continue as a guest</Text>
              <Text style={styles.guestArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingTop: 36,
    paddingBottom: 24,
  },
  // Typography โลโก้แอปที่ตัวหนังสือเยื้องกัน
  brandContainer: {
    alignSelf: 'center',
    marginBottom: 28,
  },
  brandTitleTop: {
    fontSize: 40,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  brandTitleBottom: {
    fontSize: 34,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
    marginLeft: 68,
    marginTop: -8,
  },
  // หัวข้อ Login
  loginHeading: {
    fontSize: 26,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 28,
  },
  // Container ของฟอร์ม
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1.2,
    borderColor: '#6b7280',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
    marginBottom: 14,
    backgroundColor: '#ffffff',
  },
  forgotButton: {
    alignSelf: 'flex-start',
    marginTop: -6,
    marginBottom: 20,
    paddingLeft: 4,
  },
  forgotText: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'underline',
  },
  // ปุ่ม Sign In ทรงรีมน (Capsule shape)
  signInButton: {
    width: 140,
    height: 42,
    backgroundColor: '#d1d5db',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
  },
  createAccountButton: {
    paddingVertical: 4,
  },
  createAccountText: {
    fontSize: 12,
    color: '#6b7280',
    textDecorationLine: 'underline',
  },
  // เส้น Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 28,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#9ca3af',
  },
  // โลโก้ Google
  socialButton: {
    padding: 8,
    marginBottom: 32,
  },
  googleIcon: {
    width: 44,
    height: 44,
  },
  // Continue as a guest อยู่ชิดล่าง
  guestContainer: {
    marginTop: 'auto',
    alignSelf: 'flex-end',
    paddingTop: 20,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
    marginRight: 6,
  },
  guestArrow: {
    fontSize: 22,
    color: '#6b7280',
    fontWeight: '600',
    lineHeight: 24,
  },
});