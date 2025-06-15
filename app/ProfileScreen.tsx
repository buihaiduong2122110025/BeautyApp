

  import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useContext, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '../contexts/AuthContext';


  interface JwtPayload {
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
  }

  export default function ProfileScreen({ navigation }) {
    const { setIsLoggedIn } = useContext(AuthContext);
    const [userInfo, setUserInfo] = useState<JwtPayload | null>(null);

    // const handleLogout = async () => {
    //   await AsyncStorage.removeItem('token');
    //   setIsLoggedIn(false);
    //   Alert.alert('Đăng xuất thành công');
    // };


  
    const fetchUserInfo = useCallback(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Không tìm thấy token. Vui lòng đăng nhập lại.');
          return;
        }
    
        const response = await fetch('http://192.168.1.128:5000/api/customer/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          Alert.alert('Lỗi khi lấy thông tin người dùng');
          return;
        }
    
        const data = await response.json();
        setUserInfo(data.customer);
    
        // 🔥 LƯU VÀO ASYNCSTORAGE để các màn khác có thể lấy
        await AsyncStorage.setItem('user', JSON.stringify({
          id: data.customer.id,
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone,
          avatar: data.customer.avatar,
        }));
        console.log("Đã lưu user vào AsyncStorage:", data.customer);
    
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        Alert.alert('Lỗi mạng hoặc server');
      }
    }, []);
    


    useFocusEffect(
      useCallback(() => {
        fetchUserInfo();
      }, [fetchUserInfo])
    );
    const handleLogout = async () => {
      try {
        await GoogleSignin.signOut();  // Thực hiện đăng xuất bằng Google Sign-in
        await AsyncStorage.removeItem('token');

        setIsLoggedIn(false);
        Alert.alert('Đăng xuất thành công');

        // clear data from app state (chú thích: có thể dùng để xóa dữ liệu ứng dụng)
      } catch (error) {
        console.error(error);  // Nếu có lỗi, in lỗi ra console
      }
    };

    if (!userInfo) {
      return (
        <View style={styles.container}>
          <Text>Đang tải thông tin...</Text>
        </View>
      );
    }
    return (
      <ScrollView style={styles.container}>
        {/* Thông tin người dùng */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            {userInfo.avatar ? (
              <Image source={{ uri: `http://192.168.1.128:5000/${userInfo.avatar.replace(/\\/g, '/')}` }} style={styles.avatarImage} />
            ) : (
              <Icon name="person" size={60} color="#4CAF50" />
            )}
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.nameText}>{userInfo.name || 'Tên người dùng'}</Text>
            {/* <Text style={styles.emailText}>{userInfo.email || 'Email'}</Text>
            {userInfo.phone && <Text style={styles.phoneText}>📱 {userInfo.phone}</Text>} */}
            <TouchableOpacity style={styles.vipBadge}>
              <Text style={styles.vipText}>Thành viên Vàng ▾</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Danh sách các tùy chọn */}
        <View style={styles.listItem}>


          <Icon name="person" size={24} color="#fdb7cf" />
          <TouchableOpacity onPress={() =>
            navigation.navigate('ProfileEdit')}  style={{ flexDirection:'row' }}>
            <Text style={styles.itemText}>Tài khoản của tôi</Text>
            <Icon style={{ marginRight:24 }} name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Lịch sử đơn hàng */}
        <View style={styles.sectionHeader}>
          <Icon name="list-alt" size={24} color="#fdb7cf" />
          <Text style={styles.sectionText}>Lịch sử đơn hàng</Text>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </View>
        <View style={styles.orderStatusRow}>
          <TouchableOpacity onPress={() =>
            navigation.navigate('Order')} 
            style={styles.orderItem}>
            <Text style={styles.orderIcon}>📋</Text>
            <Text style={styles.orderText}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.orderItem}>
            <Text style={styles.orderIcon}>✅</Text>
            <Text style={styles.orderText}>Đã thanh toán</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.orderItem}>
            <View style={styles.dot} />
            <Text style={styles.orderIcon}>📝</Text>
            <Text style={styles.orderText}>Đánh giá</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.orderItem}>
            <Text style={styles.orderIcon}>✔️</Text>
            <Text style={styles.orderText}>Đã đánh giá</Text>
          </TouchableOpacity>
        </View>

        {/* Các mục chức năng khác */}
        {[
          { icon: 'add-location', text: 'Thêm địa điểm khác' },
          { icon: 'favorite-border', text: 'Đang theo dõi' },
          { icon: 'rate-review', text: 'Đánh giá' },
          { icon: 'language', text: 'Ngôn ngữ' },
          { icon: 'fingerprint', text: 'Cài đặt sinh trắc học', toggle: true },
          { icon: 'info', text: 'Giới thiệu' },
        ].map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Icon name={item.icon} size={24} color="#fdb7cf" />
            <Text style={styles.itemText}>{item.text}</Text>
            {item.toggle ? <Switch value={false} /> : <Icon name="chevron-right" size={24} color="#ccc" />}
          </View>


        ))}

        <TouchableOpacity
          style={{
            marginTop: 20,
            backgroundColor: '#f44336',
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 8,
          }}
          onPress={handleLogout}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#fff',
      flex: 1,
    },
    avatarImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    userInfo: {
      flex: 1,
    },
    nameText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    emailText: {
      color: '#fff',
      fontSize: 14,
      marginBottom: 4,
    },
    profileCard: {
      backgroundColor: '#fdb7cf',
      borderRadius: 16,
      padding: 16,
      margin: 16,
      height: 150,
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative',
    },
    avatarCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#fff',
      marginRight: 12,
    },

    phoneText: {
      color: '#fff',
      fontSize: 16,
      marginBottom: 8,
    },
    vipBadge: {
      backgroundColor: '#FF9800',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    vipText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 12,
    },
    btxBox: {
      position: 'absolute',
      right: 16,
      top: 16,
      backgroundColor: '#fff',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      alignItems: 'center',
    },
    btxText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#6A45A6',
    },
    btxValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#6A45A6',
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    itemText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: '#333',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 20,
    },
    sectionText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      color: '#333',
    },
    orderStatusRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 16,
    },
    orderItem: {
      alignItems: 'center',
      position: 'relative',
    },
    orderIcon: {
      fontSize: 24,
    },
    orderText: {
      fontSize: 12,
      marginTop: 4,
      color: '#333',
    },
    dot: {
      position: 'absolute',
      top: -2,
      right: -4,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'red',
      zIndex: 1,
    },
  });
