import React, { useState, useMemo } from 'react';
import { Navigation, Eye, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Info, Layers, Building } from 'lucide-react';
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

  // Hướng đi kèm icon và nhãn dễ hiểu
  const getDirectionBadge = (dir: FloorPlanEdge['direction']) => {
    switch (dir) {
      case 'left':
        return { label: 'Bên trái', icon: <ArrowLeft size={13} /> };
      case 'right':
        return { label: 'Bên phải', icon: <ArrowRight size={13} /> };
      case 'front':
        return { label: 'Phía trước', icon: <ArrowUp size={13} /> };
      case 'back':
        return { label: 'Phía sau', icon: <ArrowDown size={13} /> };
      default:
        return { label: 'Lối thông', icon: <Navigation size={13} /> };
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

  // Tính toán kích thước hộp gian phòng đảm bảo vừa chữ và bố cục hài hòa
  const getNodeBox = (node: FloorPlanNode) => {
    const width = Math.max(node.width, 24);
    const height = Math.max(node.height, 18);
    const x = node.x - (width - node.width) / 2;
    const y = node.y - (height - node.height) / 2;
    return { x, y, width, height };
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
            background: isLight ? '#F8FAFC' : '#0E131D',
            borderRadius: 10,
            border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
            backgroundImage: isLight
              ? `linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px)`
              : `linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
            backgroundSize: '24px 24px, 24px 24px',
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
                background: isLight ? '#F8FAFC' : '#0E131D'
              }}
            />
          ) : (
            <svg
              viewBox="0 0 100 100"
              style={{ width: '100%', height: '100%', display: 'block' }}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Vẽ các đường liên kết lối đi (Edges) */}
              {floorPlan.edges.map((edge) => {
                const nodeFrom = floorPlan.nodes.find((n) => n.id === edge.fromNodeId);
                const nodeTo = floorPlan.nodes.find((n) => n.id === edge.toNodeId);
                if (!nodeFrom || !nodeTo) return null;

                const boxFrom = getNodeBox(nodeFrom);
                const boxTo = getNodeBox(nodeTo);

                const x1 = boxFrom.x + boxFrom.width / 2;
                const y1 = boxFrom.y + boxFrom.height / 2;
                const x2 = boxTo.x + boxTo.width / 2;
                const y2 = boxTo.y + boxTo.height / 2;

                const isConnectedToActive =
                  activeNode && (edge.fromNodeId === activeNode.id || edge.toNodeId === activeNode.id);

                return (
                  <g key={edge.id}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isConnectedToActive ? '#C5A059' : isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}
                      strokeWidth={isConnectedToActive ? 0.5 : 0.3}
                      strokeDasharray={isConnectedToActive ? undefined : '1, 1'}
                      opacity={isConnectedToActive ? 0.9 : 0.4}
                    />

                    {/* Vị trí cánh cửa thông phòng */}
                    {isConnectedToActive && edge.doorX && edge.doorY && (
                      <g
                        transform={`translate(${edge.doorX}, ${edge.doorY})`}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNodeId(edge.toNodeId);
                        }}
                      >
                        <circle
                          cx="0"
                          cy="0"
                          r="1.0"
                          fill="#C5A059"
                          stroke={isLight ? '#FFFFFF' : '#0E131D'}
                          strokeWidth="0.25"
                        />
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Vẽ các Gian phòng (Nodes) */}
              {floorPlan.nodes.map((node) => {
                const isSelected = activeNode?.id === node.id;
                const isHovered = hoveredNodeId === node.id;
                const isCentral = node.isEntrance || node.code.includes('SANH');
                const box = getNodeBox(node);
                const label = getMapNodeLabel(node);

                // Kích thước mã phòng pill
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
                          ? isLight ? '#FFFFFF' : '#1F283C'
                          : isHovered
                          ? isLight ? '#F1F5F9' : '#1A2333'
                          : isCentral
                          ? isLight ? '#FAF8F5' : '#161D2B'
                          : isLight ? '#FFFFFF' : '#141A26'
                      }
                      stroke={
                        isSelected
                          ? '#C5A059'
                          : isHovered
                          ? isLight ? '#94A3B8' : '#64748B'
                          : isCentral
                          ? isLight ? 'rgba(180, 138, 60, 0.4)' : 'rgba(212, 168, 106, 0.35)'
                          : isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'
                      }
                      strokeWidth={isSelected ? 0.9 : 0.4}
                    />

                    {/* Mã phân khu (Pill căn giữa phía trên) */}
                    <rect
                      x={pillX}
                      y={pillY}
                      width={pillWidth}
                      height={pillHeight}
                      rx="0.8"
                      fill={
                        isSelected
                          ? '#C5A059'
                          : isLight
                          ? 'rgba(0, 0, 0, 0.06)'
                          : 'rgba(255, 255, 255, 0.08)'
                      }
                    />
                    <text
                      x={pillX + pillWidth / 2}
                      y={pillY + 1.8}
                      fill={isSelected ? '#0F131D' : isLight ? '#475569' : '#CBD5E1'}
                      fontSize="1.3"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {node.code}
                    </text>

                    {/* Tên gian phòng căn giữa (1 dòng hoặc 2 dòng ngắn, vừa vặn 100% trong khung) */}
                    {label.line2 ? (
                      <>
                        <text
                          x={box.x + box.width / 2}
                          y={box.y + box.height / 2 + 1.4}
                          fill={isSelected ? (isLight ? '#0F172A' : '#FFFFFF') : isLight ? '#334155' : '#E2E8F0'}
                          fontSize="1.55"
                          fontWeight={isSelected ? 'bold' : '600'}
                          textAnchor="middle"
                        >
                          {label.line1}
                        </text>
                        <text
                          x={box.x + box.width / 2}
                          y={box.y + box.height / 2 + 3.4}
                          fill={isSelected ? '#C5A059' : isLight ? '#64748B' : '#94A3B8'}
                          fontSize="1.25"
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
                        fontSize="1.6"
                        fontWeight={isSelected ? 'bold' : '600'}
                        textAnchor="middle"
                      >
                        {label.line1}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* Chỉ báo phương vị Bắc chuẩn kiến trúc (gọn gàng, không giả lập xoay gây nhầm lẫn) */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 12,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 9px',
              borderRadius: 6,
              background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 19, 29, 0.85)',
              border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.12)'}`,
              fontSize: 11,
              fontWeight: 500,
              color: isLight ? '#475569' : '#CBD5E1',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              pointerEvents: 'none'
            }}
          >
            <Navigation size={12} style={{ color: '#C5A059' }} />
            <span>Hướng Bắc (N)</span>
          </div>

          {/* Lối vào chính chân sơ đồ */}
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '3px 12px',
              borderRadius: 4,
              background: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(11, 14, 23, 0.85)',
              border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.1)'}`,
              fontSize: 10.5,
              fontWeight: 500,
              color: isLight ? '#64748B' : '#94A3B8',
              pointerEvents: 'none'
            }}
          >
            LỐI VÀO CHÍNH (SỐ 2 NGUYỄN BỈNH KHIÊM)
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
