import axios from 'axios';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SearchResultScreen = ({ navigation }) => {
    const [query, setQuery] = useState('');
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      if (query.trim() === '') return;
      const timeout = setTimeout(() => {
        searchServices();
      }, 300);
      return () => clearTimeout(timeout);
    }, [query]);
  
    const searchServices = async () => {
        setLoading(true);
        try {
          const res = await axios.get('http://192.168.1.128:5000/api/customer/services');
          const result = res.data
            .filter(s => s.service_name.toLowerCase().includes(query.toLowerCase()))
            .map(s => ({
              ...s,
              distance_km: Math.floor(Math.random() * 20) + 2  // random từ 1 đến 10
            }));
          setServices(result);
        } catch (e) {
          console.error('❌ Lỗi tìm kiếm:', e);
        } finally {
          setLoading(false);
        }
      };
      
    return (

      <SafeAreaView style={{ flex: 1, padding: 12, backgroundColor: '#fff' }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderColor: '#ccc',
          borderWidth: 1,
          borderRadius: 8,
          marginBottom: 12,
          paddingHorizontal: 8
        }}>
          <TextInput
            placeholder="Tìm dịch vụ..."
            style={{ flex: 1, paddingVertical: 8 }}
            value={query}
            autoFocus={true}
            onChangeText={setQuery}
          />
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ color: '#888', marginLeft: 10 }}>✖</Text>
          </TouchableOpacity>
        </View>
  
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 30 }}>🔍 Đang tìm...</Text>
        ) : (
          <ScrollView>
            {services.map((item) => (
              <TouchableOpacity
                key={item.business_service_id}
                onPress={() => navigation.navigate('ServiceDetail', { businessServiceId: item.business_service_id })}
                style={{
                  flexDirection: 'row',
                  marginBottom: 14,
                  alignItems: 'center'
                }}
              >
                <Image
                  source={{ uri: `http://192.168.1.128:5000/${item.image_url}` }}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 10,
                    marginRight: 12,
                    backgroundColor: '#eee',
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500' }} numberOfLines={1}>{item.service_name}</Text>
                  <Text style={{ fontSize: 14, color: '#f46' }}>{item.original_price.toLocaleString()}đ</Text>
                  <Text style={{ fontSize: 14, color: '#333' }}>{item.distance_km} km</Text>

                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    );
  };
  

export default SearchResultScreen;

const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  itemBox: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'center',
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
  price: {
    fontSize: 14,
    color: '#f46',
    marginTop: 2,
  },
  address: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  noResult: {
    fontSize: 15,
    color: '#888',
    marginTop: 20,
    textAlign: 'center',
  },
});
