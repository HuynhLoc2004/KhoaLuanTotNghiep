/**
 * Universal Bilingual Phrase Map (Bản đồ Cụm từ Song ngữ Đa năng)
 * Dành riêng cho Đồ án Tốt nghiệp 2026 - Không gian Di sản Bảo tàng Lịch sử TP.HCM.
 * Cung cấp từ điển dịch thuật học thuật toàn diện cho toàn bộ giao diện:
 * - Header, Sidebar, Breadcrumb, Footer
 * - Quản trị Gian phòng, Modal Standee QR, Thẻ thống kê
 * - Xưởng Ghép Ảnh Toàn Cảnh 360° (PocStitching Studio)
 * - Quản trị Hiện vật, Cấu hình, Phân trang, Bộ lọc
 */

export interface UniversalPhraseItem {
  en: string;
  fr?: string;
  zh?: string;
  ja?: string;
}

export const UNIVERSAL_PHRASE_MAP: Record<string, UniversalPhraseItem> = {
  // Thương hiệu & Điều hướng (Brand & Navigation)
  'Bảo tàng Lịch sử TP. Hồ Chí Minh': {
    en: 'Museum of History in Ho Chi Minh City',
    fr: "Musée d'Histoire de Hô Chi Minh-Ville",
    zh: '胡志明市历史博物馆',
    ja: 'ホーチミン市歴史博物館'
  },
  'Bảo tàng Lịch sử': {
    en: 'History Museum',
    fr: "Musée d'Histoire",
    zh: '历史博物馆',
    ja: '歴史博物館'
  },
  'BẢO TÀNG LỊCH SỬ THÀNH PHỐ HỒ CHÍ MINH': {
    en: 'MUSEUM OF HISTORY IN HO CHI MINH CITY',
    fr: "MUSÉE D'HISTOIRE DE HÔ CHI MINH-VILLE",
    zh: '胡志明市历史博物馆',
    ja: 'ホーチミン市歴史博物館'
  },
  'TP. Hồ Chí Minh • Quản trị': {
    en: 'Ho Chi Minh City • Administration',
    fr: 'Hô Chi Minh-Ville • Administration',
    zh: '胡志明市 • 管理系统',
    ja: 'ホーチミン市 • 管理者'
  },
  'Đề tài Tốt nghiệp 2026': {
    en: 'Graduation Thesis 2026',
    fr: 'Projet de Fin d\'Études 2026',
    zh: '2026年毕业设计',
    ja: '2026年卒業論文'
  },
  'Hệ thống Tour 360 Không gian Di sản': {
    en: 'Heritage Space 360 Tour System',
    fr: 'Système de visite 360° du patrimoine',
    zh: '遗产空间360°漫游系统',
    ja: '遺産空間360°ツアーシステム'
  },
  'Bảng Điều Khiển': { en: 'Dashboard', fr: 'Tableau de bord', zh: '仪表盘', ja: 'ダッシュボード' },
  'Gian trưng bày & Tour 360': { en: 'Exhibition Rooms & 360 Tour', fr: 'Galeries & Visite 360°', zh: '展厅与360°漫游', ja: '展示室＆360°ツアー' },
  'Tạo ảnh toàn cảnh 360°': { en: 'Create 360° Panorama', fr: 'Créer Panorama 360°', zh: '创建360°全景', ja: '360°パノラマ画像生成' },
  'Hiện vật & Cổ vật di sản': { en: 'Artifacts & Heritage Relics', fr: 'Objets & Reliques du patrimoine', zh: '文物与历史遗存', ja: '遺物・歴史的文化財' },
  'Quản trị Ngôn ngữ & Voice AI': { en: 'Language & Voice AI Management', fr: 'Gestion Langues & Voix IA', zh: '语言与语音AI管理', ja: '言語＆AI音声管理' },
  'Báo cáo & Thống kê': { en: 'Reports & Statistics', fr: 'Rapports & Statistiques', zh: '数据报告与统计', ja: 'レポート・アクセス統計' },
  'Cấu hình hệ thống': { en: 'System Configuration', fr: 'Configuration du système', zh: '系统全局配置', ja: 'システム環境設定' },

  // Băng Thống kê Di sản (Stats Banner)
  'Gian phòng Trưng bày': { en: 'Exhibition Room', fr: "Galerie d'exposition", zh: '展厅空间', ja: '展示室スペース' },
  'Hiện vật & Điểm nghiên cứu': { en: 'Artifacts & Research Sites', fr: 'Objets & Sites de recherche', zh: '文物与研究点', ja: '遺物＆調査スポット' },
  'Tư liệu Di sản': { en: 'Heritage Description', fr: 'Description du patrimoine', zh: '历史文献・解说', ja: '歴史文献・解説' },
  'Tương tác thực địa': { en: 'Field Interaction', fr: 'Interaction sur le terrain', zh: '实地交互', ja: '実地アクセス統計' },
  'Đã số hóa 100%': { en: 'Digitized 100%', fr: 'Numérisé 100%', zh: '数字化率 100%', ja: 'デジタル化率 100%' },
  'Sẵn sàng đón khách tham quan': { en: 'Ready to welcome guests', fr: 'Prêt à accueillir les visiteurs', zh: '准备好迎接游客', ja: '見学者の受け入れ準備完了' },
  'Tọa độ liên tục & dẫn đường tour 360°': { en: 'Location tracking and 360-degree tour guidance', fr: 'Localisation continue et visite guidée 360°', zh: '持续定位与360°空间导航', ja: '位置追跡と360°空間ガイド' },
  'Khảo cứu lịch sử & Giọng đọc bản địa': { en: 'Historical research and native voice narration', fr: 'Recherche historique et narration vocale native', zh: '历史考据与母语原声解说', ja: '史料編纂とネイティブ音声ガイド' },
  'Khách tham quan quét mã QR tại các gian phòng': { en: 'Visitors scan QR codes at exhibition booths', fr: 'Les visiteurs scannent les codes QR dans les salles', zh: '游客在各个展厅展台扫码', ja: '来館者が展示ブースでQRコードをスキャン' },
  'không gian': { en: 'spaces', fr: 'espaces', zh: '个空间', ja: '室の空間' },
  'tọa độ di sản': { en: 'heritage coordinates', fr: 'coordonnées du patrimoine', zh: '处遗产坐标', ja: '箇所の遺産座標' },
  'chuyên khảo': { en: 'monograph', fr: 'monographie', zh: '篇文献', ja: '冊の解説' },
  'lượt quét': { en: 'scans', fr: 'scans', zh: '次扫码', ja: '回スキャン' },
  'điểm neo': { en: 'anchor points', fr: "points d'ancrage", zh: '个锚点', ja: '箇所のスポット' },
  'góc 360°': { en: '360° views', fr: 'angles 360°', zh: '个360°视角', ja: '箇所の360°視点' },
  'gian phòng': { en: 'rooms', fr: 'salles', zh: '个展厅', ja: '室' },
  'mục': { en: 'items', fr: 'éléments', zh: '项', ja: '件' },

  // Nút bấm & Thao tác Quản trị Gian phòng
  'Gian Phòng Triển Lãm': { en: 'Exhibition Rooms', fr: "Galeries d'exposition", zh: '展厅列表', ja: '展示室一覧' },
  'Kho Không Gian 360° Đã Ghép': { en: '360° Space Storage', fr: 'Stockage 360°', zh: '360°空间库', ja: '360°空間ストレージ' },
  'Xuất gói QR Standee': { en: 'Export QR Standee packages', fr: 'Exporter QR Standee', zh: '导出QR展架包', ja: 'QRコードパネルを出力' },
  'Thêm gian phòng mới': { en: 'Add a new room', fr: 'Ajouter une salle', zh: '添加新展厅', ja: '新規展示室を追加' },
  'Quản lý chuyên đề': { en: 'Manage themes', fr: 'Gérer les thèmes', zh: '管理专题', ja: 'テーマ管理' },
  'Làm mới': { en: 'Refresh', fr: 'Actualiser', zh: '刷新', ja: '更新' },
  'Đang đồng bộ...': { en: 'Syncing...', fr: 'Synchronisation...', zh: '同步中...', ja: '同期中...' },
  'Lưới': { en: 'Grid', fr: 'Grille', zh: '网格', ja: 'グリッド' },
  'Bảng': { en: 'Table', fr: 'Tableau', zh: '列表', ja: 'リスト' },
  'Biên tập 360': { en: '360 Studio', fr: 'Studio 360', zh: '360空间编辑', ja: '360°編集スタジオ' },
  'Biên tập': { en: 'Studio', fr: 'Studio', zh: '编辑', ja: '編集' },
  'Thuyết minh': { en: 'Narration', fr: 'Narration', zh: '解说', ja: '解説' },
  'Mã QR': { en: 'QR Code', fr: 'Code QR', zh: '二维码', ja: 'QRコード' },
  'Sửa': { en: 'Edit', fr: 'Modifier', zh: '编辑', ja: '編集' },
  'Xóa': { en: 'Delete', fr: 'Supprimer', zh: '删除', ja: '削除' },
  'Đã có thuyết minh': { en: 'Audio enabled', fr: 'Audio activé', zh: '已启用解说', ja: '解説あり' },
  'Đã bật thuyết minh': { en: 'Audio enabled', fr: 'Audio activé', zh: '已启用解说', ja: '解説あり' },
  'Chưa cấu hình': { en: 'Not yet configured', fr: 'Non configuré', zh: '尚未配置', ja: '未設定' },
  'Tất cả chuyên đề trưng bày': { en: 'All exhibition themes', fr: 'Tous les thèmes', zh: '所有展览专题', ja: 'すべてのテーマ' },
  'Tất cả trạng thái': { en: 'All states', fr: 'Tous les statuts', zh: '所有状态', ja: 'すべてのステータス' },
  'Đang hoạt động': { en: 'Active', fr: 'Actif', zh: '公开中', ja: '公開中' },
  'Tạm ẩn': { en: 'Hidden', fr: 'Masqué', zh: '已隐藏', ja: '非表示' },
  'Đã bật AI Voice': { en: 'AI Voice Enabled', fr: 'Voix IA activée', zh: '已启用AI语音', ja: 'AI音声有効' },
  'Chưa cấu hình AI': { en: 'AI Not Configured', fr: 'IA non configurée', zh: '未配置AI', ja: 'AI未設定' },

  // Modal QR Standee
  'Mã QR Tham Quan': { en: 'Tour QR Code', fr: 'Code QR de visite', zh: '全景导览二维码', ja: '見学用QRコード' },
  'Quét mã để tham quan không gian 360°': {
    en: 'Scan QR to explore 360° virtual tour',
    fr: 'Scannez le code pour la visite 360°',
    zh: '扫码进入360°虚拟展厅漫游',
    ja: 'QRコードをスキャンして360°見学'
  },
  'Scan to explore 360° virtual tour': {
    en: 'Scan to explore 360° virtual tour',
    fr: 'Scannez pour explorer la visite virtuelle 360°',
    zh: '手机扫码即可开启360°全景漫游',
    ja: 'スマホで読み取ってバーチャルツアーを開始'
  },
  'Sao chép': { en: 'Copy', fr: 'Copier', zh: '复制', ja: 'コピー' },
  'Sao chép link': { en: 'Copy link', fr: 'Copier le lien', zh: '复制链接', ja: 'リンクをコピー' },
  'Đã chép': { en: 'Copied', fr: 'Copié', zh: '已复制', ja: 'コピー完了' },
  'In Standee': { en: 'Print Standee', fr: 'Imprimer Standee', zh: '打印展架', ja: 'パネルを印刷' },
  'Vào phòng 360°': { en: 'Enter 360° Room', fr: 'Entrer dans la salle 360°', zh: '进入360°展厅', ja: '360°展示室へ入る' },
  'Đóng': { en: 'Close', fr: 'Fermer', zh: '关闭', ja: '閉じる' },
  'Đã sao chép liên kết tham quan': { en: 'Copied tour link to clipboard', fr: 'Lien de visite copié', zh: '已复制漫游链接', ja: '見学リンクをコピーしました' },

  // Xưởng Ghép Ảnh Toàn Cảnh (PocStitching Studio)
  'Tạo & Ghép Ảnh Toàn Cảnh 360°': {
    en: 'Create & Stitch 360° Panorama',
    fr: 'Créer & Assembler Panorama 360°',
    zh: '创建与拼接360°全景图像',
    ja: '360°パノラマ画像生成'
  },
  'Chụp trực tiếp bằng camera điện thoại hoặc tải lên chùm ảnh góc để ghép thành không gian tham quan 360° hoàn chỉnh.': {
    en: 'Capture directly using phone camera or upload angle photos to stitch into a complete 360° virtual tour space.',
    fr: 'Capturez directement avec la caméra du téléphone ou téléversez des photos pour créer une visite 360°.',
    zh: '使用手机直接拍摄或上传多视角图片，合成完整的360°虚拟漫游空间。',
    ja: 'スマートフォンのカメラで撮影するか、画像をアップロードして360°バーチャル空間を生成します。'
  },
  'Nguồn ảnh đầu vào': { en: 'Input Photo Source', fr: "Source d'images", zh: '输入图片来源', ja: '入力画像ソース' },
  'Xóa ảnh': { en: 'Clear photos', fr: 'Effacer photos', zh: '清空图片', ja: '画像を削除' },
  'Chụp camera': { en: 'Camera Capture', fr: 'Prendre photo', zh: '拍摄相机', ja: 'カメラ撮影' },
  'Chụp bằng webcam': { en: 'Webcam Capture', fr: 'Prendre par webcam', zh: '摄像头拍摄', ja: 'Webカメラで撮影' },
  'Chọn từ máy': { en: 'Upload from Device', fr: "Téléverser de l'appareil", zh: '本地上传', ja: '端末から選択' },
  'Bạn đang dùng máy tính. Chụp trực tiếp từng góc cho chất lượng tốt nhất trên điện thoại; trên máy tính hãy chụp bằng webcam hoặc tải sẵn bộ ảnh lên qua nút "Chọn từ máy".': {
    en: 'You are using a computer. Capture each angle directly on phone for best quality; on computer, please use webcam or upload a photo set via "Upload from Device".',
    fr: 'Vous utilisez un ordinateur. Capturez directement sur téléphone pour une qualité optimale ; sur ordinateur, utilisez la webcam ou téléversez un ensemble de photos.',
    zh: '您正在使用电脑。为了获得最佳质量建议使用手机拍摄各个角度；在电脑上请使用摄像头拍摄或点击“本地上传”上传图片。',
    ja: 'PCをご利用中です。最適な画質を得るにはスマホでの撮影を推奨します。PCではWebカメラを使用するか「端末から選択」でアップロードしてください。'
  },
  'Hướng dẫn cách chụp ảnh 360° chuẩn': {
    en: 'Standard 360° Shooting Guide',
    fr: 'Guide de prise de vue 360°',
    zh: '360°拍摄规范指南',
    ja: '360°パノラマ撮影ガイド'
  },
  'Tạo không gian toàn cảnh 360 độ': {
    en: 'Stitch 360° Panorama',
    fr: 'Créer le panorama 360°',
    zh: '生成360°全景空间',
    ja: '360°全景空間を生成'
  },
  'Nạp ảnh mẫu 360° chuẩn': {
    en: 'Load Sample 360° Panorama',
    fr: 'Charger panorama 360° exemple',
    zh: '载入标准示例360°图片',
    ja: '標準サンプル360°画像を読込'
  },
  'Trình xem trước không gian 360°': {
    en: '360° Space Preview',
    fr: 'Aperçu espace 360°',
    zh: '360°全景预览器',
    ja: '360°空間プレビュー'
  },
  'Chưa có không gian 360° được tải': {
    en: 'No 360° space loaded yet',
    fr: 'Aucun espace 360° chargé',
    zh: '尚未载入360°空间',
    ja: '360°空間がまだ読み込まれていません'
  },
  'Chụp trực tiếp bằng điện thoại, tải ảnh PANO lên từ bảng điều khiển bên trái, hoặc bấm xem thử không gian mẫu để làm quen giao diện.': {
    en: 'Capture directly with your phone, upload a PANO image from the left panel, or test with sample space to get familiar with the UI.',
    fr: "Capturez avec votre téléphone, téléversez une image PANO ou testez l'espace d'exemple pour vous familiariser avec l'interface.",
    zh: '使用手机直接拍摄、从左侧面板上传全景图，或点击查看示例空间以熟悉界面。',
    ja: 'スマートフォンで直接撮影、左側のパネルからパノラマ画像をアップロード、またはサンプル空間を表示してUIを確認してください。'
  },
  'Xem thử không gian mẫu': { en: 'Preview sample space', fr: "Voir l'espace exemple", zh: '查看示例空间', ja: 'サンプル空間を表示' },
  'Xem hướng dẫn chụp': { en: 'View shooting guide', fr: 'Voir le guide', zh: '查看拍摄指南', ja: '撮影ガイドを見る' },
  'Thư viện không gian 360° đã tạo': { en: 'Created 360° Space Library', fr: 'Bibliothèque des espaces 360° créés', zh: '已创建的360°空间库', ja: '生成済み360°空間ライブラリ' },
  'Mở ảnh gốc': { en: 'Open original image', fr: "Ouvrir l'image originale", zh: '打开原始全景图', ja: '元画像を開く' },

  // Thông tin phòng tiêu biểu & niên đại (Exhibition Room academic data)
  'Gian Khảo cổ & Lịch sử Khởi thủy': {
    en: 'Archaeology & Early Inception Hall',
    fr: 'Salle Archéologie & Histoire Initiale',
    zh: '考古与早期历史展厅',
    ja: '考古学・初期歴史展示室'
  },
  'Thời tiền sử và sơ sử Việt Nam': {
    en: 'Prehistoric & Proto-historic Vietnam',
    fr: 'Préhistoire et protohistoire du Vietnam',
    zh: '越南史前与原史时期',
    ja: 'ベトナム先史・原史時代'
  },
  'Gian Văn hóa Óc Eo & Vương quốc Phù Nam': {
    en: 'Oc Eo Culture & Funan Kingdom Hall',
    fr: 'Culture Oc Eo & Royaume du Funan',
    zh: '奥苗文化与扶南王国展厅',
    ja: 'オケオ文化・扶南王国展示室'
  },
  'Gian Đón tiếp & Giới thiệu chung': {
    en: 'Reception & General Introduction',
    fr: 'Accueil & Présentation Générale',
    zh: '迎宾与总体介绍厅',
    ja: '総合案内・エントランスホール'
  },
  'Gian Thời Tiền Sử Việt Nam': {
    en: 'Prehistory of Vietnam',
    fr: 'Préhistoire du Vietnam',
    zh: '越南史前时期展厅',
    ja: 'ベトナム先史時代展示室'
  },
  'Gian Văn hóa Óc Eo': {
    en: 'Oc Eo Cultural Center',
    fr: 'Culture Oc Eo',
    zh: '奥苗文化展厅',
    ja: 'オケオ文化展示室'
  },
  'Thời kỳ Thành lập & Kiến trúc Đông Dương': {
    en: 'The Founding Period & Architecture of Indochina',
    fr: "Période de fondation & Architecture de l'Indochine",
    zh: '建立时期与印度支那建筑',
    ja: '創設期とインドシナ建築'
  },
  'Thời kỳ Đồ Đá & Đồ Đồng (Cách nay hàng ngàn năm)': {
    en: 'Stone Age & Bronze Age (Thousands of years ago)',
    fr: "Âge de pierre & Âge de bronze (Il y a des millénaires)",
    zh: '石器与青铜时代（数千年前）',
    ja: '石器・青銅器時代（数千年前）'
  },
  'Thế kỷ 1 đến thế kỷ 7 sau Công Nguyên': {
    en: '1st to 7th Centuries AD',
    fr: 'Du Ier au VIIe siècle après J.-C.',
    zh: '公元1世纪至7世纪',
    ja: '西暦1世紀〜7世紀'
  },
  'Hiện vật Lịch sử': {
    en: 'Historical Relic',
    fr: 'Relique Historique',
    zh: '历史文物',
    ja: '歴史的遺物'
  },

  // Thanh phân trang (Pagination)
  'Hiển thị': { en: 'Showing', fr: 'Affichage de', zh: '显示', ja: '表示中' },
  'trên tổng số': { en: 'of', fr: 'sur un total de', zh: '共计', ja: '全' },
  'Mỗi trang:': { en: 'Per page:', fr: 'Par page :', zh: '每页显示：', ja: '表示件数：' },
  '/ trang': { en: '/ page', fr: '/ page', zh: '/ 页', ja: '/ ページ' },
  'Trước': { en: 'Previous', fr: 'Précédent', zh: '上一页', ja: '前へ' },
  'Sau': { en: 'Next', fr: 'Suivant', zh: '下一页', ja: '次へ' },

  // Quản trị Danh mục Ngôn ngữ (AdminLanguagePage)
  'Quản trị Danh mục Ngôn ngữ & Voice AI': {
    en: 'Language & Voice AI Management',
    fr: 'Gestion des Langues & Voix IA',
    zh: '语言与语音AI管理',
    ja: '言語＆AI音声管理'
  },
  'Hệ thống Đa ngôn ngữ Động: Khách tham quan Client chỉ có quyền chọn các ngôn ngữ được Admin kích hoạt tại đây.': {
    en: 'Dynamic Multilingual System: Visitors can only select languages activated by the Administrator here.',
    fr: 'Système Multilingue Dynamique : Les visiteurs peuvent uniquement choisir les langues activées par l’Administrateur.',
    zh: '动态多语言系统：参观游客端仅可选择管理员在此处启用的语言。',
    ja: '動的多言語システム：見学者は管理者がここで有効化した言語のみを選択できます。'
  },
  'Thêm ngôn ngữ mới': {
    en: 'Add new language',
    fr: 'Ajouter une langue',
    zh: '添加新语言',
    ja: '新規言語を追加'
  },
  'Ngôn ngữ Phục vụ Khách Quốc tế': {
    en: 'Languages Serving International Visitors',
    fr: 'Langues pour visiteurs internationaux',
    zh: '服务国际游客语言',
    ja: '外国人観光客対応言語'
  },
  'quốc gia & vùng lãnh thổ': {
    en: 'countries & territories',
    fr: 'pays & territoires',
    zh: '个国家与地区',
    ja: '国・地域の言語'
  },
  'Đang Mở Cổng Tham quan': {
    en: 'Active in Tour Portal',
    fr: 'Ouvert aux visiteurs',
    zh: '开放参观入口',
    ja: '見学ポータル公開中'
  },
  'Khách tham quan tự do chuyển đổi trên tour 360': {
    en: 'Visitors freely switch languages in 360 tour',
    fr: 'Les visiteurs basculent librement sur la visite 360°',
    zh: '游客可在360°全景漫游中自由切换',
    ja: '見学者は360°ツアー内で自由に切替可能'
  },
  'Chuẩn Thuyết minh Di sản': {
    en: 'Heritage Narration Standard',
    fr: 'Standard de Narration du Patrimoine',
    zh: '遗产解说标准',
    ja: '遺産ナレーション標準'
  },
  'Ngữ điệu Bản xứ Chuẩn Sử học': {
    en: 'Historical Standard Native Accent',
    fr: 'Accent Natif Standard Historique',
    zh: '纯正母语史学规范语调',
    ja: '歴史学基準のネイティブ音声'
  },
  'Được thẩm định chuyên sâu cho History Museum': {
    en: 'Accredited for History Museum',
    fr: 'Homologué pour le Musée d’Histoire',
    zh: '专为历史博物馆深度审定',
    ja: '歴史博物館向け専門的歴史監修'
  },
  'Được thẩm định chuyên sâu cho': {
    en: 'Accredited for',
    fr: 'Homologué pour',
    zh: '专为深度审定',
    ja: '専門的歴史監修'
  },
  'Đang phát mẫu giọng đọc AI:': {
    en: 'Playing AI Voice sample:',
    fr: 'Lecture de l’échantillon vocal IA :',
    zh: '正在播放AI语音示例：',
    ja: 'AI音声サンプルを再生中：'
  },
  'Kiểm tra ngữ điệu, nhịp độ và sự lưu loát của bản ghi âm': {
    en: 'Test intonation, rhythm, and fluency of the narration audio',
    fr: 'Vérifiez l’intonation, le rythme et la fluidité de l’audio',
    zh: '检查解说音频的语调、节奏与流利度',
    ja: '録音音声のイントネーション、リズム、明瞭さを確認'
  },
  'Trình duyệt không hỗ trợ audio.': {
    en: 'Your browser does not support the audio element.',
    fr: 'Votre navigateur ne prend pas en charge l’élément audio.',
    zh: '您的浏览器不支持音频播放。',
    ja: 'お使いのブラウザは音声タグをサポートしていません。'
  },
  'Tìm theo tên tiếng Việt, bản xứ hoặc mã ISO (vi, en, fr...)': {
    en: 'Search by Vietnamese, native name or ISO code (vi, en, fr...)',
    fr: 'Rechercher par nom, langue native ou code ISO (vi, en, fr...)',
    zh: '按越南语、本国语或ISO代码搜索 (vi, en, fr...)',
    ja: '言語名、母国語、またはISOコードで検索 (vi, en, fr...)'
  },
  'Đang hiển thị trên Client': {
    en: 'Visible on Client',
    fr: 'Visible pour les visiteurs',
    zh: '客户端显示中',
    ja: 'クライアント表示中'
  },
  'Đang tạm tắt': {
    en: 'Temporarily hidden',
    fr: 'Désactivé temporairement',
    zh: '已暂停显示',
    ja: '一時停止中'
  },
  'Đang hiển thị': {
    en: 'Active',
    fr: 'Activé',
    zh: '显示中',
    ja: '表示中'
  },
  'Tìm thấy': {
    en: 'Found',
    fr: 'Trouvé',
    zh: '已找到',
    ja: '検索結果'
  },
  'ngôn ngữ': {
    en: 'languages',
    fr: 'langues',
    zh: '种语言',
    ja: '言語'
  },
  'Không tìm thấy ngôn ngữ phù hợp': {
    en: 'No matching languages found',
    fr: 'Aucune langue correspondante',
    zh: '未找到匹配的语言',
    ja: '該当する言語が見つかりません'
  },
  'Không có ngôn ngữ nào khớp với từ khóa tìm kiếm & bộ lọc hiện tại. Vui lòng thử lại.': {
    en: 'No languages match current search criteria. Please try again.',
    fr: 'Aucune langue ne correspond à vos critères de recherche. Veuillez réessayer.',
    zh: '没有语言符合当前搜索关键词和筛选条件。请重试。',
    ja: '検索キーワードやフィルタ条件に一致する言語がありません。再試行してください。'
  },
  'Đặt lại bộ lọc': {
    en: 'Reset filters',
    fr: 'Réinitialiser les filtres',
    zh: '重置筛选',
    ja: 'フィルタをリセット'
  },
  'CỜ & ISO': { en: 'FLAG & ISO', fr: 'DRAPEAU & ISO', zh: '国旗与ISO', ja: '国旗＆ISO' },
  'Cờ & ISO': { en: 'Flag & ISO', fr: 'Drapeau & ISO', zh: '国旗与ISO', ja: '国旗＆ISO' },
  'NGÔN NGỮ BẢN XỨ': { en: 'NATIVE LANGUAGE', fr: 'LANGUE NATIVE', zh: '本国原生语言', ja: '母国語表記' },
  'Ngôn ngữ bản xứ': { en: 'Native Language', fr: 'Langue native', zh: '本国原生语言', ja: '母国語表記' },
  'CẤU HÌNH GIỌNG ĐỌC AI': { en: 'AI VOICE CONFIGURATION', fr: 'CONFIGURATION VOIX IA', zh: 'AI语音配置', ja: 'AI音声設定' },
  'Cấu hình Giọng đọc AI': { en: 'AI Voice Configuration', fr: 'Configuration Voix IA', zh: 'AI语音配置', ja: 'AI音声設定' },
  'TRỰC TUYẾN (CLIENT)': { en: 'ONLINE (CLIENT)', fr: 'EN LIGNE (CLIENT)', zh: '在线状态 (客户端)', ja: 'オンライン (クライアント)' },
  'Trực tuyến (Client)': { en: 'Online (Client)', fr: 'En ligne (Client)', zh: '在线状态 (客户端)', ja: 'オンライン (クライアント)' },
  'THAO TÁC': { en: 'ACTIONS', fr: 'ACTIONS', zh: '操作', ja: '操作' },
  'Thao tác': { en: 'Actions', fr: 'Actions', zh: '操作', ja: '操作' },
  'Gốc mặc định': { en: 'Default Root', fr: 'Par défaut', zh: '系统默认', ja: '規定のデフォルト' },
  'Mặc định': { en: 'Default', fr: 'Par défaut', zh: '默认', ja: 'デフォルト' },
  'Tên quốc tế:': { en: 'International name:', fr: 'Nom international :', zh: '国际通用名：', ja: '国際表記：' },
  'Tốc độ:': { en: 'Speed:', fr: 'Vitesse :', zh: '语速：', ja: '速度：' },
  'Nhà cung cấp:': { en: 'Provider:', fr: 'Fournisseur :', zh: '服务商：', ja: 'プロバイダー：' },
  'Thử giọng': { en: 'Test Voice', fr: 'Tester la voix', zh: '试听语音', ja: '音声試聴' },
  'Xóa ngôn ngữ khỏi hệ thống': {
    en: 'Delete language from system',
    fr: 'Supprimer la langue du système',
    zh: '从系统中删除该语言',
    ja: 'システムから言語を削除'
  },
  'Chọn ngôn ngữ mẫu (Tùy chọn)': {
    en: 'Select preset language (Optional)',
    fr: 'Sélectionner un modèle (Optionnel)',
    zh: '选择预设语言模板 (可选)',
    ja: '言語プリセットを選択 (任意)'
  },
  '-- Chọn mẫu để tự động điền (hoặc tự nhập thông tin bên dưới) --': {
    en: '-- Select a preset to auto-fill (or enter details below) --',
    fr: '-- Choisissez un modèle pour pré-remplir --',
    zh: '-- 选择模板自动填充信息 (或在下方自行输入) --',
    ja: '-- プリセットを選択して自動入力 (または下記に入力) --'
  },
  'Mã ISO': { en: 'ISO Code', fr: 'Code ISO', zh: 'ISO代码', ja: 'ISOコード' },
  'Biểu tượng cờ (Emoji)': { en: 'Flag Emoji', fr: 'Drapeau (Emoji)', zh: '国旗图标 (Emoji)', ja: '国旗絵文字 (Emoji)' },
  'Tên bản xứ': { en: 'Native Name', fr: 'Nom natif', zh: '本国语名称', ja: '母国語表記' },
  'Tên quốc tế (Tiếng Anh)': { en: 'International Name (English)', fr: 'Nom international (Anglais)', zh: '国际通用名 (英文)', ja: '国際名 (英語)' },
  'Mã giọng đọc (TTS Voice)': { en: 'TTS Voice Model', fr: 'Modèle vocal (TTS Voice)', zh: '语音模型代码 (TTS Voice)', ja: '音声モデルコード (TTS Voice)' },
  'Giới tính giọng': { en: 'Voice Gender', fr: 'Genre de la voix', zh: '发音性别', ja: '音声の性別' },
  'Kích hoạt hiển thị cho khách tham quan (Client)': {
    en: 'Activate display for visitors (Client)',
    fr: 'Activer l’affichage pour les visiteurs (Client)',
    zh: '开启游客端展示 (Client)',
    ja: '来館者向け表示を有効化 (Client)'
  },
  'Lưu ngôn ngữ': { en: 'Save Language', fr: 'Enregistrer la langue', zh: '保存语言配置', ja: '言語設定を保存' },
  'Xác nhận xóa ngôn ngữ': {
    en: 'Confirm Delete Language',
    fr: 'Confirmer la suppression de la langue',
    zh: '确认删除语言',
    ja: '言語の削除確認'
  },
  'Bạn có chắc chắn muốn xóa ngôn ngữ này khỏi hệ thống?': {
    en: 'Are you sure you want to remove this language from the system?',
    fr: 'Voulez-vous vraiment supprimer cette langue du système ?',
    zh: '您确定要从系统中彻底移除该语言吗？',
    ja: 'この言語をシステムから完全に削除してもよろしいですか？'
  },

  // Cấu hình Hệ thống & Đa Bảo Tàng (AdminSettingsPage)
  'Cấu hình Hệ thống & Đa Bảo Tàng': {
    en: 'System Configuration & Multi-Museum',
    fr: 'Configuration du Système & Multi-Musées',
    zh: '系统全局配置与多馆管理',
    ja: 'システム環境設定＆複数博物館管理'
  },
  'Nhận Diện & Đa Bảo Tàng (Multi-Museum)': {
    en: 'Identity & Multi-Museum',
    fr: 'Identité & Multi-Musées',
    zh: '馆体标识与多馆支持 (Multi-Museum)',
    ja: '博物館ブランド＆マルチミュージアム (Multi-Museum)'
  },
  'Nhận Diện Bảo Tàng': {
    en: 'Museum Identity',
    fr: 'Identité du musée',
    zh: '馆体品牌标识',
    ja: '博物館ブランド設定'
  },
  'Vận Hành & Bảo Trì Hệ Thống': {
    en: 'Operation & Maintenance',
    fr: 'Exploitation & Maintenance',
    zh: '运维与系统维护',
    ja: 'システム運用＆メンテナンス'
  },
  'Vận Hành & Bảo Trì': {
    en: 'Operation & Maintenance',
    fr: 'Exploitation & Maintenance',
    zh: '运维与维护',
    ja: '運用＆メンテナンス'
  },
  'Cấu Hình Nhận Diện Đa Bảo Tàng': {
    en: 'Multi-Museum Identity Configuration',
    fr: 'Configuration de l’identité multi-musées',
    zh: '多馆品牌识别配置',
    ja: '複数博物館ブランド識別設定'
  },
  'Hệ thống tự do chuyển đổi danh tính của bất kỳ bảo tàng nào. Khi lưu, toàn bộ Header, Sidebar, Login, Email và Standee sẽ lập tức đồng bộ theo dữ liệu thật.': {
    en: 'Switch identity to any museum freely. When saved, Header, Sidebar, Login, Email, and Standee sync immediately.',
    fr: 'Changez l’identité vers n’importe quel musée en temps réel. Header, Sidebar, Login et Standee s’adaptent automatiquement.',
    zh: '支持自由切换为任意博物馆身份。保存后Header、Sidebar、登录页和展架均立即同步真实数据。',
    ja: '任意の博物館のアイデンティティに自由に切り替え可能です。保存すると、ヘッダー、サイドバー、ログイン、スタンドパネルが即座に同期されます。'
  },
  'Tên đầy đủ của bảo tàng': {
    en: 'Full Museum Name',
    fr: 'Nom complet du musée',
    zh: '博物馆全称',
    ja: '博物館の正式名称'
  },
  'Tên rút gọn / Tên ngắn': {
    en: 'Short Name',
    fr: 'Nom court',
    zh: '博物馆简称',
    ja: '略称'
  },
  'Khẩu hiệu / Giới thiệu nhận diện (Tagline)': {
    en: 'Tagline / Slogan',
    fr: 'Slogan / Devise',
    zh: '宣传标语 / 品牌口号 (Tagline)',
    ja: 'スローガン / キャッチコピー (Tagline)'
  },
  'Ký hiệu biểu trưng (Emblem Text)': {
    en: 'Emblem Text',
    fr: 'Texte de l’emblème',
    zh: '文字徽标 (Emblem Text)',
    ja: 'シンボル文字 (Emblem Text)'
  },
  'Ảnh Logo thương hiệu': {
    en: 'Brand Logo Image',
    fr: 'Logo officiel',
    zh: '官方品牌Logo图片',
    ja: 'ブランドロゴ画像'
  },
  'Tải ảnh logo lên': {
    en: 'Upload Logo',
    fr: 'Téléverser logo',
    zh: '上传Logo',
    ja: 'ロゴをアップロード'
  },
  'Gỡ logo': {
    en: 'Remove Logo',
    fr: 'Supprimer logo',
    zh: '移除Logo',
    ja: 'ロゴを削除'
  },
  'Địa chỉ bảo tàng': {
    en: 'Museum Address',
    fr: 'Adresse du musée',
    zh: '博物馆地址',
    ja: '博物館の所在地'
  },
  'Tỉnh / Thành phố': {
    en: 'City / Province',
    fr: 'Ville / Province',
    zh: '所在省市',
    ja: '都道府県 / 市'
  },
  'Email liên hệ': {
    en: 'Contact Email',
    fr: 'E-mail de contact',
    zh: '联系邮箱',
    ja: '連絡先メールアドレス'
  },
  'Hotline liên hệ': {
    en: 'Contact Hotline',
    fr: 'Ligne directe (Hotline)',
    zh: '咨询热线 (Hotline)',
    ja: '代表電話番号 (Hotline)'
  },
  'Lưu cấu hình nhận diện': {
    en: 'Save Identity Settings',
    fr: 'Enregistrer l’identité',
    zh: '保存品牌配置',
    ja: 'ブランド設定を保存'
  },
  'Khôi phục nhận diện chuẩn': {
    en: 'Reset to Default Template',
    fr: 'Rétablir le modèle standard',
    zh: '恢复标准模板',
    ja: '標準テンプレートに戻す'
  },
  'Chế Độ Bảo Trì & Vận Hành Hệ Thống': {
    en: 'System Maintenance & Operations',
    fr: 'Maintenance & Exploitation du système',
    zh: '系统维护与运行状态',
    ja: 'システムメンテナンス＆運用モード'
  },
  'Trạng thái bảo trì': {
    en: 'Maintenance Status',
    fr: 'Statut de maintenance',
    zh: '维护状态',
    ja: 'メンテナンスステータス'
  },
  'Đang tắt bảo trì (Hệ thống Trực tuyến)': {
    en: 'Maintenance Off (System Online)',
    fr: 'Maintenance désactivée (Système en ligne)',
    zh: '维护已关闭 (系统正常运行)',
    ja: 'メンテナンス停止中 (通常稼働)'
  },
  'Đang bật bảo trì (Cổng tham quan Tạm khóa)': {
    en: 'Maintenance On (Portal Temporarily Locked)',
    fr: 'Maintenance activée (Portail temporairement verrouillé)',
    zh: '维护已开启 (漫游入口已锁定)',
    ja: 'メンテナンス中 (ポータル一時ロック)'
  },
  'Bật / Tắt bảo trì': {
    en: 'Toggle Maintenance',
    fr: 'Basculer la maintenance',
    zh: '切换维护模式',
    ja: 'メンテナンス切替'
  },
  'Cổng tham quan': {
    en: 'Tour Portal',
    fr: 'Portail de visite',
    zh: '全景漫游入口',
    ja: 'ツアーポータル'
  },
  'Trang thông báo': {
    en: 'Notice Page',
    fr: 'Page d’information',
    zh: '公告页面',
    ja: '案内ページ'
  },
  'Giám Sát Hạ Tầng & Máy Chủ': {
    en: 'Infrastructure & Server Monitor',
    fr: 'Surveillance serveur & infrastructure',
    zh: '基础设施与服务器监控',
    ja: 'インフラ＆サーバー監視'
  },
  'Trạng thái kết nối': {
    en: 'Connection Status',
    fr: 'Statut de connexion',
    zh: '连接状态',
    ja: '接続状態'
  },
  'Thời gian hoạt động': {
    en: 'Uptime',
    fr: 'Temps de fonctionnement',
    zh: '运行时间',
    ja: '稼働時間'
  },
  'Độ trễ phản hồi': {
    en: 'Response Latency',
    fr: 'Latence réseau',
    zh: '响应延迟',
    ja: '応答レイテンシ'
  },
  'Tải CPU máy chủ': {
    en: 'Server CPU Load',
    fr: 'Charge CPU',
    zh: 'CPU负载',
    ja: 'CPU負荷'
  },
  'Bộ nhớ RAM': {
    en: 'Memory (RAM)',
    fr: 'Mémoire (RAM)',
    zh: '内存使用 (RAM)',
    ja: 'メモリ使用量 (RAM)'
  },
  'Làm mới dữ liệu máy chủ': {
    en: 'Refresh Server Metrics',
    fr: 'Actualiser les métriques',
    zh: '刷新服务器状态',
    ja: 'サーバー指標を更新'
  },
  'Quay lại': {
    en: 'Back',
    fr: 'Retour',
    zh: '返回',
    ja: '戻る'
  },
  'Công cụ & Điểm': {
    en: 'Tools & Points',
    fr: 'Outils & Points',
    zh: '工具与点位',
    ja: 'ツール＆スポット'
  },
  'Điểm chuyển tiếp phòng': {
    en: 'Room Portal Hotspot',
    fr: 'Portail de changement de salle',
    zh: '展厅切换锚点',
    ja: '展示室移動ポータル'
  },
  'Điểm thuyết minh hiện vật': {
    en: 'Artifact Info Hotspot',
    fr: 'Fiche explicative de l’objet',
    zh: '文物解说点',
    ja: '遺物解説スポット'
  },
  'Sửa điểm neo': {
    en: 'Edit Hotspot',
    fr: 'Modifier le point',
    zh: '编辑交互点',
    ja: 'スポット編集'
  },
  'Xóa điểm neo': {
    en: 'Delete Hotspot',
    fr: 'Supprimer le point',
    zh: '删除交互点',
    ja: 'スポット削除'
  },
  'Lưu cấu hình không gian': {
    en: 'Save Space Configuration',
    fr: 'Enregistrer l’espace',
    zh: '保存空间配置',
    ja: '空間設定を保存'
  },
  'Đặt góc nhìn ban đầu': {
    en: 'Set Default View',
    fr: 'Définir la vue par défaut',
    zh: '设置默认视角',
    ja: '初期視点に設定'
  },
  'Thêm điểm neo di sản': {
    en: 'Add Heritage Hotspot',
    fr: 'Ajouter un point interactif',
    zh: '添加空间锚点',
    ja: '遺産スポットを追加'
  },
  'Điểm liên kết': {
    en: 'Linked Hotspots',
    fr: 'Points associés',
    zh: '关联锚点',
    ja: 'リンクスポット'
  },
  'Cài đặt phòng': {
    en: 'Room Settings',
    fr: 'Paramètres de la salle',
    zh: '展厅设置',
    ja: '展示室設定'
  },
  'Quay lại danh sách các gian trưng bày': {
    en: 'Back to Exhibition Rooms',
    fr: 'Retour aux galeries d’exposition',
    zh: '返回展厅列表',
    ja: '展示室一覧に戻る'
  }
};
