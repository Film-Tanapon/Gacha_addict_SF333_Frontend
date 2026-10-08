import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import { API_BASE_URL } from '../config/api';
import { TOKEN_KEY, ApiError } from './apiClient';

const assets = new Map<string, Asset>();
export const isLocalImage = (uri: string) => !/^https?:\/\//i.test(uri);

export async function pickImage(): Promise<string | null> {
  const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, maxWidth: 1600, maxHeight: 1600, quality: 0.8, assetRepresentationMode: 'compatible' });
  if (result.didCancel) return null;
  if (result.errorCode) throw new Error(result.errorMessage || 'Cannot open photo library.');
  const asset = result.assets?.[0];
  if (!asset?.uri) throw new Error('Cannot read selected image.');
  if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) throw new Error('Image must be at most 5 MB.');
  assets.set(asset.uri, asset);
  return asset.uri;
}

export async function uploadImage(uri: string): Promise<string> {
  if (!isLocalImage(uri)) return uri;
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token) throw new Error('Please sign in to upload an image.');
  const asset = assets.get(uri);
  const form = new FormData();
  form.append('image', { uri, type: asset?.type || 'image/jpeg', name: asset?.fileName || 'image.jpg' } as unknown as Blob);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${API_BASE_URL}/uploads`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form, signal: controller.signal });
    const data = await response.json();
    if (!response.ok) throw new ApiError(data.error || 'Image upload failed.', response.status);
    return data.url.startsWith('/') ? API_BASE_URL.replace(/\/api\/?$/, '') + data.url : data.url;
  } finally { clearTimeout(timeout); }
}
