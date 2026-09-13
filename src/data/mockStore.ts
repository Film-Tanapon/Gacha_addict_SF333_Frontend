// ===== Mock data store =====
// ตอนนี้ backend ยังไม่มี endpoint สำหรับ Gacha/Favorite/History/Theme
// ไฟล์นี้จึงทำหน้าที่เป็น "ฐานข้อมูลจำลอง" ในหน่วยความจำ เพื่อให้ทุกหน้าจอทำงานและเดโมได้จริง
// เมื่อ backend พร้อม ให้แทนที่ฟังก์ชันเหล่านี้ด้วยการเรียก API จริงใน src/services/

export type RandomListItem = {
  id: string;
  element: string;
  rate: string; // เก็บเป็น string เพราะเป็นค่าที่พิมพ์ในฟอร์ม (เช่น "10%")
};

export type GachaCategory = 'Custom' | 'YesOrNo' | 'Food';

export type GachaItem = {
  id: string;
  name: string;
  category: GachaCategory;
  bannerUri?: string | null;
  emoji?: string;
  pullOneCost: number;
  pullManyCount: number;
  pullManyCost: number;
  randomList: RandomListItem[];
  isFavorite: boolean;
};

export type HistoryEntry = {
  id: string;
  gachaName: string;
  resultElement: string;
  pulledAt: string;
};

export type Theme = {
  id: string;
  name: string;
  price: number;
  colorPreview: string;
  owned: boolean;
};

export type Mission = {
  id: string;
  title: string;
  progress: number; // 0-1
  progressLabel: string; // เช่น "1/3"
  coinReward: number;
  claimed: boolean;
};

let coins = 20;

let gachas: GachaItem[] = [
  {
    id: 'g-yesno',
    name: 'Yes Or No',
    category: 'YesOrNo',
    emoji: '🃏',
    pullOneCost: 1,
    pullManyCount: 5,
    pullManyCost: 4,
    randomList: [
      { id: 'r1', element: 'Yes', rate: '50%' },
      { id: 'r2', element: 'No', rate: '50%' },
    ],
    isFavorite: true,
  },
  {
    id: 'g-food',
    name: 'Food',
    category: 'Food',
    emoji: '🍜',
    pullOneCost: 2,
    pullManyCount: 5,
    pullManyCost: 8,
    randomList: [
      { id: 'r1', element: 'Pizza', rate: '25%' },
      { id: 'r2', element: 'Sushi', rate: '25%' },
      { id: 'r3', element: 'Somtum', rate: '25%' },
      { id: 'r4', element: 'Ramen', rate: '25%' },
    ],
    isFavorite: true,
  },
];

let history: HistoryEntry[] = [
  { id: 'h1', gachaName: 'Yes Or No', resultElement: 'Yes', pulledAt: '2026-09-10 14:20' },
  { id: 'h2', gachaName: 'Food', resultElement: 'Pizza', pulledAt: '2026-09-11 09:05' },
];

let themes: Theme[] = [
  { id: 't1', name: 'Mint', price: 20, colorPreview: '#86efac', owned: true },
  { id: 't2', name: 'Sunset', price: 30, colorPreview: '#fca5a5', owned: false },
  { id: 't3', name: 'Ocean', price: 40, colorPreview: '#93c5fd', owned: false },
  { id: 't4', name: 'Lavender', price: 50, colorPreview: '#c9bdf7', owned: false },
];

let missions: Mission[] = [
  { id: 'm1', title: 'Log In', progress: 0, progressLabel: '0/3', coinReward: 1, claimed: false },
  { id: 'm2', title: 'Gacha (1/2)', progress: 0.5, progressLabel: '1/2', coinReward: 2, claimed: false },
  { id: 'm3', title: 'Gacha (1/10)', progress: 0.1, progressLabel: '1/10', coinReward: 3, claimed: false },
];

export function getCoins() {
  return coins;
}

export function addCoins(amount: number) {
  coins += amount;
  return coins;
}

export function spendCoins(amount: number): boolean {
  if (coins < amount) return false;
  coins -= amount;
  return true;
}

export function getGachas() {
  return gachas;
}

export function getGachaById(id: string) {
  return gachas.find(g => g.id === id) ?? null;
}

export function upsertGacha(gacha: GachaItem) {
  const index = gachas.findIndex(g => g.id === gacha.id);
  if (index >= 0) {
    gachas[index] = gacha;
  } else {
    gachas = [gacha, ...gachas];
  }
  return gacha;
}

export function toggleFavorite(id: string) {
  gachas = gachas.map(g => (g.id === id ? { ...g, isFavorite: !g.isFavorite } : g));
}

export function getFavorites() {
  return gachas.filter(g => g.isFavorite);
}

export function getHistory() {
  return history;
}

export function addHistoryEntry(entry: HistoryEntry) {
  history = [entry, ...history];
}

export function getThemes() {
  return themes;
}

export function purchaseTheme(id: string) {
  themes = themes.map(t => (t.id === id ? { ...t, owned: true } : t));
}

export function getMissions() {
  return missions;
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
