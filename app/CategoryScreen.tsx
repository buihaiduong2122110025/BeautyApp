import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

export default function CategoryScreen() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axios.get('http://192.168.1.128:5000/api/customer/categories-with-services');
        setCategories(catRes.data.categories);
        setSelectedCategoryId(catRes.data.categories?.[0]?.id || null);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  // 👉 Lọc ra các doanh nghiệp cung cấp dịch vụ trong danh mục đã chọn
  const businessesInCategory = selectedCategory
    ? Array.from(
        new Map(
          selectedCategory.services.map(service => [
            service.business_name,
            {
              name: service.business_name,
              logo_url: `http://192.168.1.128:5000/${service.logo_url || 'uploads/default-logo.png'}`
            }
          ])
        ).values()
      )
    : [];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0d6efd" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Left Column - Categories */}
      <View style={styles.leftColumn}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryItem, item.id === selectedCategoryId && styles.categoryItemSelected]}
              onPress={() => setSelectedCategoryId(item.id)}
            >
              {item.image && (
                <Image
                  source={{ uri: `http://192.168.1.128:5000/${item.image}` }}
                  style={styles.categoryImage}
                />
              )}
              <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Right Column - Business and Services */}
      <View style={styles.rightColumn}>
        {/* Doanh nghiệp */}
        <View style={styles.businessSection}>
          <Text style={styles.businessTitle}>Doanh nghiệp</Text>
          <FlatList
            data={businessesInCategory}
            keyExtractor={(item, index) => `${item.name}-${index}`}
            numColumns={4}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => (
              <View style={styles.businessLogoBox}>
                <Image
                  source={{ uri: item.logo_url }}
                  style={styles.businessLogo}
                  resizeMode="contain"
                />
                <Text style={styles.businessName}>{item.name}</Text>
              </View>
            )}
          />
        </View>

        {/* Dịch vụ */}
        <View style={styles.serviceSection}>
          <Text style={styles.sectionTitle}>Dịch vụ: {selectedCategory?.name}</Text>
          <FlatList
            data={selectedCategory?.services || []}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.serviceItem}>
                {item.image && (
                  <TouchableOpacity onPress={() => navigation.navigate('ServiceBusinessesScreen', { serviceId: item.id })}>
                    <Image
                      source={{ uri: `http://192.168.1.128:5000/${item.image}` }}
                      style={styles.serviceImage}
                    />
                  </TouchableOpacity>
                )}
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.servicePrice}>{item.price} VND</Text>
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftColumn: {
    width: screenWidth * 0.25,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
  },
  rightColumn: {
    width: screenWidth * 0.75,
    padding: 10,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  categoryItemSelected: {
    backgroundColor: '#ddeeff',
  },
  categoryImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 6,
    backgroundColor: '#ccc',
  },
  categoryText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  businessSection: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
  },
  businessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5a40d1',
    marginBottom: 8,
  },
  businessLogoBox: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  businessLogo: {
    width: '90%',
    height: '70%',
    borderRadius: 10,
    marginBottom: 4,
  },
  businessName: {
    fontSize: 10,
    textAlign: 'center',
  },
  serviceSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  serviceItem: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
  },
  servicePrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  serviceImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
});
