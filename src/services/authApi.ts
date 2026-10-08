import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, TOKEN_KEY } from './apiClient';
import { enterGuestMode, setCurrentUser, UserProfile } from './appApi';

export type BackendAuthResponse = { token: string; user: UserProfile };
async function authenticate(
  path: string,
  body: unknown,
): Promise<BackendAuthResponse> {
  const data = await apiRequest<BackendAuthResponse>(path, 'POST', body, false);
  if (!data.token || !data.user)
    throw new Error('Invalid authentication response.');
  await AsyncStorage.setItem(TOKEN_KEY, data.token);
  await setCurrentUser(data.user);
  return data;
}
export const loginWithGoogleIdToken = (idToken: string) =>
  authenticate('/auth/google', { idToken });
export const loginWithEmailPassword = (email: string, password: string) =>
  authenticate('/auth/login', { email, password });
export const registerUser = (body: {
  email: string;
  username: string;
  password: string;
  profileImage?: string | null;
  frameId?: string | null;
}) => authenticate('/auth/register', body);
export const getStoredToken = () => AsyncStorage.getItem(TOKEN_KEY);
export async function clearStoredToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await enterGuestMode();
}
