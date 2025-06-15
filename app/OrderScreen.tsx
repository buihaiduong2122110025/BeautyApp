import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OrderScreen() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // pending, confirmed, cancelled

  const fetchUserInfo = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        fetchOrders(parsedUser.id);
      } else {
        Alert.alert('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      Alert.alert('Lỗi khi lấy thông tin người dùng.');
    }
  };

  const fetchOrders = async (customerId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Token không tồn tại. Vui lòng đăng nhập lại.');
        return;
      }

      const response = await axios.get(`http://192.168.1.128:5000/api/customer/orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      setOrders(response.data.orders);
    } catch (error) {
      console.error('Lỗi khi lấy đơn hàng:', error);
      Alert.alert('Lỗi khi lấy đơn hàng.');
    }
  };
  const handleCancelOrder = async (orderId) => {
    try {
      const user = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      if (!user || !token) {
        Alert.alert('Vui lòng đăng nhập lại.');
        return;
      }
      const parsedUser = JSON.parse(user);

      // Xác nhận huỷ
      Alert.alert(
        'Xác nhận huỷ',
        'Bạn có chắc muốn huỷ đơn hàng này?',
        [
          { text: 'Không' },
          {
            text: 'Huỷ đơn',
            onPress: async () => {
              const response = await axios.put(
                `http://192.168.1.128:5000/api/customer/orders/${orderId}/cancel`,
                { customer_id: parsedUser.id },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              Alert.alert('Huỷ thành công');
              fetchOrders(parsedUser.id); // reload đơn hàng
              setShowDetail(false); // đóng modal nếu đang mở
            },
          },
        ]
      );
    } catch (error) {
      console.error('Lỗi khi huỷ đơn:', error);
      Alert.alert('Không thể huỷ đơn hàng. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const filteredOrders = orders.filter(order => order.status === activeTab);

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderTitle}>Mã đơn hàng: #{item.id}</Text>
      <Text>{item.details[0]?.service_name}</Text>
      <Text>Trạng thái: {item.status}</Text>
      <Text>Business_ID: {item.details[0]?.service_business_id}</Text>
      <Image
        source={{ uri: `http://192.168.1.128:5000/${item.details[0]?.service_image_url.replace(/\\/g, '/')}` }}
        style={styles.image}
      />
      <Text style={styles.orderPrice}>Tổng cộng: {item.total_price} đ</Text>
      <TouchableOpacity style={styles.detailButton} onPress={() => handleShowDetails(item)}>
        <Text style={styles.buttonText}>Chi tiết</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTabButton = (label, value) => (
    <TouchableOpacity
      key={value}
      style={[styles.tabButton, activeTab === value && styles.activeTab]}
      onPress={() => setActiveTab(value)}
    >
      <Text style={[styles.tabText, activeTab === value && styles.activeTabText]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch sử đơn hàng</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton('🕓 Chờ xác nhận', 'pending')}
        {renderTabButton('✅ Đã thanh toán', 'confirmed')}
        {renderTabButton('❌ Đã hủy', 'cancelled')}
      </View>

      {/* Danh sách đơn hàng */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        ListEmptyComponent={<Text style={{ textAlign: 'center', padding: 20 }}>Không có đơn hàng.</Text>}
      />

      {/* Modal chi tiết */}
      <Modal
        visible={showDetail}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDetail(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
            {selectedOrder && selectedOrder.details?.length > 0 && (
              <View style={styles.orderDetail}>
                <Text>Thời gian đặt: {new Date(selectedOrder.created_at).toLocaleString()}</Text>
                <Text>Dịch vụ: {selectedOrder.details[0].service_name}</Text>
                <Text>Giá: {selectedOrder.details[0].service_price} đ</Text>
                <Text>Thời gian: {selectedOrder.details[0].service_duration} phút</Text>
                <Text>Địa chỉ: {selectedOrder.details[0].service_address}</Text>
                <Image
                  source={{ uri: `http://192.168.1.128:5000/${selectedOrder.details[0].service_image_url.replace(/\\/g, '/')}` }}
                  style={styles.image}
                />
              </View>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetail(false)}>
              <Text style={styles.buttonText}>Đóng</Text>
            </TouchableOpacity>
            {selectedOrder?.status === 'pending' && (
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: '#5a40d1' }]}
                onPress={() => handleCancelOrder(selectedOrder.id)}
              >
                <Text style={styles.buttonText}>Huỷ đơn hàng</Text>
              </TouchableOpacity>
            )}

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    borderColor: '#5a40d1',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#5a40d1',
    fontWeight: 'bold',
  },
  orderItem: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderPrice: {
    fontSize: 16,
    color: 'green',
    marginTop: 8,
  },
  detailButton: {
    marginTop: 10,
    backgroundColor: '#5a40d1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 8,
    borderRadius: 8,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  orderDetail: {
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
});
