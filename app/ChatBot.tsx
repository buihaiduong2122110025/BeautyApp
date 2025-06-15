import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import ParsedText from 'react-native-parsed-text';
import { SafeAreaView } from 'react-native-safe-area-context';

// ... (các import như cũ)

export default function ChatBotManual() {
  const navigation = useNavigation();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      text: 'Xin chào! Tôi là trợ lý làm đẹp của bạn 🤖',
      fromBot: true,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const chat_id = '10c565f3-59fd-4912-9b9f-6ea83c8bf2fb';
  const customer_id = 4;

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      fromBot: false,
    };

    console.log('📤 Tin nhắn người dùng:', userMessage.text);

    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      console.log('📥 Danh sách tin nhắn sau khi thêm user:', newMessages);
      return newMessages;
    });

    setInputText('');

    try {
      console.log('🌐 Đang gửi request đến bot...');
      const response = await fetch('http://192.168.1.128:5000/api/chat/bot-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id,
          customer_id,
          content: userMessage.text,
        }),
      });

      const data = await response.json();
      console.log('✅ Phản hồi từ bot:', data);

      // ✅ Nếu là danh sách nhiều replies (ví dụ: khuyến mãi)
      if (data.replies && Array.isArray(data.replies)) {
        data.replies.forEach((item) => {
          const image = item.image_url
            ? `http://192.168.1.128:5000/${item.image_url}`
            : null;

          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              text: item.text,
              imageUrl: image,
              fromBot: true,
            },
          ]);
        });
      }

      // ✅ Nếu chỉ có 1 reply như bình thường
      else if (data.reply) {
        const botReply = {
          id: Math.random().toString(),
          text: data.reply.content,
          imageUrl: data.reply.image_url
            ? `http://192.168.1.128:5000/${data.reply.image_url}`
            : null,
          images: data.reply.images
            ? data.reply.images.map((img) => `http://192.168.1.128:5000/${img}`)
            : [],
          fromBot: true,
        };

        setMessages((prev) => [...prev, botReply]);

        // ✅ Nếu nội dung có link Momo thì tự mở và lưu message nếu có
        const match = data.reply.content.match(/\((http.*?)\)/);
        if (match) {
          const payUrl = match[1];

          // ⚠️ Nếu backend gửi kèm successMessage thì lưu lại
          if (data.successMessage) {
            await AsyncStorage.setItem('booking_success_message', JSON.stringify(data.successMessage));
          }

          // ✅ Mở link thanh toán
          Linking.openURL(payUrl);
        }
      }

    } catch (err) {
      console.error('❌ Lỗi gọi bot:', err);
      const errorReply = {
        id: 'error',
        text: '❌ Lỗi kết nối bot. Vui lòng thử lại sau.',
        fromBot: true,
      };

      setMessages((prev) => [...prev, errorReply]);
    }
  };


  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // ... phần còn lại như cũ
  useEffect(() => {
    const checkSuccessMessage = async () => {
      try {
        const raw = await AsyncStorage.getItem('booking_success_message');
        if (raw) {
          const data = JSON.parse(raw);
          const dateFormatted = new Date(data.date).toLocaleDateString('vi-VN');

          const confirmMessage =
            `✅ Bạn đã đặt lịch thành công!\n\n` +
            `• 🗓 Ngày: ${dateFormatted}\n` +
            `• 🕒 Thời gian: ${data.startTime} - ${data.endTime}\n` +
            `• 💇 Dịch vụ: ${data.serviceName}\n` +
            `• 🏢 Địa điểm: ${data.businessName}\n\n` +
            `🎉 Chúng tôi sẽ sẵn sàng đón tiếp bạn!`;

          setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), text: confirmMessage, fromBot: true },
          ]);

          await AsyncStorage.removeItem('booking_success_message');
        }
      } catch (err) {
        console.log('❌ Lỗi khi đọc success message:', err);
      }
    };

    checkSuccessMessage();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image style={{
            width: 50, height: 50
          }} source={require('../assets/icons/left.png')} />

        </TouchableOpacity>
        <Text style={{ fontFamily: 'BungeeInline', marginLeft: 90, fontSize: 20 }}>Chat Bot</Text>

      </View>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.fromBot ? styles.bot : styles.user]}>
              {/* ✅ Hiển thị tin nhắn với nhận dạng link nếu là từ bot */}
              {item.fromBot ? (
                <ParsedText
                  style={styles.messageText}
                  parse={[
                    {
                      type: 'url',
                      style: { color: 'blue', textDecorationLine: 'underline' },
                      onPress: (url) => Linking.openURL(url),
                    },
                  ]}
                >
                  {item.text}
                </ParsedText>
              ) : (
                <Text style={[styles.messageText, { color: '#fff' }]}>{item.text}</Text>
              )}

              {/* ✅ Hiển thị ảnh đơn */}
              {item.imageUrl && (!item.images || item.images.length === 0) && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.singleImage}
                  resizeMode="cover"
                />
              )}

              {/* ✅ Hiển thị danh sách ảnh */}
              {item.images && item.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  {item.images.map((imgUrl, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: imgUrl }}
                      style={styles.miniImage}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          )}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  singleImage: {
    width: 280,
    height: 180,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    // fontSize: 20,
    // fontWeight: 'bold',
    marginBottom: 16,
    // textAlign: 'center',
    backgroundColor: '#fdb7cf',
    color: '#5a40d1'
  },
  miniImage: {
    width: 100,
    height: 140,
    borderRadius: 10,
    marginRight: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatContent: {
    padding: 10,
    paddingBottom: 20,
  },
  image: {
    width: '90%',
    height: 200,
    borderRadius: 10,
    marginTop: 4,
  },

  messageBubble: {
    maxWidth: '80%',
    marginVertical: 6,
    padding: 10,
    borderRadius: 10,
  },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: '#4a90e2',
  },
  bot: {
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
  },
  messageText: {
    color: '#000',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 8,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
