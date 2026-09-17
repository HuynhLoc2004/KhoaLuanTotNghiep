import React, { useEffect, useRef, useState } from 'react';

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
}

export const Pannellum360Viewer: React.FC<Pannellum360ViewerProps> = ({
  panoramaUrl,
  title = 'Toàn cảnh 360° Bảo tàng Lịch sử TP.HCM',
  autoStartLittlePlanet = true,
  hotspots = [],
  onHotspotClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const containerId = useRef(`pannellum-container-${Math.random().toString(36).substring(2, 9)}`);
  const hasIntroducedRef = useRef<string | null>(null);
  const introTimerRef = useRef<any>(null);

  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isLittlePlanet, setIsLittlePlanet] = useState(false);

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
        hotSpotDiv.className = 'custom-hotspot-badge';
        hotSpotDiv.innerHTML = `
          <div class="hotspot-pulse">
            <i class="fa-solid ${hs.icon || 'fa-location-dot'}"></i>
          </div>
          <div class="hotspot-label">${hs.text}</div>
        `;
      }
    }));

    try {
      const viewer = window.pannellum.viewer(containerId.current, {
        type: 'equirectangular',
        panorama: panoramaUrl,
        autoLoad: true,
        showControls: false,
        compass: false,
        hfov: 100, // Góc nhìn ngang rộng rãi 100° chuẩn rạp chiếu phim
        minHfov: 45,
        maxHfov: 120,
        minPitch: -50, // Giới hạn góc nhìn tự nhiên theo độ cao phòng
        maxPitch: 50,  // Chống nhìn thẳng lên trần khuyết điểm
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
  }, [panoramaUrl, hotspotsHash]);

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
        clearInterval(introTimerRef.current);
        introTimerRef.current = setInterval(() => {
          fov -= 1.8;
          pitch += 2.0;

          if (fov <= 100) fov = 100;
          if (pitch >= 0) pitch = 0;

          if (viewerRef.current) {
            viewerRef.current.setHfov(fov);
            viewerRef.current.setPitch(pitch);
          }

          if (fov === 100 && pitch === 0) {
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
    viewerRef.current.setPitch(0);
    viewerRef.current.setYaw(0);
    viewerRef.current.setHfov(100);
    setIsLittlePlanet(false);
  };

  const handleToggleFullscreen = () => {
    if (!viewerRef.current) return;
    viewerRef.current.toggleFullscreen();
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
        style={{ width: '100%', height: '100%', background: '#0F172A' }}
      />

      {/* Top Banner */}
      <div
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
