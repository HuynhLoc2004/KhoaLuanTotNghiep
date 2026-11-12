import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MuseumRoom, Hotspot, LanguageItem, Artifact } from '../../types';
import { Pannellum360Viewer, PannellumHotSpot } from '../../viewer360/Pannellum360Viewer';
import { InteractiveVideoTourViewer } from '../../components/InteractiveVideoTourViewer';
import { Turntable360Viewer } from '../../components/Turntable360Viewer';
import { api, API_ROOT } from '../../services/api';
import {
  ArrowLeft,
  Compass,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Globe,
  ChevronDown,
  ChevronRight,
  Info,
  X,
  Check,
  Headphones,
  BookOpen,
  Box,
  Sparkles,
  Layers,
  Eye
} from 'lucide-react';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import '../../styles/client.css';

interface ClientTourViewProps {
  currentRoom: MuseumRoom;
  allRooms: MuseumRoom[];
  artifacts?: Artifact[];
  onBackToHome: () => void;
  onNavigateRoom: (room: MuseumRoom) => void;
}

export const ClientTourView: React.FC<ClientTourViewProps> = ({
  currentRoom,
  allRooms,
  artifacts = [],
  onBackToHome,
  onNavigateRoom
}) => {
  const { currentLang, activeLanguages, changeLanguage, t, localize } = useClientTranslation();

  // State cho dropdown chọn phòng & chọn ngôn ngữ
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // State cho danh sách hiện vật trong gian phòng & Sidebar bên phải
  const [roomArtifactsList, setRoomArtifactsList] = useState<Artifact[]>(artifacts);
  // Trên Desktop (>=1024px) mở sẵn thanh hiện vật; Trên Mobile/Tablet (<1024px) mặc định ĐÓNG để hiện trọn vẹn không gian 360°
  const [isArtifactsSidebarOpen, setIsArtifactsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const [active3DArtifact, setActive3DArtifact] = useState<Artifact | null>(null);

  // Theo dõi thay đổi kích thước màn hình để responsive tối ưu
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      setIsMobileScreen(isMobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // State cho Voice AI thuyết minh
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0); // 0 - 100
  const [hasVoiceAudio, setHasVoiceAudio] = useState(false);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const titlePillRef = useRef<HTMLButtonElement>(null);
  const roomDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Nạp danh sách hiện vật từ server nếu chưa có từ prop
  useEffect(() => {
    if (artifacts && artifacts.length > 0) {
      setRoomArtifactsList(artifacts);
    } else {
      api.getArtifacts()
        .then((list) => {
          if (Array.isArray(list)) setRoomArtifactsList(list);
        })
        .catch((err) => console.warn('[ClientTourView] Lỗi nạp hiện vật:', err));
    }
  }, [artifacts]);

  // Bộ lọc thông minh xác định hiện vật thuộc gian phòng hiện tại (data thật từ CSDL)
  const matchingArtifacts = useMemo(() => {
    if (!roomArtifactsList || roomArtifactsList.length === 0) return [];

    const curId = String(currentRoom.id || (currentRoom as any)._id || '').trim();
    const curCode = String(currentRoom.code || '').trim().toLowerCase();
    const curName = String(currentRoom.name || '').trim().toLowerCase();
    const curPeriod = String(currentRoom.period || '').trim().toLowerCase();

    return roomArtifactsList.filter((art) => {
      const artRoomId = String(art.roomId || '').trim();
      const artRoomCode = String(art.roomCode || '').trim().toLowerCase();
      const artPeriod = String(art.period || '').trim().toLowerCase();
      const artName = String(art.name || '').trim().toLowerCase();

      // 1. Khớp trực tiếp theo ID phòng hoặc Mã phòng (quan hệ CSDL 100%)
      if (artRoomId && (artRoomId === curId || (currentRoom as any)._id === artRoomId)) return true;
      if (artRoomCode && curCode && artRoomCode === curCode) return true;

      // 2. Khớp theo Triều đại / Niên đại (Ví dụ: "Thời Lý", "Thời Trần", "Óc Eo"...)
      if (curPeriod && artPeriod) {
        const cleanCurPeriod = curPeriod.replace(/thời\s*/i, '').trim();
        const cleanArtPeriod = artPeriod.replace(/thời\s*/i, '').trim();
        if (cleanCurPeriod && cleanArtPeriod && (cleanCurPeriod.includes(cleanArtPeriod) || cleanArtPeriod.includes(cleanCurPeriod))) {
          return true;
        }
      }

      // 3. Khớp nếu Tên gian phòng chứa tên triều đại/thời kỳ của hiện vật (Ví dụ "Gian phòng Thời Lý" chứa "Thời Lý" hoặc "Lý")
      if (artPeriod) {
        const cleanArtPeriod = artPeriod.replace(/thời\s*/i, '').trim();
        if (cleanArtPeriod && curName.includes(cleanArtPeriod)) {
          return true;
        }
      }

      // 4. Khớp nếu Hotspot trong gian phòng liên kết tới hiện vật này
      if (currentRoom.hotspots && currentRoom.hotspots.some((h: any) => h.artifactId === art.id || (h.title && h.title.toLowerCase().includes(artName)))) {
        return true;
      }

      return false;
    });
  }, [roomArtifactsList, currentRoom]);

  // Tự động kích hoạt resize event cho Pannellum khi bật/tắt Sidebar bên phải
  useEffect(() => {
    const t1 = setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
    const t2 = setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isArtifactsSidebarOpen]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        roomDropdownRef.current &&
        !roomDropdownRef.current.contains(target) &&
        titlePillRef.current &&
        !titlePillRef.current.contains(target)
      ) {
        setIsRoomDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(target)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xác định file âm thanh hoặc văn bản thuyết minh theo ngôn ngữ hiện hành
  const getNarrationData = () => {
    let transObj: Record<string, any> = {};
    if (typeof currentRoom.translations === 'string') {
      try { transObj = JSON.parse(currentRoom.translations); } catch { transObj = {}; }
    } else if (currentRoom.translations && typeof currentRoom.translations === 'object') {
      transObj = currentRoom.translations;
    }

    const lang = (currentLang || 'vi').toLowerCase();
    const langData = transObj[lang] || {};

    let audioUrl = '';
    let scriptText = '';

    if (lang === 'vi') {
      audioUrl = langData.audioUrl || currentRoom.audioUrl || (currentRoom as any).audio_url || '';
      scriptText = langData.narrationScript || currentRoom.aiScript || currentRoom.description || '';
    } else {
      audioUrl = langData.audioUrl || '';
      scriptText = langData.narrationScript || langData.description || '';
      if (!audioUrl) {
        audioUrl = currentRoom.audioUrl || (currentRoom as any).audio_url || '';
      }
    }

    let resolvedAudio = '';
    if (audioUrl && typeof audioUrl === 'string' && audioUrl.trim()) {
      const trimmed = audioUrl.trim();
      resolvedAudio = trimmed.startsWith('http') ? trimmed : `${API_ROOT}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
    }

    return {
      audioUrl: resolvedAudio,
      scriptText: scriptText.trim()
    };
  };

  // Dừng âm thanh khi chuyển phòng hoặc unmount
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlayingVoice(false);
    setVoiceProgress(0);
  };

  // Khi phòng hoặc ngôn ngữ thay đổi, reset âm thanh
  useEffect(() => {
    stopAudio();
    const data = getNarrationData();
    setHasVoiceAudio(Boolean(data.audioUrl));
    return () => {
      stopAudio();
    };
  }, [currentRoom.id, currentLang, currentRoom.translations, currentRoom.audioUrl]);

  // Xử lý bật / tắt thuyết minh Voice AI
  const toggleVoicePlayback = () => {
    if (isPlayingVoice) {
      stopAudio();
      return;
    }

    const { audioUrl } = getNarrationData();

    if (!audioUrl) {
      setIsPlayingVoice(false);
      const langUpper = (currentLang || 'vi').toUpperCase();
      setVoiceToast(`Gian phòng chưa có bản thu âm giới thiệu cho ngôn ngữ [${langUpper}]. Ban quản lý đang cập nhật.`);
      setTimeout(() => setVoiceToast(null), 3500);
      return;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => setIsPlayingVoice(true);
    audio.onended = () => {
      setIsPlayingVoice(false);
      setVoiceProgress(0);
    };
    audio.onerror = () => {
      setIsPlayingVoice(false);
      setVoiceToast('Không thể tải tệp âm thanh giới thiệu từ máy chủ.');
      setTimeout(() => setVoiceToast(null), 3500);
    };
    audio.ontimeupdate = () => {
      if (audio.duration > 0) {
        setVoiceProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.play().catch(() => {
      setIsPlayingVoice(false);
      setVoiceToast('Trình duyệt chặn tự động phát âm thanh. Vui lòng bấm lại để nghe.');
      setTimeout(() => setVoiceToast(null), 3500);
    });
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    if (hotspot.type === 'navigation' && hotspot.targetRoomId) {
      const target = allRooms.find((r) => r.id === hotspot.targetRoomId || r.code === hotspot.targetRoomId);
      if (target) {
        onNavigateRoom(target);
        return;
      }
    }
    setSelectedHotspot(hotspot);
  };

  const sanitizeMuseumText = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/^Bước vào\s+/i, '')
      .replace(/^Quay lại\s+Sảnh Đón Khách/i, 'Sảnh Chính')
      .replace(/^Quay lại\s+/i, '')
      .replace(/^Sang\s+/i, '')
      .replace(/Sảnh Đón Khách\s*&\s*Giới Thiệu Tổng Thể/gi, 'Sảnh Chính')
      .replace(/Gian Thời Tiền Sử Việt Nam/gi, 'Phòng Thời Tiền Sử')
      .replace(/Gian Thời Tiền Sử/gi, 'Phòng Thời Tiền Sử')
      .replace(/Thời kỳ Thành lập\s*&\s*Kiến trúc Đông Dương/gi, 'Kiến trúc Đông Dương (1929)')
      .replace(/Thời kỳ Đồ Đá\s*&\s*Đồ Đồng\s*\(Cách nay hàng ngàn năm\)/gi, 'Thời đại Đồ đá & Đồ đồng')
      .replace(/Gian Văn Hóa Óc Eo\s*&\s*Vương Quốc Phù Nam/gi, 'Phòng Văn hóa Óc Eo – Phù Nam')
      .replace(/Thế kỷ I đến Thế kỷ VII sau Công nguyên/gi, 'Thế kỷ I – VII SCN')
      .replace(/Bia đá lưu niệm kiến trúc bảo tàng/i, 'Văn bia kỷ niệm khánh thành (1929)')
      .replace(/Tượng Phật Gỗ Cổ Óc Eo/i, 'Tượng Phật gỗ cổ Óc Eo (Bảo vật Quốc gia)');
  };

  const getMediaUrl = (path?: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${API_ROOT}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const title = localize(currentRoom, 'name', currentRoom.name);
  const period = localize(currentRoom, 'period', currentRoom.period || currentRoom.category || 'Gian phòng di sản');
  const description = localize(currentRoom, 'description', currentRoom.description || '');

  // Định dạng hotspots chuẩn cho trình chiếu Pannellum 360° đồng bộ với Admin Studio
  const pannellumHotspots: PannellumHotSpot[] = (currentRoom.hotspots || []).map((h) => ({
    pitch: h.pitch,
    yaw: h.yaw,
    type: (h.type === 'navigation' ? 'scene' : 'info') as 'scene' | 'info',
    text: localize(h, 'title', h.title),
    roomId: h.targetRoomId,
    onClick: () => handleHotspotClick(h)
  }));

  return (
    <div
      className="client-tour-root-layout"
      style={{
        position: 'relative',
        width: '100vw',
        height: '100dvh',
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#0a0d14',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'row'
      }}
    >
      {/* SECTION BÊN TRÁI: TOÀN BỘ KHÔNG GIAN TOUR 360° (HÌNH 2) */}
      <div
        className="client-tour-main-viewport"
        style={{
          position: 'relative',
          flex: 1,
          height: '100%',
          overflow: 'hidden',
          transition: 'all 0.25s ease'
        }}
      >
        {/* 1. THANH ĐIỀU HƯỚNG NỔI CAO CẤP PHÍA TRÊN */}
        <header
          className="client-tour-header"
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            right: 16,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            pointerEvents: 'none'
          }}
        >
          {/* NÚT QUAY VỀ TRANG CHỦ */}
          <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              className="client-tour-back-btn"
              onClick={onBackToHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 24,
                background: 'rgba(13, 17, 23, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: '#E5E7EB',
                border: '1px solid rgba(212, 168, 106, 0.25)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 168, 106, 0.5)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 168, 106, 0.25)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <ArrowLeft size={14} style={{ color: '#D4A86A' }} />
              <span>{t('tour.backHome', 'Trang chủ')}</span>
            </button>
          </div>

          {/* THÔNG TIN GIAN PHÒNG HIỆN TẠI */}
          <button
            ref={titlePillRef}
            type="button"
            className="client-tour-title-pill"
            onClick={() => setIsRoomDropdownOpen((prev) => !prev)}
            title="Nhấp để chuyển gian phòng"
            style={{
              pointerEvents: 'auto',
              background: 'rgba(13, 17, 23, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(212, 168, 106, 0.25)',
              padding: '5px 16px',
              borderRadius: 24,
              textAlign: 'center',
              color: '#FFFFFF',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
          >
            <div className="client-tour-title-desktop">
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%'
                }}
                title={title}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: '10.5px',
                  color: '#D4A86A',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  opacity: 0.95
                }}
              >
                {currentRoom.code ? `${currentRoom.code} • ` : ''}{period}
              </div>
            </div>

            <div className="client-tour-title-mobile">
              <Compass size={13} style={{ color: '#D4A86A', flexShrink: 0 }} />
              <span>
                {currentRoom.code ? `[${currentRoom.code}] ` : ''}{sanitizeMuseumText(currentRoom.name)}
              </span>
              <ChevronDown
                size={12}
                style={{
                  color: '#D4A86A',
                  opacity: 0.8,
                  flexShrink: 0,
                  transform: isRoomDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }}
              />
            </div>
          </button>

          {/* CỤM NÚT ĐIỀU HƯỚNG BÊN PHẢI: BẬT CỔ VẬT + THUYẾT MINH AI + BỘ CHỌN PHÒNG + INFO */}
          <div className="client-tour-actions" style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>

            {/* NÚT BẬT / TẮT DANH SÁCH CỔ VẬT CỦA GIAN PHÒNG */}
            <button
              type="button"
              className="client-tour-artifacts-pill-btn"
              onClick={() => setIsArtifactsSidebarOpen((prev) => !prev)}
              title={isArtifactsSidebarOpen ? 'Thu gọn khung trưng bày cổ vật' : 'Mở danh sách cổ vật trưng bày tại gian phòng'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 24,
                background: isArtifactsSidebarOpen ? 'rgba(212, 168, 106, 0.25)' : 'rgba(13, 17, 23, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: isArtifactsSidebarOpen ? '#FDE68A' : '#E5E7EB',
                border: '1px solid',
                borderColor: isArtifactsSidebarOpen ? 'rgba(212, 168, 106, 0.65)' : 'rgba(212, 168, 106, 0.25)',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <Box size={13} style={{ color: '#D4A86A', flexShrink: 0 }} />
              <span className="artifacts-btn-label">Cổ vật ({matchingArtifacts.length})</span>
              <span
                className="artifacts-btn-mobile-badge"
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: 10,
                  background: isArtifactsSidebarOpen ? '#D4A86A' : 'rgba(212, 168, 106, 0.25)',
                  color: isArtifactsSidebarOpen ? '#000' : '#FDE68A',
                  marginLeft: 1
                }}
              >
                {matchingArtifacts.length}
              </span>
            </button>

            {/* NÚT NGHE GIỚI THIỆU VOICE AI & CHUYỂN ĐỔI NGÔN NGỮ ĐỒNG BỘ */}
            <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(13, 17, 23, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(212, 168, 106, 0.25)', borderRadius: 24, padding: '2px 4px', boxShadow: '0 4px 16px rgba(0,0,0,0.35)', flexShrink: 0 }}>
              <button
                type="button"
                className="client-tour-voice-btn"
                onClick={toggleVoicePlayback}
                title={isPlayingVoice ? 'Tạm dừng nghe giới thiệu' : 'Bật giọng đọc giới thiệu gian phòng'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 10px',
                  borderRadius: 20,
                  border: 'none',
                  background: isPlayingVoice ? 'rgba(212, 168, 106, 0.22)' : 'transparent',
                  color: isPlayingVoice ? '#D4A86A' : '#E5E7EB',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {isPlayingVoice ? (
                  <>
                    <Pause size={12} style={{ fill: '#D4A86A', flexShrink: 0 }} />
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, height: 12, flexShrink: 0 }}>
                      <span style={{ width: 2, height: 8, background: '#D4A86A', borderRadius: 1, animation: 'audioWave 0.8s infinite ease-in-out' }} />
                      <span style={{ width: 2, height: 12, background: '#D4A86A', borderRadius: 1, animation: 'audioWave 0.8s infinite ease-in-out 0.2s' }} />
                      <span style={{ width: 2, height: 6, background: '#D4A86A', borderRadius: 1, animation: 'audioWave 0.8s infinite ease-in-out 0.4s' }} />
                    </span>
                    <span className="voice-text-full">{t('tour.voicePlaying', 'Đang đọc...')}</span>
                    <span className="voice-text-short">{t('tour.voicePlayingShort', 'Đang đọc')}</span>
                  </>
                ) : (
                  <>
                    <Volume2 size={13} style={{ color: '#D4A86A', flexShrink: 0 }} />
                    <span className="voice-text-full">{t('tour.voiceAi', 'Thuyết minh')}</span>
                    <span className="voice-text-short">{t('tour.voiceAiShort', 'Nghe')}</span>
                  </>
                )}
              </button>

              <div style={{ width: 1, height: 14, background: 'rgba(212, 168, 106, 0.2)', margin: '0 2px', flexShrink: 0 }} />

              <div ref={langDropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                  title="Chọn ngôn ngữ giọng đọc"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: '4px 6px',
                    borderRadius: 16,
                    border: 'none',
                    background: 'transparent',
                    color: '#D4A86A',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  <span>{currentLang}</span>
                  <ChevronDown size={10} style={{ opacity: 0.7 }} />
                </button>

                {isLangDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: 150,
                      background: 'rgba(18, 22, 30, 0.96)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(212, 168, 106, 0.35)',
                      borderRadius: 12,
                      padding: '6px',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                      zIndex: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, padding: '4px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 2 }}>
                      Ngôn ngữ thuyết minh
                    </div>
                    {activeLanguages.map((lang) => {
                      const isSelected = lang.code === currentLang;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => {
                            changeLanguage(lang.code);
                            setIsLangDropdownOpen(false);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: 6,
                            border: 'none',
                            background: isSelected ? 'rgba(212, 168, 106, 0.16)' : 'transparent',
                            color: isSelected ? '#D4A86A' : '#E5E7EB',
                            fontSize: '12px',
                            fontWeight: isSelected ? 600 : 400,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background 0.15s'
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: isSelected ? 'rgba(212, 168, 106, 0.25)' : 'rgba(255, 255, 255, 0.08)', color: '#D4A86A' }}>
                              {lang.code.toUpperCase()}
                            </span>
                            <span>{lang.nativeName || lang.name}</span>
                          </span>
                          {isSelected && <Check size={13} style={{ color: '#D4A86A' }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* BỘ CHỌN PHÒNG TÙY BIẾN */}
            <div ref={roomDropdownRef} className="client-tour-room-wrapper" style={{ position: 'relative' }}>
              <button
                type="button"
                className="client-tour-room-btn client-tour-room-btn-desktop"
                onClick={() => setIsRoomDropdownOpen((prev) => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 24,
                  background: 'rgba(13, 17, 23, 0.85)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  color: '#E5E7EB',
                  border: '1px solid rgba(212, 168, 106, 0.25)',
                  fontSize: '11.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Compass size={13} style={{ color: '#D4A86A', flexShrink: 0 }} />
                <span>{t('tour.changeRoom', 'Đổi gian phòng')}</span>
                <ChevronDown
                  size={11}
                  style={{
                    color: '#D4A86A',
                    opacity: 0.8,
                    flexShrink: 0,
                    transform: isRoomDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </button>

              {isRoomDropdownOpen && (
                <div
                  className="client-tour-room-dropdown-menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 310,
                    maxHeight: '65vh',
                    overflowY: 'auto',
                    background: 'rgba(18, 22, 30, 0.97)',
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    border: '1px solid rgba(212, 168, 106, 0.35)',
                    borderRadius: 14,
                    padding: '8px',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
                    zIndex: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px 8px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 2 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#D4A86A', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                      Danh sách Gian phòng ({allRooms.length})
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#9CA3AF' }}>Chọn để chuyển</span>
                  </div>

                  {allRooms.map((r) => {
                    const isSelected = r.id === currentRoom.id;
                    const rName = sanitizeMuseumText(localize(r, 'name', r.name));
                    const rPeriod = sanitizeMuseumText(localize(r, 'period', r.period || ''));
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          onNavigateRoom(r);
                          setIsRoomDropdownOpen(false);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 8,
                          border: '1px solid',
                          borderColor: isSelected ? 'rgba(212, 168, 106, 0.4)' : 'transparent',
                          background: isSelected ? 'rgba(212, 168, 106, 0.12)' : 'transparent',
                          color: isSelected ? '#FFFFFF' : '#E5E7EB',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: isSelected ? '#B45309' : 'rgba(255, 255, 255, 0.1)',
                            color: '#FFFFFF',
                            marginTop: 1,
                            flexShrink: 0
                          }}
                        >
                          {r.code || '360'}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: '12.5px', fontWeight: isSelected ? 600 : 500, color: isSelected ? '#D4A86A' : '#F3F4F6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {rName}
                          </div>
                          {rPeriod && (
                            <div style={{ fontSize: '11px', color: '#9CA3AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
                              {rPeriod}
                            </div>
                          )}
                        </div>
                        {isSelected && <Check size={14} style={{ color: '#D4A86A', flexShrink: 0, marginTop: 4 }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* NÚT XEM TƯ LIỆU GIAN PHÒNG */}
            <button
              type="button"
              onClick={() => setIsInfoDrawerOpen(true)}
              title="Xem chi tiết lịch sử gian phòng"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(13, 17, 23, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: '#D4A86A',
                border: '1px solid rgba(212, 168, 106, 0.25)',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
                transition: 'all 0.2s'
              }}
            >
              <Info size={14} style={{ color: '#D4A86A' }} />
            </button>
          </div>
        </header>

        {/* Thông báo trạng thái thuyết minh Voice AI */}
        {voiceToast && (
          <div
            style={{
              position: 'absolute',
              top: 76,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 110,
              background: 'rgba(18, 22, 30, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(212, 168, 106, 0.45)',
              color: '#FDE68A',
              padding: '9px 20px',
              borderRadius: 30,
              fontSize: '12.5px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              pointerEvents: 'none',
              maxWidth: '90vw',
              textAlign: 'center'
            }}
          >
            <VolumeX size={15} style={{ color: '#F59E0B', flexShrink: 0 }} />
            <span>{voiceToast}</span>
          </div>
        )}

        {/* TRÌNH CHIẾU PANORAMA 360° HOẶC VIDEO TOUR */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          {currentRoom.panoramaUrl &&
          (currentRoom.panoramaUrl.endsWith('.mp4') ||
            currentRoom.panoramaUrl.endsWith('.webm') ||
            currentRoom.panoramaUrl.endsWith('.mov') ||
            currentRoom.panoramaUrl.includes('/video/upload/') ||
            (currentRoom as any).mediaType === 'video' ||
            (currentRoom as any).videoUrl) ? (
            <InteractiveVideoTourViewer
              key={currentRoom.id}
              videoUrl={(currentRoom as any).videoUrl || currentRoom.panoramaUrl}
              title={localize(currentRoom, 'name', currentRoom.name)}
              hotspots={currentRoom.hotspots || []}
              allRooms={allRooms}
              onHotspotClick={handleHotspotClick}
              onNavigateRoom={onNavigateRoom}
            />
          ) : (
            <Pannellum360Viewer
              key={currentRoom.id}
              panoramaUrl={currentRoom.panoramaUrl}
              title=""
              showTitle={false}
              autoStartLittlePlanet={false}
              hotspots={pannellumHotspots}
              onHotspotClick={(hs) => {
                const origin = currentRoom.hotspots?.find(
                  (h) => (h.targetRoomId && h.targetRoomId === hs.roomId) || h.title === hs.text
                );
                if (origin) {
                  handleHotspotClick(origin);
                } else if (hs.roomId) {
                  const target = allRooms.find((r) => r.id === hs.roomId || r.code === hs.roomId);
                  if (target) onNavigateRoom(target);
                }
              }}
              initialPitch={currentRoom.initialView?.pitch ?? 0}
              initialYaw={currentRoom.initialView?.yaw ?? 0}
              initialHfov={currentRoom.initialView?.fov ? Math.min(currentRoom.initialView.fov, 100) : 100}
            />
          )}
        </div>

        {/* NÚT MỞ LẠI PANEL HIỆN VẬT GIAN PHÒNG (KHI ĐANG BỊ THU GỌN) */}
        {!isArtifactsSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsArtifactsSidebarOpen(true)}
            className="client-tour-artifacts-reopen-btn"
            title="Mở danh sách cổ vật trưng bày trong gian phòng này"
            style={{
              position: 'absolute',
              top: 76,
              right: 16,
              zIndex: 90,
              background: 'rgba(13, 17, 23, 0.9)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(212, 168, 106, 0.4)',
              borderRadius: 24,
              padding: '7px 14px',
              color: '#F8FAFC',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D4A86A';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 168, 106, 0.4)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Box size={14} style={{ color: '#D4A86A' }} />
            <span>Cổ vật trong phòng</span>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: 10,
                background: '#D4A86A',
                color: '#000'
              }}
            >
              {matchingArtifacts.length}
            </span>
          </button>
        )}

        {/* POPUP THÔNG TIN HOTSPOT KHI CLICK */}
        {selectedHotspot && (
          <div
            style={{
              position: 'absolute',
              bottom: 30,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 150,
              maxWidth: 460,
              width: 'calc(100% - 32px)',
              background: 'rgba(18, 22, 30, 0.94)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(212, 168, 106, 0.4)',
              borderRadius: 16,
              padding: '18px 22px',
              color: '#FFFFFF',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
              animation: 'clientFadeIn 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(212, 168, 106, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A86A' }}>
                  <Info size={15} />
                </div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#F9FAFB' }}>
                  {sanitizeMuseumText(selectedHotspot.title)}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHotspot(null)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: '#D1D5DB', lineHeight: 1.6 }}>
              {selectedHotspot.description || t('tour.hotspotDefaultDesc', 'Điểm chú thích thông tin tư liệu khảo cứu của hiện vật trong gian trưng bày.')}
            </p>
          </div>
        )}
      </div>

      {/* LỚP PHỦ MỜ NỀN CHO MOBILE KHI MỞ DANH SÁCH CỔ VẬT (CHẠM VÀO ĐỂ ĐÓNG NGAY) */}
      {isArtifactsSidebarOpen && isMobileScreen && (
        <div
          className="client-tour-sidebar-backdrop"
          onClick={() => setIsArtifactsSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 118,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            animation: 'clientFadeIn 0.2s ease-out'
          }}
        />
      )}

      {/* SECTION BÊN PHẢI: KHUNG TRƯNG BÀY HIỆN VẬT CỦA GIAN PHÒNG (GÓC PHẢI TRÊN DESKTOP, BOTTOM SHEET TRÊN MOBILE) */}
      {isArtifactsSidebarOpen && (
        <aside
          className="client-tour-artifacts-sidebar"
          style={{
            width: 380,
            maxWidth: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, rgba(17, 22, 34, 0.97) 0%, rgba(10, 14, 22, 0.99) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(212, 168, 106, 0.3)',
            boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 120,
            position: 'relative',
            flexShrink: 0
          }}
        >
          {/* Thanh vuốt kéo cho thiết bị di động */}
          <div
            className="client-tour-mobile-drag-handle"
            onClick={() => setIsArtifactsSidebarOpen(false)}
            title="Chạm hoặc vuốt để đóng"
          >
            <div className="client-tour-drag-indicator" />
          </div>

          {/* Header Khung Trưng Bày */}
          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(212, 168, 106, 0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'rgba(212, 168, 106, 0.18)',
                  border: '1px solid rgba(212, 168, 106, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D4A86A',
                  flexShrink: 0
                }}
              >
                <Box size={17} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>Cổ Vật Trưng Bày</span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: 10,
                      background: 'rgba(212, 168, 106, 0.25)',
                      color: '#FDE68A',
                      border: '1px solid rgba(212, 168, 106, 0.45)'
                    }}
                  >
                    {matchingArtifacts.length}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentRoom.code ? `[${currentRoom.code}] ` : ''}{currentRoom.name}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsArtifactsSidebarOpen(false)}
              title="Thu gọn khung cổ vật"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 6,
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94A3B8',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFF';
                e.currentTarget.style.borderColor = 'rgba(212,168,106,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94A3B8';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Dòng hướng dẫn tương tác */}
          <div
            style={{
              padding: '8px 18px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '11px',
              color: '#D4A86A',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Sparkles size={12} style={{ flexShrink: 0 }} />
            <span>Nhấp vào cổ vật để mở mô hình 3D xoay 360° tương tác</span>
          </div>

          {/* Danh sách thẻ hiện vật di sản thuộc gian phòng */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            {matchingArtifacts.length === 0 ? (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  color: '#94A3B8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'rgba(212, 168, 106, 0.12)',
                    border: '1px solid rgba(212, 168, 106, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D4A86A'
                  }}
                >
                  <Box size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#F3F4F6' }}>
                    Chưa có cổ vật quét 3D riêng
                  </div>
                  <div style={{ fontSize: '11.5px', lineHeight: 1.5, color: '#94A3B8', marginTop: 4, maxWidth: 280 }}>
                    Hiện vật và kiến trúc trong phòng này được tương tác trực tiếp qua các điểm chú thích trên toàn cảnh 360°.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsArtifactsSidebarOpen(false)}
                  style={{
                    marginTop: 4,
                    padding: '8px 18px',
                    borderRadius: 20,
                    background: 'linear-gradient(135deg, rgba(212, 168, 106, 0.22) 0%, rgba(180, 83, 9, 0.25) 100%)',
                    border: '1px solid rgba(212, 168, 106, 0.5)',
                    color: '#FDE68A',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  <Eye size={13} style={{ color: '#D4A86A' }} />
                  <span>Khám phá không gian 360°</span>
                </button>
              </div>
            ) : (
              matchingArtifacts.map((art) => {
                const thumb = getMediaUrl(art.thumbnailUrl || (art.images && art.images[0]));
                const has3D = Boolean(art.model3dUrl);

                return (
                  <div
                    key={art.id}
                    className="client-tour-artifact-card"
                    onClick={() => setActive3DArtifact(art)}
                    style={{
                      background: 'rgba(24, 30, 44, 0.75)',
                      border: '1px solid rgba(212, 168, 106, 0.25)',
                      borderRadius: 12,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#D4A86A';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(212, 168, 106, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(212, 168, 106, 0.25)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
                    }}
                  >
                    {/* Ảnh hiện vật */}
                    <div
                      style={{
                        position: 'relative',
                        height: 135,
                        background: 'radial-gradient(circle at center, #1c2436 0%, #0c1018 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 10
                      }}
                    >
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={art.name}
                          style={{
                            maxHeight: '100%',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.7))'
                          }}
                        />
                      ) : (
                        <Box size={28} style={{ opacity: 0.4, color: '#94A3B8' }} />
                      )}

                      {has3D && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            background: 'rgba(10, 14, 22, 0.88)',
                            border: '1px solid rgba(212, 168, 106, 0.55)',
                            color: '#FDE68A',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 10,
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Sparkles size={10} style={{ color: '#D4A86A' }} />
                          <span>3D Scan</span>
                        </div>
                      )}
                    </div>

                    {/* Nội dung thông tin hiện vật */}
                    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <span style={{ fontSize: 10.5, color: '#D4A86A', fontWeight: 700, textTransform: 'uppercase' }}>
                          {art.period || 'Di sản lịch sử'}
                        </span>
                        {art.code && (
                          <span style={{ fontSize: 10, color: '#94A3B8', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: 3 }}>
                            {art.code}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', lineHeight: 1.35 }}>
                        {art.name}
                      </div>

                      {(art as any).description && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: '#94A3B8',
                            lineHeight: 1.45,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            margin: '2px 0 6px 0'
                          }}
                        >
                          {(art as any).description}
                        </div>
                      )}

                      <div
                        style={{
                          marginTop: 4,
                          paddingTop: 8,
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{ fontSize: '11px', color: '#D4A86A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {has3D ? 'Chiêm ngưỡng 3D 360°' : 'Xem thông tin khảo cứu'}
                          <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}

      {/* 4. SIDE DRAWER THÔNG TIN TOÀN BỘ GIAN PHÒNG */}
      {isInfoDrawerOpen && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            maxWidth: 380,
            background: 'rgba(15, 18, 24, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(212, 168, 106, 0.3)',
            zIndex: 300,
            boxShadow: '-10px 0 35px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            color: '#FFFFFF',
            animation: 'slideInRight 0.25s ease-out'
          }}
        >
          {/* Header Drawer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={17} style={{ color: '#D4A86A' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#F3F4F6' }}>{t('tour.roomDocs', 'Tư Liệu Gian Phòng')}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsInfoDrawerOpen(false)}
              style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 4 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Drawer */}
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#D4A86A', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {currentRoom.code || 'Mã gian phòng'}
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '4px 0 6px 0', color: '#FFFFFF' }}>
                {title}
              </h3>
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                {period}
              </p>
            </div>

            {/* Khung bài giới thiệu */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 12, padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#D4A86A', textTransform: 'uppercase' }}>
                  {t('tour.introContent', 'Nội dung giới thiệu')} ({currentLang.toUpperCase()})
                </span>
                <button
                  type="button"
                  onClick={toggleVoicePlayback}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 20,
                    border: '1px solid #B45309',
                    background: isPlayingVoice ? '#B45309' : 'transparent',
                    color: '#FFF',
                    fontSize: '11.5px',
                    cursor: 'pointer'
                  }}
                >
                  {isPlayingVoice ? <Pause size={12} /> : <Play size={12} />}
                  <span>{isPlayingVoice ? t('tour.pauseAudio', 'Tạm dừng') : t('tour.playAudio', 'Nghe giới thiệu')}</span>
                </button>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#D1D5DB', margin: 0, whiteSpace: 'pre-line' }}>
                {getNarrationData().scriptText || description || t('tour.noIntro', 'Chưa có thông tin giới thiệu chi tiết cho gian phòng này.')}
              </p>
            </div>

            {/* Thống kê điểm Hotspot có trong phòng */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ fontSize: '12.5px', color: '#9CA3AF' }}>{t('tour.interactiveHotspots', 'Điểm chú thích tương tác')}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#D4A86A' }}>
                {currentRoom.hotspots?.length || 0} {t('tour.hotspotsUnit', 'điểm')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHIÊM NGƯỠNG MÔ HÌNH 3D TRỰC TIẾP TRONG GIAN PHÒNG TOUR (KHÔNG CẦN RỜI PHÒNG 360) */}
      {active3DArtifact && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            animation: 'clientFadeIn 0.2s ease-out'
          }}
          onClick={() => setActive3DArtifact(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 820,
              background: 'linear-gradient(180deg, #121722 0%, #0a0e16 100%)',
              border: '1px solid rgba(212, 168, 106, 0.45)',
              borderRadius: 16,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(212, 168, 106, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(212, 168, 106, 0.08)'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#D4A86A', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {active3DArtifact.period || 'Di sản văn hóa'} {active3DArtifact.code ? `• ${active3DArtifact.code}` : ''}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFF', marginTop: 2 }}>
                  {active3DArtifact.name}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActive3DArtifact(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 3D Viewer Body */}
            <div style={{ minHeight: isMobileScreen ? 300 : 460, position: 'relative' }}>
              {active3DArtifact.model3dUrl ? (
                <Turntable360Viewer
                  modelUrl={active3DArtifact.model3dUrl}
                  imageUrl={getMediaUrl(active3DArtifact.thumbnailUrl || (active3DArtifact.images && active3DArtifact.images[0])) || undefined}
                  artifactName={active3DArtifact.name}
                  artifactPeriod={active3DArtifact.period || active3DArtifact.category}
                  audioNarrationUrl={active3DArtifact.audioNarrationUrl}
                  translations={active3DArtifact.translations}
                  height={isMobileScreen ? 320 : 480}
                />
              ) : (
                <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
                  <img
                    src={getMediaUrl(active3DArtifact.thumbnailUrl || (active3DArtifact.images && active3DArtifact.images[0]))}
                    alt=""
                    style={{ maxHeight: 320, maxWidth: '100%', objectFit: 'contain', margin: '0 auto 16px auto', display: 'block' }}
                  />
                  <div>Hiện vật này chưa có mô hình 3D xoay 360°.</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0, 0, 0, 0.4)',
                fontSize: '12px',
                color: '#94A3B8'
              }}
            >
              <div>
                {(active3DArtifact as any).dimensions ? `Kích thước: ${(active3DArtifact as any).dimensions} • ` : ''}
                Lưu trữ tại: {active3DArtifact.origin || 'Bảo tàng Lịch sử TP.HCM'}
              </div>
              <button
                type="button"
                onClick={() => setActive3DArtifact(null)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  background: 'rgba(212, 168, 106, 0.2)',
                  border: '1px solid rgba(212, 168, 106, 0.4)',
                  color: '#FDE68A',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation & Responsive Styles */}
      <style>{`
        @keyframes audioWave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideUpMobile {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes clientFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .client-tour-mobile-drag-handle {
          display: none;
        }
        .artifacts-btn-mobile-badge {
          display: none;
        }

        /* Responsive Tablet & Mobile: Chuyển Sidebar thành Bottom Sheet cao cấp */
        @media (max-width: 1024px) {
          .client-tour-root-layout {
            flex-direction: column !important;
          }
          .client-tour-main-viewport {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
          .client-tour-artifacts-sidebar {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            top: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            max-height: 72vh !important;
            height: auto !important;
            border-radius: 20px 20px 0 0 !important;
            border-top: 1px solid rgba(212, 168, 106, 0.45) !important;
            border-left: none !important;
            box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.85) !important;
            z-index: 120 !important;
            animation: slideUpMobile 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
          .client-tour-mobile-drag-handle {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 10px 0 4px 0 !important;
            cursor: pointer !important;
          }
          .client-tour-drag-indicator {
            width: 44px !important;
            height: 4px !important;
            border-radius: 2px !important;
            background: rgba(212, 168, 106, 0.45) !important;
          }
          .artifacts-btn-label {
            display: none !important;
          }
          .artifacts-btn-mobile-badge {
            display: inline-flex !important;
          }
          .client-tour-artifacts-reopen-btn {
            top: auto !important;
            bottom: 24px !important;
            right: 14px !important;
            padding: 8px 14px !important;
            font-size: 11.5px !important;
          }
        }
        @media (max-width: 480px) {
          .client-tour-artifacts-sidebar {
            max-height: 75vh !important;
          }
        }
      `}</style>
    </div>
  );
};
