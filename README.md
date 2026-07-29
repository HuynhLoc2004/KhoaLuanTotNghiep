# HCMC History Museum Digital Experience

Nền tảng web và mobile-first ứng dụng công nghệ 4.0, AI, 3D và Digital Twin để bảo tồn và phát huy giá trị di sản tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh.

## Nguyên tắc cốt lõi

- Nội dung hiển thị cho khách tham quan được quản trị từ CMS/Admin, không hard-code trong giao diện.
- Trải nghiệm hoạt động tốt trên máy tính và điện thoại, ưu tiên mobile tại bảo tàng.
- Hiện vật có thể có hoặc chưa có mô hình 3D; hệ thống phải tự chọn cách trình bày phù hợp.
- Tách tác vụ web thời gian thực khỏi tác vụ AI/3D nặng bằng hàng đợi.
- PostgreSQL giữ dữ liệu nghiệp vụ có quan hệ; MongoDB giữ log, hội thoại và dữ liệu linh hoạt; Redis dùng cache, rate limit và job state.
- Media và mô hình 3D được lưu trên Cloudinary/object storage, không lưu binary trong database.
- Secret chỉ tồn tại trong biến môi trường hoặc secret manager, tuyệt đối không commit.

## Bản đồ tài liệu

1. [Tầm nhìn và phạm vi](docs/00-product/01-vision-scope.md)
2. [Thuật ngữ và quy ước](docs/00-product/02-glossary-conventions.md)
3. [Kiến trúc tổng thể](docs/01-architecture/01-system-architecture.md)
4. [Lựa chọn công nghệ](docs/01-architecture/02-technology-decisions.md)
5. [Mô hình dữ liệu và quan hệ đa cơ sở dữ liệu](docs/02-data/01-data-model.md)
6. [API và hợp đồng tích hợp](docs/02-data/02-api-contract.md)
7. [CMS/Admin động](docs/03-features/01-admin-cms.md)
8. [Website 3D và dẫn đường](docs/03-features/02-web-3d-navigation.md)
9. [Mobile AI Tour Guide và QR](docs/03-features/03-ai-tour-guide.md)
10. [AI nhận diện hiện vật](docs/03-features/04-artifact-recognition.md)
11. [Digital Twin và pipeline quét 3D](docs/03-features/05-digital-twin.md)
12. [Đa ngôn ngữ, text và voice](docs/03-features/06-multilingual-voice.md)
13. [Tài khoản, đăng nhập Google và lịch sử](docs/03-features/07-auth-user-history.md)
14. [Dashboard và báo cáo](docs/03-features/08-dashboard-analytics.md)
15. [Thiết kế UI/UX](docs/04-design/01-ui-ux-design-system.md)
16. [Bảo mật và quyền riêng tư](docs/05-quality/01-security-privacy.md)
17. [Hiệu năng và khả năng mở rộng](docs/05-quality/02-performance-scalability.md)
18. [Chiến lược kiểm thử](docs/05-quality/03-testing-strategy.md)
19. [Docker, môi trường và CI/CD](docs/06-devops/01-local-environment.md)
20. [Quan sát hệ thống và vận hành](docs/06-devops/02-observability-operations.md)
21. [Roadmap và chia việc](docs/07-delivery/01-roadmap.md)
22. [Rủi ro và phương án dự phòng](docs/07-delivery/02-risk-register.md)
23. [Tiêu chí nghiệm thu](docs/07-delivery/03-acceptance-criteria.md)
24. [Quy trình quản lý thay đổi](docs/07-delivery/04-change-management.md)
25. [Mẫu đặc tả chức năng mới](docs/templates/feature-template.md)

## Trạng thái

Đây là baseline kiến trúc v0.1. Khi thêm một chức năng mới, tạo một file riêng trong `docs/03-features/`, cập nhật mục lục này và ghi rõ flow, dữ liệu, API, thuật toán, bảo mật, kiểm thử, ưu/nhược điểm.
