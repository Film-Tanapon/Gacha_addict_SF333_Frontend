import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest } from '../src/services/apiClient';
import {
  loginWithEmailPassword,
  clearStoredToken,
} from '../src/services/authApi';
import {
  initializeAppData,
  refreshAppData,
  resetAppData,
  getGachas,
  getHistory,
  getCoins,
  getServerCardId,
  saveGacha,
  pullGacha,
  toggleFavorite,
  purchaseTheme,
  claimMission,
  purchaseFrame,
  setCurrentUser,
} from '../src/services/appApi';
import {
  defaultGachas,
  drawLocal,
  mergeBackup,
} from '../src/services/localData';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@react-navigation/native', () => ({ useFocusEffect: jest.fn() }));
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;
const user = {
  id: 1,
  username: 'tester',
  email: 'test@example.com',
  coins: 20,
};
const input = {
  title: 'Dinner',
  isEqualRate: false,
  cardItems: [
    { name: 'Pizza', rate: 1 },
    { name: 'Sushi', rate: 3 },
  ],
};
function reply(data: unknown, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  });
}
async function drain() {
  await refreshAppData(['user']);
}
beforeEach(async () => {
  await drain();
  mockFetch.mockReset();
  mockFetch.mockRejectedValue(new TypeError('Network request failed'));
  await AsyncStorage.clear();
  resetAppData();
});

test('fresh install works offline, saves gacha/favorite/history and restores after restart', async () => {
  await initializeAppData();
  expect(getGachas()).toHaveLength(2);
  const gacha = await saveGacha(input);
  await toggleFavorite(gacha.id);
  const results = await pullGacha(gacha.id, 5);
  expect(results).toHaveLength(5);
  expect(getHistory()).toHaveLength(5);
  await drain();
  resetAppData();
  await initializeAppData();
  expect(getGachas().find(g => g.id === gacha.id)?.isFavorite).toBe(true);
  expect(getHistory()).toHaveLength(5);
  expect(mockFetch).not.toHaveBeenCalled();
});

test('login preserves guest data, backs up the actual local results, and restores onto a fresh device', async () => {
  const gacha = await saveGacha(input);
  await pullGacha(gacha.id, 2);
  await drain();
  reply({ token: 'jwt', user });
  await loginWithEmailPassword(user.email, 'password');
  reply(user);
  reply({ revision: 0, data: null });
  reply({ revision: 1, updatedAt: '2026-10-08T10:00:00.000Z' });
  await drain();
  const upload = mockFetch.mock.calls.find(
    ([url, options]) => url.endsWith('/backup') && options.method === 'PUT',
  );
  expect(upload).toBeDefined();
  const body = JSON.parse(upload![1].body);
  expect(body.expectedRevision).toBe(0);
  expect(body.data.history).toHaveLength(2);
  expect(upload![1].headers.Authorization).toBe('Bearer jwt');
  expect(mockFetch.mock.calls.some(([url]) => url.endsWith('/pull'))).toBe(
    false,
  );
  await AsyncStorage.clear();
  resetAppData();
  reply({ token: 'jwt', user });
  await loginWithEmailPassword(user.email, 'password');
  reply(user);
  reply({ revision: 1, data: body.data });
  reply({ revision: 2, updatedAt: '2026-10-08T10:01:00.000Z' });
  await drain();
  expect(getHistory()).toHaveLength(2);
  expect(getGachas().some(g => g.id === gacha.id)).toBe(true);
});

test('offline signed-in use remains local and reconnect backs up changes without rerolling', async () => {
  reply({ token: 'jwt', user });
  await loginWithEmailPassword(user.email, 'password');
  await drain();
  expect(getCoins()).toBe(0);
  const results = await pullGacha('builtin-yesno', 3);
  await drain();
  expect(getHistory().map(h => h.resultElement)).toEqual(results);
  resetAppData();
  await initializeAppData();
  expect(getHistory()).toHaveLength(3);
  reply(user);
  reply({ revision: 0, data: null });
  reply({ revision: 1 });
  await drain();
  expect(getHistory()).toHaveLength(3);
  expect(getCoins()).toBe(20);
});

test('409 backup conflicts and missing backup endpoint never erase local changes', async () => {
  reply({ token: 'jwt', user });
  await loginWithEmailPassword(user.email, 'password');
  await drain();
  const gacha = await saveGacha(input);
  await drain();
  reply(user);
  reply({
    revision: 2,
    data: { version: 1, gachas: defaultGachas(), history: [] },
  });
  reply({ error: 'Conflict' }, 409);
  await drain();
  expect(getGachas().some(g => g.id === gacha.id)).toBe(true);
  reply(user);
  reply({ error: 'Not found' }, 404);
  await drain();
  resetAppData();
  await initializeAppData();
  expect(getGachas().some(g => g.id === gacha.id)).toBe(true);
  const raw = await AsyncStorage.getItem('gacha_local_v1:user-1');
  expect(JSON.parse(raw!).dirty).toBe(true);
});

test('account caches are isolated, logout keeps phone data, and guest data remains available', async () => {
  const guest = await saveGacha(input);
  await drain();
  reply({ token: 'jwt', user });
  await loginWithEmailPassword(user.email, 'password');
  await drain();
  const privateGacha = await saveGacha({ ...input, title: 'Account one' });
  await drain();
  await clearStoredToken();
  expect(getGachas().some(g => g.id === guest.id)).toBe(true);
  expect(getGachas().some(g => g.id === privateGacha.id)).toBe(false);
  reply({ token: 'jwt2', user: { ...user, id: 2 } });
  await loginWithEmailPassword(user.email, 'password');
  await drain();
  expect(getGachas().some(g => g.id === privateGacha.id)).toBe(false);
  expect(await AsyncStorage.getItem('gacha_local_v1:user-1')).toContain(
    privateGacha.id,
  );
});

test('phone storage errors prevent false success and leave existing records intact', async () => {
  await initializeAppData();
  (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
    new Error('Storage full'),
  );
  await expect(saveGacha(input)).rejects.toThrow('Storage full');
  expect(getGachas()).toHaveLength(2);
});

test('offline economy operations are blocked while local weighted and equal draws work', async () => {
  await initializeAppData();
  await expect(purchaseTheme('mint')).rejects.toThrow(
    'connect to the internet',
  );
  const weighted = {
    ...defaultGachas()[0],
    isEqualRate: false,
    randomList: [
      { id: '0', element: 'Never', rate: '0%' },
      { id: '1', element: 'Always', rate: '100%' },
    ],
  };
  expect(drawLocal(weighted, 10)).toEqual(Array(10).fill('Always'));
  expect(() => drawLocal(weighted, 101)).toThrow();
  const latest = {
    ...weighted,
    localUpdatedAt: '2026-10-08T10:00:00.000Z',
    isFavorite: true,
  };
  expect(
    mergeBackup(
      { version: 1, gachas: [latest], history: [] },
      { version: 1, gachas: [weighted], history: [] },
    ).gachas[0].isFavorite,
  ).toBe(true);
});

test('client preserves server errors and handles empty responses', async () => {
  await AsyncStorage.setItem('auth_token', 'jwt');
  reply({ error: 'Invalid token' }, 401);
  await expect(apiRequest('/auth/me')).rejects.toThrow('Invalid token');
  reply(undefined, 204);
  await expect(apiRequest('/history/1', 'DELETE')).resolves.toBeUndefined();
});

test('simultaneous phone edits persist without overwriting one another', async () => {
  await initializeAppData();
  const created = await Promise.all([
    saveGacha({ ...input, title: 'First' }),
    saveGacha({ ...input, title: 'Second' }),
    pullGacha('builtin-yesno', 4),
  ]);
  await drain();
  resetAppData();
  await initializeAppData();
  expect(getGachas().map(g => g.name)).toEqual(
    expect.arrayContaining(['First', 'Second']),
  );
  expect(getHistory()).toHaveLength(4);
  expect(created).toHaveLength(3);
});

test('a backup response arriving after logout cannot change the guest store', async () => {
  reply({ token: 'jwt', user });
  await loginWithEmailPassword(user.email, 'password');
  await drain();
  let finish!: (value: unknown) => void;
  reply(user);
  mockFetch.mockImplementationOnce(
    () =>
      new Promise(resolve => {
        finish = resolve;
      }),
  );
  const pending = refreshAppData(['user']);
  await new Promise<void>(resolve => setTimeout(() => resolve(), 0));
  await clearStoredToken();
  finish({
    ok: true,
    status: 200,
    json: async () => ({
      revision: 5,
      data: {
        version: 1,
        gachas: [{ ...defaultGachas()[0], id: 'private-account' }],
        history: [],
      },
    }),
  });
  await pending;
  expect(getGachas().some(g => g.id === 'private-account')).toBe(false);
  expect(getCoins()).toBe(0);
});

test('card ID pairs survive restart and edits reuse the local ID and server mapping', async () => {
  const local = await saveGacha(input);
  await drain();
  reply({ token: 'jwt', user });
  await loginWithEmailPassword(user.email, 'password');
  const snapshot = { version: 1, gachas: getGachas(), history: [] };
  reply(user);
  reply({ revision: 0, data: null, cardIds: {} });
  reply({ revision: 1, cardIds: { [local.id]: '73' } });
  await drain();
  expect(getServerCardId(local.id)).toBe('73');
  expect(getGachas().some(g => g.id === local.id)).toBe(true);
  resetAppData();
  await initializeAppData();
  expect(getServerCardId(local.id)).toBe('73');
  const previousCalls = mockFetch.mock.calls.length;
  reply(user);
  reply({ revision: 1, data: snapshot, cardIds: { [local.id]: '73' } });
  await drain();
  expect(
    mockFetch.mock.calls
      .slice(previousCalls)
      .some(([, options]) => options.method === 'PUT'),
  ).toBe(false);
  const edited = await saveGacha(
    { ...input, title: 'Updated on phone' },
    local.id,
  );
  await drain();
  expect(edited.id).toBe(local.id);
  expect(getServerCardId(local.id)).toBe('73');
  reply(user);
  reply({ revision: 1, data: snapshot, cardIds: { [local.id]: '73' } });
  reply({ revision: 2, cardIds: { [local.id]: '73' } });
  await drain();
  const uploads = mockFetch.mock.calls.filter(
    ([url, options]) => url.endsWith('/backup') && options.method === 'PUT',
  );
  const latest = JSON.parse(uploads[uploads.length - 1][1].body);
  expect(
    latest.data.gachas.find((g: { id: string }) => g.id === local.id).name,
  ).toBe('Updated on phone');
  expect(getServerCardId(local.id)).toBe('73');
  const stored = JSON.parse(
    (await AsyncStorage.getItem('gacha_local_v1:user-1'))!,
  );
  expect(stored.cardIds[local.id]).toBe('73');
  expect(stored.dirty).toBe(false);
});

test('previous backups without card mappings are queued for migration into Card', async () => {
  const local = await saveGacha(input);
  await drain();
  reply({ token: 'jwt', user });
  await loginWithEmailPassword(user.email, 'password');
  await drain();
  const stored = JSON.parse(
    (await AsyncStorage.getItem('gacha_local_v1:user-1'))!,
  );
  delete stored.cardIds;
  stored.dirty = false;
  await AsyncStorage.setItem('gacha_local_v1:user-1', JSON.stringify(stored));
  resetAppData();
  await initializeAppData();
  expect(getServerCardId(local.id)).toBeNull();
  reply(user);
  reply({
    revision: 4,
    data: { version: 1, gachas: stored.gachas, history: [] },
  });
  reply({ revision: 5, cardIds: { [local.id]: '91' } });
  await drain();
  expect(getServerCardId(local.id)).toBe('91');
  const uploads = mockFetch.mock.calls.filter(
    ([url, options]) => url.endsWith('/backup') && options.method === 'PUT',
  );
  expect(JSON.parse(uploads[uploads.length - 1][1].body).expectedRevision).toBe(
    4,
  );
});

test('mission reward and frame purchase use server balances; delayed refresh cannot restore old coins', async () => {
 await setCurrentUser(user);
 await AsyncStorage.setItem('auth_token','test-token');
 let finishRead!: (value: unknown) => void;
 let readStarted!: () => void;
 const started = new Promise<void>(resolve => {readStarted=resolve;});
 mockFetch.mockImplementation(async (url: string) => {
   if (url.endsWith('/auth/me')) {readStarted(); return new Promise(resolve => {finishRead=resolve;});}
   if (url.endsWith('/missions/m2/claim')) return {ok:true,status:200,json:async()=>({coins:22,coinReward:2})};
   if (url.endsWith('/frames/f0/purchase')) return {ok:true,status:200,json:async()=>({id:'f0',name:'Classic',price:0,color:'#0080ff',decoration:'',owned:true,coins:22})};
   if (url.endsWith('/backup')) return {ok:false,status:404,json:async()=>({message:'Not found'})};
   throw new Error('Unexpected URL');
 });
 const refresh=refreshAppData(['user']);
 await started;
 await claimMission('m2');
 expect(getCoins()).toBe(22);
 finishRead({ok:true,status:200,json:async()=>user});
 await refresh;
 expect(getCoins()).toBe(22);
 await purchaseFrame('f0');
 expect(getCoins()).toBe(22);
 mockFetch.mockRejectedValue(new TypeError('Network request failed'));
});

test('backup immediately updates wallet from automatic mission reward', async () => {
 await setCurrentUser(user);
 await AsyncStorage.setItem('auth_token','test-token');
 reply(user); reply({revision:0,data:null}); reply({revision:1,data:null,cardIds:{},coins:22});
 await refreshAppData(['user']);
 expect(getCoins()).toBe(22);
});
