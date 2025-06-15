import AppointmentScreen from '@/app/AppointmentScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, ImageSourcePropType, View } from 'react-native';
import CartScreen from '../app/CartScreen';
import CategoryScreen from '../app/CategoryScreen';
import HomeScreen from '../app/HomeScreen';
import ProfileScreen from '../app/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        let iconSource: ImageSourcePropType | undefined;
        if (route.name === 'Home') iconSource = require('../assets/icons/home.png');
        else if (route.name === 'Category') iconSource = require('../assets/icons/category.png');
        // else if (route.name === 'Chat') iconSource = require('../assets/icons/chat.png');
        else if (route.name === 'Profile') iconSource = require('../assets/icons/profile.png');
        else if (route.name === 'WishList') iconSource = require('../assets/icons/cart.png');
        else if (route.name === 'Appoinment') iconSource = require('../assets/icons/browser_1827352.png');

        return {
          tabBarIcon: ({ focused, size }) => (
            <>
              <View
                style={{
                  position: 'absolute',
                  top: -10,
                  alignSelf: 'center',
                  width: 8,
                  height: 8,
                  backgroundColor: focused ? '#fdb7cf' : 'black',
                  borderRadius: 50,
                }}
              />
              <Image source={iconSource} style={{ width: size, height: size }} resizeMode="contain" />
            </>
          ),
          tabBarActiveTintColor: '#fdb7cf',
          tabBarInactiveTintColor: 'black',
          tabBarLabelStyle: { fontFamily: 'NunitoBold', fontSize: 10 },
          tabBarStyle: { height: 65, backgroundColor: 'white' },
          headerShown: false,
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Category" component={CategoryScreen} />
      {/* <Tab.Screen name="Chat" component={ChatBot} /> */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="WishList" component={CartScreen} />
      <Tab.Screen name="Appoinment" component={AppointmentScreen} />

    </Tab.Navigator>
  );
}
