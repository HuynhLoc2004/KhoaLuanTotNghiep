import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Trash2,
  Eye,
  Camera,
  Upload,
  Layers,
  Save,
  CheckCircle2,
  Navigation,
  Info,
  Compass,
  Link2
} from 'lucide-react';
import { MuseumRoom, Hotspot } from '../../types';
import { Pannellum360Viewer, PannellumHotSpot } from '../../viewer360/Pannellum360Viewer';
import { HotspotModal } from '../../components/HotspotModal';
import { api, API_BASE } from '../../services/api';
import { useToast } from '../../components/Toast';

interface AdminPanoramaStudioProps {
  currentRoom: MuseumRoom;
  allRooms: MuseumRoom[];
  onBack: () => void;
  onRoomUpdated: (updated: MuseumRoom) => void;
  onNavigateRoom: (roomId: string) => void;
}

export const AdminPanoramaStudio: React.FC<AdminPanoramaStudioProps> = ({
  currentRoom,
  allRooms,
  onBack,
  onRoomUpdated,
  onNavigateRoom
}) => {
  const { showToast } = useToast();
  const [isPinMode, setIsPinMode] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{ pitch: number; yaw: number } | null>(null);
  const [focusCoords, setFocusCoords] = useState<{ pitch: number; yaw: number; timestamp?: number } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState('');
  const [panoInputUrl, setPanoInputUrl] = useState(currentRoom.panoramaUrl);
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [panoramas, setPanoramas] = useState<Array<{ filename: string; url: string; created_at: number }>>([]);

  // Fetch Kho ảnh 360° đã ghép nối
  useEffect(() => {
    const fetchPanoramas = async () => {
      try {
        const res = await fetch(`${API_BASE}/stitch/history`);
        const data = await res.json();
        if (data.success && Array.isArray(data.panoramas)) {
          setPanoramas(data.panoramas);
        }
      } catch (err) {
        console.warn('Lỗi tải danh sách ảnh 360:', err);
      }
    };
    fetchPanoramas();
  }, []);

  // When admin clicks on canvas in Pin Mode
  const handleCanvasPinClick = (coords: { pitch: number; yaw: number }) => {
    setPendingCoords(coords);
  };

  // Save new hotspot
  const handleSaveHotspot = async (hotspotData: Omit<Hotspot, 'id'>) => {
    try {
      const created = await api.addHotspot(currentRoom.id, hotspotData);
      const updatedRoom: MuseumRoom = {
        ...currentRoom,
        hotspots: [...(currentRoom.hotspots || []), created]
      };
      onRoomUpdated(updatedRoom);
      setPendingCoords(null);
      setIsPinMode(false);
      showToast('Đã lưu điểm liên kết thành công', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu điểm liên kết', 'error');
    }
  };

  // Delete a hotspot
  const handleDeleteHotspot = async (hotspotId: string) => {
    if (!confirm('Bạn có chắc muốn xóa điểm liên kết này?')) return;
    try {
      await api.deleteHotspot(currentRoom.id, hotspotId);
      const updatedRoom: MuseumRoom = {
        ...currentRoom,
        hotspots: currentRoom.hotspots.filter((h) => h.id !== hotspotId)
      };
      onRoomUpdated(updatedRoom);
      showToast('Đã xóa điểm liên kết thành công', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi xóa điểm liên kết', 'error');
    }
  };

  // Capture and save initial view
  const handleCaptureInitialView = async (view: { pitch: number; yaw: number; fov: number }) => {
    try {
      const updated = await api.updateRoom(currentRoom.id, { initialView: view });
      onRoomUpdated(updated);
      showToast('Đã lưu hướng nhìn mặc định khi vào phòng thành công', 'success');
    } catch (err: any) {
      console.error('Lỗi cập nhật góc nhìn mặc định:', err);
      showToast('Lỗi lưu góc nhìn mặc định', 'error');
    }
  };

  // When admin clicks an existing hotspot in viewer
  const handleHotspotClick = (hs: Hotspot) => {
    if (hs.type === 'navigation' && hs.targetRoomId) {
      const target = allRooms.find((r) => r.id === hs.targetRoomId || String(r.id) === String(hs.targetRoomId));
      setTransitionText(target ? target.name : 'gian phòng tiếp theo');
      setIsTransitioning(true);

      // Bước 1: Xoay thẳng về hướng cửa
      setFocusCoords({ pitch: hs.pitch, yaw: hs.yaw, timestamp: Date.now() });

      // Bước 2: Chuyển cảnh mượt mà
      setTimeout(() => {
        onNavigateRoom(hs.targetRoomId!);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 450);
      }, 350);
    } else {
      showToast(`[Thông tin di sản]: ${hs.title} - ${hs.description || ''}`, 'info');
    }
  };

  // Upload new panorama image
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await api.uploadPanorama(file);
      setPanoInputUrl(res.url);
      const updated = await api.updateRoom(currentRoom.id, {
        panoramaUrl: res.url,
        thumbnailUrl: res.url
      });
      onRoomUpdated(updated);
      setSaveSuccess(true);
      showToast('Tải ảnh 360° lên thành công', 'success');
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      showToast(err.message || 'Lỗi tải ảnh 360', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Select panorama from history
  const handleSelectFromLibrary = async (url: string) => {
    try {
      const updated = await api.updateRoom(currentRoom.id, {
        panoramaUrl: url,
        thumbnailUrl: url
      });
      setPanoInputUrl(url);
      onRoomUpdated(updated);
      setSaveSuccess(true);
      showToast('Đã gắn ảnh từ kho 360° vào phòng này', 'success');
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật ảnh 360', 'error');
    }
  };

  // Update Panorama URL manually
  const handleUpdatePanoUrl = async () => {
    if (!panoInputUrl.trim()) return;
    try {
      const updated = await api.updateRoom(currentRoom.id, {
        panoramaUrl: panoInputUrl.trim(),
        thumbnailUrl: panoInputUrl.trim()
      });
      onRoomUpdated(updated);
      setSaveSuccess(true);
      showToast('Cập nhật liên kết ảnh 360° thành công', 'success');
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật liên kết ảnh 360', 'error');
    }
  };

  // Map museum room hotspots to Pannellum format
  const pannellumHotspots: PannellumHotSpot[] = (currentRoom.hotspots || []).map((h) => ({
    pitch: h.pitch,
    yaw: h.yaw,
    type: 'info',
    text: h.title,
    roomId: h.targetRoomId,
    onClick: () => handleHotspotClick(h)
  }));

  return (
    <div className="studio-container">
      {/* 360 Viewport Area */}
      <div className="studio-viewport-area" style={{ position: 'relative' }}>
        <Pannellum360Viewer
          key={currentRoom.id}
          panoramaUrl={currentRoom.panoramaUrl}
          title={`${currentRoom.name} (${currentRoom.code})`}
          autoStartLittlePlanet={false}
          hotspots={pannellumHotspots}
          onHotspotClick={(hs) => {
            const origin = currentRoom.hotspots?.find(
              (h) => (h.targetRoomId && h.targetRoomId === hs.roomId) || h.title === hs.text
            );
            if (origin) handleHotspotClick(origin);
            else if (hs.roomId) onNavigateRoom(hs.roomId);
          }}
          focusCoords={focusCoords}
          isPinMode={isPinMode}
          onTogglePinMode={() => setIsPinMode((prev) => !prev)}
          onCanvasPinClick={handleCanvasPinClick}
          onCaptureInitialView={handleCaptureInitialView}
          initialPitch={currentRoom.initialView?.pitch ?? 0}
          initialYaw={currentRoom.initialView?.yaw ?? 0}
          initialHfov={currentRoom.initialView?.fov ?? 100}
        />

        {/* Hiệu ứng bước qua cửa chuyển cảnh mượt mà chuẩn Di Sản Bảo Tàng */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            pointerEvents: isTransitioning ? 'auto' : 'none',
            opacity: isTransitioning ? 1 : 0,
            transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'radial-gradient(circle at center, rgba(26, 23, 21, 0.5) 0%, rgba(26, 23, 21, 0.96) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: '50%',
              border: '3px solid rgba(212, 168, 106, 0.25)',
              borderTopColor: 'var(--accent-gold)',
              animation: 'spin 0.8s linear infinite',
              boxShadow: '0 0 20px rgba(212, 168, 106, 0.4)'
            }}
          />
          <div
            style={{
              color: '#EDE5DF',
              fontSize: '13.5px',
              fontWeight: 600,
              letterSpacing: '0.2px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(36, 32, 29, 0.92)',
              padding: '8px 20px',
              borderRadius: '30px',
              border: '1px solid rgba(212, 168, 106, 0.3)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
            }}
          >
            <Navigation size={15} style={{ color: 'var(--accent-gold)' }} />
            <span>Đang chuyển đến {transitionText}...</span>
          </div>
        </div>
      </div>

      {/* Studio Control Sidebar - Bố cục gọn gàng, tự nhiên */}
      <div className="studio-sidebar">
        {/* Header phòng */}
        <div className="studio-side-header">
          <button
            type="button"
            className="studio-back-btn"
            onClick={onBack}
            title="Quay lại danh sách các gian trưng bày"
          >
            <ArrowLeft size={13} />
            <span>Quay lại</span>
          </button>

          <div>
            <div className="studio-room-title" title={currentRoom.name}>
              {currentRoom.name}
            </div>
            <div className="studio-room-badges" style={{ marginTop: 6 }}>
              <span className="studio-badge-code">{currentRoom.code}</span>
              <span className="studio-badge-period">{currentRoom.period || 'Hiện vật Lịch sử'}</span>
            </div>
          </div>
        </div>

        {/* Khối 1: Cắm điểm chuyển phòng */}
        <div className="studio-section">
          <div className="studio-section-header">
            <div className="studio-section-title">
              <Compass size={14} style={{ color: 'var(--accent-gold)' }} />
              <span>Cắm điểm chuyển phòng</span>
            </div>
          </div>

          <button
            type="button"
            className={`studio-pin-btn ${isPinMode ? 'active' : ''}`}
            onClick={() => setIsPinMode((prev) => !prev)}
          >
            <MapPin size={15} />
            <span>{isPinMode ? 'Đang bật: Nhấp vào ảnh để đặt điểm' : 'Bật chế độ cắm điểm'}</span>
          </button>

          <div className="studio-help-box">
            <Info size={13} style={{ flexShrink: 0, color: 'var(--accent-gold)', marginTop: 1 }} />
            <span>Xoay ảnh 360° đến vị trí cửa hoặc hiện vật, sau đó nhấp chuột vào ảnh để đặt điểm tương tác.</span>
          </div>
        </div>

        {/* Khối 2: Danh sách điểm liên kết đã tạo */}
        <div className="studio-section" style={{ flex: 1, overflowY: 'auto' }}>
          <div className="studio-section-header">
            <div className="studio-section-title">
              <Navigation size={14} style={{ color: 'var(--accent-gold)' }} />
              <span>Điểm liên kết đã tạo ({currentRoom.hotspots?.length || 0})</span>
            </div>
          </div>

          {currentRoom.hotspots && currentRoom.hotspots.length > 0 ? (
            <div className="studio-hotspot-list">
              {currentRoom.hotspots.map((hs) => {
                const targetRoom = allRooms.find(
                  (r) => r.id === hs.targetRoomId || String(r.id) === String(hs.targetRoomId)
                );
                return (
                  <div key={hs.id} className="studio-hotspot-card">
                    {/* Dòng 1: Tên điểm */}
                    <div className="studio-hotspot-name" title={hs.title}>
                      {hs.type === 'navigation' ? (
                        <Navigation size={13} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                      ) : (
                        <Info size={13} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                      )}
                      <span>{hs.title}</span>
                    </div>

                    {/* Dòng 2: Điểm đến */}
                    <div className="studio-hotspot-dest">
                      {hs.type === 'navigation' ? (
                        <span className="studio-dest-badge">
                          Lối sang: <strong>{targetRoom ? targetRoom.name : 'Chưa gán'}</strong>
                        </span>
                      ) : (
                        <span className="studio-dest-badge">
                          Thông tin chú thích
                        </span>
                      )}
                    </div>

                    {/* Dòng 3: Thao tác mini */}
                    <div className="studio-hotspot-actions">
                      <button
                        type="button"
                        className="btn-action"
                        title="Xoay góc nhìn 360 đến vị trí điểm này"
                        onClick={() => setFocusCoords({ pitch: hs.pitch, yaw: hs.yaw, timestamp: Date.now() })}
                      >
                        <Eye size={12} />
                        <span>Xoay nhìn</span>
                      </button>

                      {hs.type === 'navigation' && hs.targetRoomId && (
                        <button
                          type="button"
                          className="btn-action primary"
                          title="Đi vào phòng này để kiểm tra chuyển cảnh"
                          onClick={() => handleHotspotClick(hs)}
                        >
                          <Navigation size={12} />
                          <span>Vào thử</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-action danger"
                        title="Xóa điểm liên kết này"
                        onClick={() => handleDeleteHotspot(hs.id)}
                      >
                        <Trash2 size={12} />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="studio-empty-hotspots">
              <MapPin size={22} style={{ color: 'var(--accent-gold)', opacity: 0.6, marginBottom: 4 }} />
              <div>Chưa có điểm liên kết nào trong gian phòng này.</div>
              <p>Bật chế độ cắm điểm và nhấp chuột lên ảnh 360° để tạo mới.</p>
            </div>
          )}
        </div>

        {/* Khối 3: Cài đặt Hướng Nhìn Mặc Định (Initial View) */}
        <div className="studio-section">
          <div className="studio-section-header">
            <div className="studio-section-title">
              <Camera size={14} style={{ color: 'var(--accent-gold)' }} />
              <span>Góc nhìn ban đầu khi vào phòng</span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center', fontSize: '12px', gap: 6 }}
            onClick={() => {
              if (window.pannellum) {
                // Viewer Pannellum instance handles view capture
                const activeViewer = (window as any)._activePannellumViewer;
                if (activeViewer) {
                  const pitch = activeViewer.getPitch();
                  const yaw = activeViewer.getYaw();
                  const fov = activeViewer.getHfov();
                  handleCaptureInitialView({ pitch, yaw, fov });
                  return;
                }
              }
              showToast('Nhấp vào nút biểu tượng máy ảnh trên thanh công cụ xoay 360° để lưu góc nhìn này.', 'info');
            }}
          >
            <Save size={13} />
            <span>Lưu góc đang nhìn làm mặc định</span>
          </button>
        </div>

        {/* Khối 4: Thay đổi Ảnh Toàn Cảnh 360° */}
        <div className="studio-section">
          <div className="studio-section-header">
            <div className="studio-section-title">
              <Layers size={14} style={{ color: 'var(--accent-gold)' }} />
              <span>Ảnh toàn cảnh 360°</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Lựa chọn từ Kho không gian 360° đã ghép */}
            {panoramas.length > 0 && (
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Chọn từ Kho 360° đã ghép ({panoramas.length} ảnh):
                </label>
                <select
                  className="form-control"
                  style={{ fontSize: '12px', width: '100%' }}
                  value={currentRoom.panoramaUrl}
                  onChange={(e) => {
                    const selected = e.target.value;
                    if (selected && selected !== currentRoom.panoramaUrl) {
                      handleSelectFromLibrary(selected);
                    }
                  }}
                >
                  <option value={currentRoom.panoramaUrl}>-- Ảnh hiện tại của phòng --</option>
                  {panoramas.map((p) => (
                    <option key={p.filename} value={p.url}>
                      {p.filename} ({new Date(p.created_at * 1000).toLocaleDateString('vi-VN')})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Nút tải file ảnh mới và Nút mở link URL */}
            <div style={{ display: 'flex', gap: 6 }}>
              <label
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, justifyContent: 'center', cursor: 'pointer', fontSize: '11.5px', gap: 5 }}
              >
                <Upload size={13} />
                <span>{uploading ? 'Đang tải...' : 'Tải ảnh mới'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11.5px', padding: '5px 10px', gap: 4 }}
                title="Nhập liên kết URL thủ công"
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                <Link2 size={13} />
                <span>Link URL</span>
              </button>
            </div>

            {/* Khung nhập URL mở rộng */}
            {showUrlInput && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                <input
                  type="text"
                  className="form-control"
                  value={panoInputUrl}
                  onChange={(e) => setPanoInputUrl(e.target.value)}
                  placeholder="https://... ảnh equirectangular 2:1"
                  style={{ fontSize: '11.5px', padding: '6px 10px' }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleUpdatePanoUrl}
                  style={{ justifyContent: 'center', fontSize: '11.5px', padding: '5px 10px', gap: 4 }}
                >
                  <Save size={12} />
                  <span>Áp dụng liên kết</span>
                </button>
              </div>
            )}

            {saveSuccess && (
              <span
                style={{
                  fontSize: 11.5,
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <CheckCircle2 size={13} /> Đã cập nhật ảnh 360° thành công!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modal create hotspot */}
      {pendingCoords && (
        <HotspotModal
          currentRoom={currentRoom}
          allRooms={allRooms}
          coords={pendingCoords}
          onClose={() => setPendingCoords(null)}
          onSave={handleSaveHotspot}
        />
      )}
    </div>
  );
};
