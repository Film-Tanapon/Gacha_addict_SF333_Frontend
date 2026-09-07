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
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

export default function SignUpScreen({ navigation }: Props) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSignUp = () => {
        const userData = {
            Username: username,
            Email: email,
            Password: password,
        };

        if (password !== confirmPassword) {
            console.log('Password and Confirm Password do not match!');
            return;
        }

        console.log('Sign up payload for Database:', userData);
        // TODO: ใส่โค้ด fetch หรือ axios เพื่อส่ง userData ไปบันทึกในฐานข้อมูลตรงนี้
    };

    const handleGoogleSignUp = () => {
        console.log('Sign up with Google');
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ปุ่มย้อนกลับมุมซ้ายบน */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.backArrow}>‹</Text>
                    </TouchableOpacity>

                    {/* ส่วนหัว: Create Account */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.headingTitle}>Create Account</Text>
                        <Text style={styles.headingSubtitle}>To Join Our GachaAddict</Text>
                    </View>

                    {/* ส่วนฟอร์มกรอกข้อมูล */}
                    <View style={styles.formContainer}>
                        {/* ช่องกรอก Username */}
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            placeholderTextColor="#9ca3af"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        {/* ช่องกรอก Email */}
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

                        {/* ช่องกรอก Password */}
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#9ca3af"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        {/* ช่องกรอก Confirm Password */}
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            placeholderTextColor="#9ca3af"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        {/* ปุ่ม Sign Up */}
                        <TouchableOpacity
                            style={styles.signUpButton}
                            onPress={handleSignUp}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.signUpButtonText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    {/* เส้นคั่น divider or Sign up with */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or Sign up with</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* ปุ่ม Sign up with Google */}
                    <TouchableOpacity
                        style={styles.socialButton}
                        onPress={handleGoogleSignUp}
                        activeOpacity={0.7}
                    >
                        <Image
                            source={require('../assets/google-logo.webp')}
                            style={styles.googleIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
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
        paddingTop: 20,
        paddingBottom: 24,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 10,
        padding: 4,
    },
    backArrow: {
        fontSize: 40,
        fontWeight: '300',
        color: '#000000',
        lineHeight: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 28,
    },
    headingTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 4,
    },
    headingSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '400',
    },
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
    signUpButton: {
        width: 140,
        height: 42,
        backgroundColor: '#d1d5db',
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
        marginBottom: 14,
    },
    signUpButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#4b5563',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
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
    socialButton: {
        padding: 8,
        marginBottom: 20,
    },
    googleIcon: {
        width: 44,
        height: 44,
    },
});