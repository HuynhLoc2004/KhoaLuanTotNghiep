import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCw,
  Maximize2,
  Minimize2,
  Compass,
  ArrowRight,
  Info,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { Hotspot, MuseumRoom } from '../types';

interface InteractiveVideoTourViewerProps {
  videoUrl: string;
  title?: string;
  hotspots?: Hotspot[];
  allRooms?: MuseumRoom[];
  onHotspotClick?: (hotspot: Hotspot) => void;
  onNavigateRoom?: (room: MuseumRoom) => void;
}

export const InteractiveVideoTourViewer: React.FC<InteractiveVideoTourViewerProps> = ({
  videoUrl,
  title = 'Gian phòng bảo tàng',
  hotspots = [],
  allRooms = [],
  onHotspotClick,
  onNavigateRoom
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [showHint, setShowHint] = useState(true);

  // Auto-hide hint after 4s
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  // Update time and duration
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 10);
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // INTERACTIVE DRAG SCRUBBING (Kéo chuột / vuốt tay để tua xoay góc nhìn)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !videoRef.current || duration <= 0) return;
    const deltaX = e.clientX - dragStartX;
    setDragStartX(e.clientX);

    // Độ nhạy tua góc: 1px chuột = 0.03s video
    const sensitivity = 0.035;
    let newTime = videoRef.current.currentTime - deltaX * sensitivity;

    // Vòng lặp thời gian tuần hoàn 360°
    if (newTime < 0) newTime += duration;
    if (newTime > duration) newTime -= duration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      if (isPlaying && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStartX(e.touches[0].clientX);
      if (videoRef.current && isPlaying) {
        videoRef.current.pause();
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !videoRef.current || duration <= 0 || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStartX;
    setDragStartX(e.touches[0].clientX);

    const sensitivity = 0.035;
    let newTime = videoRef.current.currentTime - deltaX * sensitivity;
    if (newTime < 0) newTime += duration;
    if (newTime > duration) newTime -= duration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      if (isPlaying && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Tìm các Hotspot điều hướng (mũi tên sang phòng kế tiếp)
  const navHotspots = hotspots.filter((h) => h.type === 'navigation' && h.targetRoomId);
  const infoHotspots = hotspots.filter((h) => h.type === 'info');

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#0a0d14',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {/* 1. THẺ VIDEO NỀN PHÁT QUANH PHÒNG */}
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        muted={isMuted}
        loop
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none'
        }}
      />

      {/* 2. CHỈ DẪN TƯƠNG TÁC XOAY PHÒNG (FLOATING HINT) */}
      {showHint && (
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 20, 28, 0.88)',
            backdropFilter: 'blur(10px)',
            color: '#f3f4f6',
            padding: '8px 20px',
            borderRadius: 30,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid rgba(212, 168, 106, 0.4)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
            zIndex: 30,
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <Compass size={16} style={{ color: '#d4a86a' }} />
          <span style={{ fontWeight: 600, color: '#d4a86a' }}>Interactive Video Tour:</span>
          <span>Kéo chuột hoặc vuốt tay sang trái/phải để xoay nhìn quanh phòng</span>
        </div>
      )}

      {/* 3. MŨI TÊN ĐIỀU HƯỚNG QUA PHÒNG KẾ TIẾP (NAVIGATION HOTSPOTS) */}
      {navHotspots.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 12,
            zIndex: 40,
            pointerEvents: 'auto'
          }}
        >
          {navHotspots.map((h) => {
            const targetRoom = allRooms.find((r) => r.id === h.targetRoomId || r.code === h.targetRoomId);
            const targetName = targetRoom ? targetRoom.name : h.title || 'Gian phòng tiếp theo';
            return (
              <button
                key={h.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onHotspotClick) onHotspotClick(h);
                  if (targetRoom && onNavigateRoom) onNavigateRoom(targetRoom);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 22px',
                  borderRadius: 30,
                  background: 'linear-gradient(135deg, rgba(212, 168, 106, 0.95), rgba(184, 134, 11, 0.95))',
                  color: '#111827',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 24px rgba(212, 168, 106, 0.5), 0 0 15px rgba(212, 168, 106, 0.4)',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(212, 168, 106, 0.7)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 168, 106, 0.5)';
                }}
              >
                <span>🚪 Bước sang: {targetName}</span>
                <ArrowRight size={16} />
              </button>
            );
          })}
        </div>
      )}

      {/* 4. ĐIỂM GHIM HIỆN VẬT TIÊU BIỂU (INFO HOTSPOTS) */}
      {infoHotspots.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 75,
            right: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            zIndex: 40,
            pointerEvents: 'auto'
          }}
        >
          {infoHotspots.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onHotspotClick) onHotspotClick(h);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 14px',
                borderRadius: 20,
                background: 'rgba(15, 20, 28, 0.88)',
                backdropFilter: 'blur(10px)',
                color: '#f3f4f6',
                border: '1px solid rgba(212, 168, 106, 0.35)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                transition: 'all 0.15s ease'
              }}
            >
              <Info size={14} style={{ color: '#d4a86a' }} />
              <span>{h.title || 'Hiện vật tiêu biểu'}</span>
            </button>
          ))}
        </div>
      )}

      {/* 5. THANH ĐIỀU KHIỂN DƯỚI ĐÁY (CONTROLS BAR) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          background: 'rgba(15, 20, 28, 0.92)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 14,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          zIndex: 35,
          color: '#e5e7eb'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Nút Play / Pause */}
          <button
            type="button"
            onClick={togglePlay}
            style={{
              background: 'none',
              border: 'none',
              color: '#d4a86a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 4
            }}
            title={isPlaying ? 'Tạm dừng tự động quay' : 'Tiếp tục tự động quay'}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>

          {/* Nút Bật / Tắt âm thanh */}
          <button
            type="button"
            onClick={toggleMute}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 4
            }}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <span style={{ fontSize: '12px', color: '#9ca3af', minWidth: 70 }}>
            {Math.floor(currentTime)}s / {Math.floor(duration)}s
          </span>
        </div>

        {/* Thanh trượt tua thời gian */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', margin: '0 8px' }}>
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (videoRef.current) {
                videoRef.current.currentTime = val;
                setCurrentTime(val);
              }
            }}
            style={{
              width: '100%',
              accentColor: '#d4a86a',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Nút Toàn màn hình */}
          <button
            type="button"
            onClick={toggleFullscreen}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 4
            }}
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
