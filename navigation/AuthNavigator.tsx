import OnboardingScreen from '@/app/OnboardingScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../app/LoginScreen';
import RegisterScreen from '../app/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      {/* <Stack.Screen name="GoogleLogin" component={GoogleLoginScreen} />
      <Stack.Screen name="Test" component={TestScreen} /> */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
