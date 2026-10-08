import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

export const TOKEN_KEY = 'auth_token';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function apiRequest<T>(
  path: string,
  method = 'GET',
  body?: unknown,
  authenticated = true,
  timeoutMs = 10000,
): Promise<T> {
  const token = authenticated ? await AsyncStorage.getItem(TOKEN_KEY) : null;
  if (authenticated && !token) throw new Error('Please sign in to continue.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: controller.signal,
    });
    if (response.status === 204) return undefined as T;
    const data = await response.json();
    if (!response.ok)
      throw new ApiError(
        data.error || data.message || `Request failed (${response.status})`,
        response.status,
      );
    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}
