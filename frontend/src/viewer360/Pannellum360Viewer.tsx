import React, { useEffect, useRef, useState } from 'react';
import { API_BASE } from '../services/api';

declare global {
  interface Window {
    pannellum: any;
  }
}

export interface PannellumHotSpot {
  pitch: number;
  yaw: number;
  type?: 'scene' | 'info';
  text: string;
  sceneId?: string;
  roomId?: string;
  icon?: string;
  onClick?: () => void;
}

interface Pannellum360ViewerProps {
  panoramaUrl: string;
  title?: string;
  autoStartLittlePlanet?: boolean;
  hotspots?: PannellumHotSpot[];
  onHotspotClick?: (hotspot: PannellumHotSpot) => void;
  onSceneChange?: (sceneId: string) => void;
  isPinMode?: boolean;
  onTogglePinMode?: () => void;
  onCanvasPinClick?: (coords: { pitch: number; yaw: number }) => void;
  onCaptureInitialView?: (view: { pitch: number; yaw: number; fov: number }) => void;
  initialPitch?: number;
  initialYaw?: number;
  initialHfov?: number;
  focusCoords?: { pitch: number; yaw: number; timestamp?: number } | null;
}

export const Pannellum360Viewer: React.FC<Pannellum360ViewerProps> = ({
  panoramaUrl,
  title = 'Toàn cảnh 360° Bảo tàng Lịch sử TP.HCM',
  autoStartLittlePlanet = true,
  hotspots = [],
  onHotspotClick,
  isPinMode = false,
  onTogglePinMode,
  onCanvasPinClick,
  onCaptureInitialView,
  initialPitch = 0,
  initialYaw = 0,
  initialHfov = 100,
  focusCoords,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const containerId = useRef(`pannellum-container-${Math.random().toString(36).substring(2, 9)}`);
  const hasIntroducedRef = useRef<string | null>(null);
  const introTimerRef = useRef<any>(null);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isLittlePlanet, setIsLittlePlanet] = useState(false);

  // Focus xoay camera đến tọa độ chỉ định (ví dụ click từ sidebar)
  useEffect(() => {
    if (focusCoords && viewerRef.current) {
      try {
        viewerRef.current.lookAt(focusCoords.pitch, focusCoords.yaw, 100, 1000);
      } catch (err) {
        console.warn('[Pannellum lookAt error]:', err);
      }
    }
  }, [focusCoords]);

  // Serialize hotspots để không bị re-render do tham chiếu mảng mới
  const hotspotsHash = JSON.stringify(hotspots || []);

  useEffect(() => {
    if (!containerRef.current || !window.pannellum) return;

    // Destroy existing viewer if any
    if (viewerRef.current) {
      try {
        viewerRef.current.destroy();
      } catch (_) {}
      viewerRef.current = null;
    }

    // Format hotspots for Pannellum
    const formattedHotSpots = (hotspots || []).map((hs) => ({
      pitch: hs.pitch,
      yaw: hs.yaw,
      type: hs.type || 'info',
      text: hs.text,
      clickHandlerFunc: () => {
        if (onHotspotClick) onHotspotClick(hs);
        if (hs.onClick) hs.onClick();
      },
      createTooltipFunc: (hotSpotDiv: HTMLElement) => {
        hotSpotDiv.classList.add('custom-hotspot-badge');
        hotSpotDiv.style.pointerEvents = 'auto';
        hotSpotDiv.style.cursor = 'pointer';

        if (hs.type === 'scene' || (hs as any).type === 'navigation' || hs.roomId || hs.sceneId) {
          hotSpotDiv.classList.add('walking-arrow-hotspot');
          hotSpotDiv.innerHTML = `
            <div class="walking-arrow-label">
              <span>🚪 ${hs.text}</span>
            </div>
            <div class="walking-arrow-disc">
              <svg class="walking-arrow-svg" viewBox="0 0 24 24">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </div>
          `;
        } else {
          hotSpotDiv.innerHTML = `
            <div class="hotspot-pulse">
              <i class="fa-solid ${hs.icon || 'fa-location-dot'}"></i>
            </div>
            <div class="hotspot-label">${hs.text}</div>
          `;
        }

        const onTrigger = (e: Event) => {
          e.stopPropagation();
          e.preventDefault();
          if (onHotspotClick) onHotspotClick(hs);
          if (hs.onClick) hs.onClick();
        };

        hotSpotDiv.onclick = onTrigger;
      }
    }));

    // Tự động phân giải URL: nếu là Cloudflare R2 subdomain chưa có CORS cho WebGL, bọc qua Backend Proxy
    let effectivePanoramaUrl = panoramaUrl;
    if (
      effectivePanoramaUrl &&
      effectivePanoramaUrl.includes('r2.dev') &&
      !effectivePanoramaUrl.includes('/api/stitch/proxy-image')
    ) {
      effectivePanoramaUrl = `${API_BASE}/stitch/proxy-image?url=${encodeURIComponent(effectivePanoramaUrl)}`;
    }

    try {
      const viewer = window.pannellum.viewer(containerId.current, {
        type: 'equirectangular',
        panorama: effectivePanoramaUrl,
        autoLoad: true,
        showControls: false,
        compass: false,
        hfov: initialHfov || 100, // Góc nhìn chuẩn rộng thoáng đãng 100°, triệt tiêu hoàn toàn hiệu ứng ống hút (tunnel) và làm phẳng không gian
        minHfov: 45,
        maxHfov: 125, // Cho phép zoom rộng thoải mái để bao quát toàn phòng
        pitch: initialPitch || 0,
        yaw: initialYaw || 0,
        minPitch: -58, // Cho phép nhìn thấy toàn bộ sàn nhà và chân đồ vật, nhưng dừng lại tự nhiên trước khi nhìn thẳng vào chân người chụp
        maxPitch: 80,  // Góc ngước cao tự nhiên chiêm ngưỡng trần nhà
        friction: 0.15,
        hotSpots: formattedHotSpots,
      });

      viewerRef.current = viewer;

      viewer.on('load', () => {
        if (autoStartLittlePlanet && hasIntroducedRef.current !== panoramaUrl) {
          hasIntroducedRef.current = panoramaUrl;
          runLittlePlanetIntro();
        }
      });
    } catch (err) {
      console.error('[Pannellum Init Error]:', err);
    }

    return () => {
      clearInterval(introTimerRef.current);
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (_) {}
        viewerRef.current = null;
      }
    };
  }, [panoramaUrl, hotspotsHash, initialPitch, initialYaw, initialHfov]);

  // Hoạt cảnh mở đầu Little Planet bung vào phòng mượt mà (chỉ chạy 1 lần duy nhất)
  const runLittlePlanetIntro = () => {
    if (!viewerRef.current) return;
    try {
      setIsLittlePlanet(true);
      viewerRef.current.setPitch(-90);
      viewerRef.current.setHfov(140);

      setTimeout(() => {
        let fov = 140;
        let pitch = -90;
        const targetFov = initialHfov || 100;
        const targetPitch = initialPitch || 0;

        clearInterval(introTimerRef.current);
        introTimerRef.current = setInterval(() => {
          fov -= 1.8;
          pitch += 2.0;

          if (fov <= targetFov) fov = targetFov;
          if (pitch >= targetPitch) pitch = targetPitch;

          if (viewerRef.current) {
            viewerRef.current.setHfov(fov);
            viewerRef.current.setPitch(pitch);
          }

          if (fov <= targetFov && pitch >= targetPitch) {
            clearInterval(introTimerRef.current);
            setIsLittlePlanet(false);
          }
        }, 25);
      }, 500);
    } catch (e) {
      console.warn('[Little Planet Intro]:', e);
    }
  };

  const handleTogglePlanet = () => {
    if (!viewerRef.current) return;
    if (isLittlePlanet) {
      runLittlePlanetIntro();
    } else {
      viewerRef.current.setPitch(-90);
      viewerRef.current.setHfov(140);
      setIsLittlePlanet(true);
    }
  };

  const handleToggleAutoRotate = () => {
    if (!viewerRef.current) return;
    if (isAutoRotating) {
      viewerRef.current.stopAutoRotate();
      setIsAutoRotating(false);
    } else {
      viewerRef.current.startAutoRotate(-2.5); // Tốc độ xoay êm ái
      setIsAutoRotating(true);
    }
  };

  const handleZoomIn = () => {
    if (!viewerRef.current) return;
    const current = viewerRef.current.getHfov();
    viewerRef.current.setHfov(Math.max(40, current - 15));
  };

  const handleZoomOut = () => {
    if (!viewerRef.current) return;
    const current = viewerRef.current.getHfov();
    viewerRef.current.setHfov(Math.min(125, current + 15));
  };

  const handleResetHome = () => {
    if (!viewerRef.current) return;
    viewerRef.current.setPitch(initialPitch || 0);
    viewerRef.current.setYaw(initialYaw || 0);
    viewerRef.current.setHfov(initialHfov || 100);
    setIsLittlePlanet(false);
  };

  const handleToggleFullscreen = () => {
    if (!viewerRef.current) return;
    viewerRef.current.toggleFullscreen();
  };

  // Studio: Lưu góc nhìn mặc định của phòng
  const handleCaptureView = () => {
    if (!viewerRef.current || !onCaptureInitialView) return;
    try {
      const pitch = Math.round(viewerRef.current.getPitch() * 10) / 10;
      const yaw = Math.round(viewerRef.current.getYaw() * 10) / 10;
      const fov = Math.round(viewerRef.current.getHfov());
      onCaptureInitialView({ pitch, yaw, fov });
      alert(`Đã lưu góc nhìn mặc định khi vào phòng thành công!\nPitch: ${pitch}°, Yaw: ${yaw}°, FOV: ${fov}°`);
    } catch (err) {
      console.error('[Pannellum Capture View Error]:', err);
    }
  };

  // Studio: Bắt sự kiện click lên ảnh để ghim tọa độ Hotspot
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPinMode || !viewerRef.current || !onCanvasPinClick) return;

    // Phân biệt kéo xoay camera và click ghim: nếu rê chuột > 6px thì bỏ qua không ghim
    if (pointerDownPos.current) {
      const dist = Math.hypot(
        e.clientX - pointerDownPos.current.x,
        e.clientY - pointerDownPos.current.y
      );
      if (dist > 6) return;
    }

    const target = e.target as HTMLElement;
    if (
      target.closest('.glass-toolbar') ||
      target.closest('.custom-hotspot-badge') ||
      target.closest('.studio-pin-banner') ||
      target.closest('.top-title-banner')
    ) {
      return;
    }
    try {
      const coords = viewerRef.current.mouseEventToCoords(e.nativeEvent);
      if (coords && coords.length === 2) {
        const [pitch, yaw] = coords;
        onCanvasPinClick({
          pitch: Math.round(pitch * 10) / 10,
          yaw: Math.round(yaw * 10) / 10
        });
      }
    } catch (err) {
      console.error('[Pannellum Pin Click Error]:', err);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* CSS Styles for Hotspots & Glassmorphism Bar */}
      <style>{`
        .custom-hotspot-badge {
          cursor: pointer;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          z-index: 10;
        }
        .hotspot-pulse {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563EB, #1D4ED8);
          border: 3px solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-size: 16px;
          box-shadow: 0 0 15px rgba(37, 99, 235, 0.85);
          animation: pulse-ring-glow 2s infinite cubic-bezier(0.455, 0.03, 0.515, 0.955);
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .custom-hotspot-badge:hover .hotspot-pulse {
          transform: scale(1.18);
          background: linear-gradient(135deg, #1E40AF, #1D4ED8);
        }
        .hotspot-label {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 12px;
          white-space: nowrap;
          border: 1px solid rgba(255, 255, 255, 0.2);
          pointer-events: none;
        }
        @keyframes pulse-ring-glow {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.8); }
          70% { box-shadow: 0 0 0 16px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }

        /* 3D Walking Arrow Styles */
        .walking-arrow-hotspot {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          user-select: none;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.45));
        }
        .walking-arrow-hotspot:hover {
          transform: translate(-50%, -55%) scale(1.15) !important;
        }
        .walking-arrow-label {
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #FFFFFF;
          font-size: 12.5px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1.5px solid rgba(59, 130, 246, 0.7);
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.45);
          white-space: nowrap;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .walking-arrow-hotspot:hover .walking-arrow-label {
          background: #1D4ED8;
          border-color: #93C5FD;
          box-shadow: 0 0 16px rgba(59, 130, 246, 0.8);
        }
        .walking-arrow-disc {
          position: relative;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: radial-gradient(circle, #2563EB 0%, #1E3A8A 100%);
          border: 2.5px solid #FFFFFF;
          box-shadow: 0 0 20px rgba(37, 99, 235, 0.85), 0 0 35px rgba(59, 130, 246, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse-walking-disc 1.8s infinite ease-in-out;
        }
        @keyframes pulse-walking-disc {
          0% {
            transform: scale(0.96);
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.75);
          }
          70% {
            transform: scale(1.06);
            box-shadow: 0 0 0 15px rgba(37, 99, 235, 0);
          }
          100% {
            transform: scale(0.96);
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
          }
        }
        .walking-arrow-svg {
          width: 24px;
          height: 24px;
          fill: none;
          stroke: #FFFFFF;
          stroke-width: 3.2;
          stroke-linecap: round;
          stroke-linejoin: round;
          animation: bounce-chevron 1.4s infinite ease-in-out;
        }
        @keyframes bounce-chevron {
          0%, 100% {
            transform: translateY(2px);
            opacity: 0.85;
          }
          50% {
            transform: translateY(-3px);
            opacity: 1;
            filter: drop-shadow(0 0 5px #93C5FD);
          }
        }

        .glass-toolbar {
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 9999px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
        }
        .glass-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.12);
          border: none;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }
        .glass-btn:hover {
          background: #2563EB;
          transform: translateY(-2px);
          color: #FFFFFF;
        }
        .glass-btn.active {
          background: #2563EB;
          box-shadow: 0 0 12px rgba(37, 99, 235, 0.7);
        }
      `}</style>

      {/* Pannellum DOM Container */}
      <div
        id={containerId.current}
        ref={containerRef}
        onPointerDown={(e) => {
          pointerDownPos.current = { x: e.clientX, y: e.clientY };
        }}
        onClick={handleContainerClick}
        style={{
          width: '100%',
          height: '100%',
          background: '#0F172A',
          cursor: isPinMode ? 'crosshair' : 'default'
        }}
      />

      {/* Pin Mode Glowing Banner */}
      {isPinMode && (
        <div
          className="studio-pin-banner"
          style={{
            position: 'absolute',
            top: 14,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
            border: '1.5px solid #FECACA',
            color: '#FFFFFF',
            padding: '8px 18px',
            borderRadius: '30px',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.5)',
            pointerEvents: 'auto'
          }}
        >
          <span style={{ fontSize: '15px' }}>📍</span>
          <span>Chế độ ghim đang BẬT: Nhấp chuột lên vị trí cửa/lối đi để gắn Mũi tên</span>
          {onTogglePinMode && (
            <button
              type="button"
              onClick={onTogglePinMode}
              style={{
                background: 'rgba(255, 255, 255, 0.25)',
                border: 'none',
                color: '#FFF',
                borderRadius: '12px',
                padding: '3px 10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '11.5px',
                marginLeft: 6
              }}
            >
              Hủy ghim
            </button>
          )}
        </div>
      )}

      {/* Top Banner */}
      <div
        className="top-title-banner"
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 20,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: 12,
          padding: '8px 14px',
          color: '#F8FAFC',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 4px 15px rgba(0,0,0,0.35)'
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
        <span>{title}</span>
      </div>

      {/* Bottom Floating Control Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          pointerEvents: 'auto'
        }}
      >
        <div className="glass-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px' }}>
          {/* Ghim Hotspot Toggle (Studio) */}
          {onTogglePinMode && (
            <button
              className={`glass-btn ${isPinMode ? 'active' : ''}`}
              title={isPinMode ? 'Tắt chế độ ghim điểm' : 'Bật chế độ Ghim Điểm Liên Kết (Click để gắn)'}
              onClick={onTogglePinMode}
              style={isPinMode ? { background: '#DC2626', color: '#FFF' } : undefined}
            >
              <i className="fa-solid fa-location-dot"></i>
            </button>
          )}

          {/* Lưu góc nhìn mặc định (Studio) */}
          {onCaptureInitialView && (
            <button
              className="glass-btn"
              title="Lưu góc nhìn hiện tại làm góc mở màn khi vào phòng"
              onClick={handleCaptureView}
            >
              <i className="fa-solid fa-camera"></i>
            </button>
          )}

          {/* Home / Reset view */}
          <button
            className="glass-btn"
            title="Góc nhìn chính diện (Góc siêu rộng 100°)"
            onClick={handleResetHome}
          >
            <i className="fa-solid fa-compass"></i>
          </button>

          {/* Little Planet Toggle */}
          <button
            className={`glass-btn ${isLittlePlanet ? 'active' : ''}`}
            title="Hiệu ứng Quả cầu hành tinh tí hon (Little Planet)"
            onClick={handleTogglePlanet}
          >
            <i className="fa-solid fa-globe"></i>
          </button>

          {/* Auto Rotate Toggle */}
          <button
            className={`glass-btn ${isAutoRotating ? 'active' : ''}`}
            title="Tự động xoay quanh phòng"
            onClick={handleToggleAutoRotate}
          >
            <i className="fa-solid fa-arrows-rotate"></i>
          </button>

          {/* Zoom In */}
          <button className="glass-btn" title="Phóng to" onClick={handleZoomIn}>
            <i className="fa-solid fa-plus"></i>
          </button>

          {/* Zoom Out */}
          <button className="glass-btn" title="Thu nhỏ" onClick={handleZoomOut}>
            <i className="fa-solid fa-minus"></i>
          </button>

          {/* Fullscreen */}
          <button className="glass-btn" title="Toàn màn hình" onClick={handleToggleFullscreen}>
            <i className="fa-solid fa-expand"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
