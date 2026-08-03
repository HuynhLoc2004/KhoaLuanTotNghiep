# Traceability matrix

Matrix nối yêu cầu với feature, contract/data, test và tiêu chí nghiệm thu. Chỉ thêm dòng khi requirement bắt đầu được triển khai; không cần liệt kê mọi ý tưởng chưa ưu tiên.

| Requirement | Feature owner | Invariant | Contract/Data | Test/Bằng chứng | Acceptance | Trạng thái |
|---|---|---|---|---|---|---|
| REQ-CMS-001 Nội dung public không hard-code | `01-admin-cms.md` | INV-CONTENT-002 | CMS block schema | Chưa có | Admin đổi nội dung không deploy | PLANNED |
| REQ-CMS-002 Draft không public | `01-admin-cms.md` | INV-CONTENT-001 | Public content API | Chưa có | Draft không xuất hiện | PLANNED |
| REQ-MAP-001 Tính tuyến trong bảo tàng | `02-web-3d-navigation.md` | INV-UX-002 | Map graph API/tables | Chưa có | A* đúng route và accessibility | PLANNED |
| REQ-GUIDE-001 QR mở đúng stop | `03-ai-tour-guide.md` | INV-CONTENT-001 | QR resolver API | Chưa có | Dùng được không login | PLANNED |
| REQ-AI-001 Recognition xử lý unknown | `04-artifact-recognition.md` | INV-AI-002 | Recognition job/result | Chưa có | Top-k/confidence/fallback | PLANNED |
| REQ-3D-001 Thiếu model vẫn xem được | `05-digital-twin.md` | INV-3D-001 | Artifact media contract | Chưa có | Media/text fallback | PLANNED |
| REQ-AUTH-001 Ownership history | `07-auth-user-history.md` | INV-AUTH-002 | User history API | Chưa có | Không truy cập chéo user | PLANNED |
| REQ-SEARCH-001 Hybrid search đúng quyền/publish | `09-search-discovery.md` | INV-CONTENT-001 | Search contract/index | Chưa có | Relevance + không rò draft/private | PLANNED |
| REQ-LOC-001 Xác định start node bằng QR/ảnh | `10-indoor-location-detection.md` | INV-UX-002 | Location API/result | Chưa có | QR chính xác, ảnh top-k/confidence/fallback | PLANNED |
| REQ-FOUND-001 Một root gate kiểm tra workspace TypeScript và Python đã khóa dependency | `docs/work/TASK-FOUND-001.md` | Không thay đổi business invariant | Root workspace/tooling; chưa có contract nghiệp vụ | Root gate PASS; 5/5 Node component tests và 2/2 pytest; merge `3d8b971` | Toolchain/skeleton build, lint, typecheck và test đạt; secret template không chứa value | VERIFIED |
| REQ-INFRA-001 Local database services có health check, persistent volume và secret boundary | `docs/06-devops/01-local-environment.md` | Không thay đổi business invariant | Compose DNS/ports cho PostgreSQL+pgvector, MongoDB, Redis; chưa có schema nghiệp vụ | Compose config validation + authenticated runtime smoke/health PASS; merge `847251c` | Ba service healthy, volume bền vững, `.env.local` bị ignore và `.env.example` không chứa secret | VERIFIED |
| REQ-QUALITY-001 Fresh-clone lint/typecheck resolve đúng workspace declarations | `docs/work/FIX-CLEAN-GATE-001.md` | Không thay đổi business invariant | Turbo task graph; không đổi contract/data/API | Clean lint 7/7, typecheck 7/7, test 10/10, build 5/5; merge `8bf9c9e`; hosted run `30832872900` PASS trên integrated `develop` | Dependency builds chạy trước dependent typed checks; không dùng `any`/disable; clean hosted gate PASS | VERIFIED |
| REQ-CI-001 Mỗi thay đổi shared chạy deterministic TypeScript/Python quality gate trên GitHub | `docs/work/TASK-CI-001.md`; `docs/06-devops/01-local-environment.md` | Không thay đổi business invariant | GitHub workflow + root quality command; không đổi contract/data/API | Merge `be2a18e`; hosted run `30832872900` SUCCESS trên exact merge commit | Pinned/frozen install, least privilege, format/lint/type/test/build/Ruff/pytest PASS và không dùng project secret | VERIFIED |

Trạng thái: `PLANNED`, `IMPLEMENTED`, `VERIFIED`, `DEFERRED`. Coding agent không tự đặt `VERIFIED`.
