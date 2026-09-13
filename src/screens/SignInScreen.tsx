import React, { useState } from 'react';
import {
  SafeAreaView,
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
  StatusBar,
  Dimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { signInWithGoogle } from '../services/googleAuth';
import {
  loginWithGoogleIdToken,
  loginWithEmailPassword,
} from '../services/authApi';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SignInScreen({ navigation }: Props) {
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const handleSignIn = async () => {
    if (isEmailLoading) return;

    if (!Email.trim() || !Password.trim()) {
      Alert.alert('Notice', 'Please enter both email and password.');
      return;
    }

    setIsEmailLoading(true);

    try {
      const backendResult = await loginWithEmailPassword(Email.trim(), Password);

      console.log('Backend login success:', backendResult);

      Alert.alert('Success', 'Welcome back!');

      navigation.replace('WelcomeHome', {
        username:
          (backendResult.user?.username as string | undefined) ??
          (backendResult.user?.Username as string | undefined) ??
          Email,
        mode: 'login',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Sign In Failed';

      Alert.alert('Sign In Failed', message);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Navigate to Forgot Password');
  };

  const handleCreateAccount = () => {
    navigation.navigate('SignUpScreen01');
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;

    setIsGoogleLoading(true);

    try {
      const result = await signInWithGoogle();

      if (!result) {
        return;
      }

      const backendResult = await loginWithGoogleIdToken(result.idToken);

      console.log('Backend login success:', backendResult);

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

      Alert.alert('Sign In Failed', message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGuestContinue = () => {
    // นำทางไปยังหน้า Home ในฐานะ Guest Mode
    navigation.replace('Home', {
      username: undefined,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
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

          {/* กรอบกลางแบบ Glassmorphism Card */}
          <View style={styles.glassCard}>
            <Text style={styles.loginHeading}>Login</Text>

            <View style={styles.formContainer}>
              {/* ช่องกรอก Email */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#9ca3af"
                  value={Email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* ช่องกรอก Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9ca3af"
                  value={Password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              {/* ลิงก์ช่วยเหลือ (Forgot & Create Account) */}
              <View style={styles.linksRow}>
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkText}>Forgot your password?</Text>
                </TouchableOpacity>
                <Text style={styles.linkDot}> • </Text>
                <TouchableOpacity
                  onPress={handleCreateAccount}
                  activeOpacity={0.7}
                >
                  <Text style={styles.linkText}>Create your account</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* เส้นคั่น divider or Sign up with */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or Sign up with</Text>
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
          </View>

          {/* ปุ่ม Sign In นอกกรอบ */}
          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
            activeOpacity={0.8}
            disabled={isEmailLoading}
          >
            {isEmailLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* ส่วนล่างสุด: Continue as a guest */}
          <View style={styles.guestContainer}>
            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestContinue}
              activeOpacity={0.7}
            >
              <Text style={styles.guestText}>Continue as a Guest</Text>
              <Text style={styles.guestArrow}>→</Text>
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 0,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: SCREEN_HEIGHT * 0.05,
    paddingBottom: 36,
  },
  brandContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  brandTitleTop: {
    fontSize: 36,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  brandTitleBottom: {
    fontSize: 30,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
    marginLeft: 58,
    marginTop: -8,
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(240, 242, 245, 0.9)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 24,
  },
  loginHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00e65c',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
    paddingLeft: 4,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#9ca3af',
    borderRadius: 24,
    paddingHorizontal: 18,
    fontSize: 14,
    color: '#111827',
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 4,
  },
  linkText: {
    fontSize: 11,
    color: '#9ca3af',
    textDecorationLine: 'underline',
  },
  linkDot: {
    fontSize: 11,
    color: '#9ca3af',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#9ca3af',
  },
  socialButton: {
    padding: 6,
  },
  googleIcon: {
    width: 38,
    height: 38,
  },
  signInButton: {
    width: '60%',
    height: 48,
    backgroundColor: '#00e65c',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#00e65c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  guestContainer: {
    alignSelf: 'center',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9ca3af',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  guestText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    marginRight: 6,
  },
  guestArrow: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
});