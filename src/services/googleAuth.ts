import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from '@react-native-firebase/auth';
import { GOOGLE_WEB_CLIENT_ID } from '../config/firebase';

/**
 * ต้องเรียกครั้งเดียวตอนแอปเริ่มทำงาน (ดูใน App.tsx) ก่อนเรียก signInWithGoogle()
 */
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
}

export type GoogleAuthResult = {
  firebaseUser: FirebaseUser;
  idToken: string;
};

/**
 * เปิดหน้าต่างเลือกบัญชี Google ของเครื่อง -> แลก idToken -> ล็อกอินเข้า Firebase
 * โยน error กลับไปให้ผู้เรียกจัดการ (เช่นแสดง Alert) ยกเว้นกรณีผู้ใช้กดยกเลิกเอง
 * ซึ่งจะ return null แทนเพื่อให้ UI เงียบ ๆ ไม่ต้องโชว์ error
 */
export async function signInWithGoogle(): Promise<GoogleAuthResult | null> {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      // ผู้ใช้กดยกเลิกกล่องเลือกบัญชีเอง ไม่ถือเป็น error
      return null;
    }

    const { idToken } = response.data;
    if (!idToken) {
      throw new Error('ไม่ได้รับ idToken จาก Google Sign-In');
    }

    const credential = GoogleAuthProvider.credential(idToken);
    const auth = getAuth();
    const userCredential = await signInWithCredential(auth, credential);

    // สำคัญ: backend เช็คด้วย Firebase Admin SDK (admin.auth().verifyIdToken)
    // ซึ่งต้องการ "Firebase ID token" ไม่ใช่ Google ID token ดิบที่ได้จาก
    // GoogleSignin.signIn() ด้านบน (คนละตัวกัน อันนั้นเอาไว้แลก credential
    // เข้า Firebase เท่านั้น) จึงต้องขอ Firebase ID token จาก user อีกที
    const firebaseIdToken = await userCredential.user.getIdToken();

    return { firebaseUser: userCredential.user, idToken: firebaseIdToken };
  } catch (error) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          throw new Error('กำลังเข้าสู่ระบบอยู่ กรุณารอสักครู่');
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          throw new Error('อุปกรณ์นี้ไม่รองรับ Google Play Services');
        default:
          throw new Error('เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่');
      }
    }
    throw error;
  }
}

export async function signOutGoogle(): Promise<void> {
  const auth = getAuth();
  await firebaseSignOut(auth);
  try {
    await GoogleSignin.signOut();
  } catch {
    // ไม่ต้องสนใจถ้า sign out ฝั่ง Google ไม่สำเร็จ ตราบใดที่ Firebase sign out แล้ว
  }
}