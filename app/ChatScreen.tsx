import { useEffect, useState } from 'react';
import { FlatList, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';

const socket = io('http://192.168.1.128:5000');

const ChatScreen = ({ route }) => {
  const { chatId, partnerId, partnerType, businessName, businessImage } = route.params;  // Nhận thông tin doanh nghiệp từ tham số điều hướng
  const customerId = 4;  // ID của khách hàng, lấy từ AsyncStorage hoặc state
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');

  // Lấy tin nhắn cho cuộc trò chuyện từ database
  useEffect(() => {
    fetch(`http://192.168.1.128:5000/api/chat/get-messages/${chatId}`)
      .then(res => res.json())
      .then(data => setMessages(data?.messages || []))
      .catch(err => {
        console.error('Lỗi get-messages:', err);
        setMessages([]);
      });

    socket.emit('join', chatId);  // Tham gia phòng chat sử dụng chatId
    socket.on('receiveMessage', (msg) => {
      if (msg.chat_id === chatId) {
        setMessages((prev) => [...prev, msg]);  // Thêm tin nhắn mới vào danh sách
      }
    });

    return () => socket.off('receiveMessage');  // Cleanup khi component unmount
  }, [chatId]);

  // Gửi tin nhắn
  const send = () => {
    if (!content.trim()) return;
    socket.emit('sendMessage', {
      chat_id: chatId,
      sender_id: customerId,
      receiver_id: partnerId,
      receiver_type: partnerType,
      content,
    });
    setContent('');  // Xóa nội dung sau khi gửi
  };

  return (
    <SafeAreaView style={styles.container}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.chatBox}>
          {/* Hiển thị ảnh và tên doanh nghiệp */}
          <View style={styles.businessInfo}>
            <Image
              source={{ uri: `http://192.168.1.128:5000/${businessImage}` }} // Ảnh đại diện doanh nghiệp
              style={styles.profileImage}
            />
            <Text style={styles.businessName}>Đang chat với: {businessName || 'Doanh nghiệp'}</Text>
          </View>

          {messages.length > 0 ? (
            <FlatList
              data={messages}
              keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : `temp-${index}`}
              renderItem={({ item }) => (
                <View style={[styles.message, item.sender_id === customerId ? styles.sent : styles.received]}>
                  <Text style={styles.messageText}>{item.content}</Text>
                </View>
              )}
              contentContainerStyle={{ padding: 10 }}
            />
          ) : (
            <Text style={styles.infoText}>Chưa có tin nhắn nào</Text>
          )}

          <View style={styles.inputBox}>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Nhập tin nhắn..."
              style={styles.input}
            />
            <TouchableOpacity onPress={send} style={styles.sendButton}>
              <Text style={styles.sendText}>Gửi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  chatBox: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  message: { padding: 10, borderRadius: 10, marginVertical: 5, maxWidth: '70%' },
  sent: { backgroundColor: '#1890ff', alignSelf: 'flex-end' },
  received: { backgroundColor: '#e6e6e6', alignSelf: 'flex-start' },
  messageText: { color: '#000' },
  inputBox: { flexDirection: 'row', padding: 10, alignItems: 'center', backgroundColor: '#f1f1f1' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 20, backgroundColor: '#fff' },
  sendButton: { marginLeft: 10, backgroundColor: '#1890ff', padding: 10, borderRadius: 20 },
  sendText: { color: '#fff', fontWeight: 'bold' },
  infoText: { color: '#666', fontSize: 16, textAlign: 'center', marginTop: 20 },
});
