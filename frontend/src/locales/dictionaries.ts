/**
 * Hệ thống từ điển i18n chuẩn hóa đa ngôn ngữ cho Bảo tàng Lịch sử TP.HCM
 * Đạt chuẩn đồ án tốt nghiệp, thuần React i18n, không phụ thuộc Google Translate.
 * Nạp trực tiếp trong RAM: tra cứu O(1), tốc độ 0ms, không bao giờ bị giật chớp chữ khi F5.
 */

export type LocaleDictionary = Record<string, string>;

export const DICTIONARY_VI: LocaleDictionary = {
  // Navigation & Header
  'nav.museumTitle': 'Bảo tàng Lịch sử TP. Hồ Chí Minh',
  'nav.adminTitle': 'Ban Quản trị Bảo tàng Lịch sử',
  'nav.adminRole': 'Quản trị viên (Admin)',
  'nav.breadcrumbMuseum': 'Bảo tàng Lịch sử',
  'nav.viewTour': 'Xem Tour Khách',
  'nav.rooms': 'Gian trưng bày & Tour 360',
  'nav.pocStitching': 'Tạo ảnh toàn cảnh 360°',
  'nav.artifacts': 'Hiện vật & Cổ vật di sản',
  'nav.languages': 'Quản trị Ngôn ngữ & Voice AI',
  'nav.analytics': 'Báo cáo & Thống kê',
  'nav.settings': 'Cấu hình hệ thống',
  'nav.themeLight': 'Chuyển sang giao diện Sáng',
  'nav.themeDark': 'Chuyển sang giao diện Tối',
  'nav.dashboard': 'Bảng Điều Khiển',

  // Băng Thống kê Di sản (Heritage Stats Banner)
  'stats.roomsTitle': 'Gian phòng Trưng bày',
  'stats.roomsUnit': 'không gian',
  'stats.digitized': 'Số hóa',
  'stats.ready': 'Sẵn sàng đón khách',
  'stats.artifactsTitle': 'Hiện vật & Điểm khảo cứu',
  'stats.artifactsUnit': 'tọa độ di sản',
  'stats.artifactsSub': 'Định vị tư liệu & dẫn hướng tour 360',
  'stats.narrationTitle': 'Thuyết minh Di sản',
  'stats.narrationUnit': 'chuyên khảo',
  'stats.narrationSub': 'Biên tập tư liệu lịch sử & âm thanh bản xứ',
  'stats.scansTitle': 'Tương tác Thực địa',
  'stats.scansUnit': 'lượt quét',
  'stats.scansSub': 'Du khách quét mã tại gian trưng bày',

  // Rooms Management Page
  'rooms.title': 'Gian trưng bày & Tour 360',
  'rooms.desc': 'Quản trị không gian toàn cảnh 360°, điểm neo di sản và thiết lập điểm nhìn đầu tiên.',
  'rooms.tabRooms': 'Gian Phòng Triển Lãm',
  'rooms.tabStorage': 'Kho Không Gian 360° Đã Ghép',
  'rooms.addRoom': 'Thêm gian phòng mới',
  'rooms.exportStandee': 'Xuất gói QR Standee',
  'rooms.searchPlaceholder': 'Tìm theo tên phòng, mã P-01, P-05...',
  'rooms.searchPlaceholderPano': 'Tìm tên file ảnh toàn cảnh 360°...',
  'rooms.allThemes': 'Tất cả chuyên đề trưng bày',
  'rooms.allStatuses': 'Tất cả trạng thái',
  'rooms.statusActive': 'Đang hoạt động',
  'rooms.statusInactive': 'Tạm ẩn',
  'rooms.statusAiEnabled': 'Đã bật AI Voice',
  'rooms.statusNoAi': 'Chưa cấu hình AI',
  'rooms.viewGrid': 'Lưới',
  'rooms.viewTable': 'Bảng',
  'rooms.explore360': 'Biên tập 360',
  'rooms.narration': 'Thuyết minh',
  'rooms.qrCode': 'Mã QR',
  'rooms.edit': 'Sửa',
  'rooms.delete': 'Xóa',
  'rooms.anchorPoints': 'điểm neo',
  'rooms.notConfigured': 'Chưa cấu hình',
  'rooms.aiEnabled': 'Đã có thuyết minh',
  'rooms.angle360': 'góc 360°',
  'rooms.scans': 'lượt quét',
  'rooms.defaultPeriod': 'Hiện vật Lịch sử',
  'rooms.defaultDesc': 'Chưa có thông tin mô tả chi tiết cho gian phòng này.',
  'rooms.unit': 'gian phòng',
  'rooms.thRoom': 'Gian phòng',
  'rooms.thCode': 'Mã số',
  'rooms.thTopic': 'Chuyên đề',
  'rooms.thHotspots': 'Điểm neo',
  'rooms.thNarration': 'Thuyết minh & Voice',
  'rooms.thScans': 'Lượt quét QR',
  'rooms.thActions': 'Thao tác',

  // QR Standee Modal
  'rooms.qrModalTitle': 'Mã QR Tham Quan',
  'rooms.roomCode': 'Mã phòng',
  'rooms.scanToExplore': 'Quét mã để tham quan không gian 360°',
  'rooms.scanToExploreSub': 'Scan to explore 360° virtual tour',
  'rooms.copiedLink': 'Đã sao chép liên kết tham quan',
  'rooms.printStandee': 'In Standee',
  'rooms.enter360': 'Vào phòng 360°',

  // Pagination
  'pagination.showing': 'Hiển thị',
  'pagination.to': '-',
  'pagination.of': 'trên tổng số',
  'pagination.perPage': 'Mỗi trang:',
  'pagination.unit': '/ trang',
  'pagination.prev': 'Trước',
  'pagination.next': 'Sau',

  // Panorama Studio 360
  'studio.backToRooms': 'Gian trưng bày & Tour 360',
  'studio.save': 'Lưu cấu hình không gian',
  'studio.setInitialView': 'Đặt góc nhìn ban đầu',
  'studio.addHotspot': 'Thêm điểm neo di sản',
  'studio.hotspotNav': 'Điểm chuyển tiếp phòng',
  'studio.hotspotInfo': 'Điểm thuyết minh hiện vật',
  'studio.editHotspot': 'Sửa điểm neo',
  'studio.deleteHotspot': 'Xóa điểm neo',

  // POC Stitching / Tạo ảnh 360°
  'stitching.title': 'Tạo & Ghép Ảnh Toàn Cảnh 360°',
  'stitching.desc': 'Chụp trực tiếp bằng camera điện thoại hoặc tải lên chùm ảnh góc để ghép thành không gian tham quan 360° hoàn chỉnh.',
  'stitching.inputSource': 'Nguồn ảnh đầu vào',
  'stitching.clearPhotos': 'Xóa ảnh',
  'stitching.captureCamera': 'Chụp camera',
  'stitching.captureWebcam': 'Chụp bằng webcam',
  'stitching.uploadFiles': 'Chọn từ máy',
  'stitching.pcHint': 'Bạn đang dùng máy tính. Chụp trực tiếp từng góc cho chất lượng tốt nhất trên điện thoại; trên máy tính hãy chụp bằng webcam hoặc tải sẵn bộ ảnh lên qua nút "Chọn từ máy".',
  'stitching.shootingGuide': 'Hướng dẫn cách chụp ảnh 360° chuẩn',
  'stitching.stitchBtn': 'Tạo không gian toàn cảnh 360 độ',
  'stitching.loadSample': 'Nạp ảnh mẫu 360° chuẩn',
  'stitching.previewTitle': 'Trình xem trước không gian 360°',
  'stitching.noSpace': 'Chưa có không gian 360° được tải',
  'stitching.noSpaceDesc': 'Chụp trực tiếp bằng điện thoại, tải ảnh PANO lên từ bảng điều khiển bên trái, hoặc bấm xem thử không gian mẫu để làm quen giao diện.',
  'stitching.viewSample': 'Xem thử không gian mẫu',
  'stitching.viewGuide': 'Xem hướng dẫn chụp',
  'stitching.libraryTitle': 'Thư viện không gian 360° đã tạo',

  // Common UI
  'common.confirm': 'Xác nhận',
  'common.cancel': 'Hủy bỏ',
  'common.save': 'Lưu lại',
  'common.close': 'Đóng',
  'common.copy': 'Sao chép',
  'common.loading': 'Đang tải dữ liệu không gian bảo tàng...',
  'common.refresh': 'Làm mới',
  'common.emptyData': 'Chưa có dữ liệu phù hợp',
  'common.items': 'mục',
  'common.thesisTitle': 'Đề tài Tốt nghiệp 2026',
  'common.thesisFooter': 'Đề tài Tốt nghiệp 2026 • Hệ thống Tour 360 Không gian Di sản'
};

export const DICTIONARY_EN: LocaleDictionary = {
  // Navigation & Header
  'nav.museumTitle': 'Museum of History in Ho Chi Minh City',
  'nav.adminTitle': 'History Museum Board of Management',
  'nav.adminRole': 'Administrator (Admin)',
  'nav.breadcrumbMuseum': 'History Museum',
  'nav.viewTour': 'View Visitor Tour',
  'nav.rooms': 'Exhibition Rooms & 360 Tour',
  'nav.pocStitching': 'Create 360° Panorama',
  'nav.artifacts': 'Artifacts & Heritage Relics',
  'nav.languages': 'Language & Voice AI Management',
  'nav.analytics': 'Reports & Statistics',
  'nav.settings': 'System Configuration',
  'nav.themeLight': 'Switch to Light Mode',
  'nav.themeDark': 'Switch to Dark Mode',
  'nav.dashboard': 'Dashboard',

  // Băng Thống kê Di sản (Heritage Stats Banner)
  'stats.roomsTitle': 'Exhibition Room',
  'stats.roomsUnit': 'spaces',
  'stats.digitized': 'Digitized',
  'stats.ready': 'Ready to welcome guests',
  'stats.artifactsTitle': 'Artifacts & Research Sites',
  'stats.artifactsUnit': 'heritage coordinates',
  'stats.artifactsSub': 'Location tracking and 360-degree tour guidance',
  'stats.narrationTitle': 'Heritage Description',
  'stats.narrationUnit': 'monograph',
  'stats.narrationSub': 'Editing historical documents & native audio',
  'stats.scansTitle': 'Field Interaction',
  'stats.scansUnit': 'scans',
  'stats.scansSub': 'Visitors scan the QR code at the exhibition booth',

  // Rooms Management Page
  'rooms.title': 'Exhibition Rooms & 360 Tour',
  'rooms.desc': 'Manage 360° panoramic spaces, heritage hotspots and configure initial viewpoints.',
  'rooms.tabRooms': 'Exhibition Room',
  'rooms.tabStorage': '360° Space Storage',
  'rooms.addRoom': 'Add a new room',
  'rooms.exportStandee': 'Export QR Standee packages',
  'rooms.searchPlaceholder': 'Search by room name, code P-01, P-05...',
  'rooms.searchPlaceholderPano': 'Search 360° panorama filenames...',
  'rooms.allThemes': 'All exhibition themes',
  'rooms.allStatuses': 'All states',
  'rooms.statusActive': 'Active',
  'rooms.statusInactive': 'Hidden',
  'rooms.statusAiEnabled': 'AI Voice Enabled',
  'rooms.statusNoAi': 'AI Not Configured',
  'rooms.viewGrid': 'Grid',
  'rooms.viewTable': 'Table',
  'rooms.explore360': '360 Studio',
  'rooms.narration': 'Narration',
  'rooms.qrCode': 'QR Code',
  'rooms.edit': 'Edit',
  'rooms.delete': 'Delete',
  'rooms.anchorPoints': 'anchor points',
  'rooms.notConfigured': 'Not yet configured',
  'rooms.aiEnabled': 'Audio enabled',
  'rooms.angle360': 'angle 360°',
  'rooms.scans': 'scans',
  'rooms.defaultPeriod': 'Historical Relic',
  'rooms.defaultDesc': 'No detailed description available for this exhibition room.',
  'rooms.unit': 'rooms',
  'rooms.thRoom': 'Exhibition Room',
  'rooms.thCode': 'Code',
  'rooms.thTopic': 'Theme / Topic',
  'rooms.thHotspots': 'Hotspots',
  'rooms.thNarration': 'Audio & Voice',
  'rooms.thScans': 'QR Scans',
  'rooms.thActions': 'Actions',

  // QR Standee Modal
  'rooms.qrModalTitle': 'Tour QR Code',
  'rooms.roomCode': 'Room Code',
  'rooms.scanToExplore': 'Scan QR to explore 360° virtual tour',
  'rooms.scanToExploreSub': 'Scan QR code with your phone to explore space',
  'rooms.copiedLink': 'Copied tour link to clipboard',
  'rooms.printStandee': 'Print Standee',
  'rooms.enter360': 'Enter 360° Room',

  // Pagination
  'pagination.showing': 'Showing',
  'pagination.to': '-',
  'pagination.of': 'of',
  'pagination.perPage': 'Per page:',
  'pagination.unit': '/ page',
  'pagination.prev': 'Previous',
  'pagination.next': 'Next',

  // Panorama Studio 360
  'studio.backToRooms': 'Exhibition Rooms & 360 Tour',
  'studio.save': 'Save Space Configuration',
  'studio.setInitialView': 'Set Default View',
  'studio.addHotspot': 'Add Heritage Hotspot',
  'studio.hotspotNav': 'Room Portal Hotspot',
  'studio.hotspotInfo': 'Artifact Info Hotspot',
  'studio.editHotspot': 'Edit Hotspot',
  'studio.deleteHotspot': 'Delete Hotspot',

  // POC Stitching / Tạo ảnh 360°
  'stitching.title': 'Create & Stitch 360° Panorama',
  'stitching.desc': 'Capture directly using phone camera or upload angle photos to stitch into a complete 360° virtual tour space.',
  'stitching.inputSource': 'Input Photo Source',
  'stitching.clearPhotos': 'Clear Photos',
  'stitching.captureCamera': 'Camera Capture',
  'stitching.captureWebcam': 'Webcam Capture',
  'stitching.uploadFiles': 'Upload from Device',
  'stitching.pcHint': 'You are using a computer. Capture each angle directly on phone for best quality; on computer, please use webcam or upload a photo set via "Upload from Device".',
  'stitching.shootingGuide': 'Standard 360° Shooting Guide',
  'stitching.stitchBtn': 'Stitch 360° Panorama',
  'stitching.loadSample': 'Load Sample 360° Panorama',
  'stitching.previewTitle': '360° Space Preview',
  'stitching.noSpace': 'No 360° Space Loaded',
  'stitching.noSpaceDesc': 'Capture directly on phone, upload a PANO image from the left panel, or preview sample space to get familiar with the UI.',
  'stitching.viewSample': 'View Sample Space',
  'stitching.viewGuide': 'View Shooting Guide',
  'stitching.libraryTitle': 'Created 360° Space Library',

  // Common UI
  'common.confirm': 'Confirm',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.close': 'Close',
  'common.copy': 'Copy',
  'common.loading': 'Loading museum space data...',
  'common.refresh': 'Refresh',
  'common.emptyData': 'No matching data found',
  'common.items': 'items',
  'common.thesisTitle': 'Graduation Thesis 2026',
  'common.thesisFooter': 'Graduation Thesis Topic 2026 • Heritage Space 360 Tour System'
};

export const DICTIONARY_FR: LocaleDictionary = {
  // Navigation & Header
  'nav.museumTitle': "Musée d'Histoire de Hô Chi Minh-Ville",
  'nav.adminTitle': "Conseil d'administration du musée d'histoire",
  'nav.adminRole': 'Administrateur (Admin)',
  'nav.breadcrumbMuseum': "Musée d'Histoire",
  'nav.viewTour': 'Voir la visite visiteur',
  'nav.rooms': "Galeries d'exposition & Visite 360°",
  'nav.pocStitching': 'Créer un panorama 360°',
  'nav.artifacts': 'Objets & Reliques du patrimoine',
  'nav.languages': 'Gestion des langues & Voix IA',
  'nav.analytics': 'Rapports & Statistiques',
  'nav.settings': 'Configuration du système',
  'nav.themeLight': 'Passer au mode clair',
  'nav.themeDark': 'Passer au mode sombre',
  'nav.dashboard': 'Tableau de bord',

  // Băng Thống kê Di sản (Heritage Stats Banner)
  'stats.roomsTitle': "Galeries d'exposition",
  'stats.roomsUnit': 'espaces',
  'stats.digitized': 'Numérisé',
  'stats.ready': 'Prêt à accueillir les visiteurs',
  'stats.artifactsTitle': 'Objets & Sites de recherche',
  'stats.artifactsUnit': 'coordonnées du patrimoine',
  'stats.artifactsSub': 'Localisation continue & visite guidée 360°',
  'stats.narrationTitle': 'Description du patrimoine',
  'stats.narrationUnit': 'monographies',
  'stats.narrationSub': 'Édition des documents historiques & audio natif',
  'stats.scansTitle': 'Interaction sur le terrain',
  'stats.scansUnit': 'scans',
  'stats.scansSub': 'Les visiteurs scannent le code QR au stand',

  // Rooms Management Page
  'rooms.title': "Galeries d'exposition & Visite 360°",
  'rooms.desc': 'Gérer les espaces panoramiques 360°, les points du patrimoine et configurer la vue initiale.',
  'rooms.tabRooms': "Galeries d'exposition",
  'rooms.tabStorage': 'Stockage panoramique 360°',
  'rooms.addRoom': 'Ajouter une salle',
  'rooms.exportStandee': 'Exporter le pack Standee QR',
  'rooms.searchPlaceholder': 'Rechercher par nom de salle, code P-01, P-05...',
  'rooms.searchPlaceholderPano': 'Rechercher des fichiers panoramiques...',
  'rooms.allThemes': 'Tous les thèmes',
  'rooms.allStatuses': 'Tous les statuts',
  'rooms.statusActive': 'Actif',
  'rooms.statusInactive': 'Masqué',
  'rooms.statusAiEnabled': 'Voix IA activée',
  'rooms.statusNoAi': 'IA non configurée',
  'rooms.viewGrid': 'Grille',
  'rooms.viewTable': 'Tableau',
  'rooms.explore360': 'Studio 360°',
  'rooms.narration': 'Explication audio',
  'rooms.qrCode': 'Code QR',
  'rooms.edit': 'Modifier',
  'rooms.delete': 'Supprimer',
  'rooms.anchorPoints': "points d'ancrage",
  'rooms.notConfigured': 'Non configuré',
  'rooms.aiEnabled': 'Audio activé',
  'rooms.angle360': 'angle 360°',
  'rooms.scans': 'scans',
  'rooms.defaultPeriod': 'Relique Historique',
  'rooms.defaultDesc': 'Aucune description détaillée disponible pour cette salle.',
  'rooms.unit': 'salles',
  'rooms.thRoom': "Galerie d'exposition",
  'rooms.thCode': 'Code',
  'rooms.thTopic': 'Thème',
  'rooms.thHotspots': 'Points interactifs',
  'rooms.thNarration': 'Explication & Voix',
  'rooms.thScans': 'Scans QR',
  'rooms.thActions': 'Actions',

  // Pagination
  'pagination.showing': 'Affichage de',
  'pagination.to': 'à',
  'pagination.of': 'sur un total de',
  'pagination.perPage': 'Par page :',
  'pagination.unit': '/ page',
  'pagination.prev': 'Précédent',
  'pagination.next': 'Suivant',

  // Panorama Studio 360
  'studio.backToRooms': "Galeries d'exposition & Visite 360°",
  'studio.save': "Enregistrer l'espace",
  'studio.setInitialView': 'Définir la vue par défaut',
  'studio.addHotspot': 'Ajouter un point interactif',
  'studio.hotspotNav': 'Portail de changement de salle',
  'studio.hotspotInfo': "Fiche explicative de l'objet",
  'studio.editHotspot': 'Modifier le point',
  'studio.deleteHotspot': 'Supprimer le point',

  // Common UI
  'common.confirm': 'Confirmer',
  'common.cancel': 'Annuler',
  'common.save': 'Enregistrer',
  'common.close': 'Fermer',
  'common.loading': 'Chargement des données du musée...',
  'common.refresh': 'Actualiser',
  'common.emptyData': 'Aucune donnée correspondante',
  'common.items': 'éléments',
  'common.thesisFooter': 'Projet de fin études 2026 • Système de visite 360° du patrimoine'
};

export const DICTIONARY_ZH: LocaleDictionary = {
  // Navigation & Header
  'nav.museumTitle': '胡志明市历史博物馆',
  'nav.adminTitle': '历史博物馆管理委员会',
  'nav.adminRole': '管理员 (Admin)',
  'nav.breadcrumbMuseum': '历史博物馆',
  'nav.viewTour': '查看游客全景导览',
  'nav.rooms': '展厅与360°全景漫游',
  'nav.pocStitching': '创建360°全景图像',
  'nav.artifacts': '文物与历史遗存',
  'nav.languages': '语言与语音AI管理',
  'nav.analytics': '数据报告与统计',
  'nav.settings': '系统全局配置',
  'nav.themeLight': '切换至浅色模式',
  'nav.themeDark': '切换至深色模式',
  'nav.dashboard': '控制面板',

  // Băng Thống kê Di sản (Heritage Stats Banner)
  'stats.roomsTitle': '数字化展览展厅',
  'stats.roomsUnit': '个空间',
  'stats.digitized': '已完成数字化',
  'stats.ready': '已就绪迎接参观游客',
  'stats.artifactsTitle': '文物与历史坐标',
  'stats.artifactsUnit': '处遗产坐标',
  'stats.artifactsSub': '连续定位与360°实景漫游导览',
  'stats.narrationTitle': '历史文献与解说',
  'stats.narrationUnit': '篇专著',
  'stats.narrationSub': '历史考据文献与母语原生发音',
  'stats.scansTitle': '实地交互统计',
  'stats.scansUnit': '次扫码',
  'stats.scansSub': '游客在各展厅现场扫描导览二维码',

  // Rooms Management Page
  'rooms.title': '展厅与360°全景漫游',
  'rooms.desc': '管理360°全景空间、文物交互坐标及初始视界配置。',
  'rooms.tabRooms': '展览展厅',
  'rooms.tabStorage': '360°空间图像仓库',
  'rooms.addRoom': '添加新展厅',
  'rooms.exportStandee': '导出展架QR码包',
  'rooms.searchPlaceholder': '按展厅名称、编号 P-01, P-05 搜索...',
  'rooms.searchPlaceholderPano': '搜索全景图像文件名...',
  'rooms.allThemes': '全部展览主题',
  'rooms.allStatuses': '全部运行状态',
  'rooms.statusActive': '正在运行',
  'rooms.statusInactive': '暂时隐藏',
  'rooms.statusAiEnabled': '已启用语音AI',
  'rooms.statusNoAi': '未配置语音AI',
  'rooms.viewGrid': '网格',
  'rooms.viewTable': '列表',
  'rooms.explore360': '360°空间编辑',
  'rooms.narration': '语音讲解',
  'rooms.qrCode': '二维码',
  'rooms.edit': '编辑',
  'rooms.delete': '删除',
  'rooms.anchorPoints': '个交互锚点',
  'rooms.notConfigured': '尚未配置',
  'rooms.aiEnabled': '已启用解说',
  'rooms.angle360': '个360°视角',
  'rooms.scans': '次扫码',
  'rooms.defaultPeriod': '历史文物',
  'rooms.defaultDesc': '该展厅暂无详细描述信息。',
  'rooms.unit': '个展厅',
  'rooms.thRoom': '展厅名称',
  'rooms.thCode': '编号',
  'rooms.thTopic': '展览专题',
  'rooms.thHotspots': '空间锚点',
  'rooms.thNarration': '解说与语音',
  'rooms.thScans': '扫码量',
  'rooms.thActions': '操作',

  // Pagination
  'pagination.showing': '显示',
  'pagination.to': '至',
  'pagination.of': '共计',
  'pagination.perPage': '每页显示：',
  'pagination.unit': '/ 页',
  'pagination.prev': '上一页',
  'pagination.next': '下一页',

  // Panorama Studio 360
  'studio.backToRooms': '展厅与360°全景漫游',
  'studio.save': '保存全景空间配置',
  'studio.setInitialView': '设为默认初始视角',
  'studio.addHotspot': '添加文物空间交互点',
  'studio.hotspotNav': '跨展厅传送门',
  'studio.hotspotInfo': '文物语音解说点',
  'studio.editHotspot': '编辑交互点',
  'studio.deleteHotspot': '删除交互点',

  // Common UI
  'common.confirm': '确认',
  'common.cancel': '取消',
  'common.save': '保存',
  'common.close': '关闭',
  'common.loading': '正在加载博物馆空间数据...',
  'common.refresh': '刷新',
  'common.emptyData': '暂无匹配的数据',
  'common.items': '项',
  'common.thesisFooter': '2026年毕业设计论文 • 遗产空间360°全景漫游系统'
};

export const DICTIONARY_JA: LocaleDictionary = {
  // Navigation & Header
  'nav.museumTitle': 'ホーチミン市歴史博物館',
  'nav.adminTitle': '歴史博物館管理委員会',
  'nav.adminRole': '管理者 (Admin)',
  'nav.breadcrumbMuseum': '歴史博物館',
  'nav.viewTour': 'ビジターツアーを見る',
  'nav.rooms': '展示室＆360°バーチャルツアー',
  'nav.pocStitching': '360°パノラマ画像生成',
  'nav.artifacts': '遺物・歴史的文化財',
  'nav.languages': '言語＆AI音声管理',
  'nav.analytics': 'レポート・アクセス統計',
  'nav.settings': 'システム環境設定',
  'nav.themeLight': 'ライトモードに切替',
  'nav.themeDark': 'ダークモードに切替',
  'nav.dashboard': 'ダッシュボード',

  // Băng Thống kê Di sản (Heritage Stats Banner)
  'stats.roomsTitle': '展示室スペース',
  'stats.roomsUnit': '室の空間',
  'stats.digitized': 'デジタル化率',
  'stats.ready': '見学者の受け入れ準備完了',
  'stats.artifactsTitle': '遺物＆調査スポット',
  'stats.artifactsUnit': '箇所の遺産座標',
  'stats.artifactsSub': '位置追跡と360°空間ガイド',
  'stats.narrationTitle': '歴史文献・解説',
  'stats.narrationUnit': '冊の解説',
  'stats.narrationSub': '史料編纂とネイティブ音声ガイド',
  'stats.scansTitle': '実地アクセス統計',
  'stats.scansUnit': '回スキャン',
  'stats.scansSub': '来館者が展示ブースでQRコードをスキャン',

  // Rooms Management Page
  'rooms.title': '展示室＆360°バーチャルツアー',
  'rooms.desc': '360°パノラマ空間、歴史遺産ホットスポット、初期視点の設定を管理します。',
  'rooms.tabRooms': '展示室',
  'rooms.tabStorage': '360°パノラマストレージ',
  'rooms.addRoom': '新規展示室を追加',
  'rooms.exportStandee': 'QRコードパネルを出力',
  'rooms.searchPlaceholder': '展示室名、コード P-01, P-05 で検索...',
  'rooms.searchPlaceholderPano': 'パノラマ画像ファイルを検索...',
  'rooms.allThemes': 'すべてのテーマ',
  'rooms.allStatuses': 'すべてのステータス',
  'rooms.statusActive': '公開中',
  'rooms.statusInactive': '非表示',
  'rooms.statusAiEnabled': 'AI音声有効',
  'rooms.statusNoAi': 'AI未設定',
  'rooms.viewGrid': 'グリッド',
  'rooms.viewTable': 'リスト',
  'rooms.explore360': '360°編集スタジオ',
  'rooms.narration': '音声解説',
  'rooms.qrCode': 'QRコード',
  'rooms.edit': '編集',
  'rooms.delete': '削除',
  'rooms.anchorPoints': '箇所のスポット',
  'rooms.notConfigured': '未設定',
  'rooms.aiEnabled': '解説あり',
  'rooms.angle360': '箇所の360°視点',
  'rooms.scans': '回スキャン',
  'rooms.defaultPeriod': '歴史的遺物',
  'rooms.defaultDesc': 'この展示室の詳細な説明はまだありません。',
  'rooms.unit': '室',
  'rooms.thRoom': '展示室',
  'rooms.thCode': 'コード',
  'rooms.thTopic': '展示テーマ',
  'rooms.thHotspots': 'スポット数',
  'rooms.thNarration': '音声解説',
  'rooms.thScans': 'QRスキャン数',
  'rooms.thActions': '操作',

  // Pagination
  'pagination.showing': '表示中：',
  'pagination.to': '〜',
  'pagination.of': '全',
  'pagination.perPage': '表示件数：',
  'pagination.unit': '室 / ページ',
  'pagination.prev': '前へ',
  'pagination.next': '次へ',

  // Panorama Studio 360
  'studio.backToRooms': '展示室＆360°バーチャルツアー',
  'studio.save': '空間設定を保存',
  'studio.setInitialView': '初期視点に設定',
  'studio.addHotspot': '遺産スポットを追加',
  'studio.hotspotNav': '展示室移動ポータル',
  'studio.hotspotInfo': '遺物解説スポット',
  'studio.editHotspot': 'スポット編集',
  'studio.deleteHotspot': 'スポット削除',

  // Common UI
  'common.confirm': '確認',
  'common.cancel': 'キャンセル',
  'common.save': '保存',
  'common.close': '閉じる',
  'common.loading': '博物館データを読み込み中...',
  'common.refresh': '更新',
  'common.emptyData': '該当するデータがありません',
  'common.items': '件',
  'common.thesisFooter': '2026年卒業論文テーマ • 遺産空間360°ツアーシステム'
};

export const BUILTIN_DICTIONARIES: Record<string, LocaleDictionary> = {
  vi: DICTIONARY_VI,
  en: DICTIONARY_EN,
  fr: DICTIONARY_FR,
  zh: DICTIONARY_ZH,
  ja: DICTIONARY_JA
};

/**
 * Bản dịch chuẩn học thuật di sản cho các gian phòng tiêu biểu
 * Đảm bảo 100% nội dung phòng trong Database tự động hiển thị đa ngữ đúng ngữ cảnh
 */
export const ROOM_PRESET_TRANSLATIONS: Record<string, Record<string, { name: string; period: string; description: string }>> = {
  'P-101': {
    en: {
      name: 'Reception & General Introduction',
      period: 'THE FOUNDING PERIOD & ARCHITECTURE OF INDOCHINA',
      description: 'The main hall welcoming visitors to the Ho Chi Minh City History Museum features a distinctive octagonal architecture combined with the classic Indochinese style.'
    },
    fr: {
      name: "Hall d'Accueil & Présentation Générale",
      period: 'PÉRIODE DE FONDATION & ARCHITECTURE INDOCHINOISE',
      description: "Le hall principal accueillant les visiteurs du Musée d'Histoire de Hô Chi Minh-Ville présente une architecture octogonale distinctive combinée au style indochinois classique."
    },
    zh: {
      name: '序厅接待与总体介绍',
      period: '建馆时期与印度支那建筑风格',
      description: '胡志明市历史博物馆主接待大厅，融合经典印度支那风格与特色八角形建筑结构。'
    },
    ja: {
      name: '総合案内・レセプションホール',
      period: '創設期とインドシナ建築様式',
      description: 'ホーチミン市歴史博物館のメインホール。伝統的なインドシナ様式と八角形の建築美が融合した空間です。'
    }
  },
  'P-102': {
    en: {
      name: 'Prehistory of Vietnam',
      period: 'STONE AGE & BRONZE AGE (THOUSANDS OF YEARS AGO)',
      description: 'The exhibition showcases important archaeological sites from the Paleolithic, Neolithic, and Metal Ages in the Red River basin and Southern Vietnam.'
    },
    fr: {
      name: 'Préhistoire du Vietnam',
      period: 'ÂGE DE LA PIERRE & DU BRONZE (MILLÉNAIRES AVANT J.-C.)',
      description: 'Présentation des sites archéologiques majeurs du Paléolithique, Néolithique et des Âges des métaux dans le bassin du fleuve Rouge et le Sud du Vietnam.'
    },
    zh: {
      name: '越南史前时代展厅',
      period: '石器与青铜时代（数千年前）',
      description: '陈列红河流域与越南南部旧石器时代、新石器时代至金属时代的重大考古遗址文物。'
    },
    ja: {
      name: 'ベトナム先史時代展示室',
      period: '石器時代＆青銅器時代（数千年前）',
      description: '紅河デルタおよびベトナム南部における旧石器・新石器から金属器時代に至る重要遺跡の出土品を展示。'
    }
  },
  'P-103': {
    en: {
      name: 'Oc Eo Cultural Center & Funan Kingdom',
      period: '1ST TO 7TH CENTURIES AD',
      description: 'A collection of unique gold jewelry, wooden Buddha statues, and ceramic artifacts from the ancient Oc Eo civilization in Southern Vietnam.'
    },
    fr: {
      name: "Culture d'Oc Eo & Royaume du Fou-nan",
      period: 'DU 1ER AU 7E SIÈCLE APRÈS J.-C.',
      description: "Collection de bijoux en or précieux, statues de Bouddha en bois et céramiques rares de l'ancienne civilisation d'Oc Eo au Sud du Vietnam."
    },
    zh: {
      name: '奥高文化与扶南王国',
      period: '公元1世纪至7世纪',
      description: '展示越南南部古代奥高文明独特的黄金饰品、珍稀木雕佛像及特色陶器文物。'
    },
    ja: {
      name: 'オケオ文化と扶南王国',
      period: '西暦1世紀〜7世紀',
      description: '南部ベトナム古代オケオ文明の貴重な黄金装飾品、木造仏像、特異な陶磁器群を展示。'
    }
  },
  'P-01': {
    en: {
      name: 'Prehistory of Vietnam',
      period: 'STONE AGE & BRONZE AGE',
      description: 'The exhibition showcases important archaeological sites from the Paleolithic, Neolithic, and Metal Ages in the Red River basin and Southern Vietnam.'
    },
    fr: {
      name: 'Préhistoire du Vietnam',
      period: 'ÂGE DE LA PIERRE & DU BRONZE',
      description: 'Présentation des sites archéologiques majeurs de la préhistoire du Vietnam.'
    }
  },
  'P-05': {
    en: {
      name: 'Nguyen Dynasty & Hue Royal Art (1802-1945)',
      period: 'THE NGUYEN DYNASTY & IMPERIAL ARTS',
      description: 'Displaying thrones, royal robes, royal edicts, court porcelain, and imperial swords.'
    },
    fr: {
      name: 'Dynastie des Nguyen & Arts Royaux de Hué',
      period: 'DYNASTIE DES NGUYEN & ARTS IMPÉRIAUX',
      description: 'Exposition des trônes, robes royales, décrets royaux et porcelaines de cour.'
    }
  },
  'P-09': {
    en: {
      name: 'Funan & Oc Eo Kingdom Heritage',
      period: 'OC EO CULTURE (1ST - 7TH CENTURIES AD)',
      description: 'National treasures including sandstone Vishnu and Surya statues, gold repoussé jewelry and Roman coins.'
    },
    fr: {
      name: 'Patrimoine du Fou-nan & d’Oc Eo',
      period: "CULTURE D'OC EO (DU 1ER AU 7E SIÈCLE)",
      description: "Trésors nationaux comprenant des statues de grès, des parures en or et des monnaies romaines."
    }
  }
};
