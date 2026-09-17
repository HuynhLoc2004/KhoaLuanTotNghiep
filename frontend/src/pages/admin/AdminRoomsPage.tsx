import React, { useState } from 'react';
import {
  Plus,
  Compass,
  MapPin,
  Clock,
  Layers,
  Search,
  ExternalLink,
  Trash2,
  Edit3,
  Camera
} from 'lucide-react';
import { MuseumRoom } from '../../types';
import { NewRoomModal } from '../../components/NewRoomModal';

interface AdminRoomsPageProps {
  rooms: MuseumRoom[];
  onOpenStudio: (room: MuseumRoom) => void;
  onRoomCreated: (newRoom: MuseumRoom) => void;
  onDeleteRoom: (roomId: string) => void;
}

export const AdminRoomsPage: React.FC<AdminRoomsPageProps> = ({
  rooms,
  onOpenStudio,
  onRoomCreated,
  onDeleteRoom
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.period.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalHotspots = rooms.reduce((acc, r) => acc + (r.hotspots?.length || 0), 0);

  return (
    <div className="admin-content">
      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Tổng số gian trưng bày</div>
          <div className="stat-value">{rooms.length}</div>
          <div className="stat-desc">Đã số hóa không gian 360°</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Điểm liên kết Tour (Hotspots)</div>
          <div className="stat-value">{totalHotspots}</div>
          <div className="stat-desc">Định vị điều hướng chuyển phòng</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Độ phủ số hóa di sản</div>
          <div className="stat-value">100%</div>
          <div className="stat-desc">Hệ thống Tour 360 WebGL</div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="panel">
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Tìm kiếm gian phòng, mã phòng..."
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 280, paddingLeft: 34 }}
              />
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowNewModal(true)}
              style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                color: '#FFF',
                border: 'none',
                fontWeight: 600
              }}
            >
              <Camera size={16} />
              <span>Quay 360° Camera Trực Tiếp</span>
            </button>

            <button className="btn btn-primary" onClick={() => setShowNewModal(true)}>
              <Plus size={16} />
              <span>Thêm gian phòng mới</span>
            </button>
          </div>
        </div>

        <div className="rooms-grid">
          {filteredRooms.map((room) => (
            <div key={room.id} className="room-card">
              <div className="room-thumbnail-wrapper">
                <img src={room.thumbnailUrl} alt={room.name} className="room-thumbnail" />
                <div className="room-badge-code">{room.code}</div>
                <div className="room-badge-hotspots">
                  <MapPin size={12} />
                  <span>{room.hotspots?.length || 0} điểm kết nối</span>
                </div>
              </div>

              <div className="room-info">
                <div className="room-name">{room.name}</div>
                <div className="room-period">{room.period}</div>
                <div className="room-desc">{room.description}</div>

                <div className="room-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onOpenStudio(room)}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <Compass size={14} />
                    <span>Biên tập Tour 360</span>
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    title="Xóa phòng"
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn xóa gian phòng "${room.name}"?`)) {
                        onDeleteRoom(room.id);
                      }
                    }}
                    style={{ color: '#EF4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredRooms.length === 0 && (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '48px 20px',
                color: 'var(--text-muted)'
              }}
            >
              Không tìm thấy gian phòng nào phù hợp với từ khóa tìm kiếm.
            </div>
          )}
        </div>
      </div>

      {showNewModal && (
        <NewRoomModal
          onClose={() => setShowNewModal(false)}
          onCreated={(newRoom) => {
            onRoomCreated(newRoom);
            setShowNewModal(false);
          }}
        />
      )}
    </div>
  );
};
