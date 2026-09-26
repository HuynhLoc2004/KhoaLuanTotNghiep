import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Navigation,
  Eye,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowUpLeft,
  ArrowDownRight,
  ArrowDownLeft,
  RotateCcw,
  Info,
  Layers,
  Building,
  ZoomIn,
  ZoomOut,
  Compass,
  MapPin,
  Maximize2
} from 'lucide-react';
import { FloorPlanMap, FloorPlanNode, FloorPlanEdge } from '../../types';
import './interactiveFloorPlanMap.css';

interface InteractiveFloorPlanMapProps {
  floorPlan: FloorPlanMap;
  onSelectRoom360?: (roomId: string) => void;
  clientTheme?: 'light' | 'dark';
}

type MapViewMode = 'heritage' | 'topology' | 'original';

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');
const resolveImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_ROOT}${cleanPath}`;
};

export const InteractiveFloorPlanMap: React.FC<InteractiveFloorPlanMapProps> = ({
  floorPlan,
  onSelectRoom360,
  clientTheme = 'dark'
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    floorPlan.nodes?.[0]?.id || ''
  );
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Chế độ xem: 'heritage' (Bản đồ di sản trên nền ảnh gốc), 'topology' (Sơ đồ khối 2D), 'original' (Ảnh gốc)
  const [viewMode, setViewMode] = useState<MapViewMode>(() => {
    return floorPlan.imageUrl ? 'heritage' : 'topology';
  });

  // Tỉ lệ khung hình của ảnh sơ đồ gốc (Width / Height)
  const [imageRatio, setImageRatio] = useState<number | null>(null);

  // Trạng thái Phóng to / Thu nhỏ / Kéo bản đồ (Zoom & Pan)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleZoomIn = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoom((prev) => Math.min(2.5, Math.round((prev + 0.25) * 100) / 100));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoom((prev) => {
      const next = Math.max(1, Math.round((prev - 0.25) * 100) / 100);
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    setIsPanning(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handlePointerUp = () => {
    setIsPanning(false);
  };

  // Tự động đồng bộ node được chọn khi danh sách phòng từ MongoDB thay đổi
  useEffect(() => {
    if (floorPlan.nodes?.length) {
      if (!floorPlan.nodes.some((n) => n.id === selectedNodeId)) {
        setSelectedNodeId(floorPlan.nodes[0].id);
      }
    }
  }, [floorPlan.nodes, selectedNodeId]);

  // Nếu sơ đồ có ảnh mới và chưa đặt chế độ xem thì ưu tiên chế độ Heritage
  useEffect(() => {
    if (floorPlan.imageUrl && viewMode === 'topology') {
      setViewMode('heritage');
    }
  }, [floorPlan.imageUrl]);

  // Node đang được chọn
  const activeNode = useMemo(() => {
    return floorPlan.nodes?.find((n) => n.id === selectedNodeId) || floorPlan.nodes?.[0];
  }, [floorPlan.nodes, selectedNodeId]);

  // Các liên kết cửa đi ra từ node đang được chọn (outgoing doors)
  const connectedEdges = useMemo(() => {
    if (!activeNode) return [];
    return (floorPlan.edges || []).filter((e) => e.fromNodeId === activeNode.id);
  }, [floorPlan.edges, activeNode]);

  // Hướng đi kèm icon và nhãn trực quan theo 8 phương vị không gian chuẩn xác
  const getDirectionBadge = (dir: FloorPlanEdge['direction']) => {
    switch (dir) {
      case 'left':
        return { label: 'Bên trái (Tây)', icon: <ArrowLeft size={13} /> };
      case 'right':
        return { label: 'Bên phải (Đông)', icon: <ArrowRight size={13} /> };
      case 'front':
      case 'up':
        return { label: 'Phía trước (Bắc)', icon: <ArrowUp size={13} /> };
      case 'down':
        return { label: 'Phía dưới (Nam)', icon: <ArrowDown size={13} /> };
      case 'southwest':
        return { label: 'Phía dưới - Trái (Tây Nam)', icon: <ArrowDownLeft size={13} /> };
      case 'southeast':
        return { label: 'Phía dưới - Phải (Đông Nam)', icon: <ArrowDownRight size={13} /> };
      case 'northwest':
        return { label: 'Phía trên - Trái (Tây Bắc)', icon: <ArrowUpLeft size={13} /> };
      case 'northeast':
        return { label: 'Phía trên - Phải (Đông Bắc)', icon: <ArrowUpRight size={13} /> };
      case 'back':
        return { label: 'Lối quay lại', icon: <RotateCcw size={13} /> };
      default:
        return { label: 'Lối thông', icon: <Navigation size={13} /> };
    }
  };

  // Nhãn ký hiệu vắn tắt hiển thị trên đường nối SVG
  const getDirShortLabel = (dir: FloorPlanEdge['direction']) => {
    switch (dir) {
      case 'left':
        return '← Trái';
      case 'right':
        return 'Phải →';
      case 'front':
      case 'up':
        return '↑ Lên';
      case 'down':
        return '↓ Xuống';
      case 'southwest':
        return '↙ Xuống trái';
      case 'southeast':
        return '↘ Xuống phải';
      case 'northwest':
        return '↖ Lên trái';
      case 'northeast':
        return '↗ Lên phải';
      case 'back':
        return '↶ Quay lại';
      default:
        return '→';
    }
  };

  // Trích xuất số phòng hiển thị gọn gàng (ví dụ P-01 -> 1, P-18 -> 18, SANH -> S)
  const getNodeDisplayNumber = (node: FloorPlanNode, fallbackIndex: number) => {
    const codeMatch = node.code?.match(/\d+/);
    if (codeMatch) return parseInt(codeMatch[0], 10);
    const nameMatch = node.name?.match(/(?:phòng|gian)\s*(\d+)/i);
    if (nameMatch) return parseInt(nameMatch[1], 10);
    return fallbackIndex + 1;
  };

  // Tính toán kích thước hộp gian phòng trong chế độ Sơ đồ khối Topology (Thu nhỏ để thoáng đãng)
  const getTopologyBox = (node: FloorPlanNode) => {
    const width = Math.max(Math.min(node.width || 13, 16), 11);
    const height = Math.max(Math.min(node.height || 8.5, 11), 7.5);
    const rawX = node.x - (width - (node.width || width)) / 2;
    const rawY = node.y - (height - (node.height || height)) / 2;
    const x = Math.max(2, Math.min(rawX, 100 - width - 2));
    const y = Math.max(2, Math.min(rawY, 100 - height - 2));
    return { x, y, width, height };
  };

  // Tính toán tâm của gian phòng để cắm ghim Hotspot trong chế độ Heritage
  const getNodeCenter = (node: FloorPlanNode) => {
    const cx = node.x + (node.width || 8) / 2;
    const cy = node.y + (node.height || 6) / 2;
    return {
      x: Math.max(3, Math.min(97, cx)),
      y: Math.max(3, Math.min(97, cy))
    };
  };

  // Tính toán hình học đường nối chuẩn giữa 2 điểm tâm hoặc 2 mép hộp
  const getEdgeGeometry = (
    fromCenter: { x: number; y: number },
    toCenter: { x: number; y: number },
    marginOffset = 3.2
  ) => {
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return { x1: fromCenter.x, y1: fromCenter.y, x2: toCenter.x, y2: toCenter.y, midX: fromCenter.x, midY: fromCenter.y };

    const ux = dx / dist;
    const uy = dy / dist;

    const x1 = fromCenter.x + ux * marginOffset;
    const y1 = fromCenter.y + uy * marginOffset;
    const x2 = toCenter.x - ux * (marginOffset + 1.2);
    const y2 = toCenter.y - uy * (marginOffset + 1.2);

    return {
      x1,
      y1,
      x2,
      y2,
      midX: (x1 + x2) / 2,
      midY: (y1 + y2) / 2
    };
  };

  const isLight = clientTheme === 'light';

  if (!floorPlan.nodes || floorPlan.nodes.length === 0) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          background: isLight ? '#FFFFFF' : '#111520',
          borderRadius: 14,
          border: `1px dashed ${isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}`,
          color: isLight ? '#64748B' : '#94A3B8'
        }}
      >
        <Building size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5, color: '#C5A059' }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: isLight ? '#0F172A' : '#FFFFFF', marginBottom: 4 }}>
          Chưa bổ sung gian phòng trưng bày
        </div>
        <div style={{ fontSize: 13, maxWidth: 460, margin: '0 auto' }}>
          Sơ đồ mặt bằng sẽ tự động kết nối và hiển thị khi ban quản trị thêm các gian phòng trưng bày vào hệ thống.
        </div>
      </div>
    );
  }

  const resolvedFloorPlanImageUrl = resolveImageUrl(floorPlan.imageUrl);

  return (
    <div
      className="ifp-container"
      style={{
        background: isLight ? '#FFFFFF' : '#111520',
        border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.09)'}`,
        color: isLight ? '#181C26' : '#F1F5F9',
        boxShadow: isLight ? '0 8px 24px rgba(0, 0, 0, 0.05)' : '0 10px 30px rgba(0, 0, 0, 0.35)'
      }}
    >
      {/* Header thanh điều khiển sơ đồ */}
      <div
        className="ifp-header"
        style={{
          borderBottom: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)'}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: isLight ? 'rgba(180, 138, 60, 0.1)' : 'rgba(212, 168, 106, 0.12)',
              border: `1px solid ${isLight ? 'rgba(180, 138, 60, 0.25)' : 'rgba(212, 168, 106, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isLight ? '#8C6826' : '#D4A86A',
              flexShrink: 0
            }}
          >
            <Building size={17} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: isLight ? '#111827' : '#FFFFFF' }}>
              {floorPlan.title || 'Sơ Đồ Mặt Bằng & Vị Trí Các Gian Phòng'}
            </div>
            <div style={{ fontSize: 12, color: isLight ? '#64748B' : '#94A3B8', marginTop: 1 }}>
              {viewMode === 'heritage'
                ? 'Bản đồ kiến trúc trực quan: Bấm vào số phòng hoặc điểm ghim để xem lối đi thực tế'
                : 'Sơ đồ khối liên kết không gian: Xem hướng kết nối giữa các gian trưng bày'}
            </div>
          </div>
        </div>

        {/* Thanh công cụ Chuyển Chế Độ Xem (View Mode Switcher) & Thống kê */}
        <div className="ifp-header-badges" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Bộ nút 3 Chế độ Xem Thoáng đãng */}
          {resolvedFloorPlanImageUrl && (
            <div
              style={{
                display: 'inline-flex',
                background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)',
                padding: 3,
                borderRadius: 7,
                border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)'}`,
                gap: 2
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode('heritage')}
                title="Bản đồ kiến trúc trực quan trên nền bản vẽ di sản thật"
                style={{
                  padding: '5px 10px',
                  borderRadius: 5,
                  fontSize: 12,
                  fontWeight: viewMode === 'heritage' ? 600 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'heritage' ? (isLight ? '#FFFFFF' : '#D4A86A') : 'transparent',
                  color: viewMode === 'heritage' ? (isLight ? '#B45309' : '#0F131D') : (isLight ? '#64748B' : '#CBD5E1'),
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.15s ease',
                  boxShadow: viewMode === 'heritage' ? '0 1px 3px rgba(0, 0, 0, 0.15)' : 'none'
                }}
              >
                <Compass size={13} />
                <span>Bản đồ Di sản</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('topology')}
                title="Sơ đồ khối 2D tinh gọn với không gian thoáng đãng"
                style={{
                  padding: '5px 10px',
                  borderRadius: 5,
                  fontSize: 12,
                  fontWeight: viewMode === 'topology' ? 600 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'topology' ? (isLight ? '#FFFFFF' : '#D4A86A') : 'transparent',
                  color: viewMode === 'topology' ? (isLight ? '#B45309' : '#0F131D') : (isLight ? '#64748B' : '#CBD5E1'),
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.15s ease',
                  boxShadow: viewMode === 'topology' ? '0 1px 3px rgba(0, 0, 0, 0.15)' : 'none'
                }}
              >
                <Layers size={13} />
                <span>Sơ đồ Khối 2D</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('original')}
                title="Xem ảnh bản in gốc"
                style={{
                  padding: '5px 10px',
                  borderRadius: 5,
                  fontSize: 12,
                  fontWeight: viewMode === 'original' ? 600 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: viewMode === 'original' ? (isLight ? '#FFFFFF' : '#D4A86A') : 'transparent',
                  color: viewMode === 'original' ? (isLight ? '#B45309' : '#0F131D') : (isLight ? '#64748B' : '#CBD5E1'),
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.15s ease',
                  boxShadow: viewMode === 'original' ? '0 1px 3px rgba(0, 0, 0, 0.15)' : 'none'
                }}
              >
                <Eye size={13} />
                <span>Bản vẽ gốc</span>
              </button>
            </div>
          )}

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              borderRadius: 6,
              background: isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)'}`,
              fontSize: 11.5,
              fontWeight: 500,
              color: isLight ? '#64748B' : '#94A3B8'
            }}
          >
            <span>{floorPlan.nodes.length} gian phòng</span>
            <span>•</span>
            <span>{floorPlan.edges.length} lối thông phòng</span>
          </div>
        </div>
      </div>

      {/* Khu vực Hiển thị Mặt Bằng */}
      <div className="ifp-grid">
        {/* Canvas Hiển thị Bản đồ */}
        <div
          className="ifp-canvas-card"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            background: isLight ? '#F8FAFC' : '#0B0F19',
            border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
            cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {/* CHẾ ĐỘ 1: BẢN ĐỒ DI SẢN TRỰC QUAN (HERITAGE OVERLAY) - Đột phá không gian thoáng đãng */}
          {viewMode === 'heritage' && resolvedFloorPlanImageUrl && (
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '50% 50%',
                transition: isPanning ? 'none' : 'transform 0.18s ease-out'
              }}
            >
              {/* Lớp 1: Khung chứa ảnh gốc và SVG overlay căn chỉnh 100% hoàn hảo */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Ảnh nền sơ đồ kiến trúc gốc */}
                <img
                  src={resolvedFloorPlanImageUrl}
                  alt={floorPlan.title || 'Sơ đồ mặt bằng'}
                  onLoad={(e) => {
                    const { naturalWidth, naturalHeight } = e.currentTarget;
                    if (naturalWidth && naturalHeight) {
                      setImageRatio(naturalWidth / naturalHeight);
                    }
                  }}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    userSelect: 'none',
                    pointerEvents: 'none',
                    filter: isLight ? 'none' : 'brightness(0.92) contrast(1.05)'
                  }}
                />

                {/* Lớp 2: Lớp SVG tương tác trong suốt nằm đè lên mặt ảnh */}
                <svg
                  viewBox="0 0 100 100"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'auto'
                  }}
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Đầu mũi tên phát sáng vàng neon */}
                    <marker
                      id="heritage-arrow-active"
                      viewBox="0 0 10 10"
                      refX="7"
                      refY="5"
                      markerWidth="4"
                      markerHeight="4"
                      orient="auto"
                    >
                      <path d="M 0 1.5 L 8 5 L 0 8.5 Z" fill="#D4A86A" />
                    </marker>

                    {/* Vòng hào quang phát sáng hoàng gia */}
                    <filter id="gold-glow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="1.2" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* 1. KHUNG HIGHLIGHT GIAN PHÒNG ĐANG CHỌN (Glassmorphic Gold Wash) */}
                  {activeNode && (
                    <g>
                      <rect
                        x={activeNode.x}
                        y={activeNode.y}
                        width={activeNode.width || 12}
                        height={activeNode.height || 8}
                        rx="1.5"
                        fill="rgba(212, 168, 106, 0.22)"
                        stroke="#D4A86A"
                        strokeWidth="0.5"
                        strokeDasharray="1.8, 1.2"
                      />
                    </g>
                  )}

                  {/* 2. CÁC MŨI TÊN CHỈ HƯỚNG TỪ PHÒNG ĐANG CHỌN SANG CÁC PHÒNG KẾ TIẾP */}
                  {activeNode &&
                    connectedEdges.map((edge) => {
                      const targetNode = floorPlan.nodes.find((n) => n.id === edge.toNodeId);
                      if (!targetNode) return null;

                      const cFrom = getNodeCenter(activeNode);
                      const cTo = getNodeCenter(targetNode);
                      const geom = getEdgeGeometry(cFrom, cTo, 2.6);
                      const dirLabel = getDirShortLabel(edge.direction);

                      return (
                        <g
                          key={edge.id}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedNodeId(edge.toNodeId)}
                        >
                          <line
                            x1={geom.x1}
                            y1={geom.y1}
                            x2={geom.x2}
                            y2={geom.y2}
                            stroke="#D4A86A"
                            strokeWidth="0.65"
                            strokeDasharray="2, 1.2"
                            markerEnd="url(#heritage-arrow-active)"
                            filter="url(#gold-glow)"
                          />
                          {/* Nhãn hướng đi nhẹ nhàng trên đường chỉ dẫn */}
                          <g transform={`translate(${geom.midX}, ${geom.midY})`}>
                            <rect
                              x="-4.5"
                              y="-1.3"
                              width="9"
                              height="2.6"
                              rx="0.6"
                              fill="rgba(15, 23, 42, 0.9)"
                              stroke="rgba(212, 168, 106, 0.6)"
                              strokeWidth="0.2"
                            />
                            <text
                              x="0"
                              y="0.5"
                              textAnchor="middle"
                              fontSize="0.95"
                              fontWeight="bold"
                              fill="#FDE68A"
                            >
                              {dirLabel}
                            </text>
                          </g>
                        </g>
                      );
                    })}

                  {/* 3. CÁC ĐIỂM GHIM HERITAGE PIN HOTSPOTS CỦA TẤT CẢ CÁC GIAN PHÒNG */}
                  {floorPlan.nodes.map((node, nodeIdx) => {
                    const isSelected = activeNode?.id === node.id;
                    const isHovered = hoveredNodeId === node.id;
                    const center = getNodeCenter(node);
                    const roomNumber = getNodeDisplayNumber(node, nodeIdx);

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${center.x}, ${center.y})`}
                        onClick={() => setSelectedNodeId(node.id)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Vòng pulse lan tỏa khi phòng được chọn */}
                        {isSelected && (
                          <circle
                            r="3.8"
                            fill="none"
                            stroke="#D4A86A"
                            strokeWidth="0.4"
                            opacity="0.7"
                          >
                            <animate
                              attributeName="r"
                              from="2.4"
                              to="4.5"
                              dur="1.8s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              from="0.9"
                              to="0"
                              dur="1.8s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}

                        {/* Vòng bóng mờ pin */}
                        <circle
                          r={isSelected ? '2.8' : isHovered ? '2.5' : '2.2'}
                          fill={isSelected ? '#D4A86A' : isLight ? '#1E293B' : '#0F172A'}
                          stroke={isSelected ? '#FFFFFF' : '#D4A86A'}
                          strokeWidth={isSelected ? '0.45' : '0.35'}
                          filter={isSelected ? 'url(#gold-glow)' : undefined}
                          style={{ transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        />

                        {/* Con số thứ tự phòng hiển thị trong tâm pin */}
                        <text
                          y="0.8"
                          textAnchor="middle"
                          fill={isSelected ? '#0F172A' : '#F8FAFC'}
                          fontSize={isSelected ? '1.8' : '1.5'}
                          fontWeight="bold"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          {roomNumber}
                        </text>

                        {/* Tooltip nổi tên phòng khi hover */}
                        {isHovered && !isSelected && (
                          <g transform="translate(0, -3.8)">
                            <rect
                              x="-14"
                              y="-2.8"
                              width="28"
                              height="3.6"
                              rx="0.8"
                              fill="rgba(15, 23, 42, 0.95)"
                              stroke="#D4A86A"
                              strokeWidth="0.25"
                            />
                            <text
                              y="-0.4"
                              textAnchor="middle"
                              fill="#FDE68A"
                              fontSize="1.15"
                              fontWeight="600"
                            >
                              {node.name.length > 20 ? node.name.slice(0, 18) + '…' : node.name}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          )}

          {/* CHẾ ĐỘ 2: SƠ ĐỒ KHỐI 2D TINH GỌN (TOPOLOGY) - Không gian thoáng đãng, các khối nhỏ gọn */}
          {viewMode === 'topology' && (
            <svg
              viewBox="0 0 100 100"
              style={{ width: '100%', height: '100%', display: 'block' }}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <marker
                  id="topo-arrow-active"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="3.2"
                  markerHeight="3.2"
                  orient="auto"
                >
                  <path d="M 0 2 L 7 5 L 0 8 Z" fill={isLight ? '#B45309' : '#D4A86A'} />
                </marker>

                <marker
                  id="topo-arrow-default"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="2.5"
                  markerHeight="2.5"
                  orient="auto"
                >
                  <path
                    d="M 0 2.5 L 6 5 L 0 7.5 Z"
                    fill={isLight ? 'rgba(0, 0, 0, 0.22)' : 'rgba(255, 255, 255, 0.25)'}
                  />
                </marker>
              </defs>

              <g
                transform={`translate(${pan.x / 4}, ${pan.y / 4}) scale(${zoom})`}
                style={{
                  transformOrigin: '50% 50%',
                  transition: isPanning ? 'none' : 'transform 0.18s ease-out'
                }}
              >
                {/* Các đường liên kết lối đi thanh mảnh, thoáng đãng */}
                {floorPlan.edges.map((edge) => {
                  const nodeFrom = floorPlan.nodes.find((n) => n.id === edge.fromNodeId);
                  const nodeTo = floorPlan.nodes.find((n) => n.id === edge.toNodeId);
                  if (!nodeFrom || !nodeTo) return null;

                  const isOutgoing = activeNode && edge.fromNodeId === activeNode.id;
                  const isIncoming = activeNode && edge.toNodeId === activeNode.id;
                  const isConnectedToActive = isOutgoing || isIncoming;

                  if (edge.isReturn && !isOutgoing) return null;

                  const boxFrom = getTopologyBox(nodeFrom);
                  const boxTo = getTopologyBox(nodeTo);
                  const c1 = { x: boxFrom.x + boxFrom.width / 2, y: boxFrom.y + boxFrom.height / 2 };
                  const c2 = { x: boxTo.x + boxTo.width / 2, y: boxTo.y + boxTo.height / 2 };
                  const geom = getEdgeGeometry(c1, c2, Math.max(boxFrom.width, boxFrom.height) / 2 + 1.2);
                  const dirLabel = getDirShortLabel(edge.direction);

                  return (
                    <g
                      key={edge.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedNodeId(edge.toNodeId)}
                    >
                      <line
                        x1={geom.x1}
                        y1={geom.y1}
                        x2={geom.x2}
                        y2={geom.y2}
                        stroke={
                          isConnectedToActive
                            ? isLight ? '#B45309' : '#D4A86A'
                            : isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
                        }
                        strokeWidth={isConnectedToActive ? 0.65 : 0.35}
                        strokeDasharray={isConnectedToActive ? '2.2, 1.2' : '1.5, 1.2'}
                        markerEnd={isConnectedToActive ? 'url(#topo-arrow-active)' : 'url(#topo-arrow-default)'}
                        opacity={isConnectedToActive ? 1 : 0.6}
                      />

                      {isOutgoing && dirLabel && (
                        <g transform={`translate(${geom.midX}, ${geom.midY})`}>
                          <rect
                            x="-4"
                            y="-1.3"
                            width="8"
                            height="2.6"
                            rx="0.6"
                            fill={isLight ? '#FFFFFF' : '#141A29'}
                            stroke={isLight ? 'rgba(180, 83, 9, 0.4)' : 'rgba(212, 168, 106, 0.5)'}
                            strokeWidth="0.2"
                          />
                          <text
                            x="0"
                            y="0.5"
                            textAnchor="middle"
                            fontSize="0.95"
                            fontWeight="bold"
                            fill={isLight ? '#B45309' : '#D4A86A'}
                          >
                            {dirLabel}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Các Gian phòng nhỏ gọn, để hở không gian hành lang và sân vườn rộng rãi */}
                {floorPlan.nodes.map((node, nodeIdx) => {
                  const isSelected = activeNode?.id === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const box = getTopologyBox(node);
                  const roomNumber = getNodeDisplayNumber(node, nodeIdx);

                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Khối gian phòng */}
                      <rect
                        x={box.x}
                        y={box.y}
                        width={box.width}
                        height={box.height}
                        rx="1.5"
                        fill={
                          isSelected
                            ? isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(28, 38, 58, 0.95)'
                            : isHovered
                            ? isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(22, 30, 46, 0.9)'
                            : isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(17, 24, 38, 0.82)'
                        }
                        stroke={
                          isSelected
                            ? isLight ? '#B45309' : '#D4A86A'
                            : isHovered
                            ? isLight ? '#94A3B8' : '#64748B'
                            : isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.14)'
                        }
                        strokeWidth={isSelected ? 0.7 : 0.3}
                      />

                      {/* Huy hiệu số phòng */}
                      <circle
                        cx={box.x + 2.4}
                        cy={box.y + 2.4}
                        r="1.4"
                        fill={isSelected ? (isLight ? '#B45309' : '#D4A86A') : isLight ? '#E2E8F0' : '#2D3748'}
                      />
                      <text
                        x={box.x + 2.4}
                        y={box.y + 2.9}
                        fill={isSelected ? '#FFFFFF' : isLight ? '#334155' : '#CBD5E1'}
                        fontSize="1.15"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {roomNumber}
                      </text>

                      {/* Mã phòng vắn tắt */}
                      <text
                        x={box.x + box.width - 1.2}
                        y={box.y + 2.8}
                        fill={isSelected ? (isLight ? '#B45309' : '#D4A86A') : isLight ? '#64748B' : '#94A3B8'}
                        fontSize="0.95"
                        fontWeight="bold"
                        textAnchor="end"
                      >
                        {node.code}
                      </text>

                      {/* Tên gian phòng 1 dòng gọn gàng */}
                      <text
                        x={box.x + box.width / 2}
                        y={box.y + box.height - 2.0}
                        fill={isSelected ? (isLight ? '#0F172A' : '#FFFFFF') : isLight ? '#334155' : '#E2E8F0'}
                        fontSize="1.1"
                        fontWeight={isSelected ? 'bold' : '500'}
                        textAnchor="middle"
                      >
                        {node.name.length > 13 ? node.name.slice(0, 11) + '…' : node.name}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          )}

          {/* CHẾ ĐỘ 3: ẢNH GỐC NGUYÊN BẢN */}
          {viewMode === 'original' && resolvedFloorPlanImageUrl && (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '50% 50%',
                transition: isPanning ? 'none' : 'transform 0.18s ease-out'
              }}
            >
              <img
                src={resolvedFloorPlanImageUrl}
                alt="Floor Plan Source"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          )}

          {/* Chỉ báo phương vị Bắc chuẩn kiến trúc & La bàn thực địa */}
          <div
            className="ifp-compass-badge"
            title={floorPlan.compassOrientation?.description || 'Hướng Bắc thực địa'}
          >
            <Compass
              size={13}
              style={{
                transform: `rotate(${floorPlan.compassOrientation?.northAngleDeg || 0}deg)`,
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
            <span className="ifp-compass-text">
              {floorPlan.compassOrientation?.detected && floorPlan.compassOrientation.northAngleDeg !== 0
                ? `Hướng Bắc (${floorPlan.compassOrientation.northAngleDeg > 0 ? '+' : ''}${floorPlan.compassOrientation.northAngleDeg}°)`
                : 'Hướng Bắc (N)'}
            </span>
          </div>

          {/* Bộ công cụ Phóng to / Thu nhỏ / Reset nhanh ngay trên bản đồ */}
          <div className="ifp-canvas-controls">
            <button
              type="button"
              className="ifp-ctrl-btn"
              onClick={handleZoomIn}
              title="Phóng to sơ đồ"
              aria-label="Zoom in"
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              className="ifp-ctrl-btn"
              onClick={handleZoomOut}
              title="Thu nhỏ sơ đồ"
              aria-label="Zoom out"
              disabled={zoom <= 1}
              style={{ opacity: zoom <= 1 ? 0.4 : 1 }}
            >
              <ZoomOut size={14} />
            </button>
            {zoom > 1 && (
              <button
                type="button"
                className="ifp-ctrl-btn"
                onClick={handleResetZoom}
                title="Về tỉ lệ ban đầu"
                aria-label="Reset zoom"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Panel Chi Tiết Gian Phòng Đang Chọn */}
        <div
          className="ifp-details-card"
          style={{
            background: isLight ? '#F8FAFC' : '#0E131F',
            border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`
          }}
        >
          {activeNode ? (
            <div>
              {/* Mã & Phân loại nhẹ nhàng */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(212, 168, 106, 0.15)',
                    color: isLight ? '#334155' : '#D4A86A',
                    fontSize: 11,
                    fontWeight: 700
                  }}
                >
                  {activeNode.code}
                </span>
                <span style={{ fontSize: 12, color: isLight ? '#64748B' : '#94A3B8' }}>
                  {activeNode.category || 'Gian Trưng Bày'}
                </span>
              </div>

              {/* Tên gian phòng */}
              <h3
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: isLight ? '#0F172A' : '#FFFFFF',
                  margin: '0 0 4px 0',
                  lineHeight: 1.35
                }}
              >
                {activeNode.name}
              </h3>

              {/* Phân kỳ lịch sử */}
              <div style={{ fontSize: 12.5, color: isLight ? '#64748B' : '#94A3B8', marginBottom: 16 }}>
                {activeNode.period || 'Hiện vật trưng bày lịch sử'}
              </div>

              {/* Các lối đi thông sang phòng liền kề */}
              <div
                style={{
                  borderTop: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)'}`,
                  paddingTop: 12
                }}
              >
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: isLight ? '#475569' : '#CBD5E1',
                    marginBottom: 10
                  }}
                >
                  Lối đi sang các phòng kế tiếp ({connectedEdges.length}):
                </div>

                {connectedEdges.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                    {connectedEdges.map((edge) => {
                      const targetNode = floorPlan.nodes.find((n) => n.id === edge.toNodeId);
                      const badge = getDirectionBadge(edge.direction);
                      const targetName = targetNode ? targetNode.name : edge.targetRoomName || 'Gian kế tiếp';

                      return (
                        <div
                          key={edge.id}
                          onClick={() => setSelectedNodeId(edge.toNodeId)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.03)',
                            border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)'}`,
                            borderRadius: 6,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = isLight ? '#F1F5F9' : 'rgba(255, 255, 255, 0.07)';
                            e.currentTarget.style.borderColor = 'rgba(212, 168, 106, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.03)';
                            e.currentTarget.style.borderColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: '#C5A059', display: 'flex', flexShrink: 0 }}>
                              {badge.icon}
                            </span>
                            <div>
                              <div style={{ fontSize: 10, color: isLight ? '#64748B' : '#94A3B8' }}>
                                {badge.label}
                              </div>
                              <div
                                style={{
                                  fontSize: 12.5,
                                  fontWeight: 600,
                                  color: isLight ? '#1E293B' : '#F1F5F9'
                                }}
                              >
                                {targetName}
                              </div>
                            </div>
                          </div>
                          <ArrowRight size={13} style={{ color: isLight ? '#94A3B8' : '#64748B', flexShrink: 0 }} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: isLight ? '#64748B' : '#94A3B8', fontStyle: 'italic' }}>
                    Khu vực tiếp đón hoặc kết nối qua hành lang chính
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: isLight ? '#64748B' : '#94A3B8' }}>
              <Info size={22} style={{ margin: '0 auto 6px auto', opacity: 0.6 }} />
              <div>Bấm vào một gian phòng trên sơ đồ để xem thông tin</div>
            </div>
          )}

          {/* Nút Khám Phá Tour 360° */}
          <div>
            {activeNode?.roomId && onSelectRoom360 ? (
              <button
                type="button"
                onClick={() => onSelectRoom360(activeNode.roomId!)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  background: '#C5A059',
                  color: '#0F131D',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#D4AF37'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#C5A059'; }}
              >
                <Eye size={15} />
                <span>Vào tham quan 360° phòng này</span>
              </button>
            ) : (
              <div
                style={{
                  fontSize: 11.5,
                  textAlign: 'center',
                  color: isLight ? '#64748B' : '#94A3B8',
                  background: isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.02)',
                  padding: '8px',
                  borderRadius: 6
                }}
              >
                Khu vực trung tâm đón tiếp và phân luồng tham quan
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
