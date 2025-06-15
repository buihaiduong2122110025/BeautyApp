import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AppointmentScreen = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [selectedDate, setSelectedDate] = useState(null);

    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [availableShifts, setAvailableShifts] = useState([]);
    const [selectedShiftForReschedule, setSelectedShiftForReschedule] = useState(null);
    const [loadingShifts, setLoadingShifts] = useState(false);
    const [rescheduling, setRescheduling] = useState(false);

    const fetchAppointments = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userInfoString = await AsyncStorage.getItem('user') || await AsyncStorage.getItem('userInfo'); // thử cả hai key
            const userInfo = userInfoString ? JSON.parse(userInfoString) : null;

            console.log('🔍 Token:', token);
            console.log('🔍 userInfoString:', userInfoString);
            console.log('🔍 Parsed userInfo:', userInfo);

            if (!token || !userInfo || !userInfo.id) {
                Alert.alert('Lỗi', 'Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.');
                return;
            }

            const response = await axios.get(
                'http://192.168.1.128:5000/api/customer/appointments',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAppointments(response.data.appointments);
        } catch (error) {
            console.error('Lỗi khi lấy lịch hẹn:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi lấy lịch hẹn.');
        }
    };


    const fetchAvailableShifts = async (businessId) => {
        setLoadingShifts(true);
        console.log('🔍 Bắt đầu gọi API ca làm việc cho businessId:', businessId);

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Lỗi', 'Token không tồn tại. Vui lòng đăng nhập lại.');
                return;
            }

            const response = await axios.get(`http://192.168.1.128:5000/api/customer/business/${businessId}/work-shifts`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('📦 Dữ liệu ca làm việc nhận được:', response.data.shifts);

            const allShifts = response.data.shifts;
            let filteredAvailableShifts = [];
            const now = moment();

            for (const dateKey in allShifts) {
                allShifts[dateKey].forEach((shift) => {
                    const dateOnly = moment(shift.date).format('YYYY-MM-DD');
                    const shiftDateTime = moment(`${dateOnly}T${shift.start_time}`);

                    console.log(
                        `📅 Ca: ${shift.date} ${shift.start_time} | Hiện tại: ${shiftDateTime.isAfter(now)} | Trống: ${shift.current_customers < shift.max_employees
                        }`
                    );

                    if (shiftDateTime.isAfter(now) && shift.current_customers < shift.max_employees) {
                        filteredAvailableShifts.push(shift);
                    }
                });
            }

            console.log('✅ Số ca hợp lệ sau khi lọc:', filteredAvailableShifts.length);
            setAvailableShifts(filteredAvailableShifts);
        } catch (error) {
            console.error('❌ Lỗi khi lấy ca làm việc:', error.response ? error.response.data : error.message);
            Alert.alert('Lỗi', 'Không thể lấy danh sách ca làm việc trống. Vui lòng thử lại.');
        } finally {
            setLoadingShifts(false);
        }
    };


    const handleReschedule = async () => {
        if (!selectedAppointment || !selectedShiftForReschedule) {
            Alert.alert('Lỗi', 'Vui lòng chọn lịch hẹn và ca làm việc mới.');
            return;
        }

        setRescheduling(true);

        try {
            const token = await AsyncStorage.getItem('token');

            const userInfoString =
                (await AsyncStorage.getItem('user')) || (await AsyncStorage.getItem('userInfo'));
            const userInfo = userInfoString ? JSON.parse(userInfoString) : null;

            console.log('🧾 Token:', token);
            console.log('🧾 userInfo:', userInfo);

            if (!token || !userInfo || !userInfo.id) {
                Alert.alert('Lỗi', 'Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại.');
                setRescheduling(false);
                return;
            }

            const payload = {
                customer_id: userInfo.id,
                new_work_shift_id: selectedShiftForReschedule.id,
            };

            console.log('📤 Gửi yêu cầu dời lịch:', payload);

            const response = await axios.put(
                `http://192.168.1.128:5000/api/customer/appointments/${selectedAppointment.id}/reschedule`,
                payload,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.message) {
                Alert.alert('Thành công', response.data.message);
                setShowRescheduleModal(false);
                setShowDetail(false);
                fetchAppointments(); // Load lại lịch hẹn sau khi dời thành công
            } else {
                Alert.alert('Lỗi', 'Dời lịch không thành công.');
            }
        } catch (error) {
            console.error('❌ Lỗi khi dời lịch:', error.response ? error.response.data : error.message);
            Alert.alert('Lỗi', error.response?.data?.error || 'Đã xảy ra lỗi khi dời lịch.');
        } finally {
            setRescheduling(false);
        }
    };


    useEffect(() => {
        fetchAppointments();
    }, []);

    const onDayPress = (day) => {
        const selected = moment(day).format('YYYY-MM-DD');
        setSelectedDate(selected);
        const filtered = appointments.filter((a) =>
            moment(a.appointment_time).format('YYYY-MM-DD') === selected
        );
        setSelectedDayAppointments(filtered);
    };

    const goToNextMonth = () => {
        setCurrentMonth((prev) => moment(prev).add(1, 'months'));
        setSelectedDate(null);
        setSelectedDayAppointments([]); // Xóa các lịch hẹn khi chuyển tháng
    };

    const goToPrevMonth = () => {
        setCurrentMonth((prev) => moment(prev).subtract(1, 'months'));
        setSelectedDate(null);
        setSelectedDayAppointments([]); // Xóa các lịch hẹn khi chuyển tháng
    };

    const generateCalendar = () => {
        const daysInMonth = currentMonth.daysInMonth();
        const startOfMonth = currentMonth.startOf('month').day(); // 0 là Chủ Nhật, 1 là Thứ Hai
        const calendarDays = [];

        // Điền các ngày trống ở đầu tháng
        for (let i = 0; i < startOfMonth; i++) {
            calendarDays.push('');
        }

        // Điền các ngày trong tháng
        for (let i = 1; i <= daysInMonth; i++) {
            calendarDays.push(currentMonth.date(i).format('YYYY-MM-DD'));
        }

        return calendarDays;
    };

    const isDayWithAppointment = (date) => {
        return appointments.some(
            (a) => moment(a.appointment_time).format('YYYY-MM-DD') === date
        );
    };

    const renderAppointmentItem = ({ item }) => (
        <View style={styles.appointmentItem}>
            <Text style={styles.appointmentTitle}>{item.service_name}</Text>
            <Image
                source={{
                    uri: `http://192.168.1.128:5000/${item.service_image.replace(/\\/g, '/')}`,
                }}
                style={styles.image}
            />
            <Text>Doanh nghiệp: {item.business_name}</Text>
            <Text>Giờ: {moment(item.appointment_time).format('HH:mm')}</Text>
            <Text>Giá: {item.service_price} đ</Text>
            <Text>Trạng thái: {item.status === 'scheduled' ? 'Đã đặt' : item.status}</Text> {/* Hiển thị rõ ràng trạng thái */}
            <TouchableOpacity
                style={styles.detailButton}
                onPress={() => {
                    setSelectedAppointment(item);
                    setShowDetail(true);
                }}
            >
                <Text style={styles.buttonText}>Chi tiết</Text>
            </TouchableOpacity>
        </View>
    );

    const renderShiftItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.shiftItem,
                selectedShiftForReschedule && selectedShiftForReschedule.id === item.id && styles.selectedShiftItem,
            ]}
            onPress={() => setSelectedShiftForReschedule(item)}
        >
            <Text style={styles.shiftText}>
                {moment(item.date).format('DD/MM/YYYY')} - {item.start_time.substring(0, 5)} - {item.end_time.substring(0, 5)}
            </Text>
            <Text style={styles.shiftText}>Còn trống: {item.max_employees - item.current_customers} chỗ</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Lịch hẹn của tôi</Text>

            <View style={styles.monthNavigation}>
                <TouchableOpacity onPress={goToPrevMonth}>
                    <Text style={styles.navButton}>{'Tháng trước'}</Text>
                </TouchableOpacity>
                <Text style={styles.monthLabel}>{currentMonth.format('MMMM YYYY')}</Text>
                <TouchableOpacity onPress={goToNextMonth}  >
                    <Text style={styles.navButton}>{'Tháng sau'}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.calendarContainer}>
                {generateCalendar().map((day, index) => {
                    const isToday = day === moment().format('YYYY-MM-DD');
                    const isSelected = day === selectedDate;
                    const hasAppointment = isDayWithAppointment(day);
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.calendarDay,
                                isSelected && { backgroundColor: '#fdb7cf' },
                                !isSelected && isToday && { backgroundColor: '#bac1cd' },
                                !isSelected && hasAppointment && { backgroundColor: '#b3e5fc' },
                            ]}
                            onPress={() => day && onDayPress(day)}
                            disabled={!day}
                        >
                            <Text
                                style={[
                                    styles.calendarText,
                                    isSelected && { color: 'black' },
                                    !isSelected && hasAppointment && { fontWeight: 'bold' },
                                ]}
                            >
                                {day ? moment(day).date() : ''}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <FlatList
                data={selectedDayAppointments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderAppointmentItem}
                ListEmptyComponent={<Text style={styles.emptyAppointmentList}>Không có lịch hẹn vào ngày này</Text>}
            />

            <Modal
                visible={showDetail}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowDetail(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chi tiết lịch hẹn</Text>
                        {selectedAppointment && (
                            <View style={styles.appointmentDetail}>
                                <Text>Dịch vụ: {selectedAppointment.service_name}</Text>
                                <Text>Doanh nghiệp: {selectedAppointment.business_name}</Text>
                                <Text>ID: {selectedAppointment.business_id}</Text>

                                <Text>Địa chỉ: {selectedAppointment.business_address}</Text>
                                <Text>Giá: {selectedAppointment.service_price} đ</Text>
                                <Text>Thời gian: {moment(selectedAppointment.appointment_time).format('YYYY-MM-DD HH:mm')}</Text>
                                <Text>Trạng thái: {selectedAppointment.status === 'scheduled' ? 'Đã đặt' : selectedAppointment.status}</Text>
                                <Image
                                    source={{
                                        uri: `http://192.168.1.128:5000/${selectedAppointment.service_image.replace(/\\/g, '/')}`,
                                    }}
                                    style={styles.image}
                                />
                                {selectedAppointment.status === 'scheduled' && (
                                    <TouchableOpacity
                                        style={styles.rescheduleButton}
                                        onPress={() => {
                                            const now = new Date();
                                            const appointmentTime = new Date(selectedAppointment.appointment_time);
                                            const diffHours = (appointmentTime - now) / (1000 * 60 * 60);

                                            if (diffHours < 3) {
                                                Alert.alert('Không thể dời lịch', 'Bạn chỉ có thể dời lịch trước ít nhất 3 giờ so với giờ hẹn.');
                                                return;
                                            }
                                            setShowDetail(false); // Đóng modal chi tiết
                                            fetchAvailableShifts(selectedAppointment.business_id); // Lấy ca trống cho doanh nghiệp này
                                            setShowRescheduleModal(true); // Mở modal dời lịch
                                        }}
                                    >
                                        <Text style={styles.buttonText}>Dời lịch</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                        <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetail(false)}>
                            <Text style={styles.buttonText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* --- MODAL DỜI LỊCH --- */}
            <Modal
                visible={showRescheduleModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => {
                    setShowRescheduleModal(false);
                    setSelectedShiftForReschedule(null); // Đặt lại lựa chọn khi đóng modal
                }}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chọn ca làm việc mới</Text>
                        {loadingShifts ? (
                            <ActivityIndicator size="large" color="#5a40d1" style={{ marginVertical: 20 }} />
                        ) : availableShifts.length > 0 ? (
                            <FlatList
                                data={availableShifts}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderShiftItem}
                                ListEmptyComponent={<Text style={styles.emptyShiftList}>Không có ca làm việc trống.</Text>}
                            />
                        ) : (
                            <Text style={styles.emptyShiftList}>Không có ca làm việc trống phù hợp cho việc dời lịch.</Text>
                        )}
                        <TouchableOpacity
                            style={[
                                styles.confirmRescheduleButton,
                                !selectedShiftForReschedule || rescheduling ? styles.disabledButton : {},
                            ]}
                            onPress={handleReschedule}
                            disabled={!selectedShiftForReschedule || rescheduling}
                        >
                            <Text style={styles.buttonText}>
                                {rescheduling ? 'Đang dời lịch...' : 'Xác nhận dời lịch'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setShowRescheduleModal(false);
                                setSelectedShiftForReschedule(null);
                            }}
                        >
                            <Text style={styles.buttonText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* ----------------------- */}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        
        marginTop: 20
    },
    title: {
        fontSize: 24,
        // fontWeight: 'bold',
        marginBottom: 10,
        fontFamily:'BungeeInline',
        textAlign:'center'
    },
    monthNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    navButton: {
        fontSize: 16,
        color: '#fdb7cf',
        fontWeight: 'bold',
    },
    monthLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    calendarContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    calendarDay: {
        width: '13%', // Khoảng 100% / 7 ngày
        padding: 10,
        alignItems: 'center',
        marginBottom: 5,
        borderRadius: 5,
    },
    calendarText: {
        fontSize: 16,
    },
    appointmentItem: {
        marginBottom: 12,
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    appointmentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    detailButton: {
        marginTop: 10,
        backgroundColor: '#5a40d1',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        width: '85%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    appointmentDetail: {
        marginBottom: 16,
    },
    image: {
        width: '100%',
        height: 180,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 10,
    },
    closeButton: {
        backgroundColor: '#f44336',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    rescheduleButton: { // Style cho nút Dời lịch
        marginTop: 10,
        backgroundColor: '#4CAF50', // Màu xanh lá cây
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
        alignItems: 'center',
    },
    emptyAppointmentList: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#888',
    },
    // --- STYLES MỚI CHO MODAL DỜI LỊCH ---
    shiftItem: {
        padding: 15,
        marginVertical: 5,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    selectedShiftItem: {
        borderColor: '#5a40d1',
        borderWidth: 2,
        backgroundColor: '#d6e4ff', // Màu nền nhạt hơn khi chọn
    },
    shiftText: {
        fontSize: 16,
        color: '#333',
    },
    confirmRescheduleButton: {
        marginTop: 20,
        backgroundColor: '#5a40d1',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#cccccc', // Màu xám cho nút bị disabled
    },
    emptyShiftList: { // Style cho văn bản danh sách ca trống
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#888',
    },
    // ------------------------------------
});

export default AppointmentScreen;