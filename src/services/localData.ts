import type { GachaItem, HistoryEntry } from '../data/types';

export type BackupData = {
  version: 1;
  gachas: GachaItem[];
  history: HistoryEntry[];
};
export function defaultGachas(): GachaItem[] {
  return [
    {
      id: 'builtin-yesno',
      name: 'Yes Or No',
      category: 'YesOrNo',
      emoji: '🃏',
      pullOneCost: 0,
      pullManyCost: 0,
      pullManyCount: 5,
      isEqualRate: true,
      isFavorite: false,
      randomList: [
        { id: 'yes', element: 'Yes', rate: '50%' },
        { id: 'no', element: 'No', rate: '50%' },
      ],
    },
    {
      id: 'builtin-food',
      name: 'Food',
      category: 'Food',
      emoji: '🍜',
      pullOneCost: 0,
      pullManyCost: 0,
      pullManyCount: 5,
      isEqualRate: true,
      isFavorite: false,
      randomList: ['Pizza', 'Sushi', 'Somtum', 'Ramen'].map(element => ({
        id: element,
        element,
        rate: '25%',
      })),
    },
  ];
}
export function mergeBackup(local: BackupData, remote: BackupData): BackupData {
  const gachas = new Map(remote.gachas.map(g => [g.id, g]));
  for (const gacha of local.gachas) {
    const other = gachas.get(gacha.id);
    if (!other || (gacha.localUpdatedAt ?? '') >= (other.localUpdatedAt ?? ''))
      gachas.set(gacha.id, gacha);
  }
  const history = new Map(remote.history.map(entry => [entry.id, entry]));
  local.history.forEach(entry => history.set(entry.id, entry));
  return {
    version: 1,
    gachas: [...gachas.values()],
    history: [...history.values()].sort((a, b) =>
      b.pulledAt.localeCompare(a.pulledAt),
    ),
  };
}
export function drawLocal(gacha: GachaItem, count: number): string[] {
  if (!Number.isInteger(count) || count < 1 || count > 100)
    throw new Error('Pull count must be between 1 and 100.');
  if (!gacha.randomList.length) throw new Error('This gacha has no items.');
  const weights = gacha.randomList.map(item =>
    gacha.isEqualRate ? 1 : Math.max(0, Number.parseFloat(item.rate) || 0),
  );
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (!total) throw new Error('This gacha needs a positive item weight.');
  return Array.from({ length: count }, () => {
    let cursor = Math.random() * total;
    const index = weights.findIndex(weight => {
      cursor -= weight;
      return cursor < 0;
    });
    return gacha.randomList[index < 0 ? weights.length - 1 : index].element;
  });
}

export function isSyncableCard(gacha: GachaItem): boolean {
  return !gacha.id.startsWith('builtin-') || !!gacha.localUpdatedAt;
}
