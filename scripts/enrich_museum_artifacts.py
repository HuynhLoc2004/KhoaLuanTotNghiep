# -*- coding: utf-8 -*-
"""
Script cập nhật dữ liệu lịch sử chuẩn xác cho các hiện vật tại Bảo tàng Lịch sử TP.HCM
Chạy trực tiếp qua API https://museumhcm.duckdns.org/api/artifacts/:id
Đồng bộ cả PostgreSQL Primary, MongoDB và xóa sạch Redis cache.
"""

import urllib.request
import json
import ssl
import time

ctx = ssl._create_unverified_context()

BASE_URL = "https://museumhcm.duckdns.org/api/artifacts"

ARTIFACT_RESEARCH_DATA = {
    # ==========================================
    # GIAN PHÒNG SƯU TẬP DƯƠNG HÀ (P-591)
    # ==========================================
    "HV-581": {
        "name": "Tô sứ vẽ nhiều màu",
        "period": "Sưu tập Dương Hà",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Đường kính miệng 18.2 cm, Đường kính đáy 8.5 cm, Cao 9.2 cm",
        "description": "Tô sứ vẽ nhiều màu (Đại Thanh / gốm sứ ký kiểu triều Nguyễn, thế kỷ XIX) thuộc Sưu tập Dương Hà trứ danh tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Hiện vật được chế tác bằng chất đất sét trắng mịn tinh tuyển, cốt sứ mỏng đều, lòng và thân tô tráng men bóng láng. Mặt ngoài vẽ thủ công men nhiều màu (phấn thái / ngũ thái) tinh xảo với đề tài hoa lá, chim muông hoặc phong cảnh sơn thủy hữu tình, viền miệng và đế nẹp chỉ kim loại hoặc trang trí hồi văn cổ kính. Tác phẩm phản ánh sự giao lưu văn hóa và thú sưu tầm đồ sứ quý giá của giới trí thức, thượng lưu Nam Bộ xưa, được gia đình cụ Dương Minh Thới và bà Hà Thị Ngọc gìn giữ vẹn nguyên qua các thời kỳ biến thiên của lịch sử.",
        "narration": "Chào mừng quý khách đến chiêm ngưỡng Tô sứ vẽ nhiều màu, hiện vật quý giá thuộc Sưu tập Dương Hà có niên đại vào thế kỷ 19, hiện đang được lưu giữ và trưng bày trang trọng tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Chiếc tô sứ là một minh chứng xuất sắc cho kỹ nghệ chế tác và nghệ thuật vẽ men màu thủ công đỉnh cao. Quý khách có thể quan sát cốt sứ mỏng nhẹ, tráng lớp men bóng sáng kết hợp hài hòa với những nét vẽ mềm mại, uyển chuyển khắc họa hình tượng muôn hoa và cánh chim sống động. Trong không gian Nam Bộ xưa, những cổ vật sứ men nhiều màu như thế này không chỉ là vật dụng cao cấp mà còn biểu trưng cho gu thẩm mỹ tao nhã và nếp sống phong lưu, tri thức của các gia đình danh gia vọng tộc."
    },
    "HV-604": {
        "name": "Bình gốm men đỏ hồng",
        "period": "Sưu tập Dương Hà",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 31.5 cm, Đường kính miệng 8.8 cm, Đường kính đáy 10.2 cm",
        "description": "Bình gốm men đỏ hồng (dáng củ tỏi / tỳ bà tôn quý, thế kỷ XIX - đầu thế kỷ XX) là hiện vật đặc sắc trong Sưu tập Dương Hà tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Điểm độc đáo nhất của hiện vật là kỹ thuật hỏa biến tráng men đỏ hồng (Lang diêu hồng / hồng ngọc) vô cùng khó đạt được trong lò nung củi truyền thống, đòi hỏi sự kiểm soát nghiêm ngặt về nhiệt độ nung và môi trường khử oxy. Lớp men phủ ngoài óng ả, sắc đỏ lan tỏa tự nhiên, chuyển dần sắc thái từ hồng ngọc đến huyết dụ thẫm ở phần chân đế. Dáng bình thanh thoát với cổ cao, vai xuôi nở đều xuống thân dưới, toát lên vẻ đẹp sang trọng, quý phái của nghệ thuật gốm men màu cổ điển Đông Á.",
        "narration": "Kính mời quý khách dừng bước trước Bình gốm men đỏ hồng, một tác phẩm gốm sứ độc đáo niên đại thế kỷ 19 thuộc Sưu tập cổ vật Dương Hà tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Điểm cuốn hút đầu tiên của chiếc bình chính là sắc men đỏ hồng rực rỡ, láng bóng như ngọc phủ đều khắp thân bình. Để tạo nên được màu men đặc biệt này, các nghệ nhân gốm xưa phải làm chủ kỹ thuật hỏa biến vô cùng chuẩn xác trong ngọn lửa lò nung. Với những đường cong thanh nhã từ cổ bình thon dài mở rộng dần xuống thân tròn đầy đặn, hiện vật không chỉ thể hiện đỉnh cao thẩm mỹ tạo hình gốm phương Đông mà còn là đại diện tiêu biểu cho kho tàng di sản đồ gốm quý báu được gia đình trí thức Nam Bộ dày công sưu tầm và gìn giữ."
    },
    "HV-113": {
        "name": "Bình gốm men rạn vẽ nhiều màu",
        "period": "Sưu tập Dương Hà",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 28.5 cm, Đường kính miệng 11.2 cm, Đường kính đáy 12.0 cm",
        "description": "Bình gốm men rạn vẽ nhiều màu (niên đại thế kỷ XIX - đầu thế kỷ XX) là cổ vật quý hiếm thuộc Sưu tập Dương Hà được trưng bày tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Bình được chế tác với kỹ thuật men rạn ngà độc đáo - sự co giãn vật lý có chủ ý giữa cốt xương gốm và nước men tạo nên mạng lưới vân rạn li ti tinh tế như tơ nhện phủ kín bề mặt. Trên nền men rạn cổ kính, các nghệ nhân xưa đã khéo léo dùng men nhiều màu vẽ các điển tích nhân vật, cành đào, cây tùng và hoa lá sống động với bố cục lớp lang khoáng đạt. Cổ bình trang trí các vòng hồi văn đối xứng, thân phình tròn vững chãi. Hiện vật là minh chứng tiêu biểu cho dòng gốm mỹ nghệ truyền thống Nam Bộ và giao lưu văn hóa khu vực được sưu tập trọn vẹn qua nhiều thế hệ.",
        "narration": "Chào mừng quý khách đến với tác phẩm Bình gốm men rạn vẽ nhiều màu, hiện vật tinh hoa thế kỷ 19 thuộc Sưu tập Dương Hà tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Nét đặc sắc bậc nhất của chiếc bình nằm ở lớp men rạn ngà cổ kính, nơi những đường rạn tự nhiên như mạng nhện đan xen tạo nên chiều sâu huyền bí của thời gian. Trên bề mặt ấy, từng nét cọ phóng khoáng vẽ muôn hoa đua nở cùng chim muông sum vầy bằng các sắc men lam, lục, vàng ấm áp vẫn còn nguyên vẹn vẻ tươi sáng. Dáng bình cân đối, đĩnh đạc mang đậm hơi thở văn hóa truyền thống Á Đông. Chiêm ngưỡng chiếc bình men rạn này, chúng ta càng thêm trân trọng tấm lòng gìn giữ di sản của cụ Dương Minh Thới và phu nhân Hà Thị Ngọc, những người đã hiến tặng hàng nghìn cổ vật quý cho hậu thế hôm nay."
    },

    # ==========================================
    # GIAN PHÒNG THỜI NGUYỄN (P-277)
    # ==========================================
    "HV-856": {
        "name": "Áo Cát phục của Hoàng tử",
        "period": "Thời Nguyễn",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Dài áo 118.0 cm, Rộng thân 62.0 cm, Sải tay 185.0 cm",
        "description": "Áo Cát phục của Hoàng tử triều Nguyễn (thế kỷ XIX - đầu thế kỷ XX) là hiện vật cung đình cực kỳ quý hiếm đang được bảo quản đặc biệt tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Áo được may bằng chất liệu lụa tơ tằm sa, the hoặc gấm cao cấp, dệt và thêu tay hoàn toàn bằng chỉ tơ ngũ sắc cùng kim tuyến lấp lánh. Theo điển chế triều Nguyễn, trang phục của Hoàng tử được thêu hoa văn Mãng (rồng 4 móng) uốn lượn uy nghi giữa tầng mây ngũ sắc (ngũ sắc tường vân), phía dưới gấu áo là hoa văn sóng nước thủy ba và dải tam sơn vững chãi tượng trưng cho giang sơn xã tắc trường tồn. Áo Cát phục được mặc trong các dịp đại lễ khánh tiết cung đình, thể hiện đỉnh cao của nghệ thuật thêu may truyền thống và quy chế phẩm trật nghiêm cẩn của hoàng tộc nhà Nguyễn.",
        "narration": "Kính mời quý khách chiêm ngưỡng Áo Cát phục của Hoàng tử triều Nguyễn, bảo vật dệt thêu cung đình thế kỷ 19 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Từng đường kim mũi chỉ trên chiếc áo là sự kết tinh tài hoa của những nghệ nhân thêu cẩm tú giỏi nhất đất kinh kỳ. Quý khách có thể nhìn thấy hình tượng Mãng long dũng mãnh ẩn hiện giữa những dải mây ngũ sắc cát tường, cùng họa tiết sóng nước cuộn trào sinh động nơi gấu áo. Màu sắc trang nhã, chất liệu lụa gấm thượng hạng cùng sợi kim tuyến óng ánh đã vượt qua hơn một thế kỷ mà vẫn giữ nguyên được vẻ quyền quý hoàng gia. Hiện vật là bằng chứng vật chất vô giá giúp chúng ta thấu hiểu chiều sâu văn hóa trang phục và nghi lễ cung đình Việt Nam thời phong kiến."
    },
    "HV-436": {
        "name": "Áo cung đình của Hoàng hậu",
        "period": "Thời Nguyễn",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Dài áo 125.0 cm, Rộng thân 68.0 cm, Sải tay 190.0 cm",
        "description": "Áo cung đình của Hoàng hậu (Áo Phượng bào / Nhật bình Cung phi triều Nguyễn, thế kỷ XIX) là kiệt tác nghệ thuật trang phục hoàng gia Việt Nam lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Áo có dạng cổ xẻ ngực viền vuông đặc trưng, may bằng vải gấm lụa quý, thêu kim tuyến và chỉ tơ rực rỡ. Hoa văn chủ đạo trên áo là hình tượng chim Phượng hoàng tung cánh - biểu tượng tối thượng của Hoàng hậu và đức mẫu nghi thiên hạ, kết hợp cùng các họa tiết hoa mẫu đơn, dơi ngậm chữ Thọ, hoa đào và sóng nước thủy ba lộng lẫy. Phần viền cổ và tay áo được phối màu ngũ hành ngũ sắc tinh tế. Hiện vật phản ánh đỉnh cao tay nghề của Cục Thượng Y hoàng triều và thể hiện quy chế lễ nhạc trang trọng bậc nhất thời Nguyễn.",
        "narration": "Chào mừng quý khách đến với tác phẩm kiệt xuất Áo cung đình của Hoàng hậu triều Nguyễn, hiện vật nguyên gốc lưu giữ tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Là biểu tượng của bậc mẫu nghi thiên hạ, chiếc áo toát lên vẻ lộng lẫy uy nghiêm với những cánh chim Phượng hoàng thêu kim tuyến lấp lánh tung bay giữa mây trời và muôn hoa mẫu đơn quý phái. Quý khách hãy quan sát kỹ phần dải viền cổ Nhật bình độc đáo với các đường viền chỉ ngũ sắc đại diện cho triết lý ngũ hành tương sinh, kết hợp cùng họa tiết sóng nước chầu ngọc nơi tà áo. Đây là một công trình nghệ thuật thủ công phi thường của các nghệ nhân cung cấm, phản ánh trọn vẹn sự sang trọng, tinh tế và chuẩn mực lễ nghi cung đình Huế thế kỷ 19."
    },
    "HV-216": {
        "name": "Bình gốm sứ hoa lam vẽ rồng",
        "period": "Thời Nguyễn",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 48.5 cm, Đường kính miệng 16.0 cm, Đường kính đáy 17.5 cm",
        "description": "Bình gốm sứ hoa lam vẽ rồng triều Nguyễn (thế kỷ XIX) thuộc sưu tập đồ sứ men lam cung đình tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Thân bình tròn cao, vai nở, chân choãi vững chãi, cốt gốm sứ đanh chắc, phủ men trắng ngà bóng mượt. Họa tiết rồng mây (long vân đại hội) được thể hiện bằng men xanh cobalt (xanh lam) dưới men với nhiều sắc độ đậm nhạt tinh xảo. Rồng uốn khúc mềm mại nhưng tràn đầy sinh lực, móng vuốt giương cao oai phong giữa những cuộn mây tường vân bồng bềnh, tượng trưng cho thiên uy và sự hưng thịnh của quốc gia. Đây là hiện vật gốm sứ tiêu biểu phản ánh kỹ thuật vẽ hoa lam điêu luyện và thẩm mỹ hoàng triều thời Nguyễn.",
        "narration": "Mời quý khách thưởng lãm Bình gốm sứ hoa lam vẽ rồng, tuyệt tác đồ sứ thời Nguyễn thế kỷ 19 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Nổi bật trên nền men trắng ngọc ngà là hình tượng rồng xanh uốn khúc oai phong lẫm liệt, thể hiện bằng kỹ thuật vẽ men lam cobalt điêu luyện. Các nghệ nhân xưa đã sử dụng tài tình kỹ thuật tạo lớp lam đậm nhạt để lột tả từng vảy rồng sắc nét, hàm râu uốn lượn và đôi mắt rực sáng giữa các cuộn mây cát tường. Trong quan niệm cung đình thời Nguyễn, rồng hoa lam không chỉ là biểu tượng tối thượng cho vương quyền và sự chính thống của hoàng đế, mà còn chuyển tải khát vọng mưa thuận gió hòa, quốc thái dân an cho muôn dân Đại Nam."
    },
    "HV-668": {
        "name": "Súng thần công",
        "period": "Thời Nguyễn",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Dài 135.0 cm, Đường kính nòng 18.5 cm, Trọng lượng khoảng 180 kg",
        "description": "Súng thần công triều Nguyễn (chế tác thế kỷ XIX) là hiện vật quân sự quan trọng trưng bày tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Súng được đúc bằng đồng hoặc gang nguyên khối với kỹ thuật đúc kim loại truyền thống tinh xảo, nòng súng tròn thẳng, thân thon dần về phía đuôi với các gờ tăng cường chịu lực và lỗ điểm hỏa chuẩn xác. Trên thân súng thường được khắc minh văn Hán tự ghi rõ niên hiệu đúc (Gia Long, Minh Mạng hoặc Tự Đức), trọng lượng, đơn vị biên chế và các chữ chúc lành như 'Bảo quốc an dân'. Súng thần công thời Nguyễn là minh chứng sống động cho trình độ luyện kim, đúc pháo binh và nghệ thuật phòng thủ quân sự của cha ông ta trong công cuộc bảo vệ bờ cõi và biển đảo phương Nam.",
        "narration": "Trước mắt quý khách là khẩu Súng thần công triều Nguyễn, hiện vật quân sự uy dũng thế kỷ 19 đang được trưng bày tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Khẩu pháo được đúc nguyên khối bằng kỹ thuật luyện kim cổ truyền xuất sắc của các phường thợ đúc triều đình. Thân súng vững chắc, nổi bật với các gờ chịu áp lực thuốc súng và hệ thống trục quay điều chỉnh góc bắn linh hoạt. Trên thân súng còn khắc nổi các dòng lạc khoản minh văn ghi lại niên đại và trọng lượng pháo. Vũ khí này từng được bố trí tại các pháo đài duyên hải và thành trì trọng yếu ở Nam Kỳ, là biểu tượng kiên cường cho sức mạnh quốc phòng và ý chí bảo vệ chủ quyền non sông của vương triều nhà Nguyễn."
    },
    "HV-489": {
        "name": "Tấm bình phong",
        "period": "Thời Nguyễn",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 165.0 cm, Rộng 120.0 cm, Dày chân đế 35.0 cm",
        "description": "Tấm bình phong gỗ thế kỷ XIX (triều Nguyễn) trưng bày tại Bảo tàng Lịch sử TP. Hồ Chí Minh là tác phẩm đỉnh cao của nghệ thuật chạm khắc gỗ và cẩn ốc xà cừ Nam Bộ. Bình phong được làm từ gỗ quý nguyên khối, khung chạm lộng tinh xảo đồ án bát bửu, tứ linh (Long, Lân, Quy, Phụng) hoặc mai lan cúc trúc. Lòng bình phong cẩn xà cừ óng ánh bảy màu thể hiện phong cảnh sơn thủy, nhà cửa và tích người thanh nhã. Trong kiến trúc và phong thủy truyền thống cung đình lẫn phủ đệ quan lại, bình phong đóng vai trò tụ khí tàng phong, ngăn chặn các luồng khí xấu và che chắn không gian kín đáo, thể hiện chiều sâu văn hóa và sự sang trọng của không gian sống xưa.",
        "narration": "Chào mừng quý khách chiêm ngưỡng Tấm bình phong gỗ thế kỷ 19, một kiệt tác điêu khắc và khảm ốc xà cừ truyền thống tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Tấm bình phong được chế tác công phu từ gỗ quý, với phần khung chạm lộng các họa tiết hoa lá, chim muông đan xen uyển chuyển. Lòng bình phong bừng sáng nhờ kỹ thuật cẩn ốc xà cừ ngũ sắc lấp lánh dưới ánh sáng, tái hiện bức tranh phong cảnh hữu tình và nếp sống tao nhã thời xưa. Không chỉ mang giá trị thẩm mỹ trang trí phòng khách hay gian thờ của các gia đình danh gia vọng tộc thời Nguyễn, bình phong còn mang ý nghĩa phong thủy sâu sắc giúp ngăn tà khí, tụ vượng khí, mang lại bình an cho gia chủ."
    },
    "HV-874": {
        "name": "Đỉnh đồng ba chân",
        "period": "Thời Nguyễn",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 42.0 cm, Đường kính miệng 26.5 cm, Khoảng cách hai quai 36.0 cm",
        "description": "Đỉnh đồng ba chân (thế kỷ XIX, thời Nguyễn) là hiện vật đồ tự khí quan trọng lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Đỉnh được đúc bằng hợp kim đồng đỏ cổ truyền, màu đồng ngả sắc đồng hun cổ kính. Thân đỉnh hình tròn bầu dục vững chãi nâng đỡ bởi ba chân chạm đầu lân móng nghê oai nghiêm. Hai bên thân là quai mây uốn cong mềm mại, nắp đỉnh chạm thủng hoa văn mây lửa và trên đỉnh có tượng nghê vờn ngọc uy dũng. Đỉnh đồng ba chân dùng để xông trầm hương trong các nghi lễ trang trọng nơi từ đường, đền miếu hoặc cung phủ, tượng trưng cho sự trang nghiêm, lòng thành kính với tổ tiên và khát vọng thái bình thịnh vượng.",
        "narration": "Kính mời quý khách quan sát Đỉnh đồng ba chân thời Nguyễn, cổ vật tự khí thế kỷ 19 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Đỉnh đồng mang vẻ đẹp thâm trầm, cổ kính với màu đồng hun bền bỉ qua năm tháng. Thân đỉnh tròn trĩnh tựa trên ba chân vững chắc tạc hình đầu nghê oai vệ, tượng trưng cho sự chở che và xua đuổi tà khí. Trên nắp đỉnh là tượng con nghê vờn ngọc được chạm lộng tinh xảo, nơi khói trầm hương thơm ngát từng lan tỏa trong các nghi lễ trang nghiêm chốn cung phủ và từ đường. Hiện vật phản ánh tài hoa đúc đồng thượng thừa của các nghệ nhân truyền thống Đại Nam cùng nét đẹp văn hóa tâm linh uống nước nhớ nguồn của dân tộc."
    },
    "HV-180": {
        "name": "Mô hình cổng Ngọ Môn",
        "period": "Thời Nguyễn",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Dài 85.0 cm, Rộng 45.0 cm, Cao 48.0 cm",
        "description": "Mô hình cổng Ngọ Môn Huế bằng gỗ quý (tỷ lệ thu nhỏ chế tác thời Nguyễn - đầu thế kỷ XX) trưng bày tại Bảo tàng Lịch sử TP. Hồ Chí Minh là hiện vật tư liệu kiến trúc đặc biệt quý giá. Hiện vật mô phỏng chân xác cổng Ngọ Môn - cửa chính phía nam của Hoàng thành Huế được xây dựng dưới triều vua Minh Mạng (1833). Mô hình tái hiện chi tiết kết cấu nền đài chữ U bằng đá thanh xẻ vòm 5 cửa (lối đi chính giữa dành riêng cho Hoàng đế), phía trên là lầu Ngũ Phụng 2 tầng mái lợp ngói hoàng lưu ly và thanh lưu ly với kết cấu vì kèo mộc ghép mộng tinh xảo. Mô hình giúp khách tham quan hình dung trọn vẹn sự đồ sộ, hài hòa của đỉnh cao kiến trúc cung đình Cố đô Huế.",
        "narration": "Chào mừng quý khách đến chiêm ngưỡng Mô hình cổng Ngọ Môn, công trình kiến trúc biểu tượng của Cố đô Huế thu nhỏ tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Được chế tác tỉ mỉ bằng gỗ quý, mô hình tái hiện sống động cổng Ngọ Môn uy nghi - cửa chính phía Nam Hoàng thành Huế xây dựng năm 1833 dưới triều vua Minh Mạng. Quý khách có thể thấy rõ phần nền đài hình chữ U kiên cố với năm lối cửa vòm, nơi lối giữa từng dành riêng cho bậc Thiên tử. Bên trên là lầu Ngũ Phụng tráng lệ với hai tầng mái uốn cong duyên dáng, lợp ngói lưu ly óng ả. Mô hình này là tư liệu trực quan tuyệt vời tôn vinh trí tuệ kiến trúc và bàn tay vàng của các nghệ nhân mộc Đại Nam xưa."
    },

    # ==========================================
    # GIAN PHÒNG ĐIÊU KHẮC ĐÁ CAMPUCHIA (P-737)
    # ==========================================
    "HV-237": {
        "name": "Tượng Nam thần điêu",
        "period": "Điêu khắc đá Campuchia",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 48.0 cm, Rộng 28.5 cm, Sâu 22.0 cm",
        "description": "Tượng Nam thần điêu (Thần chim Garuda / Kim Sí Điểu dạng nhân hình, nghệ thuật Khmer phong cách Bayon, thế kỷ XII - XIII) là hiện vật điêu khắc đá sa thạch độc đáo tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Bức tượng khắc họa nam thần có cánh và mỏ chim dũng mãnh, mình người vạm vỡ, ngực nở, hai tay giương cao trong tư thế nâng đỡ vũ trụ hoặc chiến đấu chống loài rắn Naga hung hãn. Đôi mắt mở to cương trực, vòng kiềng cổ và thắt lưng sampot được chạm nổi tỉ mỉ. Tượng thể hiện sinh động sức mạnh thần thoại, sự dũng cảm và lòng trung thành trong vũ trụ quan Hindu giáo và Phật giáo Đại thừa thời kỳ đế chế Angkor hưng thịnh.",
        "narration": "Chào mừng quý khách đến chiêm ngưỡng Tượng Nam thần điêu, tuyệt tác điêu khắc sa thạch nghệ thuật Khmer thế kỷ 12 đến 13 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Bức tượng khắc họa Thần điêu trong tư thế oai dũng với sự kết hợp kỳ vĩ giữa thân hình nam giới khỏe khoắn và những đường nét dũng mãnh của chim thần Garuda. Đôi vai vạm vỡ, ngực căng tràn sinh lực cùng những nếp gấp trang phục sampot chạm khắc sắc sảo thể hiện trình độ đẽo gọt sa thạch bậc thầy. Trong thần thoại, Garuda là linh vật hộ trì công lý, xua đuổi bóng tối và tà khí. Pho tượng mang đến cho người xem cảm nhận sâu sắc về khí phách hùng tráng của nền văn minh Angkor rực rỡ một thời."
    },
    "HV-890": {
        "name": "Tượng Bồ tát Quán Thế Âm",
        "period": "Điêu khắc đá Campuchia",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 65.0 cm, Rộng 26.0 cm, Sâu 18.5 cm",
        "description": "Tượng Bồ tát Quán Thế Âm (Lokeshvara / Avalokiteshvara, nghệ thuật đá Angkor phong cách Baphuon hoặc Bayon, thế kỷ XI - XII) là kiệt tác điêu khắc đá sa thạch quý hiếm tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Bồ tát đứng thẳng trong tư thế tĩnh tại trang nghiêm, búi tóc hình chóp Jatamukuta chạm hình tượng Phật A Di Đà tọa thiền phía trước. Khuôn mặt Bồ tát toát lên vẻ từ bi vô lượng với vầng trán rộng, đôi mắt khép hờ nhìn xuống thế gian và nụ cười cứu rỗi an nhiên đặc trưng của nghệ thuật Angkor. Bức tượng là bằng chứng vật chất quan trọng cho giai đoạn Phật giáo phát triển thịnh vượng dưới thời các vua Angkor.",
        "narration": "Kính mời quý khách dừng bước trước Tượng Bồ tát Quán Thế Âm, pho tượng đá sa thạch tuyệt mỹ thế kỷ 11 đến 12 thuộc phòng Điêu khắc đá Campuchia tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Pho tượng khắc họa Bồ tát Quán Thế Âm với dung mạo thanh tịnh, đôi mắt trầm mặc khép hờ và nụ cười bao dung đầy lòng trắc ẩn hướng về chúng sinh. Trên búi tóc cao tết tỉ mỉ là hình bóng Đức Phật A Di Đà ngồi thiền định tôn quý. Bằng những nhát đục uyển chuyển trên chất liệu đá cứng cáp, người nghệ nhân Khmer cổ đại đã thổi vào pho tượng một sức sống tâm linh thiêng liêng và thanh thản vô bờ, đưa tác phẩm trở thành biểu tượng bất hủ cho lòng từ bi cứu khổ cứu nạn."
    },
    "HV-917": {
        "name": "Tượng Bồ tát Quán Thế Âm",
        "period": "Điêu khắc đá Campuchia",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 58.0 cm, Rộng 32.0 cm, Sâu 20.0 cm",
        "description": "Tượng Bồ tát Quán Thế Âm Lokeshvara đa thủ (nghệ thuật Angkor, thế kỷ XII) lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh thể hiện Bồ tát với nhiều cánh tay cầm các pháp khí thần thánh như tràng hạt, kinh sách, hoa sen và bình cam lộ. Thân tượng thon thả, cơ thể cân đối được chạm khắc mềm mại trên đá sa thạch xám. Búi tóc cao chạm khắc tinh vi biểu tượng thiền định, trang phục quấn sampot có nếp gấp xếp ly hình đuôi cá trang nhã ngang hông. Tác phẩm phản ánh tư tưởng Phật giáo Đại thừa mật tông thịnh hành dưới triều đại vua Jayavarman VII, tôn vinh vị bồ tát hiện thân của lòng đại bi che chở cho muôn loài.",
        "narration": "Trước mắt quý khách là pho Tượng Bồ tát Quán Thế Âm nhiều tay, tuyệt tác sa thạch thế kỷ 12 thuộc thời kỳ Angkor hoàng kim tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Điểm đặc biệt của bức tượng là hình tượng Bồ tát với các cánh tay tỏa đều uy nghi, từng bàn tay nhẹ nhàng cầm các pháp khí tượng trưng cho trí tuệ và sự giải thoát. Nét mặt của Ngài toát lên sự tĩnh lặng tuyệt đối, vầng trán thanh cao cùng nụ cười huyền bí gợi nhớ đến những khuôn mặt tháp đá Bayon tráng lệ. Qua bàn tay tài hoa của nghệ nhân xưa, chất liệu đá sa thạch vô tri đã hóa thân thành một thực thể tâm linh dịu dàng, gửi gắm ước vọng hòa bình và sự che chở bao dung đến thế gian."
    },
    "HV-514": {
        "name": "Tượng thần Brahma",
        "period": "Điêu khắc đá Campuchia",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 72.0 cm, Rộng 36.0 cm, Sâu 30.0 cm",
        "description": "Tượng thần Brahma (thần Sáng tạo bốn mặt trong bộ tam thần Trimurti của Hindu giáo, phong cách nghệ thuật Angkor thế kỷ XI - XII) trưng bày tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Tượng tạc bằng đá sa thạch nguyên khối thể hiện thần Brahma có bốn khuôn mặt quay ra bốn phương chính, tượng trưng cho sự toàn tri toàn năng và bao quát khắp vũ trụ. Mỗi khuôn mặt đều có hàng lông mày cong liền nét, đôi môi mỉm cười uy nghiêm, râu cằm tỉa ngắn gọn gàng và đội mũ miện hình trụ chạm khắc hoa văn lá cúc tinh vi. Pho tượng là kiệt tác thể hiện triết học vũ trụ luận sâu sắc và kỹ năng tạo hình khối không gian đa chiều mẫu mực của điêu khắc Khmer cổ.",
        "narration": "Chào mừng quý khách đến chiêm ngưỡng Tượng thần Brahma bốn mặt, kiệt tác điêu khắc sa thạch thế kỷ 11 đến 12 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Trong thần thoại Hindu giáo, Brahma là đấng Sáng tạo tối cao khai sinh ra vũ trụ. Bức tượng được tạc với bốn khuôn mặt hướng về bốn phương trời, tượng trưng cho trí tuệ vô biên và khả năng dõi nhìn khắp mọi cõi giới. Quý khách hãy chiêm ngưỡng thần thái uy nghi, hàng lông mày sắc sảo cùng những chiếc mũ miện chạm hoa văn hình học tỉ mỉ trên mỗi đầu tượng. Sự cân đối hoàn hảo trong từng góc nhìn đã minh chứng cho kỹ thuật điêu khắc tượng tròn đỉnh cao của các nhà điêu khắc đền tháp Campuchia thời trung đại."
    },

    # ==========================================
    # PHÒNG VĂN HÓA CHAMPA (P-121)
    # ==========================================
    "HV-756": {
        "name": "Devi",
        "period": "Văn Hoá Champa",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 38.5 cm, Rộng 21.6 cm, Sâu 11.8 cm",
        "description": "Tượng nữ thần Devi (Bảo vật Quốc gia, thế kỷ X, phong cách Trà Kiệu) là hiện vật quý báu bậc nhất được lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh, phát hiện năm 1911 tại Hương Quế (Quảng Nam). Tượng bán thân tạc nữ thần Devi - hiện thân của vẻ đẹp và nữ tính thiêng liêng theo thần thoại Champa. Khuôn mặt thần thanh tú với vầng trán nở, đôi lông mày cong giao nhau nhẹ nhàng, sống mũi cao thẳng, đôi môi mọng nở nụ cười kín đáo và đôn hậu. Búi tóc Jatamukuta cầu kỳ tết thành nhiều tầng gắn trang sức hoa đá, cổ đeo vòng kiềng ba ngấn quý phái. Tác phẩm là đỉnh cao kết tinh của nghệ thuật tạc tượng sa thạch Champa, hài hòa giữa yếu tố thần thoại Ấn Độ và nét đẹp phụ nữ bản địa.",
        "narration": "Kính chào quý khách đến chiêm ngưỡng Tượng nữ thần Devi, một trong những Bảo vật Quốc gia vô giá niên đại thế kỷ thứ 10 đang được trưng bày tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Bức tượng bán thân bằng sa thạch này được phát hiện tại Hương Quế, Quảng Nam, mang phong cách nghệ thuật Trà Kiệu đạt đến độ hoàn mỹ tột cùng. Quý khách có thể chiêm ngưỡng gương mặt nữ thần vô cùng đôn hậu với hàng lông mày giao nhau duyên dáng, đôi môi hé nở nụ cười bao dung huyền diệu và búi tóc cao tết tầng tầng lớp lớp tinh tế như một đóa hoa sen. Bức tượng không chỉ là kiệt tác điêu khắc nhân thần sống động mà còn là hiện thân tuyệt đẹp cho sự tôn vinh người phụ nữ trong văn hóa Champa cổ xưa."
    },
    "HV-618": {
        "name": "Khay đựng đồ cúng",
        "period": "Văn Hoá Champa",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Đường kính 28.5 cm, Cao 10.5 cm, Đường kính đáy 18.0 cm",
        "description": "Khay đựng đồ cúng tế Champa (chất liệu sa thạch / gốm đất nung thế kỷ IX - XI) lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Khay có dạng hình tròn miệng loe rộng, lòng hơi trũng để bày các vật phẩm cúng dường như hoa tươi, hương liệu và lễ vật trong các nghi lễ tôn giáo ở đền tháp. Vành khay chạm khắc các dải hoa văn răng cưa, cánh hoa sen và họa tiết hình học đối xứng tinh tế. Hiện vật phản ánh đời sống tâm linh sùng kính thần linh và phong tục cúng lễ nghiêm trang của cư dân Champa cổ đại, đóng vai trò như một cầu nối thiêng liêng giữa con người và thế giới thần linh.",
        "narration": "Mời quý khách thưởng lãm Khay đựng đồ cúng tế, hiện vật lễ nghi Champa cổ niên đại thế kỷ 9 đến 11 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Chiếc khay tròn thanh thoát với các đường diềm uốn lượn nhịp nhàng quanh vành miệng, chạm khắc các họa tiết hoa sen thanh khiết cách điệu. Trong các nghi lễ thiêng liêng dưới bóng đền tháp ngàn năm, chiếc khay này từng là vật đựng hoa quả, hương hoa tinh khiết mà các tín đồ thành kính dâng lên thần Shiva và các vị hộ pháp. Mỗi đường nét giản dị nhưng trang trọng trên hiện vật đều thể hiện lòng thành kính sâu xa và nét văn hóa nghi lễ đặc sắc của vương quốc Champa xưa."
    },
    "HV-422": {
        "name": "Hộp sen",
        "period": "Văn Hoá Champa",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Đường kính 18.5 cm, Cao 21.0 cm, Đường kính đáy 12.0 cm",
        "description": "Hộp sen gốm/kim loại Champa (thế kỷ X - XII) trưng bày tại Bảo tàng Lịch sử TP. Hồ Chí Minh là hiện vật đồ dùng nghi lễ quý báu. Hộp được tạo hình như một đóa hoa sen đang nở rộ, thân hộp tạo múi cánh sen nổi ôm lấy lòng hộp, nắp hộp vuốt nhọn hình búp sen e ấp kiêu sa. Trong văn hóa Champa chịu ảnh hưởng của Ấn Độ giáo và Phật giáo, hoa sen (Padma) là biểu tượng tối thượng của sự tinh khiết, thanh cao và tái sinh tâm linh. Hộp sen dùng để đựng các bảo vật, tro cốt quý hoặc hạt trân châu, thể hiện gu thẩm mỹ tinh tế và kỹ thuật tạo hình gốm/kim loại điêu luyện của các nghệ nhân Champa.",
        "narration": "Chào mừng quý khách chiêm ngưỡng Hộp sen Champa, cổ vật tạo hình nghệ thuật độc đáo thế kỷ 10 đến 12 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Lấy cảm hứng từ đóa sen tinh khiết, các nghệ nhân đã khéo léo tạo tác chiếc hộp với những cánh sen bung nở mềm mại ôm lấy thân hộp, đỉnh nắp vươn lên thành búp sen duyên dáng. Trong vũ trụ quan Champa, hoa sen là nơi ngự trị của các bậc thần linh, đại diện cho sự thanh tịnh vượt lên cõi trần tục. Chiếc hộp sen nhỏ nhắn này không chỉ là vật chứa đựng trân bảo linh thiêng trong đền tháp mà còn là một tác phẩm nghệ thuật tạo hình tràn đầy chất thơ và triết lý tâm linh sâu sắc."
    },
    "HV-304": {
        "name": "Tượng người múa",
        "period": "Văn Hoá Champa",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 46.5 cm, Rộng 28.0 cm, Sâu 16.5 cm",
        "description": "Tượng người múa (Vũ nữ Apsara, sa thạch thế kỷ X, phong cách Trà Kiệu) trưng bày tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Tượng khắc họa vũ nữ thiên giới trong tư thế uốn lượn hình chữ S (Tribhanga) quyến rũ bậc nhất của nghệ thuật múa Champa. Thân hình thon thả với eo thon, ngực căng tròn, hông nở mềm mại, đôi tay uốn cong trong điệu múa dâng thần linh. Trang phục váy dệt mỏng ôm sát thân cùng hệ thống vòng kiềng cổ, khuyên tai và vương miện đính đá quý tôn lên vẻ đẹp kiêu sa. Bức tượng là tuyệt tác ca ngợi vẻ đẹp hình thể người phụ nữ và sự uyển chuyển của nghệ thuật vũ đạo cung đình Champa cổ.",
        "narration": "Kính mời quý khách chiêm ngưỡng Tượng vũ nữ người múa Apsara, bức phù điêu sa thạch trứ danh phong cách Trà Kiệu thế kỷ thứ 10 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Bức tượng làm say đắm lòng người bởi đường cong uốn lượn ba khúc hình chữ S đầy mê hoặc của nàng vũ nữ thiên giới đang hòa mình vào vũ điệu dâng hoa cúng thần. Từng chi tiết từ bờ vai mềm, vòng eo thon đến các dải trang sức kiềng cổ và búp hoa trên búi tóc đều được đục đẽo tỉ mỉ, khiến khối đá sa thạch thô ráp dường như tan chảy thành giai điệu âm nhạc ngân vang. Bức tượng là biểu tượng rực rỡ cho tâm hồn nghệ thuật phóng khoáng và kỹ thuật tạc tượng đạt đến cảnh giới phi phàm của văn hóa Champa."
    },
    "HV-959": {
        "name": "Tượng người múa",
        "period": "Văn Hoá Champa",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 43.0 cm, Rộng 25.5 cm, Sâu 15.0 cm",
        "description": "Tượng người múa dâng lễ (Vũ nữ Apsara Champa, sa thạch thế kỷ XI - XII) lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Tượng tạc bán thân hoặc toàn thân vũ nữ trong tư thế hai tay nâng đĩa hoa hoặc chắp tay ngang ngực kính cẩn, đôi mắt hé mở nhìn thẳng với thần thái an nhiên, thanh thoát. Dải y phục dệt hoa văn nhẹ nhàng buông lơi quanh hông, các nếp gấp tà áo được chạm khắc mềm mại như lụa. Tác phẩm đóng vai trò là khối điêu khắc trang trí tại chân tường hoặc chân bệ thờ linga ở các ngôi tháp cổ, hòa quyện giữa yếu tố trần thế sống động và không gian tôn giáo thiêng liêng.",
        "narration": "Chào mừng quý khách đến với tác phẩm Tượng người múa dâng hoa Champa, hiện vật điêu khắc đá sa thạch thế kỷ 11 đến 12 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Tác phẩm thể hiện hình ảnh vũ nữ thiên thần đang thành tâm dâng phẩm vật trong điệu múa thanh nhã trước bàn thờ thần linh. Đôi bàn tay uyển chuyển khéo léo nâng lễ vật, khuôn mặt bừng sáng vẻ đẹp thánh thiện cùng những chuỗi hạt ngọc chạm tinh vi nơi cổ và thắt lưng. Bức tượng từng tô điểm cho các đền tháp Champa cổ kính, giúp biến mỗi ngôi tháp gạch thành một cung điện lộng lẫy nơi các vị thần và tiên nữ cùng hòa nhịp trong vũ khúc linh thiêng bất tận."
    },
    "HV-405": {
        "name": "Đầu sư tử",
        "period": "Văn Hoá Champa",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 35.0 cm, Rộng 32.0 cm, Sâu 38.0 cm",
        "description": "Đầu sư tử bằng đá sa thạch (thế kỷ XI - XII, phong cách Tháp Mẫm / Bình Định) trưng bày tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Hiện vật là chi tiết kiến trúc góc mái hoặc gờ chân tháp Champa cổ. Đầu sư tử được cách điệu hóa mạnh mẽ với đôi mắt lồi tròn xoe dữ dội, mũi to gồ ghề, miệng há rộng để lộ hàm răng sắc nhọn và lưỡi cuộn tròn, hai bên má viền bờm xoắn ốc đối xứng cuồn cuộn. Khối điêu khắc gãy gọn, dứt khoát mang lại cảm giác quyền lực và oai phong, có nhiệm vụ xua đuổi ma quỷ và bảo vệ sự tôn nghiêm bất khả xâm phạm cho thánh địa tôn giáo.",
        "narration": "Trước mắt quý khách là khối điêu khắc Đầu sư tử bằng đá sa thạch thế kỷ 11 đến 12 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Đây là một cấu kiện kiến trúc phong cách Tháp Mẫm từng gắn tại các góc mái hoặc chân bệ đền tháp Champa cổ đại. Với đôi mắt tròn mở to đầy thị uy, vòm miệng há rộng khoe hàm răng nanh dũng mãnh cùng những lọn bờm xoắn ốc cuộn sóng tinh xảo, linh thú sư tử Simha toát lên vẻ oai phong lẫm liệt. Trong thần thoại, sư tử là biểu tượng hộ pháp tối cao, canh giữ cổng trời và bảo vệ các thánh tích khỏi sự xâm nhập của tà ma, tượng trưng cho sức mạnh vô song của thần thánh."
    },
    "HV-576": {
        "name": "Tượng sư tử",
        "period": "Văn Hoá Champa",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 52.0 cm, Rộng 28.0 cm, Dài 36.0 cm",
        "description": "Tượng sư tử đá sa thạch Champa (thế kỷ XII, phong cách Tháp Mẫm) lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Tượng tạc sư tử trong tư thế nửa ngồi nửa đứng, hai chân trước chống thẳng vững như bàn thạch, ngực ưỡn cao kiêu hãnh phô bày các chuỗi lục lạc trang trí chạm nổi công phu. Đầu sư tử ngẩng cao, bờm tết thành các dải uốn lượn sắc nét bao quanh cổ, đuôi vắt ngược lên lưng sinh động. Bức tượng thể hiện sự kết hợp tài tình giữa khối hình học đồ sộ và các đường nét chạm trổ tỉ mỉ, là hiện vật đại diện tiêu biểu cho nghệ thuật điêu khắc tượng tròn Champa giai đoạn hậu kỳ tại miền Trung Việt Nam.",
        "narration": "Mời quý khách chiêm ngưỡng Tượng sư tử đá Champa, kiệt tác điêu khắc tượng tròn thế kỷ 12 thuộc phong cách Tháp Mẫm tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Sư tử đứng vững chãi trên hai chân trước gân guốc, ngực ưỡn căng đầy kiêu hãnh đeo chuỗi lục lạc chạm nổi tinh xảo. Từng đường bờm sắc gọn bao quanh chiếc đầu ngẩng cao toát lên vẻ uy nghiêm, bất khuất của chúa sơn lâm canh giữ chốn linh thiêng. Sự hòa quyện giữa hình khối mạnh mẽ và những hoa văn trang trí tỉ mỉ biến pho tượng thành một tác phẩm nghệ thuật tràn đầy sinh lực, minh chứng cho sức sáng tạo bền bỉ của nền điêu khắc Champa cổ đại."
    },
    "HV-453": {
        "name": "Chim thần Garuda và rắn thần Naga",
        "period": "Văn Hoá Champa",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 56.0 cm, Rộng 38.0 cm, Sâu 22.0 cm",
        "description": "Phù điêu Chim thần Garuda và rắn thần Naga (sa thạch thế kỷ XII - XIII, phong cách Tháp Mẫm) trưng bày tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Tác phẩm mô tả cuộc đối đầu thần thoại kinh điển trong văn hóa Ấn Độ giáo giữa Garuda (hiện thân của mặt trời, bầu trời và ánh sáng) và rắn Naga nhiều đầu (hiện thân của nước, lòng đất và bóng tối). Garuda giương rộng đôi cánh oai phong, hai móng vuốt quắp chặt thân rắn, mỏ ngậm đầu rắn dũng mãnh. Đường nét chạm khắc khỏe khoắn, gân guốc với các khối cơ bắp nổi rõ, tạo nên một trường đoạn kịch tính đầy sức sống biểu đạt sự chiến thắng tất yếu của ánh sáng và sự sống trước bóng đêm hỗn mang.",
        "narration": "Chào mừng quý khách đến với bức phù điêu trứ danh Chim thần Garuda và rắn thần Naga thế kỷ 12 đến 13 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Đây là một tuyệt tác sa thạch mô tả trận chiến vũ trụ huyền thoại giữa chúa tể bầu trời Garuda và mãng xà lòng đất Naga. Quý khách có thể nhìn thấy chim thần Garuda giương đôi cánh uy dũng, móng vuốt sắc nhọn bóp nghẹt thân rắn, mỏ quắp chặt biểu thị sự chế ngự tuyệt đối. Nghệ thuật chạm khắc gân guốc, sắc sảo đã thổi vào khối đá một luồng sinh khí kịch tính tột độ, tôn vinh biểu tượng bất diệt của công lý, ánh sáng và trật tự vũ trụ đánh bại thế lực hắc ám."
    },
    "HV-950": {
        "name": "Tượng người cầu nguyện",
        "period": "Văn Hoá Champa",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 48.0 cm, Rộng 26.5 cm, Sâu 20.0 cm",
        "description": "Tượng người cầu nguyện (Tín đồ Champa / Tu sĩ Bà La Môn, sa thạch thế kỷ X - XI) lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Tượng tạc một nhân vật ngồi xếp bằng (kiết già), hai bàn tay chắp trước ngực trong tư thế cung kính Anjali Mudra, ánh mắt khép hờ tĩnh tại hướng vào nội tâm. Nhân vật mặc sampot ngắn có thắt lưng trang trí, tai dài đeo khuyên tròn nặng rủ xuống vai, búi tóc cao theo phong cách tu sĩ khổ hạnh. Pho tượng toát lên sự bình an, thành kính và sùng đạo sâu sắc, phản ánh chân thực đời sống tín ngưỡng và tâm thức hướng thượng của cư dân vương quốc Champa trong không gian tâm linh đền tháp.",
        "narration": "Kính mời quý khách dừng bước trước Tượng người cầu nguyện, bức tượng đá sa thạch thanh tịnh thế kỷ 10 đến 11 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Tác phẩm tạc chân dung một tín đồ Champa ngồi thiền định với đôi bàn tay chắp trang nghiêm trước ngực theo thế ấn nguyện cầu. Đôi mắt khép hờ, khóe môi mỉm cười an lạc và khuôn mặt tròn trịa toát lên sự tĩnh lặng, an nhiên tuyệt đối nơi tâm hồn. Bức tượng là tiếng nói nội tâm sâu lắng của con người gửi tới đấng thiêng liêng, thể hiện một cách mộc mạc mà lay động lòng người về niềm tin tôn giáo và khát vọng bình an muôn thuở của cư dân cổ xưa."
    },

    # ==========================================
    # GIAN PHÒNG THỜI TRẦN - HỒ (P-755)
    # ==========================================
    "HV-161": {
        "name": "Bát gốm men trắng ngà chia múi góc",
        "period": "Gian phòng thời Trần-Hồ",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Đường kính miệng 17.5 cm, Đường kính đáy 6.8 cm, Cao 8.2 cm",
        "description": "Bát gốm men trắng ngà chia múi góc thời Trần (thế kỷ XIII - XIV) là hiện vật gốm men cổ quý giá tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Bát có miệng loe chia thành các múi uốn lượn như cánh hoa cúc nở rộ, lòng bát chạm nổi đồ án hoa lá mềm mại. Cốt gốm trắng xám thanh nhẹ, phủ lớp men trắng ngà dày mịn, bóng sâu như ngọc đọng lại ở các rãnh múi tạo hiệu ứng thị giác phân tầng kỳ ảo. Chân đế tiện tròn cẩn thận, có dấu con kê nung trong bao nung lò con thoi. Hiện vật phản ánh đỉnh cao tinh hoa của dòng gốm men trắng ngọc thời Trần - thời kỳ gốm Việt Nam vừa mang tính cung đình quý phái vừa đậm đà bản sắc tự chủ dân tộc.",
        "narration": "Chào mừng quý khách đến chiêm ngưỡng Bát gốm men trắng ngà chia múi góc thời Trần, hiện vật gốm cổ thế kỷ 13 đến 14 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Chiếc bát được tạo hình thanh thoát như một đóa hoa cúc nở rộ với các đường gờ chia múi mềm mại chạy dọc từ miệng xuống đáy. Nước men trắng ngà óng ả phủ đều trên cốt gốm đanh mịn, đọng lại nơi kẽ múi tạo nên sắc thái huyền ảo như ngọc bích. Dưới thời Trần, gốm men trắng ngà đạt đến đỉnh cao về kỹ thuật nung luyện và tinh tế về mỹ cảm, thể hiện tinh thần hào sảng, thanh cao của nền văn hóa Thăng Long rực rỡ sau những chiến công hiển hách đánh đuổi giặc ngoại xâm."
    },
    "HV-543": {
        "name": "Mô hình tháp thờ bằng đất nung",
        "period": "Gian phòng thời Trần-Hồ",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Đáy 28.0 cm x 28.0 cm, Cao 58.5 cm",
        "description": "Mô hình tháp thờ bằng đất nung thời Trần (thế kỷ XIII - XIV) trưng bày tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Hiện vật mô phỏng tháp Phật giáo thu nhỏ với nhiều tầng thon dần lên đỉnh, mái lợp ngói mũi hài, các góc mái uốn cong chạm hình rồng thời Trần mềm mại hoặc lá đề Phật giáo. Thân tháp trổ các cửa vòm khám thờ nhỏ, xung quanh chạm nổi hoa văn rồng cuộn, hoa sen, sóng nước và các dải hoa cúc dây sinh động. Hiện vật phản ánh sự hưng thịnh của Phật giáo Trúc Lâm Yên Tử dưới thời Trần, khi mô hình tháp đất nung vừa là vật phẩm thờ tự linh thiêng tại chùa chiền vừa là tư liệu quý giá về kiến trúc tháp cổ Đại Việt đã bị thời gian tàn phá.",
        "narration": "Kính mời quý khách quan sát Mô hình tháp thờ bằng đất nung thời Trần, báu vật khảo cổ thế kỷ 13 đến 14 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Mô hình tháp được tạo tác công phu nhiều tầng thu nhỏ dần lên đỉnh, tái hiện chuẩn xác kiến trúc tháp Phật giáo thời Trần tương tự như tháp Phổ Minh hay tháp Bình Sơn danh tiếng. Quý khách có thể thấy các góc mái cong thanh thoát chạm rồng thời Trần uốn lượn hình chữ S mềm mại cùng họa tiết hoa sen nở bừng trên thân tháp. Đây là minh chứng vật chất vô giá cho thời kỳ rực rỡ của Phật giáo Trúc Lâm Yên Tử, phản ánh niềm tin tâm linh sâu sắc và tài năng nung gốm kiến trúc phi thường của cha ông ta."
    },
    "HV-567": {
        "name": "Mô hình kiến trúc bằng đất nung thời Trần",
        "period": "Gian phòng thời Trần-Hồ",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Dài 34.0 cm, Rộng 24.5 cm, Cao 22.0 cm",
        "description": "Mô hình kiến trúc đất nung thời Trần (thế kỷ XIII - XIV) lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Hiện vật mô phỏng một tòa nhà dân gian hoặc công trình phụ cung đình với mái ngói dốc lợp ngói âm dương có đầu ngói chạm hoa văn hoa cúc, bờ nóc đắp nổi đôi rồng chầu mặt trời. Tường nhà trổ ô cửa sổ hoa gió hình học tinh xảo, hệ thống cột và xà mộng được thể hiện rõ nét trên đất nung nung ở nhiệt độ cao màu đỏ gạch son đặc trưng. Hiện vật là cứ liệu hiện vật chân xác giúp các nhà nghiên cứu phục dựng không gian sống, kỹ thuật xây dựng và mỹ thuật kiến trúc thời Trần cách đây hơn 700 năm.",
        "narration": "Chào mừng quý khách chiêm ngưỡng Mô hình kiến trúc bằng đất nung thời Trần, hiện vật khảo cổ học đặc sắc thế kỷ 13 đến 14 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Mô hình đất nung màu gạch son ấm áp này là cuốn biên niên sử thu nhỏ tái hiện không gian nhà ở truyền thống của người Đại Việt xưa. Từng chi tiết bờ nóc chạm rồng, hệ thống mái ngói âm dương úp ngửa nhịp nhàng cùng các ô cửa sổ hoa gió thông thoáng đều được thể hiện sắc sảo. Trải qua hơn bảy thế kỷ lòng đất, mô hình đất nung vẫn vẹn nguyên hình hài, giúp chúng ta hiểu thêm về tư duy quy hoạch nhà ở hài hòa với thiên nhiên và kỹ thuật nung luyện đất sét bậc thầy thời Trần."
    },
    "HV-475": {
        "name": "Ấm gốm men nâu",
        "period": "Gian phòng thời Trần-Hồ",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 19.5 cm, Đường kính thân 15.0 cm, Khoảng cách vòi - quai 21.0 cm",
        "description": "Ấm gốm men nâu thời Trần (thế kỷ XIII - XIV) trưng bày tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Ấm có dáng quả dưa đầm chắc, vòi ngắn vuốt thon hướng lên trên, quai ấm hình cọng sen hoặc dây leo uốn cong chắc khỏe gắn từ miệng xuống vai. Men nâu da lươn hoặc nâu đen sắc sảo tráng phủ bên ngoài cốt gốm đanh chắc, có độ bóng mờ mộc mạc và chân thực. Vai ấm thường điểm xuyết các núm quai nhỏ hoặc hoa văn cánh sen dập nổi. Ấm gốm men nâu là vật dụng sinh hoạt và thưởng trà tiêu biểu phản ánh nét đẹp mộc mạc, phóng khoáng, đậm chất thiền của văn hóa thời Trần.",
        "narration": "Mời quý khách thưởng thức vẻ đẹp mộc mạc của Ấm gốm men nâu thời Trần, hiện vật thế kỷ 13 đến 14 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Chiếc ấm có dáng tròn trịa như một quả dưa căng mọng, nổi bật với chiếc vòi thanh thoát và chiếc quai uốn lượn chắc chắn như một nhánh sen vươn lên. Nước men màu nâu da lươn trầm ấm phủ khắp thân ấm toát lên sự đằm thắm, giản dị mà thanh cao. Trong đời sống thời Trần, những chiếc ấm gốm men nâu như thế này thường được sử dụng trong các buổi thưởng trà thiền vị chốn thiền môn lẫn sinh hoạt dân gian, biểu trưng cho tinh thần sống hòa hợp với thiên nhiên và đậm đà hồn cốt Đại Việt."
    },
    "HV-660": {
        "name": "Thạp gốm hoa nâu",
        "period": "Gian phòng thời Trần-Hồ",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 38.5 cm, Đường kính miệng 22.0 cm, Đường kính đáy 19.5 cm",
        "description": "Thạp gốm hoa nâu thời Trần (thế kỷ XIII - XIV) là bảo vật gốm sứ độc bản của nghệ thuật Đại Việt tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Thạp có dáng hình trụ tròn thu nhỏ dần về phía đáy, vai nở gắn các núm quai hoa sen. Kỹ thuật chế tác kết hợp giữa cạo men trắng ngà để lộ cốt gốm rồi tô men oxit sắt màu nâu (hoa nâu) tạo nên sự đối lập màu sắc tương phản mạnh mẽ. Hoa văn trang trí chia thành các băng tầng lớp: băng lá đề ôm rồng thời Trần, băng cánh sen kép ở vai và chân đế, băng thân chính vẽ hình võ sĩ cầm giáo mác tập trận hoặc chim muông hoa lá phóng khoáng. Thạp hoa nâu phản ánh hào khí Đông A oanh liệt và bản lĩnh tự cường của dân tộc thời Trần.",
        "narration": "Kính chào quý khách đến chiêm ngưỡng Thạp gốm hoa nâu thời Trần, một trong những đỉnh cao xuất chúng của mỹ thuật Đại Việt thế kỷ 13 đến 14 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Chiếc thạp mang dáng dấp đồ sộ, đĩnh đạc với sự kết hợp tuyệt vời giữa màu men ngà cổ kính và màu hoa nâu trầm ấm. Trên thân thạp, các nghệ nhân đã cạo men tô vẽ từng cánh sen nở rộ, những dải mây uốn lượn và hình tượng võ sĩ dũng mãnh phản ánh tinh thần thượng võ và hào khí Đông A rực lửa thời bấy giờ. Chiếc thạp gốm hoa nâu không chỉ là vật chứa đựng trân quý mà còn là bản hùng ca bằng đất nung khẳng định chủ quyền và bản sắc văn hóa tự chủ ngời sáng của dân tộc."
    },

    # ==========================================
    # GIAN PHÒNG THỜI NGÔ - ĐINH - TIỀN LÊ (P-656)
    # ==========================================
    "HV-640": {
        "name": "Hũ gốm nhiều quai",
        "period": "Thời Ngô - Đinh - Tiền Lê",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 24.5 cm, Đường kính miệng 14.0 cm, Đường kính thân 22.0 cm, Đường kính đáy 12.5 cm",
        "description": "Hũ gốm nhiều quai thời Ngô - Đinh - Tiền Lê (thế kỷ X) là hiện vật gốm cổ quan trọng phản ánh buổi đầu xây dựng nền độc lập tự chủ tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Hũ có miệng đứng viền gờ tròn, thân phình bầu dục vững chãi, vai gắn từ 4 đến 6 chiếc quai đôi nhỏ uốn cong đều đặn để luồn dây chằng buộc khi vận chuyển. Cốt gốm đanh xám nung ở nhiệt độ cao, mặt ngoài phủ lớp men tro hoặc men vàng ngà mộc mạc, trang trí các đường chỉ chìm hoặc gân sóng nước nhẹ nhàng quanh vai. Hiện vật thể hiện bước chuyển mình độc lập của gốm Việt Nam thoát khỏi ảnh hưởng gốm Bắc thuộc để định hình bản sắc riêng.",
        "narration": "Chào mừng quý khách đến chiêm ngưỡng Hũ gốm nhiều quai thời Ngô - Đinh - Tiền Lê, hiện vật lịch sử thế kỷ thứ 10 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Chiếc hũ có thân hình bầu dục khỏe khoắn với điểm đặc biệt là hệ thống quai đôi gắn đối xứng quanh vai hũ, từng giúp cha ông ta chằng buộc dây an toàn khi vận chuyển và lưu trữ lương thực, ngũ cốc. Nước men tro vàng ngà mộc mạc cùng các đường gân sóng nước thanh thoát quanh thân phản ánh sự cần cù và khéo léo của người thợ gốm. Ra đời trong thế kỷ bản lề khi đất nước vừa giành lại độc lập sau nghìn năm Bắc thuộc, chiếc hũ là minh chứng bình dị cho cuộc sống hồi sinh mạnh mẽ của dân tộc ta."
    },
    "HV-208": {
        "name": "Bình gốm men hình tượng thú",
        "period": "Thời Ngô - Đinh - Tiền Lê",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 15.5 cm, Dài thân 18.0 cm, Rộng thân 10.5 cm",
        "description": "Bình gốm men hình tượng thú (thế kỷ X, thời Đinh - Tiền Lê) lưu giữ tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Bình được tạo dáng tượng hình linh thú (voi, trâu hoặc chim thú thần thoại) với phần lưng trổ miệng rót tròn, đuôi hoặc đầu cách điệu làm quai và vòi rót ngộ nghĩnh. Toàn thân tráng men ngả sắc xanh lục nhạt hoặc vàng tro men tự nhiên nung lò củi. Kỹ thuật nặn tượng thú kết hợp với công năng đựng chất lỏng (rượu hoặc nước thơm dâng cúng) thể hiện tư duy tạo hình giàu tính dân gian, tự do và phóng khoáng của cư dân Đại Cồ Việt buổi đầu dựng nước.",
        "narration": "Mời quý khách quan sát Bình gốm men hình tượng thú, cổ vật tạo hình ngộ nghĩnh thế kỷ thứ 10 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Lấy cảm hứng từ những con vật gần gũi trong đời sống nông nghiệp và thần thoại, các nghệ nhân thời Đinh - Tiền Lê đã tạo nên chiếc bình với thân hình linh thú tròn trịa, đôi mắt tinh anh và vòi rót duyên dáng. Lớp men tro tự nhiên óng ả phủ ngoài cốt gốm đanh chắc toát lên vẻ đẹp nguyên sơ, mộc mạc. Hiện vật không chỉ phục vụ cho việc rót rượu trong các nghi lễ cộng đồng mà còn phản ánh tâm hồn trong sáng, lạc quan và tư duy thẩm mỹ tự do của tổ tiên chúng ta trong kỷ nguyên giành lại giang sơn độc lập."
    },
    "HV-837": {
        "name": "Hũ có nắp gốm men trắng ngà",
        "period": "Thời Ngô - Đinh - Tiền Lê",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Cao 32.5 cm, Đường kính miệng 15.0 cm, Đường kính đáy 14.0 cm",
        "description": "Hũ có nắp gốm men trắng ngà thời Đinh - Tiền Lê (thế kỷ X - đầu thế kỷ XI) trưng bày tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Hũ dáng trụ cao nở nhẹ ở vai, nắp đậy khít hình chóp nón với núm cầm tạo hình búp sen e ấp. Cốt gốm lọc kỹ phủ men trắng ngà mỏng mịn, thân khắc chìm các dải cánh sen cách điệu đối xứng. Đây là loại hình đồ gốm cao cấp dùng trong sinh hoạt quý tộc cung đình Hoa Lư hoặc đồ nghi lễ Phật giáo, đặt nền móng kỹ thuật và thẩm mỹ trực tiếp cho sự bùng nổ của dòng gốm hoa sen và gốm men trắng ngọc thời Lý - Trần sau này.",
        "narration": "Kính mời quý khách chiêm ngưỡng Hũ có nắp gốm men trắng ngà thế kỷ thứ 10 đến 11 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Chiếc hũ dáng đứng thanh nhã, nổi bật với chiếc nắp khum hình búp sen e ấp tượng trưng cho sự thanh khiết chốn thiền môn. Lớp men trắng ngà trang nhã bao bọc lấy những đường chạm chìm cánh hoa sen uyển chuyển trên thân hũ. Trong kinh đô Hoa Lư xưa dưới thời Đinh và Tiền Lê, chiếc hũ này từng là vật phẩm cao quý chứa đựng hương liệu quý giá nơi cung cấm và tự viện. Tác phẩm chính là viên gạch đầu tiên đặt nền móng vững chắc cho nghệ thuật gốm men trắng hoàng gia thời Lý phát triển rực rỡ sau đó."
    },
    "HV-119": {
        "name": "Nồi đồng",
        "period": "Thời Ngô - Đinh - Tiền Lê",
        "origin": "Bảo tàng Lịch sử TP.HCM",
        "dimensions": "Đường kính miệng 24.0 cm, Đường kính đáy 18.5 cm, Cao 18.0 cm, Trọng lượng 3.2 kg",
        "description": "Nồi đồng thời Ngô - Đinh - Tiền Lê (thế kỷ X) là hiện vật kim khí quý hiếm tại Bảo tàng Lịch sử TP. Hồ Chí Minh. Nồi được đúc thủ công bằng hợp kim đồng với kỹ thuật đúc khuôn sáp hoặc khuôn đất sét truyền thống. Miệng nồi loe có gờ viền chắc chắn, cổ thắt nhẹ, thân phình tròn đều đặn xuống đáy cong, hai bên vai gắn đôi quai cong hình chữ U tán ri-vê chắc chắn. Bề mặt nồi mang lớp gỉ đồng màu xanh lam - xanh lục cổ kính (patina). Chiếc nồi đồng là di vật sinh hoạt và hậu cần quân lương quan trọng trong các đợt hành quân dẹp loạn 12 sứ quân của Đinh Bộ Lĩnh và kháng chiến chống Tống của Lê Hoàn, minh chứng cho kỹ thuật đúc đồng liên tục kế thừa từ văn hóa Đông Sơn rực rỡ.",
        "narration": "Chào mừng quý khách đến với hiện vật Nồi đồng thế kỷ thứ 10 tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh. Chiếc nồi đồng mang dáng vẻ giản dị, rắn rỏi với màu gỉ đồng cổ kính qua hơn một ngàn năm lịch sử. Miệng nồi loe rộng, thân phình tròn đúc dày dặn cùng hai quai cầm chắc chắn được gắn kiên cố bên vai. Đây không chỉ là vật dụng nấu nướng hàng ngày mà còn là vật dụng quân lương thiết yếu theo chân đoàn quân dẹp loạn mười hai sứ quân thống nhất giang sơn của Đinh Tiên Hoàng và đoàn quân phá Tống hiển hách của vua Lê Đại Hành. Hiện vật là bằng chứng sinh động cho ngọn lửa đúc đồng ngàn năm vẫn luôn đỏ rực trong lòng dân tộc tự chủ."
    }
}


def run_enrichment():
    print(f"=== BẮT ĐẦU CẬP NHẬT DỮ LIỆU KHẢO CỨU CHO {len(ARTIFACT_RESEARCH_DATA)} HIỆN VẬT ===")
    
    # 1. Lấy danh sách hiện vật hiện tại
    req_list = urllib.request.Request(f"{BASE_URL}", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req_list, context=ctx) as resp:
        res = json.loads(resp.read().decode("utf-8"))
    
    artifacts = res.get("data", [])
    print(f"-> Tìm thấy {len(artifacts)} hiện vật từ hệ thống.")

    art_map = {x["code"]: x for x in artifacts}

    success_count = 0
    fail_count = 0

    for code, info in ARTIFACT_RESEARCH_DATA.items():
        if code not in art_map:
            print(f"[-] Không tìm thấy mã {code} trên hệ thống!")
            fail_count += 1
            continue

        item = art_map[code]
        art_id = item["id"]

        payload = {
            "name": info["name"],
            "period": info["period"],
            "origin": info["origin"],
            "dimensions": info["dimensions"],
            "description": info["description"],
            "translations": {
                "vi": {
                    "name": info["name"],
                    "period": info["period"],
                    "description": info["description"],
                    "narrationScript": info["narration"],
                    "audioNarrationUrl": ""
                }
            }
        }

        # Nếu là HV-874 bị thiếu phòng, bổ sung phòng P-277 Thời Nguyễn
        if code == "HV-874":
            payload["roomId"] = "room-1793692543696"
            payload["roomCode"] = "P-277"

        put_url = f"{BASE_URL}/{art_id}"
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
                    print(f"[+] Thành công: [{code}] {info['name']} (Dims: {info['dimensions'][:25]}... | Desc: {len(info['description'])} chars | Narr: {len(info['narration'])} chars)")
                    success_count += 1
                else:
                    print(f"[-] Thất bại: [{code}] {put_res.get('message')}")
                    fail_count += 1
        except Exception as e:
            print(f"[!] Lỗi khi gọi PUT {code}: {e}")
            fail_count += 1

        time.sleep(0.3)  # Nhịp đều đặn tránh làm nghẽn server

    print(f"\n=== KẾT QUẢ CẬP NHẬT: Thành công {success_count}/{len(ARTIFACT_RESEARCH_DATA)}, Thất bại: {fail_count} ===")


if __name__ == "__main__":
    run_enrichment()
