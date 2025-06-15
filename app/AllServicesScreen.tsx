import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const AllServicesScreen = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigation = useNavigation();

  const baseUrl = 'http://192.168.1.128:5000/api/customer';

  const fetchServices = async (type = 'all') => {
    setLoading(true);
    try {
      let url = `${baseUrl}/services`;

      if (type === 'top-rated') url += '/top-rated';
      else if (type === 'most-booked') url += '/most-booked';
      else if (type === 'hot') url += '/hot';

      const response = await axios.get(url);
      setServices(response.data);
      setActiveFilter(type);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dịch vụ.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('ServiceDetail', {
          businessServiceId: item.business_service_id,
        })
      }
    >
      <Image
        source={{ uri: `http://192.168.1.128:5000/${item.image_url}` }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.name} numberOfLines={1}>
        {item.service_name}
      </Text>
      <Text style={styles.price}>{item.price?.toLocaleString()} VND</Text>

      {/* Hiển thị thông tin theo filter */}
      {(activeFilter === 'top-rated' || activeFilter === 'hot') && item.avg_rating && (
        <Text style={styles.metaText}>⭐ {parseFloat(item.avg_rating).toFixed(1)}</Text>
      )}
      {(activeFilter === 'most-booked' || activeFilter === 'hot') && item.total_bookings && (
        <Text style={styles.metaText}>📅 {item.total_bookings} lượt đặt</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tất cả Dịch vụ</Text>

      {/* Bộ lọc */}
      <View style={styles.filterContainer}>
        {[
          { label: 'Tất cả', value: 'all' },
          { label: 'Đánh giá cao', value: 'top-rated' },
          { label: 'Đặt nhiều', value: 'most-booked' },
          { label: 'Hot nhất', value: 'hot' },
        ].map(({ label, value }) => (
          <TouchableOpacity
            key={value}
            style={[styles.filterButton, activeFilter === value && styles.activeFilter]}
            onPress={() => fetchServices(value)}
          >
            <Text
              style={[styles.filterText, activeFilter === value && styles.activeFilterText]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Danh sách */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.business_service_id.toString()}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

export default AllServicesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#aaa',
  },
  activeFilter: {
    backgroundColor: '#5a40d1',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  activeFilterText: {
    color: '#fff',
  },
  card: {
    width: '48%',
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  image: {
    width: '100%',
    height: 100,
  },
  name: {
    padding: 8,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
  },
  price: {
    paddingHorizontal: 8,
    color: '#888',
    fontSize: 13,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 8,
    marginTop: 2,
  },
});
