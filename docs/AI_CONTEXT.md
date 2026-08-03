# AI Context — đọc nhanh dự án

File này là điểm bắt đầu tiết kiệm token cho chat mới. Không thay thế tài liệu chi tiết.

## Sản phẩm

Nền tảng bảo tàng số cho Bảo tàng Lịch sử Thành phố Hồ Chí Minh:

- Public Web/PWA mobile-first.
- CMS/Admin điều khiển toàn bộ nội dung, layout, theme, motion và scene; không hard-code dữ liệu production.
- Web 3D và dẫn đường trong nhà bằng graph/A*.
- Xác định vị trí bắt đầu bằng QR hoặc ảnh không gian với confidence/fallback.
- QR Tour, AI Guide dùng hybrid RAG và voice đa ngôn ngữ.
- Dòng thời gian sống có free/guided modes dùng chung QR resolver; guided dùng curator graph, free có related artifacts theo typed relation đã duyệt/lý do/nguồn; QR chỉ mở 3D đã duyệt hoặc fallback, MVP 2D trước AI/3D.
- Nhận diện hiện vật bằng embedding retrieval/top-k/confidence.
- Digital Twin/photogrammetry, model version và kiểm duyệt.
- Dashboard nội dung, AI, job và analytics.

## Stack đã chốt ở mức baseline

- React + TypeScript + Vite + Tailwind CSS.
- Three.js/React Three Fiber cho 3D; motion library theo Option Review.
- Express + TypeScript modular monolith.
- Python/FastAPI cho AI/worker.
- PostgreSQL + pgvector: nghiệp vụ/quan hệ/vector.
- MongoDB: conversation/inference/interaction log linh hoạt.
- Redis/BullMQ: cache, rate limit, lock và job.
- Cloudinary/object storage: media và GLB.
- Docker Compose + Nginx.

## Nguyên tắc bất biến

- Nội dung production phải qua CMS/API.
- Draft/unapproved content không public hoặc vào RAG.
- Backend kiểm tra permission/ownership.
- AI không tự publish; thiếu nguồn phải từ chối; confidence thấp phải fallback.
- Thiếu 3D vẫn có ảnh/video/text.
- Secret không commit/log.
- Mỗi người làm feature branch riêng; `develop` là nguồn tích hợp.
- Code riêng nhưng contract/entity/event/design token phải thống nhất.
- Code xong phải cập nhật đúng feature Markdown.

## Cách AI làm việc

1. Onboarding đọc docs ngắn, không đọc source.
2. Hỏi người dùng tên/Member ID rồi mới đối chiếu `TEAM.md`; không suy luận danh tính từ Git trước câu trả lời.
3. Đề xuất task `READY`, không nhận task người khác.
4. Đưa phương án `DESIGN_OPTIONS`; người dùng chọn rồi `PLAN_LOCKED`.
5. Implementation mới đọc feature doc và code trong write scope.
6. Cập nhật flow, thuật toán, ưu/nhược điểm, decision/change history.
7. Tối đa ghi `IMPLEMENTED`; người dùng xác nhận `VERIFIED`.
8. AI chỉ tự commit/push Markdown-only coordination đã được nhóm xác nhận lên remote `develop`, ưu tiên worktree riêng để giữ nguyên feature branch; không tự push/merge implementation, force-push hoặc bỏ qua conflict. Khi feature xong, AI chỉ đề xuất để người dùng tự push/review/merge.
9. AI hướng dẫn theo gate/checkpoint, mỗi lần một bước an toàn và bám dependency của plan.
10. Sau merge vào develop, chạy Merge Memory Sync để người sau biết capability/component/contract đã có.
11. Shared plan có revision trong `PLAN_SNAPSHOT.md`; sau pull chỉ đọc lại owner docs liên quan revision mới.
12. Trước mỗi implementation session mới hoặc sau 4 giờ không hoạt động được ghi nhận, hỏi lại tên/Member ID; ghi contribution ledger và handoff trong feature owner.
13. Feature branch ghi session/evidence tại `docs/work/<TASK-ID>.md`, không sửa shared README/CURRENT_TASK/status/index/contract catalogs; AI chỉ cập nhật các file chung bằng coordination worktree trên `develop`.

## Trạng thái hiện tại

Foundation monorepo, local data infrastructure, Web/Admin/API/data baselines, Living Timeline MVP và deterministic lint/type/test/build quality graph đã merge. `TASK-CI-001` cũng đã merge tại `be2a18e`; hosted run `30832872900` PASS và Merge Memory Sync hoàn tất. Task tiếp theo lấy từ dòng `READY` trong `docs/NEXT_WORK.md`, không suy đoán từ feature branch.

## Đọc tiếp

- Muốn biết nên làm gì: `PROJECT_STATUS.md`, `NEXT_WORK.md`, `TEAM.md`.
- Muốn biết plan mới thay đổi gì: `PLAN_SNAPSHOT.md`.
- Muốn hỏi một chức năng: dùng `CONTEXT_ROUTER.md`.
- Muốn biết đồng đội đã merge gì: `IMPLEMENTATION_INDEX.md` và `04-design/02-ui-component-registry.md`.
- Muốn “đọc src xem dự án làm gì”: dùng `CODEBASE_OVERVIEW`, xác minh file thật và chỉ đọc entry point/router/contracts.
- Muốn code: đọc `AGENTS.md`, `PROJECT_BRAIN.md`, `CURRENT_TASK.md`, feature owner và contract liên quan.
- Muốn hỏi Git: `07-delivery/07-git-playbook.md`.

Nếu thông tin compact khác tài liệu owner/ADR accepted, báo conflict và mở đúng nguồn chi tiết; không tự chọn.
