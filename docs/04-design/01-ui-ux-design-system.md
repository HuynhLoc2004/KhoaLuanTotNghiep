# Thiết kế UI/UX và trải nghiệm 3D

## Định hướng thị giác

“Di sản sống trong không gian số”: nền trung tính tối/ấm, màu đồng và ngọc làm điểm nhấn, typography hiện đại kết hợp tiêu đề có tính lịch sử. Hình ảnh hiện vật là trung tâm; tránh giao diện dashboard cũ, gradient lạm dụng hoặc hiệu ứng chỉ để trang trí.

Thiết kế phải có chất riêng, nhận ra được ngay cả khi bỏ logo: lớp không gian sâu như phòng trưng bày, ánh sáng tập trung vào hiện vật, đường nét gợi kiến trúc bảo tàng và chuyển động mang nhịp kể chuyện. Không sao chép nguyên phong cách của website tham khảo.

Ý tưởng animation/3D mới không được thêm rời rạc. Mỗi vertical slice cần một Creative Concept Review, signature interaction, quality-tier fallback, CMS preset và metric; sau khi người dùng chọn mới `PLAN_LOCKED`.

Mọi AI và thành viên phải áp dụng [AI Experience & Documentation Quality Gate](03-ai-experience-quality-gate.md). Dự án cho phép dùng nhiều thư viện animation/3D hoặc runtime khi có giá trị và ranh giới rõ; không dùng số lượng dependency làm giới hạn thay cho bundle/runtime budget, compatibility, fallback và evidence. Mọi công nghệ thực sự sử dụng phải được ghi đầy đủ trong feature Markdown.

## Design tokens

- Màu semantic: background, surface, text, muted, primary, accent, success, warning, danger.
- Spacing theo thang 4/8 px; radius, shadow, z-index và motion token thống nhất.
- Typography responsive, line-height thoáng; hỗ trợ đầy đủ dấu tiếng Việt.
- Dark/light có thể cấu hình; độ tương phản đạt WCAG AA.

## Thành phần

Header/menu động, Hero, artifact card, exhibition rail, search command, QR scanner, audio player, 3D viewer shell, floor navigator, timeline, content block renderer, skeleton, empty/error/offline state.

## Hệ thống trải nghiệm sống động

### Immersive Hero

- Scene 3D hoặc depth-composed image do CMS chọn.
- Camera chuyển nhẹ theo pointer/gyro đã làm mượt, có giới hạn biên độ.
- Artifact spotlight, volumetric/fog rất tiết chế và CTA luôn đọc được.
- Scroll transition chuyển từ không gian hero vào câu chuyện, có nút skip và fallback ảnh.

### Artifact storytelling

- Card có tilt/lighting rất nhẹ theo pointer, không gây chóng mặt.
- Shared-element transition từ thumbnail sang detail.
- Detail có orbit model, hotspot kể chuyện, exploded view nếu model hỗ trợ và timeline metadata.
- Khi chưa có 3D, dùng layered depth/parallax từ ảnh hoặc 360 spin do CMS cấu hình.

### Map và Tour

- Floor transition thể hiện quan hệ không gian, route được “vẽ” theo tiến trình.
- POI pulse theo mức ưu tiên, không animate toàn bộ đồng thời.
- Audio player có waveform/progress và ambient visualizer nhẹ; thông tin không phụ thuộc visualizer.

### Microinteractions

- Hover/focus/press có phản hồi riêng nhưng nhất quán.
- Button, chip, tab, scanner success, save, upload và publish đều có state transition.
- Skeleton phản ánh đúng layout để tránh layout shift.
- Haptic chỉ là progressive enhancement trên thiết bị hỗ trợ.

## Motion grammar

- `reveal`: nội dung xuất hiện theo nhịp kể chuyện.
- `stagger`: dùng cho nhóm nhỏ, giới hạn số phần tử animate.
- `continuity`: shared layout transition giữ nhận thức không gian.
- `spatial`: camera/scene transition dùng cho map và 3D.
- `feedback`: phản hồi tức thì dưới 150 ms cho thao tác.
- `ambient`: chuyển động nền rất chậm, tự pause khi offscreen/tab ẩn.

CMS chỉ chọn preset và intensity; duration/easing/budget cốt lõi nằm trong design system để giữ chất lượng.

## Motion budget

- Animation transform/opacity 150–350 ms; tôn trọng `prefers-reduced-motion`.
- Tránh scroll hijacking, blur lớn và animation layout liên tục.
- 3D render on-demand khi scene đứng yên; pause khi tab ẩn.
- Đo FPS và long task trên thiết bị thật, không chỉ máy dev.
- Post-processing có quality tier; ưu tiên selective bloom/color grading nhẹ, tránh nhiều full-screen pass.
- Không chạy đồng thời nhiều canvas WebGL; scene không dùng phải dispose geometry, material và texture.
- Animation danh sách lớn dùng virtualization và chỉ reveal phần tử trong viewport.

## Công nghệ đề xuất

- React Three Fiber/Drei cho scene 3D tích hợp React.
- GSAP + ScrollTrigger cho cinematic timeline phức tạp có kiểm soát.
- Framer Motion/Motion cho component transition và microinteraction.
- Theatre.js chỉ cân nhắc ở công cụ author camera timeline, không bắt buộc runtime public.
- Lenis chỉ dùng nếu kiểm thử accessibility và không phá native scroll.
- Lottie/Rive cho illustration tương tác nhỏ khi asset phù hợp; không thay WebGL scene.

Mỗi thư viện phải có một vai trò rõ. GSAP không dùng thay toàn bộ Framer Motion và ngược lại; tránh hai hệ animation cùng điều khiển một property.

## Admin-driven presentation

Admin cấu hình trải nghiệm qua preset registry:

- `componentType`, `variant`, `themePreset`.
- `motionPreset`, `motionIntensity`, `trigger`.
- `sceneRef`, `cameraPathRef`, `hotspotSetRef`.
- `desktop/mobile fallback`, `schedule`, `audience`.

API validate allowlist và schema version. Unknown preset phải rơi về default an toàn; draft có preview theo breakpoint và quality tier.

## Responsive

- Mobile: bottom navigation cho Tour/Scan/Map/Saved; CTA thao tác một tay.
- Desktop: layout rộng, bản đồ/3D và panel thông tin song song.
- Touch target tối thiểu khoảng 44 px; scanner và audio dùng được ngoài trời/không gian ồn.

## Nội dung tĩnh ban đầu

Seed data có thể dùng nội dung giới thiệu đúng chủ đề để tránh trang trống, nhưng phải đi qua cùng CMS/schema như dữ liệu thật. Gắn nhãn demo và thay được hoàn toàn từ admin.

## Performance UX

Skeleton ổn định kích thước, image responsive AVIF/WebP, blur placeholder, preload có chọn lọc. 3D và AI tải theo nhu cầu. Hiện tiến độ thực cho job dài, không dùng spinner vô hạn.

Mục tiêu “sống động” được đo bằng chất lượng chuyển cảnh và phản hồi, không phải số lượng animation. Cinematic tier hướng tới 45–60 FPS desktop; Balanced tối thiểu khoảng 30 FPS mobile; Lite giữ đầy đủ nội dung và thao tác khi không có WebGL.

## Tiêu chí nghiệm thu thiết kế

- Trang chủ có ít nhất một chuỗi kể chuyện 3D/cinematic hoàn chỉnh và fallback.
- Card, navigation, audio, map, form và feedback đều dùng motion grammar thống nhất.
- Admin thay hero scene, theme, motion preset và thứ tự section mà không sửa code/deploy.
- Reduced motion và Lite tier vẫn truyền đủ nội dung, không chặn thao tác.
- Không có long animation làm người dùng phải đợi mới đọc hoặc bấm.
- Mỗi dependency UI/motion/3D có owner, cost, loading strategy, lifecycle, fallback và evidence trong feature report.
- Tuyên bố “mượt” có kết quả đo trên desktop và mobile đại diện, kèm build mode, browser, thiết bị và scene/kịch bản.
- Feature thiếu technology inventory, quality tiers hoặc test evidence giữ trạng thái `IN_PROGRESS`, không ghi `IMPLEMENTED`.

## Decision log

| Ngày | Decision | Trạng thái | Lý do |
|---|---|---|---|
| 2026-07-30 | `DEC-UX-QUALITY-001`: Cho phép nhiều công nghệ có trách nhiệm; áp dụng Quality Gate Markdown ngay và automation sau foundation | PLAN_LOCKED | Giữ tự do sáng tạo nhưng kiểm soát hiệu năng đa thiết bị và bảo đảm hồ sơ báo cáo |
| 2026-08-17 | `DEC-UX-SPATIAL-3D-001`: Quy hoạch nâng cấp UI/UX chiều sâu 3D, Glassmorphism & Motion Grammar đồng nhất trên toàn hệ thống | PROPOSED | Lộc phản hồi giao diện MVP còn khô sơ; nâng cấp 3D Depth, hiệu ứng vi tương tác mượt mà và đồng nhất visual giữa Public Web, Living Timeline, Profile và Admin Portal |

## Change history

| Ngày | Loại | Thay đổi |
|---|---|---|
| 2026-08-17 | ADDED | Đề xuất DEC-UX-SPATIAL-3D-001 nâng cấp 3D Depth UI/UX và đồng nhất Motion Grammar |
| 2026-07-30 | ADDED | Liên kết Quality Gate, dependency inventory và performance evidence cho desktop/mobile |
