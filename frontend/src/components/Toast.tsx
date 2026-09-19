import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (messageOrConfig: string, type: ToastType = 'info', duration: number = 3500) => {
      let rawMessage = messageOrConfig;
      let customTitle: string | undefined;

      // Hỗ trợ tự động phân tích định dạng "[Tiêu đề]: nội dung"
      const bracketMatch = rawMessage.match(/^\[(.*?)\]:\s*(.*)$/);
      if (bracketMatch) {
        customTitle = bracketMatch[1];
        rawMessage = bracketMatch[2];
      }

      const title =
        customTitle ||
        (type === 'success'
          ? 'Thành công'
          : type === 'error'
          ? 'Lỗi'
          : type === 'warning'
          ? 'Cảnh báo'
          : 'Thông báo');

      setToasts((prev) => {
        // Chống spam thông báo trùng lặp đang hiển thị
        if (prev.some((t) => t.message === rawMessage && t.type === type)) {
          return prev;
        }
        const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newToast: ToastMessage = { id, type, title, message: rawMessage, duration };

        if (duration > 0) {
          setTimeout(() => {
            removeToast(id);
          }, duration);
        }
        return [...prev.slice(-2), newToast]; // Giữ tối đa 3 thông báo cùng lúc
      });
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' && <CheckCircle2 size={16} />}
              {toast.type === 'error' && <AlertCircle size={16} />}
              {toast.type === 'warning' && <AlertTriangle size={16} />}
              {toast.type === 'info' && <Info size={16} />}
            </div>
            <div className="toast-content-wrapper">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Đóng thông báo"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
