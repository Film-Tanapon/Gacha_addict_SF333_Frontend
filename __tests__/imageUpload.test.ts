import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { pickImage, uploadImage } from '../src/services/imageUpload';
import { API_BASE_URL } from '../src/config/api';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('react-native-image-picker', () => ({ launchImageLibrary: jest.fn() }));
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

beforeEach(async () => { jest.clearAllMocks(); await AsyncStorage.clear(); });

test('selects a photo and uploads multipart data with session token, resolving the served URL', async () => {
  const append = jest.spyOn(FormData.prototype, 'append');
  (launchImageLibrary as jest.Mock).mockResolvedValue({ assets: [{ uri: 'file:///photo.png', type: 'image/png', fileName: 'photo.png', fileSize: 100 }] });
  await AsyncStorage.setItem('auth_token', 'session');
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ url: '/api/uploads/photo.webp' }) });
  const uri = await pickImage();
  const url = await uploadImage(uri!);
  expect(url).toBe(API_BASE_URL.replace(/\/api\/?$/, '') + '/api/uploads/photo.webp');
  const [endpoint, options] = mockFetch.mock.calls[0];
  expect(endpoint).toBe(API_BASE_URL + '/uploads');
  expect(options.headers).toEqual({ Authorization: 'Bearer session' });
  expect(options.body).toBeInstanceOf(FormData);
  expect(append).toHaveBeenCalledWith('image', { uri: 'file:///photo.png', type: 'image/png', name: 'photo.png' });
  append.mockRestore();
});

test('cancel does not upload, remote URLs pass through, and local uploads require login', async () => {
  (launchImageLibrary as jest.Mock).mockResolvedValue({ didCancel: true });
  expect(await pickImage()).toBeNull();
  expect(await uploadImage('https://example.com/photo.png')).toBe('https://example.com/photo.png');
  await expect(uploadImage('file:///photo.png')).rejects.toThrow('sign in');
  expect(mockFetch).not.toHaveBeenCalled();
});

test('reports picker size errors and backend rejection', async () => {
  (launchImageLibrary as jest.Mock).mockResolvedValue({ assets: [{ uri: 'file:///large.png', fileSize: 6 * 1024 * 1024 }] });
  await expect(pickImage()).rejects.toThrow('5 MB');
  await AsyncStorage.setItem('auth_token', 'session');
  mockFetch.mockResolvedValue({ ok: false, status: 400, json: async () => ({ error: 'Invalid image' }) });
  await expect(uploadImage('file:///bad.png')).rejects.toThrow('Invalid image');
});
