import RootNavigator from "@/navigation/RootNavigator";
import {
  GoogleSignin
} from "@react-native-google-signin/google-signin";
import { NavigationContainer } from "@react-navigation/native";
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootSiblingParent } from 'react-native-root-siblings';
import AuthProvider from '../contexts/AuthContext';
import "../global.css";


// 👉 Config linking cho deep linking
const linking = {
  prefixes: ['reactexpoapp://'],
  config: {
    screens: {
      PaymentSuccessScreen: 'PaymentSuccessScreen', // trùng với name Stack.Screen
      ChatBot: 'ChatBot', // trùng với name Stack.Screen

    },
  },
};

// Hàm tải font
const fetchFonts = () => {
  const loadFontsPromise = Font.loadAsync({
    'MyCustomFont': require('../assets/fonts/Nunito-ExtraBold.ttf'), // Đường dẫn đến font của bạn
    'MyFont2': require('../assets/fonts/FortMayhem-TwoDEMO.ttf'), // Đường dẫn đến font của bạn
    'Sansation': require('../assets/fonts/Sansation-BoldItalic.ttf'), // Đường dẫn đến font của bạn
    'NunitoBold': require('../assets/fonts/Nunito-ExtraBold.ttf'), // Đường dẫn đến font của bạn
    'NunitoLight': require('../assets/fonts/NunitoSans-Light.ttf'), // Đường dẫn đến font của bạn
    'BungeeInline': require('../assets/fonts/BungeeInline-Regular.ttf'), // Đường dẫn đến font của bạn
    'Fascinate': require('../assets/fonts/Fascinate-Regular.ttf'), // Đường dẫn đến font của bạn
    'Lexend': require('../assets/fonts/Lexend-VariableFont_wght.ttf'), // Đường dẫn đến font của bạn
    'AlexBrush': require('../assets/fonts/AlexBrush-Regular.ttf'), // Đường dẫn đến font của bạn

  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Font load timeout exceeded")), 20000) // Increased timeout to 20 seconds
  );

  return Promise.race([loadFontsPromise, timeoutPromise]);
};

export default function App() {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Tải font với timeout
    fetchFonts()
      .then(() => setFontLoaded(true))
      .catch((error) => {
        console.error("Font loading error: ", error); // Log the error for debugging
        setError(error.message);
      });

    GoogleSignin.configure({
      iosClientId: '775262374631-5s02c1p0opap008fcko7g4g29drqlhu.apps.googleusercontent.com', // iOS OAuth Client ID
      webClientId: '176425050244-s50h9or1q454jh807kdcjoecarn4ekob.apps.googleusercontent.com', // Web Client ID (cần cho Android login)
      profileImageSize: 150, // Kích thước ảnh đại diện trả về
    });

  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      </View>
    );
  }

  if (!fontLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    ); // Hiển thị ActivityIndicator trong khi tải font
  }

  return (
    <RootSiblingParent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <NavigationContainer linking={linking}>
              <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </GestureHandlerRootView>
    </RootSiblingParent>
  );
}

