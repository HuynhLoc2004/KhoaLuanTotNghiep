# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÁC PHƯƠNG PHÁP TIẾP CẬN KỸ THUẬT

Chương này trình bày toàn bộ cơ sở lý thuyết toán học, các thuật toán xử lý thị giác máy tính và ngăn xếp công nghệ nền tảng được nghiên cứu và ứng dụng trong đề tài. Nội dung tập trung vào hai bài toán kỹ thuật cốt lõi: phương pháp tạo lập không gian toàn cảnh thực tế ảo 360 độ từ dữ liệu video thông thường và phương pháp số hóa mô hình cổ vật ba chiều (3D) từ dữ liệu hình ảnh thực tế tại bảo tàng.

---

## 2.1. Tổng quan về công nghệ không gian thực tế ảo 360° và mô hình hóa 3D

### 2.1.1. Nguyên lý biểu diễn không gian toàn cảnh Equirectangular Projection
Không gian thực tế ảo 360 độ (Virtual Tour 360°) cho phép người xem quan sát toàn bộ môi trường xung quanh từ một điểm nhìn cố định theo góc nhìn hình cầu toàn diện: $360^\circ$ theo phương ngang (kinh độ) và $180^\circ$ theo phương đứng (vĩ độ) [1].

Để lưu trữ và xử lý một quả cầu không gian ba chiều dưới dạng tệp ảnh số hai chiều thông dụng (JPEG hoặc PNG), kỹ thuật đồ họa sử dụng phép chiếu hình học chữ nhật tương đương (Equirectangular Projection) [1]:
- **Tỷ lệ chuẩn:** Ảnh toàn cảnh Equirectangular luôn có tỷ lệ khung hình cố định là $2:1$ (chiều rộng gấp đúng 2 lần chiều cao, ví dụ: $4096 \times 2048$ điểm ảnh hoặc $2048 \times 1024$ điểm ảnh).
- **Mối quan hệ tọa độ:** Mọi điểm trên mặt cầu được xác định bởi hai góc cầu: góc kinh độ $\theta \in [-\pi, \pi]$ (hướng xoay ngang từ $-180^\circ$ đến $+180^\circ$) và góc vĩ độ $\phi \in [-\frac{\pi}{2}, \frac{\pi}{2}]$ (hướng nhìn từ cực Nam $-90^\circ$ dưới chân lên cực Bắc $+90^\circ$ đỉnh đầu). Phép biến đổi chuyển từ tọa độ cầu $(\theta, \phi)$ sang tọa độ điểm ảnh $(x, y)$ trên bức ảnh có kích thước $W \times H$ được biểu diễn qua công thức toán học [1]:
  $$x = \left(\frac{\theta + \pi}{2\pi}\right) \cdot W$$
  $$y = \left(\frac{\frac{\pi}{2} - \phi}{\pi}\right) \cdot H$$

Trong đó:
- Trục ngang $x$ trải dài tương ứng với toàn bộ $360^\circ$ góc quay vòng quanh phòng. Khi người xem xoay hết cạnh phải của ảnh ($x = W$), màn hình sẽ tự động nối mượt sang cạnh trái ($x = 0$) tạo thành một chu trình khép kín liên tục.
- Trục dọc $y$ biểu diễn góc nhìn từ sàn nhà lên trần nhà. Khu vực đường xích đạo ($y = H/2$) bảo toàn tỷ lệ hình học chuẩn xác nhất; trong khi hai khu vực đỉnh đầu (Zenith - cực Bắc) và đáy sàn (Nadir - cực Nam) bị kéo giãn ngang cực đại. Khi đưa vào môi trường không gian 3D của trình duyệt, bức ảnh chữ nhật này được dán ngược trở lại mặt trong của một khối cầu rỗng, giúp người xem có cảm giác như đang đứng tại tâm gian phòng và quan sát bốn bề không gian chân thực.

### 2.1.2. Khảo sát và so sánh các phương pháp tạo không gian toàn cảnh 360° hiện nay
Để tái tạo không gian phòng trưng bày của bảo tàng thành các chuyến tham quan ảo 360 độ, trong thực tế hiện nay tồn tại 3 hướng tiếp cận chính:

*Bảng 2.1: Bảng so sánh toàn diện các phương pháp tạo lập không gian toàn cảnh 360°*

| Tiêu chí kỹ thuật | Phương pháp 1: Thuê thiết bị quét chuyên dụng (Matterport / Laser LiDAR) | Phương pháp 2: Chụp bằng máy ảnh 360° chuyên dụng (Insta360 / Ricoh Theta) | Phương pháp 3: Ghép tự động từ video điện thoại thông thường (Giải pháp của đề tài) |
|:---|:---|:---|:---|
| **Thiết bị yêu cầu** | Máy quét chuyên dụng đắt tiền (từ 80 đến trên 150 triệu đồng). | Máy ảnh 360 có 2 ống kính mắt cá đối lưng (từ 10 đến 25 triệu đồng). | Điện thoại thông minh thông thường có sẵn camera (sử dụng chế độ góc rộng 0.5x). |
| **Chi phí đầu tư** | Rất cao, phụ thuộc kinh phí thuê đơn vị dịch vụ bên ngoài thực hiện. | Trung bình, bảo tàng phải cấp ngân sách mua sắm trang thiết bị riêng. | **0 đồng**, tận dụng ngay thiết bị di động cá nhân của cán bộ, sinh viên. |
| **Thời gian thu thập** | 45 – 60 phút cho một gian phòng lớn, yêu cầu đặt chân máy cân bằng nhiều vị trí. | 1 – 2 phút chụp nhanh tại tâm phòng. | 1 – 2 phút cầm tay lia máy quay chậm vòng tròn 360 độ tại tâm phòng. |
| **Cơ chế xử lý** | Đẩy dữ liệu lên nền tảng đám mây đóng của nhà cung cấp (Matterport Cloud) để dựng tự động. | Bộ vi xử lý bên trong máy ảnh tự động khâu 2 nửa bán cầu thành ảnh Equirectangular. | Máy chủ nội bộ (`stitching_worker`) tự động trích xuất khung hình, nắn phẳng, so khớp SIFT và hòa trộn mí nối. |
| **Tính tự chủ dữ liệu** | **Bị phụ thuộc hoàn toàn:** Phải trả phí duy trì lưu trữ hàng tháng (tính theo số không gian); không tự chủ cập nhật khi bảo tàng đổi hiện vật. | Chủ động lưu trữ ảnh gốc, nhưng góc nhìn tĩnh, độ phân giải cảm biến nhỏ dễ bị hạt nhiễu (noise) trong phòng tối. | **Tự chủ hoàn toàn 100%:** Dữ liệu lưu trên máy chủ riêng của bảo tàng; nhân viên có thể tự quay quét cập nhật phòng mới bất cứ lúc nào. |
| **Ưu điểm nổi bật** | Độ chính xác không gian cực cao, dựng được cả sơ đồ đám mây điểm 3D (Point Cloud). | Thao tác chụp nhanh gọn, tải ảnh lên website là có thể xem được ngay lập tức. | Tối ưu hóa chi phí triệt để; thuật toán làm mịn sàn khử bóng chân người chụp; linh hoạt triển khai. |
| **Nhược điểm thực tế** | Chi phí quá đắt đỏ so với ngân sách của các bảo tàng công lập; khó triển khai trên diện rộng. | Vẫn tốn chi phí mua máy; cảm biến nhỏ chụp trong điều kiện đèn rọi vàng của bảo tàng dễ bị lóa sáng. | Đòi hỏi người quay lia máy đều tay; thời gian máy chủ xử lý ảnh mất từ 2 đến 4 phút cho mỗi phòng. |

Nhận xét: Xuất phát từ thực tế kinh phí hạn hẹp của các bảo tàng di sản công lập tại Việt Nam, đề tài chọn **Phương pháp 3** làm hướng tiếp cận kỹ thuật nghiên cứu mũi nhọn, đồng thời vẫn hỗ trợ phân hệ cho phép tải trực tiếp ảnh 360 có sẵn (Phương pháp 2) để ban quản trị bảo tàng có thể linh hoạt sử dụng khi có sẵn nguồn tư liệu chất lượng cao.

---

## 2.2. Cơ sở toán học và thuật toán ghép ảnh toàn cảnh từ video quét phòng

Khi người dùng quay một đoạn video lia máy vòng tròn 360 độ bằng điện thoại thông thường, dữ liệu đầu vào là một chuỗi hàng trăm khung hình kế tiếp nhau. Mô đun xử lý ảnh `stitching_worker` trong dự án thực hiện chuỗi thuật toán xử lý theo 4 bước liên hoàn:

### 2.2.1. Phép chiếu mặt trụ (Cylindrical Warping) nắn phẳng ảnh góc rộng
Trong thực tế, khi lia máy ảnh quay quanh một trục cố định, các khung hình chụp được là các mặt phẳng chiếu phẳng (planar projection) tiếp xúc với đường tròn xoay. Nếu ghép trực tiếp các ảnh phẳng này lại với nhau, các vật thể ở rìa ảnh sẽ bị biến dạng phối cảnh, các đường thẳng thực tế (như góc tường, mép tủ kính) bị cong gãy và mí nối giữa hai ảnh kề nhau bị lệch nghiêm trọng [1].

Để giải quyết hiện tượng này, bước đầu tiên là phải chuyển đổi từng khung hình phẳng sang bề mặt của một hình trụ tưởng tượng bao quanh tâm quay của máy ảnh [1]. 

Giả sử máy ảnh có tiêu cự $f$ (tính theo đơn vị pixel), tâm ảnh có tọa độ $(x_c, y_c)$. Với mỗi điểm ảnh $(x, y)$ trên ảnh gốc phẳng, tọa độ tương ứng $(x', y')$ sau khi uốn cong lên mặt trụ được tính toán thông qua phép biến đổi lượng giác [1]:
$$x' = f \cdot \arctan\left(\frac{x - x_c}{f}\right) + x_c$$
$$y' = f \cdot \frac{y - y_c}{\sqrt{(x - x_c)^2 + f^2}} + y_c$$

*Ý nghĩa kỹ thuật:* Phép chiếu mặt trụ làm cho mọi góc xoay ngang thuần túy của máy ảnh trở thành các phép tịnh tiến trượt ngang đơn giản trên bề mặt hình trụ. Điều này giúp các mép tường đứng bảo toàn góc $90^\circ$ vuông vức và giảm thiểu tối đa độ méo phối cảnh khi lia máy.

### 2.2.2. Thuật toán trích xuất đặc trưng SIFT và ước lượng ma trận chuyển đổi Homography với RANSAC
Sau khi đã nắn cong các khung hình lên mặt trụ, hệ thống cần tìm ra mối quan hệ liên kết không gian (vùng chồng lấn - overlap) giữa hai khung hình liên tiếp $I_k$ và $I_{k+1}$:

1. **Trích xuất điểm đặc trưng bất biến SIFT (Scale-Invariant Feature Transform) [2]:**
   - Thuật toán SIFT tìm kiếm các điểm đặc trưng nổi bật (như góc cạnh cổ vật, hoa văn tủ trưng bày) thông qua không gian tỷ lệ (Scale Space) bằng hàm sai phân Gauss (Difference of Gaussians - DoG):
     $$D(x, y, \sigma) = (G(x, y, k\sigma) - G(x, y, \sigma)) * I(x, y)$$
   - Tại mỗi điểm đặc trưng xác định được, SIFT tạo ra một véc-tơ mô tả gồm 128 chiều. Véc-tơ này có tính chất bất biến đối với phép tịnh tiến, phép quay, sự thay đổi độ phóng đại và có độ bền vững cao trước sự biến thiên ánh sáng [2].
   - Trong mã nguồn dự án (`stitcher.py`), nhóm áp dụng biến thể nâng cao **RootSIFT** (chuẩn hóa chuẩn $L_1$ và lấy căn bậc hai véc-tơ đặc trưng) [3] để tăng cường độ chính xác khi so khớp trong không gian phòng trưng bày có ánh sáng đèn rọi chiếu vào tủ kính phản quang.

2. **Khử điểm so khớp sai và ước lượng ma trận Homography bằng RANSAC [4]:**
   - Giữa hai khung hình kề nhau, quá trình so khớp véc-tơ đặc trưng bằng khoảng cách Euclidean luôn chứa đựng các cặp điểm sai lệch (outliers) do bóng phản chiếu trên mặt kính hoặc người tham quan di chuyển qua lại.
   - Thuật toán RANSAC (Random Sample Consensus) [4] được sử dụng để lọc sạch nhiễu:
     + Thuật toán lặp lại nhiều lần việc chọn ngẫu nhiên tập con tối thiểu gồm 4 cặp điểm tương đồng.
     + Tính toán ma trận biến đổi phối cảnh Homography $H$ kích thước $3 \times 3$ ánh xạ điểm $\mathbf{p} = [x, y, 1]^T$ từ ảnh trước sang điểm $\mathbf{p}' = [x', y', 1]^T$ ở ảnh sau:
       $$\mathbf{p}' \sim H \mathbf{p} = \begin{bmatrix} h_{11} & h_{12} & h_{13} \\ h_{21} & h_{22} & h_{23} \\ h_{31} & h_{32} & h_{33} \end{bmatrix} \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$$
     + Kiểm tra độ khớp của toàn bộ các điểm còn lại. Tập ma trận có số lượng điểm đồng thuận (inliers) lớn nhất và sai số bình phương nhỏ nhất sẽ được lựa chọn làm ma trận ghép nối chính thức.

### 2.2.3. Kỹ thuật hòa trộn đa băng tần (Multi-band Blending) và xử lý vùng đáy sàn (Nadir)
Khi các khung hình đã được căn chỉnh tọa độ chính xác, việc ghép chồng trực tiếp mí ảnh sẽ tạo ra đường lằn nối rõ rệt do độ phơi sáng tự động của điện thoại thay đổi liên tục giữa các góc phòng sáng và tối.

Đề tài áp dụng kỹ thuật **Hòa trộn đa băng tần trên tháp Laplacian (Multi-band Spline Blending)** [5]:
- Phân rã mỗi bức ảnh thành tháp Gauss (chứa thông tin độ sáng tần số thấp) và tháp Laplacian (chứa các chi tiết cạnh sắc tần số cao).
- Ở dải tần số thấp, thuật toán sử dụng dải chuyển tiếp rộng để làm mịn sự chênh lệch ánh sáng tổng thể giữa hai ảnh một cách từ từ, tự nhiên.
- Ở dải tần số cao, thuật toán dùng dải chuyển tiếp hẹp để giữ nguyên độ sắc nét của hoa văn, chi tiết cổ vật mà không gây hiện tượng bóng ma (ghosting).
- **Xử lý vùng đáy sàn nhà (Nadir Patch):** Khu vực chân người chụp ảnh ở cực Nam thường để lại bóng đen hoặc chân người. Hệ thống tự động tạo mặt nạ đắp vá (inpaint / blending patch) dựa trên vân gạch sàn xung quanh để tạo nên một bức ảnh toàn cảnh $360^\circ$ hoàn chỉnh, khép kín và thẩm mỹ.

---

## 2.3. Các phương pháp tái tạo mô hình Cổ vật 3D

Để đưa cổ vật quý trong bảo tàng lên không gian số phục vụ công chúng tương tác xoay phóng đa chiều, đề tài nghiên cứu hai phương pháp tái tạo hình học ba chiều bám sát mã nguồn thực tế:

### 2.3.1. Phương pháp tái tạo mô hình 3D từ một ảnh duy nhất (Single-view Reconstruction)
Đây là phương pháp cực kỳ quan trọng đối với các cổ vật quý tại Bảo tàng Lịch sử TP.HCM vì phần lớn hiện vật (như tượng đá, đồ gốm, trang phục cổ) được đặt sát vách tường hoặc trong các tủ kính góc hẹp, người chụp không thể đi ra phía sau để chụp đủ các góc.

*Quy trình thực hiện của người dùng:*
Người dùng chỉ cần chụp duy nhất 1 tấm ảnh mặt trước của cổ vật bằng điện thoại với độ rõ nét cao, đảm bảo bao quát trọn vẹn đường viền hiện vật, sau đó tải lên hệ thống Studio.

*Cơ chế hoạt động bên trong của hệ thống:*
Hệ thống tích hợp hai cơ chế xử lý song song trong mô đun `artifact_3d_generator.py` và `trellis_service.py`:
1. **Bóc tách phông nền tự động (Background Removal):** Áp dụng mạng nơ-ron tích chập U2-Net [6] nhận diện chính xác đường biên bao quanh cổ vật (Silhouette), loại bỏ hoàn toàn khung kính và ánh đèn phản chiếu phía sau.
2. **Nội suy thể tích điều hòa liên tục (Harmonic Volumetric Envelope):** 
   - Thay vì ép phẳng hiện vật thành tấm bìa mỏng 2D, thuật toán tính toán trường khoảng cách Euclid từ biên dạng vào trục tâm đối xứng của cổ vật.
   - Chiều sâu vòm cầu ($Depth$) được chuẩn hóa tự động theo tỷ lệ thực tế của hiện vật ($85\% - 100\%$ chiều rộng).
   - Áp dụng hàm điều hòa liên tục để khử hiện tượng gờ bậc thang (Flange-free), giúp các chi tiết phức tạp như quai bình gốm, chân vạc không bị phình to bất thường.
3. **Trải giãn vân bề mặt và sinh bản đồ pháp tuyến (Texture Dilation & Normal Map):** Thuật toán thực hiện mở rộng mép vân ảnh 18 chu kỳ để khử viền đen mép biên; đồng thời tính toán gradient bề mặt để sinh ra Normal Map làm nổi bật độ gồ ghề của hoa văn chạm khắc cổ xưa dưới ánh đèn phản chiếu của WebGL.
4. **Xuất tệp mô hình 3D khép kín (.GLB):** Tạo lưới đa giác khép kín (watertight triangular mesh) đạt chuẩn quốc tế GLB, dung lượng tối ưu nhẹ (khoảng $2 - 5$ MB) để chạy mượt mà ngay trên điện thoại di động. Đồng thời, hệ thống hỗ trợ kết nối dịch vụ AI đám mây (Trellis) trên môi trường máy chủ GPU để suy diễn thể tích mặt sau tự nhiên cho các cổ vật có hình khối phức tạp [8].

*Đánh giá Ưu & Nhược điểm:*
- **Ưu điểm:** Thao tác siêu nhanh, chỉ cần 1 ảnh duy nhất, thời gian tạo khối tức thì trong vài giây, giải quyết triệt để rào cản tủ kính sát tường của bảo tàng.
- **Nhược điểm:** Hình khối mặt sau là hình học suy diễn đối xứng thể tích dựa trên mặt trước, không phản ánh được hoa văn đặc thù mặt sau nếu cổ vật có thiết kế bất đối xứng.

### 2.3.2. Phương pháp quét hình học đa góc truyền thống (Multi-view Photogrammetry)
Áp dụng cho các cổ vật đặt tại bàn trưng bày mở hoặc tủ kính 4 mặt thông thoáng ở giữa phòng (như đỉnh đồng, tượng tròn Champa), cho phép người chụp di chuyển xung quanh $360^\circ$.

*Quy trình thực hiện của người dùng:*
Người thực hiện cầm điện thoại di chuyển chậm quanh cổ vật theo 3 vòng quỹ đạo (góc chụp ngang thân, góc chụp chúc từ trên xuống $45^\circ$, góc chụp thấp từ dưới lên), chụp một bộ ảnh từ 30 đến 60 tấm có độ gối mí hình ảnh liên tiếp nhau đạt từ $60\%$ đến $80\%$.

*Cơ chế hoạt động bên trong của hệ thống (`reconstruction_pipeline.py`):*
1. **Định vị máy ảnh và tái tạo thưa bằng COLMAP SfM (Structure from Motion) [6]:**
   - Trích xuất đặc trưng SIFT trên toàn bộ các bức ảnh và tiến hành so khớp chéo (Exhaustive Matching).
   - Tối ưu hóa điều chỉnh chùm tia (Bundle Adjustment) để đồng thời ước lượng ma trận nội tại của camera (tiêu cự, hệ số méo góc) và tư thế không gian 3 chiều (Pose: vị trí và góc quay) của từng bức ảnh chụp.
   - Xuất ra đám mây điểm thưa (Sparse Point Cloud) phản ánh khung xương không gian của cổ vật.
2. **Làm dày đám mây điểm và dựng lưới đa giác bằng OpenMVS [7]:**
   - Thuật toán Multi-View Stereo (DensifyPointCloud) tính toán bản đồ chiều sâu (depth map) trên từng ảnh, phóng chiếu các điểm tương đồng để tạo thành đám mây điểm dày đặc gồm hàng trăm ngàn điểm ảnh có tọa độ thực $(X, Y, Z)$ và màu sắc RGB.
   - Thuật toán ReconstructMesh kết nối các điểm đám mây thành bề mặt lưới gồm các mặt tam giác kín (Triangular Mesh), sau đó thực hiện lọc mịn bề mặt (RefineMesh).
3. **Áp vân bề mặt ảnh thật (Texture Mapping):**
   - Chiếu ngược các bức ảnh chụp sắc nét ban đầu lên từng mặt tam giác tương ứng, tính toán cân bằng độ sáng cục bộ để tạo ra tệp kết cấu vân (Texture Atlas) chất lượng cao.
   - Tối ưu giảm số lượng đa giác (Mesh Decimation) và đóng gói thành tệp nhị phân `.GLB`.

*Đánh giá Ưu & Nhược điểm:*
- **Ưu điểm:** Độ chính xác hình học cực cao, tái tạo trung thực 100% mọi vết nứt, hoa văn và màu sắc thực tế ở cả mặt trước lẫn mặt sau hiện vật.
- **Nhược điểm:** Đòi hỏi không gian chụp phải rộng rãi, đi vòng được 4 phía; quy trình tính toán xử lý hình học đa góc tiêu tốn nhiều thời gian (từ 15 đến 30 phút trên máy tính) và đòi hỏi cấu hình phần cứng mạnh.

---

## 2.4. Ngăn xếp công nghệ phát triển hệ thống trên nền tảng Web

### 2.4.1. Phân hệ kết xuất đồ họa 3D trực tiếp trên trình duyệt (Three.js và React)
Để khách tham quan có thể trải nghiệm chuyến tham quan thực tế ảo mượt mà trên máy tính và điện thoại mà không cần cài đặt thêm bất kỳ phần mềm hay tiện ích mở rộng nào, nhóm lựa chọn thư viện đồ họa Three.js [10] chạy trên nền tảng WebGL 2.0 chuẩn mở của trình duyệt [11].

Thư viện Three.js đóng vai trò là cầu nối giúp trình duyệt khai thác trực tiếp sức mạnh xử lý của chip đồ họa (GPU). Trong dự án thực tế, công nghệ này được nhóm ứng dụng cụ thể vào 4 chức năng cốt lõi sau:
- **Tái tạo không gian phòng 360 độ:** Hệ thống khởi tạo một khối cầu không gian ảo, sau đó dán bức ảnh toàn cảnh 360 độ vào mặt bên trong của quả cầu. Điểm nhìn của camera được đặt ngay tại tâm hình cầu. Khi người dùng dùng chuột kéo rê trên máy tính hoặc vuốt ngón tay trên màn hình điện thoại, góc quay của camera sẽ thay đổi tương ứng, giúp người xem có cảm giác như đang đứng giữa gian phòng bảo tàng và xoay nhìn tự do bốn hướng.
- **Hiển thị và tương tác mô hình cổ vật 3D:** Hệ thống đọc tệp dữ liệu ba chiều của cổ vật (định dạng tệp .GLB), cho phép người tham quan tự do xoay lật các góc, phóng to để quan sát tỉ mỉ từng đường nét hoa văn chạm khắc hoặc thu nhỏ để ngắm nhìn hình khối tổng thể của hiện vật.
- **Định vị và kích hoạt điểm chuyển phòng (Hotspots):** Khi người quản trị nhấp chuột vào một vị trí trên cửa phòng, hệ thống tự động tính toán tia chiếu từ màn hình vào mặt cầu để xác định chính xác tọa độ góc quay. Điểm này sau đó được gắn biểu tượng mũi tên dẫn đường, cho phép khách tham quan nhấp vào để bước sang gian phòng kế tiếp.
- **Tối ưu hóa bộ nhớ chống đứng máy trên điện thoại:** Vì các thiết bị di động thường có dung lượng bộ nhớ RAM giới hạn, mã nguồn phía máy trạm chủ động giải phóng toàn bộ dữ liệu hình ảnh và khối hình học của phòng cũ ngay khi người dùng chuyển sang phòng mới. Cơ chế dọn dẹp bộ nhớ này giúp trình duyệt luôn hoạt động ổn định, mượt mà và không bao giờ bị hiện tượng tràn RAM gây văng ứng dụng.

### 2.4.2. Phân hệ máy chủ dịch vụ và kiến trúc cơ sở dữ liệu lai (Node.js, PostgreSQL, MongoDB và Redis)
Bám sát kiến trúc mã nguồn thực tế tại thư mục `backend/src/`, hệ thống máy chủ được xây dựng theo mô hình dịch vụ phân tán, ứng dụng kiến trúc cơ sở dữ liệu lai (Hybrid Database Architecture) kết hợp giữa cơ sở dữ liệu quan hệ và cơ sở dữ liệu phi quan hệ để tối ưu hóa hiệu năng và độ an toàn dữ liệu:

1. **Máy chủ dịch vụ trung tâm Node.js Express (`backend/src/server.ts`):**
   - Đóng vai trò là đầu mối tiếp nhận, điều phối và xác thực toàn bộ các yêu cầu từ phía người dùng qua chuẩn giao tiếp RESTful API.
   - Tích hợp các bộ định tuyến chuyên biệt: quản trị không gian phòng (`routes/rooms.ts`), cổ vật di sản (`routes/artifacts.ts`), đặt vé và soát vé QR (`routes/tickets.ts`), thanh toán PayOS VietQR (`services/payos.ts`), phân tích mặt bằng (`routes/floorPlan.ts`), quản trị giao diện CMS (`models/SystemBranding.ts`) và dịch vụ trí tuệ nhân tạo (`routes/ai.ts`).
   - Sử dụng cơ chế bất đồng bộ (Asynchronous Event-driven) giúp máy chủ phục vụ đồng thời hàng ngàn lượt kết nối mà vẫn bảo đảm độ trễ phản hồi thấp dưới $200\text{ ms}$.

2. **Cơ sở dữ liệu quan hệ chuẩn ACID PostgreSQL (`backend/src/db/postgres.ts`):**
   - Đóng vai trò là cơ sở dữ liệu chính (Primary Database) phụ trách lưu trữ các thực thể nghiệp vụ đòi hỏi tính nhất quán tuyệt đối, ràng buộc toàn vẹn khóa ngoại (Foreign Keys) và giao dịch tài chính ACID:
     + Bảng người dùng (`users`) và bảng phân quyền vai trò (`roles` theo mô hình RBAC).
     + Bảng cấu hình loại vé (`ticket_types`) và khung giờ tham quan (`ticket_time_slots`).
     + Bảng đơn hàng thanh toán (`orders`) kết nối với cổng VietQR PayOS.
     + Bảng vé tham quan điện tử (`tickets`) lưu trữ mã định danh duy nhất `BTLS-YYYY-XXXXXXXX`, trạng thái vé (`pending`, `paid`, `used`, `cancelled`) và mốc thời gian quét vé vào cổng (`used_at`).
     + Bảng nhật ký kiểm toán hệ thống (`audit_logs`) ghi nhận mọi thao tác nhạy cảm của người quản trị phục vụ công tác an toàn thông tin.

3. **Cơ sở dữ liệu tài liệu MongoDB (`backend/src/db/mongodb.ts`):**
   - Đóng vai trò là Document & Spatial Store lưu trữ các dữ liệu phi cấu trúc, dữ liệu toạ độ đồ họa không gian ba chiều và cấu trúc cây phân cấp:
     + Dữ liệu 18 gian phòng trưng bày (`RoomModel`): danh sách tọa độ các điểm liên kết phòng Hotspots (kinh độ, vĩ độ cầu), góc nhìn mặc định camera, tệp âm thanh thuyết minh và sơ đồ kết nối cửa đi.
     + Dữ liệu cổ vật di sản (`ArtifactModel`): tệp mô hình 3D (.GLB), ma trận biến đổi tỉ lệ, vị trí đặt trong phòng và bảng thông tin niên đại khảo cổ học.
     + Cấu hình bản đồ số (`FloorPlanMap`) và từ điển đa ngôn ngữ (`Language`).

4. **Động cơ đồng bộ dữ liệu thời gian thực SyncEngine (`backend/src/db/syncEngine.ts`):**
   - Để tận dụng thế mạnh của cả hai hệ quản trị cơ sở dữ liệu, nhóm phát triển mô đun `syncEngine.ts` thực hiện cơ chế đồng bộ hai chiều thời gian thực giữa PostgreSQL và MongoDB:
     + Mọi biến động dữ liệu quan trọng phát sinh tại PostgreSQL (như thông tin phòng, chủ đề, cấu hình thương hiệu) lập tức được đồng bộ phản chiếu sang MongoDB dưới dạng tài liệu nhúng để tối ưu tốc độ đọc của client.
     + Ngược lại, các thay đổi tọa độ không gian từ giao diện quản trị 360 Studio được lưu vào MongoDB đồng thời kích hoạt cập nhật các trường khóa ngoại tương ứng trong PostgreSQL.

5. **Bộ nhớ đệm Redis và Kênh đồng bộ thời gian thực SSE (`backend/src/services/redis.ts` & `realtimeSync.ts`):**
   - **Bộ nhớ đệm (Caching):** Lưu tạm thời danh mục 18 phòng và thông tin cổ vật thường xuyên truy cập trên RAM, giúp thời gian phản hồi cho khách tham quan đạt tốc độ tức thì ($< 15\text{ ms}$).
   - **Hàng đợi tác vụ ngầm (Background Task Queue):** Điều phối các tác vụ nặng như trích xuất video ghép ảnh toàn cảnh 360 độ hoặc sinh mô hình 3D, giúp giao diện người dùng không bị nghẽn (blocking).
   - **Đồng bộ thời gian thực (Realtime Event Stream):** Khi nhân viên bảo tàng quét mã QR soát vé thành công hoặc ban quản trị cập nhật ảnh banner/logo trang chủ, sự kiện được phát tán tức thời thông qua Server-Sent Events (SSE) để các màn hình đang mở tự động cập nhật trạng thái mà không cần người dùng phải bấm tải lại (refresh) trang.

6. **Dịch vụ Trí tuệ Nhân tạo Google Gemini API (`backend/src/services/aiService.ts`):**
   - Trợ lý ảo hỏi đáp kiến thức lịch sử tích hợp mô hình ngôn ngữ lớn **Google Gemini API (`gemini-2.5-flash`)** thông qua giao thức bảo mật REST API.
   - Hệ thống tự động nạp thông tin lịch sử của gian phòng và hiện vật mà khách đang đứng tham quan vào lời nhắc ngữ cảnh (Context Injection / Lightweight RAG), giúp trợ lý AI trả lời chuẩn xác thông tin lịch sử của Bảo tàng Lịch sử TP.HCM mà không bị hiện tượng suy diễn sai lệch (hallucination). Đồng thời, dịch vụ tích hợp bộ đệm kiểm soát tần suất truy vấn (Rate Limiter: thời gian giãn cách tối thiểu 3 giây và tối đa 15 câu hỏi/phút) để chống tấn công quá tải API.

