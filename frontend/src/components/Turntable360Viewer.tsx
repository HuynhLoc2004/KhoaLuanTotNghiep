import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCw, Play, Pause, ZoomIn, ZoomOut, Maximize2, Minimize2, RefreshCw } from 'lucide-react';

interface Turntable360ViewerProps {
  images: string[];
  title?: string;
  autoPlay?: boolean;
  autoPlaySpeedMs?: number;
  className?: string;
  height?: string | number;
}

export const Turntable360Viewer: React.FC<Turntable360ViewerProps> = ({
  images,
  title,
  autoPlay = true,
  autoPlaySpeedMs = 80,
  className = '',
  height = 460
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  const startXRef = useRef(0);
  const currentAngleRef = useRef(0);
  const velocityRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  const totalFrames = images.length > 0 ? images.length : 1;

  // Preload all 360 images for silky-smooth rotation
  useEffect(() => {
    if (!images || images.length === 0) return;
    let count = 0;
    const imgObjects: HTMLImageElement[] = [];

    images.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        count++;
        setLoadedCount(count);
      };
      img.onerror = () => {
        count++;
        setLoadedCount(count);
      };
      imgObjects.push(img);
    });

    return () => {
      imgObjects.forEach(img => { img.onload = null; img.onerror = null; });
    };
  }, [images]);

  // Auto-play loop when user is not dragging
  useEffect(() => {
    if (!isPlaying || isDragging || totalFrames <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalFrames);
    }, autoPlaySpeedMs);

    return () => clearInterval(interval);
  }, [isPlaying, isDragging, totalFrames, autoPlaySpeedMs]);

  // Handle Drag / Touch Interaction
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setIsPlaying(false);
    startXRef.current = e.clientX;
    velocityRef.current = 0;
    lastTimeRef.current = performance.now();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || totalFrames <= 1) return;

    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const deltaX = e.clientX - startXRef.current;

    // Sensitivity: 1 full rotation for 600px drag
    const sensitivity = 600 / totalFrames;
    const step = Math.round(deltaX / sensitivity);

    if (step !== 0) {
      setCurrentIndex((prev) => {
        const next = (prev - step + totalFrames * 10) % totalFrames;
        return next;
      });
      startXRef.current = e.clientX;
      velocityRef.current = deltaX / dt;
    }
    lastTimeRef.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    // Inertia damping after release
    let vel = velocityRef.current;
    if (Math.abs(vel) > 0.1 && totalFrames > 1) {
      const decay = () => {
        vel *= 0.92;
        if (Math.abs(vel) > 0.05) {
          const delta = Math.round(vel * 3);
          setCurrentIndex((prev) => (prev - delta + totalFrames * 10) % totalFrames);
          animationFrameRef.current = requestAnimationFrame(decay);
        }
      };
      animationFrameRef.current = requestAnimationFrame(decay);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setZoom(1);
    setIsPlaying(true);
  };

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  const degrees = Math.round((currentIndex / totalFrames) * 360);
  const currentImage = images[currentIndex] || images[0] || '';

  return (
    <div
      ref={containerRef}
      className={`turntable-360-container ${className} ${isFullscreen ? 'fullscreen-mode' : ''}`}
      style={{
        position: 'relative',
        width: '100%',
        height: isFullscreen ? '100vh' : height,
        background: 'radial-gradient(circle at 50% 35%, #2a2d32 0%, #15171a 70%, #0d0e10 100%)',
        borderRadius: isFullscreen ? 0 : 16,
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}
    >
      {/* Overhead Museum Studio Spotlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: '40%',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.18) 0%, rgba(245, 158, 11, 0) 75%)',
          pointerEvents: 'none'
        }}
      />

      {/* Top Bar: Title and 360 Degree Indicator */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 16,
          right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#F59E0B',
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 20,
              letterSpacing: '0.5px'
            }}
          >
            <RotateCw size={12} className={isPlaying ? 'spin' : ''} />
            MÂM XOAY 360°
          </span>
          {title && (
            <span
              style={{
                color: '#E5E7EB',
                fontSize: 13,
                fontWeight: 600,
                textShadow: '0 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              {title}
            </span>
          )}
        </div>

        {/* Degree Counter Pill */}
        <div
          style={{
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#F3F4F6',
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 20,
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {degrees}° <span style={{ color: '#9CA3AF', fontSize: 10 }}>({currentIndex + 1}/{totalFrames})</span>
        </div>
      </div>

      {/* Interactive Turntable Display Area */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Museum Exhibition Pedestal (Bục xoay tròn 3D) */}
        <div
          style={{
            position: 'absolute',
            bottom: '12%',
            width: '64%',
            maxWidth: 380,
            height: 52,
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #374151 0%, #1f2937 45%, #111827 100%)',
            boxShadow: `
              0 20px 45px rgba(0,0,0,0.85),
              0 4px 12px rgba(245, 158, 11, 0.25),
              inset 0 2px 4px rgba(255,255,255,0.25),
              inset 0 -2px 6px rgba(0,0,0,0.8)
            `,
            transform: 'perspective(450px) rotateX(62deg)',
            pointerEvents: 'none',
            border: '1.5px solid rgba(245, 158, 11, 0.35)'
          }}
        >
          {/* Inner turntable rotating accent ring */}
          <div
            style={{
              position: 'absolute',
              inset: 8,
              borderRadius: '50%',
              border: '1px dashed rgba(255, 255, 255, 0.18)',
              transform: `rotate(${degrees}deg)`,
              transition: isDragging ? 'none' : 'transform 0.1s linear'
            }}
          />
        </div>

        {/* Shadow directly under the artifact */}
        <div
          style={{
            position: 'absolute',
            bottom: '17%',
            width: '42%',
            maxWidth: 240,
            height: 24,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 75%)',
            pointerEvents: 'none',
            filter: 'blur(4px)'
          }}
        />

        {/* Artifact Image with 360 Spin Frame & Zoom */}
        {currentImage ? (
          <img
            src={currentImage}
            alt={title || 'Hiện vật 360'}
            draggable={false}
            style={{
              maxHeight: '74%',
              maxWidth: '82%',
              objectFit: 'contain',
              transform: `scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.65))',
              zIndex: 2,
              pointerEvents: 'none'
            }}
          />
        ) : (
          <div style={{ color: '#9CA3AF', fontSize: 14 }}>Chưa có hình ảnh mâm xoay</div>
        )}

        {/* Drag Guidance Prompt (fades when interacting) */}
        {!isDragging && isPlaying && (
          <div
            style={{
              position: 'absolute',
              bottom: '5%',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'rgba(255,255,255,0.45)',
              fontSize: 11,
              fontWeight: 500,
              pointerEvents: 'none'
            }}
          >
            <span>‹ Vuốt hoặc kéo chuột để xoay hiện vật 360° ›</span>
          </div>
        )}
      </div>

      {/* Floating Control Floating Island Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(17, 24, 39, 0.85)',
          backdropFilter: 'blur(12px)',
          padding: '5px 8px',
          borderRadius: 30,
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 10
        }}
      >
        <button
          className="viewer-ctrl-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          title={isPlaying ? 'Dừng tự động xoay' : 'Tự động xoay 360'}
          style={ctrlBtnStyle}
        >
          {isPlaying ? <Pause size={15} color="#F59E0B" /> : <Play size={15} color="#F3F4F6" />}
        </button>

        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)' }} />

        <button
          className="viewer-ctrl-btn"
          onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
          title="Phóng to chi tiết"
          style={ctrlBtnStyle}
        >
          <ZoomIn size={15} color="#F3F4F6" />
        </button>

        <button
          className="viewer-ctrl-btn"
          onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}
          title="Thu nhỏ"
          style={ctrlBtnStyle}
        >
          <ZoomOut size={15} color="#F3F4F6" />
        </button>

        <button
          className="viewer-ctrl-btn"
          onClick={handleReset}
          title="Đặt lại góc nhìn"
          style={ctrlBtnStyle}
        >
          <RefreshCw size={14} color="#F3F4F6" />
        </button>

        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)' }} />

        <button
          className="viewer-ctrl-btn"
          onClick={toggleFullscreen}
          title="Toàn màn hình"
          style={ctrlBtnStyle}
        >
          {isFullscreen ? <Minimize2 size={15} color="#F3F4F6" /> : <Maximize2 size={15} color="#F3F4F6" />}
        </button>
      </div>
    </div>
  );
};

const ctrlBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};
