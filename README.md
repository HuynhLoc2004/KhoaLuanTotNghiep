# HCMC History Museum Digital Experience

Nền tảng web và mobile-first ứng dụng công nghệ 4.0, AI, 3D và Digital Twin để bảo tồn và phát huy giá trị di sản tại Bảo tàng Lịch sử Thành phố Hồ Chí Minh.

> Trước khi code hoặc dùng AI/vibe coding, đọc [PROJECT_BRAIN.md](PROJECT_BRAIN.md). Đây là nguồn định hướng chung về kiến trúc, flow, dữ liệu, thuật toán, bảo mật, scale và quy trình làm việc.

Chat mới chỉ cần hiểu sơ qua: bắt đầu tại [AI_CONTEXT.md](docs/AI_CONTEXT.md) rồi dùng [CONTEXT_ROUTER.md](docs/CONTEXT_ROUTER.md). Không cần đọc toàn bộ tài liệu hoặc source code.

Trạng thái triển khai hiện tại được theo dõi tại [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md). Chi tiết quyết định và lịch sử thay đổi phải được ghi trong đúng file chức năng.

## Trạng thái phối hợp hiện tại

- Shared plan revision: `PLAN-0034` — Pre-Code Plan Sync khởi tạo TASK-AI-GUIDE-001 (Trợ Lý Thuyết Minh Viên AI & Hỏi Đáp Di Sản MVP) bởi `loc` trên nhánh `feature/TASK-AI-GUIDE-001`.
- `TASK-FOUND-001`: `DONE`, owner `thanh`; `VERIFIED` và merge vào `develop` tại `3d8b971`, Merge Memory Sync đã công bố foundation/tooling baseline.
- `TASK-INFRA-001`: `DONE`, owner `loc`; `VERIFIED` và merge vào `develop` tại `847251c`, Merge Memory Sync đã công bố local database infrastructure baseline.
- `TASK-WEB-001`: `DONE`, owner `thanh`; `VERIFIED` và merge vào `develop` tại `03dfcd4`, Merge Memory Sync đã công bố Public Web shell & Design Tokens baseline.
- `TASK-API-001`: `DONE`, owner `thanh`; `VERIFIED` và merge vào `develop` tại `8afa7c8`, Merge Memory Sync đã công bố Express API skeleton & Error Contract baseline.
- `TASK-ADMIN-001`: `DONE`, owner `thanh`; `VERIFIED` và merge vào `develop` tại `5ce59f2`, Merge Memory Sync đã công bố Admin Shell & CMS Form Editor baseline.
- `TASK-DATA-001`: `DONE`, owner `thanh`; `VERIFIED` và merge vào `develop` tại `d75cdf8`, Merge Memory Sync đã công bố PostgreSQL DDL migration & entity baseline.
- `TASK-TIMELINE-001`: `DONE`, owner `thanh`; `VERIFIED` và merge vào `develop` tại `92c7caa`, Merge Memory Sync đã công bố Living Timeline MVP baseline.
- `TASK-SEARCH-001`: `DONE`, owner `loc`; `VERIFIED` và merge vào `develop` tại `400d328` qua PR `#11`, Merge Memory Sync đã công bố Search & Discovery MVP baseline.
- `TASK-AUTH-001`: `DONE`, owner `loc`; `VERIFIED` và merge vào `develop` tại `8e76271` qua PR `#12`, Merge Memory Sync đã công bố Keycloak IAM & User History MVP baseline.
- `TASK-DASHBOARD-001`: `DONE`, owner `loc`; `VERIFIED` và merge vào `develop` tại `1439807` qua PR `#13`, Merge Memory Sync đã công bố Dashboard Analytics MVP baseline.
- `TASK-AI-GUIDE-001`: `IN_PROGRESS`, owner `loc`; nhánh `feature/TASK-AI-GUIDE-001`; Pre-Code Plan Sync PASS.
- `FIX-LINT-001`: `DONE`, owner `thanh`; `VERIFIED` và merge vào `develop` tại `cc1c600`, Merge Memory Sync đã công bố workspace ESLint quality gate 100% PASS.
- `FIX-FORMAT-001`: `DONE`, owner `thanh`; PR `#6` merge tại `8d199db`, actual six-path scope deviation đã được review, hosted run `30832872900` PASS và Merge Memory Sync PASS.
- `TASK-CI-001`: `DONE`, owner `loc`; PR `#4` merge tại `be2a18e`, hosted run `30832872900` PASS và Merge Memory Sync PASS; verified by `thanh`.
- `FIX-CLEAN-GATE-001`: `DONE`, owner `thanh`; PR `#7` merge tại `8bf9c9e`, local clean gates và hosted integrated run `30832872900` PASS; Merge Memory Sync PASS.
- `TASK-DOC-QUALITY-001`: `DONE`, owner `thanh`; PR `#9` merge tại `e0c4139`, repository quality policies được xác minh bởi integrated run `30841444661` và Merge Memory Sync PASS.
- `FIX-DOC-QUALITY-CI-001`: `DONE`, owner `thanh`; commit `fd49df3` / PR `#10` merge tại `7c63cbb`; PR run `30841432956` và develop run `30841444661` đều có hai job PASS.
- Nguồn chi tiết: [Task registry](docs/NEXT_WORK.md), [Plan Snapshot](docs/PLAN_SNAPSHOT.md), [Project Status](docs/PROJECT_STATUS.md).

Mọi thay đổi shared plan, task, owner, branch, dependency, write scope hoặc shared contract phải được Codex commit/push dưới dạng Markdown-only lên remote `develop`, kèm cập nhật README. AI ưu tiên coordination worktree để giữ nguyên active feature branch. Code/test trên feature branch không được AI tự push hoặc merge; khi hoàn tất, AI chỉ đề xuất để người dùng tự push/review/merge.

Mỗi người chỉ làm write scope đã công bố trên `develop`; không cần biết hoặc xem realtime branch của người kia. Đầu phiên, AI tự đọc trạng thái coordination mới nhất và chặn thay đổi ngoài scope. Chỉ shared file/contract mới tạo coordination checkpoint.

Chỉ một thành viên giữ integration turn để merge/push `develop` tại một thời điểm. Người kế tiếp chờ merge trước và Markdown Merge Memory Sync hoàn tất, cập nhật local `develop` bằng fast-forward rồi mới merge task `VERIFIED` của mình; không force-push hoặc nhập `develop` qua lại vào feature đã code xong chỉ để phòng conflict.

Khi AI đã trình bày task, owner, branch, dependency và write scope, câu xác nhận bắt đầu của người dùng là quyền cho AI tự hoàn tất Pre-code Plan Sync trên workspace hiện tại: publish coordination Markdown, kiểm tra working tree, cập nhật local `develop` bằng fast-forward, tạo/chuyển đúng feature branch, mở session/task report và code. AI dừng khi có dirty tree, divergence, conflict, missing tracking hoặc scope mơ hồ; không tự push/merge implementation.

Feature branch ghi session/evidence tại `docs/work/<TASK-ID>.md` và không sửa README, CURRENT_TASK, shared status/index/catalog files. Các file chung chỉ được AI cập nhật trên `develop`; sau merge, Merge Memory Sync promote evidence vào owner docs/indexes.

Mọi yêu cầu code, sửa lỗi hoặc bổ sung chức năng đều tự động kéo theo cập nhật/tạo tài liệu sở hữu tương ứng. Plan cũ được giữ và đánh dấu thay thế, không bị ghi đè âm thầm.

Thành viên vừa clone repository và chưa chọn việc: yêu cầu AI vào chế độ onboarding, đọc tài liệu và đề xuất task `READY` từ [docs/NEXT_WORK.md](docs/NEXT_WORK.md). Chưa cần đọc source code cho đến khi chọn task.

AI hỏi tên hoặc Member ID trước rồi đối chiếu [docs/TEAM.md](docs/TEAM.md); Git author chỉ là kiểm tra nhất quán phụ sau xác nhận, không cần quyền GitHub và không lưu email.

## Nguyên tắc cốt lõi

- Nội dung hiển thị cho khách tham quan được quản trị từ CMS/Admin, không hard-code trong giao diện.
- Trải nghiệm hoạt động tốt trên máy tính và điện thoại, ưu tiên mobile tại bảo tàng.
- Hiện vật có thể có hoặc chưa có mô hình 3D; hệ thống phải tự chọn cách trình bày phù hợp.
- Tách tác vụ web thời gian thực khỏi tác vụ AI/3D nặng bằng hàng đợi.
- PostgreSQL giữ dữ liệu nghiệp vụ có quan hệ; MongoDB giữ log, hội thoại và dữ liệu linh hoạt; Redis dùng cache, rate limit và job state.
- Media và mô hình 3D được lưu trên Cloudinary/object storage, không lưu binary trong database.
- Secret chỉ tồn tại trong biến môi trường hoặc secret manager, tuyệt đối không commit.
- Stack là baseline mở; ngôn ngữ/runtime mới được phép khi có Option Review và bằng chứng giá trị, không thêm chỉ để phô công nghệ.

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
26. [Trạng thái triển khai hiện tại](docs/PROJECT_STATUS.md)
27. [Business invariants](docs/00-product/03-business-invariants.md)
28. [Contract catalog](docs/02-data/03-contract-catalog.md)
29. [Data catalog](docs/02-data/04-data-catalog.md)
30. [Traceability matrix](docs/07-delivery/05-traceability-matrix.md)
31. [ADR index](docs/01-architecture/adr/README.md)
32. [Công việc hiện tại](CURRENT_TASK.md)
33. [Mẫu bàn giao](docs/templates/handoff-template.md)
34. [Công việc có thể nhận tiếp](docs/NEXT_WORK.md)
35. [Quy trình cộng tác hai người](docs/07-delivery/06-two-person-collaboration.md)
36. [Mẫu trả lời onboarding](docs/templates/onboarding-response-template.md)
37. [Danh sách thành viên](docs/TEAM.md)
38. [Git playbook cho nhóm](docs/07-delivery/07-git-playbook.md)
39. [Bản đồ tích hợp giữa các chức năng](docs/01-architecture/03-integration-map.md)
40. [Mẫu so sánh và khóa phương án](docs/templates/option-review-template.md)
41. [AI context đọc nhanh](docs/AI_CONTEXT.md)
42. [Context Router tiết kiệm token](docs/CONTEXT_ROUTER.md)
43. [Mẫu hướng dẫn từng bước](docs/templates/guided-execution-template.md)
44. [Idea Backlog](docs/IDEA_BACKLOG.md)
45. [Mẫu Creative Concept Review](docs/templates/creative-concept-template.md)
46. [Implementation Index](docs/IMPLEMENTATION_INDEX.md)
47. [UI Component, Motion và 3D Registry](docs/04-design/02-ui-component-registry.md)
48. [Merge Memory Sync Gate](docs/07-delivery/08-merge-memory-sync.md)
49. [Plan Snapshot và change feed](docs/PLAN_SNAPSHOT.md)
50. [Feature Report Standard](docs/templates/feature-report-standard.md)
51. [AI Experience & Documentation Quality Gate](docs/04-design/03-ai-experience-quality-gate.md)
52. [Code, Secret & Configuration Quality Gate](docs/05-quality/04-code-configuration-quality-gate.md)
53. [Database Query, Cache & Input Security Quality Gate](docs/05-quality/05-database-query-cache-quality-gate.md)
54. [Work Session & Feature Contribution Ledger](docs/07-delivery/09-work-session-contribution-ledger.md)
55. [Tìm kiếm và khám phá nội dung](docs/03-features/09-search-discovery.md)
56. [Xác định vị trí bằng QR và ảnh](docs/03-features/10-indoor-location-detection.md)
57. [Dòng thời gian sống](docs/03-features/11-living-timeline.md)
58. [Task work reports](docs/work/README.md)
59. [Task work report template](docs/templates/task-work-report-template.md)

## Trạng thái

Đây là baseline kiến trúc v0.1; trạng thái phối hợp tóm tắt ở đầu README phải được cập nhật liên tục cùng shared plan/task changes trên `develop`. Khi thêm một chức năng mới, tạo một file riêng trong `docs/03-features/`, cập nhật mục lục này và ghi rõ flow, dữ liệu, API, thuật toán, bảo mật, kiểm thử, ưu/nhược điểm.
