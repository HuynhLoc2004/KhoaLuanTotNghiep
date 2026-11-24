# -*- coding: utf-8 -*-
"""
Script cập nhật dữ liệu lịch sử chuẩn xác cho toàn bộ 18 Gian phòng triển lãm
tại Bảo tàng Lịch sử TP.HCM (https://museumhcm.duckdns.org).
Đồng bộ cả PostgreSQL Primary, MongoDB và xóa sạch Redis cache.
"""

import urllib.request
import json
import ssl
import time

ctx = ssl._create_unverified_context()

BASE_URL = "https://museumhcm.duckdns.org/api/rooms"

ROOMS_RESEARCH_DATA = {
    # 1. SẢNH ĐÓN TIẾP TRUNG TÂM
    "P-804": {
        "name": "Sảnh Bát Giác",
        "period": "Sảnh Bát Giác",
        "description": "Sảnh Bát Giác là không gian trung tâm mang tính biểu tượng kiến trúc của Bảo tàng Lịch sử TP. Hồ Chí Minh. Công trình được khởi công năm 1926 và khánh thành năm 1929 do kiến trúc sư người Pháp Auguste Delaval thiết kế theo phong cách kiến trúc Đông Dương (Indochine) độc đáo, kết hợp hài hòa giữa kỹ thuật xây dựng châu Âu kiên cố và nghệ thuật mái ngói nhiều tầng truyền thống Á Đông. Đây là nơi tiếp đón du khách, phân luồng tham quan và là điểm khởi đầu cho hành trình khám phá hàng vạn năm lịch sử hào hùng của dân tộc Việt Nam.",
        "aiKnowledgePrompt": "Sảnh Bát Giác Bảo tàng Lịch sử TP.HCM: Khởi công 1926, khánh thành 1929 với tên gọi ban đầu là Musée Blanchard de la Brosse, sau năm 1956 đổi tên thành Viện Bảo tàng Quốc gia Sài Gòn, từ năm 1979 mang tên Bảo tàng Lịch sử TP. Hồ Chí Minh. Kiến trúc: Tháp bát giác trung tâm với hệ thống cửa đón gió, mái ngói ống lợp âm dương có gắn tượng linh thú, sàn lát gạch bông hoa văn cổ điển. Chức năng: Sảnh đón tiếp trung tâm kết nối hai cánh trưng bày theo tiến trình lịch sử Việt Nam và các nền văn hóa cổ phương Nam.",
        "aiScript": "Chào mừng quý khách đến với Bảo tàng Lịch sử Thành phố Hồ Chí Minh, và điểm dừng chân đầu tiên của chúng ta chính là Sảnh Bát Giác tráng lệ. Được xây dựng từ năm 1926 theo thiết kế của kiến trúc sư Auguste Delaval, không gian này là một kiệt tác tiêu biểu của phong cách kiến trúc Đông Dương, kết hợp nhuần nhuyễn giữa kỹ thuật xây dựng Tây phương và nét duyên dáng của mái ngói bát giác Á Đông. Đứng tại tâm điểm của sảnh, quý khách có thể cảm nhận luồng không khí khoáng đạt và vẻ đẹp trang nghiêm, cổ kính đã đi qua gần một thế kỷ. Từ đây, hành trình khám phá hàng ngàn năm lịch sử dân tộc và kho tàng di sản văn hóa phương Nam chính thức mở ra trước mắt quý khách."
    },

    # 2. THỜI TIỀN SỬ - SƠ SỬ
    "P-910": {
        "name": "Gian phòng Thời Nguyên thuỷ",
        "period": "Thời Nguyên thuỷ",
        "description": "Gian phòng Thời Nguyên thủy giới thiệu tiến trình tiến hóa của người tiền sử và các nền văn hóa khảo cổ học nguyên thủy trên lãnh thổ Việt Nam từ thời đồ đá cũ đến thời đồ đá mới (cách ngày nay từ hàng chục vạn năm đến khoảng 4.000 năm). Phòng trưng bày hàng trăm hiện vật gốc gồm công cụ ghè đẽo bằng đá cuội Núi Đọ, rìu tay văn hóa Sơn Vi, rìu mài lưỡi và đồ gốm thô văn hóa Hòa Bình, Bắc Sơn, cho đến các công cụ đá mài tinh xảo và trang sức đá của các di chỉ tiền sử Nam Bộ như Đa Bút, Hoa Lộc, Bến Đò, Cù Lao Rùa.",
        "aiKnowledgePrompt": "Thời kỳ Nguyên thủy tại Việt Nam (thời Đồ đá cũ đến Đồ đá mới): Trưng bày các giai đoạn tiến hóa từ vượn người lên người hiện đại (Homo sapiens). Các di chỉ tiêu biểu: Núi Đọ (Thanh Hóa), Thẩm Khuyên, Thẩm Hai (Lạng Sơn), văn hóa Hòa Bình (văn hóa đá cuội ghè đẽo nổi tiếng thế giới), văn hóa Bắc Sơn (dấu mài Bắc Sơn), các di chỉ khảo cổ học sông Đồng Nai và Đông Nam Bộ (Bến Đò, Cù Lao Rùa, Dốc Chùa). Hiện vật tiêu biểu: Rìu ngắn, rìu hình đĩa, công cụ nạo, chày nghiền đá, vòng tay đá ngọc, dọi se chỉ gốm.",
        "aiScript": "Kính mời quý khách bước vào Gian phòng Thời Nguyên thủy, nơi lưu giữ những dấu tích đầu tiên về sự xuất hiện và sinh sống của con người trên mảnh đất Việt Nam từ thuở bình minh của nhân loại. Tại đây, quý khách sẽ được chiêm ngưỡng những công cụ ghè đẽo bằng đá cuội thô sơ có niên đại hàng chục vạn năm, những chiếc rìu mài lưỡi đặc trưng của nền văn hóa Hòa Bình lừng danh thế giới, cùng những mảnh gốm thô sơ đầu tiên do bàn tay người xưa tạo tác. Mỗi mảnh tước, hòn cuội nơi đây đều là nhân chứng sống động cho hành trình lao động miệt mài, thích nghi và chinh phục thiên nhiên hoang dã của các thế hệ tổ tiên thời tiền sử."
    },

    # 3. THỜI HÙNG VƯƠNG - AN DƯƠNG VƯƠNG
    "P-628": {
        "name": "Gian phòng Thời Dựng nước và Giữ nước",
        "period": "Thời Dựng nước và Giữ nước",
        "description": "Gian phòng Thời Dựng nước và Giữ nước tái hiện kỷ nguyên mở đầu lịch sử dân tộc với thời đại Hùng Vương dựng nước Văn Lang và An Dương Vương dựng nước Âu Lạc (thế kỷ VII TCN - thế kỷ II TCN), đỉnh cao là nền Văn hóa Đông Sơn rực rỡ. Không gian trưng bày quy tụ các sưu tập hiện vật đồng thau đỉnh cao: trống đồng Đông Sơn loại I Heger với hoa văn chim Lạc, cảnh giã gạo, thuyền chiến; các loại rìu đồng xòe cân, dao găm cán hình người, mũi giáo, lưỡi cày đồng và hàng vạn mũi tên đồng Cổ Loa độc đáo.",
        "aiKnowledgePrompt": "Thời đại Hùng Vương - An Dương Vương (Văn hóa Phùng Nguyên, Đồng Đậu, Gò Mun, Đông Sơn thế kỷ VII TCN - thế kỷ II TCN): Nhà nước Văn Lang (kinh đô Phong Châu), Nhà nước Âu Lạc (kinh đô Cổ Loa). Hiện vật tiêu biểu: Trống đồng Đông Sơn (biểu tượng quyền lực và văn hóa tâm linh), thạp đồng, rìu đồng chữ U, dao găm cán chuôi hình tượng người, lưỡi cày đồng hình cánh bướm, lẫy nỏ và mũi tên đồng ba cạnh Cổ Loa. Kỹ thuật đúc đồng đạt đỉnh cao thế giới thời cổ đại.",
        "aiScript": "Chào mừng quý khách đến với Gian phòng Thời Dựng nước và Giữ nước, không gian thiêng liêng tái hiện kỷ nguyên Hùng Vương và An Dương Vương dựng nước cách đây hơn hai thiên niên kỷ. Điểm sáng rực rỡ nhất trong gian phòng này chính là nền văn hóa Đông Sơn kiệt xuất với bộ sưu tập trống đồng uy nghi, chạm khắc tinh vi hình ảnh đoàn người hóa trang lông chim, cảnh giã gạo thanh bình và những con thuyền lướt sóng. Bên cạnh đó, những lưỡi cày đồng phục vụ nông nghiệp lúa nước và các mũi tên đồng Cổ Loa sắc nhọn khẳng định sức mạnh phi thường của cha ông ta trong cả lao động sản xuất lẫn ý chí quật cường bảo vệ giang sơn bờ cõi."
    },

    # 4. THỜI NGÔ - ĐINH - TIỀN LÊ
    "P-656": {
        "name": "Gian phòng Thời Ngô - Đinh - Tiền Lê",
        "period": "Thời Ngô - Đinh - Tiền Lê",
        "description": "Gian phòng Thời Ngô - Đinh - Tiền Lê (thế kỷ X) phản ánh giai đoạn lịch sử bản lề mở ra kỷ nguyên độc lập, tự chủ lâu dài của dân tộc Việt Nam sau hơn một ngàn năm Bắc thuộc. Bắt đầu từ chiến thắng Bạch Đằng vang dội năm 938 của Ngô Quyền, tiếp nối bởi Đinh Tiên Hoàng dẹp loạn 12 sứ quân định đô tại Hoa Lư dựng nước Đại Cồ Việt, và Lê Hoàn với chiến công phá Tống bình Chiêm năm 981. Không gian trưng bày các cọc gỗ Bạch Đằng, gạch xây thành Hoa Lư có khắc chữ 'Đại Việt quốc quân thành chuyên', đồ gốm men tro, đồ đồng quân dụng và tiền cổ thế kỷ X.",
        "aiKnowledgePrompt": "Thế kỷ X (938 - 1009): Khởi đầu nền độc lập tự chủ. Nhà Ngô (938-965, Ngô Quyền, Cổ Loa). Nhà Đinh (968-980, Đinh Bộ Lĩnh, Đại Cồ Việt, Hoa Lư). Nhà Tiền Lê (980-1009, Lê Hoàn). Các chiến công: Bạch Đằng (938), chống Tống (981). Hiện vật tiêu biểu: Cọc gỗ sông Bạch Đằng, gạch ngói kinh đô Hoa Lư đắp nổi hình hoa sen và chim phượng, tiền đồng Thái Bình Hưng Bảo (đồng tiền đầu tiên của Việt Nam), hũ gốm nhiều quai, nồi đồng quân trang.",
        "aiScript": "Kính mời quý khách tham quan Gian phòng Thời Ngô - Đinh - Tiền Lê, nơi ghi dấu thế kỷ thứ 10 lịch sử - thế kỷ bừng sáng của nền độc lập tự chủ dân tộc sau một ngàn năm đằng đẵng dưới ách Bắc thuộc. Dưới sự lãnh đạo của những vị anh hùng kiệt xuất như Ngô Quyền, Đinh Bộ Lĩnh và Lê Hoàn, giang sơn thu về một mối, quốc hiệu Đại Cồ Việt vang danh với kinh đô Hoa Lư vững như bàn thạch. Tại đây, quý khách có thể chiêm ngưỡng di tích cọc gỗ Bạch Đằng lịch sử, những viên gạch nung xây thành khắc chữ 'Đại Việt quốc quân thành chuyên' và đồng tiền Thái Bình Hưng Bảo đầu tiên của dân tộc, minh chứng cho sức sống quật khởi ngàn đời của non sông Việt Nam."
    },

    # 5. THỜI LÝ
    "P-230": {
        "name": "Gian phòng Thời Lý",
        "period": "Thời Lý",
        "description": "Gian phòng Thời Lý (1009 - 1225) tôn vinh vương triều đặt nền móng vững chắc cho văn minh Đại Việt với việc vua Lý Thái Tổ ban Chiếu dời đô về Thăng Long năm 1010. Đây là thời kỳ Phật giáo phát triển cực thịnh trở thành quốc giáo, mỹ thuật cung đình và dân gian đạt đến đỉnh cao tinh tế. Phòng trưng bày giới thiệu nhiều hiện vật quý hiếm: tượng Phật A Di Đà bằng sa thạch phỏng theo tượng chùa Phật Tích, mô hình kiến trúc đất nung, đầu rồng lá đề, gạch ngói Hoàng thành Thăng Long, cùng các sưu tập bát đĩa gốm men ngọc (celadon) và men trắng ngà thanh tao.",
        "aiKnowledgePrompt": "Triều Lý (1009 - 1225): Vua Lý Thái Tổ dời đô từ Hoa Lư về Thăng Long (1010), đổi quốc hiệu thành Đại Việt (1054). Chiến thắng Như Nguyệt (1077) của Lý Thường Kiệt với bản tuyên ngôn độc lập đầu tiên 'Nam quốc sơn hà'. Nền văn hóa Thăng Long rực rỡ, Phật giáo là quốc giáo. Mỹ thuật thời Lý: Rồng thời Lý uốn khúc hình sin mềm mại dạng dây leo không vảy dữ tợn, hoa sen, lá đề, tượng tròn sa thạch và gốm men ngọc men trắng đạt độ tinh mỹ cao.",
        "aiScript": "Chào mừng quý khách đến với Gian phòng Thời Lý, không gian nghệ thuật tôn vinh vương triều rực rỡ từ thế kỷ 11 đến đầu thế kỷ 13. Mở đầu bằng sự kiện lịch sử vua Lý Thái Tổ định đô Thăng Long nghìn năm văn hiến, triều Lý đã đưa nước Đại Việt bước vào kỷ nguyên vàng son về cả văn hóa, học thuật lẫn quân sự. Điểm nhấn bao trùm không gian trưng bày là mỹ thuật Phật giáo bác ái và thanh tao. Quý khách hãy chiêm ngưỡng những tác phẩm điêu khắc tượng Phật trang nghiêm, hình tượng rồng thời Lý uốn lượn hình sin mềm mại thuần Việt, cùng các dòng gốm men ngọc thanh khiết như ngọc bích, phản ánh tâm hồn khoáng đạt và nền văn hiến rạng ngời của cha ông ta."
    },

    # 6. THỜI TRẦN - HỒ
    "P-755": {
        "name": "Gian phòng thời Trần-Hồ",
        "period": "Gian phòng thời Trần-Hồ",
        "description": "Gian phòng thời Trần - Hồ (1225 - 1407) tái hiện trang sử hào hùng của dân tộc với 'Hào khí Đông A' ba lần đại thắng quân xâm lược Nguyên - Mông hung bạo, và giai đoạn cải cách táo bạo của nhà Hồ. Không gian trưng bày phong phú các hiện vật khảo cổ học và mỹ thuật: gốm hoa nâu đặc sắc (thạp, bát, ấm, đĩa), tháp thờ và mô hình kiến trúc đất nung chạm khắc rồng mây khỏe khoắn, các loại vũ khí giáo mác thời chiến, cùng súng thần cơ và gạch thành nhà Hồ (Tây Đô) - Di sản Văn hóa Thế giới.",
        "aiKnowledgePrompt": "Nhà Trần (1225-1400) và Nhà Hồ (1400-1407): Ba lần kháng chiến chống Nguyên Mông (1258, 1285, 1288) với các danh tướng Trần Hưng Đạo, Trần Quang Khải. Phật giáo Thiền phái Trúc Lâm do Phật hoàng Trần Nhân Tông sáng lập tại Yên Tử. Nhà Hồ (Hồ Quý Ly): Cải cách kinh tế, phát hành tiền giấy Thông Bảo Hội Sao, chế tạo súng thần cơ, xây dựng Thành nhà Hồ bằng đá kiên cố. Nghệ thuật: Gốm hoa nâu độc đáo mang tính dân tộc cao, đồ án võ sĩ, hoa sen, hoa cúc, rồng thời Trần mạnh mẽ, cơ bắp.",
        "aiScript": "Kính mời quý khách bước vào Gian phòng thời Trần - Hồ, nơi âm vang khúc tráng ca bất diệt của 'Hào khí Đông A' lẫy lừng. Dưới triều Trần, tinh thần đoàn kết toàn dân tộc đã làm nên kỳ tích ba lần quét sạch quân xâm lược Nguyên - Mông hùng mạnh nhất thế giới đương thời. Điểm nổi bật trong không gian trưng bày là dòng gốm hoa nâu độc bản của Đại Việt với những nét vẽ mộc mạc mà hào sảng, tái hiện hình ảnh các võ sĩ cầm giáo mác xung trận và hoa cúc thanh tao. Cùng với đó là những dấu tích của thành đá Tây Đô và súng thần cơ thời nhà Hồ, minh chứng cho tài năng sáng tạo và bản lĩnh quật cường vô song của dân tộc."
    },

    # 7. THỜI TÂY SƠN
    "P-982": {
        "name": "Gian phòng thời Tây Sơn",
        "period": "Gian phòng thời Tây Sơn",
        "description": "Gian phòng thời Tây Sơn (1771 - 1802) tôn vinh phong trào khởi nghĩa nông dân vĩ đại dưới sự lãnh đạo tài ba của ba anh em Tây Sơn, kiệt xuất nhất là người anh hùng áo vải cờ đào Quang Trung - Nguyễn Huệ. Trưng bày tập trung vào hai mốc son chói lọi: chiến thắng Rạch Gầm - Xoài Mút (1785) đánh tan 5 vạn quân Xiêm và cuộc hành quân thần tốc đại phá 29 vạn quân Thanh tại Ngọc Hồi - Đống Đa vào mùa xuân Kỷ Dậu (1789). Hiện vật gồm súng hỏa mai, đại bác, gươm giáo, sắc phong và tiền đồng thời Tây Sơn.",
        "aiKnowledgePrompt": "Phong trào Tây Sơn (1771-1802): Bùng nổ từ đất Tây Sơn (Bình Định) do Nguyễn Nhạc, Nguyễn Huệ, Nguyễn Lữ lãnh đạo. Lập lại nền thống nhất đất nước, chấm dứt cục diện Trịnh - Nguyễn phân tranh kéo dài hơn hai thế kỷ. Các chiến công hiển hách: Tiêu diệt quân Xiêm tại Rạch Gầm - Xoài Mút (Tiền Giang, 1785), chiến dịch mùa xuân Kỷ Dậu 1789 giải phóng Thăng Long quét sạch 29 vạn quân Mãn Thanh. Hiện vật: Tiền đồng Quang Trung Thông Bảo, Cảnh Thịnh Thông Bảo, vũ khí súng thần công, đại đao, sắc phong triều Tây Sơn.",
        "aiScript": "Chào mừng quý khách đến với Gian phòng thời Tây Sơn, không gian bùng cháy ngọn lửa quật khởi của phong trào nông dân áo vải cờ đào cuối thế kỷ 18. Dưới ngọn cờ bách chiến bách thắng của người anh hùng dân tộc Quang Trung - Nguyễn Huệ, nghĩa quân Tây Sơn đã đập tan các tập đoàn phong kiến cát cứ, hoàn thành sự nghiệp thống nhất non sông. Đặc biệt, chiến dịch hành quân thần tốc mùa xuân Kỷ Dậu năm 1789 quét sạch 29 vạn quân xâm lược Mãn Thanh đã đi vào trang sử vàng chói lọi. Chiêm ngưỡng các loại vũ khí hỏa mai, súng thần công và những đồng tiền cổ Quang Trung Thông Bảo, quý khách sẽ cảm nhận trọn vẹn khí thế bão táp hào hùng của một thời đại oanh liệt."
    },

    # 8. THỜI NGUYỄN
    "P-277": {
        "name": "Gian phòng Thời Nguyễn",
        "period": "Thời Nguyễn",
        "description": "Gian phòng Thời Nguyễn (1802 - 1945) giới thiệu bức tranh toàn cảnh về triều đại phong kiến cuối cùng trong lịch sử Việt Nam, định đô tại Phú Xuân (Huế), lần đầu tiên xác lập chủ quyền lãnh thổ trọn vẹn từ Ải Nam Quan đến Mũi Cà Mau. Không gian trưng bày quy tụ các sưu tập hiện vật cung đình vô giá: long bào hoàng gia, áo Cát phục hoàng tử, áo Nhật bình cung phi thêu kim tuyến, đồ sứ ký kiểu men lam 'Nội phủ thị trung', bình phong chạm cẩn xà cừ, súng thần công, các bộ đồ tự khí đồng hun và mô hình kiến trúc cổng Ngọ Môn Huế.",
        "aiKnowledgePrompt": "Triều Nguyễn (1802 - 1945, 13 đời vua từ Gia Long đến Bảo Đại): Thống nhất đất nước về mặt lãnh thổ và hành chính, đổi quốc hiệu thành Việt Nam (1804). Kinh đô Huế với Quần thể di tích Cố đô Huế (Di sản Thế giới UNESCO). Điển chế cung đình quy củ: Chế tác trang phục Thượng Y viện, đồ sứ men lam ký kiểu lò quan (Bleu de Huế), đúc Cửu đỉnh, đúc súng thần công. Khai phá và xác lập chủ quyền vững chắc tại Nam Bộ cùng các quần đảo Hoàng Sa, Trường Sa.",
        "aiScript": "Kính mời quý khách chiêm ngưỡng Gian phòng Thời Nguyễn, nơi lưu giữ tinh hoa văn hóa cung đình của triều đại phong kiến cuối cùng trong lịch sử Việt Nam. Trải dài từ năm 1802 đến năm 1945 với kinh đô Huế cổ kính, triều Nguyễn đã để lại một di sản văn hóa vật thể và phi vật thể vô cùng đồ sộ. Tại đây, quý khách sẽ được tận mắt ngắm nhìn vẻ lộng lẫy uy nghiêm của các trang phục hoàng tộc thêu chỉ ngũ sắc và kim tuyến, những chiếc bình gốm sứ hoa lam vẽ rồng thanh nhã, cùng súng thần công đúc đồng oai phong. Mỗi hiện vật là minh chứng cho sự tinh xảo tuyệt luân của bàn tay người nghệ nhân Việt và chuẩn mực lễ nghi cung đình trang trọng một thời."
    },

    # 9. MỘ CỔ SÀI GÒN
    "P-970": {
        "name": "Gian phòng Mộ Cổ Sài Gòn",
        "period": "Mộ cổ Sài Gòn",
        "description": "Gian phòng Mộ Cổ Sài Gòn là không gian trưng bày khảo cổ học độc nhất vô nhị tại Việt Nam, giới thiệu kết quả khai quật ngôi mộ cổ hợp chất của bà Trần Thị Hiệu (thời vua Tự Đức triều Nguyễn) tại Xóm Cải, Quận 5, TP.HCM vào năm 1994. Sau gần 150 năm nằm trong lòng đất, thi hài của bà vẫn được bảo tồn nguyên vẹn nhờ kỹ thuật ướp xác truyền thống đỉnh cao bằng hợp chất nhựa thông, sáp ong và dầu bồ kết. Phòng trưng bày hiện vật thi hài bảo quản dung dịch đặc biệt cùng toàn bộ trang phục gấm lụa cung đình, hài thêu, quạt giấy và trang sức vàng bạc chôn theo mộ.",
        "aiKnowledgePrompt": "Di tích Mộ cổ Xóm Cải (phường 8, Quận 5, TP.HCM): Khai quật tháng 12/1994. Chủ nhân ngôi mộ: Bà Trần Thị Hiệu (khoảng 60 tuổi), phu nhân quan Thượng thư Khâm mạng Hoàng triều Nguyễn. Ngôi mộ xây bằng hợp chất 'ô dước' (vôi, cát, mật mía, nhựa cây ô dước) cứng như đá bảo vệ quan tài gỗ dâu rừng nguyên khối. Kỹ thuật ướp xác bí truyền Nam Bộ: Dùng tinh dầu thông, dầu tràm, sáp, xác ngâm trong dung dịch màu đỏ sẫm giúp cơ thể mềm mại, tóc đen, răng nhuộm đen bóng, các khớp ngón tay co duỗi được. Hiện vật đi kèm: Áo gấm thêu hoa sen, quần lụa, hài hạt cườm, trâm cài tóc bằng vàng.",
        "aiScript": "Chào mừng quý khách đến với Gian phòng Mộ Cổ Sài Gòn, một trong những không gian trưng bày khảo cổ học đặc biệt và hấp dẫn nhất của Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Gian phòng tái hiện chân thực cuộc khai quật kỳ diệu năm 1994 tại Xóm Cải, Quận 5, tìm thấy mộ phần của bà Trần Thị Hiệu, một quý phu nhân hoàng triều thời vua Tự Đức. Nhờ kỹ thuật ướp xác cổ truyền độc đáo bằng các loại tinh dầu tự nhiên kết hợp với cấu trúc mộ hợp chất kiên cố, thi hài của bà cùng toàn bộ trang phục gấm lụa cao cấp đã được bảo tồn nguyên vẹn suốt hơn một thế kỷ. Đây là nguồn sử liệu vật chất vô giá giúp chúng ta khám phá phong tục mai táng và đời sống thượng lưu Sài Gòn - Gia Định xưa."
    },

    # 10. VĂN HÓA ÓC EO
    "P-759": {
        "name": "Gian phòng Văn hoá Óc Eo",
        "period": "Văn hoá Óc Eo",
        "description": "Gian phòng Văn hóa Óc Eo giới thiệu nền văn hóa khảo cổ học rực rỡ gắn liền với Vương quốc cổ Phù Nam (thế kỷ I - VII sau Công nguyên) tại vùng châu thổ hạ lưu sông Mê Kông và Nam Bộ. Với trung tâm cảng thị quốc tế Óc Eo (Thoại Sơn, An Giang), đây từng là đầu mối giao thương hàng hải sầm uất bậc nhất Đông Nam Á kết nối với La Mã, Ba Tư, Ấn Độ và Trung Hoa. Trưng bày gồm các di vật vàng lá dập nổi hình thần linh, nhẫn vàng, con dấu đá khắc chữ Phạn (Sanskrit), chuỗi hạt mã não, đồ gốm mịn và đặc biệt là bộ sưu tập tượng Phật bằng gỗ cổ thụ độc nhất vô nhị.",
        "aiKnowledgePrompt": "Văn hóa Óc Eo (thế kỷ I - VII SCN): Phát hiện và định danh lần đầu năm 1944 bởi nhà khảo cổ học người Pháp Louis Malleret tại cánh đồng Óc Eo (huyện Thoại Sơn, An Giang). Vương quốc Phù Nam thịnh trị. Đặc trưng hiện vật: Đồ trang sức bằng vàng (vàng lá dập nổi hình hoa sen, mặt trời, thần bò Nandin, nhẫn vàng khắc phù điêu), đá quý (mã não, ngọc thạch), con dấu thủy tinh, tiền kim loại La Mã thời hoàng đế Antoninus Pius, tượng Phật bằng gỗ sa mu, tượng thần Hindu giáo bằng đá sa thạch.",
        "aiScript": "Kính mời quý khách chiêm ngưỡng Gian phòng Văn hóa Óc Eo, vùng đất di sản huyền bí gắn liền với Vương quốc cổ Phù Nam từ thế kỷ thứ 1 đến thế kỷ thứ 7. Từng là một trong những cảng thị quốc tế phồn vinh bậc nhất Đông Nam Á cổ đại, Óc Eo là nơi hội tụ các thương thuyền từ Địa Trung Hải, Ấn Độ và Trung Hoa. Tại không gian này, quý khách sẽ được tận mắt chiêm ngưỡng những báu vật bằng vàng lá dập nổi hoa văn thần thánh tinh vi đến kinh ngạc, những chiếc nhẫn khắc chữ Phạn cổ, chuỗi ngọc mã não rực rỡ và đặc biệt là pho tượng Phật bằng gỗ cổ thụ ngàn năm. Những hiện vật này là minh chứng hào hùng cho sự phát triển vượt bậc và tinh thần mở cửa giao lưu quốc tế của phương Nam từ thời cổ đại."
    },

    # 11. VĂN HÓA CHAMPA
    "P-121": {
        "name": "Phòng Văn hoá Champa",
        "period": "Văn Hoá Champa",
        "description": "Phòng Văn hóa Champa trưng bày một trong những sưu tập điêu khắc đá sa thạch Champa phong phú và quý giá nhất Việt Nam (thế kỷ II - XVII). Nghệ thuật Champa chịu ảnh hưởng sâu sắc của Ấn Độ giáo và Phật giáo, được bản địa hóa tài tình qua các phong cách nghệ thuật Trà Kiệu, Đồng Dương, Mỹ Sơn và Tháp Mẫm. Điểm nhấn trung tâm của phòng là Bảo vật Quốc gia - Tượng nữ thần Devi Hương Quế bằng sa thạch thế kỷ X, cùng các tuyệt tác phù điêu thần Shiva, vũ nữ Apsara múa uốn lượn hình chữ S, chim thần Garuda chế ngự rắn Naga và tượng sư tử canh giữ tháp.",
        "aiKnowledgePrompt": "Vương quốc Champa (thế kỷ II - XVII miền Trung Việt Nam): Di sản đền tháp gạch nung đồ sộ (Thánh địa Mỹ Sơn - UNESCO). Nghệ thuật điêu khắc sa thạch đạt trình độ kiệt xuất Đông Nam Á. Các phong cách lớn: Cổ Mân (thế kỷ VII-VIII), Đồng Dương (thế kỷ IX - Phật giáo), Trà Kiệu (thế kỷ X - thanh nhã, uyển chuyển, tượng nữ thần Devi), Tháp Mẫm (thế kỷ XII-XIII - hoành tráng, gân guốc). Hiện vật tiêu biểu: Tượng nữ thần Devi (Bảo vật Quốc gia), bệ thờ Linga-Yoni, phù điêu Apsara, tượng thần Brahma, Shiva, linh thú Gajasimha.",
        "aiScript": "Chào mừng quý khách đến với Phòng Văn hóa Champa, không gian lắng đọng những tuyệt tác điêu khắc đá sa thạch huyền ảo của vương quốc Champa cổ đại. Trải qua hàng trăm năm thăng trầm, nghệ thuật tạo hình Champa đã đạt đến đỉnh cao phi phàm với sự kết hợp nhuần nhuyễn giữa thần thoại Ấn Độ và tâm hồn phóng khoáng của cư dân miền duyên hải. Tâm điểm thu hút mọi ánh nhìn chính là Bảo vật Quốc gia - Tượng nữ thần Devi thế kỷ thứ 10 với nụ cười bao dung huyền bí và nét đẹp đôn hậu. Cùng với những điệu múa Apsara uốn lượn uyển chuyển và linh thú sư tử oai phong, gian phòng này sẽ đưa quý khách vào một không gian nghệ thuật thiêng liêng đầy mê hoặc dưới bóng những ngọn tháp cổ."
    },

    # 12. ĐIÊU KHẮC ĐÁ CAMPUCHIA
    "P-737": {
        "name": "Gian phòng Điêu khắc đá Campuchia",
        "period": "Điêu khắc đá Campuchia",
        "description": "Gian phòng Điêu khắc đá Campuchia giới thiệu nghệ thuật điêu khắc sa thạch cổ điển của nền văn minh Khmer thời kỳ Angkor hoàng kim (thế kỷ IX - XV). Không gian trưng bày các pho tượng tròn và phù điêu đền tháp mang đậm cảm quan thẩm mỹ tinh tế và triết lý tôn giáo sâu sắc của Ấn Độ giáo và Phật giáo Đại thừa. Hiện vật tiêu biểu gồm tượng thần Brahma bốn mặt uy nghiêm, tượng Bồ tát Quán Thế Âm (Lokeshvara) với nụ cười an lạc phong cách Bayon, tượng thần chim Garuda nhân hình dũng mãnh và các cấu kiện mi cửa, đầu Phật chạm trổ sắc sảo.",
        "aiKnowledgePrompt": "Điêu khắc đá Khmer - Campuchia (Thời kỳ Angkor thế kỷ IX - XV): Quần thể di sản thế giới Angkor Wat, Angkor Thom, đền Bayon. Tôn giáo: Shiva giáo, Vishnu giáo và Phật giáo Đại thừa thời vua Jayavarman VII. Điêu khắc sa thạch phong cách Baphuon, Angkor Wat, Bayon. Đặc trưng: Tượng tròn đứng thẳng khối vững chãi, nụ cười Bayon huyền bí an nhiên, trang phục váy sampot dập xếp ly tinh xảo, búi tóc tết Jatamukuta. Hiện vật tiêu biểu: Tượng thần sáng tạo Brahma 4 mặt, Tượng Bồ tát Quán Thế Âm Lokeshvara đa thủ, Tượng Nam thần điêu Garuda.",
        "aiScript": "Kính mời quý khách tham quan Gian phòng Điêu khắc đá Campuchia, nơi hội tụ những kiệt tác điêu khắc sa thạch lẫy lừng của đế chế Angkor từ thế kỷ thứ 9 đến thế kỷ 15. Dưới bàn tay tài hoa xuất chúng của những người thợ đá Khmer cổ đại, những khối đá sa thạch thô ráp đã biến thành các vị thần linh sống động và đầy quyền uy. Quý khách hãy chiêm ngưỡng vẻ oai nghiêm của tượng thần Brahma bốn mặt dõi nhìn khắp bốn phương vũ trụ, thần thái dũng mãnh của chim thần Garuda, và đặc biệt là nụ cười cứu rỗi an nhiên đầy lòng từ bi trên gương mặt các pho tượng Bồ tát Quán Thế Âm. Đây là nhịp cầu văn hóa tuyệt vời kết nối chúng ta với đỉnh cao rực rỡ của văn minh đền tháp Campuchia cổ đại."
    },

    # 13. TƯỢNG PHẬT GIÁO CHÂU Á
    "P-738": {
        "name": "Gian phòng Tượng Phật giáo Châu Á",
        "period": "Tượng Phật giáo Châu Á",
        "description": "Gian phòng Tượng Phật giáo Châu Á trưng bày bộ sưu tập tượng Phật độc đáo và đa dạng của các quốc gia và vùng lãnh thổ trong khu vực: Việt Nam, Trung Quốc, Nhật Bản, Thái Lan, Lào, Campuchia, Myanmar và Tây Tạng. Sự phong phú về niên đại, trường phái Phật giáo (Nam tông, Bắc tông, Kim Cương thừa) và chất liệu chế tác (gỗ mít sơn son thếp vàng, đồng hun, ngọc thạch, sa thạch, gốm men) phản ánh con đường truyền bá hòa bình và sự bản địa hóa kỳ diệu của triết lý từ bi, trí tuệ Phật giáo trên khắp lục địa Á châu.",
        "aiKnowledgePrompt": "Sưu tập Tượng Phật giáo Châu Á tại Bảo tàng Lịch sử TP.HCM: Trưng bày tượng Phật Thích Ca Mâu Ni, Phật A Di Đà, Bồ tát Quán Thế Âm, Phật Di Lặc, Thập bát La hán. Đại diện các nền nghệ thuật: Nghệ thuật tượng Phật Việt Nam (phong cách dân gian thanh thoát, thếp vàng son), Thái Lan - Lào (tượng Phật đứng, Phật ngồi phong cách Sukhothai, Ayutthaya với hào quang hình ngọn lửa Ushnisha), Myanmar (tượng cẩm thạch trắng viền vàng), Nhật Bản - Trung Hoa (phong cách thời Minh - Thanh uy nghi), Tây Tạng (tượng đồng mạ vàng Mật tông nhiều pháp khí).",
        "aiScript": "Chào mừng quý khách đến với Gian phòng Tượng Phật giáo Châu Á, chốn thanh tịnh lưu giữ hàng trăm pho tượng Phật thiêng liêng đến từ nhiều quốc gia trong khu vực. Trải qua hơn hai ngàn năm lan tỏa khắp lục địa Á Đông, ánh sáng từ bi và trí tuệ của đạo Phật đã hòa quyện tuyệt vời với tâm thức bản địa của từng dân tộc. Tại đây, quý khách có thể cảm nhận nét thuần hậu, bao dung của tượng Phật gỗ sơn son thếp vàng Việt Nam, dáng vẻ thanh thoát với hào quang rực lửa của tượng Phật Thái Lan, Lào, nét đĩnh đạc của tượng Phật Đông Bắc Á và vẻ huyền bí của tượng Phật Mật tông Tây Tạng. Mỗi pho tượng là một đóa sen tinh khiết, mang lại sự bình an, tĩnh tại cho tâm hồn mỗi du khách ghé thăm."
    },

    # 14. SƯU TẬP VƯƠNG HỒNG SỂN
    "P-460": {
        "name": "Gian phòng Sưu tầm Vương Hồng Sển",
        "period": "Sưu tầm Vương Hồng Sển",
        "description": "Gian phòng Sưu tầm Vương Hồng Sển trưng bày bộ sưu tập cổ vật vô giá của học giả, nhà văn hóa, nhà sưu tầm đồ cổ Nam Bộ lừng danh - cụ Vương Hồng Sển (1902 - 1996). Trước khi qua đời, cụ đã di nguyện hiến tặng toàn bộ 849 cổ vật tâm huyết của đời mình cho Nhà nước để phục vụ nhân dân chiêm ngưỡng và nghiên cứu. Bộ sưu tập nổi tiếng khắp trong và ngoài nước với dòng đồ sứ ký kiểu thời Nguyễn (Bleu de Huế), đồ gốm men lam, đồ gốm Cây Mai Sài Gòn xưa, đồ gốm Trung Hoa và đồ gỗ chạm khảm ốc xà cừ thượng hạng.",
        "aiKnowledgePrompt": "Cụ Vương Hồng Sển (bút hiệu Anh Chi, 1902 - 1996, quê Sóc Trăng): Từng giữ chức Quyền Giám đốc Viện Bảo tàng Quốc gia Sài Gòn (1956-1964). Tác giả của nhiều cuốn sách khảo cứu kinh điển: 'Thú chơi sách', 'Khảo về đồ sứ cổ Trung Hoa', 'Sài Gòn năm xưa'. Năm 1996, cụ di chúc hiến tặng 849 cổ vật quý giá cho Bảo tàng Lịch sử TP.HCM. Điểm nhấn sưu tập: Đồ sứ ký kiểu triều Nguyễn men lam (chén, bát, đĩa vẽ phong cảnh, chữ Nôm), gốm lò Cây Mai Chợ Lớn thế kỷ XIX, bình vôi cổ, nghiên mực, ấm chén trà tử sa danh tiếng.",
        "aiScript": "Kính mời quý khách dừng bước trước Gian phòng Sưu tầm Vương Hồng Sển, nơi lưu giữ hơn 800 cổ vật quý giá của học giả, nhà khảo cứu văn hóa Nam Bộ tài hoa bậc nhất thế kỷ 20. Cả cuộc đời cụ Vương Hồng Sển là một hành trình say mê tìm kiếm, gìn giữ và nâng niu từng mảnh hồn dân tộc kết tinh trong những chiếc bát sứ men lam, chiếc bình vôi cổ hay những nghiên mực, ấm trà tử sa thanh nhã. Tấm lòng vàng hiến tặng toàn bộ gia tài cổ vật vô giá cho non sông trước lúc đi xa của cụ là tấm gương sáng ngời cho tinh thần phụng sự văn hóa. Chiêm ngưỡng không gian này, chúng ta không chỉ thưởng thức nghệ thuật cổ vật đỉnh cao mà còn được đối thoại với cốt cách thanh cao của một bậc đại trí thức Nam Bộ."
    },

    # 15. SƯU TẬP DƯƠNG HÀ
    "P-591": {
        "name": "Gian phòng Sưu tập Dương Hà",
        "period": "Sưu tập Dương Hà",
        "description": "Gian phòng Sưu tập Dương Hà trưng bày bộ sưu tập cổ vật tư nhân đồ sộ với hơn 3.300 hiện vật quý hiếm do gia đình giáo sư Dương Minh Thới và phu nhân Hà Thị Ngọc dày công sưu tầm từ những năm 1930. Sau này, con gái hai cụ là bác sĩ Dương Quỳnh Hoa và chồng là ông Huỳnh Văn Nghị đã đại diện gia đình hiến tặng toàn bộ sưu tập cho TP.HCM và được trưng bày tại Bảo tàng Lịch sử TP.HCM từ năm 2012. Sưu tập gồm nhiều dòng gốm sứ tinh tuyển từ thời Lý, Trần, Lê, Nguyễn, gốm men rạn, men đỏ hồng, đồ ngọc bích, đồ thờ tự và cổ vật quý phương Đông.",
        "aiKnowledgePrompt": "Sưu tập Dương Hà (ghép từ họ cụ Dương Minh Thới 1899-1976 và bà Hà Thị Ngọc 1902-1979): Sưu tầm từ thập niên 1930-1940 nhằm chống lại nạn 'chảy máu cổ vật' ra nước ngoài thời Pháp thuộc. Năm 2011, gia đình bác sĩ Dương Quỳnh Hoa và ông Huỳnh Văn Nghị hiến tặng toàn bộ 3.360 hiện vật cho Nhà nước. Phòng trưng bày khánh thành tháng 12/2012 tại Bảo tàng Lịch sử TP.HCM. Hiện vật tiêu biểu: Bình gốm men rạn vẽ nhiều màu (HV-113), Bình gốm men đỏ hồng (HV-604), Tô sứ vẽ nhiều màu (HV-581), ấm chén trà, tượng đồng, đồ ngọc và đồ đồng cổ.",
        "aiScript": "Chào mừng quý khách đến với Gian phòng Sưu tập Dương Hà, nơi tôn vinh một trong những bộ sưu tập cổ vật tư nhân quy mô và giá trị bậc nhất Việt Nam. Được tạo dựng từ thập niên 1930 bởi tấm lòng tha thiết bảo tồn di sản của cụ Dương Minh Thới và phu nhân Hà Thị Ngọc, hàng ngàn cổ vật quý đã được bảo vệ vẹn nguyên qua bao biến động lịch sử và được gia đình trân trọng hiến tặng cho công chúng hôm nay. Tại đây, quý khách sẽ được chiêm ngưỡng những chiếc bình gốm men rạn ngà huyền ảo, bình gốm men đỏ hồng hỏa biến quý phái cùng những tô sứ men màu rực rỡ. Mỗi cổ vật đều mang trong mình một câu chuyện văn hóa sâu sắc, minh chứng cho tình yêu di sản bất diệt của người trí thức Nam Bộ."
    },

    # 16. CỔ VẬT TÀU ĐẮM BIỂN ĐÔNG
    "P-948": {
        "name": "Gian phòng Cổ vật tàu đắm biển Đông",
        "period": "Cổ vật tàu đắm biển Đông",
        "description": "Gian phòng Cổ vật tàu đắm biển Đông giới thiệu những thành tựu khảo cổ học dưới nước rực rỡ của Việt Nam thông qua các hiện vật trục vớt từ những con tàu buôn cổ bị chìm trên vùng biển Đông (thế kỷ XV - XVIII). Không gian trưng bày hàng ngàn cổ vật gốm sứ mậu dịch xuất khẩu từ các con tàu đắm trứ danh: tàu đắm Cù Lao Chàm (Quảng Nam), tàu Hòn Cau (Bà Rịa - Vũng Tàu), tàu Cà Mau, tàu Bình Thuận và tàu Vũng Tàu. Đây là bằng chứng vật chất đanh thép khẳng định vị thế trung tâm của Việt Nam trên con đường tơ lụa và gốm sứ trên biển quốc tế.",
        "aiKnowledgePrompt": "Khảo cổ học dưới nước Việt Nam (thập niên 1990 - 2000): Trục vớt các xác tàu buôn cổ quốc tế chìm trên lãnh hải Việt Nam. Các con tàu đắm tiêu biểu: Tàu Cù Lao Chàm (thế kỷ XV, hơn 24 vạn cổ vật gốm Chu Đậu xuất khẩu), Tàu Hòn Cau (khoảng năm 1690, gốm men lam Khang Hy), Tàu Cà Mau (thời Ung Chính, khoảng 1725), Tàu Bình Thuận (thời Vạn Lịch nhà Minh, khoảng 1608), Tàu Vũng Tàu (khoảng 1690). Hiện vật: Đĩa, bát, âu, bình tỳ bà gốm hoa lam vẽ thiên nga, cá chép, hoa mẫu đơn còn nguyên vẹn lớp men dù ngâm đáy biển hàng trăm năm.",
        "aiScript": "Kính mời quý khách bước vào Gian phòng Cổ vật tàu đắm biển Đông, không gian kỳ bí đưa chúng ta về với những bí mật nằm sâu dưới đáy đại dương suốt nhiều thế kỷ. Nằm trên tuyến hàng hải huyết mạch nối liền Đông và Tây, vùng biển Việt Nam từng chứng kiến những đoàn thuyền buôn tấp nập giao thương. Tại đây, quý khách sẽ được chiêm ngưỡng hàng ngàn hiện vật gốm sứ mậu dịch tinh xảo được trục vớt từ các con tàu cổ bị đắm tại Cù Lao Chàm, Hòn Cau hay Cà Mau. Dù trải qua hàng trăm năm ngâm mình trong cát biển và san hô, lớp men gốm hoa lam vẽ chim muông, hoa lá vẫn sáng bóng rực rỡ, là minh chứng kỳ diệu cho một thời kỳ thương mại hàng hải hoàng kim của dân tộc."
    },

    # 17. THƯƠNG MẠI HÀNG HẢI - GỐM SỨ
    "P-653": {
        "name": "Gian phòng Thương mại hàng hải - Gốm sứ",
        "period": "Thương mại hàng hải - Gốm sứ",
        "description": "Gian phòng Thương mại hàng hải - Gốm sứ làm nổi bật vai trò của Việt Nam như một trung tâm sản xuất và xuất khẩu gốm sứ hàng đầu Đông Á từ thế kỷ XIV đến thế kỷ XVIII. Bên cạnh việc nhập khẩu đồ sứ tinh hoa, các lò gốm lừng danh của Đại Việt như Bát Tràng, Chu Đậu, Thăng Long, Gò Sành (Bình Định) và Cây Mai (Sài Gòn) đã xuất khẩu hàng triệu sản phẩm đi khắp Đông Nam Á, Nhật Bản, Trung Đông và Tây Âu. Trưng bày gồm các dòng gốm hoa lam, gốm men ngọc, gốm nhiều màu và bản đồ các tuyến hải trình cổ xưa.",
        "aiKnowledgePrompt": "Thương mại hàng hải gốm sứ Việt Nam (thế kỷ XIV - XVIII): Giao thương quốc tế qua các thương cảng sầm uất: Vân Đồn (Quảng Ninh), Phố Hiến (Hưng Yên), Hội An (Quảng Nam), Nước Mặn (Bình Định), Bến Nghé - Cù Lao Phố (Nam Bộ). Dòng gốm xuất khẩu chủ lực: Gốm Chu Đậu (Hải Dương) với kỹ thuật vẽ lam dưới men trứ danh, gốm Bát Tràng (Hà Nội), gốm Gò Sành (vương quốc Champa/Đại Việt), gốm Cây Mai (Chợ Lớn). Khách hàng quốc tế: Nhật Bản (đồ gốm An Nam cho trà đạo), Đông Nam Á hải đảo (Indonesia, Philippines), vùng Vịnh và châu Âu.",
        "aiScript": "Chào mừng quý khách đến với Gian phòng Thương mại hàng hải - Gốm sứ, nơi tôn vinh tài nghệ chế tác gốm sứ và vị thế giao thương quốc tế đáng tự hào của cha ông ta. Từ thế kỷ 14 đến thế kỷ 18, gốm sứ Việt Nam với các lò nung danh tiếng như Chu Đậu, Bát Tràng hay Gò Sành đã vươn mình ra biển lớn, trở thành mặt hàng xuất khẩu quý giá được hoàng gia Nhật Bản, giới quý tộc Đông Nam Á và phương Tây say mê săn đón. Chiêm ngưỡng những chiếc bình hoa lam vẽ cảnh sơn thủy khoáng đạt, những đĩa gốm vẽ cá chép hóa rồng uyển chuyển, quý khách sẽ thấu hiểu sâu sắc bản lĩnh mở cõi và năng lực hội nhập hàng hải phi thường của người Việt xưa."
    },

    # 18. SÂN VƯỜN NỘI VIỆN
    "P-142": {
        "name": "Sân vườn nội viện",
        "period": "Sân vườn nội viện",
        "description": "Sân vườn nội viện là không gian kiến trúc cảnh quan mở xanh mát, đóng vai trò 'lá phổi xanh' và khoảng đệm phong thủy tĩnh tại nằm ở trung tâm cụm công trình Bảo tàng Lịch sử TP. Hồ Chí Minh. Được bao bọc bởi những vòm hành lang uốn cong và rợp bóng các tán cây cổ thụ trăm năm, sân vườn lưu giữ và trưng bày ngoài trời nhiều hiện vật kích thước lớn: các khẩu súng thần công cổ thời Nguyễn bằng đồng và gang, bia ký đá khắc chữ Hán cổ truyền, cùng các cấu kiện điêu khắc kiến trúc đền tháp độc đáo.",
        "aiKnowledgePrompt": "Không gian Sân vườn nội viện Bảo tàng Lịch sử TP.HCM: Thiết kế cảnh quan sân trong (Courtyard) truyền thống của kiến trúc phương Đông kết hợp kiến trúc thuộc địa Pháp. Diện tích thoáng đãng, trồng nhiều cây cổ thụ quý như sao đen, dầu rái, sứ đại che bóng mát. Trưng bày ngoài trời: Hệ thống súng thần công thời Nguyễn đúc bằng đồng và gang từng trang bị cho các pháo đài ven biển Nam Bộ; các bệ thờ sa thạch, bia đá tưởng niệm và các tác phẩm điêu khắc ngoài trời chịu được điều kiện thời tiết tự nhiên.",
        "aiScript": "Kính mời quý khách dừng chân thư thái tại Sân vườn nội viện, không gian xanh mát và khoáng đạt nằm giữa lòng Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Được thiết kế theo mô hình sân trong truyền thống kết hợp hài hòa với những đường nét kiến trúc Đông Dương trang nhã, nơi đây rợp mát bóng cây cổ thụ trăm năm tuổi, mang lại khoảng lặng bình yên sau những giờ phút chiêm ngưỡng lịch sử. Dạo bước quanh sân vườn, quý khách có thể tận mắt quan sát những cỗ súng thần công uy dũng thời Nguyễn được đặt trang trọng ngoài trời, cùng những phiến bia đá rêu phong cổ kính, tạo nên một bản hòa ca tuyệt đẹp giữa thiên nhiên thanh bình và chiều sâu di sản ngàn năm."
    }
}


def run_rooms_enrichment():
    print(f"=== BẮT ĐẦU CẬP NHẬT DỮ LIỆU KHẢO CỨU CHO TOÀN BỘ {len(ROOMS_RESEARCH_DATA)} GIAN PHÒNG ===")

    # 1. Lấy danh sách gian phòng hiện tại
    req_list = urllib.request.Request(f"{BASE_URL}", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req_list, context=ctx) as resp:
        res = json.loads(resp.read().decode("utf-8"))

    rooms = res.get("data", res)
    print(f"-> Tìm thấy {len(rooms)} gian phòng từ hệ thống.")

    room_map = {r.get("code"): r for r in rooms}

    success_count = 0
    fail_count = 0

    for code, info in ROOMS_RESEARCH_DATA.items():
        if code not in room_map:
            print(f"[-] Không tìm thấy mã phòng {code} trên hệ thống!")
            fail_count += 1
            continue

        item = room_map[code]
        room_id = item.get("id") or item.get("_id")

        payload = {
            "name": info["name"],
            "period": info["period"],
            "description": info["description"],
            "aiKnowledgePrompt": info["aiKnowledgePrompt"],
            "aiScript": info["aiScript"],
            "aiVoiceLang": "vi-south",
            "translations": {
                "vi": {
                    "name": info["name"],
                    "period": info["period"],
                    "description": info["description"],
                    "narrationScript": info["aiScript"],
                    "aiKnowledgePrompt": info["aiKnowledgePrompt"]
                }
            }
        }

        put_url = f"{BASE_URL}/{room_id}"
        put_req = urllib.request.Request(
            put_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
            method="PUT"
        )

        try:
            with urllib.request.urlopen(put_req, context=ctx) as put_resp:
                put_res = json.loads(put_resp.read().decode("utf-8"))
                if put_res.get("success"):
                    print(f"[+] Thành công: [{code}] {info['name']} (Desc: {len(info['description'])} chars | Script: {len(info['aiScript'])} chars | Prompt: {len(info['aiKnowledgePrompt'])} chars)")
                    success_count += 1
                else:
                    print(f"[-] Thất bại: [{code}] {put_res.get('message')}")
                    fail_count += 1
        except Exception as e:
            print(f"[!] Lỗi khi gọi PUT {code}: {e}")
            fail_count += 1

        time.sleep(0.3)

    print(f"\n=== KẾT QUẢ CẬP NHẬT GIAN PHÒNG: Thành công {success_count}/{len(ROOMS_RESEARCH_DATA)}, Thất bại: {fail_count} ===")


if __name__ == "__main__":
    run_rooms_enrichment()
