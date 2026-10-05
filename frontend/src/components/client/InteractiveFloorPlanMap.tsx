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
  Building,
  ZoomIn,
  ZoomOut,
  Compass,
  MapPin,
  Volume2,
  Play,
  Pause
} from 'lucide-react';
import { FloorPlanMap, FloorPlanNode, FloorPlanEdge, NavigationResult } from '../../types';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { api, API_ROOT } from '../../services/api';
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

const resolveImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_ROOT}${cleanPath}`;
};

const UI_STRINGS: Record<string, {
  floorPlanTitle: string;
  floorPlanSubtitle: string;
  viewOriginal: string;
  navGuideBtn: string;
  roomsCount: (n: number) => string;
  doorsCount: (n: number) => string;
  tabDetails: string;
  tabNavigator: string;
  startPoint: string;
  endPoint: string;
  gate1: string;
  gate2: string;
  octagonalHall: string;
  courtyard: string;
  commonAreas: string;
  exhibitionRooms: string;
  findRoute: string;
  findingRoute: string;
  distance: string;
  estimatedTime: (min: number) => string;
  stepsCount: (n: number) => string;
  voiceGuide: string;
  playAudio: string;
  pauseAudio: string;
  replayAudio: string;
  stepDetailsTitle: string;
  clearRoute: string;
  iAmHere: string;
  guideMeHere: string;
  nextRooms: string;
  receptionOrCorridor: string;
  enter360: string;
  compassNorth: string;
  compassNorthDeg: (deg: number) => string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
  originalImageTitle: string;
  noRoomsTitle: string;
  noRoomsDesc: string;
}> = {
  vi: {
    floorPlanTitle: 'Sơ Đồ Mặt Bằng & Dẫn Đường Tham Quan',
    floorPlanSubtitle: 'Bản đồ kiến trúc 2D trực quan: Chọn từng gian phòng để xem hướng di chuyển và liên kết tour thực tế',
    viewOriginal: 'Xem ảnh sơ đồ gốc',
    navGuideBtn: 'Dẫn đường tham quan',
    roomsCount: (n) => `${n} gian trưng bày`,
    doorsCount: (n) => `${n} lối thông phòng`,
    tabDetails: 'Gian phòng',
    tabNavigator: 'Chỉ đường',
    startPoint: 'Điểm xuất phát',
    endPoint: 'Điểm đến',
    gate1: 'Cổng 1',
    gate2: 'Cổng 2',
    octagonalHall: 'Sảnh Bát Giác',
    courtyard: 'Sân vườn',
    commonAreas: 'Cổng ra vào & Khu vực chung',
    exhibitionRooms: 'Gian phòng trưng bày',
    findRoute: 'Tìm đường đi',
    findingRoute: 'Đang tìm đường...',
    distance: 'Khoảng cách',
    estimatedTime: (min) => `~${min} phút đi bộ`,
    stepsCount: (n) => `${n} chặng`,
    voiceGuide: 'Thuyết minh chỉ đường',
    playAudio: 'Nghe thuyết minh',
    pauseAudio: 'Tạm dừng',
    replayAudio: 'Phát lại',
    stepDetailsTitle: 'Các bước di chuyển:',
    clearRoute: 'Đặt lại chỉ đường',
    iAmHere: 'Tôi đang ở đây',
    guideMeHere: 'Chỉ đường tới đây',
    nextRooms: 'Lối sang phòng tiếp theo',
    receptionOrCorridor: 'Khu vực tiếp đón hoặc kết nối qua hành lang',
    enter360: 'Vào tham quan 360°',
    compassNorth: 'Hướng Bắc (N)',
    compassNorthDeg: (deg) => `Hướng Bắc (${deg > 0 ? '+' : ''}${deg}°)`,
    zoomIn: 'Phóng to',
    zoomOut: 'Thu nhỏ',
    resetZoom: 'Tỉ lệ chuẩn',
    originalImageTitle: 'Ảnh sơ đồ mặt bằng gốc',
    noRoomsTitle: 'Chưa bổ sung gian phòng trưng bày',
    noRoomsDesc: 'Sơ đồ mặt bằng sẽ tự động kết nối và hiển thị khi ban quản trị thêm các gian phòng trưng bày vào hệ thống.'
  },
  en: {
    floorPlanTitle: 'Floor Plan & Visitor Navigation',
    floorPlanSubtitle: 'Interactive 2D architectural map: Select rooms to view paths and 360° tour connections',
    viewOriginal: 'View original map',
    navGuideBtn: 'Navigation',
    roomsCount: (n) => `${n} exhibition rooms`,
    doorsCount: (n) => `${n} connected doors`,
    tabDetails: 'Room info',
    tabNavigator: 'Directions',
    startPoint: 'Starting point',
    endPoint: 'Destination',
    gate1: 'Gate 1',
    gate2: 'Gate 2',
    octagonalHall: 'Octagonal Hall',
    courtyard: 'Courtyard',
    commonAreas: 'Gates & Common Areas',
    exhibitionRooms: 'Exhibition Rooms',
    findRoute: 'Find route',
    findingRoute: 'Finding route...',
    distance: 'Distance',
    estimatedTime: (min) => `~${min} min walk`,
    stepsCount: (n) => `${n} steps`,
    voiceGuide: 'Audio navigation',
    playAudio: 'Play audio',
    pauseAudio: 'Pause',
    replayAudio: 'Replay',
    stepDetailsTitle: 'Route steps:',
    clearRoute: 'Clear route',
    iAmHere: 'I am here',
    guideMeHere: 'Navigate here',
    nextRooms: 'Passages to adjacent rooms',
    receptionOrCorridor: 'Reception or hallway connection',
    enter360: 'Enter 360° tour',
    compassNorth: 'North (N)',
    compassNorthDeg: (deg) => `North (${deg > 0 ? '+' : ''}${deg}°)`,
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetZoom: 'Reset zoom',
    originalImageTitle: 'Original floor plan image',
    noRoomsTitle: 'No exhibition rooms added',
    noRoomsDesc: 'The floor plan will automatically display once exhibition rooms are added by the administrator.'
  },
  fr: {
    floorPlanTitle: 'Plan d\'Étage & Navigation',
    floorPlanSubtitle: 'Plan architectural 2D interactif : Sélectionnez les salles pour voir les parcours',
    viewOriginal: 'Voir le plan original',
    navGuideBtn: 'Itinéraire',
    roomsCount: (n) => `${n} salles d'exposition`,
    doorsCount: (n) => `${n} portes communicantes`,
    tabDetails: 'Salle',
    tabNavigator: 'Itinéraire',
    startPoint: 'Point de départ',
    endPoint: 'Destination',
    gate1: 'Porte 1',
    gate2: 'Porte 2',
    octagonalHall: 'Hall Octogonal',
    courtyard: 'Jardin intérieur',
    commonAreas: 'Entrées & Espaces communs',
    exhibitionRooms: 'Salles d\'exposition',
    findRoute: 'Calculer l\'itinéraire',
    findingRoute: 'Calcul en cours...',
    distance: 'Distance',
    estimatedTime: (min) => `~${min} min à pied`,
    stepsCount: (n) => `${n} étapes`,
    voiceGuide: 'Guidage vocal',
    playAudio: 'Écouter',
    pauseAudio: 'Pause',
    replayAudio: 'Rejouer',
    stepDetailsTitle: 'Étapes du parcours :',
    clearRoute: 'Effacer l\'itinéraire',
    iAmHere: 'Je suis ici',
    guideMeHere: 'Naviguer vers ici',
    nextRooms: 'Accès aux salles adjacentes',
    receptionOrCorridor: 'Zone d\'accueil ou couloir principal',
    enter360: 'Visiter en 360°',
    compassNorth: 'Nord (N)',
    compassNorthDeg: (deg) => `Nord (${deg > 0 ? '+' : ''}${deg}°)`,
    zoomIn: 'Zoom avant',
    zoomOut: 'Zoom arrière',
    resetZoom: 'Réinitialiser',
    originalImageTitle: 'Plan d\'étage original',
    noRoomsTitle: 'Aucune salle d\'exposition',
    noRoomsDesc: 'Le plan s\'affichera dès que des salles auront été ajoutées par l\'administrateur.'
  },
  zh: {
    floorPlanTitle: '平面导览与路线导航',
    floorPlanSubtitle: '交互式2D建筑地图：选择展厅查看移动方向与360°全景联动',
    viewOriginal: '查看原始平面图',
    navGuideBtn: '展厅导航',
    roomsCount: (n) => `${n} 个展厅`,
    doorsCount: (n) => `${n} 条连通门`,
    tabDetails: '展厅信息',
    tabNavigator: '路线导航',
    startPoint: '起点位置',
    endPoint: '目的地',
    gate1: '1号门',
    gate2: '2号门',
    octagonalHall: '八角接待大厅',
    courtyard: '内庭庭院',
    commonAreas: '出入口与公共区域',
    exhibitionRooms: '陈列展厅',
    findRoute: '查询路线',
    findingRoute: '正在规划路线...',
    distance: '距离',
    estimatedTime: (min) => `步行约 ${min} 分钟`,
    stepsCount: (n) => `${n} 个路段`,
    voiceGuide: '语音导航指引',
    playAudio: '播放语音',
    pauseAudio: '暂停',
    replayAudio: '重新播放',
    stepDetailsTitle: '具体行程路线：',
    clearRoute: '清除当前路线',
    iAmHere: '我在此展厅',
    guideMeHere: '导航至此',
    nextRooms: '通往相邻展厅',
    receptionOrCorridor: '接待区或主走廊连通',
    enter360: '进入360°全景体验',
    compassNorth: '北向 (N)',
    compassNorthDeg: (deg) => `北向 (${deg > 0 ? '+' : ''}${deg}°)`,
    zoomIn: '放大',
    zoomOut: '缩小',
    resetZoom: '还原比例',
    originalImageTitle: '原始平面图',
    noRoomsTitle: '暂无展厅数据',
    noRoomsDesc: '管理员在后台添加展厅后，平面图将自动呈现。'
  },
  ja: {
    floorPlanTitle: 'フロアマップ＆館内案内',
    floorPlanSubtitle: 'インタラクティブな2D間取り図：各展示室を選択して移動経路と360°ツアーを確認',
    viewOriginal: '元のフロア図を見る',
    navGuideBtn: '館内案内',
    roomsCount: (n) => `${n} 展示室`,
    doorsCount: (n) => `${n} 連絡通路`,
    tabDetails: '展示室情報',
    tabNavigator: '経路案内',
    startPoint: '出発地',
    endPoint: '目的地',
    gate1: '第1ゲート',
    gate2: '第2ゲート',
    octagonalHall: '八角ホール',
    courtyard: '中庭・パティオ',
    commonAreas: '出入口・共用エリア',
    exhibitionRooms: '展示室一覧',
    findRoute: 'ルートを検索',
    findingRoute: 'ルート検索中...',
    distance: '距離',
    estimatedTime: (min) => `徒歩約 ${min} 分`,
    stepsCount: (n) => `${n} 区間`,
    voiceGuide: '音声案内',
    playAudio: '音声を聞く',
    pauseAudio: '一時停止',
    replayAudio: 'もう一度再生',
    stepDetailsTitle: '移動手順：',
    clearRoute: 'ルートをリセット',
    iAmHere: '現在地に設定',
    guideMeHere: 'ここへのルート案内',
    nextRooms: '隣接する展示室への通路',
    receptionOrCorridor: '受付エリアまたは中央回廊経由',
    enter360: '360°ツアーを見る',
    compassNorth: '北 (N)',
    compassNorthDeg: (deg) => `北 (${deg > 0 ? '+' : ''}${deg}°)`,
    zoomIn: '拡大',
    zoomOut: '縮小',
    resetZoom: '標準サイズ',
    originalImageTitle: '元の平面図',
    noRoomsTitle: '展示室が登録されていません',
    noRoomsDesc: '管理者が展示室を登録すると、平面図が自動的に表示されます。'
  }
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
  const { currentLang } = useClientTranslation();
  const langKey = (currentLang || 'vi').toLowerCase();
  const ui = UI_STRINGS[langKey] || UI_STRINGS.vi;

  const [internalSelectedNodeId, setInternalSelectedNodeId] = useState<string>(
    externalSelectedNodeId || floorPlan.nodes?.[0]?.id || ''
  );
  const selectedNodeId = externalSelectedNodeId || internalSelectedNodeId;
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [showOriginalModal, setShowOriginalModal] = useState<boolean>(false);

  // Zoom & Pan
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

  // Sync selected node
  useEffect(() => {
    if (externalSelectedNodeId) {
      setInternalSelectedNodeId(externalSelectedNodeId);
    } else if (floorPlan.nodes?.length) {
      if (!floorPlan.nodes.some((n) => n.id === internalSelectedNodeId)) {
        setInternalSelectedNodeId(floorPlan.nodes[0].id);
      }
    }
  }, [floorPlan.nodes, externalSelectedNodeId]);

  const activeNode = useMemo(() => {
    return floorPlan.nodes?.find((n) => n.id === selectedNodeId) || floorPlan.nodes?.[0];
  }, [floorPlan.nodes, selectedNodeId]);

  const connectedEdges = useMemo(() => {
    if (!activeNode) return [];
    return (floorPlan.edges || []).filter((e) => e.fromNodeId === activeNode.id);
  }, [floorPlan.edges, activeNode]);

  // Tab: 'details' or 'navigator'
  const [sideTab, setSideTab] = useState<'details' | 'navigator'>('details');

  // Navigation state
  const [navStartNodeId, setNavStartNodeId] = useState<string>(() => {
    return externalSelectedNodeId || floorPlan.nodes?.[0]?.id || 'node_p_01';
  });
  const [navEndNodeId, setNavEndNodeId] = useState<string>('node_cong_1');
  const [navLoading, setNavLoading] = useState<boolean>(false);
  const [navResult, setNavResult] = useState<NavigationResult | null>(null);
  const [navError, setNavError] = useState<string | null>(null);

  // Audio player
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

  const speakFallback = useCallback((text?: string) => {
    if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsPlayingAudio(false);
      return;
    }
    window.speechSynthesis.cancel();
    const langTag =
      langKey === 'en' ? 'en-US' :
      langKey === 'fr' ? 'fr-FR' :
      langKey === 'zh' ? 'zh-CN' :
      langKey === 'ja' ? 'ja-JP' : 'vi-VN';

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = langTag;
    utter.rate = 0.95;

    if ('getVoices' in window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      const matched =
        voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(langKey)) ||
        voices.find((v) => v.lang.toLowerCase().includes(langKey));
      if (matched) {
        utter.voice = matched;
      }
    }

    utter.onstart = () => setIsPlayingAudio(true);
    utter.onend = () => setIsPlayingAudio(false);
    utter.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utter);
  }, [langKey]);

  const playVoiceAudio = useCallback((audioUrl?: string, text?: string) => {
    stopAudio();
    if (audioUrl) {
      const fullUrl = resolveImageUrl(audioUrl);
      const audio = new Audio(fullUrl);
      audioRef.current = audio;
      audio.onplay = () => setIsPlayingAudio(true);
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        speakFallback(text);
      };
      audio.play().catch(() => {
        speakFallback(text);
      });
    } else if (text) {
      speakFallback(text);
    }
  }, [speakFallback, stopAudio]);

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

  // Run navigation
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
        lang: langKey
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

  // Tự động đồng bộ ngôn ngữ: khi client đổi ngôn ngữ trong navbar, tính toán và phát lại giọng đọc theo ngôn ngữ mới ngay lập tức
  const prevLangRef = useRef<string>(langKey);
  useEffect(() => {
    if (prevLangRef.current !== langKey) {
      prevLangRef.current = langKey;
      if (navResult && navStartNodeId && navEndNodeId) {
        handleRunNavigation(navStartNodeId, navEndNodeId);
      }
    }
  }, [langKey, navResult, navStartNodeId, navEndNodeId]);

  const handleClearNavigation = () => {
    stopAudio();
    setNavResult(null);
    setNavError(null);
  };

  // Direction badge
  const getDirectionBadge = (dir: FloorPlanEdge['direction']) => {
    switch (dir) {
      case 'left':
        return { label: langKey === 'en' ? 'Turn left' : 'Rẽ trái', icon: <ArrowLeft size={13} /> };
      case 'right':
        return { label: langKey === 'en' ? 'Turn right' : 'Rẽ phải', icon: <ArrowRight size={13} /> };
      case 'front':
      case 'up':
        return { label: langKey === 'en' ? 'Go straight' : 'Đi thẳng', icon: <ArrowUp size={13} /> };
      case 'down':
        return { label: langKey === 'en' ? 'Go down' : 'Đi xuống', icon: <ArrowDown size={13} /> };
      case 'southwest':
        return { label: langKey === 'en' ? 'Down-left' : 'Xuống trái', icon: <ArrowDownLeft size={13} /> };
      case 'southeast':
        return { label: langKey === 'en' ? 'Down-right' : 'Xuống phải', icon: <ArrowDownRight size={13} /> };
      case 'northwest':
        return { label: langKey === 'en' ? 'Up-left' : 'Lên trái', icon: <ArrowUpLeft size={13} /> };
      case 'northeast':
        return { label: langKey === 'en' ? 'Up-right' : 'Lên phải', icon: <ArrowUpRight size={13} /> };
      case 'back':
        return { label: langKey === 'en' ? 'Turn back' : 'Quay lại', icon: <RotateCcw size={13} /> };
      default:
        return { label: langKey === 'en' ? 'Passage' : 'Lối sang', icon: <Navigation size={13} /> };
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
        return '↙';
      case 'southeast':
        return '↘';
      case 'northwest':
        return '↖';
      case 'northeast':
        return '↗';
      case 'back':
        return '↶';
      default:
        return '→';
    }
  };

  const getNodeDisplayNumber = (node: FloorPlanNode, fallbackIndex: number) => {
    const codeMatch = node.code?.match(/\d+/);
    if (codeMatch) return parseInt(codeMatch[0], 10);
    const nameMatch = node.name?.match(/(?:phòng|gian)\s*(\d+)/i);
    if (nameMatch) return parseInt(nameMatch[1], 10);
    return fallbackIndex + 1;
  };

  const getShortNodeName = (name: string) => {
    const clean = (name || '').trim();
    if (!clean) return 'Gian phòng';
    if (clean.length <= 16) return clean;
    return clean.slice(0, 15) + '…';
  };

  const getNodeBox = (node: FloorPlanNode) => {
    const width = node.width && node.width > 0 ? node.width : 14;
    const height = node.height && node.height > 0 ? node.height : 7.5;
    const x = typeof node.x === 'number' ? node.x : 0;
    const y = typeof node.y === 'number' ? node.y : 0;
    return { x, y, width, height };
  };

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

    const scale1 = Math.min(
      dx !== 0 ? Math.abs(hw1 / dx) : Infinity,
      dy !== 0 ? Math.abs(hh1 / dy) : Infinity
    );
    const p1x = c1x + dx * scale1;
    const p1y = c1y + dy * scale1;

    const scale2 = Math.min(
      dx !== 0 ? Math.abs(hw2 / dx) : Infinity,
      dy !== 0 ? Math.abs(hh2 / dy) : Infinity
    );
    const p2x = c2x - dx * scale2;
    const p2y = c2y - dy * scale2;

    const gap = Math.hypot(p2x - p1x, p2y - p1y);
    const ux = (p2x - p1x) / (gap || 1);
    const uy = (p2y - p1y) / (gap || 1);

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

  const navPathD = useMemo(() => {
    if (!navResult || !navResult.pathNodeIds || navResult.pathNodeIds.length < 2) return '';
    const points = navResult.pathNodeIds.map((id) => getNodeCenter(id));
    return points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [navResult, getNodeCenter]);

  const navStartPt = useMemo(() => {
    if (!navResult || !navResult.pathNodeIds?.length) return null;
    return getNodeCenter(navResult.pathNodeIds[0]);
  }, [navResult, getNodeCenter]);

  const navEndPt = useMemo(() => {
    if (!navResult || !navResult.pathNodeIds?.length) return null;
    return getNodeCenter(navResult.pathNodeIds[navResult.pathNodeIds.length - 1]);
  }, [navResult, getNodeCenter]);

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
          borderRadius: 12,
          border: `1px dashed ${isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}`,
          color: isLight ? '#64748B' : '#94A3B8'
        }}
      >
        <Building size={30} style={{ margin: '0 auto 10px auto', opacity: 0.5, color: '#C5A059' }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: isLight ? '#0F172A' : '#FFFFFF', marginBottom: 4 }}>
          {ui.noRoomsTitle}
        </div>
        <div style={{ fontSize: 13, maxWidth: 460, margin: '0 auto' }}>
          {ui.noRoomsDesc}
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
            {/* SÂN VƯỜN NỘI VIỆN */}
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
              <text x="56.5" y="29.8" textAnchor="middle" fill="#4ADE80" fontSize="1.1" fontWeight="600">
                SÂN VƯỜN NỘI VIỆN
              </text>
              <text x="56.5" y="32.0" textAnchor="middle" fill="#86EFAC" fontSize="0.75" opacity="0.85">
                Khuôn viên ngoài trời
              </text>
            </g>

            {/* CỔNG 1 */}
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
              <text x="50" y="90.5" textAnchor="middle" fill="#CBD5E1" fontSize="1.1" fontWeight="600">
                CỔNG 1
              </text>
              <line x1="50" y1="86.8" x2="50" y2="84.2" stroke="#D4A86A" strokeWidth="0.35" strokeDasharray="1, 0.8" />
            </g>

            {/* CỔNG 2 */}
            <g>
              <rect
                x="9"
                y="28"
                width="12"
                height="8"
                rx="1.2"
                fill="rgba(212, 168, 106, 0.06)"
                stroke="rgba(212, 168, 106, 0.25)"
                strokeWidth="0.3"
              />
              <text x="15" y="32.5" textAnchor="middle" fill="#D4A86A" fontSize="1.05" fontWeight="600">
                CỔNG 2
              </text>
            </g>

            {/* SẢNH BÁT GIÁC */}
            <g>
              <circle cx="50" cy="66.5" r="5.5" fill="rgba(212, 168, 106, 0.12)" stroke="#D4A86A" strokeWidth="0.4" strokeDasharray="1.2, 0.8" />
              <text x="50" y="66.2" textAnchor="middle" fill="#D4A86A" fontSize="0.95" fontWeight="600">
                SẢNH
              </text>
              <text x="50" y="68.0" textAnchor="middle" fill="#E2E8F0" fontSize="0.75">
                Bát Giác
              </text>
            </g>

            {/* EDGES */}
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
                  stroke="rgba(212, 168, 106, 0.4)"
                  strokeWidth={0.32}
                  strokeDasharray="1.4, 1.4"
                  markerEnd="url(#edge-arrow-prev)"
                />
              );
            })}

            {/* NODES */}
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
                    stroke={isHovered ? '#D4A86A' : (node.colorTag || '#D4A86A')}
                    strokeWidth={isHovered ? '0.5' : '0.3'}
                  />
                  <circle
                    cx={box.x + 2.2}
                    cy={box.y + 2.2}
                    r="1.3"
                    fill={node.colorTag || '#D4A86A'}
                  />
                  <text
                    x={box.x + 2.2}
                    y={box.y + 2.6}
                    textAnchor="middle"
                    fontSize="0.8"
                    fontWeight="bold"
                    fill="#0F141F"
                  >
                    {roomNumber}
                  </text>
                  <text
                    x={box.x + box.width / 2}
                    y={box.y + box.height / 2 + 0.35}
                    textAnchor="middle"
                    fontSize="0.85"
                    fontWeight="500"
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
        background: isLight ? '#FFFFFF' : '#0B0F19',
        border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
        color: isLight ? '#181C26' : '#F1F5F9'
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
              width: 32,
              height: 32,
              borderRadius: 6,
              background: isLight ? 'rgba(180, 138, 60, 0.1)' : 'rgba(212, 168, 106, 0.12)',
              border: `1px solid ${isLight ? 'rgba(180, 138, 60, 0.25)' : 'rgba(212, 168, 106, 0.25)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isLight ? '#8C6826' : '#D4A86A',
              flexShrink: 0
            }}
          >
            <Building size={16} />
          </div>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: isLight ? '#111827' : '#FFFFFF' }}>
              {floorPlan.title || ui.floorPlanTitle}
            </div>
            <div style={{ fontSize: 11.5, color: isLight ? '#64748B' : '#94A3B8', marginTop: 1 }}>
              {ui.floorPlanSubtitle}
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
                gap: 5,
                padding: '5px 10px',
                borderRadius: 5,
                fontSize: 11.5,
                fontWeight: 500,
                background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'}`,
                color: isLight ? '#475569' : '#CBD5E1',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Eye size={12} />
              <span>{ui.viewOriginal}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSideTab('navigator')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              borderRadius: 5,
              fontSize: 11.5,
              fontWeight: 600,
              background: sideTab === 'navigator' ? 'rgba(212, 168, 106, 0.16)' : 'rgba(212, 168, 106, 0.08)',
              border: `1px solid ${sideTab === 'navigator' ? '#D4A86A' : 'rgba(212, 168, 106, 0.25)'}`,
              color: '#D4A86A',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Navigation size={12} />
            <span>{ui.navGuideBtn}</span>
          </button>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 8px',
              borderRadius: 5,
              background: isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)'}`,
              fontSize: 11,
              fontWeight: 500,
              color: isLight ? '#64748B' : '#94A3B8'
            }}
          >
            <span>{ui.roomsCount(floorPlan.nodes.length)}</span>
            <span>•</span>
            <span>{ui.doorsCount(floorPlan.edges.length)}</span>
          </div>
        </div>
      </div>

      {/* Khu vực Hiển thị Mặt Bằng */}
      <div className="ifp-grid" style={hideSidePanel ? { display: 'block', gridTemplateColumns: '1fr' } : undefined}>
        {/* Canvas Sơ Đồ 2D Kiến Trúc */}
        <div
          className="ifp-canvas-card"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            background: isLight ? '#F8FAFC' : '#0E131E',
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
              <pattern id="arch-grid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path
                  d="M 5 0 L 0 0 0 5"
                  fill="none"
                  stroke={isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.025)'}
                  strokeWidth="0.2"
                />
              </pattern>

              <marker
                id="edge-arrow-active"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="3"
                markerHeight="3"
                orient="auto"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 Z" fill={isLight ? '#B45309' : '#D4A86A'} />
              </marker>

              <marker
                id="edge-arrow-default"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="2.3"
                markerHeight="2.3"
                orient="auto"
              >
                <path
                  d="M 0 1.5 L 7 5 L 0 8.5 Z"
                  fill={isLight ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)'}
                />
              </marker>
            </defs>

            <rect width="100" height="100" fill="url(#arch-grid)" />

            <g
              transform={`translate(${pan.x / 4}, ${pan.y / 4}) scale(${zoom})`}
              style={{
                transformOrigin: '50% 50%',
                transition: isPanning ? 'none' : 'transform 0.18s ease-out'
              }}
            >
              {/* 1. SÂN VƯỜN NỘI VIỆN */}
              {(() => {
                const isSanVuonInNav = isNodeInRoute('node_san_vuon');
                return (
                  <g
                    style={{ cursor: 'pointer' }}
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
                      fill={isSanVuonInNav ? 'rgba(34, 197, 94, 0.12)' : isLight ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.06)'}
                      stroke={isSanVuonInNav ? '#D4A86A' : isLight ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.2)'}
                      strokeWidth={isSanVuonInNav ? 0.6 : 0.3}
                      strokeDasharray={isSanVuonInNav ? undefined : '1, 1'}
                    />
                    <circle cx="56.5" cy="30" r="3.2" fill={isLight ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.1)'} />
                    <text
                      x="56.5"
                      y="29.8"
                      textAnchor="middle"
                      fill={isLight ? '#15803D' : '#4ADE80'}
                      fontSize="1.1"
                      fontWeight="600"
                    >
                      SÂN VƯỜN NỘI VIỆN
                    </text>
                    <text
                      x="56.5"
                      y="32.0"
                      textAnchor="middle"
                      fill={isLight ? '#16A34A' : '#86EFAC'}
                      fontSize="0.75"
                      opacity="0.85"
                    >
                      Khuôn viên ngoài trời
                    </text>
                  </g>
                );
              })()}

              {/* 2. CỔNG 1 */}
              {(() => {
                const isCong1InNav = isNodeInRoute('node_cong_1');
                return (
                  <g
                    style={{ cursor: 'pointer' }}
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
                      fill={isCong1InNav ? 'rgba(212, 168, 106, 0.14)' : isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)'}
                      stroke={isCong1InNav ? '#D4A86A' : selectedNodeId === 'node_cong_1' ? '#D4A86A' : isLight ? 'rgba(0, 0, 0, 0.18)' : 'rgba(255, 255, 255, 0.18)'}
                      strokeWidth={isCong1InNav || selectedNodeId === 'node_cong_1' ? '0.55' : '0.3'}
                    />
                    <text
                      x="50"
                      y="90.2"
                      textAnchor="middle"
                      fill={isCong1InNav ? '#D4A86A' : isLight ? '#475569' : '#CBD5E1'}
                      fontSize="1.1"
                      fontWeight="600"
                    >
                      CỔNG 1
                    </text>
                    <text
                      x="50"
                      y="91.8"
                      textAnchor="middle"
                      fill={isLight ? '#64748B' : '#94A3B8'}
                      fontSize="0.72"
                    >
                      Nguyễn Bỉnh Khiêm
                    </text>
                    <line
                      x1="50"
                      y1="86.8"
                      x2="50"
                      y2="84.2"
                      stroke="#D4A86A"
                      strokeWidth="0.35"
                      strokeDasharray="1, 0.8"
                    />
                  </g>
                );
              })()}

              {/* 3. CỔNG 2 */}
              {(() => {
                const isCong2InNav = isNodeInRoute('node_cong_2');
                return (
                  <g
                    style={{ cursor: 'pointer' }}
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
                      fill={isCong2InNav ? 'rgba(212, 168, 106, 0.14)' : 'rgba(255, 255, 255, 0.04)'}
                      stroke={isCong2InNav ? '#D4A86A' : selectedNodeId === 'node_cong_2' ? '#D4A86A' : 'rgba(255, 255, 255, 0.18)'}
                      strokeWidth={isCong2InNav || selectedNodeId === 'node_cong_2' ? '0.55' : '0.3'}
                    />
                    <text
                      x="15"
                      y="32.0"
                      textAnchor="middle"
                      fill={isCong2InNav ? '#D4A86A' : isLight ? '#334155' : '#CBD5E1'}
                      fontSize="1.05"
                      fontWeight="600"
                    >
                      CỔNG 2
                    </text>
                    <text
                      x="15"
                      y="33.8"
                      textAnchor="middle"
                      fill={isLight ? '#64748B' : '#94A3B8'}
                      fontSize="0.72"
                    >
                      Thảo Cầm Viên
                    </text>
                  </g>
                );
              })()}

              {/* 4. SẢNH BÁT GIÁC */}
              {(() => {
                const isSanhInNav = isNodeInRoute('node_sanh');
                return (
                  <g
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setInternalSelectedNodeId('node_sanh');
                      onNodeSelect?.('node_sanh');
                    }}
                  >
                    <circle
                      cx="50"
                      cy="66.5"
                      r="5.5"
                      fill={isSanhInNav ? 'rgba(212, 168, 106, 0.2)' : isLight ? 'rgba(212, 168, 106, 0.12)' : 'rgba(212, 168, 106, 0.1)'}
                      stroke={isSanhInNav ? '#D4A86A' : selectedNodeId === 'node_sanh' ? '#D4A86A' : '#D4A86A'}
                      strokeWidth={isSanhInNav || selectedNodeId === 'node_sanh' ? '0.6' : '0.35'}
                      strokeDasharray={isSanhInNav ? undefined : '1.2, 0.8'}
                    />
                    <text
                      x="50"
                      y="66.0"
                      textAnchor="middle"
                      fill={isLight ? '#B45309' : '#D4A86A'}
                      fontSize="0.95"
                      fontWeight="600"
                    >
                      SẢNH
                    </text>
                    <text
                      x="50"
                      y="67.8"
                      textAnchor="middle"
                      fill={isLight ? '#64748B' : '#CBD5E1'}
                      fontSize="0.72"
                    >
                      Bát Giác
                    </text>
                  </g>
                );
              })()}

              {/* 5. CÁC ĐƯỜNG KẾT NỐI (EDGES) */}
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
                          : isLight ? 'rgba(0, 0, 0, 0.22)' : 'rgba(255, 255, 255, 0.25)'
                      }
                      strokeWidth={isConnectedToActive ? 0.65 : 0.3}
                      strokeDasharray={isConnectedToActive ? '2.0, 1.0' : '1.4, 1.4'}
                      markerEnd={isConnectedToActive ? 'url(#edge-arrow-active)' : 'url(#edge-arrow-default)'}
                      opacity={isConnectedToActive ? 1 : 0.6}
                    />

                    {isOutgoing && dirLabel && (
                      <g transform={`translate(${geom.midX}, ${geom.midY})`}>
                        <rect
                          x="-3.6"
                          y="-1.1"
                          width="7.2"
                          height="2.2"
                          rx="0.4"
                          fill={isLight ? '#FFFFFF' : '#111622'}
                          stroke={isLight ? 'rgba(180, 83, 9, 0.35)' : 'rgba(212, 168, 106, 0.4)'}
                          strokeWidth="0.2"
                        />
                        <text
                          x="0"
                          y="0.4"
                          textAnchor="middle"
                          fontSize="0.8"
                          fontWeight="600"
                          fill={isLight ? '#B45309' : '#D4A86A'}
                        >
                          {dirLabel}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* 5b. ĐƯỜNG DẪN LỘ TRÌNH (TINH TẾ, KHÔNG MÀU MÈ) */}
              {navPathD && (
                <path
                  d={navPathD}
                  fill="none"
                  stroke="#D4A86A"
                  strokeWidth="0.75"
                  className="ifp-svg-nav-path"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Điểm xuất phát (pin marker tinh tế) */}
              {navStartPt && (
                <g>
                  <circle
                    cx={navStartPt.x}
                    cy={navStartPt.y}
                    r="2.2"
                    fill="none"
                    stroke="#D4A86A"
                    strokeWidth="0.4"
                  />
                  <circle
                    cx={navStartPt.x}
                    cy={navStartPt.y}
                    r="1.2"
                    fill="#D4A86A"
                  />
                </g>
              )}

              {/* Điểm đến (pin marker tinh tế) */}
              {navEndPt && (
                <g>
                  <circle
                    cx={navEndPt.x}
                    cy={navEndPt.y}
                    r="2.2"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="0.4"
                  />
                  <circle
                    cx={navEndPt.x}
                    cy={navEndPt.y}
                    r="1.2"
                    fill="#E2E8F0"
                  />
                </g>
              )}

              {/* 6. CÁC GIAN PHÒNG (NODES) - RÕ RÀNG, ĐẦY ĐỦ KHÔNG BỊ LÀM TỐI */}
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
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Hộp phòng */}
                    <rect
                      x={box.x}
                      y={box.y}
                      width={box.width}
                      height={box.height}
                      rx="1.4"
                      fill={
                        isSelected
                          ? isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(26, 35, 50, 0.96)'
                          : isInNav
                          ? isLight ? 'rgba(254, 249, 235, 0.95)' : 'rgba(22, 30, 44, 0.94)'
                          : isHovered
                          ? isLight ? 'rgba(248, 250, 252, 0.95)' : 'rgba(20, 27, 40, 0.92)'
                          : isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(15, 20, 30, 0.88)'
                      }
                      stroke={
                        isSelected
                          ? isLight ? '#B45309' : '#D4A86A'
                          : isInNav
                          ? '#D4A86A'
                          : isHovered
                          ? isLight ? '#94A3B8' : '#64748B'
                          : isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'
                      }
                      strokeWidth={isSelected || isInNav ? 0.6 : 0.28}
                    />

                    {/* Badge số chặng trên lộ trình */}
                    {isInNav && !isNavStart && !isNavEnd && (
                      <g transform={`translate(${box.x + box.width - 2.8}, ${box.y + box.height - 2.8})`}>
                        <circle cx="1.2" cy="1.2" r="1.15" fill="#D4A86A" />
                        <text
                          x="1.2"
                          y="1.55"
                          fill="#0B0F19"
                          fontSize="0.75"
                          fontWeight="600"
                          textAnchor="middle"
                        >
                          {stepIdx + 1}
                        </text>
                      </g>
                    )}

                    {/* Badge số phòng */}
                    <circle
                      cx={box.width < 9 ? box.x + box.width / 2 : box.x + 2.2}
                      cy={box.width < 9 ? box.y + 2.3 : box.y + 2.2}
                      r="1.25"
                      fill={isSelected ? (isLight ? '#B45309' : '#D4A86A') : isLight ? '#E2E8F0' : '#232D3F'}
                    />
                    <text
                      x={box.width < 9 ? box.x + box.width / 2 : box.x + 2.2}
                      y={box.width < 9 ? box.y + 2.7 : box.y + 2.65}
                      fill={isSelected ? '#FFFFFF' : isLight ? '#334155' : '#CBD5E1'}
                      fontSize={box.width < 9 ? '0.85' : '0.95'}
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {roomNumber}
                    </text>

                    {/* Mã phòng vắn tắt góc phải */}
                    {box.width >= 10 && !node.roomId && (
                      <text
                        x={box.x + box.width - 1.2}
                        y={box.y + 2.6}
                        fill={isSelected ? (isLight ? '#B45309' : '#D4A86A') : isLight ? '#64748B' : '#94A3B8'}
                        fontSize="0.75"
                        fontWeight="500"
                        textAnchor="end"
                      >
                        {node.code}
                      </text>
                    )}

                    {/* Chỉ báo 360 */}
                    {node.roomId && (
                      <g transform={`translate(${box.x + box.width - 3.2}, ${box.y + 1.2})`}>
                        <rect
                          width="2.4"
                          height="1.3"
                          rx="0.3"
                          fill="rgba(212, 168, 106, 0.2)"
                          stroke="rgba(212, 168, 106, 0.5)"
                          strokeWidth="0.2"
                        />
                        <text
                          x="1.2"
                          y="0.95"
                          fill="#D4A86A"
                          fontSize="0.65"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          360°
                        </text>
                      </g>
                    )}

                    {/* Tên gian phòng */}
                    <text
                      x={box.x + box.width / 2}
                      y={box.height > 12 ? box.y + box.height / 2 + 1.2 : box.y + box.height - 1.8}
                      fill={isSelected ? (isLight ? '#0F172A' : '#FFFFFF') : isLight ? '#334155' : '#E2E8F0'}
                      fontSize={box.width < 9 ? '0.8' : '0.9'}
                      fontWeight={isSelected ? '600' : '400'}
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
            title={floorPlan.compassOrientation?.description || 'Hướng Bắc'}
          >
            <Compass
              size={12}
              style={{
                transform: `rotate(${floorPlan.compassOrientation?.northAngleDeg || 0}deg)`,
                transition: 'transform 0.4s ease'
              }}
            />
            <span className="ifp-compass-text">
              {floorPlan.compassOrientation?.detected && floorPlan.compassOrientation.northAngleDeg !== 0
                ? ui.compassNorthDeg(floorPlan.compassOrientation.northAngleDeg)
                : ui.compassNorth}
            </span>
          </div>

          {/* Bộ công cụ Zoom & Pan */}
          <div className="ifp-canvas-controls">
            <button
              type="button"
              className="ifp-ctrl-btn"
              onClick={handleZoomIn}
              title={ui.zoomIn}
              aria-label={ui.zoomIn}
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              className="ifp-ctrl-btn"
              onClick={handleZoomOut}
              title={ui.zoomOut}
              aria-label={ui.zoomOut}
              disabled={zoom <= 1}
            >
              <ZoomOut size={13} />
            </button>
            {zoom > 1 && (
              <button
                type="button"
                className="ifp-ctrl-btn"
                onClick={handleResetZoom}
                title={ui.resetZoom}
                aria-label={ui.resetZoom}
              >
                <RotateCcw size={11} />
              </button>
            )}
          </div>
        </div>

        {/* Panel Chi Tiết & Dẫn Đường */}
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
                <Building size={12} />
                <span>{ui.tabDetails}</span>
              </button>
              <button
                type="button"
                className={`ifp-tab-btn ${sideTab === 'navigator' ? 'active' : ''}`}
                onClick={() => setSideTab('navigator')}
              >
                <Navigation size={12} />
                <span>{ui.tabNavigator}</span>
              </button>
            </div>

            {sideTab === 'details' ? (
              /* TAB 1: THÔNG TIN GIAN PHÒNG */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                {activeNode ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(212, 168, 106, 0.12)',
                          color: isLight ? '#334155' : '#D4A86A',
                          fontSize: 10.5,
                          fontWeight: 600
                        }}
                      >
                        {activeNode.code}
                      </span>
                      <span style={{ fontSize: 11.5, color: isLight ? '#64748B' : '#94A3B8' }}>
                        {activeNode.category || 'Gian Trưng Bày'}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: isLight ? '#0F172A' : '#FFFFFF',
                        margin: '0 0 3px 0',
                        lineHeight: 1.35
                      }}
                    >
                      {activeNode.name}
                    </h3>

                    <div style={{ fontSize: 12, color: isLight ? '#64748B' : '#94A3B8', marginBottom: 12 }}>
                      {activeNode.period || 'Hiện vật trưng bày lịch sử'}
                    </div>

                    {/* Phím tắt chỉ đường nhanh */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
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
                          gap: 4,
                          padding: '6px 8px',
                          borderRadius: 5,
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          background: 'rgba(255, 255, 255, 0.03)',
                          color: '#CBD5E1',
                          fontSize: 11,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <MapPin size={11} />
                        <span>{ui.iAmHere}</span>
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
                          gap: 4,
                          padding: '6px 8px',
                          borderRadius: 5,
                          border: '1px solid rgba(212, 168, 106, 0.3)',
                          background: 'rgba(212, 168, 106, 0.1)',
                          color: '#D4A86A',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Navigation size={11} />
                        <span>{ui.guideMeHere}</span>
                      </button>
                    </div>

                    {/* Lối đi sang các phòng kế tiếp */}
                    <div
                      style={{
                        borderTop: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)'}`,
                        paddingTop: 10
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: isLight ? '#475569' : '#CBD5E1',
                          marginBottom: 6
                        }}
                      >
                        {ui.nextRooms} ({connectedEdges.length}):
                      </div>

                      {connectedEdges.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 180, overflowY: 'auto' }}>
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
                                  padding: '6px 8px',
                                  background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.02)',
                                  border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)'}`,
                                  borderRadius: 5,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                  <span style={{ color: '#D4A86A', display: 'flex', flexShrink: 0 }}>
                                    {badge.icon}
                                  </span>
                                  <div>
                                    <div style={{ fontSize: 9.5, color: isLight ? '#64748B' : '#94A3B8' }}>
                                      {badge.label}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 11.5,
                                        fontWeight: 500,
                                        color: isLight ? '#1E293B' : '#F1F5F9'
                                      }}
                                    >
                                      {targetName}
                                    </div>
                                  </div>
                                </div>
                                <ArrowRight size={12} style={{ color: isLight ? '#94A3B8' : '#64748B', flexShrink: 0 }} />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ fontSize: 11.5, color: isLight ? '#64748B' : '#94A3B8' }}>
                          {ui.receptionOrCorridor}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '36px 0', color: isLight ? '#64748B' : '#94A3B8' }}>
                    <Info size={20} style={{ margin: '0 auto 6px auto', opacity: 0.6 }} />
                    <div style={{ fontSize: 12.5 }}>Chọn một gian phòng trên sơ đồ để xem thông tin</div>
                  </div>
                )}

                {/* Nút Khám Phá Tour 360° */}
                <div style={{ marginTop: 10 }}>
                  {activeNode?.roomId && onSelectRoom360 && (
                    <button
                      type="button"
                      onClick={() => onSelectRoom360(activeNode.roomId!)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        background: '#D4A86A',
                        color: '#0B0E14',
                        border: 'none',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#DFB77D'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#D4A86A'; }}
                    >
                      <Eye size={13} />
                      <span>{ui.enter360}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* TAB 2: CHỈ ĐƯỜNG THAM QUAN */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
                {/* Điểm xuất phát */}
                <div className="ifp-nav-field">
                  <label className="ifp-nav-label">
                    <MapPin size={11} style={{ color: '#D4A86A' }} />
                    <span>{ui.startPoint}</span>
                  </label>
                  <select
                    className="ifp-nav-select"
                    value={navStartNodeId}
                    onChange={(e) => setNavStartNodeId(e.target.value)}
                  >
                    <optgroup label={ui.commonAreas}>
                      <option value="node_cong_1">{ui.gate1} (Nguyễn Bỉnh Khiêm)</option>
                      <option value="node_cong_2">{ui.gate2} (Thảo Cầm Viên)</option>
                      <option value="node_sanh">{ui.octagonalHall}</option>
                      <option value="node_san_vuon">{ui.courtyard}</option>
                    </optgroup>
                    <optgroup label={ui.exhibitionRooms}>
                      {(floorPlan.nodes || []).map((n, idx) => (
                        <option key={n.id} value={n.id}>
                          {n.code || `P-${idx + 1}`} - {n.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Điểm đến */}
                <div className="ifp-nav-field">
                  <label className="ifp-nav-label">
                    <Navigation size={11} style={{ color: '#CBD5E1' }} />
                    <span>{ui.endPoint}</span>
                  </label>
                  <select
                    className="ifp-nav-select"
                    value={navEndNodeId}
                    onChange={(e) => setNavEndNodeId(e.target.value)}
                  >
                    <optgroup label={ui.commonAreas}>
                      <option value="node_cong_1">{ui.gate1} (Nguyễn Bỉnh Khiêm)</option>
                      <option value="node_cong_2">{ui.gate2} (Thảo Cầm Viên)</option>
                      <option value="node_sanh">{ui.octagonalHall}</option>
                      <option value="node_san_vuon">{ui.courtyard}</option>
                    </optgroup>
                    <optgroup label={ui.exhibitionRooms}>
                      {(floorPlan.nodes || []).map((n, idx) => (
                        <option key={n.id} value={n.id}>
                          {n.code || `P-${idx + 1}`} - {n.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  {/* Phím tắt điểm đến */}
                  <div className="ifp-nav-chips">
                    <button
                      type="button"
                      className="ifp-nav-chip"
                      onClick={() => {
                        setNavEndNodeId('node_cong_1');
                        handleRunNavigation(navStartNodeId, 'node_cong_1');
                      }}
                    >
                      {ui.gate1}
                    </button>
                    <button
                      type="button"
                      className="ifp-nav-chip"
                      onClick={() => {
                        setNavEndNodeId('node_cong_2');
                        handleRunNavigation(navStartNodeId, 'node_cong_2');
                      }}
                    >
                      {ui.gate2}
                    </button>
                    <button
                      type="button"
                      className="ifp-nav-chip"
                      onClick={() => {
                        setNavEndNodeId('node_sanh');
                        handleRunNavigation(navStartNodeId, 'node_sanh');
                      }}
                    >
                      {ui.octagonalHall}
                    </button>
                    <button
                      type="button"
                      className="ifp-nav-chip"
                      onClick={() => {
                        setNavEndNodeId('node_san_vuon');
                        handleRunNavigation(navStartNodeId, 'node_san_vuon');
                      }}
                    >
                      {ui.courtyard}
                    </button>
                  </div>
                </div>

                {/* Nút tìm đường */}
                <button
                  type="button"
                  className="ifp-nav-submit-btn"
                  onClick={() => handleRunNavigation()}
                  disabled={navLoading}
                >
                  {navLoading ? (
                    <span>{ui.findingRoute}</span>
                  ) : (
                    <>
                      <Navigation size={12} />
                      <span>{ui.findRoute}</span>
                    </>
                  )}
                </button>

                {navError && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: 5,
                      padding: '7px 9px',
                      color: '#F87171',
                      fontSize: 11.5,
                      marginTop: 6
                    }}
                  >
                    {navError}
                  </div>
                )}

                {/* Kết quả Dẫn đường & Audio Guide Card */}
                {navResult && (
                  <div style={{ marginTop: 10 }}>
                    {/* Thống kê lộ trình - dạng 1 dòng thanh lịch */}
                    <div className="ifp-nav-summary-row">
                      <span className="ifp-nav-sum-item">
                        <span>{ui.distance}:</span>
                        <strong className="ifp-sum-val">~{Math.round(navResult.totalDistance)}m</strong>
                      </span>
                      <span className="ifp-sum-divider">•</span>
                      <span className="ifp-nav-sum-item">
                        <span>{ui.estimatedTime(navResult.estimatedMinutes)}</span>
                      </span>
                      <span className="ifp-sum-divider">•</span>
                      <span className="ifp-nav-sum-item">
                        <strong className="ifp-sum-val">{ui.stepsCount(navResult.steps.length)}</strong>
                      </span>
                    </div>

                    {/* Audio Guide Card chuẩn bảo tàng */}
                    <div className="ifp-voice-card">
                      <div className="ifp-voice-header">
                        <div className="ifp-voice-title">
                          <Volume2 size={13} />
                          <span>{ui.voiceGuide}</span>
                          <span
                            style={{
                              fontSize: 9.5,
                              padding: '1px 4px',
                              borderRadius: 3,
                              background: 'rgba(212, 168, 106, 0.15)',
                              color: '#D4A86A',
                              fontWeight: 600
                            }}
                          >
                            {langKey.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="ifp-voice-text">
                        {navResult.instructionSummary}
                      </div>

                      <div className="ifp-voice-actions">
                        <button
                          type="button"
                          className={`ifp-voice-btn ${isPlayingAudio ? 'active' : ''}`}
                          onClick={togglePlayAudio}
                        >
                          {isPlayingAudio ? (
                            <>
                              <Pause size={11} />
                              <span>{ui.pauseAudio}</span>
                            </>
                          ) : (
                            <>
                              <Play size={11} />
                              <span>{ui.playAudio}</span>
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
                          <RotateCcw size={10} />
                          <span>{ui.replayAudio}</span>
                        </button>
                      </div>
                    </div>

                    {/* Danh sách các chặng */}
                    <div style={{ marginTop: 8 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#CBD5E1',
                          marginBottom: 5
                        }}
                      >
                        {ui.stepDetailsTitle}
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 1 }}>
                                  <span style={{ color: '#D4A86A' }}>{badge.icon}</span>
                                  <span style={{ fontWeight: 500, color: '#F1F5F9' }}>
                                    {step.toNodeName}
                                  </span>
                                </div>
                                <div style={{ fontSize: 10.5, color: '#94A3B8', lineHeight: 1.35 }}>
                                  {step.instruction}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Đặt lại chỉ đường */}
                    <button
                      type="button"
                      onClick={handleClearNavigation}
                      style={{
                        width: '100%',
                        marginTop: 8,
                        padding: '6px 8px',
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: 5,
                        color: '#94A3B8',
                        fontSize: 11,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#F1F5F9';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#94A3B8';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      }}
                    >
                      {ui.clearRoute}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Xem Ảnh Sơ Đồ Gốc */}
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
              borderRadius: 10,
              padding: 12,
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>
                {ui.originalImageTitle}
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
                  fontWeight: 600,
                  padding: '2px 6px'
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
                borderRadius: 6
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
