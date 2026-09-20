import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { API_BASE } from '../services/api';
import { useSystemBranding } from '../context/SystemBrandingContext';

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
  title,
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
  const { branding } = useSystemBranding();
  const effectiveTitle = title || (branding ? `Toàn cảnh 360° ${branding.museumName}` : 'Toàn cảnh 360°');
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const containerId = useRef(`pannellum-container-${Math.random().toString(36).substring(2, 9)}`);
  const hasIntroducedRef = useRef<string | null>(null);
  const introTimerRef = useRef<any>(null);

  const isPinModeRef = useRef(isPinMode);
  useEffect(() => {
    isPinModeRef.current = isPinMode;
  }, [isPinMode]);

  const onCanvasPinClickRef = useRef(onCanvasPinClick);
  useEffect(() => {
    onCanvasPinClickRef.current = onCanvasPinClick;
  }, [onCanvasPinClick]);

  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isLittlePlanet, setIsLittlePlanet] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [isLoadingPanorama, setIsLoadingPanorama] = useState(true);

  // Tự động phân giải URL: chuyển relative/localhost về domain client thực tế và bọc R2 qua Proxy nếu cần
  const effectivePanoramaUrl = React.useMemo(() => {
    let url = panoramaUrl;
    if (url) {
      if (url.startsWith('/')) {
        url = `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`;
      } else if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
          try {
            const parsed = new URL(url);
            url = `${window.location.origin}${parsed.pathname}${parsed.search}`;
          } catch (_) {
            url = url.replace(/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, window.location.origin);
          }
        }
      }
    }

    if (
      url &&
      url.includes('r2.dev') &&
      !url.includes('/api/stitch/proxy-image')
    ) {
      url = `${API_BASE}/stitch/proxy-image?url=${encodeURIComponent(url)}`;
    }

    return url;
  }, [panoramaUrl]);

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
      createTooltipFunc: (hotSpotDiv: HTMLElement) => {
        hotSpotDiv.classList.add('custom-hotspot-badge');
        hotSpotDiv.style.pointerEvents = 'auto';
        hotSpotDiv.style.cursor = 'pointer';

        if (hs.type === 'scene' || (hs as any).type === 'navigation' || hs.roomId || hs.sceneId) {
          hotSpotDiv.classList.add('walking-arrow-hotspot');
          hotSpotDiv.innerHTML = `
            <div class="walking-arrow-label">
              <span>${hs.text}</span>
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

        let lastClickTime = 0;
        const onTrigger = (e: Event) => {
          // Khi đang ở chế độ cắm điểm mới, hoàn toàn không kích hoạt hotspot cũ
          if (isPinModeRef.current) return;

          e.stopPropagation();
          e.preventDefault();
          const now = Date.now();
          if (now - lastClickTime < 500) return; // Debounce 500ms
          lastClickTime = now;

          if (onHotspotClick) {
            onHotspotClick(hs);
          } else if (hs.onClick) {
            hs.onClick();
          }
        };

        hotSpotDiv.onclick = onTrigger;
      }
    }));

    setIsLoadingPanorama(true);
    setViewerError(null);

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
        setIsLoadingPanorama(false);
        setViewerError(null);
        if (autoStartLittlePlanet && hasIntroducedRef.current !== panoramaUrl) {
          hasIntroducedRef.current = panoramaUrl;
          runLittlePlanetIntro();
        }
      });

      viewer.on('error', (err: any) => {
        console.warn('[Pannellum 360 Error]:', err);
        setIsLoadingPanorama(false);
        setViewerError(typeof err === 'string' ? err : 'Không thể khởi tạo WebGL 360° với ảnh này.');
      });
    } catch (err: any) {
      console.error('[Pannellum Init Error]:', err);
      setIsLoadingPanorama(false);
      setViewerError(err?.message || 'Lỗi khởi tạo trình xem 360°');
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
    } catch (err) {
      console.error('[Pannellum Capture View Error]:', err);
    }
  };

  // Studio: Bắt sự kiện click lên ảnh để ghim tọa độ Hotspot bằng capture phase listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let downPos: { x: number; y: number } | null = null;

    const handleNativePointerDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
    };

    const handleNativePointerUp = (e: PointerEvent) => {
      if (!isPinModeRef.current || !viewerRef.current || !onCanvasPinClickRef.current || !downPos) return;

      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      downPos = null;

      // Click jitter tolerance: nếu rê chuột > 10px thì là kéo xoay camera, bỏ qua không ghim
      if (dist > 10) return;

      const target = e.target as HTMLElement;
      if (
        target.closest('.glass-toolbar') ||
        target.closest('.studio-pin-banner') ||
        target.closest('.top-title-banner') ||
        target.closest('button')
      ) {
        return;
      }

      try {
        const coords = viewerRef.current.mouseEventToCoords(e);
        if (coords && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          const [pitch, yaw] = coords;
          e.stopPropagation();
          e.preventDefault();
          onCanvasPinClickRef.current({
            pitch: Math.round(pitch * 10) / 10,
            yaw: Math.round(yaw * 10) / 10
          });
        }
      } catch (err) {
        console.error('[Pannellum Pin Click Error]:', err);
      }
    };

    container.addEventListener('pointerdown', handleNativePointerDown, { capture: true });
    container.addEventListener('pointerup', handleNativePointerUp, { capture: true });

    return () => {
      container.removeEventListener('pointerdown', handleNativePointerDown, { capture: true });
      container.removeEventListener('pointerup', handleNativePointerUp, { capture: true });
    };
  }, []);

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

        .pnlm-hotspot-base {
          pointer-events: auto !important;
          cursor: pointer !important;
          z-index: 25 !important;
        }
        /* 3D Walking Arrow Styles */
        .walking-arrow-hotspot {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer !important;
          pointer-events: auto !important;
          user-select: none;
          filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.45));
          transform: translate(-50%, -50%);
          z-index: 30 !important;
          transition: filter 0.2s ease;
        }
        .walking-arrow-hotspot:hover {
          /* Không dùng transform để triệt tiêu 100% rung giật */
          filter: drop-shadow(0 8px 24px rgba(37, 99, 235, 0.9)) !important;
        }
        .walking-arrow-label,
        .walking-arrow-disc,
        .walking-arrow-svg {
          pointer-events: auto !important;
          cursor: pointer !important;
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
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.95);
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
          transition: all 0.2s ease;
        }
        .walking-arrow-hotspot:hover .walking-arrow-disc {
          border-color: #93C5FD;
          box-shadow: 0 0 30px rgba(59, 130, 246, 1);
        }
        @keyframes pulse-walking-disc {
          0% {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.85), 0 0 0 0 rgba(37, 99, 235, 0.75);
          }
          70% {
            box-shadow: 0 0 25px rgba(37, 99, 235, 0.95), 0 0 0 14px rgba(37, 99, 235, 0);
          }
          100% {
            box-shadow: 0 0 15px rgba(37, 99, 235, 0.85), 0 0 0 0 rgba(37, 99, 235, 0);
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
        .studio-pin-mode-active .pnlm-hotspot-base,
        .studio-pin-mode-active .custom-hotspot-badge,
        .studio-pin-mode-active .walking-arrow-hotspot {
          pointer-events: none !important;
          opacity: 0.5 !important;
          filter: grayscale(0.5);
          cursor: crosshair !important;
        }

        @media (max-width: 600px) {
          .glass-toolbar {
            padding: 5px 8px !important;
            gap: 5px !important;
          }
          .glass-btn {
            width: 32px !important;
            height: 32px !important;
            font-size: 11.5px !important;
          }
          .top-title-banner {
            max-width: calc(100% - 24px) !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            padding: 5px 10px !important;
            font-size: 11.5px !important;
          }
        }
      `}</style>

      {/* Pannellum DOM Container */}
      <div
        id={containerId.current}
        ref={containerRef}
        className={isPinMode ? 'studio-pin-mode-active' : ''}
        style={{
          width: '100%',
          height: '100%',
          background: '#17120E',
          cursor: isPinMode ? 'crosshair' : 'default'
        }}
      />

      {/* Loading Spinner Indicator */}
      {isLoadingPanorama && !viewerError && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(23, 18, 14, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 15,
          gap: 10,
          color: 'var(--text-muted)'
        }}>
          <div style={{
            width: 32,
            height: 32,
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span style={{ fontSize: 12.5, fontWeight: 500 }}>Đang nạp không gian 360°...</span>
        </div>
      )}

      {/* Fallback View if WebGL fails or load error */}
      {viewerError && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(23, 18, 14, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          textAlign: 'center',
          zIndex: 35,
          gap: 12
        }}>
          <div style={{ width: '100%', maxHeight: '55%', overflow: 'hidden', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <img
              src={effectivePanoramaUrl}
              alt="Ảnh toàn cảnh 360°"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', maxWidth: 380, margin: 0, lineHeight: 1.45 }}>
            Đã lưu ảnh toàn cảnh 360° thành công. Nếu thiết bị gặp giới hạn WebGL, bạn có thể xem trực tiếp ảnh gốc:
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a
              href={effectivePanoramaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              Mở xem ảnh toàn cảnh gốc
            </a>
          </div>
        </div>
      )}

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
            background: 'rgba(36, 32, 29, 0.95)',
            border: '1.5px solid var(--accent-gold)',
            color: '#EDE5DF',
            padding: '7px 18px',
            borderRadius: '24px',
            fontSize: 12.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto',
            backdropFilter: 'blur(8px)'
          }}
        >
          <MapPin size={15} style={{ color: 'var(--accent-gold)' }} />
          <span>Nhấp chuột lên vị trí bất kỳ trên ảnh để đặt điểm</span>
          {onTogglePinMode && (
            <button
              type="button"
              onClick={onTogglePinMode}
              style={{
                background: 'rgba(212, 168, 106, 0.15)',
                border: '1px solid rgba(212, 168, 106, 0.35)',
                color: 'var(--accent-gold)',
                borderRadius: '12px',
                padding: '2px 10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '11px',
                marginLeft: 4
              }}
            >
              Hủy ghim
            </button>
          )}
        </div>
      )}

      {/* Top Banner (Chỉ hiện khi có title được cung cấp) */}
      {Boolean(title && title.trim().length > 0) && (
        <div
          className="top-title-banner"
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            zIndex: 20,
            background: 'rgba(26, 20, 16, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(212, 168, 106, 0.35)',
            borderRadius: 20,
            padding: '6px 14px',
            color: '#F5EBE1',
            fontSize: '12.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            boxShadow: '0 4px 18px rgba(0,0,0,0.45)',
            fontFamily: "'Be Vietnam Pro', sans-serif"
          }}
        >
          <span>🏛️</span>
          <span>{title}</span>
        </div>
      )}

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
