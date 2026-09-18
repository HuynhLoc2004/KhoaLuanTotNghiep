import React, { useEffect, useState } from 'react';
import './styles/theme.css';
import './styles/admin.css';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AdminRoomsPage } from './pages/admin/AdminRoomsPage';
import { AdminPanoramaStudio } from './pages/admin/AdminPanoramaStudio';
import { MuseumRoom, AdminTab } from './types';
import { api } from './services/api';
import { Loader2, AlertCircle } from 'lucide-react';

import { PocStitchingPage } from './pages/PocStitchingPage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('rooms');
  const [rooms, setRooms] = useState<MuseumRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<MuseumRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all rooms from API
  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
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
    fetchRooms();
  }, []);

  // Open Studio for a room
  const handleOpenStudio = (room: MuseumRoom) => {
    setActiveRoom(room);
    setCurrentTab('studio');
  };

  // Back from Studio to Rooms list
  const handleBackToRooms = () => {
    setActiveRoom(null);
    setCurrentTab('rooms');
  };

  // Room created
  const handleRoomCreated = (newRoom: MuseumRoom) => {
    setRooms((prev) => [...prev, newRoom]);
  };

  // Room updated
  const handleRoomUpdated = (updated: MuseumRoom) => {
    setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (activeRoom && activeRoom.id === updated.id) {
      setActiveRoom(updated);
    }
  };

  // Room deleted
  const handleDeleteRoom = async (roomId: string) => {
    try {
      await api.deleteRoom(roomId);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      if (activeRoom && activeRoom.id === roomId) {
        handleBackToRooms();
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa gian phòng');
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
      alert(`Không tìm thấy phòng đích (Mã phòng: ${targetRoomId})`);
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          if (tab !== 'studio') setActiveRoom(null);
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
              gap: 12,
              color: 'var(--text-muted)'
            }}
          >
            <Loader2 size={32} className="spin" style={{ color: 'var(--primary)' }} />
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              Đang kết nối hệ thống dữ liệu Bảo tàng Lịch sử...
            </div>
          </div>
        ) : error ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              color: 'var(--text-muted)',
              padding: 24
            }}
          >
            <AlertCircle size={36} style={{ color: '#EF4444' }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)' }}>
              {error}
            </div>
            <button className="btn btn-primary" onClick={fetchRooms}>
              Thử kết nối lại
            </button>
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
            onDeleteRoom={handleDeleteRoom}
          />
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

export default App;
