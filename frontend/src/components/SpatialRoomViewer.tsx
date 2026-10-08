import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Compass,
  Sparkles,
  Info
} from 'lucide-react';

export interface RoomSceneView {
  id: string;
  index: number;
  title: string;
  url: string;
  filename: string;
  isPrimary?: boolean;
}

interface SpatialRoomViewerProps {
  currentUrl: string;
  views?: RoomSceneView[];
  title?: string;
  onSwitchView?: (url: string) => void;
}

export const SpatialRoomViewer: React.FC<SpatialRoomViewerProps> = ({
  currentUrl,
  views = [],
  title = 'Gian phòng bảo tàng',
  onSwitchView
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Trạng thái Zoom & Pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Trạng thái chuyển cảnh mượt mà
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedUrl, setDisplayedUrl] = useState(currentUrl);

  // Trạng thái Toàn màn hình & Tự động tham quan (Auto-Tour)
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Xác định chỉ mục góc nhìn hiện tại
  const currentIndex = React.useMemo(() => {
    if (!views || views.length === 0) return 0;
    const idx = views.findIndex((v) => v.url === currentUrl || v.url === displayedUrl);
    return idx >= 0 ? idx : 0;
  }, [views, currentUrl, displayedUrl]);

  // Cập nhật khi currentUrl từ cha thay đổi với hiệu ứng chuyển cảnh
  useEffect(() => {
    if (currentUrl && currentUrl !== displayedUrl) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayedUrl(currentUrl);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setIsTransitioning(false);
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [currentUrl]);

  // Bộ đếm Tự động tham quan (Auto-Tour)
  useEffect(() => {
    let interval: any = null;
    if (isAutoPlaying && views.length > 1) {
      interval = setInterval(() => {
        const nextIdx = (currentIndex + 1) % views.length;
        if (onSwitchView) {
          onSwitchView(views[nextIdx].url);
        }
      }, 4500);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentIndex, views, onSwitchView]);

  // Chuyển góc trước / sau
  const handlePrev = () => {
    if (!views || views.length <= 1) return;
    const prevIdx = (currentIndex - 1 + views.length) % views.length;
    if (onSwitchView) onSwitchView(views[prevIdx].url);
  };

  const handleNext = () => {
    if (!views || views.length <= 1) return;
    const nextIdx = (currentIndex + 1) % views.length;
    if (onSwitchView) onSwitchView(views[nextIdx].url);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(3.5, Number((z + 0.35).toFixed(2))));
  const handleZoomOut = () => {
    setZoom((z) => {
      const nextZ = Math.max(1, Number((z - 0.35).toFixed(2)));
      if (nextZ === 1) setPan({ x: 0, y: 0 });
      return nextZ;
    });
  };
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Xử lý kéo chuột để Pan khi Zoom > 1
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Lăn chuột để Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  // Toggle Toàn màn hình
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const currentViewTitle = views[currentIndex]?.title || `Góc nhìn ${currentIndex + 1}`;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '480px',
        backgroundColor: '#0c0d12',
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column'
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Khung ảnh chính sắc nét 100% nguyên bản */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        <img
          src={displayedUrl}
          alt={currentViewTitle}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out, opacity 0.2s ease-in-out',
            opacity: isTransitioning ? 0.15 : 1,
            pointerEvents: 'none'
          }}
          draggable={false}
        />
      </div>

      {/* Floating Header: Tên góc nhìn & Nút điều khiển Zoom/Auto */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          right: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        {/* Huy hiệu Góc phòng hiện tại */}
        <div
          style={{
            background: 'rgba(15, 20, 28, 0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212, 168, 106, 0.35)',
            borderRadius: '8px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#fff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            pointerEvents: 'auto'
          }}
        >
          <Compass size={15} style={{ color: 'var(--accent-gold, #d4a86a)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-gold, #d4a86a)' }}>
            {currentViewTitle}
          </span>
          {views.length > 1 && (
            <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.5)', marginLeft: 4 }}>
              ({currentIndex + 1}/{views.length})
            </span>
          )}
        </div>

        {/* Thanh công cụ Zoom & Chế độ xem */}
        <div
          style={{
            background: 'rgba(15, 20, 28, 0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            pointerEvents: 'auto'
          }}
        >
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            style={{
              background: 'transparent',
              border: 'none',
              color: zoom <= 1 ? 'rgba(255,255,255,0.25)' : '#fff',
              cursor: zoom <= 1 ? 'default' : 'pointer',
              padding: '6px',
              borderRadius: '5px',
              display: 'flex'
            }}
            title="Thu nhỏ"
          >
            <ZoomOut size={15} />
          </button>

          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 600,
              color: 'var(--accent-gold, #d4a86a)',
              minWidth: '42px',
              textAlign: 'center'
            }}
          >
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 3.5}
            style={{
              background: 'transparent',
              border: 'none',
              color: zoom >= 3.5 ? 'rgba(255,255,255,0.25)' : '#fff',
              cursor: zoom >= 3.5 ? 'default' : 'pointer',
              padding: '6px',
              borderRadius: '5px',
              display: 'flex'
            }}
            title="Phóng to soi chi tiết hiện vật"
          >
            <ZoomIn size={15} />
          </button>

          {zoom > 1 && (
            <button
              type="button"
              onClick={handleResetZoom}
              style={{
                background: 'rgba(212, 168, 106, 0.15)',
                border: 'none',
                color: 'var(--accent-gold, #d4a86a)',
                cursor: 'pointer',
                padding: '6px 8px',
                borderRadius: '5px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
              title="Đặt lại kích thước ban đầu"
            >
              <RotateCcw size={12} />
              <span>100%</span>
            </button>
          )}

          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />

          {/* Nút Tự động tham quan Auto-Tour */}
          {views.length > 1 && (
            <button
              type="button"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              style={{
                background: isAutoPlaying ? 'var(--accent-gold, #d4a86a)' : 'transparent',
                border: 'none',
                color: isAutoPlaying ? '#000' : '#fff',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '5px',
                fontSize: '11.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
              title={isAutoPlaying ? 'Tạm dừng tự động tham quan' : 'Bật tự động tham quan vòng quanh phòng'}
            >
              {isAutoPlaying ? <Pause size={13} /> : <Play size={13} />}
              <span>{isAutoPlaying ? 'Dừng tour' : 'Tự động tour'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '5px',
              display: 'flex'
            }}
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Floating Navigation: Mũi tên chuyển góc trái / phải */}
      {views.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 20, 28, 0.85)',
              border: '1px solid rgba(212, 168, 106, 0.4)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
              zIndex: 10,
              transition: 'transform 0.15s, background-color 0.15s'
            }}
            title="Quay sang góc trước"
            aria-label="Góc trước"
          >
            <ChevronLeft size={22} style={{ color: 'var(--accent-gold, #d4a86a)' }} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'rgba(15, 20, 28, 0.85)',
              border: '1px solid rgba(212, 168, 106, 0.4)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
              zIndex: 10,
              transition: 'transform 0.15s, background-color 0.15s'
            }}
            title="Quay sang góc tiếp theo"
            aria-label="Góc tiếp theo"
          >
            <ChevronRight size={22} style={{ color: 'var(--accent-gold, #d4a86a)' }} />
          </button>
        </>
      )}

      {/* Bottom Gallery: Dải hình thu nhỏ (Thumbnails) của các góc trong phòng */}
      {views.length > 1 && (
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            background: 'rgba(12, 15, 22, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            overflowX: 'auto',
            scrollbarWidth: 'thin'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, color: 'var(--accent-gold, #d4a86a)' }}>
            <Sparkles size={14} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>
              Các góc phòng ({views.length}):
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflowX: 'auto', padding: '2px 0' }}>
            {views.map((v, i) => {
              const isActive = (currentUrl || displayedUrl) === v.url;
              return (
                <button
                  key={v.id || i}
                  type="button"
                  onClick={() => onSwitchView && onSwitchView(v.url)}
                  style={{
                    position: 'relative',
                    width: 78,
                    height: 52,
                    borderRadius: 6,
                    overflow: 'hidden',
                    border: isActive
                      ? '2px solid var(--accent-gold, #d4a86a)'
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: isActive ? '0 0 10px rgba(212, 168, 106, 0.45)' : 'none',
                    cursor: 'pointer',
                    padding: 0,
                    background: '#000',
                    flexShrink: 0,
                    opacity: isActive ? 1 : 0.65,
                    transition: 'all 0.15s ease'
                  }}
                  title={v.title}
                >
                  <img
                    src={v.url}
                    alt={v.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(0,0,0,0.75)',
                      color: isActive ? 'var(--accent-gold, #d4a86a)' : '#fff',
                      fontSize: '9.5px',
                      fontWeight: isActive ? 700 : 500,
                      padding: '2px 3px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center'
                    }}
                  >
                    {v.isPrimary ? '⭐ ' : ''}Góc {i + 1}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
