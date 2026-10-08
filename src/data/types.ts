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
  isEqualRate?: boolean;
  animation?: string | null;
  frameId?: string | null;
  localUpdatedAt?: string;
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

export type Frame = { id: string; name: string; price: number; color: string; decoration: string; owned: boolean };
