import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Button,
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileEditScreen() {
  const navigation = useNavigation();

  const [userInfo, setUserInfo] = useState({
    id: 0,
    name: '',
    email: '',
    phone: '',
    avatar: '',
  });
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://192.168.1.128:5000/api/customer/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUserInfo(data.customer);
          if (data.customer.avatar) {
            setAvatarUri(`http://192.168.1.128:5000/${data.customer.avatar.replace(/\\/g, '/')}`);
          }
        } else {
          Alert.alert('Lỗi khi lấy thông tin người dùng');
        }
      } catch (err) {
        console.log('Lỗi lấy info:', err);
        Alert.alert('Lỗi kết nối server');
      }
    };
    fetchUser();
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Bạn cần cấp quyền truy cập thư viện ảnh!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images ?? 'Images',  // Sửa ở đây
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi khi chọn ảnh');
    }
  }, []);


  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Bạn chưa đăng nhập');
        return;
      }

      if (!userInfo.id) {
        Alert.alert('Không có thông tin người dùng');
        return;
      }

      const formData = new FormData();
      formData.append('name', userInfo.name);
      formData.append('email', userInfo.email);
      formData.append('phone', userInfo.phone);

      if (avatarUri && avatarUri.startsWith('file://')) {
        const filename = avatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('avatar', {
          uri: avatarUri,
          name: filename,
          type,
        } as any);
      }

      const response = await fetch(`http://192.168.1.128:5000/api/customer/updateProfile/${userInfo.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(Platform.OS === 'ios' ? {} : { 'Content-Type': 'multipart/form-data' }),
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Cập nhật thành công');
      } else {
        Alert.alert('Cập nhật thất bại');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi khi cập nhật thông tin');
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image style={{
            width: 50, height: 50
          }} source={require('../assets/icons/left.png')} />

        </TouchableOpacity>
        <Text style={{ fontFamily: 'BungeeInline', marginLeft: 30, fontSize: 20 }}>Chỉnh sửa thông tin</Text>

      </View>
      <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text>Chọn ảnh</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Nút test chọn ảnh, bạn có thể bỏ qua nếu muốn */}
      <Button title="Chọn ảnh mới" onPress={pickImage} />

      <Text>Name:</Text>
      <TextInput
        style={styles.input}
        value={userInfo.name}
        onChangeText={text => setUserInfo({ ...userInfo, name: text })}
      />

      <Text>Email:</Text>
      <TextInput
        style={styles.input}
        value={userInfo.email}
        onChangeText={text => setUserInfo({ ...userInfo, email: text })}
        keyboardType="email-address"
      />

      <Text>Phone:</Text>
      <TextInput
        style={styles.input}
        value={userInfo.phone}
        onChangeText={text => setUserInfo({ ...userInfo, phone: text })}
        keyboardType="phone-pad"
      />

      <Button title="Lưu thông tin" onPress={handleSave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    // fontSize: 20,
    // fontWeight: 'bold',
    marginBottom: 16,
    // textAlign: 'center',
    backgroundColor: '#fdb7cf',
    color: '#5a40d1'
  },
  container: { padding: 16, flex: 1 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12, padding: 8 },
});
