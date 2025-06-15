

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import { useContext, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-root-toast';
import { AuthContext } from '../contexts/AuthContext';
type LoginScreenNavigationProp = NavigationProp<any>; // Hoặc bạn có thể thay `any` bằng tên stack của bạn

GoogleSignin.configure({
  webClientId: '176425050244-s50h9or1q454jh807kdcjoecarn4ekob.apps.googleusercontent.com',
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

export default function LoginScreen({ navigation }: { navigation: LoginScreenNavigationProp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthContext must be used within AuthProvider');
  const { setIsLoggedIn } = context;

  const showMessage = (message) => {
    Toast.show(message, {
      duration: Toast.durations.SHORT,
      position: Toast.positions.BOTTOM,
      backgroundColor: '#333',
      textColor: '#fff',
    });
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { user } = response.data;
        const { email, name } = user;

        // Gọi API backend
        const res = await axios.post('http://192.168.1.128:5000/api/customer/google-login', {
          email,
          name,
          phone: '',
        });

        const token = res.data.token;
        await AsyncStorage.setItem('token', token);
        console.log('🔑 Token:', token);  // 👈 Nếu bạn để dòng này thì luôn log token ra console.

        showMessage(`Xin chào, ${name}!`);

        // Cập nhật trạng thái đăng nhập -> RootNavigator tự chuyển màn hình
        setIsLoggedIn(true);
      } else {
        showMessage('Google Signin was cancelled');
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            showMessage('Google Signin is in progress');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            showMessage('Play Services are not available');
            break;
          case statusCodes.SIGN_IN_CANCELLED:
            showMessage('Google Signin was cancelled');
            break;
          default:
            showMessage(`Error: ${error.code}`);
        }
      } else {
        showMessage('An unknown error occurred');
      }
      console.error('Lỗi khi đăng nhập Google:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    try {
      const response = await axios.post('http://192.168.1.128:5000/api/customer/login-customer', {
        email,
        password,
      });

      const token = response.data.token;
      await AsyncStorage.setItem('token', token);
      console.log('🔑 Token:', token);  // 👈 Nếu bạn để dòng này thì luôn log token ra console.

      Toast.show(' Đăng nhập thành công!', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.CENTER,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: '#4CAF50',
        textColor: '#fff',
        opacity: 1,

      }); setIsLoggedIn(true);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Đăng nhập thất bại', error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng Nhập</Text>
      <Text style={styles.subtitle}>Xin chào, chào mừng bạn đã đến với app của tôi </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#000"

        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        placeholderTextColor="#000"

        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng Nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Quên Mật Khẩu?</Text>
      </TouchableOpacity>

      <View style={styles.socialSignIn}>
        <TouchableOpacity style={styles.socialButton}>
          <Image source={require('../assets/images/apple.png')} style={styles.socialIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
          <Image source={require('../assets/images/google.png')} style={styles.socialIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Image source={require('../assets/images/facebook.png')} style={styles.socialIcon} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>Bạn chưa có tài khoản? Đến Đăng Kí!!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28,marginBottom: 20, textAlign: 'center', fontFamily: "BungeeInline" },
  subtitle: { fontSize: 18, color: '#fdb7cf', textAlign: 'center', marginBottom: 20 ,fontFamily:'AlexBrush' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15
  },
  button: {
    backgroundColor: '#fdb7cf',  // Màu xanh lá cho nút "Sign In"
    padding: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  forgotPassword: { alignSelf: 'flex-end' },
  forgotPasswordText: { color: '#fdb7cf' },
  socialSignIn: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10
  },
  socialButton: { marginHorizontal: 10 },
  socialIcon: { width: 40, height: 40 },
  registerText: { marginTop: 10, color: '#fdb7cf', textAlign: 'center' },
});


