# BẢN ĐẶC TẢ TÁI THIẾT DỰ ÁN (PROJECT REBUILD BLUEPRINT)
## NỀN TẢNG BẢO TÀNG SỐ — BẢO TÀNG LỊCH SỬ THÀNH PHỐ HỒ CHÍ MINH

> **Tài liệu tham chiếu chuẩn hóa (Master Blueprint)** dành cho đội ngũ phát triển (Huỳnh Tấn Lộc & Trịnh Vĩ Thành) để triển khai lại toàn bộ dự án từ đầu một cách bài bản, đúng kiến trúc, đầy đủ chức năng, công nghệ và hệ thống API sẵn sàng tích hợp với giao diện UI được tạo bởi Google Stitch AI.

---

## MỤC LỤC
1. [Tầm Nhìn & Các Nguyên Tắc Thiết Kế Bất Biến](#1-tầm-nhìn--các-nguyên-tắc-thiết-kế-bất-biến)
2. [Ngăn Xếp Công Nghệ & Kiến Trúc Hệ Thống (Tech Stack)](#2-ngăn-xếp-công-nghệ--kiến-trúc-hệ-thống-tech-stack)
3. [Kế Hoạch Triển Khai & Phân Công Nhiệm Vụ (Lộc & Thành)](#3-kế-hoạch-triển-khai--phân-công-nhiệm-vụ-lộc--thành)
4. [Đặc Tả Chi Tiết 23 Chức Năng & Danh Mục API Tương Ứng](#4-đặc-tả-chi-tiết-23-chức-năng--danh-mục-api-tương-ứng)
   - [Phần I: Hạ Tầng, Nền Tảng & Bảo Mật](#phần-i-hạ-tầng-nền-tảng--bảo-mật)
   - [Phần II: Phân Hệ Public Web (Khách Tham Quan)](#phần-ii-phân-hệ-public-web-khách-tham-quan)
   - [Phần III: Phân Hệ Enterprise Admin CMS Studio (Quản Trị & Curator)](#phần-iii-phân-hệ-enterprise-admin-cms-studio-quản-trị--curator)
5. [Quy Trình Phối Hợp & Kiểm Thử Chất Lượng (Quality Gates)](#5-quy-trình-phối-hợp--kiểm-thử-chất-lượng-quality-gates)

---

## 1. TẦM NHÌN & CÁC NGUYÊN TẮC THIẾT KẾ BẤT BIẾN

### 1.1. Tầm nhìn sản phẩm
Xây dựng nền tảng Bảo tàng số cho **Bảo tàng Lịch sử TP. Hồ Chí Minh** theo triết lý **"Di sản sống trong không gian số" (Living Heritage in Digital Space)**. Nền tảng xóa nhòa ranh giới giữa tham quan thực tế và trải nghiệm số:
* **Khách tham quan trực tiếp tại Bảo tàng**: Quét mã QR hiện vật, định vị radar không gian trong nhà, nghe thuyết minh AI đa ngôn ngữ, quét ảnh nhận diện cổ vật bằng AI Lens, thu thập tem hộ chiếu di sản số.
* **Khách tham quan trực tuyến**: Xoay mô hình 3D Digital Twin chuẩn bảo vật quốc gia, tương tác dòng thời gian sống (Living Timeline), đàm thoại với trợ lý AI Curator 3D, chiêm ngưỡng triển lãm ảo và ảnh phục chế di sản.
* **Đội ngũ Quản lý & Giám tuyển (Curator)**: Làm chủ 100% kho dữ liệu di sản, duyệt mô hình 3D, huấn luyện kho tri thức AI RAG, quản trị vé và phân tích lưu lượng thời gian thực.

### 1.2. 5 Nguyên tắc bất biến (Business & Architecture Invariants)
1. **Admin Invariant (`PLAN-0038`)**: 100% thông tin hiện vật, bài thuyết minh, mô hình 3D, câu hỏi đố vui, vị trí bản đồ và banner được quản lý động từ Admin Portal (`/admin`). **Tuyệt đối không hardcode dữ liệu di sản trong mã nguồn React/HTML**.
2. **Zero-Breakage Design Token (`DEC-UX-UNIFIED-DESIGN-SYSTEM-002`)**:
   * Chủ đề thẩm mỹ: **Imperial Cinzel & Obsidian Gold**.
   * Bảng màu quy chuẩn: Đen huyền Obsidian (`#0F0E0E`), Đỏ hoàng gia (`#9E1B1B`), Vàng ánh kim (`#D4AF37`), Ngọc bích Emerald, Trắng lụa tơ tằm (`#F5F2EB`).
   * Typography: Tiêu đề dùng font *Cinzel* (cổ điển, sang trọng); nội dung dùng font *Outfit* hoặc *Inter* (rõ nét, hiện đại, hỗ trợ trọn vẹn tiếng Việt).
   * Bề mặt Glassmorphism cao cấp (`backdrop-blur-md`, viền vàng thanh mảnh `border-amber-500/20`).
3. **Chính sách 3 Tầng chất lượng & Dự phòng 3D (`DEC-UX-SPATIAL-3D-QUALITY-TIERS-001`)**:
   * **Cinematic Tier**: Desktop/PC cấu hình tốt, render WebGL PBR Shaders 60 FPS, đổ bóng thực tế.
   * **Balanced Tier**: Điện thoại di động, giảm tải shader để tiết kiệm pin và đạt 30–60 FPS ổn định.
   * **Lite Tier (Fallback)**: Thiết bị không hỗ trợ WebGL hoặc mạng yếu -> Tự động chuyển sang ảnh chiều sâu 2.5D Parallax / 360° spin / thư viện ảnh độ nét cao. Không bao giờ để người dùng gặp màn hình trắng hay lỗi crash.
4. **AI Safety & Hallucination Defense Gating**:
   * Trợ lý AI chỉ trả lời các thông tin di sản đã được Hội đồng Khoa học Bảo tàng phê duyệt (`approvedByCurator: true`).
   * Mọi câu trả lời AI đều phải kèm điểm độ tin cậy (`confidenceScore`) và trích dẫn nguồn tư liệu (`sources`). Nếu câu hỏi nằm ngoài phạm vi bảo tàng, AI phải lịch sự từ chối.
5. **Code Isolation & Contract Alignment**:
   * Hai thành viên (`loc` và `thanh`) chia nhánh độc lập (`feature/*`), tích hợp qua nhánh `develop`.
   * Mọi trao đổi dữ liệu giữa Frontend và Backend phải thông qua hợp đồng dữ liệu chuẩn hóa Zod schema (`packages/contracts`).

---

## 2. NGĂN XẾP CÔNG NGHỆ & KIẾN TRÚC HỆ THỐNG (TECH STACK)

### 2.1. Cấu trúc Monorepo
* **Trình quản lý gói**: `pnpm` (Workspace) kết hợp `Turborepo` tối ưu hóa build cache.
* **Ngôn ngữ chuẩn**: TypeScript (Strict Mode) trên toàn bộ dự án.

```
d:/KhoaluanTotNghiep/
├── apps/
│   ├── web/               # Public Web / PWA cho khách tham quan (Port 3001)
│   └── admin/             # Enterprise Admin CMS Studio cho Curator (Port 3002)
├── packages/
│   ├── contracts/         # Hợp đồng Zod schemas, TypeScript types, DTOs
│   └── ui/                # Thư viện UI tokens, components, CMS renderer
├── services/
│   ├── api/               # Express REST API Modular Monolith (Port 3000)
│   ├── ai-worker/         # Python FastAPI service cho AI RAG & Vision
│   └── media-worker/      # Worker xử lý ảnh, video & chuyển đổi 3D GLB
└── infra/
    └── compose.yaml       # Docker Compose: PostgreSQL, MongoDB, Redis, Keycloak
```

### 2.2. Frontend Technologies
* **Framework**: React 18, Vite, TypeScript.
* **Styling**: Tailwind CSS (kết hợp các biến CSS Tokens `heritageTheme`).
* **3D & Đồ họa không gian**: Three.js, React Three Fiber (R3F), `@react-three/drei`, `@google/model-viewer` (cho mô hình 3D AR trên di động), GSAP (cinematic transitions).
* **Quản lý trạng thái & Data Fetching**: TanStack Query (React Query) / Fetch API client có correlation ID.

### 2.3. Backend & Worker Technologies
* **API Gateway & Core Service**: Node.js, Express, TypeScript, Zod, Helmet, CORS.
* **AI & Machine Learning Services**:
  * Python 3.11, FastAPI, Uvicorn.
  * LangChain / LlamaIndex (Hybrid RAG cho AI Guide).
  * TripoSR / InstantMesh / 3D Gaussian Splatting (Tái tạo 3D từ 1 ảnh chụp).
  * YOLOv8 / ViT (Vision Transformer) cho nhận diện cổ vật qua Camera Lens.
  * Google Cloud TTS / OpenAI Whisper / Kokoro TTS cho thuyết minh giọng nói.

### 2.4. Cơ sở dữ liệu & Lưu trữ (Databases & Storage)
* **PostgreSQL 16 + pgvector**: Cơ sở dữ liệu quan hệ chính (quản lý hiện vật, phòng trưng bày, người dùng, giao dịch vé, con dấu) và lưu vector embeddings cho RAG.
* **MongoDB 7.0**: Lưu trữ linh hoạt nhật ký hội thoại AI, lịch sử tương tác, logging chi tiết tiến trình phục chế di sản.
* **Redis 7.0 + BullMQ**: Quản lý hàng đợi tác vụ bất đồng bộ (Async AI Quiz, nén ảnh 3D), bộ nhớ đệm (Cache) và giới hạn tần suất gọi API (Rate Limiting).
* **Cloudinary / Object Storage (MinIO/S3)**: Lưu trữ ảnh hiện vật độ phân giải 8K, file mô hình `.glb`, `.splat`, và file âm thanh `.mp3`.
* **Keycloak IAM (Port 18080)**: Quản lý định danh người dùng, cấp phát JWT, hỗ trợ xác thực không mật khẩu qua OTP SMS/Email.

### 2.5. DevOps & Quality Gates
* **Containerization**: Docker, Docker Compose (`infra/compose.yaml`).
* **CI/CD**: GitHub Actions (Lint check, Type check, Secretlint, OSV Scanner quét lỗ hổng bảo mật, Vitest / Jest unit tests).

---

## 3. KẾ HOẠCH TRIỂN KHAI & PHÂN CÔNG NHIỆM VỤ (LỘC & THÀNH)

Hai thành viên chịu trách nhiệm chính theo tài liệu [docs/TEAM.md](file:///d:/KhoaluanTotNghiep/docs/TEAM.md) và [docs/NEXT_WORK.md](file:///d:/KhoaluanTotNghiep/docs/NEXT_WORK.md):
* **Huỳnh Tấn Lộc (`loc`)**: Trưởng nhóm, phụ trách hạ tầng Docker, Kiến trúc CI/CD, Module 3D Digital Twin, Tìm kiếm & Định vị, Trợ lý AI Guide RAG, Dashboard Phân tích, và Hệ thống Xác thực IAM.
* **Trịnh Vĩ Thành (`thanh`)**: Đồng trưởng nhóm, phụ trách Khởi tạo Monorepo, Cơ sở dữ liệu DDL, Admin Shell CMS, Dòng thời gian sống (Living Timeline), Thuyết minh âm thanh đa ngôn ngữ, Nhận diện cổ vật AI Lens, và Quality Gates.

### BẢNG TIẾN TRÌNH & PHÂN CÔNG NHIỆM VỤ CHI TIẾT (MILESTONES)

| Mã Task | Tên Chức Năng / Module | Người Thực Hiện | Nhánh Git | Thời Gian Dự Kiến | Trọng Tâm Write Scope |
|---|---|:---:|---|:---:|---|
| **TASK-FOUND-001** | Khởi tạo Monorepo, Tooling pnpm, Turborepo & TypeScript Base | **Thành** (`thanh`) | `feature/TASK-FOUND-001` | 2 ngày | Root config, `package.json`, `tsconfig.base.json`, skeleton apps & packages |
| **TASK-INFRA-001** | Thiết lập Docker Compose: Postgres (pgvector), MongoDB, Redis, Keycloak | **Lộc** (`loc`) | `feature/TASK-INFRA-001` | 2 ngày | `infra/compose.yaml`, `.env.example`, scripts khởi tạo database |
| **TASK-API-001** | Express API Core: Routing, Middleware Correlation ID, Error Handling | **Thành** (`thanh`) | `feature/TASK-API-001` | 2 ngày | `services/api/src/app.ts`, `middleware/**`, `routes/health.ts` |
| **TASK-DATA-001** | PostgreSQL DDL Migrations, Entity Repositories & DTOs Baseline | **Thành** (`thanh`) | `feature/TASK-DATA-001` | 3 ngày | `services/api/src/db/**`, migrations SQL, DatabaseRepository |
| **TASK-WEB-001** | Public Web Shell, Design Tokens Hoàng Gia & CMS Block Renderer | **Thành** (`thanh`) | `feature/TASK-WEB-001` | 3 ngày | `apps/web/src/shell/**`, `packages/ui/src/tokens/**`, `packages/ui/src/cms/**` |
| **TASK-ADMIN-001** | Admin CMS Shell, Navigation Sidebar, CMS Form Builder & Live Preview | **Thành** (`thanh`) | `feature/TASK-ADMIN-001` | 3 ngày | `apps/admin/src/shell/**`, `apps/admin/src/forms/**` |
| **TASK-CI-001** | Xây dựng Pipeline GitHub Actions CI & Quality Check Tự Động | **Lộc** (`loc`) | `feature/TASK-CI-001` | 1 ngày | `.github/workflows/quality.yml`, cấu hình lint & format |
| **TASK-DOC-QUALITY-001**| Tích hợp OSV Scanner quét mã độc, Secretlint & Data-Access Rules | **Thành** (`thanh`) | `feature/TASK-DOC-QUALITY-001` | 2 ngày | `scripts/quality/**`, kiểm định an toàn dữ liệu |
| **TASK-SEARCH-001** | Search & Discovery MVP: Tìm kiếm Tiếng Việt không dấu & Bộ lọc Facets | **Lộc** (`loc`) | `feature/TASK-SEARCH-001` | 4 ngày | `services/api/src/routes/search.ts`, `apps/web/src/search/**`, contracts |
| **TASK-AUTH-001** | Xác thực Keycloak JWT, OTP Không Mật Khẩu, Bookmarks & Lịch Sử | **Lộc** (`loc`) | `feature/TASK-AUTH-001` | 4 ngày | `services/api/src/routes/auth.ts`, `apps/web/src/auth/**`, AuthModal |
| **TASK-DASHBOARD-001** | Dashboard Quản Trị & Báo Cáo Phân Tích Lưu Lượng Truy Cập | **Lộc** (`loc`) | `feature/TASK-DASHBOARD-001` | 3 ngày | `services/api/src/routes/dashboard.ts`, `apps/admin/src/dashboard/**` |
| **TASK-TIMELINE-001** | Dòng Thời Gian Sống (Living Timeline) Dual-Mode (Free & Guided) | **Thành** (`thanh`) | `feature/TASK-TIMELINE-001` | 5 ngày | `services/api/src/routes/timeline.ts`, `packages/ui/src/timeline/**`, Web page |
| **TASK-3D-NAV-001** | Mô Phỏng 3D Digital Twin, Hotspots & Dẫn Đường Trong Nhà A* | **Lộc** (`loc`) | `feature/TASK-3D-NAV-001` | 5 ngày | `services/api/src/routes/three.ts`, `apps/web/src/three/**`, A* navigation |
| **TASK-AI-GUIDE-001** | Trợ Lý Thuyết Minh AI RAG, Trích Dẫn Viện Bảo Tàng & Giọng Đọc TTS | **Lộc** (`loc`) | `feature/TASK-AI-GUIDE-001` | 5 ngày | `services/api/src/routes/ai.ts`, `apps/web/src/ai/**`, RAG knowledge logic |
| **TASK-VOICE-001** | Audio Guide Player Đa Ngôn Ngữ (Việt/Anh/Nhật/Hàn) & Waveform | **Thành** (`thanh`) | `feature/TASK-VOICE-001` | 3 ngày | `services/api/src/routes/features.ts`, Audio Player component |
| **TASK-RECOGNITION-001**| AI Vision Lens: Nhận Diện Hiện Vật Cổ Qua Camera & Trích Xuất Dữ Liệu | **Thành** (`thanh`) | `feature/TASK-RECOGNITION-001` | 4 ngày | `apps/web/src/pages/lensPage.ts`, Vision Recognition endpoint |
| **TASK-STUDIO-3D-001** | 3D Studio & AI Single-Photo 3D Reconstruction (Hiện vật lồng kính) | **Lộc** (`loc`) | `feature/TASK-STUDIO-3D-001` | 4 ngày | `apps/admin/src/pages/admin3DStudioPage.ts`, API tạo 3D & QR độc bản |
| **TASK-RESTORATION-001**| Phục Chế Di Sản Số AI (Before/After Time-Travel Restoration Slider) | **Thành** (`thanh`) | `feature/TASK-RESTORATION-001` | 3 ngày | `apps/web/src/pages/restorationPage.ts`, API AI phục chế |
| **TASK-INDOOR-RADAR-001**| Radar Định Vị Không Gian Khoảng Cách Gần (Proximity Indoor Radar) | **Lộc** (`loc`) | `feature/TASK-INDOOR-RADAR-001` | 3 ngày | `apps/web/src/pages/indoorRadarPage.ts`, radar mapping logic |
| **TASK-GAMIFY-001** | Gamification Hộ Chiếu Di Sản & Quản Lý Đố Vui Async AI Quiz | **Thành** (`thanh`) | `feature/TASK-GAMIFY-001` | 4 ngày | `apps/admin/src/pages/adminGamificationPage.ts`, Quiz Web UI |
| **TASK-RESERVE-001** | Quản Lý Đặt Lịch Tham Quan & Máy Soát Vé QR Pass Cổng Bảo Tàng | **Lộc** (`loc`) | `feature/TASK-RESERVE-001` | 3 ngày | `apps/admin/src/pages/adminReservationsPage.ts`, API Soát vé check-in |
| **TASK-MEDIA-CMS-001** | Quản Trị Thư Viện Đa Phương Tiện Smart Media & Tích Hợp Cloudinary | **Lộc** (`loc`) | `feature/TASK-MEDIA-CMS-001` | 3 ngày | `apps/admin/src/pages/adminMediaPage.ts`, Media upload handlers |
| **TASK-RBAC-001** | Hệ Thống Phân Quyền Granular Admin RBAC & Cấu Hình Bảo Mật | **Thành** (`thanh`) | `feature/TASK-RBAC-001` | 3 ngày | `apps/admin/src/pages/adminSettingsPage.ts`, RBAC authorization rules |

---

## 4. ĐẶC TẢ CHI TIẾT 23 CHỨC NĂNG & DANH MỤC API TƯƠNG ỨNG

Mỗi chức năng dưới đây được mô tả rõ: **Mục tiêu & Giao diện**, **Công nghệ sử dụng**, và **Hệ thống API đầy đủ** (Endpoint, Method, Payload, Response).

---

### PHẦN I: HẠ TẦNG, NỀN TẢNG & BẢO MẬT

#### Chức Năng 01: Khởi Tạo Monorepo, Tooling & Cấu Trúc Dự Án
* **Mô tả**: Thiết lập kiến trúc đa gói (Monorepo) với `pnpm workspaces` và `Turborepo`, đảm bảo tốc độ biên dịch nhanh và chia sẻ code an toàn giữa Web, Admin và API.
* **Công nghệ**: Node.js, pnpm, Turborepo, TypeScript, ESLint, Prettier.
* **Người phụ trách**: **Thành** (`thanh`).

#### Chức Năng 02: Hạ Tầng Dữ Liệu Container Hóa (Docker Compose)
* **Mô tả**: Triển khai các dịch vụ lưu trữ cần thiết cho môi trường phát triển cục bộ và production qua tệp `infra/compose.yaml`.
* **Công nghệ**: Docker, PostgreSQL 16 (kèm extension `pgvector`), MongoDB 7.0, Redis 7.0, Keycloak Server (Port 18080).
* **Người phụ trách**: **Lộc** (`loc`).

#### Chức Năng 03: API Gateway & Quản Lý Lỗi Chuẩn Hóa
* **Mô tả**: Bộ khung Express API cung cấp middleware gán mã định danh truy vết (`X-Correlation-ID`), kiểm soát tiêu đề bảo mật với `helmet`, xác thực CORS và xử lý lỗi tập trung theo chuẩn định dạng Zod.
* **Công nghệ**: Express, TypeScript, Zod, Helmet, CORS.
* **Người phụ trách**: **Thành** (`thanh`).
* **Hệ thống API**:
  * `GET /health`: Kiểm tra trạng thái sống của API Server.
    * *Response 200*: `{"status": "UP", "timestamp": "2026-09-08T12:00:00.000Z"}`

#### Chức Năng 04: Xác Thực Người Dùng, OTP Không Mật Khẩu, Yêu Thích & Lịch Sử
* **Mô tả**: Cho phép khách tham quan và Admin đăng nhập bằng mã OTP 6 số gửi qua Email/SĐT (thời hạn phiên 30 phút), hoặc đăng nhập qua Keycloak SSO. Quản lý danh sách hiện vật yêu thích (Bookmarks) và lịch sử khám phá.
* **Công nghệ**: Keycloak JWT, OTP Passwordless Token Generator, Redis Session Cache.
* **Người phụ trách**: **Lộc** (`loc`).
* **Hệ thống API**:
  * `POST /api/v1/auth/otp/send`: Gửi mã OTP xác thực.
    * *Body*: `{"destination": "khachthamquan@gmail.com", "channel": "email"}`
    * *Response 200*: `{"success": true, "message": "Mã OTP đã được gửi!"}`
  * `POST /api/v1/auth/otp/verify`: Xác minh OTP và nhận JWT Access Token.
    * *Body*: `{"destination": "khachthamquan@gmail.com", "otpCode": "123456"}`
    * *Response 200*: `{"success": true, "accessToken": "jwt_...", "expiresIn": 1800, "user": {"id": "usr-01", "fullName": "Nguyễn Văn A", "roles": ["member"]}}`
  * `GET /api/v1/auth/me`: Lấy hồ sơ người dùng hiện tại (kèm Bearer Token).
  * `GET /api/v1/auth/bookmarks`: Lấy danh sách hiện vật đã lưu.
    * *Response 200*: `{"data": [{"id": "bm-01", "artifactId": "art-001", "title": "Trống Đồng Đông Sơn"}]}`
  * `POST /api/v1/auth/bookmarks`: Thêm hiện vật vào danh sách yêu thích.
    * *Body*: `{"artifactId": "art-002", "title": "Tượng Thần Vishnu", "type": "artifact"}`
  * `DELETE /api/v1/auth/bookmarks/:id`: Xóa khỏi danh sách yêu thích.
  * `GET /api/v1/auth/history`: Xem lịch sử các hiện vật đã quét hoặc xem chi tiết.
  * `POST /api/v1/auth/history`: Ghi nhận lượt xem hiện vật mới.

---

### PHẦN II: PHÂN HỆ PUBLIC WEB (KHÁCH THAM QUAN)

#### Chức Năng 05: Trang Chủ & Immersive Storytelling Hero (`/`)
* **Mục tiêu UI**: Gây ấn tượng thị giác mạnh mẽ với Hero trình diễn bảo vật tiêu biểu, banner thông báo thời gian thực cuộn từ phải sang trái (WSS Marquee Ticker 📢), lối tắt đến 4 tính năng mũi nhọn (3D Twin, AI Guide, Living Timeline, Lens).
* **Công nghệ**: React 18, GSAP Parallax, Tailwind CSS Glassmorphism, WSS Broadcast Client.
* **Người phụ trách**: **Thành** (`thanh`).
* **Hệ thống API**:
  * `GET /api/v1/features/exhibitions`: Tải danh sách các triển lãm nổi bật hiển thị ở trang chủ.
  * `GET /api/v1/search?limit=6`: Lấy 6 bảo vật tiêu biểu để đưa vào Slider trang chủ.

#### Chức Năng 06: Trải Nghiệm 3D Digital Twin & Dẫn Đường Trong Nhà A* (`/3d-experience`)
* **Mục tiêu UI**: Trình xem mô hình 3D tương tác xoay 360°, phóng to, các điểm ghim chú thích (Hotspots), chọn góc camera định sẵn (Presets), và bản đồ sàn tìm đường đi ngắn nhất giữa các phòng bằng thuật toán A*.
* **Công nghệ**: Three.js, React Three Fiber, OrbitControls, Graph A* Algorithm, Zod validation.
* **Người phụ trách**: **Lộc** (`loc`).
* **Hệ thống API**:
  * `GET /api/v1/3d/scenes`: Lấy danh sách cảnh trưng bày 3D và các điểm mốc (POIs) trên mặt bằng.
    * *Response 200*: `{"scenes": [...], "pois": [{"nodeId": "N01_ENTRANCE", "label": "Cổng Chính", "floorLevel": 1, "coordinates": [0, 0]}]}`
  * `GET /api/v1/3d/models/:code`: Lấy cấu hình 3D của hiện vật theo mã (URL GLB, hotspots, camera angle).
    * *Response 200*: `{"artifactCode": "ART-DS-001", "title": "Trống Đồng Đông Sơn", "modelUrl": "https://.../trong-dong.glb", "cameraPreset": {"position": [0, 1.8, 4.5], "target": [0, 0, 0], "fov": 45}, "hotspots": [{"id": "H01", "title": "Hoa văn Sao 14 cánh", "position": [0, 1.2, 0]}]}`
  * `POST /api/v1/3d/route/calculate`: Tính toán đường đi trong nhà tối ưu.
    * *Body*: `{"startNodeId": "N01_ENTRANCE", "targetNodeId": "N03_PREHISTORIC_HALL"}`
    * *Response 200*: `{"pathNodeIds": ["N01", "N02", "N03"], "totalDistanceMeters": 25, "estimatedMinutes": 1, "stepsInstruction": ["Xuất phát từ Cổng Chính", "Di chuyển qua Sảnh Trung Tâm", "Đã đến Phòng Tiền Sử"]}`

#### Chức Năng 07: Dòng Thời Gian Sống - Living Timeline (`/timeline`)
* **Mục tiêu UI**: Trục thời gian sống động đưa khách qua các triều đại lịch sử Việt Nam. Tích hợp chuyển đổi 2 chế độ:
  1. `FREE_EXPLORE`: Duyệt tự do theo hiện vật, xem các cổ vật liên đới (`Related Artifacts`) có lý do thẩm định rõ ràng.
  2. `GUIDED_JOURNEY`: Đi theo cốt truyện lịch sử được giám tuyển biên soạn tỉ mỉ.
* **Công nghệ**: Dynamic Timeline Renderer, Deterministic Graph Engine, Motion Grammar.
* **Người phụ trách**: **Thành** (`thanh`).
* **Hệ thống API**:
  * `GET /api/v1/timeline/journeys`: Lấy danh sách các hành trình lịch sử đã xuất bản.
    * *Response 200*: `{"data": [{"id": "journey-dong-son-to-oc-eo", "title": "Từ Đông Sơn Đến Óc Eo", "status": "PUBLISHED", "nodes": [...]}]}`
  * `GET /api/v1/timeline/journeys/:id`: Chi tiết một hành trình cụ thể.
  * `GET /api/v1/timeline/artifacts/:code/related`: Lấy các hiện vật có quan hệ văn hóa/lịch sử với hiện vật hiện tại.
    * *Response 200*: `{"data": [{"artifactId": "art-02", "code": "ART-OE-002", "title": "Tượng Thần Vishnu", "relationType": "RELATED_THEME", "reason": "Cùng đại diện cho hai nền văn hóa cổ đại lớn trên đất nước Việt Nam."}]}`

#### Chức Năng 08: Tìm Kiếm & Khám Phá Di Sản Thông Minh (`/search`)
* **Mục tiêu UI**: Ô tìm kiếm hiện đại hỗ trợ gõ tiếng Việt không dấu, bộ lọc đa chiều (Thời kỳ, Chất liệu, Bảo vật quốc gia), gợi ý từ khóa tức thì (Typeahead suggestion).
* **Công nghệ**: PostgreSQL Unaccent Text Matching, pgvector Cosine Distance Search.
* **Người phụ trách**: **Lộc** (`loc`).
* **Hệ thống API**:
  * `GET /api/v1/search?q=...&category=...&era=...&page=1&limit=10`: Truy vấn tìm kiếm hiện vật có phân trang.
    * *Response 200*: `{"items": [{"id": "art-01", "code": "ART-DS-001", "title": "Trống Đồng Đông Sơn", "era": "Đông Sơn", "has3d": true}], "total": 45, "page": 1, "totalPages": 5}`
  * `GET /api/v1/search/suggest?q=trong`: Trả về danh sách từ khóa gợi ý tự động.
    * *Response 200*: `{"suggestions": ["Trống Đồng Đông Sơn", "Trống Đồng Miếu Môn"]}`

#### Chức Năng 09: Trợ Lý Thuyết Minh AI & Hỏi Đáp Di Sản RAG (`/ai-guide`)
* **Mục tiêu UI**: Khung chat đàm thoại thời gian thực với Trợ lý AI Bảo tàng. Phản hồi hiển thị chỉ số độ tin cậy (`confidenceScore`), trích dẫn nguồn tư liệu bảo tàng đã duyệt, nút phát âm thanh giọng đọc AI (`Speech`), và gợi ý câu hỏi liên quan.
* **Công nghệ**: Hybrid RAG (Vector + Keyword Search), Hallucination Defense Gate, Text-to-Speech API.
* **Người phụ trách**: **Lộc** (`loc`).
* **Hệ thống API**:
  * `POST /api/v1/ai/guide/query`: Gửi câu hỏi cho trợ lý AI.
    * *Body*: `{"query": "Ý nghĩa của Trống Đồng Đông Sơn là gì?", "locale": "vi"}`
    * *Response 200*: `{"answer": "Trống Đồng Đông Sơn là biểu tượng của nền văn minh sông Hồng...", "confidenceScore": 0.98, "isGated": false, "sources": [{"title": "Tư liệu Khảo cổ học Việt Nam", "sourceUrl": "https://..."}], "suggestedQuestions": ["Kỹ thuật đúc đồng thời kỳ này như thế nào?"]}`
  * `POST /api/v1/ai/guide/speak`: Tạo tệp âm thanh giọng đọc từ văn bản.
    * *Body*: `{"text": "Trống Đồng Đông Sơn...", "locale": "vi", "voiceId": "vi-VN-Standard-A"}`
    * *Response 200*: `{"audioUrl": "/audio/tts-vi-123456.mp3", "durationSeconds": 15, "format": "audio/mp3"}`

#### Chức Năng 10: AI Audio Guide Player Đa Ngôn Ngữ (`/audio-guide`)
* **Mục tiêu UI**: Trình phát âm thanh bảo tàng chuyên dụng với biểu đồ sóng âm (Waveform), hỗ trợ 4 ngôn ngữ (Việt, Anh, Nhật, Hàn), chọn giọng thuyết minh Nam/Nữ, tua nhanh 10 giây và hiển thị lời phụ đề (Transcript) bám sát tiến độ đọc.
* **Công nghệ**: Web Audio API, Canvas Waveform Visualizer.
* **Người phụ trách**: **Thành** (`thanh`).
* **Hệ thống API**:
  * `GET /api/v1/features/audio-guides`: Danh sách playlist thuyết minh âm thanh.
    * *Response 200*: `{"success": true, "data": [{"id": "AUDIO-LY-01", "title": "Thuyết Minh Tượng Phật A Di Đà", "artifactName": "Tượng Phật A Di Đà", "durationSeconds": 180, "audioUrl": "/audio/buddha-ly.mp3", "transcript": "...", "languageCode": "vi"}]}`

#### Chức Năng 11: AI Vision Lens - Nhận Diện Cổ Vật Qua Ảnh Chụp (`/lens`)
* **Mục tiêu UI**: Giả lập kính ngắm AR với tia quét Laser quét qua cổ vật trong lồng kính. Ngay sau khi chụp, AI phân tích hình ảnh và trả về danh tính hiện vật, triều đại, niên đại, độ chính xác (>98%) kèm nút mở mô hình 3D.
* **Công nghệ**: HTML5 Camera Stream / FileReader API, Vision Deep Learning Model (YOLO/ViT).
* **Người phụ trách**: **Thành** (`thanh`).
* **Hệ thống API**:
  * `POST /api/v1/ai/lens/identify`: Nhận diện ảnh chụp cổ vật.
    * *Body*: `{"imageUrl": "data:image/jpeg;base64,..."}`
    * *Response 200*: `{"success": true, "data": {"artifactId": "ARTIFACT-BUDDHA-LY-1009", "artifactName": "Tượng Phật A Di Đà Thời Lý", "era": "Triều Lý", "confidence": 0.985, "material": "Đá Nhám", "suggestedAction": "Kích hoạt Thuyết minh Audio & Xem 3D"}}`

#### Chức Năng 12: Triển Lãm Ảo Chuyên Đề (`/exhibitions`)
* **Mục tiêu UI**: Cung cấp các phòng trưng bày trực tuyến chuyên đề đặc biệt (ví dụ: Báu vật Hoàng cung Thăng Long, Gốm cổ Nam Bộ), đếm số lượng hiện vật và thời gian diễn ra.
* **Công nghệ**: CSS Grid Layout, Glassmorphism Cards.
* **Người phụ trách**: **Thành** (`thanh`).
* **Hệ thống API**:
  * `GET /api/v1/features/exhibitions`: Tải danh sách triển lãm ảo.
    * *Response 200*: `{"success": true, "data": [{"id": "EXHIBITION-01", "title": "Báu Vật Hoàng Cung Thăng Long", "status": "ONGOING", "featuredArtifactCount": 18, "coverImageUrl": "..."}]}`

#### Chức Năng 13: Phục Chế Di Sản Số AI - Digital Time-Travel Restoration (`/restoration`)
* **Mục tiêu UI**: Trải nghiệm so sánh tương tác với thanh trượt Before/After. Người dùng kéo thanh trượt để thấy cổ vật từ trạng thái hiện tại (nứt vỡ, mòn men) biến đổi thành diện mạo nguyên bản cách đây hàng trăm năm do AI phục dựng.
* **Công nghệ**: Canvas Image Splitter Slider, AI Inpainting & Generative Enhancement.
* **Người phụ trách**: **Thành** (`thanh`).
* **Hệ thống API**:
  * `POST /api/v1/ai/restoration/reconstruct`:
    * *Body*: `{"artifactId": "ARTIFACT-BUDDHA-LY-1009"}`
    * *Response 200*: `{"success": true, "data": {"originalImageUrl": "/images/buddha-damaged.jpg", "restoredImageUrl": "/images/buddha-restored-ai.jpg", "restorationDetails": "Phục hồi 100% vết rạn nứt nếp áo, tái tạo nước sơn son dát vàng thế kỷ XI.", "reconstructedElements": ["Phục hồi hoa văn nếp áo", "Làm nét 8K hoa văn đài sen"]}}`

#### Chức Năng 14: Radar Định Vị Không Gian Trong Nhà (`/indoor-radar`)
* **Mục tiêu UI**: Giao diện quét sóng radar hiển thị căn phòng hiện tại mà khách đang đứng, đo khoảng cách đến phòng tiếp theo và phòng phía sau kèm hiện vật tâm điểm cần chú ý.
* **Công nghệ**: SVG Radar Animation, Beacon / Proximity Geo-Fencing.
* **Người phụ trách**: **Lộc** (`loc`).
* **Hệ thống API**:
  * `GET /api/v1/features/indoor-radar`: Lấy thông tin khoảng cách không gian.
    * *Response 200*: `{"success": true, "data": {"currentRoom": {"id": "ROOM_LY_01", "name": "Phòng Triều Lý"}, "aheadRoom": {"name": "Phòng Triều Trần", "distanceMeters": 5, "highlight": "Trống Đồng Bạch Đằng"}, "behindRoom": {"name": "Phòng Nam Bộ", "distanceMeters": 8}}}`

#### Chức Năng 15: Avatar 3D Curator Đàm Thoại Trực Tiếp (`/curator-live`)
* **Mục tiêu UI**: Màn hình đối thoại trực tiếp với Người ảo Curator 3D cử động môi (Lip-sync) theo câu trả lời thuyết minh, tạo cảm giác như có hướng dẫn viên thực thụ đồng hành.
* **Công nghệ**: WebRTC / WebSocket Streaming, BlendShape Avatar 3D.
* **Người phụ trách**: **Lộc** (`loc`).

#### Chức Năng 16: Đố Vui Di Sản Lịch Sử & Async AI Quiz Generation (`/quiz`)
* **Mục tiêu UI**: Bộ câu hỏi trắc nghiệm tương tác giúp học sinh, sinh viên và du khách ghi nhớ kiến thức lịch sử, có tính điểm và bảng thành tích. Hỗ trợ sinh câu hỏi tự động bằng AI qua hàng đợi sự kiện.
* **Công nghệ**: React State Machine, Kafka / BullMQ Background Event Worker.
* **Người phụ trách**: **Thành** (`thanh`).
* **Hệ thống API**:
  * `GET /api/v1/features/quizzes`: Lấy danh sách câu đố lịch sử.
    * *Response 200*: `{"success": true, "data": [{"id": "QUIZ-LY-01", "questionText": "Vị vua nào mở đầu triều đại nhà Lý năm 1009?", "options": ["Lý Thái Tổ", "Lý Thái Tông", "Lý Thánh Tông"], "correctOptionIndex": 0, "explanation": "Lý Công Uẩn lập ra triều Lý năm 1009."}]}`
  * `POST /api/v1/ai/quiz/generate-async`: Sinh bộ câu đố tự động từ văn bản mô tả cổ vật qua hàng đợi.
    * *Body*: `{"artifactId": "ART-01", "artifactText": "Tư liệu mô tả hiện vật..."}`
    * *Response 200*: `{"success": true, "data": {"taskId": "task-kafka-quiz-123", "status": "COMPLETED", "generatedQuestions": [...]}}`

---

### PHẦN III: PHÂN HỆ ENTERPRISE ADMIN CMS STUDIO (QUẢN TRỊ & CURATOR)

#### Chức Năng 17: Admin Analytics Dashboard (`/admin/dashboard`)
* **Mục tiêu UI**: Bảng điều khiển trung tâm cho Ban giám đốc bảo tàng: Thẻ số liệu tổng quan (Tổng hiện vật, mô hình 3D, lượt khách hôm nay, câu hỏi AI), biểu đồ biến động lưu lượng 7 ngày gần nhất, bảng xếp hạng các hiện vật được quan tâm nhất.
* **Công nghệ**: Chart.js / SVG Charts, KPI Metric Cards, Responsive Grid.
* **Người phụ trách**: **Lộc** (`loc`).
* **Hệ thống API**:
  * `GET /api/v1/dashboard/summary`: Lấy các chỉ số KPI tóm tắt.
    * *Response 200*: `{"totalArtifacts": 1250, "digitized3D": 180, "todayVisitors": 3420, "aiQueriesTotal": 15890, "revenueVnd": 85500000}`
  * `GET /api/v1/dashboard/traffic?days=7`: Dữ liệu biểu đồ truy cập 7 ngày qua.
    * *Response 200*: `{"series": [{"date": "2026-09-01", "visitors": 450, "aiInteractions": 1200}, ...]}`
  * `GET /api/v1/dashboard/top-artifacts`: Danh sách các cổ vật được quét QR và xem 3D nhiều nhất.

#### Chức Năng 18: 3D Digital Twin Studio & AI Single-Photo 3D Generator (`/admin/3d`)
* **Mục tiêu UI**: Quản trị không gian 3D của từng phòng triển lãm; **Đặc biệt là công cụ AI Biến 1 ảnh chụp lồng kính thành mô hình 3D**: Curator chỉ cần tải lên 1 ảnh chụp duy nhất, AI tự động tách nền, tạo mô hình 3D PBR GLB và sinh ngay mã QR độc bản sẵn sàng in ấn đặt vào lồng kính thực tế.
* **Công nghệ**: AI Depth Reconstruction, PBR Shader Configurator, QR Code SVG Generator.
* **Người phụ trách**: **Lộc** (`loc`).
* **Hệ thống API**:
  * `GET /api/v1/admin/3d-studio/nodes`: Lấy danh sách các node 3D/panorama của các phòng.
  * `POST /api/v1/admin/3d-studio/nodes`: Thêm phòng hoặc góc nhìn 3D mới.
    * *Body*: `{"nodeId": "NODE_03", "roomName": "Phòng Khảo Cổ Nam Bộ", "panoramaImageUrl": "...", "mapX": 50, "mapY": 60}`
  * `POST /api/v1/admin/artifacts/generate-3d-qr`: AI sinh mô hình 3D và mã QR từ 1 ảnh.
    * *Body*: `{"artifactCode": "ART-GOM-01", "title": "Bình Gốm Cây Mai", "originalImageUrl": "/uploads/binh-gom.jpg"}`
    * *Response 200*: `{"artifactCode": "ART-GOM-01", "title": "Bình Gốm Cây Mai", "cleanImageUrl": "/uploads/binh-gom-clean-bg.png", "model3dUrl": "/models/3d/art-gom-01-pbr.glb", "uniqueQrCodeToken": "QR_ARTIFACT_ART-GOM-01", "qrCodeDataUrl": "data:image/svg+xml;utf8,...", "status": "SUCCESS"}`

#### Chức Năng 19: AI Knowledge Studio & Quản Lý RAG (`/admin/ai`)
* **Mục tiêu UI**: Quản lý toàn bộ tài liệu nghiên cứu lịch sử nạp vào bộ não của Trợ lý AI. Có nút gạt kiểm duyệt bắt buộc (`approvedByCurator`), hiển thị cờ trạng thái đã đánh chỉ mục vector (`vectorIndexed`), và nút tải tài liệu PDF/Docx lên kho.
* **Công nghệ**: Vector Database Indexer, Semantic Chunking Editor, Zod Contract.
* **Người phụ trách**: **Lộc** (`loc`).
* **Hệ thống API**:
  * `GET /api/v1/admin/ai-studio/documents`: Lấy danh sách tài liệu tri thức RAG.
    * *Response 200*: `{"documents": [{"docId": "KNOW-01", "title": "Tư liệu Triều Lý", "category": "Triều Đại", "approvedByCurator": true, "vectorIndexed": true}]}`
  * `POST /api/v1/admin/ai-studio/documents`: Thêm tài liệu mới vào kho tri thức AI.
    * *Body*: `{"docId": "KNOW-03", "title": "Kỹ thuật đúc đồng", "category": "Văn Hóa", "content": "Nội dung bài nghiên cứu...", "approvedByCurator": true, "vectorIndexed": false}`

#### Chức Năng 20: Quản Lý Đặt Lịch Tham Quan & Máy Soát Vé QR Pass Cổng (`/admin/reservations`)
* **Mục tiêu UI**: Danh sách du khách đặt vé trước qua mạng. Tích hợp giao diện **Máy quét vé Cổng bảo tàng**: Nhân viên bảo vệ/lễ tân quét mã QR trên điện thoại khách, hệ thống kiểm tra và cập nhật trạng thái `CHECKED_IN` ngay tức thì trong vòng 100ms.
* **Công nghệ**: QR Code Scanner (Camera/Barcode reader), Real-time Status Sync.
* **Người phụ trách**: **Lộc** (`loc`).
* **Hệ thống API**:
  * `GET /api/v1/admin/reservations`: Xem toàn bộ danh sách vé đặt tham quan.
    * *Response 200*: `{"reservations": [{"ticketId": "PASS-01", "visitorName": "Huỳnh Tấn Lộc", "visitDate": "2026-09-08", "status": "BOOKED", "qrCode": "QR_PASS_LOC"}]}`
  * `POST /api/v1/admin/reservations/scan`: Điểm danh soát vé tại cổng.
    * *Body*: `{"qrCode": "QR_PASS_LOC"}`
    * *Response 200*: `{"message": "Xác thực soát vé thành công!", "reservation": {"ticketId": "PASS-01", "status": "CHECKED_IN"}}`

#### Chức Năng 21: Gamification & Con Dấu Hộ Chiếu Di Sản (`/admin/gamification`)
* **Mục tiêu UI**: Thiết lập danh sách các con tem di sản điện tử (Heritage Stamps). Cấu hình biểu tượng, mã token giải mã khi quét QR tại phòng trưng bày, và theo dõi số lượng du khách đã mở khóa từng con tem.
* **Công nghệ**: Zod Schema, Gamification Metrics.
* **Người phụ trách**: **Thành** (`thanh`).
* **Hệ thống API**:
  * `GET /api/v1/admin/passport/stamps`: Lấy danh mục tem đang có.
    * *Response 200*: `{"stamps": [{"stampId": "STAMP_01", "stampName": "Dấu Ấn Vương Triều Lý", "icon": "🏛️", "qrCodeToken": "QR_STAMP_LY", "unlockedCount": 1420}]}`
  * `POST /api/v1/admin/passport/stamps`: Tạo con tem thử thách mới.
    * *Body*: `{"stampId": "STAMP_03", "stampName": "Dấu Ấn Gốm Nam Bộ", "icon": "🏺", "qrCodeToken": "QR_STAMP_GOM", "unlockedCount": 0}`

#### Chức Năng 22: Thư Viện Smart Media & Tích Hợp Cloudinary (`/admin/media`)
* **Mục tiêu UI**: Quản lý toàn bộ tệp tài nguyên: Ảnh chụp cổ vật 8K, File 3D GLB/USDZ, File âm thanh thuyết minh MP3. Hỗ trợ kéo thả tải lên, tự động nén WebP/AVIF và phát sinh CDN link.
* **Công nghệ**: Cloudinary API / AWS S3 SDK, Multipart Form Upload.
* **Người phụ trách**: **Lộc** (`loc`).

#### Chức Năng 23: Cấu Hình Hệ Thống & Phân Quyền Granular Admin RBAC (`/admin/settings`)
* **Mục tiêu UI**: Quản trị tài khoản nhân sự bảo tàng, phân bổ vai trò chuẩn theo Ma trận Phân quyền: `Admin` (Toàn quyền), `Reviewer` (Duyệt nội dung & duyệt mô hình 3D), `Editor` (Soạn thảo bài viết), `Member` (Khách tham quan). Cấu hình thời gian hết hạn phiên đăng nhập và khóa bảo mật.
* **Công nghệ**: Role-Based Access Control (RBAC), Session Policy Manager.
* **Người phụ trách**: **Thành** (`thanh`).

---

## 5. QUY TRÌNH PHỐI HỢP & KIỂM THỬ CHẤT LƯỢNG (QUALITY GATES)

### 5.1. Quy ước Git & Phân định Nhánh (Branching Strategy)
* Nhánh tích hợp chính: `develop` (Tất cả PR phải hướng về `develop`, tuyệt đối không commit trực tiếp vào `main`).
* Nhánh tính năng: `feature/<TASK-ID>` (Ví dụ: `feature/TASK-SEARCH-001`).
* Nhánh sửa lỗi: `fix/<FIX-ID>` (Ví dụ: `fix/clean-workspace-quality-gate`).

### 5.2. Các bước triển khai một Task mới
1. **Kiểm tra Pre-Code Plan Sync**: Xác nhận mã Task, phạm vi ghi (`write scope`) để không sửa trùng file với thành viên còn lại.
2. **Triển khai Code & Kiểm thử**:
   * Chạy kiểm tra TypeScript: `pnpm typecheck`
   * Chạy kiểm tra định dạng & Lint: `pnpm lint`
   * Chạy Unit Tests: `pnpm test`
3. **Hoàn thiện tài liệu**: Cập nhật trạng thái vào `docs/PROJECT_STATUS.md` và tệp chi tiết của chức năng tương ứng.
4. **Tích hợp & Đồng bộ (Merge Memory Sync)**: Tạo Pull Request vào `develop`. Sau khi merge, chạy quy trình Merge Memory Sync để cập nhật bảng tổng kết toàn hệ thống.

---

> **Ghi chú bàn giao**: Bản đặc tả này được xuất độc lập thành file markdown duy nhất tại [docs/PROJECT_REBUILD_BLUEPRINT.md](file:///d:/KhoaluanTotNghiep/docs/PROJECT_REBUILD_BLUEPRINT.md). Đội ngũ có thể sử dụng ngay tài liệu này làm kim chỉ nam kỹ thuật trong suốt quá trình xây dựng lại dự án.

---

## 6. PHỤ LỤC MỞ RỘNG KIẾN TRÚC: NỀN TẢNG ĐA BẢO TÀNG, FEATURE TOGGLES, RBAC ĐỘNG & THỐNG KÊ TOÀN DIỆN

### 6.1. Kiến Trúc Đa Bảo Tàng (Multi-Museum Branding CMS)
Nền tảng được thiết kế mở (Multi-Tenant Ready), cho phép chuyển giao và tùy biến cho bất kỳ bảo tàng hoặc trung tâm văn hóa nào:
* **Tên & Khẩu hiệu bảo tàng**: Được quản lý động trong `MuseumConfigStore.branding` (Tên bảo tàng, Slogan, Đơn vị chủ quản, Địa chỉ trụ sở, Hotline).
* **Đồng bộ thời gian thực**: Thay đổi tại Cổng Admin (`#admin -> Cấu hình`) sẽ lập tức phản ánh sang Public Web của khách tham quan mà không cần build lại mã nguồn.

### 6.2. Hệ Thống Công Tắc Tính Năng (Feature Toggles)
Bảo tàng có toàn quyền bật hoặc tắt các phân hệ trải nghiệm theo từng giai đoạn triển khai:
* `enable3D`: Bật/tắt mô hình 3D WebGL tương tác (chuyển sang ảnh 2.5D fallback nếu tắt).
* `enableVoiceAI`: Bật/tắt giọng đọc thuyết minh tự động.
* `enableQuiz`: Bật/tắt mini-game đố vui tri thức và sưu tập tem số.
* `enableTourBooking`: Bật/tắt tính năng đăng ký tour theo lớp/đoàn.
* `enableBroadcast`: Bật/tắt loa phát thanh trực tiếp trên giao diện du khách.
* `enablePassport`: Bật/tắt tính năng quản lý hồ sơ và cấp bậc du khách.

### 6.3. Phân Quyền Quản Trị Viên Động (Dynamic RBAC)
Tuyệt đối không gán cứng (hardcode) vai trò quản trị. Admin có thể tạo vai trò mới bất kỳ lúc nào với ma trận phân quyền theo từng trang nghiệp vụ:
* **Các trang nghiệp vụ phân quyền**:
  * `scan`: Cổng soát vé tự động (< 100ms) & Nhật ký kiểm soát.
  * `artifacts`: Biên tập bảng chú thích hiện vật & Kiểm duyệt mô hình 3D.
  * `analytics`: Xem trung tâm báo cáo thống kê lưu lượng.
  * `settings`: Cấu hình thương hiệu bảo tàng & Bật/tắt Feature Toggles.
  * `roles`: Quản trị danh sách nhân sự và phân bổ vai trò nội bộ.
* **Gán nhân sự linh hoạt**: Mỗi vai trò có thể gán nhiều cán bộ, và một cán bộ có thể chuyển giao nhiệm vụ nhanh chóng qua danh sách quản trị nhân sự.

### 6.4. Đa Ngôn Ngữ & Voice AI Đồng Bộ (Speech Synthesis Engine)
* Hỗ trợ 5 ngôn ngữ chuẩn quốc tế:
  * **Tiếng Việt (`vi-VN`)**
  * **English (`en-US`)**
  * **日本語 (`ja-JP`)**
  * **한국어 (`ko-KR`)**
  * **Français (`fr-FR`)**
* Khi du khách chuyển đổi ngôn ngữ trên thanh điều hướng, cả bảng chú thích lẫn bộ đọc Web Speech API sẽ tự động chuyển phát âm chuẩn theo ngôn ngữ được chọn.

### 6.5. Báo Cáo Thống Kê Đa Chu Kỳ (Multi-Period Analytics with Pagination)
* **Bộ lọc chu kỳ linh hoạt**: Hôm nay (Today) • Tuần này (Week) • Tháng này (Month) • Quý này (Quarter) • Năm nay (Year).
* **Chỉ số trọng tâm**: Tổng lượt khách, Vé soát qua cổng, Lượt nghe Voice AI, Tỉ lệ hoàn thành Quiz, Tốc độ soát vé trung bình (< 50ms).
* **Nhật ký soát vé (Scan Logs)**: Lưu trữ lịch sử quét vé theo từng cổng, thời gian thực, có **phân trang (Pagination) đầy đủ** để dễ dàng tra cứu và đối soát.


---

## 7. ĐẶC TẢ TOUR ẢO VR 360° PHOTOSPHERE BƯỚC ĐI & MA TRẬN PHÂN QUYỀN RBAC DẠNG SELECT (100% ADMIN CMS)

### 7.1. Kiến Trúc Tour Ảo VR 360° Walkthrough (Không Dùng Hộp 3D Thô Sơ)
* **Kế thừa mô hình thực tế (VR360 Viện Kiểm Sát / Bảo Tàng Quốc Gia)**:
  * Sử dụng kỹ thuật hình cầu toàn cảnh ngược (**Inverted Three.js Sphere Geometry**) kết hợp bộ tạo vân bề mặt kiến trúc bảo tàng quang học độ sắc nét cao (Spotlights trần, cột sa thạch/cẩm thạch, sàn gỗ bóng phản chiếu ánh sáng tủ kính).
  * **Vòng tròn bước chân trên sàn (Walk Nodes Rings)**: Hiển thị các điểm đứng quan sát dưới dạng vòng tròn phát sáng pulsing trên sàn nhà ($y = -120$). Du khách click vào bất kỳ điểm nào, Camera sẽ lướt mượt mà (**Camera Glide / Lerp Interpolation**) từ góc nhìn hiện tại sang vị trí mới.
  * **Radar Bản Đồ Sảnh HUD Mini (Top-Right HUD)**: Canvas 2D hiển thị sơ đồ mặt bằng sảnh, vị trí các điểm đứng, các tủ kính trưng bày và **nón quét hướng nhìn (Heading Field-of-View Cone)** xoay đồng bộ theo góc quay 360° của du khách.
  * **Điểm ghim cổ vật tương tác (Showcase Floating Pins)**: Điểm đánh dấu khối kim cương 3D lơ lửng trên tủ kính vật thể. Khi click mở Modal chi tiết gồm: Tên hiện vật, niên đại, ảnh chụp thực tế, nút phát Voice AI thuyết minh tự động và nút chuyển thẳng sang xem chi tiết xoay 3D WebGL.

### 7.2. Quản Trị Tour Ảo 360° Tập Trung Trên Dashboard Admin (CMS Workspace)
* **Tuyệt đối không gán cứng điểm ghim hay phòng sảnh**:
  * Admin truy cập Tab **"Tour Ảo 360°"** trên Admin Studio.
  * Lựa chọn sảnh trưng bày: *Sảnh Văn Hóa Champa*, *Sảnh Văn Hóa Óc Eo & Phù Nam*, *Gian Trưng Bày Đông Sơn*.
  * **Form ghim cổ vật chuẩn hóa dạng Select**:
    1. Chọn Gian Sảnh qua Dropdown.
    2. Chọn Hiện Vật cần ghim qua Dropdown liên kết trực tiếp với Kho Dữ Liệu Cổ Vật (Admin không cần gõ tên tay).
    3. Chọn Điểm Bước Chân (Walk Node) gần nhất để gắn tọa độ neo.
  * Hệ thống tự động tính toán tọa độ $X, Y, Z$ trong không gian hình cầu và cập nhật ngay vào bảng danh sách điểm ghim sảnh.

### 7.3. Ma Trận Phân Quyền Quản Trị Dạng Select (Role × Page × Permission Level)
* **Khắc phục triệt để vấn đề nhập tự do không an toàn**:
  * Admin thiết lập quyền thông qua 4 Dropdown chuẩn hóa:
    1. **Dropdown Vai Trò (Role)**: Chọn vai trò có sẵn (*Quản Trị Viên Toàn Quyền*, *Ban Giám Tuyển*, *Cán Bộ Soát Vé*, *Cán Bộ Truyền Thông*) hoặc bấm Tạo vai trò mới.
    2. **Dropdown Trang Nghiệp Vụ (System Page)**: Danh mục chuẩn gồm 12 trang nghiệp vụ (*Tour Ảo 360°*, *Hiện Vật 3D*, *Đố Vui Di Sản*, *Đặt Lịch Tour*, *Soát Vé Cổng QR*, *Thống Kê Báo Cáo*, *Cấu Hình CMS*, *Phân Quyền RBAC*).
    3. **Dropdown Mức Độ Quyền Hạn (Permission Level)**:
       * `FULL_ACCESS`: Toàn quyền Quản trị (Thêm, Sửa, Xóa, Phê duyệt).
       * `EDITOR`: Biên tập viên (Thêm mới và Chỉnh sửa nội dung).
       * `REVIEWER`: Kiểm duyệt viên (Thẩm định hồ sơ, Duyệt thông tin).
       * `READ_ONLY`: Chỉ xem dữ liệu (Xem báo cáo thống kê, không được sửa).
       * `NONE`: Khóa hoàn toàn quyền truy cập trang này.
    4. **Dropdown Cán Bộ Phụ Trách (Staff Member)**: Chọn nhân sự cụ thể từ danh sách cán bộ bảo tàng để gán vai trò.
* **Bảng tổng hợp Ma Trận RBAC Tổng Thể**:
  * Hiển thị trực quan theo dạng lưới: Nhìn vào bảng, Quản trị viên nắm bắt được ngay từng vai trò có quyền gì ở trang nào thông qua các huy hiệu màu sắc rõ ràng (Xanh lá = FULL, Xanh dương = EDITOR, Cam = REVIEWER, Xám = READ_ONLY) cùng danh sách cán bộ đang đảm nhiệm.

### 7.4. Quản Lý Gói Hỗ Trợ Đa Ngôn Ngữ Hệ Thống (Dynamic Language Packages)
* Admin có thể bật/tắt linh hoạt các gói ngôn ngữ: Tiếng Việt (VI), Tiếng Anh (EN), Tiếng Nhật (JA), Tiếng Hàn (KO), Tiếng Pháp (FR), Tiếng Đức (DE), Tiếng Tây Ban Nha (ES).
* Khi một gói ngôn ngữ được Bật/Tắt trong Admin Studio, danh sách Dropdown chọn ngôn ngữ ngoài giao diện Du Khách sẽ lập tức được cập nhật theo thời gian thực mà không cần nạp lại trang.


---

## 8. ĐẶC TẢ BẢN ĐỒ TẦNG 2.5D, DẪN ĐƯỜNG THÔNG MINH (SMART WAYFINDING) & CƠ CHẾ BAY VÀO SẢNH 360°

### 8.1. Kiến Trúc Phân Cấp Không Gian 4 Cấp Độ (Spatial Hierarchy)
Hệ thống giải quyết triệt để bài toán du khách bị lạc hoặc không biết đi hướng nào trong bảo tàng thực tế thông qua mô hình phân cấp không gian:
$$\text{Khuôn Viên (Campus)} \longrightarrow \text{Tòa Nhà (Building)} \longrightarrow \text{Mặt Bằng Tầng (Floor Level)} \longrightarrow \text{Gian Phòng (Map Room)} \longrightarrow \text{Sảnh Tour Ảo 360° (Photosphere)}$$

1. **Cấp 1 - Phối Cảnh Khuôn Viên (Campus Overview View)**:
   * Hiển thị tổng thể 3 công trình kiến trúc bảo tàng:
     * **Tòa A**: Tòa Nhà Trưng Bày Trung Tâm (3 tầng, 7 phòng triển lãm).
     * **Tòa B**: Khu Nhà Nghiên Cứu & Trưng Bày Tạm Thời.
     * **Khu C**: Vườn Điêu Khắc Sa Thạch Ngoài Trời.
   * Khi du khách click vào bất kỳ tòa nhà nào hoặc tầng nào, hệ thống sẽ thực hiện **hiệu ứng Bay / Zoom mượt mà** vào đúng mặt bằng kiến trúc của tầng đó.

2. **Cấp 2 - Mặt Bằng Kiến Trúc Sơ Đồ Tầng 2.5D (Floor Blueprint View)**:
   * Sơ đồ mặt bằng chi tiết được vẽ dạng vector SVG sắc nét:
     * Tường bao chịu lực, vách ngăn phòng, cửa ra vào, cổng soát vé A1.
     * Hiển thị thông số diện tích ($m^2$), chủ đề lịch sử của từng phòng.

3. **Cấp 3 - Cảnh Báo Phân Luồng & Mật Độ Khách Thời Gian Thực (Crowd Density Heatmap)**:
   * Từng gian phòng hiển thị chỉ báo mật độ khách động:
     * **Xanh lá (Low)**: Thông thoáng ($< 20$ khách/phòng) $\rightarrow$ Hệ thống khuyến khích du khách tiến vào.
     * **Vàng cam (Medium)**: Vừa phải ($20 - 40$ khách/phòng).
     * **Đỏ cảnh báo (High)**: Đang quá tải ($> 50$ khách/phòng) $\rightarrow$ Cảnh báo du khách nên chuyển sang phòng bên cạnh để tránh chen chúc.

4. **Cấp 4 - Cầu Nối Bay Thẳng Vào Sảnh Tour Ảo 360° (Fly-into 360 Bridge)**:
   * Khi du khách click vào bất kỳ phòng nào trên bản đồ, thẻ thông tin chi tiết phòng (Room Inspector) mở ra, liệt kê các bảo vật tiêu biểu và nút bấm hành động nổi bật: **"🚀 Bay Vào Bước Đi Sảnh 360° Ngay"**.
   * Bấm vào nút này, hệ thống tự động kích hoạt định tuyến sang `#tour360` với đúng sảnh panorama tương ứng của căn phòng đó.

### 8.2. Thuật Toán Lập Lộ Trình Tham Quan Thông Minh (Smart Wayfinding Engine)
* Hệ thống tích hợp 3 kịch bản tham quan định tuyến tối ưu sẵn:
  1. **Tour Nhanh 30 Phút (Bảo Vật Tiêu Biểu)**: Định tuyến đi qua 4 bảo vật quốc gia đắt giá nhất: *Cổng A1 $\rightarrow$ Trống Đồng Đông Sơn $\rightarrow$ Nữ Thần Devi Trà Kiệu $\rightarrow$ Tượng Phật Gỗ Óc Eo*.
  2. **Tour Học Đường 60 Phút (Văn Minh Kim Khí & Sông Nước)**: Dành cho học sinh, sinh viên tìm hiểu tiến trình đồ đồng và khảo cổ miền Nam.
  3. **Tour Toàn Diện 90 Phút (Đại Hành Trình Di Sản)**: Dẫn qua toàn bộ các tầng và cổ vật hoàng cung triều Nguyễn.
* **Đường dẫn thị giác chuyển động (Animated Flowing Path)**: Tuyến đường được vẽ bằng đường nét đứt phát sáng neon chạy liên tục (`stroke-dashoffset` animation) kèm các mốc đánh số chặng dừng chân $1, 2, 3...$ giúp du khách không thể đi lạc.

### 8.3. Hệ Thống Quản Trị Sơ Đồ Mặt Bằng Trên Dashboard Admin (Floor Plan CMS)
* **Khu vực tải lên bản vẽ sơ đồ (Blueprint Dropzone)**: Cho phép Ban quản lý bảo tàng tải lên bản vẽ CAD/ảnh sơ đồ mặt bằng (`PNG`, `JPG`, `DWG`).
* **Mô phỏng quét AI nhận diện kiến trúc (AI Blueprint Scanner)**: Nút kích hoạt AI tự động phân tích các mảng tường, phân vùng và bóc tách ranh giới phòng triển lãm.
* **Form thiết lập phòng dạng Select chuẩn hóa**:
  * Dropdown Tòa nhà $\rightarrow$ Dropdown Tầng $\rightarrow$ Tên phòng $\rightarrow$ Dropdown chọn Sảnh 360° liên kết $\rightarrow$ Ngưỡng sức chứa tối đa.
  * Bảng điều phối mật độ khách: Cho phép Admin mô phỏng tăng giảm lượng khách để kiểm tra thuật toán phân luồng.
