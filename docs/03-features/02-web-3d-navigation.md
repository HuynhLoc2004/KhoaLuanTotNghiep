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

## 3D rendering

- glTF/GLB + Draco/Meshopt, texture KTX2.
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

## Decision log

| Ngày | Quyết định | Lý do/Hệ quả |
|---|---|---|
| 2026-07-29 | A* trên graph là thuật toán mặc định, QR cập nhật vị trí | Dễ giải thích, nhanh và chi phí thấp; không định vị liên tục |
| 2026-07-29 | Scene và camera choreography là CMS-driven preset | Tạo trải nghiệm riêng theo triển lãm mà không sửa code; preset phải qua performance review |
| 2026-07-29 | Điểm bắt đầu hỗ trợ QR và visual place recognition | QR là anchor chính xác; ảnh bổ trợ và luôn có confidence/fallback |

## Change history

| Ngày | Loại | Thay đổi | Test/Bằng chứng |
|---|---|---|---|
| 2026-07-29 | ADDED | Tạo baseline bản đồ 3D và dẫn đường | Review tài liệu, chưa có code |
| 2026-07-29 | CHANGED | Bổ sung spatial transition, quality tier và cấu hình scene từ CMS | Review tài liệu, chưa có code |
| 2026-07-29 | CHANGED | Liên kết Indoor Location Detection bằng QR/ảnh | PLAN-0003, chưa có code |
