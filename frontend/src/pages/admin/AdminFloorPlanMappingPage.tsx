import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Route,
  Play,
  Pause,
  Sliders,
  FileText,
  Clock,
  Compass,
  Footprints,
  RotateCcw
} from 'lucide-react';
import { api, API_ROOT } from '../../services/api';
import {
  MuseumRoom,
  FloorPlanMap,
  FloorPlanNode,
  FloorPlanNavSettings,
  FloorPlanNavLog,
  NavigationResult
} from '../../types';
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

  // Tab chính: 'mapping' (Gán phòng) hoặc 'navigator' (Trợ lý Voice AI & Logs)
  const [mainTab, setMainTab] = useState<'mapping' | 'navigator'>('mapping');

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeFloorPlan, setActiveFloorPlan] = useState<FloorPlanMap | null>(null);
  const [allRooms, setAllRooms] = useState<MuseumRoom[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('');

  // Lưu trạng thái mapping cục bộ: nodeId -> roomId (hoặc null nếu chưa gán)
  const [nodeMapping, setNodeMapping] = useState<Record<string, string | null>>({});

  // === TRẠNG THÁI TRỢ LÝ DẪN ĐƯỜNG & VOICE AI ===
  const [navSettings, setNavSettings] = useState<FloorPlanNavSettings | null>(null);
  const [loadingNavSettings, setLoadingNavSettings] = useState<boolean>(false);
  const [savingNavSettings, setSavingNavSettings] = useState<boolean>(false);

  // Sandbox Test Lộ Trình
  const [testStartNodeId, setTestStartNodeId] = useState<string>('node_p_01');
  const [testEndNodeId, setTestEndNodeId] = useState<string>('node_cong_1');
  const [testLang, setTestLang] = useState<string>('vi');
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<NavigationResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [isPlayingTestAudio, setIsPlayingTestAudio] = useState<boolean>(false);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);

  // Nhật ký Dẫn đường Real Data
  const [navLogs, setNavLogs] = useState<FloorPlanNavLog[]>([]);
  const [loadingNavLogs, setLoadingNavLogs] = useState<boolean>(false);

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

  // Danh sách các điểm có thể test lộ trình trong Admin
  const testLocations = useMemo(() => {
    const list: Array<{ id: string; name: string }> = [
      { id: 'node_cong_1', name: 'Cổng 1 (Lối vào chính - Nguyễn Bỉnh Khiêm)' },
      { id: 'node_cong_2', name: 'Cổng 2 (Lối ra phụ & Quầy vé)' },
      { id: 'node_sanh', name: 'Sảnh Bát Giác (Khu đón tiếp)' },
      { id: 'node_san_vuon', name: 'Sân Vườn Nội Viện' }
    ];
    (activeFloorPlan?.nodes || []).forEach((n, idx) => {
      list.push({ id: n.id, name: `${n.code || `P-${idx + 1}`} - ${n.name}` });
    });
    return list;
  }, [activeFloorPlan]);

  const fetchNavSettingsAndLogs = async () => {
    if (!activeFloorPlan) return;
    try {
      setLoadingNavSettings(true);
      setLoadingNavLogs(true);
      const [settingsData, logsData] = await Promise.all([
        api.getFloorPlanNavSettings(activeFloorPlan.id),
        api.getFloorPlanNavLogs(activeFloorPlan.id, 30)
      ]);
      setNavSettings(settingsData);
      setNavLogs(logsData || []);
    } catch (err: any) {
      console.warn('[AdminNavSettings/Logs]:', err.message);
    } finally {
      setLoadingNavSettings(false);
      setLoadingNavLogs(false);
    }
  };

  const handleSaveNavSettings = async () => {
    if (!navSettings || !activeFloorPlan) return;
    try {
      setSavingNavSettings(true);
      const updated = await api.updateFloorPlanNavSettings({
        ...navSettings,
        floorPlanId: activeFloorPlan.id
      });
      setNavSettings(updated);
      showToast('Đã lưu cấu hình Trợ lý Dẫn đường thành công!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu cấu hình trợ lý', 'error');
    } finally {
      setSavingNavSettings(false);
    }
  };

  const handleRunTestNavigation = async () => {
    if (!activeFloorPlan || !testStartNodeId || !testEndNodeId) return;
    try {
      setTestLoading(true);
      setTestError(null);
      if (testAudioRef.current) {
        testAudioRef.current.pause();
        testAudioRef.current.currentTime = 0;
      }
      setIsPlayingTestAudio(false);

      const res = await api.navigateFloorPlan({
        floorPlanId: activeFloorPlan.id,
        startNodeId: testStartNodeId,
        endNodeId: testEndNodeId,
        lang: testLang
      });
      setTestResult(res);
      showToast('Đã tính toán lộ trình và sinh giọng nói Voice AI!', 'success');

      // Tự động tải lại nhật ký mới nhất
      api.getFloorPlanNavLogs(activeFloorPlan.id, 30).then((logs) => setNavLogs(logs || []));
    } catch (err: any) {
      setTestError(err.message || 'Lỗi kiểm tra lộ trình');
    } finally {
      setTestLoading(false);
    }
  };

  const toggleTestAudio = () => {
    if (isPlayingTestAudio) {
      if (testAudioRef.current) testAudioRef.current.pause();
      setIsPlayingTestAudio(false);
    } else if (testResult?.audioUrl) {
      const fullUrl = resolveImageUrl(testResult.audioUrl);
      const audio = new Audio(fullUrl);
      testAudioRef.current = audio;
      audio.onplay = () => setIsPlayingTestAudio(true);
      audio.onended = () => setIsPlayingTestAudio(false);
      audio.onerror = () => setIsPlayingTestAudio(false);
      audio.play().catch(() => setIsPlayingTestAudio(false));
    }
  };

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

      {/* 1b. THANH CHUYỂN PHÂN HỆ: GÁN PHÒNG 360° HOẶC CẤU HÌNH TRỢ LÝ VOICE AI */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          background: 'var(--bg-surface)',
          padding: '4px',
          borderRadius: 8,
          border: '1px solid var(--border-color)',
          width: 'fit-content'
        }}
      >
        <button
          type="button"
          onClick={() => setMainTab('mapping')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 16px',
            borderRadius: 6,
            border: 'none',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: mainTab === 'mapping' ? 'rgba(212, 168, 106, 0.18)' : 'transparent',
            color: mainTab === 'mapping' ? '#D4A86A' : 'var(--text-muted)'
          }}
        >
          <Layers size={14} />
          <span>Gán Gian Phòng 360° Vào Sơ Đồ</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMainTab('navigator');
            fetchNavSettingsAndLogs();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 16px',
            borderRadius: 6,
            border: 'none',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: mainTab === 'navigator' ? 'rgba(212, 168, 106, 0.18)' : 'transparent',
            color: mainTab === 'navigator' ? '#D4A86A' : 'var(--text-muted)'
          }}
        >
          <Route size={14} />
          <span>Trợ Lý Dẫn Đường & Giọng Nói Voice AI</span>
        </button>
      </div>

      {/* CSS RESPONSIVE */}
      <style>{`
        .admin-mapping-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(320px, 1fr);
          gap: 16px;
          align-items: start;
        }
        .admin-nav-grid {
          display: grid;
          grid-template-columns: minmax(340px, 1fr) minmax(360px, 1.2fr);
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 960px) {
          .admin-mapping-grid,
          .admin-nav-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {mainTab === 'mapping' ? (
      /* 2. BỐ CỤC 2 CỘT TỐI GIẢN (SƠ ĐỒ TRÁI + BẢNG GÁN PHẢI) */
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
      ) : (
        /* PHÂN HỆ 2: CẤU HÌNH TRỢ LÝ DẪN ĐƯỜNG, SANDBOX TEST & NHẬT KÝ REAL */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* HÀNG TRÊN: CẤU HÌNH & TEST ROUTE SANDBOX */}
          <div className="admin-nav-grid">
            {/* THẺ 1: CẤU HÌNH TRỢ LÝ VOICE AI */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
                <Sliders size={16} style={{ color: '#D4A86A' }} />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                  Cấu Hình Trợ Lý Dẫn Đường & Giọng Nói
                </h3>
              </div>

              {loadingNavSettings ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                  <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <div>Đang tải cấu hình trợ lý...</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Bật/Tắt Voice AI */}
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '6px 0' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading-color)' }}>
                        Kích hoạt Trợ lý Voice AI
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        Cho phép khách nghe thuyết minh chỉ đường bằng giọng nói
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={navSettings?.voiceEnabled ?? true}
                      onChange={(e) =>
                        setNavSettings((prev: any) => ({ ...prev, voiceEnabled: e.target.checked }))
                      }
                      style={{ width: 18, height: 18, accentColor: '#D4A86A', cursor: 'pointer' }}
                    />
                  </label>

                  {/* Tự động phát âm thanh khi có đường */}
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '6px 0' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--heading-color)' }}>
                        Tự động phát giọng đọc (Auto-play)
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        Tự phát âm thanh khi khách bấm tìm đường mà không cần bấm Play
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={navSettings?.autoPlayVoice ?? false}
                      onChange={(e) =>
                        setNavSettings((prev: any) => ({ ...prev, autoPlayVoice: e.target.checked }))
                      }
                      style={{ width: 18, height: 18, accentColor: '#D4A86A', cursor: 'pointer' }}
                    />
                  </label>

                  {/* Tốc độ giọng đọc */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--heading-color)', marginBottom: 5 }}>
                      Tốc độ phát âm thanh (Speech Speed):
                    </label>
                    <select
                      className="form-control"
                      value={navSettings?.speechSpeed || 1.0}
                      onChange={(e) =>
                        setNavSettings((prev: any) => ({ ...prev, speechSpeed: parseFloat(e.target.value) }))
                      }
                      style={{ fontSize: 12.5 }}
                    >
                      <option value="0.85">Chậm rãi (0.85x) - Dễ nghe cho người cao tuổi</option>
                      <option value="1.0">Chuẩn mực tự nhiên (1.0x)</option>
                      <option value="1.15">Nhanh gọn (1.15x)</option>
                    </select>
                  </div>

                  {/* Nhà cung cấp TTS */}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--heading-color)', marginBottom: 5 }}>
                      Động cơ phát âm thanh đa ngôn ngữ:
                    </label>
                    <div
                      style={{
                        padding: '8px 10px',
                        background: 'rgba(212, 168, 106, 0.08)',
                        border: '1px solid rgba(212, 168, 106, 0.25)',
                        borderRadius: 6,
                        fontSize: 12,
                        color: '#D4A86A',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <Volume2 size={14} />
                      <span>Google TTS Stream • Khớp ngôn ngữ Client (VI, EN, FR, ZH, JA)</span>
                    </div>
                  </div>

                  {/* Nút lưu cấu hình */}
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveNavSettings}
                    disabled={savingNavSettings}
                    style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 14px', fontWeight: 600 }}
                  >
                    <Save size={13} />
                    <span>{savingNavSettings ? 'Đang lưu...' : 'Lưu Cấu Hình Trợ Lý'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* THẺ 2: SANDBOX KIỂM TRA LỘ TRÌNH THỰC TẾ & NGHE VOICE AI */}
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Compass size={16} style={{ color: '#22C55E' }} />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                    Thử Nghiệm Lộ Trình & Giọng Nói Trực Tiếp
                  </h3>
                </div>
                <span style={{ fontSize: 11, color: '#22C55E', fontWeight: 600, background: 'rgba(34, 197, 94, 0.1)', padding: '2px 8px', borderRadius: 10 }}>
                  Dijkstra & TTS
                </span>
              </div>

              {/* Form chọn điểm đi, điểm đến và ngôn ngữ */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--heading-color)', marginBottom: 4 }}>
                    📍 Điểm xuất phát:
                  </label>
                  <select
                    className="form-control"
                    value={testStartNodeId}
                    onChange={(e) => setTestStartNodeId(e.target.value)}
                    style={{ fontSize: 12 }}
                  >
                    {testLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--heading-color)', marginBottom: 4 }}>
                    🎯 Điểm cần đến:
                  </label>
                  <select
                    className="form-control"
                    value={testEndNodeId}
                    onChange={(e) => setTestEndNodeId(e.target.value)}
                    style={{ fontSize: 12 }}
                  >
                    {testLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--heading-color)', marginBottom: 4 }}>
                    Ngôn ngữ thử nghiệm:
                  </label>
                  <select
                    className="form-control"
                    value={testLang}
                    onChange={(e) => setTestLang(e.target.value)}
                    style={{ fontSize: 12 }}
                  >
                    <option value="vi">🇻🇳 Tiếng Việt (Chuẩn di sản)</option>
                    <option value="en">🇬🇧 English (International)</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="zh">🇨🇳 中文</option>
                    <option value="ja">🇯🇵 日本語</option>
                  </select>
                </div>

                <div style={{ alignSelf: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleRunTestNavigation}
                    disabled={testLoading}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontWeight: 600 }}
                  >
                    {testLoading ? (
                      <>
                        <RefreshCw size={13} className="spin" />
                        <span>Đang tính...</span>
                      </>
                    ) : (
                      <>
                        <Route size={13} />
                        <span>Chạy Thử Nghiệm</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Lỗi test nếu có */}
              {testError && (
                <div style={{ padding: '8px 10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 6, color: '#F87171', fontSize: 12 }}>
                  {testError}
                </div>
              )}

              {/* Kết quả Test Sandbox */}
              {testResult && (
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 8,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, background: 'rgba(212, 168, 106, 0.15)', color: '#D4A86A', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                        Khoảng cách: ~{Math.round(testResult.totalDistance)}m
                      </span>
                      <span style={{ fontSize: 11, background: 'rgba(34, 197, 94, 0.15)', color: '#22C55E', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                        {testResult.steps.length} chặng
                      </span>
                      <span style={{ fontSize: 11, background: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                        ~{testResult.estimatedMinutes} phút đi bộ
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={toggleTestAudio}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', fontSize: 11.5 }}
                    >
                      {isPlayingTestAudio ? <Pause size={12} /> : <Play size={12} />}
                      <span>{isPlayingTestAudio ? 'Dừng đọc' : 'Nghe Voice AI'}</span>
                    </button>
                  </div>

                  {/* Câu thuyết minh chỉ dẫn */}
                  <div
                    style={{
                      fontSize: 12,
                      fontStyle: 'italic',
                      color: 'var(--heading-color)',
                      borderLeft: '2px solid #D4A86A',
                      paddingLeft: 8
                    }}
                  >
                    &quot;{testResult.instructionSummary}&quot;
                  </div>

                  {/* Danh sách các chặng */}
                  <div style={{ maxHeight: 120, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {testResult.steps.map((st, idx) => (
                      <div
                        key={st.stepNumber ?? idx}
                        style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          padding: '3px 6px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: 4
                        }}
                      >
                        <strong>Chặng {idx + 1}:</strong> {st.instruction} (~{Math.round(st.distance)}m)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* HÀNG DƯỚI: BẢNG NHẬT KÝ DẪN ĐƯỜNG REAL 100% CỦA KHÁCH THAM QUAN */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 10,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} style={{ color: '#D4A86A' }} />
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)', margin: 0 }}>
                  Nhật Ký Dẫn Đường Của Khách Tham Quan (PostgreSQL & MongoDB Primary)
                </h3>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  ({navLogs.length} lượt gần nhất)
                </span>
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fetchNavSettingsAndLogs()}
                disabled={loadingNavLogs}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5 }}
              >
                <RefreshCw size={12} className={loadingNavLogs ? 'spin' : ''} />
                <span>Làm mới nhật ký</span>
              </button>
            </div>

            {loadingNavLogs ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                <RefreshCw size={18} className="spin" style={{ margin: '0 auto 6px', display: 'block' }} />
                <div>Đang tải lịch sử dẫn đường...</div>
              </div>
            ) : navLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 12.5 }}>
                Chưa có lượt tìm đường nào được ghi nhận trên sơ đồ này.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>Thời gian</th>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>Điểm xuất phát</th>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>Điểm đến</th>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>Ngôn ngữ</th>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>Số chặng</th>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>Khoảng cách</th>
                      <th style={{ padding: '8px 10px', fontWeight: 600 }}>Chỉ dẫn Voice AI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {navLogs.map((log) => {
                      const dateStr = log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : 'Vừa xong';
                      return (
                        <tr
                          key={log.id}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            transition: 'background 0.12s ease'
                          }}
                        >
                          <td style={{ padding: '8px 10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {dateStr}
                          </td>
                          <td style={{ padding: '8px 10px', color: 'var(--heading-color)', fontWeight: 600 }}>
                            {log.startNodeName}
                          </td>
                          <td style={{ padding: '8px 10px', color: '#D4A86A', fontWeight: 600 }}>
                            {log.endNodeName}
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            <span
                              style={{
                                padding: '1px 6px',
                                borderRadius: 3,
                                background: 'rgba(212, 168, 106, 0.15)',
                                color: '#D4A86A',
                                fontSize: 10.5,
                                fontWeight: 700
                              }}
                            >
                              {(log.lang || 'vi').toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', color: 'var(--heading-color)' }}>
                            {log.stepCount} chặng
                          </td>
                          <td style={{ padding: '8px 10px', color: 'var(--heading-color)', fontWeight: 600 }}>
                            ~{Math.round(log.totalDistance)}m
                          </td>
                          <td
                            style={{
                              padding: '8px 10px',
                              color: 'var(--text-muted)',
                              maxWidth: 320,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={log.instructionText}
                          >
                            {log.instructionText}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
