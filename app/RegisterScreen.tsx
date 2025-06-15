import axios from 'axios';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập OTP, 3: Nhập thông tin đăng ký
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  // Các state thông tin đăng ký
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Gửi OTP
  const sendOtp = async () => {
    if (!email) {
      Alert.alert('Vui lòng nhập email');
      return;
    }
    try {
      const res = await axios.post('http://192.168.1.128:5000/api/customer/send-otp', { email });
      Alert.alert(res.data.message || 'Mã OTP đã được gửi tới email.');
      setStep(2);
    } catch (error) {
      Alert.alert('Lỗi gửi OTP', error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  // Xác thực OTP
  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert('Vui lòng nhập mã OTP');
      return;
    }
    try {
      const res = await axios.post('http://192.168.1.128:5000/api/customer/verify-otp', { email, otp });
      Alert.alert(res.data.message || 'Xác thực OTP thành công');
      setOtpVerified(true);
      setStep(3);
    } catch (error) {
      Alert.alert('Xác thực OTP thất bại', error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  // Đăng ký
  const handleRegister = async () => {
    if (!name || !password || !confirmPassword || !phone) {
      Alert.alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Mật khẩu không khớp');
      return;
    }

    if (!agreed) {
      Alert.alert('Bạn cần đồng ý với các điều khoản và điều kiện');
      return;
    }

    try {
      const response = await axios.post('http://192.168.1.128:5000/api/customer/register-customer', {
        name,
        email,
        password,
        phone,
      });
      Alert.alert('Đăng ký thành công!', 'Chào mừng bạn đã đăng ký thành công.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Đăng ký thất bại', error.response?.data?.error || 'Có lỗi xảy ra');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {step === 1 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nhập Email"
            placeholderTextColor={"black"}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.button} onPress={sendOtp}>
            <Text style={styles.buttonText}>Gửi mã OTP</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nhập mã OTP"
            placeholderTextColor={"black"}

            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={verifyOtp}>
            <Text style={styles.buttonText}>Xác thực OTP</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 3 && otpVerified && (
        <>
          <TextInput style={styles.input} placeholder="Name" placeholderTextColor={"black"}
            value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Password" placeholderTextColor={"black"}
            secureTextEntry value={password} onChangeText={setPassword} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            placeholderTextColor={"black"}

            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor={"black"}
            value={phone} onChangeText={setPhone} />

          <View style={styles.agreeContainer}>
            <Checkbox status={agreed ? 'checked' : 'unchecked'} onPress={() => setAgreed(!agreed)} />
            <Text style={styles.agreeText}>
              Agree with <Text style={styles.termsLink}>Terms & Conditions</Text>
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, marginBottom: 20, textAlign: 'center', fontFamily: 'BungeeInline' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 15 },
  button: { backgroundColor: '#fdb7cf', padding: 15, borderRadius: 8, marginBottom: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  agreeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  agreeText: { color: '#777' },
  termsLink: { color: '#2D9CDB' },
  loginText: { marginTop: 10, color: '#fdb7cf', textAlign: 'center' },
});
