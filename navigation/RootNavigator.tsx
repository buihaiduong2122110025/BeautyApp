import AdminChatScreen from '@/app/AdminChatScreen';
import AllServicesScreen from '@/app/AllServicesScreen';
import AppointmentScreen from '@/app/AppointmentScreen';
import ChatBot from '@/app/ChatBot';
import ChatScreen from '@/app/ChatScreen';
import GoogleLoginScreen from '@/app/GoogleLoginScreen';
import NotificationScreen from '@/app/NotificationScreen';
import OnboardingScreen from '@/app/OnboardingScreen';
import OrderScreen from '@/app/OrderScreen';
import PaymentSuccessScreen from '@/app/PaymentSuccessScreen';
import ProfileEditScreen from '@/app/ProfileEditScreen';
import SearchResultScreen from '@/app/SearchResultScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext, useEffect, useState } from 'react';
import ServiceBusinessesScreen from '../app/BusinessesByService';
import CartScreen from '../app/CartScreen';
import CheckoutScreen from '../app/CheckoutScreen';
import IntroScreen from '../app/IntroScreen';
import ServiceDetailScreen from '../app/ServiceDetailScreen';
import SetAppointmentScreen from '../app/SetAppointment';
import { AuthContext } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import VoucherScreen from '@/app/VoucherScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthContext must be used within an AuthProvider');

  const { isLoggedIn } = context;
  const [isIntroDone, setIntroDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIntroDone(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isIntroDone ? (
        <Stack.Screen name="Intro" component={IntroScreen} />
      ) : isLoggedIn ? (
        <Stack.Screen name="HomeTabs" component={TabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
      {/* Các màn hình khác */}
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <Stack.Screen name="ServiceBusinessesScreen" component={ServiceBusinessesScreen} />
      <Stack.Screen name="SetAppointmentScreen" component={SetAppointmentScreen} />
      <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} />
      <Stack.Screen name="GoogleLogin" component={GoogleLoginScreen} />
      {/* <Stack.Screen name="Test" component={TestScreen} /> */}
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="Order" component={OrderScreen} />
      <Stack.Screen name="AllService" component={AllServicesScreen} />
      {/* <Tab.Screen name="Chat" component={ChatScreen} /> */}
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="ChatAdminScreen" component={AdminChatScreen} />
      <Stack.Screen name="ChatBot" component={ChatBot} />
      <Stack.Screen name="Appoinment" component={AppointmentScreen} />
      <Stack.Screen name="SearchResultScreen" component={SearchResultScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen name="VoucherScreen" component={VoucherScreen} />

    </Stack.Navigator>
  );
}
