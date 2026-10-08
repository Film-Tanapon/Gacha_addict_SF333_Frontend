import { useCallback, useSyncExternalStore } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, ApiError, TOKEN_KEY } from './apiClient';
import {
  BackupData,
  defaultGachas,
  drawLocal,
  mergeBackup,
  isSyncableCard,
} from './localData';
import type { GachaItem, Mission, Theme, Frame } from '../data/types';

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  coins: number;
  avatarUrl?: string | null;
  frameId?: string | null;
  frameColor?: string | null;
  frameUrl?: string | null;
  selectedThemeId?: string | null;
};
type LocalDocument = BackupData & {
  cardIds: Record<string, string>;
  profile: UserProfile | null;
  frames: Frame[];
  themes: Theme[];
  missions: Mission[];
  dirty: boolean;
  lastBackupAt: string | null;
};
type SyncStatus =
  | 'local'
  | 'pending'
  | 'syncing'
  | 'saved'
  | 'unavailable'
  | 'cards-unavailable'
  | 'error';
const ACTIVE_KEY = 'gacha_active_store_v1';
const storageKey = (scope: string) => `gacha_local_v1:${scope}`;
const freshDocument = (): LocalDocument => ({
  version: 1,
  gachas: defaultGachas(),
  history: [],
  cardIds: {},
  profile: null,
  frames: [],
  themes: [],
  missions: [],
  dirty: false,
  lastBackupAt: null,
});
let document = freshDocument();
let scope = 'guest';
let generation = 0;
let accountRevision = 0;
let economyPending = 0;
let economyQueue: Promise<unknown> = Promise.resolve();
let initialized: Promise<void> | null = null;
let writeQueue: Promise<unknown> = Promise.resolve();
let syncPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();
const makeState = (online = false, syncStatus: SyncStatus = 'local') => ({
  coins: online ? document.profile?.coins ?? 0 : 0,
  cardIds: document.cardIds,
  gachas: document.gachas,
  history: document.history,
  frames: document.frames,
  themes: document.themes,
  missions: document.missions,
  user: online ? document.profile : null,
  online,
  syncStatus,
  lastBackupAt: document.lastBackupAt,
});
let state = makeState();
function publish(online = state.online, status = state.syncStatus) {
  state = makeState(online, status);
  listeners.forEach(listener => listener());
}
async function readDocument(target: string): Promise<LocalDocument> {
  const raw = await AsyncStorage.getItem(storageKey(target));
  if (!raw) return freshDocument();
  const data = JSON.parse(raw) as LocalDocument;
  if (
    data.version !== 1 ||
    !Array.isArray(data.gachas) ||
    !Array.isArray(data.history)
  )
    throw new Error('Saved data is not supported.');
  return { ...freshDocument(), ...data };
}
export function initializeAppData(): Promise<void> {
  if (!initialized)
    initialized = (async () => {
      const savedScope = await AsyncStorage.getItem(ACTIVE_KEY);
      scope = savedScope ?? 'guest';
      document = await readDocument(scope);
      publish(false, document.dirty ? 'pending' : 'local');
    })().catch(error => {
      initialized = null;
      throw error;
    });
  return initialized;
}
function enqueueWrite(work: () => Promise<void>): Promise<void> {
  const operation = writeQueue.then(work);
  writeQueue = operation.catch(() => {});
  return operation;
}
// Serialize edits, and publish only after the phone confirms the write succeeded.
function editDocument(
  edit: (data: LocalDocument) => LocalDocument,
  expectedGeneration?: number,
): Promise<void> {
  return enqueueWrite(async () => {
    await initializeAppData();
    if (expectedGeneration !== undefined && expectedGeneration !== generation)
      return;
    const current = generation;
    const next = edit(document);
    await AsyncStorage.setItem(storageKey(scope), JSON.stringify(next));
    if (generation === current) {
      document = next;
      publish();
    }
  });
}
export function resetAppData() {
  generation++;
  initialized = null;
  document = freshDocument();
  scope = 'guest';
  publish(false, 'local');
}
export async function setCurrentUser(user: UserProfile) {
  return enqueueWrite(async () => {
    await initializeAppData();
    const guest = scope === 'guest' ? document : null;
    const target = `user-${user.id}`;
    const account = await readDocument(target);
    const merged = guest ? mergeBackup(guest, account) : account;
    const next: LocalDocument = {
      ...account,
      ...merged,
      profile: user,
      dirty: account.dirty || !!guest,
    };
    await AsyncStorage.setItem(storageKey(target), JSON.stringify(next));
    await AsyncStorage.setItem(ACTIVE_KEY, target);
    generation++;
    scope = target;
    document = next;
    publish(true, next.dirty ? 'pending' : 'local');
  });
}
export async function enterGuestMode() {
  return enqueueWrite(async () => {
    await initializeAppData();
    const guest = await readDocument('guest');
    await AsyncStorage.setItem(ACTIVE_KEY, 'guest');
    generation++;
    scope = 'guest';
    document = guest;
    publish(false, 'local');
  });
}
export const getServerCardId = (gachaId: string) =>
  document.cardIds[gachaId] ?? null;
export const getCoins = () => state.coins;
export const getGachas = () => state.gachas;
export const getGachaById = (id: string) =>
  state.gachas.find(g => g.id === id) ?? null;
export const getFavorites = () => state.gachas.filter(g => g.isFavorite);
export const getHistory = () => state.history;
export const getThemes = () => state.themes;
export const getMissions = () => state.missions;
export function showApiError(error: unknown) {
  Alert.alert(
    'Error',
    error instanceof Error ? error.message : 'Request failed.',
  );
}
function localId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}
function requestBackgroundBackup() {
  publish(state.online, 'pending');
  // Core actions never wait for the network or fail when the server is unavailable.
  refreshAppData(['user']).catch(() => {});
}
export type Resource = 'gachas' | 'history' | 'themes' | 'frames' | 'missions' | 'user';
type BackupResponse = {
  coins?: number;
  revision: number;
  data: BackupData | null;
  updatedAt?: string;
  cardIds?: Record<string, string>;
};
function hasPendingCards(gachas: GachaItem[], cardIds: Record<string, string>) {
  return gachas.some(g => isSyncableCard(g) && !cardIds[g.id]);
}
function nextTimestamp(previous?: string) {
  return new Date(
    Math.max(Date.now(), (previous ? Date.parse(previous) || 0 : 0) + 1),
  ).toISOString();
}
async function syncBackup(current: number) {
  publish(true, 'syncing');
  try {
    const remote = await apiRequest<BackupResponse>('/backup');
    if (generation !== current) return;
    await editDocument(data => {
      const merged = remote.data ? mergeBackup(data, remote.data) : data;
      const cardIds = remote.cardIds ?? {};
      return {
        ...data,
        ...merged,
        cardIds,
        dirty:
          data.dirty || !remote.data || hasPendingCards(merged.gachas, cardIds),
      };
    }, current);
    if (generation !== current) return;
    if (!document.dirty) {
      publish(true, 'saved');
      return;
    }
    const captured = document;
    const body = {
      expectedRevision: remote.revision,
      data: { version: 1, gachas: captured.gachas, history: captured.history },
    };
    const balanceRevision = accountRevision;
    const result = await apiRequest<BackupResponse>('/backup', 'PUT', body);
    if (generation !== current) return;
    await editDocument(
      data => ({
        ...data,
        cardIds: result.cardIds ?? {},
        profile: data.profile && typeof result.coins === 'number' && balanceRevision === accountRevision && !economyPending
          ? { ...data.profile, coins: result.coins } : data.profile,
        dirty:
          data.gachas !== captured.gachas ||
          data.history !== captured.history ||
          hasPendingCards(data.gachas, result.cardIds ?? {}),
        lastBackupAt: result.updatedAt ?? new Date().toISOString(),
      }),
      current,
    );
    if (generation !== current) return;
    publish(
      true,
      hasPendingCards(document.gachas, document.cardIds) && !result.cardIds
        ? 'cards-unavailable'
        : document.dirty
        ? 'pending'
        : 'saved',
    );
  } catch (error) {
    if (generation !== current) return;
    if (error instanceof ApiError)
      publish(
        true,
        error.status === 404
          ? 'unavailable'
          : error.status === 409
          ? 'pending'
          : 'error',
      );
    else publish(false, 'pending');
  }
}
export async function refreshAppData(resources: Resource[] = ['user']) {
  await initializeAppData();
  if (syncPromise) {
    await syncPromise;
    if (
      state.online &&
      resources.some(r => r === 'themes' || r === 'frames' || r === 'missions')
    ) {
      return refreshAppData(resources);
    }
    return;
  }
  const current = generation;
  const operation = (async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (
      !token ||
      !document.profile ||
      scope !== `user-${document.profile.id}`
    ) {
      publish(false, 'local');
      return;
    }
    try {
      const revision = accountRevision;
      const user = await apiRequest<UserProfile>(
        '/auth/me',
        'GET',
        undefined,
        true,
        3000,
      );
      if (generation !== current) return;
      if (scope !== `user-${user.id}`) {
        publish(false, 'error');
        return;
      }
      await editDocument(data => revision === accountRevision && !economyPending ? ({ ...data, profile: user }) : data, current);
      if (generation !== current) return;
      publish(true);
      await syncBackup(current);
      if (generation !== current || !state.online) return;
      // Account economy stays server-authoritative; offline mode only uses local gachas.
      for (const resource of resources.filter(
        r => r === 'themes' || r === 'frames' || r === 'missions',
      )) {
        const resourceRevision = accountRevision;
        let value: Theme[] | Frame[] | Mission[];
        try {
          value = await apiRequest<Theme[] | Frame[] | Mission[]>(`/${resource}`);
        } catch (error) {
          // Older deployments may not have the frame shop yet. Keep the account online.
          if (resource === 'frames' && error instanceof ApiError && error.status === 404) continue;
          throw error;
        }
        if (generation !== current) return;
        await editDocument(data => resourceRevision === accountRevision && !economyPending ? ({ ...data, [resource]: value }) : data, current);
      }
    } catch {
      if (generation === current)
        publish(false, document.dirty ? 'pending' : 'local');
    }
  })();
  syncPromise = operation;
  try {
    await operation;
  } finally {
    if (syncPromise === operation) syncPromise = null;
  }
}
export function useAppData(resources: Resource[] = ['gachas', 'user']) {
  const snapshot = useSyncExternalStore(
    useCallback((listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }, []),
    () => state,
  );
  const key = resources.join(',');
  useFocusEffect(
    useCallback(() => {
      refreshAppData(key.split(',') as Resource[]).catch(showApiError);
    }, [key]),
  );
  return snapshot;
}
type GachaInput = {
  title: string;
  cardImage?: string | null;
  isEqualRate?: boolean;
  animation?: string;
  frame?: string | null;
  category?: GachaItem['category'];
  cardItems: { name: string; rate: number }[];
};
export async function saveGacha(body: GachaInput, id?: string) {
  let saved!: GachaItem;
  await editDocument(data => {
    const existing = data.gachas.find(g => g.id === id);
    if (
      !body.title.trim() ||
      !body.cardItems.length ||
      body.cardItems.length > 100
    )
      throw new Error('Provide a name and between 1 and 100 items.');
    if (
      body.cardItems.some(
        item =>
          !item.name.trim() || !Number.isFinite(item.rate) || item.rate < 0,
      )
    )
      throw new Error('Invalid gacha item.');
    if (!body.isEqualRate && !body.cardItems.some(item => item.rate > 0))
      throw new Error('A positive item weight is required.');
    saved = {
      ...existing,
      id: id ?? localId(),
      name: body.title.trim(),
      category: body.category ?? 'Custom',
      bannerUri: body.cardImage,
      isEqualRate: body.isEqualRate ?? false,
      animation: body.animation,
      frameId: body.frame,
      emoji: existing?.emoji ?? '🎴',
      pullOneCost: 0,
      pullManyCost: 0,
      pullManyCount: existing?.pullManyCount ?? 5,
      isFavorite: existing?.isFavorite ?? false,
      randomList: body.cardItems.map(item => ({
        id: localId(),
        element: item.name.trim(),
        rate: `${item.rate}%`,
      })),
      localUpdatedAt: nextTimestamp(existing?.localUpdatedAt),
    };
    return {
      ...data,
      gachas: [saved, ...data.gachas.filter(g => g.id !== saved.id)],
      dirty: true,
    };
  });
  requestBackgroundBackup();
  return saved;
}
export async function toggleFavorite(id: string) {
  await editDocument(data => {
    if (!data.gachas.some(g => g.id === id)) throw new Error('Gacha not found');
    return {
      ...data,
      dirty: true,
      gachas: data.gachas.map(g =>
        g.id === id
          ? {
              ...g,
              isFavorite: !g.isFavorite,
              localUpdatedAt: nextTimestamp(g.localUpdatedAt),
            }
          : g,
      ),
    };
  });
  requestBackgroundBackup();
}
export async function pullGacha(id: string, count: number) {
  let results: string[] = [];
  await editDocument(data => {
    const gacha = data.gachas.find(g => g.id === id);
    if (!gacha) throw new Error('Gacha not found');
    results = drawLocal(gacha, count);
    const entries = results.map(resultElement => ({
      id: localId(),
      gachaName: gacha.name,
      resultElement,
      pulledAt: new Date().toISOString(),
    }));
    return { ...data, dirty: true, history: [...entries, ...data.history] };
  });
  requestBackgroundBackup();
  return results;
}
function requireOnlineAccount() {
  if (!state.online || !state.user)
    throw new Error(
      'Please connect to the internet and sign in to use this feature.',
    );
}
async function purchaseThemeRequest(id: string) {
  requireOnlineAccount();
  const current = generation;
  const theme = await apiRequest<Theme & { coins: number }>(
    `/themes/${id}/purchase`,
    'POST',
  );
  await editDocument(
    data => ({
      ...data,
      profile: data.profile ? { ...data.profile, coins: theme.coins } : null,
      themes: data.themes.map(t => (t.id === id ? theme : t)),
    }),
    current,
  );
}
async function selectThemeRequest(id: string) {
  requireOnlineAccount();
  const current = generation;
  const result = await apiRequest<{ selectedThemeId: string }>(
    `/themes/${id}/select`,
    'PUT',
  );
  await editDocument(
    data => ({
      ...data,
      profile: data.profile ? { ...data.profile, ...result } : null,
    }),
    current,
  );
}
async function claimMissionRequest(id: string) {
  requireOnlineAccount();
  const current = generation;
  const result = await apiRequest<{ coins: number }>(
    `/missions/${id}/claim`,
    'POST',
  );
  await editDocument(
    data => ({
      ...data,
      profile: data.profile ? { ...data.profile, coins: result.coins } : null,
      missions: data.missions.map(m =>
        m.id === id ? { ...m, claimed: true } : m,
      ),
    }),
    current,
  );
}
async function updateProfileRequest(body: unknown) {
  requireOnlineAccount();
  const current = generation;
  const user = await apiRequest<UserProfile>('/profile', 'PUT', body);
  await editDocument(data => ({ ...data, profile: user }), current);
  return user;
}

async function mutateAccount<T>(work: () => Promise<T>): Promise<T> {
 requireOnlineAccount();
 const current = generation;
 economyPending++; accountRevision++;
 const operation = economyQueue.then(async () => {
 if (current !== generation) throw new Error('Account changed. Please try again.');
 return work();
 });
 economyQueue = operation.catch(() => {});
 return operation.finally(() => { economyPending--; accountRevision++; });
}
export const purchaseTheme = (id: string) => mutateAccount(() => purchaseThemeRequest(id));
export const selectTheme = (id: string) => mutateAccount(() => selectThemeRequest(id));
export const claimMission = (id: string) => mutateAccount(() => claimMissionRequest(id));
export const updateProfile = (body: unknown) => mutateAccount(() => updateProfileRequest(body));
export const purchaseFrame = (id: string) => mutateAccount(async () => {
 const current = generation;
 const frame = await apiRequest<Frame & {coins:number}>(`/frames/${id}/purchase`, 'POST');
 await editDocument(data => ({...data,profile:data.profile ? {...data.profile,coins:frame.coins}:null,frames:data.frames.map(f=>f.id===id?frame:f)}),current);
});
export const selectFrame = (id: string) => mutateAccount(async () => {
 const current = generation;
 const result = await apiRequest<Pick<UserProfile,'frameId'|'frameColor'|'frameUrl'>>(`/frames/${id}/select`, 'PUT');
 await editDocument(data=>({...data,profile:data.profile?{...data.profile,...result}:null}),current);
});
