import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, any>;

export default function SignUpScreen03({ navigation, route }: Props) {
    // รับข้อมูลสะสมจาก Step 1 และ Step 2
    const { profileImage, frameId, username, email } = route.params ?? {};

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        if (isLoading) return;

        if (!password.trim() || !confirmPassword.trim()) {
            Alert.alert('Notice', 'Please fill in both password fields.');
            return;
        }

        // ตรวจสอบความปลอดภัยของรหัสผ่าน (A-Z, a-z, 0-9)
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            Alert.alert(
                'Notice',
                'Password must contain at least one uppercase letter, one lowercase letter, and one number.'
            );
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Notice', 'Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                username,
                email,
                password,
                frameId,
                profileImage,
            };

            console.log('Final Sign Up Payload for Backend:', payload);

            // TODO: เรียกใช้ API สมัครสมาชิกของ Backend ที่นี่
            // const res = await registerUser(payload);

            // เมื่อสมัครสำเร็จ นำทางไปยัง Step 4 (Success Screen)
            navigation.replace('SignUpScreen04', {
                username,
                profileImage,
                frameId,
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Registration failed.';
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
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
                    {/* แถบ Progress Bar ตามแบบ Figma (Step 3: 75%) */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressBarWrapper}>
                            {/* รางแถบสีเทาด้านหลัง */}
                            <View style={styles.progressBarTrack}>
                                {/* เส้นสีเขียววิ่งมา 3 ใน 4 (75%) */}
                                <View style={styles.progressBarFill} />
                            </View>

                            {/* จุด Checkmark Step 1 (อยู่ที่ 25%) */}
                            <View style={styles.step1ThumbWrapper}>
                                <View style={styles.stepCheckCircle}>
                                    <Text style={styles.stepCheckmark}>✓</Text>
                                </View>
                            </View>

                            {/* จุด Checkmark Step 2 (อยู่ที่ 50%) */}
                            <View style={styles.step2ThumbWrapper}>
                                <View style={styles.stepCheckCircle}>
                                    <Text style={styles.stepCheckmark}>✓</Text>
                                </View>
                            </View>

                            {/* จุด Checkmark Step 3 (อยู่ที่ 75%) พร้อม Tooltip Password */}
                            <View style={styles.step3ThumbWrapper}>
                                <View style={styles.stepCheckCircle}>
                                    <Text style={styles.stepCheckmark}>✓</Text>
                                </View>
                                <View style={styles.tooltipAbsoluteContainer}>
                                    <View style={styles.tooltipArrow} />
                                    <View style={styles.tooltipBubble}>
                                        <Text style={styles.tooltipText}>Password</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* ฟอร์มกรอก Password & Confirm Password จัดระดับเดียวกับ Step 2 */}
                    <View style={styles.formContainer}>
                        <View style={styles.glassCard}>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="#9ca3af"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={[styles.inputWrapper, { marginBottom: 0 }]}>
                                <Text style={styles.inputLabel}>Confirm Password</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    placeholderTextColor="#9ca3af"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>
                    </View>

                    {/* ปุ่ม Sign Up */}
                    <View style={styles.footerSection}>
                        <TouchableOpacity
                            style={styles.signUpButton}
                            onPress={handleSignUp}
                            activeOpacity={0.85}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text style={styles.signUpButtonText}>Sign Up</Text>
                            )}
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
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingBottom: 40,
    },

    // --- แถบ Progress Bar แบบเดียวกับ SignUpScreen02 ---
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
        width: '68%', // Step 3 คือ 75% (3 ใน 4 ส่วน)
        height: '100%',
        backgroundColor: '#10E759',
        borderRadius: 999,
    },
    step1ThumbWrapper: {
        position: 'absolute',
        left: '10%',
        transform: [{ translateX: -13 }],
        top: -5,
        alignItems: 'center',
    },
    step2ThumbWrapper: {
        position: 'absolute',
        left: '40%',
        transform: [{ translateX: -13 }],
        top: -5,
        alignItems: 'center',
    },
    step3ThumbWrapper: {
        position: 'absolute',
        left: '70%',
        transform: [{ translateX: -13 }],
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
        borderBottomColor: '#D1D5DB',
        marginTop: 2,
    },
    tooltipBubble: {
        backgroundColor: '#D1D5DB',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        alignItems: 'center',
    },
    tooltipText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
    },
    tooltipAbsoluteContainer: {
        position: 'absolute',
        top: 26,
        alignItems: 'center',
        width: 120,
    },

    // --- ส่วนฟอร์มข้อมูล (ปรับยกขึ้นให้ตรงกับ Step 2) ---
    formContainer: {
        width: '100%',
        marginTop: -32, // ดึงระดับขึ้นมาเท่ากับหน้า Step 2
        marginBottom: 24,
    },
    glassCard: {
        width: '100%',
        backgroundColor: 'rgba(235, 238, 242, 0.88)',
        borderRadius: 24,
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.7)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    inputWrapper: {
        width: '100%',
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
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
        fontSize: 15,
        color: '#111827',
    },

    // --- ส่วนปุ่ม Sign Up ด้านล่าง ---
    footerSection: {
        width: '100%',
        alignItems: 'center',
    },
    signUpButton: {
        width: 140,
        height: 48,
        backgroundColor: '#00e65c',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#00e65c',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
    },
    signUpButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
});
