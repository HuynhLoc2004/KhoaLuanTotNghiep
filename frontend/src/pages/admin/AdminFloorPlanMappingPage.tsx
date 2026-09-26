import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Save,
  RefreshCw,
  Volume2,
  Eye,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api, API_ROOT } from '../../services/api';
import { MuseumRoom, FloorPlanMap, FloorPlanNode } from '../../types';
import { useToast } from '../../components/Toast';
import { InteractiveFloorPlanMap } from '../../components/client/InteractiveFloorPlanMap';

interface AdminFloorPlanMappingPageProps {
  onBackToGuide?: () => void;
}

const resolveImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_ROOT}${cleanPath}`;
};

export const AdminFloorPlanMappingPage: React.FC<AdminFloorPlanMappingPageProps> = ({
  onBackToGuide
}) => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeFloorPlan, setActiveFloorPlan] = useState<FloorPlanMap | null>(null);
  const [allRooms, setAllRooms] = useState<MuseumRoom[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');

  // Lưu trạng thái mapping cục bộ: nodeId -> roomId (hoặc null nếu chưa gán)
  const [nodeMapping, setNodeMapping] = useState<Record<string, string | null>>({});

  // Tải dữ liệu Sơ đồ mặt bằng đang áp dụng và danh sách gian phòng 360°
  const fetchData = async () => {
    try {
      setLoading(true);
      const [floorPlanData, roomsData] = await Promise.all([
        api.getFloorPlan(),
        api.getRooms()
      ]);

      if (floorPlanData) {
        setActiveFloorPlan(floorPlanData);
        // Khởi tạo mapping hiện có từ dữ liệu máy chủ
        const initMap: Record<string, string | null> = {};
        (floorPlanData.nodes || []).forEach((node) => {
          initMap[node.id] = node.roomId || null;
        });
        setNodeMapping(initMap);

        if (floorPlanData.nodes?.length && !selectedNodeId) {
          setSelectedNodeId(floorPlanData.nodes[0].id);
        }
      }

      if (Array.isArray(roomsData)) {
        setAllRooms(roomsData);
      }
    } catch (err: any) {
      console.error('[AdminFloorPlanMapping] Lỗi tải dữ liệu:', err);
      showToast('Không thể tải sơ đồ hoặc danh sách phòng 360°', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Node đang được chọn trên sơ đồ
  const selectedNode = useMemo(() => {
    if (!activeFloorPlan?.nodes) return null;
    return activeFloorPlan.nodes.find((n) => n.id === selectedNodeId) || activeFloorPlan.nodes[0] || null;
  }, [activeFloorPlan, selectedNodeId]);

  // ID của phòng 360° đang được gán cho node hiện tại
  const assignedRoomId = selectedNode ? nodeMapping[selectedNode.id] || null : null;

  // Chi tiết phòng 360° thực tế được gán
  const assignedRoom = useMemo(() => {
    if (!assignedRoomId) return null;
    return allRooms.find((r) => r.id === assignedRoomId) || null;
  }, [allRooms, assignedRoomId]);

  // Danh sách các roomId đã được gán cho các node KHÁC
  // Quy tắc: 1 gian phòng 360° chỉ được gán cho 1 vị trí phòng trên sơ đồ
  const assignedRoomIdsInOtherNodes = useMemo(() => {
    const map = new Map<string, string>(); // roomId -> nodeName
    if (!activeFloorPlan?.nodes) return map;
    for (const [nId, rId] of Object.entries(nodeMapping)) {
      if (rId && nId !== selectedNode?.id) {
        const nodeObj = activeFloorPlan.nodes.find((n) => n.id === nId);
        map.set(rId, nodeObj ? nodeObj.name : 'Vị trí khác');
      }
    }
    return map;
  }, [nodeMapping, selectedNode, activeFloorPlan]);

  // Thống kê số lượng phòng đã được gán
  const stats = useMemo(() => {
    const totalNodes = activeFloorPlan?.nodes?.length || 0;
    let mappedCount = 0;
    Object.values(nodeMapping).forEach((rid) => {
      if (rid) mappedCount++;
    });
    return {
      total: totalNodes,
      mapped: mappedCount,
      percent: totalNodes > 0 ? Math.round((mappedCount / totalNodes) * 100) : 0
    };
  }, [activeFloorPlan, nodeMapping]);

  // Thay đổi gán phòng cho node hiện tại
  const handleSelectRoomForCurrentNode = (roomId: string) => {
    if (!selectedNode) return;
    setNodeMapping((prev) => ({
      ...prev,
      [selectedNode.id]: roomId ? roomId : null
    }));
  };

  // Gỡ gán gian phòng cho node hiện tại
  const handleUnlinkCurrentNode = () => {
    if (!selectedNode) return;
    setNodeMapping((prev) => ({
      ...prev,
      [selectedNode.id]: null
    }));
    showToast(`Đã gỡ liên kết gian phòng cho "${selectedNode.name}"`, 'info');
  };

  // Lưu toàn bộ cấu hình mapping vào MongoDB
  const handleSaveAll = async () => {
    if (!activeFloorPlan) return;
    try {
      setSaving(true);
      const mappings = Object.entries(nodeMapping).map(([nodeId, roomId]) => ({
        nodeId,
        roomId: roomId || null
      }));

      const updated = await api.updateFloorPlanBatchMapping(activeFloorPlan.id, mappings);
      setActiveFloorPlan(updated);
      showToast('Đã lưu toàn bộ liên kết gian phòng 360° vào sơ đồ thành công!', 'success');
    } catch (err: any) {
      console.error('[FloorPlanMapping] Lỗi lưu liên kết:', err);
      showToast(err.message || 'Lỗi khi lưu liên kết không gian', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Chuyển sang phòng kế tiếp trong danh sách để gán nhanh
  const handleGoToNextNode = () => {
    if (!activeFloorPlan?.nodes || activeFloorPlan.nodes.length === 0) return;
    const currentIndex = activeFloorPlan.nodes.findIndex((n) => n.id === selectedNodeId);
    const nextIndex = (currentIndex + 1) % activeFloorPlan.nodes.length;
    setSelectedNodeId(activeFloorPlan.nodes[nextIndex].id);
  };

  // Chuyển sang phòng trước đó
  const handleGoToPrevNode = () => {
    if (!activeFloorPlan?.nodes || activeFloorPlan.nodes.length === 0) return;
    const currentIndex = activeFloorPlan.nodes.findIndex((n) => n.id === selectedNodeId);
    const prevIndex = (currentIndex - 1 + activeFloorPlan.nodes.length) % activeFloorPlan.nodes.length;
    setSelectedNodeId(activeFloorPlan.nodes[prevIndex].id);
  };

  // Đối tượng sơ đồ để preview với các roomId đã gán
  const previewFloorPlan: FloorPlanMap | null = useMemo(() => {
    if (!activeFloorPlan) return null;
    return {
      ...activeFloorPlan,
      nodes: activeFloorPlan.nodes.map((n) => ({
        ...n,
        roomId: nodeMapping[n.id] || undefined
      }))
    };
  }, [activeFloorPlan, nodeMapping]);

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: 'var(--primary)' }} />
        <div style={{ fontSize: 14, fontWeight: 500 }}>Đang nạp sơ đồ mặt bằng và danh sách gian phòng 360°...</div>
      </div>
    );
  }

  if (!activeFloorPlan || !activeFloorPlan.nodes || activeFloorPlan.nodes.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: 10, border: '1px dashed var(--border-color)' }}>
        <AlertCircle size={32} style={{ opacity: 0.4, margin: '0 auto 10px', display: 'block', color: '#EAB308' }} />
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--heading-color)', margin: '0 0 6px' }}>
          Chưa có sơ đồ mặt bằng nào được áp dụng
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 16px' }}>
          Vui lòng tải lên và áp dụng một sơ đồ mặt bằng tại phân mục "2. Sơ Đồ Mặt Bằng" trước khi tiến hành gán gian phòng.
        </p>
        {onBackToGuide && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onBackToGuide}>
            ← Quay lại Cẩm nang & Sơ đồ
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 1. THANH TIÊU ĐỀ TRANG TỐI GIẢN */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 16px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onBackToGuide && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onBackToGuide}
              title="Quay lại danh sách phân mục cẩm nang"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <ArrowLeft size={13} />
              <span>Quay lại Cẩm nang</span>
            </button>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                Gán Gian Phòng 360° Vào Vị Trí Sơ Đồ
              </h2>
              <span
                style={{
                  background: stats.mapped === stats.total ? 'rgba(34, 197, 94, 0.15)' : 'rgba(212, 168, 106, 0.15)',
                  color: stats.mapped === stats.total ? '#22C55E' : '#D4A86A',
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 12,
                  border: `1px solid ${stats.mapped === stats.total ? 'rgba(34, 197, 94, 0.3)' : 'rgba(212, 168, 106, 0.3)'}`
                }}
              >
                Tiến độ: {stats.mapped}/{stats.total} phòng ({stats.percent}%)
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Bấm chọn phòng trên sơ đồ hoặc danh sách bên dưới, chọn không gian 360° tương ứng rồi bấm Lưu.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href="/?page=guide"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}
          >
            <Eye size={13} />
            <span>Xem trang khách</span>
            <ExternalLink size={11} style={{ opacity: 0.6 }} />
          </a>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleSaveAll}
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, padding: '7px 16px' }}
          >
            <Save size={13} />
            <span>{saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}</span>
          </button>
        </div>
      </div>

      {/* CSS RESPONSIVE */}
      <style>{`
        .admin-mapping-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(320px, 1fr);
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .admin-mapping-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* 2. BỐ CỤC 2 CỘT TỐI GIẢN (SƠ ĐỒ TRÁI + BẢNG GÁN PHẢI) */}
      <div className="admin-mapping-grid">
        {/* CỘT TRÁI: BẢN ĐỒ SƠ ĐỒ MẶT BẰNG KIẾN TRÚC TOÀN KHUNG */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header nhỏ cột sơ đồ */}
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--heading-color)' }}>
              <Layers size={14} style={{ color: 'var(--primary)' }} />
              <span>Sơ đồ kiến trúc (Bấm vào phòng để chọn)</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Đang chọn: <strong style={{ color: 'var(--heading-color)' }}>{selectedNode?.name || '---'}</strong>
            </span>
          </div>

          {/* Vùng sơ đồ InteractiveFloorPlanMap (ẩn panel chi tiết thừa để sơ đồ rộng rãi) */}
          <div style={{ padding: 10 }}>
            {previewFloorPlan && (
              <InteractiveFloorPlanMap
                floorPlan={previewFloorPlan}
                clientTheme="dark"
                hideSidePanel={true}
                selectedNodeId={selectedNode?.id}
                onNodeSelect={(nodeId) => setSelectedNodeId(nodeId)}
              />
            )}
          </div>

          {/* Dải chọn nhanh tất cả gian phòng P-01 -> P-18 */}
          <div
            style={{
              padding: '10px 14px',
              borderTop: '1px solid var(--border-color)',
              background: 'var(--bg-subtle)'
            }}
          >
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
              Danh sách vị trí phòng ({activeFloorPlan.nodes.length} phòng):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {activeFloorPlan.nodes.map((node, idx) => {
                const isSelected = selectedNode?.id === node.id;
                const isMapped = Boolean(nodeMapping[node.id]);
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      border: isSelected
                        ? '1.5px solid var(--primary)'
                        : `1px solid ${isMapped ? 'rgba(74, 222, 128, 0.4)' : 'var(--border-color)'}`,
                      background: isSelected
                        ? 'rgba(212, 168, 106, 0.2)'
                        : isMapped
                        ? 'rgba(74, 222, 128, 0.08)'
                        : 'var(--bg-card)',
                      color: isSelected
                        ? 'var(--heading-color)'
                        : isMapped
                        ? '#4ADE80'
                        : 'var(--text-muted)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{node.code || `P-${idx + 1}`}</span>
                    {isMapped && <Check size={10} style={{ color: '#4ADE80' }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: BẢNG GÁN KHÔNG GIAN 360° ĐƠN GIẢN & TỐI GIẢN */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}
        >
          {selectedNode ? (
            <>
              {/* 1. Thông tin vị trí phòng trên sơ đồ */}
              <div
                style={{
                  padding: '12px 14px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    VỊ TRÍ TRÊN SƠ ĐỒ
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--heading-color)'
                    }}
                  >
                    Mã: {selectedNode.code}
                  </span>
                </div>

                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--heading-color)', marginBottom: 2 }}>
                  {selectedNode.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {selectedNode.period || selectedNode.category || 'Gian trưng bày lịch sử'}
                </div>
              </div>

              {/* 2. Chọn Gian phòng 360° để gán vào vị trí này */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--heading-color)', marginBottom: 6 }}>
                  Chọn Gian phòng 360° thực tế để gán vào:
                </label>

                <select
                  value={assignedRoomId || ''}
                  onChange={(e) => handleSelectRoomForCurrentNode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 6,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Chưa gán gian phòng 360° nào --</option>
                  {allRooms.map((room) => {
                    const isAssignedElsewhere = assignedRoomIdsInOtherNodes.has(room.id);
                    const assignedNodeName = assignedRoomIdsInOtherNodes.get(room.id);
                    const hasVoice = Boolean(room.audioUrl || room.aiVoiceEnabled);

                    return (
                      <option
                        key={room.id}
                        value={room.id}
                        disabled={isAssignedElsewhere}
                        style={isAssignedElsewhere ? { color: '#64748B' } : {}}
                      >
                        {room.name} ({room.code}) {hasVoice ? '• 🎙️ Có voice' : ''}
                        {isAssignedElsewhere ? ` ⛔ (Đã gán cho "${assignedNodeName}")` : ''}
                      </option>
                    );
                  })}
                </select>

                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 5 }}>
                  * Mỗi gian phòng 360° chỉ được gán cho duy nhất 1 phòng trên sơ đồ.
                </div>
              </div>

              {/* 3. Chi tiết phòng 360° sau khi chọn (Preview trực quan) */}
              {assignedRoom ? (
                <div
                  style={{
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                    background: 'rgba(74, 222, 128, 0.04)',
                    borderRadius: 8,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4ADE80', fontSize: 12, fontWeight: 600 }}>
                      <CheckCircle2 size={14} />
                      <span>Đã gắn phòng 360°</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleUnlinkCurrentNode}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: 11.5,
                        cursor: 'pointer',
                        padding: '2px 6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3
                      }}
                      title="Gỡ liên kết để vị trí này trống"
                    >
                      <X size={12} />
                      <span>Gỡ liên kết</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {/* Thumbnail phòng */}
                    <div
                      style={{
                        width: 68,
                        height: 50,
                        borderRadius: 6,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}
                    >
                      {assignedRoom.thumbnailUrl || assignedRoom.panoramaUrl ? (
                        <img
                          src={resolveImageUrl(assignedRoom.thumbnailUrl || assignedRoom.panoramaUrl)}
                          alt={assignedRoom.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                          <Eye size={16} style={{ opacity: 0.5 }} />
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {assignedRoom.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        Mã: {assignedRoom.code}
                      </div>
                    </div>
                  </div>

                  {/* Trạng thái Thuyết minh Voice */}
                  <div
                    style={{
                      padding: '6px 10px',
                      background: assignedRoom.audioUrl || assignedRoom.aiVoiceEnabled ? 'rgba(212, 168, 106, 0.1)' : 'var(--bg-subtle)',
                      borderRadius: 6,
                      border: `1px solid ${assignedRoom.audioUrl || assignedRoom.aiVoiceEnabled ? 'rgba(212, 168, 106, 0.25)' : 'var(--border-color)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 11.5
                    }}
                  >
                    <Volume2 size={13} style={{ color: assignedRoom.audioUrl || assignedRoom.aiVoiceEnabled ? '#D4A86A' : 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ color: assignedRoom.audioUrl || assignedRoom.aiVoiceEnabled ? 'var(--heading-color)' : 'var(--text-muted)' }}>
                      {assignedRoom.audioUrl || assignedRoom.aiVoiceEnabled
                        ? 'Đã có file thuyết minh voice (Khách vào là nghe)'
                        : 'Chưa có file voice (vẫn xem được ảnh 360°)'}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: 8,
                    background: 'var(--bg-subtle)',
                    border: '1px dashed var(--border-color)',
                    textAlign: 'center',
                    fontSize: 12,
                    color: 'var(--text-muted)'
                  }}
                >
                  Vị trí này trên sơ đồ chưa được gán phòng 360° nào.
                </div>
              )}

              {/* 4. Nút thao tác lưu & chuyển phòng */}
              <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveAll}
                  disabled={saving}
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600, padding: '9px 16px' }}
                >
                  <Save size={14} />
                  <span>{saving ? 'Đang lưu...' : 'Lưu tất cả thay đổi'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleGoToNextNode}
                  title="Chuyển sang gian phòng kế tiếp để tiếp tục gán"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '9px 12px' }}
                >
                  <span>Phòng tiếp</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <Info size={24} style={{ opacity: 0.5, margin: '0 auto 8px', display: 'block' }} />
              <div>Vui lòng bấm chọn một gian phòng trên sơ đồ để bắt đầu gán.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
