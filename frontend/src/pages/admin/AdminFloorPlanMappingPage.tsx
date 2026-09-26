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
  ChevronRight,
  Sparkles
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

  // Lưu trạng thái mapping cục bộ của từng node: nodeId -> roomId (hoặc null nếu chưa gán)
  const [nodeMapping, setNodeMapping] = useState<Record<string, string | null>>({});

  // Tải dữ liệu Sơ đồ mặt bằng đang active và danh sách tất cả các phòng 360°
  const fetchData = async () => {
    try {
      setLoading(true);
      const [floorPlanData, roomsData] = await Promise.all([
        api.getFloorPlan(),
        api.getRooms()
      ]);

      setActiveFloorPlan(floorPlanData);
      setAllRooms(roomsData || []);

      if (floorPlanData && floorPlanData.nodes) {
        const initialMap: Record<string, string | null> = {};
        floorPlanData.nodes.forEach((node) => {
          initialMap[node.id] = node.roomId || null;
        });
        setNodeMapping(initialMap);

        if (floorPlanData.nodes.length > 0) {
          setSelectedNodeId(floorPlanData.nodes[0].id);
        }
      }
    } catch (err: any) {
      console.error('[FloorPlanMapping] Lỗi nạp dữ liệu:', err);
      showToast(err.message || 'Không thể tải dữ liệu sơ đồ mặt bằng', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Node đang chọn hiện tại
  const selectedNode = useMemo(() => {
    if (!activeFloorPlan?.nodes) return null;
    return activeFloorPlan.nodes.find((n) => n.id === selectedNodeId) || activeFloorPlan.nodes[0] || null;
  }, [activeFloorPlan, selectedNodeId]);

  // ID của phòng 360° đang được gán cho node đang chọn
  const assignedRoomId = selectedNode ? nodeMapping[selectedNode.id] || null : null;

  // Chi tiết phòng 360° thực tế được gán
  const assignedRoom = useMemo(() => {
    if (!assignedRoomId) return null;
    return allRooms.find((r) => r.id === assignedRoomId) || null;
  }, [allRooms, assignedRoomId]);

  // Các lối đi ra (Edges) từ node đang chọn
  const outgoingEdges = useMemo(() => {
    if (!activeFloorPlan?.edges || !selectedNode) return [];
    return activeFloorPlan.edges.filter((e) => e.fromNodeId === selectedNode.id && !e.isReturn);
  }, [activeFloorPlan, selectedNode]);

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

  // Lưu toàn bộ cấu hình mapping vào máy chủ MongoDB
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

  // Tạo đối tượng sơ đồ ảo để preview với các roomId đã gán
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* 1. THANH ĐIỀU HƯỚNG & TIÊU ĐỀ TRANG TỐI GIẢN */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 18px',
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
                Gán Gian Phòng 360° & Thuyết Minh Vào Sơ Đồ
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
                Đã gán: {stats.mapped}/{stats.total} phòng ({stats.percent}%)
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0 0' }}>
              Chọn từng phòng trên sơ đồ để gắn ảnh 360° và giọng đọc thuyết minh. Khi khách xem bản đồ có thể bấm vào để chuyển cảnh trực tiếp.
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

      {/* CSS RESPONSIVE CHO MỌI THIẾT BỊ */}
      <style>{`
        .admin-mapping-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(320px, 1fr);
          gap: 16px;
          alignItems: start;
        }
        @media (max-width: 960px) {
          .admin-mapping-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* 2. BỐ CỤC 2 CỘT RESPONSIVE (SƠ ĐỒ TRÁI + BẢNG GÁN PHẢI) */}
      <div className="admin-mapping-grid">
        {/* CỘT TRÁI: BẢN ĐỒ SƠ ĐỒ MẶT BẰNG KIẾN TRÚC TRỰC QUAN */}
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
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Phòng đang chọn: <strong style={{ color: 'var(--heading-color)' }}>{selectedNode?.name || '---'}</strong>
            </span>
          </div>

          {/* Vùng sơ đồ InteractiveFloorPlanMap */}
          <div style={{ padding: 12 }}>
            {previewFloorPlan && (
              <InteractiveFloorPlanMap
                floorPlan={previewFloorPlan}
                clientTheme="dark"
              />
            )}
          </div>

          {/* Ghi chú hướng dẫn nhỏ */}
          <div
            style={{
              padding: '8px 14px',
              borderTop: '1px solid var(--border-color)',
              fontSize: 11.5,
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>💡 Mẹo: Bấm vào từng phòng trên sơ đồ hoặc dùng nút chuyển ở cột bên phải.</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleGoToPrevNode}
                style={{ padding: '3px 8px', fontSize: 11 }}
              >
                ← Phòng trước
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleGoToNextNode}
                style={{ padding: '3px 8px', fontSize: 11 }}
              >
                Phòng tiếp theo →
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: BẢNG GÁN KHÔNG GIAN 360° TỐI GIẢN & THIẾT THỰC */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 10,
            padding: 18,
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          {selectedNode ? (
            <>
              {/* 1. Thông tin gian phòng trên sơ đồ */}
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
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-muted)'
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

              {/* 2. Hộp chọn gán Gian phòng 360° thực tế */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--heading-color)', marginBottom: 6 }}>
                  Gán Gian phòng 360° thực tế:
                </label>

                <select
                  value={assignedRoomId || ''}
                  onChange={(e) => handleSelectRoomForCurrentNode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
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
                    const hasVoice = Boolean(room.audioUrl || room.aiVoiceEnabled);
                    return (
                      <option key={room.id} value={room.id}>
                        {room.name} ({room.code}) {hasVoice ? '• 🎙️ Có voice' : ''}
                      </option>
                    );
                  })}
                </select>

                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                  Hệ thống sẽ liên kết ảnh toàn cảnh 360° và file thuyết minh giọng nói của phòng này vào sơ đồ.
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
                      title="Gỡ liên kết để phòng này trống"
                    >
                      <X size={12} />
                      <span>Gỡ liên kết</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {/* Thumbnail phòng */}
                    <div
                      style={{
                        width: 64,
                        height: 48,
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
                        Mã: {assignedRoom.code} • {assignedRoom.hotspots?.length || 0} điểm chuyển cảnh
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
                        ? 'Đã có file thuyết minh giọng nói (Khách bấm vào là nghe)'
                        : 'Chưa có file giọng đọc (vẫn xem được 360 bình thường)'}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 8,
                    background: 'var(--bg-subtle)',
                    border: '1px dashed var(--border-color)',
                    textAlign: 'center',
                    fontSize: 12,
                    color: 'var(--text-muted)'
                  }}
                >
                  Vị trí này trên sơ đồ chưa được gắn với gian phòng 360° nào.
                </div>
              )}

              {/* 4. Các lối đi tiếp theo sơ đồ */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--heading-color)', marginBottom: 8 }}>
                  Lối đi kế tiếp từ phòng này ({outgoingEdges.length}):
                </div>

                {outgoingEdges.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {outgoingEdges.map((edge) => {
                      const targetNode = activeFloorPlan.nodes.find((n) => n.id === edge.toNodeId);
                      const targetRoomId = targetNode ? nodeMapping[targetNode.id] : null;
                      const targetRoom = targetRoomId ? allRooms.find((r) => r.id === targetRoomId) : null;

                      return (
                        <div
                          key={edge.id}
                          onClick={() => targetNode && setSelectedNodeId(targetNode.id)}
                          style={{
                            padding: '8px 10px',
                            background: 'var(--bg-subtle)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            fontSize: 12
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--heading-color)' }}>
                              → {targetNode?.name || edge.label}
                            </div>
                            <div style={{ fontSize: 11, color: targetRoom ? '#4ADE80' : 'var(--text-muted)', marginTop: 2 }}>
                              {targetRoom ? `✓ Đã gắn: ${targetRoom.name}` : '⚠️ Chưa gắn phòng 360°'}
                            </div>
                          </div>

                          <ChevronRight size={14} style={{ opacity: 0.5 }} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    Phòng này là điểm cuối của luồng hoặc lối ra Cổng chính.
                  </div>
                )}
              </div>

              {/* 5. Nút lưu nhanh cho phòng này */}
              <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveAll}
                  disabled={saving}
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 600 }}
                >
                  <Save size={13} />
                  <span>{saving ? 'Đang lưu...' : 'Lưu tất cả liên kết'}</span>
                </button>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleGoToNextNode}
                  title="Chuyển sang gian phòng kế tiếp để tiếp tục gán"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <span>Phòng tiếp</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <Info size={24} style={{ opacity: 0.5, margin: '0 auto 8px', display: 'block' }} />
              <div>Vui lòng bấm chọn một gian phòng trên sơ đồ bên trái để bắt đầu gán.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
