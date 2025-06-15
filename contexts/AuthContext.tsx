import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { registerAndSaveExpoToken } from '../hooks/registerAndSaveExpoToken'; // ✅ THÊM DÒNG NÀY

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');

      if (token) {
        setIsLoggedIn(true);

        // ✅ Gửi Expo token lên server nếu đã đăng nhập
        await registerAndSaveExpoToken(token);
      } else {
        setIsLoggedIn(false);
      }
    };

    checkToken();
  }, []);
  
  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}
