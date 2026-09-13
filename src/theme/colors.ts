/**
 * ชุดสีกลางของแอป Gacha Addict
 * ยึดตามแนวทาง UI: พื้นหลังสีขาว, การ์ดสีเทาอ่อนมุมโค้ง, primary สีเขียวสด,
 * และมีวงกลม/กราฟิกสีม่วงอ่อนตกแต่งมุมจอ
 */
export const colors = {
  background: '#ffffff',

  // การ์ด / input แบบพื้นเทาอ่อน มุมโค้ง
  card: '#f3f4f6',
  cardAlt: '#e5e7eb',
  border: '#e5e7eb',

  // primary action สีเขียวสด
  primary: '#36FF4A',
  primaryDark: '#16a34a',
  primaryLight: '#dcfce7',

  // ข้อความ
  textPrimary: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',

  // สถานะ
  success: '#16a34a',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // วงกลมตกแต่งสีม่วงอ่อนมุมจอ
  decorative: '#c4b5fd',

  white: '#ffffff',
  black: '#111827',
  coin: '#f59e0b',
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const shadow = {
  card: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
};