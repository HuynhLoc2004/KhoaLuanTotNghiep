import React, { useState, useEffect, useRef } from 'react';
import { MuseumRoom, Hotspot, LanguageItem } from '../../types';
import { Pannellum360Viewer, PannellumHotSpot } from '../../viewer360/Pannellum360Viewer';
import { API_ROOT } from '../../services/api';
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
  Info,
  X,
  Check,
  Headphones,
  BookOpen
} from 'lucide-react';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import '../../styles/client.css';

interface ClientTourViewProps {
  currentRoom: MuseumRoom;
  allRooms: MuseumRoom[];
  onBackToHome: () => void;
  onNavigateRoom: (room: MuseumRoom) => void;
}

export const ClientTourView: React.FC<ClientTourViewProps> = ({
  currentRoom,
  allRooms,
  onBackToHome,
  onNavigateRoom
}) => {
  const { currentLang, activeLanguages, changeLanguage, t, localize } = useClientTranslation();

  // State cho dropdown chọn phòng & chọn ngôn ngữ
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // State cho Voice AI thuyết minh
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0); // 0 - 100
  const [hasVoiceAudio, setHasVoiceAudio] = useState(false);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const roomDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roomDropdownRef.current && !roomDropdownRef.current.contains(e.target as Node)) {
        setIsRoomDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
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
      audioUrl = langData.audioUrl || (currentRoom as any).audioUrl || (currentRoom as any).audio_url || '';
      scriptText = langData.narrationScript || langData.description || currentRoom.description || '';
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

  // Xử lý bật / tắt thuyết minh Voice AI (CHỈ PHÁT FILE ÂM THANH THẬT ĐƯỢC ADMIN TẠO)
  const toggleVoicePlayback = () => {
    if (isPlayingVoice) {
      stopAudio();
      return;
    }

    const { audioUrl } = getNarrationData();

    if (!audioUrl) {
      // TUYỆT ĐỐI KHÔNG DÙNG GIỌNG BROWSER NÓI BẬY BẠ! Chỉ phát file giọng thật do Ban quản trị tạo
      setIsPlayingVoice(false);
      const langUpper = (currentLang || 'vi').toUpperCase();
      setVoiceToast(`Gian phòng chưa có bản thu âm giới thiệu cho ngôn ngữ [${langUpper}]. Ban quản lý đang cập nhật.`);
      setTimeout(() => setVoiceToast(null), 3500);
      return;
    }

    // Phát file Voice AI pre-rendered trên máy chủ do Admin tạo
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

  const rawTitle = localize(currentRoom, 'name', currentRoom.name);
  const title = sanitizeMuseumText(rawTitle);
  const rawPeriod = localize(currentRoom, 'period', currentRoom.period || currentRoom.category || 'Gian phòng di sản');
  const period = sanitizeMuseumText(rawPeriod);
  const description = localize(currentRoom, 'description', currentRoom.description || '');

  // Định dạng hotspots chuẩn cho trình chiếu Pannellum 360° đồng bộ với Admin Studio
  const pannellumHotspots: PannellumHotSpot[] = (currentRoom.hotspots || []).map((h) => ({
    pitch: h.pitch,
    yaw: h.yaw,
    type: (h.type === 'navigation' ? 'scene' : 'info') as 'scene' | 'info',
    text: sanitizeMuseumText(h.title),
    roomId: h.targetRoomId,
    onClick: () => handleHotspotClick(h)
  }));

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0d14', fontFamily: 'inherit' }}>

      {/* 1. THANH ĐIỀU HƯỚNG NỔI CAO CẤP PHÍA TRÊN (KHÔNG CHỒNG ĐÈ, GỌN GÀNG, CHUẨN UI) */}
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
              gap: 8,
              padding: '8px 16px',
              borderRadius: 30,
              background: 'rgba(15, 18, 24, 0.88)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              color: '#F3F4F6',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: '13px',
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
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <ArrowLeft size={15} style={{ color: '#D4A86A' }} />
            <span>{t('tour.backHome', 'Trang chủ')}</span>
          </button>
        </div>

        {/* THÔNG TIN GIAN PHÒNG HIỆN TẠI (CHỈ DUY NHẤT 1 VỊ TRÍ TRUNG TÂM, KHÔNG LẶP LẠI) */}
        <div
          className="client-tour-title-pill"
          style={{
            pointerEvents: 'auto',
            background: 'rgba(15, 18, 24, 0.88)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(212, 168, 106, 0.25)',
            padding: '7px 20px',
            borderRadius: 30,
            textAlign: 'center',
            color: '#FFFFFF',
            maxWidth: '42vw',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <div
            style={{
              fontSize: '13.5px',
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
              fontSize: '11px',
              color: '#D4A86A',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              opacity: 0.9
            }}
          >
            {currentRoom.code ? `${currentRoom.code} • ` : ''}{period}
          </div>
        </div>

        {/* CỤM NÚT ĐIỀU HƯỚNG BÊN PHẢI: THUYẾT MINH AI + BỘ CHỌN PHÒNG TÙY BIẾN + INFO */}
        <div className="client-tour-actions" style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* 1. NÚT NGHE GIỚI THIỆU VOICE AI & CHUYỂN ĐỔI NGÔN NGỮ ĐỒNG BỘ */}
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(15, 18, 24, 0.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(212, 168, 106, 0.3)', borderRadius: 30, padding: '3px 4px', boxShadow: '0 4px 16px rgba(0,0,0,0.35)' }}>
            {/* Nút Play/Pause Audio Giới thiệu */}
            <button
              type="button"
              onClick={toggleVoicePlayback}
              title={isPlayingVoice ? 'Tạm dừng nghe giới thiệu' : 'Bật giọng đọc giới thiệu gian phòng'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '5px 12px',
                borderRadius: 24,
                border: 'none',
                background: isPlayingVoice ? 'rgba(212, 168, 106, 0.22)' : 'transparent',
                color: isPlayingVoice ? '#F59E0B' : '#E5E7EB',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isPlayingVoice ? (
                <>
                  <Pause size={13} style={{ fill: '#F59E0B' }} />
                  {/* Hiệu ứng sóng âm thanh tinh tế */}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, height: 12 }}>
                    <span style={{ width: 2, height: 8, background: '#F59E0B', borderRadius: 1, animation: 'audioWave 0.8s infinite ease-in-out' }} />
                    <span style={{ width: 2, height: 12, background: '#F59E0B', borderRadius: 1, animation: 'audioWave 0.8s infinite ease-in-out 0.2s' }} />
                    <span style={{ width: 2, height: 6, background: '#F59E0B', borderRadius: 1, animation: 'audioWave 0.8s infinite ease-in-out 0.4s' }} />
                  </span>
                  <span>{t('tour.voicePlaying', 'Đang giới thiệu...')}</span>
                </>
              ) : (
                <>
                  <Volume2 size={14} style={{ color: '#D4A86A' }} />
                  <span>{t('tour.voiceAi', 'Nghe giới thiệu')}</span>
                </>
              )}
            </button>

            {/* Vạch ngăn mảnh */}
            <div style={{ width: 1, height: 16, background: 'rgba(255, 255, 255, 0.15)', margin: '0 2px' }} />

            {/* Menu thả chuyển ngôn ngữ thuyết minh ngay tại nút */}
            <div ref={langDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                title="Chọn ngôn ngữ giọng đọc"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 8px',
                  borderRadius: 20,
                  border: 'none',
                  background: 'transparent',
                  color: '#D1D5DB',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                <span>{currentLang}</span>
                <ChevronDown size={11} style={{ opacity: 0.7 }} />
              </button>

              {/* Danh sách ngôn ngữ do Admin cấp */}
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
                    Ngôn ngữ giọng đọc
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
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{lang.flagIcon || '🌐'}</span>
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

          {/* 2. BỘ CHỌN PHÒNG TÙY BIẾN CAO CẤP (THAY THẾ SELECT NGUYÊN THỦY LỖI FONT, ĐỨT NÉT) */}
          <div ref={roomDropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className="client-tour-room-btn"
              onClick={() => setIsRoomDropdownOpen((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 30,
                background: 'rgba(15, 18, 24, 0.88)',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                color: '#F3F4F6',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '12.5px',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
                transition: 'all 0.2s ease',
                maxWidth: 240
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 168, 106, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              <Compass size={14} style={{ color: '#D4A86A', flexShrink: 0 }} />
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '12px'
                }}
              >
                {currentRoom.code ? `[${currentRoom.code}] ` : ''}{sanitizeMuseumText(currentRoom.name)}
              </span>
              <ChevronDown
                size={13}
                style={{
                  opacity: 0.7,
                  flexShrink: 0,
                  transform: isRoomDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>

            {/* Menu thả danh sách tất cả các gian phòng 360 */}
            {isRoomDropdownOpen && (
              <div
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
                  zIndex: 200,
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
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
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

          {/* 3. NÚT XEM TƯ LIỆU / THÔNG TIN GIAN PHÒNG */}
          <button
            type="button"
            onClick={() => setIsInfoDrawerOpen(true)}
            title="Xem chi tiết lịch sử gian phòng"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(15, 18, 24, 0.88)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              color: '#F3F4F6',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 168, 106, 0.5)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Info size={16} style={{ color: '#D4A86A' }} />
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

      {/* 2. TRÌNH CHIẾU PANNELLUM 360° CHUẨN XÁC, ĐỒNG BỘ 100% VỚI XEM THỬ & STUDIO BÊN ADMIN */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
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
      </div>

      {/* 3. POPUP THÔNG TIN HOTSPOT KHI KHÁCH CLICK VÀO ĐIỂM CHÚ THÍCH */}
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
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#F3F4F6' }}>Tư Liệu Gian Phòng</span>
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
                  Nội dung giới thiệu ({currentLang.toUpperCase()})
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
                  <span>{isPlayingVoice ? 'Tạm dừng' : 'Nghe giới thiệu'}</span>
                </button>
              </div>
              <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#D1D5DB', margin: 0, whiteSpace: 'pre-line' }}>
                {getNarrationData().scriptText || description || 'Chưa có thông tin giới thiệu chi tiết cho gian phòng này.'}
              </p>
            </div>

            {/* Thống kê điểm Hotspot có trong phòng */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 10, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <span style={{ fontSize: '12.5px', color: '#9CA3AF' }}>Điểm chú thích tương tác</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#D4A86A' }}>
                {currentRoom.hotspots?.length || 0} điểm
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes audioWave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
