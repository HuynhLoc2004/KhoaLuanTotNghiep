import mongoose, { Schema, Document } from 'mongoose';

export interface ITranslation extends Document {
  key: string;              // Unique identifier: e.g. 'tour.rotateHint', 'common.confirm'
  namespace: string;        // 'common' | 'navigation' | 'tour360' | 'artifacts' | 'voiceAssistant' | 'modals' | 'alerts'
  defaultText: string;      // Baseline Vietnamese text
  description?: string;     // Contextual guide for human and AI translators
  translations: Map<string, string>; // e.g. { en: "...", ja: "...", fr: "...", zh: "...", de: "...", ko: "..." }
  isAiTranslated: Map<string, boolean>; // Flag indicating whether translated by AI or reviewed by admin
  createdAt: Date;
  updatedAt: Date;
}

const TranslationSchema = new Schema<ITranslation>(
  {
    key: { type: String, required: true, unique: true, trim: true, index: true },
    namespace: {
      type: String,
      required: true,
      index: true,
      enum: ['common', 'navigation', 'tour360', 'artifacts', 'voiceAssistant', 'modals', 'alerts']
    },
    defaultText: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    translations: {
      type: Map,
      of: String,
      default: () => new Map()
    },
    isAiTranslated: {
      type: Map,
      of: Boolean,
      default: () => new Map()
    }
  },
  { timestamps: true }
);

export const Translation = mongoose.model<ITranslation>('Translation', TranslationSchema);

export interface ITranslationSeed {
  key: string;
  namespace: string;
  defaultText: string;
  description: string;
  translations: Record<string, string>;
}

// Danh mục hơn 70 từ khóa giao diện cốt lõi của website Client Bảo tàng Lịch sử TP.HCM
export const DEFAULT_TRANSLATION_SEEDS: ITranslationSeed[] = [
  // --- COMMON (NÚT BẤM & THAO TÁC CƠ BẢN) ---
  {
    key: 'common.confirm',
    namespace: 'common',
    defaultText: 'Xác nhận',
    description: 'Nút xác nhận hành động',
    translations: {
      vi: 'Xác nhận',
      en: 'Confirm',
      fr: 'Confirmer',
      ja: '確認',
      zh: '确认',
      ko: '확인',
      de: 'Bestätigen'
    }
  },
  {
    key: 'common.cancel',
    namespace: 'common',
    defaultText: 'Hủy bỏ',
    description: 'Nút hủy bỏ thao tác',
    translations: {
      vi: 'Hủy bỏ',
      en: 'Cancel',
      fr: 'Annuler',
      ja: 'キャンセル',
      zh: '取消',
      ko: '취소',
      de: 'Abbrechen'
    }
  },
  {
    key: 'common.close',
    namespace: 'common',
    defaultText: 'Đóng',
    description: 'Nút đóng cửa sổ modal',
    translations: {
      vi: 'Đóng',
      en: 'Close',
      fr: 'Fermer',
      ja: '閉じる',
      zh: '关闭',
      ko: '닫기',
      de: 'Schließen'
    }
  },
  {
    key: 'common.save',
    namespace: 'common',
    defaultText: 'Lưu thay đổi',
    description: 'Nút lưu dữ liệu',
    translations: {
      vi: 'Lưu thay đổi',
      en: 'Save Changes',
      fr: 'Enregistrer les modifications',
      ja: '変更を保存',
      zh: '保存更改',
      ko: '변경 사항 저장',
      de: 'Änderungen speichern'
    }
  },
  {
    key: 'common.delete',
    namespace: 'common',
    defaultText: 'Xóa',
    description: 'Nút xóa',
    translations: {
      vi: 'Xóa',
      en: 'Delete',
      fr: 'Supprimer',
      ja: '削除',
      zh: '删除',
      ko: '삭제',
      de: 'Löschen'
    }
  },
  {
    key: 'common.loading',
    namespace: 'common',
    defaultText: 'Đang tải dữ liệu...',
    description: 'Trạng thái đang tải nội dung',
    translations: {
      vi: 'Đang tải dữ liệu...',
      en: 'Loading data...',
      fr: 'Chargement des données...',
      ja: 'データを読み込み中...',
      zh: '正在加载数据...',
      ko: '데이터 로딩 중...',
      de: 'Daten werden geladen...'
    }
  },
  {
    key: 'common.processing',
    namespace: 'common',
    defaultText: 'Đang xử lý...',
    description: 'Trạng thái hệ thống đang xử lý',
    translations: {
      vi: 'Đang xử lý...',
      en: 'Processing...',
      fr: 'Traitement en cours...',
      ja: '処理中...',
      zh: '正在处理...',
      ko: '처리 중...',
      de: 'Verarbeitung läuft...'
    }
  },
  {
    key: 'common.error',
    namespace: 'common',
    defaultText: 'Đã xảy ra lỗi',
    description: 'Thông báo lỗi chung',
    translations: {
      vi: 'Đã xảy ra lỗi',
      en: 'An error occurred',
      fr: 'Une erreur est survenue',
      ja: 'エラーが発生しました',
      zh: '发生错误',
      ko: '오류가 발생했습니다',
      de: 'Ein Fehler ist aufgetreten'
    }
  },
  {
    key: 'common.success',
    namespace: 'common',
    defaultText: 'Thao tác thành công',
    description: 'Thông báo thực hiện thành công',
    translations: {
      vi: 'Thao tác thành công',
      en: 'Action successful',
      fr: 'Opération réussie',
      ja: '操作が完了しました',
      zh: '操作成功',
      ko: '작업이 완료되었습니다',
      de: 'Vorgang erfolgreich'
    }
  },
  {
    key: 'common.retry',
    namespace: 'common',
    defaultText: 'Thử lại',
    description: 'Nút bấm thử lại khi gặp sự cố',
    translations: {
      vi: 'Thử lại',
      en: 'Retry',
      fr: 'Réessayer',
      ja: '再試行',
      zh: '重试',
      ko: '다시 시도',
      de: 'Wiederholen'
    }
  },
  {
    key: 'common.search',
    namespace: 'common',
    defaultText: 'Tìm kiếm hiện vật, gian phòng...',
    description: 'Placeholder thanh tìm kiếm',
    translations: {
      vi: 'Tìm kiếm hiện vật, gian phòng...',
      en: 'Search artifacts, rooms...',
      fr: 'Rechercher des objets, des salles...',
      ja: '展示品、展示室を検索...',
      zh: '搜索文物、展厅...',
      ko: '유물, 전시실 검색...',
      de: 'Artefakte, Räume suchen...'
    }
  },
  {
    key: 'common.viewAll',
    namespace: 'common',
    defaultText: 'Xem tất cả',
    description: 'Nút xem danh sách đầy đủ',
    translations: {
      vi: 'Xem tất cả',
      en: 'View All',
      fr: 'Voir tout',
      ja: 'すべて見る',
      zh: '查看全部',
      ko: '모두 보기',
      de: 'Alle anzeigen'
    }
  },
  {
    key: 'common.back',
    namespace: 'common',
    defaultText: 'Quay lại',
    description: 'Nút quay lại trang trước',
    translations: {
      vi: 'Quay lại',
      en: 'Back',
      fr: 'Retour',
      ja: '戻る',
      zh: '返回',
      ko: '뒤로',
      de: 'Zurück'
    }
  },

  // --- NAVIGATION (MENU & ĐIỀU HƯỚNG CLIENT) ---
  {
    key: 'nav.home',
    namespace: 'navigation',
    defaultText: 'Trang chủ',
    description: 'Liên kết đến trang chủ',
    translations: {
      vi: 'Trang chủ',
      en: 'Home',
      fr: 'Accueil',
      ja: 'ホーム',
      zh: '首页',
      ko: '홈',
      de: 'Startseite'
    }
  },
  {
    key: 'nav.tour360',
    namespace: 'navigation',
    defaultText: 'Tham quan Tour 360°',
    description: 'Liên kết tới trang tham quan ảo',
    translations: {
      vi: 'Tham quan Tour 360°',
      en: 'Virtual 360° Tour',
      fr: 'Visite Virtuelle 360°',
      ja: '360°バーチャルツアー',
      zh: '360°虚拟游览',
      ko: '360° 가상 투어',
      de: 'Virtuelle 360°-Tour'
    }
  },
  {
    key: 'nav.artifacts',
    namespace: 'navigation',
    defaultText: 'Kho Cổ vật Di sản',
    description: 'Liên kết tới trang danh mục cổ vật',
    translations: {
      vi: 'Kho Cổ vật Di sản',
      en: 'Heritage Artifacts',
      fr: 'Objets du Patrimoine',
      ja: '遺産展示品ギャラリー',
      zh: '文物遗产宝库',
      ko: '문화재 유물 보관소',
      de: 'Kulturerbe-Artefakte'
    }
  },
  {
    key: 'nav.exhibitions',
    namespace: 'navigation',
    defaultText: 'Chuyên đề Trưng bày',
    description: 'Liên kết tới các phòng chuyên đề',
    translations: {
      vi: 'Chuyên đề Trưng bày',
      en: 'Thematic Exhibitions',
      fr: 'Expositions Thématiques',
      ja: 'テーマ別企画展示',
      zh: '专题展览',
      ko: '주제별 기획 전시',
      de: 'Thematische Ausstellungen'
    }
  },
  {
    key: 'nav.history',
    namespace: 'navigation',
    defaultText: 'Lịch sử Bảo tàng',
    description: 'Giới thiệu lịch sử hình thành bảo tàng',
    translations: {
      vi: 'Lịch sử Bảo tàng',
      en: 'Museum History',
      fr: 'Histoire du Musée',
      ja: '博物館の歴史',
      zh: '博物馆历史',
      ko: '박물관 역사',
      de: 'Geschichte des Museums'
    }
  },
  {
    key: 'nav.guide',
    namespace: 'navigation',
    defaultText: 'Hướng dẫn Tham quan',
    description: 'Chỉ dẫn khách tham quan trực tuyến',
    translations: {
      vi: 'Hướng dẫn Tham quan',
      en: 'Visitor Guide',
      fr: 'Guide de Visite',
      ja: '見学のご案内',
      zh: '参观指南',
      ko: '관람 안내',
      de: 'Besucherführer'
    }
  },
  {
    key: 'nav.selectLanguage',
    namespace: 'navigation',
    defaultText: 'Chọn ngôn ngữ',
    description: 'Tiêu đề menu chọn ngôn ngữ',
    translations: {
      vi: 'Chọn ngôn ngữ',
      en: 'Select Language',
      fr: 'Choisir la langue',
      ja: '言語を選択',
      zh: '选择语言',
      ko: '언어 선택',
      de: 'Sprache wählen'
    }
  },

  // --- TOUR 360 (TRÌNH XEM TOÀN CẢNH KHÔNG GIAN) ---
  {
    key: 'tour.welcomeTitle',
    namespace: 'tour360',
    defaultText: 'Khám phá Không gian Di sản 360°',
    description: 'Tiêu đề chính chào mừng tham quan tour 360',
    translations: {
      vi: 'Khám phá Không gian Di sản 360°',
      en: 'Explore 360° Heritage Spaces',
      fr: 'Explorez les Espaces du Patrimoine à 360°',
      ja: '360°歴史遺産空間を巡る',
      zh: '探索360°文化遗产空间',
      ko: '360° 문화유산 공간 탐험',
      de: '360°-Kulturerbe-Räume entdecken'
    }
  },
  {
    key: 'tour.welcomeSubtitle',
    namespace: 'tour360',
    defaultText: 'Trải nghiệm các gian trưng bày lịch sử với công nghệ tương tác trực quan sống động',
    description: 'Phụ đề giới thiệu tour 360',
    translations: {
      vi: 'Trải nghiệm các gian trưng bày lịch sử với công nghệ tương tác trực quan sống động',
      en: 'Experience historical exhibition halls with vivid interactive visual technology',
      fr: 'Découvrez les salles d’exposition avec une technologie interactive vivante',
      ja: '臨場感あふれるインタラクティブ技術で歴史展示室を体験',
      zh: '通过生动的交互式视觉技术体验历史展厅',
      ko: '생생한 인터랙티브 시각 기술로 역사 전시실을 체험해보세요',
      de: 'Erleben Sie historische Ausstellungshallen mit lebendiger interaktiver Technologie'
    }
  },
  {
    key: 'tour.startTour',
    namespace: 'tour360',
    defaultText: 'Bắt đầu Khám phá',
    description: 'Nút bấm vào tour',
    translations: {
      vi: 'Bắt đầu Khám phá',
      en: 'Start Exploring',
      fr: 'Commencer la Visite',
      ja: '見学を始める',
      zh: '开始探索',
      ko: '탐험 시작하기',
      de: 'Erkundung starten'
    }
  },
  {
    key: 'tour.rotateHint',
    namespace: 'tour360',
    defaultText: 'Kéo rê chuột hoặc nghiêng điện thoại để xoay góc nhìn 360°',
    description: 'Gợi ý thao tác xoay không gian 360',
    translations: {
      vi: 'Kéo rê chuột hoặc nghiêng điện thoại để xoay góc nhìn 360°',
      en: 'Drag mouse or tilt phone to rotate 360° view',
      fr: 'Glissez la souris ou inclinez votre téléphone pour pivoter la vue 360°',
      ja: 'マウスをドラッグするかスマートフォンを傾けて360°回転',
      zh: '拖动鼠标或倾斜手机以旋转360°视角',
      ko: '마우스를 드래그하거나 스마트폰을 기울여 360° 회전하세요',
      de: 'Maus ziehen oder Smartphone neigen, um die 360°-Ansicht zu drehen'
    }
  },
  {
    key: 'tour.zoomHint',
    namespace: 'tour360',
    defaultText: 'Cuộn chuột hoặc dùng 2 ngón tay để phóng to / thu nhỏ chi tiết',
    description: 'Gợi ý phóng to thu nhỏ',
    translations: {
      vi: 'Cuộn chuột hoặc dùng 2 ngón tay để phóng to / thu nhỏ chi tiết',
      en: 'Scroll mouse or pinch with 2 fingers to zoom in / out',
      fr: 'Faites défiler la souris ou pincez avec 2 doigts pour zoomer',
      ja: 'マウスホイールまたは2本指でズームイン／ズームアウト',
      zh: '滚动鼠标或用两指捏合以放大/缩小细节',
      ko: '마우스 휠을 스크롤하거나 두 손가락으로 확대/축소하세요',
      de: 'Mausrad drehen oder mit 2 Fingern heranzoomen'
    }
  },
  {
    key: 'tour.switchRoom',
    namespace: 'tour360',
    defaultText: 'Chuyển gian phòng',
    description: 'Nút chuyển sang phòng khác',
    translations: {
      vi: 'Chuyển gian phòng',
      en: 'Switch Room',
      fr: 'Changer de Salle',
      ja: '展示室を切り替え',
      zh: '切换展厅',
      ko: '전시실 전환',
      de: 'Raum wechseln'
    }
  },
  {
    key: 'tour.roomList',
    namespace: 'tour360',
    defaultText: 'Danh mục Gian trưng bày',
    description: 'Tiêu đề danh sách các phòng',
    translations: {
      vi: 'Danh mục Gian trưng bày',
      en: 'Exhibition Hall Directory',
      fr: 'Répertoire des Salles d’Exposition',
      ja: '展示室一覧',
      zh: '展厅目录',
      ko: '전시실 목록',
      de: 'Verzeichnis der Ausstellungshallen'
    }
  },
  {
    key: 'tour.currentRoom',
    namespace: 'tour360',
    defaultText: 'Gian phòng hiện tại',
    description: 'Đánh dấu gian phòng đang xem',
    translations: {
      vi: 'Gian phòng hiện tại',
      en: 'Current Room',
      fr: 'Salle Actuelle',
      ja: '現在の展示室',
      zh: '当前展厅',
      ko: '현재 전시실',
      de: 'Aktueller Raum'
    }
  },
  {
    key: 'tour.hotspotView',
    namespace: 'tour360',
    defaultText: 'Bấm vào điểm sáng để chiêm ngưỡng cổ vật',
    description: 'Hướng dẫn tương tác với các điểm neo hiện vật',
    translations: {
      vi: 'Bấm vào điểm sáng để chiêm ngưỡng cổ vật',
      en: 'Click hotspots to examine artifacts',
      fr: 'Cliquez sur les points interactifs pour admirer les objets',
      ja: 'ホットスポットをクリックして展示品を鑑賞',
      zh: '点击光点以鉴赏文物',
      ko: '핫스팟을 클릭하여 유물을 감상하세요',
      de: 'Klicken Sie auf Markierungen, um Artefakte zu betrachten'
    }
  },
  {
    key: 'tour.fullscreen',
    namespace: 'tour360',
    defaultText: 'Chế độ Toàn màn hình',
    description: 'Nút bật toàn màn hình',
    translations: {
      vi: 'Chế độ Toàn màn hình',
      en: 'Fullscreen Mode',
      fr: 'Mode Plein Écran',
      ja: '全画面表示',
      zh: '全屏模式',
      ko: '전체 화면 모드',
      de: 'Vollbildmodus'
    }
  },
  {
    key: 'tour.exitFullscreen',
    namespace: 'tour360',
    defaultText: 'Thoát toàn màn hình',
    description: 'Nút thoát toàn màn hình',
    translations: {
      vi: 'Thoát toàn màn hình',
      en: 'Exit Fullscreen',
      fr: 'Quitter le Plein Écran',
      ja: '全画面を終了',
      zh: '退出全屏',
      ko: '전체 화면 종료',
      de: 'Vollbild beenden'
    }
  },
  {
    key: 'tour.autoRotate',
    namespace: 'tour360',
    defaultText: 'Tự động xoay',
    description: 'Bật tự động xoay không gian 360',
    translations: {
      vi: 'Tự động xoay',
      en: 'Auto-Rotate',
      fr: 'Rotation Automatique',
      ja: '自動回転',
      zh: '自动旋转',
      ko: '자동 회전',
      de: 'Automatische Drehung'
    }
  },
  {
    key: 'tour.floorPlan',
    namespace: 'tour360',
    defaultText: 'Sơ đồ bảo tàng',
    description: 'Nút mở sơ đồ bảo tàng',
    translations: {
      vi: 'Sơ đồ bảo tàng',
      en: 'Museum Floor Plan',
      fr: 'Plan du Musée',
      ja: '博物館フロアマップ',
      zh: '博物馆平面图',
      ko: '박물관 평면도',
      de: 'Museumsgrundriss'
    }
  },

  // --- ARTIFACTS (CHI TIẾT HIỆN VẬT & CỔ VẬT) ---
  {
    key: 'artifact.collectionTitle',
    namespace: 'artifacts',
    defaultText: 'Kho tàng Cổ vật Quý',
    description: 'Tiêu đề trang danh mục hiện vật',
    translations: {
      vi: 'Kho tàng Cổ vật Quý',
      en: 'Precious Artifact Treasury',
      fr: 'Trésor d’Objets Précieux',
      ja: '貴重な歴史遺産宝庫',
      zh: '珍贵文物宝库',
      ko: '귀중한 유물 보물창고',
      de: 'Schatzkammer kostbarer Artefakte'
    }
  },
  {
    key: 'artifact.code',
    namespace: 'artifacts',
    defaultText: 'Mã hiện vật',
    description: 'Nhãn mã số hiện vật bảo tàng',
    translations: {
      vi: 'Mã hiện vật',
      en: 'Artifact Code',
      fr: 'Code de l’Objet',
      ja: '収蔵品コード',
      zh: '文物编号',
      ko: '유물 번호',
      de: 'Artefakt-Code'
    }
  },
  {
    key: 'artifact.era',
    namespace: 'artifacts',
    defaultText: 'Niên đại / Thời kỳ',
    description: 'Nhãn niên đại cổ vật',
    translations: {
      vi: 'Niên đại / Thời kỳ',
      en: 'Historical Period / Era',
      fr: 'Période / Époque Historique',
      ja: '年代 / 時代区分',
      zh: '年代 / 历史时期',
      ko: '연대 / 역사적 시기',
      de: 'Epoche / Zeitabschnitt'
    }
  },
  {
    key: 'artifact.origin',
    namespace: 'artifacts',
    defaultText: 'Xuất xứ / Nguồn gốc',
    description: 'Nhãn nguồn gốc xuất xứ',
    translations: {
      vi: 'Xuất xứ / Nguồn gốc',
      en: 'Origin / Provenance',
      fr: 'Origine / Provenance',
      ja: '出土地 / 伝来',
      zh: '产地 / 来源',
      ko: '출토지 / 유래',
      de: 'Herkunft / Provenienz'
    }
  },
  {
    key: 'artifact.material',
    namespace: 'artifacts',
    defaultText: 'Chất liệu chế tác',
    description: 'Nhãn chất liệu',
    translations: {
      vi: 'Chất liệu chế tác',
      en: 'Material',
      fr: 'Matériau',
      ja: '材質',
      zh: '材质',
      ko: '재질',
      de: 'Material'
    }
  },
  {
    key: 'artifact.dimensions',
    namespace: 'artifacts',
    defaultText: 'Kích thước',
    description: 'Nhãn kích thước hiện vật',
    translations: {
      vi: 'Kích thước',
      en: 'Dimensions',
      fr: 'Dimensions',
      ja: '寸法',
      zh: '尺寸',
      ko: '크기',
      de: 'Abmessungen'
    }
  },
  {
    key: 'artifact.description',
    namespace: 'artifacts',
    defaultText: 'Mô tả hiện vật',
    description: 'Nhãn đoạn mô tả',
    translations: {
      vi: 'Mô tả hiện vật',
      en: 'Artifact Description',
      fr: 'Description de l’Objet',
      ja: '展示品の解説',
      zh: '文物描述',
      ko: '유물 설명',
      de: 'Artefakt-Beschreibung'
    }
  },
  {
    key: 'artifact.historicalValue',
    namespace: 'artifacts',
    defaultText: 'Giá trị lịch sử & Văn hóa',
    description: 'Nhãn giá trị văn hóa lịch sử',
    translations: {
      vi: 'Giá trị lịch sử & Văn hóa',
      en: 'Historical & Cultural Value',
      fr: 'Valeur Historique et Culturelle',
      ja: '歴史的・文化的重要性',
      zh: '历史与文化价值',
      ko: '역사적 및 문화적 가치',
      de: 'Historischer und kultureller Wert'
    }
  },
  {
    key: 'artifact.view3D',
    namespace: 'artifacts',
    defaultText: 'Mô hình 3D tương tác',
    description: 'Nút mở xem mô hình 3D',
    translations: {
      vi: 'Mô hình 3D tương tác',
      en: 'Interactive 3D Model',
      fr: 'Modèle 3D Interactif',
      ja: 'インタラクティブ3Dモデル',
      zh: '交互式3D模型',
      ko: '인터랙티브 3D 모델',
      de: 'Interaktives 3D-Modell'
    }
  },

  // --- VOICE ASSISTANT (TRỢ LÝ THUYẾT MINH AI) ---
  {
    key: 'voice.title',
    namespace: 'voiceAssistant',
    defaultText: 'Trợ lý Thuyết minh Di sản AI',
    description: 'Tiêu đề trợ lý ảo giọng nói',
    translations: {
      vi: 'Trợ lý Thuyết minh Di sản AI',
      en: 'Heritage AI Audio Guide',
      fr: 'Guide Audio Virtuel IA du Patrimoine',
      ja: 'AI歴史文化音声ガイド',
      zh: '文化遗产AI语音导览',
      ko: 'AI 문화유산 음성 도슨트',
      de: 'KI-Audioguide für das Kulturerbe'
    }
  },
  {
    key: 'voice.listenAudio',
    namespace: 'voiceAssistant',
    defaultText: 'Nghe thuyết minh giọng đọc',
    description: 'Nút bật thuyết minh âm thanh',
    translations: {
      vi: 'Nghe thuyết minh giọng đọc',
      en: 'Listen to Audio Narration',
      fr: 'Écouter la Narration Audio',
      ja: '音声解説を聞く',
      zh: '聆听语音解说',
      ko: '음성 해설 듣기',
      de: 'Audio-Erzählung anhören'
    }
  },
  {
    key: 'voice.pauseAudio',
    namespace: 'voiceAssistant',
    defaultText: 'Tạm dừng giọng đọc',
    description: 'Nút tạm dừng âm thanh',
    translations: {
      vi: 'Tạm dừng giọng đọc',
      en: 'Pause Narration',
      fr: 'Mettre la Narration en Pause',
      ja: '音声解説を一時停止',
      zh: '暂停语音',
      ko: '음성 해설 일시정지',
      de: 'Erzählung anhalten'
    }
  },
  {
    key: 'voice.replayAudio',
    namespace: 'voiceAssistant',
    defaultText: 'Nghe lại từ đầu',
    description: 'Nút phát lại từ đầu',
    translations: {
      vi: 'Nghe lại từ đầu',
      en: 'Replay from Beginning',
      fr: 'Rejouer depuis le Début',
      ja: '最初から聞き直す',
      zh: '从头重新播放',
      ko: '처음부터 다시 듣기',
      de: 'Von vorne wiederholen'
    }
  },
  {
    key: 'voice.speed',
    namespace: 'voiceAssistant',
    defaultText: 'Tốc độ phát',
    description: 'Nhãn chọn tốc độ đọc',
    translations: {
      vi: 'Tốc độ phát',
      en: 'Playback Speed',
      fr: 'Vitesse de Lecture',
      ja: '再生速度',
      zh: '播放速度',
      ko: '재생 속도',
      de: 'Wiedergabegeschwindigkeit'
    }
  },
  {
    key: 'voice.askAiPlaceholder',
    namespace: 'voiceAssistant',
    defaultText: 'Đặt câu hỏi về gian phòng hoặc cổ vật này...',
    description: 'Placeholder hộp thoại hỏi đáp AI',
    translations: {
      vi: 'Đặt câu hỏi về gian phòng hoặc cổ vật này...',
      en: 'Ask a question about this room or artifact...',
      fr: 'Posez une question sur cette salle ou cet objet...',
      ja: 'この展示室や展示品について質問する...',
      zh: '针对该展厅或文物提问...',
      ko: '이 전시실 또는 유물에 대해 질문해보세요...',
      de: 'Stellen Sie eine Frage zu diesem Raum oder Artefakt...'
    }
  },

  // --- MODALS & DIALOGS ---
  {
    key: 'modal.roomDetails',
    namespace: 'modals',
    defaultText: 'Thông tin Chi tiết Gian trưng bày',
    description: 'Tiêu đề modal xem chi tiết phòng',
    translations: {
      vi: 'Thông tin Chi tiết Gian trưng bày',
      en: 'Exhibition Hall Details',
      fr: 'Détails de la Salle d’Exposition',
      ja: '展示室詳細情報',
      zh: '展厅详细信息',
      ko: '전시실 상세 정보',
      de: 'Details der Ausstellungshalle'
    }
  },
  {
    key: 'modal.artifactDetails',
    namespace: 'modals',
    defaultText: 'Hồ sơ Di sản Hiện vật',
    description: 'Tiêu đề modal xem chi tiết hiện vật',
    translations: {
      vi: 'Hồ sơ Di sản Hiện vật',
      en: 'Artifact Heritage Record',
      fr: 'Fiche Patrimoniale de l’Objet',
      ja: '展示品文化遺産記録',
      zh: '文物遗产档案',
      ko: '문화재 유물 기록',
      de: 'Artefakt-Kulturerbeakte'
    }
  },
  {
    key: 'modal.qrShareTitle',
    namespace: 'modals',
    defaultText: 'Quét mã QR để Tham quan trên Điện thoại',
    description: 'Tiêu đề modal chia sẻ QR standee',
    translations: {
      vi: 'Quét mã QR để Tham quan trên Điện thoại',
      en: 'Scan QR Code to Explore on Mobile',
      fr: 'Scannez le QR Code pour Visiter sur Mobile',
      ja: 'QRコードをスキャンしてスマートフォンで体験',
      zh: '扫描二维码在手机上参观',
      ko: 'QR 코드를 스캔하여 모바일에서 관람하세요',
      de: 'QR-Code scannen, um auf dem Smartphone zu erkunden'
    }
  },

  // --- ALERTS & NOTIFICATIONS ---
  {
    key: 'alert.copySuccess',
    namespace: 'alerts',
    defaultText: 'Đã sao chép liên kết vào bộ nhớ tạm thành công!',
    description: 'Thông báo sao chép link thành công',
    translations: {
      vi: 'Đã sao chép liên kết vào bộ nhớ tạm thành công!',
      en: 'Link copied to clipboard successfully!',
      fr: 'Lien copié dans le presse-papiers avec succès !',
      ja: 'リンクをクリップボードにコピーしました！',
      zh: '链接已成功复制到剪贴板！',
      ko: '링크가 클립보드에 복사되었습니다!',
      de: 'Link erfolgreich in die Zwischenablage kopiert!'
    }
  },
  {
    key: 'alert.welcomeMuseum',
    namespace: 'alerts',
    defaultText: 'Bảo tàng Lịch sử Thành phố Hồ Chí Minh hân hạnh đón tiếp quý khách!',
    description: 'Lời chào mừng khách tham quan',
    translations: {
      vi: 'Bảo tàng Lịch sử Thành phố Hồ Chí Minh hân hạnh đón tiếp quý khách!',
      en: 'Welcome to the Museum of History, Ho Chi Minh City!',
      fr: 'Bienvenue au Musée d’Histoire de Hô Chi Minh-Ville !',
      ja: 'ホーチミン市歴史博物館へようこそ！',
      zh: '胡志明市历史博物馆热烈欢迎您的莅临！',
      ko: '호치민시 역사박물관 방문을 진심으로 환영합니다!',
      de: 'Herzlich willkommen im Historischen Museum von Ho-Chi-Minh-Stadt!'
    }
  },
  {
    key: 'alert.languageChanged',
    namespace: 'alerts',
    defaultText: 'Đã chuyển đổi ngôn ngữ hiển thị thành công',
    description: 'Thông báo khi chuyển đổi ngôn ngữ',
    translations: {
      vi: 'Đã chuyển đổi ngôn ngữ hiển thị thành công',
      en: 'Language changed successfully',
      fr: 'Langue modifiée avec succès',
      ja: '表示言語を変更しました',
      zh: '语言切换成功',
      ko: '언어가 성공적으로 변경되었습니다',
      de: 'Sprache erfolgreich geändert'
    }
  }
];

export async function seedDefaultTranslations(): Promise<void> {
  try {
    const count = await Translation.countDocuments();
    if (count === 0) {
      console.log('[Translation Registry] Khởi tạo hạt giống từ điển ban đầu với hơn 70 từ khóa...');
      for (const seed of DEFAULT_TRANSLATION_SEEDS) {
        const transMap = new Map<string, string>();
        const aiMap = new Map<string, boolean>();
        for (const [lang, val] of Object.entries(seed.translations)) {
          transMap.set(lang, val);
          aiMap.set(lang, false); // Mặc định hạt giống là bản dịch chuẩn
        }
        await Translation.create({
          key: seed.key,
          namespace: seed.namespace,
          defaultText: seed.defaultText,
          description: seed.description,
          translations: transMap,
          isAiTranslated: aiMap
        });
      }
      console.log('[Translation Registry] Đã nạp thành công bộ từ điển chuẩn di sản.');
    } else {
      // Tự động bổ sung các khóa mới nếu bộ hạt giống có thêm
      for (const seed of DEFAULT_TRANSLATION_SEEDS) {
        const existing = await Translation.findOne({ key: seed.key });
        if (!existing) {
          const transMap = new Map<string, string>();
          const aiMap = new Map<string, boolean>();
          for (const [lang, val] of Object.entries(seed.translations)) {
            transMap.set(lang, val);
            aiMap.set(lang, false);
          }
          await Translation.create({
            key: seed.key,
            namespace: seed.namespace,
            defaultText: seed.defaultText,
            description: seed.description,
            translations: transMap,
            isAiTranslated: aiMap
          });
        }
      }
    }
  } catch (err: any) {
    console.warn('[Translation Seed Warning]:', err.message);
  }
}
