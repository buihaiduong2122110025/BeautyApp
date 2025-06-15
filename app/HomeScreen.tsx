
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
const { width: screenWidth } = Dimensions.get('window');
const baseUrl = 'http://192.168.1.128:5000/api/customer';

const HomeScreen = ({ navigation }) => {

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const { width } = Dimensions.get('window');

  // Sử dụng dữ liệu tĩnh cho category và product
  const images = [
    require('../assets/banner/banner1.jpg'),
    require('../assets/banner/banner4.jpg'),
    require('../assets/banner/banner3.jpg')
  ];
  const scrollViewRef = useRef();
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [allServices, setAllServices] = useState([]);  // Thêm state để lưu tất cả dịch vụ
  const [businesses, setBusinesses] = useState([]);
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const bizRes = await axios.get(`${baseUrl}/business`);
        setBusinesses(bizRes.data.businesses);
      } catch (error) {
        console.error("Lỗi lấy doanh nghiệp:", error);
      }
    };

    fetchBusinesses();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = (currentIndex + 1) % images.length;
      scrollViewRef.current.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000); // Chuyển ảnh mỗi 3 giây

    return () => clearInterval(interval);
  }, [currentIndex]);
  const handleSearchSubmit = () => {
    if (searchQuery.trim() !== '') {
      navigation.navigate('SearchResultScreen', { query: searchQuery.trim() });
    }
  };
  



  const [activeFilter, setActiveFilter] = useState('sale');  // Đặt mặc định là 'all'
  const fetchData = async () => {
    try {
      const serviceRes = await axios.get('http://192.168.1.128:5000/api/customer/services');
      setAllServices(serviceRes.data); // Lưu tất cả dịch vụ vào state mới

      const categoryRes = await axios.get('http://192.168.1.128:5000/api/customer/categories');
      setCategories(categoryRes.data);
    } catch (errora) {
      console.error(errora);
      Alert.alert('Lỗi', errora.response?.data?.error || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Hàm để gọi API và tải dữ liệu dịch vụ theo bộ lọc
  const fetchServices = async (type = 'sale') => {
    setLoading(true);
    try {
      let url = 'http://192.168.1.128:5000/api/customer/services/sale';  // URL mặc định

      if (type === 'top-rated') url = 'http://192.168.1.128:5000/api/customer/services/top-rated';
      else if (type === 'most-booked') url = 'http://192.168.1.128:5000/api/customer/services/most-booked';
      else if (type === 'hot') url = 'http://192.168.1.128:5000/api/customer/services/admin';
      else if (type === 'all') url = 'http://192.168.1.128:5000/api/customer/services';

      const response = await axios.get(url);
      setServices(response.data);  // Cập nhật danh sách dịch vụ
      setActiveFilter(type); // Lưu trạng thái lọc
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dịch vụ.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  // Fetch dữ liệu khi component mount
  useEffect(() => {

    fetchServices('sale');  // Lọc tất cả dịch vụ khi mới mở app
    fetchData(); // Gọi API khi component được render lần đầu

  }, []); // Chỉ gọi một lần khi component mount

  return (
    <ScrollView style={styles.mainContainer}>
      <View className="relative rounded-b-2xl" style={{ height: 300 }}>
        {/* Hình nền */}
        <Image
          source={require('../assets/banner/banner1.jpg')} // Thay bằng ảnh của bạn
          style={styles.imageBackground}
          resizeMode="cover"
        />

        {/* Khung tìm kiếm */}
        <View style={styles.searchBar}>
          <TextInput
            placeholder="Tìm kiếm dịch vụ..."
            style={styles.input}
            value={searchQuery}
            onChangeText={handleSearchSubmit}
            onFocus={() => navigation.navigate('SearchResultScreen')}
          />

          {/* {searchQuery.trim() !== '' && (
  <View style={styles.searchResultsBox}>
    {services.length === 0 ? (
      <Text style={styles.noResultText}>Không tìm thấy dịch vụ phù hợp.</Text>
    ) : (
      services.map((item) => (
        <TouchableOpacity
          key={item.business_service_id}
          style={styles.resultItem}
          onPress={() => {
            navigation.navigate('ServiceDetail', { businessServiceId: item.business_service_id });
          }}
        >
          <Image
            source={{ uri: `http://192.168.1.128:5000/${item.image_url}` }}
            style={styles.resultImage}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.resultTitle} numberOfLines={1}>{item.service_name}</Text>
            <Text style={styles.resultPrice}>{item.original_price.toLocaleString()} VND</Text>
          </View>
        </TouchableOpacity>
      ))
    )}
  </View>
)} */}

          <TouchableOpacity style={styles.searchIcon}>
            <Text>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Khung chữ nhật nửa trên nửa dưới */}
        <View style={styles.overlayBox}>
          {/* 4 hình icon với chữ dưới */}
          <View style={styles.iconRow}>
            {/* 1. Cộng đồng */}
            <View style={styles.iconItem}>
              <TouchableOpacity onPress={() =>
                navigation.navigate('ChatBot')}>
                <Image source={require('../assets/icons/chat-bot_13330989.png')} style={styles.iconImage} />
                <Text style={styles.iconLabel}>Chat Bot</Text>
              </TouchableOpacity>
            </View>

            {/* 2. Lịch hẹn */}
            <View style={styles.iconItem}>
              <TouchableOpacity onPress={() =>
                navigation.navigate('Appoinment')}>
                <Image source={require('../assets/menu/appointment.png')} style={styles.iconImage} />
                <Text style={styles.iconLabel}>Lịch hẹn</Text>
              </TouchableOpacity>
            </View>

            {/* 3. Mã giảm giá */}
            <View style={styles.iconItem}>
            <TouchableOpacity onPress={() =>
                navigation.navigate('VoucherScreen')}>
              <Image source={require('../assets/menu/voucher.png')} style={styles.iconImage} />
              <Text style={styles.iconLabel}>Mã giảm giá</Text>
              </TouchableOpacity>
            </View>

            {/* 4. Reward */}
            <View style={styles.iconItem}>
            <TouchableOpacity onPress={() =>
                navigation.navigate('NotificationScreen')}>
              <Image source={require('../assets/menu/notification_1176400.png')} style={styles.iconImage} />
              <Text style={styles.iconLabel}>Thông báo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      {/* <Button title="Test Momo Payment Redirect" onPress={() => {
        Linking.openURL('reactexpoapp://PaymentSuccessScreen');
      }} /> */}

      <View style={{ padding: 10 }}>
        {/* <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all →</Text>
          </TouchableOpacity>
        </View> */}

        {/* <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ display: 'flex', flexDirection: 'row' }}>
     
          {categories.length > 0 && categories.map((item) => (
            <TouchableOpacity style={{ marginHorizontal: 10 }} key={item.id}>
              <View style={{ alignItems: 'center', padding: 10 }}>
                {item.image && (
                  <Image
                    source={{ uri: `http://192.168.1.128:5000/${item.image}` }}
                    style={styles.image}

                  />
                )}
                <Text style={styles.categoryText}>{item.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView> */}

        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >
            {images.map((image, index) => (
              <Image
                key={index}
                source={image}
                style={{ width, height: width * 0.5 }} // Tự động tỷ lệ ảnh (tỷ lệ 2:1)
                resizeMode="cover"  // Lấp đầy mà không cắt mất ảnh
              />
            ))}
          </ScrollView>
        </View>


        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { label: 'Tất cả', value: 'all', icon: require('../assets/icons/select_4056986.png') },
              { label: 'Hot Sale', value: 'sale', icon: require('../assets/icons/super-sale_6158278.png') },
              { label: 'Đánh giá cao', value: 'top-rated', icon: require('../assets/icons/rating_4676180.png') },
              { label: 'Đặt nhiều', value: 'most-booked', icon: require('../assets/icons/booking_12965599.png') },
              { label: 'Hot nhất', value: 'hot', icon: require('../assets/icons/hot_613614.png') },
            ].map(({ label, value, icon }) => (
              <TouchableOpacity
                key={value}
                style={[styles.filterButton, activeFilter === value && styles.activeFilter]}
                onPress={() => fetchServices(value)}  // Lọc dịch vụ khi nhấn nút
              >
                {/* Thêm biểu tượng trước tên lọc */}
                <Image source={icon} style={styles.iconStyle} />
                <Text style={[styles.filterText, activeFilter === value && styles.activeFilterText]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>


        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {services.length > 0 && services.map((item, index) => {
            const now = new Date();
            const isPromoActive = item.promo_price && new Date(item.start_date) <= now && new Date(item.end_date) >= now;

            // Định dạng giá
            const formatPrice = (price) => {
              if (price && !isNaN(price)) {
                return price.toLocaleString(); // Nếu giá trị hợp lệ, định dạng theo kiểu địa phương
              }
              return 'N/A'; // Nếu không hợp lệ, trả về "N/A"
            };

            return (
              <View style={styles.popularItemHorizontal} key={item.business_service_id}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('ServiceDetail', { businessServiceId: item.business_service_id });
                  }}
                >
                  <View style={{ justifyContent: 'center', alignItems: 'center', height: 100, width: 200 }}>
                    <Image
                      source={{ uri: `http://192.168.1.128:5000/${item.image_url}` }}
                      style={styles.popularImage22}
                    />
                  </View>
                  <Text style={styles.popularText} numberOfLines={2} ellipsizeMode="tail">
                    {item.service_name}
                  </Text>

                  {/* Kiểm tra xem có giá khuyến mãi hay không */}
                  {item.promo_price !== undefined && item.promo_price !== null && item.promo_price !== 0 ? (
                    <Text style={styles.popularPrice}>
                      <Text style={{ textDecorationLine: 'line-through', color: 'gray', fontSize: 12 }}>
                        {formatPrice(item.original_price)} VND
                      </Text>{' '}
                      <Text style={{ color: 'red', fontWeight: 'bold' }}>
                        {formatPrice(item.promo_price)} VND
                      </Text>
                    </Text>
                  ) : (
                    <Text style={styles.popularPrice}>{formatPrice(item.original_price)} VND</Text>
                  )}

                  {/* Hiển thị số lượt đánh giá nếu nhấn lọc "Đánh giá cao" */}
                  {activeFilter === 'top-rated' && item.avg_rating && (
                    <Text style={styles.metaText}>⭐ {parseFloat(item.avg_rating).toFixed(1)} ({item.total_reviews || 0} đánh giá)</Text>
                  )}

                  {/* Hiển thị số lượt mua nếu nhấn lọc "Mua nhiều" */}
                  {activeFilter === 'most-booked' && item.total_bookings !== undefined && (
                    <Text style={styles.metaText}>📅 {item.total_bookings} lượt đặt</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>


        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AllService')}
          >
            <Text style={styles.seeAllText}>Xem tất cả →</Text>
          </TouchableOpacity>
        </View>


        <View style={styles.productRow}>
          {allServices.length > 0 && allServices.map((item, index) => {
            const now = new Date();
            const isPromoActive = item.promo_price && new Date(item.start_date) <= now && new Date(item.end_date) >= now;

            return (
              <View style={styles.popularItem} key={item.business_service_id}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('ServiceDetail', { businessServiceId: item.business_service_id });
                  }}
                >
                  <Image
                    source={{ uri: `http://192.168.1.128:5000/${item.image_url}` }}
                    style={styles.popularImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.popularText} numberOfLines={2} ellipsizeMode="tail">
                    {item.service_name}
                  </Text>

                  {/* Hiển thị giá khuyến mãi nếu có */}
                  {isPromoActive ? (
                    <Text style={styles.popularPrice}>
                      <Text style={{ textDecorationLine: 'line-through', color: 'gray', fontSize: 12 }}>
                        {item.original_price.toLocaleString()} VND
                      </Text>{' '}
                      <Text style={{ color: 'red', fontWeight: 'bold' }}>
                        {item.promo_price.toLocaleString()} VND
                      </Text>
                    </Text>
                  ) : (
                    <Text style={styles.popularPrice}>{item.original_price.toLocaleString()} VND</Text>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}

        </View>
        {/* <ImageBackground source={require('../assets/images/banner.png')} style={styles.bannerContainer}>
        <Text style={styles.bannerText1}>High quality beauty services started</Text>
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <Text style={styles.discountText1}>70% </Text>
          <Text style={styles.discountText1off}>off </Text>
        </View>
        <Text style={styles.seeAllItemsText1}>See all items →</Text>
      </ImageBackground> */}
        {/* Rooms Section */}
        {/* <View style={styles.sectionHeader1}>
        <Text style={styles.sectionTitle}>Rooms</Text>
        <Text style={styles.sectionTitle1}>Furniture for every corner in your home</Text>
      </View> */}

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{ display: 'flex', flexDirection: 'row', marginBottom: 30 }}>
          <View style={{ paddingVertical: 10 }}>
            <Text style={{ fontSize: 18, fontFamily: 'BungeeInline', color: '#222', marginBottom: 12 }}>
              Các doanh nghiệp
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 10 }}
            >
              {businesses.map((biz) => (
                <TouchableOpacity
                  key={biz.id}
                  style={{
                    marginRight: 16,
                    alignItems: 'center',
                    width: 80
                  }}
                  onPress={() => navigation.navigate('BusinessDetailScreen', { businessId: biz.id })}
                >
                  <Image
                    source={{ uri: biz.logo_url.startsWith('http') ? biz.logo_url : `http://192.168.1.128:5000/${biz.logo_url}` }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: '#f2f2f2',
                      borderWidth: 1,
                      borderColor: '#ddd'
                    }}
                    resizeMode="cover"
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      textAlign: 'center',
                      marginTop: 6,
                      color: '#333'
                    }}
                    numberOfLines={2}
                  >
                    {biz.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>


        </ScrollView>
      </View>
    </ScrollView >
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  searchResultsBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    maxHeight: 300,
    overflow: 'scroll',
  },

  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },

  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  resultPrice: {
    fontSize: 12,
    color: '#888',
  },

  noResultText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
  },

  horizontalScroll: {
    marginTop: 20, // Để có một khoảng cách giữa các phần
    paddingHorizontal: 10, // Khoảng cách từ viền của màn hình
  },

  popularItemHorizontal: {
    height: 200,
    width: 200, // Kích thước mỗi item dịch vụ
    marginRight: 20, // Khoảng cách 20px giữa các dịch vụ
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    overflow: 'hidden',
    paddingBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5
  },
  mainContainer: {
    // padding: 20,
    backgroundColor: '#ffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#AAAAAA',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 15,
    // padding: 10,
    height: 55,
    backgroundColor: 'white',
    width: 300
  },

  inputStyle: {
    flex: 1,
    alignItems: 'center',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 10
  },
  sectionHeader1: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    color: 'black',
    // fontWeight: 'bold',
    fontFamily: "BungeeInline",

  },
  sectionTitle1: {
    fontSize: 13,
    fontWeight: '300',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '200',
    color: '#fdb7cf',
    fontFamily: "BungeeInline",

  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    borderWidth: 2,


  },
  image1: {
    width: 127,
    height: 195,
  },
  text: {
    position: 'absolute',
    top: 15,
    left: 5,
    color: 'black',
    fontSize: 16,
  },
  bannerContainer: {
    marginTop: 100,
    width: '100%',
    height: Dimensions.get('window').width * 0.5, // Responsive theo width của màn hình
  },
  bannerText1: {
    fontSize: 14,
    marginTop: 10,
    color: '#4E5471',
    fontFamily: 'NunitoBold'
  },
  discountText: {
    fontSize: 30,
    color: '#E29547',
  },
  discountText1: {
    fontSize: 32,
    color: '#4E5471',
    fontFamily: "BungeeInline",

  },
  discountText1off: {
    fontSize: 15,
    color: '#4E5471',
    marginTop: 18,

  },
  seeAllItemsText1: {
    marginTop: 10,
    color: '#4E5471',
    fontSize: 14,
  },
  productRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  popularItem: {
    width: '48%',
    marginBottom: 10,
  },
  popularImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  popularImage22: {
    width: '100%',
    height: 100,

    borderRadius: 10,
    resizeMode: 'contain',
  },

  popularText: {
    marginTop: 5,
    fontSize: 14,
    // fontWeight: '700',
    color: 'black',
    fontFamily: 'BungeeInline'
  },
  popularPrice: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '600',
    color: '#121212',
    fontFamily: 'NunitoBold'
  },
  imageBackground: {
    width: '100%',
    height: 300,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 200,
  },
  searchBar: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    // color:"red",
    // backgroundColor: '',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: '#fff'
  },
  input: {
    flex: 1,
    padding: 5,
    color: "black",
    fontWeight: '800',
    fontFamily: "Lexend",

  },
  searchIcon: {
    padding: 5,
  },
  overlayBox: {
    position: 'absolute',
    bottom: -80, // nửa trên nửa dưới hình
    left: screenWidth * 0.05, // giảm để căn giữa nếu width lớn
    width: screenWidth * 0.9, // tăng chiều rộng
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,

  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
  },
  iconItem: {
    alignItems: 'center',
    width: 70, // Điều chỉnh kích thước mỗi mục icon
  },
  iconImage: {
    width: 50,
    height: 50,
    marginBottom: 5,
    resizeMode: 'contain',
  },
  iconLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  filterContainer: {
    marginTop: 15,
    flexDirection: 'row',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#aaa',
    alignItems: 'center',  // Đảm bảo văn bản và hình ảnh được căn chỉnh đúng
    marginRight: 10,
  },
  iconStyle: {
    width: 20,  // Đặt kích thước cho biểu tượng
    height: 20,
    marginRight: 5,  // Khoảng cách giữa biểu tượng và văn bản
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  activeFilter: {
    backgroundColor: '#fdb7cf',
  },
  activeFilterText: {
    color: '#fff',
  },
});
