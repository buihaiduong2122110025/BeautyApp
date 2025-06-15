import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Modal from 'react-native-modal';

export default function CustomToast({ visible, onClose, item }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 3000); // Auto close after 3s
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      onBackdropPress={onClose}
      style={styles.modal}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Login Succsess</Text>
        {/* <View style={styles.content}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.sub}>{item.category}</Text>
            <Text style={styles.price}>${item.price}</Text>
          </View>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeBtn} onPress={onClose}>
            <Text style={styles.removeText}>Yes, Remove</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    margin: 0,
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 12,
    textAlign: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  sub: {
    fontSize: 14,
    color: '#888',
  },
  price: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#eee',
    flex: 1,
    marginRight: 8,
  },
  removeBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    flex: 1,
  },
  cancelText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  removeText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
