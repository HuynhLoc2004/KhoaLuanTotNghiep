# ĐẶC TẢ KIẾN TRÚC & PIPELINE TỐI ƯU HÓA 3D GAUSSIAN SPLATTING (3DGS)
## NỀN TẢNG BẢO TÀNG SỐ — BẢO TÀNG LỊCH SỬ THÀNH PHỐ HỒ CHÍ MINH

> **Tài liệu chuyển giao kỹ thuật (Handover Architecture Blueprint)**
> Mã phân hệ: `TASK-3D-TOUR-001`
> Người phụ trách: **Huỳnh Tấn Lộc** & **Trịnh Vĩ Thành**
> Mục tiêu cốt lõi: Tạo mô hình 3DGS không gian bảo tàng chất lượng cao nhất, **KHÔNG BỊ THỦNG LỖ TRẮNG, KHÔNG NỨT VÁCH, KHÔNG BỊ LỆCH GÓC XOAY VÀ QUÉT SẠCH HẠT RÁC (FLOATERS)**.

---

## 1. PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ & GIẢI PHÁP KỸ THUẬT

| Hiện Tượng Lỗi | Nguyên Nhân Gốc Rễ | Giải Pháp Kỹ Thuật Trong Pipeline |
|---|---|---|
| **Vách tường bị thủng lỗ trắng / mất mảng** | Tường đơn sắc (plain walls) thiếu vân bề mặt khiến gradient vị trí hạt Gaussian $\nabla_p L$ thấp, ngưỡng densify mặc định (0.0004) không kích hoạt phân tách hạt. | Hạ ngưỡng `densify-grad-thresh` xuống **0.00018**, tăng tần suất densify mỗi **100** bước từ iter 500 đến 7000. |
| **Góc phòng bị cong vênh / nứt góc** | Dùng camera model đơn giản `SIMPLE_RADIAL` bỏ qua độ méo phi đối xứng (tangential) và méo bậc cao của camera điện thoại. | Ép COLMAP sử dụng Camera Model **`OPENCV`** (đầy đủ $f_x, f_y, c_x, c_y, k_1, k_2, p_1, p_2$). |
| **Không gian bị xoay lệch khi đi hết 1 vòng (Loop drift)** | Sai số tích lũy (drift) khi quay video quanh phòng 360 độ mà không khớp lại điểm đầu và điểm cuối. | Kích hoạt **`SequentialMatching.loop_detection 1`** với chu kỳ quét vòng lặp 20 ảnh và so khớp 30 ảnh lân cận. |
| **Hạt Gaussian rác bay lơ lửng (Floaters)** | Các hạt bán trong suốt xuất hiện ở khoảng không giữa phòng do ánh sáng phản chiếu hoặc thiếu ràng buộc độ sâu. | Áp dụng cơ chế **`reset-alpha-every 3000`** kết hợp **`cull-alpha-thresh 0.05`**, đóng băng phân tách hạt (`stop-split-at 9000`) để làm sạch hạt lơ lửng. |
| **COLMAP mất dấu (Registration Failure)** | Người quay lia camera quá nhanh gây nhòe chuyển động (Motion Blur). | Lọc frame bằng thuật toán **Laplacian Variance $\sigma^2(\nabla^2 I)$**, tự động loại bỏ tất cả các frame có điểm sắc nét $< 85.0$. |

---

## 2. QUY TRÌNH 6 BƯỚC PIPELINE TỰ ĐỘNG (`backend/worker_3dgs/pipeline.py`)

### Bước 1: Tiền Xử Lý & Lọc Frame Chống Nhòe Chuyển Động (OpenCV)
- Video được chia thành các cửa sổ thời gian (window) theo tần số mục tiêu $2.5\text{ FPS}$.
- Tính toán phương sai toán tử Laplacian (Laplacian Variance):
  $$\text{Sharpness} = \text{Var}\left(\nabla^2 I_{\text{gray}}\right)$$
- Chỉ chọn **1 frame sắc nét nhất trong mỗi cửa sổ**, loại bỏ toàn bộ frame có $\text{Sharpness} < 85.0$.
- Tự động downscale ảnh về tối đa $1920 \times 1080$ giữ nguyên tỉ lệ để cân bằng giữa chi tiết và VRAM GPU.

### Bước 2: Đồng Bộ Ảnh Chụp Cận Cảnh Chi Tiết (High-Res 8K Photos)
- Toàn bộ ảnh chụp trực diện độ nét cao của các bức tranh, tủ kính, bảo vật được đổi tên và đặt chung vào thư mục `input_images` cùng với các video frames.
- Điều này cho phép COLMAP chạy Structure-from-Motion (SfM) trên **cùng một hệ quy chiếu không gian**, tự động liên kết tọa độ của ảnh chi tiết mà không cần chấm tay.

### Bước 3: Cấu Hình COLMAP SfM Nâng Cao
```bash
# 1. Trích xuất đặc trưng nhạy cao cho tường trơn
colmap feature_extractor \
  --database_path database.db \
  --image_path input_images/ \
  --ImageReader.single_camera 1 \
  --ImageReader.camera_model OPENCV \
  --SiftExtraction.peak_threshold 0.004 \
  --SiftExtraction.edge_threshold 15.0 \
  --SiftExtraction.max_num_features 8192 \
  --SiftExtraction.first_octave -1 \
  --SiftExtraction.use_gpu 1

# 2. Matcher tuần tự có khép kín vòng lặp (Loop Detection)
colmap sequential_matcher \
  --database_path database.db \
  --SequentialMatching.overlap 15 \
  --SequentialMatching.quadratic_overlap 1 \
  --SequentialMatching.loop_detection 1 \
  --SequentialMatching.loop_detection_period 20 \
  --SequentialMatching.loop_detection_num_images 30 \
  --SiftMatching.guided_matching 1 \
  --SiftMatching.use_gpu 1

# 3. Tái tạo thưa (Sparse Reconstruction)
colmap mapper \
  --database_path database.db \
  --image_path input_images/ \
  --output_path sparse/ \
  --Mapper.ba_refine_focal_length 1 \
  --Mapper.ba_refine_principal_point 1 \
  --Mapper.ba_refine_extra_params 1 \
  --Mapper.min_num_matches 15 \
  --Mapper.init_min_tri_angle 8.0 \
  --Mapper.filter_max_reproj_error 4.0
```

### Bước 4: Huấn Luyện Splatfacto 3DGS (Chống Thủng Mảng & Quét Rác)
```bash
ns-train splatfacto \
  --data workspace_3dgs/<tourId> \
  --output-dir workspace_3dgs/<tourId>/output \
  --max-num-iterations 12000 \
  --pipeline.model.densify-grad-thresh 0.00018 \
  --pipeline.model.densify-every 100 \
  --pipeline.model.reset-alpha-every 3000 \
  --pipeline.model.cull-alpha-thresh 0.05 \
  --pipeline.model.stop-split-at 9000 \
  --pipeline.model.sh-degree 2 \
  --pipeline.model.random-init False \
  colmap
```

### Bước 5: Nén & Xuất File Web Viewer
```bash
ns-export gaussian-splat \
  --load-config workspace_3dgs/<tourId>/output/.../config.yml \
  --output-dir models/tours/<tourId>
```
Xuất ra `scene.splat` và `point_cloud.ply` tối ưu hóa kích thước cho Web Three.js.

### Bước 6: Tự Động Định Vị 3D Hotspot Từ Ma Trận Ngoại Suy Camera (Extrinsics)
1. Đọc tệp `sparse/0/images.txt`, trích xuất Quaternion $q = (q_w, q_x, q_y, q_z)$ và Translation vector $t = (t_x, t_y, t_z)$ của từng ảnh chi tiết.
2. Tâm camera trong tọa độ thế giới:
   $$\mathbf{C} = -R^T \cdot \mathbf{t}$$
3. Vector pháp tuyến trực diện hướng từ camera vào hiện vật:
   $$\mathbf{N} = R^T \cdot \begin{bmatrix} 0 \\ 0 \\ 1 \end{bmatrix}$$
4. Chuyển đổi sang hệ tọa độ Three.js (flip $Y$, flip $Z$):
   $$\mathbf{C}_{\text{three}} = [C_x, -C_y, -C_z], \quad \mathbf{N}_{\text{three}} = [N_x, -N_y, -N_z]$$
5. Điểm ghim trên bề mặt hiện vật:
   $$\mathbf{P}_{\text{hotspot}} = \mathbf{C}_{\text{three}} + \mathbf{N}_{\text{three}} \cdot 1.2\text{m}$$

---

## 3. TƯƠNG TÁC PHÍA CLIENT (THREE.JS + GSAP)

Khi người dùng Double-Click vào điểm ghim hoặc bất kỳ vị trí nào trên vách tường:
1. `THREE.Raycaster` bắt điểm va chạm $\mathbf{P}_{\text{hit}}$ và vector pháp tuyến $\mathbf{n}_{\text{hit}}$.
2. Camera tự động lướt mượt mà bằng GSAP đến góc nhìn trực diện đối diện tầm mắt người xem:
   $$\mathbf{P}_{\text{target\_cam}} = \mathbf{P}_{\text{hit}} + \mathbf{n}_{\text{hit}} \times 1.4\text{m}$$
   $$\text{Controls LookAt} = \mathbf{P}_{\text{hit}}$$
3. Modal mở ra hiển thị ảnh chụp trực diện 8K, niên đại lịch sử và thuyết minh âm thanh.

---

## 4. HƯỚNG DẪN DÀNH CHO ĐỒNG ĐỘI (LỘC & THÀNH)

Toàn bộ hệ thống đã được container hóa hoàn chỉnh trong [docker-compose.yml](file:///d:/KhoaluanTotNghiep/docker-compose.yml).
Khi pull mã nguồn về máy:
1. Bật toàn bộ dịch vụ (Frontend, Backend, Worker, RabbitMQ, Redis) chỉ với:
   ```bash
   docker compose up -d
   ```
2. Frontend: `http://localhost:3001`
3. Backend API: `http://localhost:3000`
4. RabbitMQ Manager: `http://localhost:15672`
