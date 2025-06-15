import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { RadioButton } from 'react-native-paper';
import CustomRemoveModal from '../components/CustomRemoveModal';

export default function CartScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedItemToRemove, setSelectedItemToRemove] = useState(null);





  const fetchCart = async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để xem giỏ hàng");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://192.168.1.128:5000/api/customer/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedCart = response.data.cart || [];
      console.log("📌 Dữ liệu cart từ server:", updatedCart);

      setCartItems(updatedCart);

      if (updatedCart.length === 0) {
        console.log("🛒 Cart trống");
        setSelectedService(null);
        setTotalPrice(0);
      } else {
        // Log chi tiết từng item
        updatedCart.forEach(item => {
          const price = item.display_price ?? item.original_price ?? 0;
          const itemTotal = price * item.quantity;
          console.log(`🛒 Item: ${item.service_name}, Giá: ${price}, SL: ${item.quantity}, Tổng: ${itemTotal}`);
        });

        // Nếu đang chọn service, cập nhật lại tổng tiền cho dịch vụ đó
        if (selectedService) {
          const selectedItem = updatedCart.find(item => item.id === selectedService.id);
          if (selectedItem) {
            const price = selectedItem.display_price ?? selectedItem.original_price ?? 0;
            const itemTotal = price * selectedItem.quantity;
            console.log(`💰 Dịch vụ đã chọn: ${selectedItem.service_name}, Tổng: ${itemTotal}`);
            setTotalPrice(itemTotal);
            setSelectedService(selectedItem);  // Cập nhật lại nếu cần
          } else {
            console.log("🚫 Dịch vụ đã chọn không còn trong cart");
            setSelectedService(null);
            setTotalPrice(0);
          }
        } else {
          console.log("🛒 Chưa chọn dịch vụ nào, tổng tiền = 0");
          setTotalPrice(0);
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      Alert.alert("Lỗi", "Không thể lấy giỏ hàng");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchCart();
    fetchUserInfo();

    const focusListener = navigation.addListener('focus', () => {
      fetchCart();
    });

    return () => {
      focusListener();
    };
  }, []);

  const fetchUserInfo = async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserInfo(decoded);
      console.log('Thông tin người dùng:', decoded);
    }
  };

  const selectServiceForCheckout = (service) => {
    let newSelectedService = null;
    if (selectedService && selectedService.id === service.id) {
      // Bỏ chọn nếu nhấn lại
      newSelectedService = null;
    } else {
      newSelectedService = service;
    }

    setSelectedService(newSelectedService);

    if (newSelectedService) {
      const price = newSelectedService.display_price ?? newSelectedService.original_price ?? 0;
      const itemTotal = price * newSelectedService.quantity;
      console.log(`💰 Dịch vụ được chọn: ${newSelectedService.service_name}, Giá: ${price}, SL: ${newSelectedService.quantity}, Tổng: ${itemTotal}`);
      setTotalPrice(itemTotal);
    } else {
      console.log("🛒 Bỏ chọn dịch vụ, tổng tiền = 0");
      setTotalPrice(0);
    }
  };

  const updateQuantity = async (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      Alert.alert("Thông báo", "Số lượng phải lớn hơn 0");
      return;
    }

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để cập nhật giỏ hàng");
      return;
    }

    try {
      console.log(`🔄 Cập nhật SL: cartId=${cartId}, newQuantity=${newQuantity}`);
      const response = await axios.put(`http://192.168.1.128:5000/api/customer/cart/update`, {
        cartId: cartId,
        quantity: newQuantity,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.message) {
        console.log("✅ Cập nhật thành công, reload cart...");
        fetchCart();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật giỏ hàng:", error);
      Alert.alert("Lỗi", "Không thể cập nhật số lượng dịch vụ trong giỏ hàng");
    }
  };

  const deleteItemFromCart = async (cartId) => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để xóa dịch vụ khỏi giỏ hàng");
      return;
    }

    try {
      console.log(`❌ Xóa item: cartId=${cartId}`);
      const response = await axios.delete(`http://192.168.1.128:5000/api/customer/cart/${cartId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.message) {
        console.log("✅ Xóa thành công, reload cart...");
        fetchCart();
      }
    } catch (error) {
      console.error("Lỗi khi xóa giỏ hàng:", error);
      Alert.alert("Lỗi", "Không thể xóa dịch vụ khỏi giỏ hàng");
    }
  };


  const renderRightActions = (progress, dragX, item) => {
    return (
      <View style={styles.rightActionContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            setSelectedItemToRemove(item);
            setShowRemoveModal(true);
          }}
        >
          <Image
            style={{ width: 40, height: 40 }}
            source={require('../assets/images/recycle.png')}
          />
        </TouchableOpacity>
      </View>
    );
  };



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }


  const handleCheckout = () => {
    if (selectedService) {
      const price = selectedService.display_price ?? selectedService.original_price ?? selectedService.price ?? 0;
      navigation.navigate('CheckoutScreen', {
        customer: userInfo,
        business: {
          id: selectedService.business_id,
          image: `http://192.168.1.128:5000/${selectedService.business_image}`,
          name: selectedService.business_name,
          address: selectedService.business_address,
        },
        service: {
          id: selectedService.service_id,
          name: selectedService.service_name,
          quantity: selectedService.quantity,
          price: price,  // ✅ Giá fallback an toàn
          image: `http://192.168.1.128:5000/${selectedService.service_image}`,
        },
        totalPrice: price * selectedService.quantity,
      });
    } else {
      Alert.alert("Thông báo", "Vui lòng chọn một dịch vụ để thanh toán.");
    }
  };

  const renderCartItem = ({ item }) => {
    const price = item.display_price || item.original_price || 0;  // Giá hiển thị
    const isPromotion = item.is_promotion_active;
    const originalPrice = item.original_price || 0;
    const promoPrice = item.promo_price || 0;

    console.log("📌 Cart Item:", item);  // Log kiểm tra dữ liệu từng item

    return (
      <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)} overshootRight={false}>
        <View style={{ flexDirection: 'column', padding: 10, backgroundColor: '#fff', marginVertical: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: `http://192.168.1.128:5000/${item.business_image}` }} style={styles.BusinessImage} />
            <Text style={styles.BusinessName}> {item.business_name}</Text>
          </View>

          <View style={styles.cartItem}>
            <View style={{ flexDirection: 'row', width: 130 }}>
              <View style={{ alignItems: 'center', justifyContent: 'center', width: 20, marginRight: 10 }}>
                <RadioButton
                  value={item.id}
                  status={selectedService && selectedService.id === item.id ? 'checked' : 'unchecked'}
                  onPress={() => selectServiceForCheckout(item)}
                />
              </View>
              <View style={{ flex:1, alignItems:"flex-start", marginHorizontal:5}}>
              <Image source={{ uri: `http://192.168.1.128:5000/${item.service_image}` }} style={styles.serviceImage} />
              </View>
            </View>

            <View style={{ flexDirection: 'column', marginLeft:30    }}>
              <View style={{ width: '100%' }}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.cartItemText}>{item.service_name}</Text>
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.cartItemText1}>{item.category_name}</Text>

                {isPromotion ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 15, color: 'red', fontWeight: 'bold', marginRight: 8 }}>
                      {promoPrice.toLocaleString()} VND
                    </Text>
                    <Text style={{ fontSize: 14, color: '#888', textDecorationLine: 'line-through' }}>
                      {originalPrice.toLocaleString()} VND
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.cartItemPrice}>Giá: {price.toLocaleString()} VND</Text>
                )}

                <Text style={{ fontSize: 12, color: '#00CC33' }}>{item.promotion_label || ''}</Text>
              </View>

              <View style={styles.quantityContainer}>
                <TouchableOpacity style={styles.quantityButton} onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity style={styles.quantityButton} onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '' }}>
      <Text style={{
        textAlign: 'center', fontFamily: 'BungeeInline', fontSize: 20, marginTop: 20,
      }}>My WishList</Text>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => `${item.id}-${item.business_service_id}`}
        ListHeaderComponent={() => (
          <>
            {userInfo && (
              <View style={styles.userInfoContainer}>
                <Text style={styles.userInfoText}>ID: {userInfo.id}</Text>
                <Text style={styles.userInfoText}>Email: {userInfo.email}</Text>
              </View>
            )}

            {cartItems.length === 0 && (
              <Text style={styles.emptyText}>Giỏ hàng của bạn trống.</Text>
            )}
          </>
        )}
        contentContainerStyle={{ paddingBottom: 120 }} // Để tránh bị che nút
      />



      {/* Nút cố định */}
      {/* {selectedService && (
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Tổng tiền: {totalPrice} VND</Text>
        </View>
      )} */}
      <View style={styles.checkoutContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.labelText}>Tổng cộng</Text>
          <Text style={styles.valueText}> {totalPrice} đ</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.labelText}>Giảm giá</Text>
          <Text style={styles.discountText}>0 đ</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.paymentRow}>
          <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
          <View style={styles.paymentRight}>
            <Text style={styles.totalValue}> {totalPrice} đ</Text>
            <TouchableOpacity style={styles.purchaseButton} onPress={handleCheckout}>
              <Text style={styles.purchaseText}>Đặt Lịch  </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>


      {selectedItemToRemove && (
        <CustomRemoveModal
          visible={showRemoveModal}
          item={selectedItemToRemove}
          onCancel={() => setShowRemoveModal(false)}
          onConfirm={() => {
            deleteItemFromCart(selectedItemToRemove.id);
            setShowRemoveModal(false);
          }}
        />
      )}
    </View>


  );


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f7f7f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightActionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '90%',
    backgroundColor: 'transparent',
    marginVertical: 8,
  },

  // cartItem: {
  //   // backgroundColor: '#fff',
  //   padding: 15,
  //   // marginBottom: 10,
  //   borderRadius: 10,
  //   borderWidth:2,
  //   // marginHorizontal:10,

  //   // margin:10,
  //   height: 130,
  //   width: '100%',
  //   flexDirection: 'row'
  // },
  cartItem: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 8,
    marginHorizontal: 10,
    height: 150,
    flexDirection: 'row',
    // Bóng cho iOS
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // // Bóng cho Android
    // elevation: 4,
  },

  cartItemText: {
    fontSize: 16,
    color: '#555',
    width: 200,
    fontFamily: 'NunitoBold'
  },
  cartItemPrice: {
    fontSize: 15,
    color: '#fdb7cf',
    fontWeight: 'bold',
    // fontFamily:'NunitoBold'

  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityButton: {
    // backgroundColor: '#0d6efd',
    // paddingVertical: 5,
    // paddingHorizontal: 5,
    borderRadius: 5,
    // marginHorizontal: 5,
    width: 30,
    height: 30,
    backgroundColor: '#fdb7cf',
    alignContent: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  quantityText: {
    fontSize: 18,
    marginHorizontal: 10,
    fontFamily: 'NunitoBold'
  },
  emptyText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#00CC33',
    paddingVertical: 12,
    margin: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    // backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    width: 60,
    borderRadius: 10,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 3.84,
    // elevation: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // totalContainer: {
  //   marginTop: 20,
  //   padding: 10,
  //   backgroundColor: '#fff',
  //   borderRadius: 10,
  //   alignItems: 'center',
  // },
  // totalText: {
  //   fontSize: 18,
  //   color: '#555',
  //   fontWeight: 'bold',
  // },
  serviceImage: {
    width: 120,
    height: 100,
    borderRadius: 5,
    // marginRight: 10,
    // margin:10,
    // resizeMode:'center',
  },
  BusinessImage: {
    width: 30,
    height: 30,
    borderRadius: 50,
    marginLeft: 10

  },
  BusinessName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  userInfoContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 20,
  },
  userInfoText: {
    fontSize: 16,
    color: '#333',
  },
  checkoutContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  labelText: {
    color: '#999',
    fontSize: 14,
  },
  valueText: {
    color: '#333',
    fontSize: 14,
  },
  discountText: {
    color: '#333',
    fontSize: 14,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginVertical: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fdb7cf', // tím đậm
    marginRight: 8,
  },
  purchaseButton: {
    backgroundColor: '#fdb7cf', // xanh lá nhạt
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  purchaseText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});
