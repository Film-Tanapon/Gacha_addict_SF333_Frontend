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
    StatusBar,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, any>;

export default function SignUpScreen02({ navigation, route }: Props) {
    // รับข้อมูลที่ส่งต่อมาจาก SignUpScreen01
    const { profileImage, frameId } = route.params ?? {};

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');

    const handleContinue = () => {
        if (!username.trim() || !email.trim()) {
            Alert.alert('Notice', 'Please enter both username and email.');
            return;
        }

        // ตรวจสอบรูปแบบ Email เบื้องต้น
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            Alert.alert('Notice', 'Please enter a valid email address.');
            return;
        }

        // ส่งข้อมูลทั้งหมดไปยังหน้า Step 3 (หน้าตั้ง Password & Confirm Password)
        navigation.navigate('SignUpScreen03', {
            profileImage,
            frameId,
            username: username.trim(),
            email: email.trim(),
        });
    };

    const handleGoogleSignUp = () => {
        console.log('Sign up with Google');
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
                    {/* แถบ Progress Bar ตามแบบ Figma (Step 2: 50%) */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressBarWrapper}>
                            {/* รางแถบสีเทาด้านหลัง */}
                            <View style={styles.progressBarTrack}>
                                {/* เส้นสีเขียววิ่งมา 2 ใน 4 (50%) */}
                                <View style={styles.progressBarFill} />
                            </View>

                            {/* จุด Checkmark Step 1 (อยู่ที่ 25%) */}
                            <View style={styles.step1ThumbWrapper}>
                                <View style={styles.stepCheckCircle}>
                                    <Text style={styles.stepCheckmark}>✓</Text>
                                </View>
                            </View>

                            {/* จุด Checkmark Step 2 (อยู่ที่ 50%) พร้อม Tooltip */}
                            <View style={styles.step2ThumbWrapper}>
                                <View style={styles.stepCheckCircle}>
                                    <Text style={styles.stepCheckmark}>✓</Text>
                                </View>

                                {/* ครอบ Tooltip ให้อยู่ Absolute ตรงกลางวงกลมพอดี */}
                                <View style={styles.tooltipAbsoluteContainer}>
                                    <View style={styles.tooltipArrow} />
                                    <View style={styles.tooltipBubble}>
                                        <Text style={styles.tooltipText}>Username{'\n'}and Email</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* ฟอร์มและปุ่มกด */}
                    <View style={styles.formContainer}>
                        {/* การ์ดฟอร์มกรอกข้อมูล Username & Email */}
                        <View style={styles.glassCard}>
                            <View style={styles.inputWrapper}>
                                <Text style={styles.inputLabel}>Username</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Username"
                                    placeholderTextColor="#9ca3af"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={[styles.inputWrapper, { marginBottom: 0 }]}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor="#9ca3af"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        {/* การ์ด Sign Up with Google */}
                        <View style={styles.googleGlassCard}>
                            <Text style={styles.socialHeading}>Sign Up with</Text>
                            <TouchableOpacity
                                style={styles.googleButton}
                                onPress={handleGoogleSignUp}
                                activeOpacity={0.7}
                            >
                                <Image
                                    source={require('../assets/google-logo.webp')}
                                    style={styles.googleIcon}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ปุ่ม Continue to Sign Up สีเขียว */}
                    <View style={styles.footerSection}>
                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={handleContinue}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.continueButtonText}>Continue to Sign Up →</Text>
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

    // --- แถบ Progress Bar ตาม Figma ---
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
        width: '42%', // Step 2 คือ 50% (2 ใน 4 ส่วน)
        height: '100%',
        backgroundColor: '#10E759',
        borderRadius: 999,
    },
    // ตำแหน่งวงกลมจุดที่ 1 (Profile)
    step1ThumbWrapper: {
        position: 'absolute',
        left: '10%',
        transform: [{ translateX: -13 }],
        top: -5,
        alignItems: 'center',
    },
    // ตำแหน่งวงกลมจุดที่ 2 (Username and Email)
    step2ThumbWrapper: {
        position: 'absolute',
        left: '40%',
        transform: [{ translateX: -13 }], // ลบครึ่งหนึ่งของวงกลม 26px เสมอ
        top: -5,
        width: 26, // ล็อคความกว้างให้เท่ากับวงกลมเป๊ะ
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
        fontSize: 9,
        fontWeight: '600',
        color: '#374151',
        textAlign: 'center',
        lineHeight: 12,
    },
    tooltipAbsoluteContainer: {
        position: 'absolute',
        top: 26, // วางต่อท้ายวงกลมลงมาด้านล่าง
        alignItems: 'center',
        width: 120, // ให้พื้นที่ข้อความขยายออก 2 ข้างเท่าๆ กัน
    },

    // --- ส่วนฟอร์มข้อมูล ---
    formContainer: {
        width: '100%',
        marginTop: -32, // ดึงกรอบทั้ง 2 อันขึ้นไปด้านบนนิดหน่อยตามต้องการ
        marginBottom: 24, // รักษาระยะห่างกับปุ่มด้านล่างไว้
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
        marginBottom: 20,
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
    googleGlassCard: {
        width: '100%',
        backgroundColor: 'rgba(235, 238, 242, 0.88)',
        borderRadius: 24,
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.7)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },
    socialHeading: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 10,
        paddingLeft: 4,
    },
    googleButton: {
        alignSelf: 'center',
        padding: 4,
    },
    googleIcon: {
        width: 44,
        height: 44,
    },

    // --- ปุ่มด้านล่าง ---
    footerSection: {
        width: '100%',
        alignItems: 'center',
        marginTop: 16,
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
