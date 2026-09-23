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
  Globe,
  Sliders,
  X
} from 'lucide-react';
import { MuseumRoom, Hotspot } from '../../types';
import { Pannellum360Viewer, PannellumHotSpot } from '../../viewer360/Pannellum360Viewer';
import { HotspotModal } from '../../components/HotspotModal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { api, API_BASE } from '../../services/api';
import { useToast } from '../../components/Toast';

const LANGUAGE_META: Record<string, { label: string; code: string }> = {
  vi: { label: 'Tiếng Việt', code: 'VI' },
  en: { label: 'English', code: 'EN' },
  ja: { label: '日本語', code: 'JA' },
  th: { label: 'ไทย', code: 'TH' },
  fr: { label: 'Français', code: 'FR' },
  zh: { label: '中文', code: 'ZH' },
  ko: { label: '한국어', code: 'KO' },
  de: { label: 'Deutsch', code: 'DE' },
  es: { label: 'Español', code: 'ES' }
};

interface AdminPanoramaStudioProps {
  currentRoom: MuseumRoom;
  allRooms: MuseumRoom[];
  onBack: () => void;
  onRoomUpdated: (updatedRoom: MuseumRoom) => void;
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
  const [deletingHotspot, setDeletingHotspot] = useState<Hotspot | null>(null);
  const [focusCoords, setFocusCoords] = useState<{ pitch: number; yaw: number; timestamp?: number } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionText, setTransitionText] = useState('');
  const [panoInputUrl, setPanoInputUrl] = useState(currentRoom.panoramaUrl);
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  // Danh mục ngôn ngữ đang Active trong hệ thống
  const [activeLanguages, setActiveLanguages] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    api.getActiveLanguages().then((langs) => {
      if (isMounted && Array.isArray(langs)) {
        setActiveLanguages(langs);
      }
    }).catch(console.warn);
    return () => { isMounted = false; };
  }, []);

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

  // Danh mục ngôn ngữ THỰC TẾ:
  // 1. Phải có file âm thanh thật .mp3 trong Database của phòng này
  // 2. TUYỆT ĐỐI KHÔNG HIỂN THỊ NẾU ADMIN ĐÃ TẮT HOẠT ĐỘNG (isActive === false) trong hệ thống
  const availableVoiceLangs = useMemo(() => {
    const langs: Array<{ code: string; label: string; flag: string; audioUrl: string; script?: string }> = [];
    const activeMap = new Map(activeLanguages.map((l: any) => [l.code.toLowerCase(), l]));

    // Kiểm tra tiếng Việt: CHỈ THÊM NẾU CÓ FILE ÂM THANH THẬT TRONG DB
    const viAudio = currentRoom.translations?.vi?.audioUrl || (currentRoom as any).audioUrl;
    if (isAudioFileUrl(viAudio)) {
      langs.push({
        code: 'vi',
        label: 'Tiếng Việt',
        flag: 'VI',
        audioUrl: viAudio.trim(),
        script: currentRoom.translations?.vi?.narrationScript || currentRoom.aiScript || ''
      });
    }

    // Kiểm tra các ngôn ngữ khác: Chỉ thêm nếu có file MP3 THẬT VÀ ĐANG ACTIVE TRONG HỆ THỐNG
    if (currentRoom.translations) {
      for (const [code, trans] of Object.entries(currentRoom.translations)) {
        const cleanCode = code.toLowerCase();
        if (cleanCode === 'vi') continue;

        // Bỏ qua nếu Admin đã tắt hoạt động ngôn ngữ này trong trang Quản trị Ngôn ngữ
        if (activeLanguages.length > 0 && !activeMap.has(cleanCode)) {
          continue;
        }

        if (trans && isAudioFileUrl(trans.audioUrl)) {
          const dbLang = activeMap.get(cleanCode);
          const meta = LANGUAGE_META[cleanCode];
          const label = dbLang?.nativeName || meta?.label || cleanCode.toUpperCase();
          langs.push({
            code: cleanCode,
            label,
            flag: cleanCode.toUpperCase(),
            audioUrl: (trans.audioUrl as string).trim(),
            script: trans.narrationScript || ''
          });
        }
      }
    }

    return langs;
  }, [currentRoom, activeLanguages]);

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

  // Kích hoạt hộp thoại xác nhận xóa điểm liên kết
  const promptDeleteHotspot = (hs: Hotspot) => {
    setDeletingHotspot(hs);
  };

  // Thực thi xóa điểm liên kết thật trong Database và cập nhật state
  const executeDeleteHotspot = async () => {
    if (!deletingHotspot) return;
    const targetId = deletingHotspot.id;
    setDeletingHotspot(null);
    try {
      await api.deleteHotspot(currentRoom.id, targetId);
      const updatedRoom: MuseumRoom = {
        ...currentRoom,
        hotspots: (currentRoom.hotspots || []).filter((h) => h.id !== targetId)
      };
      onRoomUpdated(updatedRoom);
      showToast('Đã xóa điểm liên kết khỏi cơ sở dữ liệu thành công', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa điểm liên kết', 'error');
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

  // Xem thử góc nhìn mặc định đã lưu
  const handlePreviewInitialView = () => {
    const pitch = currentRoom.initialView?.pitch ?? 0;
    const yaw = currentRoom.initialView?.yaw ?? 0;
    setFocusCoords({ pitch, yaw, timestamp: Date.now() });
    showToast(`Đang xoay camera về góc nhìn ban đầu (Ngang: ${Math.round(yaw)}°, Đứng: ${Math.round(pitch)}°)`, 'info');
  };

  // Lưu góc nhìn mà Admin đang xoay camera trên màn hình làm góc nhìn mặc định khi vào phòng
  const handleSaveCurrentView = () => {
    const activeViewer = (window as any)._activePannellumViewer;
    if (activeViewer) {
      const pitch = Math.round(activeViewer.getPitch() * 10) / 10;
      const yaw = Math.round(activeViewer.getYaw() * 10) / 10;
      const fov = Math.round(activeViewer.getHfov() * 10) / 10;
      handleCaptureInitialView({ pitch, yaw, fov });
      return;
    }
    showToast('Hãy xoay khung nhìn 360° đến góc bạn muốn trước khi lưu.', 'info');
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
          title=""
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

        {/* CỤM THANH HEADER DI SẢN 360° THỐNG NHẤT (Tên phòng + Mã phòng + Audio Guide trên cùng 1 thanh sang trọng) */}
        <div className="studio-heritage-capsule">
          {/* Cụm 1: Biểu tượng bảo tàng & Tên gian phòng */}
          <div className="studio-heritage-room-block">
            <span style={{ fontSize: '15px' }} title="Bảo tàng Lịch sử TP. Hồ Chí Minh">🏛️</span>
            <span className="studio-heritage-title">
              {currentRoom.name}
            </span>
            <span className="studio-heritage-code">
              {currentRoom.code}
            </span>
          </div>

          {/* Vạch ngăn cách di sản thanh lịch */}
          <div className="studio-heritage-divider" />

          {/* Cụm 2: Thuyết minh Voice AI Di sản (Tích hợp liền mạch) */}
          <div className="studio-heritage-voice-block">
            {availableVoiceLangs.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--text-muted)',
                  fontSize: '11.5px',
                  padding: '2px 0'
                }}
                title="Gian phòng chưa có file âm thanh thuyết minh nào trong Database"
              >
                <VolumeX size={14} style={{ opacity: 0.7 }} />
                <span>Chưa có Voice AI</span>
              </div>
            ) : (
              <>
                {/* Nút Play/Pause phát giọng nói */}
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: 'none',
                    background: isPlayingVoice ? '#DC2626' : 'var(--accent-gold)',
                    color: isPlayingVoice ? '#FFF' : '#160F0C',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isPlayingVoice ? '0 0 12px rgba(220, 38, 38, 0.6)' : '0 2px 6px rgba(212, 168, 106, 0.4)'
                  }}
                  title={isPlayingVoice ? 'Tạm dừng giọng thuyết minh' : 'Phát thuyết minh Voice AI'}
                >
                  {isPlayingVoice ? <Pause size={13} /> : <Play size={13} style={{ marginLeft: 2 }} />}
                </button>

                {/* Chọn hoặc hiển thị ngôn ngữ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {availableVoiceLangs.length === 1 ? (
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#EDE5DF', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Globe size={13} style={{ color: 'var(--accent-gold)' }} />
                      <span className="studio-voice-lang-label">{availableVoiceLangs[0].label}</span>
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
                      className="studio-voice-select"
                    >
                      {availableVoiceLangs.map((lang) => (
                        <option key={lang.code} value={lang.code} style={{ background: '#1A1715', color: '#FFF' }}>
                          [{lang.code.toUpperCase()}] {lang.label}
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
                    padding: '3px',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Xem văn bản kịch bản thuyết minh"
                >
                  <Info size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Popup hiển thị kịch bản thuyết minh */}
        {showScriptPopup && availableVoiceLangs.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 60,
              left: 18,
              zIndex: 35,
              width: 360,
              maxWidth: 'calc(100% - 36px)',
              background: 'rgba(23, 18, 14, 0.96)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(212, 168, 106, 0.4)',
              borderRadius: 12,
              padding: '12px 16px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
              color: '#EDE5DF',
              fontFamily: "'Be Vietnam Pro', sans-serif"
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
        {/* Nút mở bảng công cụ & điểm trên mobile */}
        <button
          type="button"
          className="studio-mobile-toggle-btn"
          onClick={() => setIsMobilePanelOpen(true)}
          aria-label="Mở bảng công cụ gian phòng"
        >
          <Sliders size={14} />
          <span>Công cụ & Điểm</span>
          <span className="studio-mobile-badge">{currentRoom.hotspots?.length || 0}</span>
        </button>
      </div>

      {/* Backdrop mờ khi mở Drawer trên mobile */}
      {isMobilePanelOpen && (
        <div
          className="studio-mobile-backdrop"
          onClick={() => setIsMobilePanelOpen(false)}
        />
      )}

      {/* Studio Control Sidebar - Siêu gọn 2 Tab, không cần cuộn (Bottom Sheet trên Mobile) */}
      <div className={`studio-sidebar ${isMobilePanelOpen ? 'mobile-open' : ''}`}>
        {/* Thanh kéo drawer trên mobile */}
        <div className="studio-mobile-drawer-handle" />

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

          {/* Nút đóng bảng điều khiển trên Mobile */}
          <button
            type="button"
            className="studio-mobile-close-btn"
            onClick={() => setIsMobilePanelOpen(false)}
            aria-label="Đóng bảng công cụ"
          >
            <X size={16} />
          </button>
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
                onClick={() => {
                  const next = !isPinMode;
                  setIsPinMode(next);
                  if (next && window.innerWidth <= 1024) {
                    setIsMobilePanelOpen(false);
                    showToast('Chạm vào vị trí bất kỳ trên ảnh 360° để đặt điểm', 'info');
                  }
                }}
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
                            title="Xóa điểm liên kết này"
                            onClick={() => promptDeleteHotspot(hs)}
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
            {/* Mục 1: Góc nhìn ban đầu khi vào phòng */}
            <div className="studio-section">
              <div className="studio-section-title">
                <Camera size={13} style={{ color: 'var(--accent-gold)' }} />
                <span>Góc nhìn ban đầu khi vào phòng</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.4 }}>
                Hướng nhìn mà khách tham quan (Client) sẽ thấy đầu tiên ngay khi mở phòng hoặc quét mã QR.
              </p>

              {/* Thông số góc nhìn hiện hành đang lưu trong DB */}
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 6,
                  padding: '8px 10px',
                  marginBottom: 10,
                  fontSize: '11px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Góc xoay ngang (Yaw):</span>
                  <strong style={{ color: 'var(--accent-gold)' }}>
                    {currentRoom.initialView?.yaw !== undefined ? `${Math.round(currentRoom.initialView.yaw)}°` : '0° (Chính diện)'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Góc ngước/cúi (Pitch):</span>
                  <strong style={{ color: 'var(--accent-gold)' }}>
                    {currentRoom.initialView?.pitch !== undefined ? `${Math.round(currentRoom.initialView.pitch)}°` : '0° (Ngang mắt)'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>Góc mở rộng (FOV):</span>
                  <strong style={{ color: 'var(--accent-gold)' }}>
                    {currentRoom.initialView?.fov !== undefined ? `${Math.round(currentRoom.initialView.fov)}°` : '100° (Chuẩn)'}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '11.5px', gap: 6 }}
                  onClick={handleSaveCurrentView}
                  title="Lấy góc nhìn hiện tại bạn đang xoay trong khung 360 làm góc mặc định"
                >
                  <Save size={12} />
                  <span>Lưu góc đang nhìn làm mặc định</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '11.5px', gap: 6 }}
                  onClick={handlePreviewInitialView}
                  title="Xoay camera về đúng góc nhìn mặc định đã lưu để kiểm tra"
                >
                  <Eye size={12} />
                  <span>Xem thử góc nhìn mặc định</span>
                </button>
              </div>
            </div>

            {/* Mục 2: Thay đổi ảnh toàn cảnh 360° */}
            <div className="studio-section">
              <div className="studio-section-title">
                <Layers size={13} style={{ color: 'var(--accent-gold)' }} />
                <span>Ảnh toàn cảnh 360° của phòng</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, lineHeight: 1.4 }}>
                Ảnh Panorama 360° thực tế (Equirectangular 2:1) đang dùng cho gian phòng này.
              </p>

              {/* Preview ảnh hiện tại */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)',
                  marginBottom: 10,
                  background: '#000'
                }}
              >
                <img
                  src={currentRoom.panoramaUrl}
                  alt={currentRoom.name}
                  style={{ width: '100%', height: 85, objectFit: 'cover', display: 'block' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    left: 6,
                    background: 'rgba(0, 0, 0, 0.75)',
                    color: '#FFF',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: '10px'
                  }}
                >
                  Ảnh hiện hành
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Nút tải ảnh mới từ máy tính & nhập URL */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <label
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center', cursor: 'pointer', fontSize: '11.5px', gap: 5 }}
                    title="Tải file ảnh panorama 360 mới từ máy tính lên máy chủ"
                  >
                    <Upload size={12} />
                    <span>{uploading ? 'Đang tải lên...' : 'Tải ảnh mới từ máy'}</span>
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
                    title="Nhập liên kết URL ảnh 360°"
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
                      placeholder="https://... đường dẫn ảnh 360"
                      style={{ fontSize: '11px', padding: '5px 8px' }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleUpdatePanoUrl}
                      style={{ justifyContent: 'center', fontSize: '11.5px', padding: '4px 8px', gap: 4 }}
                    >
                      <Save size={11} />
                      <span>Áp dụng liên kết</span>
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
                    <CheckCircle2 size={12} /> Đã cập nhật ảnh 360° thành công!
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

      {/* Modal xác nhận xóa điểm liên kết chuẩn hệ thống Admin */}
      <ConfirmModal
        isOpen={Boolean(deletingHotspot)}
        title="Xác nhận xóa điểm liên kết"
        message={`Bạn có chắc chắn muốn xóa điểm liên kết "${deletingHotspot?.title}"? Điểm này sẽ bị xóa vĩnh viễn khỏi không gian 360° của gian phòng trong cơ sở dữ liệu.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        type="danger"
        onConfirm={executeDeleteHotspot}
        onCancel={() => setDeletingHotspot(null)}
      />
    </div>
  );
};
