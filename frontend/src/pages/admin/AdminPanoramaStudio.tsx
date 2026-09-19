import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Link2,
  ArrowUpRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Globe
} from 'lucide-react';
import { MuseumRoom, Hotspot } from '../../types';
import { Pannellum360Viewer, PannellumHotSpot } from '../../viewer360/Pannellum360Viewer';
import { HotspotModal } from '../../components/HotspotModal';
import { api, API_BASE } from '../../services/api';
import { useToast } from '../../components/Toast';

const LANGUAGE_META: Record<string, { label: string; flag: string }> = {
  vi: { label: 'Tiếng Việt', flag: '🇻🇳' },
  en: { label: 'English', flag: '🇬🇧' },
  ja: { label: '日本語', flag: '🇯🇵' },
  th: { label: 'ไทย', flag: '🇹🇭' },
  fr: { label: 'Français', flag: '🇫🇷' },
  zh: { label: '中文', flag: '🇨🇳' },
  ko: { label: '한국어', flag: '🇰🇷' },
  de: { label: 'Deutsch', flag: '🇩🇪' },
  es: { label: 'Español', flag: '🇪🇸' }
};

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
  const [activeTab, setActiveTab] = useState<'hotspots' | 'settings'>('hotspots');
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

  // Voice AI Audio Guide Widget State
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceLang, setVoiceLang] = useState('');
  const [showScriptPopup, setShowScriptPopup] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper kiểm tra đường dẫn file âm thanh thật (.mp3, .ogg, .wav hoặc chứa /uploads/audio/)
  const isAudioFileUrl = (url?: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim().toLowerCase();
    return trimmed.endsWith('.mp3') || trimmed.endsWith('.ogg') || trimmed.endsWith('.wav') || trimmed.includes('/uploads/audio/') || trimmed.includes('actions.google.com');
  };

  // Danh mục ngôn ngữ THỰC TẾ 100% ĐÃ CÓ FILE ÂM THANH .MP3 trong Database của gian phòng này
  // TUYỆT ĐỐI KHÔNG MOCK: Chỉ hiển thị ngôn ngữ nào mà Admin đã bấm tạo file âm thanh thật và lưu vào DB
  const availableVoiceLangs = useMemo(() => {
    const langs: Array<{ code: string; label: string; flag: string; audioUrl: string; script?: string }> = [];

    // Kiểm tra tiếng Việt: CHỈ THÊM NẾU CÓ FILE ÂM THANH THẬT TRONG DB
    const viAudio = currentRoom.translations?.vi?.audioUrl || (currentRoom as any).audioUrl;
    if (isAudioFileUrl(viAudio)) {
      langs.push({
        code: 'vi',
        label: 'Tiếng Việt',
        flag: '🇻🇳',
        audioUrl: viAudio.trim(),
        script: currentRoom.translations?.vi?.narrationScript || currentRoom.aiScript || ''
      });
    }

    // Kiểm tra các ngôn ngữ khác trong room.translations: CHỈ THÊM NẾU ĐÃ CÓ FILE MP3 THẬT
    if (currentRoom.translations) {
      for (const [code, trans] of Object.entries(currentRoom.translations)) {
        if (code !== 'vi' && trans && isAudioFileUrl(trans.audioUrl)) {
          const meta = LANGUAGE_META[code.toLowerCase()] || { label: code.toUpperCase(), flag: '🌐' };
          langs.push({
            code: code.toLowerCase(),
            label: meta.label,
            flag: meta.flag,
            audioUrl: (trans.audioUrl as string).trim(),
            script: trans.narrationScript || ''
          });
        }
      }
    }

    return langs;
  }, [currentRoom]);

  // Đồng bộ voiceLang với ngôn ngữ đầu tiên có file thật trong DB
  useEffect(() => {
    if (availableVoiceLangs.length > 0) {
      if (!availableVoiceLangs.some((l) => l.code === voiceLang)) {
        setVoiceLang(availableVoiceLangs[0].code);
      }
    } else {
      setVoiceLang('');
    }
  }, [availableVoiceLangs]);

  // Dừng phát âm thanh khi chuyển phòng
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlayingVoice(false);
  }, [currentRoom.id]);

  // Bật/Tắt phát âm thanh thuyết minh (CHỈ PHÁT FILE THẬT .MP3 TỪ SERVER)
  const handleToggleVoice = () => {
    if (isPlayingVoice) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingVoice(false);
      return;
    }

    const currentLangObj = availableVoiceLangs.find((l) => l.code === voiceLang) || availableVoiceLangs[0];
    if (!currentLangObj || !currentLangObj.audioUrl) {
      showToast('Gian phòng chưa có file âm thanh thuyết minh nào trong Database', 'warning');
      return;
    }

    let resolvedUrl = currentLangObj.audioUrl;
    if (resolvedUrl.startsWith('/')) {
      resolvedUrl = `${API_BASE.replace('/api', '')}${resolvedUrl}`;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(resolvedUrl);
    } else {
      audioRef.current.src = resolvedUrl;
    }

    audioRef.current.onended = () => setIsPlayingVoice(false);
    audioRef.current.onerror = () => {
      setIsPlayingVoice(false);
      showToast('Không thể tải file âm thanh từ máy chủ', 'error');
    };

    audioRef.current
      .play()
      .then(() => {
        setIsPlayingVoice(true);
      })
      .catch((e) => {
        console.warn('Audio play failed:', e);
        setIsPlayingVoice(false);
      });
  };

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
      showToast('Đã lưu hướng nhìn mặc định khi vào phòng', 'success');
    } catch (err: any) {
      console.error('Lỗi cập nhật góc nhìn mặc định:', err);
      showToast('Lỗi lưu góc nhìn mặc định', 'error');
    }
  };

  // When admin clicks an existing hotspot in viewer
  const handleHotspotClick = (hs: Hotspot) => {
    // Nếu đang ở chế độ cắm điểm mới, hoàn toàn bỏ qua không kích hoạt hotspot cũ
    if (isPinMode) return;

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
      // Xoay góc nhìn hướng thẳng đến hiện vật để quản trị viên kiểm tra vị trí
      setFocusCoords({ pitch: hs.pitch, yaw: hs.yaw, timestamp: Date.now() });
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

  // Manually update panorama URL
  const handleUpdatePanoUrl = async () => {
    if (!panoInputUrl.trim()) return;
    try {
      const updated = await api.updateRoom(currentRoom.id, {
        panoramaUrl: panoInputUrl.trim(),
        thumbnailUrl: panoInputUrl.trim()
      });
      onRoomUpdated(updated);
      setShowUrlInput(false);
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
    roomId: h.targetRoomId
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

        {/* Floating Voice AI Audio Guide Widget (Góc trái ngay dưới badge tên phòng) */}
        <div
          style={{
            position: 'absolute',
            top: 70,
            left: 20,
            zIndex: 25,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(26, 23, 21, 0.92)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(212, 168, 106, 0.35)',
            borderRadius: 30,
            padding: '5px 14px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            color: '#EDE5DF',
            fontSize: '12.5px'
          }}
        >
          {availableVoiceLangs.length === 0 ? (
            /* Khi phòng chưa có file âm thanh MP3 nào trong DB */
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                color: 'var(--text-muted)',
                fontSize: '12px',
                padding: '3px 4px'
              }}
              title="Gian phòng này chưa có file âm thanh Voice AI nào được tạo trong Database. Hãy vào mục Chỉnh sửa phòng để tạo file Voice AI."
            >
              <VolumeX size={15} style={{ color: 'var(--text-muted)' }} />
              <span>Chưa có Voice AI</span>
            </div>
          ) : (
            /* Khi phòng THỰC SỰ đã có 1 hoặc nhiều file .mp3 trong DB */
            <>
              {/* Nút Play/Pause phát giọng nói */}
              <button
                type="button"
                onClick={handleToggleVoice}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: 'none',
                  background: isPlayingVoice ? '#DC2626' : 'var(--accent-gold)',
                  color: isPlayingVoice ? '#FFF' : '#160F0C',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isPlayingVoice ? '0 0 12px rgba(220, 38, 38, 0.6)' : '0 2px 8px rgba(212, 168, 106, 0.4)'
                }}
                title={isPlayingVoice ? 'Tạm dừng giọng thuyết minh' : 'Phát thuyết minh Voice AI cho phòng này'}
              >
                {isPlayingVoice ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
              </button>

              {/* Chọn ngôn ngữ thuyết minh - CHỈ HIỂN THỊ ĐÚNG CÁC NGÔN NGỮ ĐÃ CÓ FILE MP3 THẬT */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '11.5px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                  {isPlayingVoice ? 'Đang đọc:' : 'Thuyết minh:'}
                </span>
                {availableVoiceLangs.length === 1 ? (
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#FFF', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span>{availableVoiceLangs[0].flag}</span>
                    <span>{availableVoiceLangs[0].label}</span>
                    <span style={{ color: 'var(--accent-gold)' }}>🔊</span>
                  </span>
                ) : (
                  <select
                    value={voiceLang}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setVoiceLang(newLang);
                      if (isPlayingVoice && audioRef.current) {
                        audioRef.current.pause();
                        setIsPlayingVoice(false);
                      }
                    }}
                    style={{
                      background: 'rgba(0,0,0,0.45)',
                      color: '#FFF',
                      border: '1px solid rgba(212, 168, 106, 0.35)',
                      borderRadius: 14,
                      padding: '3px 8px',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {availableVoiceLangs.map((lang) => (
                      <option key={lang.code} value={lang.code} style={{ background: '#1A1715', color: '#FFF' }}>
                        {lang.flag} {lang.label} 🔊
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Nút xem kịch bản đang đọc */}
              <button
                type="button"
                onClick={() => setShowScriptPopup((prev) => !prev)}
                style={{
                  background: showScriptPopup ? 'rgba(212, 168, 106, 0.25)' : 'transparent',
                  border: 'none',
                  color: showScriptPopup ? 'var(--accent-gold)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Xem kịch bản lời đọc thuyết minh"
              >
                <Info size={15} />
              </button>
            </>
          )}
        </div>

        {/* Popup hiển thị kịch bản thuyết minh */}
        {showScriptPopup && availableVoiceLangs.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 118,
              left: 20,
              zIndex: 25,
              maxWidth: 380,
              background: 'rgba(26, 23, 21, 0.94)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(212, 168, 106, 0.4)',
              borderRadius: 12,
              padding: '12px 16px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              color: '#EDE5DF'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: '11.5px', fontWeight: 600, color: 'var(--accent-gold)' }}>
              <span>Lời thuyết minh [{voiceLang.toUpperCase()}]:</span>
              <button
                type="button"
                onClick={() => setShowScriptPopup(false)}
                style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer', fontSize: '13px' }}
              >
                ✕
              </button>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.6, color: '#F3EFEA', maxHeight: 160, overflowY: 'auto' }}>
              {(availableVoiceLangs.find((l) => l.code === voiceLang) || availableVoiceLangs[0])?.script || 'Chưa có kịch bản thuyết minh cho ngôn ngữ này.'}
            </p>
          </div>
        )}

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

      {/* Studio Control Sidebar - Siêu gọn 2 Tab, không cần cuộn */}
      <div className="studio-sidebar">
        {/* Header phòng siêu gọn (1 hàng) */}
        <div className="studio-side-header">
          <button
            type="button"
            className="studio-back-btn"
            onClick={onBack}
            title="Quay lại danh sách các gian trưng bày"
          >
            <ArrowLeft size={12} />
            <span>Quay lại</span>
          </button>

          <div className="studio-header-room-info">
            <span className="studio-badge-code">{currentRoom.code}</span>
            <span className="studio-room-title" title={currentRoom.name}>
              {currentRoom.name}
            </span>
          </div>
        </div>

        {/* 2-Tab Switcher */}
        <div className="studio-tabs">
          <button
            type="button"
            className={`studio-tab-btn ${activeTab === 'hotspots' ? 'active' : ''}`}
            onClick={() => setActiveTab('hotspots')}
          >
            <Compass size={13} />
            <span>Điểm liên kết</span>
            <span className="studio-tab-badge">{currentRoom.hotspots?.length || 0}</span>
          </button>

          <button
            type="button"
            className={`studio-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Layers size={13} />
            <span>Ảnh & Góc nhìn</span>
          </button>
        </div>

        {/* TAB 1: ĐIỂM LIÊN KẾT (HOTSPOTS) */}
        {activeTab === 'hotspots' && (
          <div className="studio-tab-body">
            {/* Cụm cắm điểm mới */}
            <div className="studio-section" style={{ paddingBottom: 10 }}>
              <button
                type="button"
                className={`studio-pin-btn ${isPinMode ? 'active' : ''}`}
                onClick={() => setIsPinMode((prev) => !prev)}
              >
                <MapPin size={14} />
                <span>{isPinMode ? 'Đang chọn: Nhấp lên ảnh để đặt' : 'Cắm điểm mới'}</span>
              </button>
              <div className="studio-help-text">
                Nhấp chuột lên ảnh 360° để đặt điểm chuyển phòng.
              </div>
            </div>

            {/* Danh sách điểm liên kết dạng 1 hàng gọn gàng */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {currentRoom.hotspots && currentRoom.hotspots.length > 0 ? (
                <div className="studio-hotspot-list">
                  {currentRoom.hotspots.map((hs) => {
                    const targetRoom = allRooms.find(
                      (r) => r.id === hs.targetRoomId || String(r.id) === String(hs.targetRoomId)
                    );
                    return (
                      <div key={hs.id} className="studio-hotspot-item">
                        <div className="studio-hotspot-left">
                          <div className="studio-hotspot-icon">
                            {hs.type === 'navigation' ? (
                              <Navigation size={12} />
                            ) : (
                              <Info size={12} />
                            )}
                          </div>
                          <div className="studio-hotspot-text">
                            <span className="studio-hotspot-title" title={hs.title}>
                              {hs.title}
                            </span>
                            <span className="studio-hotspot-sub">
                              {hs.type === 'navigation'
                                ? `Lối sang: ${targetRoom ? targetRoom.name : 'Chưa gán'}`
                                : 'Chú thích hiện vật'}
                            </span>
                          </div>
                        </div>

                        <div className="studio-hotspot-btns">
                          <button
                            type="button"
                            className="studio-icon-btn"
                            title="Xoay góc nhìn tới điểm này"
                            onClick={() => setFocusCoords({ pitch: hs.pitch, yaw: hs.yaw, timestamp: Date.now() })}
                          >
                            <Eye size={12} />
                          </button>

                          {hs.type === 'navigation' && hs.targetRoomId && (
                            <button
                              type="button"
                              className="studio-icon-btn primary"
                              title="Đi thử sang phòng này"
                              onClick={() => handleHotspotClick(hs)}
                            >
                              <ArrowUpRight size={12} />
                            </button>
                          )}

                          <button
                            type="button"
                            className="studio-icon-btn danger"
                            title="Xóa điểm này"
                            onClick={() => handleDeleteHotspot(hs.id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="studio-empty-hotspots">
                  <MapPin size={22} style={{ color: 'var(--accent-gold)', opacity: 0.6, marginBottom: 4 }} />
                  <div>Chưa có điểm liên kết nào.</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    Bật nút cắm điểm phía trên để bắt đầu.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CÀI ĐẶT ẢNH 360° & GÓC NHÌN */}
        {activeTab === 'settings' && (
          <div className="studio-tab-body">
            {/* Góc nhìn mặc định */}
            <div className="studio-section">
              <div className="studio-section-title">
                <Camera size={13} style={{ color: 'var(--accent-gold)' }} />
                <span>Góc nhìn ban đầu khi vào phòng</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.35 }}>
                Góc nhìn mà du khách sẽ thấy đầu tiên khi bước vào phòng.
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', justifyContent: 'center', fontSize: '11.5px', gap: 5 }}
                onClick={() => {
                  const activeViewer = (window as any)._activePannellumViewer;
                  if (activeViewer) {
                    const pitch = activeViewer.getPitch();
                    const yaw = activeViewer.getYaw();
                    const fov = activeViewer.getHfov();
                    handleCaptureInitialView({ pitch, yaw, fov });
                    return;
                  }
                  showToast('Nhấp vào nút máy ảnh trên thanh công cụ xoay 360° để lưu góc nhìn này.', 'info');
                }}
              >
                <Save size={12} />
                <span>Lưu góc đang nhìn làm mặc định</span>
              </button>
            </div>

            {/* Thay đổi ảnh toàn cảnh 360° */}
            <div className="studio-section">
              <div className="studio-section-title">
                <Layers size={13} style={{ color: 'var(--accent-gold)' }} />
                <span>Ảnh toàn cảnh 360°</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Lựa chọn từ Kho 360° đã ghép */}
                {panoramas.length > 0 && (
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      Chọn từ Kho 360° ({panoramas.length} ảnh):
                    </label>
                    <select
                      className="form-control"
                      style={{ fontSize: '11.5px', width: '100%' }}
                      value={currentRoom.panoramaUrl}
                      onChange={(e) => {
                        const selected = e.target.value;
                        if (selected && selected !== currentRoom.panoramaUrl) {
                          handleSelectFromLibrary(selected);
                        }
                      }}
                    >
                      <option value={currentRoom.panoramaUrl}>-- Ảnh hiện tại --</option>
                      {panoramas.map((p) => (
                        <option key={p.filename} value={p.url}>
                          {p.filename}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Nút tải ảnh mới & link URL */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <label
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center', cursor: 'pointer', fontSize: '11.5px', gap: 5 }}
                  >
                    <Upload size={12} />
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
                    style={{ fontSize: '11.5px', padding: '5px 9px', gap: 4 }}
                    title="Nhập liên kết URL thủ công"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                  >
                    <Link2 size={12} />
                    <span>URL</span>
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
                      placeholder="https://... link ảnh 360"
                      style={{ fontSize: '11px', padding: '5px 8px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleUpdatePanoUrl}
                      style={{ justifyContent: 'center', fontSize: '11.5px', padding: '4px 8px', gap: 4 }}
                    >
                      <Save size={11} />
                      <span>Áp dụng link</span>
                    </button>
                  </div>
                )}

                {saveSuccess && (
                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <CheckCircle2 size={12} /> Đã cập nhật ảnh 360°!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
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
