import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. นำเข้าหน้าจอทั้งหมด (ปรับ path ตามโครงสร้างโฟลเดอร์จริงของคุณ)
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import WelcomeHome from './src/screens/WelcomeHome';
import HomeScreen from './src/screens/HomeScreen';

// 2. ประกาศ Route และ Param ของแต่ละหน้าใน RootStackParamList
export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  WelcomeHome: { username?: string }; // รองรับการส่ง parameter ชื่อผู้ใช้
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SignIn"
        screenOptions={{ headerShown: false }} // ซ่อน Header แถบบนเพื่อคุมดีไซน์เอง
      >
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />

        {/* 3. เพิ่ม Stack.Screen ของหน้า WelcomeHome และ Home */}
        <Stack.Screen name="WelcomeHome" component={WelcomeHome} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}