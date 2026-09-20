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
  'Sau': { en: 'Next', fr: 'Suivant', zh: '下一页', ja: '次へ' }
};
