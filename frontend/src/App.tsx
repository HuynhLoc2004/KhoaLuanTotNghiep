import React, { useEffect, useState } from 'react';
import './styles/theme.css';
import './styles/admin.css';
import './styles/artifacts.css';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AdminRoomsPage } from './pages/admin/AdminRoomsPage';
import { AdminPanoramaStudio } from './pages/admin/AdminPanoramaStudio';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminArtifactsPage } from './pages/admin/AdminArtifactsPage';
import { PublicArtifactView } from './pages/public/PublicArtifactView';
import { MuseumRoom, AdminTab, Artifact, TopicItem } from './types';
import { api } from './services/api';
import { Loader2, AlertCircle, Landmark, RefreshCw } from 'lucide-react';
import { ToastProvider, useToast } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SystemBrandingProvider, useSystemBranding } from './context/SystemBrandingContext';

import { PocStitchingPage } from './pages/PocStitchingPage';
import { AdminLanguagePage } from './pages/admin/AdminLanguagePage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminHomepageCMSPage } from './pages/admin/AdminHomepageCMSPage';
import { ClientTranslationProvider, useClientTranslation } from './context/ClientTranslationContext';
import { ClientHomePage } from './pages/client/ClientHomePage';
import { ClientTourView } from './pages/client/ClientTourView';
import { ClientRoomsPage } from './pages/client/ClientRoomsPage';
import { ClientArtifactsPage } from './pages/client/ClientArtifactsPage';
import { ClientGuidePage } from './pages/client/ClientGuidePage';
import { ClientLoginOtpModal } from './components/client/ClientLoginOtpModal';

const AppContent: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { branding } = useSystemBranding();
  const { showToast } = useToast();
  const { t } = useClientTranslation();
  const [currentTab, setCurrentTab] = useState<AdminTab>('rooms');
  const [rooms, setRooms] = useState<MuseumRoom[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [activeRoom, setActiveRoom] = useState<MuseumRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLagging, setIsLagging] = useState(false);
  const [isClientLoginModalOpen, setIsClientLoginModalOpen] = useState(false);

  // Quản lý theme client đồng bộ toàn hệ thống
  const [clientTheme, setClientTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('client_theme_v2');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'dark';
  });

  const toggleClientTheme = () => {
    setClientTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('client_theme_v2', next);
      } catch {}
      return next;
    });
  };

  // Tuyến trang con hiện tại của Client: 'home' | 'rooms' | 'artifacts' | 'guide'
  const [clientActivePage, setClientActivePage] = useState<'home' | 'rooms' | 'artifacts' | 'guide'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('page');
      if (p === 'rooms' || p === 'artifacts' || p === 'guide') {
        return p;
      }
    } catch {}
    return 'home';
  });

  const handleNavigateClientPage = (page: 'home' | 'rooms' | 'artifacts' | 'guide') => {
    setClientActivePage(page);
    try {
      const url = page === 'home' ? '/' : `?page=${page}`;
      window.history.pushState({}, '', url);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Xác định đang truy cập tuyến Quản trị (/admin) hay Cổng thông tin Khách tham quan
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    try {
      const path = window.location.pathname;
      const search = window.location.search;
      return path.startsWith('/admin') || search.includes('admin');
    } catch {
      return false;
    }
  });

  // Chế độ xem Tour 360 trực tiếp cho khách tham quan
  const [publicTourRoom, setPublicTourRoom] = useState<MuseumRoom | null>(null);

  // Kiểm tra nếu khách truy cập trực tiếp trang Hiện vật 3D (Quét mã QR hoặc URL /artifact/ID hoặc ?artifact=ID)
  const [publicArtifactId, setPublicArtifactId] = useState<string | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('artifact');
      if (q) return q;
      const path = window.location.pathname;
      if (path.startsWith('/artifact/')) {
        const seg = path.split('/artifact/')[1];
        if (seg) return seg.split('/')[0];
      }
    } catch {}
    return null;
  });

  // Fetch all data from API (sử dụng chung cho cả Tour khách, các trang con và Quản trị viên)
  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsLagging(false);
      const [roomsData, artifactsData, topicsData] = await Promise.all([
        api.getRooms().catch(() => []),
        api.getArtifacts().catch(() => []),
        api.getTopics().catch(() => [])
      ]);
      setRooms(roomsData);
      setArtifacts(artifactsData);
      setTopics(topicsData);
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu hệ thống:', err);
      if (isAdminRoute) {
        setError('Không thể kết nối đến máy chủ API. Vui lòng kiểm tra backend.');
      }
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

  // Nạp danh sách dữ liệu khi khởi tạo (phục vụ cả tour khách và admin)
  useEffect(() => {
    fetchRooms();
  }, []);

  // Lắng nghe thay đổi URL khi người dùng nhấn nút Back / Forward trên trình duyệt
  useEffect(() => {
    const handlePopState = () => {
      try {
        const path = window.location.pathname;
        const search = window.location.search;
        setIsAdminRoute(path.startsWith('/admin') || search.includes('admin'));
        const params = new URLSearchParams(search);
        const q = params.get('artifact');
        if (q) {
          setPublicArtifactId(q);
        } else if (path.startsWith('/artifact/')) {
          const seg = path.split('/artifact/')[1];
          setPublicArtifactId(seg ? seg.split('/')[0] : null);
        } else {
          setPublicArtifactId(null);
        }

        const p = params.get('page');
        if (p === 'rooms' || p === 'artifacts' || p === 'guide') {
          setClientActivePage(p);
        } else {
          setClientActivePage('home');
        }
      } catch {}
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

      // Nếu là thao tác F5 / Reload hoặc không có query hoặc chưa có phòng, giữ nguyên trang hiện tại
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
        if (isAdminRoute && user && user.role === 'admin') {
          setActiveRoom(matched);
          setCurrentTab('studio');
        } else {
          setPublicTourRoom(matched);
        }
      }
    };

    handleCheckRoomUrl();
    window.addEventListener('popstate', handleCheckRoomUrl);
    return () => window.removeEventListener('popstate', handleCheckRoomUrl);
  }, [rooms, isAdminRoute, user]);

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

  // Quản lý trạng thái trượt ra / trượt vô của thanh Sidebar (Hỗ trợ cả Desktop & Mobile)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('admin_sidebar_collapsed', String(next));
        } catch {
          // Ignored
        }
        return next;
      });
    }
  };

  // Phím tắt Ctrl + B / Cmd + B để trượt thanh điều hướng ra / vô
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Khách tham quan quét mã QR xem Hiện vật 3D trực tiếp (Không yêu cầu đăng nhập quản trị viên)
  if (publicArtifactId) {
    return (
      <PublicArtifactView
        artifactId={publicArtifactId}
        onBackToTour={() => {
          setPublicArtifactId(null);
          try {
            window.history.replaceState({}, '', '/');
          } catch {}
        }}
      />
    );
  }

  // Khách tham quan mở Tour 360 từ Trang chủ hoặc quét mã QR gian phòng
  if (publicTourRoom) {
    return (
      <ClientTourView
        currentRoom={publicTourRoom}
        allRooms={rooms}
        onBackToHome={() => {
          setPublicTourRoom(null);
          try {
            window.history.replaceState({}, '', '/');
          } catch {}
        }}
        onNavigateRoom={(room) => setPublicTourRoom(room)}
      />
    );
  }

  // Nếu người dùng truy cập trang công khai của Cổng thông tin (không phải /admin)
  if (!isAdminRoute) {
    let activeClientView = (
      <ClientHomePage
        onNavigateAdmin={() => {
          setIsAdminRoute(true);
          try {
            window.history.pushState({}, '', '/admin');
          } catch {}
        }}
        onSelectRoomForTour={(room) => {
          setPublicTourRoom(room);
        }}
        onSelectArtifactDetail={(artifactId) => {
          setPublicArtifactId(artifactId);
          try {
            window.history.pushState({}, '', `?artifact=${artifactId}`);
          } catch {}
        }}
        onNavigatePage={handleNavigateClientPage}
      />
    );

    if (clientActivePage === 'rooms') {
      activeClientView = (
        <ClientRoomsPage
          rooms={rooms}
          onSelectRoomForTour={(room) => setPublicTourRoom(room)}
          onNavigateHome={() => handleNavigateClientPage('home')}
          onNavigatePage={handleNavigateClientPage}
          clientTheme={clientTheme}
          onToggleClientTheme={toggleClientTheme}
          onOpenLoginModal={() => setIsClientLoginModalOpen(true)}
          onNavigateAdmin={() => {
            setIsAdminRoute(true);
            try {
              window.history.pushState({}, '', '/admin');
            } catch {}
          }}
        />
      );
    } else if (clientActivePage === 'artifacts') {
      activeClientView = (
        <ClientArtifactsPage
          artifacts={artifacts}
          onSelectArtifactDetail={(artifactId) => {
            setPublicArtifactId(artifactId);
            try {
              window.history.pushState({}, '', `?artifact=${artifactId}`);
            } catch {}
          }}
          onNavigateHome={() => handleNavigateClientPage('home')}
          onNavigatePage={handleNavigateClientPage}
          clientTheme={clientTheme}
          onToggleClientTheme={toggleClientTheme}
          onOpenLoginModal={() => setIsClientLoginModalOpen(true)}
          onNavigateAdmin={() => {
            setIsAdminRoute(true);
            try {
              window.history.pushState({}, '', '/admin');
            } catch {}
          }}
        />
      );

    } else if (clientActivePage === 'guide') {
      activeClientView = (
        <ClientGuidePage
          onNavigateHome={() => handleNavigateClientPage('home')}
          onNavigatePage={handleNavigateClientPage}
          clientTheme={clientTheme}
          onToggleClientTheme={toggleClientTheme}
          onOpenLoginModal={() => setIsClientLoginModalOpen(true)}
          onNavigateAdmin={() => {
            setIsAdminRoute(true);
            try {
              window.history.pushState({}, '', '/admin');
            } catch {}
          }}
        />
      );
    }

    return (
      <>
        {activeClientView}
        <ClientLoginOtpModal
          isOpen={isClientLoginModalOpen}
          onClose={() => setIsClientLoginModalOpen(false)}
          onSuccess={() => {
            showToast('Đăng nhập thành công', 'success');
            setIsClientLoginModalOpen(false);
          }}
        />
      </>
    );
  }

  // Dưới đây là các tuyến đường Quản Trị Viên (Admin Route)
  // Màn hình chờ xác thực phiên đăng nhập
  if (isAuthLoading) {
    return (
      <div className="admin-auth-loading">
        {branding.logoUrl ? (
          <img
            src={branding.logoUrl}
            alt={branding.shortName}
            style={{
              width: 48,
              height: 48,
              objectFit: 'contain',
              borderRadius: 8,
              marginBottom: 8
            }}
          />
        ) : (
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary) 0%, #5a1a0c 100%)',
              border: '1px solid var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
              boxShadow: '0 4px 12px rgba(140, 45, 25, 0.35)'
            }}
          >
            <span
              style={{
                fontFamily: 'serif',
                fontWeight: 800,
                fontSize: 16,
                color: '#FFF8F0',
                letterSpacing: '0.05em'
              }}
            >
              {branding.emblemText || 'BT'}
            </span>
          </div>
        )}
        <Loader2 size={24} className="spin" style={{ color: 'var(--primary)', marginBottom: 4 }} />
        <div className="auth-loading-title">{branding.museumName?.toUpperCase() || 'HỆ THỐNG TOUR 360 BẢO TÀNG'}</div>
        <p className="auth-loading-text">Đang xác thực bảo mật hệ thống quản trị...</p>
      </div>
    );
  }

  // Chặn người dùng chưa đăng nhập hoặc không có quyền Admin
  if (!user || user.role !== 'admin') {
    return (
      <AdminLoginPage
        onBackToHome={() => {
          setIsAdminRoute(false);
          try {
            window.history.replaceState({}, '', '/');
          } catch {}
        }}
      />
    );
  }

  return (
    <div className={`admin-app ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        currentTab={currentTab}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onToggle={handleToggleSidebar}
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
          onToggleSidebar={handleToggleSidebar}
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
                {t('app.maintenanceBadge', 'MÁY CHỦ ĐANG KHỞI ĐỘNG LẠI HOẶC BẢO TRÌ')}
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
                {t('app.maintenanceTitle', 'Hệ Thống Đang Nâng Cấp & Khởi Động Lại')}
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
                {t('app.maintenanceDesc', 'Máy chủ vừa được triển khai mã nguồn mới hoặc đang khởi động lại dịch vụ. Trang sẽ tự động đồng bộ và nạp lại dữ liệu ngay khi hệ thống trực tuyến.')}
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
                <span>{t('app.pollingServer', 'Đang tự động thăm dò tín hiệu máy chủ (mỗi 3s)...')}</span>
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
                {t('app.reconnectNow', 'Thử kết nối lại ngay')}
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
        ) : currentTab === 'artifacts' ? (
          <AdminArtifactsPage />
        ) : currentTab === 'homepage_cms' ? (
          <AdminHomepageCMSPage />
        ) : currentTab === 'languages' ? (
          <AdminLanguagePage />
        ) : currentTab === 'settings' ? (
          <AdminSettingsPage />
        ) : (
          <div className="admin-content">
            <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--primary)' }}>
                {currentTab === 'analytics' && t('app.analyticsFallbackTitle', 'Báo cáo & Thống kê lượt tham quan Tour 360')}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {t('app.fallbackDesc', 'Chức năng này đang liên kết trực tiếp với dữ liệu Tour 360 hiện hành của Bảo tàng.')}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setCurrentTab('rooms')}
                style={{ marginTop: 16 }}
              >
                {t('app.backToRooms', 'Trở về Quản lý Tour 360')}
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
        <SystemBrandingProvider>
          <ClientTranslationProvider>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </ClientTranslationProvider>
        </SystemBrandingProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;

