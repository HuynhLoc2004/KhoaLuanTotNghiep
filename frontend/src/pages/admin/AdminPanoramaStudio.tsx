import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { MuseumRoom, Hotspot } from '../../types';
import { Pannellum360Viewer, PannellumHotSpot } from '../../viewer360/Pannellum360Viewer';
import { HotspotModal } from '../../components/HotspotModal';
import { api } from '../../services/api';
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
      showToast('Đã lưu góc nhìn mặc định thành công', 'success');
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
      showToast('Cập nhật URL ảnh 360° thành công', 'success');
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật URL ảnh 360', 'error');
    }
  };

  // Map museum room hotspots to Pannellum format (with 3D Walking Arrow for navigation)
  const pannellumHotspots: PannellumHotSpot[] = (currentRoom.hotspots || []).map((h) => ({
    pitch: h.pitch,
    yaw: h.yaw,
    type: 'info', // Luôn dùng 'info' để Pannellum kích hoạt clickHandlerFunc thay vì loadScene nội bộ
    text: h.title,
    roomId: h.targetRoomId,
    onClick: () => handleHotspotClick(h)
  }));

  return (
    <div className="studio-container">
      {/* 360 Viewport Area (4K Crisp Pannellum WebGL Engine) */}
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

        {/* Hiệu ứng bước qua cửa chuyển cảnh mượt mà chuẩn Google Street View */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            pointerEvents: isTransitioning ? 'auto' : 'none',
            opacity: isTransitioning ? 1 : 0,
            transition: 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.96) 100%)',
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
              width: 50,
              height: 50,
              borderRadius: '50%',
              border: '3px solid rgba(59, 130, 246, 0.25)',
              borderTopColor: '#3B82F6',
              animation: 'spin 0.8s linear infinite',
              boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)'
            }}
          />
          <div
            style={{
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.3px',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '8px 20px',
              borderRadius: '30px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)'
            }}
          >
            <Navigation size={16} />
            <span>Đang chuyển đến {transitionText}...</span>
          </div>
        </div>
      </div>

      {/* Studio Control Sidebar */}
      <div className="studio-sidebar">
        <div className="studio-side-header">
          <button
            className="btn btn-secondary btn-sm"
            onClick={onBack}
            style={{ marginBottom: 10, width: '100%' }}
          >
            <ArrowLeft size={14} />
            <span>Quay lại danh sách phòng</span>
          </button>
          <div className="studio-side-title">{currentRoom.name}</div>
          <div style={{ fontSize: 12, color: 'var(--accent-gold)', marginTop: 2 }}>
            Mã định danh: {currentRoom.code}
          </div>
        </div>

        {/* Hotspot Pinning Mode Control */}
        <div className="studio-section">
          <div className="studio-section-title">Chế độ Ghim Điểm Liên Kết</div>
          <button
            className={`btn ${isPinMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsPinMode((prev) => !prev)}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <MapPin size={16} />
            <span>{isPinMode ? 'Đang bật: Nhấp vào ảnh để ghim' : 'Bật chế độ Ghim Hotspot'}</span>
          </button>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.4 }}>
            * Hướng dẫn: Xoay ảnh 360 đến vị trí lối đi hoặc cửa phòng, sau đó click chuột trực tiếp lên vị trí đó để tạo điểm chuyển phòng.
          </p>
        </div>

        {/* Existing Hotspots List */}
        <div className="studio-section" style={{ flex: 1, overflowY: 'auto' }}>
          <div className="studio-section-title">
            Danh sách Điểm Liên Kết ({currentRoom.hotspots?.length || 0})
          </div>

          {currentRoom.hotspots && currentRoom.hotspots.length > 0 ? (
            currentRoom.hotspots.map((hs) => {
              const targetRoom = allRooms.find((r) => r.id === hs.targetRoomId);
              return (
                <div key={hs.id} className="hotspot-item">
                  <div className="hotspot-item-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {hs.type === 'navigation' ? (
                        <Navigation size={13} style={{ color: 'var(--primary)' }} />
                      ) : (
                        <Info size={13} style={{ color: 'var(--accent-gold)' }} />
                      )}
                      <span className="hotspot-item-title">{hs.title}</span>
                    </div>
                    <span className="hotspot-item-sub">
                      {hs.type === 'navigation'
                        ? `Dẫn đến: ${targetRoom ? targetRoom.name : 'Chưa gán phòng'}`
                        : 'Thông tin chú thích'}
                      {' • '}
                      (P: {hs.pitch}°, Y: {hs.yaw}°)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Nút xoay camera đến vị trí điểm này */}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      title="Xoay góc nhìn 360 đến vị trí điểm này"
                      onClick={() => setFocusCoords({ pitch: hs.pitch, yaw: hs.yaw, timestamp: Date.now() })}
                      style={{ padding: '5px 8px', color: '#2563EB', borderColor: '#BFDBFE', background: '#EFF6FF' }}
                    >
                      <Eye size={13} />
                    </button>

                    {/* Nút Đi vào phòng đích ngay lập tức */}
                    {hs.type === 'navigation' && hs.targetRoomId && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        title="Đi vào phòng này ngay lập tức"
                        onClick={() => handleHotspotClick(hs)}
                        style={{ padding: '5px 10px', fontSize: '11.5px', gap: 4 }}
                      >
                        <Navigation size={12} />
                        <span>Vào phòng</span>
                      </button>
                    )}

                    <button
                      className="btn btn-secondary btn-sm"
                      title="Xóa điểm ghim này"
                      onClick={() => handleDeleteHotspot(hs.id)}
                      style={{ color: '#EF4444', padding: '5px 8px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Chưa có điểm liên kết nào trong gian phòng này. Hãy bật chế độ ghim và click lên ảnh để tạo mới.
            </div>
          )}
        </div>

        {/* Panorama Source / Upload */}
        <div className="studio-section">
          <div className="studio-section-title">Thay đổi Ảnh Toàn Cảnh 360°</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="text"
              className="form-control"
              value={panoInputUrl}
              onChange={(e) => setPanoInputUrl(e.target.value)}
              placeholder="Nhập đường dẫn URL ảnh 360..."
              style={{ fontSize: 12 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleUpdatePanoUrl}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <Save size={13} />
                <span>Cập nhật URL</span>
              </button>

              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={13} />
                <span>{uploading ? 'Đang tải...' : 'Tải file'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
            </div>
            {saveSuccess && (
              <span
                style={{
                  fontSize: 11.5,
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <CheckCircle2 size={13} /> Đã cập nhật ảnh 360 thành công!
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
