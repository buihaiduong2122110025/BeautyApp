import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-root-toast';

// Cấu hình GoogleSignin (thường đặt ở nơi khởi tạo app hoặc root component)
GoogleSignin.configure({
  webClientId: '176425050244-s50h9or1q454jh807kdcjoecarn4ekob.apps.googleusercontent.com', // Thay bằng web client ID của bạn
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

export default function GoogleLoginScreen({navigation}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showMessage = (message: string) => {
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
      console.log("Kiểm tra Google Play Services...");
      await GoogleSignin.hasPlayServices();
      console.log("Bắt đầu signIn...");
      const response = await GoogleSignin.signIn();
      console.log("Response từ Google Signin:", response);
  
      if (isSuccessResponse(response)) {
        const { idToken, user } = response.data;
        const { name, email, photo } = user;
  
        console.log("Đăng nhập thành công với user:", user);
        // TODO: Gửi idToken hoặc dữ liệu user lên backend để xử lý đăng nhập
  
        showMessage(`Xin chào, ${name}!`);
        // Ví dụ điều hướng sau khi đăng nhập thành công
        navigation.navigate('Test');
    } else {
        console.log("Người dùng đã hủy đăng nhập");
        showMessage("Google Signin was cancelled");
      }
    } catch (error) {
      console.log("Lỗi khi đăng nhập Google:", error);
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            showMessage("Google Signin is in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            showMessage("Play Services are not available");
            break;
          case statusCodes.SIGN_IN_CANCELLED:
            showMessage("Google Signin was cancelled");
            break;
          default:
            showMessage(`Error: ${error.code}`);
            break;
        }
      } else {
        showMessage("An unknown error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập bằng Google</Text>

      <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn} disabled={isSubmitting}>
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In with Google</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  button: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 6,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
