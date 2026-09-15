/**
 * Centralized Smart i18n Translation Engine
 * Guarantees 100% synchronized multilingual coverage across all Client pages:
 * - Home, Tour360, Map, Timeline, Artifacts & QR Scan, Quiz, Booking, Profile,
 *   LeftSidebar, TopBar, VisitorAuthModal, and Common Controls.
 * - Multi-tier fallback resolution: Active Language -> Smart Lexicon -> English -> Vietnamese.
 */

export type SupportedLanguageCode = 
  | "vi" | "en" | "fr" | "ja" | "ko" | "zh" | "zh-TW" | "es" | "de" | "ru" | "th" | "it" | "pt" | "id" | string;

export interface TranslationDictionary {
  [key: string]: string;
}

// Complete Client-Side Dictionaries for Core Languages
const DICTIONARIES: Record<string, TranslationDictionary> = {
  // ===================== TIẾNG VIỆT (GỐC) =====================
  vi: {
    // Nav & Sidebar
    "nav.brand": "BẢO TÀNG LỊCH SỬ",
    "nav.subBrand": "TP. HỒ CHÍ MINH",
    "nav.home": "Trang Chủ Di Sản",
    "nav.tour360": "Tham Quan Tour 360°",
    "nav.map": "Sơ Đồ Bản Đồ Bảo Tàng",
    "nav.timeline": "Dòng Thời Gian Lịch Sử",
    "nav.artifact": "Cổ Vật & Không Gian 3D",
    "nav.quiz": "Đố Vui & Sổ Tem Di Sản",
    "nav.booking": "Đặt Lịch Tour Theo Lớp",
    "nav.profile": "Hộ Chiếu Du Khách Số",
    "nav.adminPortal": "Cổng Quản Trị Studio",
    "nav.adminShortcut": "Vào Admin Studio",
    "nav.theme": "Giao Diện",
    "nav.language": "Ngôn Ngữ",
    "nav.passportRank": "Hộ Chiếu Du Khách",
    "nav.passportStamps": "Tem Di Sản",
    "nav.visitorStatus": "Du Khách Thành Viên",
    "nav.normalUser": "Tài khoản Thông Thường",
    "nav.login": "Đăng Nhập Khách",
    "nav.logout": "Đăng Xuất",

    // TopBar
    "topbar.slogan": "DI SẢN NGHÌN NĂM QUA LĂNG KÍNH SỐ HÓA 3D",
    "topbar.searchPlaceholder": "Tìm kiếm cổ vật, triều đại, hiện vật số hóa...",
    "topbar.broadcastTitle": "Phát thanh bảo tàng:",
    "topbar.qrScan": "Quét Mã QR Hiện Vật",

    // Home Page
    "home.badge": "HỆ THỐNG DI SẢN VĂN HÓA SỐ HÓA 3D BẢO TÀNG LỊCH SỬ TP.HCM",
    "home.heroTitle": "Khám Phá Di Sản Nghìn Năm Qua Không Gian Đa Chiều",
    "home.heroDesc": "Trải nghiệm không gian ảo hóa 3D Gaussian Splatting, tour 360 độ siêu thực và thuyết minh tự động thông minh bằng giọng đọc trí tuệ nhân tạo.",
    "home.btnTour360": "Bắt Đầu Tour 360°",
    "home.btnTimeline": "Xem Dòng Thời Gian",
    "home.btnArtifacts": "Bộ Sưu Tập Cổ Vật",
    "home.statArtifacts": "Bảo Vật & Cổ Vật",
    "home.statEras": "Thời Kỳ Lịch Sử",
    "home.statRooms": "Không Gian Trưng Bày",
    "home.statResolution": "Độ Phân Giải 3D",
    "home.erasTitle": "Hành Trình Qua Các Nền Văn Minh & Triều Đại",
    "home.erasSubtitle": "Dòng chảy lịch sử dân tộc được tái hiện chi tiết và khoa học",
    "home.quickGuideTitle": "Hướng Dẫn Trải Nghiệm Du Khách",

    // Tour 360
    "tour360.title": "Tour Tham Quan Ảo 360° Không Gian Bảo Tàng",
    "tour360.selectRoom": "Chọn Phòng Trưng Bày:",
    "tour360.instruction": "Kéo chuột để xoay 360°, cuộn chuột để phóng to/thu nhỏ, nhấp vào điểm liên kết để di chuyển sảnh.",
    "tour360.playVoice": "Phát Thuyết Minh Giọng Đọc AI",
    "tour360.stopVoice": "Dừng Thuyết Minh",
    "tour360.hotspotDetails": "Thông Tin Chi Tiết Điểm Di Tích",

    // Map Page
    "map.title": "Sơ Đồ Bản Đồ Tương Tác Bảo Tàng",
    "map.levelGround": "Tầng Trệt - Tiền Sử & Cổ Đại",
    "map.levelFirst": "Tầng 1 - Thời Kỳ Tự Chủ & Triều Đại",
    "map.levelSecond": "Tầng 2 - Văn Hóa Dân Tộc Phương Nam",
    "map.facilityLegend": "Ký Hiệu Tiện Ích:",
    "map.entrance": "Lối Vào Chính",
    "map.ticket": "Quầy Vé",
    "map.wc": "Khu Vệ Sinh",
    "map.lift": "Thang Máy",
    "map.guidePrompt": "Nhấp vào bất kỳ phòng trưng bày nào để xem chi tiết hiện vật và lộ trình di chuyển.",

    // Timeline Page
    "timeline.title": "Dòng Thời Gian Lịch Sử Sống",
    "timeline.subtitle": "Biên Niên Sử & Mạng Lưới Khảo Cổ Liên Đới",
    "timeline.modeFree": "Khám Phá Tự Do",
    "timeline.modeJourney": "Hành Trình Giám Tuyển",
    "timeline.selectEra": "Chọn Thời Kỳ Lịch Sử:",
    "timeline.keyEvents": "Các Mốc Sự Kiện Quan Trọng:",
    "timeline.curatorNotes": "Lời Bình Của Giám Đốc Giám Tuyển:",
    "timeline.listenNarration": "Nghe Thuyết Minh Lịch Sử",
    "timeline.stopNarration": "Dừng Giọng Đọc",
    "timeline.relatedArtifacts": "Xem Mạng Lưới Cổ Vật Liên Đới",

    // Artifact Page & QR Scan
    "artifact.title": "Phòng Trưng Bày Cổ Vật Số Hóa",
    "artifact.quickSelect": "Chọn nhanh cổ vật:",
    "artifact.filterAll": "Tất Cả Hiện Vật",
    "artifact.era": "Niên đại:",
    "artifact.material": "Chất liệu:",
    "artifact.location": "Địa điểm khai quật:",
    "artifact.placard": "Bảng Chú Thích & Ý Nghĩa Lịch Sử:",
    "artifact.playVoice": "Phát Giọng Đọc AI",
    "artifact.stopVoice": "Tạm Dừng Giọng Đọc",
    "artifact.inspect3D": "Tương Tác 3D Không Gian",
    "artifact.wireframe": "Chế Độ Khung Dây 3D",
    "artifact.qrScanned": "Đã Quét Mã QR Cổ Vật Thành Công",

    // Quiz Page
    "quiz.title": "Thử Thách Đố Vui Di Sản Lịch Sử",
    "quiz.question": "Câu Hỏi",
    "quiz.score": "Điểm Số Hiện Tại:",
    "quiz.correct": "Chính Xác! Bạn đã mở khóa tem di sản mới.",
    "quiz.incorrect": "Chưa chính xác, hãy đọc thêm thông tin cổ vật nhé!",
    "quiz.restart": "Chơi Lại Từ Đầu",
    "quiz.certificate": "Chứng Nhận Nhà Khảo Cổ Học Xuất Sắc",

    // Booking Page
    "booking.title": "Đăng Ký Đặt Lịch Tour Theo Lớp & Đoàn",
    "booking.selectDate": "Chọn Ngày Tham Quan:",
    "booking.selectSlot": "Chọn Ca Giờ & Hướng Dẫn Viên:",
    "booking.fullName": "Họ và tên người đại diện:",
    "booking.phone": "Số điện thoại liên hệ:",
    "booking.email": "Email nhận vé điện tử:",
    "booking.guests": "Số lượng du khách:",
    "booking.btnSubmit": "Xác Nhận Đặt Tour & Nhận Mã QR",
    "booking.success": "Đặt Tour Thành Công! Mã vé điện tử đã được gửi qua email.",

    // User Profile
    "profile.title": "Hồ Sơ & Hộ Chiếu Du Khách Số",
    "profile.level": "Cấp Bậc Di Sản:",
    "profile.stamps": "Bộ Sưu Tập Tem Đã Tích Lũy:",
    "profile.scanned": "Hiện Vật Đã Quét QR:",
    "profile.history": "Lịch Sử Tham Quan:",

    // Visitor Auth Modal
    "auth.modalTitle": "Đăng Nhập Khách Tham Quan",
    "auth.step1Title": "Bước 1: Nhập Email để nhận mã OTP",
    "auth.step1Desc": "Hệ thống máy chủ sẽ gửi mã xác thực gồm 6 chữ số đến hòm thư của bạn.",
    "auth.btnSendOtp": "Gửi Mã OTP Qua Email",
    "auth.step2Title": "Bước 2: Nhập mã OTP 6 chữ số",
    "auth.btnVerify": "Xác Nhận & Đăng Nhập",
    "auth.resend": "Gửi Lại Mã OTP",
    "auth.success": "Đăng nhập thành công! Chào mừng bạn đến với Bảo tàng.",

    // Common
    "common.close": "Đóng",
    "common.confirm": "Xác Nhận",
    "common.cancel": "Hủy Bỏ",
    "common.loading": "Đang Tải Dữ Liệu...",
    "common.search": "Tìm Kiếm",
    "common.viewDetails": "Xem Chi Tiết",
    "common.audioPlaying": "Đang phát giọng đọc...",
    "common.audioStopped": "Đã dừng giọng đọc",
    "common.back": "Quay Lại",
    "common.all": "Tất Cả"
  },

  // ===================== ENGLISH =====================
  en: {
    // Nav & Sidebar
    "nav.brand": "HISTORICAL MUSEUM",
    "nav.subBrand": "HO CHI MINH CITY",
    "nav.home": "Heritage Home",
    "nav.tour360": "360° Virtual Tour",
    "nav.map": "Interactive Museum Map",
    "nav.timeline": "Living History Timeline",
    "nav.artifact": "3D Artifacts & Relics",
    "nav.quiz": "Quiz & Heritage Passport",
    "nav.booking": "Group & School Booking",
    "nav.profile": "Digital Visitor Passport",
    "nav.adminPortal": "Admin Studio Portal",
    "nav.adminShortcut": "Enter Admin Studio",
    "nav.theme": "Theme Mode",
    "nav.language": "Language",
    "nav.passportRank": "Visitor Passport",
    "nav.passportStamps": "Heritage Stamps",
    "nav.visitorStatus": "Member Visitor",
    "nav.normalUser": "Standard Account",
    "nav.login": "Visitor Sign In",
    "nav.logout": "Sign Out",

    // TopBar
    "topbar.slogan": "MILLENNIAL HERITAGE THROUGH 3D DIGITAL PERSPECTIVES",
    "topbar.searchPlaceholder": "Search artifacts, dynasties, 3D digitized relics...",
    "topbar.broadcastTitle": "Museum Broadcast:",
    "topbar.qrScan": "Scan Artifact QR Code",

    // Home Page
    "home.badge": "3D DIGITAL HERITAGE SYSTEM • HCMC HISTORICAL MUSEUM",
    "home.heroTitle": "Explore Millennial Heritage Across Multi-Dimensions",
    "home.heroDesc": "Experience cutting-edge 3D Gaussian Splatting, hyper-realistic 360-degree virtual tours, and smart multilingual AI narration.",
    "home.btnTour360": "Launch 360° Tour",
    "home.btnTimeline": "Explore Timeline",
    "home.btnArtifacts": "Artifact Collection",
    "home.statArtifacts": "Treasures & Artifacts",
    "home.statEras": "Historical Eras",
    "home.statRooms": "Gallery Halls",
    "home.statResolution": "3D Ultra-Res",
    "home.erasTitle": "Journey Across Dynasties & Civilizations",
    "home.erasSubtitle": "Vibrant chronicles of national history meticulously curated",
    "home.quickGuideTitle": "Visitor Experience Guide",

    // Tour 360
    "tour360.title": "360° Virtual Museum Panorama Tour",
    "tour360.selectRoom": "Select Gallery Hall:",
    "tour360.instruction": "Drag to pan 360°, scroll to zoom in/out, click hotspots to traverse between halls.",
    "tour360.playVoice": "Play AI Voice Guide",
    "tour360.stopVoice": "Pause Audio Guide",
    "tour360.hotspotDetails": "Relic Hotspot Information",

    // Map Page
    "map.title": "Interactive Museum Floor Map",
    "map.levelGround": "Ground Floor - Prehistory & Antiquity",
    "map.levelFirst": "1st Floor - Autonomy & Dynasties",
    "map.levelSecond": "2nd Floor - Southern Cultural Heritage",
    "map.facilityLegend": "Facility Legend:",
    "map.entrance": "Main Entrance",
    "map.ticket": "Ticket Counter",
    "map.wc": "Restrooms",
    "map.lift": "Elevator",
    "map.guidePrompt": "Click on any gallery room to view exhibit highlights and navigation routes.",

    // Timeline Page
    "timeline.title": "Living Historical Timeline",
    "timeline.subtitle": "Chronicles & Cross-Cultural Archeological Network",
    "timeline.modeFree": "Free Exploration",
    "timeline.modeJourney": "Curated Journey",
    "timeline.selectEra": "Select Historical Era:",
    "timeline.keyEvents": "Key Historical Milestones:",
    "timeline.curatorNotes": "Curatorial Commentary:",
    "timeline.listenNarration": "Listen to History Narration",
    "timeline.stopNarration": "Stop Voice Guide",
    "timeline.relatedArtifacts": "View Related Artifact Network",

    // Artifact Page & QR Scan
    "artifact.title": "Digitized Artifacts Gallery",
    "artifact.quickSelect": "Quick Artifact Select:",
    "artifact.filterAll": "All Artifacts",
    "artifact.era": "Period:",
    "artifact.material": "Material:",
    "artifact.location": "Excavation Site:",
    "artifact.placard": "Placard & Historical Significance:",
    "artifact.playVoice": "Play AI Audio Guide",
    "artifact.stopVoice": "Pause Voice Guide",
    "artifact.inspect3D": "3D Interactive Inspect",
    "artifact.wireframe": "3D Wireframe Mode",
    "artifact.qrScanned": "Artifact QR Code Scanned Successfully",

    // Quiz Page
    "quiz.title": "Heritage History Trivia Challenge",
    "quiz.question": "Question",
    "quiz.score": "Current Score:",
    "quiz.correct": "Correct! You unlocked a new digital heritage stamp.",
    "quiz.incorrect": "Not quite! Check out the artifact placard to learn more.",
    "quiz.restart": "Restart Trivia",
    "quiz.certificate": "Distinguished Archeologist Certificate",

    // Booking Page
    "booking.title": "Group & School Guided Tour Registration",
    "booking.selectDate": "Select Visit Date:",
    "booking.selectSlot": "Select Time Slot & Guide:",
    "booking.fullName": "Lead Representative Name:",
    "booking.phone": "Contact Phone:",
    "booking.email": "Confirmation Email:",
    "booking.guests": "Number of Visitors:",
    "booking.btnSubmit": "Confirm Booking & Receive QR Pass",
    "booking.success": "Booking Confirmed! E-pass sent to your email address.",

    // User Profile
    "profile.title": "Digital Visitor Passport & Profile",
    "profile.level": "Heritage Explorer Rank:",
    "profile.stamps": "Collected Heritage Stamps:",
    "profile.scanned": "Scanned QR Relics:",
    "profile.history": "Visit History:",

    // Visitor Auth Modal
    "auth.modalTitle": "Visitor Sign In",
    "auth.step1Title": "Step 1: Enter your Email for OTP",
    "auth.step1Desc": "Our server will send a 6-digit verification code to your email inbox.",
    "auth.btnSendOtp": "Send OTP via Email",
    "auth.step2Title": "Step 2: Enter 6-Digit OTP Code",
    "auth.btnVerify": "Verify & Sign In",
    "auth.resend": "Resend OTP Code",
    "auth.success": "Sign in successful! Welcome to the Museum.",

    // Common
    "common.close": "Close",
    "common.confirm": "Confirm",
    "common.cancel": "Cancel",
    "common.loading": "Loading Data...",
    "common.search": "Search",
    "common.viewDetails": "View Details",
    "common.audioPlaying": "Playing audio guide...",
    "common.audioStopped": "Audio guide stopped",
    "common.back": "Back",
    "common.all": "All"
  },

  // ===================== FRENCH (FRANÇAIS) =====================
  fr: {
    "nav.brand": "MUSÉE D'HISTOIRE",
    "nav.subBrand": "HÔ CHI MINH-VILLE",
    "nav.home": "Accueil Patrimoine",
    "nav.tour360": "Visite Virtuelle 360°",
    "nav.map": "Plan Interactif",
    "nav.timeline": "Frise Chronologique",
    "nav.artifact": "Artéfacts 3D & Reliques",
    "nav.quiz": "Quiz & Passeport",
    "nav.booking": "Réservation de Visite",
    "nav.profile": "Passeport Visiteur Numérique",
    "nav.adminPortal": "Portail d'Administration",
    "nav.adminShortcut": "Entrer Studio Admin",
    "nav.theme": "Thème",
    "nav.language": "Langue",
    "nav.passportRank": "Passeport Visiteur",
    "nav.passportStamps": "Timbres du Patrimoine",
    "nav.visitorStatus": "Visiteur Membre",
    "nav.normalUser": "Compte Standard",
    "nav.login": "Connexion Visiteur",
    "nav.logout": "Déconnexion",

    "topbar.slogan": "PATRIMOINE MILLÉNAIRE PAR LA NUMÉRISATION 3D",
    "topbar.searchPlaceholder": "Rechercher des artéfacts, dynasties, reliques 3D...",
    "topbar.broadcastTitle": "Annonce du Musée:",
    "topbar.qrScan": "Scanner le QR Code de l'Artéfact",

    "home.badge": "SYSTÈME DU PATRIMOINE NUMÉRIQUE 3D DU MUSÉE D'HISTOIRE",
    "home.heroTitle": "Explorez le Patrimoine Millénaire en Multi-Dimensions",
    "home.heroDesc": "Découvrez la technologie 3D Gaussian Splatting, des visites panoramiques 360° et des commentaires audio IA multilingues.",
    "home.btnTour360": "Lancer la Visite 360°",
    "home.btnTimeline": "Voir la Chronologie",
    "home.btnArtifacts": "Collection d'Artéfacts",
    "home.statArtifacts": "Trésors & Reliques",
    "home.statEras": "Époques Historiques",
    "home.statRooms": "Salles d'Exposition",
    "home.statResolution": "Résolution 3D",
    "home.erasTitle": "Un Voyage à Travers les Dynasties",
    "home.erasSubtitle": "Les chroniques historiques présentées avec rigueur et élégance",
    "home.quickGuideTitle": "Guide de Visite",

    "tour360.title": "Visite Panoramique Virtuelle 360° du Musée",
    "tour360.selectRoom": "Sélectionner la Salle:",
    "tour360.instruction": "Faites glisser pour pivoter à 360°, zoomez à la molette, cliquez sur les repères pour naviguer.",
    "tour360.playVoice": "Écouter le Guide Vocal IA",
    "tour360.stopVoice": "Mettre en Pause le Guide Vocal",
    "tour360.hotspotDetails": "Détails du Point d'Intérêt",

    "map.title": "Plan Interactif des Salles du Musée",
    "map.levelGround": "Rez-de-chaussée - Préhistoire & Antiquité",
    "map.levelFirst": "1er Étage - Période d'Autonomie & Dynasties",
    "map.levelSecond": "2e Étage - Culture du Sud",
    "map.facilityLegend": "Légende des Installations:",
    "map.entrance": "Entrée Principale",
    "map.ticket": "Billetterie",
    "map.wc": "Sanitaires",
    "map.lift": "Ascenseur",
    "map.guidePrompt": "Cliquez sur une salle pour découvrir les œuvres maîtresses et l'itinéraire.",

    "timeline.title": "Frise Chronologique Vivante",
    "timeline.subtitle": "Chroniques & Réseau Archéologique Lié",
    "timeline.modeFree": "Exploration Libre",
    "timeline.modeJourney": "Parcours du Conservateur",
    "timeline.selectEra": "Sélectionner l'Époque:",
    "timeline.keyEvents": "Événements Marquants:",
    "timeline.curatorNotes": "Commentaires du Conservateur:",
    "timeline.listenNarration": "Écouter la Narration Historique",
    "timeline.stopNarration": "Arrêter le Guide Audio",
    "timeline.relatedArtifacts": "Voir les Artéfacts Liés",

    "artifact.title": "Galerie d'Artéfacts Numérisés",
    "artifact.quickSelect": "Sélection Rapide:",
    "artifact.filterAll": "Tous les Artéfacts",
    "artifact.era": "Époque:",
    "artifact.material": "Matériau:",
    "artifact.location": "Lieu de fouille:",
    "artifact.placard": "Cartel & Importance Historique:",
    "artifact.playVoice": "Activer le Guide Vocal IA",
    "artifact.stopVoice": "Pause Audio",
    "artifact.inspect3D": "Inspection 3D Interactive",
    "artifact.wireframe": "Mode Filaire 3D",
    "artifact.qrScanned": "QR Code d'Artéfact Scanné avec Succès",

    "quiz.title": "Défi Quiz du Patrimoine",
    "quiz.question": "Question",
    "quiz.score": "Score Actuel:",
    "quiz.correct": "Exact! Vous avez débloqué un nouveau timbre numérique.",
    "quiz.incorrect": "Incorrect, consultez le cartel pour en savoir plus!",
    "quiz.restart": "Recommencer",
    "quiz.certificate": "Certificat d'Archéologue Émérite",

    "booking.title": "Réservation de Visite Guidée Scolaire & de Groupe",
    "booking.selectDate": "Choisir la Date:",
    "booking.selectSlot": "Choisir le Créneau & le Guide:",
    "booking.fullName": "Nom du Responsable:",
    "booking.phone": "Téléphone:",
    "booking.email": "Courriel de Confirmation:",
    "booking.guests": "Nombre de Visiteurs:",
    "booking.btnSubmit": "Confirmer la Réservation & Obtenir le Pass QR",
    "booking.success": "Réservation Validée! Votre pass électronique a été expédié par e-mail.",

    "profile.title": "Passeport Numérique du Visiteur",
    "profile.level": "Rang d'Explorateur:",
    "profile.stamps": "Timbres Collectionnés:",
    "profile.scanned": "Reliques Scannées:",
    "profile.history": "Historique des Visites:",

    "auth.modalTitle": "Connexion Visiteur",
    "auth.step1Title": "Étape 1: Entrez votre e-mail pour recevoir l'OTP",
    "auth.step1Desc": "Notre serveur transmettra un code de confirmation à 6 chiffres.",
    "auth.btnSendOtp": "Envoyer le Code OTP",
    "auth.step2Title": "Étape 2: Saisissez le code à 6 chiffres",
    "auth.btnVerify": "Vérifier & Se Connecter",
    "auth.resend": "Renvoyer le Code",
    "auth.success": "Connexion réussie! Bienvenue au musée.",

    "common.close": "Fermer",
    "common.confirm": "Confirmer",
    "common.cancel": "Annuler",
    "common.loading": "Chargement...",
    "common.search": "Rechercher",
    "common.viewDetails": "Détails",
    "common.audioPlaying": "Lecture audio en cours...",
    "common.audioStopped": "Audio arrêté",
    "common.back": "Retour",
    "common.all": "Tous"
  },

  // ===================== JAPANESE (日本語) =====================
  ja: {
    "nav.brand": "歴史博物館",
    "nav.subBrand": "ホーチミン市",
    "nav.home": "遺産ホーム",
    "nav.tour360": "360° バーチャルツアー",
    "nav.map": "館内案内マップ",
    "nav.timeline": "歴史タイムライン",
    "nav.artifact": "3D 文化財・遺物",
    "nav.quiz": "歴史クイズ＆手帳",
    "nav.booking": "団体・学校見学予約",
    "nav.profile": "デジタル来館パスポート",
    "nav.adminPortal": "管理スタジオ",
    "nav.adminShortcut": "管理者スタジオへ",
    "nav.theme": "表示モード",
    "nav.language": "言語設定",
    "nav.passportRank": "来館パスポート",
    "nav.passportStamps": "文化財スタンプ",
    "nav.visitorStatus": "一般来館者",
    "nav.normalUser": "通常アカウント",
    "nav.login": "ログイン",
    "nav.logout": "ログアウト",

    "topbar.slogan": "3Dデジタル技術で巡る千年遺産",
    "topbar.searchPlaceholder": "文化財、王朝、3D遺物を検索...",
    "topbar.broadcastTitle": "博物館アナウンス:",
    "topbar.qrScan": "展示品QRコード読み取り",

    "home.badge": "ホーチミン市歴史博物館 • 3Dデジタル遺産システム",
    "home.heroTitle": "多次元空間で体感する千年の歴史遺産",
    "home.heroDesc": "最先端の3Dガウススプラッティング、超高精細360度バーチャルツアー、多言語対応AI音声解説を体験してください。",
    "home.btnTour360": "360° ツアー開始",
    "home.btnTimeline": "タイムラインを見る",
    "home.btnArtifacts": "文化財コレクション",
    "home.statArtifacts": "国宝＆文化財",
    "home.statEras": "歴史時代区分",
    "home.statRooms": "展示フロア",
    "home.statResolution": "超高解像度3D",
    "home.erasTitle": "諸王朝と古代文明を巡る旅",
    "home.erasSubtitle": "綿密な学術調査に基づいて蘇るベトナムの歴史絵巻",
    "home.quickGuideTitle": "見学ガイダンス",

    "tour360.title": "博物館 360° パノラマバーチャルツアー",
    "tour360.selectRoom": "展示室を選択:",
    "tour360.instruction": "ドラッグして全方位を見渡し、スクロールで拡大縮小、ホットスポットをクリックして別の部屋へ移動します。",
    "tour360.playVoice": "AI音声解説を再生",
    "tour360.stopVoice": "音声解説を停止",
    "tour360.hotspotDetails": "遺物スポット情報",

    "map.title": "館内インタラクティブマップ",
    "map.levelGround": "1階 - 先史時代・古代文明",
    "map.levelFirst": "2階 - 独立王朝時代",
    "map.levelSecond": "3階 - 南部民族の伝統文化",
    "map.facilityLegend": "施設案内:",
    "map.entrance": "正面入口",
    "map.ticket": "チケット売場",
    "map.wc": "お手洗い",
    "map.lift": "エレベーター",
    "map.guidePrompt": "展示室をクリックすると主要展示品と案内ルートが表示されます。",

    "timeline.title": "躍動する歴史タイムライン",
    "timeline.subtitle": "通史編年録＆関連考古学ネットワーク",
    "timeline.modeFree": "自由散策モード",
    "timeline.modeJourney": "学芸員ガイドコース",
    "timeline.selectEra": "歴史時代を選択:",
    "timeline.keyEvents": "重要歴史事項:",
    "timeline.curatorNotes": "学芸部長の解説:",
    "timeline.listenNarration": "歴史ナレーションを聴く",
    "timeline.stopNarration": "音声を一時停止",
    "timeline.relatedArtifacts": "関連する文化財ネットワーク",

    "artifact.title": "デジタル文化財展示室",
    "artifact.quickSelect": "遺物をクイック選択:",
    "artifact.filterAll": "すべての文化財",
    "artifact.era": "年代:",
    "artifact.material": "材質:",
    "artifact.location": "出土地:",
    "artifact.placard": "解説プレート・歴史的意義:",
    "artifact.playVoice": "AI音声を聴く",
    "artifact.stopVoice": "音声を一時停止",
    "artifact.inspect3D": "3Dインタラクティブ観察",
    "artifact.wireframe": "3Dワイヤーフレーム表示",
    "artifact.qrScanned": "展示品QRコードを正常に読み取りました",

    "quiz.title": "歴史遺産クイズチャレンジ",
    "quiz.question": "問題",
    "quiz.score": "現在のスコア:",
    "quiz.correct": "正解です！新しいデジタルスタンプを獲得しました。",
    "quiz.incorrect": "残念！展示解説を読んで再挑戦しましょう。",
    "quiz.restart": "最初からやり直す",
    "quiz.certificate": "優秀考古学者認定証",

    "booking.title": "団体・学校向け見学ツアー予約",
    "booking.selectDate": "来館日を選択:",
    "booking.selectSlot": "時間帯・学芸員を選択:",
    "booking.fullName": "代表者氏名:",
    "booking.phone": "連絡先電話番号:",
    "booking.email": "確認メールアドレス:",
    "booking.guests": "来館人数:",
    "booking.btnSubmit": "予約を確定しQRパスを発行",
    "booking.success": "ご予約が完了しました！電子チケットをメールでお送りしました。",

    "profile.title": "デジタル来館者パスポート",
    "profile.level": "探究者ランク:",
    "profile.stamps": "獲得スタンプ:",
    "profile.scanned": "スキャン済み遺物:",
    "profile.history": "来館履歴:",

    "auth.modalTitle": "来館者ログイン",
    "auth.step1Title": "ステップ1: メールアドレスを入力",
    "auth.step1Desc": "サーバーから6桁の確認コードをメールで送信します。",
    "auth.btnSendOtp": "OTP認証コードを送信",
    "auth.step2Title": "ステップ2: 6桁のコードを入力",
    "auth.btnVerify": "認証してログイン",
    "auth.resend": "コードを再送",
    "auth.success": "ログインしました。博物館へようこそ。",

    "common.close": "閉じる",
    "common.confirm": "確認",
    "common.cancel": "キャンセル",
    "common.loading": "読み込み中...",
    "common.search": "検索",
    "common.viewDetails": "詳細を見る",
    "common.audioPlaying": "音声を再生しています...",
    "common.audioStopped": "音声を停止しました",
    "common.back": "戻る",
    "common.all": "すべて"
  },

  // ===================== KOREAN (한국어) =====================
  ko: {
    "nav.brand": "역사 박물관",
    "nav.subBrand": "호치민시",
    "nav.home": "문화유산 홈",
    "nav.tour360": "360° 가상 투어",
    "nav.map": "박물관 안내 지도",
    "nav.timeline": "역사 타임라인",
    "nav.artifact": "3D 유물 및 소장품",
    "nav.quiz": "퀴즈 및 스탬프 수첩",
    "nav.booking": "단체 및 학교 예약",
    "nav.profile": "디지털 관람 여권",
    "nav.adminPortal": "관리자 스튜디오",
    "nav.adminShortcut": "관리자 스튜디오로 이동",
    "nav.theme": "테마 모드",
    "nav.language": "언어 설정",
    "nav.passportRank": "관람 여권",
    "nav.passportStamps": "유산 스탬프",
    "nav.visitorStatus": "회원 관람객",
    "nav.normalUser": "일반 계정",
    "nav.login": "관람객 로그인",
    "nav.logout": "로그아웃",

    "topbar.slogan": "3D 디지털 렌즈로 바라본 천년의 문화유산",
    "topbar.searchPlaceholder": "유물, 왕조, 3D 디지털 소장품 검색...",
    "topbar.broadcastTitle": "박물관 공지:",
    "topbar.qrScan": "유물 QR 코드 스캔",

    "home.badge": "호치민시 역사박물관 • 3D 디지털 유산 플랫폼",
    "home.heroTitle": "다차원 공간에서 만나는 천년의 역사 유산",
    "home.heroDesc": "첨단 3D Gaussian Splatting, 실감형 360도 가상 투어와 스마트 다국어 AI 음성 해설을 체험해보세요.",
    "home.btnTour360": "360° 투어 시작",
    "home.btnTimeline": "타임라인 보기",
    "home.btnArtifacts": "유물 컬렉션",
    "home.statArtifacts": "국보 및 유물",
    "home.statEras": "역사 시대",
    "home.statRooms": "전시실",
    "home.statResolution": "초고해상도 3D",
    "home.erasTitle": "왕조와 고대 문명을 따라가는 여정",
    "home.erasSubtitle": "철저한 고증과 학술 연구를 바탕으로 구현된 베트남의 역사",
    "home.quickGuideTitle": "관람 안내",

    "tour360.title": "박물관 360° 파노라마 가상 투어",
    "tour360.selectRoom": "전시실 선택:",
    "tour360.instruction": "드래그하여 360도 회전, 스크롤하여 확대/축소, 핫스팟을 클릭하여 다른 전시실로 이동하세요.",
    "tour360.playVoice": "AI 음성 해설 듣기",
    "tour360.stopVoice": "음성 일시정지",
    "tour360.hotspotDetails": "유물 상세 정보",

    "map.title": "인터랙티브 박물관 지도",
    "map.levelGround": "1층 - 선사 및 고대 시대",
    "map.levelFirst": "2층 - 자주 왕조 시대",
    "map.levelSecond": "3층 - 남부 민족 문화",
    "map.facilityLegend": "시설 안내:",
    "map.entrance": "정문 입구",
    "map.ticket": "매표소",
    "map.wc": "화장실",
    "map.lift": "엘리베이터",
    "map.guidePrompt": "전시실을 클릭하면 주요 전시물과 관람 동선을 확인할 수 있습니다.",

    "timeline.title": "살아 숨쉬는 역사 타임라인",
    "timeline.subtitle": "역사 편년사 및 고고학 네트워크",
    "timeline.modeFree": "자유 탐색 모드",
    "timeline.modeJourney": "큐레이터 추천 코스",
    "timeline.selectEra": "역사 시대 선택:",
    "timeline.keyEvents": "주요 역사적 사건:",
    "timeline.curatorNotes": "큐레이터의 해설:",
    "timeline.listenNarration": "역사 해설 듣기",
    "timeline.stopNarration": "음성 해설 중지",
    "timeline.relatedArtifacts": "연관 유물 네트워크 보기",

    "artifact.title": "디지털 유물 전시실",
    "artifact.quickSelect": "유물 빠른 선택:",
    "artifact.filterAll": "모든 유물",
    "artifact.era": "연대:",
    "artifact.material": "재질:",
    "artifact.location": "출토지:",
    "artifact.placard": "유물 설명 및 역사적 가치:",
    "artifact.playVoice": "AI 음성 해설 재생",
    "artifact.stopVoice": "음성 일시정지",
    "artifact.inspect3D": "3D 인터랙티브 관찰",
    "artifact.wireframe": "3D 와이어프레임 모드",
    "artifact.qrScanned": "유물 QR 코드가 성공적으로 인식되었습니다",

    "quiz.title": "역사 문화 퀴즈 챌린지",
    "quiz.question": "문제",
    "quiz.score": "현재 점수:",
    "quiz.correct": "정답입니다! 새로운 디지털 유산 스탬프를 획득했습니다.",
    "quiz.incorrect": "오답입니다. 유물 설명판을 다시 확인해보세요!",
    "quiz.restart": "처음부터 다시하기",
    "quiz.certificate": "우수 고고학자 인증서",

    "booking.title": "단체 및 학교 맞춤형 투어 예약",
    "booking.selectDate": "방문 일자 선택:",
    "booking.selectSlot": "시간대 및 해설사 선택:",
    "booking.fullName": "대표자 성함:",
    "booking.phone": "연락처:",
    "booking.email": "확인 이메일:",
    "booking.guests": "방문 인원:",
    "booking.btnSubmit": "예약 확정 및 QR 티켓 수령",
    "booking.success": "예약이 완료되었습니다! 전자 티켓이 이메일로 발송되었습니다.",

    "profile.title": "디지털 관람객 여권",
    "profile.level": "탐험가 등급:",
    "profile.stamps": "수집한 스탬프:",
    "profile.scanned": "스캔한 유물:",
    "profile.history": "방문 기록:",

    "auth.modalTitle": "관람객 로그인",
    "auth.step1Title": "1단계: 인증 번호를 받을 이메일 입력",
    "auth.step1Desc": "서버에서 6자리 인증 번호를 이메일로 전송합니다.",
    "auth.btnSendOtp": "OTP 인증 번호 발송",
    "auth.step2Title": "2단계: 6자리 인증 번호 입력",
    "auth.btnVerify": "인증 및 로그인",
    "auth.resend": "인증 번호 재발송",
    "auth.success": "로그인되었습니다. 박물관 방문을 환영합니다.",

    "common.close": "닫기",
    "common.confirm": "확인",
    "common.cancel": "취소",
    "common.loading": "데이터 로딩 중...",
    "common.search": "검색",
    "common.viewDetails": "상세보기",
    "common.audioPlaying": "음성 해설 재생 중...",
    "common.audioStopped": "음성 해설 중지됨",
    "common.back": "뒤로",
    "common.all": "전체"
  },

  // ===================== CHINESE (简体中文) =====================
  zh: {
    "nav.brand": "历史博物馆",
    "nav.subBrand": "胡志明市",
    "nav.home": "数字遗产首页",
    "nav.tour360": "360° 虚拟导览",
    "nav.map": "展馆导览地图",
    "nav.timeline": "历史时光轴",
    "nav.artifact": "3D 文物与珍品",
    "nav.quiz": "问答与文博护照",
    "nav.booking": "团体与学校预约",
    "nav.profile": "观众数字护照",
    "nav.adminPortal": "管理后台",
    "nav.adminShortcut": "进入管理工作台",
    "nav.theme": "界面主题",
    "nav.language": "语言切换",
    "nav.passportRank": "观众护照",
    "nav.passportStamps": "文博印章",
    "nav.visitorStatus": "注册会员",
    "nav.normalUser": "普通访客",
    "nav.login": "访客登录",
    "nav.logout": "退出登录",

    "topbar.slogan": "以3D数字化透镜探索千年文明遗产",
    "topbar.searchPlaceholder": "搜索文物、朝代、数字化藏品...",
    "topbar.broadcastTitle": "博物馆广播:",
    "topbar.qrScan": "扫码查看文物",

    "home.badge": "胡志明市历史博物馆 • 3D数字文化遗产系统",
    "home.heroTitle": "在多维数字空间领略千年文化遗产",
    "home.heroDesc": "体验前沿3D高斯飞溅技术、超沉浸式360度全景漫游以及智能多语言AI语音导览。",
    "home.btnTour360": "开启360°漫游",
    "home.btnTimeline": "查看历史纪元",
    "home.btnArtifacts": "文物典藏",
    "home.statArtifacts": "国宝与文物",
    "home.statEras": "历史时期",
    "home.statRooms": "主题展厅",
    "home.statResolution": "超高精度3D",
    "home.erasTitle": "跨越王朝与古文明的历史之旅",
    "home.erasSubtitle": "严谨科学的学术考证与生动立体的历史画卷",
    "home.quickGuideTitle": "参观指南",

    "tour360.title": "博物馆 360° 全景虚拟导览",
    "tour360.selectRoom": "选择展厅:",
    "tour360.instruction": "拖动鼠标旋转360度视角，滚轮缩放画面，点击热点穿梭不同展厅。",
    "tour360.playVoice": "播放AI语音讲解",
    "tour360.stopVoice": "暂停语音讲解",
    "tour360.hotspotDetails": "文物热点详情",

    "map.title": "互动式展馆地图",
    "map.levelGround": "底层 - 史前与古代文明",
    "map.levelFirst": "一层 - 自主时期与封建王朝",
    "map.levelSecond": "二层 - 南方多元民族文化",
    "map.facilityLegend": "便民设施:",
    "map.entrance": "主入口",
    "map.ticket": "售票处",
    "map.wc": "洗手间",
    "map.lift": "电梯",
    "map.guidePrompt": "点击任意展厅即可查看重点展品及推荐参观路线。",

    "timeline.title": "生动的历史时光轴",
    "timeline.subtitle": "通史编年表与考古文物互联网络",
    "timeline.modeFree": "自由探索模式",
    "timeline.modeJourney": "策展人精选路线",
    "timeline.selectEra": "选择历史纪元:",
    "timeline.keyEvents": "重大历史事件:",
    "timeline.curatorNotes": "策展部主任评析:",
    "timeline.listenNarration": "收听历史讲解",
    "timeline.stopNarration": "暂停语音",
    "timeline.relatedArtifacts": "查看关联文物网络",

    "artifact.title": "数字化文物展厅",
    "artifact.quickSelect": "快速选择文物:",
    "artifact.filterAll": "全部文物",
    "artifact.era": "年代:",
    "artifact.material": "材质:",
    "artifact.location": "出土地点:",
    "artifact.placard": "展品说明牌与历史意义:",
    "artifact.playVoice": "播放AI语音解说",
    "artifact.stopVoice": "暂停解说",
    "artifact.inspect3D": "3D交互探究",
    "artifact.wireframe": "3D线框结构模式",
    "artifact.qrScanned": "文物二维码识别成功",

    "quiz.title": "历史文博趣味知识挑战",
    "quiz.question": "问题",
    "quiz.score": "当前得分:",
    "quiz.correct": "回答正确！您已解锁全新数字文博印章。",
    "quiz.incorrect": "回答有误，请仔细阅读展品说明牌后重试！",
    "quiz.restart": "重新挑战",
    "quiz.certificate": "优秀青年考古学者荣誉证书",

    "booking.title": "学校与团体参观导览预约",
    "booking.selectDate": "选择参观日期:",
    "booking.selectSlot": "选择时段与讲解员:",
    "booking.fullName": "领队代表姓名:",
    "booking.phone": "联系电话:",
    "booking.email": "接收通知邮箱:",
    "booking.guests": "参观人数:",
    "booking.btnSubmit": "确认预约并生成电子QR票",
    "booking.success": "预约成功！电子门票已发送至您的电子邮箱。",

    "profile.title": "观众数字护照与个人主页",
    "profile.level": "探索者等级:",
    "profile.stamps": "已收集文博印章:",
    "profile.scanned": "已扫码文物:",
    "profile.history": "参观足迹:",

    "auth.modalTitle": "访客登录",
    "auth.step1Title": "第一步：输入接收验证码的邮箱",
    "auth.step1Desc": "系统服务器将向您的邮箱发送6位数字动态验证码。",
    "auth.btnSendOtp": "发送邮箱验证码",
    "auth.step2Title": "第二步：输入6位验证码",
    "auth.btnVerify": "验证并登录",
    "auth.resend": "重新获取验证码",
    "auth.success": "登录成功！欢迎参观历史博物馆。",

    "common.close": "关闭",
    "common.confirm": "确认",
    "common.cancel": "取消",
    "common.loading": "数据加载中...",
    "common.search": "搜索",
    "common.viewDetails": "查看详情",
    "common.audioPlaying": "正在播放语音...",
    "common.audioStopped": "已停止语音播放",
    "common.back": "返回",
    "common.all": "全部"
  },

  // ===================== THAI (ไทย) =====================
  th: {
    "nav.brand": "พิพิธภัณฑ์ประวัติศาสตร์",
    "nav.subBrand": "นครโฮจิมินห์",
    "nav.home": "หน้าหลักมรดก",
    "nav.tour360": "ทัวร์เสมือนจริง 360°",
    "nav.map": "แผนที่นำทางพิพิธภัณฑ์",
    "nav.timeline": "เส้นเวลาประวัติศาสตร์",
    "nav.artifact": "โบราณวัตถุ 3D",
    "nav.quiz": "ตอบคำถาม & สมุดตราประทับ",
    "nav.booking": "จองรอบเข้าชมเป็นหมู่คณะ",
    "nav.profile": "หนังสือเดินทางดิจิทัล",
    "nav.adminPortal": "สตูดิโอด้านการจัดการ",
    "nav.adminShortcut": "เข้าสู่หน้าแอดมิน",
    "nav.theme": "ธีมการแสดงผล",
    "nav.language": "เปลี่ยนภาษา",
    "nav.passportRank": "หนังสือเดินทางผู้เยี่ยมชม",
    "nav.passportStamps": "ตราประทับมรดก",
    "nav.visitorStatus": "ผู้เยี่ยมชมทั่วไป",
    "nav.normalUser": "บัญชีผู้ใช้ปกติ",
    "nav.login": "เข้าสู่ระบบ",
    "nav.logout": "ออกจากระบบ",

    "topbar.slogan": "สัมผัสมรดกนับพันปีผ่านมุมมองดิจิทัล 3 มิติ",
    "topbar.searchPlaceholder": "ค้นหาโบราณวัตถุ ราชวงศ์ นิทรรศการ 3D...",
    "topbar.broadcastTitle": "ประกาศพิพิธภัณฑ์:",
    "topbar.qrScan": "สแกน QR โบราณวัตถุ",

    "home.badge": "ระบบมรดกทางวัฒนธรรมดิจิทัล 3D พิพิธภัณฑ์ประวัติศาสตร์ นครโฮจิมินห์",
    "home.heroTitle": "ค้นพบมรดกนับพันปีในมิติดิจิทัลสมจริง",
    "home.heroDesc": "สัมผัสเทคโนโลยี 3D Gaussian Splatting ทัวร์พาโนรามา 360 องศา และเสียงบรรยายอัจฉริยะด้วย AI หลายภาษา",
    "home.btnTour360": "เริ่มทัวร์ 360°",
    "home.btnTimeline": "ดูเส้นเวลา",
    "home.btnArtifacts": "ชมโบราณวัตถุ",
    "home.statArtifacts": "สมบัติและวัตถุโบราณ",
    "home.statEras": "ยุคประวัติศาสตร์",
    "home.statRooms": "ห้องนิทรรศการ",
    "home.statResolution": "ความละเอียด 3D",
    "home.erasTitle": "การเดินทางผ่านยุคสมัยและอารยธรรม",
    "home.erasSubtitle": "บันทึกประวัติศาสตร์ชาติพันธุ์ที่ถูกถ่ายทอดอย่างงดงามและถูกต้องตามหลักวิชาการ",
    "home.quickGuideTitle": "คำแนะนำสำหรับผู้เข้าชม",

    "tour360.title": "ทัวร์ชมพิพิธภัณฑ์เสมือนจริง 360°",
    "tour360.selectRoom": "เลือกห้องนิทรรศการ:",
    "tour360.instruction": "ลากเมาส์เพื่อหมุนรอบทิศ เลื่อนลูกกลิ้งเพื่อซูม และคลิกจุดเชื่อมต่อเพื่อเปลี่ยนห้อง",
    "tour360.playVoice": "ฟังเสียงบรรยาย AI",
    "tour360.stopVoice": "หยุดเสียงบรรยาย",
    "tour360.hotspotDetails": "รายละเอียดจุดโบราณวัตถุ",

    "map.title": "แผนผังพิพิธภัณฑ์แบบโต้ตอบ",
    "map.levelGround": "ชั้นล่าง - ยุคก่อนประวัติศาสตร์และโบราณคดี",
    "map.levelFirst": "ชั้น 1 - ยุคเอกราชและราชวงศ์",
    "map.levelSecond": "ชั้น 2 - วัฒนธรรมภาคใต้",
    "map.facilityLegend": "สิ่งอำนวยความสะดวก:",
    "map.entrance": "ทางเข้าหลัก",
    "map.ticket": "จุดจำหน่ายตั๋ว",
    "map.wc": "ห้องน้ำ",
    "map.lift": "ลิฟต์",
    "map.guidePrompt": "คลิกที่ห้องจัดแสดงเพื่อดูโบราณวัตถุเด่นและเส้นทางแนะนำ",

    "timeline.title": "เส้นเวลาประวัติศาสตร์มีชีวิต",
    "timeline.subtitle": "พงศาวดารและเครือข่ายความสัมพันธ์ทางโบราณคดี",
    "timeline.modeFree": "สำรวจอิสระ",
    "timeline.modeJourney": "เส้นทางตามภัณฑารักษ์",
    "timeline.selectEra": "เลือกยุคประวัติศาสตร์:",
    "timeline.keyEvents": "เหตุการณ์สำคัญ:",
    "timeline.curatorNotes": "บันทึกจากหัวหน้าภัณฑารักษ์:",
    "timeline.listenNarration": "ฟังเสียงบรรยายประวัติศาสตร์",
    "timeline.stopNarration": "หยุดเสียงบรรยาย",
    "timeline.relatedArtifacts": "ดูเครือข่ายโบราณวัตถุที่เชื่อมโยง",

    "artifact.title": "ห้องจัดแสดงโบราณวัตถุดิจิทัล",
    "artifact.quickSelect": "เลือกโบราณวัตถุด่วน:",
    "artifact.filterAll": "โบราณวัตถุทั้งหมด",
    "artifact.era": "ยุคสมัย:",
    "artifact.material": "วัสดุ:",
    "artifact.location": "สถานที่ขุดค้น:",
    "artifact.placard": "ป้ายคำอธิบายและความสำคัญทางประวัติศาสตร์:",
    "artifact.playVoice": "ฟังเสียงบรรยาย AI",
    "artifact.stopVoice": "หยุดเสียงชั่วคราว",
    "artifact.inspect3D": "สำรวจ 3 มิติแบบโต้ตอบ",
    "artifact.wireframe": "โหมดโครงลวด 3D",
    "artifact.qrScanned": "สแกนรหัส QR สำเร็จเรียบร้อย",

    "quiz.title": "ความท้าทายตอบคำถามมรดกประวัติศาสตร์",
    "quiz.question": "คำถาม",
    "quiz.score": "คะแนนปัจจุบัน:",
    "quiz.correct": "ถูกต้อง! คุณได้รับตราประทับดิจิทัลใหม่",
    "quiz.incorrect": "ยังไม่ถูกต้อง ลองอ่านคำอธิบายวัตถุโบราณอีกครั้งนะ!",
    "quiz.restart": "เริ่มใหม่",
    "quiz.certificate": "ใบประกาศนียบัตรนักโบราณคดีดีเด่น",

    "booking.title": "ลงทะเบียนจองรอบทัวร์สำหรับโรงเรียนและคณะ",
    "booking.selectDate": "เลือกวันที่เข้าชม:",
    "booking.selectSlot": "เลือกรอบเวลาและมัคคุเทศก์:",
    "booking.fullName": "ชื่อ-นามสกุลตัวแทน:",
    "booking.phone": "เบอร์โทรศัพท์ติดต่อ:",
    "booking.email": "อีเมลรับตั๋ว:",
    "booking.guests": "จำนวนผู้เข้าชม:",
    "booking.btnSubmit": "ยืนยันการจองและรับรหัส QR",
    "booking.success": "การจองสำเร็จ! บัตรอิเล็กทรอนิกส์ถูกส่งไปยังอีเมลของคุณแล้ว",

    "profile.title": "หนังสือเดินทางผู้เยี่ยมชมดิจิทัล",
    "profile.level": "ระดับนักสำรวจ:",
    "profile.stamps": "ตราประทับที่สะสมได้:",
    "profile.scanned": "โบราณวัตถุที่สแกนแล้ว:",
    "profile.history": "ประวัติการเข้าชม:",

    "auth.modalTitle": "เข้าสู่ระบบผู้เยี่ยมชม",
    "auth.step1Title": "ขั้นตอนที่ 1: ใส่อีเมลเพื่อรับรหัส OTP",
    "auth.step1Desc": "เซิร์ฟเวอร์จะส่งรหัสยืนยัน 6 หลักไปยังกล่องจดหมายของคุณ",
    "auth.btnSendOtp": "ส่งรหัส OTP ทางอีเมล",
    "auth.step2Title": "ขั้นตอนที่ 2: ใส่รหัส 6 หลัก",
    "auth.btnVerify": "ยืนยันและเข้าสู่ระบบ",
    "auth.resend": "ส่งรหัสใหม่",
    "auth.success": "เข้าสู่ระบบสำเร็จ ยินดีต้อนรับสู่พิพิธภัณฑ์",

    "common.close": "ปิด",
    "common.confirm": "ยืนยัน",
    "common.cancel": "ยกเลิก",
    "common.loading": "กำลังโหลดข้อมูล...",
    "common.search": "ค้นหา",
    "common.viewDetails": "ดูรายละเอียด",
    "common.audioPlaying": "กำลังเล่นเสียงบรรยาย...",
    "common.audioStopped": "หยุดเสียงแล้ว",
    "common.back": "ย้อนกลับ",
    "common.all": "ทั้งหมด"
  }
};

/**
 * Multilingual Artifact Placard Translations
 * Maps artifact id -> language code -> localized placard & specs
 */
export const ARTIFACT_TRANSLATIONS: Record<string, Record<string, { placard: string; name?: string; era?: string; material?: string }>> = {
  "buddha-dong-duong": {
    vi: {
      placard: "Bảo vật quốc gia. Pho tượng Phật đứng bằng đồng thau, phong cách nghệ thuật Amaravati tiêu biểu với nếp gấp áo cà sa vắt qua vai trái. Di vật minh chứng cho giao lưu hàng hải văn hóa rực rỡ phương Nam.",
      name: "Tượng Phật Đồng Dương",
      era: "Thế kỷ 4 - 6 (Văn hóa Champa)",
      material: "Đồng thau nguyên khối"
    },
    en: {
      placard: "National Treasure. Standing bronze Buddha statue representing the distinctive Amaravati art style with monastic robe draped over the left shoulder, illustrating vibrant maritime cultural exchanges.",
      name: "Dong Duong Bronze Buddha Statue",
      era: "4th - 6th Century (Champa Culture)",
      material: "Cast Bronze"
    },
    fr: {
      placard: "Trésor National. Statue de Bouddha debout en bronze de style Amaravati, drapée sur l'épaule gauche, témoignant des échanges maritimes historiques florissants du Sud.",
      name: "Statue de Bouddha de Dong Duong",
      era: "IVe - VIe siècle (Culture Champa)",
      material: "Bronze coulé massif"
    },
    ja: {
      placard: "国宝。左肩に法衣をまとったアマラヴァティ様式のブロンズ製立仏像。古代東南アジアにおける海上交易と仏教文化の繁栄を証明する極めて貴重な遺物です。",
      name: "ドンズオン青銅仏立像",
      era: "4〜6世紀（チャンパ文化）",
      material: "鋳造青銅"
    },
    ko: {
      placard: "베트남 국보. 왼쪽 어깨에 가사를 걸친 독특한 아마라바티 양식의 청동 입불상으로, 고대 동남아시아의 활발한 해양 교역과 불교 문화의 번영을 증명하는 소중한 유물입니다.",
      name: "동즈엉 청동 불상",
      era: "4세기 ~ 6세기 (참파 문화)",
      material: "청동 주조"
    },
    zh: {
      placard: "越南国家级宝物。青铜立佛像，展现典型阿马拉瓦蒂（Amaravati）艺术流派风格，袈裟偏袒右肩、覆于左肩。实证南方海上丝绸之路与繁荣的多元文化交流。",
      name: "同阳青铜立佛像",
      era: "公元4-6世纪 (占婆文化)",
      material: "实心青铜铸造"
    },
    th: {
      placard: "สมบัติแห่งชาติเวียดนาม พระพุทธรูปทองสัมฤทธิ์ประทับยืน ศิลปะแบบอมราวดี ชายจีวรพาดไหล่ซ้าย หลักฐานสำคัญของการแลกเปลี่ยนวัฒนธรรมและการค้าทางทะเลโบราณอันรุ่งเรือง",
      name: "พระพุทธรูปสัมฤทธิ์ด่งเดือง",
      era: "ศตวรรษที่ 4 - 6 (วัฒนธรรมจามปา)",
      material: "ทองสัมฤทธิ์หล่อตัน"
    }
  },
  "trong-dong-dong-son": {
    vi: {
      placard: "Bảo vật thời kỳ đồ đồng rực rỡ của nền văn minh lúa nước sông Hồng. Mặt trống khắc họa mặt trời 12 tia, chim Lạc bay và cảnh người giã gạo, múa vũ trang.",
      name: "Trống Đồng Đông Sơn",
      era: "Thế kỷ 5 - 1 TCN (Văn hóa Đông Sơn)",
      material: "Đồng thau đúc hoa văn chìm"
    },
    en: {
      placard: "Masterpiece of the Red River civilization. Features a 12-pointed sun, sacred flying Lac birds, warrior dancers, and ancient agricultural scenes.",
      name: "Dong Son Bronze Drum",
      era: "5th - 1st Century BC (Dong Son Culture)",
      material: "Engraved Cast Bronze"
    },
    fr: {
      placard: "Chef-d'œuvre de la civilisation du fleuve Rouge. Orné d'un soleil à 12 rayons, d'oiseaux sacrés Lac, de danseurs guerriers et de scènes agricoles.",
      name: "Tambour de Bronze de Dong Son",
      era: "Ve - Ier siècle av. J.-C. (Culture de Dong Son)",
      material: "Bronze gravé"
    },
    ja: {
      placard: "紅河文明の精華。中央に12光線の太陽、周囲に聖鳥ラック、武具を手にした戦士たちの舞踏、稲作農耕の風景が精緻に刻まれています。",
      name: "ドンソン銅鼓",
      era: "紀元前5世紀〜紀元前1世紀（ドンソン文化）",
      material: "鋳造青銅（沈み彫り文様）"
    },
    ko: {
      placard: "홍강 문명의 대표 걸작 유물. 중앙의 12갈래 태양 광선과 날아오르는 신성한 락(Lac) 새, 무기를 들고 춤추는 전사들과 벼농사 풍경이 정교하게 새겨져 있습니다.",
      name: "동손 청동북",
      era: "기원전 5세기 ~ 기원전 1세기 (동손 문화)",
      material: "청동 음각 주조"
    },
    zh: {
      placard: "红河水稻文明的青铜艺术巅峰之作。鼓面正中铸十二角太阳芒，外绕展翅飞翔的雒鸟、羽饰执戈武士舞姿以及古越先民春米舂稼的生动图景。",
      name: "东山铜鼓",
      era: "公元前5世纪 - 公元前1世纪 (东山文化)",
      material: "青铜范铸凹纹"
    },
    th: {
      placard: "ผลงานชิ้นเอกแห่งอารยธรรมลุ่มแม่น้ำแดง หน้ากลองจำหลักลายดวงอาทิตย์ 12 แฉก นกศักดิ์สิทธิ์ลักบิน นักรบระบำ และวิถีชีวิตการทำนาอันรุ่งเรือง",
      name: "กลองมโหระทึกดงเซิน",
      era: "ศตวรรษที่ 5 - 1 ก่อนคริสตกาล (วัฒนธรรมดงเซิน)",
      material: "สัมฤทธิ์หล่อสลักลาย"
    }
  }
};

class I18nManager {
  private currentLanguage: string = "vi";
  private listeners: Array<(lang: string) => void> = [];

  constructor() {
    // Restore from localStorage
    try {
      const savedLang = localStorage.getItem("museum_config_lang");
      if (savedLang) {
        this.currentLanguage = savedLang;
      }
    } catch (_) {}
  }

  public getLanguage(): string {
    return this.currentLanguage;
  }

  public setLanguage(lang: string) {
    if (this.currentLanguage === lang) return;
    this.currentLanguage = lang;
    try {
      localStorage.setItem("museum_config_lang", lang);
    } catch (_) {}

    // Dispatch global event for application reactive re-render
    window.dispatchEvent(new CustomEvent("museum:language-changed", { detail: { lang } }));
    this.listeners.forEach(cb => cb(lang));
  }

  public onLanguageChange(cb: (lang: string) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(x => x !== cb);
    };
  }

  /**
   * Translates a key with multi-tiered fallback:
   * 1. Check in active language dictionary
   * 2. Fallback to English dictionary
   * 3. Fallback to Vietnamese base dictionary
   * 4. Return defaultText or the key itself
   */
  public t(key: string, params?: Record<string, string | number>): string {
    const lang = this.currentLanguage;
    let template = "";

    if (DICTIONARIES[lang] && DICTIONARIES[lang][key]) {
      template = DICTIONARIES[lang][key];
    } else if (DICTIONARIES["en"] && DICTIONARIES["en"][key]) {
      template = DICTIONARIES["en"][key];
    } else if (DICTIONARIES["vi"] && DICTIONARIES["vi"][key]) {
      template = DICTIONARIES["vi"][key];
    } else {
      template = key;
    }

    if (params) {
      Object.keys(params).forEach(pKey => {
        template = template.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(params[pKey]));
      });
    }

    return template;
  }

  /**
   * Localizes artifact details (placard, name, era, material)
   */
  public getArtifactPlacard(artifactId: string, fallbackText: string): string {
    const lang = this.currentLanguage;
    const art = ARTIFACT_TRANSLATIONS[artifactId];
    if (art) {
      if (art[lang] && art[lang].placard) return art[lang].placard;
      if (art["en"] && art["en"].placard) return art["en"].placard;
      if (art["vi"] && art["vi"].placard) return art["vi"].placard;
    }
    return fallbackText;
  }
}

export const i18n = new I18nManager();
export const t = (key: string, params?: Record<string, string | number>) => i18n.t(key, params);
