import axios from 'axios';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export const registerAndSaveExpoToken = async (token: string) => {
  try {
    if (!Device.isDevice) {
      console.warn('❌ Không phải thiết bị thật');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('❌ Không cấp quyền nhận thông báo');
      return;
    }

    const expoToken = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('✅ Expo Push Token:', expoToken);

    await axios.post('http://192.168.1.128:5000/api/customer/save-token', 
      { expo_push_token: expoToken },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ Đã lưu token về server');
  } catch (error) {
    console.error('❌ Lỗi khi gửi Expo Push Token:', error);
  }
};
