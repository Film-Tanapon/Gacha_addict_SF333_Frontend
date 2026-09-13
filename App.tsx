import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. นำเข้าหน้าจอทั้งหมด
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen01 from './src/screens/SignUpScreen01';
import SignUpScreen02 from './src/screens/SignUpScreen02';
import SignUpScreen03 from './src/screens/SignUpScreen03';
import SignUpScreen04 from './src/screens/SignUpScreen04';
import WelcomeHome from './src/screens/WelcomeHome';
import HomeScreen from './src/screens/HomeScreen';
import CreateCustomScreen from './src/screens/CreateCustomScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import FavoriteScreen from './src/screens/FavoriteScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import CustomGachaScreen from './src/screens/CustomGachaScreen';
import GachaDetailScreen from './src/screens/GachaDetailScreen';
import GachaFormScreen from './src/screens/GachaFormScreen';
import GachaResultScreen from './src/screens/GachaResultScreen';
import ThemeShopScreen from './src/screens/ThemeShopScreen';
import { configureGoogleSignIn } from './src/services/googleAuth';

// 2. ประกาศ Route และ Param ของแต่ละหน้า
export type RootStackParamList = {
  SignIn: undefined;
  SignUpScreen01: undefined;
  SignUpScreen02: {
    profileImage?: string | null;
    frameId?: string | null;
  };
  SignUpScreen03: {
    profileImage?: string | null;
    frameId?: string | null;
    username: string;
    email: string;
  };
  SignUpScreen04: {
    username: string;
    profileImage?: string | null;
    frameId?: string | null;
    frameColor?: string;
    frameUrl?: string;
  };
  WelcomeHome: { username?: string; mode?: 'login' | 'signup' };
  Home: { username?: string; coin?: number } | undefined;
  CreateCustom: { username?: string | null } | undefined;
  Favorite: { username?: string } | undefined;
  History: { username?: string } | undefined;
  Profile: { username?: string } | undefined;
  CustomGacha: undefined;
  GachaDetail: { gachaId: string };
  GachaResult: { gachaId: string; resultElement: string };
  GachaForm: { gachaId?: string };
  ThemeShop: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SignIn"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="SignIn" component={SignInScreen} />

        {/* Step-by-Step Sign Up Screens */}
        <Stack.Screen name="SignUpScreen01" component={SignUpScreen01} />
        <Stack.Screen name="SignUpScreen02" component={SignUpScreen02} />
        <Stack.Screen name="SignUpScreen03" component={SignUpScreen03} />
        <Stack.Screen name="SignUpScreen04" component={SignUpScreen04} />

        {/* Main Application Screens */}
        <Stack.Screen name="WelcomeHome" component={WelcomeHome} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateCustom" component={CreateCustomScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Favorite" component={FavoriteScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="CustomGacha" component={CustomGachaScreen} />
        <Stack.Screen name="GachaDetail" component={GachaDetailScreen} />
        <Stack.Screen name="GachaForm" component={GachaFormScreen} />
        <Stack.Screen name="GachaResult" component={GachaResultScreen} />
        <Stack.Screen name="ThemeShop" component={ThemeShopScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
