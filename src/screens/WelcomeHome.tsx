import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'WelcomeHome'>;

export default function WelcomeHome({ navigation, route }: Props) {
    // รับ username ที่ส่งมาจาก SignIn/SignUpScreen (ถ้ามี)
    const username = route.params?.username ?? 'User';
    // โหมด 'login' มาจากหน้า SignIn (ล็อกอินสำเร็จจริง), ถ้าไม่ระบุถือว่ามาจาก SignUp
    const mode = route.params?.mode ?? 'signup';
    const isLogin = mode === 'login';

    useEffect(() => {
        // ตั้งเวลา 2.5 วินาที แล้วพาไปหน้า Home อัตโนมัติ
        const timer = setTimeout(() => {
            navigation.replace('Home');
        }, 2500);

        // คืนค่าฟังก์ชันเพื่อเคลียร์ Timer กรณีที่ Component ถูก unmount ก่อนเวลา
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.badge}>
                {isLogin ? '✅ เข้าสู่ระบบสำเร็จ!' : '🎉 Account Created!'}
            </Text>
            <Text style={styles.title}>
                {isLogin ? 'ยินดีต้อนรับกลับมา' : 'ยินดีต้อนรับสู่ GachaAddict'}
            </Text>
            <Text style={styles.usernameText}>คุณ {username}</Text>
            
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4b5563" />
                <Text style={styles.subtitle}>กำลังพาคุณเข้าสู่หน้าหลัก...</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    badge: {
        fontSize: 16,
        color: '#10b981',
        fontWeight: '600',
        marginBottom: 12,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
        textAlign: 'center',
    },
    usernameText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#3b82f6',
        marginBottom: 28,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 12,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
});