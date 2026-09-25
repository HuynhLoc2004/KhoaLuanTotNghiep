import React, { useState, useMemo } from 'react';
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
  Building
} from 'lucide-react';
import { FloorPlanMap, FloorPlanNode, FloorPlanEdge } from '../../types';

interface InteractiveFloorPlanMapProps {
  floorPlan: FloorPlanMap;
  onSelectRoom360?: (roomId: string) => void;
  clientTheme?: 'light' | 'dark';
}

export const InteractiveFloorPlanMap: React.FC<InteractiveFloorPlanMapProps> = ({
  floorPlan,
  onSelectRoom360,
  clientTheme = 'dark'
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    floorPlan.nodes?.[0]?.id || ''
  );
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [showOriginalImage, setShowOriginalImage] = useState<boolean>(false);

  // Tự động đồng bộ node được chọn khi danh sách phòng từ MongoDB thay đổi
  React.useEffect(() => {
    if (floorPlan.nodes?.length) {
      if (!floorPlan.nodes.some((n) => n.id === selectedNodeId)) {
        setSelectedNodeId(floorPlan.nodes[0].id);
      }
    }
  }, [floorPlan.nodes, selectedNodeId]);

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

  // Nhãn ký hiệu vắn tắt hiển thị trực tiếp trên đường nối SVG
  const getDirShortLabel = (dir: FloorPlanEdge['direction']) => {
    switch (dir) {
      case 'left':
        return '← Trái';
      case 'right':
        return 'Phải →';
      case 'front':
      case 'up':
        return '↑ Thẳng';
      case 'down':
        return '↓ Dưới';
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

  // Hiển thị tên gian phòng thật do Admin thêm, tự động ngắt 2 dòng cân đối, TUYỆT ĐỐI không tràn chữ ra ngoài
  const getMapNodeLabel = (node: FloorPlanNode) => {
    const raw = (node.name || '').trim();
    if (!raw) return { line1: node.code || 'Phòng', line2: '' };
    if (raw.length <= 16) {
      return { line1: raw, line2: '' };
    }

    const words = raw.split(/\s+/);
    if (words.length <= 1) {
      return { line1: raw.slice(0, 14) + '…', line2: '' };
    }

    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(' ');
    const line2 = words.slice(mid).join(' ');
    return {
      line1: line1.length > 18 ? line1.slice(0, 16) + '…' : line1,
      line2: line2.length > 18 ? line2.slice(0, 16) + '…' : line2
    };
  };

  // Tính toán kích thước hộp gian phòng đảm bảo vừa chữ, không bị tràn ra ngoài biên sơ đồ
  const getNodeBox = (node: FloorPlanNode) => {
    const width = Math.max(Math.min(node.width || 22, 28), 20);
    const height = Math.max(Math.min(node.height || 16, 22), 14);
    const rawX = node.x - (width - (node.width || width)) / 2;
    const rawY = node.y - (height - (node.height || height)) / 2;
    const x = Math.max(3, Math.min(rawX, 100 - width - 3));
    const y = Math.max(3, Math.min(rawY, 100 - height - 3));
    return { x, y, width, height };
  };

  // Tính toán hình học đường nối chuẩn mép ngoài hộp phòng (Edge-to-Edge Clipping)
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
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return { x1: c1x, y1: c1y, x2: c2x, y2: c2y, midX: c1x, midY: c1y, angle: 0 };

    const ux = dx / dist;
    const uy = dy / dist;

    // Giao điểm với mép ngoài boxFrom
    const hw1 = boxFrom.width / 2;
    const hh1 = boxFrom.height / 2;
    const t1 = Math.min(
      Math.abs(ux) > 0.0001 ? hw1 / Math.abs(ux) : Infinity,
      Math.abs(uy) > 0.0001 ? hh1 / Math.abs(uy) : Infinity
    );

    // Giao điểm với mép ngoài boxTo
    const hw2 = boxTo.width / 2;
    const hh2 = boxTo.height / 2;
    const t2 = Math.min(
      Math.abs(ux) > 0.0001 ? hw2 / Math.abs(ux) : Infinity,
      Math.abs(uy) > 0.0001 ? hh2 / Math.abs(uy) : Infinity
    );

    const x1 = c1x + t1 * ux;
    const y1 = c1y + t1 * uy;
    // Chóp mũi tên dừng cách mép đích 2.4% để hiển thị trọn vẹn và đẹp mắt
    const marginEnd = 2.4;
    const x2 = c2x - (t2 + marginEnd) * ux;
    const y2 = c2y - (t2 + marginEnd) * uy;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return { x1, y1, x2, y2, midX, midY, angle };
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

  return (
    <div
      className="interactive-floorplan-container"
      style={{
        background: isLight ? '#FFFFFF' : '#111520',
        border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.09)'}`,
        borderRadius: 14,
        padding: '20px',
        color: isLight ? '#181C26' : '#F1F5F9',
        boxShadow: isLight ? '0 8px 24px rgba(0, 0, 0, 0.05)' : '0 10px 30px rgba(0, 0, 0, 0.35)',
        position: 'relative'
      }}
    >
      {/* Header thanh điều khiển sơ đồ */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 16,
          borderBottom: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)'}`,
          paddingBottom: 14
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: isLight ? 'rgba(180, 138, 60, 0.1)' : 'rgba(212, 168, 106, 0.12)',
              border: `1px solid ${isLight ? 'rgba(180, 138, 60, 0.25)' : 'rgba(212, 168, 106, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isLight ? '#8C6826' : '#D4A86A'
            }}
          >
            <Building size={16} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: isLight ? '#111827' : '#FFFFFF' }}>
              Sơ Đồ Mặt Bằng & Vị Trí Các Gian Phòng
            </div>
            <div style={{ fontSize: 12, color: isLight ? '#64748B' : '#94A3B8', marginTop: 1 }}>
              Bấm vào từng gian phòng trên sơ đồ để xem vị trí, lối đi và kết nối thực tế
            </div>
          </div>
        </div>

        {/* Nút chuyển chế độ xem */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {floorPlan.imageUrl && (
            <button
              type="button"
              onClick={() => setShowOriginalImage(!showOriginalImage)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                background: showOriginalImage
                  ? isLight ? 'rgba(180, 138, 60, 0.15)' : 'rgba(212, 168, 106, 0.15)'
                  : isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.12)'}`,
                color: showOriginalImage ? (isLight ? '#8C6826' : '#D4A86A') : (isLight ? '#475569' : '#CBD5E1'),
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={13} />
              <span>{showOriginalImage ? 'Xem sơ đồ tương tác' : 'Xem bản vẽ gốc'}</span>
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(290px, 1fr)',
          gap: 16,
          alignItems: 'stretch'
        }}
      >
        {/* Canvas SVG Trực quan hóa Mặt Bằng Kiến Trúc Chuẩn */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '16 / 11',
            minHeight: 390,
            background: isLight ? '#F8FAFC' : '#141720',
            borderRadius: 10,
            border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
            overflow: 'hidden'
          }}
        >
          {showOriginalImage && floorPlan.imageUrl ? (
            <img
              src={floorPlan.imageUrl}
              alt="Floor Plan Source"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: isLight ? '#F8FAFC' : '#141720'
              }}
            />
          ) : (
            <svg
              viewBox="0 0 100 100"
              style={{ width: '100%', height: '100%', display: 'block' }}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Đầu mũi tên chỉ hướng tĩnh thanh mảnh */}
                <marker
                  id="edge-arrow-active"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="3"
                  markerHeight="3"
                  orient="auto"
                >
                  <path d="M 0 2 L 7 5 L 0 8 Z" fill={isLight ? '#475569' : '#D4A86A'} />
                </marker>

                <marker
                  id="edge-arrow-default"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="2.5"
                  markerHeight="2.5"
                  orient="auto"
                >
                  <path d="M 0 2.5 L 6 5 L 0 7.5 Z" fill={isLight ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.3)'} />
                </marker>
              </defs>

              {/* Các đường liên kết lối đi tĩnh thanh mảnh, thể hiện hướng di chuyển rõ ràng giữa các gian */}
              {floorPlan.edges.map((edge) => {
                const nodeFrom = floorPlan.nodes.find((n) => n.id === edge.fromNodeId);
                const nodeTo = floorPlan.nodes.find((n) => n.id === edge.toNodeId);
                if (!nodeFrom || !nodeTo) return null;

                const isOutgoing = activeNode && edge.fromNodeId === activeNode.id;
                const isIncoming = activeNode && edge.toNodeId === activeNode.id;
                const isConnectedToActive = isOutgoing || isIncoming;

                // Nếu là liên kết quay lại (isReturn) và không phải là đường ra của phòng đang chọn thì bỏ qua để không trùng nét
                if (edge.isReturn && !isOutgoing) return null;

                const boxFrom = getNodeBox(nodeFrom);
                const boxTo = getNodeBox(nodeTo);
                const geom = getEdgeGeometry(boxFrom, boxTo);

                const dirLabel = getDirShortLabel(edge.direction);
                const labelBoxW = Math.max(7.5, (dirLabel.length * 0.72) + 1.4);

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
                      stroke={isConnectedToActive ? (isLight ? '#B45309' : '#D4A86A') : isLight ? 'rgba(0, 0, 0, 0.22)' : 'rgba(255, 255, 255, 0.22)'}
                      strokeWidth={isConnectedToActive ? 0.7 : 0.4}
                      strokeDasharray={isConnectedToActive ? '2.5, 1.2' : '1.5, 1.2'}
                      markerEnd={isConnectedToActive ? 'url(#edge-arrow-active)' : 'url(#edge-arrow-default)'}
                      opacity={isConnectedToActive ? 1 : 0.65}
                    />

                    {/* Nhãn hướng đi tượng trưng trên đường nối khi gian phòng đang được chọn */}
                    {isOutgoing && dirLabel && (
                      <g transform={`translate(${geom.midX}, ${geom.midY})`}>
                        <rect
                          x={-labelBoxW / 2}
                          y="-1.4"
                          width={labelBoxW}
                          height="2.8"
                          rx="0.7"
                          fill={isLight ? '#FFFFFF' : '#141A29'}
                          stroke={isLight ? 'rgba(180, 83, 9, 0.4)' : 'rgba(212, 168, 106, 0.5)'}
                          strokeWidth="0.2"
                        />
                        <text
                          x="0"
                          y="0.5"
                          textAnchor="middle"
                          fontSize="1.0"
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

              {/* Các Gian phòng (Nodes) */}
              {floorPlan.nodes.map((node, nodeIdx) => {
                const isSelected = activeNode?.id === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isCentral = node.isEntrance || node.code.includes('SANH') || nodeIdx === 0;
                const box = getNodeBox(node);
                const label = getMapNodeLabel(node);

                const pillWidth = Math.min(box.width - 4, Math.max(node.code.length * 1.3 + 3, 9));
                const pillHeight = 2.6;
                const pillX = box.x + (box.width - pillWidth) / 2;
                const pillY = box.y + 1.2;

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  >
                    {/* Khối gian phòng */}
                    <rect
                      x={box.x}
                      y={box.y}
                      width={box.width}
                      height={box.height}
                      rx="2"
                      ry="2"
                      fill={
                        isSelected
                          ? isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(26, 34, 51, 0.9)'
                          : isHovered
                          ? isLight ? 'rgba(241, 245, 249, 0.9)' : 'rgba(20, 27, 40, 0.85)'
                          : isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(16, 22, 33, 0.8)'
                      }
                      stroke={
                        isSelected
                          ? (isLight ? '#B45309' : '#D4A86A')
                          : isHovered
                          ? isLight ? '#94A3B8' : '#64748B'
                          : isLight ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)'
                      }
                      strokeWidth={isSelected ? 0.75 : 0.35}
                    />

                    {/* Badge số thứ tự phòng (1, 2, 3...) */}
                    <circle
                      cx={box.x + 3.2}
                      cy={box.y + 3.2}
                      r="1.6"
                      fill={isSelected ? (isLight ? '#B45309' : '#D4A86A') : isLight ? '#E2E8F0' : '#1E293B'}
                      stroke={isLight ? '#FFFFFF' : '#0E131D'}
                      strokeWidth="0.25"
                    />
                    <text
                      x={box.x + 3.2}
                      y={box.y + 3.8}
                      fill={isSelected ? '#FFFFFF' : isLight ? '#475569' : '#94A3B8'}
                      fontSize="1.3"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {nodeIdx + 1}
                    </text>

                    {/* Mã phân khu pill */}
                    <rect
                      x={pillX}
                      y={pillY}
                      width={pillWidth}
                      height={pillHeight}
                      rx="0.6"
                      fill={
                        isSelected
                          ? (isLight ? 'rgba(180, 83, 9, 0.15)' : 'rgba(212, 168, 106, 0.2)')
                          : isLight
                          ? 'rgba(0, 0, 0, 0.05)'
                          : 'rgba(255, 255, 255, 0.07)'
                      }
                    />
                    <text
                      x={pillX + pillWidth / 2}
                      y={pillY + 1.8}
                      fill={isSelected ? (isLight ? '#B45309' : '#D4A86A') : isLight ? '#475569' : '#CBD5E1'}
                      fontSize="1.25"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {node.code}
                    </text>

                    {/* Tên gian phòng căn giữa */}
                    {label.line2 ? (
                      <>
                        <text
                          x={box.x + box.width / 2}
                          y={box.y + box.height / 2 + 1.4}
                          fill={isSelected ? (isLight ? '#0F172A' : '#FFFFFF') : isLight ? '#334155' : '#E2E8F0'}
                          fontSize="1.5"
                          fontWeight={isSelected ? 'bold' : '600'}
                          textAnchor="middle"
                        >
                          {label.line1}
                        </text>
                        <text
                          x={box.x + box.width / 2}
                          y={box.y + box.height / 2 + 3.3}
                          fill={isSelected ? (isLight ? '#B45309' : '#D4A86A') : isLight ? '#64748B' : '#94A3B8'}
                          fontSize="1.2"
                          fontWeight="500"
                          textAnchor="middle"
                        >
                          {label.line2}
                        </text>
                      </>
                    ) : (
                      <text
                        x={box.x + box.width / 2}
                        y={box.y + box.height / 2 + 2.2}
                        fill={isSelected ? (isLight ? '#0F172A' : '#FFFFFF') : isLight ? '#334155' : '#E2E8F0'}
                        fontSize="1.55"
                        fontWeight={isSelected ? 'bold' : '600'}
                        textAnchor="middle"
                      >
                        {label.line1}
                      </text>
                    )}

                    {/* Phân loại gian phòng ở đáy thẻ */}
                    <text
                      x={box.x + box.width / 2}
                      y={box.y + box.height - 1.8}
                      fill={isSelected ? (isLight ? '#B45309' : '#D4A86A') : isLight ? '#64748B' : '#94A3B8'}
                      fontSize="1.15"
                      fontWeight="500"
                      textAnchor="middle"
                      opacity={0.85}
                    >
                      {node.category || 'Gian Trưng Bày'}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Chỉ báo phương vị Bắc chuẩn kiến trúc */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 8px',
              borderRadius: 6,
              background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 19, 29, 0.85)',
              border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)'}`,
              fontSize: 11,
              fontWeight: 500,
              color: isLight ? '#475569' : '#CBD5E1',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              pointerEvents: 'none'
            }}
          >
            <Navigation size={11} style={{ color: isLight ? '#B45309' : '#D4A86A' }} />
            <span>Hướng Bắc (N)</span>
          </div>
        </div>

        {/* Panel Chi Tiết Gian Phòng Đang Chọn (Tinh gọn, rõ ràng, không màu mè rối mắt) */}
        <div
          style={{
            background: isLight ? '#F8FAFC' : '#0E131F',
            border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
            borderRadius: 10,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 14
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
                    background: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
                    color: isLight ? '#334155' : '#CBD5E1',
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
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
