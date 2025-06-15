import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CheckoutScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { business, service, appointmentTime, workShiftId } = route.params;

  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [customer, setCustomer] = useState(null);
  const total = service.price * service.quantity;

  // 🔎 Xử lý định dạng thời gian chuẩn timestamp
  let formattedTime = '';
  if (appointmentTime && typeof appointmentTime === 'string') {
    const parts = appointmentTime.split(' ');
    if (parts.length === 2) {
      const [time, date] = parts;
      formattedTime = `${date} ${time}:00`; // Ví dụ: "2025-05-30 12:00:00"
    } else {
      formattedTime = `${appointmentTime} 08:00:00`; // Nếu thiếu giờ
    }
  } else if (appointmentTime instanceof Date) {
    formattedTime = appointmentTime.toISOString().replace('T', ' ').substring(0, 19);
  }

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const res = await axios.get('http://192.168.1.128:5000/api/customer/me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log('📥 [Full Customer Info]:', res.data);
          if (res.data.customer) {
            setCustomer(res.data.customer);  // Lưu thông tin customer từ API
          } else {
            console.warn('⚠️ Không tìm thấy thông tin khách hàng trong phản hồi.');
          }
        }
      } catch (error) {
        console.error('❌ [Error Fetching Customer Info]:', error?.response?.data || error.message);
        Alert.alert('Lỗi', 'Không thể tải thông tin khách hàng.');
      }
    };

    fetchCustomerInfo();
  }, []);


  const handlePurchase = async () => {
    if (!customer) {
      console.warn('⚠️ [Warning]: Customer info is missing!');
      return;
    }

    const payload = {
      customer_id: customer.id,
      business_id: business.id,
      business_service_id: service.business_service_id,  // Đổi từ businessServiceId thành business_service_id
      quantity: service.quantity,
      price: service.price,
      note,
      appointment_time: formattedTime,
      payment_method: paymentMethod,
      work_shift_id: workShiftId,
    };

    // In payload để kiểm tra
    console.log('📤 [Sending Payload to Server]:', payload);
    console.log('🔎 [Service Details]:', service);

    try {
      const res = await axios.post('http://192.168.1.128:5000/api/customer/createCheckoutMomo', payload);
      console.log('✅ [Server Response]:', res.data);

      const { payUrl, orderId, appointmentId } = res.data;
      if (payUrl) {
        console.log('💰 [Payment Link Received]:', payUrl);
        // Alert.alert('Thông báo', `Thanh toán Momo đã khởi tạo thành công! Đơn hàng: ${orderId}, Lịch hẹn: ${appointmentId}`);
        Linking.openURL(payUrl);
      } else {
        Alert.alert('❌ Lỗi', 'Không nhận được đường link thanh toán từ server.');
      }
    } catch (error) {
      // In chi tiết lỗi để dễ dàng kiểm tra
      console.error('❌ [Payment Request Error]:', error?.response?.data || error.message);

      // Thêm log chi tiết về payload và dữ liệu gửi đi
      console.log('📤 [Payload Sent]:', payload);

      // Thêm thông báo lỗi chi tiết từ server
      const errorMessage = error?.response?.data?.error || error.message;
      Alert.alert('Thất bại', `Lỗi: ${errorMessage}`);

      // In rõ lỗi chi tiết để debug
      if (error?.response?.data) {
        console.log('🔴 [Error Details from Server]:', error.response.data);
      }
    }
  };


  if (!customer) {
    return (
      <View style={styles.container}>
        <Text>Đang tải thông tin khách hàng...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image style={{
              width: 50, height: 50
            }} source={require('../assets/icons/left.png')} />

          </TouchableOpacity>
          <Text style={{ fontFamily: 'BungeeInline', marginLeft: 50, fontSize: 20 }}>Thanh Toán</Text>

        </View>
        <View style={{ paddingHorizontal: 10 }}>
          <Text style={styles.sectionTitle}>Thông tin</Text>
          <View style={styles.box}>
            <Text style={styles.textcustomer1}>Họ tên: {customer?.name}</Text>

            <Text style={styles.textcustomer}>Số điện thoại: {customer?.phone}</Text>
            <Text style={styles.textcustomer}>Email: {customer?.email}</Text>
            {/* Hiển thị avatar nếu muốn
            {customer?.avatar && (
              <Image
                source={{ uri: `http://192.168.1.128:5000/${customer.avatar.replace(/\\/g, '/')}` }}
                style={{ width: 80, height: 80, borderRadius: 40 }}
              />
            )} */}
          </View>
        </View>
        <View style={{ paddingHorizontal: 10 }}>

          <Text style={styles.sectionTitle}>Doanh nghiệp</Text>
          <View style={styles.boxRow}>
            <Image source={{ uri: business.image }} style={styles.logo} />
            <View>
              <Text style={styles.textcustomer}>{business.name}</Text>
              <Text style={styles.textcustomer}>ID: {business.id}</Text>
              <View style={{ width: 250 }}>
                <Text style={styles.textcustomer}>{business.address}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={{ paddingHorizontal: 10 }}>

          <Text style={styles.sectionTitle}>Dịch vụ</Text>
          <View style={styles.boxRow}>
            <Image source={{ uri: service.image }} style={styles.logo} />
            <View>
              {/* <Text>{service.businessServiceId}</Text> */}

              <Text style={styles.textcustomer}>{service.name}</Text>
              <Text style={styles.textcustomer}>Số lượng: {service.quantity}</Text>
              <Text style={styles.textcustomer}> {service.price.toLocaleString()} đ</Text>
            </View>
          </View>
        </View>
        <View style={{ paddingHorizontal: 10 }}>

          <Text style={styles.sectionTitle}>Ghi chú cho doanh nghiệp</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Aa"
            placeholderTextColor={'black'}
            value={note}
            onChangeText={setNote}
            multiline
          />

          <Text style={styles.sectionTitle}>Chọn thời gian</Text>
          <TouchableOpacity
            style={styles.box}
            onPress={() =>
              navigation.navigate('SetAppointmentScreen', {
                business: { ...business, id: business.id },
                service,
                appointmentTime,
                workShiftId: workShiftId || 1,
              })
            }
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#5a40d1', fontSize: 16, marginRight: 8 }}>🕒</Text>
              <Text style={{ fontSize: 16 }}>
                {appointmentTime ? appointmentTime : 'Chọn thời gian'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ paddingHorizontal: 10 }}>
  <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

  {[
    { method: 'momo', label: 'Thanh toán qua ví MOMO', icon: require('../assets/icons/MoMo_Logo.png') },
    { method: 'tienmat', label: 'Thanh toán bằng tiền mặt ', icon: require('../assets/icons/cash_5396296.png') },
    // { method: 'bank', label: 'Chuyển khoản ngân hàng bằng mã QR code (ATM, NAPAS...)', icon: require('../assets/qr.png') },
  ].map(({ method, label, icon }) => (
    <TouchableOpacity
      key={method}
      onPress={() => setPaymentMethod(method)}
      style={[
        styles.paymentOptionBox,
        paymentMethod === method && styles.paymentOptionBoxSelected,
      ]}
    >
      <Image source={icon} style={styles.paymentIcon} />
      <Text style={[styles.paymentText, paymentMethod === method && styles.paymentTextSelected]}>
        {label}
      </Text>
      <View style={styles.radioOuter}>
        {paymentMethod === method && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  ))}
</View>


        <View style={styles.totalBox}>
          <Text style={styles.totalText}>Tổng thanh toán:</Text>
          <Text style={styles.totalAmount}>{total.toLocaleString()} đ</Text>
        </View>

        <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
          <Text style={styles.purchaseText}>Đặt Lịch</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  paymentOptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  
  paymentOptionBoxSelected: {
    borderColor: '#5a40d1',
    borderWidth: 2,
    backgroundColor: '#f5f0ff',
  },
  
  paymentIcon: {
    width: 30,
    height: 30,
    marginRight: 12,
    resizeMode: 'contain',
  },
  
  paymentText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Sansation',
    color: '#333',
  },
  
  paymentTextSelected: {
    fontWeight: 'bold',
    color: '#5a40d1',
  },
  
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#5a40d1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5a40d1',
  },
  container: {
    // padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    // fontSize: 20,
    // fontWeight: 'bold',
    marginBottom: 16,
    // textAlign: 'center',
    backgroundColor: '#fdb7cf',
    color: '#5a40d1'
  },
  sectionTitle: {
    fontSize: 16,
    // fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'NunitoBold'
  },
  textcustomer1: {
    fontWeight: 500,
    marginBottom: 5,
    fontFamily: 'NunitoLight'
  },
  textcustomer: {
    fontWeight: 500,
    fontFamily: 'NunitoLight',
    // flexWrap: 'wrap',
  },
  box: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  boxRow: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%'
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  textInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 10,
    minHeight: 60,
  },
  paymentOption: {
    marginBottom: 10,
  },
  active: {
    fontWeight: 'bold',
    color: '#0d6efd',
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    marginHorizontal:10
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  purchaseButton: {
    backgroundColor: '#fdb7cf',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  purchaseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});