# Rủi ro và phương án dự phòng

| Rủi ro | Khả năng/Tác động | Giảm thiểu | Fallback |
|---|---|---|---|
| Thiếu dữ liệu hiện vật đa góc | Cao/Cao | Lập shot list, ưu tiên hiện vật tiêu biểu | Ảnh + text + 360 video |
| Photogrammetry thất bại với vật bóng | Cao/Vừa | Ánh sáng/kỹ thuật scan phù hợp | Model thủ công hoặc không 3D |
| AI nhận diện nhầm | Cao/Cao | Top-k, calibration, zone prior, feedback | Tìm thủ công/QR |
| LLM bịa thông tin | Vừa/Cao | RAG nguồn đã duyệt, gating | Trả “chưa đủ dữ liệu” |
| Trang 3D lag mobile | Cao/Cao | LOD/KTX2/lazy load/perf budget | Bản đồ 2D/gallery |
| Admin quá tự do làm vỡ UI | Vừa/Cao | Block schema có kiểm soát, preview | Rollback version |
| Đội ôm quá nhiều công nghệ | Cao/Cao | Modular monolith, BullMQ trước Kafka | Cắt tính năng mở rộng |
| Rò rỉ API key | Vừa/Cao | env/secret scan/rotation | Thu hồi và rotate ngay |
| 500 user làm nghẽn DB | Vừa/Cao | CDN/cache/index/pool/load test | Read-only degraded mode |
| Nội dung vi phạm bản quyền | Vừa/Cao | Metadata license/credit/approval | Unpublish asset |
| Internet trong bảo tàng yếu | Cao/Vừa | PWA cache/audio preload có chọn lọc | Nội dung text/QR offline pack |

Rủi ro được review mỗi sprint; mỗi mục có owner, ngày cập nhật và bằng chứng giảm thiểu trong công cụ quản lý dự án.
