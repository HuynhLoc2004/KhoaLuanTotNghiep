import React, { useState, useMemo } from 'react';
import { Compass, Navigation, Eye, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Info, Layers, Building } from 'lucide-react';
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
    floorPlan.nodes?.[0]?.id || 'node_central_rotunda'
  );
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [showOriginalImage, setShowOriginalImage] = useState<boolean>(false);

  // Node đang được chọn
  const activeNode = useMemo(() => {
    return floorPlan.nodes?.find((n) => n.id === selectedNodeId) || floorPlan.nodes?.[0];
  }, [floorPlan.nodes, selectedNodeId]);

  // Các liên kết cửa đi ra từ node đang được chọn (outgoing doors)
  const connectedEdges = useMemo(() => {
    if (!activeNode) return [];
    return (floorPlan.edges || []).filter((e) => e.fromNodeId === activeNode.id);
  }, [floorPlan.edges, activeNode]);

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

  return (
    <div
      className="interactive-floorplan-container"
      style={{
        background: '#111520',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 14,
        padding: '20px',
        color: '#F1F5F9',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
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
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: 14
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D4AF37'
            }}
          >
            <Building size={16} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
              Sơ Đồ Mặt Bằng & Vị Trí Các Gian Phòng
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>
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
                background: showOriginalImage ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: showOriginalImage ? '#D4AF37' : '#CBD5E1',
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
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: 11.5,
              fontWeight: 500,
              color: '#94A3B8'
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
            background: '#0B0E17',
            borderRadius: 10,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
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
                background: '#0B0E17'
              }}
            />
          ) : (
            <svg
              viewBox="0 0 100 100"
              style={{ width: '100%', height: '100%', display: 'block' }}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* La bàn phương vị Bắc tinh giản */}
              <g transform="translate(92, 8)">
                <circle cx="0" cy="0" r="4.2" fill="#131722" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="0.4" />
                <path d="M 0 -3.2 L 1.2 0 L 0 -0.8 L -1.2 0 Z" fill="#D4AF37" />
                <path d="M 0 3.2 L 1.2 0 L 0 0.8 L -1.2 0 Z" fill="#475569" />
                <text x="0" y="-4.6" fill="#D4AF37" fontSize="2.4" fontWeight="bold" textAnchor="middle">BẮC</text>
              </g>

              {/* Vẽ các đường liên kết lối đi (Edges) */}
              {floorPlan.edges.map((edge) => {
                const nodeFrom = floorPlan.nodes.find((n) => n.id === edge.fromNodeId);
                const nodeTo = floorPlan.nodes.find((n) => n.id === edge.toNodeId);
                if (!nodeFrom || !nodeTo) return null;

                const x1 = nodeFrom.x + nodeFrom.width / 2;
                const y1 = nodeFrom.y + nodeFrom.height / 2;
                const x2 = nodeTo.x + nodeTo.width / 2;
                const y2 = nodeTo.y + nodeTo.height / 2;

                const isConnectedToActive =
                  activeNode && (edge.fromNodeId === activeNode.id || edge.toNodeId === activeNode.id);

                return (
                  <g key={edge.id}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isConnectedToActive ? '#D4AF37' : 'rgba(255, 255, 255, 0.1)'}
                      strokeWidth={isConnectedToActive ? 0.65 : 0.3}
                      strokeDasharray={isConnectedToActive ? undefined : '1, 1'}
                      opacity={isConnectedToActive ? 0.95 : 0.35}
                    />

                    {/* Vị trí cánh cửa thông phòng (Điểm đánh dấu cửa sạch sẽ, không hiệu ứng nhấp nháy chói mắt) */}
                    {isConnectedToActive && edge.doorX && edge.doorY && (
                      <g
                        transform={`translate(${edge.doorX}, ${edge.doorY})`}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNodeId(edge.toNodeId);
                        }}
                      >
                        <circle cx="0" cy="0" r="1.3" fill="#D4AF37" stroke="#0B0E17" strokeWidth="0.3" />
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
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      rx="1.5"
                      ry="1.5"
                      fill={
                        isSelected
                          ? '#1E293B'
                          : isCentral
                          ? '#172033'
                          : isHovered
                          ? '#1A2234'
                          : '#111827'
                      }
                      stroke={
                        isSelected
                          ? '#D4AF37'
                          : isHovered
                          ? '#94A3B8'
                          : isCentral
                          ? 'rgba(212, 175, 55, 0.45)'
                          : 'rgba(255, 255, 255, 0.14)'
                      }
                      strokeWidth={isSelected ? 0.8 : 0.4}
                    />

                    {/* Mã phân khu */}
                    <rect
                      x={node.x + 1}
                      y={node.y + 1}
                      width={Math.min(node.width - 2, 8.5)}
                      height={2.6}
                      rx="0.6"
                      fill={isSelected ? '#D4AF37' : 'rgba(255, 255, 255, 0.08)'}
                    />
                    <text
                      x={node.x + 1 + Math.min(node.width - 2, 8.5) / 2}
                      y={node.y + 2.75}
                      fill={isSelected ? '#0B0E17' : '#CBD5E1'}
                      fontSize="1.5"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {node.code}
                    </text>

                    {/* Tên gian phòng */}
                    <text
                      x={node.x + node.width / 2}
                      y={node.y + node.height / 2 + 0.5}
                      fill={isSelected ? '#FFFFFF' : '#E2E8F0'}
                      fontSize={isCentral ? '2.0' : '1.85'}
                      fontWeight={isSelected ? 'bold' : '600'}
                      textAnchor="middle"
                    >
                      {node.name.length > 22 ? node.name.substring(0, 20) + '...' : node.name}
                    </text>

                    {/* Phân kỳ lịch sử */}
                    {node.period && (
                      <text
                        x={node.x + node.width / 2}
                        y={node.y + node.height / 2 + 3.1}
                        fill={isSelected ? '#D4AF37' : '#94A3B8'}
                        fontSize="1.25"
                        textAnchor="middle"
                      >
                        {node.period.length > 26 ? node.period.substring(0, 24) + '...' : node.period}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* Lối vào chính chân sơ đồ */}
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '3px 12px',
              borderRadius: 4,
              background: 'rgba(11, 14, 23, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: 10.5,
              fontWeight: 500,
              color: '#94A3B8',
              pointerEvents: 'none'
            }}
          >
            LỐI VÀO CHÍNH BẢO TÀNG • SỐ 2 NGUYỄN BỈNH KHIÊM
          </div>
        </div>

        {/* Panel Chi Tiết Gian Phòng Đang Chọn (Rõ ràng, trực quan, không màu mè) */}
        <div
          style={{
            background: '#0E131F',
            border: '1px solid rgba(255, 255, 255, 0.08)',
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
              {/* Mã & Phân loại */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: 4,
                    background: '#D4AF37',
                    color: '#0B0E17',
                    fontSize: 10.5,
                    fontWeight: 700
                  }}
                >
                  {activeNode.code}
                </span>
                <span style={{ fontSize: 11.5, color: '#94A3B8' }}>{activeNode.category || 'Gian Trưng Bày'}</span>
              </div>

              {/* Tên gian phòng */}
              <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#FFFFFF', margin: '0 0 4px 0', lineHeight: 1.35 }}>
                {activeNode.name}
              </h3>

              <div style={{ fontSize: 12, color: '#CBD5E1', marginBottom: 14 }}>
                {activeNode.period || 'Hiện vật trưng bày lịch sử'}
              </div>

              {/* Các lối đi thông sang phòng kế tiếp */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 12 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#94A3B8',
                    marginBottom: 8
                  }}
                >
                  Lối đi sang các phòng kế tiếp:
                </div>

                {connectedEdges.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 190, overflowY: 'auto' }}>
                    {connectedEdges.map((edge) => {
                      const targetNode = floorPlan.nodes.find((n) => n.id === edge.toNodeId);
                      const badge = getDirectionBadge(edge.direction);
                      return (
                        <div
                          key={edge.id}
                          onClick={() => setSelectedNodeId(edge.toNodeId)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '7px 10px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: 6,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.08)';
                            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ color: '#D4AF37', display: 'flex' }}>{badge.icon}</span>
                            <div>
                              <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>
                                {badge.label}
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: '#F8FAFC' }}>
                                {targetNode ? targetNode.name : edge.targetRoomName || 'Gian kế tiếp'}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: '#D4AF37' }}>Xem →</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>
                    Khu vực tiếp đón hoặc kết nối qua hành lang chính
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8' }}>
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
                  background: '#D4AF37',
                  color: '#0B0E17',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#E5C358'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#D4AF37'; }}
              >
                <Eye size={15} />
                <span>Vào Tham Quan Tour 360° Phòng Này</span>
              </button>
            ) : (
              <div
                style={{
                  fontSize: 11.5,
                  textAlign: 'center',
                  color: '#94A3B8',
                  background: 'rgba(255, 255, 255, 0.02)',
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
