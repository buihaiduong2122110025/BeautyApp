import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockVouchers = [
  {
    id: '1',
    code: 'WELCOME10',
    description: 'Giảm 10% cho đơn hàng đầu tiên',
    expiry: 'HSD: 30/06/2025',
  },
  {
    id: '2',
    code: 'FREESHIP50',
    description: 'Miễn phí vận chuyển cho đơn từ 50K',
    expiry: 'HSD: 15/07/2025',
  },
  {
    id: '3',
    code: 'SUMMER25',
    description: 'Giảm 25% cho dịch vụ làm đẹp mùa hè',
    expiry: 'HSD: 01/08/2025',
  },
];

export default function VoucherScreen({ navigation }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVouchers(mockVouchers);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.voucherBox}>
      <Text style={styles.code}>{item.code}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.expiry}>{item.expiry}</Text>
      <TouchableOpacity style={styles.applyButton}>
        <Text style={styles.buttonText}>Dùng ngay</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
               <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                 <Image style={{
                   width: 50, height: 50
                 }} source={require('../assets/icons/left.png')} />
     
               </TouchableOpacity>
               <Text style={{ fontFamily: 'BungeeInline', marginLeft: 70, fontSize: 20 }}>Mã giảm giá</Text>
     
             </View>

      {loading ? (
        <ActivityIndicator size="large" color="#5a40d1" style={{ marginTop: 40 }} />
      ) : vouchers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có mã giảm giá khả dụng</Text>
        </View>
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  backText: {
    color: '#fff',
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  voucherBox: {
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  code: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5a40d1',
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: '#333',
  },
  expiry: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  applyButton: {
    marginTop: 10,
    backgroundColor: '#5a40d1',
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
  },
});
