import React, { useState, useEffect } from 'react';
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
  Camera,
  Globe,
  Eye,
  Copy,
  Check,
  RotateCw,
  X,
  Sparkles,
  FolderOpen,
  Info
} from 'lucide-react';
import { MuseumRoom } from '../../types';
import { NewRoomModal } from '../../components/NewRoomModal';
import { Pannellum360Viewer } from '../../viewer360/Pannellum360Viewer';
import { API_BASE } from '../../services/api';

interface AdminRoomsPageProps {
  rooms: MuseumRoom[];
  onOpenStudio: (room: MuseumRoom) => void;
  onRoomCreated: (newRoom: MuseumRoom) => void;
  onDeleteRoom: (roomId: string) => void;
}

interface PanoHistoryItem {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
}

export const AdminRoomsPage: React.FC<AdminRoomsPageProps> = ({
  rooms,
  onOpenStudio,
  onRoomCreated,
  onDeleteRoom
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'rooms' | 'gallery'>('rooms');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedPanoForNewRoom, setSelectedPanoForNewRoom] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Kho ảnh 360° đã tạo
  const [panoramas, setPanoramas] = useState<PanoHistoryItem[]>([]);
  const [loadingPanos, setLoadingPanos] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewPanoUrl, setPreviewPanoUrl] = useState<{ url: string; title: string } | null>(null);

  const fetchPanoramas = async () => {
    try {
      setLoadingPanos(true);
      const res = await fetch(`${API_BASE}/stitch/history`);
      const data = await res.json();
      if (data.success && Array.isArray(data.panoramas)) {
        setPanoramas(data.panoramas);
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách ảnh 360:', err);
    } finally {
      setLoadingPanos(false);
    }
  };

  useEffect(() => {
    fetchPanoramas();
  }, []);

  const handleDeletePano = async (filename: string) => {
    if (!confirm(`Bạn có chắc muốn xóa file không gian 360° "${filename}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/stitch/panoramas/${encodeURIComponent(filename)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setPanoramas((prev) => prev.filter((p) => p.filename !== filename));
      } else {
        alert(data.message || 'Lỗi khi xóa file ảnh');
      }
    } catch (err: any) {
      alert('Lỗi kết nối máy chủ: ' + err.message);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleCreateRoomFromPano = (panoUrl: string) => {
    setSelectedPanoForNewRoom(panoUrl);
    setShowNewModal(true);
  };

  const filteredRooms = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.period.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPanos = panoramas.filter((p) =>
    p.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalHotspots = rooms.reduce((acc, r) => acc + (r.hotspots?.length || 0), 0);

  return (
    <div className="admin-content">
      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Gian trưng bày Tour 360</div>
          <div className="stat-value">{rooms.length}</div>
          <div className="stat-desc">Đang phục vụ khách tham quan</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Kho Không Gian 360° Đã Tạo</div>
          <div className="stat-value" style={{ color: '#2563EB' }}>{panoramas.length}</div>
          <div className="stat-desc">Ảnh toàn cảnh 4K đã ghép nối</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Điểm liên kết (Hotspots)</div>
          <div className="stat-value">{totalHotspots}</div>
          <div className="stat-desc">Định vị hiện vật & chuyển phòng</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Độ phủ số hóa di sản</div>
          <div className="stat-value">100%</div>
          <div className="stat-desc">Hệ thống Tour WebGL chuẩn 2:1</div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="panel">
        {/* Navigation Sub-Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E2E8F0',
            padding: '12px 20px',
            background: '#F8FAFC',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setActiveSubTab('rooms')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                background: activeSubTab === 'rooms' ? '#FFFFFF' : 'transparent',
                color: activeSubTab === 'rooms' ? '#8B261D' : '#64748B',
                boxShadow: activeSubTab === 'rooms' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <Compass size={16} />
              <span>Gian Phòng Triển Lãm ({rooms.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('gallery')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                background: activeSubTab === 'gallery' ? '#FFFFFF' : 'transparent',
                color: activeSubTab === 'gallery' ? '#2563EB' : '#64748B',
                boxShadow: activeSubTab === 'gallery' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <Globe size={16} />
              <span>Kho Không Gian 360° Đã Tạo ({panoramas.length})</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {activeSubTab === 'gallery' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={fetchPanoramas}
                disabled={loadingPanos}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <RotateCw size={14} className={loadingPanos ? 'spin' : ''} />
                <span>Làm mới</span>
              </button>
            )}

            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedPanoForNewRoom(undefined);
                setShowNewModal(true);
              }}
            >
              <Plus size={16} />
              <span>Thêm gian phòng mới</span>
            </button>
          </div>
        </div>

        {/* Search Header */}
        <div className="panel-header" style={{ borderBottom: '1px solid #E2E8F0', padding: '14px 20px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <input
              type="text"
              placeholder={activeSubTab === 'rooms' ? "Tìm kiếm gian phòng, mã phòng..." : "Tìm kiếm ảnh không gian 360°..."}
              className="form-control"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: 34 }}
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

          {activeSubTab === 'gallery' && (
            <div style={{ fontSize: '13px', color: '#166534', background: '#DCFCE7', padding: '6px 12px', borderRadius: 6, fontWeight: 600 }}>
              💡 Bấm <strong>"Xem 360°"</strong> để xoay ngắm phòng, hoặc <strong>"+ Tạo Gian Phòng"</strong> để đưa vào Tour chính thức!
            </div>
          )}
        </div>

        {/* TAB 1: GIAN PHÒNG TOUR 360 */}
        {activeSubTab === 'rooms' && (
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
        )}

        {/* TAB 2: KHO KHÔNG GIAN 360° ĐÃ TẠO */}
        {activeSubTab === 'gallery' && (
          <div style={{ padding: '20px' }}>
            {loadingPanos && panoramas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                <RotateCw size={28} className="spin" style={{ margin: '0 auto 10px', color: '#2563EB' }} />
                <div>Đang tải kho không gian 360° từ hệ thống...</div>
              </div>
            ) : filteredPanos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: '#64748B' }}>
                <FolderOpen size={40} style={{ color: '#CBD5E1', margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                  Chưa có không gian 360° nào trong kho
                </h4>
                <p style={{ fontSize: '13px', maxWidth: '420px', margin: '0 auto' }}>
                  Vào menu <strong>"Tự Động Ghép 360 (PoC)"</strong> bên trái để chụp hoặc tải ảnh ghép phòng 360° đầu tiên.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px'
                }}
              >
                {filteredPanos.map((item, idx) => (
                  <div
                    key={item.filename || idx}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#FFFFFF',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                  >
                    {/* Thumbnail Preview */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '160px',
                        background: '#0F172A',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      onClick={() => setPreviewPanoUrl({ url: item.url, title: item.filename })}
                      title="Bấm để xoay xem toàn cảnh 360°"
                    >
                      <img
                        src={item.url}
                        alt={item.filename}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: 0.9,
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: 'rgba(0,0,0,0.65)',
                          color: '#FFFFFF',
                          padding: '2px 8px',
                          borderRadius: 6,
                          fontSize: '11px',
                          fontWeight: 700,
                          backdropFilter: 'blur(4px)'
                        }}
                      >
                        4K Equirectangular
                      </div>

                      <div
                        style={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          background: 'rgba(37, 99, 235, 0.9)',
                          color: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: '11.5px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5
                        }}
                      >
                        <Eye size={13} />
                        <span>Xoay xem 360°</span>
                      </div>
                    </div>

                    {/* Metadata & Actions */}
                    <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#1E293B',
                          wordBreak: 'break-all',
                          lineHeight: 1.4
                        }}
                      >
                        {item.filename}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '11.5px',
                          color: '#64748B'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} />
                          <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                        </span>
                        <span>{(item.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 6 }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleCreateRoomFromPano(item.url)}
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            fontSize: '12px',
                            padding: '7px 10px',
                            fontWeight: 700,
                            gap: 6
                          }}
                        >
                          <Plus size={14} />
                          <span>+ Tạo Gian Phòng</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleCopyLink(item.url)}
                          title="Sao chép đường dẫn ảnh 360"
                          style={{
                            fontSize: '12px',
                            padding: '7px 10px',
                            color: copiedUrl === item.url ? '#16A34A' : '#334155'
                          }}
                        >
                          {copiedUrl === item.url ? <Check size={14} /> : <Copy size={14} />}
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleDeletePano(item.filename)}
                          title="Xóa ảnh 360 khỏi kho"
                          style={{
                            fontSize: '12px',
                            padding: '7px 10px',
                            color: '#EF4444'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: XOAY XEM THỬ TOÀN CẢNH 360° */}
      {previewPanoUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1000px',
              height: '80vh',
              background: '#000000',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '12px 18px',
                background: '#1E293B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '14px', fontWeight: 700 }}>
                <Globe size={18} style={{ color: '#38BDF8' }} />
                <span>Xem Toàn Cảnh 360°: {previewPanoUrl.title}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const url = previewPanoUrl.url;
                    setPreviewPanoUrl(null);
                    handleCreateRoomFromPano(url);
                  }}
                  style={{ fontSize: '12px', padding: '5px 12px' }}
                >
                  + Tạo Gian Phòng Từ Ảnh Này
                </button>
                <button
                  onClick={() => setPreviewPanoUrl(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Viewport */}
            <div style={{ flex: 1, position: 'relative' }}>
              <Pannellum360Viewer
                panoramaUrl={previewPanoUrl.url}
                title={previewPanoUrl.title}
                autoStartLittlePlanet={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM GIAN PHÒNG MỚI (Tự động điền URL nếu chọn từ kho) */}
      {showNewModal && (
        <NewRoomModal
          initialPanoramaUrl={selectedPanoForNewRoom}
          onClose={() => {
            setShowNewModal(false);
            setSelectedPanoForNewRoom(undefined);
          }}
          onCreated={(newRoom) => {
            onRoomCreated(newRoom);
            setShowNewModal(false);
            setSelectedPanoForNewRoom(undefined);
            setActiveSubTab('rooms');
          }}
        />
      )}
    </div>
  );
};

