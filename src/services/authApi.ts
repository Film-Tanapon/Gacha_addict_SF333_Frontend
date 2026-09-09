import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

const TOKEN_KEY = 'auth_token';

export type BackendAuthResponse = {
  token: string;
  user?: Record<string, unknown>;
};

/**
 * ส่ง Firebase ID token ของ Google ไปให้ backend ตรวจสอบ แล้วแลกเป็น token ของแอปเอง
 *
 * NOTE: ตาม route ที่มีอยู่ตอนนี้ (auth.routes.js) เห็นแค่
 *   POST /api/auth/register  และ  POST /api/auth/login  (แบบ email/password)
 * ฝั่ง backend ต้องเพิ่มการรองรับ "Google idToken" ใน endpoint เดียวกัน
 * (เช่นเช็คว่า body มี idToken มาแทน Email/Password แล้วเรียก
 * Firebase Admin SDK -> admin.auth().verifyIdToken(idToken) เพื่อยืนยันตัวตน
 * จากนั้นค้นหา/สร้าง user ในฐานข้อมูลแล้วออก token ของแอปกลับมาเหมือน login ปกติ)
 * ถ้ายังไม่มี endpoint รองรับ ให้ปรับ path ด้านล่างตามที่ backend จริงกำหนด
 */
export async function loginWithGoogleIdToken(
  idToken: string,
): Promise<BackendAuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idToken,
    }),
  });

  if (!res.ok) {
    const message = await res.text().catch(() => '');

    throw new Error(
      `Backend ปฏิเสธการล็อกอิน (status ${res.status}) ${message}`.trim(),
    );
  }

  const data: BackendAuthResponse = await res.json();

  if (!data.token) {
    throw new Error('Backend ไม่ได้ส่ง token กลับมา');
  }

  await AsyncStorage.setItem(TOKEN_KEY, data.token);

  return data;
}

/**
 * ล็อกอินด้วย Email/Password ปกติ ผ่าน endpoint POST /api/auth/login
 * (ตรงกับ route ที่มีอยู่แล้วฝั่ง backend: auth.routes.js)
 */
export async function loginWithEmailPassword(
  email: string,
  password: string,
): Promise<BackendAuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!res.ok) {
    const message = await res.text().catch(() => '');

    throw new Error(
      `อีเมลหรือรหัสผ่านไม่ถูกต้อง (status ${res.status}) ${message}`.trim(),
    );
  }

  const data: BackendAuthResponse = await res.json();

  if (!data.token) {
    throw new Error('Backend ไม่ได้ส่ง token กลับมา');
  }

  await AsyncStorage.setItem(TOKEN_KEY, data.token);

  return data;
}

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearStoredToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}