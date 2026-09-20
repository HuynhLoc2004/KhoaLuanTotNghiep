import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, SendOtpResponse } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  sendOtp: (email: string) => Promise<SendOtpResponse>;
  loginWithOtp: (email: string, otp: string) => Promise<void>;
  loginWithCredentials: (usernameOrEmail: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'museum_admin_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Xác minh phiên đăng nhập khi tải ứng dụng
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await api.getMe();
        if (currentUser && currentUser.role === 'admin') {
          setUser(currentUser);
          setToken(savedToken);
        } else {
          // Nếu không phải quyền admin, đăng xuất
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          setToken(null);
        }
      } catch (err: any) {
        // Chỉ xóa token nếu máy chủ xác nhận lỗi 401 (hết hạn) hoặc 403 (không có quyền)
        // Nếu là lỗi ngắt kết nối mạng / 502 / 503 / máy chủ đang khởi động lại, bảo lưu token
        if (err?.status === 401 || err?.status === 403) {
          console.warn('[AuthContext] Phiên đăng nhập hết hạn hoặc không có quyền:', err);
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          setToken(null);
        } else {
          console.warn('[AuthContext] Máy chủ đang bảo trì hoặc khởi động lại, bảo lưu phiên đăng nhập:', err);
          setToken(savedToken);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  // 1. Gửi mã OTP qua email (có cooldown chống spam 60s)
  const sendOtp = async (email: string): Promise<SendOtpResponse> => {
    return await api.sendOtp(email);
  };

  // 2. Đăng nhập bằng OTP
  const loginWithOtp = async (email: string, otp: string) => {
    const res = await api.verifyOtp(email, otp);
    if (res.success && res.token && res.user) {
      if (res.user.role !== 'admin') {
        throw new Error('Tài khoản của bạn không có quyền Quản trị viên (Admin) để truy cập.');
      }
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
    } else {
      throw new Error(res.message || 'Xác thực OTP thất bại');
    }
  };

  // 3. Đăng nhập bằng Tài khoản Mật khẩu
  const loginWithCredentials = async (usernameOrEmail: string, password: string) => {
    const res = await api.loginCredentials(usernameOrEmail, password);
    if (res.success && res.token && res.user) {
      if (res.user.role !== 'admin') {
        throw new Error('Chỉ tài khoản Quản trị viên (Admin) mới có quyền truy cập.');
      }
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
    } else {
      throw new Error(res.message || 'Đăng nhập thất bại');
    }
  };

  // 4. Đăng xuất an toàn
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        sendOtp,
        loginWithOtp,
        loginWithCredentials,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
