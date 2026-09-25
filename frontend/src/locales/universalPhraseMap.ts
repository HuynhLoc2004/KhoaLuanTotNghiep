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
  // --- PHƯƠNG VỊ VÀ CHỈ DẪN 8 HƯỚNG MẶT BẰNG & TOUR 360 (DỊCH TỨC THÌ 0MS) ---
  'Bên phải (Đông)': {
    en: 'To the right (East)',
    fr: 'Vers la droite (Est)',
    zh: '右侧 (东)',
    ja: '右側 (東)'
  },
  'Bên trái (Tây)': {
    en: 'To the left (West)',
    fr: 'Vers la gauche (Ouest)',
    zh: '左侧 (西)',
    ja: '左側 (西)'
  },
  'Phía trước (Bắc)': {
    en: 'Straight ahead (North)',
    fr: 'Tout droit (Nord)',
    zh: '前方 (北)',
    ja: '正面 (北)'
  },
  'Phía dưới (Nam)': {
    en: 'Downward (South)',
    fr: 'Vers le bas (Sud)',
    zh: '下方 (南)',
    ja: '下側 (南)'
  },
  'Phía dưới - Trái (Tây Nam)': {
    en: 'Down-left (Southwest)',
    fr: 'En bas à gauche (Sud-ouest)',
    zh: '左下方 (西南)',
    ja: '左下 (南西)'
  },
  'Phía dưới - Phải (Đông Nam)': {
    en: 'Down-right (Southeast)',
    fr: 'En bas à droite (Sud-est)',
    zh: '右下方 (东南)',
    ja: '右下 (南東)'
  },
  'Phía trên - Trái (Tây Bắc)': {
    en: 'Up-left (Northwest)',
    fr: 'En haut à gauche (Nord-ouest)',
    zh: '左上方 (西北)',
    ja: '左上 (北西)'
  },
  'Phía trên - Phải (Đông Bắc)': {
    en: 'Up-right (Northeast)',
    fr: 'En haut à droite (Nord-est)',
    zh: '右上方 (东北)',
    ja: '右上 (北東)'
  },
  'Lối quay lại': {
    en: 'Return path',
    fr: 'Chemin de retour',
    zh: '返回通路',
    ja: '戻り通路'
  },
  'Lối thông': {
    en: 'Connecting hallway',
    fr: 'Couloir de liaison',
    zh: '连通走廊',
    ja: '連絡通路'
  },
  '← Trái': {
    en: '← Left',
    fr: '← Gauche',
    zh: '← 左侧',
    ja: '← 左'
  },
  'Phải →': {
    en: 'Right →',
    fr: 'Droite →',
    zh: '右侧 →',
    ja: '右 →'
  },
  '↑ Thẳng': {
    en: '↑ Ahead',
    fr: '↑ Tout droit',
    zh: '↑ 前方',
    ja: '↑ 直進'
  },
  '↓ Dưới': {
    en: '↓ Down',
    fr: '↓ En bas',
    zh: '↓ 下方',
    ja: '↓ 下'
  },
  '↙ Xuống trái': {
    en: '↙ Down-left',
    fr: '↙ Bas-gauche',
    zh: '↙ 左下',
    ja: '↙ 左下'
  },
  '↘ Xuống phải': {
    en: '↘ Down-right',
    fr: '↘ Bas-droite',
    zh: '↘ 右下',
    ja: '↘ 右下'
  },
  '↖ Lên trái': {
    en: '↖ Up-left',
    fr: '↖ Haut-gauche',
    zh: '↖ 左上',
    ja: '↖ 左上'
  },
  '↗ Lên phải': {
    en: '↗ Up-right',
    fr: '↗ Haut-droite',
    zh: '↗ 右上',
    ja: '↗ 右上'
  },
  '↶ Quay lại': {
    en: '↶ Return',
    fr: '↶ Retour',
    zh: '↶ 返回',
    ja: '↶ 戻る'
  },

  // --- CLIENT PORTAL & NAVIGATION CORE TERMS (DỊCH TỨC THÌ 0MS - KHÔNG DELAY) ---
  'Sơ đồ mặt bằng các gian trưng bày': {
    en: 'Floor plan and layout of exhibition galleries',
    fr: 'Plan d’ensemble et emplacement des salles d’exposition',
    zh: '展厅空间总平面图与布局',
    ja: '展示室フロアマップ・配置図'
  },
  'Sơ Đồ Mặt Bằng & Vị Trí Các Gian Trưng Bày': {
    en: 'Floor plan and layout of exhibition galleries',
    fr: 'Plan d’ensemble et emplacement des salles d’exposition',
    zh: '展厅空间总平面图与布局',
    ja: '展示室フロアマップ・配置図'
  },
  'Bản đồ kiến trúc không gian và vị trí các gian phòng trưng bày tại Bảo tàng Lịch sử TP.HCM': {
    en: 'Spatial architectural map and locations of exhibition galleries at the History Museum of Ho Chi Minh City',
    fr: 'Carte architecturale de l’espace et emplacement des salles d’exposition au Musée d’Histoire de Hô Chi Minh-Ville',
    zh: '胡志明市历史博物馆空间建筑平面图与各展厅位置分布',
    ja: 'ホーチミン市歴史博物館の空間建築マップと各展示室の配置'
  },
  'Chọn từng gian phòng trên sơ đồ để tra cứu tên hiện vật, quan sát hướng đi và các lối thông phòng liên kết thực tế.': {
    en: 'Select each room on the map to look up artifact names, observe tour paths and interconnected galleries.',
    fr: 'Sélectionnez chaque salle sur le plan pour consulter les objets, suivre les parcours et les liaisons entre les salles.',
    zh: '在平面图上选择各展厅以查阅文物名称、观察参观路线及实际连通走廊。',
    ja: 'マップ上の各展示室を選択して、文化財名の確認、見学順路や連絡通路の確認ができます。'
  },
  'Thứ Ba – Chủ Nhật': {
    en: 'Tuesday – Sunday',
    fr: 'Mardi – Dimanche',
    zh: '周二至周日',
    ja: '火曜日〜日曜日'
  },
  'Thứ Ba - Chủ Nhật': {
    en: 'Tuesday – Sunday',
    fr: 'Mardi – Dimanche',
    zh: '周二至周日',
    ja: '火曜日〜日曜日'
  },
  '08:00 – 11:30': {
    en: '08:00 AM – 11:30 AM',
    fr: '08h00 – 11h30',
    zh: '08:00 – 11:30',
    ja: '08:00 – 11:30'
  },
  '13:30 – 17:00': {
    en: '01:30 PM – 05:00 PM',
    fr: '13h30 – 17h00',
    zh: '13:30 – 17:00',
    ja: '13:30 – 17:00'
  },
  'Thứ Hai: Đóng cửa định kỳ để bảo quản hiện vật.': {
    en: 'Monday: Periodically closed for artifact preservation.',
    fr: 'Lundi : Fermeture périodique pour la conservation des objets.',
    zh: '周一：定期闭馆进行文物保养维护。',
    ja: '月曜日：文化財保存・定期メンテナンスのため休館。'
  },
  'Thứ Hai: Đóng cửa định kỳ để bảo quản hiện vật': {
    en: 'Monday: Periodically closed for artifact preservation.',
    fr: 'Lundi : Fermeture périodique pour la conservation des objets.',
    zh: '周一：定期闭馆进行文物保养维护。',
    ja: '月曜日：文化財保存・定期メンテナンスのため休館。'
  },
  'Quầy vé ngưng nhận khách trước giờ đóng cửa 30 phút.': {
    en: 'Ticket counter stops admitting visitors 30 minutes before closing.',
    fr: 'La billetterie cesse d’accueillir les visiteurs 30 minutes avant la fermeture.',
    zh: '售票处于闭馆前30分钟停止售票与入馆。',
    ja: 'チケット販売および入場は閉館の30分前に終了します。'
  },
  'Quầy vé ngưng nhận khách trước giờ đóng cửa 30 phút': {
    en: 'Ticket counter stops admitting visitors 30 minutes before closing.',
    fr: 'La billetterie cesse d’accueillir les visiteurs 30 minutes avant la fermeture.',
    zh: '售票处于闭馆前30分钟停止售票与入馆。',
    ja: 'チケット販売および入場は閉館の30分前に終了します。'
  },
  'Tuyến 05, 06, 14, 19, 52 dừng ngay cổng đường Nguyễn Bỉnh Khiêm.': {
    en: 'Bus routes 05, 06, 14, 19, 52 stop right at Nguyen Binh Khiem gate.',
    fr: 'Lignes de bus 05, 06, 14, 19, 52 avec arrêt à la porte Nguyen Binh Khiem.',
    zh: '05、06、14、19、52路公交车在阮秉谦路门前停靠。',
    ja: 'バス路線05、06、14、19、52番がグエン・ビン・キエム通り正門前に停車します。'
  },
  'Tuyến 05, 06, 14, 19, 52 dừng ngay cổng đường Nguyễn Bỉnh Khiêm': {
    en: 'Bus routes 05, 06, 14, 19, 52 stop right at Nguyen Binh Khiem gate.',
    fr: 'Lignes de bus 05, 06, 14, 19, 52 avec arrêt à la porte Nguyen Binh Khiem.',
    zh: '05、06、14、19、52路公交车在阮秉谦路门前停靠。',
    ja: 'バス路線05、06、14、19、52番がグエン・ビン・キエム通り正門前に停車します。'
  },
  'Bãi đỗ xe máy và ô tô thuận tiện ngay trong sân bảo tàng.': {
    en: 'Convenient motorbike and car parking right inside the museum yard.',
    fr: 'Stationnement facile pour motos et voitures directement dans la cour du musée.',
    zh: '博物馆院内提供便捷的摩托车和汽车停放场地。',
    ja: '博物館構内にバイクおよび乗用車用の便利な駐車場を完備。'
  },
  'Bãi đỗ xe máy và ô tô thuận tiện ngay trong sân bảo tàng': {
    en: 'Convenient motorbike and car parking right inside the museum yard.',
    fr: 'Stationnement facile pour motos et voitures directement dans la cour du musée.',
    zh: '博物馆院内提供便捷的摩托车和汽车停放场地。',
    ja: '博物館構内にバイクおよび乗用車用の便利な駐車場を完備。'
  },
  'Chưa cấu hình mã nhúng bản đồ trực tiếp': {
    en: 'Live embedded map has not been configured',
    fr: 'Carte intégrée en direct non encore configurée',
    zh: '尚未配置实时地图嵌入代码',
    ja: 'ライブマップ埋め込みコードは未設定です'
  },
  'Quản trị viên có thể dán mã nhúng Iframe hoặc URL Google Maps trong CMS để hiển thị bản đồ trực tiếp tại đây.': {
    en: 'Administrators can paste an Iframe embed code or Google Maps URL in CMS to display the interactive map here.',
    fr: 'Les administrateurs peuvent coller un code d’intégration Iframe ou une URL Google Maps dans le CMS pour afficher la carte interactive ici.',
    zh: '管理员可在后台CMS中粘贴Iframe嵌入代码或Google地图链接以在此处展示实时互动地图。',
    ja: '管理者はCMSでIframe埋め込みコードまたはGoogleマップURLを貼り付けることで、インタラクティブマップを直接表示できます。'
  },
  'Quản trị viên có thể dán mã nhúng Iframe hoặc URL Google Maps trong CMS để hiển thị bản đồ trực tiếp tại đây': {
    en: 'Administrators can paste an Iframe embed code or Google Maps URL in CMS to display the interactive map here.',
    fr: 'Les administrateurs peuvent coller un code d’intégration Iframe ou une URL Google Maps dans le CMS pour afficher la carte interactive ici.',
    zh: '管理员可在后台CMS中粘贴Iframe嵌入代码或Google地图链接以在此处展示实时互动地图。',
    ja: '管理者はCMSでIframe埋め込みコードまたはGoogleマップURLを貼り付けることで、インタラクティブマップを直接表示できます。'
  },
  'Quét mã QR tại tủ hiện vật': {
    en: 'Scan QR code at display cases',
    fr: 'Scanner le code QR sur les vitrines',
    zh: '在展品陈列柜扫描二维码',
    ja: '展示ケースのQRコードをスキャン'
  },
  'Mỗi tủ trưng bày đều trang bị mã QR để mở mô hình 3D xoay 360° và hồ sơ khảo cứu chi tiết ngay trên điện thoại.': {
    en: 'Each showcase is equipped with a QR code to open 360° rotating 3D models and detailed archaeological records directly on your smartphone.',
    fr: 'Chaque vitrine est dotée d’un code QR pour afficher le modèle 3D rotatif 360° et la notice scientifique détaillée directement sur smartphone.',
    zh: '每个展柜均配有二维码，可直接在手机上查看360°可旋转3D模型与详细文物考据档案。',
    ja: '各展示ケースにはQRコードが設置されており、スマートフォンで360°回転3Dモデルや詳細な学術記録を閲覧できます。'
  },
  'Thuyết minh Audio Guide song ngữ': {
    en: 'Bilingual Audio Guide narration',
    fr: 'Narration Audio Guide bilingue',
    zh: '双语语音导览解说',
    ja: '2言語対応の音声ガイド'
  },
  'Khách tham quan có thể nghe giọng đọc thuyết minh tự động bằng tiếng Việt hoặc tiếng Anh trực tiếp trên trình duyệt.': {
    en: 'Visitors can listen to automated narration in Vietnamese, English or other languages directly in their browser.',
    fr: 'Les visiteurs peuvent écouter la narration automatique directement dans leur navigateur.',
    zh: '参观游客可直接在浏览器中收听多种语言的自动语音讲解。',
    ja: '来館者はブラウザ上で直接、多言語の自動音声解説を聴取できます。'
  },
  'Bảo quản di sản & Hiện vật': {
    en: 'Heritage & artifact preservation',
    fr: 'Préservation du patrimoine & des objets',
    zh: '遗产与文物保护',
    ja: '文化財・遺産の保存管理'
  },
  'Vui lòng không chạm tay vào hiện vật, không sử dụng đèn flash khi chụp ảnh tại các gian trưng bày cổ vật nhạy cảm.': {
    en: 'Please do not touch artifacts and avoid using flash photography in sensitive antiquity galleries.',
    fr: 'Prière de ne pas toucher les objets et de ne pas utiliser le flash dans les salles abritant des antiquités fragiles.',
    zh: '请勿触摸展出文物，在敏感文物展厅内拍照请勿使用闪光灯。',
    ja: '展示品には触れず、デリケートな文化財の展示室ではフラッシュ撮影をご遠慮ください。'
  },
  'Trang phục & Văn minh tham quan': {
    en: 'Dress code & visitor etiquette',
    fr: 'Tenue vestimentaire & civisme',
    zh: '参观着装与礼仪规范',
    ja: '服装規定と見学マナー'
  },
  'Trang phục lịch sự, giữ trật tự chung trong không gian trưng bày. Trẻ em dưới 12 tuổi cần có người lớn đi kèm.': {
    en: 'Polite attire required. Maintain quiet in exhibition spaces. Children under 12 must be accompanied by an adult.',
    fr: 'Tenue correcte exigée. Merci de respecter le calme dans les galeries. Les enfants de moins de 12 ans doivent être accompagnés d’un adulte.',
    zh: '着装得体，请在展厅内保持安静。12岁以下儿童须由成年人陪同参观。',
    ja: '節度ある服装でお越しいただき、展示室内では静粛にお願いいたします。12歳未満のお子様には大人の同伴が必要です。'
  },
  'Di tích Kiến trúc Nghệ thuật Cấp Quốc gia': {
    en: 'National Architectural and Artistic Monument',
    fr: 'Monument Architectural et Artistique National',
    zh: '国家级建筑艺术遗迹',
    ja: '国家指定建築芸術記念建造物'
  },
  'Kiến Trúc & Không Gian': {
    en: 'Architecture & Heritage Space',
    fr: 'Architecture & Espace du Patrimoine',
    zh: '建筑与遗产空间',
    ja: '建築と遺産空間'
  },
  'Khám phá gian trưng bày': {
    en: 'Explore Exhibition Galleries',
    fr: 'Explorer les Galeries d’Exposition',
    zh: '探索主题展厅',
    ja: '展示室を探索する'
  },
  'Công trình kiến trúc Đông Dương đặc sắc giữa lòng thành phố, lưu giữ và số hóa các bộ sưu tập di sản phục vụ trải nghiệm tham quan trực quan đa chiều.': {
    en: 'A distinctive Indochinese architectural landmark in the heart of the city, preserving and digitizing heritage collections for immersive multimodal visitor experiences.',
    fr: 'Un joyau architectural indochinois au cœur de la ville, préservant et numérisant les collections patrimoniales pour une visite interactive immersive.',
    zh: '坐落于市中心的特色印度支那建筑杰作，悉心保存并数字化呈现各项珍贵文化遗产，为游客带来沉浸式多维参观体验。',
    ja: '市内中心部に佇むインドシナ建築の傑作。貴重な文化遺産を保存・デジタル化し、臨場感あふれる多角的な鑑賞体験を提供します。'
  },
  'Đón khách tham quan': {
    en: 'Open for Visitors',
    fr: 'Ouvert aux Visiteurs',
    zh: '开放接待游客',
    ja: '見学受付中'
  },
  'Kế Hoạch & Sơ Đồ': {
    en: 'Plan & Floor Map',
    fr: 'Plan & Carte de Visite',
    zh: '参观规划与平面图',
    ja: '見学プラン・フロア図'
  },
  'Cẩm Nang & Sơ Đồ Tham Quan Thực Địa': {
    en: 'Visitor Guide & On-Site Floor Plan',
    fr: 'Guide de Visite & Plan Réel du Musée',
    zh: '实地参观指南与展馆平面图',
    ja: '現地見学案内・フロア配置図'
  },
  'Khám phá sơ đồ không gian kiến trúc bảo tàng, định vị các cánh trưng bày và tra cứu thông tin thực tế cho hành trình chiêm ngưỡng di sản.': {
    en: 'Explore the museum architectural layout, locate exhibition wings, and look up practical information for your heritage journey.',
    fr: 'Découvrez le plan architectural du musée, localisez les ailes d’exposition et recherchez les informations pratiques pour votre parcours.',
    zh: '探索博物馆建筑空间平面图，定位各展览展翼并查阅实地参观实用信息。',
    ja: '博物館の建築空間図面を探索し、各展示ウィングの位置を確認して有意義な見学プランにお役立てください。'
  },
  'Sơ đồ mặt bằng số hóa': {
    en: 'Digitized Floor Plan',
    fr: 'Plan Numérisé',
    zh: '数字化平面图',
    ja: 'デジタルフロアマップ'
  },
  'Thuyết minh Audio Guide': {
    en: 'Audio Guide Narration',
    fr: 'Narration Audio Guide',
    zh: '语音导览解说',
    ja: '音声ガイド解説'
  },
  'Bảo Tàng Số • Di Sản Văn Hóa & Không Gian Tương Tác': {
    en: 'Digital Museum • Cultural Heritage & Interactive Spaces',
    fr: 'Musée Numérique • Patrimoine Culturel & Espaces Interactifs',
    zh: '数字博物馆 • 文化遗产与互动空间',
    ja: 'デジタルミュージアム • 文化遺産とインタラクティブ空間'
  },
  'Bắt Đầu Tour 360°': {
    en: 'Start 360° Tour',
    fr: 'Commencer la Visite 360°',
    zh: '开启360°全景漫游',
    ja: '360°ツアーを開始'
  },
  'Khám Phá Cổ Vật 3D': {
    en: 'Explore 3D Artifacts',
    fr: 'Explorer les Objets 3D',
    zh: '探索3D文物',
    ja: '3D文化財を探索'
  },
  'Khám phá dòng chảy lịch sử qua công nghệ thực tế ảo Tour 360° toàn cảnh và không gian chiêm ngưỡng bảo vật 3D sống động.': {
    en: 'Explore historical journeys through immersive 360° virtual tours and vibrant 3D artifact presentations.',
    fr: 'Explorez le cours de l’histoire à travers des visites virtuelles 360° immersives et des objets 3D interactifs.',
    zh: '通过360°全景虚拟漫游与生动3D文物鉴赏空间，探索历史长河的璀璨文明。',
    ja: '臨場感あふれる360°バーチャルツアーと躍動感ある3D文化財展示空間を通じて、歴史の息吹をご体感ください。'
  },
  'Số 2 Nguyễn Bỉnh Khiêm, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh': {
    en: 'No. 2 Nguyen Binh Khiem, Ben Nghe Ward, District 1, Ho Chi Minh City',
    fr: 'N° 2 Nguyen Binh Khiem, quartier Ben Nghe, district 1, Hô Chi Minh-Ville',
    zh: '胡志明市第1郡滨义坊阮秉谦路2号',
    ja: 'ホーチミン市1区ベンゲー街区グエン・ビン・キエム通り2番地'
  },
  'Số 2 Nguyễn Bỉnh Khiêm, Quận 1, TP.HCM': {
    en: 'No. 2 Nguyen Binh Khiem, District 1, Ho Chi Minh City',
    fr: 'N° 2 Nguyen Binh Khiem, district 1, Hô Chi Minh-Ville',
    zh: '胡志明市第1郡阮秉谦路2号',
    ja: 'ホーチミン市1区グエン・ビン・キエム通り2番地'
  },
  'Trang chủ': {
    en: 'Home',
    fr: 'Accueil',
    zh: '首页',
    ja: 'ホーム'
  },
  'Giới thiệu': {
    en: 'Introduction',
    fr: 'Introduction',
    zh: '简介',
    ja: 'ご紹介'
  },
  'Gian phòng 360°': {
    en: '360° Rooms',
    fr: 'Salles 360°',
    zh: '360°展厅',
    ja: '360°展示室'
  },
  'Cổ vật 3D': {
    en: '3D Artifacts',
    fr: 'Objets 3D',
    zh: '3D文物',
    ja: '3D文化財'
  },
  'Cổ vật & Hiện vật di sản': {
    en: 'Antiquities & Heritage Artifacts',
    fr: 'Antiquités & Objets du Patrimoine',
    zh: '古物与遗产文物',
    ja: '古代遺物・遺産文化財'
  },
  'Gian phòng trưng bày 360°': {
    en: '360° Virtual Exhibition Rooms',
    fr: 'Salles d’Exposition Virtuelle 360°',
    zh: '360°全景虚拟展厅',
    ja: '360°バーチャル展示室'
  },
  'Cẩm Nang & Sơ Đồ Tham Quan': {
    en: 'Visitor Guide & Museum Floor Plan',
    fr: 'Guide de Visite & Plan du Musée',
    zh: '参观指南与展馆平面图',
    ja: '見学案内・フロアマップ'
  },
  'Cẩm nang tham quan': {
    en: 'Visitor Guide',
    fr: 'Guide de Visite',
    zh: '参观指南',
    ja: '見学案内'
  },
  'Khám phá các hiện vật lịch sử và cổ vật được số hóa 3D.': {
    en: 'Explore historical artifacts and antiquities digitized in 3D.',
    fr: 'Explorez les objets historiques et les antiquités numérisés en 3D.',
    zh: '探索通过3D数字化呈现的历史文物与古代器具。',
    ja: '3Dデジタル化された歴史的遺物や古代の品々を鑑賞。'
  },
  'Tìm kiếm cổ vật, chất liệu, niên đại...': {
    en: 'Search artifacts, materials, periods...',
    fr: 'Rechercher des objets, matériaux, périodes...',
    zh: '按文物名称、材质、年代搜索...',
    ja: '遺物、材質、年代で検索...'
  },
  'Có mô hình 3D xoay': {
    en: 'Rotating 3D Model',
    fr: 'Modèle 3D interactif',
    zh: '配有3D旋转模型',
    ja: '3D回転モデルあり'
  },
  'Không tìm thấy cổ vật phù hợp với điều kiện tìm kiếm.': {
    en: 'No artifacts found matching the search criteria.',
    fr: 'Aucun objet correspondant aux critères de recherche.',
    zh: '未找到符合搜索条件的文物。',
    ja: '検索条件に一致する遺物が見つかりませんでした。'
  },
  'Vào tham quan 360°': {
    en: 'Enter 360° Tour',
    fr: 'Entrer dans la visite 360°',
    zh: '进入360°全景漫游',
    ja: '360°見学に入る'
  },
  '360° Sẵn sàng': {
    en: '360° Ready',
    fr: '360° Prêt',
    zh: '360°全景就绪',
    ja: '360°準備完了'
  },
  'Đang cập nhật': {
    en: 'Updating',
    fr: 'En mise à jour',
    zh: '更新中',
    ja: '更新中'
  },
  'Lọc theo thời kỳ & không gian': {
    en: 'Filter by period & gallery',
    fr: 'Filtrer par période & salle',
    zh: '按历史时期与空间筛选',
    ja: '時代・空間で絞り込み'
  },
  'Xóa lọc': {
    en: 'Clear filter',
    fr: 'Effacer le filtre',
    zh: '清除筛选',
    ja: '解除'
  },
  'Tất cả thời kỳ': {
    en: 'All periods',
    fr: 'Toutes les périodes',
    zh: '所有时期',
    ja: 'すべての時代'
  },
  'Chưa có ảnh 360°': {
    en: 'No 360° image available',
    fr: 'Aucune image 360° disponible',
    zh: '暂无360°全景图',
    ja: '360°画像未登録'
  },
  'điểm chú thích': {
    en: 'hotspots',
    fr: 'points d’intérêt',
    zh: '处交互注释点',
    ja: 'か所の注釈ポイント'
  },
  'Phóng to sơ đồ': {
    en: 'Zoom in map',
    fr: 'Agrandir le plan',
    zh: '放大平面图',
    ja: 'マップを拡大'
  },
  'Thông Tin Cần Biết Khi Đến Tham Quan': {
    en: 'Essential Visitor Information',
    fr: 'Informations Pratiques Essentielles',
    zh: '参观须知要点',
    ja: '見学に必要な基本情報'
  },
  'Giờ Mở Cửa': {
    en: 'Opening Hours',
    fr: 'Horaires d’Ouverture',
    zh: '开放时间',
    ja: '開館時間'
  },
  'Giá Vé Niêm Yết': {
    en: 'Admission Fares',
    fr: 'Tarifs des Billets',
    zh: '门票价格',
    ja: '観覧料金'
  },
  'Người lớn': {
    en: 'Adult',
    fr: 'Adulte',
    zh: '成人',
    ja: '一般・大人'
  },
  'Học sinh, Sinh viên': {
    en: 'Students & Pupils',
    fr: 'Étudiants & Écoliers',
    zh: '大中小学生',
    ja: '生徒・学生'
  },
  'Trẻ em < 6 tuổi, Người cao tuổi': {
    en: 'Children < 6 years, Seniors',
    fr: 'Enfants < 6 ans, Personnes âgées',
    zh: '6岁以下儿童及长者',
    ja: '6歳未満の小児・高齢者'
  },
  'Miễn phí': {
    en: 'Free',
    fr: 'Gratuit',
    zh: '免费',
    ja: '無料'
  },
  'Vị Trí & Bản Đồ Chỉ Đường': {
    en: 'Location & Directions',
    fr: 'Localisation & Itinéraires',
    zh: '地理位置与路线指引',
    ja: '所在地・道案内マップ'
  },
  'Tiện Ích & Quy Định Tham Quan': {
    en: 'Amenities & Visitor Regulations',
    fr: 'Services & Règles de Visite',
    zh: '馆内便利设施与参观守则',
    ja: '館内設備と見学規則'
  },
  'Mở chỉ đường trên ứng dụng Google Maps': {
    en: 'Open directions in Google Maps',
    fr: 'Ouvrir l’itinéraire dans Google Maps',
    zh: '在Google地图应用中打开导航',
    ja: 'Googleマップで道案内を開く'
  },
  'Tham quan': {
    en: 'Visit',
    fr: 'Visite',
    zh: '参观指南',
    ja: '見学案内'
  },
  'Quét QR': {
    en: 'Scan QR',
    fr: 'Scanner QR',
    zh: '扫码',
    ja: 'QRスキャン'
  },
  'Quét Mã QR Bằng Camera': {
    en: 'Scan QR Code with Camera',
    fr: "Scanner le code QR à l'aide de l'appareil photo",
    zh: '使用相机扫描二维码',
    ja: 'カメラでQRコードをスキャン'
  },
  'Quét Mã QR': {
    en: 'Scan QR Code',
    fr: 'Scanner le code QR',
    zh: '扫描二维码',
    ja: 'QRコードをスキャン'
  },
  'Ngôn ngữ:': {
    en: 'Language:',
    fr: 'Langue :',
    zh: '语言:',
    ja: '言語:'
  },
  'Ngôn ngữ': {
    en: 'Language',
    fr: 'Langue',
    zh: '语言',
    ja: '言語'
  },
  'Ban Quản trị Bảo tàng Lịch sử TP.HCM': {
    en: 'Board of Management - HCMC History Museum',
    fr: "Conseil d'administration du Musée d'histoire de Hô Chi Minh-Ville",
    zh: '胡志明市历史博物馆管理委员会',
    ja: 'ホーチミン市歴史博物館管理委員会'
  },
  'Ban Quản trị Bảo tàng Lịch sử TP. Hồ Chí Minh': {
    en: 'Board of Management - HCMC History Museum',
    fr: "Conseil d'administration du Musée d'histoire de Hô Chi Minh-Ville",
    zh: '胡志明市历史博物馆管理委员会',
    ja: 'ホーチミン市歴史博物館管理委员会'
  },
  'Quản trị viên hệ thống': {
    en: 'System Administrator',
    fr: 'Administrateur du système',
    zh: '系统管理员',
    ja: 'システム管理者'
  },
  'Đăng xuất tài khoản': {
    en: 'Log out',
    fr: 'Déconnecter-vous de votre compte',
    zh: '退出账号',
    ja: 'ログアウト'
  },
  'Đăng nhập': {
    en: 'Log in',
    fr: 'Connexion',
    zh: '登录',
    ja: 'ログイン'
  },
  'Chiêm Ngưỡng Cổ Vật 3D': {
    en: 'Explore 3D Artifacts',
    fr: 'Découvrir les objets 3D',
    zh: '鉴赏3D文物',
    ja: '3D文化財を鑑賞'
  },
  'GIAN PHÒNG 360°': {
    en: '360° ROOMS',
    fr: 'SALLES 360°',
    zh: '360°展厅',
    ja: '360°展示室'
  },
  'CỔ VẬT 3D': {
    en: '3D ARTIFACTS',
    fr: 'OBJETS 3D',
    zh: '3D文物',
    ja: '3D文化財'
  },
  'NGÔN NGỮ THUYẾT MINH': {
    en: 'AUDIO LANGUAGES',
    fr: 'LANGUES DE NARRATION',
    zh: '解说语言',
    ja: '解説言語'
  },
  'KHÔNG GIAN THỰC TẾ ẢO': {
    en: 'VIRTUAL REALITY SPACE',
    fr: 'ESPACE DE RÉALITÉ VIRTUELLE',
    zh: '虚拟现实空间',
    ja: 'バーチャルリアリティ空間'
  },
  'Hệ thống phòng tham quan 360°': {
    en: '360° Virtual Tour Rooms System',
    fr: 'Système de salles de visite à 360°',
    zh: '360°全景展厅系统',
    ja: '360°バーチャル見学展示室システム'
  },
  'Phòng 360° chưa được thêm': {
    en: 'No 360° Room Added Yet',
    fr: "La salle 360° n'a pas été ajoutée",
    zh: '暂未添加360°展厅',
    ja: '360°展示室はまだ追加されていません'
  },
  'Các không gian triển lãm sẽ sớm được cập nhật': {
    en: 'Exhibition spaces will be updated soon',
    fr: "Les espaces d'exposition seront bientôt mis à jour",
    zh: '展览空间即将更新',
    ja: '展示空間はまもなく更新されます'
  },
  'Khám phá tất cả các phòng 360°': {
    en: 'Explore All 360° Rooms',
    fr: 'Explorer toutes les salles à 360°',
    zh: '探索全部360°展厅',
    ja: 'すべての360°展示室を見る'
  },
  'Mới cập nhật': {
    en: 'Recently Updated',
    fr: 'Mis à jour récemment',
    zh: '最新更新',
    ja: '最近の更新'
  },
  'Thuyết minh đa ngôn ngữ': {
    en: 'Multilingual Narration',
    fr: 'Narration multilingue',
    zh: '多语言解说',
    ja: '多言語ナレーション'
  },
  'Chuyển phòng đa hướng': {
    en: 'Multi-directional Navigation',
    fr: 'Transition multidirectionnelle',
    zh: '多向展厅切换',
    ja: '多方向ルート移動'
  },
  'Không gian trưng bày': {
    en: 'Exhibition spaces',
    fr: "Espaces d'exposition",
    zh: '展览空间',
    ja: '展示空間'
  },
  'Hiện vật số hóa': {
    en: 'Digitized artifacts',
    fr: 'Objets numérisés',
    zh: '数字化文物',
    ja: 'デジタル化文化財'
  },
  'Quốc gia & vùng lãnh thổ': {
    en: 'Countries & territories',
    fr: 'Pays & territoires',
    zh: '国家与地区',
    ja: '国・地域'
  },
  'Lịch Sử & Kiến Trúc Bảo Tàng': {
    en: 'Museum History & Architecture',
    fr: 'Histoire & Architecture du Musée',
    zh: '博物馆历史与建筑',
    ja: '博物館の歴史と建築'
  },
  'Gần Một Thế Kỷ Gìn Giữ & Tôn Vinh Di Sản Dân Tộc': {
    en: 'Nearly a Century of Preserving & Honoring National Heritage',
    fr: 'Près d’un siècle de préservation et de valorisation du patrimoine national',
    zh: '近一个世纪守护与弘扬民族遗产',
    ja: '一世紀近くにわたり民族の遺産を守り継ぐ'
  },
  'Bảo Tàng Lịch Sử TP. Hồ Chí Minh': {
    en: 'Museum of History in Ho Chi Minh City',
    fr: "Musée d'Histoire de Hô Chi Minh-Ville",
    zh: '胡志明市历史博物馆',
    ja: 'ホーチミン市歴史博物館'
  },
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
  'TP. HỒ CHÍ MINH': {
    en: 'HO CHI MINH CITY',
    fr: 'HÔ CHI MINH-VILLE',
    zh: '胡志明市',
    ja: 'ホーチミン市'
  },
  'Khám phá dòng chảy lịch sử qua công nghệ thực tế ảo Tour 360° toàn cảnh và không gian chiêm ngưỡng bảo vật 3D sống động': {
    en: 'Discover the flow of history through 360° panoramic VR technology and a vibrant 3D heritage viewing space.',
    fr: "Découvrez le fil de l'histoire grâce à la technologie de visite virtuelle 360° et à l'espace vivant des trésors en 3D.",
    zh: '通过360°全景虚拟现实技术与生动的3D文物空间，探索悠久的历史长河。',
    ja: '360°パノラマVR技術と臨場感あふれる3D文化財空間を通じて、歴史の流れを体験してください。'
  },
  'Khám phá toàn diện từng không gian trưng bày qua ảnh toàn cảnh 360° độ nét cao. Du khách có thể di chuyển giữa các phòng, tương tác với các điểm neo chú thích cổ vật và lắng nghe thuyết minh lịch sử.': {
    en: 'Fully explore each exhibition hall through high-definition 360° panoramas. Visitors can move between rooms, interact with artifact hotspots, and listen to historical audio narrations.',
    fr: "Explorez l'intégralité des espaces d'exposition à travers des panoramas nets à 360°. Les visiteurs peuvent se déplacer dans les pièces, interagir với les annotations des artefacts et écouter des explications historiques.",
    zh: '通过高清晰度360°全景图像全面探索每个展厅。参观者可以在展厅之间穿梭，与文物注释热点互动，并聆听历史解说。',
    ja: '高精細な360°パノラマ写真を通じて各展示室を余すところなく探索できます。部屋間を移動し、文化財の解説スポットを操作して歴史ナレーションを聴くことができます。'
  },
  'Khám phá toàn diện từng không gian trưng bày qua ảnh toàn cảnh 360° độ nét cao. Du khách có thể di chuyển giữa các phòng, tương tác với các điểm neo chú thích cổ vật và lắng nghe thuyết minh lịch sử': {
    en: 'Fully explore each exhibition hall through high-definition 360° panoramas. Visitors can move between rooms, interact with artifact hotspots, and listen to historical audio narrations.',
    fr: "Explorez l'intégralité des espaces d'exposition à travers des panoramas nets à 360°. Les visiteurs peuvent se déplacer dans les pièces, interagir với les annotations des artefacts et écouter des explications historiques.",
    zh: '通过高清晰度360°全景图像全面探索每个展厅。参观者可以在展厅之间穿梭，与文物注释热点互动，并聆听历史解说。',
    ja: '高精細な360°パノラマ写真を通じて各展示室を余すところなく探索できます。部屋間を移動し、文化財の解説スポットを操作して歴史ナレーションを聴くことができます。'
  },
  'Kiến Trúc Đông Dương Cổ Điển': {
    en: 'Classic Indochine Architecture',
    fr: 'Architecture indochinoise classique',
    zh: '经典印度支那建筑',
    ja: '伝統的なインドシナ建築'
  },
  'Kho Tàng Cổ Vật & Bảo Vật Quốc Gia': {
    en: 'Treasury of Antiquities & National Treasures',
    fr: "Trésor d'antiquités & trésors nationaux",
    zh: '古物宝库与国家宝藏',
    ja: '古美術・国宝の宝庫'
  },
  'Không Gian Tour 360° Thực Tế Ảo': {
    en: '360° Virtual Reality Tour Space',
    fr: 'Espace de visite virtuelle 360°',
    zh: '360°虚拟现实漫游空间',
    ja: '360°バーチャルリアリティツアー空間'
  },
  'Công trình di sản gần 100 năm tuổi với tháp bát giác tráng lệ và các vòm cửa hoa văn Á Đông độc đáo.': {
    en: 'Nearly 100-year-old heritage monument featuring a magnificent octagonal tower and unique East Asian arched motifs.',
    fr: 'Édifice patrimonial centenaire avec sa tour octogonale majestueuse et ses arcades aux motifs orientaux.',
    zh: '拥有近百年历史的文化遗迹，建有雄伟的八角塔和独具东方特色的拱形雕饰。',
    ja: '荘厳な八角塔と独自の東洋風アーチ模様が特徴的な、築100年近い遺産建築。'
  },
  'Lưu giữ nhiều bảo vật quốc gia độc bản, văn hóa Champa, Óc Eo và di sản mỹ thuật cung đình triều Nguyễn.': {
    en: 'Preserving numerous unique national treasures, Champa, Oc Eo cultures, and Nguyen Dynasty imperial court arts.',
    fr: "Conserve de nombreux trésors nationaux uniques, les cultures Champa, Oc Eo et l'art royal de la dynastie des Nguyen.",
    zh: '馆藏众多独具特色的国家宝藏，包括占婆、奥高文化及阮朝宫廷艺术遗产。',
    ja: 'ベトナム国宝、チャンパ、オケオ文化、阮朝宮廷美術の貴重な遺産を多数所蔵。'
  },
  'Khám phá toàn diện từng gian phòng triển lãm với ảnh toàn cảnh độ nét cao và điểm neo hiện vật tương tác.': {
    en: 'Fully explore each exhibition room with high-definition panoramas and interactive artifact hotspots.',
    fr: "Explorez chaque salle d'exposition grâce à des panoramas haute définition et des points d'interaction avec les artefacts.",
    zh: '通过高清晰度全景与交互式文物热点全面探索每个展厅。',
    ja: '高解像度パノラマと文化財インタラクティブスポットで各展示室を探索。'
  },
  'Chưa có hiện vật nào phù hợp': {
    en: 'No matching artifacts found',
    fr: 'Aucun objet correspondant trouvé',
    zh: '未找到匹配的文物',
    ja: '一致する遺物は見つかりませんでした'
  },
  'Hệ thống chưa ghi nhận cổ vật phù hợp với bộ lọc hiện tại. Bạn có thể thêm hồ sơ hiện vật mới hoặc điều chỉnh tiêu chí tìm kiếm.': {
    en: 'The system has not recorded any relics matching the current filter. You can add a new artifact profile or adjust your search criteria.',
    fr: "Le système n'a trouvé aucun objet correspondant au filtre actuel. Vous pouvez ajouter un nouvel objet ou ajuster vos critères de recherche.",
    zh: '系统未找到符合当前筛选条件的文物。您可以添加新文物或调整搜索条件。',
    ja: '現在のフィルターに一致する遺物は記録されていません。新しい遺物を登録するか、検索条件を調整してください。'
  },
  'Tìm theo tên hiện vật, mã HV-..., niên đại...': {
    en: 'Search by artifact name, code HV-..., period...',
    fr: "Rechercher par nom d'objet, code HV-..., période...",
    zh: '按文物名称、编号 HV-...、年代搜索...',
    ja: '遺物名、コード HV-...、年代で検索...'
  },
  'Hồ sơ Cổ vật': {
    en: 'Artifact Records',
    fr: 'Dossiers des Objets',
    zh: '文物档案',
    ja: '遺物記録'
  },
  'Số hóa 3D Không gian': {
    en: '3D Space Digitization',
    fr: 'Numérisation 3D de l\'Espace',
    zh: '3D空间数字化',
    ja: '3D空間デジタル化'
  },
  'Đăng ký sổ bảo tồn di sản': {
    en: 'Registered in conservation catalog',
    fr: 'Inscrit au registre de conservation',
    zh: '已录入遗产保护名录',
    ja: '遺産保護台帳に登録済み'
  },
  'Sẵn sàng đĩa xoay 360°': {
    en: 'Ready for 360° turntable',
    fr: 'Prêt pour plateau tournant 360°',
    zh: '已就绪360°旋转台',
    ja: '360°回転表示対応'
  },
  'Đồng bộ giọng đọc bản xứ': {
    en: 'Synchronized native voice audio',
    fr: 'Voix native synchronisée',
    zh: '同步母语解说语音',
    ja: 'ネイティブ音声と同期'
  },
  'Sẵn sàng in thẻ trưng bày': {
    en: 'Ready to print display cards',
    fr: 'Prêt à imprimer les fiches d\'exposition',
    zh: '就绪打印展位标牌',
    ja: '展示スタンドカード印刷対応'
  },
  'Danh Mục Hiện Vật': {
    en: 'Artifact Catalog',
    fr: 'Catalogue des Objets',
    zh: '文物名录',
    ja: '遺物カタログ'
  },
  'Tất cả danh mục': {
    en: 'All categories',
    fr: 'Toutes les catégories',
    zh: '所有分类',
    ja: 'すべてのカテゴリー'
  },
  'Tất cả trạng thái 3D': {
    en: 'All 3D statuses',
    fr: 'Tous les statuts 3D',
    zh: '所有3D状态',
    ja: 'すべての3D状態'
  },
  'Đã có mô hình 3D': {
    en: '3D model ready',
    fr: 'Modèle 3D disponible',
    zh: '已有3D模型',
    ja: '3Dモデル準備完了'
  },
  'Đang dựng 3D': {
    en: 'Generating 3D',
    fr: 'Génération 3D en cours',
    zh: '正在生成3D',
    ja: '3D生成中'
  },
  'Đang dựng 3D...': {
    en: 'Generating 3D...',
    fr: 'Génération 3D en cours...',
    zh: '正在生成3D...',
    ja: '3D生成中...'
  },
  'Chưa có 3D': {
    en: 'No 3D yet',
    fr: 'Pas de modèle 3D',
    zh: '暂无3D模型',
    ja: '3Dモデル未作成'
  },
  '3D Sẵn sàng': {
    en: '3D Ready',
    fr: '3D Prêt',
    zh: '3D 已就绪',
    ja: '3D 準備完了'
  },
  'Ảnh 2D': {
    en: '2D Photo',
    fr: 'Photo 2D',
    zh: '2D 照片',
    ja: '2D 写真'
  },
  'Thêm hiện vật mới': {
    en: 'Add new artifact',
    fr: 'Ajouter un objet',
    zh: '添加新文物',
    ja: '新規遺物を追加'
  },
  'Xem 3D đĩa xoay 360°': {
    en: 'View 3D 360° turntable',
    fr: 'Voir 3D plateau tournant 360°',
    zh: '查看3D 360°旋转视图',
    ja: '360°ターンテーブル3D表示'
  },
  'Thẻ Standee QR': {
    en: 'Standee QR Card',
    fr: 'Fiche Standee QR',
    zh: '立牌QR码卡',
    ja: 'スタンドQRカード'
  },
  'Chỉnh sửa': {
    en: 'Edit',
    fr: 'Modifier',
    zh: '编辑',
    ja: '編集'
  },
  'Thêm voice': {
    en: 'Add voice',
    fr: 'Ajouter voix',
    zh: '添加语音',
    ja: '音声追加'
  },
  'Hình ảnh': {
    en: 'Image',
    fr: 'Image',
    zh: '图像',
    ja: '画像'
  },
  'Tên hiện vật & Xuất xứ': {
    en: 'Artifact Name & Origin',
    fr: 'Nom de l\'Objet & Origine',
    zh: '文物名称与出土地',
    ja: '遺物名＆出土地'
  },
  'Niên đại & Chuyên đề': {
    en: 'Period & Category',
    fr: 'Période & Thème',
    zh: '年代与主题',
    ja: '年代＆展示テーマ'
  },
  'Trạng thái 3D': {
    en: '3D Status',
    fr: 'Statut 3D',
    zh: '3D 状态',
    ja: '3D ステータス'
  },
  'Thuyết minh AI': {
    en: 'AI Narration',
    fr: 'Narration IA',
    zh: 'AI 语音解说',
    ja: 'AI 音声解説'
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
  'Bảng Điều Khiển': {
    en: 'Dashboard',
    fr: 'Tableau de bord',
    zh: '仪表盘',
    ja: 'ダッシュボード'
  },
  'Gian trưng bày & Tour 360': {
    en: 'Exhibition Rooms & 360 Tour',
    fr: 'Galeries & Visite 360°',
    zh: '展厅与360°漫游',
    ja: '展示室＆360°ツアー'
  },
  'Tạo ảnh toàn cảnh 360°': {
    en: 'Create 360° Panorama',
    fr: 'Créer Panorama 360°',
    zh: '创建360°全景',
    ja: '360°パノラマ画像生成'
  },
  'Hiện vật & Cổ vật di sản': {
    en: 'Artifacts & Heritage Relics',
    fr: 'Objets & Reliques du patrimoine',
    zh: '文物与历史遗存',
    ja: '遺物・歴史的文化財'
  },
  'Quản trị Ngôn ngữ & Voice AI': {
    en: 'Language & Voice AI Management',
    fr: 'Gestion Langues & Voix IA',
    zh: '语言与语音AI管理',
    ja: '言語＆AI音声管理'
  },
  'Báo cáo & Thống kê': {
    en: 'Reports & Statistics',
    fr: 'Rapports & Statistiques',
    zh: '数据报告与统计',
    ja: 'レポート・アクセス統計'
  },
  'Cấu hình hệ thống': {
    en: 'System Configuration',
    fr: 'Configuration du système',
    zh: '系统全局配置',
    ja: 'システム環境設定'
  },
  'Hiện vật & Điểm nghiên cứu': {
    en: 'Artifacts & Research Sites',
    fr: 'Objets & Sites de recherche',
    zh: '文物与研究点',
    ja: '遺物＆調査スポット'
  },
  'Tư liệu Di sản': {
    en: 'Heritage Description',
    fr: 'Description du patrimoine',
    zh: '历史文献・解说',
    ja: '歴史文献・解説'
  },
  'Tương tác thực địa': {
    en: 'Field Interaction',
    fr: 'Interaction sur le terrain',
    zh: '实地交互',
    ja: '実地アクセス統計'
  },
  'Đã số hóa 100%': {
    en: 'Digitized 100%',
    fr: 'Numérisé 100%',
    zh: '数字化率 100%',
    ja: 'デジタル化率 100%'
  },
  'Sẵn sàng đón khách tham quan': {
    en: 'Ready to welcome guests',
    fr: 'Prêt à accueillir les visiteurs',
    zh: '准备好迎接游客',
    ja: '見学者の受け入れ準備完了'
  },
  'Tọa độ liên tục & dẫn đường tour 360°': {
    en: 'Location tracking and 360-degree tour guidance',
    fr: 'Localisation continue et visite guidée 360°',
    zh: '持续定位与360°空间导航',
    ja: '位置追跡と360°空間ガイド'
  },
  'Khảo cứu lịch sử & Giọng đọc bản địa': {
    en: 'Historical research and native voice narration',
    fr: 'Recherche historique et narration vocale native',
    zh: '历史考据与母语原声解说',
    ja: '史料編纂とネイティブ音声ガイド'
  },
  'Khách tham quan quét mã QR tại các gian phòng': {
    en: 'Visitors scan QR codes at exhibition booths',
    fr: 'Les visiteurs scannent les codes QR dans les salles',
    zh: '游客在各个展厅展台扫码',
    ja: '来館者が展示ブースでQRコードをスキャン'
  },
  'không gian': {
    en: 'spaces',
    fr: 'espaces',
    zh: '个空间',
    ja: '室の空間'
  },
  'tọa độ di sản': {
    en: 'heritage coordinates',
    fr: 'coordonnées du patrimoine',
    zh: '处遗产坐标',
    ja: '箇所の遺産座標'
  },
  'chuyên khảo': {
    en: 'monograph',
    fr: 'monographie',
    zh: '篇文献',
    ja: '冊の解説'
  },
  'lượt quét': {
    en: 'scans',
    fr: 'scans',
    zh: '次扫码',
    ja: '回スキャン'
  },
  'góc 360°': {
    en: '360° views',
    fr: 'angles 360°',
    zh: '个360°视角',
    ja: '箇所の360°視点'
  },
  'gian phòng': {
    en: 'rooms',
    fr: 'salles',
    zh: '个展厅',
    ja: '室'
  },
  'mục': {
    en: 'items',
    fr: 'éléments',
    zh: '项',
    ja: '件'
  },
  'Kho Không Gian 360° Đã Ghép': {
    en: '360° Space Storage',
    fr: 'Stockage 360°',
    zh: '360°空间库',
    ja: '360°空間ストレージ'
  },
  'Xuất gói QR Standee': {
    en: 'Export QR Standee packages',
    fr: 'Exporter QR Standee',
    zh: '导出QR展架包',
    ja: 'QRコードパネルを出力'
  },
  'Thêm gian phòng mới': {
    en: 'Add a new room',
    fr: 'Ajouter une salle',
    zh: '添加新展厅',
    ja: '新規展示室を追加'
  },
  'Thêm gian phòng trưng bày mới': {
    en: 'Add New Exhibition Room',
    fr: 'Ajouter une nouvelle salle d’exposition',
    zh: '添加新展厅',
    ja: '新規展示室を追加'
  },
  'Xoay xem 360°': {
    en: 'Rotate to view 360°',
    fr: 'Faire pivoter à 360°',
    zh: '旋转浏览 360°',
    ja: '360度回転して見る'
  },
  'Quản lý chuyên đề': {
    en: 'Manage themes',
    fr: 'Gérer les thèmes',
    zh: '管理专题',
    ja: 'テーマ管理'
  },
  'Làm mới': {
    en: 'Refresh',
    fr: 'Actualiser',
    zh: '刷新',
    ja: '更新'
  },
  'Đang đồng bộ...': {
    en: 'Syncing...',
    fr: 'Synchronisation...',
    zh: '同步中...',
    ja: '同期中...'
  },
  'Lưới': {
    en: 'Grid',
    fr: 'Grille',
    zh: '网格',
    ja: 'グリッド'
  },
  'Bảng': {
    en: 'Table',
    fr: 'Tableau',
    zh: '列表',
    ja: 'リスト'
  },
  'Biên tập 360': {
    en: '360 Studio',
    fr: 'Studio 360',
    zh: '360空间编辑',
    ja: '360°編集スタジオ'
  },
  'Biên tập': {
    en: 'Studio',
    fr: 'Studio',
    zh: '编辑',
    ja: '編集'
  },
  'Thuyết minh': {
    en: 'Narration',
    fr: 'Narration',
    zh: '解说',
    ja: '解説'
  },
  'Mã QR': {
    en: 'QR Code',
    fr: 'Code QR',
    zh: '二维码',
    ja: 'QRコード'
  },
  'Sửa': {
    en: 'Edit',
    fr: 'Modifier',
    zh: '编辑',
    ja: '編集'
  },
  'Xóa': {
    en: 'Delete',
    fr: 'Supprimer',
    zh: '删除',
    ja: '削除'
  },
  'Đã có thuyết minh': {
    en: 'Audio enabled',
    fr: 'Audio activé',
    zh: '已启用解说',
    ja: '解説あり'
  },
  'Đã bật thuyết minh': {
    en: 'Audio enabled',
    fr: 'Audio activé',
    zh: '已启用解说',
    ja: '解説あり'
  },
  'Chưa cấu hình': {
    en: 'Not yet configured',
    fr: 'Non configuré',
    zh: '尚未配置',
    ja: '未設定'
  },
  'Tất cả chuyên đề trưng bày': {
    en: 'All exhibition themes',
    fr: 'Tous les thèmes',
    zh: '所有展览专题',
    ja: 'すべてのテーマ'
  },
  'Tất cả trạng thái': {
    en: 'All states',
    fr: 'Tous les statuts',
    zh: '所有状态',
    ja: 'すべてのステータス'
  },
  'Đang hoạt động': {
    en: 'Active',
    fr: 'Actif',
    zh: '公开中',
    ja: '公開中'
  },
  'Tạm ẩn': {
    en: 'Hidden',
    fr: 'Masqué',
    zh: '已隐藏',
    ja: '非表示'
  },
  'Đã bật AI Voice': {
    en: 'AI Voice Enabled',
    fr: 'Voix IA activée',
    zh: '已启用AI语音',
    ja: 'AI音声有効'
  },
  'Chưa cấu hình AI': {
    en: 'AI Not Configured',
    fr: 'IA non configurée',
    zh: '未配置AI',
    ja: 'AI未設定'
  },
  'Mã QR Tham Quan': {
    en: 'Tour QR Code',
    fr: 'Code QR de visite',
    zh: '全景导览二维码',
    ja: '見学用QRコード'
  },
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
  'Sao chép': {
    en: 'Copy',
    fr: 'Copier',
    zh: '复制',
    ja: 'コピー'
  },
  'Sao chép link': {
    en: 'Copy link',
    fr: 'Copier le lien',
    zh: '复制链接',
    ja: 'リンクをコピー'
  },
  'Đã chép': {
    en: 'Copied',
    fr: 'Copié',
    zh: '已复制',
    ja: 'コピー完了'
  },
  'In Standee': {
    en: 'Print Standee',
    fr: 'Imprimer Standee',
    zh: '打印展架',
    ja: 'パネルを印刷'
  },
  'Vào phòng 360°': {
    en: 'Enter 360° Room',
    fr: 'Entrer dans la salle 360°',
    zh: '进入360°展厅',
    ja: '360°展示室へ入る'
  },
  'Đóng': {
    en: 'Close',
    fr: 'Fermer',
    zh: '关闭',
    ja: '閉じる'
  },
  'Đã sao chép liên kết tham quan': {
    en: 'Copied tour link to clipboard',
    fr: 'Lien de visite copié',
    zh: '已复制漫游链接',
    ja: '見学リンクをコピーしました'
  },
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
  'Xóa ảnh': {
    en: 'Clear photos',
    fr: 'Effacer photos',
    zh: '清空图片',
    ja: '画像を削除'
  },
  'Chụp camera': {
    en: 'Camera Capture',
    fr: 'Prendre photo',
    zh: '拍摄相机',
    ja: 'カメラ撮影'
  },
  'Chụp bằng webcam': {
    en: 'Webcam Capture',
    fr: 'Prendre par webcam',
    zh: '摄像头拍摄',
    ja: 'Webカメラで撮影'
  },
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
  'Xem hướng dẫn chụp': {
    en: 'View shooting guide',
    fr: 'Voir le guide',
    zh: '查看拍摄指南',
    ja: '撮影ガイドを見る'
  },
  'Thư viện không gian 360° đã tạo': {
    en: 'Created 360° Space Library',
    fr: 'Bibliothèque des espaces 360° créés',
    zh: '已创建的360°空间库',
    ja: '生成済み360°空間ライブラリ'
  },
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
  'Hiển thị': {
    en: 'Showing',
    fr: 'Affichage de',
    zh: '显示',
    ja: '表示中'
  },
  'trên tổng số': {
    en: 'of',
    fr: 'sur un total de',
    zh: '共计',
    ja: '全'
  },
  'Mỗi trang:': {
    en: 'Per page:',
    fr: 'Par page :',
    zh: '每页显示：',
    ja: '表示件数：'
  },
  '/ trang': {
    en: '/ page',
    fr: '/ page',
    zh: '/ 页',
    ja: '/ ページ'
  },
  'Trước': {
    en: 'Previous',
    fr: 'Précédent',
    zh: '上一页',
    ja: '前へ'
  },
  'Sau': {
    en: 'Next',
    fr: 'Suivant',
    zh: '下一页',
    ja: '次へ'
  },
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
  'CỜ & ISO': {
    en: 'FLAG & ISO',
    fr: 'DRAPEAU & ISO',
    zh: '国旗与ISO',
    ja: '国旗＆ISO'
  },
  'Cờ & ISO': {
    en: 'Flag & ISO',
    fr: 'Drapeau & ISO',
    zh: '国旗与ISO',
    ja: '国旗＆ISO'
  },
  'NGÔN NGỮ BẢN XỨ': {
    en: 'NATIVE LANGUAGE',
    fr: 'LANGUE NATIVE',
    zh: '本国原生语言',
    ja: '母国語表記'
  },
  'Ngôn ngữ bản xứ': {
    en: 'Native Language',
    fr: 'Langue native',
    zh: '本国原生语言',
    ja: '母国語表記'
  },
  'CẤU HÌNH GIỌNG ĐỌC AI': {
    en: 'AI VOICE CONFIGURATION',
    fr: 'CONFIGURATION VOIX IA',
    zh: 'AI语音配置',
    ja: 'AI音声設定'
  },
  'Cấu hình Giọng đọc AI': {
    en: 'AI Voice Configuration',
    fr: 'Configuration Voix IA',
    zh: 'AI语音配置',
    ja: 'AI音声設定'
  },
  'TRỰC TUYẾN (CLIENT)': {
    en: 'ONLINE (CLIENT)',
    fr: 'EN LIGNE (CLIENT)',
    zh: '在线状态 (客户端)',
    ja: 'オンライン (クライアント)'
  },
  'Trực tuyến (Client)': {
    en: 'Online (Client)',
    fr: 'En ligne (Client)',
    zh: '在线状态 (客户端)',
    ja: 'オンライン (クライアント)'
  },
  'THAO TÁC': {
    en: 'ACTIONS',
    fr: 'ACTIONS',
    zh: '操作',
    ja: '操作'
  },
  'Thao tác': {
    en: 'Actions',
    fr: 'Actions',
    zh: '操作',
    ja: '操作'
  },
  'Gốc mặc định': {
    en: 'Default Root',
    fr: 'Par défaut',
    zh: '系统默认',
    ja: '規定のデフォルト'
  },
  'Mặc định': {
    en: 'Default',
    fr: 'Par défaut',
    zh: '默认',
    ja: 'デフォルト'
  },
  'Tên quốc tế:': {
    en: 'International name:',
    fr: 'Nom international :',
    zh: '国际通用名：',
    ja: '国際表記：'
  },
  'Tốc độ:': {
    en: 'Speed:',
    fr: 'Vitesse :',
    zh: '语速：',
    ja: '速度：'
  },
  'Nhà cung cấp:': {
    en: 'Provider:',
    fr: 'Fournisseur :',
    zh: '服务商：',
    ja: 'プロバイダー：'
  },
  'Thử giọng': {
    en: 'Test Voice',
    fr: 'Tester la voix',
    zh: '试听语音',
    ja: '音声試聴'
  },
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
  'Mã ISO': {
    en: 'ISO Code',
    fr: 'Code ISO',
    zh: 'ISO代码',
    ja: 'ISOコード'
  },
  'Biểu tượng cờ (Emoji)': {
    en: 'Flag Emoji',
    fr: 'Drapeau (Emoji)',
    zh: '国旗图标 (Emoji)',
    ja: '国旗絵文字 (Emoji)'
  },
  'Tên bản xứ': {
    en: 'Native Name',
    fr: 'Nom natif',
    zh: '本国语名称',
    ja: '母国語表記'
  },
  'Tên quốc tế (Tiếng Anh)': {
    en: 'International Name (English)',
    fr: 'Nom international (Anglais)',
    zh: '国际通用名 (英文)',
    ja: '国際名 (英語)'
  },
  'Mã giọng đọc (TTS Voice)': {
    en: 'TTS Voice Model',
    fr: 'Modèle vocal (TTS Voice)',
    zh: '语音模型代码 (TTS Voice)',
    ja: '音声モデルコード (TTS Voice)'
  },
  'Giới tính giọng': {
    en: 'Voice Gender',
    fr: 'Genre de la voix',
    zh: '发音性别',
    ja: '音声の性別'
  },
  'Kích hoạt hiển thị cho khách tham quan (Client)': {
    en: 'Activate display for visitors (Client)',
    fr: 'Activer l’affichage pour les visiteurs (Client)',
    zh: '开启游客端展示 (Client)',
    ja: '来館者向け表示を有効化 (Client)'
  },
  'Lưu ngôn ngữ': {
    en: 'Save Language',
    fr: 'Enregistrer la langue',
    zh: '保存语言配置',
    ja: '言語設定を保存'
  },
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
    en: 'Remove logo',
    fr: 'Supprimer logo',
    zh: '移除Logo',
    ja: 'ロゴを削除'
  },
  'Địa chỉ bảo tàng': {
    en: 'Museum address',
    fr: 'Adresse du musée',
    zh: '博物馆地址',
    ja: '博物館住所'
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
  },
  'Báo cáo & Thống kê lượt tham quan Tour 360': {
    en: 'Tour 360 Visitor Reports & Statistics',
    fr: 'Rapports et statistiques des visites Tour 360',
    zh: '360°漫游访问报告与统计',
    ja: '360°ツアー来館レポート＆統計'
  },
  'Chức năng này đang liên kết trực tiếp với dữ liệu Tour 360 hiện hành của Bảo tàng.': {
    en: 'This feature is directly linked with the active Tour 360 museum data.',
    fr: 'Cette fonctionnalité est directement liée aux données actives du musée.',
    zh: '该功能正直接连接到博物馆现行360°漫游数据。',
    ja: 'この機能は博物館の現行360°ツアーデータと直接連携しています。'
  },
  'Trở về Quản lý Tour 360': {
    en: 'Return to Tour 360 Management',
    fr: 'Retour à la gestion du Tour 360',
    zh: '返回360°全景管理',
    ja: '360°ツアー管理に戻る'
  },
  'Quản lý Hiện vật & Cổ vật di sản': {
    en: 'Heritage Artifacts & Relics Management',
    fr: 'Gestion des objets et reliques du patrimoine',
    zh: '文物与历史遗存管理',
    ja: '遺物・歴史的文化財管理'
  },
  'Hiển thị trang trọng trên Cổng Đăng Nhập, Thẻ Standee QR, Trang Thông Báo và Tiêu đề Tour 360.': {
    en: 'Displayed prominently on Login Portal, QR Standees, Announcements, and Tour 360 title.',
    fr: 'Affiché sur le portail de connexion, les standees QR, les avis et le titre Tour 360.',
    zh: '庄重显示于登录门户、实地展架QR、通知页及360°漫游标题。',
    ja: 'ログイン画面、QRコードパネル、告知ページ、360°ツアー表題に表示されます。'
  },
  'Hiển thị trên Sidebar, Header Breadcrumb, Nắp đáy sàn 360 (Nadir).': {
    en: 'Displayed on Sidebar, Header Breadcrumb, and 360 floor nadir logo.',
    fr: 'Affiché sur la barre latérale, le fil d’Ariane et le logo nadir 360°.',
    zh: '显示于侧边栏、顶部面包屑导航以及360°地面遮罩(Nadir)。',
    ja: 'サイドバー、ヘッダーパンくず、360°底面ナディールに表示されます。'
  },
  'Hiển thị phụ đề dưới tên bảo tàng trên Sidebar.': {
    en: 'Displayed as a subtitle under the museum name in the Sidebar.',
    fr: 'Affiché comme sous-titre sous le nom du musée dans la barre latérale.',
    zh: '作为副标题显示于侧边栏博物馆名称下方。',
    ja: 'サイドバーの博物館名の下にサブタイトルとして表示されます。'
  },
  'Logo nhận diện bảo tàng': {
    en: 'Museum Identity Logo',
    fr: 'Logo d’identité du musée',
    zh: '博物馆品牌标识Logo',
    ja: '博物館アイデンティティロゴ'
  },
  'Khuyên dùng tệp ảnh PNG trong suốt hoặc SVG để giữ trọn vẹn hoa văn, họa tiết cổ kính.': {
    en: 'Transparent PNG or SVG recommended to preserve heritage patterns and motifs.',
    fr: 'PNG transparent ou SVG recommandé pour préserver les motifs patrimoniaux.',
    zh: '建议使用透明PNG或SVG矢量图，以完美保留古典花纹与纹饰。',
    ja: '伝統文様や意匠を忠実に保つため、透過PNGまたはSVGの利用を推奨します。'
  },
  'Bấm vào đây để tải ảnh Logo từ máy tính': {
    en: 'Click here to upload Logo from computer',
    fr: 'Cliquez ici pour téléverser le logo depuis l’ordinateur',
    zh: '点击此处从电脑上传Logo图片',
    ja: 'ここをクリックしてPCからロゴ画像をアップロード'
  },
  'PNG, SVG, JPG (Tối đa 5MB)': {
    en: 'PNG, SVG, JPG (Max 5MB)',
    fr: 'PNG, SVG, JPG (Max 5Mo)',
    zh: 'PNG, SVG, JPG (最大 5MB)',
    ja: 'PNG, SVG, JPG (最大5MB)'
  },
  'Hoặc ký tự viết tắt tạm thời:': {
    en: 'Or temporary abbreviation / emblem:',
    fr: 'Ou abréviation / emblème temporaire :',
    zh: '或临时简写字符：',
    ja: 'または代替の略称・エンブレム文字：'
  },
  'Địa chỉ trụ sở bảo tàng': {
    en: 'Museum Headquarters Address',
    fr: 'Adresse du siège du musée',
    zh: '博物馆馆址',
    ja: '博物館所在地住所'
  },
  'Tên người gửi Email (From)': {
    en: 'Email Sender Name (From)',
    fr: 'Nom de l’expéditeur de l’e-mail (From)',
    zh: '发件人名称 (From)',
    ja: 'メール送信者名 (From)'
  },
  'Khôi phục mẫu chuẩn': {
    en: 'Reset to Default',
    fr: 'Restaurer par défaut',
    zh: '恢复默认模板',
    ja: 'デフォルトに戻す'
  },
  'Lưu Cấu Hình Nhận Diện Bảo Tàng': {
    en: 'Save Museum Identity Configuration',
    fr: 'Enregistrer la configuration de l’identité',
    zh: '保存博物馆身份配置',
    ja: '博物館設定を保存'
  },
  'Đang lưu và đồng bộ...': {
    en: 'Saving and syncing...',
    fr: 'Enregistrement et synchronisation...',
    zh: '正在保存并同步...',
    ja: '保存および同期中...'
  },
  'Xem trước trực quan': {
    en: 'Live Visual Preview',
    fr: 'Aperçu visuel en direct',
    zh: '直观实时预览',
    ja: 'リアルタイムプレビュー'
  },
  'Cập nhật đồng bộ theo dữ liệu bạn vừa nhập': {
    en: 'Syncs in real-time as you enter data',
    fr: 'Synchronisé en temps réel avec vos saisies',
    zh: '根据您输入的内容实时同步更新',
    ja: '入力されたデータに応じてリアルタイム更新'
  },
  'Thanh điều hướng & Breadcrumb': {
    en: 'Navigation Bar & Breadcrumbs',
    fr: 'Barre de navigation & fil d’Ariane',
    zh: '导航栏与面包屑导航',
    ja: 'ナビゲーションバー＆パンくずリスト'
  },
  'THANH ĐIỀU HƯỚNG & BREADCRUMB': {
    en: 'NAVIGATION BAR & BREADCRUMBS',
    fr: 'BARRE DE NAVIGATION & FIL D’ARIANE',
    zh: '导航栏与面包屑导航',
    ja: 'ナビゲーションバー＆パンくずリスト'
  },
  'Thẻ Standee QR Thực địa': {
    en: 'Field QR Standee Badge',
    fr: 'Badge Standee QR de terrain',
    zh: '实地展架QR二维码牌',
    ja: '実地QRコードスタンドカード'
  },
  'THẺ STANDEE QR THỰC ĐỊA': {
    en: 'FIELD QR STANDEE BADGE',
    fr: 'BADGE STANDEE QR DE TERRAIN',
    zh: '实地展架QR二维码牌',
    ja: '実地QRコードスタンドカード'
  },
  'Gian P-01: Không Gian Trưng Bày Di Sản': {
    en: 'Gallery P-01: Heritage Exhibition Space',
    fr: 'Galerie P-01 : Espace d’exposition du patrimoine',
    zh: '展厅 P-01：遗产展示空间',
    ja: '展示室 P-01：歴史遺産展示スペース'
  },
  'Thư Email Tự Động (SMTP)': {
    en: 'Automated System Email (SMTP)',
    fr: 'E-mail automatique du système (SMTP)',
    zh: '自动系统邮件 (SMTP)',
    ja: '自動送信メール (SMTP)'
  },
  'THƯ EMAIL TỰ ĐỘNG (SMTP)': {
    en: 'AUTOMATED SYSTEM EMAIL (SMTP)',
    fr: 'E-MAIL AUTOMATIQUE DU SYSTÈME (SMTP)',
    zh: '自动系统邮件 (SMTP)',
    ja: '自動送信メール (SMTP)'
  },
  'Người gửi:': {
    en: 'Sender:',
    fr: 'Expéditeur :',
    zh: '发件人：',
    ja: '差出人：'
  },
  'Ghép hoàn tất không gian di sản': {
    en: 'Heritage space stitching completed',
    fr: 'Assemblage de l’espace patrimonial terminé',
    zh: '遗产空间全景拼接已完成',
    ja: '遺産空間パノラマスティッチ完了'
  },
  'Ban Quản trị': {
    en: 'Board of Management',
    fr: 'Direction',
    zh: '管理委员会',
    ja: '運営委員会'
  },
  'Tên Bảo Tàng': {
    en: 'Museum Name',
    fr: 'Nom du musée',
    zh: '博物馆名称',
    ja: '博物館名称'
  },
  'Đổi ảnh logo': {
    en: 'Change logo',
    fr: 'Changer le logo',
    zh: '更换Logo',
    ja: 'ロゴを変更'
  },
  'Đang tải lên...': {
    en: 'Uploading...',
    fr: 'Téléversement...',
    zh: '正在上传...',
    ja: 'アップロード中...'
  },
  'Đang tải tệp ảnh lên máy chủ...': {
    en: 'Uploading image file to server...',
    fr: 'Téléversement du fichier image vers le serveur...',
    zh: '正在上传图片文件至服务器...',
    ja: '画像ファイルをサーバーにアップロード中...'
  },
  'Cổng tham quan Tour 360': {
    en: 'Tour 360 Visitor Portal',
    fr: 'Portail de visite Tour 360',
    zh: '360°漫游参观门户',
    ja: '360°ツアー見学ポータル'
  },
  'Mở cửa đón khách': {
    en: 'Open to Visitors',
    fr: 'Ouvert aux visiteurs',
    zh: '对外开放中',
    ja: '一般公開中'
  },
  'Tạm dừng đón khách': {
    en: 'Temporarily Paused',
    fr: 'Temporairement suspendu',
    zh: '暂停对外开放',
    ja: '一時見学停止'
  },
  'Sẵn sàng phục vụ khách tham quan': {
    en: 'Ready to serve visitors',
    fr: 'Prêt à accueillir les visiteurs',
    zh: '随时准备迎接参观者',
    ja: '見学者の受け入れ準備完了'
  },
  'Khách thấy thông báo bảo trì nâng cấp': {
    en: 'Visitors see upgrade maintenance notice',
    fr: 'Les visiteurs voient l’avis de maintenance',
    zh: '访客将看到系统维护升级通知',
    ja: '来館者にシステム更新告知が表示されます'
  },
  'Thời gian bảo trì còn lại': {
    en: 'Remaining Maintenance Time',
    fr: 'Temps de maintenance restant',
    zh: '剩余维护时间',
    ja: '残りメンテナンス時間'
  },
  'Thời gian bảo trì dự phòng': {
    en: 'Estimated Maintenance Time',
    fr: 'Temps de maintenance estimé',
    zh: '预计维护时间',
    ja: '推定メンテナンス時間'
  },
  'Hệ thống đang mở cửa trực tuyến': {
    en: 'System is currently online',
    fr: 'Le système est actuellement en ligne',
    zh: '系统当前在线正常开放',
    ja: 'システムは現在オンライン稼働中'
  },
  'Máy chủ hệ thống (VPS)': {
    en: 'System Server (VPS)',
    fr: 'Serveur système (VPS)',
    zh: '系统服务器 (VPS)',
    ja: 'システムサーバー (VPS)'
  },
  'Vận hành ổn định': {
    en: 'Operating Normally',
    fr: 'Fonctionnement stable',
    zh: '稳定运行中',
    ja: '安定稼働中'
  },
  'Cơ sở dữ liệu di sản (MongoDB)': {
    en: 'Heritage Database (MongoDB)',
    fr: 'Base de données du patrimoine (MongoDB)',
    zh: '遗产数据库 (MongoDB)',
    ja: '歴史遺産データベース (MongoDB)'
  },
  'Đồng bộ trực tuyến': {
    en: 'Online Synced',
    fr: 'Synchronisé en ligne',
    zh: '在线实时同步',
    ja: 'オンライン同期完了'
  },
  'Đang kiểm tra...': {
    en: 'Checking...',
    fr: 'Vérification...',
    zh: '正在检查...',
    ja: '確認中...'
  },
  'Toàn bộ dữ liệu gian phòng & hiện vật': {
    en: 'All exhibition rooms and artifacts data',
    fr: 'Toutes les données des salles et objets',
    zh: '展厅及文物全部数据',
    ja: '全展示室・遺物データ'
  },
  'Điều khiển Chế độ Bảo trì': {
    en: 'Maintenance Mode Controls',
    fr: 'Contrôles du mode maintenance',
    zh: '维护模式控制台',
    ja: 'メンテナンスモード制御'
  },
  'Chủ động bật khi cần đại tu dữ liệu hoặc nâng cấp không gian tham quan di sản.': {
    en: 'Enable when upgrading data or modernizing heritage spaces.',
    fr: 'Activez lors de la mise à niveau des espaces patrimoniaux.',
    zh: '在需要更新数据或升级漫游空间时主动开启。',
    ja: 'データ更新や遺産空間改修時に手動で有効化します。'
  },
  'Chế độ bảo trì: ĐANG BẬT': {
    en: 'Maintenance Mode: ACTIVE',
    fr: 'Mode maintenance : ACTIVÉ',
    zh: '维护模式：已开启',
    ja: 'メンテナンスモード：有効'
  },
  'Chế độ bảo trì: ĐANG TẮT': {
    en: 'Maintenance Mode: INACTIVE',
    fr: 'Mode maintenance : DÉSACTIVÉ',
    zh: '维护模式：已关闭',
    ja: 'メンテナンスモード：無効'
  },
  'Khách tham quan vãng lai sẽ được dẫn tới trang thông báo bảo trì.': {
    en: 'General visitors will be directed to the maintenance notice page.',
    fr: 'Les visiteurs seront redirigés vers la page de maintenance.',
    zh: '普通访客将被重定向至维护通知页面。',
    ja: '一般の見学者はメンテナンス告知ページへ転送されます。'
  },
  'Hệ thống đang mở cửa đón khách tham quan bình thường.': {
    en: 'System is open to visitors normally.',
    fr: 'Le système est ouvert normalement aux visiteurs.',
    zh: '系统正常开放，迎接各地游客参观。',
    ja: 'システムは正常に開館・公開されています。'
  },
  'Tiêu đề thông báo gửi khách': {
    en: 'Visitor Notification Title',
    fr: 'Titre de l’avis aux visiteurs',
    zh: '展示给访客的公告标题',
    ja: '見学者向け告知タイトル'
  },
  'Thời gian dự kiến hoàn tất': {
    en: 'Estimated Completion Time',
    fr: 'Temps estimé d’achèvement',
    zh: '预计完成耗时',
    ja: '完了予定所要時間'
  },
  'Lời nhắn gửi khách tham quan': {
    en: 'Message to Visitors',
    fr: 'Message aux visiteurs',
    zh: '致参观者的留言',
    ja: '見学者へのメッセージ'
  },
  'Lưu & Áp dụng': {
    en: 'Save & Apply',
    fr: 'Enregistrer & Appliquer',
    zh: '保存并立即应用',
    ja: '保存して適用'
  },
  'Đặt lại mẫu chuẩn': {
    en: 'Reset to Default Template',
    fr: 'Modèle par défaut',
    zh: '重置为标准模板',
    ja: '標準テンプレートに戻す'
  },
  'Tự động đồng bộ lên VPS & Nginx': {
    en: 'Automatically synced to VPS & Nginx',
    fr: 'Synchronisé automatiquement avec VPS & Nginx',
    zh: '自动同步部署至VPS与Nginx',
    ja: 'VPSおよびNginxに自動同期'
  },
  'Mô phỏng Giao diện Khách': {
    en: 'Visitor Interface Simulation',
    fr: 'Simulation de l’interface visiteur',
    zh: '访客界面实时模拟',
    ja: '見学者画面シミュレーション'
  },
  'Thời gian thực': {
    en: 'Real-time',
    fr: 'Temps réel',
    zh: '实时',
    ja: 'リアルタイム'
  },
  'Thử kết nối lại': {
    en: 'Retry Connection',
    fr: 'Réessayer la connexion',
    zh: '重试连接',
    ja: '再接続を試す'
  },
  'Mở xem toàn màn hình': {
    en: 'Open Fullscreen View',
    fr: 'Ouvrir en plein écran',
    zh: '全屏打开查看',
    ja: '全画面で開く'
  },
  'Hạ tầng Máy chủ & Dịch vụ': {
    en: 'Server & Services Infrastructure',
    fr: 'Infrastructure serveurs & services',
    zh: '服务器与服务基础架构',
    ja: 'サーバー＆サービスインフラ'
  },
  'Data thật 100%': {
    en: '100% Live Data',
    fr: 'Données réelles 100%',
    zh: '100% 真实数据',
    ja: '100% リアルデータ'
  },
  'Địa chỉ máy chủ (VPS)': {
    en: 'Server Address (VPS)',
    fr: 'Adresse du serveur (VPS)',
    zh: '服务器地址 (VPS)',
    ja: 'サーバーアドレス (VPS)'
  },
  'Cơ sở dữ liệu di sản': {
    en: 'Heritage Database',
    fr: 'Base de données du patrimoine',
    zh: '历史文化遗产数据库',
    ja: '歴史遺産データベース'
  },
  'Bộ nhớ tăng tốc (Cache)': {
    en: 'Acceleration Cache',
    fr: 'Mémoire cache accélérée',
    zh: '加速缓存 (Cache)',
    ja: '高速キャッシュメモリ'
  },
  'Hàng đợi xử lý (Queue)': {
    en: 'Processing Queue',
    fr: 'File d’attente',
    zh: '全景处理队列 (Queue)',
    ja: '処理キュー (Queue)'
  },
  'Trạng thái cổng 360': {
    en: 'Tour 360 Portal Status',
    fr: 'Statut du portail 360',
    zh: '360°漫游门户状态',
    ja: '360°ツアーポータル状態'
  },
  'Lịch trình bảo trì': {
    en: 'Maintenance Schedule',
    fr: 'Calendrier de maintenance',
    zh: '维护日程计划',
    ja: 'メンテナンススケジュール'
  },
  'Không có lịch bảo trì': {
    en: 'No Maintenance Scheduled',
    fr: 'Aucune maintenance programmée',
    zh: '当前无维护计划',
    ja: '予定されたメンテナンスはありません'
  },
  'Cập nhật lần cuối': {
    en: 'Last Updated',
    fr: 'Dernière mise à jour',
    zh: '最近更新时间',
    ja: '最終更新日時'
  },
  'Đang xử lý tác vụ': {
    en: 'Processing Tasks',
    fr: 'Traitement des tâches',
    zh: '正在处理任务',
    ja: 'タスク処理中'
  },
  'Sẵn sàng tiếp nhận': {
    en: 'Ready for Jobs',
    fr: 'Prêt à recevoir',
    zh: '就绪接收',
    ja: '待機中'
  },
  'Đang tạm dừng bảo trì': {
    en: 'Paused for Maintenance',
    fr: 'En pause pour maintenance',
    zh: '维护暂停中',
    ja: 'メンテナンス一時停止中'
  },
  'Đang mở cửa tham quan': {
    en: 'Open for Visits',
    fr: 'Ouvert aux visites',
    zh: '正常开放参观中',
    ja: '見学公開中'
  },
  'Redis Cache trực tuyến': {
    en: 'Redis Cache Online',
    fr: 'Cache Redis en ligne',
    zh: 'Redis缓存在线',
    ja: 'Redisキャッシュオンライン'
  },
  'Bộ nhớ cục bộ (Fallback)': {
    en: 'Local Memory (Fallback)',
    fr: 'Mémoire locale (Repli)',
    zh: '本地内存 (回退模式)',
    ja: 'ローカルメモリ (フォールバック)'
  },
  'Không có Redis': {
    en: 'No Redis',
    fr: 'Pas de Redis',
    zh: '未启用Redis',
    ja: 'Redis未検出'
  },
  'Mất kết nối': {
    en: 'Disconnected',
    fr: 'Déconnecté',
    zh: '连接中断',
    ja: '接続切断'
  },
  'Đang kết nối': {
    en: 'Connected',
    fr: 'Connecté',
    zh: '连接中',
    ja: '接続中'
  },
  'Hệ Thống Đang Nâng Cấp & Khởi Động Lại': {
    en: 'System Upgrading & Restarting',
    fr: 'Mise à niveau et redémarrage du système',
    zh: '系统升级并重启中',
    ja: 'システム更新＆再起動中'
  },
  'MÁY CHỦ ĐANG KHỞI ĐỘNG LẠI HOẶC BẢO TRÌ': {
    en: 'SERVER RESTARTING OR UNDER MAINTENANCE',
    fr: 'SERVEUR EN REDÉMARRAGE OU EN MAINTENANCE',
    zh: '服务器正在重启或维护中',
    ja: 'サーバー再起動中またはメンテナンス中'
  },
  'Máy chủ vừa được triển khai mã nguồn mới hoặc đang khởi động lại dịch vụ. Trang sẽ tự động đồng bộ và nạp lại dữ liệu ngay khi hệ thống trực tuyến.': {
    en: 'The server was recently updated or service is restarting. This page will automatically sync and reload once online.',
    fr: 'Le serveur a été mis à jour ou redémarre. Cette page se rechargera automatiquement une fois en ligne.',
    zh: '服务器刚刚完成代码部署或正在重启服务。系统上线后页面将自动重载并同步数据。',
    ja: 'サーバーに新しいコードが展開されたかサービスを再起動しています。復旧次第自動同期されます。'
  },
  'Đang tự động thăm dò tín hiệu máy chủ (mỗi 3s)...': {
    en: 'Automatically polling server status (every 3s)...',
    fr: 'Vérification automatique du serveur (toutes les 3s)...',
    zh: '正在自动探测服务器信号（每3秒）...',
    ja: 'サーバー応答を自動確認中（3秒間隔）...'
  },
  'Thử kết nối lại ngay': {
    en: 'Retry Connection Now',
    fr: 'Réessayer la connexion maintenant',
    zh: '立即重试连接',
    ja: '今すぐ再接続を試みる'
  },
  'Biên tập Hotspot 360°': {
    en: 'Edit 360° Hotspots',
    fr: 'Éditer les points chauds 360°',
    zh: '编辑360°热点',
    ja: '360°ホットスポット編集'
  },
  'Biên tập tư liệu lịch sử & âm thanh bản xứ': {
    en: 'Edit Historical Archives & Native Audio',
    fr: 'Éditer les archives historiques & audio natif',
    zh: '编辑历史档案与母语语音',
    ja: '歴史資料＆ネイティブ音声編集'
  },
  'Bước vào phòng (Góc nhìn siêu rộng 100°)': {
    en: 'Enter Room (Ultra-Wide 100° View)',
    fr: 'Entrer dans la salle (Vue ultra-large 100°)',
    zh: '进入展厅（100°超宽视角）',
    ja: '展示室に入る（100°超広角視野）'
  },
  'BẢO TÀNG': {
    en: 'MUSEUM',
    fr: 'MUSÉE',
    zh: '博物馆',
    ja: '博物館'
  },
  'BẢO TÀNG DI SẢN': {
    en: 'HERITAGE MUSEUM',
    fr: 'MUSÉE DU PATRIMOINE',
    zh: '文化遗产博物馆',
    ja: '遺産博物館'
  },
  'Bản nghe thử giọng đọc thuyết minh': {
    en: 'Narration Voice Audio Preview',
    fr: 'Aperçu audio de la narration',
    zh: '语音讲解试听',
    ja: '解説音声プレビュー'
  },
  'Bảo Tàng Lịch Sử TP.HCM': {
    en: 'Museum of History in HCMC',
    fr: 'Musée d\'Histoire de HCMC',
    zh: '胡志明市历史博物馆',
    ja: 'ホーチミン市歴史博物館'
  },
  'Bảo tàng': {
    en: 'Museum',
    fr: 'Musée',
    zh: '博物馆',
    ja: '博物館'
  },
  'Bảo tàng Di sản': {
    en: 'Heritage Museum',
    fr: 'Musée du Patrimoine',
    zh: '遗产博物馆',
    ja: '遺産博物館'
  },
  'Bảo tàng Lịch sử Thành phố Hồ Chí Minh': {
    en: 'Museum of History in Ho Chi Minh City',
    fr: 'Musée d\'Histoire de Hô Chi Minh-Ville',
    zh: '胡志明市历史博物馆',
    ja: 'ホーチミン市歴史博物館'
  },
  'Bấm "Bắt đầu quét không gian" rồi xoay người từ từ bao quát căn phòng': {
    en: 'Click "Start Space Sweep" then rotate slowly to capture the entire room',
    fr: 'Cliquez sur "Démarrer le balayage" puis tournez lentement pour capturer la pièce',
    zh: '点击“开始空间扫描”，然后缓慢旋转以覆盖整个房间',
    ja: '「空間スキャン開始」をクリックし、ゆっくり回転して部屋全体を撮影してください'
  },
  'Bấm vào biểu tượng ổ khóa bên trái đường link trình duyệt → Quyền cho trang web → Bật Máy ảnh thành': {
    en: 'Click the lock icon left of the browser URL → Site permissions → Set Camera to',
    fr: 'Cliquez sur le cadenas à gauche de l\'URL → Autorisations du site → Définir la caméra sur',
    zh: '点击浏览器地址栏左侧的锁形图标 → 网站权限 → 将相机权限设为',
    ja: 'ブラウザURL左側の鍵アイコンをクリック → サイトの権限 → カメラを「許可」に設定'
  },
  'Bấm để bật / tắt hiển thị trên trang khách tham quan': {
    en: 'Click to toggle visibility on visitor portal',
    fr: 'Cliquer pour activer / désactiver l\'affichage sur le portail visiteur',
    zh: '点击以切换在访客端的显示状态',
    ja: 'クリックしてビジター公開/非公開を切り替え'
  },
  'Bấm để chọn chuyển sang phòng di sản chuẩn': {
    en: 'Click to switch to standard heritage room',
    fr: 'Cliquer pour passer à la salle patrimoniale standard',
    zh: '点击切换到标准遗产展厅',
    ja: 'クリックして標準遺産室に切り替え'
  },
  'Bấm để xoay xem toàn cảnh 360°': {
    en: 'Click and drag to rotate 360° panorama',
    fr: 'Cliquer et glisser pour faire pivoter le panorama 360°',
    zh: '点击并拖动以旋转360°全景',
    ja: 'クリック＆ドラッグして360°全景を回転'
  },
  'BẬT': {
    en: 'ON',
    fr: 'ACTIVÉ',
    zh: '开',
    ja: 'オン'
  },
  'Bật chế độ Ghim Điểm Liên Kết (Click để gắn)': {
    en: 'Enable Hotspot Pinning Mode (Click to place)',
    fr: 'Activer le mode d\'épinglage de points (Cliquer pour placer)',
    zh: '启用热点标记模式（点击图片进行放置）',
    ja: 'ホットスポット配置モードを有効化（クリックして配置）'
  },
  'Bắt đầu': {
    en: 'Start',
    fr: 'Démarrer',
    zh: '开始',
    ja: '開始'
  },
  'Bắt đầu bằng việc thêm gian phòng mới. Bạn có thể sử dụng tính năng "Chọn mẫu phòng Bảo tàng Lịch sử TP.HCM" để nhập liệu thật nhanh chóng': {
    en: 'Start by adding a new room. You can use "HCMC History Museum Room Preset" to populate data instantly.',
    fr: 'Commencez par ajouter une nouvelle salle. Utilisez le préréglage du musée pour charger rapidement les données.',
    zh: '从添加新展厅开始。您可以使用“胡志明市历史博物馆预设模板”快速录入数据。',
    ja: '新しい展示室の追加から始めましょう。「歴史博物館プリセット」を使用して素早く入力できます。'
  },
  'Bắt đầu quét': {
    en: 'Start Sweep',
    fr: 'Démarrer le balayage',
    zh: '开始扫描',
    ja: 'スキャン開始'
  },
  'Bắt đầu quét không gian': {
    en: 'Start Space Sweep',
    fr: 'Démarrer le balayage d\'espace',
    zh: '开始全景空间扫描',
    ja: '空間パノラマスキャン開始'
  },
  'Bỏ góc này': {
    en: 'Discard This Frame',
    fr: 'Ignorer cette prise',
    zh: '放弃此角度',
    ja: 'このフレームを破棄'
  },
  'Bối cảnh lịch sử: Gian': {
    en: 'Historical Context: Gallery',
    fr: 'Contexte historique : Salle',
    zh: '历史背景：展厅',
    ja: '歴史的背景：展示室'
  },
  'Bồ Đào Nha': {
    en: 'Portuguese',
    fr: 'Portugais',
    zh: '葡萄牙语',
    ja: 'ポルトガル語'
  },
  'Bộ sưu tập Cổ vật Vương Hồng Sển': {
    en: 'Vuong Hong Sen Antique Collection',
    fr: 'Collection d\'Antiquités de Vuong Hong Sen',
    zh: '王洪钏古玩遗藏馆',
    ja: 'ヴオン・ホン・セン古文化財コレクション'
  },
  'CHẾ ĐỘ GHIM HOTSPOT: Click vào ảnh 360 để gắn điểm liên kết': {
    en: 'HOTSPOT PINNING MODE: Click on 360 photo to place anchor point',
    fr: 'MODE ÉPINGLAGE HOTSPOT : Cliquez sur la photo 360 pour placer un point d\'ancrage',
    zh: '热点标记模式：在360度照片上点击以放置锚点',
    ja: 'ホットスポット配置モード：360°画像をクリックしてリンクを配置'
  },
  'Cho phép': {
    en: 'Allow',
    fr: 'Autoriser',
    zh: '允许',
    ja: '許可'
  },
  'Chuyên đề': {
    en: 'Topic',
    fr: 'Thème',
    zh: '专题',
    ja: '展示テーマ'
  },
  'Chuyên đề trưng bày *': {
    en: 'Exhibition Topic *',
    fr: 'Thème d\'exposition *',
    zh: '展览专题 *',
    ja: '展示テーマ *'
  },
  'Chuyển chế độ màu': {
    en: 'Toggle Color Theme',
    fr: 'Changer de thème de couleur',
    zh: '切换颜色模式',
    ja: 'カラーテーマ切替'
  },
  'Chuyển gian phòng': {
    en: 'Switch Room',
    fr: 'Changer de salle',
    zh: '切换展厅',
    ja: '展示室切替'
  },
  'Chuyển sang giao diện Sáng': {
    en: 'Switch to Light Mode',
    fr: 'Passer en mode clair',
    zh: '切换到亮色主题',
    ja: 'ライトモードに切替'
  },
  'Chuyển sang giao diện Tối': {
    en: 'Switch to Dark Mode',
    fr: 'Passer en mode sombre',
    zh: '切换到暗色主题',
    ja: 'ダークモードに切替'
  },
  'Chuyển đổi ngôn ngữ hiển thị': {
    en: 'Switch Display Language',
    fr: 'Changer la langue d\'affichage',
    zh: '切换显示语言',
    ja: '表示言語の切り替え'
  },
  'Chuyển đổi trạng thái bảo trì': {
    en: 'Toggle Maintenance State',
    fr: 'Basculer l\'état de maintenance',
    zh: '切换维护状态',
    ja: 'メンテナンス状態切替'
  },
  'Chào mừng quý khách đến với': {
    en: 'Welcome to',
    fr: 'Bienvenue au',
    zh: '欢迎来到',
    ja: 'ご来館を歓迎いたします：'
  },
  'Chú thích hiện vật': {
    en: 'Artifact Caption',
    fr: 'Légende de l\'objet',
    zh: '文物图注说明',
    ja: '文化財キャプション'
  },
  'Chưa có Voice AI': {
    en: 'No Voice AI Yet',
    fr: 'Pas encore de voix IA',
    zh: '暂无语音AI',
    ja: 'AI音声未設定'
  },
  'Chưa có chuyên đề nào trong hệ thống': {
    en: 'No topics in system',
    fr: 'Aucun thème dans le système',
    zh: '系统中暂无展览专题',
    ja: '登録された展示テーマはありません'
  },
  'Chưa có gian phòng nào để xuất mã QR': {
    en: 'No rooms available to export QR code',
    fr: 'Aucune salle pour exporter le code QR',
    zh: '暂无展厅可导出二维码',
    ja: 'QRコード出力可能な展示室がありません'
  },
  'Chưa có gian phòng trưng bày nào trong Database': {
    en: 'No exhibition rooms in database',
    fr: 'Aucune salle d\'exposition dans la base de données',
    zh: '数据库中暂无展厅数据',
    ja: 'データベースに登録された展示室がありません'
  },
  'Chưa có kịch bản thuyết minh cho ngôn ngữ này': {
    en: 'No narration script for this language',
    fr: 'Aucun script de narration pour cette langue',
    zh: '该语言暂无语音讲解文稿',
    ja: 'この言語の解説原稿は未登録です'
  },
  'Chưa có thông tin mô tả chi tiết cho gian phòng này': {
    en: 'No detailed description for this room',
    fr: 'Aucune description détaillée pour cette salle',
    zh: '该展厅暂无详细介绍',
    ja: 'この展示室の詳細解説は未登録です'
  },
  'Chưa có điểm liên kết nào': {
    en: 'No hotspots created yet',
    fr: 'Aucun point d\'ancrage créé pour le moment',
    zh: '尚未创建关联热点',
    ja: 'ホットスポットは未設定です'
  },
  'Chọn chuyên đề': {
    en: 'Select Topic',
    fr: 'Sélectionner un thème',
    zh: '选择展览专题',
    ja: 'テーマを選択'
  },
  'Chọn file ảnh 360°': {
    en: 'Select 360° Photo File',
    fr: 'Sélectionner le fichier photo 360°',
    zh: '选择360°全景图片文件',
    ja: '360°パノラマ画像ファイルを選択'
  },
  'Chọn giọng đọc AI': {
    en: 'Select AI Voice Model',
    fr: 'Sélectionner le modèle vocal IA',
    zh: '选择AI语音音色',
    ja: 'AI音声モデルを選択'
  },
  'Chọn mẫu phòng Bảo tàng Lịch sử TP.HCM': {
    en: 'Select HCMC History Museum Room Preset',
    fr: 'Choisir le préréglage du musée',
    zh: '选择胡志明市历史博物馆预设展厅',
    ja: '歴史博物館プリセットを選択'
  },
  'Chụp ảnh': {
    en: 'Take Photo',
    fr: 'Prendre une photo',
    zh: '拍摄',
    ja: '撮影'
  },
  'Chụp ảnh toàn cảnh 360°': {
    en: 'Capture 360° Panorama',
    fr: 'Capturer le panorama 360°',
    zh: '拍摄360°全景照片',
    ja: '360°パノラマ撮影'
  },
  'Chụp góc tiếp theo': {
    en: 'Capture Next Angle',
    fr: 'Capturer l\'angle suivant',
    zh: '拍摄下一个角度',
    ja: '次の角度を撮影'
  },
  'Chụp lại': {
    en: 'Retake',
    fr: 'Reprendre',
    zh: '重拍',
    ja: '再撮影'
  },
  'Chụp lại góc này': {
    en: 'Retake This Frame',
    fr: 'Reprendre cet angle',
    zh: '重拍此角度',
    ja: 'この角度を再撮影'
  },
  'Cập nhật': {
    en: 'Update',
    fr: 'Mettre à jour',
    zh: '更新',
    ja: '更新'
  },
  'Cập nhật thành công': {
    en: 'Updated successfully',
    fr: 'Mise à jour réussie',
    zh: '更新成功',
    ja: '更新完了'
  },
  'Cập nhật thông tin gian phòng': {
    en: 'Update Room Information',
    fr: 'Mettre à jour les informations de la salle',
    zh: '更新展厅信息',
    ja: '展示室情報を更新'
  },
  'Cập nhật điểm liên kết thành công': {
    en: 'Hotspot updated successfully',
    fr: 'Point d\'ancrage mis à jour avec succès',
    zh: '关联热点更新成功',
    ja: 'ホットスポットが正常に更新されました'
  },
  'Danh mục chuyên đề': {
    en: 'Topics Category',
    fr: 'Catégorie des thèmes',
    zh: '专题分类',
    ja: '展示テーマ一覧'
  },
  'Danh mục ngôn ngữ': {
    en: 'Languages Directory',
    fr: 'Répertoire des langues',
    zh: '语种目录',
    ja: '言語一覧'
  },
  'Danh mục phòng di sản': {
    en: 'Heritage Rooms Directory',
    fr: 'Répertoire des salles patrimoniales',
    zh: '历史遗存展厅列表',
    ja: '遺産展示室一覧'
  },
  'Danh sách ảnh 360°': {
    en: '360° Photos List',
    fr: 'Liste des photos 360°',
    zh: '360°全景图列表',
    ja: '360°画像リスト'
  },
  'Dừng nghe thử': {
    en: 'Stop Audio Preview',
    fr: 'Arrêter l\'aperçu audio',
    zh: '停止试听',
    ja: '再生停止'
  },
  'Dừng phát': {
    en: 'Stop Playing',
    fr: 'Arrêter la lecture',
    zh: '停止播放',
    ja: '停止'
  },
  'Dữ liệu điểm neo và ảnh 360 liên kết cũng sẽ bị hủy bỏ': {
    en: 'Linked anchor points and 360 photos will also be revoked',
    fr: 'Les points d\'ancrage et photos 360 associés seront également révoqués',
    zh: '关联的热点锚点与360°照片也将一并注销',
    ja: '関連付けられたホットスポットと360°写真も無効化されます'
  },
  'Ghép ảnh': {
    en: 'Stitch Photos',
    fr: 'Assembler les photos',
    zh: '拼接全景',
    ja: 'パノラマ合成'
  },
  'Ghép ảnh toàn cảnh 360°': {
    en: 'Stitch 360° Panorama',
    fr: 'Assembler le panorama 360°',
    zh: '拼接360°全景照片',
    ja: '360°パノラマ合成'
  },
  'Gỡ bỏ ngôn ngữ này khỏi phòng': {
    en: 'Remove this language from room',
    fr: 'Retirer cette langue de la salle',
    zh: '从此展厅移除该语言',
    ja: 'この展示室からこの言語を削除'
  },
  'Hiện vật': {
    en: 'Artifact',
    fr: 'Objet d\'art',
    zh: '历史文物',
    ja: '文化財・遺物'
  },
  'Hiện vật tiêu biểu': {
    en: 'Highlight Artifacts',
    fr: 'Objets phares',
    zh: '重点代表文物',
    ja: '代表的文化財'
  },
  'Hoàn thành': {
    en: 'Complete',
    fr: 'Terminé',
    zh: '完成',
    ja: '完了'
  },
  'Hủy': {
    en: 'Cancel',
    fr: 'Annuler',
    zh: '取消',
    ja: 'キャンセル'
  },
  'Hủy bỏ': {
    en: 'Cancel',
    fr: 'Annuler',
    zh: '取消',
    ja: 'キャンセル'
  },
  'Hủy sửa': {
    en: 'Cancel Edit',
    fr: 'Annuler la modification',
    zh: '取消编辑',
    ja: '編集をキャンセル'
  },
  'Không có mô tả': {
    en: 'No description provided',
    fr: 'Aucune description fournie',
    zh: '暂无描述',
    ja: '説明はありません'
  },
  'Không thể khởi tạo WebGL 360° với ảnh này': {
    en: 'Unable to initialize WebGL 360° with this image',
    fr: 'Impossible d\'initialiser WebGL 360° avec cette image',
    zh: '无法使用此图像初始化WebGL 360°全景视图',
    ja: 'この画像でWebGL 360°ビューアーを初期化できません'
  },
  'Không thể khởi tạo luồng camera': {
    en: 'Unable to initialize camera stream',
    fr: 'Impossible d\'initialiser le flux de la caméra',
    zh: '无法初始化摄像头视频流',
    ja: 'カメラストリームを初期化できません'
  },
  'Không thể kết nối đến máy chủ API. Vui lòng kiểm tra backend': {
    en: 'Unable to connect to API server. Please check backend',
    fr: 'Impossible de se connecter au serveur API. Veuillez vérifier le backend',
    zh: '无法连接到API服务器，请检查后端运行状态',
    ja: 'APIサーバーに接続できません。バックエンドの状態を確認してください'
  },
  'Không gian 360°': {
    en: '360° Space',
    fr: 'Espace 360°',
    zh: '360°全景空间',
    ja: '360°空間'
  },
  'Không gian toàn cảnh 360°': {
    en: '360° Panoramic Space',
    fr: 'Espace panoramique 360°',
    zh: '360°全景展示空间',
    ja: '360°パノラマ空間'
  },
  'Lưu': {
    en: 'Save',
    fr: 'Enregistrer',
    zh: '保存',
    ja: '保存'
  },
  'Lưu cấu hình': {
    en: 'Save Configuration',
    fr: 'Enregistrer la configuration',
    zh: '保存配置',
    ja: '設定を保存'
  },
  'Lưu thay đổi': {
    en: 'Save Changes',
    fr: 'Enregistrer les modifications',
    zh: '保存更改',
    ja: '変更を保存'
  },
  'Lưu thông tin': {
    en: 'Save Information',
    fr: 'Enregistrer les informations',
    zh: '保存信息',
    ja: '情報を保存'
  },
  'Lưu tư liệu': {
    en: 'Save Archives',
    fr: 'Enregistrer les archives',
    zh: '保存文献资料',
    ja: '資料を保存'
  },
  'Mô tả': {
    en: 'Description',
    fr: 'Description',
    zh: '详细描述',
    ja: '解説・詳細'
  },
  'Mã gian phòng': {
    en: 'Room Code',
    fr: 'Code de salle',
    zh: '展厅编号',
    ja: '展示室コード'
  },
  'Mã phòng *': {
    en: 'Room Code *',
    fr: 'Code de salle *',
    zh: '展厅代码 *',
    ja: '展示室コード *'
  },
  'Nghe thử Voice AI': {
    en: 'Listen to AI Voice Sample',
    fr: 'Écouter l\'échantillon vocal IA',
    zh: '试听AI解说语音',
    ja: 'AI音声サンプルを再生'
  },
  'Phóng to': {
    en: 'Zoom In',
    fr: 'Zoom avant',
    zh: '放大',
    ja: 'ズームイン'
  },
  'Phóng to góc nhìn': {
    en: 'Zoom In View',
    fr: 'Agrandir la vue',
    zh: '放大视野',
    ja: '視野を拡大'
  },
  'Quay lại danh sách phòng': {
    en: 'Back to Rooms List',
    fr: 'Retour à la liste des salles',
    zh: '返回展厅列表',
    ja: '展示室リストに戻る'
  },
  'Quản lý Chuyên đề Trưng bày': {
    en: 'Exhibition Topics Management',
    fr: 'Gestion des thèmes d\'exposition',
    zh: '展览专题管理',
    ja: '展示テーマ管理'
  },
  'Quản lý Hotspot': {
    en: 'Hotspots Management',
    fr: 'Gestion des points d\'ancrage',
    zh: '热点锚点管理',
    ja: 'ホットスポット管理'
  },
  'Quản trị viên (Admin)': {
    en: 'Administrator (Admin)',
    fr: 'Administrateur (Admin)',
    zh: '系统管理员 (Admin)',
    ja: '管理者 (Admin)'
  },
  'Số lượng ảnh': {
    en: 'Number of Photos',
    fr: 'Nombre de photos',
    zh: '照片数量',
    ja: '写真枚数'
  },
  'Sửa phòng': {
    en: 'Edit Room',
    fr: 'Modifier la salle',
    zh: '编辑展厅',
    ja: '展示室を編集'
  },
  'Sửa thông tin': {
    en: 'Edit Info',
    fr: 'Modifier les infos',
    zh: '编辑信息',
    ja: '情報を編集'
  },
  'Sửa tên chuyên đề': {
    en: 'Edit Topic Name',
    fr: 'Modifier le nom du thème',
    zh: '修改专题名称',
    ja: 'テーマ名を編集'
  },
  'Thu nhỏ': {
    en: 'Zoom Out',
    fr: 'Zoom arrière',
    zh: '缩小',
    ja: 'ズームアウト'
  },
  'Thu nhỏ góc nhìn': {
    en: 'Zoom Out View',
    fr: 'Réduire la vue',
    zh: '缩小视野',
    ja: '視野を縮小'
  },
  'Thuyết minh & Voice': {
    en: 'Narration & Voice',
    fr: 'Narration & Voix',
    zh: '讲解文稿与语音',
    ja: '解説＆音声'
  },
  'Thuyết minh Di sản': {
    en: 'Heritage Narration',
    fr: 'Narration patrimoniale',
    zh: '遗产文化解说',
    ja: '遺産音声解説'
  },
  'Thuyết minh âm thanh': {
    en: 'Audio Narration',
    fr: 'Narration audio',
    zh: '音频解说',
    ja: '音声ガイド'
  },
  'Thêm': {
    en: 'Add',
    fr: 'Ajouter',
    zh: '添加',
    ja: '追加'
  },
  'Thêm chuyên đề': {
    en: 'Add Topic',
    fr: 'Ajouter un thème',
    zh: '添加专题',
    ja: 'テーマを追加'
  },
  'Thêm chuyên đề mới': {
    en: 'Add New Topic',
    fr: 'Ajouter un nouveau thème',
    zh: '添加新专题',
    ja: '新しいテーマを追加'
  },
  'Thêm gian phòng': {
    en: 'Add Exhibition Room',
    fr: 'Ajouter une salle d\'exposition',
    zh: '添加展厅',
    ja: '展示室を追加'
  },
  'Thêm gian phòng đầu tiên': {
    en: 'Add First Room',
    fr: 'Ajouter la première salle',
    zh: '添加第一个展厅',
    ja: '最初の展示室を追加'
  },
  'Thêm ngôn ngữ': {
    en: 'Add Language',
    fr: 'Ajouter une langue',
    zh: '添加语种',
    ja: '言語を追加'
  },
  'Thêm phòng mới': {
    en: 'Add New Room',
    fr: 'Ajouter une nouvelle salle',
    zh: '添加新展厅',
    ja: '新しい展示室を追加'
  },
  'Thêm điểm liên kết': {
    en: 'Add Hotspot',
    fr: 'Ajouter un point d\'ancrage',
    zh: '添加热点锚点',
    ja: 'ホットスポットを追加'
  },
  'Thông Báo Truy Cập Camera': {
    en: 'Camera Access Notification',
    fr: 'Notification d\'accès à la caméra',
    zh: '相机访问授权提示',
    ja: 'カメラアクセス通知'
  },
  'Thông Tin Hiện Vật': {
    en: 'Artifact Information',
    fr: 'Informations sur l\'objet',
    zh: '文物档案信息',
    ja: '文化財情報'
  },
  'Thời kỳ lịch sử': {
    en: 'Historical Period',
    fr: 'Période historique',
    zh: '历史时期',
    ja: '歴史年代'
  },
  'Thời kỳ lịch sử *': {
    en: 'Historical Period *',
    fr: 'Période historique *',
    zh: '历史年代 *',
    ja: '歴史年代 *'
  },
  'Tiêu đề': {
    en: 'Title',
    fr: 'Titre',
    zh: '标题',
    ja: 'タイトル'
  },
  'Tiêu đề *': {
    en: 'Title *',
    fr: 'Titre *',
    zh: '标题 *',
    ja: 'タイトル *'
  },
  'Toàn màn hình': {
    en: 'Fullscreen',
    fr: 'Plein écran',
    zh: '全屏模式',
    ja: '全画面表示'
  },
  'Thoát toàn màn hình': {
    en: 'Exit Fullscreen',
    fr: 'Quitter le plein écran',
    zh: '退出全屏',
    ja: '全画面解除'
  },
  'Tên chuyên đề': {
    en: 'Topic Name',
    fr: 'Nom du thème',
    zh: '专题名称',
    ja: 'テーマ名'
  },
  'Tên chuyên đề *': {
    en: 'Topic Name *',
    fr: 'Nom du thème *',
    zh: '专题名称 *',
    ja: 'テーマ名 *'
  },
  'Tên gian phòng': {
    en: 'Room Name',
    fr: 'Nom de la salle',
    zh: '展厅名称',
    ja: '展示室名'
  },
  'Tên gian phòng *': {
    en: 'Room Name *',
    fr: 'Nom de la salle *',
    zh: '展厅名称 *',
    ja: '展示室名 *'
  },
  'Tên ngôn ngữ': {
    en: 'Language Name',
    fr: 'Nom de la langue',
    zh: '语言名称',
    ja: '言語名'
  },
  'Tên tiếng Anh': {
    en: 'English Name',
    fr: 'Nom en anglais',
    zh: '英文名称',
    ja: '英語名称'
  },
  'Tải ảnh lên': {
    en: 'Upload Photo',
    fr: 'Téléverser la photo',
    zh: '上传图片',
    ja: '画像をアップロード'
  },
  'Tải ảnh Logo': {
    en: 'Upload Logo Image',
    fr: 'Téléverser le logo',
    zh: '上传标志图像',
    ja: 'ロゴ画像をアップロード'
  },
  'Tải lên ảnh 360°': {
    en: 'Upload 360° Photo',
    fr: 'Téléverser photo 360°',
    zh: '上传360°全景照片',
    ja: '360°パノラマ写真をアップロード'
  },
  'Tạo Voice AI': {
    en: 'Generate Voice AI',
    fr: 'Générer voix IA',
    zh: '生成AI语音',
    ja: 'AI音声を生成'
  },
  'Tạo giọng đọc AI': {
    en: 'Generate AI Voice',
    fr: 'Créer la voix IA',
    zh: '合成AI语音解说',
    ja: 'AI音声を生成'
  },
  'Vui lòng nhập tên gian phòng': {
    en: 'Please enter room name',
    fr: 'Veuillez saisir le nom de la salle',
    zh: '请输入展厅名称',
    ja: '展示室名を入力してください'
  },
  'Vui lòng nhập mã phòng': {
    en: 'Please enter room code',
    fr: 'Veuillez saisir le code de salle',
    zh: '请输入展厅代码',
    ja: '展示室コードを入力してください'
  },
  'Vui lòng nhập tên chuyên đề': {
    en: 'Please enter topic name',
    fr: 'Veuillez saisir le nom du thème',
    zh: '请输入专题名称',
    ja: 'テーマ名を入力してください'
  },
  'Vui lòng nhập lời đọc thuyết minh trước khi tạo giọng đọc': {
    en: 'Please enter narration script before generating voice',
    fr: 'Veuillez saisir le script de narration avant de générer la voix',
    zh: '生成解说语音前请输入解说文稿',
    ja: '音声を生成する前に解説原稿を入力してください'
  },
  'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu': {
    en: 'Please enter username and password',
    fr: 'Veuillez saisir le nom d\'utilisateur et le mot de passe',
    zh: '请输入用户名和密码',
    ja: 'ユーザー名とパスワードを入力してください'
  },
  'Vui lòng nhập địa chỉ Email quản trị viên': {
    en: 'Please enter administrator email address',
    fr: 'Veuillez saisir l\'adresse e-mail de l\'administrateur',
    zh: '请输入管理员电子邮箱地址',
    ja: '管理者メールアドレスを入力してください'
  },
  'Vui lòng nhập đủ 6 chữ số mã xác thực': {
    en: 'Please enter 6-digit verification code',
    fr: 'Veuillez saisir le code de vérification à 6 chiffres',
    zh: '请输入6位数验证码',
    ja: '6桁の認証コードを入力してください'
  },
  'Vui lòng quét chụp ít nhất 4 góc xung quanh không gian trước khi ghép': {
    en: 'Please sweep & capture at least 4 angles around the space before stitching',
    fr: 'Veuillez balayer et capturer au moins 4 angles avant l\'assemblage',
    zh: '全景拼接前请至少环绕拍摄4个角度',
    ja: 'パノラマ合成を行う前に、少なくとも4つの角度を撮影してください'
  },
  'Xác nhận': {
    en: 'Confirm',
    fr: 'Confirmer',
    zh: '确认',
    ja: '確認'
  },
  'Xác nhận xóa': {
    en: 'Confirm Deletion',
    fr: 'Confirmer la suppression',
    zh: '确认删除',
    ja: '削除を確認'
  },
  'Xóa chuyên đề': {
    en: 'Delete Topic',
    fr: 'Supprimer le thème',
    zh: '删除专题',
    ja: 'テーマを削除'
  },
  'Xóa gian phòng': {
    en: 'Delete Room',
    fr: 'Supprimer la salle',
    zh: '删除展厅',
    ja: '展示室を削除'
  },
  'Xóa ngôn ngữ': {
    en: 'Delete Language',
    fr: 'Supprimer la langue',
    zh: '删除语种',
    ja: '言語を削除'
  },
  'Xóa phòng': {
    en: 'Delete Room',
    fr: 'Supprimer la salle',
    zh: '删除展厅',
    ja: '展示室を削除'
  },
  'Xóa điểm liên kết': {
    en: 'Delete Hotspot',
    fr: 'Supprimer le point d\'ancrage',
    zh: '删除热点锚点',
    ja: 'ホットスポットを削除'
  },
  'Xuất mã QR': {
    en: 'Export QR Code',
    fr: 'Exporter le code QR',
    zh: '导出二维码',
    ja: 'QRコードを出力'
  },
  'In thẻ Standee QR': {
    en: 'Print Standee QR Card',
    fr: 'Imprimer la carte QR Standee',
    zh: '打印展架立牌二维码',
    ja: 'スタンディQRカード印刷'
  },
  'Tải ảnh Standee': {
    en: 'Download Standee Card',
    fr: 'Télécharger la carte Standee',
    zh: '下载展架立牌',
    ja: 'スタンディ画像を保存'
  },
  'Xem Tour Khách': {
    en: 'View Visitor Tour',
    fr: 'Visite guidée',
    zh: '参观导览',
    ja: 'ビジターツアー'
  },
  'Xem chi tiết': {
    en: 'View Details',
    fr: 'Voir les détails',
    zh: '查看详情',
    ja: '詳細を見る'
  },
  'Xem toàn cảnh': {
    en: 'View Panorama',
    fr: 'Voir le panorama',
    zh: '查看全景',
    ja: 'パノラマを見る'
  },
  'Đăng xuất': {
    en: 'Log Out',
    fr: 'Déconnexion',
    zh: '退出登录',
    ja: 'ログアウト'
  },
  'Đăng xuất an toàn': {
    en: 'Secure Log Out',
    fr: 'Déconnexion sécurisée',
    zh: '安全退出',
    ja: '安全にログアウト'
  },
  'Đạt chuẩn': {
    en: 'Passed',
    fr: 'Conforme',
    zh: '合格达标',
    ja: '基準達成'
  },
  'Chưa đạt': {
    en: 'Not Passed',
    fr: 'Non conforme',
    zh: '未达标',
    ja: '基準未達'
  },
  'Đang nạp không gian 360°': {
    en: 'Loading 360° space...',
    fr: 'Chargement de l\'espace 360°...',
    zh: '正在载入360°空间...',
    ja: '360°空間を読み込み中...'
  },
  'Đang ghép nối toàn cảnh 360 độ': {
    en: 'Stitching 360° panorama...',
    fr: 'Assemblage du panorama 360°...',
    zh: '正在拼接360度全景...',
    ja: '360度パノラマを合成中...'
  },
  'Đang hòa trộn biên ảnh và lưu vào kho di sản số': {
    en: 'Blending seams & storing to digital heritage archive...',
    fr: 'Fusion des raccords & archivage dans le patrimoine numérique...',
    zh: '正在平滑边缘接缝并存入数字遗产档案库...',
    ja: '継ぎ目をブレンドしてデジタル遺産アーカイブに保存中...'
  },
  'Đang phân tích điểm đặc trưng và cân bằng ánh sáng trong nhà': {
    en: 'Analyzing feature points & indoor lighting balance...',
    fr: 'Analyse des points caractéristiques & équilibrage de la lumière...',
    zh: '正在分析特征点并均衡室内照明光比...',
    ja: '特徴点を解析し室内の照明バランスを補正中...'
  },
  'Đang tính ma trận biến đổi và ghép nối toàn cảnh bằng OpenCV': {
    en: 'Computing transformation matrix & OpenCV panoramic stitching...',
    fr: 'Calcul de la matrice de transformation & assemblage OpenCV...',
    zh: '正在计算单应性变换矩阵并通过OpenCV完成全景拼接...',
    ja: '変換行列を計算しOpenCVによるパノラマ合成を実行中...'
  },
  'Đang tải kho ảnh toàn cảnh 360° từ hệ thống': {
    en: 'Loading 360° panorama archive from system...',
    fr: 'Chargement de l\'archive panoramique 360° du système...',
    zh: '正在从系统载入360°全景历史图库...',
    ja: 'システムから360°パノラマ画像アーカイブを読み込み中...'
  },
  'Đang tải ảnh lên máy chủ': {
    en: 'Uploading image to server...',
    fr: 'Téléversement de l\'image sur le serveur...',
    zh: '正在上传图片到服务器...',
    ja: '画像をサーバーにアップロード中...'
  },
  'Đang gửi mã xác thực': {
    en: 'Sending verification code...',
    fr: 'Envoi du code de vérification...',
    zh: '正在发送验证码...',
    ja: '認証コードを送信中...'
  },
  'Đã xuất bản Voice AI thuyết minh tiếng Việt thành công!': {
    en: 'Published Vietnamese Voice AI narration successfully!',
    fr: 'Narration vocale IA en vietnamien publiée avec succès !',
    zh: '越南语AI语音讲解发布成功！',
    ja: 'ベトナム語AI音声解説が正常に公開されました！'
  },
  'Đã lưu tư liệu lịch sử cho gian phòng thành công': {
    en: 'Saved room historical archives successfully',
    fr: 'Archives historiques de la salle enregistrées avec succès',
    zh: '展厅历史文献资料保存成功',
    ja: '展示室の歴史資料が正常に保存されました'
  },
  'Đã nạp văn bản mẫu gợi ý': {
    en: 'Loaded suggested template text',
    fr: 'Texte modèle suggéré chargé',
    zh: '已载入推荐模本文案',
    ja: '推奨テンプレート文を読み込みました'
  },
  'Đã xóa không gian 360° thành công': {
    en: 'Deleted 360° space successfully',
    fr: 'Espace 360° supprimé avec succès',
    zh: '成功删除360°空间',
    ja: '360°空間を削除しました'
  },
  '0° (Chính diện': {
    en: '0° (Center Front)',
    fr: '0° (Face avant)',
    zh: '0°（正前方）',
    ja: '0°（真正面）'
  },
  '0° (Ngang mắt': {
    en: '0° (Eye Level)',
    fr: '0° (Niveau des yeux)',
    zh: '0°（平视视线）',
    ja: '0°（目の高さ）'
  },
  '100° (Chuẩn': {
    en: '100° (Standard)',
    fr: '100° (Standard)',
    zh: '100°（标准超广角）',
    ja: '100°（標準画角）'
  },
  '16 góc': {
    en: '16 angles',
    fr: '16 angles',
    zh: '16个视角',
    ja: '16アングル'
  },
  'Bước vào phòng (Góc nhìn siêu rộng 100°': {
    en: 'Enter Room (Ultra-Wide 100° View)',
    fr: 'Entrer dans la salle (Vue 100°)',
    zh: '进入展厅（100°超广角）',
    ja: '入室（100°超広角）'
  },
  'Bạn có chắc chắn muốn gỡ bỏ hoàn toàn bản dịch và file thuyết minh Voice AI của ngôn ngữ': {
    en: 'Are you sure you want to completely remove translations and Voice AI audio for language',
    fr: 'Êtes-vous sûr de vouloir supprimer définitivement les traductions et la voix IA de la langue',
    zh: '您确定要彻底删除该语种的所有翻译文稿与AI语音解说吗：',
    ja: 'この言語の翻訳およびAI音声解説を完全に削除してもよろしいですか：'
  },
  'Bạn có chắc chắn muốn xóa chuyên đề "': {
    en: 'Are you sure you want to delete topic "',
    fr: 'Êtes-vous sûr de vouloir supprimer le thème "',
    zh: '您确定要删除该展览专题吗："',
    ja: 'この展示テーマを削除してもよろしいですか：「'
  },
  'Bạn có chắc chắn muốn xóa ngôn ngữ "': {
    en: 'Are you sure you want to delete language "',
    fr: 'Êtes-vous sûr de vouloir supprimer la langue "',
    zh: '您确定要删除该语种吗："',
    ja: 'この言語を削除してもよろしいですか：「'
  },
  'Bạn có chắc chắn muốn xóa vĩnh viễn file toàn cảnh "': {
    en: 'Are you sure you want to permanently delete panorama file "',
    fr: 'Êtes-vous sûr de vouloir supprimer définitivement le fichier panoramique "',
    zh: '您确定要永久删除全景图像文件吗："',
    ja: 'パノラマ画像ファイルを完全に削除してもよろしいですか：「'
  },
  'Bạn có chắc chắn muốn xóa vĩnh viễn gian phòng "': {
    en: 'Are you sure you want to permanently delete room "',
    fr: 'Êtes-vous sûr de vouloir supprimer définitivement la salle "',
    zh: '您确定要永久删除展厅吗："',
    ja: '展示室を完全に削除してもよろしいですか：「'
  },
  'Bạn có chắc chắn muốn xóa điểm liên kết "': {
    en: 'Are you sure you want to delete hotspot "',
    fr: 'Êtes-vous sûr de vouloir supprimer le point d\'ancrage "',
    zh: '您确定要删除该关联热点吗："',
    ja: 'このホットスポットを削除してもよろしいですか：「'
  },
  'Bạn có chắc muốn xóa vĩnh viễn': {
    en: 'Are you sure you want to permanently delete',
    fr: 'Êtes-vous sûr de vouloir supprimer définitivement',
    zh: '您确定要永久删除',
    ja: '本当に完全に削除してもよろしいですか：'
  },
  'Bạn có chắc muốn xóa vĩnh viễn không gian 360° "': {
    en: 'Are you sure you want to permanently delete 360° space "',
    fr: 'Êtes-vous sûr de vouloir supprimer définitivement l\'espace 360° "',
    zh: '您确定要永久删除360°空间吗："',
    ja: '360°空間を完全に削除してもよろしいですか：「'
  },
  'Bảo tàng Nghệ thuật & Di sản Lịch sử (BMA-360).jpg': {
    en: 'Bảo tàng Nghệ thuật & Di sản Lịch sử (BMA-360).jpg',
    fr: 'Bảo tàng Nghệ thuật & Di sản Lịch sử (BMA-360).jpg',
    zh: 'Bảo tàng Nghệ thuật & Di sản Lịch sử (BMA-360).jpg',
    ja: 'Bảo tàng Nghệ thuật & Di sản Lịch sử (BMA-360).jpg'
  },
  'Bật chế độ Ghim Điểm Liên Kết (Click để gắn': {
    en: 'Enable Hotspot Pinning Mode (Click to place)',
    fr: 'Activer le mode d\'épinglage (Cliquer pour placer)',
    zh: '启用热点标记模式（点击图片进行放置）',
    ja: 'ホットスポット配置モードを有効化（クリックして配置）'
  },
  'Bối cảnh tri thức: Gian Bộ sưu tập Cổ vật Vương Hồng Sển tại Bảo tàng Lịch sử TP.HCM. Học giả Vương Hồng Sển đã hiến tặng 849 cổ vật quý giá năm 1996, gồm gốm men lam Huế (Bleu de Huế), đồ gốm thời Minh - Thanh, bình vôi cổ, đồ bạc và tượng Phật cổ phương Nam': {
    en: 'Bối cảnh tri thức: Gian Bộ sưu tập Cổ vật Vương Hồng Sển tại Bảo tàng Lịch sử TP.HCM. Học giả Vương Hồng Sển đã hiến tặng 849 cổ vật quý giá năm 1996, gồm gốm men lam Huế (Bleu de Huế), đồ gốm thời Minh - Thanh, bình vôi cổ, đồ bạc và tượng Phật cổ phương Nam',
    fr: 'Bối cảnh tri thức: Gian Bộ sưu tập Cổ vật Vương Hồng Sển tại Bảo tàng Lịch sử TP.HCM. Học giả Vương Hồng Sển đã hiến tặng 849 cổ vật quý giá năm 1996, gồm gốm men lam Huế (Bleu de Huế), đồ gốm thời Minh - Thanh, bình vôi cổ, đồ bạc và tượng Phật cổ phương Nam',
    zh: 'Bối cảnh tri thức: Gian Bộ sưu tập Cổ vật Vương Hồng Sển tại Bảo tàng Lịch sử TP.HCM. Học giả Vương Hồng Sển đã hiến tặng 849 cổ vật quý giá năm 1996, gồm gốm men lam Huế (Bleu de Huế), đồ gốm thời Minh - Thanh, bình vôi cổ, đồ bạc và tượng Phật cổ phương Nam',
    ja: 'Bối cảnh tri thức: Gian Bộ sưu tập Cổ vật Vương Hồng Sển tại Bảo tàng Lịch sử TP.HCM. Học giả Vương Hồng Sển đã hiến tặng 849 cổ vật quý giá năm 1996, gồm gốm men lam Huế (Bleu de Huế), đồ gốm thời Minh - Thanh, bình vôi cổ, đồ bạc và tượng Phật cổ phương Nam'
  },
  'Bối cảnh tri thức: Gian Di sản Văn hóa Vương quốc Phù Nam - Óc Eo (Thế kỷ 1 - 7 SCN) tại Bảo tàng Lịch sử TP.HCM. Lưu giữ các bảo vật quốc gia như tượng thần Vishnu đá sa thạch, tượng thần Surya, trang sức vàng lá chạm nổi thần linh và tiền cổ La Mã minh chứng cho thương cảng sầm uất bậc nhất cổ đại': {
    en: 'Bối cảnh tri thức: Gian Di sản Văn hóa Vương quốc Phù Nam - Óc Eo (Thế kỷ 1 - 7 SCN) tại Bảo tàng Lịch sử TP.HCM. Lưu giữ các bảo vật quốc gia như tượng thần Vishnu đá sa thạch, tượng thần Surya, trang sức vàng lá chạm nổi thần linh và tiền cổ La Mã minh chứng cho thương cảng sầm uất bậc nhất cổ đại',
    fr: 'Bối cảnh tri thức: Gian Di sản Văn hóa Vương quốc Phù Nam - Óc Eo (Thế kỷ 1 - 7 SCN) tại Bảo tàng Lịch sử TP.HCM. Lưu giữ các bảo vật quốc gia như tượng thần Vishnu đá sa thạch, tượng thần Surya, trang sức vàng lá chạm nổi thần linh và tiền cổ La Mã minh chứng cho thương cảng sầm uất bậc nhất cổ đại',
    zh: 'Bối cảnh tri thức: Gian Di sản Văn hóa Vương quốc Phù Nam - Óc Eo (Thế kỷ 1 - 7 SCN) tại Bảo tàng Lịch sử TP.HCM. Lưu giữ các bảo vật quốc gia như tượng thần Vishnu đá sa thạch, tượng thần Surya, trang sức vàng lá chạm nổi thần linh và tiền cổ La Mã minh chứng cho thương cảng sầm uất bậc nhất cổ đại',
    ja: 'Bối cảnh tri thức: Gian Di sản Văn hóa Vương quốc Phù Nam - Óc Eo (Thế kỷ 1 - 7 SCN) tại Bảo tàng Lịch sử TP.HCM. Lưu giữ các bảo vật quốc gia như tượng thần Vishnu đá sa thạch, tượng thần Surya, trang sức vàng lá chạm nổi thần linh và tiền cổ La Mã minh chứng cho thương cảng sầm uất bậc nhất cổ đại'
  },
  'Bối cảnh tri thức: Gian Điêu khắc Phật giáo & Ấn Độ giáo Champa (Thế kỷ 7 - 13) tại Bảo tàng Lịch sử TP.HCM. Trưng bày tượng Bồ Tát Tara, thần Shiva múa, vũ nữ Apsara, tượng thần Brahma và bệ thờ Yoni - Linga sa thạch phong cách Trà Kiệu, Mỹ Sơn và Tháp Mẫm': {
    en: 'Bối cảnh tri thức: Gian Điêu khắc Phật giáo & Ấn Độ giáo Champa (Thế kỷ 7 - 13) tại Bảo tàng Lịch sử TP.HCM. Trưng bày tượng Bồ Tát Tara, thần Shiva múa, vũ nữ Apsara, tượng thần Brahma và bệ thờ Yoni - Linga sa thạch phong cách Trà Kiệu, Mỹ Sơn và Tháp Mẫm',
    fr: 'Bối cảnh tri thức: Gian Điêu khắc Phật giáo & Ấn Độ giáo Champa (Thế kỷ 7 - 13) tại Bảo tàng Lịch sử TP.HCM. Trưng bày tượng Bồ Tát Tara, thần Shiva múa, vũ nữ Apsara, tượng thần Brahma và bệ thờ Yoni - Linga sa thạch phong cách Trà Kiệu, Mỹ Sơn và Tháp Mẫm',
    zh: 'Bối cảnh tri thức: Gian Điêu khắc Phật giáo & Ấn Độ giáo Champa (Thế kỷ 7 - 13) tại Bảo tàng Lịch sử TP.HCM. Trưng bày tượng Bồ Tát Tara, thần Shiva múa, vũ nữ Apsara, tượng thần Brahma và bệ thờ Yoni - Linga sa thạch phong cách Trà Kiệu, Mỹ Sơn và Tháp Mẫm',
    ja: 'Bối cảnh tri thức: Gian Điêu khắc Phật giáo & Ấn Độ giáo Champa (Thế kỷ 7 - 13) tại Bảo tàng Lịch sử TP.HCM. Trưng bày tượng Bồ Tát Tara, thần Shiva múa, vũ nữ Apsara, tượng thần Brahma và bệ thờ Yoni - Linga sa thạch phong cách Trà Kiệu, Mỹ Sơn và Tháp Mẫm'
  },
  'Bộ sưu tập độc bản về nền văn minh Phù Nam cổ xưa thế kỷ 1 - 7 sau Công Nguyên phát hiện tại thương cảng cổ Óc Eo (An Giang) và đồng bằng Nam Bộ': {
    en: 'Bộ sưu tập độc bản về nền văn minh Phù Nam cổ xưa thế kỷ 1 - 7 sau Công Nguyên phát hiện tại thương cảng cổ Óc Eo (An Giang) và đồng bằng Nam Bộ',
    fr: 'Bộ sưu tập độc bản về nền văn minh Phù Nam cổ xưa thế kỷ 1 - 7 sau Công Nguyên phát hiện tại thương cảng cổ Óc Eo (An Giang) và đồng bằng Nam Bộ',
    zh: 'Bộ sưu tập độc bản về nền văn minh Phù Nam cổ xưa thế kỷ 1 - 7 sau Công Nguyên phát hiện tại thương cảng cổ Óc Eo (An Giang) và đồng bằng Nam Bộ',
    ja: 'Bộ sưu tập độc bản về nền văn minh Phù Nam cổ xưa thế kỷ 1 - 7 sau Công Nguyên phát hiện tại thương cảng cổ Óc Eo (An Giang) và đồng bằng Nam Bộ'
  },
  'Chào mừng quý khách đến với không gian Di sản Óc Eo - Phù Nam. Hơn một thiên niên kỷ trước, nơi châu thổ sông Cửu Long từng tồn tại một vương quốc thương cảng lừng lẫy, nơi giao thoa giữa các nền văn minh Ấn Độ, La Mã và văn hóa bản địa Nam Bộ': {
    en: 'Chào mừng quý khách đến với không gian Di sản Óc Eo - Phù Nam. Hơn một thiên niên kỷ trước, nơi châu thổ sông Cửu Long từng tồn tại một vương quốc thương cảng lừng lẫy, nơi giao thoa giữa các nền văn minh Ấn Độ, La Mã và văn hóa bản địa Nam Bộ',
    fr: 'Chào mừng quý khách đến với không gian Di sản Óc Eo - Phù Nam. Hơn một thiên niên kỷ trước, nơi châu thổ sông Cửu Long từng tồn tại một vương quốc thương cảng lừng lẫy, nơi giao thoa giữa các nền văn minh Ấn Độ, La Mã và văn hóa bản địa Nam Bộ',
    zh: 'Chào mừng quý khách đến với không gian Di sản Óc Eo - Phù Nam. Hơn một thiên niên kỷ trước, nơi châu thổ sông Cửu Long từng tồn tại một vương quốc thương cảng lừng lẫy, nơi giao thoa giữa các nền văn minh Ấn Độ, La Mã và văn hóa bản địa Nam Bộ',
    ja: 'Chào mừng quý khách đến với không gian Di sản Óc Eo - Phù Nam. Hơn một thiên niên kỷ trước, nơi châu thổ sông Cửu Long từng tồn tại một vương quốc thương cảng lừng lẫy, nơi giao thoa giữa các nền văn minh Ấn Độ, La Mã và văn hóa bản địa Nam Bộ'
  },
  'Chưa có ảnh 360° nào trong kho lưu trữ': {
    en: 'No ảnh 360° nào trong kho lưu trữ yet',
    fr: 'Aucun(e) ảnh 360° nào trong kho lưu trữ pour le moment',
    zh: '暂无ảnh 360° nào trong kho lưu trữ',
    ja: 'ảnh 360° nào trong kho lưu trữはまだありません'
  },
  'Chưa gán': {
    en: 'Unassigned',
    fr: 'Non assigné',
    zh: '未分配',
    ja: '未割り当て'
  },
  'Chưa đủ góc 360°': {
    en: 'Incomplete 360° angles',
    fr: 'Angles 360° incomplets',
    zh: '360°视角不完整',
    ja: '360°アングル不足'
  },
  'Chạm vào vị trí bất kỳ trên ảnh 360° để đặt điểm': {
    en: 'Tap anywhere on 360° photo to place anchor point',
    fr: 'Touchez n\'importe où sur la photo 360° pour placer un point',
    zh: '在360°全景照片上任意点击即可放置热点',
    ja: '360°画像の任意の位置をタップしてアンカーポイントを配置'
  },
  'Chế độ Hành tinh tí hon (Little Planet': {
    en: 'Little Planet View Mode',
    fr: 'Mode Petite Planète',
    zh: '小行星全景模式',
    ja: 'リトルプラネット表示モード'
  },
  'Chế độ bảng dữ liệu': {
    en: 'Data Table View',
    fr: 'Vue tableau de données',
    zh: '数据表格模式',
    ja: 'データテーブル表示'
  },
  'Chế độ lưới trực quan': {
    en: 'Visual Grid View',
    fr: 'Vue grille visuelle',
    zh: '可视化网格模式',
    ja: 'ビジュアルグリッド表示'
  },
  'Chế độ xem Danh Sách Bảng (1 hàng, 5-10-20 mục/trang': {
    en: 'Table List View (1 row, 5-10-20 items/page)',
    fr: 'Vue liste tableau (1 ligne, 5-10-20 éléments/page)',
    zh: '表格列表模式（单行排布，每页5-10-20项）',
    ja: 'リストテーブル表示（1行、ページあたり5-10-20件）'
  },
  'Chế độ xem Lưới Thẻ (3 cột, 6-9-12 thẻ/trang': {
    en: 'Card Grid View (3 columns, 6-9-12 cards/page)',
    fr: 'Vue grille de cartes (3 colonnes, 6-9-12 cartes/page)',
    zh: '卡片网格模式（3列排布，每页6-9-12张卡片）',
    ja: 'カードグリッド表示（3列、ページあたり6-9-12枚）'
  },
  'Chỉnh sửa thông tin phòng': {
    en: 'Edit Room Information',
    fr: 'Modifier les informations de la salle',
    zh: '编辑展厅信息',
    ja: '展示室情報を編集'
  },
  'Chọn chuyên đề trưng bày': {
    en: 'Select Exhibition Topic',
    fr: 'Sélectionner le thème d\'exposition',
    zh: '选择展览专题',
    ja: '展示テーマを選択'
  },
  'Chọn vị trí trung tâm': {
    en: 'Select Center Position',
    fr: 'Sélectionner la position centrale',
    zh: '选择中心位置',
    ja: '中央位置を選択'
  },
  'Chọn ảnh này để dọn dẹp hàng loạt': {
    en: 'Select this photo for batch cleanup',
    fr: 'Sélectionner cette photo pour le nettoyage par lot',
    zh: '勾选此照片以进行批量清理',
    ja: '一括クリーンアップ対象として選択'
  },
  'Chụp / Chọn ảnh từ Camera điện thoại': {
    en: 'Capture / Select from Phone Camera',
    fr: 'Capturer / Choisir depuis la caméra mobile',
    zh: '通过手机拍摄或选择照片',
    ja: 'スマホカメラで撮影/選択'
  },
  'Chụp góc bằng webcam máy tính': {
    en: 'Capture frame using computer webcam',
    fr: 'Capturer l\'angle avec la webcam',
    zh: '使用电脑摄像头拍摄该角度',
    ja: 'パソコンのウェブカメラで撮影'
  },
  'Chụp từ Camera điện thoại': {
    en: 'Capture from Phone Camera',
    fr: 'Capturer depuis la caméra mobile',
    zh: '使用手机相机拍摄',
    ja: 'スマートフォンカメラから撮影'
  },
  'Chụp điểm này': {
    en: 'Capture This Spot',
    fr: 'Capturer ce point',
    zh: '拍摄此点位',
    ja: 'この地点を撮影'
  },
  'Cách bật quyền Camera nếu trình duyệt chặn': {
    en: 'How to enable Camera access if browser blocks it',
    fr: 'Comment activer la caméra si le navigateur la bloque',
    zh: '如果浏览器阻止摄像头权限，如何开启',
    ja: 'ブラウザにカメラアクセスがブロックされた場合の有効化手順'
  },
  'Cân bằng': {
    en: 'Balance',
    fr: 'Équilibre',
    zh: '平衡调节',
    ja: 'ホワイトバランス'
  },
  'Còn ~': {
    en: 'Remaining ~',
    fr: 'Restant ~',
    zh: '剩余约 ',
    ja: '残り約 '
  },
  'Cần có dữ liệu Tiếng Việt gốc trước khi dịch': {
    en: 'Original Vietnamese source data is required before translating',
    fr: 'Les données sources en vietnamien sont requises avant la traduction',
    zh: '翻译前需要先提供越南语原始基础文案',
    ja: '翻訳を行う前にベトナム語の原本データが必要です'
  },
  'Cập nhật liên kết ảnh 360° thành công': {
    en: '360° photo link updated successfully',
    fr: 'Lien photo 360° mis à jour avec succès',
    zh: '360°全景照片关联更新成功',
    ja: '360°パノラマ写真の関連付けが完了しました'
  },
  'Cập nhật thành công! Nhận diện bảo tàng đã được đồng bộ 100% trên toàn hệ thống': {
    en: 'Updated successfully! Museum identity synced 100% across the system',
    fr: 'Mise à jour réussie ! Identité du musée synchronisée à 100% sur tout le système',
    zh: '更新成功！博物馆全套品牌标识已在全系统实现100%同步',
    ja: '更新完了！博物館のブランド識別情報がシステム全体に100％同期されました'
  },
  'Cắm điểm mới': {
    en: 'Pin New Point',
    fr: 'Épingler nouveau point',
    zh: '标注新点位',
    ja: '新しいポイントを設置'
  },
  'Cổng Đăng Nhập Quản Trị Hệ Thống': {
    en: 'System Administration Login Portal',
    fr: 'Portail de Connexion Administrateur',
    zh: '系统管理员登录门户',
    ja: 'システム管理者ログインポータル'
  },
  'Cửa chính vào gian phòng': {
    en: 'Main Room Entrance',
    fr: 'Entrée principale de la salle',
    zh: '展厅正门主入口',
    ja: '展示室正面入口'
  },
  'Di sản Văn hóa Vương quốc Phù Nam - Óc Eo': {
    en: 'Cultural Heritage of Funan - Oc Eo Kingdom',
    fr: 'Patrimoine Culturel du Royaume de Funan - Óc Eo',
    zh: '扶南-沃澳王国文化遗产',
    ja: '扶南・オケオ王国文化遺産'
  },
  'Du khách quét mã tại gian trưng bày': {
    en: 'Visitors scan QR at gallery',
    fr: 'Les visiteurs scannent le QR à la galerie',
    zh: '访客在展厅现场扫描二维码',
    ja: '展示室にて来館者がQRコードをスキャン'
  },
  'Dán đường dẫn ảnh 360° (Cloudinary, Cloudflare R2, URL trực tiếp': {
    en: 'Paste 360° photo URL (Cloudinary, Cloudflare R2, direct link)',
    fr: 'Coller l\'URL photo 360° (Cloudinary, Cloudflare R2, lien direct)',
    zh: '粘贴360°全景照片链接（Cloudinary、Cloudflare R2或直链）',
    ja: '360°写真URLを貼り付け（Cloudinary、Cloudflare R2、直接リンク）'
  },
  'Désactivé temporairement': {
    en: 'Désactivé temporairement',
    fr: 'Désactivé temporairement',
    zh: 'Désactivé temporairement',
    ja: 'Désactivé temporairement'
  },
  'Dịch tự động bằng AI': {
    en: 'Auto Translate with AI',
    fr: 'Traduction automatique par IA',
    zh: 'AI多语言智能自动翻译',
    ja: 'AIによる自動翻訳'
  },
  'Dự kiến': {
    en: 'Estimated',
    fr: 'Estimé',
    zh: '预计完成',
    ja: '完了予定'
  },
  'Dự kiến hoàn tất: còn khoảng': {
    en: 'Estimated completion: approx.',
    fr: 'Fin estimée : environ',
    zh: '预计完成还需约',
    ja: '完了予定：残り約'
  },
  'Dự kiến hoàn tất: khoảng': {
    en: 'Estimated completion: about',
    fr: 'Fin estimée : environ',
    zh: '预计完成时间：约',
    ja: '完了予定：約'
  },
  'Gardien de millénaires de patrimoine national': {
    en: 'Gardien de millénaires de patrimoine national',
    fr: 'Gardien de millénaires de patrimoine national',
    zh: 'Gardien de millénaires de patrimoine national',
    ja: 'Gardien de millénaires de patrimoine national'
  },
  'Ghi chú về vị trí hoặc nội dung điểm ghim': {
    en: 'Notes on location or pinned point content',
    fr: 'Notes sur l\'emplacement ou le contenu',
    zh: '点位位置或展示内容的备忘说明',
    ja: '配置位置や解説内容に関するメモ'
  },
  'Ghim điểm liên kết (Hotspot': {
    en: 'Pin Hotspot Link',
    fr: 'Épingler le point d\'ancrage (Hotspot)',
    zh: '关联锚点标记（Hotspot）',
    ja: 'ホットスポットリンク配置'
  },
  'Ghép 360 độ ngay': {
    en: 'Stitch 360° Panorama Now',
    fr: 'Assembler le panorama 360° maintenant',
    zh: '立即拼接360度全景',
    ja: '今すぐ360°パノラマを合成'
  },
  'Ghép 360°': {
    en: 'Stitch 360°',
    fr: 'Assembler 360°',
    zh: '拼接360°',
    ja: '360°パノラマ合成'
  },
  'Ghép góc hẹp': {
    en: 'Narrow Angle Stitching',
    fr: 'Assemblage angle étroit',
    zh: '窄角局部拼接',
    ja: '狭角ステッチ'
  },
  'Ghép góc nhìn bán phần': {
    en: 'Partial Panorama Stitching',
    fr: 'Assemblage panoramique partiel',
    zh: '半景视域拼接',
    ja: '部分パノラマステッチ'
  },
  'Gian phòng': {
    en: 'Exhibition Room',
    fr: 'Salle d\'exposition',
    zh: '展厅',
    ja: '展示室'
  },
  'Gian phòng chưa có file âm thanh thuyết minh nào trong Database': {
    en: 'Gian phòng chưa có file âm thanh thuyết minh nào trong Database',
    fr: 'Gian phòng chưa có file âm thanh thuyết minh nào trong Database',
    zh: 'Gian phòng chưa có file âm thanh thuyết minh nào trong Database',
    ja: 'Gian phòng chưa có file âm thanh thuyết minh nào trong Database'
  },
  'Gian trưng bày P-01: Thời kỳ Tiền - Sơ sử Việt Nam tại Bảo tàng Lịch sử TP.HCM. Nơi lưu giữ các hiện vật đá, đồ gốm, kim loại từ văn hóa Sơn Vi, Hòa Bình, Bắc Sơn đến Đông Sơn, Sa Huỳnh, Đồng Nai': {
    en: 'Gian trưng bày P-01: Thời kỳ Tiền - Sơ sử Việt Nam tại Bảo tàng Lịch sử TP.HCM. Nơi lưu giữ các hiện vật đá, đồ gốm, kim loại từ văn hóa Sơn Vi, Hòa Bình, Bắc Sơn đến Đông Sơn, Sa Huỳnh, Đồng Nai',
    fr: 'Gian trưng bày P-01: Thời kỳ Tiền - Sơ sử Việt Nam tại Bảo tàng Lịch sử TP.HCM. Nơi lưu giữ các hiện vật đá, đồ gốm, kim loại từ văn hóa Sơn Vi, Hòa Bình, Bắc Sơn đến Đông Sơn, Sa Huỳnh, Đồng Nai',
    zh: 'Gian trưng bày P-01: Thời kỳ Tiền - Sơ sử Việt Nam tại Bảo tàng Lịch sử TP.HCM. Nơi lưu giữ các hiện vật đá, đồ gốm, kim loại từ văn hóa Sơn Vi, Hòa Bình, Bắc Sơn đến Đông Sơn, Sa Huỳnh, Đồng Nai',
    ja: 'Gian trưng bày P-01: Thời kỳ Tiền - Sơ sử Việt Nam tại Bảo tàng Lịch sử TP.HCM. Nơi lưu giữ các hiện vật đá, đồ gốm, kim loại từ văn hóa Sơn Vi, Hòa Bình, Bắc Sơn đến Đông Sơn, Sa Huỳnh, Đồng Nai'
  },
  'Gian trưng bày P-05: Triều đại Nhà Nguyễn & Mỹ thuật Cung đình Huế (1802-1945). Trưng bày ngai vàng, long bào, sắc phong, đồ ngự dụng gốm sứ và bảo kiếm hoàng triều': {
    en: 'Gian trưng bày P-05: Triều đại Nhà Nguyễn & Mỹ thuật Cung đình Huế (1802-1945). Trưng bày ngai vàng, long bào, sắc phong, đồ ngự dụng gốm sứ và bảo kiếm hoàng triều',
    fr: 'Gian trưng bày P-05: Triều đại Nhà Nguyễn & Mỹ thuật Cung đình Huế (1802-1945). Trưng bày ngai vàng, long bào, sắc phong, đồ ngự dụng gốm sứ và bảo kiếm hoàng triều',
    zh: 'Gian trưng bày P-05: Triều đại Nhà Nguyễn & Mỹ thuật Cung đình Huế (1802-1945). Trưng bày ngai vàng, long bào, sắc phong, đồ ngự dụng gốm sứ và bảo kiếm hoàng triều',
    ja: 'Gian trưng bày P-05: Triều đại Nhà Nguyễn & Mỹ thuật Cung đình Huế (1802-1945). Trưng bày ngai vàng, long bào, sắc phong, đồ ngự dụng gốm sứ và bảo kiếm hoàng triều'
  },
  'Giới thiệu tổng quan': {
    en: 'General Introduction',
    fr: 'Introduction générale',
    zh: '展厅概述',
    ja: '概要紹介'
  },
  'Giữ lại': {
    en: 'Giữ lại',
    fr: 'Giữ lại',
    zh: 'Giữ lại',
    ja: 'Giữ lại'
  },
  'Góc': {
    en: 'Angle',
    fr: 'Angle',
    zh: '视角',
    ja: 'アングル'
  },
  'Góc cao: +': {
    en: 'Góc cao: +',
    fr: 'Góc cao: +',
    zh: 'Góc cao: +',
    ja: 'Góc cao: +'
  },
  'Góc mở rộng (FOV': {
    en: 'Field of View (FOV',
    fr: 'Champ de vision (FOV',
    zh: '视场范围 (FOV',
    ja: '視野角 (FOV'
  },
  'Góc ngước/cúi (Pitch': {
    en: 'Pitch Angle (Pitch',
    fr: 'Angle d\'inclinaison (Pitch',
    zh: '俯仰角 (Pitch',
    ja: '仰角・俯角 (Pitch'
  },
  'Góc nhìn': {
    en: 'View Angle',
    fr: 'Angle de vue',
    zh: '视线角度',
    ja: '視点'
  },
  'Góc nhìn ban đầu': {
    en: 'Initial View',
    fr: 'Vue initiale',
    zh: '初始朝向角度',
    ja: '初期アングル'
  },
  'Góc nhìn ban đầu (Góc siêu rộng 100°': {
    en: 'Initial View (Ultra-Wide 100° View',
    fr: 'Vue initiale (Ultra-large 100°',
    zh: '初始视角（100°超广角',
    ja: '初期視点（100°超広角'
  },
  'Góc nhìn ban đầu khi vào phòng': {
    en: 'Initial view angle when entering room',
    fr: 'Angle de vue initial en entrant dans la salle',
    zh: '访客初次进入展厅的迎面视角',
    ja: '入室時の初期アングル'
  },
  'Góc nhìn chính diện (Góc siêu rộng 100°': {
    en: 'Front View (Ultra-Wide 100° View',
    fr: 'Vue de face (Ultra-large 100°',
    zh: '正向主重视角（100°超广角',
    ja: '正面視野（100°超広角'
  },
  'Góc thấp': {
    en: 'Góc thấp',
    fr: 'Góc thấp',
    zh: 'Góc thấp',
    ja: 'Góc thấp'
  },
  'Góc tiếp': {
    en: 'Góc tiếp',
    fr: 'Góc tiếp',
    zh: 'Góc tiếp',
    ja: 'Góc tiếp'
  },
  'Góc xoay ngang (Yaw': {
    en: 'Horizontal Rotation (Yaw',
    fr: 'Rotation horizontale (Yaw',
    zh: '水平旋转角 (Yaw',
    ja: '水平回転角 (Yaw'
  },
  'Gỡ bỏ Voice AI': {
    en: 'Remove Voice AI',
    fr: 'Supprimer voix IA',
    zh: '移除AI语音',
    ja: 'AI音声を削除'
  },
  'Gỡ bỏ file Voice AI': {
    en: 'Remove Voice AI File',
    fr: 'Supprimer le fichier vocal IA',
    zh: '删除AI解说音频文件',
    ja: 'AI音声ファイルを削除'
  },
  'Gỡ bỏ file Voice AI Tiếng Việt khỏi phòng này': {
    en: 'Remove Vietnamese Voice AI file from this room',
    fr: 'Supprimer le fichier vocal vietnamien de cette salle',
    zh: '从当前展厅移除越南语AI解说音频',
    ja: 'この展示室からベトナム語AI音声を削除'
  },
  'Gỡ bỏ file âm thanh thuyết minh của [': {
    en: 'Gỡ bỏ file âm thanh thuyết minh của [',
    fr: 'Gỡ bỏ file âm thanh thuyết minh của [',
    zh: 'Gỡ bỏ file âm thanh thuyết minh của [',
    ja: 'Gỡ bỏ file âm thanh thuyết minh của ['
  },
  'Gỡ bỏ khỏi phòng': {
    en: 'Remove from room',
    fr: 'Retirer de la salle',
    zh: '从展厅中移除',
    ja: '展示室から削除'
  },
  'Gỡ bỏ ngôn ngữ [': {
    en: 'Gỡ bỏ ngôn ngữ [',
    fr: 'Gỡ bỏ ngôn ngữ [',
    zh: 'Gỡ bỏ ngôn ngữ [',
    ja: 'Gỡ bỏ ngôn ngữ ['
  },
  'Gửi lại mã sau': {
    en: 'Resend code in',
    fr: 'Renvoyer le code dans',
    zh: '重新发送验证码倒计时：',
    ja: 'コード再送信まで：'
  },
  'Gửi mã xác thực': {
    en: 'Send Verification Code',
    fr: 'Envoyer le code de vérification',
    zh: '发送安全验证码',
    ja: '認証コードを送信'
  },
  'Hiện vật & Điểm khảo cứu': {
    en: 'Artifacts & Research Points',
    fr: 'Objets & Points d\'étude',
    zh: '重点文物与学术考证点',
    ja: '文化財＆調査研究スポット'
  },
  'Hiệu ứng Quả cầu hành tinh tí hon (Little Planet': {
    en: 'Little Planet Globe Effect',
    fr: 'Effet Sphère Petite Planète',
    zh: '小行星球体透视特效',
    ja: 'リトルプラネット球体効果'
  },
  'Hy Lạp': {
    en: 'Greek',
    fr: 'Grec',
    zh: '希腊语',
    ja: 'ギリシャ語'
  },
  'Hà Lan': {
    en: 'Dutch',
    fr: 'Néerlandais',
    zh: '荷兰语',
    ja: 'オランダ語'
  },
  'Hàn Quốc': {
    en: 'Korean',
    fr: 'Coréen',
    zh: '韩语',
    ja: '韓国語'
  },
  'Hãy chúc máy xuống sàn (-30°) để quét cận cảnh sàn và hiện vật': {
    en: 'Tilt camera down to floor (-30°) to capture floor & artifacts closely',
    fr: 'Inclinez la caméra vers le bas (-30°) pour capturer le sol et les objets',
    zh: '请将镜头朝下倾斜（-30°）以近距离捕捉展厅地面与展柜基座',
    ja: '床面と展示品を捉えるためカメラを床側（-30°）に向けてください'
  },
  'Hãy sử dụng tính năng "Tạo ảnh toàn cảnh 360°" ở thanh điều hướng bên trái để chụp hoặc ghép ảnh đầu tiên': {
    en: 'Hãy sử dụng tính năng "Tạo ảnh toàn cảnh 360°" ở thanh điều hướng bên trái để chụp hoặc ghép ảnh đầu tiên',
    fr: 'Hãy sử dụng tính năng "Tạo ảnh toàn cảnh 360°" ở thanh điều hướng bên trái để chụp hoặc ghép ảnh đầu tiên',
    zh: 'Hãy sử dụng tính năng "Tạo ảnh toàn cảnh 360°" ở thanh điều hướng bên trái để chụp hoặc ghép ảnh đầu tiên',
    ja: 'Hãy sử dụng tính năng "Tạo ảnh toàn cảnh 360°" ở thanh điều hướng bên trái để chụp hoặc ghép ảnh đầu tiên'
  },
  'Hãy xoay khung nhìn 360° đến góc bạn muốn trước khi lưu': {
    en: 'Please rotate 360° viewport to desired angle before saving',
    fr: 'Faites pivoter la vue 360° vers l\'angle souhaité avant d\'enregistrer',
    zh: '保存前请先将360°视野旋转到您期望的最佳朝向角度',
    ja: '保存する前に360°ビューを希望のアングルに合わせてください'
  },
  'Hướng dẫn kỹ thuật chụp ảnh 360°': {
    en: '360° Panorama Photography Technical Guide',
    fr: 'Guide technique de photographie panoramique 360°',
    zh: '360°全景空间拍摄技术指南',
    ja: '360°パノラマ撮影技術ガイド'
  },
  'HỆ THỐNG TOUR 360 BẢO TÀNG': {
    en: 'MUSEUM 360 TOUR SYSTEM',
    fr: 'SYSTÈME TOUR 360 DU MUSÉE',
    zh: '博物馆360°全景虚拟漫游系统',
    ja: '博物館360°ツアーシステム'
  },
  'Hệ Thống Đang Nâng Cấp & Bảo Trì': {
    en: 'System Undergoing Upgrade & Maintenance',
    fr: 'Système en cours de mise à niveau et maintenance',
    zh: '系统正在升级维护中',
    ja: 'システム更新およびメンテナンス中'
  },
  'Hệ thống đang cập nhật dữ liệu hiện vật và bảo trì định kỳ không gian di sản 360. Trình duyệt sẽ tự động kết nối lại khi hoàn tất': {
    en: 'System is updating artifact archives and performing scheduled maintenance. Browser will automatically reconnect when ready.',
    fr: 'Le système met à jour les données et effectue une maintenance périodique. Reconnexion automatique une fois terminé.',
    zh: '系统正在更新文物数据库并进行360°空间例行维护。完成后浏览器将自动重新连接。',
    ja: '文化財データの更新および360°遺産空間の定期メンテナンスを実施中です。完了次第自動的に再接続されます。'
  },
  'Không Gian 360° Studio (Cảm Biến Góc Xoay': {
    en: '360° Studio Space (Rotation Sensor',
    fr: 'Espace Studio 360° (Capteur de rotation',
    zh: '360°全景工坊（旋转传感器',
    ja: '360°空間スタジオ（回転センサー'
  },
  'Không gian lưu giữ di sản văn hóa, trang phục hoàng gia, ấn tín cửu đỉnh và nghệ thuật pháp lam dưới triều đại nhà Nguyễn (1802 - 1945': {
    en: 'Preserves royal cultural heritage, imperial robes, royal seals, and Hue enamel arts under the Nguyen Dynasty (1802-1945)',
    fr: 'Conserve le patrimoine royal, costumes, sceaux impériaux et émaux sous la dynastie des Nguyen (1802-1945)',
    zh: '珍藏阮朝（1802-1945）皇室文化遗产、御用服饰、九鼎御玺及顺化珐琅艺术',
    ja: '阮朝（1802-1945）の皇室文化遺産、衣装、国璽、フエ琺瑯工芸品を収蔵'
  },
  'Không gian này mang lại cho quý khách cái nhìn chân thực về các di sản tiêu biểu': {
    en: 'Không gian này mang lại cho quý khách cái nhìn chân thực về các di sản tiêu biểu',
    fr: 'Không gian này mang lại cho quý khách cái nhìn chân thực về các di sản tiêu biểu',
    zh: 'Không gian này mang lại cho quý khách cái nhìn chân thực về các di sản tiêu biểu',
    ja: 'Không gian này mang lại cho quý khách cái nhìn chân thực về các di sản tiêu biểu'
  },
  'Không nhận được mã? Gửi lại mã': {
    en: 'Không nhận được mã? Gửi lại mã',
    fr: 'Không nhận được mã? Gửi lại mã',
    zh: 'Không nhận được mã? Gửi lại mã',
    ja: 'Không nhận được mã? Gửi lại mã'
  },
  'Không thể gửi mã xác thực': {
    en: 'Unable to gửi mã xác thực',
    fr: 'Impossible de gửi mã xác thực',
    zh: '无法gửi mã xác thực',
    ja: 'gửi mã xác thựcできません'
  },
  'Không thể hiển thị thành phần này': {
    en: 'Unable to hiển thị thành phần này',
    fr: 'Impossible de hiển thị thành phần này',
    zh: '无法hiển thị thành phần này',
    ja: 'hiển thị thành phần nàyできません'
  },
  'Không thể mở Camera': {
    en: 'Unable to mở Camera',
    fr: 'Impossible de mở Camera',
    zh: '无法mở Camera',
    ja: 'mở Cameraできません'
  },
  'Không thể tải danh sách ảnh 360° từ máy chủ': {
    en: 'Unable to tải danh sách ảnh 360° từ máy chủ',
    fr: 'Impossible de tải danh sách ảnh 360° từ máy chủ',
    zh: '无法tải danh sách ảnh 360° từ máy chủ',
    ja: 'tải danh sách ảnh 360° từ máy chủできません'
  },
  'Không thể tải file âm thanh từ máy chủ': {
    en: 'Unable to tải file âm thanh từ máy chủ',
    fr: 'Impossible de tải file âm thanh từ máy chủ',
    zh: '无法tải file âm thanh từ máy chủ',
    ja: 'tải file âm thanh từ máy chủできません'
  },
  'Không thể vô hiệu hóa ngôn ngữ gốc mặc định (Tiếng Việt': {
    en: 'Unable to vô hiệu hóa ngôn ngữ gốc mặc định (Tiếng Việt',
    fr: 'Impossible de vô hiệu hóa ngôn ngữ gốc mặc định (Tiếng Việt',
    zh: '无法vô hiệu hóa ngôn ngữ gốc mặc định (Tiếng Việt',
    ja: 'vô hiệu hóa ngôn ngữ gốc mặc định (Tiếng Việtできません'
  },
  'Không thể xóa chuyên đề "': {
    en: 'Unable to xóa chuyên đề "',
    fr: 'Impossible de xóa chuyên đề "',
    zh: '无法xóa chuyên đề "',
    ja: 'xóa chuyên đề "できません'
  },
  'Không thể xóa ngôn ngữ mặc định của hệ thống': {
    en: 'Unable to xóa ngôn ngữ mặc định của hệ thống',
    fr: 'Impossible de xóa ngôn ngữ mặc định của hệ thống',
    zh: '无法xóa ngôn ngữ mặc định của hệ thống',
    ja: 'xóa ngôn ngữ mặc định của hệ thốngできません'
  },
  'Không tìm thấy gian phòng nào khớp với từ khóa "': {
    en: 'Không tìm thấy gian phòng nào khớp với từ khóa "',
    fr: 'Không tìm thấy gian phòng nào khớp với từ khóa "',
    zh: 'Không tìm thấy gian phòng nào khớp với từ khóa "',
    ja: 'Không tìm thấy gian phòng nào khớp với từ khóa "'
  },
  'Không tìm thấy gian phòng phù hợp': {
    en: 'Không tìm thấy gian phòng phù hợp',
    fr: 'Không tìm thấy gian phòng phù hợp',
    zh: 'Không tìm thấy gian phòng phù hợp',
    ja: 'Không tìm thấy gian phòng phù hợp'
  },
  'Không tìm thấy phòng đích (Mã phòng': {
    en: 'Không tìm thấy phòng đích (Mã phòng',
    fr: 'Không tìm thấy phòng đích (Mã phòng',
    zh: 'Không tìm thấy phòng đích (Mã phòng',
    ja: 'Không tìm thấy phòng đích (Mã phòng'
  },
  'Không tìm thấy webcam khả dụng trên máy này. Vui lòng dùng nút "Chọn từ máy': {
    en: 'Không tìm thấy webcam khả dụng trên máy này. Vui lòng dùng nút "Chọn từ máy',
    fr: 'Không tìm thấy webcam khả dụng trên máy này. Vui lòng dùng nút "Chọn từ máy',
    zh: 'Không tìm thấy webcam khả dụng trên máy này. Vui lòng dùng nút "Chọn từ máy',
    ja: 'Không tìm thấy webcam khả dụng trên máy này. Vui lòng dùng nút "Chọn từ máy'
  },
  'Không tìm thấy ảnh 360° nào khớp với từ khóa "': {
    en: 'Không tìm thấy ảnh 360° nào khớp với từ khóa "',
    fr: 'Không tìm thấy ảnh 360° nào khớp với từ khóa "',
    zh: 'Không tìm thấy ảnh 360° nào khớp với từ khóa "',
    ja: 'Không tìm thấy ảnh 360° nào khớp với từ khóa "'
  },
  'Không tìm thấy ảnh 360° phù hợp': {
    en: 'Không tìm thấy ảnh 360° phù hợp',
    fr: 'Không tìm thấy ảnh 360° phù hợp',
    zh: 'Không tìm thấy ảnh 360° phù hợp',
    ja: 'Không tìm thấy ảnh 360° phù hợp'
  },
  'Khảo cổ học Tiền - Sơ sử Việt Nam': {
    en: 'Khảo cổ học Tiền - Sơ sử Việt Nam',
    fr: 'Khảo cổ học Tiền - Sơ sử Việt Nam',
    zh: 'Khảo cổ học Tiền - Sơ sử Việt Nam',
    ja: 'Khảo cổ học Tiền - Sơ sử Việt Nam'
  },
  'Kích thước file ảnh logo không được vượt quá 5MB': {
    en: 'Kích thước file ảnh logo không được vượt quá 5MB',
    fr: 'Kích thước file ảnh logo không được vượt quá 5MB',
    zh: 'Kích thước file ảnh logo không được vượt quá 5MB',
    ja: 'Kích thước file ảnh logo không được vượt quá 5MB'
  },
  'Kính chào quý khách đến với': {
    en: 'Kính chào quý khách đến với',
    fr: 'Kính chào quý khách đến với',
    zh: 'Kính chào quý khách đến với',
    ja: 'Kính chào quý khách đến với'
  },
  'Kính chào quý khách đến với Gian trưng bày Thời tiền sử và sơ sử Việt Nam. Nơi đây tái hiện dòng chảy lịch sử hàng vạn năm của dân tộc qua hàng trăm cổ vật đá, đồ đồng Đông Sơn và mộ chum Sa Huỳnh độc bản': {
    en: 'Kính chào quý khách đến với Gian trưng bày Thời tiền sử và sơ sử Việt Nam. Nơi đây tái hiện dòng chảy lịch sử hàng vạn năm của dân tộc qua hàng trăm cổ vật đá, đồ đồng Đông Sơn và mộ chum Sa Huỳnh độc bản',
    fr: 'Kính chào quý khách đến với Gian trưng bày Thời tiền sử và sơ sử Việt Nam. Nơi đây tái hiện dòng chảy lịch sử hàng vạn năm của dân tộc qua hàng trăm cổ vật đá, đồ đồng Đông Sơn và mộ chum Sa Huỳnh độc bản',
    zh: 'Kính chào quý khách đến với Gian trưng bày Thời tiền sử và sơ sử Việt Nam. Nơi đây tái hiện dòng chảy lịch sử hàng vạn năm của dân tộc qua hàng trăm cổ vật đá, đồ đồng Đông Sơn và mộ chum Sa Huỳnh độc bản',
    ja: 'Kính chào quý khách đến với Gian trưng bày Thời tiền sử và sơ sử Việt Nam. Nơi đây tái hiện dòng chảy lịch sử hàng vạn năm của dân tộc qua hàng trăm cổ vật đá, đồ đồng Đông Sơn và mộ chum Sa Huỳnh độc bản'
  },
  'Kính chào quý khách. Đây là không gian trưng bày di sản triều Nguyễn - triều đại phong kiến cuối cùng của Việt Nam. Nơi quý khách được chiêm ngưỡng đỉnh cao của nghệ thuật pháp lam, trang phục cung đình và những cổ vật gắn liền với công cuộc định đô khai hoang phương Nam': {
    en: 'Kính chào quý khách. Đây là không gian trưng bày di sản triều Nguyễn - triều đại phong kiến cuối cùng của Việt Nam. Nơi quý khách được chiêm ngưỡng đỉnh cao của nghệ thuật pháp lam, trang phục cung đình và những cổ vật gắn liền với công cuộc định đô khai hoang phương Nam',
    fr: 'Kính chào quý khách. Đây là không gian trưng bày di sản triều Nguyễn - triều đại phong kiến cuối cùng của Việt Nam. Nơi quý khách được chiêm ngưỡng đỉnh cao của nghệ thuật pháp lam, trang phục cung đình và những cổ vật gắn liền với công cuộc định đô khai hoang phương Nam',
    zh: 'Kính chào quý khách. Đây là không gian trưng bày di sản triều Nguyễn - triều đại phong kiến cuối cùng của Việt Nam. Nơi quý khách được chiêm ngưỡng đỉnh cao của nghệ thuật pháp lam, trang phục cung đình và những cổ vật gắn liền với công cuộc định đô khai hoang phương Nam',
    ja: 'Kính chào quý khách. Đây là không gian trưng bày di sản triều Nguyễn - triều đại phong kiến cuối cùng của Việt Nam. Nơi quý khách được chiêm ngưỡng đỉnh cao của nghệ thuật pháp lam, trang phục cung đình và những cổ vật gắn liền với công cuộc định đô khai hoang phương Nam'
  },
  'Kính mời quý khách chiêm ngưỡng nghệ thuật điêu khắc sa thạch Champa huyền bí. Từng khối đá vô tri qua bàn tay tài hoa của nghệ nhân xưa đã trở thành những tượng thần Shiva uy nghiêm và vũ nữ Apsara mềm mại uyển chuyển lưu dấu ngàn năm': {
    en: 'Kính mời quý khách chiêm ngưỡng nghệ thuật điêu khắc sa thạch Champa huyền bí. Từng khối đá vô tri qua bàn tay tài hoa của nghệ nhân xưa đã trở thành những tượng thần Shiva uy nghiêm và vũ nữ Apsara mềm mại uyển chuyển lưu dấu ngàn năm',
    fr: 'Kính mời quý khách chiêm ngưỡng nghệ thuật điêu khắc sa thạch Champa huyền bí. Từng khối đá vô tri qua bàn tay tài hoa của nghệ nhân xưa đã trở thành những tượng thần Shiva uy nghiêm và vũ nữ Apsara mềm mại uyển chuyển lưu dấu ngàn năm',
    zh: 'Kính mời quý khách chiêm ngưỡng nghệ thuật điêu khắc sa thạch Champa huyền bí. Từng khối đá vô tri qua bàn tay tài hoa của nghệ nhân xưa đã trở thành những tượng thần Shiva uy nghiêm và vũ nữ Apsara mềm mại uyển chuyển lưu dấu ngàn năm',
    ja: 'Kính mời quý khách chiêm ngưỡng nghệ thuật điêu khắc sa thạch Champa huyền bí. Từng khối đá vô tri qua bàn tay tài hoa của nghệ nhân xưa đã trở thành những tượng thần Shiva uy nghiêm và vũ nữ Apsara mềm mại uyển chuyển lưu dấu ngàn năm'
  },
  'Kịch bản đọc phát âm chuẩn cho du khách quốc tế': {
    en: 'Kịch bản đọc phát âm chuẩn cho du khách quốc tế',
    fr: 'Kịch bản đọc phát âm chuẩn cho du khách quốc tế',
    zh: 'Kịch bản đọc phát âm chuẩn cho du khách quốc tế',
    ja: 'Kịch bản đọc phát âm chuẩn cho du khách quốc tế'
  },
  'Lecture de l’échantillon vocal IA': {
    en: 'Lecture de l’échantillon vocal IA',
    fr: 'Lecture de l’échantillon vocal IA',
    zh: 'Lecture de l’échantillon vocal IA',
    ja: 'Lecture de l’échantillon vocal IA'
  },
  'Logo bảo tàng': {
    en: 'Logo bảo tàng',
    fr: 'Logo bảo tàng',
    zh: 'Logo bảo tàng',
    ja: 'Logo bảo tàng'
  },
  'Lào': {
    en: 'Lào',
    fr: 'Lào',
    zh: 'Lào',
    ja: 'Lào'
  },
  'Lưu góc nhìn hiện tại làm góc mở màn khi vào phòng': {
    en: 'Lưu góc nhìn hiện tại làm góc mở màn khi vào phòng',
    fr: 'Lưu góc nhìn hiện tại làm góc mở màn khi vào phòng',
    zh: 'Lưu góc nhìn hiện tại làm góc mở màn khi vào phòng',
    ja: 'Lưu góc nhìn hiện tại làm góc mở màn khi vào phòng'
  },
  'Lưu góc nhìn hiện tại làm góc mở đầu': {
    en: 'Lưu góc nhìn hiện tại làm góc mở đầu',
    fr: 'Lưu góc nhìn hiện tại làm góc mở đầu',
    zh: 'Lưu góc nhìn hiện tại làm góc mở đầu',
    ja: 'Lưu góc nhìn hiện tại làm góc mở đầu'
  },
  'Lưu góc đang nhìn làm mặc định': {
    en: 'Lưu góc đang nhìn làm mặc định',
    fr: 'Lưu góc đang nhìn làm mặc định',
    zh: 'Lưu góc đang nhìn làm mặc định',
    ja: 'Lưu góc đang nhìn làm mặc định'
  },
  'Lưu lời thuyết minh': {
    en: 'Lưu lời thuyết minh',
    fr: 'Lưu lời thuyết minh',
    zh: 'Lưu lời thuyết minh',
    ja: 'Lưu lời thuyết minh'
  },
  'Lưu thay đổi vào Database': {
    en: 'Lưu thay đổi vào Database',
    fr: 'Lưu thay đổi vào Database',
    zh: 'Lưu thay đổi vào Database',
    ja: 'Lưu thay đổi vào Database'
  },
  'Lưu tư liệu phòng': {
    en: 'Lưu tư liệu phòng',
    fr: 'Lưu tư liệu phòng',
    zh: 'Lưu tư liệu phòng',
    ja: 'Lưu tư liệu phòng'
  },
  'Lưu ý: Bạn mới nạp': {
    en: 'Lưu ý: Bạn mới nạp',
    fr: 'Lưu ý: Bạn mới nạp',
    zh: 'Lưu ý: Bạn mới nạp',
    ja: 'Lưu ý: Bạn mới nạp'
  },
  'Lưu điểm liên kết': {
    en: 'Lưu điểm liên kết',
    fr: 'Lưu điểm liên kết',
    zh: 'Lưu điểm liên kết',
    ja: 'Lưu điểm liên kết'
  },
  'Lượt quét QR': {
    en: 'Lượt quét QR',
    fr: 'Lượt quét QR',
    zh: 'Lượt quét QR',
    ja: 'Lượt quét QR'
  },
  'Lượt quét QR thực': {
    en: 'Lượt quét QR thực',
    fr: 'Lượt quét QR thực',
    zh: 'Lượt quét QR thực',
    ja: 'Lượt quét QR thực'
  },
  'Lấy góc nhìn hiện tại bạn đang xoay trong khung 360 làm góc mặc định': {
    en: 'Lấy góc nhìn hiện tại bạn đang xoay trong khung 360 làm góc mặc định',
    fr: 'Lấy góc nhìn hiện tại bạn đang xoay trong khung 360 làm góc mặc định',
    zh: 'Lấy góc nhìn hiện tại bạn đang xoay trong khung 360 làm góc mặc định',
    ja: 'Lấy góc nhìn hiện tại bạn đang xoay trong khung 360 làm góc mặc định'
  },
  'Lối sang': {
    en: 'Lối sang',
    fr: 'Lối sang',
    zh: 'Lối sang',
    ja: 'Lối sang'
  },
  'Lối sang gian tiếp theo': {
    en: 'Lối sang gian tiếp theo',
    fr: 'Lối sang gian tiếp theo',
    zh: 'Lối sang gian tiếp theo',
    ja: 'Lối sang gian tiếp theo'
  },
  'Lối sang gian tiền sử': {
    en: 'Lối sang gian tiền sử',
    fr: 'Lối sang gian tiền sử',
    zh: 'Lối sang gian tiền sử',
    ja: 'Lối sang gian tiền sử'
  },
  'Lối tham quan tiếp theo': {
    en: 'Lối tham quan tiếp theo',
    fr: 'Lối tham quan tiếp theo',
    zh: 'Lối tham quan tiếp theo',
    ja: 'Lối tham quan tiếp theo'
  },
  'Lỗi cập nhật bảo trì': {
    en: 'Error: updating bảo trì',
    fr: 'Erreur lors de mise à jour de bảo trì',
    zh: '更新bảo trì失败',
    ja: 'bảo trì更新エラー'
  },
  'Lỗi cập nhật chuyên đề': {
    en: 'Error: updating chuyên đề',
    fr: 'Erreur lors de mise à jour de chuyên đề',
    zh: '更新chuyên đề失败',
    ja: 'chuyên đề更新エラー'
  },
  'Lỗi cập nhật chế độ bảo trì': {
    en: 'Error: updating chế độ bảo trì',
    fr: 'Erreur lors de mise à jour de chế độ bảo trì',
    zh: '更新chế độ bảo trì失败',
    ja: 'chế độ bảo trì更新エラー'
  },
  'Lỗi cập nhật gian phòng': {
    en: 'Error: updating gian phòng',
    fr: 'Erreur lors de mise à jour de gian phòng',
    zh: '更新gian phòng失败',
    ja: 'gian phòng更新エラー'
  },
  'Lỗi cập nhật góc nhìn mặc định': {
    en: 'Error: updating góc nhìn mặc định',
    fr: 'Erreur lors de mise à jour de góc nhìn mặc định',
    zh: '更新góc nhìn mặc định失败',
    ja: 'góc nhìn mặc định更新エラー'
  },
  'Lỗi cập nhật liên kết ảnh 360': {
    en: 'Error: updating liên kết ảnh 360',
    fr: 'Erreur lors de mise à jour de liên kết ảnh 360',
    zh: '更新liên kết ảnh 360失败',
    ja: 'liên kết ảnh 360更新エラー'
  },
  'Lỗi cập nhật ngôn ngữ': {
    en: 'Error: updating ngôn ngữ',
    fr: 'Erreur lors de mise à jour de ngôn ngữ',
    zh: '更新ngôn ngữ失败',
    ja: 'ngôn ngữ更新エラー'
  },
  'Lỗi cập nhật nhận diện bảo tàng': {
    en: 'Error: updating nhận diện bảo tàng',
    fr: 'Erreur lors de mise à jour de nhận diện bảo tàng',
    zh: '更新nhận diện bảo tàng失败',
    ja: 'nhận diện bảo tàng更新エラー'
  },
  'Lỗi cập nhật phòng': {
    en: 'Error: updating phòng',
    fr: 'Erreur lors de mise à jour de phòng',
    zh: '更新phòng失败',
    ja: 'phòng更新エラー'
  },
  'Lỗi cập nhật trạng thái ngôn ngữ': {
    en: 'Error: updating trạng thái ngôn ngữ',
    fr: 'Erreur lors de mise à jour de trạng thái ngôn ngữ',
    zh: '更新trạng thái ngôn ngữ失败',
    ja: 'trạng thái ngôn ngữ更新エラー'
  },
  'Lỗi cập nhật vai trò': {
    en: 'Error: updating vai trò',
    fr: 'Erreur lors de mise à jour de vai trò',
    zh: '更新vai trò失败',
    ja: 'vai trò更新エラー'
  },
  'Lỗi dịch thuật AI': {
    en: 'Error: dịch thuật AI',
    fr: 'Erreur lors de dịch thuật AI',
    zh: 'dịch thuật AI失败',
    ja: 'dịch thuật AIエラー'
  },
  'Lỗi gửi mã OTP': {
    en: 'Error: gửi mã OTP',
    fr: 'Erreur lors de gửi mã OTP',
    zh: 'gửi mã OTP失败',
    ja: 'gửi mã OTPエラー'
  },
  'Lỗi khi dịch AI': {
    en: 'Error: khi dịch AI',
    fr: 'Erreur lors de khi dịch AI',
    zh: 'khi dịch AI失败',
    ja: 'khi dịch AIエラー'
  },
  'Lỗi khi gửi mã xác thực OTP': {
    en: 'Error: khi gửi mã xác thực OTP',
    fr: 'Erreur lors de khi gửi mã xác thực OTP',
    zh: 'khi gửi mã xác thực OTP失败',
    ja: 'khi gửi mã xác thực OTPエラー'
  },
  'Lỗi khi lưu tư liệu': {
    en: 'Error: khi lưu tư liệu',
    fr: 'Erreur lors de khi lưu tư liệu',
    zh: 'khi lưu tư liệu失败',
    ja: 'khi lưu tư liệuエラー'
  },
  'Lỗi khi tạo Voice AI': {
    en: 'Error: khi tạo Voice AI',
    fr: 'Erreur lors de khi tạo Voice AI',
    zh: 'khi tạo Voice AI失败',
    ja: 'khi tạo Voice AIエラー'
  },
  'Lỗi khi tải dữ liệu phòng': {
    en: 'Error: khi tải dữ liệu phòng',
    fr: 'Erreur lors de khi tải dữ liệu phòng',
    zh: 'khi tải dữ liệu phòng失败',
    ja: 'khi tải dữ liệu phòngエラー'
  },
  'Lỗi khi tải file ảnh logo': {
    en: 'Error: khi tải file ảnh logo',
    fr: 'Erreur lors de khi tải file ảnh logo',
    zh: 'khi tải file ảnh logo失败',
    ja: 'khi tải file ảnh logoエラー'
  },
  'Lỗi khi tải ảnh lên': {
    en: 'Error: khi tải ảnh lên',
    fr: 'Erreur lors de khi tải ảnh lên',
    zh: 'khi tải ảnh lên失败',
    ja: 'khi tải ảnh lênエラー'
  },
  'Lỗi khi xóa file ảnh': {
    en: 'Error: khi xóa file ảnh',
    fr: 'Erreur lors de khi xóa file ảnh',
    zh: 'khi xóa file ảnh失败',
    ja: 'khi xóa file ảnhエラー'
  },
  'Lỗi khi xóa gian phòng': {
    en: 'Error: khi xóa gian phòng',
    fr: 'Erreur lors de khi xóa gian phòng',
    zh: 'khi xóa gian phòng失败',
    ja: 'khi xóa gian phòngエラー'
  },
  'Lỗi khi xóa ngôn ngữ': {
    en: 'Error: khi xóa ngôn ngữ',
    fr: 'Erreur lors de khi xóa ngôn ngữ',
    zh: 'khi xóa ngôn ngữ失败',
    ja: 'khi xóa ngôn ngữエラー'
  },
  'Lỗi khi xóa điểm liên kết': {
    en: 'Error: khi xóa điểm liên kết',
    fr: 'Erreur lors de khi xóa điểm liên kết',
    zh: 'khi xóa điểm liên kết失败',
    ja: 'khi xóa điểm liên kếtエラー'
  },
  'Lỗi khi xóa ảnh': {
    en: 'Error: khi xóa ảnh',
    fr: 'Erreur lors de khi xóa ảnh',
    zh: 'khi xóa ảnh失败',
    ja: 'khi xóa ảnhエラー'
  },
  'Lỗi khởi tạo trình xem 360°': {
    en: 'Error: khởi tạo trình xem 360°',
    fr: 'Erreur lors de khởi tạo trình xem 360°',
    zh: 'khởi tạo trình xem 360°失败',
    ja: 'khởi tạo trình xem 360°エラー'
  },
  'Lỗi kiểm tra': {
    en: 'Error: kiểm tra',
    fr: 'Erreur lors de kiểm tra',
    zh: 'kiểm tra失败',
    ja: 'kiểm traエラー'
  },
  'Lỗi kết nối máy chủ': {
    en: 'Error: kết nối máy chủ',
    fr: 'Erreur lors de kết nối máy chủ',
    zh: 'kết nối máy chủ失败',
    ja: 'kết nối máy chủエラー'
  },
  'Lỗi kết nối máy chủ hoặc thuật toán ghép ảnh': {
    en: 'Error: kết nối máy chủ hoặc thuật toán ghép ảnh',
    fr: 'Erreur lors de kết nối máy chủ hoặc thuật toán ghép ảnh',
    zh: 'kết nối máy chủ hoặc thuật toán ghép ảnh失败',
    ja: 'kết nối máy chủ hoặc thuật toán ghép ảnhエラー'
  },
  'Lỗi kết nối máy chủ khi làm mới dữ liệu': {
    en: 'Error: kết nối máy chủ khi làm mới dữ liệu',
    fr: 'Erreur lors de kết nối máy chủ khi làm mới dữ liệu',
    zh: 'kết nối máy chủ khi làm mới dữ liệu失败',
    ja: 'kết nối máy chủ khi làm mới dữ liệuエラー'
  },
  'Lỗi làm mới danh mục ngôn ngữ': {
    en: 'Error: làm mới danh mục ngôn ngữ',
    fr: 'Erreur lors de làm mới danh mục ngôn ngữ',
    zh: 'làm mới danh mục ngôn ngữ失败',
    ja: 'làm mới danh mục ngôn ngữエラー'
  },
  'Lỗi làm mới dữ liệu từ máy chủ': {
    en: 'Error: làm mới dữ liệu từ máy chủ',
    fr: 'Erreur lors de làm mới dữ liệu từ máy chủ',
    zh: 'làm mới dữ liệu từ máy chủ失败',
    ja: 'làm mới dữ liệu từ máy chủエラー'
  },
  'Lỗi lưu cấu hình': {
    en: 'Error: saving cấu hình',
    fr: 'Erreur lors de enregistrement de cấu hình',
    zh: '保存cấu hình失败',
    ja: 'cấu hình保存エラー'
  },
  'Lỗi lưu cấu hình nhận diện': {
    en: 'Error: saving cấu hình nhận diện',
    fr: 'Erreur lors de enregistrement de cấu hình nhận diện',
    zh: '保存cấu hình nhận diện失败',
    ja: 'cấu hình nhận diện保存エラー'
  },
  'Lỗi lưu góc nhìn mặc định': {
    en: 'Error: saving góc nhìn mặc định',
    fr: 'Erreur lors de enregistrement de góc nhìn mặc định',
    zh: '保存góc nhìn mặc định失败',
    ja: 'góc nhìn mặc định保存エラー'
  },
  'Lỗi lưu lời thuyết minh': {
    en: 'Error: saving lời thuyết minh',
    fr: 'Erreur lors de enregistrement de lời thuyết minh',
    zh: '保存lời thuyết minh失败',
    ja: 'lời thuyết minh保存エラー'
  },
  'Lỗi lưu điểm liên kết': {
    en: 'Error: saving điểm liên kết',
    fr: 'Erreur lors de enregistrement de điểm liên kết',
    zh: '保存điểm liên kết失败',
    ja: 'điểm liên kết保存エラー'
  },
  'Lỗi nạp dữ liệu cấu hình': {
    en: 'Error: nạp dữ liệu cấu hình',
    fr: 'Erreur lors de nạp dữ liệu cấu hình',
    zh: 'nạp dữ liệu cấu hình失败',
    ja: 'nạp dữ liệu cấu hìnhエラー'
  },
  'Lỗi phân tích chất lượng ảnh': {
    en: 'Error: phân tích chất lượng ảnh',
    fr: 'Erreur lors de phân tích chất lượng ảnh',
    zh: 'phân tích chất lượng ảnh失败',
    ja: 'phân tích chất lượng ảnhエラー'
  },
  'Lỗi sinh file âm thanh Voice AI': {
    en: 'Error: sinh file âm thanh Voice AI',
    fr: 'Erreur lors de sinh file âm thanh Voice AI',
    zh: 'sinh file âm thanh Voice AI失败',
    ja: 'sinh file âm thanh Voice AIエラー'
  },
  'Lỗi thêm chuyên đề': {
    en: 'Error: adding chuyên đề',
    fr: 'Erreur lors de l\'ajout de chuyên đề',
    zh: '添加chuyên đề失败',
    ja: 'chuyên đề追加エラー'
  },
  'Lỗi thêm chuyên đề mới': {
    en: 'Error: adding chuyên đề mới',
    fr: 'Erreur lors de l\'ajout de chuyên đề mới',
    zh: '添加chuyên đề mới失败',
    ja: 'chuyên đề mới追加エラー'
  },
  'Lỗi thêm gian phòng mới': {
    en: 'Error: adding gian phòng mới',
    fr: 'Erreur lors de l\'ajout de gian phòng mới',
    zh: '添加gian phòng mới失败',
    ja: 'gian phòng mới追加エラー'
  },
  'Lỗi thêm ngôn ngữ': {
    en: 'Error: adding ngôn ngữ',
    fr: 'Erreur lors de l\'ajout de ngôn ngữ',
    zh: '添加ngôn ngữ失败',
    ja: 'ngôn ngữ追加エラー'
  },
  'Lỗi thêm phòng mới': {
    en: 'Error: adding phòng mới',
    fr: 'Erreur lors de l\'ajout de phòng mới',
    zh: '添加phòng mới失败',
    ja: 'phòng mới追加エラー'
  },
  'Lỗi thêm điểm liên kết': {
    en: 'Error: adding điểm liên kết',
    fr: 'Erreur lors de l\'ajout de điểm liên kết',
    zh: '添加điểm liên kết失败',
    ja: 'điểm liên kết追加エラー'
  },
  'Lỗi thẩm định': {
    en: 'Error: thẩm định',
    fr: 'Erreur lors de thẩm định',
    zh: 'thẩm định失败',
    ja: 'thẩm địnhエラー'
  },
  'Lỗi thử giọng đọc AI': {
    en: 'Error: thử giọng đọc AI',
    fr: 'Erreur lors de thử giọng đọc AI',
    zh: 'thử giọng đọc AI失败',
    ja: 'thử giọng đọc AIエラー'
  },
  'Lỗi tạo vai trò mới': {
    en: 'Error: creating vai trò mới',
    fr: 'Erreur lors de création de vai trò mới',
    zh: '创建vai trò mới失败',
    ja: 'vai trò mới作成エラー'
  },
  'Lỗi tải chi tiết phòng': {
    en: 'Error: loading chi tiết phòng',
    fr: 'Erreur lors de chargement de chi tiết phòng',
    zh: '载入chi tiết phòng失败',
    ja: 'chi tiết phòng読み込みエラー'
  },
  'Lỗi tải danh mục chuyên đề': {
    en: 'Error: loading danh mục chuyên đề',
    fr: 'Erreur lors de chargement de danh mục chuyên đề',
    zh: '载入danh mục chuyên đề失败',
    ja: 'danh mục chuyên đề読み込みエラー'
  },
  'Lỗi tải danh mục ngôn ngữ': {
    en: 'Error: loading danh mục ngôn ngữ',
    fr: 'Erreur lors de chargement de danh mục ngôn ngữ',
    zh: '载入danh mục ngôn ngữ失败',
    ja: 'danh mục ngôn ngữ読み込みエラー'
  },
  'Lỗi tải danh mục ngôn ngữ kích hoạt': {
    en: 'Error: loading danh mục ngôn ngữ kích hoạt',
    fr: 'Erreur lors de chargement de danh mục ngôn ngữ kích hoạt',
    zh: '载入danh mục ngôn ngữ kích hoạt失败',
    ja: 'danh mục ngôn ngữ kích hoạt読み込みエラー'
  },
  'Lỗi tải danh sách phòng': {
    en: 'Error: loading danh sách phòng',
    fr: 'Erreur lors de chargement de danh sách phòng',
    zh: '载入danh sách phòng失败',
    ja: 'danh sách phòng読み込みエラー'
  },
  'Lỗi tải danh sách vai trò': {
    en: 'Error: loading danh sách vai trò',
    fr: 'Erreur lors de chargement de danh sách vai trò',
    zh: '载入danh sách vai trò失败',
    ja: 'danh sách vai trò読み込みエラー'
  },
  'Lỗi tải danh sách ảnh 360': {
    en: 'Error: loading danh sách ảnh 360',
    fr: 'Erreur lors de chargement de danh sách ảnh 360',
    zh: '载入danh sách ảnh 360失败',
    ja: 'danh sách ảnh 360読み込みエラー'
  },
  'Lỗi tải lên file ảnh logo': {
    en: 'Error: loading lên file ảnh logo',
    fr: 'Erreur lors de chargement de lên file ảnh logo',
    zh: '载入lên file ảnh logo失败',
    ja: 'lên file ảnh logo読み込みエラー'
  },
  'Lỗi tải lịch sử ảnh 360': {
    en: 'Error: loading lịch sử ảnh 360',
    fr: 'Erreur lors de chargement de lịch sử ảnh 360',
    zh: '载入lịch sử ảnh 360失败',
    ja: 'lịch sử ảnh 360読み込みエラー'
  },
  'Lỗi tải nhận diện bảo tàng': {
    en: 'Error: loading nhận diện bảo tàng',
    fr: 'Erreur lors de chargement de nhận diện bảo tàng',
    zh: '载入nhận diện bảo tàng失败',
    ja: 'nhận diện bảo tàng読み込みエラー'
  },
  'Lỗi tải thông số hệ thống': {
    en: 'Error: loading thông số hệ thống',
    fr: 'Erreur lors de chargement de thông số hệ thống',
    zh: '载入thông số hệ thống失败',
    ja: 'thông số hệ thống読み込みエラー'
  },
  'Lỗi tải trạng thái bảo trì': {
    en: 'Error: loading trạng thái bảo trì',
    fr: 'Erreur lors de chargement de trạng thái bảo trì',
    zh: '载入trạng thái bảo trì失败',
    ja: 'trạng thái bảo trì読み込みエラー'
  },
  'Lỗi tải ảnh 360': {
    en: 'Error: loading ảnh 360',
    fr: 'Erreur lors de chargement de ảnh 360',
    zh: '载入ảnh 360失败',
    ja: 'ảnh 360読み込みエラー'
  },
  'Lỗi tải ảnh lên': {
    en: 'Error: loading ảnh lên',
    fr: 'Erreur lors de chargement de ảnh lên',
    zh: '载入ảnh lên失败',
    ja: 'ảnh lên読み込みエラー'
  },
  'Lỗi xoá file audio': {
    en: 'Error: xoá file audio',
    fr: 'Erreur lors de xoá file audio',
    zh: 'xoá file audio失败',
    ja: 'xoá file audioエラー'
  },
  'Lỗi xác thực mã OTP': {
    en: 'Error: xác thực mã OTP',
    fr: 'Erreur lors de xác thực mã OTP',
    zh: 'xác thực mã OTP失败',
    ja: 'xác thực mã OTPエラー'
  },
  'Lỗi xóa chuyên đề': {
    en: 'Error: deleting chuyên đề',
    fr: 'Erreur lors de suppression de chuyên đề',
    zh: '删除chuyên đề失败',
    ja: 'chuyên đề削除エラー'
  },
  'Lỗi xóa ngôn ngữ': {
    en: 'Error: deleting ngôn ngữ',
    fr: 'Erreur lors de suppression de ngôn ngữ',
    zh: '删除ngôn ngữ失败',
    ja: 'ngôn ngữ削除エラー'
  },
  'Lỗi xóa phòng': {
    en: 'Error: deleting phòng',
    fr: 'Erreur lors de suppression de phòng',
    zh: '删除phòng失败',
    ja: 'phòng削除エラー'
  },
  'Lỗi xóa điểm liên kết': {
    en: 'Error: deleting điểm liên kết',
    fr: 'Erreur lors de suppression de điểm liên kết',
    zh: '删除điểm liên kết失败',
    ja: 'điểm liên kết削除エラー'
  },
  'Máy chủ phản hồi mã lỗi HTTP': {
    en: 'Máy chủ phản hồi mã lỗi HTTP',
    fr: 'Máy chủ phản hồi mã lỗi HTTP',
    zh: 'Máy chủ phản hồi mã lỗi HTTP',
    ja: 'Máy chủ phản hồi mã lỗi HTTP'
  },
  'Mã ISO chỉ gồm 2-5 ký tự chữ cái (ví dụ: en, fr, de, ja': {
    en: 'Mã ISO chỉ gồm 2-5 ký tự chữ cái (ví dụ: en, fr, de, ja',
    fr: 'Mã ISO chỉ gồm 2-5 ký tự chữ cái (ví dụ: en, fr, de, ja',
    zh: 'Mã ISO chỉ gồm 2-5 ký tự chữ cái (ví dụ: en, fr, de, ja',
    ja: 'Mã ISO chỉ gồm 2-5 ký tự chữ cái (ví dụ: en, fr, de, ja'
  },
  'Mã ngôn ngữ "': {
    en: 'Mã ngôn ngữ "',
    fr: 'Mã ngôn ngữ "',
    zh: 'Mã ngôn ngữ "',
    ja: 'Mã ngôn ngữ "'
  },
  'Mã phòng': {
    en: 'Mã phòng',
    fr: 'Mã phòng',
    zh: 'Mã phòng',
    ja: 'Mã phòng'
  },
  'Mã số': {
    en: 'Mã số',
    fr: 'Mã số',
    zh: 'Mã số',
    ja: 'Mã số'
  },
  'Mã xác thực không chính xác hoặc đã hết hạn': {
    en: 'Mã xác thực không chính xác hoặc đã hết hạn',
    fr: 'Mã xác thực không chính xác hoặc đã hết hạn',
    zh: 'Mã xác thực không chính xác hoặc đã hết hạn',
    ja: 'Mã xác thực không chính xác hoặc đã hết hạn'
  },
  'Mã xác thực đã được gửi đến email của bạn': {
    en: 'Mã xác thực đã được gửi đến email của bạn',
    fr: 'Mã xác thực đã được gửi đến email của bạn',
    zh: 'Mã xác thực đã được gửi đến email của bạn',
    ja: 'Mã xác thực đã được gửi đến email của bạn'
  },
  'Mô tả tóm tắt': {
    en: 'Mô tả tóm tắt',
    fr: 'Mô tả tóm tắt',
    zh: 'Mô tả tóm tắt',
    ja: 'Mô tả tóm tắt'
  },
  'Mô tả tóm tắt (tùy chọn': {
    en: 'Mô tả tóm tắt (tùy chọn',
    fr: 'Mô tả tóm tắt (tùy chọn',
    zh: 'Mô tả tóm tắt (tùy chọn',
    ja: 'Mô tả tóm tắt (tùy chọn'
  },
  'Mô tả tóm tắt nội dung, hiện vật trưng bày trong gian phòng': {
    en: 'Mô tả tóm tắt nội dung, hiện vật trưng bày trong gian phòng',
    fr: 'Mô tả tóm tắt nội dung, hiện vật trưng bày trong gian phòng',
    zh: 'Mô tả tóm tắt nội dung, hiện vật trưng bày trong gian phòng',
    ja: 'Mô tả tóm tắt nội dung, hiện vật trưng bày trong gian phòng'
  },
  'Mở bảng công cụ gian phòng': {
    en: 'Mở bảng công cụ gian phòng',
    fr: 'Mở bảng công cụ gian phòng',
    zh: 'Mở bảng công cụ gian phòng',
    ja: 'Mở bảng công cụ gian phòng'
  },
  'Mở giao diện khách tham quan trong tab mới': {
    en: 'Mở giao diện khách tham quan trong tab mới',
    fr: 'Mở giao diện khách tham quan trong tab mới',
    zh: 'Mở giao diện khách tham quan trong tab mới',
    ja: 'Mở giao diện khách tham quan trong tab mới'
  },
  'Mở hoặc thu gọn thanh điều hướng': {
    en: 'Mở hoặc thu gọn thanh điều hướng',
    fr: 'Mở hoặc thu gọn thanh điều hướng',
    zh: 'Mở hoặc thu gọn thanh điều hướng',
    ja: 'Mở hoặc thu gọn thanh điều hướng'
  },
  'Mở trình biên tập ghim Hotspots 360°': {
    en: 'Mở trình biên tập ghim Hotspots 360°',
    fr: 'Mở trình biên tập ghim Hotspots 360°',
    zh: 'Mở trình biên tập ghim Hotspots 360°',
    ja: 'Mở trình biên tập ghim Hotspots 360°'
  },
  'Nam Miền Bắc (Trang trọng, chuẩn mực': {
    en: 'Nam Miền Bắc (Trang trọng, chuẩn mực',
    fr: 'Nam Miền Bắc (Trang trọng, chuẩn mực',
    zh: 'Nam Miền Bắc (Trang trọng, chuẩn mực',
    ja: 'Nam Miền Bắc (Trang trọng, chuẩn mực'
  },
  'Nghe thử giọng đọc': {
    en: 'Nghe thử giọng đọc',
    fr: 'Nghe thử giọng đọc',
    zh: 'Nghe thử giọng đọc',
    ja: 'Nghe thử giọng đọc'
  },
  'Nghe thử âm thanh thuyết minh AI': {
    en: 'Nghe thử âm thanh thuyết minh AI',
    fr: 'Nghe thử âm thanh thuyết minh AI',
    zh: 'Nghe thử âm thanh thuyết minh AI',
    ja: 'Nghe thử âm thanh thuyết minh AI'
  },
  'Nguyên tắc cốt lõi: Đứng yên làm trụ tại tâm phòng': {
    en: 'Nguyên tắc cốt lõi: Đứng yên làm trụ tại tâm phòng',
    fr: 'Nguyên tắc cốt lõi: Đứng yên làm trụ tại tâm phòng',
    zh: 'Nguyên tắc cốt lõi: Đứng yên làm trụ tại tâm phòng',
    ja: 'Nguyên tắc cốt lõi: Đứng yên làm trụ tại tâm phòng'
  },
  'Ngôn ngữ gốc tiếng Việt luôn được kích hoạt mặc định': {
    en: 'Ngôn ngữ gốc tiếng Việt luôn được kích hoạt mặc định',
    fr: 'Ngôn ngữ gốc tiếng Việt luôn được kích hoạt mặc định',
    zh: 'Ngôn ngữ gốc tiếng Việt luôn được kích hoạt mặc định',
    ja: 'Ngôn ngữ gốc tiếng Việt luôn được kích hoạt mặc định'
  },
  'Ngôn ngữ này đã bị tắt trong trang Quản trị Ngôn ngữ': {
    en: 'Ngôn ngữ này đã bị tắt trong trang Quản trị Ngôn ngữ',
    fr: 'Ngôn ngữ này đã bị tắt trong trang Quản trị Ngôn ngữ',
    zh: 'Ngôn ngữ này đã bị tắt trong trang Quản trị Ngôn ngữ',
    ja: 'Ngôn ngữ này đã bị tắt trong trang Quản trị Ngôn ngữ'
  },
  'Nhấp chuột lên vị trí bất kỳ trên ảnh để đặt điểm': {
    en: 'Nhấp chuột lên vị trí bất kỳ trên ảnh để đặt điểm',
    fr: 'Nhấp chuột lên vị trí bất kỳ trên ảnh để đặt điểm',
    zh: 'Nhấp chuột lên vị trí bất kỳ trên ảnh để đặt điểm',
    ja: 'Nhấp chuột lên vị trí bất kỳ trên ảnh để đặt điểm'
  },
  'Nhập liên kết URL ảnh 360°': {
    en: 'Nhập liên kết URL ảnh 360°',
    fr: 'Nhập liên kết URL ảnh 360°',
    zh: 'Nhập liên kết URL ảnh 360°',
    ja: 'Nhập liên kết URL ảnh 360°'
  },
  'Nhập lời chào và kịch bản thuyết minh tự động khi du khách bước vào không gian 360°': {
    en: 'Nhập lời chào và kịch bản thuyết minh tự động khi du khách bước vào không gian 360°',
    fr: 'Nhập lời chào và kịch bản thuyết minh tự động khi du khách bước vào không gian 360°',
    zh: 'Nhập lời chào và kịch bản thuyết minh tự động khi du khách bước vào không gian 360°',
    ja: 'Nhập lời chào và kịch bản thuyết minh tự động khi du khách bước vào không gian 360°'
  },
  'Nhập lời chào và nội dung thuyết minh tự động phát khi du khách bước vào không gian 360°': {
    en: 'Nhập lời chào và nội dung thuyết minh tự động phát khi du khách bước vào không gian 360°',
    fr: 'Nhập lời chào và nội dung thuyết minh tự động phát khi du khách bước vào không gian 360°',
    zh: 'Nhập lời chào và nội dung thuyết minh tự động phát khi du khách bước vào không gian 360°',
    ja: 'Nhập lời chào và nội dung thuyết minh tự động phát khi du khách bước vào không gian 360°'
  },
  'Nhập thông điệp bảo trì trang nhã': {
    en: 'Nhập thông điệp bảo trì trang nhã',
    fr: 'Nhập thông điệp bảo trì trang nhã',
    zh: 'Nhập thông điệp bảo trì trang nhã',
    ja: 'Nhập thông điệp bảo trì trang nhã'
  },
  'Nhập tên phòng bằng': {
    en: 'Nhập tên phòng bằng',
    fr: 'Nhập tên phòng bằng',
    zh: 'Nhập tên phòng bằng',
    ja: 'Nhập tên phòng bằng'
  },
  'Nhập tóm tắt bối cảnh lịch sử, niên đại, các hiện vật tiêu biểu và câu chuyện nổi bật của gian phòng': {
    en: 'Nhập tóm tắt bối cảnh lịch sử, niên đại, các hiện vật tiêu biểu và câu chuyện nổi bật của gian phòng',
    fr: 'Nhập tóm tắt bối cảnh lịch sử, niên đại, các hiện vật tiêu biểu và câu chuyện nổi bật của gian phòng',
    zh: 'Nhập tóm tắt bối cảnh lịch sử, niên đại, các hiện vật tiêu biểu và câu chuyện nổi bật của gian phòng',
    ja: 'Nhập tóm tắt bối cảnh lịch sử, niên đại, các hiện vật tiêu biểu và câu chuyện nổi bật của gian phòng'
  },
  'Nhật Bản': {
    en: 'Nhật Bản',
    fr: 'Nhật Bản',
    zh: 'Nhật Bản',
    ja: 'Nhật Bản'
  },
  'Nơi lưu giữ ngàn năm văn hiến di sản và lịch sử': {
    en: 'Nơi lưu giữ ngàn năm văn hiến di sản và lịch sử',
    fr: 'Nơi lưu giữ ngàn năm văn hiến di sản và lịch sử',
    zh: 'Nơi lưu giữ ngàn năm văn hiến di sản và lịch sử',
    ja: 'Nơi lưu giữ ngàn năm văn hiến di sản và lịch sử'
  },
  'Nạp lời đọc mẫu': {
    en: 'Nạp lời đọc mẫu',
    fr: 'Nạp lời đọc mẫu',
    zh: 'Nạp lời đọc mẫu',
    ja: 'Nạp lời đọc mẫu'
  },
  'Nạp văn bản gợi ý mẫu': {
    en: 'Nạp văn bản gợi ý mẫu',
    fr: 'Nạp văn bản gợi ý mẫu',
    zh: 'Nạp văn bản gợi ý mẫu',
    ja: 'Nạp văn bản gợi ý mẫu'
  },
  'Nữ': {
    en: 'Nữ',
    fr: 'Nữ',
    zh: 'Nữ',
    ja: 'Nữ'
  },
  'Nữ Miền Nam (Giọng truyền cảm - Phù hợp Bảo tàng TP.HCM': {
    en: 'Nữ Miền Nam (Giọng truyền cảm - Phù hợp Bảo tàng TP.HCM',
    fr: 'Nữ Miền Nam (Giọng truyền cảm - Phù hợp Bảo tàng TP.HCM',
    zh: 'Nữ Miền Nam (Giọng truyền cảm - Phù hợp Bảo tàng TP.HCM',
    ja: 'Nữ Miền Nam (Giọng truyền cảm - Phù hợp Bảo tàng TP.HCM'
  },
  'P-01: Khảo cổ học Tiền - Sơ sử Việt Nam': {
    en: 'P-01: Khảo cổ học Tiền - Sơ sử Việt Nam',
    fr: 'P-01: Khảo cổ học Tiền - Sơ sử Việt Nam',
    zh: 'P-01: Khảo cổ học Tiền - Sơ sử Việt Nam',
    ja: 'P-01: Khảo cổ học Tiền - Sơ sử Việt Nam'
  },
  'P-05: Triều đại Nhà Nguyễn & Mỹ thuật Cung đình': {
    en: 'P-05: Triều đại Nhà Nguyễn & Mỹ thuật Cung đình',
    fr: 'P-05: Triều đại Nhà Nguyễn & Mỹ thuật Cung đình',
    zh: 'P-05: Triều đại Nhà Nguyễn & Mỹ thuật Cung đình',
    ja: 'P-05: Triều đại Nhà Nguyễn & Mỹ thuật Cung đình'
  },
  'P-09: Di sản Văn hóa Vương quốc Phù Nam - Óc Eo': {
    en: 'P-09: Di sản Văn hóa Vương quốc Phù Nam - Óc Eo',
    fr: 'P-09: Di sản Văn hóa Vương quốc Phù Nam - Óc Eo',
    zh: 'P-09: Di sản Văn hóa Vương quốc Phù Nam - Óc Eo',
    ja: 'P-09: Di sản Văn hóa Vương quốc Phù Nam - Óc Eo'
  },
  'P-12: Điêu khắc Phật giáo & Ấn Độ giáo Champa': {
    en: 'P-12: Điêu khắc Phật giáo & Ấn Độ giáo Champa',
    fr: 'P-12: Điêu khắc Phật giáo & Ấn Độ giáo Champa',
    zh: 'P-12: Điêu khắc Phật giáo & Ấn Độ giáo Champa',
    ja: 'P-12: Điêu khắc Phật giáo & Ấn Độ giáo Champa'
  },
  'P-16: Bộ sưu tập Cổ vật Vương Hồng Sển': {
    en: 'P-16: Bộ sưu tập Cổ vật Vương Hồng Sển',
    fr: 'P-16: Bộ sưu tập Cổ vật Vương Hồng Sển',
    zh: 'P-16: Bộ sưu tập Cổ vật Vương Hồng Sển',
    ja: 'P-16: Bộ sưu tập Cổ vật Vương Hồng Sển'
  },
  'Phiên đăng nhập không hợp lệ': {
    en: 'Phiên đăng nhập không hợp lệ',
    fr: 'Phiên đăng nhập không hợp lệ',
    zh: 'Phiên đăng nhập không hợp lệ',
    ja: 'Phiên đăng nhập không hợp lệ'
  },
  'Pháp': {
    en: 'Pháp',
    fr: 'Pháp',
    zh: 'Pháp',
    ja: 'Pháp'
  },
  'Phát thuyết minh Voice AI': {
    en: 'Phát thuyết minh Voice AI',
    fr: 'Phát thuyết minh Voice AI',
    zh: 'Phát thuyết minh Voice AI',
    ja: 'Phát thuyết minh Voice AI'
  },
  'Phóng to chi tiết': {
    en: 'Phóng to chi tiết',
    fr: 'Phóng to chi tiết',
    zh: 'Phóng to chi tiết',
    ja: 'Phóng to chi tiết'
  },
  'Phục hồi nội dung chuẩn của Bảo tàng': {
    en: 'Phục hồi nội dung chuẩn của Bảo tàng',
    fr: 'Phục hồi nội dung chuẩn của Bảo tàng',
    zh: 'Phục hồi nội dung chuẩn của Bảo tàng',
    ja: 'Phục hồi nội dung chuẩn của Bảo tàng'
  },
  'Português': {
    en: 'Português',
    fr: 'Português',
    zh: 'Português',
    ja: 'Português'
  },
  'Quyền Camera bị từ chối trên Chrome. Bạn hãy bấm vào biểu tượng cài đặt/ổ khóa cạnh thanh địa chỉ để Cho phép (Allow) Camera, hoặc bấm nút "Chụp từ Camera điện thoại" bên dưới!': {
    en: 'Quyền Camera bị từ chối trên Chrome. Bạn hãy bấm vào biểu tượng cài đặt/ổ khóa cạnh thanh địa chỉ để Cho phép (Allow) Camera, hoặc bấm nút "Chụp từ Camera điện thoại" bên dưới!',
    fr: 'Quyền Camera bị từ chối trên Chrome. Bạn hãy bấm vào biểu tượng cài đặt/ổ khóa cạnh thanh địa chỉ để Cho phép (Allow) Camera, hoặc bấm nút "Chụp từ Camera điện thoại" bên dưới!',
    zh: 'Quyền Camera bị từ chối trên Chrome. Bạn hãy bấm vào biểu tượng cài đặt/ổ khóa cạnh thanh địa chỉ để Cho phép (Allow) Camera, hoặc bấm nút "Chụp từ Camera điện thoại" bên dưới!',
    ja: 'Quyền Camera bị từ chối trên Chrome. Bạn hãy bấm vào biểu tượng cài đặt/ổ khóa cạnh thanh địa chỉ để Cho phép (Allow) Camera, hoặc bấm nút "Chụp từ Camera điện thoại" bên dưới!'
  },
  'Quá trình ghép ảnh thất bại': {
    en: 'Quá trình ghép ảnh thất bại',
    fr: 'Quá trình ghép ảnh thất bại',
    zh: 'Quá trình ghép ảnh thất bại',
    ja: 'Quá trình ghép ảnh thất bại'
  },
  'Quét Không Gian 360°': {
    en: 'Quét Không Gian 360°',
    fr: 'Quét Không Gian 360°',
    zh: 'Quét Không Gian 360°',
    ja: 'Quét Không Gian 360°'
  },
  'Quý khách đang hiện diện trước Bộ sưu tập của Cụ Vương Hồng Sển - học giả, nhà văn hóa lỗi lạc đã dành trọn cuộc đời sưu tầm và hiến tặng toàn bộ gia tài di sản vô giá này cho nhân dân và khách tham quan Bảo tàng Lịch sử TP.HCM': {
    en: 'Quý khách đang hiện diện trước Bộ sưu tập của Cụ Vương Hồng Sển - học giả, nhà văn hóa lỗi lạc đã dành trọn cuộc đời sưu tầm và hiến tặng toàn bộ gia tài di sản vô giá này cho nhân dân và khách tham quan Bảo tàng Lịch sử TP.HCM',
    fr: 'Quý khách đang hiện diện trước Bộ sưu tập của Cụ Vương Hồng Sển - học giả, nhà văn hóa lỗi lạc đã dành trọn cuộc đời sưu tầm và hiến tặng toàn bộ gia tài di sản vô giá này cho nhân dân và khách tham quan Bảo tàng Lịch sử TP.HCM',
    zh: 'Quý khách đang hiện diện trước Bộ sưu tập của Cụ Vương Hồng Sển - học giả, nhà văn hóa lỗi lạc đã dành trọn cuộc đời sưu tầm và hiến tặng toàn bộ gia tài di sản vô giá này cho nhân dân và khách tham quan Bảo tàng Lịch sử TP.HCM',
    ja: 'Quý khách đang hiện diện trước Bộ sưu tập của Cụ Vương Hồng Sển - học giả, nhà văn hóa lỗi lạc đã dành trọn cuộc đời sưu tầm và hiến tặng toàn bộ gia tài di sản vô giá này cho nhân dân và khách tham quan Bảo tàng Lịch sử TP.HCM'
  },
  'Quản lý danh sách chuyên đề / thời kỳ trưng bày': {
    en: 'Quản lý danh sách chuyên đề / thời kỳ trưng bày',
    fr: 'Quản lý danh sách chuyên đề / thời kỳ trưng bày',
    zh: 'Quản lý danh sách chuyên đề / thời kỳ trưng bày',
    ja: 'Quản lý danh sách chuyên đề / thời kỳ trưng bày'
  },
  'Quản lý danh tính, logo, biểu trưng và thông tin liên hệ đa bảo tàng. Tự động đồng bộ 100% dữ liệu thật trên toàn hệ thống': {
    en: 'Quản lý danh tính, logo, biểu trưng và thông tin liên hệ đa bảo tàng. Tự động đồng bộ 100% dữ liệu thật trên toàn hệ thống',
    fr: 'Quản lý danh tính, logo, biểu trưng và thông tin liên hệ đa bảo tàng. Tự động đồng bộ 100% dữ liệu thật trên toàn hệ thống',
    zh: 'Quản lý danh tính, logo, biểu trưng và thông tin liên hệ đa bảo tàng. Tự động đồng bộ 100% dữ liệu thật trên toàn hệ thống',
    ja: 'Quản lý danh tính, logo, biểu trưng và thông tin liên hệ đa bảo tàng. Tự động đồng bộ 100% dữ liệu thật trên toàn hệ thống'
  },
  'Quản lý trạng thái trực tuyến của cổng tham quan 360 và giám sát hạ tầng máy chủ': {
    en: 'Quản lý trạng thái trực tuyến của cổng tham quan 360 và giám sát hạ tầng máy chủ',
    fr: 'Quản lý trạng thái trực tuyến của cổng tham quan 360 và giám sát hạ tầng máy chủ',
    zh: 'Quản lý trạng thái trực tuyến của cổng tham quan 360 và giám sát hạ tầng máy chủ',
    ja: 'Quản lý trạng thái trực tuyến của cổng tham quan 360 và giám sát hạ tầng máy chủ'
  },
  'Quản lý và thêm mới chuyên đề': {
    en: 'Quản lý và thêm mới chuyên đề',
    fr: 'Quản lý và thêm mới chuyên đề',
    zh: 'Quản lý và thêm mới chuyên đề',
    ja: 'Quản lý và thêm mới chuyên đề'
  },
  'Quản trị': {
    en: 'Quản trị',
    fr: 'Quản trị',
    zh: 'Quản trị',
    ja: 'Quản trị'
  },
  'Quản trị viên (Admin': {
    en: 'Quản trị viên (Admin',
    fr: 'Quản trị viên (Admin',
    zh: 'Quản trị viên (Admin',
    ja: 'Quản trị viên (Admin'
  },
  'Ra khuôn viên sân trước': {
    en: 'Ra khuôn viên sân trước',
    fr: 'Ra khuôn viên sân trước',
    zh: 'Ra khuôn viên sân trước',
    ja: 'Ra khuôn viên sân trước'
  },
  'Sao chép link ảnh 360': {
    en: 'Sao chép link ảnh 360',
    fr: 'Sao chép link ảnh 360',
    zh: 'Sao chép link ảnh 360',
    ja: 'Sao chép link ảnh 360'
  },
  'Sao chép link ảnh 360 độ': {
    en: 'Sao chép link ảnh 360 độ',
    fr: 'Sao chép link ảnh 360 độ',
    zh: 'Sao chép link ảnh 360 độ',
    ja: 'Sao chép link ảnh 360 độ'
  },
  'Sao chép đường dẫn ảnh 360': {
    en: 'Sao chép đường dẫn ảnh 360',
    fr: 'Sao chép đường dẫn ảnh 360',
    zh: 'Sao chép đường dẫn ảnh 360',
    ja: 'Sao chép đường dẫn ảnh 360'
  },
  'Sinh file Voice AI Tiếng Việt': {
    en: 'Sinh file Voice AI Tiếng Việt',
    fr: 'Sinh file Voice AI Tiếng Việt',
    zh: 'Sinh file Voice AI Tiếng Việt',
    ja: 'Sinh file Voice AI Tiếng Việt'
  },
  'Sàn': {
    en: 'Sàn',
    fr: 'Sàn',
    zh: 'Sàn',
    ja: 'Sàn'
  },
  'Sàn nhà đã đủ, hãy ngửa máy lên trần (+30°) để quét trần phòng': {
    en: 'Sàn nhà đã đủ, hãy ngửa máy lên trần (+30°) để quét trần phòng',
    fr: 'Sàn nhà đã đủ, hãy ngửa máy lên trần (+30°) để quét trần phòng',
    zh: 'Sàn nhà đã đủ, hãy ngửa máy lên trần (+30°) để quét trần phòng',
    ja: 'Sàn nhà đã đủ, hãy ngửa máy lên trần (+30°) để quét trần phòng'
  },
  'Sàn phòng': {
    en: 'Sàn phòng',
    fr: 'Sàn phòng',
    zh: 'Sàn phòng',
    ja: 'Sàn phòng'
  },
  'Sưu tập Đặc biệt': {
    en: 'Sưu tập Đặc biệt',
    fr: 'Sưu tập Đặc biệt',
    zh: 'Sưu tập Đặc biệt',
    ja: 'Sưu tập Đặc biệt'
  },
  'Sẵn sàng đón khách': {
    en: 'Sẵn sàng đón khách',
    fr: 'Sẵn sàng đón khách',
    zh: 'Sẵn sàng đón khách',
    ja: 'Sẵn sàng đón khách'
  },
  'Số hóa': {
    en: 'Số hóa',
    fr: 'Số hóa',
    zh: 'Số hóa',
    ja: 'Số hóa'
  },
  'Số lượng ảnh lý tưởng để phủ kín trọn vẹn vòng tròn 360° gian phòng': {
    en: 'Số lượng ảnh lý tưởng để phủ kín trọn vẹn vòng tròn 360° gian phòng',
    fr: 'Số lượng ảnh lý tưởng để phủ kín trọn vẹn vòng tròn 360° gian phòng',
    zh: 'Số lượng ảnh lý tưởng để phủ kín trọn vẹn vòng tròn 360° gian phòng',
    ja: 'Số lượng ảnh lý tưởng để phủ kín trọn vẹn vòng tròn 360° gian phòng'
  },
  'TP. Hồ Chí Minh': {
    en: 'TP. Hồ Chí Minh',
    fr: 'TP. Hồ Chí Minh',
    zh: 'TP. Hồ Chí Minh',
    ja: 'TP. Hồ Chí Minh'
  },
  'TP. Hồ Chí Minh, Hà Nội, Huế': {
    en: 'TP. Hồ Chí Minh, Hà Nội, Huế',
    fr: 'TP. Hồ Chí Minh, Hà Nội, Huế',
    zh: 'TP. Hồ Chí Minh, Hà Nội, Huế',
    ja: 'TP. Hồ Chí Minh, Hà Nội, Huế'
  },
  'Thiết bị không hỗ trợ hoặc camera đang bị ứng dụng khác chiếm dụng': {
    en: 'Thiết bị không hỗ trợ hoặc camera đang bị ứng dụng khác chiếm dụng',
    fr: 'Thiết bị không hỗ trợ hoặc camera đang bị ứng dụng khác chiếm dụng',
    zh: 'Thiết bị không hỗ trợ hoặc camera đang bị ứng dụng khác chiếm dụng',
    ja: 'Thiết bị không hỗ trợ hoặc camera đang bị ứng dụng khác chiếm dụng'
  },
  'Thiết lập ngôn ngữ hiển thị và cấu hình giọng đọc thuyết minh': {
    en: 'Thiết lập ngôn ngữ hiển thị và cấu hình giọng đọc thuyết minh',
    fr: 'Thiết lập ngôn ngữ hiển thị và cấu hình giọng đọc thuyết minh',
    zh: 'Thiết lập ngôn ngữ hiển thị và cấu hình giọng đọc thuyết minh',
    ja: 'Thiết lập ngôn ngữ hiển thị và cấu hình giọng đọc thuyết minh'
  },
  'Thu gọn / Mở rộng menu (Ctrl + B': {
    en: 'Thu gọn / Mở rộng menu (Ctrl + B',
    fr: 'Thu gọn / Mở rộng menu (Ctrl + B',
    zh: 'Thu gọn / Mở rộng menu (Ctrl + B',
    ja: 'Thu gọn / Mở rộng menu (Ctrl + B'
  },
  'Thu gọn hoặc mở rộng thanh điều hướng': {
    en: 'Thu gọn hoặc mở rộng thanh điều hướng',
    fr: 'Thu gọn hoặc mở rộng thanh điều hướng',
    zh: 'Thu gọn hoặc mở rộng thanh điều hướng',
    ja: 'Thu gọn hoặc mở rộng thanh điều hướng'
  },
  'Thuyết minh & Trợ lý ảo cho gian phòng': {
    en: 'Thuyết minh & Trợ lý ảo cho gian phòng',
    fr: 'Thuyết minh & Trợ lý ảo cho gian phòng',
    zh: 'Thuyết minh & Trợ lý ảo cho gian phòng',
    ja: 'Thuyết minh & Trợ lý ảo cho gian phòng'
  },
  'Thái Lan': {
    en: 'Thái Lan',
    fr: 'Thái Lan',
    zh: 'Thái Lan',
    ja: 'Thái Lan'
  },
  'Thổ Nhĩ Kỳ': {
    en: 'Thổ Nhĩ Kỳ',
    fr: 'Thổ Nhĩ Kỳ',
    zh: 'Thổ Nhĩ Kỳ',
    ja: 'Thổ Nhĩ Kỳ'
  },
  'Thời gian dự phòng': {
    en: 'Thời gian dự phòng',
    fr: 'Thời gian dự phòng',
    zh: 'Thời gian dự phòng',
    ja: 'Thời gian dự phòng'
  },
  'Thụy Điển': {
    en: 'Thụy Điển',
    fr: 'Thụy Điển',
    zh: 'Thụy Điển',
    ja: 'Thụy Điển'
  },
  'Thử lại': {
    en: 'Thử lại',
    fr: 'Thử lại',
    zh: 'Thử lại',
    ja: 'Thử lại'
  },
  'Thử lại Camera': {
    en: 'Thử lại Camera',
    fr: 'Thử lại Camera',
    zh: 'Thử lại Camera',
    ja: 'Thử lại Camera'
  },
  'Tiến trình Lịch sử VN': {
    en: 'Tiến trình Lịch sử VN',
    fr: 'Tiến trình Lịch sử VN',
    zh: 'Tiến trình Lịch sử VN',
    ja: 'Tiến trình Lịch sử VN'
  },
  'Tiếng Anh (English - Chuẩn quốc tế cho khách nước ngoài': {
    en: 'Tiếng Anh (English - Chuẩn quốc tế cho khách nước ngoài',
    fr: 'Tiếng Anh (English - Chuẩn quốc tế cho khách nước ngoài',
    zh: 'Tiếng Anh (English - Chuẩn quốc tế cho khách nước ngoài',
    ja: 'Tiếng Anh (English - Chuẩn quốc tế cho khách nước ngoài'
  },
  'Tiếng Việt': {
    en: 'Tiếng Việt',
    fr: 'Tiếng Việt',
    zh: 'Tiếng Việt',
    ja: 'Tiếng Việt'
  },
  'Toàn bộ cổ vật quý hiếm do học giả nhà khảo cổ Vương Hồng Sển hiến tặng cho nhà nước năm 1996, gồm gốm men lam, đồ đồng cổ và tượng cổ': {
    en: 'Toàn bộ cổ vật quý hiếm do học giả nhà khảo cổ Vương Hồng Sển hiến tặng cho nhà nước năm 1996, gồm gốm men lam, đồ đồng cổ và tượng cổ',
    fr: 'Toàn bộ cổ vật quý hiếm do học giả nhà khảo cổ Vương Hồng Sển hiến tặng cho nhà nước năm 1996, gồm gốm men lam, đồ đồng cổ và tượng cổ',
    zh: 'Toàn bộ cổ vật quý hiếm do học giả nhà khảo cổ Vương Hồng Sển hiến tặng cho nhà nước năm 1996, gồm gốm men lam, đồ đồng cổ và tượng cổ',
    ja: 'Toàn bộ cổ vật quý hiếm do học giả nhà khảo cổ Vương Hồng Sển hiến tặng cho nhà nước năm 1996, gồm gốm men lam, đồ đồng cổ và tượng cổ'
  },
  'Toàn cảnh 360°': {
    en: 'Toàn cảnh 360°',
    fr: 'Toàn cảnh 360°',
    zh: 'Toàn cảnh 360°',
    ja: 'Toàn cảnh 360°'
  },
  'Triều đại Nhà Nguyễn & Mỹ thuật Cung đình': {
    en: 'Triều đại Nhà Nguyễn & Mỹ thuật Cung đình',
    fr: 'Triều đại Nhà Nguyễn & Mỹ thuật Cung đình',
    zh: 'Triều đại Nhà Nguyễn & Mỹ thuật Cung đình',
    ja: 'Triều đại Nhà Nguyễn & Mỹ thuật Cung đình'
  },
  'Trouvé': {
    en: 'Trouvé',
    fr: 'Trouvé',
    zh: 'Trouvé',
    ja: 'Trouvé'
  },
  'Trung Quốc': {
    en: 'Trung Quốc',
    fr: 'Trung Quốc',
    zh: 'Trung Quốc',
    ja: 'Trung Quốc'
  },
  'Trên iPhone / iPad': {
    en: 'Trên iPhone / iPad',
    fr: 'Trên iPhone / iPad',
    zh: 'Trên iPhone / iPad',
    ja: 'Trên iPhone / iPad'
  },
  'Trên máy tính & Android': {
    en: 'Trên máy tính & Android',
    fr: 'Trên máy tính & Android',
    zh: 'Trên máy tính & Android',
    ja: 'Trên máy tính & Android'
  },
  'Trình duyệt không cho phép sao chép. Vui lòng bấm "Mở ảnh gốc" rồi chép từ thanh địa chỉ': {
    en: 'Trình duyệt không cho phép sao chép. Vui lòng bấm "Mở ảnh gốc" rồi chép từ thanh địa chỉ',
    fr: 'Trình duyệt không cho phép sao chép. Vui lòng bấm "Mở ảnh gốc" rồi chép từ thanh địa chỉ',
    zh: 'Trình duyệt không cho phép sao chép. Vui lòng bấm "Mở ảnh gốc" rồi chép từ thanh địa chỉ',
    ja: 'Trình duyệt không cho phép sao chép. Vui lòng bấm "Mở ảnh gốc" rồi chép từ thanh địa chỉ'
  },
  'Trình duyệt này không hỗ trợ truy cập webcam. Vui lòng dùng nút "Chọn từ máy': {
    en: 'Trình duyệt này không hỗ trợ truy cập webcam. Vui lòng dùng nút "Chọn từ máy',
    fr: 'Trình duyệt này không hỗ trợ truy cập webcam. Vui lòng dùng nút "Chọn từ máy',
    zh: 'Trình duyệt này không hỗ trợ truy cập webcam. Vui lòng dùng nút "Chọn từ máy',
    ja: 'Trình duyệt này không hỗ trợ truy cập webcam. Vui lòng dùng nút "Chọn từ máy'
  },
  'Trình duyệt yêu cầu kết nối bảo mật HTTPS hoặc Localhost để mở luồng video Camera trực tiếp. Trên điện thoại, bạn có thể bấm nút "Chụp / Chọn ảnh từ Camera điện thoại" bên dưới để chụp trực tiếp!': {
    en: 'Trình duyệt yêu cầu kết nối bảo mật HTTPS hoặc Localhost để mở luồng video Camera trực tiếp. Trên điện thoại, bạn có thể bấm nút "Chụp / Chọn ảnh từ Camera điện thoại" bên dưới để chụp trực tiếp!',
    fr: 'Trình duyệt yêu cầu kết nối bảo mật HTTPS hoặc Localhost để mở luồng video Camera trực tiếp. Trên điện thoại, bạn có thể bấm nút "Chụp / Chọn ảnh từ Camera điện thoại" bên dưới để chụp trực tiếp!',
    zh: 'Trình duyệt yêu cầu kết nối bảo mật HTTPS hoặc Localhost để mở luồng video Camera trực tiếp. Trên điện thoại, bạn có thể bấm nút "Chụp / Chọn ảnh từ Camera điện thoại" bên dưới để chụp trực tiếp!',
    ja: 'Trình duyệt yêu cầu kết nối bảo mật HTTPS hoặc Localhost để mở luồng video Camera trực tiếp. Trên điện thoại, bạn có thể bấm nút "Chụp / Chọn ảnh từ Camera điện thoại" bên dưới để chụp trực tiếp!'
  },
  'Trình duyệt đang chặn quyền Camera. Bấm biểu tượng ổ khóa cạnh thanh địa chỉ, bật Máy ảnh thành Cho phép rồi thử lại': {
    en: 'Trình duyệt đang chặn quyền Camera. Bấm biểu tượng ổ khóa cạnh thanh địa chỉ, bật Máy ảnh thành Cho phép rồi thử lại',
    fr: 'Trình duyệt đang chặn quyền Camera. Bấm biểu tượng ổ khóa cạnh thanh địa chỉ, bật Máy ảnh thành Cho phép rồi thử lại',
    zh: 'Trình duyệt đang chặn quyền Camera. Bấm biểu tượng ổ khóa cạnh thanh địa chỉ, bật Máy ảnh thành Cho phép rồi thử lại',
    ja: 'Trình duyệt đang chặn quyền Camera. Bấm biểu tượng ổ khóa cạnh thanh địa chỉ, bật Máy ảnh thành Cho phép rồi thử lại'
  },
  'Trưng bày các di chỉ khảo cổ học quan trọng từ Thời Đồ Đá Cũ, Đồ Đá Mới đến Thời Đại Kim Khí Đông Sơn, Sa Huỳnh và Đồng Nai': {
    en: 'Trưng bày các di chỉ khảo cổ học quan trọng từ Thời Đồ Đá Cũ, Đồ Đá Mới đến Thời Đại Kim Khí Đông Sơn, Sa Huỳnh và Đồng Nai',
    fr: 'Trưng bày các di chỉ khảo cổ học quan trọng từ Thời Đồ Đá Cũ, Đồ Đá Mới đến Thời Đại Kim Khí Đông Sơn, Sa Huỳnh và Đồng Nai',
    zh: 'Trưng bày các di chỉ khảo cổ học quan trọng từ Thời Đồ Đá Cũ, Đồ Đá Mới đến Thời Đại Kim Khí Đông Sơn, Sa Huỳnh và Đồng Nai',
    ja: 'Trưng bày các di chỉ khảo cổ học quan trọng từ Thời Đồ Đá Cũ, Đồ Đá Mới đến Thời Đại Kim Khí Đông Sơn, Sa Huỳnh và Đồng Nai'
  },
  'Trưng bày các hiện vật quý ghi dấu quá trình hình thành văn hóa và tiến trình phát triển': {
    en: 'Trưng bày các hiện vật quý ghi dấu quá trình hình thành văn hóa và tiến trình phát triển',
    fr: 'Trưng bày các hiện vật quý ghi dấu quá trình hình thành văn hóa và tiến trình phát triển',
    zh: 'Trưng bày các hiện vật quý ghi dấu quá trình hình thành văn hóa và tiến trình phát triển',
    ja: 'Trưng bày các hiện vật quý ghi dấu quá trình hình thành văn hóa và tiến trình phát triển'
  },
  'Trần': {
    en: 'Trần',
    fr: 'Trần',
    zh: 'Trần',
    ja: 'Trần'
  },
  'Trần nhà': {
    en: 'Trần nhà',
    fr: 'Trần nhà',
    zh: 'Trần nhà',
    ja: 'Trần nhà'
  },
  'Trần nhà đã kín, bạn có thể xoay tiếp hoặc bấm "Ghép 360°': {
    en: 'Trần nhà đã kín, bạn có thể xoay tiếp hoặc bấm "Ghép 360°',
    fr: 'Trần nhà đã kín, bạn có thể xoay tiếp hoặc bấm "Ghép 360°',
    zh: 'Trần nhà đã kín, bạn có thể xoay tiếp hoặc bấm "Ghép 360°',
    ja: 'Trần nhà đã kín, bạn có thể xoay tiếp hoặc bấm "Ghép 360°'
  },
  'Trần nhà đã đủ, hãy chúc máy xuống sàn (-30°) để quét sàn phòng': {
    en: 'Trần nhà đã đủ, hãy chúc máy xuống sàn (-30°) để quét sàn phòng',
    fr: 'Trần nhà đã đủ, hãy chúc máy xuống sàn (-30°) để quét sàn phòng',
    zh: 'Trần nhà đã đủ, hãy chúc máy xuống sàn (-30°) để quét sàn phòng',
    ja: 'Trần nhà đã đủ, hãy chúc máy xuống sàn (-30°) để quét sàn phòng'
  },
  'Trục nhìn ngang chuẩn': {
    en: 'Trục nhìn ngang chuẩn',
    fr: 'Trục nhìn ngang chuẩn',
    zh: 'Trục nhìn ngang chuẩn',
    ja: 'Trục nhìn ngang chuẩn'
  },
  'Trực tiếp': {
    en: 'Trực tiếp',
    fr: 'Trực tiếp',
    zh: 'Trực tiếp',
    ja: 'Trực tiếp'
  },
  'Tuyển tập các kiệt tác điêu khắc sa thạch Champa từ thế kỷ 7 đến thế kỷ 13 với phong cách Mỹ Sơn, Đồng Dương và Tháp Mẫm': {
    en: 'Tuyển tập các kiệt tác điêu khắc sa thạch Champa từ thế kỷ 7 đến thế kỷ 13 với phong cách Mỹ Sơn, Đồng Dương và Tháp Mẫm',
    fr: 'Tuyển tập các kiệt tác điêu khắc sa thạch Champa từ thế kỷ 7 đến thế kỷ 13 với phong cách Mỹ Sơn, Đồng Dương và Tháp Mẫm',
    zh: 'Tuyển tập các kiệt tác điêu khắc sa thạch Champa từ thế kỷ 7 đến thế kỷ 13 với phong cách Mỹ Sơn, Đồng Dương và Tháp Mẫm',
    ja: 'Tuyển tập các kiệt tác điêu khắc sa thạch Champa từ thế kỷ 7 đến thế kỷ 13 với phong cách Mỹ Sơn, Đồng Dương và Tháp Mẫm'
  },
  'TÊN BẢO TÀNG': {
    en: 'TÊN BẢO TÀNG',
    fr: 'TÊN BẢO TÀNG',
    zh: 'TÊN BẢO TÀNG',
    ja: 'TÊN BẢO TÀNG'
  },
  'Tài khoản': {
    en: 'Tài khoản',
    fr: 'Tài khoản',
    zh: 'Tài khoản',
    ja: 'Tài khoản'
  },
  'Tài khoản / Mật khẩu': {
    en: 'Tài khoản / Mật khẩu',
    fr: 'Tài khoản / Mật khẩu',
    zh: 'Tài khoản / Mật khẩu',
    ja: 'Tài khoản / Mật khẩu'
  },
  'Tài khoản của bạn không có quyền Quản trị viên (Admin) để truy cập trang này': {
    en: 'Tài khoản của bạn không có quyền Quản trị viên (Admin) để truy cập trang này',
    fr: 'Tài khoản của bạn không có quyền Quản trị viên (Admin) để truy cập trang này',
    zh: 'Tài khoản của bạn không có quyền Quản trị viên (Admin) để truy cập trang này',
    ja: 'Tài khoản của bạn không có quyền Quản trị viên (Admin) để truy cập trang này'
  },
  'Tây Ban Nha': {
    en: 'Tây Ban Nha',
    fr: 'Tây Ban Nha',
    zh: 'Tây Ban Nha',
    ja: 'Tây Ban Nha'
  },
  'Tên bản xứ phải có ít nhất 2 ký tự': {
    en: 'Tên bản xứ phải có ít nhất 2 ký tự',
    fr: 'Tên bản xứ phải có ít nhất 2 ký tự',
    zh: 'Tên bản xứ phải có ít nhất 2 ký tự',
    ja: 'Tên bản xứ phải có ít nhất 2 ký tự'
  },
  'Tên chuyên đề không được để trống': {
    en: 'Tên chuyên đề không được để trống',
    fr: 'Tên chuyên đề không được để trống',
    zh: 'Tên chuyên đề không được để trống',
    ja: 'Tên chuyên đề không được để trống'
  },
  'Tên chuyên đề mới *': {
    en: 'Tên chuyên đề mới *',
    fr: 'Tên chuyên đề mới *',
    zh: 'Tên chuyên đề mới *',
    ja: 'Tên chuyên đề mới *'
  },
  'Tên gian trưng bày': {
    en: 'Exhibition Room Name',
    fr: 'Nom de la salle d’exposition',
    zh: '展厅名称',
    ja: '展示室名'
  },
  'Tên gian trưng bày *': {
    en: 'Exhibition Room Name *',
    fr: 'Nom de la salle d’exposition *',
    zh: '展厅名称 *',
    ja: '展示室名 *'
  },
  'Tên rút gọn của bảo tàng không được để trống': {
    en: 'Tên rút gọn của bảo tàng không được để trống',
    fr: 'Tên rút gọn của bảo tàng không được để trống',
    zh: 'Tên rút gọn của bảo tàng không được để trống',
    ja: 'Tên rút gọn của bảo tàng không được để trống'
  },
  'Tên tiếng Anh phải có ít nhất 2 ký tự': {
    en: 'Tên tiếng Anh phải có ít nhất 2 ký tự',
    fr: 'Tên tiếng Anh phải có ít nhất 2 ký tự',
    zh: 'Tên tiếng Anh phải có ít nhất 2 ký tự',
    ja: 'Tên tiếng Anh phải có ít nhất 2 ký tự'
  },
  'Tên đăng nhập hoặc mật khẩu không chính xác': {
    en: 'Tên đăng nhập hoặc mật khẩu không chính xác',
    fr: 'Tên đăng nhập hoặc mật khẩu không chính xác',
    zh: 'Tên đăng nhập hoặc mật khẩu không chính xác',
    ja: 'Tên đăng nhập hoặc mật khẩu không chính xác'
  },
  'Tên đầy đủ của bảo tàng không được để trống': {
    en: 'Tên đầy đủ của bảo tàng không được để trống',
    fr: 'Tên đầy đủ của bảo tàng không được để trống',
    zh: 'Tên đầy đủ của bảo tàng không được để trống',
    ja: 'Tên đầy đủ của bảo tàng không được để trống'
  },
  'Tìm theo tên phòng, mã P-01, P-05': {
    en: 'Tìm theo tên phòng, mã P-01, P-05',
    fr: 'Tìm theo tên phòng, mã P-01, P-05',
    zh: 'Tìm theo tên phòng, mã P-01, P-05',
    ja: 'Tìm theo tên phòng, mã P-01, P-05'
  },
  'Tìm tên file ảnh toàn cảnh 360°': {
    en: 'Tìm tên file ảnh toàn cảnh 360°',
    fr: 'Tìm tên file ảnh toàn cảnh 360°',
    zh: 'Tìm tên file ảnh toàn cảnh 360°',
    ja: 'Tìm tên file ảnh toàn cảnh 360°'
  },
  'Tóm tắt giới thiệu không gian bằng ngoại ngữ': {
    en: 'Tóm tắt giới thiệu không gian bằng ngoại ngữ',
    fr: 'Tóm tắt giới thiệu không gian bằng ngoại ngữ',
    zh: 'Tóm tắt giới thiệu không gian bằng ngoại ngữ',
    ja: 'Tóm tắt giới thiệu không gian bằng ngoại ngữ'
  },
  'Tư liệu bối cảnh phục vụ giải đáp du khách': {
    en: 'Tư liệu bối cảnh phục vụ giải đáp du khách',
    fr: 'Tư liệu bối cảnh phục vụ giải đáp du khách',
    zh: 'Tư liệu bối cảnh phục vụ giải đáp du khách',
    ja: 'Tư liệu bối cảnh phục vụ giải đáp du khách'
  },
  'Tư liệu lịch sử (Trợ lý ảo': {
    en: 'Tư liệu lịch sử (Trợ lý ảo',
    fr: 'Tư liệu lịch sử (Trợ lý ảo',
    zh: 'Tư liệu lịch sử (Trợ lý ảo',
    ja: 'Tư liệu lịch sử (Trợ lý ảo'
  },
  'Tương tác Thực địa': {
    en: 'Tương tác Thực địa',
    fr: 'Tương tác Thực địa',
    zh: 'Tương tác Thực địa',
    ja: 'Tương tác Thực địa'
  },
  'Tạm dừng': {
    en: 'Tạm dừng',
    fr: 'Tạm dừng',
    zh: 'Tạm dừng',
    ja: 'Tạm dừng'
  },
  'Tạm dừng giọng thuyết minh': {
    en: 'Tạm dừng giọng thuyết minh',
    fr: 'Tạm dừng giọng thuyết minh',
    zh: 'Tạm dừng giọng thuyết minh',
    ja: 'Tạm dừng giọng thuyết minh'
  },
  'Tạm dừng quét': {
    en: 'Tạm dừng quét',
    fr: 'Tạm dừng quét',
    zh: 'Tạm dừng quét',
    ja: 'Tạm dừng quét'
  },
  'Tạo Phòng': {
    en: 'Create Room',
    fr: 'Créer la salle',
    zh: '创建展厅',
    ja: '展示室を作成'
  },
  'Tạo gian phòng': {
    en: 'Create Exhibition Room',
    fr: 'Créer la salle d’exposition',
    zh: '创建展厅',
    ja: '展示室を作成'
  },
  'Tạo không gian toàn cảnh từ ảnh PANO': {
    en: 'Tạo không gian toàn cảnh từ ảnh PANO',
    fr: 'Tạo không gian toàn cảnh từ ảnh PANO',
    zh: 'Tạo không gian toàn cảnh từ ảnh PANO',
    ja: 'Tạo không gian toàn cảnh từ ảnh PANO'
  },
  'Tạo thêm Chuyên đề trưng bày mới': {
    en: 'Tạo thêm Chuyên đề trưng bày mới',
    fr: 'Tạo thêm Chuyên đề trưng bày mới',
    zh: 'Tạo thêm Chuyên đề trưng bày mới',
    ja: 'Tạo thêm Chuyên đề trưng bày mới'
  },
  'Tải file ảnh panorama 360 mới từ máy tính lên máy chủ': {
    en: 'Tải file ảnh panorama 360 mới từ máy tính lên máy chủ',
    fr: 'Tải file ảnh panorama 360 mới từ máy tính lên máy chủ',
    zh: 'Tải file ảnh panorama 360 mới từ máy tính lên máy chủ',
    ja: 'Tải file ảnh panorama 360 mới từ máy tính lên máy chủ'
  },
  'Tải lại trang': {
    en: 'Tải lại trang',
    fr: 'Tải lại trang',
    zh: 'Tải lại trang',
    ja: 'Tải lại trang'
  },
  'Tải mã QR Standee': {
    en: 'Tải mã QR Standee',
    fr: 'Tải mã QR Standee',
    zh: 'Tải mã QR Standee',
    ja: 'Tải mã QR Standee'
  },
  'Tải mã QR Standee phòng này': {
    en: 'Tải mã QR Standee phòng này',
    fr: 'Tải mã QR Standee phòng này',
    zh: 'Tải mã QR Standee phòng này',
    ja: 'Tải mã QR Standee phòng này'
  },
  'Tải tệp ảnh': {
    en: 'Tải tệp ảnh',
    fr: 'Tải tệp ảnh',
    zh: 'Tải tệp ảnh',
    ja: 'Tải tệp ảnh'
  },
  'Tải ảnh 360° lên thành công': {
    en: 'Tải ảnh 360° lên thành công',
    fr: 'Tải ảnh 360° lên thành công',
    zh: 'Tải ảnh 360° lên thành công',
    ja: 'Tải ảnh 360° lên thành công'
  },
  'Tải ảnh mới': {
    en: 'Tải ảnh mới',
    fr: 'Tải ảnh mới',
    zh: 'Tải ảnh mới',
    ja: 'Tải ảnh mới'
  },
  'Tải ảnh mới từ máy': {
    en: 'Tải ảnh mới từ máy',
    fr: 'Tải ảnh mới từ máy',
    zh: 'Tải ảnh mới từ máy',
    ja: 'Tải ảnh mới từ máy'
  },
  'Tầm mắt': {
    en: 'Tầm mắt',
    fr: 'Tầm mắt',
    zh: 'Tầm mắt',
    ja: 'Tầm mắt'
  },
  'Tầm mắt đã đủ, hãy ngửa máy lên trần (+30°) để quét kín trần phòng': {
    en: 'Tầm mắt đã đủ, hãy ngửa máy lên trần (+30°) để quét kín trần phòng',
    fr: 'Tầm mắt đã đủ, hãy ngửa máy lên trần (+30°) để quét kín trần phòng',
    zh: 'Tầm mắt đã đủ, hãy ngửa máy lên trần (+30°) để quét kín trần phòng',
    ja: 'Tầm mắt đã đủ, hãy ngửa máy lên trần (+30°) để quét kín trần phòng'
  },
  'Tận dụng chế độ Pano có sẵn': {
    en: 'Tận dụng chế độ Pano có sẵn',
    fr: 'Tận dụng chế độ Pano có sẵn',
    zh: 'Tận dụng chế độ Pano có sẵn',
    ja: 'Tận dụng chế độ Pano có sẵn'
  },
  'TẮT': {
    en: 'TẮT',
    fr: 'TẮT',
    zh: 'TẮT',
    ja: 'TẮT'
  },
  'Tắt': {
    en: 'Tắt',
    fr: 'Tắt',
    zh: 'Tắt',
    ja: 'Tắt'
  },
  'Tắt chế độ ghim': {
    en: 'Tắt chế độ ghim',
    fr: 'Tắt chế độ ghim',
    zh: 'Tắt chế độ ghim',
    ja: 'Tắt chế độ ghim'
  },
  'Tắt chế độ ghim điểm': {
    en: 'Tắt chế độ ghim điểm',
    fr: 'Tắt chế độ ghim điểm',
    zh: 'Tắt chế độ ghim điểm',
    ja: 'Tắt chế độ ghim điểm'
  },
  'Tự động xoay 360 độ': {
    en: 'Tự động xoay 360 độ',
    fr: 'Tự động xoay 360 độ',
    zh: 'Tự động xoay 360 độ',
    ja: 'Tự động xoay 360 độ'
  },
  'Tự động xoay quanh phòng': {
    en: 'Tự động xoay quanh phòng',
    fr: 'Tự động xoay quanh phòng',
    zh: 'Tự động xoay quanh phòng',
    ja: 'Tự động xoay quanh phòng'
  },
  'URL ảnh logo (https://.../logo.png': {
    en: 'URL ảnh logo (https://.../logo.png',
    fr: 'URL ảnh logo (https://.../logo.png',
    zh: 'URL ảnh logo (https://.../logo.png',
    ja: 'URL ảnh logo (https://.../logo.png'
  },
  'VD: Hệ Thống Đang Nâng Cấp & Bảo Trì': {
    en: 'VD: Hệ Thống Đang Nâng Cấp & Bảo Trì',
    fr: 'VD: Hệ Thống Đang Nâng Cấp & Bảo Trì',
    zh: 'VD: Hệ Thống Đang Nâng Cấp & Bảo Trì',
    ja: 'VD: Hệ Thống Đang Nâng Cấp & Bảo Trì'
  },
  'Vui lòng chọn ít nhất 1 ảnh PANO toàn cảnh hoặc chùm ảnh góc (khuyên dùng 16–36 góc để phủ trọn 360°': {
    en: 'Please chọn ít nhất 1 ảnh PANO toàn cảnh hoặc chùm ảnh góc (khuyên dùng 16–36 góc để phủ trọn 360°',
    fr: 'Veuillez chọn ít nhất 1 ảnh PANO toàn cảnh hoặc chùm ảnh góc (khuyên dùng 16–36 góc để phủ trọn 360°',
    zh: '请chọn ít nhất 1 ảnh PANO toàn cảnh hoặc chùm ảnh góc (khuyên dùng 16–36 góc để phủ trọn 360°',
    ja: 'chọn ít nhất 1 ảnh PANO toàn cảnh hoặc chùm ảnh góc (khuyên dùng 16–36 góc để phủ trọn 360°してください'
  },
  'Vui lòng chờ thêm': {
    en: 'Please chờ thêm',
    fr: 'Veuillez chờ thêm',
    zh: '请chờ thêm',
    ja: 'chờ thêmしてください'
  },
  'Vui lòng chờ thêm trước khi yêu cầu mã mới': {
    en: 'Please chờ thêm trước khi yêu cầu mã mới',
    fr: 'Veuillez chờ thêm trước khi yêu cầu mã mới',
    zh: '请chờ thêm trước khi yêu cầu mã mới',
    ja: 'chờ thêm trước khi yêu cầu mã mớiしてください'
  },
  'Vui lòng kiểm tra lại các trường thông tin bị thiếu hoặc không hợp lệ': {
    en: 'Please kiểm tra lại các trường thông tin bị thiếu hoặc không hợp lệ',
    fr: 'Veuillez kiểm tra lại các trường thông tin bị thiếu hoặc không hợp lệ',
    zh: '请kiểm tra lại các trường thông tin bị thiếu hoặc không hợp lệ',
    ja: 'kiểm tra lại các trường thông tin bị thiếu hoặc không hợp lệしてください'
  },
  'Vui lòng nhập kịch bản thuyết minh trước khi sinh Voice AI': {
    en: 'Please nhập kịch bản thuyết minh trước khi sinh Voice AI',
    fr: 'Veuillez nhập kịch bản thuyết minh trước khi sinh Voice AI',
    zh: '请nhập kịch bản thuyết minh trước khi sinh Voice AI',
    ja: 'nhập kịch bản thuyết minh trước khi sinh Voice AIしてください'
  },
  'Vui lòng nhập mã ISO (ví dụ: en, fr, ja, ko': {
    en: 'Please nhập mã ISO (ví dụ: en, fr, ja, ko',
    fr: 'Veuillez nhập mã ISO (ví dụ: en, fr, ja, ko',
    zh: '请nhập mã ISO (ví dụ: en, fr, ja, ko',
    ja: 'nhập mã ISO (ví dụ: en, fr, ja, koしてください'
  },
  'Vui lòng nhập tên gian phòng và cung cấp ảnh Panorama 360': {
    en: 'Please nhập tên gian phòng và cung cấp ảnh Panorama 360',
    fr: 'Veuillez nhập tên gian phòng và cung cấp ảnh Panorama 360',
    zh: '请nhập tên gian phòng và cung cấp ảnh Panorama 360',
    ja: 'nhập tên gian phòng và cung cấp ảnh Panorama 360してください'
  },
  'Vui lòng nhập tên ngôn ngữ bản xứ': {
    en: 'Please nhập tên ngôn ngữ bản xứ',
    fr: 'Veuillez nhập tên ngôn ngữ bản xứ',
    zh: '请nhập tên ngôn ngữ bản xứ',
    ja: 'nhập tên ngôn ngữ bản xứしてください'
  },
  'Vui lòng nhập tên tiếng Anh': {
    en: 'Please nhập tên tiếng Anh',
    fr: 'Veuillez nhập tên tiếng Anh',
    zh: '请nhập tên tiếng Anh',
    ja: 'nhập tên tiếng Anhしてください'
  },
  'Vào Cài đặt máy → Chọn ứng dụng Safari (hoặc Chrome) → Mục Camera → Chọn': {
    en: 'Vào Cài đặt máy → Chọn ứng dụng Safari (hoặc Chrome) → Mục Camera → Chọn',
    fr: 'Vào Cài đặt máy → Chọn ứng dụng Safari (hoặc Chrome) → Mục Camera → Chọn',
    zh: 'Vào Cài đặt máy → Chọn ứng dụng Safari (hoặc Chrome) → Mục Camera → Chọn',
    ja: 'Vào Cài đặt máy → Chọn ứng dụng Safari (hoặc Chrome) → Mục Camera → Chọn'
  },
  'Ví dụ: Bảo tàng Lịch sử Thành phố Hồ Chí Minh, Bảo tàng Mỹ thuật': {
    en: 'e.g. Bảo tàng Lịch sử Thành phố Hồ Chí Minh, Bảo tàng Mỹ thuật',
    fr: 'Ex. : Bảo tàng Lịch sử Thành phố Hồ Chí Minh, Bảo tàng Mỹ thuật',
    zh: '例如：Bảo tàng Lịch sử Thành phố Hồ Chí Minh, Bảo tàng Mỹ thuật',
    ja: '例：Bảo tàng Lịch sử Thành phố Hồ Chí Minh, Bảo tàng Mỹ thuật'
  },
  'Ví dụ: Bảo tàng Lịch sử, Bảo tàng Mỹ thuật': {
    en: 'e.g. Bảo tàng Lịch sử, Bảo tàng Mỹ thuật',
    fr: 'Ex. : Bảo tàng Lịch sử, Bảo tàng Mỹ thuật',
    zh: '例如：Bảo tàng Lịch sử, Bảo tàng Mỹ thuật',
    ja: '例：Bảo tàng Lịch sử, Bảo tàng Mỹ thuật'
  },
  'Ví dụ: Chronicle of Vietnamese History': {
    en: 'e.g. Chronicle of Vietnamese History',
    fr: 'Ex. : Chronicle of Vietnamese History',
    zh: '例如：Chronicle of Vietnamese History',
    ja: '例：Chronicle of Vietnamese History'
  },
  'Ví dụ: Gian Văn hóa Óc Eo': {
    en: 'e.g. Gian Văn hóa Óc Eo',
    fr: 'Ex. : Gian Văn hóa Óc Eo',
    zh: '例如：Gian Văn hóa Óc Eo',
    ja: '例：Gian Văn hóa Óc Eo'
  },
  'Ví dụ: Hệ thống Tour 360 Không gian Di sản': {
    en: 'e.g. Hệ thống Tour 360 Không gian Di sản',
    fr: 'Ex. : Hệ thống Tour 360 Không gian Di sản',
    zh: '例如：Hệ thống Tour 360 Không gian Di sản',
    ja: '例：Hệ thống Tour 360 Không gian Di sản'
  },
  'Ví dụ: Lối sang gian Tiền Sử, Ra ngoài sân': {
    en: 'e.g. Lối sang gian Tiền Sử, Ra ngoài sân',
    fr: 'Ex. : Lối sang gian Tiền Sử, Ra ngoài sân',
    zh: '例如：Lối sang gian Tiền Sử, Ra ngoài sân',
    ja: '例：Lối sang gian Tiền Sử, Ra ngoài sân'
  },
  'Ví dụ: Tiếng Việt, English, 日本語': {
    en: 'e.g. Tiếng Việt, English, 日本語',
    fr: 'Ex. : Tiếng Việt, English, 日本語',
    zh: '例如：Tiếng Việt, English, 日本語',
    ja: '例：Tiếng Việt, English, 日本語'
  },
  'Ví dụ: Vietnamese, English, Japanese': {
    en: 'e.g. Vietnamese, English, Japanese',
    fr: 'Ex. : Vietnamese, English, Japanese',
    zh: '例如：Vietnamese, English, Japanese',
    ja: '例：Vietnamese, English, Japanese'
  },
  'Ví dụ: 🇬🇧, 🇫🇷, 🇯🇵': {
    en: 'e.g. 🇬🇧, 🇫🇷, 🇯🇵',
    fr: 'Ex. : 🇬🇧, 🇫🇷, 🇯🇵',
    zh: '例如：🇬🇧, 🇫🇷, 🇯🇵',
    ja: '例：🇬🇧, 🇫🇷, 🇯🇵'
  },
  'Văn hóa Nam Bộ & Cổ vật': {
    en: 'Văn hóa Nam Bộ & Cổ vật',
    fr: 'Văn hóa Nam Bộ & Cổ vật',
    zh: 'Văn hóa Nam Bộ & Cổ vật',
    ja: 'Văn hóa Nam Bộ & Cổ vật'
  },
  'Vừa khởi động': {
    en: 'Vừa khởi động',
    fr: 'Vừa khởi động',
    zh: 'Vừa khởi động',
    ja: 'Vừa khởi động'
  },
  'Xem lại hiệu ứng Little Planet': {
    en: 'Xem lại hiệu ứng Little Planet',
    fr: 'Xem lại hiệu ứng Little Planet',
    zh: 'Xem lại hiệu ứng Little Planet',
    ja: 'Xem lại hiệu ứng Little Planet'
  },
  'Xem thử góc nhìn mặc định': {
    en: 'Xem thử góc nhìn mặc định',
    fr: 'Xem thử góc nhìn mặc định',
    zh: 'Xem thử góc nhìn mặc định',
    ja: 'Xem thử góc nhìn mặc định'
  },
  'Xem trước ảnh 360': {
    en: 'Xem trước ảnh 360',
    fr: 'Xem trước ảnh 360',
    zh: 'Xem trước ảnh 360',
    ja: 'Xem trước ảnh 360'
  },
  'Xem văn bản kịch bản thuyết minh': {
    en: 'Xem văn bản kịch bản thuyết minh',
    fr: 'Xem văn bản kịch bản thuyết minh',
    zh: 'Xem văn bản kịch bản thuyết minh',
    ja: 'Xem văn bản kịch bản thuyết minh'
  },
  'Xoay camera về đúng góc nhìn mặc định đã lưu để kiểm tra': {
    en: 'Xoay camera về đúng góc nhìn mặc định đã lưu để kiểm tra',
    fr: 'Xoay camera về đúng góc nhìn mặc định đã lưu để kiểm tra',
    zh: 'Xoay camera về đúng góc nhìn mặc định đã lưu để kiểm tra',
    ja: 'Xoay camera về đúng góc nhìn mặc định đã lưu để kiểm tra'
  },
  'Xoay góc nhìn tới điểm này': {
    en: 'Xoay góc nhìn tới điểm này',
    fr: 'Xoay góc nhìn tới điểm này',
    zh: 'Xoay góc nhìn tới điểm này',
    ja: 'Xoay góc nhìn tới điểm này'
  },
  'Xoay người tại chỗ ~30° mỗi góc': {
    en: 'Xoay người tại chỗ ~30° mỗi góc',
    fr: 'Xoay người tại chỗ ~30° mỗi góc',
    zh: 'Xoay người tại chỗ ~30° mỗi góc',
    ja: 'Xoay người tại chỗ ~30° mỗi góc'
  },
  'Xoay sang PHẢI (~': {
    en: 'Xoay sang PHẢI (~',
    fr: 'Xoay sang PHẢI (~',
    zh: 'Xoay sang PHẢI (~',
    ja: 'Xoay sang PHẢI (~'
  },
  'Xoay sang TRÁI (~': {
    en: 'Xoay sang TRÁI (~',
    fr: 'Xoay sang TRÁI (~',
    zh: 'Xoay sang TRÁI (~',
    ja: 'Xoay sang TRÁI (~'
  },
  'Xoá toàn bộ bản dịch và Voice AI của ngôn ngữ [': {
    en: 'Xoá toàn bộ bản dịch và Voice AI của ngôn ngữ [',
    fr: 'Xoá toàn bộ bản dịch và Voice AI của ngôn ngữ [',
    zh: 'Xoá toàn bộ bản dịch và Voice AI của ngôn ngữ [',
    ja: 'Xoá toàn bộ bản dịch và Voice AI của ngôn ngữ ['
  },
  'Xác nhận gỡ bỏ': {
    en: 'Xác nhận gỡ bỏ',
    fr: 'Xác nhận gỡ bỏ',
    zh: 'Xác nhận gỡ bỏ',
    ja: 'Xác nhận gỡ bỏ'
  },
  'Xác nhận và Đăng nhập': {
    en: 'Xác nhận và Đăng nhập',
    fr: 'Xác nhận và Đăng nhập',
    zh: 'Xác nhận và Đăng nhập',
    ja: 'Xác nhận và Đăng nhập'
  },
  'Xác nhận xóa điểm liên kết': {
    en: 'Xác nhận xóa điểm liên kết',
    fr: 'Xác nhận xóa điểm liên kết',
    zh: 'Xác nhận xóa điểm liên kết',
    ja: 'Xác nhận xóa điểm liên kết'
  },
  'Xác thực OTP Email': {
    en: 'Xác thực OTP Email',
    fr: 'Xác thực OTP Email',
    zh: 'Xác thực OTP Email',
    ja: 'Xác thực OTP Email'
  },
  'Xóa file âm thanh này': {
    en: 'Xóa file âm thanh này',
    fr: 'Xóa file âm thanh này',
    zh: 'Xóa file âm thanh này',
    ja: 'Xóa file âm thanh này'
  },
  'Xóa gian phòng di sản': {
    en: 'Xóa gian phòng di sản',
    fr: 'Xóa gian phòng di sản',
    zh: 'Xóa gian phòng di sản',
    ja: 'Xóa gian phòng di sản'
  },
  'Xóa gian phòng khỏi Database': {
    en: 'Xóa gian phòng khỏi Database',
    fr: 'Xóa gian phòng khỏi Database',
    zh: 'Xóa gian phòng khỏi Database',
    ja: 'Xóa gian phòng khỏi Database'
  },
  'Xóa góc nhìn': {
    en: 'Xóa góc nhìn',
    fr: 'Xóa góc nhìn',
    zh: 'Xóa góc nhìn',
    ja: 'Xóa góc nhìn'
  },
  'Xóa hàng loạt không gian 360°': {
    en: 'Xóa hàng loạt không gian 360°',
    fr: 'Xóa hàng loạt không gian 360°',
    zh: 'Xóa hàng loạt không gian 360°',
    ja: 'Xóa hàng loạt không gian 360°'
  },
  'Xóa không gian 360°': {
    en: 'Xóa không gian 360°',
    fr: 'Xóa không gian 360°',
    zh: 'Xóa không gian 360°',
    ja: 'Xóa không gian 360°'
  },
  'Xóa khỏi máy chủ': {
    en: 'Xóa khỏi máy chủ',
    fr: 'Xóa khỏi máy chủ',
    zh: 'Xóa khỏi máy chủ',
    ja: 'Xóa khỏi máy chủ'
  },
  'Xóa ngôn ngữ [': {
    en: 'Xóa ngôn ngữ [',
    fr: 'Xóa ngôn ngữ [',
    zh: 'Xóa ngôn ngữ [',
    ja: 'Xóa ngôn ngữ ['
  },
  'Xóa tìm kiếm': {
    en: 'Xóa tìm kiếm',
    fr: 'Xóa tìm kiếm',
    zh: 'Xóa tìm kiếm',
    ja: 'Xóa tìm kiếm'
  },
  'Xóa vĩnh viễn': {
    en: 'Xóa vĩnh viễn',
    fr: 'Xóa vĩnh viễn',
    zh: 'Xóa vĩnh viễn',
    ja: 'Xóa vĩnh viễn'
  },
  'Xóa điểm liên kết này': {
    en: 'Xóa điểm liên kết này',
    fr: 'Xóa điểm liên kết này',
    zh: 'Xóa điểm liên kết này',
    ja: 'Xóa điểm liên kết này'
  },
  'Xóa ảnh này': {
    en: 'Xóa ảnh này',
    fr: 'Xóa ảnh này',
    zh: 'Xóa ảnh này',
    ja: 'Xóa ảnh này'
  },
  'Xưởng Ghép Ảnh Toàn Cảnh 360°': {
    en: 'Xưởng Ghép Ảnh Toàn Cảnh 360°',
    fr: 'Xưởng Ghép Ảnh Toàn Cảnh 360°',
    zh: 'Xưởng Ghép Ảnh Toàn Cảnh 360°',
    ja: 'Xưởng Ghép Ảnh Toàn Cảnh 360°'
  },
  '[AuthContext] Máy chủ đang bảo trì hoặc khởi động lại, bảo lưu phiên đăng nhập': {
    en: '[AuthContext] Máy chủ đang bảo trì hoặc khởi động lại, bảo lưu phiên đăng nhập',
    fr: '[AuthContext] Máy chủ đang bảo trì hoặc khởi động lại, bảo lưu phiên đăng nhập',
    zh: '[AuthContext] Máy chủ đang bảo trì hoặc khởi động lại, bảo lưu phiên đăng nhập',
    ja: '[AuthContext] Máy chủ đang bảo trì hoặc khởi động lại, bảo lưu phiên đăng nhập'
  },
  '[AuthContext] Phiên đăng nhập hết hạn hoặc không có quyền': {
    en: '[AuthContext] Phiên đăng nhập hết hạn hoặc không có quyền',
    fr: '[AuthContext] Phiên đăng nhập hết hạn hoặc không có quyền',
    zh: '[AuthContext] Phiên đăng nhập hết hạn hoặc không có quyền',
    ja: '[AuthContext] Phiên đăng nhập hết hạn hoặc không có quyền'
  },
  '[Camera] Đã tự động kích hoạt ống kính góc rộng 0.5x': {
    en: '[Camera] Đã tự động kích hoạt ống kính góc rộng 0.5x',
    fr: '[Camera] Đã tự động kích hoạt ống kính góc rộng 0.5x',
    zh: '[Camera] Đã tự động kích hoạt ống kính góc rộng 0.5x',
    ja: '[Camera] Đã tự động kích hoạt ống kính góc rộng 0.5x'
  },
  '[ClientTranslation] Không thể nạp gói từ điển động cho': {
    en: '[ClientTranslation] Không thể nạp gói từ điển động cho',
    fr: '[ClientTranslation] Không thể nạp gói từ điển động cho',
    zh: '[ClientTranslation] Không thể nạp gói từ điển động cho',
    ja: '[ClientTranslation] Không thể nạp gói từ điển động cho'
  },
  '[ClientTranslation] Lỗi nạp danh mục ngôn ngữ kích hoạt': {
    en: '[ClientTranslation] Lỗi nạp danh mục ngôn ngữ kích hoạt',
    fr: '[ClientTranslation] Lỗi nạp danh mục ngôn ngữ kích hoạt',
    zh: '[ClientTranslation] Lỗi nạp danh mục ngôn ngữ kích hoạt',
    ja: '[ClientTranslation] Lỗi nạp danh mục ngôn ngữ kích hoạt'
  },
  '[SystemBrandingContext] Không thể nạp cấu hình từ API, dùng cache': {
    en: '[SystemBrandingContext] Không thể nạp cấu hình từ API, dùng cache',
    fr: '[SystemBrandingContext] Không thể nạp cấu hình từ API, dùng cache',
    zh: '[SystemBrandingContext] Không thể nạp cấu hình từ API, dùng cache',
    ja: '[SystemBrandingContext] Không thể nạp cấu hình từ API, dùng cache'
  },
  '[Tiêu đề]: nội dung': {
    en: '[Tiêu đề]: nội dung',
    fr: '[Tiêu đề]: nội dung',
    zh: '[Tiêu đề]: nội dung',
    ja: '[Tiêu đề]: nội dung'
  },
  '[clipboard] Clipboard API thất bại, dùng execCommand': {
    en: '[clipboard] Clipboard API thất bại, dùng execCommand',
    fr: '[clipboard] Clipboard API thất bại, dùng execCommand',
    zh: '[clipboard] Clipboard API thất bại, dùng execCommand',
    ja: '[clipboard] Clipboard API thất bại, dùng execCommand'
  },
  '[clipboard] Fallback execCommand thất bại': {
    en: '[clipboard] Fallback execCommand thất bại',
    fr: '[clipboard] Fallback execCommand thất bại',
    zh: '[clipboard] Fallback execCommand thất bại',
    ja: '[clipboard] Fallback execCommand thất bại'
  },
  '] cho khách tham quan Client': {
    en: '] cho khách tham quan Client',
    fr: '] cho khách tham quan Client',
    zh: '] cho khách tham quan Client',
    ja: '] cho khách tham quan Client'
  },
  '] khỏi gian phòng này': {
    en: '] khỏi gian phòng này',
    fr: '] khỏi gian phòng này',
    zh: '] khỏi gian phòng này',
    ja: '] khỏi gian phòng này'
  },
  '] khỏi phòng': {
    en: '] khỏi phòng',
    fr: '] khỏi phòng',
    zh: '] khỏi phòng',
    ja: '] khỏi phòng'
  },
  '] khỏi phòng này': {
    en: '] khỏi phòng này',
    fr: '] khỏi phòng này',
    zh: '] khỏi phòng này',
    ja: '] khỏi phòng này'
  },
  '] thành công!': {
    en: '] thành công!',
    fr: '] thành công!',
    zh: '] thành công!',
    ja: '] thành công!'
  },
  '] trên Client': {
    en: '] trên Client',
    fr: '] trên Client',
    zh: '] trên Client',
    ja: '] trên Client'
  },
  ']. Bấm \'Lưu thay đổi vào Database\' để hoàn tất': {
    en: ']. Bấm \'Lưu thay đổi vào Database\' để hoàn tất',
    fr: ']. Bấm \'Lưu thay đổi vào Database\' để hoàn tất',
    zh: ']. Bấm \'Lưu thay đổi vào Database\' để hoàn tất',
    ja: ']. Bấm \'Lưu thay đổi vào Database\' để hoàn tất'
  },
  'file ảnh 360° đã chọn khỏi máy chủ lưu trữ?': {
    en: 'file ảnh 360° đã chọn khỏi máy chủ lưu trữ?',
    fr: 'file ảnh 360° đã chọn khỏi máy chủ lưu trữ?',
    zh: 'file ảnh 360° đã chọn khỏi máy chủ lưu trữ?',
    ja: 'file ảnh 360° đã chọn khỏi máy chủ lưu trữ?'
  },
  'gian phòng tiếp theo': {
    en: 'gian phòng tiếp theo',
    fr: 'gian phòng tiếp theo',
    zh: 'gian phòng tiếp theo',
    ja: 'gian phòng tiếp theo'
  },
  'gian phòng trực thuộc': {
    en: 'gian phòng trực thuộc',
    fr: 'gian phòng trực thuộc',
    zh: 'gian phòng trực thuộc',
    ja: 'gian phòng trực thuộc'
  },
  'giây trước khi yêu cầu mã mới': {
    en: 'giây trước khi yêu cầu mã mới',
    fr: 'giây trước khi yêu cầu mã mới',
    zh: 'giây trước khi yêu cầu mã mới',
    ja: 'giây trước khi yêu cầu mã mới'
  },
  'giờ': {
    en: 'giờ',
    fr: 'giờ',
    zh: 'giờ',
    ja: 'giờ'
  },
  'https://... hoặc tải file bên phải': {
    en: 'https://... hoặc tải file bên phải',
    fr: 'https://... hoặc tải file bên phải',
    zh: 'https://... hoặc tải file bên phải',
    ja: 'https://... hoặc tải file bên phải'
  },
  'https://... đường dẫn ảnh 360': {
    en: 'https://... đường dẫn ảnh 360',
    fr: 'https://... đường dẫn ảnh 360',
    zh: 'https://... đường dẫn ảnh 360',
    ja: 'https://... đường dẫn ảnh 360'
  },
  'không gian 360°': {
    en: '360° spaces',
    fr: 'espaces 360°',
    zh: '360°空间',
    ja: '360度パノラマ空間'
  },
  'khỏi gian phòng này': {
    en: 'khỏi gian phòng này',
    fr: 'khỏi gian phòng này',
    zh: 'khỏi gian phòng này',
    ja: 'khỏi gian phòng này'
  },
  'khỏi gian phòng này?': {
    en: 'khỏi gian phòng này?',
    fr: 'khỏi gian phòng này?',
    zh: 'khỏi gian phòng này?',
    ja: 'khỏi gian phòng này?'
  },
  'khỏi hệ thống? Các bản dịch liên quan của ngôn ngữ này sẽ không còn hiển thị trên trang khách tham quan': {
    en: 'khỏi hệ thống? Các bản dịch liên quan của ngôn ngữ này sẽ không còn hiển thị trên trang khách tham quan',
    fr: 'khỏi hệ thống? Các bản dịch liên quan của ngôn ngữ này sẽ không còn hiển thị trên trang khách tham quan',
    zh: 'khỏi hệ thống? Các bản dịch liên quan của ngôn ngữ này sẽ không còn hiển thị trên trang khách tham quan',
    ja: 'khỏi hệ thống? Các bản dịch liên quan của ngôn ngữ này sẽ không còn hiển thị trên trang khách tham quan'
  },
  'ngày': {
    en: 'ngày',
    fr: 'ngày',
    zh: 'ngày',
    ja: 'ngày'
  },
  'ngôn ngữ sẵn sàng': {
    en: 'ngôn ngữ sẵn sàng',
    fr: 'ngôn ngữ sẵn sàng',
    zh: 'ngôn ngữ sẵn sàng',
    ja: 'ngôn ngữ sẵn sàng'
  },
  'này hiện đã bị tắt hoạt động trong trang Quản trị Ngôn ngữ & Voice AI. Du khách sẽ không thấy và không nghe được ngôn ngữ này trong Tour. Bạn có thể bấm nút': {
    en: 'này hiện đã bị tắt hoạt động trong trang Quản trị Ngôn ngữ & Voice AI. Du khách sẽ không thấy và không nghe được ngôn ngữ này trong Tour. Bạn có thể bấm nút',
    fr: 'này hiện đã bị tắt hoạt động trong trang Quản trị Ngôn ngữ & Voice AI. Du khách sẽ không thấy và không nghe được ngôn ngữ này trong Tour. Bạn có thể bấm nút',
    zh: 'này hiện đã bị tắt hoạt động trong trang Quản trị Ngôn ngữ & Voice AI. Du khách sẽ không thấy và không nghe được ngôn ngữ này trong Tour. Bạn có thể bấm nút',
    ja: 'này hiện đã bị tắt hoạt động trong trang Quản trị Ngôn ngữ & Voice AI. Du khách sẽ không thấy và không nghe được ngôn ngữ này trong Tour. Bạn có thể bấm nút'
  },
  'phòng': {
    en: 'phòng',
    fr: 'phòng',
    zh: 'phòng',
    ja: 'phòng'
  },
  'phòng trực thuộc, không thể xóa': {
    en: 'phòng trực thuộc, không thể xóa',
    fr: 'phòng trực thuộc, không thể xóa',
    zh: 'phòng trực thuộc, không thể xóa',
    ja: 'phòng trực thuộc, không thể xóa'
  },
  'phút': {
    en: 'phút',
    fr: 'phút',
    zh: 'phút',
    ja: 'phút'
  },
  'phút (Dự phòng': {
    en: 'phút (Dự phòng',
    fr: 'phút (Dự phòng',
    zh: 'phút (Dự phòng',
    ja: 'phút (Dự phòng'
  },
  'phút còn lại': {
    en: 'phút còn lại',
    fr: 'phút còn lại',
    zh: 'phút còn lại',
    ja: 'phút còn lại'
  },
  'phục hồi hoạt động': {
    en: 'phục hồi hoạt động',
    fr: 'phục hồi hoạt động',
    zh: 'phục hồi hoạt động',
    ja: 'phục hồi hoạt động'
  },
  'rồi lia tròn 360°. Sau đó nhấn nút': {
    en: 'rồi lia tròn 360°. Sau đó nhấn nút',
    fr: 'rồi lia tròn 360°. Sau đó nhấn nút',
    zh: 'rồi lia tròn 360°. Sau đó nhấn nút',
    ja: 'rồi lia tròn 360°. Sau đó nhấn nút'
  },
  'thuộc chuyên đề': {
    en: 'thuộc chuyên đề',
    fr: 'thuộc chuyên đề',
    zh: 'thuộc chuyên đề',
    ja: 'thuộc chuyên đề'
  },
  'tác vụ trong hàng đợi ghép 360°': {
    en: 'tác vụ trong hàng đợi ghép 360°',
    fr: 'tác vụ trong hàng đợi ghép 360°',
    zh: 'tác vụ trong hàng đợi ghép 360°',
    ja: 'tác vụ trong hàng đợi ghép 360°'
  },
  'tại': {
    en: 'tại',
    fr: 'tại',
    zh: 'tại',
    ja: 'tại'
  },
  '° (Quét hiện vật & sàn': {
    en: '° (Quét hiện vật & sàn',
    fr: '° (Quét hiện vật & sàn',
    zh: '° (Quét hiện vật & sàn',
    ja: '° (Quét hiện vật & sàn'
  },
  '° (Quét trần & không gian': {
    en: '° (Quét trần & không gian',
    fr: '° (Quét trần & không gian',
    zh: '° (Quét trần & không gian',
    ja: '° (Quét trần & không gian'
  },
  '°) để bổ sung góc còn thiếu tầng này': {
    en: '°) để bổ sung góc còn thiếu tầng này',
    fr: '°) để bổ sung góc còn thiếu tầng này',
    zh: '°) để bổ sung góc còn thiếu tầng này',
    ja: '°) để bổ sung góc còn thiếu tầng này'
  },
  '°), tiếp tục xoay nhẹ': {
    en: '°), tiếp tục xoay nhẹ',
    fr: '°), tiếp tục xoay nhẹ',
    zh: '°), tiếp tục xoay nhẹ',
    ja: '°), tiếp tục xoay nhẹ'
  },
  '°). Để tạo không gian 360° trọn vẹn không bị méo, nên nạp đủ 16–36 ảnh hoặc 1 ảnh PANO!': {
    en: '°). Để tạo không gian 360° trọn vẹn không bị méo, nên nạp đủ 16–36 ảnh hoặc 1 ảnh PANO!',
    fr: '°). Để tạo không gian 360° trọn vẹn không bị méo, nên nạp đủ 16–36 ảnh hoặc 1 ảnh PANO!',
    zh: '°). Để tạo không gian 360° trọn vẹn không bị méo, nên nạp đủ 16–36 ảnh hoặc 1 ảnh PANO!',
    ja: '°). Để tạo không gian 360° trọn vẹn không bị méo, nên nạp đủ 16–36 ảnh hoặc 1 ảnh PANO!'
  },
  '°, Đứng': {
    en: '°, Đứng',
    fr: '°, Đứng',
    zh: '°, Đứng',
    ja: '°, Đứng'
  },
  'Áp dụng liên kết': {
    en: 'Áp dụng liên kết',
    fr: 'Áp dụng liên kết',
    zh: 'Áp dụng liên kết',
    ja: 'Áp dụng liên kết'
  },
  'Đang chọn: Nhấp lên ảnh để đặt': {
    en: 'chọn: Nhấp lên ảnh để đặt...',
    fr: 'En cours : chọn: Nhấp lên ảnh để đặt...',
    zh: '正在chọn: Nhấp lên ảnh để đặt...',
    ja: 'chọn: Nhấp lên ảnh để đặt中...'
  },
  'Đang có': {
    en: 'có...',
    fr: 'En cours : có...',
    zh: '正在có...',
    ja: 'có中...'
  },
  'Đang ghép': {
    en: 'ghép...',
    fr: 'En cours : ghép...',
    zh: '正在ghép...',
    ja: 'ghép中...'
  },
  'Đang gửi mã': {
    en: 'gửi mã...',
    fr: 'En cours : gửi mã...',
    zh: '正在gửi mã...',
    ja: 'gửi mã中...'
  },
  'Đang kiểm tra chất lượng': {
    en: 'kiểm tra chất lượng...',
    fr: 'En cours : kiểm tra chất lượng...',
    zh: '正在kiểm tra chất lượng...',
    ja: 'kiểm tra chất lượng中...'
  },
  'Đang lia máy hơi nhanh, hãy xoay chậm lại để ảnh không bị nhòe chi tiết': {
    en: 'lia máy hơi nhanh, hãy xoay chậm lại để ảnh không bị nhòe chi tiết...',
    fr: 'En cours : lia máy hơi nhanh, hãy xoay chậm lại để ảnh không bị nhòe chi tiết...',
    zh: '正在lia máy hơi nhanh, hãy xoay chậm lại để ảnh không bị nhòe chi tiết...',
    ja: 'lia máy hơi nhanh, hãy xoay chậm lại để ảnh không bị nhòe chi tiết中...'
  },
  'Đang làm mới': {
    en: 'làm mới...',
    fr: 'En cours : làm mới...',
    zh: '正在làm mới...',
    ja: 'làm mới中...'
  },
  'Đang lưu': {
    en: 'lưu...',
    fr: 'En cours : lưu...',
    zh: '正在lưu...',
    ja: 'lưu中...'
  },
  'Đang phát giọng đọc AI [': {
    en: 'phát giọng đọc AI [...',
    fr: 'En cours : phát giọng đọc AI [...',
    zh: '正在phát giọng đọc AI [...',
    ja: 'phát giọng đọc AI [中...'
  },
  'Đang tải': {
    en: 'tải...',
    fr: 'En cours : tải...',
    zh: '正在tải...',
    ja: 'tải中...'
  },
  'Đang tải danh mục chuyên đề': {
    en: 'tải danh mục chuyên đề...',
    fr: 'En cours : tải danh mục chuyên đề...',
    zh: '正在tải danh mục chuyên đề...',
    ja: 'tải danh mục chuyên đề中...'
  },
  'Đang tải danh sách ảnh 360°': {
    en: 'tải danh sách ảnh 360°...',
    fr: 'En cours : tải danh sách ảnh 360°...',
    zh: '正在tải danh sách ảnh 360°...',
    ja: 'tải danh sách ảnh 360°中...'
  },
  'Đang xem không gian lưu trữ': {
    en: 'xem không gian lưu trữ...',
    fr: 'En cours : xem không gian lưu trữ...',
    zh: '正在xem không gian lưu trữ...',
    ja: 'xem không gian lưu trữ中...'
  },
  'Đang xoay camera về góc nhìn ban đầu (Ngang': {
    en: 'xoay camera về góc nhìn ban đầu (Ngang...',
    fr: 'En cours : xoay camera về góc nhìn ban đầu (Ngang...',
    zh: '正在xoay camera về góc nhìn ban đầu (Ngang...',
    ja: 'xoay camera về góc nhìn ban đầu (Ngang中...'
  },
  'Đang xác nhận': {
    en: 'xác nhận...',
    fr: 'En cours : xác nhận...',
    zh: '正在xác nhận...',
    ja: 'xác nhận中...'
  },
  'Đang xác thực bảo mật hệ thống quản trị': {
    en: 'xác thực bảo mật hệ thống quản trị...',
    fr: 'En cours : xác thực bảo mật hệ thống quản trị...',
    zh: '正在xác thực bảo mật hệ thống quản trị...',
    ja: 'xác thực bảo mật hệ thống quản trị中...'
  },
  'Đang đăng nhập': {
    en: 'đăng nhập...',
    fr: 'En cours : đăng nhập...',
    zh: '正在đăng nhập...',
    ja: 'đăng nhập中...'
  },
  'Đi thử sang phòng này': {
    en: 'Đi thử sang phòng này',
    fr: 'Đi thử sang phòng này',
    zh: 'Đi thử sang phòng này',
    ja: 'Đi thử sang phòng này'
  },
  'Điêu khắc Phật giáo & Ấn Độ giáo Champa': {
    en: 'Điêu khắc Phật giáo & Ấn Độ giáo Champa',
    fr: 'Điêu khắc Phật giáo & Ấn Độ giáo Champa',
    zh: 'Điêu khắc Phật giáo & Ấn Độ giáo Champa',
    ja: 'Điêu khắc Phật giáo & Ấn Độ giáo Champa'
  },
  'Điểm Chuyển Phòng (Mũi tên 3D': {
    en: 'Điểm Chuyển Phòng (Mũi tên 3D',
    fr: 'Điểm Chuyển Phòng (Mũi tên 3D',
    zh: 'Điểm Chuyển Phòng (Mũi tên 3D',
    ja: 'Điểm Chuyển Phòng (Mũi tên 3D'
  },
  'Điểm neo': {
    en: 'Điểm neo',
    fr: 'Điểm neo',
    zh: 'Điểm neo',
    ja: 'Điểm neo'
  },
  'Đã bao phủ không gian, bạn có thể bấm "Ghép 360°" ngay': {
    en: 'Đã bao phủ không gian, bạn có thể bấm "Ghép 360°" ngay',
    fr: 'Đã bao phủ không gian, bạn có thể bấm "Ghép 360°" ngay',
    zh: 'Đã bao phủ không gian, bạn có thể bấm "Ghép 360°" ngay',
    ja: 'Đã bao phủ không gian, bạn có thể bấm "Ghép 360°" ngay'
  },
  'Đã bao phủ toàn diện không gian, bạn có thể bấm "Ghép 360°" ngay': {
    en: 'Đã bao phủ toàn diện không gian, bạn có thể bấm "Ghép 360°" ngay',
    fr: 'Đã bao phủ toàn diện không gian, bạn có thể bấm "Ghép 360°" ngay',
    zh: 'Đã bao phủ toàn diện không gian, bạn có thể bấm "Ghép 360°" ngay',
    ja: 'Đã bao phủ toàn diện không gian, bạn có thể bấm "Ghép 360°" ngay'
  },
  'Đã có': {
    en: 'Đã có',
    fr: 'Đã có',
    zh: 'Đã có',
    ja: 'Đã có'
  },
  'Đã có file Voice AI': {
    en: 'Đã có file Voice AI',
    fr: 'Đã có file Voice AI',
    zh: 'Đã có file Voice AI',
    ja: 'Đã có file Voice AI'
  },
  'Đã cập nhật chuyên đề "': {
    en: 'Đã cập nhật chuyên đề "',
    fr: 'Đã cập nhật chuyên đề "',
    zh: 'Đã cập nhật chuyên đề "',
    ja: 'Đã cập nhật chuyên đề "'
  },
  'Đã cập nhật dữ liệu "': {
    en: 'Đã cập nhật dữ liệu "',
    fr: 'Đã cập nhật dữ liệu "',
    zh: 'Đã cập nhật dữ liệu "',
    ja: 'Đã cập nhật dữ liệu "'
  },
  'Đã ghi nhận góc chụp tầng': {
    en: 'Đã ghi nhận góc chụp tầng',
    fr: 'Đã ghi nhận góc chụp tầng',
    zh: 'Đã ghi nhận góc chụp tầng',
    ja: 'Đã ghi nhận góc chụp tầng'
  },
  'Đã gỡ bỏ file Voice AI của [': {
    en: 'Đã gỡ bỏ file Voice AI của [',
    fr: 'Đã gỡ bỏ file Voice AI của [',
    zh: 'Đã gỡ bỏ file Voice AI của [',
    ja: 'Đã gỡ bỏ file Voice AI của ['
  },
  'Đã gỡ bỏ ngôn ngữ': {
    en: 'Đã gỡ bỏ ngôn ngữ',
    fr: 'Đã gỡ bỏ ngôn ngữ',
    zh: 'Đã gỡ bỏ ngôn ngữ',
    ja: 'Đã gỡ bỏ ngôn ngữ'
  },
  'Đã gỡ logo. Hệ thống sẽ hiển thị biểu trưng chữ (Emblem) thay thế': {
    en: 'Đã gỡ logo. Hệ thống sẽ hiển thị biểu trưng chữ (Emblem) thay thế',
    fr: 'Đã gỡ logo. Hệ thống sẽ hiển thị biểu trưng chữ (Emblem) thay thế',
    zh: 'Đã gỡ logo. Hệ thống sẽ hiển thị biểu trưng chữ (Emblem) thay thế',
    ja: 'Đã gỡ logo. Hệ thống sẽ hiển thị biểu trưng chữ (Emblem) thay thế'
  },
  'Đã khôi phục mẫu nhận diện chuẩn. Nhấn "Lưu cấu hình" để áp dụng': {
    en: 'Đã khôi phục mẫu nhận diện chuẩn. Nhấn "Lưu cấu hình" để áp dụng',
    fr: 'Đã khôi phục mẫu nhận diện chuẩn. Nhấn "Lưu cấu hình" để áp dụng',
    zh: 'Đã khôi phục mẫu nhận diện chuẩn. Nhấn "Lưu cấu hình" để áp dụng',
    ja: 'Đã khôi phục mẫu nhận diện chuẩn. Nhấn "Lưu cấu hình" để áp dụng'
  },
  'Đã khôi phục mẫu thông báo chuẩn của Bảo tàng': {
    en: 'Đã khôi phục mẫu thông báo chuẩn của Bảo tàng',
    fr: 'Đã khôi phục mẫu thông báo chuẩn của Bảo tàng',
    zh: 'Đã khôi phục mẫu thông báo chuẩn của Bảo tàng',
    ja: 'Đã khôi phục mẫu thông báo chuẩn của Bảo tàng'
  },
  'Đã kích hoạt chế độ bảo trì hệ thống': {
    en: 'Đã kích hoạt chế độ bảo trì hệ thống',
    fr: 'Đã kích hoạt chế độ bảo trì hệ thống',
    zh: 'Đã kích hoạt chế độ bảo trì hệ thống',
    ja: 'Đã kích hoạt chế độ bảo trì hệ thống'
  },
  'Đã kích hoạt ngôn ngữ [': {
    en: 'Đã kích hoạt ngôn ngữ [',
    fr: 'Đã kích hoạt ngôn ngữ [',
    zh: 'Đã kích hoạt ngôn ngữ [',
    ja: 'Đã kích hoạt ngôn ngữ ['
  },
  'Đã làm mới dữ liệu máy chủ & hạ tầng thành công (Độ trễ': {
    en: 'Đã làm mới dữ liệu máy chủ & hạ tầng thành công (Độ trễ',
    fr: 'Đã làm mới dữ liệu máy chủ & hạ tầng thành công (Độ trễ',
    zh: 'Đã làm mới dữ liệu máy chủ & hạ tầng thành công (Độ trễ',
    ja: 'Đã làm mới dữ liệu máy chủ & hạ tầng thành công (Độ trễ'
  },
  'Đã làm mới! Hãy bấm "Bắt đầu quét" và xoay người từ từ': {
    en: 'Đã làm mới! Hãy bấm "Bắt đầu quét" và xoay người từ từ',
    fr: 'Đã làm mới! Hãy bấm "Bắt đầu quét" và xoay người từ từ',
    zh: 'Đã làm mới! Hãy bấm "Bắt đầu quét" và xoay người từ từ',
    ja: 'Đã làm mới! Hãy bấm "Bắt đầu quét" và xoay người từ từ'
  },
  'Đã lưu hướng nhìn mặc định khi vào phòng': {
    en: 'Đã lưu hướng nhìn mặc định khi vào phòng',
    fr: 'Đã lưu hướng nhìn mặc định khi vào phòng',
    zh: 'Đã lưu hướng nhìn mặc định khi vào phòng',
    ja: 'Đã lưu hướng nhìn mặc định khi vào phòng'
  },
  'Đã lưu lời thuyết minh và đồng bộ Voice AI tiếng Việt cho gian phòng "': {
    en: 'Đã lưu lời thuyết minh và đồng bộ Voice AI tiếng Việt cho gian phòng "',
    fr: 'Đã lưu lời thuyết minh và đồng bộ Voice AI tiếng Việt cho gian phòng "',
    zh: 'Đã lưu lời thuyết minh và đồng bộ Voice AI tiếng Việt cho gian phòng "',
    ja: 'Đã lưu lời thuyết minh và đồng bộ Voice AI tiếng Việt cho gian phòng "'
  },
  'Đã lưu và áp dụng cấu hình thành công': {
    en: 'Đã lưu và áp dụng cấu hình thành công',
    fr: 'Đã lưu và áp dụng cấu hình thành công',
    zh: 'Đã lưu và áp dụng cấu hình thành công',
    ja: 'Đã lưu và áp dụng cấu hình thành công'
  },
  'Đã lưu điểm liên kết thành công': {
    en: 'Đã lưu điểm liên kết thành công',
    fr: 'Đã lưu điểm liên kết thành công',
    zh: 'Đã lưu điểm liên kết thành công',
    ja: 'Đã lưu điểm liên kết thành công'
  },
  'Đã nạp': {
    en: 'Đã nạp',
    fr: 'Đã nạp',
    zh: 'Đã nạp',
    ja: 'Đã nạp'
  },
  'Đã nạp thành công ảnh toàn cảnh 360° chuẩn quốc tế': {
    en: 'Đã nạp thành công ảnh toàn cảnh 360° chuẩn quốc tế',
    fr: 'Đã nạp thành công ảnh toàn cảnh 360° chuẩn quốc tế',
    zh: 'Đã nạp thành công ảnh toàn cảnh 360° chuẩn quốc tế',
    ja: 'Đã nạp thành công ảnh toàn cảnh 360° chuẩn quốc tế'
  },
  'Đã nạp tư liệu lịch sử chuẩn cho': {
    en: 'Đã nạp tư liệu lịch sử chuẩn cho',
    fr: 'Đã nạp tư liệu lịch sử chuẩn cho',
    zh: 'Đã nạp tư liệu lịch sử chuẩn cho',
    ja: 'Đã nạp tư liệu lịch sử chuẩn cho'
  },
  'Đã nắm rõ & Bắt đầu chụp': {
    en: 'Đã nắm rõ & Bắt đầu chụp',
    fr: 'Đã nắm rõ & Bắt đầu chụp',
    zh: 'Đã nắm rõ & Bắt đầu chụp',
    ja: 'Đã nắm rõ & Bắt đầu chụp'
  },
  'Đã sao chép link ảnh 360 độ': {
    en: 'Đã sao chép link ảnh 360 độ',
    fr: 'Đã sao chép link ảnh 360 độ',
    zh: 'Đã sao chép link ảnh 360 độ',
    ja: 'Đã sao chép link ảnh 360 độ'
  },
  'Đã sao chép liên kết ảnh 360° vào bộ nhớ tạm': {
    en: 'Đã sao chép liên kết ảnh 360° vào bộ nhớ tạm',
    fr: 'Đã sao chép liên kết ảnh 360° vào bộ nhớ tạm',
    zh: 'Đã sao chép liên kết ảnh 360° vào bộ nhớ tạm',
    ja: 'Đã sao chép liên kết ảnh 360° vào bộ nhớ tạm'
  },
  'Đã thêm chuyên đề "': {
    en: 'Đã thêm chuyên đề "',
    fr: 'Đã thêm chuyên đề "',
    zh: 'Đã thêm chuyên đề "',
    ja: 'Đã thêm chuyên đề "'
  },
  'Đã thêm gian phòng "': {
    en: 'Đã thêm gian phòng "',
    fr: 'Đã thêm gian phòng "',
    zh: 'Đã thêm gian phòng "',
    ja: 'Đã thêm gian phòng "'
  },
  'Đã thêm ngôn ngữ "': {
    en: 'Đã thêm ngôn ngữ "',
    fr: 'Đã thêm ngôn ngữ "',
    zh: 'Đã thêm ngôn ngữ "',
    ja: 'Đã thêm ngôn ngữ "'
  },
  'Đã tạm dừng hiển thị [': {
    en: 'Đã tạm dừng hiển thị [',
    fr: 'Đã tạm dừng hiển thị [',
    zh: 'Đã tạm dừng hiển thị [',
    ja: 'Đã tạm dừng hiển thị ['
  },
  'Đã tải ảnh logo lên thành công! Nhấn "Lưu cấu hình" để đồng bộ': {
    en: 'Đã tải ảnh logo lên thành công! Nhấn "Lưu cấu hình" để đồng bộ',
    fr: 'Đã tải ảnh logo lên thành công! Nhấn "Lưu cấu hình" để đồng bộ',
    zh: 'Đã tải ảnh logo lên thành công! Nhấn "Lưu cấu hình" để đồng bộ',
    ja: 'Đã tải ảnh logo lên thành công! Nhấn "Lưu cấu hình" để đồng bộ'
  },
  'Đã tắt bảo trì, hệ thống trực tuyến': {
    en: 'Đã tắt bảo trì, hệ thống trực tuyến',
    fr: 'Đã tắt bảo trì, hệ thống trực tuyến',
    zh: 'Đã tắt bảo trì, hệ thống trực tuyến',
    ja: 'Đã tắt bảo trì, hệ thống trực tuyến'
  },
  'Đã xuất file Voice AI [': {
    en: 'Đã xuất file Voice AI [',
    fr: 'Đã xuất file Voice AI [',
    zh: 'Đã xuất file Voice AI [',
    ja: 'Đã xuất file Voice AI ['
  },
  'Đã xóa chuyên đề "': {
    en: 'Đã xóa chuyên đề "',
    fr: 'Đã xóa chuyên đề "',
    zh: 'Đã xóa chuyên đề "',
    ja: 'Đã xóa chuyên đề "'
  },
  'Đã xóa gian phòng thành công': {
    en: 'Đã xóa gian phòng thành công',
    fr: 'Đã xóa gian phòng thành công',
    zh: 'Đã xóa gian phòng thành công',
    ja: 'Đã xóa gian phòng thành công'
  },
  'Đã xóa ngôn ngữ "': {
    en: 'Đã xóa ngôn ngữ "',
    fr: 'Đã xóa ngôn ngữ "',
    zh: 'Đã xóa ngôn ngữ "',
    ja: 'Đã xóa ngôn ngữ "'
  },
  'Đã xóa thành công': {
    en: 'Đã xóa thành công',
    fr: 'Đã xóa thành công',
    zh: 'Đã xóa thành công',
    ja: 'Đã xóa thành công'
  },
  'Đã xóa điểm liên kết khỏi cơ sở dữ liệu thành công': {
    en: 'Đã xóa điểm liên kết khỏi cơ sở dữ liệu thành công',
    fr: 'Đã xóa điểm liên kết khỏi cơ sở dữ liệu thành công',
    zh: 'Đã xóa điểm liên kết khỏi cơ sở dữ liệu thành công',
    ja: 'Đã xóa điểm liên kết khỏi cơ sở dữ liệu thành công'
  },
  'Đã xảy ra sự cố hiển thị': {
    en: 'Đã xảy ra sự cố hiển thị',
    fr: 'Đã xảy ra sự cố hiển thị',
    zh: 'Đã xảy ra sự cố hiển thị',
    ja: 'Đã xảy ra sự cố hiển thị'
  },
  'Đã điền bản dịch chuyên sâu cho [': {
    en: 'Đã điền bản dịch chuyên sâu cho [',
    fr: 'Đã điền bản dịch chuyên sâu cho [',
    zh: 'Đã điền bản dịch chuyên sâu cho [',
    ja: 'Đã điền bản dịch chuyên sâu cho ['
  },
  'Đã đồng bộ dữ liệu thật': {
    en: 'Đã đồng bộ dữ liệu thật',
    fr: 'Đã đồng bộ dữ liệu thật',
    zh: 'Đã đồng bộ dữ liệu thật',
    ja: 'Đã đồng bộ dữ liệu thật'
  },
  'Đóng bảng công cụ': {
    en: 'Đóng bảng công cụ',
    fr: 'Đóng bảng công cụ',
    zh: 'Đóng bảng công cụ',
    ja: 'Đóng bảng công cụ'
  },
  'Đóng hướng dẫn': {
    en: 'Đóng hướng dẫn',
    fr: 'Đóng hướng dẫn',
    zh: 'Đóng hướng dẫn',
    ja: 'Đóng hướng dẫn'
  },
  'Đóng menu': {
    en: 'Đóng menu',
    fr: 'Đóng menu',
    zh: 'Đóng menu',
    ja: 'Đóng menu'
  },
  'Đóng studio': {
    en: 'Đóng studio',
    fr: 'Đóng studio',
    zh: 'Đóng studio',
    ja: 'Đóng studio'
  },
  'Đóng thanh điều hướng': {
    en: 'Đóng thanh điều hướng',
    fr: 'Đóng thanh điều hướng',
    zh: 'Đóng thanh điều hướng',
    ja: 'Đóng thanh điều hướng'
  },
  'Đóng thông báo': {
    en: 'Đóng thông báo',
    fr: 'Đóng thông báo',
    zh: 'Đóng thông báo',
    ja: 'Đóng thông báo'
  },
  'Đăng nhập không thành công': {
    en: 'Đăng nhập không thành công',
    fr: 'Đăng nhập không thành công',
    zh: 'Đăng nhập không thành công',
    ja: 'Đăng nhập không thành công'
  },
  'Đăng nhập quản trị thành công': {
    en: 'Đăng nhập quản trị thành công',
    fr: 'Đăng nhập quản trị thành công',
    zh: 'Đăng nhập quản trị thành công',
    ja: 'Đăng nhập quản trị thành công'
  },
  'Đăng xuất khỏi hệ thống quản trị': {
    en: 'Đăng xuất khỏi hệ thống quản trị',
    fr: 'Đăng xuất khỏi hệ thống quản trị',
    zh: 'Đăng xuất khỏi hệ thống quản trị',
    ja: 'Đăng xuất khỏi hệ thống quản trị'
  },
  'Đường dẫn điều hướng': {
    en: 'Đường dẫn điều hướng',
    fr: 'Đường dẫn điều hướng',
    zh: 'Đường dẫn điều hướng',
    ja: 'Đường dẫn điều hướng'
  },
  'Đường dẫn ảnh Panorama 360 (Equirectangular 2:1': {
    en: 'Đường dẫn ảnh Panorama 360 (Equirectangular 2:1',
    fr: 'Đường dẫn ảnh Panorama 360 (Equirectangular 2:1',
    zh: 'Đường dẫn ảnh Panorama 360 (Equirectangular 2:1',
    ja: 'Đường dẫn ảnh Panorama 360 (Equirectangular 2:1'
  },
  'Đạt đặc trưng': {
    en: 'Đạt đặc trưng',
    fr: 'Đạt đặc trưng',
    zh: 'Đạt đặc trưng',
    ja: 'Đạt đặc trưng'
  },
  'Địa chỉ VPS': {
    en: 'Địa chỉ VPS',
    fr: 'Địa chỉ VPS',
    zh: 'Địa chỉ VPS',
    ja: 'Địa chỉ VPS'
  },
  'Định vị tư liệu & dẫn hướng tour 360': {
    en: 'Định vị tư liệu & dẫn hướng tour 360',
    fr: 'Định vị tư liệu & dẫn hướng tour 360',
    zh: 'Định vị tư liệu & dẫn hướng tour 360',
    ja: 'Định vị tư liệu & dẫn hướng tour 360'
  },
  'Độ phủ 3D': {
    en: 'Độ phủ 3D',
    fr: 'Độ phủ 3D',
    zh: 'Độ phủ 3D',
    ja: 'Độ phủ 3D'
  },
  'Đức': {
    en: 'Đức',
    fr: 'Đức',
    zh: 'Đức',
    ja: 'Đức'
  },
  'Đứng yên tại tâm phòng • Xoay tròn tại chỗ': {
    en: 'Đứng yên tại tâm phòng • Xoay tròn tại chỗ',
    fr: 'Đứng yên tại tâm phòng • Xoay tròn tại chỗ',
    zh: 'Đứng yên tại tâm phòng • Xoay tròn tại chỗ',
    ja: 'Đứng yên tại tâm phòng • Xoay tròn tại chỗ'
  },
  'điểm': {
    en: 'điểm',
    fr: 'điểm',
    zh: 'điểm',
    ja: 'điểm'
  },
  'đã chụp': {
    en: 'đã chụp',
    fr: 'đã chụp',
    zh: 'đã chụp',
    ja: 'đã chụp'
  },
  'Ả Rập': {
    en: 'Ả Rập',
    fr: 'Ả Rập',
    zh: 'Ả Rập',
    ja: 'Ả Rập'
  },
  'Ảnh & Góc nhìn': {
    en: 'Ảnh & Góc nhìn',
    fr: 'Ảnh & Góc nhìn',
    zh: 'Ảnh & Góc nhìn',
    ja: 'Ảnh & Góc nhìn'
  },
  'Ảnh Panorama góc rộng 360° đã sẵn sàng tạo không gian hoàn chỉnh': {
    en: 'Ảnh Panorama góc rộng 360° đã sẵn sàng tạo không gian hoàn chỉnh',
    fr: 'Ảnh Panorama góc rộng 360° đã sẵn sàng tạo không gian hoàn chỉnh',
    zh: 'Ảnh Panorama góc rộng 360° đã sẵn sàng tạo không gian hoàn chỉnh',
    ja: 'Ảnh Panorama góc rộng 360° đã sẵn sàng tạo không gian hoàn chỉnh'
  },
  'Ảnh toàn cảnh 360°': {
    en: 'Ảnh toàn cảnh 360°',
    fr: 'Ảnh toàn cảnh 360°',
    zh: 'Ảnh toàn cảnh 360°',
    ja: 'Ảnh toàn cảnh 360°'
  },
  'Ảnh toàn cảnh 360° (Equirectangular 2:1) *': {
    en: 'Ảnh toàn cảnh 360° (Equirectangular 2:1) *',
    fr: 'Ảnh toàn cảnh 360° (Equirectangular 2:1) *',
    zh: 'Ảnh toàn cảnh 360° (Equirectangular 2:1) *',
    ja: 'Ảnh toàn cảnh 360° (Equirectangular 2:1) *'
  },
  'Ảnh toàn cảnh 360° của phòng': {
    en: 'Ảnh toàn cảnh 360° của phòng',
    fr: 'Ảnh toàn cảnh 360° của phòng',
    zh: 'Ảnh toàn cảnh 360° của phòng',
    ja: 'Ảnh toàn cảnh 360° của phòng'
  },
  'Ảnh trong chuỗi toàn cảnh lớn đã sẵn sàng ghép 360°': {
    en: 'Ảnh trong chuỗi toàn cảnh lớn đã sẵn sàng ghép 360°',
    fr: 'Ảnh trong chuỗi toàn cảnh lớn đã sẵn sàng ghép 360°',
    zh: 'Ảnh trong chuỗi toàn cảnh lớn đã sẵn sàng ghép 360°',
    ja: 'Ảnh trong chuỗi toàn cảnh lớn đã sẵn sàng ghép 360°'
  },
  'Ảnh từ thư viện đã sẵn sàng': {
    en: 'Ảnh từ thư viện đã sẵn sàng',
    fr: 'Ảnh từ thư viện đã sẵn sàng',
    zh: 'Ảnh từ thư viện đã sẵn sàng',
    ja: 'Ảnh từ thư viện đã sẵn sàng'
  },
  'Ảnh đã sẵn sàng để ghép 360°': {
    en: 'Ảnh đã sẵn sàng để ghép 360°',
    fr: 'Ảnh đã sẵn sàng để ghép 360°',
    zh: 'Ảnh đã sẵn sàng để ghép 360°',
    ja: 'Ảnh đã sẵn sàng để ghép 360°'
  },
  'ảnh': {
    en: 'ảnh',
    fr: 'ảnh',
    zh: 'ảnh',
    ja: 'ảnh'
  },
  'ảnh 360°': {
    en: 'ảnh 360°',
    fr: 'ảnh 360°',
    zh: 'ảnh 360°',
    ja: 'ảnh 360°'
  },
  'ảnh 360° sẵn sàng': {
    en: 'ảnh 360° sẵn sàng',
    fr: 'ảnh 360° sẵn sàng',
    zh: 'ảnh 360° sẵn sàng',
    ja: 'ảnh 360° sẵn sàng'
  },
  'ảnh góc (~': {
    en: 'ảnh góc (~',
    fr: 'ảnh góc (~',
    zh: 'ảnh góc (~',
    ja: 'ảnh góc (~'
  },
  'Ấn Độ (Hindi': {
    en: 'Ấn Độ (Hindi',
    fr: 'Ấn Độ (Hindi',
    zh: 'Ấn Độ (Hindi',
    ja: 'Ấn Độ (Hindi'
  },
  'Ẩn / Hiện thanh điều hướng (Ctrl + B': {
    en: 'Ẩn / Hiện thanh điều hướng (Ctrl + B',
    fr: 'Ẩn / Hiện thanh điều hướng (Ctrl + B',
    zh: 'Ẩn / Hiện thanh điều hướng (Ctrl + B',
    ja: 'Ẩn / Hiện thanh điều hướng (Ctrl + B'
  },
  'Ứng dụng gặp lỗi khởi động': {
    en: 'Ứng dụng gặp lỗi khởi động',
    fr: 'Ứng dụng gặp lỗi khởi động',
    zh: 'Ứng dụng gặp lỗi khởi động',
    ja: 'Ứng dụng gặp lỗi khởi động'
  },
  '🏛️ Nạp nhanh thông tin chuẩn (Bảo tàng Lịch sử TP.HCM': {
    en: '🏛️ Nạp nhanh thông tin chuẩn (Bảo tàng Lịch sử TP.HCM',
    fr: '🏛️ Nạp nhanh thông tin chuẩn (Bảo tàng Lịch sử TP.HCM',
    zh: '🏛️ Nạp nhanh thông tin chuẩn (Bảo tàng Lịch sử TP.HCM',
    ja: '🏛️ Nạp nhanh thông tin chuẩn (Bảo tàng Lịch sử TP.HCM'
  },
};
