import { Entypo, FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TestScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Thanh tìm kiếm */}
        <View className="flex-row items-center bg-white px-4 py-2">
          <View className="flex-1 flex-row items-center bg-gray-200 rounded-full px-4 py-2">
            <Ionicons name="search" size={20} color="gray" />
            <TextInput
              placeholder="Bạn muốn tìm kiếm gì?"
              className="ml-2 flex-1 text-gray-800"
            />
          </View>
        </View>

        {/* Banner */}
        <TouchableOpacity className="mx-4 mt-2 rounded-lg overflow-hidden">
          <Image
            source={{ uri: 'https://your-banner-image-url-here.com/banner.jpg' }}
            className="w-full h-40"
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Menu icon */}
        <View className="flex-row justify-around mt-4">
          <TouchableOpacity className="items-center">
            <Ionicons name="megaphone-outline" size={30} color="#6A5ACD" />
            <Text className="mt-1 text-xs">Cộng đồng</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <FontAwesome5 name="calendar-alt" size={30} color="#6A5ACD" />
            <Text className="mt-1 text-xs">Lịch hẹn</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <MaterialIcons name="local-offer" size={30} color="#6A5ACD" />
            <Text className="mt-1 text-xs">Mã giảm giá</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Entypo name="gift" size={30} color="#6A5ACD" />
            <Text className="mt-1 text-xs">Reward</Text>
          </TouchableOpacity>
        </View>

        {/* Dịch vụ chính */}
        <View className="flex-row justify-around mt-6">
          <TouchableOpacity className="items-center">
            <Ionicons name="flower-outline" size={30} color="#FF69B4" />
            <Text className="mt-1 text-xs">Spa</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <FontAwesome5 name="paint-brush" size={30} color="#FF69B4" />
            <Text className="mt-1 text-xs">Nail</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <MaterialIcons name="content-cut" size={30} color="#FF69B4" />
            <Text className="mt-1 text-xs">Salon</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Ionicons name="medkit-outline" size={30} color="#FF69B4" />
            <Text className="mt-1 text-xs">Phòng khám</Text>
          </TouchableOpacity>
          <TouchableOpacity className="items-center">
            <Entypo name="shop" size={30} color="#FF69B4" />
            <Text className="mt-1 text-xs">Thẩm mỹ</Text>
          </TouchableOpacity>
        </View>

        {/* Gợi ý dịch vụ */}
        <View className="mt-6 px-4">
          <Text className="font-bold text-lg text-gray-800">Khuyến mãi HOT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
            {/* Item dịch vụ */}
            <View className="bg-white rounded-lg shadow-md mr-4 w-40">
              <Image
                source={{ uri: 'https://your-service-image-url.com/service1.jpg' }}
                className="h-24 w-full rounded-t-lg"
                resizeMode="cover"
              />
              <View className="p-2">
                <Text className="font-bold text-sm">Massage Body</Text>
                <Text className="text-pink-500 font-semibold">269,000 đ</Text>
              </View>
            </View>
            {/* Thêm nhiều item dịch vụ khác */}
          </ScrollView>
        </View>

      </ScrollView>

      {/* Bottom Navigation */}
      <View className="flex-row justify-around bg-white py-3 border-t border-gray-200">
        <TouchableOpacity className="items-center">
          <Ionicons name="home" size={24} color="#6A5ACD" />
          <Text className="text-xs">Trang chủ</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="star" size={24} color="gray" />
          <Text className="text-xs">Review</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="grid" size={24} color="gray" />
          <Text className="text-xs">Danh mục</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <FontAwesome5 name="calendar-alt" size={24} color="gray" />
          <Text className="text-xs">Lịch hẹn</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Ionicons name="person-circle" size={24} color="gray" />
          <Text className="text-xs">Tài khoản</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TestScreen;
