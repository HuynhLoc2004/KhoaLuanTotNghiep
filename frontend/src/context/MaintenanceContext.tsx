import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MaintenanceStatus } from '../types';
import { api } from '../services/api';

const LOCAL_STORAGE_KEY = 'system_maintenance_cache';

export const DEFAULT_MAINTENANCE_STATE: MaintenanceStatus = {
  enabled: false,
  title: 'Hệ Thống Đang Nâng Cấp & Bảo Trì',
  message: 'Bảo tàng Lịch sử TP. Hồ Chí Minh đang cập nhật dữ liệu hiện vật và bảo trì định kỳ. Trình duyệt sẽ tự động kết nối lại khi hoàn tất.',
  estimatedMinutes: 30,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Hệ thống',
  startTime: new Date().toISOString(),
  expectedEndTime: new Date(Date.now() + 30 * 60000).toISOString(),
  remainingMinutes: 30
};

interface MaintenanceContextType {
  maintenance: MaintenanceStatus;
  isLoading: boolean;
  refreshMaintenance: () => Promise<void>;
  setLocalMaintenance: (status: MaintenanceStatus) => void;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [maintenance, setMaintenance] = useState<MaintenanceStatus>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed.enabled === 'boolean') {
            return { ...DEFAULT_MAINTENANCE_STATE, ...parsed };
          }
        }
      } catch {}
    }
    return DEFAULT_MAINTENANCE_STATE;
  });

  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.getMaintenanceStatus();
      if (data && typeof data.enabled === 'boolean') {
        const merged: MaintenanceStatus = {
          ...DEFAULT_MAINTENANCE_STATE,
          ...data
        };
        setMaintenance(merged);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        } catch {}
      }
    } catch (err) {
      // Giữ nguyên trạng thái nếu mất kết nối
    }
  }, []);

  const refreshMaintenance = useCallback(async () => {
    setIsLoading(true);
    await fetchStatus();
    setIsLoading(false);
  }, [fetchStatus]);

  const setLocalMaintenance = useCallback((status: MaintenanceStatus) => {
    setMaintenance(status);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(status));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }, []);

  // Nạp trạng thái ban đầu
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Tần suất thăm dò: 4 giây khi đang bảo trì (để mở lại tức thì), 15 giây khi bình thường
  useEffect(() => {
    const pollInterval = maintenance.enabled ? 4000 : 15000;
    const interval = setInterval(fetchStatus, pollInterval);
    return () => clearInterval(interval);
  }, [fetchStatus, maintenance.enabled]);

  // Đồng bộ đa tab qua storage event, visibilitychange, focus
  useEffect(() => {
    const handleStorage = (e: StorageEvent | Event) => {
      if ('key' in e && e.key && e.key !== LOCAL_STORAGE_KEY) return;
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed.enabled === 'boolean') {
            setMaintenance((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch {}
    };

    const handleLiveness = () => {
      if (document.visibilityState === 'visible') {
        fetchStatus();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleLiveness);
    document.addEventListener('visibilitychange', handleLiveness);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleLiveness);
      document.removeEventListener('visibilitychange', handleLiveness);
    };
  }, [fetchStatus]);

  return (
    <MaintenanceContext.Provider
      value={{
        maintenance,
        isLoading,
        refreshMaintenance,
        setLocalMaintenance
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = () => {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};
