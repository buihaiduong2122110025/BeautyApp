import CustomAddModal from '@/components/CustomAddModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function ServiceDetailScreen({ route, navigation }) {
  const { businessServiceId } = route.params;
  const [serviceDetail, setServiceDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [existingReview, setExistingReview] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', id: null });
  const [cartItems, setCartItems] = useState([]);
  const [showFullServiceName, setShowFullServiceName] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [reviewImage, setReviewImage] = useState<null | { uri: string, name?: string, type?: string }>(null);
  const [loadingButton, setLoadingButton] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchServiceDetail();
    getUserInfo();  // getUserInfo sẽ tự fetchReviews khi có user
  }, [businessServiceId]);
  // useEffect(() => {
  //   fetchServiceDetail();
  //   getUserInfo(); // Đợi getUserInfo lấy user.id rồi mới fetchReviews
  // }, [businessServiceId]);

  // useEffect(() => {
  //   if (customer.id) {
  //     fetchReviews(customer.id);  // Gọi fetchReviews sau khi có customer.id
  //   }
  // }, [customer.id, businessServiceId]);

  const pickReviewImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Bạn cần cấp quyền truy cập thư viện ảnh');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setReviewImage({
        uri: asset.uri,
        name: asset.fileName ?? 'review.jpg',
        type: asset.type ?? 'image/jpeg',
      });
    }
  };
  const fetchServiceDetail = async () => {
    try {
      const response = await axios.get(`http://192.168.1.128:5000/api/customer/services/${businessServiceId}`);
      setServiceDetail(response.data);
      setSelectedImage(`http://192.168.1.128:5000/${response.data.image_url}`); // ✅ Thêm dòng này

    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tải thông tin dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      console.log("Dữ liệu từ AsyncStorage:", storedUser);
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setCustomer({
          name: parsed.name,
          phone: parsed.phone,
          email: parsed.email,
          id: parsed.id,
        });

        // 🏷️ Gọi fetchReviews tại đây, đợi customer.id chắc chắn có
        fetchReviews(parsed.id);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  const handleChat = async () => {
    try {
      // Tạo một cuộc trò chuyện mới với doanh nghiệp đã chọn nếu chưa có cuộc trò chuyện
      const res = await fetch('http://192.168.1.128:5000/api/chat/start-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          partner_id: serviceDetail.business_id,  // ID của doanh nghiệp
          partner_type: 'business',  // Doanh nghiệp là đối tác trò chuyện
        }),
      });

      const data = await res.json();
      console.log('API response:', data);

      if (data.chat) {
        console.log('Cuộc trò chuyện đã được tạo thành công:', data.chat);

        // Chuyển sang màn hình ChatScreen và truyền chatId cùng thông tin doanh nghiệp
        navigation.navigate('ChatScreen', {
          customer_id: customer.id,
          chatId: data.chat.id,
          partnerId: serviceDetail.business_id,
          partnerType: 'business',
          businessName: serviceDetail.business_name,  // Tên doanh nghiệp
          businessImage: serviceDetail.business_image,  // Hình ảnh doanh nghiệp
        });
      } else {
        Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện');
      }
    } catch (error) {
      console.error('Lỗi tạo chat:', error);
      Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện');
    }
  };


  const handleChatWithAdmin = async () => {
    const partnerType = 'admin'; // Chat với Admin
    const partnerId = 1; // ID của Admin là cố định (1)

    try {
      // Tạo cuộc trò chuyện với Admin
      const res = await fetch('http://192.168.1.128:5000/api/chat/start-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          partner_id: partnerId,  // ID của Admin
          partner_type: partnerType,  // Loại đối tác là admin
        }),
      });

      const data = await res.json();
      console.log('API response:', data);

      if (data.chat) {
        console.log('Cuộc trò chuyện với Admin đã được tạo thành công:', data.chat);

        // Chuyển sang màn hình ChatScreen và truyền chatId và thông tin Admin
        navigation.navigate('ChatAdminScreen', {
          customer_id: customer.id,
          chatId: data.chat.id,
          partnerId: partnerId,
          partnerType: partnerType,
        });
      } else {
        Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện với Admin');
      }
    } catch (error) {
      console.error('Lỗi tạo chat với Admin:', error);
      Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện với Admin');
    }
  };


  const fetchReviews = async (customerId) => {
    try {
      console.log(`Đang tải reviews cho businessServiceId: ${businessServiceId} với customer id: ${customerId}`);
      const response = await axios.get(`http://192.168.1.128:5000/api/customer/reviews/business_service/${businessServiceId}`);
      console.log('Reviews nhận được:', response.data);
      setReviews(response.data);
      const customerReview = response.data.find(review => review.customer_id === customerId);
      console.log('Đánh giá của customer hiện tại:', customerReview);
      if (customerReview) {
        setExistingReview(customerReview);
        setComment(customerReview.comment);
        setRating(customerReview.rating);
      } else {
        setExistingReview(null);
      }
      return true;  // ✅ Đánh dấu hoàn thành
    } catch (error) {
      setReviews([]);
      return false;  // Đánh dấu lỗi
    }
  };

  const createReview = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để đánh giá dịch vụ");
      return;
    }

    const formData = new FormData();
    formData.append('business_service_id', businessServiceId);
    formData.append('comment', comment);
    formData.append('rating', rating.toString());
    if (reviewImage && reviewImage.uri) {
      const filename = reviewImage.uri.split('/').pop() || 'review.jpg';
      const type = /\.(\w+)$/.exec(filename)?.[1] ?? 'jpeg';
      formData.append('image', { uri: reviewImage.uri, name: filename, type: `image/${type}` });
    }

    try {
      const response = await fetch('http://192.168.1.128:5000/api/customer/reviews', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Thông báo", data.message || "Đã tạo đánh giá thành công!");
        const done = await fetchReviews(customer.id);  // ✅ Đợi load xong
        if (done) {
          setComment('');
          setRating(5);
          setReviewImage(null);
        }
      } else {
        Alert.alert("Lỗi", data.error || "Không thể tạo đánh giá");
      }
    } catch (error) {
      // console.error("Lỗi khi tạo đánh giá:", error);
      // Alert.alert("Lỗi", "Không thể tạo đánh giá.");
    }
  };
  const updateReview = async () => {
    if (loadingButton) return;
    setLoadingButton(true);
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để chỉnh sửa đánh giá");
      setLoadingButton(false);
      return;
    }

    const formData = new FormData();
    formData.append('comment', comment);
    formData.append('rating', rating.toString());
    if (reviewImage && reviewImage.uri) {
      const filename = reviewImage.uri.split('/').pop() || 'review.jpg';
      const type = /\.(\w+)$/.exec(filename)?.[1] ?? 'jpeg';
      formData.append('image', { uri: reviewImage.uri, name: filename, type: `image/${type}` });
    }

    try {
      const response = await fetch(`http://192.168.1.128:5000/api/customer/reviews/${existingReview.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Thông báo", data.message || "Cập nhật đánh giá thành công!");
        const done = await fetchReviews(customer.id);
        if (done) {
          setComment('');
          setRating(5);
          setReviewImage(null);
          setExistingReview(null);
        }
      } else {
        Alert.alert("Lỗi", data.error || "Không thể cập nhật đánh giá");
      }
    } catch (error) {
      // console.error("Lỗi khi cập nhật đánh giá:", error);
      // Alert.alert("Lỗi", "Không thể cập nhật đánh giá.");
    }
    setLoadingButton(false);
  };


  const deleteReview = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để xóa đánh giá");
      return;
    }

    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa đánh giá này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          onPress: async () => {
            try {
              const response = await fetch(`http://192.168.1.128:5000/api/customer/reviews/${existingReview.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await response.json();
              console.log("Kết quả xóa:", data);
              if (response.ok) {
                Alert.alert("Thông báo", data.message || "Đã xóa đánh giá");
                fetchReviews(customer.id);  // Tải lại danh sách
                setExistingReview(null);
                setComment('');
                setRating(5);
              } else {
                Alert.alert("Lỗi", data.error || "Không thể xóa đánh giá");
              }
            } catch (error) {
              console.error("Lỗi xóa đánh giá:", error);
              Alert.alert("Lỗi", "Không thể xóa đánh giá");
            }
          },
        },
      ]
    );
  };


  const addToCart = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để thêm dịch vụ");
      return;
    }

    if (!serviceDetail) {
      Alert.alert("Lỗi", "Thông tin dịch vụ chưa sẵn sàng");
      return;
    }

    // 🎉 Log thông tin chi tiết để kiểm tra giá được truyền vào
    console.log('📌 addToCart - Dữ liệu gửi:', {
      serviceId: serviceDetail.service_id,
      businessServiceId: serviceDetail.business_service_id,
      price: displayPrice,
      businessId: serviceDetail.business_id,
      quantity: 1
    });

    try {
      const response = await axios.post(
        'http://192.168.1.128:5000/api/customer/cart/add',
        {
          serviceId: serviceDetail.service_id,
          quantity: 1,
          price: parseFloat(displayPrice),  // Giá khuyến mãi nếu có, fallback gốc
          businessId: serviceDetail.business_id,
          businessServiceId: serviceDetail.business_service_id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.message) {
        // Alert.alert("Thông báo", response.data.message);
        fetchCart();
      }
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng");
    }
  };


  const fetchCart = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;
    try {
      const response = await axios.get('http://192.168.1.128:5000/api/customer/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.cart) {
        setCartItems(response.data.cart);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const renderStars = () => {
    let stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= rating ? "star" : "star-o"}
          size={30}
          color="#FFD700"
          onPress={() => setRating(i)}  // 👉 Gán trực tiếp số sao được chọn
        />
      );
    }
    return stars;
  };


  const toggleFullServiceName = () => setShowFullServiceName(!showFullServiceName);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
      </View>
    );
  }

  // 🎉 Ngay đây: xử lý biến giá để dùng trong JSX và hàm
  const now = new Date();
  const isPromotionActive = serviceDetail?.promotion &&
    new Date(serviceDetail.promotion.start_date) <= now &&
    now <= new Date(serviceDetail.promotion.end_date);

  const originalPrice = serviceDetail?.price ?? 0;
  const displayPrice = isPromotionActive ? serviceDetail?.promotion?.promo_price ?? originalPrice : originalPrice;


  return (
    <View style={{ flex: 1 }}>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Image style={{
          width: 50, height: 50, top: 0, right: 2, zIndex: 1,
        }} source={require('../assets/icons/back.png')} />

      </TouchableOpacity>


      <ScrollView style={styles.container}>


        {serviceDetail && (
          <>
            {/* Slider Image using FlatList */}
            <Image source={{ uri: selectedImage }} style={styles.serviceImage} />
            {/* Ảnh phụ */}
            {serviceDetail.images && serviceDetail.images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10, marginHorizontal: 10 }}>
                {serviceDetail.images.map((imgUrl, idx) => (
                  <TouchableOpacity key={idx} onPress={() => setSelectedImage(`http://192.168.1.128:5000/${imgUrl}`)}>
                    <Image
                      source={{ uri: `http://192.168.1.128:5000/${imgUrl}` }}
                      style={{ width: 200, height: 100, borderRadius: 8, marginRight: 10 }}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            {/* <Text style={styles.header}>{serviceDetail.service_name}</Text> */}
            <View style={{ paddingHorizontal: 10 }}>

              <Text style={styles.serviceName}>{serviceDetail.service_name}| {serviceDetail.business_name} </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                <Image style={{ width: 20, height: 20, marginRight: 4 }} source={require('../assets/icons/time.png')} />
                <Text style={{ fontSize: 14, lineHeight: 20, marginRight: 10 }}>{serviceDetail.duration} phút</Text>

                <Image style={{ width: 20, height: 20, marginRight: 4 }} source={require('../assets/icons/shopping.png')} />
                <Text style={{ fontSize: 14, lineHeight: 20, marginRight: 10 }}>30</Text>
                <Image
                  style={{ width: 20, height: 20, marginRight: 4, resizeMode: 'contain' }}
                  source={require('../assets/icons/heart.png')}
                />
                <Text style={{ fontSize: 14, lineHeight: 20 }}>10</Text>
              </View>


              {serviceDetail ? (
                <View style={{ marginVertical: 15, flexDirection: 'row' }}>
                  {/* <Text style={styles.priceLabel}>Total Price</Text> */}
                  <View style={{
                    width: 40, marginRight: 10, height: 25, backgroundColor: '#fc721d', alignItems: 'center', justifyContent: 'center', borderRadius: 5,
                  }}>
                    <Text style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Lexend', color: '#fff' }}>
                      20%
                    </Text>
                  </View>
                  {isPromotionActive ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'red', marginRight: 10 }}>
                        {displayPrice.toLocaleString()} VND
                      </Text>
                      <Text style={{ fontSize: 16, color: '#888', textDecorationLine: 'line-through' }}>
                        {originalPrice.toLocaleString()} VND
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{originalPrice.toLocaleString()} VND</Text>
                  )}
                </View>
              ) : (
                <ActivityIndicator size="small" color="#0000ff" />
              )}

              {/* <Text style={styles.subHeader}>Danh mục: {serviceDetail.category_id}</Text> */}

              {/* <Text style={styles.businessName}>Doanh Nghiệp: {serviceDetail.business_name}</Text> */}
              {/* <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Mô Tả: </Text> */}

              <Text style={styles.descriptiontitle}>Mô tả chi tiết</Text>
              <Text style={styles.description}>{serviceDetail.description}</Text>

              {/* <Text style={styles.descriptiontitle}>Hướng dẫn sử dụng</Text>
              <Text style={styles.description}>{serviceDetail.usage_guide}</Text>

              <Text style={styles.descriptiontitle}>Điều khoản/Chính sách</Text>
              <Text style={styles.description}>{serviceDetail.terms_policy}</Text> */}

              {/* Hướng dẫn sử dụng */}
              <Text style={styles.sectionTitle}>Hướng dẫn sử dụng</Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>{'\u2022'}</Text>
                <Text style={styles.bulletText}>Bước 1: Lựa chọn và thanh toán sản phẩm / dịch vụ.</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>{'\u2022'}</Text>
                <Text style={styles.bulletText}>Bước 2: Đặt hẹn ngay khi thanh toán hoặc Đặt hẹn sau tại mục Đặt hẹn.</Text>
              </View>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>{'\u2022'}</Text>
                <Text style={styles.bulletText}>Bước 3: Đến cơ sở, xuất trình đơn hàng đã thanh toán thành công</Text>
              </View>

              {/* Điều khoản/Chính sách */}
              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Điều khoản/Chính sách</Text>

              <Text style={styles.subTitle}>Xác nhận</Text>
              <Text style={styles.paragraph}>
                Xác nhận ngay tức thời qua thông báo khi bạn mua dịch vụ đặt hẹn thành công. Sau đó, Spa/Salon/TMV sẽ liên hệ xác nhận với bạn một lần nữa để đảm bảo thời gian đặt lịch hẹn. Nếu bạn không nhận được tin nhắn cuộc gọi nào, hãy liên hệ với chúng tôi qua hotline 0289 9959 938.
              </Text>

              <Text style={styles.subTitle}>Chính sách hủy</Text>
              <Text style={styles.paragraph}>
                Không hoàn, hủy hay thay đổi sau khi đã mua dịch vụ
              </Text>




              <View style={styles.businessContainer}>
                {/* Profile Image */}
                <Image
                  source={{ uri: `http://192.168.1.128:5000/${serviceDetail.business_image}` }} // Seller's image URL
                  style={styles.profileImage}
                />

                {/* Seller Information */}
                <View style={styles.sellerInfoContainer}>
                  <Text style={styles.sellerName}>{serviceDetail.business_name}</Text>
                  <Text style={styles.businessName}>{serviceDetail.business_address}</Text>
                </View>

                {/* Icons for message and call */}
                <View style={styles.iconContainer}>
                  <TouchableOpacity style={styles.businessDetail}>
                    <Image style={{ width: 15, height: 15, resizeMode: 'contain', right: 5 }} source={require('../assets/images/pen.png')} />

                    <Text style={styles.textbusiness}>
                      Xem chi tiết
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.businessDetail}>
                    <Image style={{ right: 10, width: 15, height: 15, resizeMode: 'contain', }} source={require('../assets/icons/heart.png')} />

                    <Text style={styles.textbusiness}>
                      Theo dõi
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>



              <View style={styles.reviewsContainer}>
                <Text style={styles.reviewsHeader}>Đánh giá và Bình luận</Text>

                {/* Danh sách đánh giá */}
                {reviews.map((item) => (
                  <View key={item.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Image
                        source={require('../assets/images/user.png')} // ảnh đại diện mặc định
                        style={styles.avatar}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.reviewName}>{item.customer_name}</Text>
                        <View style={{ flexDirection: 'row' }}>{renderStars(item.rating)}</View>
                      </View>
                    </View>
                    <Text style={styles.reviewComment}>{item.comment}</Text>

                    {item.image && (
                      <Image
                        source={{ uri: `http://192.168.1.128:5000/${item.image.replace(/\\/g, '/')}` }}
                        style={styles.reviewImage}
                      />
                    )}
                  </View>
                ))}
              </View>

              {/* Form đánh giá */}
              <View style={styles.reviewInputContainer}>
                <Text style={styles.reviewsHeader}>
                  {existingReview ? 'Chỉnh sửa đánh giá của bạn' : 'Viết đánh giá'}
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Nhập nội dung đánh giá..."
                  value={comment}
                  onChangeText={setComment}
                  multiline
                />

                <TouchableOpacity style={styles.imagePicker} onPress={pickReviewImage}>
                  <Text style={styles.imagePickerText}>
                    {existingReview ? 'Chọn ảnh mới cho đánh giá' : 'Chọn ảnh cho đánh giá'}
                  </Text>
                </TouchableOpacity>

                {reviewImage && <Image source={{ uri: reviewImage.uri }} style={styles.previewImage} />}
                {!reviewImage && existingReview?.image && (
                  <Image source={{ uri: `http://192.168.1.128:5000/${existingReview.image.replace(/\\/g, '/')}` }} style={styles.previewImage} />
                )}

                <View style={styles.starsContainer}>{renderStars(rating)}</View>

                {existingReview ? (
                  <>
                    <TouchableOpacity style={styles.deleteButton} onPress={deleteReview}>
                      <Text style={styles.buttonText}>Xóa Đánh Giá</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonReview} onPress={updateReview}>
                      <Text style={styles.buttonText}>Cập nhật Đánh Giá</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity style={styles.buttonReview} onPress={createReview}>
                    <Text style={styles.buttonText}>Đánh Giá</Text>
                  </TouchableOpacity>
                )}
              </View>

            </View>

          </>
        )}
      </ScrollView>
      <View style={styles.fixedBottomBar}>

        <View style={styles.buttonContainer}>
          {/* <View style={styles.button1}>
            <TouchableOpacity
              onPress={handleChat} // Hàm xử lý sự kiện khi nhấn nút "Chat"
              style={styles.button1}
            >
              <Image style={styles.iconCheck} source={require('../assets/icons/talk_4509111.png')} />
              <Text style={styles.buttonText}>Chat</Text>
            </TouchableOpacity>
          </View> */}
          {/* Nút "Chat với Admin" */}
          <View style={styles.button1}>
            <TouchableOpacity
              onPress={handleChatWithAdmin} // Chat với Admin
              style={styles.button1}
            >
              <Image style={styles.iconCheck} source={require('../assets/icons/talk_4509111.png')} />
              <Text style={styles.buttonText}>Chat </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button1} onPress={() => setShowAddModal(true)}
          >
            <Image style={styles.iconCheck} source={require('../assets/icons/cart_1123796.png')} />

            <Text style={styles.buttonText}>Thêm Yêu Thích</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button1}
            onPress={() => {
              const now = new Date();
              const isPromotionActive = serviceDetail?.promotion &&
                new Date(serviceDetail.promotion.start_date) <= now &&
                now <= new Date(serviceDetail.promotion.end_date);
              const originalPrice = serviceDetail?.price ?? 0;
              const displayPrice = isPromotionActive ? serviceDetail?.promotion?.promo_price ?? originalPrice : originalPrice;

              console.log("📌 Đặt Lịch Ngay - Dữ liệu gửi:", {
                price: displayPrice,
                isPromotionActive,
              });

              navigation.navigate('CheckoutScreen', {
                customer,
                business: {
                  image: `http://192.168.1.128:5000/${serviceDetail.business_image}`,
                  name: serviceDetail.business_name,
                  address: serviceDetail.business_address,
                  id: serviceDetail.business_id,
                },
                service: {
                  service_id: serviceDetail.service_id,
                  name: serviceDetail.service_name,
                  quantity: 1,
                  image: `http://192.168.1.128:5000/${serviceDetail.image_url}`,
                  price: displayPrice,  // ✅ Đảm bảo lấy giá khuyến mãi nếu có
                  business_service_id: serviceDetail.business_service_id,

                },
              });
            }}
          >
            <Image style={styles.iconCheck} source={require('../assets/icons/buy-now_5583183.png')} />

            <Text style={styles.buttonText}>Đặt Lịch Ngay</Text>
          </TouchableOpacity>

        </View>
      </View>
      <CustomAddModal
        visible={showAddModal}
        item={{
          service_image: serviceDetail.image_url,
          service_name: serviceDetail.service_name,
          category_name: serviceDetail.category_name,
          price: displayPrice,
        }}
        onCancel={() => setShowAddModal(false)}
        onConfirm={() => {
          setShowAddModal(false);
          addToCart(); // Gọi hàm thực sự khi người dùng xác nhận
        }}
      />

    </View>



  );


}

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  
  reviewName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  
  reviewComment: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  
  reviewImage: {
    width: '100%',
    height: 180,
    marginTop: 10,
    borderRadius: 8,
  },
  
  previewImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 10,
  },
  
  imagePicker: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  
  imagePickerText: {
    fontSize: 14,
    color: '#333',
  },
  
  deleteButton: {
    backgroundColor: '#FF4444',
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  
  buttonReview: {
    backgroundColor: '#fdb7cf',
    padding: 12,
    borderRadius: 10,
    marginVertical: 5,
    alignItems: 'center',
  },
  
  reviewsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#fdb7cf',
  },
  
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 10,
  },
  
  iconCheck: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  // buttonReview: {
  //   width: 200,
  //   // padding:20,
  //   alignItems: 'center',
  //   borderRadius: 10,
  //   justifyContent: 'center',
  //   height: 40,
  //   backgroundColor: '#FFFF00'

  // },
  fixedBottomBar: {
    alignItems: 'center',
    width: '100%',
    height: 80,
    flexDirection: 'row',
    backgroundColor: '',
    paddingBottom: 10,
    // borderStartStartRadius:20,
    borderTopLeftRadius: 20,  // Cắt góc trên bên trái
    borderTopRightRadius: 20, // Cắt góc trên bên phải
  },
  buttonContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  button1: {
    // margin: 10,
    width: 120,
    marginHorizontal: 5,
    // marginLeft: 10,
    height: 50,
    borderRadius: 20,
    backgroundColor: '#fdb7cf',
    justifyContent: 'center',  // Căn giữa theo chiều dọc
    alignItems: 'center',      // Căn giữa theo chiều ngang
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'NunitoBold'
  },
  container: {
    flex: 1,
    // padding: 20,
    backgroundColor: '#f7f7f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartshare: {
    position: 'absolute',
    top: 45,
    left: 270,
    zIndex: 1,
    flexDirection: 'row',

  },
  backButton: {
    // paddingVertical: 15,
    // paddingHorizontal: 20,
    position: 'absolute',
    top: 30,
    left: 10,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // nền trắng mờ 60%
    borderRadius: 40,
    width: 50,
    height: 50,

  },
  backButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center'

  },
  serviceImage: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    marginBottom: 20,
    // marginTop: 30,
    backgroundColor: '#eee',
    // marginHorizontal: 5,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  subHeader: {
    fontSize: 18,
    color: '#777',
    marginBottom: 15,
  },
  serviceName: {
    fontSize: 19,
    color: '#333',
    // fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 20,
    flexWrap: 'wrap',
    fontFamily: 'NunitoBold',
  },
  businessName: {
    fontSize: 13,
    color: '#000',
    marginBottom: 15,
    // fontWeight: 'bold',
    fontFamily: 'NunitoLight',

  },
  description: {
    fontSize: 16,
    color: '#555',
    marginVertical: 20,
    fontFamily: 'NunitoLight',

  },

  descriptiontitle: {
    fontFamily: 'NunitoBold',
    fontSize: 20,
    color: '#fdb7cf',
    marginTop: 10
  },
  duration: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
  },
  businessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fdb7cf',
    padding: 10,
    borderRadius: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25, // Circular image
    marginRight: 15,
  },
  sellerInfoContainer: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    // fontWeight: 'bol/d',
    color: '#333',
    fontFamily: 'NunitoBold',

  },

  iconContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  businessDetail: {
    flexDirection: 'row',
    padding: 5,
    width: 90,
    height: 35,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0', // Light background for the button
  },

  textbusiness: {
    fontFamily: 'NunitoLight',
    // marginLeft:3,
    fontSize: 10
  },
  reviewsContainer: {
    marginBottom: 30,
  },
  reviewsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  review: {
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    elevation: 3,
  },
  reviewText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  reviewRating: {
    fontSize: 14,
    color: '#FFD700',
  },
  reviewInputContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  // starsContainer: {
  //   flexDirection: 'row',
  //   marginBottom: 10,
  // },

  sectionTitle: {
    fontSize: 18,
    color: '#fdb7cf', // màu tím giống ảnh
    fontWeight: '600',
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 20,
    marginRight: 6,
    fontFamily: 'NunitoBold',

  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#000',

    fontFamily: 'NunitoLight',

  },
  subTitle: {
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 6,
    marginTop: 12,
    fontFamily: 'NunitoBold',

  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000',
    fontFamily: 'NunitoLight',

  },
});
