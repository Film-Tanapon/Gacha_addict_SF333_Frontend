import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Switch,
    ScrollView,
    Dimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.78;

export default function HomeScreen({ navigation, route }: Props) {
    // รับ username ที่ส่งต่อมาจาก WelcomeHome (ถ้าไม่มีให้เป็น null หรือ undefined)
    const username = (route.params as any)?.username || null;
    const isGuest = !username;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);

    const handleLoginPress = () => {
        setIsMenuOpen(false);
        navigation.navigate('SignIn');
    };

    const handleLogoutPress = () => {
        setIsMenuOpen(false);
        // เคลียร์ Param หรือ Reset กลับไปหน้า SignIn
        navigation.reset({
            index: 0,
            routes: [{ name: 'SignIn' }],
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header / แถบเมนูด้านบน */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={toggleMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={styles.hamburgerIcon}>☰</Text>
                </TouchableOpacity>
            </View>

            {/* เนื้อหาหน้า Home */}
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.greetingContainer}>
                    <Text style={styles.greetingTitle}>Hello!</Text>
                    <Text style={styles.greetingSubtitle}>To Our Gacha Addict!</Text>
                </View>

                <Text style={styles.sectionTitle}>Recommended</Text>

                {/* การ์ด Recommended ตัวอย่าง */}
                <View style={styles.cardRow}>
                    <View style={styles.cardPlaceholder} />
                    <View style={styles.cardPlaceholder} />
                </View>
                <View style={styles.cardRow}>
                    <View style={styles.cardPlaceholder} />
                </View>
            </ScrollView>

            {/* วงกลมตกแต่งมุมซ้ายล่าง */}
            <View style={styles.decorativeCircle} />

            {/* ปุ่มบวกสีเขียว Floating Button */}
            <TouchableOpacity style={styles.floatingButton} activeOpacity={0.8}>
                <Text style={styles.floatingButtonText}>+</Text>
            </TouchableOpacity>

            {/* Side Drawer Modal */}
            <Modal
                visible={isMenuOpen}
                transparent
                animationType="fade"
                onRequestClose={toggleMenu}
            >
                <View style={styles.modalOverlay}>
                    {/* พื้นที่โปร่งแสงสำหรับกดปิด Drawer */}
                    <TouchableOpacity
                        style={styles.backdropTouch}
                        activeOpacity={1}
                        onPress={toggleMenu}
                    />

                    {/* กล่องเมนูด้านข้าง (Drawer Content) */}
                    <View style={styles.drawerContainer}>
                        {/* Profile Header */}
                        <View style={styles.drawerProfileHeader}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarIcon}>👤</Text>
                            </View>
                            <Text style={styles.profileName} numberOfLines={1}>
                                {isGuest ? 'Guest Mode' : username}
                            </Text>
                        </View>

                        {/* เมนูหลักส่วนบน */}
                        <View style={styles.drawerBody}>
                            {/* แสดงปุ่ม Login เฉพาะ Guest Mode */}
                            {isGuest && (
                                <TouchableOpacity style={styles.menuItem} onPress={handleLoginPress}>
                                    <Text style={styles.menuIcon}>➔]</Text>
                                    <Text style={styles.menuText}>Login</Text>
                                </TouchableOpacity>
                            )}

                            {/* History */}
                            <TouchableOpacity style={styles.menuItem}>
                                <Text style={styles.menuIcon}>🕒</Text>
                                <Text style={styles.menuText}>History</Text>
                            </TouchableOpacity>

                            {/* Dark Mode Toggle */}
                            <View style={[styles.menuItem, styles.switchRow]}>
                                <View style={styles.menuLeft}>
                                    <Text style={styles.menuIcon}>🌙</Text>
                                    <Text style={styles.menuText}>Dark Mode</Text>
                                </View>
                                <Switch
                                    value={isDarkMode}
                                    onValueChange={setIsDarkMode}
                                    trackColor={{ false: '#d1d5db', true: '#111827' }}
                                    thumbColor={isDarkMode ? '#ffffff' : '#111827'}
                                />
                            </View>
                        </View>

                        {/* เมนูส่วนล่าง */}
                        <View style={styles.drawerFooter}>
                            {/* Help Center */}
                            <TouchableOpacity style={styles.menuItem}>
                                <Text style={styles.menuIcon}>ⓘ</Text>
                                <Text style={styles.menuText}>Help Center</Text>
                            </TouchableOpacity>

                            {/* Clear All Data */}
                            <TouchableOpacity style={styles.menuItem}>
                                <Text style={[styles.menuIcon, styles.dangerText]}>🧹</Text>
                                <Text style={[styles.menuText, styles.dangerText]}>Clear All Data</Text>
                            </TouchableOpacity>

                            {/* แสดงปุ่ม Log out เฉพาะเมื่อล็อกอินแล้ว */}
                            {!isGuest && (
                                <View style={styles.logoutWrapper}>
                                    <TouchableOpacity style={styles.menuItem} onPress={handleLogoutPress}>
                                        <Text style={styles.menuIcon}>➔]</Text>
                                        <Text style={styles.menuText}>Log out</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    topBar: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 4,
    },
    hamburgerIcon: {
        fontSize: 26,
        color: '#111827',
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 80,
    },
    greetingContainer: {
        marginBottom: 20,
    },
    greetingTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#111827',
        marginBottom: 4,
    },
    greetingSubtitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 16,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between', // กระจายซ้าย-ขวาให้เต็มพื้นที่
        gap: 20,                         // ระยะห่างระหว่างการ์ดสองใบ
        marginBottom: 20,
    },
    cardPlaceholder: {
        flex: 1,                         // ขยายขนาดให้เต็มสัดส่วนซ้าย-ขวาเท่ากัน
        aspectRatio: 0.82,               // สัดส่วนความกว้างต่อความสูงตามแบบใน Figma (หรือตั้ง height: 180)
        backgroundColor: '#d1d5db',
        borderRadius: 22,                // ขอบโค้งมนตามแบบ

        // ใส่เงาเบาๆ ตามตัวอย่างใน Figma
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
    },
    cardPlaceholderSingle: {
        flex: 0,
        width: '47.5%',                  // ให้กว้างเท่ากับใบเดี่ยว ไม่ยืดเต็มหน้าจอ
        aspectRatio: 0.82,
        backgroundColor: '#d1d5db',
        borderRadius: 22,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
    },
    decorativeCircle: {
        position: 'absolute',
        bottom: -60,
        left: -60,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#93c5fd',
        opacity: 0.8,
        zIndex: -1,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#22c55e',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    floatingButtonText: {
        fontSize: 32,
        color: '#ffffff',
        lineHeight: 34,
        fontWeight: '400',
    },

    // Drawer Styles
    modalOverlay: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    backdropTouch: {
        flex: 1,
    },
    drawerContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: DRAWER_WIDTH,
        backgroundColor: '#ffffff',
        paddingVertical: 20,
        display: 'flex',
        flexDirection: 'column',
    },
    drawerProfileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: '#9ca3af',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    avatarIcon: {
        fontSize: 22,
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
    },
    drawerBody: {
        flex: 1,
        paddingTop: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    switchRow: {
        justifyContent: 'space-between',
    },
    menuIcon: {
        fontSize: 18,
        width: 30,
        color: '#111827',
    },
    menuText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    drawerFooter: {
        paddingBottom: 8,
    },
    dangerText: {
        color: '#ef4444',
        fontWeight: '700',
    },
    logoutWrapper: {
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        marginTop: 8,
        paddingTop: 4,
    },
});