import { useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

export default function CustomRemoveModal({ visible, item, onConfirm, onCancel }) {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(onCancel, 1000000); // tự ẩn sau 3s
            return () => clearTimeout(timer);
        }
    }, [visible]);

    return (
        <Modal
            isVisible={visible}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            onBackdropPress={onCancel}
            style={styles.modal}
        >
            <View style={styles.container}>
                <Text style={styles.title}>Remove from Cart?</Text>
                <View style={styles.shortDivider} />
                <View style={styles.content}>
                    <Image source={{ uri: `http://192.168.1.128:5000/${item.service_image}` }} style={styles.image} />
                    <View style={styles.info}>
                        <Text numberOfLines={2}
                            ellipsizeMode="tail" style={styles.name}>{item.service_name} </Text>
                        <Text style={styles.name}>{item.category_name} VND</Text>

                        <Text style={styles.price}>{item.price} VND</Text>
                    </View>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.cancel} onPress={onCancel}>
                        <Text>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirm} onPress={onConfirm}>
                        <Text style={{ color: 'white' }}>Yes, Remove</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: { justifyContent: 'flex-end', margin: 0 },
    container: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: 250
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 16,
        textAlign: 'center',
    },
    content: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'center',
    },
    shortDivider: {
        height: 1,
        width: '90%', // hoặc 100 nếu muốn đơn vị tuyệt đối
        backgroundColor: '#ccc',
        alignSelf: 'center',
        marginVertical: 10,
        marginBottom: 20,
        opacity: 0.6, // tạo cảm giác mờ
    },
    image: {
        width: 70,
        height: 70,
        borderRadius: 8,
        marginRight: 12,
    },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold' },
    price: { marginTop: 4, color: '#00CC33' },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancel: {
        flex: 1,
        backgroundColor: '#eee',
        borderRadius: 20,
        padding: 12,
        marginRight: 10,
        alignItems: 'center',
    },
    confirm: {
        flex: 1,
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
    },
});
