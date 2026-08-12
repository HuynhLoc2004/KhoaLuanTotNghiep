# Tầm nhìn và phạm vi

## Bài toán

Bảo tàng cần một nền tảng số giúp khách khám phá không gian, nghe thuyết minh đa ngôn ngữ, nhận diện hiện vật và xem dữ liệu 3D; đồng thời giúp nhân viên tự quản trị nội dung mà không cần sửa mã nguồn.

## Nhóm người dùng

- Khách vãng lai: xem nội dung, bản đồ, quét QR, dùng hướng dẫn.
- Người dùng đăng nhập: lưu lịch sử tham quan, yêu thích và kết quả tác vụ 3D.
- Biên tập viên: tạo/sửa nội dung và gửi duyệt.
- Kiểm duyệt viên: duyệt, lên lịch, thu hồi nội dung.
- Quản trị viên: cấu hình menu, banner, vai trò, dữ liệu, AI và báo cáo.
- Kỹ thuật viên 3D/AI: xử lý dataset, mô hình, phiên bản và chất lượng.

## Phạm vi MVP

1. Website responsive với trang chủ, triển lãm, hiện vật, bản đồ 3D và tìm kiếm.
2. CMS động cho menu, banner, trang, khu vực, tour, hiện vật, QR, media và bản dịch.
3. Tour Guide mobile-first: quét QR, định vị khu vực, phát thuyết minh.
3a. Xác định vị trí hiện tại bằng QR hoặc nhận diện ảnh không gian; luôn có xác nhận/fallback khi AI không chắc.
4. Nhận diện hiện vật từ ảnh với top-k kết quả và cơ chế “không chắc chắn”.
5. Viewer cho mô hình 3D có sẵn; pipeline tạo 3D được xử lý bất đồng bộ.
6. Đăng nhập email/Google, phân quyền và lịch sử người dùng.
7. Dashboard nội dung, lượt xem, lượt quét, truy vấn AI và trạng thái job.
8. Docker local, Nginx, PostgreSQL, MongoDB, Redis, Express và Python AI service.

## Ngoài phạm vi MVP

- Indoor positioning chính xác cao bằng UWB/AR.
- Kafka cluster nhiều broker; MVP dùng BullMQ/Redis, chỉ chuyển Kafka khi tải sự kiện thực sự lớn.
- Tự động tạo mô hình 3D chất lượng bảo tồn chỉ từ một ảnh.
- Native mobile app riêng. MVP là PWA; có thể bọc Capacitor sau khi ổn định.
- Hệ thống vé, thương mại điện tử và CRM.

## Chỉ số thành công

- 300–500 người dùng đồng thời ở nội dung đọc/cache.
- API đọc phổ biến p95 dưới 500 ms khi cache hit; tải đầu trang p75 LCP dưới 2.5 giây trên mạng 4G tốt.
- QR mở đúng nội dung dưới 2 giây, không bắt buộc đăng nhập.
- Admin thay banner/menu/nội dung và xuất bản mà không deploy lại.
- AI trả top-3 kèm confidence; trường hợp thấp phải yêu cầu chụp lại hoặc cho tìm thủ công.
- Không có secret trong Git; mọi thao tác quản trị quan trọng có audit log.

## Giả định

- Bảo tàng cung cấp quyền sử dụng dữ liệu, hình ảnh và bản dịch.
- Không phải hiện vật nào cũng có 3D; UI dùng chiến lược progressive enhancement.
- Dữ liệu định vị ban đầu dựa trên sơ đồ tầng và node/edge do admin tạo.
- Kết quả AI là công cụ hỗ trợ, không thay thế kết luận chuyên gia bảo tàng.
