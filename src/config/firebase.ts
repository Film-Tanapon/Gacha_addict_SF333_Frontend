/**
 * Firebase / Google Sign-In configuration
 * -----------------------------------------------------------------------
 * 1. ไปที่ Firebase Console -> Project settings -> General
 *    คัดลอกค่า "Web client ID" (มี suffix .apps.googleusercontent.com)
 *    ค่านี้จะปรากฏอัตโนมัติหลังจากเปิดใช้งาน Google เป็น Sign-in provider
 *    ใน Authentication -> Sign-in method -> Google
 *
 *    หรือเปิดไฟล์ android/app/google-services.json แล้วหา object ที่มี
 *    "client_type": 3 แล้วคัดลอกค่า "client_id"
 *
 * 2. ห้าม commit ค่านี้ตรง ๆ ถ้า repo เป็น public — แนะนำให้ย้ายไปไว้ใน
 *    .env (ผ่าน react-native-config หรือ react-native-dotenv) ภายหลัง
 * -----------------------------------------------------------------------
 */
export const GOOGLE_WEB_CLIENT_ID =
  '975534187642-htenp442uc7s632rm87rf31r4k17jgio.apps.googleusercontent.com';
