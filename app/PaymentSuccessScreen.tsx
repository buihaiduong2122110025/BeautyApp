import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PaymentSuccessScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Image style={{ width: 300, height: 300 }} source={require('../assets/images/complete.jpg')} />
      
      <Text style={styles.title}>Thanh toán thành công!</Text>
      <TouchableOpacity onPress={() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeTabs' }],
        });
      }}
      style={{ backgroundColor:'#fdb7cf' }}>
        <Text style={{ color:'red' }}>Về Trang Chủ</Text>
      </TouchableOpacity>

    </View>
  );
};
export default PaymentSuccessScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: 'green', padding: 10, borderRadius: 5, marginTop: 20 },
  buttonText: { color: 'white', fontSize: 16 }
});
