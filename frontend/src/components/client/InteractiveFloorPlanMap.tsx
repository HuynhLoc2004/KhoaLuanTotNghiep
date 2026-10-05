import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  Trees,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Footprints,
  Route,
  CheckCircle2,
  Clock,
  Square,
  Sparkles
} from 'lucide-react';
import { FloorPlanMap, FloorPlanNode, FloorPlanEdge, NavigationResult, NavigationStep } from '../../types';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { api } from '../../services/api';
import './interactiveFloorPlanMap.css';

interface InteractiveFloorPlanMapProps {
  floorPlan: FloorPlanMap;
  onSelectRoom360?: (roomId: string) => void;
  clientTheme?: 'light' | 'dark';
  hideSidePanel?: boolean;
  selectedNodeId?: string;
  onNodeSelect?: (nodeId: string) => void;
  previewMode?: boolean;
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
  onNodeSelect,
  previewMode = false
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

  const { currentLang, t } = useClientTranslation();

  // Tab chuyển đổi: 'details' (Thông tin phòng) hoặc 'navigator' (Trợ lý Chỉ đường Voice AI)
  const [sideTab, setSideTab] = useState<'details' | 'navigator'>('details');

  // Trạng thái Trợ lý Dẫn đường
  const [navStartNodeId, setNavStartNodeId] = useState<string>(() => {
    return externalSelectedNodeId || floorPlan.nodes?.[0]?.id || 'node_p_01';
  });
  const [navEndNodeId, setNavEndNodeId] = useState<string>('node_cong_1');
  const [navLoading, setNavLoading] = useState<boolean>(false);
  const [navResult, setNavResult] = useState<NavigationResult | null>(null);
  const [navError, setNavError] = useState<string | null>(null);

  // Audio Player cho Voice AI
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  }, []);

  const playVoiceAudio = useCallback((audioUrl?: string, text?: string) => {
    stopAudio();
    if (audioUrl) {
      const fullUrl = resolveImageUrl(audioUrl);
      const audio = new Audio(fullUrl);
      audioRef.current = audio;
      audio.onplay = () => setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        // Fallback Web Speech API
        if (text && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utter = new SpeechSynthesisUtterance(text);
          utter.lang = currentLang === 'en' ? 'en-US' : currentLang === 'fr' ? 'fr-FR' : currentLang === 'zh' ? 'zh-CN' : currentLang === 'ja' ? 'ja-JP' : 'vi-VN';
          utter.onstart = () => setIsPlayingAudio(true);
          utter.onend = () => setIsPlayingAudio(false);
          utter.onerror = () => setIsPlayingAudio(false);
          window.speechSynthesis.speak(utter);
        } else {
          setIsPlayingAudio(false);
        }
      };
      audio.play().catch(() => {
        if (text && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utter = new SpeechSynthesisUtterance(text);
          utter.lang = currentLang === 'en' ? 'en-US' : currentLang === 'fr' ? 'fr-FR' : currentLang === 'zh' ? 'zh-CN' : currentLang === 'ja' ? 'ja-JP' : 'vi-VN';
          utter.onstart = () => setIsPlayingAudio(true);
          utter.onend = () => setIsPlayingAudio(false);
          utter.onerror = () => setIsPlayingAudio(false);
          window.speechSynthesis.speak(utter);
        }
      });
    } else if (text && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = currentLang === 'en' ? 'en-US' : currentLang === 'fr' ? 'fr-FR' : currentLang === 'zh' ? 'zh-CN' : currentLang === 'ja' ? 'ja-JP' : 'vi-VN';
      utter.onstart = () => setIsPlayingAudio(true);
      utter.onend = () => setIsPlayingAudio(false);
      utter.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utter);
    }
  }, [currentLang, stopAudio]);

  const togglePlayAudio = useCallback(() => {
    if (isPlayingAudio) {
      stopAudio();
    } else if (navResult) {
      playVoiceAudio(navResult.audioUrl, navResult.instructionSummary);
    }
  }, [isPlayingAudio, navResult, playVoiceAudio, stopAudio]);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  // Tìm đường
  const handleRunNavigation = async (startId?: string, endId?: string) => {
    const sId = startId || navStartNodeId;
    const eId = endId || navEndNodeId;
    if (!sId || !eId) return;

    try {
      setNavLoading(true);
      setNavError(null);
      stopAudio();

      const res = await api.navigateFloorPlan({
        floorPlanId: floorPlan.id,
        startNodeId: sId,
        endNodeId: eId,
        lang: currentLang
      });

      setNavResult(res);
      setSideTab('navigator');
      if (res.audioUrl || res.instructionSummary) {
        playVoiceAudio(res.audioUrl, res.instructionSummary);
      }
    } catch (err: any) {
      setNavError(err.message || 'Không tìm thấy lối đi giữa hai vị trí này');
    } finally {
      setNavLoading(false);
    }
  };

  const handleClearNavigation = () => {
    stopAudio();
    setNavResult(null);
    setNavError(null);
  };

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

  // Danh sách các điểm có thể chọn làm điểm đi / điểm đến
  const selectableLocations = useMemo(() => {
    const list: Array<{ id: string; name: string; code?: string; category?: string }> = [];

    // Cổng & Tiện ích đặc biệt
    list.push({ id: 'node_cong_1', name: 'Cổng 1 (Lối vào & Ra chính - Nguyễn Bỉnh Khiêm)', code: 'CỔNG 1', category: 'Cổng ra vào' });
    list.push({ id: 'node_cong_2', name: 'Cổng 2 (Lối ra phụ & Thảo Cầm Viên)', code: 'CỔNG 2', category: 'Cổng ra vào' });
    list.push({ id: 'node_sanh', name: 'Sảnh Bát Giác (Khu vực đón tiếp)', code: 'SẢNH', category: 'Sảnh trung tâm' });
    list.push({ id: 'node_san_vuon', name: 'Sân vườn nội viện', code: 'SÂN VƯỜN', category: 'Khuôn viên ngoài trời' });

    // Gian phòng trưng bày trong sơ đồ
    (floorPlan.nodes || []).forEach((n) => {
      if (!list.some((item) => item.id === n.id)) {
        list.push({ id: n.id, name: n.name, code: n.code, category: n.category || 'Gian Trưng Bày' });
      }
    });
    return list;
  }, [floorPlan.nodes]);

  // Tọa độ trung tâm của một node bất kỳ (kể cả cổng, sảnh, sân vườn)
  const getNodeCenter = useCallback((nodeId: string) => {
    const n = floorPlan.nodes?.find((node) => node.id === nodeId);
    if (n) {
      const box = getNodeBox(n);
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    }
    if (nodeId === 'node_cong_1' || nodeId === 'CONG-1') return { x: 50, y: 90 };
    if (nodeId === 'node_cong_2' || nodeId === 'CONG-2') return { x: 15, y: 32 };
    if (nodeId === 'node_sanh' || nodeId === 'SANH') return { x: 50, y: 66.5 };
    if (nodeId === 'node_san_vuon' || nodeId === 'SAN-VUON') return { x: 56.5, y: 30 };
    return { x: 50, y: 50 };
  }, [floorPlan.nodes]);

  // Đường dẫn SVG polyline chuyển động nối qua toàn bộ lộ trình
  const navPathD = useMemo(() => {
    if (!navResult || !navResult.pathNodeIds || navResult.pathNodeIds.length < 2) return '';
    const points = navResult.pathNodeIds.map((id) => getNodeCenter(id));
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [navResult, getNodeCenter]);

  // Tọa độ điểm bắt đầu và điểm kết thúc lộ trình
  const navStartPt = useMemo(() => {
    if (!navResult || !navResult.pathNodeIds?.length) return null;
    return getNodeCenter(navResult.pathNodeIds[0]);
  }, [navResult, getNodeCenter]);

  const navEndPt = useMemo(() => {
    if (!navResult || !navResult.pathNodeIds?.length) return null;
    return getNodeCenter(navResult.pathNodeIds[navResult.pathNodeIds.length - 1]);
  }, [navResult, getNodeCenter]);

  // Kiểm tra một node bất kỳ có nằm trong lộ trình đang dẫn đường hay không
  const isNodeInRoute = useCallback(
    (id: string) => {
      if (!navResult?.pathNodeIds) return false;
      return navResult.pathNodeIds.some(
        (pId) => pId === id || pId.toLowerCase().replace(/[-_]/g, '') === id.toLowerCase().replace(/[-_]/g, '')
      );
    },
    [navResult]
  );

  const getNodeStepIndex = useCallback(
    (id: string) => {
      if (!navResult?.pathNodeIds) return -1;
      return navResult.pathNodeIds.findIndex(
        (pId) => pId === id || pId.toLowerCase().replace(/[-_]/g, '') === id.toLowerCase().replace(/[-_]/g, '')
      );
    },
    [navResult]
  );

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

  if (previewMode) {
    return (
      <div
        className="ifp-canvas-card"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '100%',
          maxHeight: '100%',
          border: 'none',
          borderRadius: 0,
          background: isLight ? '#0F141F' : '#070A10',
          position: 'relative',
          aspectRatio: 'unset'
        }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{ width: '100%', height: '100%', display: 'block' }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="arch-grid-prev" width="5" height="5" patternUnits="userSpaceOnUse">
              <path
                d="M 5 0 L 0 0 0 5"
                fill="none"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="0.2"
              />
            </pattern>
            <marker
              id="edge-arrow-prev"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="2.5"
              markerHeight="2.5"
              orient="auto"
            >
              <path d="M 0 1.5 L 7 5 L 0 8.5 Z" fill="rgba(212, 168, 106, 0.6)" />
            </marker>
          </defs>
          <rect width="100" height="100" fill="url(#arch-grid-prev)" />

          <g>
            {/* 1. SÂN VƯỜN NỘI VIỆN */}
            <g>
              <rect
                x="42"
                y="21"
                width="29"
                height="18"
                rx="2"
                fill="rgba(34, 197, 94, 0.08)"
                stroke="rgba(34, 197, 94, 0.22)"
                strokeWidth="0.3"
                strokeDasharray="1, 1"
              />
              <circle cx="56.5" cy="30" r="3.4" fill="rgba(34, 197, 94, 0.12)" />
              <text x="56.5" y="29.6" textAnchor="middle" fill="#4ADE80" fontSize="1.15" fontWeight="600">
                🌿 SÂN VƯỜN
              </text>
              <text x="56.5" y="31.8" textAnchor="middle" fill="#86EFAC" fontSize="0.8" opacity="0.85">
                Nội viện
              </text>
            </g>

            {/* 2. CỔNG 1 */}
            <g>
              <rect
                x="46"
                y="87"
                width="8"
                height="6"
                rx="1.2"
                fill="rgba(255, 255, 255, 0.05)"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="0.3"
              />
              <text x="50" y="90.5" textAnchor="middle" fill="#CBD5E1" fontSize="1.15" fontWeight="bold">
                CỔNG 1
              </text>
              <line x1="50" y1="86.8" x2="50" y2="84.2" stroke="#D4A86A" strokeWidth="0.4" strokeDasharray="1, 0.8" />
            </g>

            {/* 3. CỔNG 2 */}
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
              <text x="15" y="32.5" textAnchor="middle" fill="#FB923C" fontSize="1.1" fontWeight="bold">
                CỔNG 2
              </text>
            </g>

            {/* 4. SẢNH BÁT GIÁC */}
            <g>
              <circle cx="50" cy="66.5" r="5.5" fill="rgba(212, 168, 106, 0.12)" stroke="#D4A86A" strokeWidth="0.4" strokeDasharray="1.2, 0.8" />
              <text x="50" y="66.2" textAnchor="middle" fill="#D4A86A" fontSize="0.95" fontWeight="bold">
                SẢNH
              </text>
              <text x="50" y="68.0" textAnchor="middle" fill="#FDE68A" fontSize="0.75">
                Bát Giác
              </text>
            </g>

            {/* 5. LIÊN KẾT CỬA & ĐƯỜNG ĐI */}
            {floorPlan.edges.map((edge) => {
              const nodeFrom = floorPlan.nodes.find((n) => n.id === edge.fromNodeId);
              const nodeTo = floorPlan.nodes.find((n) => n.id === edge.toNodeId);
              if (!nodeFrom || !nodeTo || edge.isReturn) return null;
              const boxFrom = getNodeBox(nodeFrom);
              const boxTo = getNodeBox(nodeTo);
              const geom = getEdgeGeometry(boxFrom, boxTo);
              return (
                <line
                  key={edge.id}
                  x1={geom.x1}
                  y1={geom.y1}
                  x2={geom.x2}
                  y2={geom.y2}
                  stroke="rgba(212, 168, 106, 0.45)"
                  strokeWidth={0.36}
                  strokeDasharray="1.4, 1.4"
                  markerEnd="url(#edge-arrow-prev)"
                />
              );
            })}

            {/* 6. GIAN PHÒNG (NODES) */}
            {floorPlan.nodes.map((node, nodeIdx) => {
              const box = getNodeBox(node);
              const roomNumber = getNodeDisplayNumber(node, nodeIdx);
              const shortName = getShortNodeName(node.name);
              const isHovered = hoveredNodeId === node.id;
              return (
                <g
                  key={node.id}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectRoom360 && node.roomId) {
                      onSelectRoom360(node.roomId);
                    } else if (onNodeSelect) {
                      onNodeSelect(node.id);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                    rx="1.5"
                    fill={isHovered ? 'rgba(38, 50, 75, 0.95)' : 'rgba(16, 22, 34, 0.88)'}
                    stroke={isHovered ? '#F59E0B' : (node.colorTag || '#D4A86A')}
                    strokeWidth={isHovered ? '0.6' : '0.35'}
                  />
                  {/* Số phòng */}
                  <circle
                    cx={box.x + 2.2}
                    cy={box.y + 2.2}
                    r="1.4"
                    fill={node.colorTag || '#D4A86A'}
                  />
                  <text
                    x={box.x + 2.2}
                    y={box.y + 2.65}
                    textAnchor="middle"
                    fontSize="0.85"
                    fontWeight="bold"
                    fill="#0F141F"
                  >
                    {roomNumber}
                  </text>
                  {/* Tên phòng */}
                  <text
                    x={box.x + box.width / 2}
                    y={box.y + box.height / 2 + 0.35}
                    textAnchor="middle"
                    fontSize="0.9"
                    fontWeight="600"
                    fill="#F1F5F9"
                  >
                    {shortName}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
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

          <button
            type="button"
            onClick={() => setSideTab('navigator')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: sideTab === 'navigator' ? 'rgba(212, 168, 106, 0.22)' : 'rgba(212, 168, 106, 0.08)',
              border: `1px solid ${sideTab === 'navigator' ? '#D4A86A' : 'rgba(212, 168, 106, 0.3)'}`,
              color: '#D4A86A',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Route size={13} />
            <span>Trợ lý Chỉ đường Voice AI</span>
            {navResult && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#22C55E',
                  boxShadow: '0 0 6px #22C55E'
                }}
              />
            )}
          </button>


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
              {(() => {
                const isSanVuonInNav = isNodeInRoute('node_san_vuon');
                return (
                  <g
                    style={{
                      cursor: 'pointer',
                      opacity: navResult && !isSanVuonInNav ? 0.4 : 1,
                      transition: 'opacity 0.2s ease'
                    }}
                    onClick={() => {
                      setInternalSelectedNodeId('node_san_vuon');
                      onNodeSelect?.('node_san_vuon');
                    }}
                  >
                    <rect
                      x="42"
                      y="21"
                      width="29"
                      height="18"
                      rx="2"
                      fill={isSanVuonInNav ? 'rgba(34, 197, 94, 0.16)' : isLight ? 'rgba(34, 197, 94, 0.09)' : 'rgba(34, 197, 94, 0.08)'}
                      stroke={isSanVuonInNav ? '#22C55E' : isLight ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.22)'}
                      strokeWidth={isSanVuonInNav ? 0.6 : 0.3}
                      strokeDasharray={isSanVuonInNav ? undefined : '1, 1'}
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
                );
              })()}

              {/* 2. CỔNG 1 (LỐI VÀO CHÍNH - NAM) */}
              {(() => {
                const isCong1InNav = isNodeInRoute('node_cong_1');
                return (
                  <g
                    style={{
                      cursor: 'pointer',
                      opacity: navResult && !isCong1InNav ? 0.4 : 1,
                      transition: 'opacity 0.2s ease'
                    }}
                    onClick={() => {
                      setInternalSelectedNodeId('node_cong_1');
                      onNodeSelect?.('node_cong_1');
                    }}
                  >
                    <rect
                      x="46"
                      y="87"
                      width="8"
                      height="6"
                      rx="1.2"
                      fill={isCong1InNav ? 'rgba(212, 168, 106, 0.15)' : isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)'}
                      stroke={isCong1InNav ? '#D4A86A' : selectedNodeId === 'node_cong_1' ? '#D4A86A' : isLight ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'}
                      strokeWidth={isCong1InNav || selectedNodeId === 'node_cong_1' ? '0.6' : '0.3'}
                    />
                    <text
                      x="50"
                      y="90.2"
                      textAnchor="middle"
                      fill={isCong1InNav ? '#D4A86A' : isLight ? '#475569' : '#CBD5E1'}
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
                );
              })()}

              {/* 3. CỔNG 2 & QUẦY VÉ (TÂY) */}
              {(() => {
                const isCong2InNav = isNodeInRoute('node_cong_2');
                return (
                  <g
                    style={{
                      cursor: 'pointer',
                      opacity: navResult && !isCong2InNav ? 0.4 : 1,
                      transition: 'opacity 0.2s ease'
                    }}
                    onClick={() => {
                      setInternalSelectedNodeId('node_cong_2');
                      onNodeSelect?.('node_cong_2');
                    }}
                  >
                    <rect
                      x="9"
                      y="28"
                      width="12"
                      height="8"
                      rx="1.2"
                      fill={isCong2InNav ? 'rgba(234, 88, 12, 0.18)' : 'rgba(234, 88, 12, 0.08)'}
                      stroke={isCong2InNav ? '#FB923C' : selectedNodeId === 'node_cong_2' ? '#FB923C' : 'rgba(234, 88, 12, 0.3)'}
                      strokeWidth={isCong2InNav || selectedNodeId === 'node_cong_2' ? '0.6' : '0.3'}
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
                );
              })()}

              {/* 4. SẢNH TRUNG TÂM (CHUYÊN ĐỀ NGẮN HẠN / BÁT GIÁC) */}
              {(() => {
                const isSanhInNav = isNodeInRoute('node_sanh');
                return (
                  <g
                    style={{
                      cursor: 'pointer',
                      opacity: navResult && !isSanhInNav ? 0.4 : 1,
                      transition: 'opacity 0.2s ease'
                    }}
                    onClick={() => {
                      setInternalSelectedNodeId('node_sanh');
                      onNodeSelect?.('node_sanh');
                    }}
                  >
                    <circle
                      cx="50"
                      cy="66.5"
                      r="5.5"
                      fill={isSanhInNav ? 'rgba(212, 168, 106, 0.22)' : isLight ? 'rgba(212, 168, 106, 0.15)' : 'rgba(212, 168, 106, 0.12)'}
                      stroke={isSanhInNav ? '#F59E0B' : selectedNodeId === 'node_sanh' ? '#F59E0B' : '#D4A86A'}
                      strokeWidth={isSanhInNav || selectedNodeId === 'node_sanh' ? '0.7' : '0.4'}
                      strokeDasharray={isSanhInNav ? undefined : '1.2, 0.8'}
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
                );
              })()}

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

              {/* 5b. TUYẾN ĐƯỜNG DẪN ĐƯỜNG VOICE AI (ANIMATED GOLDEN PATHWAY) */}
              {navPathD && (
                <g>
                  {/* Đường phát quang mờ nền */}
                  <path
                    d={navPathD}
                    fill="none"
                    stroke="#D4A86A"
                    strokeWidth="1.8"
                    opacity="0.35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Đường nét đứt vàng ánh kim chuyển động */}
                  <path
                    d={navPathD}
                    fill="none"
                    stroke="#FBBF24"
                    strokeWidth="0.8"
                    className="ifp-svg-nav-path"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              )}

              {/* Vòng Halo phát sáng tại điểm xuất phát (Green) */}
              {navStartPt && (
                <g>
                  <circle
                    cx={navStartPt.x}
                    cy={navStartPt.y}
                    r="4.2"
                    fill="rgba(34, 197, 94, 0.18)"
                    stroke="#22C55E"
                    strokeWidth="0.45"
                    className="ifp-svg-pulse-node"
                  />
                  <circle
                    cx={navStartPt.x}
                    cy={navStartPt.y}
                    r="1.4"
                    fill="#22C55E"
                  />
                </g>
              )}

              {/* Vòng Halo phát sáng tại điểm đến (Red/Amber) */}
              {navEndPt && (
                <g>
                  <circle
                    cx={navEndPt.x}
                    cy={navEndPt.y}
                    r="4.6"
                    fill="rgba(239, 68, 68, 0.18)"
                    stroke="#EF4444"
                    strokeWidth="0.45"
                    className="ifp-svg-pulse-node"
                  />
                  <circle
                    cx={navEndPt.x}
                    cy={navEndPt.y}
                    r="1.4"
                    fill="#EF4444"
                  />
                </g>
              )}


              {/* 6. CÁC GIAN PHÒNG (NODES) - Rộng rãi, thoáng đãng, sắc nét */}
              {floorPlan.nodes.map((node, nodeIdx) => {
                const isSelected = activeNode?.id === node.id;
                const isHovered = hoveredNodeId === node.id;
                const box = getNodeBox(node);
                const roomNumber = getNodeDisplayNumber(node, nodeIdx);
                const shortName = getShortNodeName(node.name);

                const stepIdx = getNodeStepIndex(node.id);
                const isInNav = stepIdx !== -1;
                const isNavStart = navResult?.pathNodeIds?.[0] === node.id;
                const isNavEnd = navResult?.pathNodeIds?.[navResult.pathNodeIds.length - 1] === node.id;

                return (
                  <g
                    key={node.id}
                    onClick={() => {
                      setInternalSelectedNodeId(node.id);
                      onNodeSelect?.(node.id);
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      opacity: navResult && !isInNav ? 0.45 : 1
                    }}
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
                          : isInNav
                          ? isLight ? 'rgba(254, 243, 199, 0.9)' : 'rgba(30, 41, 59, 0.94)'
                          : isHovered
                          ? isLight ? 'rgba(248, 250, 252, 0.95)' : 'rgba(20, 28, 42, 0.92)'
                          : isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(16, 22, 34, 0.84)'
                      }
                      stroke={
                        isSelected
                          ? isLight ? '#B45309' : '#D4A86A'
                          : isNavStart
                          ? '#22C55E'
                          : isNavEnd
                          ? '#EF4444'
                          : isInNav
                          ? '#D4A86A'
                          : isHovered
                          ? isLight ? '#94A3B8' : '#64748B'
                          : isLight ? 'rgba(0, 0, 0, 0.14)' : 'rgba(255, 255, 255, 0.13)'
                      }
                      strokeWidth={isSelected || isInNav ? 0.75 : 0.3}
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

                    {/* Badge số thứ tự chặng trên lộ trình */}
                    {isInNav && !isNavStart && !isNavEnd && (
                      <g transform={`translate(${box.x + box.width - 3.2}, ${box.y + box.height - 3.2})`}>
                        <circle cx="1.5" cy="1.5" r="1.35" fill="#D4A86A" />
                        <text
                          x="1.5"
                          y="1.95"
                          fill="#0B0F19"
                          fontSize="0.8"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {stepIdx + 1}
                        </text>
                      </g>
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

        {/* Panel Chi Tiết & Trợ Lý Chỉ Đường */}
        {!hideSidePanel && (
          <div
            className="ifp-details-card"
            style={{
              background: isLight ? '#F8FAFC' : '#0B0F19',
              border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Thanh chuyển đổi Tab */}
            <div className="ifp-tabs-bar">
              <button
                type="button"
                className={`ifp-tab-btn ${sideTab === 'details' ? 'active' : ''}`}
                onClick={() => setSideTab('details')}
              >
                <Building size={13} />
                <span>Gian phòng</span>
              </button>
              <button
                type="button"
                className={`ifp-tab-btn ${sideTab === 'navigator' ? 'active' : ''}`}
                onClick={() => setSideTab('navigator')}
              >
                <Route size={13} />
                <span>Trợ lý Chỉ đường Voice AI</span>
                {navResult && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#22C55E',
                      boxShadow: '0 0 6px #22C55E'
                    }}
                  />
                )}
              </button>
            </div>

            {sideTab === 'details' ? (
              /* TAB 1: THÔNG TIN GIAN PHÒNG */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
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
                    <div style={{ fontSize: 12.5, color: isLight ? '#64748B' : '#94A3B8', marginBottom: 12 }}>
                      {activeNode.period || 'Hiện vật trưng bày lịch sử'}
                    </div>

                    {/* Phím tắt chỉ đường nhanh */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setNavStartNodeId(activeNode.id);
                          setSideTab('navigator');
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          padding: '7px 8px',
                          borderRadius: 6,
                          border: '1px solid rgba(212, 168, 106, 0.3)',
                          background: 'rgba(212, 168, 106, 0.08)',
                          color: '#D4A86A',
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <MapPin size={12} />
                        <span>Tôi ở phòng này</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNavEndNodeId(activeNode.id);
                          setSideTab('navigator');
                          handleRunNavigation(navStartNodeId, activeNode.id);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 5,
                          padding: '7px 8px',
                          borderRadius: 6,
                          border: '1px solid rgba(34, 197, 94, 0.35)',
                          background: 'rgba(34, 197, 94, 0.1)',
                          color: '#22C55E',
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Navigation size={12} />
                        <span>Chỉ đường tới đây</span>
                      </button>
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
                          marginBottom: 8
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
                                onClick={() => {
                                  setInternalSelectedNodeId(edge.toNodeId);
                                  onNodeSelect?.(edge.toNodeId);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '7px 9px',
                                  background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.03)',
                                  border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)'}`,
                                  borderRadius: 6,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ color: '#C5A059', display: 'flex', flexShrink: 0 }}>
                                    {badge.icon}
                                  </span>
                                  <div>
                                    <div style={{ fontSize: 9.5, color: isLight ? '#64748B' : '#94A3B8' }}>
                                      {badge.label}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 12,
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
                  <div style={{ textAlign: 'center', padding: '36px 0', color: isLight ? '#64748B' : '#94A3B8' }}>
                    <Info size={22} style={{ margin: '0 auto 8px auto', opacity: 0.6 }} />
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Bấm vào một gian phòng trên sơ đồ để xem thông tin</div>
                    <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 4 }}>
                      Hoặc chuyển sang tab &quot;Trợ lý Chỉ đường&quot; để tìm đường đi
                    </div>
                  </div>
                )}

                {/* Nút Khám Phá Tour 360° */}
                <div style={{ marginTop: 12 }}>
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
            ) : (
              /* TAB 2: TRỢ LÝ CHỈ ĐƯỜNG VOICE AI */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
                {/* Chọn Điểm xuất phát */}
                <div className="ifp-nav-field">
                  <label className="ifp-nav-label">
                    <MapPin size={12} style={{ color: '#22C55E' }} />
                    <span>Điểm xuất phát (Bạn đang ở đâu?)</span>
                  </label>
                  <select
                    className="ifp-nav-select"
                    value={navStartNodeId}
                    onChange={(e) => setNavStartNodeId(e.target.value)}
                  >
                    <optgroup label="Cổng ra vào & Khu vực chung">
                      <option value="node_cong_1">Cổng 1 (Lối vào chính - Nguyễn Bỉnh Khiêm)</option>
                      <option value="node_cong_2">Cổng 2 (Lối ra phụ & Thảo Cầm Viên)</option>
                      <option value="node_sanh">Sảnh Bát Giác (Khu đón tiếp)</option>
                      <option value="node_san_vuon">Sân vườn nội viện</option>
                    </optgroup>
                    <optgroup label="Gian phòng trưng bày">
                      {(floorPlan.nodes || []).map((n, idx) => (
                        <option key={n.id} value={n.id}>
                          {n.code || `P-${idx + 1}`} - {n.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Chọn Điểm đến */}
                <div className="ifp-nav-field">
                  <label className="ifp-nav-label">
                    <Navigation size={12} style={{ color: '#EF4444' }} />
                    <span>Điểm đến (Bạn muốn đi tới đâu?)</span>
                  </label>
                  <select
                    className="ifp-nav-select"
                    value={navEndNodeId}
                    onChange={(e) => setNavEndNodeId(e.target.value)}
                  >
                    <optgroup label="Cổng ra vào & Lối thoát hiểm">
                      <option value="node_cong_1">Cổng 1 (Lối ra chính - Nguyễn Bỉnh Khiêm)</option>
                      <option value="node_cong_2">Cổng 2 (Lối ra phụ & Quầy vé)</option>
                      <option value="node_sanh">Sảnh Bát Giác</option>
                      <option value="node_san_vuon">Sân vườn nội viện</option>
                    </optgroup>
                    <optgroup label="Gian phòng trưng bày">
                      {(floorPlan.nodes || []).map((n, idx) => (
                        <option key={n.id} value={n.id}>
                          {n.code || `P-${idx + 1}`} - {n.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  {/* Phím tắt điểm đến phổ biến */}
                  <div className="ifp-nav-chips">
                    <button
                      type="button"
                      className="ifp-nav-chip"
                      onClick={() => {
                        setNavEndNodeId('node_cong_1');
                        handleRunNavigation(navStartNodeId, 'node_cong_1');
                      }}
                    >
                      🚪 Ra Cổng 1
                    </button>
                    <button
                      type="button"
                      className="ifp-nav-chip"
                      onClick={() => {
                        setNavEndNodeId('node_cong_2');
                        handleRunNavigation(navStartNodeId, 'node_cong_2');
                      }}
                    >
                      🚪 Ra Cổng 2
                    </button>
                    <button
                      type="button"
                      className="ifp-nav-chip"
                      onClick={() => {
                        setNavEndNodeId('node_sanh');
                        handleRunNavigation(navStartNodeId, 'node_sanh');
                      }}
                    >
                      🏛️ Sảnh Bát Giác
                    </button>
                    <button
                      type="button"
                      className="ifp-nav-chip"
                      onClick={() => {
                        setNavEndNodeId('node_san_vuon');
                        handleRunNavigation(navStartNodeId, 'node_san_vuon');
                      }}
                    >
                      🌿 Sân Vườn
                    </button>
                  </div>
                </div>

                {/* Nút hành động tìm đường */}
                <button
                  type="button"
                  className="ifp-nav-submit-btn"
                  onClick={() => handleRunNavigation()}
                  disabled={navLoading}
                >
                  {navLoading ? (
                    <>
                      <RotateCcw size={14} className="ifp-spin" />
                      <span>Đang tính toán & chuẩn bị Voice AI...</span>
                    </>
                  ) : (
                    <>
                      <Route size={14} />
                      <span>Tìm lộ trình tối ưu</span>
                    </>
                  )}
                </button>

                {/* Báo lỗi nếu có */}
                {navError && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 6,
                      padding: '8px 10px',
                      color: '#F87171',
                      fontSize: 12,
                      marginTop: 8
                    }}
                  >
                    {navError}
                  </div>
                )}

                {/* Kết quả Dẫn đường & Voice AI Player */}
                {navResult && (
                  <div style={{ marginTop: 12 }}>
                    {/* Thống kê lộ trình */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 6,
                        padding: '8px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: 6,
                        textAlign: 'center',
                        fontSize: 11
                      }}
                    >
                      <div>
                        <div style={{ color: '#94A3B8' }}>Khoảng cách</div>
                        <div style={{ fontWeight: 700, color: '#D4A86A', fontSize: 13 }}>
                          ~{Math.round(navResult.totalDistance)}m
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#94A3B8' }}>Thời gian</div>
                        <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: 13 }}>
                          ~{navResult.estimatedMinutes} phút
                        </div>
                      </div>
                      <div>
                        <div style={{ color: '#94A3B8' }}>Số chặng</div>
                        <div style={{ fontWeight: 700, color: '#22C55E', fontSize: 13 }}>
                          {navResult.steps.length} chặng
                        </div>
                      </div>
                    </div>

                    {/* Hộp Trợ Lý Thuyết Minh Voice AI */}
                    <div className="ifp-voice-card">
                      <div className="ifp-voice-header">
                        <div className="ifp-voice-title">
                          <Volume2 size={14} />
                          <span>Chỉ dẫn Voice AI</span>
                          <span
                            style={{
                              fontSize: 10,
                              padding: '1px 5px',
                              borderRadius: 3,
                              background: 'rgba(212, 168, 106, 0.2)',
                              color: '#D4A86A',
                              fontWeight: 700
                            }}
                          >
                            {currentLang.toUpperCase()}
                          </span>
                        </div>
                        {isPlayingAudio && (
                          <div className="ifp-voice-wave">
                            <span className="ifp-voice-wave-bar" />
                            <span className="ifp-voice-wave-bar" />
                            <span className="ifp-voice-wave-bar" />
                            <span className="ifp-voice-wave-bar" />
                            <span className="ifp-voice-wave-bar" />
                          </div>
                        )}
                      </div>

                      <div className="ifp-voice-text">
                        &quot;{navResult.instructionSummary}&quot;
                      </div>

                      <div className="ifp-voice-actions">
                        <button
                          type="button"
                          className={`ifp-voice-btn ${isPlayingAudio ? 'active' : ''}`}
                          onClick={togglePlayAudio}
                        >
                          {isPlayingAudio ? (
                            <>
                              <Pause size={12} />
                              <span>Tạm dừng</span>
                            </>
                          ) : (
                            <>
                              <Play size={12} />
                              <span>Nghe thuyết minh</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="ifp-voice-btn"
                          onClick={() => {
                            stopAudio();
                            playVoiceAudio(navResult.audioUrl, navResult.instructionSummary);
                          }}
                        >
                          <RotateCcw size={11} />
                          <span>Phát lại</span>
                        </button>
                      </div>
                    </div>

                    {/* Danh sách các chặng rẽ cụ thể */}
                    <div style={{ marginTop: 10 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#CBD5E1',
                          textTransform: 'uppercase',
                          letterSpacing: 0.3,
                          marginBottom: 6
                        }}
                      >
                        Chỉ dẫn chi tiết từng chặng:
                      </div>

                      <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                        {navResult.steps.map((step, sIdx) => {
                          const badge = getDirectionBadge(step.direction);
                          return (
                            <div
                              key={step.stepNumber ?? sIdx}
                              className="ifp-step-row"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setInternalSelectedNodeId(step.toNodeId);
                                onNodeSelect?.(step.toNodeId);
                              }}
                            >
                              <div className="ifp-step-badge">{sIdx + 1}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                  <span style={{ color: '#D4A86A' }}>{badge.icon}</span>
                                  <span style={{ fontWeight: 600, color: '#F1F5F9' }}>
                                    {step.toNodeName}
                                  </span>
                                </div>
                                <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.35 }}>
                                  {step.instruction}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Nút Xóa Lộ Trình */}
                    <button
                      type="button"
                      onClick={handleClearNavigation}
                      style={{
                        width: '100%',
                        marginTop: 10,
                        padding: '7px 10px',
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 6,
                        color: '#94A3B8',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#F1F5F9';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#94A3B8';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      Xóa lộ trình hiện tại
                    </button>
                  </div>
                )}
              </div>
            )}
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
