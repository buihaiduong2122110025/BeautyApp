import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SetAppointmentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { business } = route.params;
  console.log('Business ID:', business?.id); // ✅ Chèn dòng này để debug

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [workShifts, setWorkShifts] = useState({});
  const [selectedShiftId, setSelectedShiftId] = useState(null);

  const today = dayjs();
  const startOfMonth = currentMonth.startOf('month');
  const daysInMonth = currentMonth.daysInMonth();
  const dates = Array.from({ length: daysInMonth }, (_, i) => startOfMonth.add(i, 'day'));

  useEffect(() => {
    const fetchShifts = async () => {
      if (!business?.id) return;
      try {
        const res = await axios.get(`http://192.168.1.128:5000/api/customer/business/${business.id}/work-shifts`);
        console.log('Dữ liệu workShifts trả về:', res.data.shifts);
        setWorkShifts(res.data.shifts);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu work shifts:', error);
      }
    };

    fetchShifts();
  }, [business?.id]);

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedTime || !selectedShiftId) {
      alert('Vui lòng chọn ngày, giờ và ca làm việc');
      return;
    }

    const appointmentDateTime = `${selectedTime} ${selectedDate}`;
    navigation.navigate('CheckoutScreen', {
      ...route.params,
      appointmentTime: appointmentDateTime,
      workShiftId: selectedShiftId, // ✅ Dùng đúng biến đã set
    });
  };

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image style={{
              width: 50, height: 50
            }} source={require('../assets/icons/left.png')} />

          </TouchableOpacity>
          <Text style={{ fontFamily: 'BungeeInline', marginLeft: 50, fontSize: 20 }}>Chọn thời gian</Text>

        </View>

        <View style={styles.monthNav}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <Text>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>{currentMonth.format('MM - YYYY')}</Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <Text>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Ngày</Text>
        <View style={styles.dateContainer}>
          {dates.map((date) => {
            const dateStr = date.format('YYYY-MM-DD');
            const isPast = date.isBefore(today, 'day');
            const hasShift = !!workShifts[dateStr];
            const disabled = isPast || !hasShift;
            return (
              <TouchableOpacity
                key={dateStr}
                onPress={() => {
                  setSelectedDate(dateStr);
                  setSelectedTime(null);
                }}
                disabled={disabled}
                style={[
                  styles.dateBox,
                  selectedDate === dateStr && styles.selected,
                  disabled && styles.disabled,
                ]}
              >
                <Text style={disabled ? styles.disabledText : styles.dateText}>{date.format('DD')}</Text>
                <Text style={disabled ? styles.disabledText : styles.dateText}>{date.format('dd')}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Giờ</Text>
        <View style={styles.timeContainer}>
          {(workShifts[selectedDate] || []).map((shift) => {
            const isFull = Number(shift.current_customers) >= Number(shift.max_employees); // ép kiểu an toàn
            return (
              <TouchableOpacity
                key={shift.id}
                disabled={isFull}
                onPress={() => {
                  setSelectedTime(shift.start_time.slice(0, 5));
                  setSelectedShiftId(shift.id);
                  console.log('✅ Work Shift được chọn:', shift);
                }}
                style={[
                  styles.timeBox,
                  selectedTime === shift.start_time.slice(0, 5) && styles.selected,
                  isFull && styles.disabled
                ]}
              >
                <Text>{shift.start_time?.slice(0, 5) || 'N/A'}</Text>
                <Text>{`${shift.current_customers || 0}/${shift.max_employees || 0}`}</Text>
              </TouchableOpacity>
            );
          })}


        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Xác nhận</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navButton: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  dateBox: {
    width: 50,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  dateText: {
    fontSize: 14,
  },
  selected: {
    backgroundColor: '#fdb7cf',
  },
  disabled: {
    backgroundColor: '#ccc'
  },
  disabledText: {
    color: '#999'
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  timeBox: {
    width: 80,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  confirmButton: {
    backgroundColor: '#fdb7cf',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {

  },
});
