# Bộ não dự án — HCMC History Museum Digital Experience

## 1. Mục đích của file

Đây là nguồn định hướng chung cho hai thành viên và mọi coding agent tham gia dự án. File này trả lời: dự án đang xây gì, nguyên tắc nào không được phá vỡ, mỗi loại công việc phải đọc tài liệu nào và khi hoàn thành phải cập nhật những gì.

Khi nội dung trong một feature file khác với file này, ưu tiên quyết định mới nhất đã được nhóm chấp thuận và phải cập nhật lại cả hai nơi hoặc tạo ADR.

## 2. Tầm nhìn sản phẩm

Xây dựng nền tảng bảo tàng số mobile-first gồm:

- Website nội dung và trải nghiệm không gian 3D.
- Bản đồ trong nhà, chọn điểm đến và dẫn đường.
- QR Tour Guide theo khu vực/hiện vật.
- Dòng thời gian sống nối hiện vật thành hành trình kể chuyện, giữ mode tự do dùng chung QR/artifact pipeline và chỉ đề xuất related artifacts từ typed relationship đã được curator duyệt, có lý do/nguồn.
- AI hỏi đáp có nguồn và voice đa ngôn ngữ.
- AI nhận diện hiện vật từ ảnh.
- Digital Twin và quy trình quản lý mô hình 3D.
- CMS/Admin quản trị toàn bộ nội dung.
- Dashboard theo dõi nội dung, hành vi, AI và job xử lý.

Mục tiêu tải ban đầu là 300–500 người dùng đồng thời, chủ yếu đọc nội dung, quét QR và nghe audio. AI và xử lý 3D là tác vụ có quota, queue và backpressure riêng.

## 3. Nguyên tắc không được phá vỡ

### Nội dung phải động

Menu, banner, trang, section, triển lãm, khu vực, tour, hiện vật, QR, media, bản dịch, audio và model 3D phải do Admin/CMS quản lý. React chỉ chứa component renderer và design system, không chứa nội dung production cố định.

Seed/demo content được phép tồn tại nhưng phải được nạp qua database/CMS và có thể thay thế từ Admin mà không deploy.

Admin còn phải cấu hình được:

- Section nào xuất hiện, thứ tự, variant bố cục và thời gian hiển thị.
- Theme token được cho phép theo trang/triển lãm: màu nhấn, surface, typography preset và không khí thị giác.
- Motion preset: reveal, parallax, stagger, transition và intensity.
- Hero 2D/3D, background scene, hotspot, camera path và fallback media.
- CTA, liên kết, SEO metadata, navigation relation và feature flag.

Không đồng nghĩa Admin được nhập JavaScript/CSS/GLSL tùy ý. Frontend cung cấp component/motion/scene registry đã được kiểm thử; CMS chọn preset và truyền dữ liệu đã validate. Muốn có kiểu component mới thì phát triển component + schema mới, sau đó Admin mới sử dụng được.

### Không giả định hiện vật luôn có 3D

Thứ tự fallback:

`3D đã duyệt -> ảnh xoay 360/video -> gallery ảnh -> ảnh đại diện + text`

UI không được lỗi hoặc trống khi thiếu model 3D. Nội dung AI tạo không được trình bày như dữ liệu bảo tồn đã được chuyên gia xác nhận.

### Dùng đúng loại dữ liệu

- PostgreSQL: user, auth, quyền, nội dung, phiên bản, workflow, tour, map graph, hiện vật, job và dữ liệu cần transaction.
- MongoDB: hội thoại AI, inference log, interaction event và metadata linh hoạt.
- Redis: cache, rate limit, BullMQ, distributed lock và trạng thái ngắn hạn.
- Cloudinary/object storage: hình ảnh, video, audio và GLB; database chỉ giữ ID, URL, checksum và metadata.

Không tạo foreign key xuyên PostgreSQL và MongoDB. Đồng bộ bằng transactional outbox và idempotent consumer, chấp nhận eventual consistency cho log/analytics.

### Tác vụ nặng phải bất đồng bộ

Nhận diện ảnh, tạo embedding, TTS hàng loạt, xử lý scan/3D và export lớn phải đi qua queue:

`API validate -> tạo job PostgreSQL -> BullMQ -> worker -> cập nhật progress -> review -> publish`

Không giữ HTTP request mở trong toàn bộ quá trình xử lý dài. Kafka chỉ được thêm khi số liệu chứng minh BullMQ không đủ hoặc cần replay/many consumers; không dùng chỉ để tăng số lượng công nghệ.

### AI phải có confidence và fallback

- Recognition trả top-k, confidence và model version.
- Confidence thấp phải yêu cầu chụp lại, quét QR hoặc tìm thủ công.
- AI Guide dùng nội dung đã duyệt, hybrid RAG và nguồn trích dẫn.
- Không đủ nguồn thì trả lời chưa có dữ liệu, không bịa.
- Output AI muốn trở thành nội dung chính thức phải qua workflow duyệt.

### Bảo mật từ đầu

- Backend là nơi kiểm tra authentication, authorization và ownership.
- Admin dùng RBAC, audit log và khuyến nghị MFA.
- Upload dùng signed URL, giới hạn size/type, magic-byte và scan.
- Rich text phải sanitize; query phải validate và parameterize.
- Secret/API key chỉ ở backend và `.env` bị ignore.
- AI/upload/login có rate limit và quota riêng.
- Dữ liệu người dùng có consent, retention và cơ chế xóa.

## 4. Kiến trúc mặc định

```text
React Web/PWA ─┐
React Admin ───┼─> Nginx ─> Express API/BFF
               │                ├─> PostgreSQL + pgvector
               │                ├─> MongoDB
               │                ├─> Redis/BullMQ
               │                └─> Cloudinary
               │
               └──────── jobs ─> Python FastAPI/AI worker
                                └> Media/3D worker
```

- Frontend: React, TypeScript, Vite, Tailwind CSS, TanStack Query.
- UI/motion: shared design system, Framer Motion có motion budget.
- 3D: Three.js, React Three Fiber, Drei, glTF/GLB, Draco/Meshopt, KTX2.
- Backend: Express + TypeScript theo modular monolith.
- AI: Python + FastAPI do hệ sinh thái CV/ML phù hợp.
- Local: Docker Compose; reverse proxy/load balance bằng Nginx.

Chỉ tách microservice mới khi workload, ownership hoặc deployment thực sự cần. AI/3D được tách sớm vì phụ thuộc và tài nguyên khác API.

## 5. Flow cốt lõi

### CMS publish

`Editor tạo draft -> validate schema -> gửi duyệt -> reviewer duyệt -> schedule/publish -> outbox event -> invalidation cache -> public API`

Phải có preview, optimistic concurrency, version và rollback.

### QR Tour

`Scan QR token -> resolve zone/tour stop -> lấy nội dung theo locale -> phát audio/text -> đề xuất điểm tiếp theo -> ghi event có consent`

QR không chứa dữ liệu nhạy cảm và chức năng đọc cơ bản không bắt buộc đăng nhập.

### Dẫn đường

`Chọn/quét vị trí đầu -> chọn POI đích -> A* trên graph -> vẽ tuyến 2D/3D -> quét QR mới để cập nhật/re-route`

A* là mặc định; edge có distance, floor, accessibility và trạng thái đóng. Có bản đồ 2D fallback.

### Nhận diện hiện vật

`Kiểm tra chất lượng ảnh -> signed upload -> embedding -> vector search -> rerank theo zone/metadata -> top-k/confidence -> user feedback`

MVP ưu tiên embedding retrieval vì thêm hiện vật mới không cần train lại classifier. Detection/metric learning chỉ thực hiện khi dataset đủ.

### AI Guide

`Question/STT -> language + moderation -> lexical/vector retrieval -> RRF/rerank -> context -> LLM grounded answer -> citation -> TTS/cache`

RAG phù hợp hơn fine-tune cho kho kiến thức thường xuyên cập nhật. Điểm yếu nằm ở chunking, metadata và retrieval nên phải có golden questions và đánh giá nguồn.

### Digital Twin

`Chụp ảnh -> quality check -> feature matching/SfM -> MVS mesh -> texture -> cleanup/LOD/compression -> technical review -> curator review -> publish`

Photogrammetry phù hợp vì chi phí thấp nhưng yếu với vật bóng/trong suốt. Model phải có provenance, version, checksum và sai số nếu đo được.

## 6. Chuẩn UI/UX

- Mobile-first vì trải nghiệm chính xảy ra tại bảo tàng.
- Desktop tận dụng layout hai cột cho 3D/map và panel thông tin.
- Hình ảnh hiện vật là trung tâm; ngôn ngữ hình ảnh mang bản sắc “di sản sống trong không gian số”, không giống template SaaS/dashboard phổ thông.
- Trải nghiệm 3D/chiều sâu xuất hiện có chủ đích xuyên suốt: hero, chuyển cảnh, artifact reveal, map, hotspot, timeline và audio visualization; không giới hạn trong một trang viewer riêng.
- Animation gồm vi tương tác, entrance/reveal, shared transition, spatial transition, camera choreography, parallax nhiều lớp, shader nhẹ và phản hồi âm thanh/haptic khi nền tảng hỗ trợ.
- Microinteraction dùng transform/opacity 120–350 ms; cinematic transition có thể dài hơn nhưng phải bỏ qua được và không chặn thao tác.
- 3D lazy load, LOD, pause khi tab ẩn và giới hạn pixel ratio trên máy yếu.
- Mọi màn hình có loading, empty, error, offline và fallback.
- Touch target khoảng 44 px, contrast WCAG AA, audio có transcript.
- Tôn trọng `prefers-reduced-motion`; mọi thông tin truyền bằng animation phải có hình thức tĩnh tương đương.

### Experience quality tiers

- `Cinematic`: desktop/GPU tốt, full scene, post-processing có giới hạn, camera transition và texture chất lượng cao.
- `Balanced`: mobile trung bình, LOD thấp hơn, giảm shadow/post-processing nhưng giữ chiều sâu và chuyển động chính.
- `Lite`: máy yếu/reduced-data/reduced-motion, bản đồ 2D, ảnh/video và transition tối giản.

Tier được chọn từ capability probe và tín hiệu người dùng, không dựa riêng vào user-agent. Người dùng có nút giảm hiệu ứng/chất lượng.

### Quy tắc cài thư viện

Có thể sử dụng công nghệ hiện đại khi tạo giá trị rõ ràng, nhưng mỗi dependency phải ghi mục đích, kích thước/chi phí runtime, bảo mật, khả năng bảo trì và phương án thay thế. Không cài nhiều thư viện trùng vai trò. AI giúp triển khai nhanh nhưng không loại bỏ bundle budget, compatibility test và dependency audit.

### Ngôn ngữ và công nghệ không bị khóa cứng

React/TypeScript, Express và Python là baseline, không phải danh sách duy nhất được phép dùng. Codex có thể đề xuất Go, Rust, Java/Kotlin, C/C++, WebAssembly, search/vector engine hoặc dịch vụ chuyên dụng khi workload chứng minh cần.

Trước khi thêm runtime/service mới phải có Option Review: nút thắt, benchmark/evidence, boundary/contract, Docker/CI/observability, chi phí học và bảo trì cho nhóm hai người, license/hosting/vendor lock-in, ưu nhược điểm, migration/rollback và phương án không thêm công nghệ.

Không thêm ngôn ngữ chỉ để báo cáo “đa công nghệ”. Nếu TypeScript/Python đáp ứng SLO với độ phức tạp thấp hơn thì giữ baseline.

## 7. Chuẩn hiệu năng và scale

- API cache hit p95 dưới 200 ms; cache miss phổ biến p95 dưới 500 ms.
- Trang nội dung hướng tới LCP p75 dưới 2.5 giây.
- Bundle 3D/AI không nằm trong initial bundle.
- Media phục vụ qua CDN và responsive format.
- API stateless để Nginx phân phối nhiều replica.
- Redis cache-aside có TTL jitter/stale-while-revalidate.
- PostgreSQL có pool, index theo query thực tế và tránh N+1.
- K6 kiểm thử ramp 300 rồi 500 user, spike và soak.

Không tuyên bố chịu được 500 user chỉ từ thiết kế; phải có báo cáo load test và thông số môi trường.

## 8. Git và phạm vi trách nhiệm

Nhóm tự thực hiện push, test, review và merge implementation. Coding agent chỉ tự commit/push Markdown-only coordination change đã được nhóm xác nhận lên remote `develop`, ưu tiên worktree riêng để giữ nguyên active feature branch; không tự push/merge implementation hoặc force-push.

Branch:

- `main`: bản ổn định/demo/release.
- `develop`: tích hợp chức năng đã review.
- `feature/<ten-ngan>`: chức năng mới, tạo từ `develop`.
- `fix/<ten-ngan>`: sửa lỗi có phạm vi rõ.

Trước mỗi lần sửa file, coding agent phải kiểm tra nhánh và nói rõ nhánh hiện tại có đúng với loại công việc không. Nếu đang sai nhánh thì dừng và yêu cầu người dùng chuyển nhánh.

## 9. Quy trình thực hiện một chức năng

1. Đọc file này.
2. Đọc feature file liên quan trong `docs/03-features/`.
3. Kiểm tra Git branch và working tree; không ghi đè thay đổi của người khác.
4. Chốt lát cắt nhỏ có thể chạy/test độc lập.
5. Cập nhật feature spec trong cùng lượt làm việc với code; không chờ đến cuối dự án.
6. Implement xuyên suốt contract cần thiết: UI -> API -> data/worker.
7. Thêm validation, permission, logging, fallback và test.
8. Chạy lint/typecheck/test/build phù hợp.
9. Ghi Implementation status, Decision log và Change history đúng file chức năng.
10. Cập nhật `docs/PROJECT_STATUS.md` nếu trạng thái milestone/feature thay đổi.
11. Báo file đã đổi, test đã chạy, hạn chế còn lại và tiêu chí để nhóm review.

Agent dừng ở bước bàn giao. Người dùng tự review, test thêm, commit và merge.

## 10. Markdown là trí nhớ dài hạn của dự án

Code cho biết hệ thống đang chạy như thế nào; tài liệu phải cho biết vì sao nó được làm như vậy, đã thử gì, giới hạn nào còn tồn tại và bước tiếp theo là gì. Một thay đổi code không cập nhật trí nhớ liên quan được xem là chưa hoàn thành để review.

### Ghi thông tin ở đâu

| Loại thông tin | Nơi ghi |
|---|---|
| Flow, UI, API, thuật toán, dữ liệu của một chức năng | File tương ứng trong `docs/03-features/` |
| Trạng thái đã làm/chưa làm của chức năng | Mục `Implementation status` trong file chức năng |
| Quyết định nhỏ chỉ thuộc một chức năng | Mục `Decision log` trong file chức năng |
| Lịch sử code/fix của chức năng | Mục `Change history` trong file chức năng |
| Quyết định thay service boundary, database, framework hoặc security model | ADR trong `docs/01-architecture/adr/` |
| Migration/schema dùng chung | `docs/02-data/` và feature liên quan |
| Docker, CI/CD, Nginx, deploy | `docs/06-devops/` |
| Quy tắc UI/design system dùng chung | `docs/04-design/` |
| Bảo mật/performance/testing dùng chung | `docs/05-quality/` |
| Tiến độ toàn dự án và việc tiếp theo | `docs/PROJECT_STATUS.md` |
| Hướng dẫn khởi động và mục lục | `README.md` |

Không sao chép nguyên một thông tin dài ở nhiều nơi. Ghi chi tiết tại nơi sở hữu, các nơi khác liên kết tới nó.

Mọi shared plan/task coordination update đã được nhóm chấp nhận phải cập nhật `README.md` trong cùng commit trên `develop`. README chỉ giữ revision/trạng thái/task owner hiện hành và đường dẫn đến nguồn chi tiết; không sao chép toàn bộ plan hoặc decision log.

Hai thành viên không phải theo dõi hoặc nhắc nhau về thay đổi branch-local. AI chịu trách nhiệm đọc coordination state mới nhất trên remote `develop` ở đầu phiên và khóa chỉnh sửa theo write scope đã công bố. Không biết code chưa push của người kia không phải blocker nếu scope không giao nhau; yêu cầu chạm shared/foreign scope phải dừng và đi qua coordination Markdown trên `develop`.

Để tránh conflict cấu trúc, feature branch không sửa README, CURRENT_TASK, NEXT_WORK, PLAN_SNAPSHOT, PROJECT_STATUS, implementation/UI indexes hoặc shared contract/integration catalogs. Mọi task-local plan/session/evidence/handoff nằm tại `docs/work/<TASK-ID>.md`; sau merge, AI mới tổng hợp capability/trạng thái chung trên `develop` qua Merge Memory Sync.

### Những thay đổi bắt buộc phải lưu vết

- Thêm/sửa/xóa flow hoặc trạng thái UI.
- Thêm/sửa/xóa endpoint, field, event, permission, cache key hoặc database schema.
- Chọn/đổi thuật toán, model, prompt, threshold hoặc scoring weight.
- Thay đổi fallback, retry, timeout, rate limit hoặc quota.
- Fix bug có thể tái diễn hoặc cho thấy giả định cũ sai.
- Workaround/nợ kỹ thuật và điều kiện để gỡ bỏ.
- Kết quả benchmark, load test, AI evaluation hoặc security test.
- Khác biệt giữa plan và implementation thực tế.
- Dependency/công nghệ mới cùng lý do, ưu/nhược điểm.

Không cần ghi từng chỉnh sửa format, đổi tên biến nội bộ hoặc lỗi chính tả không ảnh hưởng hành vi.

### Cấu trúc lưu vết trong feature file

Mỗi feature có ba mục sống:

1. `Implementation status`: checklist theo lát cắt, ghi rõ `PLANNED`, `IN_PROGRESS`, `IMPLEMENTED`, `VERIFIED`, `DEFERRED`.
2. `Decision log`: ngày, quyết định, lý do, phương án đã loại và hệ quả.
3. `Change history`: ngày, loại `ADDED/CHANGED/FIXED/SECURITY/PERFORMANCE`, mô tả hành vi, file/module và test đã chạy.

Chỉ đánh dấu `VERIFIED` sau khi người dùng/nhóm đã test hoặc có bằng chứng test phù hợp. Coding agent hoàn thành code nhưng chưa được người dùng review thì dùng `IMPLEMENTED`, không tự ghi `VERIFIED`.

### Khi fix bug

Ghi tại feature sở hữu bug:

- Triệu chứng và điều kiện tái hiện.
- Root cause, không chỉ mô tả dòng code sai.
- Cách fix và lý do chọn.
- Regression test đã thêm/chạy.
- Ảnh hưởng migration/cache/backward compatibility.

Nếu bug do nguyên tắc dùng chung, cập nhật thêm tài liệu chất lượng/kiến trúc và liên kết, không copy toàn bộ nội dung.

## 11. Nội dung bắt buộc trong mỗi feature file

Mỗi chức năng phải có:

1. Mục tiêu, persona và trong/ngoài phạm vi.
2. User flow, alternate flow, error và fallback.
3. UI responsive, accessibility và các trạng thái.
4. Data entity, quan hệ, index, retention và nơi lưu.
5. API/event, idempotency, pagination và cache invalidation.
6. Thuật toán: input/output, cách hoạt động, metric và ngưỡng.
7. Các phương án so sánh.
8. Ưu điểm, nhược điểm và mức độ phù hợp với đồ án.
9. Khả năng mở rộng ở 300–500 user và đường scale sau đó.
10. Authentication, authorization, rate limit, privacy và audit.
11. Unit/integration/E2E/load/security/AI evaluation phù hợp.
12. Tiêu chí nghiệm thu đo được.
13. Migration, rollout, rollback và rủi ro.
14. Implementation status, decision log và change history.

Dùng [mẫu chức năng](docs/templates/feature-template.md) khi tạo file mới.

## 12. Bản đồ tài liệu phải đọc theo công việc

| Công việc | Tài liệu bắt buộc |
|---|---|
| Nền tảng/repository | `docs/01-architecture/*`, `docs/06-devops/*` |
| Database/API | `docs/02-data/*`, security và performance |
| CMS/Admin | `docs/03-features/01-admin-cms.md` |
| Web 3D/map | `02-web-3d-navigation.md`, `05-digital-twin.md` |
| QR/AI Guide | `03-ai-tour-guide.md`, `06-multilingual-voice.md` |
| Dòng thời gian sống | `11-living-timeline.md`, `01-admin-cms.md`, `03-ai-tour-guide.md` |
| Recognition | `04-artifact-recognition.md` |
| Auth/history | `07-auth-user-history.md` |
| Dashboard | `08-dashboard-analytics.md` |
| UI chung | `docs/04-design/01-ui-ux-design-system.md` |
| Release/hardening | `docs/05-quality/*`, `docs/07-delivery/*` |

## 13. Definition of Done

Một chức năng chỉ được báo “đã code xong để review” khi:

- Code chạy được trên môi trường tài liệu đã mô tả.
- Không hard-code dữ liệu production.
- Validation, permission và lỗi/fallback đã có.
- Test liên quan đã chạy và kết quả được báo rõ.
- Không có secret hoặc file môi trường thật trong thay đổi.
- API/schema/migration tương thích hoặc có kế hoạch rollout.
- Feature Markdown phản ánh đúng implementation, gồm flow và thuật toán.
- Nhật ký feature ghi quyết định, thay đổi, test và giới hạn còn lại.
- `docs/PROJECT_STATUS.md` phản ánh đúng trạng thái nếu milestone thay đổi.
- Acceptance criteria đủ rõ để hai thành viên tự test/review.

## 14. Khi có yêu cầu mới

Mọi yêu cầu mới được xem là đầu vào tài liệu tự động. Người dùng chỉ cần nói muốn làm hoặc sửa gì; coding agent có trách nhiệm tự tìm đúng tài liệu, cập nhật hoặc tạo mới mà không chờ người dùng nhắc “hãy ghi Markdown”.

### Feature Intake Protocol

1. Đọc `AGENTS.md`, file này, `docs/PROJECT_STATUS.md` và mục lục.
2. Kiểm tra yêu cầu đã thuộc feature nào chưa bằng tên, flow, entity và API liên quan.
3. Nếu đã có owner: cập nhật đúng feature file, không tạo tài liệu trùng.
4. Nếu là chức năng độc lập chưa có owner: tạo `docs/03-features/NN-ten-chuc-nang.md` từ template.
5. Nếu là thay đổi kiến trúc xuyên hệ thống: tạo/cập nhật ADR và liên kết các feature bị ảnh hưởng.
6. Bổ sung file mới vào `README.md` và thêm trạng thái vào `docs/PROJECT_STATUS.md`.
7. Ghi plan trước/cùng lúc với code: flow, data, API/event, thuật toán, so sánh, ưu/nhược điểm, phù hợp, scale, bảo mật, fallback, test và nghiệm thu.
8. Ghi ước lượng nếu phạm vi đủ rõ.
9. Code, test và cập nhật Implementation status/Decision log/Change history.
10. Bàn giao để nhóm review; không tự đánh dấu `VERIFIED`.

Không ghi dồn vào file bất kỳ. Một file có một chủ đề sở hữu rõ ràng. Nếu chức năng chạm nhiều module, chọn một file owner chứa chi tiết và các file còn lại chỉ ghi ảnh hưởng + liên kết.

### Bảo toàn plan và lịch sử

- Không xóa plan cũ chỉ vì phương án mới tốt hơn.
- Quyết định cũ được ghi `SUPERSEDED` và liên kết quyết định thay thế.
- Phần chưa làm nhưng không còn ưu tiên dùng `DEFERRED` kèm lý do.
- Flow/API/schema cũ cần ghi migration/deprecation nếu đã có người dùng.
- Change history là append-only về mặt ý nghĩa; có thể sửa lỗi chính tả nhưng không viết lại quá khứ.
- Nếu yêu cầu mới mâu thuẫn nguyên tắc cũ, agent phải nêu xung đột và ghi quyết định mới sau khi người dùng xác nhận.

### Ước lượng thời gian

Khi yêu cầu đủ rõ, feature file ghi:

- Phạm vi được tính và phần không tính.
- Giả định về số người làm, dữ liệu, thiết kế và hạ tầng.
- Dependency/blocker.
- Khoảng `Optimistic / Expected / Pessimistic`.
- Mức tin cậy `LOW / MEDIUM / HIGH`.
- Ngày bắt đầu dự kiến, mốc review và ngày hoàn thành dự kiến nếu nhóm cung cấp lịch.
- Effort ước lượng theo person-day; không tự suy ra ngày lịch khi chưa biết thời gian rảnh của hai thành viên.
- Actual effort và ngày hoàn tất chỉ ghi sau khi nhóm xác nhận.

Không đưa ra một ngày hoàn thành chính xác giả tạo. Khi scope thay đổi, giữ estimate cũ trong history và thêm estimate revision cùng lý do.

Nếu yêu cầu làm thay đổi công nghệ, database responsibility, service boundary hoặc security model, tạo ADR trong `docs/01-architecture/adr/` và ghi:

- Bối cảnh.
- Các phương án.
- Quyết định.
- Ưu/nhược điểm.
- Hệ quả và cách rollback.

## 15. Cơ chế tự kiểm tra trí nhớ trước khi bàn giao

Trước khi báo “đã code xong để review”, agent tự kiểm tra:

- Yêu cầu có file owner chưa?
- README và Project Status có cần cập nhật không?
- Flow thực tế có khác plan?
- Thuật toán/model/threshold/dependency có đổi?
- Ưu, nhược điểm và mức phù hợp còn đúng?
- Có ảnh hưởng scale, security, privacy, cache hoặc migration?
- Implementation status có đang ghi quá mức không?
- Decision log và Change history đã có mục của lần làm việc?
- Estimate có cần điều chỉnh và đã giữ lịch sử cũ?

Thiếu bất kỳ mục đáng ghi nào thì công việc tài liệu chưa hoàn tất.

## 16. Thứ tự ưu tiên nguồn thông tin

Khi hai nguồn mâu thuẫn, không âm thầm chọn một bên. Dùng thứ tự sau và ghi lại cách giải quyết nếu ảnh hưởng hành vi:

1. Yêu cầu hiện tại đã được người dùng xác nhận rõ.
2. ADR đang `ACCEPTED` mới nhất cho đúng phạm vi.
3. Business invariants chưa bị supersede.
4. `PROJECT_BRAIN.md`.
5. Feature owner specification.
6. OpenAPI/JSON Schema/event/permission contract.
7. Database migration/schema thực tế.
8. Code và test đang chạy.
9. Tài liệu cũ hoặc ghi chú không có owner.

Code đang chạy không mặc nhiên đúng hơn plan. Nếu code khác contract/plan, agent phải xác định đó là implementation bug hay tài liệu chưa cập nhật. Thay đổi bất biến hoặc kiến trúc cần người dùng xác nhận và ADR.

## 17. Definition of Ready

Trước khi code, agent phải xác định:

- Nhánh và `CURRENT_TASK.md` đúng phạm vi.
- Feature owner document.
- Persona, mục tiêu và hành vi mong muốn.
- Trong/ngoài scope.
- Input/output, lỗi và fallback.
- Data owner, API/event và permission.
- Business invariants bị ảnh hưởng.
- Acceptance criteria và test tối thiểu.
- Dependency/blocker và estimate nếu đủ thông tin.

Thiếu chi tiết nhỏ có thể dùng giả định an toàn và ghi rõ. Nếu giả định thay đổi sản phẩm, dữ liệu, bảo mật, chi phí lớn hoặc kiến trúc thì phải hỏi người dùng trước.

## 18. Truy xuất thông tin thay vì nhồi bộ não

File này chỉ chứa nguyên tắc và bản đồ. Chi tiết nằm ở nguồn sở hữu:

- Bất biến: `docs/00-product/03-business-invariants.md`.
- ADR: `docs/01-architecture/adr/`.
- Contract catalog: `docs/02-data/03-contract-catalog.md`.
- Data catalog: `docs/02-data/04-data-catalog.md`.
- Traceability: `docs/07-delivery/05-traceability-matrix.md`.
- Công việc nhánh hiện tại: `CURRENT_TASK.md`.
- Bàn giao: `docs/templates/handoff-template.md`.

Agent chỉ đọc tài liệu liên quan đến task nhưng luôn đọc AGENTS, bộ não, current task và feature owner.

Đối với chat mới chỉ yêu cầu hiểu sơ bộ, dùng `docs/AI_CONTEXT.md` và `docs/CONTEXT_ROUTER.md`; không cần đọc file này trong toàn bộ ngay từ đầu. File này trở thành bắt buộc khi bước vào implementation hoặc thay đổi kiến trúc.

Nếu người dùng yêu cầu rõ “đọc src/source/code”, router chuyển sang `CODEBASE_OVERVIEW`: phải xác minh filesystem và đối chiếu code/docs, nhưng vẫn không quét toàn bộ source.

## 19. Chế độ onboarding sau khi clone

Khi một thành viên vừa clone/mở repository và hỏi “nên làm gì tiếp theo”, AI chưa được xem đó là yêu cầu code. AI vào chế độ `ONBOARDING_DOCS_ONLY`.

### Tài liệu phải đọc

1. `README.md`.
2. `PROJECT_BRAIN.md`.
3. `docs/PROJECT_STATUS.md`.
4. `docs/NEXT_WORK.md`.
5. `docs/07-delivery/01-roadmap.md`.
6. `docs/00-product/03-business-invariants.md`.
7. `docs/01-architecture/adr/README.md`.

Ở bước này không cần đọc source code, không cài dependency, không sửa file và không chạy build. Mục tiêu là hiểu plan, trạng thái đã được ghi nhận và chọn công việc.

### Không nhận nhầm công việc dang dở

- Nhánh hiện tại chỉ là context Git, không phải bằng chứng người mới phải tiếp tục task đó.
- `CURRENT_TASK.md` mô tả task của nhánh đang checkout; onboarding không tự động nhận task này.
- Công việc để nhận mới chỉ lấy từ các task `READY` trong `docs/NEXT_WORK.md`.
- Task `IN_PROGRESS` có owner khác không được đề xuất nhận, trừ khi người dùng yêu cầu hỗ trợ/chuyển giao.
- Hai người không nên cùng sửa một feature owner/API/schema nếu chưa thống nhất ranh giới.

### Kết quả AI phải trả sau khi đọc

1. Tóm tắt ngắn dự án đang ở pha nào, đã có gì và chưa có gì.
2. Nêu blocker hoặc tài liệu có dấu hiệu không nhất quán.
3. Đề xuất 2–4 task `READY`, ưu tiên task không xung đột với người đang làm.
4. Với mỗi task phải ghi:
   - Mục tiêu và giá trị.
   - Vì sao nên làm lúc này.
   - Dependency/blocker.
   - Estimate khoảng và mức tin cậy.
   - Tên branch đề xuất.
   - Feature/architecture Markdown cần đọc.
   - Codex sẽ tạo/sửa những lớp nào.
   - Người dùng sẽ test/review kết quả gì.
5. Chờ người dùng chọn. Không tự tạo branch hay code.

### Sau khi người dùng chọn task

AI chuyển sang `IMPLEMENTATION`:

1. Kiểm tra branch.
2. Yêu cầu tạo/chuyển đúng branch nếu cần.
3. Cập nhật task registry thành `IN_PROGRESS` chỉ khi người dùng muốn ghi nhận.
4. Viết `CURRENT_TASK.md` cho branch/task vừa chọn.
5. Lúc này mới kiểm tra source code trong phạm vi task, vì tài liệu là trí nhớ nhưng code vẫn cần được xác nhận trước khi sửa.
6. Thực hiện Feature Intake Protocol và Definition of Ready.

Không nên bỏ hoàn toàn việc đọc code khi đã bắt đầu triển khai: Markdown giải thích ý định và lịch sử, còn code/migration/test xác nhận trạng thái kỹ thuật thực tế. Quy tắc là onboarding chỉ đọc docs; implementation đọc phần code liên quan, không quét vô mục đích.

## 20. Điều phối hai thành viên

Nguồn chuẩn là `docs/07-delivery/06-two-person-collaboration.md`. Các nguyên tắc chính:

- Nhận task là một thay đổi điều phối nhỏ trên `develop`, trước khi code feature.
- Task claim gồm owner, branch, thời điểm nhận, thời điểm cập nhật cuối và write scope.
- Write scope liệt kê thư mục/file/schema/contract dự kiến sửa để AI phát hiện xung đột.
- Task chỉ nên được đề xuất song song khi dependency đã đáp ứng và write scope không giao nhau đáng kể.
- Task quá hạn cập nhật được gắn cảnh báo `STALE`; không tự chuyển owner hoặc xem là bỏ.
- Người mới clone chỉ nhìn task registry trên `develop`, không dò nhánh feature để tự nhận việc.
- Nếu registry và lời người dùng mâu thuẫn, ưu tiên lời xác nhận hiện tại và yêu cầu cập nhật registry.

AI dùng [mẫu onboarding](docs/templates/onboarding-response-template.md) để trả lời nhất quán.

### Nhận diện thành viên

Nguồn chuẩn registry nhóm là `docs/TEAM.md`, nhưng nguồn chuẩn cho người đang trò chuyện là câu trả lời trực tiếp của họ.

- Trong chat mới, hỏi “Bạn tên gì hoặc muốn dùng Member ID nào trong dự án?” trước khi gọi tên hoặc claim task.
- Không liệt kê tên thành viên/placeholder để người dùng chọn và không suy luận danh tính từ Git config.
- Sau câu trả lời, chuẩn hóa và đối chiếu với member `ACTIVE`; khớp duy nhất thì báo để người dùng xác nhận/sửa.
- Không khớp hoặc khớp nhiều người: hỏi cách đăng ký; không đoán hoặc tự sinh Member ID placeholder.
- Chỉ sau khi người dùng tự xác nhận, `git config user.name` mới được dùng làm consistency check. Mismatch chỉ tạo cảnh báo, không ghi đè danh tính.
- Member chưa có alias: sau khi người dùng/nhóm xác nhận, đề xuất cập nhật `TEAM.md` trên `develop`.
- Không dùng email cho matching thông thường và không in email ra câu trả lời.
- Không gọi GitHub API chỉ để nhận diện. GitHub username là metadata tùy chọn.
- Máy dùng chung hoặc cấu hình Git sai: lời xác nhận trực tiếp của người dùng có ưu tiên cao hơn Git config.
- Nhận diện chỉ giúp cá nhân hóa đề xuất; không trao quyền commit, push, merge hoặc đổi owner.

## 21. Khi chuyển sang chức năng khác

AI không được lập tức bảo tạo nhánh mới khi task hiện tại chưa được xử lý. Trước tiên:

1. Kiểm tra branch và working tree.
2. Đọc `CURRENT_TASK.md`, feature status và acceptance criteria.
3. Phân loại task: `VERIFIED`, `IMPLEMENTED`, `IN_PROGRESS` hoặc `PAUSED`.
4. Cập nhật Markdown, handoff, test và registry phù hợp.
5. Đề xuất Git action cho người dùng.
6. Chỉ khi task hiện tại đã được lưu an toàn mới đề xuất task/branch mới từ `NEXT_WORK.md`.

| Trạng thái | Push feature branch | Merge vào `develop` |
|---|---|---|
| VERIFIED | Nên push | Đề xuất sau review/CI |
| IMPLEMENTED | Nên push để review/backup | Chưa merge |
| IN_PROGRESS/PAUSED | Có thể push WIP | Không merge |
| Có test quan trọng đang fail | Có thể push để điều tra | Không merge |

Chỉ đề xuất merge implementation khi không có secret, tài liệu/handoff đã cập nhật, test bắt buộc đạt hoặc được chấp nhận, migration/dependency rõ và người dùng đã xác nhận `VERIFIED`. Ngoại lệ Git tự động duy nhất là coordination-only commit/push lên remote `develop` sau xác nhận nhóm; AI không tự merge implementation.

## 22. Branch isolation và đồng bộ code chung

Mặc định “việc ai nấy làm”:

- Mỗi thành viên code, pull và push trên feature branch mình sở hữu.
- Không checkout, đọc hoặc sửa feature branch người khác chỉ để “xem họ đang làm gì”.
- `develop` là nguồn code chung đã tích hợp; chỉ code đã merge/push vào `develop` mới xuất hiện khi pull `develop`.
- Remote feature branch có thể được Git biết sau fetch nhưng không tự thành local branch và không làm thay đổi working tree `develop`.
- Chỉ vào branch người khác khi owner yêu cầu review, hỗ trợ hoặc handoff.

### Ma trận thao tác

| Tình huống | Nhánh cần đứng | Hành động đề xuất |
|---|---|---|
| Xem/lấy code chung mới nhất | `develop` | `git pull origin develop` |
| Bắt đầu chức năng mới | Cập nhật `develop`, rồi branch mới | `git switch -c feature/ten-task` |
| Tiếp tục feature đã có local | Feature của mình | `git pull origin feature/ten-task` |
| Feature remote chưa có local | Sau khi owner/handoff cho phép | `git fetch origin`, rồi `git switch --track origin/feature/ten-task` |
| Đưa code mới từ develop vào feature đang làm | Feature của mình sau khi cập nhật develop | `git merge develop` |
| Review nhánh người khác | Chỉ khi được yêu cầu | Fetch/track hoặc dùng diff/PR, không push tùy tiện |

Trước thao tác pull/switch/merge, AI phải yêu cầu kiểm tra `git status`. Nếu working tree không sạch, không hướng dẫn tiếp như thể an toàn; đề xuất người dùng commit/stash/xử lý thay đổi theo tình huống.

### Luồng bắt đầu task mới

```bash
git switch develop
git pull origin develop
git switch -c feature/ten-task
```

### Luồng tiếp tục task của mình

```bash
git switch feature/ten-task
git pull origin feature/ten-task
```

### Luồng lấy thay đổi đã merge từ develop vào feature

```bash
git switch develop
git pull origin develop
git switch feature/ten-task
git merge develop
```

Với implementation Git, các lệnh là hướng dẫn và người dùng tự thực hiện. Với shared plan/task coordination đã được nhóm xác nhận, Codex tự kiểm tra, chuyển sang `develop`, commit/push, xác minh remote rồi quay lại feature branch; dừng khi trạng thái không an toàn.

## 23. AI hỗ trợ Git cho người mới

Tài liệu chi tiết nằm tại `docs/07-delivery/07-git-playbook.md`.

AI không chỉ đưa lệnh. Trước mỗi bước phải nói:

1. Người dùng đang ở branch nào.
2. Working tree sạch hay còn thay đổi.
3. Branch cần dùng là local hay `origin/*`.
4. Lệnh sắp chạy chỉ đọc, đổi working tree, tạo branch hay thay đổi remote.
5. Kết quả mong đợi sau lệnh.
6. Nếu lỗi/xung đột thì dừng ở đâu và gửi output nào cho AI.

Sau clone, AI phải giải thích rõ:

- Git tải metadata/commit của remote branches.
- Thông thường chỉ default branch được tạo local và checkout tự động.
- `origin/develop` là remote-tracking branch, chưa chắc đã có local `develop`.
- Lần đầu dùng `git switch --track origin/develop`; các lần sau dùng `git switch develop`.
- Không cần track feature branch của người khác để làm task riêng.

AI ưu tiên hướng dẫn từng cụm nhỏ, không đưa một chuỗi dài khi chưa biết kết quả bước trước. Không dùng `reset --hard`, force push, xóa branch hoặc bỏ thay đổi như cách xử lý mặc định.

## 24. Làm độc lập nhưng tích hợp đồng nhất

Nguyên tắc: `code isolation, contract alignment`.

- Mỗi người chỉ sửa code trong write scope của task mình.
- Cả hai phải dùng chung plan, invariant, ADR, entity naming, ID, permission, API/event schema, error code và design tokens.
- Không cần đọc source code dang dở của người khác để đoán cách tích hợp.
- Nguồn tích hợp chung phải nằm trên `develop`: tài liệu đã chấp nhận, integration map và shared contract.
- Feature branch được tự do triển khai chi tiết nội bộ nhưng không được tự đổi hợp đồng dùng chung.

Trước khi code, AI đọc `docs/01-architecture/03-integration-map.md`, tìm:

1. Feature đang là producer hay consumer.
2. Contract/entity/event nào dùng chung.
3. Task/owner nào đang sửa nguồn đó.
4. Dependency đã `READY` hay còn `BLOCKED`.
5. Version và fallback hiện hành.

Nếu contract còn thiếu hoặc đang được người khác thiết kế, AI không tự tạo bản riêng. Nó phải:

1. Nêu rõ điểm chưa thống nhất.
2. Đề xuất coordination change nhỏ trên `develop`.
3. Ghi producer, consumer, schema tối thiểu và compatibility.
4. Chờ nhóm xác nhận rồi mới triển khai hai phía.

### Những thứ không được lệch giữa hai feature

- Tên entity/field và loại ID.
- Endpoint, DTO, event name/version.
- Permission và ownership rule.
- Content status/publishing workflow.
- Error code/correlation ID.
- Locale/media/model reference.
- Cache key/invalidation event.
- Theme/design/motion token dùng chung.
- Job status/progress semantics.

### Integration gate trước bàn giao

AI kiểm tra:

- Contract đang dùng có đúng version accepted không?
- Có duplicate DTO/entity/event không?
- Producer và consumer xử lý optional/error/fallback giống nhau không?
- Migration/deploy order có làm một phía hỏng tạm thời không?
- Feature khác bị ảnh hưởng đã được cross-link và thông báo owner chưa?
- Traceability và integration map đã cập nhật chưa?

Code có thể hoàn tất riêng nhưng không được ghi “sẵn sàng tích hợp” nếu gate này chưa đạt.

## 25. Tư vấn phương án rồi khóa plan

Mỗi quyết định có ảnh hưởng đáng kể đi qua hai giai đoạn:

### `DESIGN_OPTIONS`

Codex đưa 2–4 phương án thực sự khả thi, không tạo phương án yếu chỉ để làm nền cho lựa chọn yêu thích. Mỗi phương án phải có:

- Flow/pseudocode hoặc cách thuật toán hoạt động.
- Input, output, failure/fallback.
- Ưu điểm và nhược điểm.
- Độ phức tạp triển khai/vận hành.
- Mức phù hợp với nhóm hai người và đồ án.
- Hiệu năng, scale 300–500 concurrent users.
- Security/privacy.
- Chi phí dịch vụ/GPU/storage nếu có.
- Yêu cầu dataset/dependency.
- Khả năng thay thế/migration sau này.
- Metric để chứng minh lựa chọn đúng.

Codex đưa khuyến nghị có lý do và nêu trường hợp nên chọn phương án khác. Nếu lựa chọn ảnh hưởng kiến trúc, dữ liệu, chi phí hoặc trải nghiệm đáng kể, chờ người dùng chọn.

### `PLAN_LOCKED`

Sau khi người dùng chọn:

1. Ghi decision ID, phương án chọn và phương án loại.
2. Ghi flow/thuật toán/version/threshold dự kiến.
3. Ghi acceptance metric, fallback và điều kiện xem xét lại.
4. Cập nhật feature file; quyết định xuyên hệ thống thì tạo ADR.
5. Đổi trạng thái quyết định thành `PLAN_LOCKED`.
6. Code đúng plan, không tự tối ưu sang phương án khác.

Nếu phát hiện plan không còn đúng trong lúc code:

1. Dừng phần bị ảnh hưởng.
2. Đưa bằng chứng: incompatibility, benchmark, security, license, cost hoặc dependency.
3. Ghi Plan Revision, giữ lịch sử cũ.
4. Đề xuất phương án thay thế và tác động.
5. Chờ người dùng xác nhận trước khi đổi.

Chỉnh sửa nội bộ không thay hành vi/contract có thể thực hiện mà không mở lại quyết định.

### Tiêu chí “hiện đại”

Không chọn công nghệ chỉ vì mới. Đánh giá:

- Maintenance/release và tài liệu chính thức.
- Stable API và compatibility với stack.
- Bundle/runtime/operational cost.
- License và security history.
- Community/ecosystem nhưng tránh dependency dư thừa.
- Khả năng nhóm hiểu, test, debug và trình bày trong báo cáo.
- Progressive enhancement/fallback.

Thông tin phiên bản, maintenance, license, giá và API provider có thể thay đổi phải được xác minh từ nguồn chính thức tại thời điểm chốt.

## 26. Hướng dẫn từng bước theo plan

Codex đóng vai trò người dẫn đường, không chỉ là người liệt kê việc. Dùng `docs/templates/guided-execution-template.md`.

### Chuỗi gate chuẩn

```text
G0 Đọc context tối thiểu
→ G1 Xác nhận Member ID
→ G2 Chọn task READY không xung đột
→ G3 Claim task được chia sẻ trên develop
→ G4 Tạo/chuyển đúng feature branch
→ G5 Definition of Ready
→ G6 DESIGN_OPTIONS và PLAN_LOCKED nếu cần
→ G7 Triển khai lát cắt nhỏ
→ G8 Test + integration gate
→ G9 Cập nhật Markdown/handoff
→ G10 Người dùng review và VERIFIED
→ G11 Đề xuất push/merge
```

Không bỏ qua gate chỉ vì AI có thể code nhanh.

### Cấu trúc mỗi bước

- `Mục tiêu`: bước này tạo ra điều gì.
- `Vì sao bây giờ`: dependency nào yêu cầu thứ tự này.
- `USER ACTION`: việc người dùng phải tự làm/xác nhận.
- `CODEX ACTION`: việc Codex sẽ làm trong phạm vi được phép.
- `Kết quả mong đợi`: output hoặc trạng thái cụ thể.
- `CHECKPOINT`: cách kiểm chứng.
- `STOP IF`: điều kiện dừng và gửi thông tin cho Codex.
- `Docs impact`: file nào được đọc/cập nhật.

Codex chỉ đưa một cụm hành động an toàn tại một thời điểm khi có khả năng lỗi, conflict hoặc cần lựa chọn. Có thể cho người dùng thấy roadmap ngắn, nhưng luôn kết thúc bằng đúng một “bước tiếp theo được khuyến nghị”.

### Bám roadmap và dependency

- Task mới phải đến từ `NEXT_WORK.md`.
- Thứ tự theo dependency và milestone, không chọn feature hấp dẫn nhưng foundation chưa sẵn sàng.
- Task bị `BLOCKED` không được hướng dẫn triển khai như thể `READY`.
- Nếu người dùng muốn nhảy pha, Codex giải thích phần thiếu, rủi ro và phương án tạo spike/mock nếu hợp lý; chờ người dùng xác nhận.
- Mỗi lát cắt phải có đầu ra test được, không triển khai một feature lớn trong một bước mơ hồ.

### Hướng dẫn sau mỗi phản hồi

Codex cập nhật nhận thức từ output người dùng, không lặp lại từ đầu. Nếu bước đạt, nói ngắn gọn “checkpoint pass” và chuyển bước kế. Nếu không đạt, chỉ xử lý blocker hiện tại.

## 27. Creative Concept Protocol

Khi người dùng nêu ý tưởng mới, Codex phải giúp nâng nó thành trải nghiệm có bản sắc thay vì lập tức code phương án đầu tiên.

### Intake và nơi lưu

1. Ghi tóm tắt vào `docs/IDEA_BACKLOG.md`.
2. Tìm feature owner hiện có; nếu chưa có thì tạo feature file từ template.
3. Tạo concept review theo `docs/templates/creative-concept-template.md`.
4. Liên kết idea ID với feature, task, decision và acceptance criteria.
5. Ý tưởng chưa làm vẫn được giữ `PROPOSED/DEFERRED`, không biến mất khỏi plan.

### Chất lượng concept

Mỗi ý tưởng nên có 2–4 hướng thực sự khác nhau, mỗi hướng nêu:

- Tên concept và câu chuyện/thông điệp.
- Signature interaction hoặc “wow moment”.
- User flow và cảm xúc mong muốn.
- 3D scene/camera/shader/particle/motion/microinteraction.
- Thuật toán/kỹ thuật và dữ liệu đầu vào.
- CMS fields/preset để Admin thay nội dung mà không code.
- Desktop/mobile/reduced-motion/Lite fallback.
- Ưu, nhược điểm và nguy cơ gây rối/chóng mặt/lag.
- Originality: điểm riêng và nguy cơ giống trend/template.
- Performance budget và scale.
- Accessibility, security/privacy.
- Dependency, asset/dataset/skill cần thiết.
- Confidence: technical, UX, data và schedule.
- Effort `Optimistic / Expected / Pessimistic`.
- Prototype/metric dùng để kiểm chứng.

Codex phải khuyến nghị concept phù hợp nhất với bảo tàng và giải thích khi nào concept khác tốt hơn. “Có một không hai” là mục tiêu sáng tạo, không phải tuyên bố marketing chưa kiểm chứng; ưu tiên bản sắc riêng có thể chứng minh qua design system và trải nghiệm.

### Chốt và triển khai

- Người dùng chọn concept.
- Concept được ghi `PLAN_LOCKED` trong feature Decision log.
- Concept không chọn giữ `DEFERRED` hoặc `REJECTED` kèm lý do.
- Chỉ code sau khi flow, asset, fallback, budget và acceptance metric đủ rõ.
- Implementation không tự thêm/bớt hiệu ứng ngoài lock.
- Nếu prototype cho thấy lag/khó dùng, mở Plan Revision có bằng chứng và xin xác nhận.

### “Đẹp” phải đo được

- FPS/frame time và long task theo quality tier.
- LCP/interaction latency và asset size.
- Task completion/skip/reduced-motion usability.
- Admin thay content/scene/preset không deploy.
- User testing về thu hút, hiểu nội dung và motion discomfort.
- Visual regression trên breakpoint/quality tier.

## 28. Shared implementation memory sau push/merge

Mục tiêu là để Codex ở chat/nhánh khác hiểu nhanh những gì đồng đội đã thực sự làm và tiếp tục cùng một hướng.

- `PUSHED_FEATURE_ONLY`: code chỉ nằm trên feature branch, chưa thuộc baseline chung.
- `MERGED_TO_DEVELOP`: code đã tích hợp và được phép ghi vào chỉ mục implemented.

Hai nguồn đọc nhanh:

- `docs/IMPLEMENTATION_INDEX.md`: capability, route, API/data, code location, contract, test và limitation đã merge.
- `docs/04-design/02-ui-component-registry.md`: component, token, layout, motion và 3D pattern đã có/cần tái sử dụng.

Sau khi người dùng xác nhận merge vào `develop`, chạy `docs/07-delivery/08-merge-memory-sync.md`:

1. Xác minh code merge tồn tại trên `develop`.
2. Cập nhật feature status/history và merge reference.
3. Cập nhật Implementation Index và UI Registry.
4. Cập nhật Project Status, NEXT_WORK và Traceability.
5. Cập nhật Integration Map/Contract Catalog/Data khi liên quan.
6. Cập nhật Idea/Creative Concept evidence.
7. Chỉ sửa AI Context nếu baseline toàn dự án thay đổi.

Trước feature mới, Codex phải kiểm tra đã có component, interaction, route shell, contract hoặc entity tương tự chưa. Nếu registry hiện tại không đủ, phải giải thích, làm Option/Creative Review và ghi extension trước khi code. Không tạo “một website thứ hai” trong cùng repo.

## 29. Plan Publication & Sync Protocol

`develop` là nguồn plan đã công bố cho cả nhóm. Người khác chỉ cần cập nhật `develop` để nhận những quyết định chung mới nhất.

### Phân loại thay đổi plan

#### Shared plan change — phải công bố sớm trên `develop`

- Dependency/task status hoặc owner/write scope.
- Shared API/event/data contract.
- Entity/permission/invariant.
- Design token/component/motion/3D registry.
- Architecture/ADR/security/performance baseline.
- Flow thay đổi producer/consumer hoặc feature khác.
- Roadmap/milestone/estimate ảnh hưởng phân công.

#### Branch-local detail — giữ trong feature đến khi merge

- Ghi chú implement nội bộ không ảnh hưởng consumer.
- Root cause/fix chỉ thuộc module.
- Test evidence và limitation của code chưa merge.
- Refactor không đổi contract/behavior chung.

Nếu branch-local phát hiện quyết định ảnh hưởng người khác, tách một coordination change nhỏ cho `develop` trước; không chờ feature code hoàn tất.

### Plan Snapshot

`docs/PLAN_SNAPSHOT.md` là change feed compact:

- Revision tăng dần.
- Ngày, trạng thái và người xác nhận.
- Tóm tắt thay đổi.
- Feature/task/contract bị ảnh hưởng.
- Link tới owner doc.
- Hành động mà collaborator cần làm.

Snapshot không chứa toàn bộ flow/thuật toán; chi tiết vẫn ở feature/ADR/contract owner.

### Sau khi pull develop

Codex:

1. Đọc Plan Snapshot revision.
2. So với revision đã ghi trong `CURRENT_TASK.md`.
3. Chỉ đọc owner docs được change feed đánh dấu và liên quan task hiện tại.
4. Kiểm tra plan mới có làm contract/dependency/write scope thay đổi không.
5. Nếu có, cập nhật current task/plan lock trước khi code tiếp.
6. Nếu không, tiếp tục mà không tải toàn bộ docs.

### Điều kiện plan thật sự được chia sẻ

Markdown local hoặc chỉ nằm trên feature branch chưa phải plan chung. Codex phải nhắc:

```text
prepare docs -> user review -> commit -> push/merge to origin/develop
```

AI tự hoàn tất coordination-only Git action sau khi nhóm xác nhận và phải báo rõ collaborator chưa thể thấy plan cho đến khi remote `develop` có thay đổi; sau push phải xác minh remote và quay lại đúng feature branch.

## 30. Feature Report Standard

Mỗi feature Markdown phải đủ rõ để nhóm dùng làm nguồn viết báo cáo khóa luận. Chuẩn chi tiết tại `docs/templates/feature-report-standard.md`.

### Sơ đồ bắt buộc

1. `User/Business Flow`: actor bắt đầu từ đâu, lựa chọn và kết quả.
2. `System Sequence`: Client/Nginx/API/DB/cache/queue/worker/provider tương tác theo thứ tự.
3. `Data/State Flow`: dữ liệu đi đâu, trạng thái thay đổi và nơi lưu.
4. `Authentication & Authorization Flow`: xác thực, token/session, permission, ownership, từ chối và audit.
5. `Algorithm Flow`: input, preprocessing, thuật toán/quy tắc, threshold, output và fallback.

Feature đơn giản có thể gộp sơ đồ khi vẫn đủ thông tin; phải ghi lý do. Feature không dùng AI vẫn có algorithm/business-rule flow.

### Giải thích dưới sơ đồ

- Điều kiện bắt đầu và actor.
- Các bước đánh số.
- Decision point và lý do.
- Error/retry/timeout/fallback.
- Dữ liệu đọc/ghi/cache/audit.
- Output và acceptance metric.

### Công nghệ sử dụng

Ghi table:

- Technology/library/service và version/range khi triển khai.
- Dùng tại module/file nào.
- Vai trò trong flow.
- Lý do chọn.
- Phương án đã cân nhắc.
- Ưu/nhược điểm.
- License/cost/security/maintenance.
- Cách scale và cách thay thế.

Không ghi tên công nghệ chỉ để làm đẹp báo cáo; phải nối được với flow/code/test.

### Thuật toán

- Tên và mục tiêu.
- Input/output.
- Pseudocode/công thức.
- Độ phức tạp thời gian/bộ nhớ khi phù hợp.
- Parameter/threshold và cách hiệu chỉnh.
- Dataset/assumption.
- Metric/confidence.
- Failure modes và fallback.
- So sánh ít nhất một phương án khác nếu có lựa chọn đáng kể.

### Thời gian

- Optimistic/Expected/Pessimistic person-day.
- Giả định, dependency và confidence.
- Planned/actual chỉ ghi theo bằng chứng.
- Khi scope đổi, giữ estimate cũ và ghi revision.

### Xác thực và bảo mật

Mỗi feature phải nói rõ public/authenticated/admin/service path; token/session; permission/ownership; validation; rate limit; audit; privacy/retention; abuse/error behavior. Không ghi chung “đã bảo mật”.

### Gate báo cáo

Feature chỉ được `IMPLEMENTED` khi sơ đồ phản ánh code, phần giải thích đầy đủ, technology/algorithm/estimate/security/test evidence đã cập nhật. Người dùng vẫn là người xác nhận `VERIFIED`.

## 31. AI Experience & Documentation Quality Gate

Chuẩn bắt buộc cho UI, animation, 3D và interaction nằm tại `docs/04-design/03-ai-experience-quality-gate.md`.

- Dự án cho phép nhiều thư viện, ngôn ngữ và kỹ thuật khi mỗi công nghệ có giá trị, phạm vi sở hữu và fallback rõ.
- Không giới hạn sáng tạo bằng số dependency; kiểm soát bằng bundle/runtime/asset budget, compatibility, lifecycle, security và benchmark.
- Mọi công nghệ thực sự dùng phải xuất hiện trong technology inventory của feature Markdown.
- Mỗi vertical slice có thematic concept, signature interaction, CMS configuration và `PLAN_LOCKED`.
- Animation/3D phải có Cinematic, Balanced, Lite, reduced-motion và no-WebGL behavior phù hợp.
- “Mượt” phải có evidence trên desktop/mobile đại diện; cảm nhận trên máy dev không đủ.
- Thiếu inventory, performance evidence hoặc fallback thì feature giữ `IN_PROGRESS`.
- Sau project foundation, documentation linter/CI kiểm tra cấu trúc và liên kết; review con người vẫn xác nhận chất lượng và tính đúng.

## 32. Code, Secret & Configuration Quality Gate

Mọi implementation phải áp dụng `docs/05-quality/04-code-configuration-quality-gate.md`.

- Code do AI viết phải được review như code production: rõ domain, trách nhiệm nhỏ, không duplicate và không abstraction/comment/dependency dư thừa.
- Không che lỗi bằng catch-all, default im lặng hoặc mock/placeholder lọt vào runtime.
- Secret/server credential không xuất hiện trong source, frontend bundle, public config, fixture, log, error, tài liệu hoặc Git history.
- Mỗi runtime dùng typed/schema-validated config và fail fast bằng lỗi đã redact; business logic không đọc environment rải rác.
- URL/provider/timeout/quota phụ thuộc môi trường phải cấu hình được. Internal route/event/DTO dùng shared contract, không biến mọi literal thành environment variable.
- External/user-provided URL phải có validation, allowlist và kiểm soát SSRF/open redirect phù hợp.
- Handoff ghi chính xác lint, typecheck, test, secret/dependency/config/security scan đã chạy; check chưa chạy phải ghi `NOT RUN`.
- Feature thiếu code review evidence, config/secret inventory hoặc security fallback giữ `IN_PROGRESS`.

## 33. Database Query, Cache & Input Security Quality Gate

Mọi data-access path phải áp dụng `docs/05-quality/05-database-query-cache-quality-gate.md`.

- Client/header/event/provider input luôn không tin cậy; server validate, normalize, authenticate và authorize lại.
- Query dùng parameter binding/prepared statement hoặc safe ORM API; identifier/operator động chỉ từ allowlist.
- Không truyền request object trực tiếp vào SQL/Mongo/search filter/update/DSL và không serialize entity trực tiếp ra response.
- Query có projection, pagination/limit, timeout, transaction/lock boundary và N+1 prevention phù hợp.
- Index chỉ thêm khi có query owner, query shape, cardinality/query-plan evidence và phân tích write/storage/migration cost.
- Cache key có scope/version/locale/audience; cache hit không được bỏ qua permission, ownership hoặc publish state.
- Invalidation có producer/consumer/order; TTL jitter và stampede/outage fallback không tạo retry storm.
- Response/error/log không lộ SQL, schema, internal path, PII/secret hoặc field ngoài contract.
- “Code ngắn” không phải acceptance metric. Ưu tiên đúng, an toàn, rõ và nhanh theo benchmark; loại duplication/over-fetch/abstraction dư thừa có bằng chứng.
- Thiếu injection/IDOR, query-plan/query-count, cache correctness hoặc redaction evidence thì feature giữ `IN_PROGRESS`.

## 34. Work Session & Feature Contribution Ledger

Mọi implementation session áp dụng `docs/07-delivery/09-work-session-contribution-ledger.md`.

- Chat mới, đổi branch/task/người, continuation không rõ hoặc từ 4 giờ sau hoạt động được ghi nhận phải hỏi lại tên/Member ID trước khi code.
- Bốn giờ chỉ là identity recheck threshold; không tự giải phóng claim, đổi owner hoặc đánh dấu task stale.
- Mỗi session ghi ID, contributor đã xác nhận, role, task/branch, StartedAt, LastActiveAt, EndedAt, status, scope/output, tests và handoff.
- Nếu không biết lúc người dùng rời đi, ghi `INTERRUPTED` và `EndedAt: UNKNOWN`; không bịa duration.
- Feature owner giữ lifecycle từ Planned/Claimed/Started đến IMPLEMENTED/VERIFIED/Merged/Completed và contribution ledger append-only.
- Người khác tiếp tục cần handoff/coordination đã xác nhận và session row mới; attribution người trước được bảo toàn.
- Wall-clock span không mặc nhiên là active effort. Actual effort, completion date và `VERIFIED` chỉ ghi theo bằng chứng/nhóm xác nhận.
- `CURRENT_TASK.md` chỉ chứa phiên/checkpoint hiện tại; durable contribution history thuộc feature owner.
