import React, { useState, useMemo } from 'react';
import { Compass, Navigation, Eye, ArrowRight, ArrowLeft, ArrowUp, ArrowDown, Info, Layers } from 'lucide-react';
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

  // Hướng đi tương ứng với icon
  const getDirectionIcon = (dir: FloorPlanEdge['direction']) => {
    switch (dir) {
      case 'left':
        return <ArrowLeft size={14} className="text-amber-400" />;
      case 'right':
        return <ArrowRight size={14} className="text-amber-400" />;
      case 'front':
        return <ArrowUp size={14} className="text-emerald-400" />;
      case 'back':
        return <ArrowDown size={14} className="text-blue-400" />;
      default:
        return <Navigation size={14} className="text-champagne-400" />;
    }
  };

  const getDirectionBadgeText = (dir: FloorPlanEdge['direction']) => {
    switch (dir) {
      case 'left':
        return 'Cửa bên trái';
      case 'right':
        return 'Cửa bên phải';
      case 'front':
        return 'Cửa phía trước';
      case 'back':
        return 'Lối quay lại';
      default:
        return 'Cửa thông';
    }
  };

  return (
    <div
      className="interactive-floorplan-container"
      style={{
        background: 'radial-gradient(ellipse at 50% 20%, #111827 0%, #090D16 100%)',
        border: '1px solid rgba(212, 175, 55, 0.25)',
        borderRadius: 16,
        padding: '24px 20px',
        color: '#E2E8F0',
        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Thanh công cụ Header của Bản đồ Topo */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 20,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: 14
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D4AF37'
            }}
          >
            <Compass size={18} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4AF37' }}>
              Mạng Liên Kết Không Gian Topo • Server Image Analyzed
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#F8FAFC' }}>
              {floorPlan.title || 'Sơ Đồ Mặt Bằng & Mạng Cửa Thông Phòng'}
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
                fontWeight: 500,
                background: showOriginalImage ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: showOriginalImage ? '#D4AF37' : '#94A3B8',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Layers size={13} />
              <span>{showOriginalImage ? 'Xem Mạng Không Gian' : 'Xem Ảnh Gốc'}</span>
            </button>
          )}

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: 11,
              color: '#94A3B8'
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
            <span>{floorPlan.nodes.length} Khu Vực • {floorPlan.edges.length} Cửa Thông</span>
          </div>
        </div>
      </div>

      {/* Khu vực Hiển thị Mặt Bằng */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.7fr) minmax(280px, 1fr)',
          gap: 20,
          alignItems: 'stretch'
        }}
      >
        {/* Canvas SVG Trực quan hóa Mạng Topo Kiến trúc */}
        <div
          style={{
            position: 'relative',
            aspectRatio: '16 / 11',
            minHeight: 380,
            background: '#070A10',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.07)',
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 60%),
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 30px 30px, 30px 30px',
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
                background: '#070A10'
              }}
            />
          ) : (
            <svg
              viewBox="0 0 100 100"
              style={{ width: '100%', height: '100%', display: 'block' }}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="activeNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="rotundaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C5A880" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#C5A880" stopOpacity="0.05" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* La bàn phương vị Bắc */}
              <g transform="translate(90, 8)">
                <circle cx="0" cy="0" r="4.5" fill="rgba(0,0,0,0.5)" stroke="rgba(212,175,55,0.4)" strokeWidth="0.5" />
                <path d="M 0 -3.5 L 1.5 0 L 0 -1 L -1.5 0 Z" fill="#D4AF37" />
                <path d="M 0 3.5 L 1.5 0 L 0 1 L -1.5 0 Z" fill="rgba(255,255,255,0.3)" />
                <text x="0" y="-4.8" fill="#D4AF37" fontSize="2.8" fontWeight="bold" textAnchor="middle">B</text>
              </g>

              {/* Vẽ các đường liên kết Topo (Edges) */}
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
                      stroke={isConnectedToActive ? '#D4AF37' : 'rgba(255, 255, 255, 0.12)'}
                      strokeWidth={isConnectedToActive ? 0.7 : 0.35}
                      strokeDasharray={isConnectedToActive ? '1.5, 1' : '1, 1'}
                      filter={isConnectedToActive ? 'url(#glow)' : undefined}
                      opacity={isConnectedToActive ? 0.9 : 0.4}
                    />

                    {/* Vị trí cánh cửa thông phòng (Door Marker) */}
                    {isConnectedToActive && edge.doorX && edge.doorY && (
                      <g
                        transform={`translate(${edge.doorX}, ${edge.doorY})`}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNodeId(edge.toNodeId);
                        }}
                      >
                        <circle cx="0" cy="0" r="1.4" fill="#D4AF37" stroke="#000" strokeWidth="0.4" />
                        <circle cx="0" cy="0" r="2.2" fill="none" stroke="#D4AF37" strokeWidth="0.2" opacity="0.6">
                          <animate attributeName="r" values="1.4;2.6;1.4" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
                        </circle>
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
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    {/* Bounding Box của Gian phòng */}
                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={node.height}
                      rx={isCentral ? 4 : 2}
                      ry={isCentral ? 4 : 2}
                      fill={
                        isSelected
                          ? 'url(#activeNodeGrad)'
                          : isCentral
                          ? 'url(#rotundaGrad)'
                          : 'rgba(15, 23, 42, 0.85)'
                      }
                      stroke={
                        isSelected
                          ? '#D4AF37'
                          : isHovered
                          ? '#94A3B8'
                          : isCentral
                          ? 'rgba(212, 175, 55, 0.4)'
                          : 'rgba(255, 255, 255, 0.16)'
                      }
                      strokeWidth={isSelected ? 0.9 : 0.4}
                      filter={isSelected ? 'url(#glow)' : undefined}
                    />

                    {/* Badge Mã Phân Khu */}
                    <rect
                      x={node.x + 1}
                      y={node.y + 1}
                      width={Math.min(node.width - 2, 8)}
                      height={2.8}
                      rx="0.8"
                      fill={isSelected ? '#D4AF37' : 'rgba(255, 255, 255, 0.1)'}
                    />
                    <text
                      x={node.x + 1 + Math.min(node.width - 2, 8) / 2}
                      y={node.y + 2.9}
                      fill={isSelected ? '#000' : '#E2E8F0'}
                      fontSize="1.6"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {node.code}
                    </text>

                    {/* Tên gian phòng */}
                    <text
                      x={node.x + node.width / 2}
                      y={node.y + node.height / 2 + 0.6}
                      fill={isSelected ? '#FFF' : '#CBD5E1'}
                      fontSize={isCentral ? '2.1' : '1.9'}
                      fontWeight={isSelected ? 'bold' : '600'}
                      textAnchor="middle"
                    >
                      {node.name.length > 20 ? node.name.substring(0, 18) + '...' : node.name}
                    </text>

                    {/* Dòng phân kỳ / mô tả phụ */}
                    {node.period && (
                      <text
                        x={node.x + node.width / 2}
                        y={node.y + node.height / 2 + 3.2}
                        fill={isSelected ? '#D4AF37' : '#64748B'}
                        fontSize="1.3"
                        textAnchor="middle"
                      >
                        {node.period.length > 24 ? node.period.substring(0, 22) + '...' : node.period}
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
              background: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: 10,
              letterSpacing: '0.06em',
              color: '#94A3B8',
              pointerEvents: 'none'
            }}
          >
            CỔNG CHÍNH BẢO TÀNG • SỐ 2 NGUYỄN BỈNH KHIÊM
          </div>
        </div>

        {/* Panel Chi Tiết Không Gian & Các Hướng Đi (Wayfinding Control Panel) */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 12,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 16
          }}
        >
          {activeNode ? (
            <div>
              {/* Tiêu đề Node đang chọn */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: '#D4AF37',
                    color: '#000',
                    fontSize: 11,
                    fontWeight: 700
                  }}
                >
                  {activeNode.code}
                </span>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>{activeNode.category || 'Gian Trưng Bày'}</span>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#FFF', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                {activeNode.name}
              </h3>

              <div style={{ fontSize: 12, color: '#D4AF37', marginBottom: 16, fontStyle: 'italic' }}>
                {activeNode.period || 'Hiện vật & Không gian văn hoá'}
              </div>

              {/* Danh sách các Cửa Đi / Hướng Di Chuyển (Directional Doors) */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#94A3B8',
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Navigation size={12} className="text-champagne-400" />
                  <span>Các hướng cửa liên kết từ gian này:</span>
                </div>

                {connectedEdges.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
                    {connectedEdges.map((edge) => {
                      const targetNode = floorPlan.nodes.find((n) => n.id === edge.toNodeId);
                      return (
                        <div
                          key={edge.id}
                          onClick={() => setSelectedNodeId(edge.toNodeId)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: 6,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {getDirectionIcon(edge.direction)}
                            <div>
                              <div style={{ fontSize: 10, color: '#D4AF37', fontWeight: 600 }}>
                                {getDirectionBadgeText(edge.direction)}
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 500, color: '#F1F5F9' }}>
                                {targetNode ? targetNode.name : edge.targetRoomName || 'Gian kế tiếp'}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: 11, color: '#64748B' }}>Bước sang →</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#64748B', fontStyle: 'italic' }}>
                    Chưa có cửa thông trực tiếp với các gian khác
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748B' }}>
              <Info size={24} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
              <div>Bấm vào một gian phòng trên sơ đồ để xem các hướng liên kết</div>
            </div>
          )}

          {/* Nút Khám Phá Tour 360° Trực Tiếp */}
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
                  padding: '11px 16px',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #B89628 100%)',
                  color: '#0A0E17',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(212, 175, 55, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Eye size={15} />
                <span>Vào Khám Phá Tour 360° Gian Này</span>
              </button>
            ) : (
              <div
                style={{
                  fontSize: 11,
                  textAlign: 'center',
                  color: '#64748B',
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '8px',
                  borderRadius: 6
                }}
              >
                Khu vực trung tâm điều phối và tiếp đón tham quan
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
