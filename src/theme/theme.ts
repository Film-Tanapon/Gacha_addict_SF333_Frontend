// ===== Design tokens อ้างอิงจาก Figma "สุ่มทุกอย่าง 20" =====
// รวมสี / ระยะเว้นวรรค / ความโค้งมุม / เงา ไว้ที่เดียว เพื่อให้ทุกหน้าจอหยิบไปใช้แบบเดียวกัน

export const colors = {
  background: '#ffffff',
  text: '#000000',
  textMuted: '#6b7280',
  textFaint: '#9ca3af',
  border: '#e5e7eb',

  // การ์ดสีเทาอ่อนตามดีไซน์ (rgba(88,88,88,0.1) บนพื้นขาว)
  card: 'rgba(88, 88, 88, 0.1)',
  cardAlt: '#f2f2f2',

  // สีเขียวสด = primary action (ปุ่ม Sign In / Sign Up / Pull / Save ฯลฯ)
  primary: '#22c55e',
  primaryDark: '#22c55e',
  primaryDisabled: '#a7e2bb',

  // วงกลม/กราฟิกสีม่วงอ่อนมุมล่างของทุกหน้า
  decorativePurple: '#A0AEED',

  danger: '#ef4444',
  gold: '#f5b301',

  overlay: 'rgba(0, 0, 0, 0.45)',
};

export const radius = {
  sm: 10,
  md: 15,
  lg: 22,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// เงาบาง ๆ ใต้การ์ด ตามที่ปรากฏถี่ ๆ ใน Figma (shadow 0px 4px 4px rgba(0,0,0,0.25))
export const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.16,
  shadowRadius: 4,
  elevation: 3,
};

// Glass card shared by Home, Custom and Favorite.
// The translucent fill lets decorative colors underneath show through while
// the light rim keeps the card readable on a white background.
export const glassCard = {
  backgroundColor: 'rgba(242, 242, 242, 0.68)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.88)',
  shadowColor: '#6b6485',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  // Android draws a separate opaque backing layer behind translucent views
  // when elevation is enabled, so glass cards deliberately stay flat.
  elevation: 0,
};

export const BOTTOM_NAV_HEIGHT = 76;

// เทียบเท่า StyleSheet.absoluteFillObject แต่กำหนดเองเพื่อเลี่ยงปัญหา type ของ RN บางเวอร์ชัน
export const absoluteFill = {
  position: 'absolute' as const,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};
