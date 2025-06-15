import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockNotifications = [
  {
    id: '1',
    title: 'Xác nhận đặt lịch thành công',
    message: 'Bạn đã đặt lịch cắt tóc vào 10:00 sáng mai.',
    time: '2 phút trước',
  },
  {
    id: '2',
    title: 'Cập nhật dịch vụ',
    message: 'Dịch vụ “Gội đầu thư giãn” hiện đang giảm giá 20%.',
    time: '1 giờ trước',
  },
  {
    id: '3',
    title: 'Nhắc nhở lịch hẹn',
    message: 'Đừng quên lịch hẹn lúc 15:00 hôm nay tại Beauty Salon.',
    time: 'Hôm nay, 10:00',
  },
];

export default function NotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập gọi API
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1500);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.notificationBox}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.time}>{item.time}</Text>
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
          <Text style={{ fontFamily: 'BungeeInline', marginLeft: 70, fontSize: 20 }}>Thông báo</Text>

        </View>

      {loading ? (
        <ActivityIndicator size="large" color="#5a40d1" style={{ marginTop: 40 }} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../assets/icons/clock_13096497.png')} // hoặc thay bằng hình từ user upload
            style={styles.emptyImage}
          />
          <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
        </View>
      ) : (
        
        <FlatList
          data={notifications}
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
    color: '#5a40d1',
    // height:70
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
  notificationBox: {
    backgroundColor: '#f4f4f4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#444',
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 12,
    resizeMode: 'contain',
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
  },
});
