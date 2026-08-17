# Website 3D và dẫn đường trong bảo tàng

## Implementation status

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Đặc tả | IN_PROGRESS | Baseline v0.1, chờ nhóm review |
| UI/Graph/API/Tests | PLANNED | Chưa khởi tạo code |

## Mục tiêu

Hiển thị Digital Twin/sơ đồ 3D, cho phép chọn điểm đến và nhận lộ trình tương tự bản đồ trong nhà.

## Flow người dùng

1. Chọn tầng, quét QR hoặc chụp ảnh không gian để xác định điểm bắt đầu.
2. Chọn POI/hiện vật/khu vực đích.
3. API tính đường trên graph đi bộ.
4. Client vẽ polyline, danh sách chỉ dẫn và đồng bộ camera 3D.
5. Khi quét QR tại node tiếp theo, cập nhật vị trí và tính lại đường nếu lệch.

## Mô hình và thuật toán

- Không gian được chuyển thành graph: node là giao lộ/cửa/cầu thang/POI; edge có chiều dài, tầng, khả năng tiếp cận và trạng thái đóng.
- A* là mặc định với heuristic khoảng cách Euclid; nhanh hơn Dijkstra khi graph lớn.
- Dijkstra dùng khi cần kiểm chứng hoặc heuristic không đáng tin.
- Trọng số: khoảng cách + phạt đổi tầng + phạt đông/đóng + ràng buộc xe lăn.
- NavMesh chỉ dùng nếu cần tự do di chuyển trong mô hình; graph dễ biên tập và giải thích hơn cho MVP.

## 3D rendering & Single-Photo Glass Case Reconstruction

- **Quy tắc Chống Mô hình Giả/Đơ (Anti-Dummy Block Policy - DEC-UX-SPATIAL-3D-QUALITY-TIERS-001)**: Nghiêm cấm tuyệt đối việc hiển thị mô hình 3D thô sơ dạng "khúc gỗ đơ/méo" làm giảm giá trị thẩm mỹ của di sản. Hệ thống cung cấp 4 tầng chất lượng 3D linh hoạt:
  1. **Tier 1 (Curator High-Fidelity Photogrammetry GLB)**: Tải file `.glb` quét 3D chuyên nghiệp (Meshroom/Polycam/Luma AI) dành cho di sản cấp quốc gia.
  2. **Tier 2 (AI 3D Gaussian Splatting .splat)**: Tái tạo chùm tia sáng và phản chiếu thực tế từ ảnh chụp, giữ nguyên 100% chi tiết bề mặt từ mọi góc nhìn mà không tạo ra hình khối giả.
  3. **Tier 3 (PBR Material Shaders & HDR Environment)**: Áp dụng PBR Metalness/Roughness Shaders riêng cho từng chất liệu (Đồng gỉ cổ, Vàng hoàng gia, Đá ngọc Bích, Gỗ chạm khắc) kết hợp HDR environment map `museum_gallery.hdr` tạo độ bóng thật của kim loại và lồng kính.
  4. **Tier 4 (2.5D Layered Depth Parallax Mesh Fallback)**: Khi chưa có mô hình GLB, chiếu Depth Map lên lưới 2.5D Parallax Mesh giúp di sản có chiều sâu 3D nghiêng 360° chân thực từ đúng 1 bức ảnh chụp gốc mà không bao giờ bị méo ảnh hay lộ mặt sau rỗng.
- **Admin Live Quality Gate**: Trong Admin Portal, Admin/Curator xem trước mô hình 3D trực tiếp. Nếu chưa vừa ý, Admin có thể đổi chế độ hiển thị hoặc bấm "Tái tạo lại bằng AI Depth cao cấp" trước khi xuất bản ra Public Web.
- **Tối ưu Hiệu năng & Chân thực (No Lag, 60 FPS)**: Tích hợp thư viện Google `@google/model-viewer` và Three.js PBR Engine với Draco Compression, giúp mô hình nạp cực nhanh (<1.5s) và xoay 360° mượt mà 60 FPS trên mobile.
- glTF/GLB + Draco/Meshopt, texture KTX2/WebP.
- LOD, frustum culling, lazy loading theo tầng, instancing vật thể lặp.
- Giới hạn pixel ratio và shadow trên thiết bị yếu.
- Không tải 3D ở trang đầu; người dùng chủ động mở trải nghiệm.
- Camera path, lighting preset, hotspot style và quality tier được Admin tham chiếu từ registry/CMS.
- Chuyển tầng, chọn POI và bắt đầu route có spatial transition; người dùng luôn có thể skip/reduce motion.

## Fallback

- WebGL yếu: bản đồ 2D SVG/canvas.
- Chưa có scan 3D: sơ đồ 2.5D hoặc floor plan.
- Không biết vị trí: yêu cầu chọn “Tôi đang ở đâu?” hoặc quét QR gần nhất.
- Nhận diện ảnh confidence thấp: hiện top-k để xác nhận hoặc fallback QR/chọn thủ công; không tự đặt start node sai.

## Ưu/nhược điểm và phù hợp

A* trên graph có mức phù hợp rất cao: nhanh, dễ debug và hỗ trợ accessibility. Nhược điểm là cần nhân viên xây graph chính xác. Định vị chỉ bằng QR ít tốn chi phí nhưng không theo dõi liên tục; đủ tốt cho đồ án.

## Nghiệm thu

- Tính đúng tuyến giữa các node, xử lý tầng và đường xe lăn.
- 3D đạt mục tiêu 30–60 FPS trên thiết bị trung bình với scene mẫu.
- Có 2D fallback và nội dung vẫn truy cập được nếu model lỗi.

## Tích hợp Dòng thời gian sống

Web 3D chỉ tiêu thụ `sceneRef/cameraPathRef/hotspotSetRef` đã được duyệt từ published narrative node của `docs/03-features/11-living-timeline.md`. `FREE_EXPLORE` cho người dùng tự chọn POI; `GUIDED_JOURNEY` mới highlight/route tới narrative node kế tiếp. Timeline 2D/static là critical path; scene/AI failure không được làm mất nội dung hoặc progress. Shared contract chưa accepted và integration này được để sau MVP timeline 2D.

QR/recognition không tạo model 3D theo request. Viewer chỉ mở model version đã được curator/technical review; thiếu/lỗi model dùng ảnh 360, video, gallery hoặc text fallback. Related artifact ở phòng khác chỉ nhận route sau khi Map contract sẵn sàng.

## Decision log

| Ngày | Quyết định | Lý do/Hệ quả |
|---|---|---|
| 2026-07-29 | A* trên graph là thuật toán mặc định, QR cập nhật vị trí | Dễ giải thích, nhanh và chi phí thấp; không định vị liên tục |
| 2026-07-29 | Scene và camera choreography là CMS-driven preset | Tạo trải nghiệm riêng theo triển lãm mà không sửa code; preset phải qua performance review |
| 2026-07-29 | Điểm bắt đầu hỗ trợ QR và visual place recognition | QR là anchor chính xác; ảnh bổ trợ và luôn có confidence/fallback |

## Feature lifecycle và Contribution ledger

Áp dụng `docs/07-delivery/09-work-session-contribution-ledger.md`. Chưa có implementation session; không suy diễn contributor/timestamp từ plan.

| Mốc | Timestamp | Member/Actor | Evidence |
|---|---|---|---|
| Planned | Baseline docs | Nhóm | Feature plan |
| Claimed/Started/IMPLEMENTED/VERIFIED/Merged/Completed | Chưa có | — | — |

| Session ID | Contributor | Role | Task/Branch | StartedAt | LastActiveAt | EndedAt | Status | Scope/Output | Tests/Evidence | Handoff/Next |
|---|---|---|---|---|---|---|---|---|---|---|
| Chưa có | — | — | — | — | — | — | PLANNED | — | NOT RUN | Chờ task READY |

## Change history

| Ngày | Loại | Thay đổi | Test/Bằng chứng |
|---|---|---|---|
| 2026-07-29 | ADDED | Tạo baseline bản đồ 3D và dẫn đường | Review tài liệu, chưa có code |
| 2026-07-29 | CHANGED | Bổ sung spatial transition, quality tier và cấu hình scene từ CMS | Review tài liệu, chưa có code |
| 2026-07-29 | CHANGED | Liên kết Indoor Location Detection bằng QR/ảnh | PLAN-0003, chưa có code |
| 2026-08-02 | CHANGED | Ghi consumer boundary và fallback cho Dòng thời gian sống | `IDEA-002`, `PLAN-0009`; code/test NOT RUN |
| 2026-08-02 | CHANGED | Phân biệt free POI selection và guided next-node routing | `DEC-TIMELINE-MODE-001`, `PLAN-0010`; code/test NOT RUN |
| 2026-08-02 | CHANGED | Khóa approved-model-only và route/fallback cho related artifacts | `DEC-TIMELINE-RELATION-001`, `PLAN-0011`; code/test NOT RUN |
