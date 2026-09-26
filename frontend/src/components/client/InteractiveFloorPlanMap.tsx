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
  ExternalLink,
  Trees
} from 'lucide-react';
import { FloorPlanMap, FloorPlanNode, FloorPlanEdge } from '../../types';
import './interactiveFloorPlanMap.css';

interface InteractiveFloorPlanMapProps {
  floorPlan: FloorPlanMap;
  onSelectRoom360?: (roomId: string) => void;
  clientTheme?: 'light' | 'dark';
  hideSidePanel?: boolean;
  selectedNodeId?: string;
  onNodeSelect?: (nodeId: string) => void;
}

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
  clientTheme = 'dark',
  hideSidePanel = false,
  selectedNodeId: externalSelectedNodeId,
  onNodeSelect
}) => {
  const [internalSelectedNodeId, setInternalSelectedNodeId] = useState<string>(
    externalSelectedNodeId || floorPlan.nodes?.[0]?.id || ''
  );
  const selectedNodeId = externalSelectedNodeId || internalSelectedNodeId;
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [showOriginalModal, setShowOriginalModal] = useState<boolean>(false);

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

  // Đồng bộ node đang chọn khi dữ liệu hoặc prop từ ngoài thay đổi
  useEffect(() => {
    if (externalSelectedNodeId) {
      setInternalSelectedNodeId(externalSelectedNodeId);
    } else if (floorPlan.nodes?.length) {
      if (!floorPlan.nodes.some((n) => n.id === internalSelectedNodeId)) {
        setInternalSelectedNodeId(floorPlan.nodes[0].id);
      }
    }
  }, [floorPlan.nodes, externalSelectedNodeId]);

  // Node đang chọn
  const activeNode = useMemo(() => {
    return floorPlan.nodes?.find((n) => n.id === selectedNodeId) || floorPlan.nodes?.[0];
  }, [floorPlan.nodes, selectedNodeId]);

  // Các liên kết cửa đi ra từ node đang chọn (outgoing doors)
  const connectedEdges = useMemo(() => {
    if (!activeNode) return [];
    return (floorPlan.edges || []).filter((e) => e.fromNodeId === activeNode.id);
  }, [floorPlan.edges, activeNode]);

  // Hướng đi kèm icon và nhãn trực quan
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

  // Trích xuất số phòng hiển thị gọn gàng (P-01 -> 1)
  const getNodeDisplayNumber = (node: FloorPlanNode, fallbackIndex: number) => {
    const codeMatch = node.code?.match(/\d+/);
    if (codeMatch) return parseInt(codeMatch[0], 10);
    const nameMatch = node.name?.match(/(?:phòng|gian)\s*(\d+)/i);
    if (nameMatch) return parseInt(nameMatch[1], 10);
    return fallbackIndex + 1;
  };

  // Rút gọn tên phòng để hiển thị tinh gọn 1 dòng trên sơ đồ 2D
  const getShortNodeName = (name: string) => {
    const clean = (name || '').trim();
    if (!clean) return 'Gian phòng';
    if (clean.length <= 16) return clean;
    return clean.slice(0, 15) + '…';
  };

  // Tính toán hộp gian phòng trên sơ đồ 2D (tôn trọng chính xác tỷ lệ và vị trí của từng phòng)
  const getNodeBox = (node: FloorPlanNode) => {
    const width = node.width && node.width > 0 ? node.width : 14;
    const height = node.height && node.height > 0 ? node.height : 7.5;
    const x = typeof node.x === 'number' ? node.x : 0;
    const y = typeof node.y === 'number' ? node.y : 0;
    return { x, y, width, height };
  };

  // Tính toán hình học đường nối giữa 2 phòng (tìm giao điểm chính xác với viền hộp chữ nhật)
  const getEdgeGeometry = (
    boxFrom: { x: number; y: number; width: number; height: number },
    boxTo: { x: number; y: number; width: number; height: number }
  ) => {
    const c1x = boxFrom.x + boxFrom.width / 2;
    const c1y = boxFrom.y + boxFrom.height / 2;
    const c2x = boxTo.x + boxTo.width / 2;
    const c2y = boxTo.y + boxTo.height / 2;

    const dx = c2x - c1x;
    const dy = c2y - c1y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return { x1: c1x, y1: c1y, x2: c2x, y2: c2y, midX: c1x, midY: c1y };

    const hw1 = boxFrom.width / 2;
    const hh1 = boxFrom.height / 2;
    const hw2 = boxTo.width / 2;
    const hh2 = boxTo.height / 2;

    // Giao điểm tia nối với viền của boxFrom
    const scale1 = Math.min(
      dx !== 0 ? Math.abs(hw1 / dx) : Infinity,
      dy !== 0 ? Math.abs(hh1 / dy) : Infinity
    );
    const p1x = c1x + dx * scale1;
    const p1y = c1y + dy * scale1;

    // Giao điểm tia nối với viền của boxTo
    const scale2 = Math.min(
      dx !== 0 ? Math.abs(hw2 / dx) : Infinity,
      dy !== 0 ? Math.abs(hh2 / dy) : Infinity
    );
    const p2x = c2x - dx * scale2;
    const p2y = c2y - dy * scale2;

    const gap = Math.hypot(p2x - p1x, p2y - p1y);
    const ux = (p2x - p1x) / (gap || 1);
    const uy = (p2y - p1y) / (gap || 1);

    // Chừa khoảng hở 1.1% cho chóp mũi tên không bị chọc lấn vào trong lòng boxTo
    const x1 = p1x + ux * 0.2;
    const y1 = p1y + uy * 0.2;
    const x2 = gap > 1.8 ? p2x - ux * 1.1 : p2x;
    const y2 = gap > 1.8 ? p2y - uy * 1.1 : p2y;

    return {
      x1,
      y1,
      x2,
      y2,
      midX: (p1x + p2x) / 2,
      midY: (p1y + p2y) / 2
    };
  };

  const isLight = clientTheme === 'light';
  const resolvedFloorPlanImageUrl = resolveImageUrl(floorPlan.imageUrl);

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

  return (
    <div
      className="ifp-container"
      style={{
        background: isLight ? '#FFFFFF' : '#0F141F',
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
              {floorPlan.title || 'Sơ Đồ Mặt Bằng Các Gian Trưng Bày'}
            </div>
            <div style={{ fontSize: 12, color: isLight ? '#64748B' : '#94A3B8', marginTop: 1 }}>
              Bản đồ 2D kiến trúc trực quan: Chọn từng gian phòng để xem hướng di chuyển và liên kết tour thực tế
            </div>
          </div>
        </div>

        {/* Nút Xem Ảnh Gốc & Badge Thống Kê */}
        <div className="ifp-header-badges" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {resolvedFloorPlanImageUrl && (
            <button
              type="button"
              onClick={() => setShowOriginalModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
                border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.12)'}`,
                color: isLight ? '#475569' : '#CBD5E1',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Eye size={13} />
              <span>Xem ảnh sơ đồ gốc</span>
            </button>
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
            <span>{floorPlan.nodes.length} gian trưng bày</span>
            <span>•</span>
            <span>{floorPlan.edges.length} lối thông phòng</span>
          </div>
        </div>
      </div>

      {/* Khu vực Hiển thị Mặt Bằng */}
      <div className="ifp-grid" style={hideSidePanel ? { display: 'block', gridTemplateColumns: '1fr' } : undefined}>
        {/* Canvas Sơ Đồ 2D Kiến Trúc Thoáng Đãng */}
        <div
          className="ifp-canvas-card"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            background: isLight ? '#F8FAFC' : '#0B0F18',
            border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
            cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
            position: 'relative'
          }}
        >
          <svg
            viewBox="0 0 100 100"
            style={{ width: '100%', height: '100%', display: 'block' }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Lưới tọa độ kiến trúc mờ tinh tế */}
              <pattern id="arch-grid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path
                  d="M 5 0 L 0 0 0 5"
                  fill="none"
                  stroke={isLight ? 'rgba(0, 0, 0, 0.035)' : 'rgba(255, 255, 255, 0.025)'}
                  strokeWidth="0.2"
                />
              </pattern>

              {/* Mũi tên chỉ hướng lối đi phòng đang chọn */}
              <marker
                id="edge-arrow-active"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="3.2"
                markerHeight="3.2"
                orient="auto"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 Z" fill={isLight ? '#B45309' : '#D4A86A'} />
              </marker>

              {/* Mũi tên mặc định rõ nét hơn */}
              <marker
                id="edge-arrow-default"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="2.5"
                markerHeight="2.5"
                orient="auto"
              >
                <path
                  d="M 0 1.5 L 7 5 L 0 8.5 Z"
                  fill={isLight ? 'rgba(0, 0, 0, 0.35)' : 'rgba(255, 255, 255, 0.38)'}
                />
              </marker>
            </defs>

            {/* Nền Grid */}
            <rect width="100" height="100" fill="url(#arch-grid)" />

            <g
              transform={`translate(${pan.x / 4}, ${pan.y / 4}) scale(${zoom})`}
              style={{
                transformOrigin: '50% 50%',
                transition: isPanning ? 'none' : 'transform 0.18s ease-out'
              }}
            >
              {/* 1. KHU VỰC SÂN VƯỜN NỘI VIỆN (COURTYARD GARDEN) - Nằm chính giữa chữ U thoáng đãng */}
              <g>
                <rect
                  x="42"
                  y="21"
                  width="29"
                  height="18"
                  rx="2"
                  fill={isLight ? 'rgba(34, 197, 94, 0.09)' : 'rgba(34, 197, 94, 0.08)'}
                  stroke={isLight ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.22)'}
                  strokeWidth="0.3"
                  strokeDasharray="1, 1"
                />
                <circle cx="56.5" cy="30" r="3.4" fill={isLight ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.12)'} />
                <text
                  x="56.5"
                  y="29.6"
                  textAnchor="middle"
                  fill={isLight ? '#15803D' : '#4ADE80'}
                  fontSize="1.15"
                  fontWeight="600"
                >
                  🌿 SÂN VƯỜN NỘI VIỆN
                </text>
                <text
                  x="56.5"
                  y="31.8"
                  textAnchor="middle"
                  fill={isLight ? '#16A34A' : '#86EFAC'}
                  fontSize="0.8"
                  opacity="0.85"
                >
                  Thảm cỏ & Hồ rối nước
                </text>
              </g>

              {/* 2. CỔNG 1 (LỐI VÀO CHÍNH - NAM) */}
              <g>
                <rect
                  x="46"
                  y="87"
                  width="8"
                  height="6"
                  rx="1.2"
                  fill={isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)'}
                  stroke={isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'}
                  strokeWidth="0.3"
                />
                <text
                  x="50"
                  y="90.2"
                  textAnchor="middle"
                  fill={isLight ? '#475569' : '#CBD5E1'}
                  fontSize="1.15"
                  fontWeight="bold"
                >
                  CỔNG 1
                </text>
                <text
                  x="50"
                  y="91.8"
                  textAnchor="middle"
                  fill={isLight ? '#64748B' : '#94A3B8'}
                  fontSize="0.75"
                >
                  Lối vào chính (Gate 1)
                </text>
                <line
                  x1="50"
                  y1="86.8"
                  x2="50"
                  y2="84.2"
                  stroke="#D4A86A"
                  strokeWidth="0.4"
                  strokeDasharray="1, 0.8"
                />
              </g>

              {/* 3. CỔNG 2 & QUẦY VÉ (TÂY) */}
              <g>
                <rect
                  x="9"
                  y="28"
                  width="12"
                  height="8"
                  rx="1.2"
                  fill="rgba(234, 88, 12, 0.08)"
                  stroke="rgba(234, 88, 12, 0.3)"
                  strokeWidth="0.3"
                />
                <text
                  x="15"
                  y="32.0"
                  textAnchor="middle"
                  fill={isLight ? '#C2410C' : '#FB923C'}
                  fontSize="1.1"
                  fontWeight="bold"
                >
                  CỔNG 2
                </text>
                <text
                  x="15"
                  y="33.8"
                  textAnchor="middle"
                  fill={isLight ? '#EA580C' : '#FDBA74'}
                  fontSize="0.75"
                >
                  Quầy vé (Ticket)
                </text>
              </g>

              {/* 4. SẢNH TRUNG TÂM (CHUYÊN ĐỀ NGẮN HẠN / BÁT GIÁC) */}
              <g>
                <circle
                  cx="50"
                  cy="66.5"
                  r="5.5"
                  fill={isLight ? 'rgba(212, 168, 106, 0.15)' : 'rgba(212, 168, 106, 0.12)'}
                  stroke="#D4A86A"
                  strokeWidth="0.4"
                  strokeDasharray="1.2, 0.8"
                />
                <text
                  x="50"
                  y="66.0"
                  textAnchor="middle"
                  fill={isLight ? '#B45309' : '#D4A86A'}
                  fontSize="0.95"
                  fontWeight="bold"
                >
                  SẢNH
                </text>
                <text
                  x="50"
                  y="67.8"
                  textAnchor="middle"
                  fill={isLight ? '#B45309' : '#FDE68A'}
                  fontSize="0.75"
                >
                  Bát Giác
                </text>
              </g>

              {/* 5. CÁC ĐƯỜNG KẾT NỐI (EDGES) - Thanh mảnh, chỉ sáng rực cho phòng đang chọn */}
              {floorPlan.edges.map((edge) => {
                const nodeFrom = floorPlan.nodes.find((n) => n.id === edge.fromNodeId);
                const nodeTo = floorPlan.nodes.find((n) => n.id === edge.toNodeId);
                if (!nodeFrom || !nodeTo) return null;

                const isOutgoing = activeNode && edge.fromNodeId === activeNode.id;
                const isIncoming = activeNode && edge.toNodeId === activeNode.id;
                const isConnectedToActive = isOutgoing || isIncoming;

                if (edge.isReturn && !isOutgoing) return null;

                const boxFrom = getNodeBox(nodeFrom);
                const boxTo = getNodeBox(nodeTo);
                const geom = getEdgeGeometry(boxFrom, boxTo);
                const dirLabel = getDirShortLabel(edge.direction);

                return (
                  <g
                    key={edge.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setInternalSelectedNodeId(edge.toNodeId);
                      onNodeSelect?.(edge.toNodeId);
                    }}
                  >
                    <line
                      x1={geom.x1}
                      y1={geom.y1}
                      x2={geom.x2}
                      y2={geom.y2}
                      stroke={
                        isConnectedToActive
                          ? isLight ? '#B45309' : '#D4A86A'
                          : isLight ? 'rgba(0, 0, 0, 0.28)' : 'rgba(255, 255, 255, 0.32)'
                      }
                      strokeWidth={isConnectedToActive ? 0.75 : 0.36}
                      strokeDasharray={isConnectedToActive ? '2.2, 1.2' : '1.4, 1.4'}
                      markerEnd={isConnectedToActive ? 'url(#edge-arrow-active)' : 'url(#edge-arrow-default)'}
                      opacity={isConnectedToActive ? 1 : 0.65}
                    />

                    {/* Nhãn hướng đi trên đường nối khi phòng đang chọn */}
                    {isOutgoing && dirLabel && (
                      <g transform={`translate(${geom.midX}, ${geom.midY})`}>
                        <rect
                          x="-3.8"
                          y="-1.2"
                          width="7.6"
                          height="2.4"
                          rx="0.5"
                          fill={isLight ? '#FFFFFF' : '#141A29'}
                          stroke={isLight ? 'rgba(180, 83, 9, 0.4)' : 'rgba(212, 168, 106, 0.5)'}
                          strokeWidth="0.2"
                        />
                        <text
                          x="0"
                          y="0.45"
                          textAnchor="middle"
                          fontSize="0.85"
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

              {/* 6. CÁC GIAN PHÒNG (NODES) - Rộng rãi, thoáng đãng, sắc nét */}
              {floorPlan.nodes.map((node, nodeIdx) => {
                const isSelected = activeNode?.id === node.id;
                const isHovered = hoveredNodeId === node.id;
                const box = getNodeBox(node);
                const roomNumber = getNodeDisplayNumber(node, nodeIdx);
                const shortName = getShortNodeName(node.name);

                return (
                  <g
                    key={node.id}
                    onClick={() => {
                      setInternalSelectedNodeId(node.id);
                      onNodeSelect?.(node.id);
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  >
                    {/* Hộp phòng */}
                    <rect
                      x={box.x}
                      y={box.y}
                      width={box.width}
                      height={box.height}
                      rx="1.5"
                      fill={
                        isSelected
                          ? isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(28, 38, 58, 0.96)'
                          : isHovered
                          ? isLight ? 'rgba(248, 250, 252, 0.95)' : 'rgba(20, 28, 42, 0.92)'
                          : isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(16, 22, 34, 0.84)'
                      }
                      stroke={
                        isSelected
                          ? isLight ? '#B45309' : '#D4A86A'
                          : isHovered
                          ? isLight ? '#94A3B8' : '#64748B'
                          : isLight ? 'rgba(0, 0, 0, 0.14)' : 'rgba(255, 255, 255, 0.13)'
                      }
                      strokeWidth={isSelected ? 0.75 : 0.3}
                    />

                    {/* Vòng pulse sáng hoàng gia khi chọn */}
                    {isSelected && (
                      <rect
                        x={box.x - 0.4}
                        y={box.y - 0.4}
                        width={box.width + 0.8}
                        height={box.height + 0.8}
                        rx="1.9"
                        fill="none"
                        stroke="#D4A86A"
                        strokeWidth="0.25"
                        opacity="0.4"
                      />
                    )}

                    {/* Badge số phòng tròn góc trái (hoặc giữa nếu phòng hẹp) */}
                    <circle
                      cx={box.width < 9 ? box.x + box.width / 2 : box.x + 2.3}
                      cy={box.width < 9 ? box.y + 2.4 : box.y + 2.3}
                      r="1.35"
                      fill={isSelected ? (isLight ? '#B45309' : '#D4A86A') : isLight ? '#E2E8F0' : '#283446'}
                    />
                    <text
                      x={box.width < 9 ? box.x + box.width / 2 : box.x + 2.3}
                      y={box.width < 9 ? box.y + 2.85 : box.y + 2.8}
                      fill={isSelected ? '#FFFFFF' : isLight ? '#334155' : '#CBD5E1'}
                      fontSize={box.width < 9 ? '0.95' : '1.05'}
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {roomNumber}
                    </text>

                    {/* Mã phòng vắn tắt góc phải (chỉ hiện khi phòng đủ rộng >= 10 và chưa có badge) */}
                    {box.width >= 10 && !node.roomId && (
                      <text
                        x={box.x + box.width - 1.2}
                        y={box.y + 2.7}
                        fill={isSelected ? (isLight ? '#B45309' : '#D4A86A') : isLight ? '#64748B' : '#94A3B8'}
                        fontSize="0.8"
                        fontWeight="bold"
                        textAnchor="end"
                      >
                        {node.code}
                      </text>
                    )}

                    {/* Chỉ báo phòng đã gắn không gian 360° & Voice */}
                    {node.roomId && (
                      <g transform={`translate(${box.x + box.width - 3.4}, ${box.y + 1.2})`}>
                        <rect
                          width="2.6"
                          height="1.4"
                          rx="0.4"
                          fill="#059669"
                        />
                        <text
                          x="1.3"
                          y="1.05"
                          fill="#FFFFFF"
                          fontSize="0.68"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          360°
                        </text>
                      </g>
                    )}

                    {/* Tên gian phòng căn giữa */}
                    <text
                      x={box.x + box.width / 2}
                      y={box.height > 12 ? box.y + box.height / 2 + 1.2 : box.y + box.height - 1.8}
                      fill={isSelected ? (isLight ? '#0F172A' : '#FFFFFF') : isLight ? '#334155' : '#E2E8F0'}
                      fontSize={box.width < 9 ? '0.85' : '0.95'}
                      fontWeight={isSelected ? 'bold' : '500'}
                      textAnchor="middle"
                    >
                      {shortName}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Chỉ báo La Bàn Hướng Bắc */}
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

          {/* Bộ công cụ Zoom & Pan */}
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
        {!hideSidePanel && (
          <div
            className="ifp-details-card"
            style={{
              background: isLight ? '#F8FAFC' : '#0B0F19',
              border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`
            }}
          >
          {activeNode ? (
            <div>
              {/* Mã phòng & Phân loại */}
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

              {/* Lối đi sang các phòng kế tiếp */}
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
                          onClick={() => {
                            setInternalSelectedNodeId(edge.toNodeId);
                            onNodeSelect?.(edge.toNodeId);
                          }}
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
        )}
      </div>

      {/* Modal Xem Ảnh Sơ Đồ Gốc Phóng To */}
      {showOriginalModal && resolvedFloorPlanImageUrl && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
          onClick={() => setShowOriginalModal(false)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              background: '#0B0F19',
              borderRadius: 12,
              padding: 12,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>
                Ảnh sơ đồ mặt bằng gốc
              </span>
              <button
                type="button"
                onClick={() => setShowOriginalModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 700,
                  padding: '2px 8px'
                }}
              >
                ✕
              </button>
            </div>
            <img
              src={resolvedFloorPlanImageUrl}
              alt="Bản vẽ gốc"
              style={{
                maxWidth: '85vw',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: 8
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
