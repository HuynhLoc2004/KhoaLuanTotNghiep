import React, { useEffect, useState } from 'react';
import './styles/theme.css';
import './styles/admin.css';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AdminRoomsPage } from './pages/admin/AdminRoomsPage';
import { AdminPanoramaStudio } from './pages/admin/AdminPanoramaStudio';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { MuseumRoom, AdminTab } from './types';
import { api } from './services/api';
import { Loader2, AlertCircle, Landmark, RefreshCw } from 'lucide-react';
import { ToastProvider, useToast } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import { PocStitchingPage } from './pages/PocStitchingPage';
import { AdminLanguagePage } from './pages/admin/AdminLanguagePage';

const AppContent: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();
  const [currentTab, setCurrentTab] = useState<AdminTab>('rooms');
  const [rooms, setRooms] = useState<MuseumRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<MuseumRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLagging, setIsLagging] = useState(false);

  // Fetch all rooms from API
  const fetchRooms = async () => {
    if (!user || user.role !== 'admin') return;
    try {
      setLoading(true);
      setError(null);
      setIsLagging(false);
      const data = await api.getRooms();
      setRooms(data);
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu phòng:', err);
      setError('Không thể kết nối đến máy chủ API. Vui lòng kiểm tra backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: any;
    if (loading && user) {
      timer = setTimeout(() => setIsLagging(true), 4000);
    } else {
      setIsLagging(false);
    }
    return () => clearTimeout(timer);
  }, [loading, user]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchRooms();
    }
  }, [user]);

  // Tự động kiểm tra sức khỏe máy chủ và kết nối lại khi gặp sự cố mất kết nối / bảo trì
  useEffect(() => {
    if (!error) return;
    const interval = setInterval(async () => {
      const isOnline = await api.checkHealth();
      if (isOnline) {
        fetchRooms();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [error]);

  // Xử lý deep link: Quét QR hoặc mở liên kết ?room=CODE hoặc ?room=ID
  useEffect(() => {
    const handleCheckRoomUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const roomQuery = params.get('room');

      // Kiểm tra nếu người dùng vừa thực hiện F5 / Reload trang
      let isReload = false;
      try {
        const navEntries = performance.getEntriesByType('navigation');
        if (navEntries.length > 0) {
          isReload = (navEntries[0] as PerformanceNavigationTiming).type === 'reload';
        }
      } catch {
        // Fallback
      }

      // Xoá ngay tham số ?room khỏi thanh địa chỉ trình duyệt
      // để khi người dùng F5 / refresh trang không bị kẹt vĩnh viễn vào Studio
      if (roomQuery) {
        try {
          window.history.replaceState({}, '', window.location.pathname);
        } catch {
          // Ignored
        }
      }

      // Nếu là thao tác F5 / Reload hoặc không có query hoặc chưa có phòng, giữ nguyên trang quản lý
      if (isReload || !roomQuery || rooms.length === 0) {
        return;
      }

      const matched = rooms.find(
        (r) =>
          r.code?.toLowerCase() === roomQuery.toLowerCase() ||
          r.id === roomQuery ||
          (r as any)._id === roomQuery
      );

      if (matched) {
        setActiveRoom(matched);
        setCurrentTab('studio');
      }
    };

    handleCheckRoomUrl();
    window.addEventListener('popstate', handleCheckRoomUrl);
    return () => window.removeEventListener('popstate', handleCheckRoomUrl);
  }, [rooms]);

  // Open Studio for a room (không chèn ?room vào URL để tránh kẹt F5)
  const handleOpenStudio = (room: MuseumRoom) => {
    setActiveRoom(room);
    setCurrentTab('studio');
  };

  // Back from Studio to Rooms list
  const handleBackToRooms = () => {
    setActiveRoom(null);
    setCurrentTab('rooms');
    try {
      window.history.replaceState({}, '', window.location.pathname);
    } catch {
      // Ignored
    }
  };

  // Room created
  const handleRoomCreated = (newRoom: MuseumRoom) => {
    setRooms((prev) => [...prev, newRoom]);
    showToast(`Đã thêm gian phòng "${newRoom.name}" thành công`, 'success');
  };

  // Room updated
  const handleRoomUpdated = (updated: MuseumRoom) => {
    setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (activeRoom && activeRoom.id === updated.id) {
      setActiveRoom(updated);
    }
    showToast(`Đã cập nhật dữ liệu "${updated.name}" thành công`, 'success');
  };

  // Room deleted
  const handleDeleteRoom = async (roomId: string) => {
    try {
      await api.deleteRoom(roomId);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      showToast('Đã xóa gian phòng thành công', 'success');
      if (activeRoom && activeRoom.id === roomId) {
        handleBackToRooms();
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa gian phòng', 'error');
    }
  };

  // Hotspot jump navigation inside studio
  const handleNavigateRoom = (targetRoomId: string) => {
    console.log('[handleNavigateRoom targetRoomId]:', targetRoomId, 'available rooms:', rooms.map(r => ({ id: r.id, name: r.name })));
    const target = rooms.find(
      (r) => r.id === targetRoomId || String(r.id) === String(targetRoomId) || r.name === targetRoomId
    );
    if (target) {
      setActiveRoom(target);
    } else {
      showToast(`Không tìm thấy phòng đích (Mã phòng: ${targetRoomId})`, 'warning');
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Màn hình chờ xác thực phiên đăng nhập
  if (isAuthLoading) {
    return (
      <div className="admin-auth-loading">
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 4
        }}>
          <Landmark size={22} style={{ color: 'var(--primary)' }} />
        </div>
        <Loader2 size={26} className="spin" style={{ color: 'var(--primary)' }} />
        <div className="auth-loading-title">BẢO TÀNG LỊCH SỬ TP. HỒ CHÍ MINH</div>
        <p className="auth-loading-text">Đang xác thực bảo mật hệ thống quản trị...</p>
      </div>
    );
  }

  // Chặn người dùng chưa đăng nhập hoặc không có quyền Admin
  if (!user || user.role !== 'admin') {
    return <AdminLoginPage />;
  }

  return (
    <div className="admin-app">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        currentTab={currentTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'studio') {
            setActiveRoom(null);
            try {
              window.history.replaceState({}, '', window.location.pathname);
            } catch {
              // Ignored
            }
          }
        }}
        roomCount={rooms.length}
      />

      <div className="admin-main">
        <Header
          currentTab={currentTab}
          activeRoom={activeRoom}
          onBackToRooms={handleBackToRooms}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {loading ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              padding: 32,
              color: 'var(--text-muted)'
            }}
          >
            <Loader2 size={32} className="spin" style={{ color: 'var(--primary)' }} />
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-main)' }}>
              Đang tải dữ liệu không gian bảo tàng...
            </div>
            {isLagging && (
              <div style={{ textAlign: 'center', maxWidth: 360, marginTop: 4 }}>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Kết nối máy chủ đang mất nhiều thời gian hơn dự kiến do đường truyền mạng.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={fetchRooms}
                >
                  Tải lại dữ liệu
                </button>
              </div>
            )}
          </div>
        ) : error ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 24px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                maxWidth: 520,
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 16,
                padding: '36px 28px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 12px',
                  borderRadius: 9999,
                  background: 'rgba(217, 119, 6, 0.12)',
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                  color: '#FBBF24',
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 20
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#FBBF24',
                    display: 'inline-block'
                  }}
                />
                MÁY CHỦ ĐANG KHỞI ĐỘNG LẠI HOẶC BẢO TRÌ
              </div>

              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: 'rgba(140, 45, 25, 0.15)',
                  border: '1px solid rgba(140, 45, 25, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  marginBottom: 16
                }}
              >
                <Landmark size={32} />
              </div>

              <h2
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  marginBottom: 10
                }}
              >
                Hệ Thống Đang Nâng Cấp & Khởi Động Lại
              </h2>

              <p
                style={{
                  fontSize: 13.5,
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  marginBottom: 24,
                  maxWidth: 420
                }}
              >
                Máy chủ vừa được triển khai mã nguồn mới hoặc đang khởi động lại dịch vụ.
                Trang sẽ tự động đồng bộ và nạp lại dữ liệu ngay khi hệ thống trực tuyến.
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: '#FBBF24',
                  marginBottom: 20
                }}
              >
                <Loader2 size={16} className="spin" />
                <span>Đang tự động thăm dò tín hiệu máy chủ (mỗi 3s)...</span>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={fetchRooms}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 24px',
                  fontWeight: 600
                }}
              >
                <RefreshCw size={16} />
                Thử kết nối lại ngay
              </button>
            </div>
          </div>
        ) : currentTab === 'studio' && activeRoom ? (
          <AdminPanoramaStudio
            currentRoom={activeRoom}
            allRooms={rooms}
            onBack={handleBackToRooms}
            onRoomUpdated={handleRoomUpdated}
            onNavigateRoom={handleNavigateRoom}
          />
        ) : currentTab === 'poc_stitching' ? (
          <PocStitchingPage />
        ) : currentTab === 'rooms' ? (
          <AdminRoomsPage
            rooms={rooms}
            onOpenStudio={handleOpenStudio}
            onRoomCreated={handleRoomCreated}
            onRoomUpdated={handleRoomUpdated}
            onDeleteRoom={handleDeleteRoom}
          />
        ) : currentTab === 'languages' ? (
          <AdminLanguagePage />
        ) : (
          <div className="admin-content">
            <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--primary)' }}>
                {currentTab === 'artifacts' && 'Quản lý Hiện vật & Cổ vật di sản'}
                {currentTab === 'analytics' && 'Báo cáo & Thống kê lượt tham quan Tour 360'}
                {currentTab === 'settings' && 'Cấu hình tham số Hệ thống Tour Di sản'}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Chức năng này đang liên kết trực tiếp với dữ liệu Tour 360 hiện hành của Bảo tàng.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setCurrentTab('rooms')}
                style={{ marginTop: 16 }}
              >
                Trở về Quản lý Tour 360
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;

