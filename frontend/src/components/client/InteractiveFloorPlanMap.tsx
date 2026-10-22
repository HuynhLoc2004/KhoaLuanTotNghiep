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
import { FloorPlanMap, FloorPlanNode, FloorPlanEdge, NavigationResult, MuseumRoom } from '../../types';
import { useClientTranslation } from '../../context/ClientTranslationContext';
import { api, API_ROOT } from '../../services/api';
import './interactiveFloorPlanMap.css';

interface InteractiveFloorPlanMapProps {
  floorPlan: FloorPlanMap;
  onSelectRoom360?: (roomId: string) => void;
  clientTheme?: 'light' | 'dark';
  hideSidePanel?: boolean;
  hideLegend?: boolean;
  selectedNodeId?: string;
  onNodeSelect?: (nodeId: string) => void;
  previewMode?: boolean;
  rooms?: MuseumRoom[];
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

export const AUTHENTIC_HERITAGE_ROOMS_MAP: Record<string, { x: number; y: number; width: number; height: number; num: number; name: string; period: string }> = {
  'node_p_01': { x: 33.9, y: 66.1, width: 17.1, height: 8.7, num: 1, name: 'Thời Nguyên thủy', period: 'Thời kỳ tiền sử & sơ sử' },
  'node_p_02': { x: 24.8, y: 66.1, width: 9.0, height: 8.7, num: 2, name: 'Thời dựng nước và giữ nước', period: 'Hùng Vương - An Dương Vương' },
  'node_p_03': { x: 24.8, y: 56.1, width: 9.0, height: 10.0, num: 3, name: 'Thời Ngô - Đinh - Tiền Lê', period: 'Thế kỷ X - Độc lập tự chủ' },
  'node_p_04': { x: 24.8, y: 47.4, width: 9.0, height: 8.7, num: 4, name: 'Thời Lý', period: 'Thế kỷ XI - XIII: Văn minh Đại Việt' },
  'node_p_05': { x: 33.9, y: 47.4, width: 18.1, height: 8.7, num: 5, name: 'Thời Trần - Hồ', period: 'Thế kỷ XIII - XV: Ba lần đại thắng Nguyên Mông' },
  'node_p_06': { x: 33.9, y: 15.5, width: 7.1, height: 27.4, num: 6, name: 'Văn hóa Champa', period: 'Thế kỷ II - XVII: Di sản văn hóa Chămpa' },
  'node_p_07': { x: 41.0, y: 5.8, width: 31.3, height: 13.2, num: 7, name: 'Văn hóa Óc Eo', period: 'Thế kỷ I - VII: Vương quốc Phù Nam cổ' },
  'node_p_08': { x: 72.3, y: 8.1, width: 8.4, height: 7.4, num: 8, name: 'Điêu khắc đá Campuchia', period: 'Thế kỷ IX - XIII: Nghệ thuật điêu khắc Khmer cổ' },
  'node_p_09': { x: 73.5, y: 15.5, width: 7.1, height: 16.5, num: 9, name: 'Thời Lê - Mạc, Trịnh - Nguyễn', period: 'Thế kỷ XV - XVIII: Hậu Lê và phân tranh' },
  'node_p_10': { x: 73.5, y: 31.9, width: 7.1, height: 11.0, num: 10, name: 'Thời Tây Sơn', period: '1778 - 1802: Phong trào khởi nghĩa Tây Sơn' },
  'node_p_11': { x: 80.6, y: 21.9, width: 6.5, height: 21.0, num: 11, name: 'Súng Thần công - Đại bác', period: 'Thế kỷ XVIII - XIX: Vũ khí quân sự cổ' },
  'node_p_12': { x: 61.9, y: 47.4, width: 18.1, height: 8.7, num: 12, name: 'Thời Nguyễn', period: '1802 - 1945: Triều đại phong kiến cuối cùng' },
  'node_p_13': { x: 80.0, y: 47.4, width: 9.4, height: 8.7, num: 13, name: 'Sưu tập Dương Hà', period: 'Cổ vật quý hiếm do gia đình Dương Hà hiến tặng' },
  'node_p_14': { x: 80.0, y: 56.1, width: 9.4, height: 10.0, num: 14, name: 'Thương mại hàng hải - Gốm sứ', period: 'Thế kỷ XIV - XVIII: Gốm sứ tàu đắm biển Đông' },
  'node_p_15': { x: 89.4, y: 56.1, width: 7.1, height: 9.4, num: 15, name: 'Cổ vật tàu đắm biển Đông', period: 'Di vật từ những con tàu đắm ngoài khơi' },
  'node_p_16': { x: 80.6, y: 66.1, width: 8.7, height: 8.7, num: 16, name: 'Sưu tập Vương Hồng Sển', period: 'Đồ cổ, gốm sứ độc bản học giả Vương Hồng Sển' },
  'node_p_17': { x: 61.9, y: 66.1, width: 18.7, height: 8.7, num: 17, name: 'Dân tộc phía Nam Việt Nam', period: 'Bản sắc văn hóa các dân tộc phương Nam' },
  'node_p_18': { x: 51.9, y: 41.9, width: 10.0, height: 10.6, num: 18, name: 'Tượng Phật giáo Châu Á', period: 'Nghệ thuật Phật giáo các quốc gia Châu Á' },
  'node_sanh': { x: 48.7, y: 52.6, width: 16.5, height: 12.9, num: 103, name: 'Sảnh Bát Giác', period: 'Trung tâm phân luồng & đón tiếp' },
  'node_san_vuon': { x: 41.0, y: 19.0, width: 32.6, height: 22.9, num: 104, name: 'Sân vườn nội viện', period: 'Khuôn viên xanh & Hồ rối nước' },
  'node_cong_1': { x: 51.0, y: 74.8, width: 11.6, height: 13.5, num: 101, name: 'Cổng 1 (Nguyễn Bỉnh Khiêm)', period: 'Cổng chính vào bảo tàng' },
  'node_cong_2': { x: 9.4, y: 22.6, width: 8.1, height: 11.6, num: 102, name: 'Cổng 2 (Thảo Cầm Viên)', period: 'Cổng phụ Tây Bắc' }
};

export const AUTHENTIC_HERITAGE_ROOMS_LIST = [
  { num: 1, id: 'node_p_01', code: 'P-01', nameVi: 'Thời Nguyên thủy', nameEn: 'Prehistoric period', period: 'Thời kỳ tiền sử & sơ sử' },
  { num: 2, id: 'node_p_02', code: 'P-02', nameVi: 'Thời dựng nước và giữ nước', nameEn: 'The first period of founding and struggling for independence', period: 'Hùng Vương - An Dương Vương' },
  { num: 3, id: 'node_p_03', code: 'P-03', nameVi: 'Thời Ngô - Đinh - Tiền Lê', nameEn: 'Ngo - Dinh - Earlier Le dynasties', period: 'Thế kỷ X - Độc lập tự chủ' },
  { num: 4, id: 'node_p_04', code: 'P-04', nameVi: 'Thời Lý', nameEn: 'Ly dynasty', period: 'Thế kỷ XI - XIII: Văn minh Đại Việt' },
  { num: 5, id: 'node_p_05', code: 'P-05', nameVi: 'Thời Trần - Hồ', nameEn: 'Tran - Ho dynasties', period: 'Thế kỷ XIII - XV: Ba lần đại thắng Nguyên Mông' },
  { num: 6, id: 'node_p_06', code: 'P-06', nameVi: 'Văn hóa Champa', nameEn: 'Champa culture', period: 'Thế kỷ II - XVII: Di sản văn hóa Chămpa' },
  { num: 7, id: 'node_p_07', code: 'P-07', nameVi: 'Văn hóa Óc Eo', nameEn: 'Oc Eo culture', period: 'Thế kỷ I - VII: Vương quốc Phù Nam cổ' },
  { num: 8, id: 'node_p_08', code: 'P-08', nameVi: 'Điêu khắc đá Campuchia', nameEn: 'Stone sculpture of Cambodia', period: 'Thế kỷ IX - XIII: Nghệ thuật Khmer cổ' },
  { num: 9, id: 'node_p_09', code: 'P-09', nameVi: 'Thời Lê - Mạc, Trịnh - Nguyễn', nameEn: 'Later Le - Mac - Trinh - Nguyen dynasties', period: 'Thế kỷ XV - XVIII: Hậu Lê và phân tranh' },
  { num: 10, id: 'node_p_10', code: 'P-10', nameVi: 'Thời Tây Sơn', nameEn: 'Tay Son dynasty', period: '1778 - 1802: Phong trào khởi nghĩa Tây Sơn' },
  { num: 11, id: 'node_p_11', code: 'P-11', nameVi: 'Súng Thần công - Đại bác', nameEn: 'Cannons & Artilleries', period: 'Thế kỷ XVIII - XIX: Vũ khí quân sự cổ' },
  { num: 12, id: 'node_p_12', code: 'P-12', nameVi: 'Thời Nguyễn', nameEn: 'Nguyen dynasty', period: '1802 - 1945: Triều đại phong kiến cuối cùng' },
  { num: 13, id: 'node_p_13', code: 'P-13', nameVi: 'Sưu tập Dương Hà', nameEn: 'Duong Ha collection', period: 'Cổ vật quý hiếm do gia đình hiến tặng' },
  { num: 14, id: 'node_p_14', code: 'P-14', nameVi: 'Thương mại hàng hải - Gốm sứ', nameEn: 'Maritime trade - Shipwrecked ceramics', period: 'Thế kỷ XIV - XVIII: Gốm sứ thương mại' },
  { num: 15, id: 'node_p_15', code: 'P-15', nameVi: 'Cổ vật tàu đắm biển Đông', nameEn: 'Shipwrecked ceramics in Vietnam waters', period: 'Di vật từ những con tàu đắm ngoài khơi' },
  { num: 16, id: 'node_p_16', code: 'P-16', nameVi: 'Sưu tập Vương Hồng Sển', nameEn: 'Vuong Hong Sen collection', period: 'Đồ cổ, gốm sứ độc bản của học giả' },
  { num: 17, id: 'node_p_17', code: 'P-17', nameVi: 'Dân tộc phía Nam Việt Nam', nameEn: 'Minority cultures from Southern provinces', period: 'Bản sắc văn hóa các dân tộc phương Nam' },
  { num: 18, id: 'node_p_18', code: 'P-18', nameVi: 'Tượng Phật giáo Châu Á', nameEn: 'Buddhist statues of Asian countries', period: 'Nghệ thuật Phật giáo các quốc gia Châu Á' }
];

export const AUTHENTIC_TOUR_FLOW_ARROWS = [
  // Cổng 1 vào Phòng 1
  { x1: 56.8, y1: 74.0, x2: 45.0, y2: 70.4 },
  // Phòng 1 -> Phòng 2
  { x1: 33.9, y1: 70.4, x2: 32.2, y2: 70.4 },
  // Phòng 2 -> Phòng 3
  { x1: 29.3, y1: 66.1, x2: 29.3, y2: 64.0 },
  // Phòng 3 -> Phòng 4
  { x1: 29.3, y1: 56.1, x2: 29.3, y2: 54.0 },
  // Phòng 4 -> Phòng 5
  { x1: 33.8, y1: 51.7, x2: 35.8, y2: 51.7 },
  // Phòng 5 -> Phòng 6
  { x1: 37.4, y1: 47.4, x2: 37.4, y2: 45.0 },
  // Cổng 2 -> Phòng 6
  { x1: 17.5, y1: 28.4, x2: 33.8, y2: 28.4 },
  // Phòng 6 -> Phòng 7
  { x1: 37.4, y1: 15.5, x2: 40.5, y2: 12.4 },
  // Phòng 7 -> Phòng 8
  { x1: 72.3, y1: 12.4, x2: 74.5, y2: 12.4 },
  // Phòng 8 -> Phòng 9
  { x1: 76.5, y1: 15.5, x2: 76.5, y2: 17.5 },
  // Phòng 9 -> Phòng 10
  { x1: 77.0, y1: 32.0, x2: 77.0, y2: 34.0 },
  // Phòng 10 -> Phòng 12
  { x1: 77.0, y1: 42.9, x2: 74.0, y2: 47.4 },
  // Phòng 12 -> Phòng 13
  { x1: 80.0, y1: 51.7, x2: 82.0, y2: 51.7 },
  // Phòng 13 -> Phòng 14
  { x1: 84.7, y1: 56.1, x2: 84.7, y2: 58.0 },
  // Phòng 14 -> Phòng 15
  { x1: 89.4, y1: 61.1, x2: 91.0, y2: 61.1 },
  // Phòng 14 -> Phòng 16
  { x1: 84.7, y1: 66.1, x2: 84.7, y2: 68.0 },
  // Phòng 16 -> Phòng 17
  { x1: 80.6, y1: 70.4, x2: 78.5, y2: 70.4 },
  // Sảnh Bát Giác <-> Phòng 18
  { x1: 56.9, y1: 52.6, x2: 56.9, y2: 50.0 }
];

export const AUTHENTIC_ROOM_DISPLAY_LABELS: Record<string, { lines: string[]; fontSize?: number; yOffset?: number }> = {
  'node_p_01': { lines: ['Thời kỳ', 'Nguyên thủy'], fontSize: 1.25, yOffset: 1.0 },
  'node_p_02': { lines: ['Dựng nước &', 'Giữ nước'], fontSize: 1.05, yOffset: 1.0 },
  'node_p_03': { lines: ['Thời Ngô - Đinh', 'Tiền Lê'], fontSize: 1.0, yOffset: 1.2 },
  'node_p_04': { lines: ['Thời Lý'], fontSize: 1.35, yOffset: 1.0 },
  'node_p_05': { lines: ['Thời Trần - Hồ'], fontSize: 1.35, yOffset: 1.0 },
  'node_p_06': { lines: ['Văn hóa', 'Champa'], fontSize: 1.15, yOffset: 3.5 },
  'node_p_07': { lines: ['Văn hóa Óc Eo', '(Vương quốc Phù Nam cổ)'], fontSize: 1.45, yOffset: 1.2 },
  'node_p_08': { lines: ['Điêu khắc', 'Campuchia'], fontSize: 1.0, yOffset: 0.8 },
  'node_p_09': { lines: ['Thời Lê - Mạc', 'Trịnh - Nguyễn'], fontSize: 0.95, yOffset: 2.2 },
  'node_p_10': { lines: ['Thời', 'Tây Sơn'], fontSize: 1.1, yOffset: 1.2 },
  'node_p_11': { lines: ['Súng', 'Thần công'], fontSize: 1.0, yOffset: 3.0 },
  'node_p_12': { lines: ['Thời Nguyễn'], fontSize: 1.35, yOffset: 1.0 },
  'node_p_13': { lines: ['Sưu tập', 'Dương Hà'], fontSize: 1.1, yOffset: 1.0 },
  'node_p_14': { lines: ['Thương mại', 'Hàng hải'], fontSize: 1.1, yOffset: 1.2 },
  'node_p_15': { lines: ['Cổ vật', 'Tàu đắm'], fontSize: 1.0, yOffset: 1.0 },
  'node_p_16': { lines: ['Sưu tập Vương', 'Hồng Sển'], fontSize: 1.0, yOffset: 1.0 },
  'node_p_17': { lines: ['Dân tộc phía Nam', 'Việt Nam'], fontSize: 1.25, yOffset: 1.0 },
  'node_p_18': { lines: ['Tượng Phật giáo', 'Châu Á'], fontSize: 1.1, yOffset: 1.2 }
};

export const InteractiveFloorPlanMap: React.FC<InteractiveFloorPlanMapProps> = ({
  floorPlan,
  onSelectRoom360,
  clientTheme = 'dark',
  hideSidePanel = false,
  hideLegend = false,
  selectedNodeId: externalSelectedNodeId,
  onNodeSelect,
  previewMode = false,
  rooms
}) => {
  const isRoomValid = useCallback(
    (roomId?: string | null) => {
      if (!roomId) return false;
      if (!rooms || rooms.length === 0) return true;
      return rooms.some((r) => r.id === roomId || (r as any).code === roomId || (r as any)._id === roomId);
    },
    [rooms]
  );

  const { currentLang, t } = useClientTranslation();
  const langKey = (currentLang || 'vi').toLowerCase();
  const ui = useMemo(() => {
    if (UI_STRINGS[langKey]) return UI_STRINGS[langKey];
    const viUi = UI_STRINGS.vi;
    const dynamicUi: any = {};
    for (const [k, v] of Object.entries(viUi)) {
      if (typeof v === 'string') {
        dynamicUi[k] = t(v, v);
      } else {
        dynamicUi[k] = v;
      }
    }
    return dynamicUi;
  }, [langKey, t]);

  const [internalSelectedNodeId, setInternalSelectedNodeId] = useState<string>(
    externalSelectedNodeId || ''
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

  // Sync selected node only when parent explicitly passes externalSelectedNodeId
  useEffect(() => {
    if (externalSelectedNodeId !== undefined) {
      setInternalSelectedNodeId(externalSelectedNodeId);
    }
  }, [externalSelectedNodeId]);

  const activeNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return floorPlan.nodes?.find((n) => n.id === selectedNodeId) || null;
  }, [floorPlan.nodes, selectedNodeId]);

  // Lọc bỏ các cạnh xuyên sảnh phi thực tế giữa Phòng 1, Phòng 17, Phòng 18 (phải đi qua Sảnh Bát Giác)
  const sanitizedEdges = useMemo(() => {
    const raw = floorPlan.edges || [];
    return raw.filter((e) => {
      const f = (e.fromNodeId || '').toLowerCase();
      const t = (e.toNodeId || '').toLowerCase();
      const isP1 = f.includes('p_01') || f.includes('p-01') || f.endsWith('_1') || f === '1';
      const isP17 = f.includes('p_17') || f.includes('p-17') || f.endsWith('_17') || f === '17';
      const isP18 = f.includes('p_18') || f.includes('p-18') || f.endsWith('_18') || f === '18';

      const targetIsP1 = t.includes('p_01') || t.includes('p-01') || t.endsWith('_1') || t === '1';
      const targetIsP17 = t.includes('p_17') || t.includes('p-17') || t.endsWith('_17') || t === '17';
      const targetIsP18 = t.includes('p_18') || t.includes('p-18') || t.endsWith('_18') || t === '18';

      if ((isP1 && targetIsP17) || (isP17 && targetIsP1)) return false;
      if ((isP1 && targetIsP18) || (isP18 && targetIsP1)) return false;
      if ((isP17 && targetIsP18) || (isP18 && targetIsP1)) return false;
      return true;
    });
  }, [floorPlan.edges]);

  const connectedEdges = useMemo(() => {
    if (!activeNode) return [];
    return sanitizedEdges.filter((e) => e.fromNodeId === activeNode.id);
  }, [sanitizedEdges, activeNode]);

  // Danh sách các phòng trưng bày lịch sử (loại trừ các hub cổng và sân vườn)
  const exhibitionRooms = useMemo(() => {
    return (floorPlan.nodes || []).filter(
      (n) =>
        !n.isEntrance &&
        !n.id.startsWith('node_cong') &&
        n.id !== 'node_sanh' &&
        n.id !== 'node_san_vuon' &&
        n.code !== 'SANH' &&
        n.code !== 'SAN-VUON' &&
        !n.code?.startsWith('CONG-')
    );
  }, [floorPlan.nodes]);

  // Bộ 18 gian phòng chuẩn hóa theo kiến trúc bản gốc poster hình 2
  const displayRooms = useMemo(() => {
    return AUTHENTIC_HERITAGE_ROOMS_LIST.map((hr) => {
      const matched = floorPlan.nodes?.find(
        (n) =>
          n.id === hr.id ||
          (n.code && n.code.toUpperCase() === hr.code) ||
          (n.code && n.code.match(/\d+/) && parseInt(n.code.match(/\d+/)![0], 10) === hr.num)
      );
      if (matched) {
        return {
          ...matched,
          heritageNum: hr.num,
          heritageNameVi: hr.nameVi,
          heritageNameEn: hr.nameEn,
          heritagePeriod: hr.period
        };
      }
      return {
        id: hr.id,
        code: hr.code,
        name: hr.nameVi,
        period: hr.period,
        category: 'Trưng bày cố định',
        heritageNum: hr.num,
        heritageNameVi: hr.nameVi,
        heritageNameEn: hr.nameEn,
        heritagePeriod: hr.period
      } as any;
    });
  }, [floorPlan.nodes]);

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
      } else if (langKey === 'vi') {
        // Tránh tình trạng trình duyệt dùng giọng English mặc định phát âm sai từ tiếng Việt
        console.warn('[SpeechSynthesis] Thiết bị chưa cài gói giọng đọc tiếng Việt');
        setIsPlayingAudio(false);
        return;
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

    if (startId) setNavStartNodeId(startId);
    if (endId) setNavEndNodeId(endId);

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
        return { label: t('nav.turnLeft', 'Rẽ trái'), icon: <ArrowLeft size={13} /> };
      case 'right':
        return { label: t('nav.turnRight', 'Rẽ phải'), icon: <ArrowRight size={13} /> };
      case 'front':
      case 'up':
        return { label: t('nav.goStraight', 'Đi thẳng'), icon: <ArrowUp size={13} /> };
      case 'down':
        return { label: t('nav.towardsBack', 'Phía sau'), icon: <ArrowDown size={13} /> };
      case 'southwest':
        return { label: t('nav.slightLeft', 'Chếch bên trái'), icon: <ArrowDownLeft size={13} /> };
      case 'southeast':
        return { label: t('nav.slightRight', 'Chếch bên phải'), icon: <ArrowDownRight size={13} /> };
      case 'northwest':
        return { label: t('nav.forwardLeft', 'Chếch lên trái'), icon: <ArrowUpLeft size={13} /> };
      case 'northeast':
        return { label: t('nav.forwardRight', 'Chếch lên phải'), icon: <ArrowUpRight size={13} /> };
      case 'back':
        return { label: t('nav.turnBack', 'Quay lại'), icon: <RotateCcw size={13} /> };
      default:
        return { label: t('nav.passage', 'Lối sang'), icon: <Navigation size={13} /> };
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

  const getNodeLabelLines = (node: FloorPlanNode) => {
    const normId = (node.id || '').toLowerCase().replace(/-/g, '_');
    const codeMatch = node.code?.match(/\d+/);
    const num = codeMatch ? parseInt(codeMatch[0], 10) : 0;
    const numKey = num >= 1 && num <= 18 ? `node_p_${num < 10 ? '0' + num : num}` : '';

    const cfg = AUTHENTIC_ROOM_DISPLAY_LABELS[normId] || (numKey ? AUTHENTIC_ROOM_DISPLAY_LABELS[numKey] : null);
    if (cfg) return cfg;

    const rawName = (node.name || '').trim();
    if (!rawName) return { lines: ['Gian phòng'], fontSize: 1.05, yOffset: 0.5 };
    if (rawName.length > 14) {
      const words = rawName.split(' ');
      const mid = Math.ceil(words.length / 2);
      return {
        lines: [words.slice(0, mid).join(' '), words.slice(mid).join(' ')],
        fontSize: 1.05,
        yOffset: 0.5
      };
    }
    return { lines: [rawName], fontSize: 1.15, yOffset: 0.5 };
  };


  const getNodeBox = (node: FloorPlanNode) => {
    const normId = (node.id || '').toLowerCase().replace(/-/g, '_');
    const codeMatch = node.code?.match(/\d+/);
    const num = codeMatch ? parseInt(codeMatch[0], 10) : 0;
    const numKey = num >= 1 && num <= 18 ? `node_p_${num < 10 ? '0' + num : num}` : '';

    const matched =
      AUTHENTIC_HERITAGE_ROOMS_MAP[normId] ||
      (numKey ? AUTHENTIC_HERITAGE_ROOMS_MAP[numKey] : null) ||
      (normId.includes('cong_1') ? AUTHENTIC_HERITAGE_ROOMS_MAP['node_cong_1'] : null) ||
      (normId.includes('cong_2') ? AUTHENTIC_HERITAGE_ROOMS_MAP['node_cong_2'] : null) ||
      (normId.includes('sanh') ? AUTHENTIC_HERITAGE_ROOMS_MAP['node_sanh'] : null) ||
      (normId.includes('san_vuon') ? AUTHENTIC_HERITAGE_ROOMS_MAP['node_san_vuon'] : null);

    if (matched) {
      return {
        x: matched.x,
        y: matched.y,
        width: matched.width,
        height: matched.height
      };
    }

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
    const norm = (nodeId || '').toLowerCase().replace(/-/g, '_');
    if (norm.includes('cong_1') || norm === 'cong_1' || norm === 'cong-1') return { x: 56.8, y: 81.5 };
    if (norm.includes('cong_2') || norm === 'cong_2' || norm === 'cong-2') return { x: 13.4, y: 28.4 };
    if (norm.includes('sanh') || norm === 'sanh') return { x: 56.9, y: 59.0 };
    if (norm.includes('san_vuon') || norm === 'san_vuon' || norm === 'san-vuon') return { x: 57.3, y: 30.4 };
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
          border: '1.5px solid #821519',
          borderRadius: 8,
          background: '#FAF6ED',
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
                stroke="rgba(139, 94, 60, 0.08)"
                strokeWidth="0.15"
              />
            </pattern>
            <pattern id="octagon-hatch-prev" width="2" height="2" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="2" stroke="#821519" strokeWidth="0.3" opacity="0.55" />
            </pattern>
            <marker
              id="edge-arrow-prev"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="2.4"
              markerHeight="2.4"
              orient="auto"
            >
              <path d="M 0 1.8 L 7.5 5 L 0 8.2 Z" fill="#821519" />
            </marker>
          </defs>
          <rect width="100" height="100" fill="#FAF6ED" />
          <rect width="100" height="100" fill="url(#arch-grid-prev)" />

          <g>
            {/* === LỚP 0: NỀN TẢNG KIẾN TRÚC MẶT BẰNG === */}
            <rect x="23.5" y="64.5" width="67.0" height="11.5" rx="0.5" fill="#DDD7CB" stroke="#2B241E" strokeWidth="0.5" />
            <rect x="23.5" y="54.5" width="11.5" height="12.5" rx="0.5" fill="#DDD7CB" stroke="#2B241E" strokeWidth="0.5" />
            <rect x="78.5" y="54.5" width="19.0" height="12.5" rx="0.5" fill="#DDD7CB" stroke="#2B241E" strokeWidth="0.5" />
            <rect x="32.5" y="4.5" width="55.8" height="44.0" rx="0.5" fill="#DDD7CB" stroke="#2B241E" strokeWidth="0.5" />

            {/* === LỚP 1: SÂN VƯỜN NỘI VIỆN === */}
            <rect x="41.0" y="19.0" width="32.6" height="22.9" rx="0.5" fill="#F1ECE2" stroke="#2B241E" strokeWidth="0.45" />
            <rect x="47.2" y="23.2" width="20.2" height="11.8" rx="0.5" fill="#74B232" stroke="#4F851A" strokeWidth="0.35" />
            <rect x="52.2" y="26.0" width="10.2" height="6.2" rx="0.4" fill="#4A98D9" stroke="#1E659E" strokeWidth="0.3" />
            <text x="57.3" y="21.5" textAnchor="middle" fill="#255812" fontSize="0.95" fontWeight="700">
              SÂN VƯỜN NỘI VIỆN
            </text>
            <text x="57.3" y="29.9" textAnchor="middle" fill="#FFFFFF" fontSize="0.75" fontWeight="700">
              Hồ múa rối nước
            </text>

            {/* === LỚP 2: SẢNH BÁT GIÁC TRUNG TÂM === */}
            <polygon
              points="54.1,51.8 59.7,51.8 64.0,56.1 64.0,61.9 59.7,66.2 54.1,66.2 49.8,61.9 49.8,56.1"
              fill="#EFC75E"
              stroke="#821519"
              strokeWidth="0.75"
            />
            <polygon
              points="54.1,51.8 59.7,51.8 64.0,56.1 64.0,61.9 59.7,66.2 54.1,66.2 49.8,61.9 49.8,56.1"
              fill="url(#octagon-hatch-prev)"
              opacity="0.8"
            />
            <text x="56.9" y="58.5" textAnchor="middle" fill="#7D1C22" fontSize="0.95" fontWeight="800">
              SẢNH BÁT GIÁC
            </text>

            {/* === LỚP 3: CỔNG 1 === */}
            <rect x="51.0" y="74.8" width="11.6" height="13.5" rx="0.4" fill="#DDD7CB" stroke="#2B241E" strokeWidth="0.45" />
            <rect x="53.4" y="80.6" width="1.6" height="3.0" rx="0.3" fill="#821519" />
            <rect x="58.6" y="80.6" width="1.6" height="3.0" rx="0.3" fill="#821519" />
            <rect x="63.8" y="78.8" width="4.0" height="4.0" rx="0.4" fill="#E8671B" stroke="#B84A09" strokeWidth="0.3" />
            <circle cx="56.8" cy="74.5" r="1.6" fill="none" stroke="#C5221F" strokeWidth="0.4" />
            <circle cx="56.8" cy="74.5" r="0.75" fill="#C5221F" />
            <text x="56.8" y="89.5" textAnchor="middle" fill="#2B241E" fontSize="0.95" fontWeight="700">
              CỔNG 1 (Gate 1)
            </text>

            {/* === LỚP 4: CỔNG 2 === */}
            <rect x="9.4" y="22.6" width="8.1" height="11.6" rx="0.5" fill="#9C1C24" stroke="#6B1015" strokeWidth="0.45" />
            <text x="13.4" y="27.0" textAnchor="middle" fill="#FFFFFF" fontSize="0.8" fontWeight="700">
              CỔNG 2
            </text>
            <rect x="11.4" y="35.5" width="4.0" height="4.0" rx="0.4" fill="#E8671B" stroke="#B84A09" strokeWidth="0.3" />

            {/* === LỚP 5: MŨI TÊN HƯỚNG THAM QUAN === */}
            {AUTHENTIC_TOUR_FLOW_ARROWS.map((arrow, aIdx) => (
              <line
                key={`tour_prev_${aIdx}`}
                x1={arrow.x1}
                y1={arrow.y1}
                x2={arrow.x2}
                y2={arrow.y2}
                stroke="#821519"
                strokeWidth="0.35"
                markerEnd="url(#edge-arrow-prev)"
                opacity="0.85"
              />
            ))}

            {/* === LỚP 7: CÁC GIAN PHÒNG TRƯNG BÀY (18 GIAN THEO SƠ ĐỒ GỐC) === */}
            {displayRooms.map((node, nodeIdx) => {
              const box = getNodeBox(node);
              const roomNumber = node.heritageNum || getNodeDisplayNumber(node, nodeIdx);
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
                    rx="0.5"
                    fill={isHovered ? '#F9F1D0' : '#FFFEE8'}
                    stroke={isHovered ? '#821519' : '#2B241E'}
                    strokeWidth={isHovered ? 0.75 : 0.55}
                  />
                  <circle
                    cx={box.x + 2.2}
                    cy={box.y + 2.2}
                    r="1.35"
                    fill="#821519"
                  />
                  <text
                    x={box.x + 2.2}
                    y={box.y + 2.6}
                    textAnchor="middle"
                    fontSize="0.9"
                    fontWeight="800"
                    fill="#FFFFFF"
                  >
                    {roomNumber}
                  </text>
                  {(() => {
                    const labelCfg = getNodeLabelLines(node);
                    const lines = labelCfg.lines;
                    const fSize = labelCfg.fontSize || 1.1;
                    const yBase = box.y + box.height / 2 + (labelCfg.yOffset || 0);

                    if (lines.length === 1) {
                      return (
                        <text
                          x={box.x + box.width / 2}
                          y={yBase + 0.4}
                          textAnchor="middle"
                          fontSize={fSize}
                          fontWeight="700"
                          fill="#1A1108"
                        >
                          {lines[0]}
                        </text>
                      );
                    }

                    return (
                      <text
                        x={box.x + box.width / 2}
                        y={yBase - 0.7}
                        textAnchor="middle"
                        fontSize={fSize}
                        fontWeight="700"
                        fill="#1A1108"
                      >
                        <tspan x={box.x + box.width / 2} dy="0">
                          {lines[0]}
                        </tspan>
                        <tspan x={box.x + box.width / 2} dy={fSize * 1.25}>
                          {lines[1]}
                        </tspan>
                      </text>
                    );
                  })()}
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
            <div style={{ fontSize: 14.5, fontWeight: 700, color: isLight ? '#111827' : '#FFFFFF', letterSpacing: '0.2px' }}>
              {(() => {
                const rawName = floorPlan.title || (floorPlan as any).name || '';
                return !rawName || rawName.toLowerCase() === 'sodo' ? ui.floorPlanTitle : rawName;
              })()}
            </div>
            <div style={{ fontSize: 11.5, color: isLight ? '#64748B' : '#94A3B8', marginTop: 1 }}>
              {ui.floorPlanSubtitle}
            </div>
          </div>
        </div>

        {/* Nút Xem Ảnh Gốc & Badge Thống Kê */}
        <div className="ifp-header-badges" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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
            <span>{ui.roomsCount(exhibitionRooms.length || 18)}</span>
            <span>•</span>
            <span>{ui.doorsCount(sanitizedEdges.length)}</span>
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
            background: '#FAF6ED',
            border: '2px solid #821519',
            borderRadius: 8,
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.16)',
            cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
            position: 'relative',
            overflow: 'hidden',
            aspectRatio: '1 / 1',
            alignSelf: 'start'
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
                  stroke="rgba(139, 94, 60, 0.08)"
                  strokeWidth="0.15"
                />
              </pattern>

              <pattern id="octagon-hatch" width="2" height="2" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="2" stroke="#821519" strokeWidth="0.3" opacity="0.55" />
              </pattern>

              <marker
                id="tour-arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="2.4"
                markerHeight="2.4"
                orient="auto"
              >
                <path d="M 0 1.8 L 7.5 5 L 0 8.2 Z" fill="#821519" />
              </marker>

              <marker
                id="edge-arrow-active"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="3.2"
                markerHeight="3.2"
                orient="auto"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 Z" fill="#821519" />
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
                  fill="rgba(130, 21, 25, 0.4)"
                />
              </marker>
            </defs>

            <rect width="100" height="100" fill="#FAF6ED" />
            <rect width="100" height="100" fill="url(#arch-grid)" />

            <g
              transform={`translate(${pan.x / 4}, ${pan.y / 4}) scale(${zoom})`}
              style={{
                transformOrigin: '50% 50%',
                transition: isPanning ? 'none' : 'transform 0.18s ease-out'
              }}
            >
              {/* === LỚP 0: NỀN TẢNG KIẾN TRÚC MẶT BẰNG BẢO TÀNG === */}
              <rect
                x="23.5"
                y="64.5"
                width="67.0"
                height="11.5"
                rx="0.5"
                fill="#DDD7CB"
                stroke="#2B241E"
                strokeWidth="0.5"
              />
              <rect
                x="23.5"
                y="54.5"
                width="11.5"
                height="12.5"
                rx="0.5"
                fill="#DDD7CB"
                stroke="#2B241E"
                strokeWidth="0.5"
              />
              <rect
                x="78.5"
                y="54.5"
                width="19.0"
                height="12.5"
                rx="0.5"
                fill="#DDD7CB"
                stroke="#2B241E"
                strokeWidth="0.5"
              />
              <rect
                x="32.5"
                y="4.5"
                width="55.8"
                height="44.0"
                rx="0.5"
                fill="#DDD7CB"
                stroke="#2B241E"
                strokeWidth="0.5"
              />

              {/* === LỚP 1: SÂN VƯỜN NỘI VIỆN (COURTYARD & MẶT NƯỚC RỐI NƯỚC) === */}
              {(() => {
                const isSanVuonInNav = isNodeInRoute('node_san_vuon');
                const isSelected = selectedNodeId === 'node_san_vuon';
                return (
                  <g
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setInternalSelectedNodeId('node_san_vuon');
                      onNodeSelect?.('node_san_vuon');
                    }}
                  >
                    <rect
                      x="41.0"
                      y="19.0"
                      width="32.6"
                      height="22.9"
                      rx="0.5"
                      fill={isSanVuonInNav || isSelected ? '#E8DFCD' : '#F1ECE2'}
                      stroke="#2B241E"
                      strokeWidth={isSanVuonInNav || isSelected ? 0.7 : 0.45}
                    />
                    <rect
                      x="47.2"
                      y="23.2"
                      width="20.2"
                      height="11.8"
                      rx="0.5"
                      fill="#74B232"
                      stroke="#4F851A"
                      strokeWidth="0.35"
                    />
                    <rect
                      x="52.2"
                      y="26.0"
                      width="10.2"
                      height="6.2"
                      rx="0.4"
                      fill="#4A98D9"
                      stroke="#1E659E"
                      strokeWidth="0.3"
                    />
                    <text
                      x="57.3"
                      y="21.5"
                      textAnchor="middle"
                      fill="#255812"
                      fontSize="0.95"
                      fontWeight="700"
                    >
                      SÂN VƯỜN NỘI VIỆN
                    </text>
                    <text
                      x="57.3"
                      y="29.9"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="0.75"
                      fontWeight="700"
                    >
                      Hồ múa rối nước
                    </text>
                  </g>
                );
              })()}

              {/* === LỚP 2: SẢNH BÁT GIÁC TRUNG TÂM (ROTUNDA) === */}
              {(() => {
                const isSanhInNav = isNodeInRoute('node_sanh');
                const isSelected = selectedNodeId === 'node_sanh';
                return (
                  <g
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setInternalSelectedNodeId('node_sanh');
                      onNodeSelect?.('node_sanh');
                    }}
                  >
                    <polygon
                      points="54.1,51.8 59.7,51.8 64.0,56.1 64.0,61.9 59.7,66.2 54.1,66.2 49.8,61.9 49.8,56.1"
                      fill={isSelected ? '#FAD56C' : '#EFC75E'}
                      stroke="#821519"
                      strokeWidth={isSelected ? 0.95 : 0.75}
                    />
                    <polygon
                      points="54.1,51.8 59.7,51.8 64.0,56.1 64.0,61.9 59.7,66.2 54.1,66.2 49.8,61.9 49.8,56.1"
                      fill="url(#octagon-hatch)"
                      opacity="0.8"
                    />
                    <text
                      x="56.9"
                      y="58.3"
                      textAnchor="middle"
                      fill="#7D1C22"
                      fontSize="0.95"
                      fontWeight="800"
                    >
                      SẢNH BÁT GIÁC
                    </text>
                    <text
                      x="56.9"
                      y="60.3"
                      textAnchor="middle"
                      fill="#8B4E12"
                      fontSize="0.7"
                      fontWeight="600"
                    >
                      Khu vực đón tiếp
                    </text>
                  </g>
                );
              })()}

              {/* === LỚP 3: CỔNG 1 (NGUYỄN BỈNH KHIÊM) & BẬC THANG ĐÓN TIẾP === */}
              {(() => {
                const isCong1InNav = isNodeInRoute('node_cong_1');
                const isSelected = selectedNodeId === 'node_cong_1';
                return (
                  <g
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setInternalSelectedNodeId('node_cong_1');
                      onNodeSelect?.('node_cong_1');
                    }}
                  >
                    {/* Bậc thang đá xám đón tiếp */}
                    <rect x="51.0" y="74.8" width="11.6" height="13.5" rx="0.4" fill="#DDD7CB" stroke="#2B241E" strokeWidth="0.45" />
                    <line x1="52.0" y1="83.8" x2="61.6" y2="83.8" stroke="#7A7369" strokeWidth="0.35" />
                    <line x1="52.5" y1="85.2" x2="61.1" y2="85.2" stroke="#7A7369" strokeWidth="0.35" />
                    <line x1="53.0" y1="86.6" x2="60.6" y2="86.6" stroke="#7A7369" strokeWidth="0.35" />

                    {/* Cửa xoay / Lối vào */}
                    <rect x="53.4" y="80.6" width="1.6" height="3.0" rx="0.3" fill="#821519" />
                    <rect x="58.6" y="80.6" width="1.6" height="3.0" rx="0.3" fill="#821519" />

                    {/* Quầy vé màu cam đất chuẩn theo Poster gốc */}
                    <rect x="63.8" y="78.8" width="4.0" height="4.0" rx="0.4" fill="#E8671B" stroke="#B84A09" strokeWidth="0.3" />
                    <text x="65.8" y="81.4" textAnchor="middle" fill="#FFFFFF" fontSize="0.65" fontWeight="700">
                      Vé
                    </text>

                    {/* Mũi tên dẫn vào cổng chính */}
                    <line x1="56.8" y1="87.0" x2="56.8" y2="78.5" stroke="#821519" strokeWidth="0.45" markerEnd="url(#edge-arrow-active)" />

                    {/* Vòng tròn đỏ "Bạn đang ở đây / You are here" chuẩn theo Poster gốc */}
                    <circle cx="56.8" cy="74.5" r="1.6" fill="none" stroke="#C5221F" strokeWidth="0.4" />
                    <circle cx="56.8" cy="74.5" r="0.75" fill="#C5221F" />

                    <text
                      x="56.8"
                      y="89.5"
                      textAnchor="middle"
                      fill={isSelected || isCong1InNav ? '#821519' : '#2B241E'}
                      fontSize="1.0"
                      fontWeight="700"
                    >
                      CỔNG 1 (Gate 1)
                    </text>
                    <text
                      x="56.8"
                      y="91.2"
                      textAnchor="middle"
                      fill="#5C5144"
                      fontSize="0.7"
                      fontWeight="500"
                    >
                      Nguyễn Bỉnh Khiêm
                    </text>
                  </g>
                );
              })()}

              {/* === LỚP 4: CỔNG 2 (THẢO CẦM VIÊN) & NHÀ MÁI ĐỎ === */}
              {(() => {
                const isCong2InNav = isNodeInRoute('node_cong_2');
                const isSelected = selectedNodeId === 'node_cong_2';
                return (
                  <g
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setInternalSelectedNodeId('node_cong_2');
                      onNodeSelect?.('node_cong_2');
                    }}
                  >
                    <rect
                      x="9.4"
                      y="22.6"
                      width="8.1"
                      height="11.6"
                      rx="0.5"
                      fill="#9C1C24"
                      stroke="#6B1015"
                      strokeWidth="0.45"
                    />
                    <text x="13.4" y="27.0" textAnchor="middle" fill="#FFFFFF" fontSize="0.85" fontWeight="700">
                      CỔNG 2
                    </text>
                    <text x="13.4" y="29.0" textAnchor="middle" fill="#FFD2D5" fontSize="0.65" fontWeight="600">
                      Gate 2
                    </text>

                    {/* Quầy vé Cổng 2 */}
                    <rect x="11.4" y="35.5" width="4.0" height="4.0" rx="0.4" fill="#E8671B" stroke="#B84A09" strokeWidth="0.3" />
                    <text x="13.4" y="38.0" textAnchor="middle" fill="#FFFFFF" fontSize="0.65" fontWeight="700">
                      Vé
                    </text>

                    <line x1="18.0" y1="28.4" x2="32.5" y2="28.4" stroke="#821519" strokeWidth="0.45" markerEnd="url(#edge-arrow-active)" />

                    <text
                      x="13.4"
                      y="42.0"
                      textAnchor="middle"
                      fill={isSelected || isCong2InNav ? '#821519' : '#2B241E'}
                      fontSize="0.75"
                      fontWeight="600"
                    >
                      Thảo Cầm Viên
                    </text>
                  </g>
                );
              })()}

              {/* === LỚP 5: CÁC MŨI TÊN HƯỚNG THAM QUAN (CHẾ TÁC THEO POSTER GỐC) === */}
              {AUTHENTIC_TOUR_FLOW_ARROWS.map((arrow, aIdx) => (
                <line
                  key={`tour_arrow_${aIdx}`}
                  x1={arrow.x1}
                  y1={arrow.y1}
                  x2={arrow.x2}
                  y2={arrow.y2}
                  stroke="#821519"
                  strokeWidth="0.35"
                  markerEnd="url(#tour-arrow)"
                  opacity="0.85"
                />
              ))}

              {/* === LỚP 6: ĐƯỜNG DẪN LỘ TRÌNH ĐANG TÌM KIẾM (A* ROUTE) === */}
              {navPathD && (
                <path
                  d={navPathD}
                  fill="none"
                  stroke="#821519"
                  strokeWidth="0.9"
                  className="ifp-svg-nav-path"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Điểm xuất phát (Start Pin) */}
              {navStartPt && (
                <g>
                  <circle cx={navStartPt.x} cy={navStartPt.y} r="2.2" fill="none" stroke="#821519" strokeWidth="0.4" />
                  <circle cx={navStartPt.x} cy={navStartPt.y} r="1.1" fill="#821519" />
                </g>
              )}

              {/* Điểm đến (Destination Pin) */}
              {navEndPt && (
                <g>
                  <circle cx={navEndPt.x} cy={navEndPt.y} r="2.2" fill="none" stroke="#2B241E" strokeWidth="0.4" />
                  <circle cx={navEndPt.x} cy={navEndPt.y} r="1.1" fill="#2B241E" />
                </g>
              )}

              {/* === LỚP 7: CÁC GIAN PHÒNG TRƯNG BÀY (18 GIAN THEO SƠ ĐỒ GỐC) === */}
              {displayRooms.map((node, nodeIdx) => {
                const isSelected = selectedNodeId === node.id || (activeNode && activeNode.id === node.id);
                const isHovered = hoveredNodeId === node.id;
                const box = getNodeBox(node);
                const roomNumber = node.heritageNum || getNodeDisplayNumber(node, nodeIdx);
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
                      cursor: 'pointer'
                    }}
                  >
                    {/* Thân phòng với màu giấy kiến trúc ngà ấm chuẩn theo Poster gốc */}
                    <rect
                      x={box.x}
                      y={box.y}
                      width={box.width}
                      height={box.height}
                      rx="0.5"
                      fill={
                        isSelected
                          ? '#FDE89C'
                          : isInNav
                          ? '#FFF0BE'
                          : isHovered
                          ? '#F9F1D0'
                          : '#FFFEE8'
                      }
                      stroke={
                        isSelected
                          ? '#821519'
                          : isInNav
                          ? '#C68A1B'
                          : isHovered
                          ? '#821519'
                          : '#2B241E'
                      }
                      strokeWidth={isSelected ? 1.0 : isInNav ? 0.75 : 0.55}
                    />

                    {/* Số thứ tự chặng khi dẫn đường */}
                    {isInNav && !isNavStart && !isNavEnd && (
                      <g transform={`translate(${box.x + box.width - 2.8}, ${box.y + box.height - 2.8})`}>
                        <circle cx="1.2" cy="1.2" r="1.15" fill="#821519" />
                        <text
                          x="1.2"
                          y="1.55"
                          fill="#FFFFFF"
                          fontSize="0.75"
                          fontWeight="700"
                          textAnchor="middle"
                        >
                          {stepIdx + 1}
                        </text>
                      </g>
                    )}

                    {/* Badge số thứ tự phòng chuẩn theo Poster Gốc (Hình tròn đỏ sẫm) */}
                    <circle
                      cx={box.x + 2.2}
                      cy={box.y + 2.2}
                      r="1.35"
                      fill={isSelected ? '#D49A1F' : '#821519'}
                    />
                    <text
                      x={box.x + 2.2}
                      y={box.y + 2.6}
                      fill="#FFFFFF"
                      fontSize="0.9"
                      fontWeight="800"
                      textAnchor="middle"
                    >
                      {roomNumber}
                    </text>

                    {/* Chỉ báo 360° nếu phòng đã được gán tour thực tế */}
                    {node.roomId && isRoomValid(node.roomId) && (
                      <g transform={`translate(${box.x + box.width - 3.2}, ${box.y + 1.2})`}>
                        <rect
                          width="2.5"
                          height="1.3"
                          rx="0.3"
                          fill="rgba(130, 21, 25, 0.12)"
                          stroke="#821519"
                          strokeWidth="0.2"
                        />
                        <text
                          x="1.25"
                          y="0.95"
                          fill="#821519"
                          fontSize="0.65"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          360°
                        </text>
                      </g>
                    )}

                    {/* Tên gian phòng rõ nét, nổi bật, cỡ chữ lớn chuẩn phong cách kiến trúc */}
                    {(() => {
                      const labelCfg = getNodeLabelLines(node);
                      const lines = labelCfg.lines;
                      const fSize = labelCfg.fontSize || 1.1;
                      const yBase = box.y + box.height / 2 + (labelCfg.yOffset || 0);
                      const textColor = isSelected ? '#821519' : '#1A1108';

                      if (lines.length === 1) {
                        return (
                          <text
                            x={box.x + box.width / 2}
                            y={yBase + 0.4}
                            textAnchor="middle"
                            fontSize={fSize}
                            fontWeight={isSelected ? '800' : '700'}
                            fill={textColor}
                            letterSpacing="0.02px"
                          >
                            {lines[0]}
                          </text>
                        );
                      }

                      return (
                        <text
                          x={box.x + box.width / 2}
                          y={yBase - 0.7}
                          textAnchor="middle"
                          fontSize={fSize}
                          fontWeight={isSelected ? '800' : '700'}
                          fill={textColor}
                          letterSpacing="0.02px"
                        >
                          <tspan x={box.x + box.width / 2} dy="0">
                            {lines[0]}
                          </tspan>
                          <tspan x={box.x + box.width / 2} dy={fSize * 1.25}>
                            {lines[1]}
                          </tspan>
                        </text>
                      );
                    })()}
                  </g>
                );
              })}

              {/* === LỚP 8: CHÚ THÍCH THỰC ĐỊA TRÊN BẢN VẼ (MINI-LEGEND CHUẨN POSTER GỐC) === */}
              <g transform="translate(23.5, 93.5)">
                <circle cx="1.2" cy="1.2" r="1.1" fill="none" stroke="#C5221F" strokeWidth="0.3" />
                <circle cx="1.2" cy="1.2" r="0.5" fill="#C5221F" />
                <text x="3.0" y="1.6" fill="#3D3328" fontSize="0.7" fontWeight="600">Bạn đang ở đây</text>

                <rect x="22.0" y="0.2" width="2.0" height="2.0" rx="0.3" fill="#E8671B" stroke="#B84A09" strokeWidth="0.2" />
                <text x="25.0" y="1.6" fill="#3D3328" fontSize="0.7" fontWeight="600">Quầy vé</text>

                <line x1="37.0" y1="1.2" x2="40.5" y2="1.2" stroke="#821519" strokeWidth="0.35" markerEnd="url(#tour-arrow)" />
                <text x="42.5" y="1.6" fill="#3D3328" fontSize="0.7" fontWeight="600">Hướng tham quan</text>

                <polygon points="63.0,0.4 64.5,0.4 65.5,1.4 65.5,2.0 64.5,2.4 63.0,2.4 62.2,2.0 62.2,1.4" fill="#EFC75E" stroke="#821519" strokeWidth="0.25" />
                <text x="67.0" y="1.6" fill="#3D3328" fontSize="0.7" fontWeight="600">Sảnh Bát Giác</text>
              </g>
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
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {activeNode ? (
                  <div>
                    {/* Tag gian phòng & Vị trí hiện tại */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            padding: '2px 7px',
                            borderRadius: 5,
                            background: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(212, 168, 106, 0.14)',
                            border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(212, 168, 106, 0.3)'}`,
                            color: isLight ? '#334155' : '#D4A86A',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.3px'
                          }}
                        >
                          {activeNode.code}
                        </span>
                        <span style={{ fontSize: 11.5, color: isLight ? '#64748B' : '#94A3B8' }}>
                          {activeNode.category || 'Gian Trưng Bày'}
                        </span>
                      </div>

                      {navStartNodeId === activeNode.id && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 7px',
                            borderRadius: 12,
                            background: 'rgba(34, 197, 94, 0.12)',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            color: '#4ADE80',
                            fontSize: 10.5,
                            fontWeight: 600
                          }}
                        >
                          <MapPin size={10} />
                          Vị trí của bạn
                        </span>
                      )}
                    </div>

                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: isLight ? '#0F172A' : '#FFFFFF',
                        margin: '0 0 4px 0',
                        lineHeight: 1.3
                      }}
                    >
                      {activeNode.name}
                    </h3>

                    <div style={{ fontSize: 12, color: isLight ? '#64748B' : '#94A3B8', marginBottom: 14 }}>
                      {activeNode.period || 'Hiện vật trưng bày lịch sử'}
                    </div>

                    {/* Khối hành động tương tác */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                      {/* Nút hành động chính: Chỉ đường đến gian này */}
                      <button
                        type="button"
                        onClick={() => {
                          setNavEndNodeId(activeNode.id);
                          setSideTab('navigator');
                          handleRunNavigation(navStartNodeId, activeNode.id);
                        }}
                        style={{
                          width: '100%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '9px 12px',
                          borderRadius: 6,
                          background: 'linear-gradient(135deg, #D4A86A 0%, #B88746 100%)',
                          color: '#0B0F19',
                          fontSize: 12.5,
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(212, 168, 106, 0.25)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Navigation size={13} />
                        <span>{ui.guideMeHere}</span>
                      </button>

                      {/* Hàng nút phụ: Khám phá 360° & Đặt vị trí xuất phát */}
                      <div style={{ display: 'grid', gridTemplateColumns: activeNode?.roomId && isRoomValid(activeNode.roomId) && onSelectRoom360 ? '1fr 1fr' : '1fr', gap: 6 }}>
                        {activeNode?.roomId && isRoomValid(activeNode.roomId) && onSelectRoom360 && (
                          <button
                            type="button"
                            onClick={() => onSelectRoom360(activeNode.roomId!)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 5,
                              padding: '7px 8px',
                              borderRadius: 6,
                              background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                              border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'}`,
                              color: isLight ? '#1E293B' : '#E2E8F0',
                              fontSize: 11.5,
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Eye size={12} style={{ color: '#D4A86A' }} />
                            <span>{ui.enter360}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setNavStartNodeId(activeNode.id);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 5,
                            padding: '7px 8px',
                            borderRadius: 6,
                            background: navStartNodeId === activeNode.id
                              ? (isLight ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.15)')
                              : (isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)'),
                            border: `1px solid ${
                              navStartNodeId === activeNode.id
                                ? 'rgba(34, 197, 94, 0.4)'
                                : isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'
                            }`,
                            color: navStartNodeId === activeNode.id ? '#22C55E' : (isLight ? '#475569' : '#94A3B8'),
                            fontSize: 11.5,
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <MapPin size={11} />
                          <span>{navStartNodeId === activeNode.id ? 'Đang là điểm xuất phát' : ui.iAmHere}</span>
                        </button>
                      </div>
                    </div>

                    {/* Lối đi sang các phòng kế tiếp (thông phòng trực tiếp) */}
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
                          marginBottom: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{ui.nextRooms}</span>
                        <span
                          style={{
                            fontSize: 10.5,
                            padding: '1px 6px',
                            borderRadius: 10,
                            background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.06)',
                            color: isLight ? '#64748B' : '#94A3B8'
                          }}
                        >
                          {connectedEdges.length} cửa
                        </span>
                      </div>

                      {connectedEdges.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {connectedEdges.map((edge) => {
                            const targetNode = floorPlan.nodes.find((n) => n.id === edge.toNodeId);
                            const badge = getDirectionBadge(edge.direction);
                            const targetName = targetNode ? targetNode.name : edge.targetRoomName || 'Gian kế tiếp';
                            const targetCode = targetNode?.code || '';

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
                                  border: `1px solid ${isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
                                  borderRadius: 6,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = 'rgba(212, 168, 106, 0.4)';
                                  e.currentTarget.style.background = isLight ? 'rgba(212, 168, 106, 0.06)' : 'rgba(212, 168, 106, 0.08)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)';
                                  e.currentTarget.style.background = isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.03)';
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                                  <div
                                    style={{
                                      width: 26,
                                      height: 26,
                                      borderRadius: 5,
                                      background: isLight ? 'rgba(212, 168, 106, 0.12)' : 'rgba(212, 168, 106, 0.15)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#D4A86A',
                                      flexShrink: 0
                                    }}
                                  >
                                    {badge.icon}
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 10, color: '#D4A86A', fontWeight: 500 }}>
                                      {badge.label}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 12,
                                        fontWeight: 600,
                                        color: isLight ? '#1E293B' : '#F1F5F9',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}
                                    >
                                      {targetCode ? `${targetCode} - ${targetName}` : targetName}
                                    </div>
                                  </div>
                                </div>
                                <ArrowRight size={13} style={{ color: isLight ? '#94A3B8' : '#64748B', flexShrink: 0, marginLeft: 6 }} />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ fontSize: 11.5, color: isLight ? '#64748B' : '#94A3B8', padding: '6px 0' }}>
                          {ui.receptionOrCorridor}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '44px 16px',
                      textAlign: 'center',
                      height: '100%'
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: isLight ? 'rgba(212, 168, 106, 0.12)' : 'rgba(212, 168, 106, 0.14)',
                        border: '1px solid rgba(212, 168, 106, 0.28)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#D4A86A',
                        marginBottom: 12
                      }}
                    >
                      <Building size={20} />
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: isLight ? '#0F172A' : '#FFFFFF',
                        marginBottom: 6
                      }}
                    >
                      {langKey === 'en' ? 'Select a room on the map' : 'Chọn gian phòng trên sơ đồ'}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: isLight ? '#64748B' : '#94A3B8',
                        maxWidth: 240,
                        lineHeight: 1.55
                      }}
                    >
                      {langKey === 'en'
                        ? 'Click any room or gate on the map to view exhibit details, connected doors, and directions.'
                        : 'Nhấp vào một gian phòng hoặc cổng trên sơ đồ để xem thông tin hiện vật, lối thông phòng và lộ trình chỉ đường.'}
                    </div>
                  </div>
                )}
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setNavStartNodeId(val);
                      if (navResult) {
                        handleRunNavigation(val, navEndNodeId);
                      }
                    }}
                  >
                    <optgroup label={ui.commonAreas}>
                      <option value="node_cong_1">{ui.gate1} (Nguyễn Bỉnh Khiêm)</option>
                      <option value="node_cong_2">{ui.gate2} (Thảo Cầm Viên)</option>
                      <option value="node_sanh">{ui.octagonalHall}</option>
                      <option value="node_san_vuon">{ui.courtyard}</option>
                    </optgroup>
                    <optgroup label={ui.exhibitionRooms}>
                      {exhibitionRooms.map((n, idx) => (
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
                    onChange={(e) => {
                      const val = e.target.value;
                      setNavEndNodeId(val);
                      if (navResult) {
                        handleRunNavigation(navStartNodeId, val);
                      }
                    }}
                  >
                    <optgroup label={ui.commonAreas}>
                      <option value="node_cong_1">{ui.gate1} (Nguyễn Bỉnh Khiêm)</option>
                      <option value="node_cong_2">{ui.gate2} (Thảo Cầm Viên)</option>
                      <option value="node_sanh">{ui.octagonalHall}</option>
                      <option value="node_san_vuon">{ui.courtyard}</option>
                    </optgroup>
                    <optgroup label={ui.exhibitionRooms}>
                      {exhibitionRooms.map((n, idx) => (
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
                  onClick={() => handleRunNavigation(navStartNodeId, navEndNodeId)}
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

      {/* 7. CHÂN TRANG DANH MỤC 18 GIAN PHÒNG TRƯNG BÀY (CHẾ TÁC THEO POSTER GỐC HÌNH 2) */}
      {!hideLegend && (
        <div className="ifp-heritage-legend">
          <div className="ifp-heritage-legend-header">
            <div className="ifp-heritage-legend-title">
              <span className="ifp-heritage-legend-dot" />
              <span>
                {langKey === 'en'
                  ? 'MUSEUM VISIT MAP - 18 EXHIBITION ROOMS'
                  : langKey === 'fr'
                  ? 'PLAN DE VISITE DU MUSÉE - 18 SALLES D\'EXPOSITION'
                  : langKey === 'zh'
                  ? '博物馆参观平面图 - 18个展厅'
                  : langKey === 'ja'
                  ? '館内案内図 - 18の展示室'
                  : 'SƠ ĐỒ THAM QUAN - 18 GIAN PHÒNG TRƯNG BÀY'}
              </span>
            </div>
            <span className="ifp-heritage-legend-hint">
              {langKey === 'en'
                ? 'Click any room to view route, 360° tour and voice AI guide'
                : 'Bấm vào từng phòng để xem lộ trình, không gian 360° và nghe thuyết minh'}
            </span>
          </div>

          <div className="ifp-heritage-legend-grid">
            {displayRooms.map((item: any) => {
              const isSelected = selectedNodeId === item.id || selectedNodeId === item.code;
              const has360 = item.roomId && isRoomValid(item.roomId);
              const num = item.heritageNum || 0;

              return (
                <div
                  key={item.id}
                  className={`ifp-heritage-legend-item ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setInternalSelectedNodeId(item.id);
                    onNodeSelect?.(item.id);
                  }}
                >
                  <div className="ifp-heritage-legend-num">{num}</div>
                  <div className="ifp-heritage-legend-info">
                    <div className="ifp-heritage-legend-name">
                      <span>{langKey === 'en' && item.heritageNameEn ? item.heritageNameEn : (item.heritageNameVi || item.name)}</span>
                      {has360 && <span className="ifp-heritage-legend-360">360°</span>}
                    </div>
                    <div className="ifp-heritage-legend-period">
                      {item.heritagePeriod || item.period || 'Khu vực trưng bày số hóa'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
