import { Platform } from 'react-native';

/**
 * ที่อยู่ของ backend API
 * - Android Emulator เข้าถึงเครื่อง host ผ่าน 10.0.2.2 ไม่ใช่ localhost
 * - iOS Simulator ใช้ localhost ได้ตรง ๆ
 * - เครื่องจริง (physical device) ต้องเปลี่ยนเป็น IP ของเครื่องที่รัน backend ในวง LAN เดียวกัน
 */
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:3000/api',
  default: 'http://localhost:3000/api',
});
