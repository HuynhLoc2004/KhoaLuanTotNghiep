# Implementation Index

Ảnh chụp compact của những gì đã thực sự merge vào `develop`. Không liệt kê code chỉ đang nằm ở feature branch.

## Baseline

- Application source: foundation skeleton đã khởi tạo.
- Last synchronized merge: `8bf9c9e` — `FIX-CLEAN-GATE-001` (`MERGED_UNVERIFIED`; hosted integration check pending).
- Shared contracts implemented: ApiErrorResponseSchema, HealthStatusResponseSchema, ApiError class, ErrorCode enum, Database Entity DTOs, Living Timeline Zod Schemas (ExplorationMode, NarrativeJourney, NarrativeNode, RelatedArtifact).
- UI components implemented: Heritage Theme tokens, CMS Block Renderer, Admin Shell (Sidebar, Header), Public Header & Footer layouts, Living Timeline 2D Renderer, Mode Switcher, Related Artifact Cards.

## Applications

| App/Service | Capability đã merge | Code location | Entry/Route | Status | Test/Evidence |
|---|---|---|---|---|---|
| Public Web | Public Web shell responsive layout, Header, Footer, CMS Page renderer và Living Timeline Page renderer | `apps/web/` | `apps/web/src/index.ts` | CODE_CONFIRMED | 5/5 web tests PASS; verified by `thanh` |
| Admin | Admin shell layout (Sidebar, Header), semantic CMS Block Form with validation control, and integrated Live Preview panel | `apps/admin/` | `apps/admin/src/index.ts` | CODE_CONFIRMED | 7/7 admin tests PASS locally; hosted integration pending |
| API | Express API skeleton, health endpoints, correlation ID middleware, Zod validator & error handler; Database DDL migrations, Entity DTOs, seed data & DatabaseRepository; REST API endpoints `/api/v1/timeline/*` | `services/api/` | `services/api/src/index.ts` | CODE_CONFIRMED | 17/17 api tests PASS; verified by `thanh` |
| AI service | Python package/test skeleton; chưa có AI runtime behavior | `services/ai/` | `services/ai/src/ai_service/` | CODE_CONFIRMED | Ruff/format + pytest PASS |
| Media worker | Python package/test skeleton; chưa có queue/media runtime behavior | `workers/media/` | `workers/media/src/media_worker/` | CODE_CONFIRMED | Ruff/format + pytest PASS |
| Shared contracts | Base ApiError, ErrorCode, ApiErrorResponseSchema, HealthStatusResponseSchema, Living Timeline Zod schemas | `packages/contracts/` | `packages/contracts/src/index.ts` | CODE_CONFIRMED | 5/5 contract tests PASS; verified by `thanh` |
| Shared UI | Heritage Modern Dark Theme tokens, CMS Block types, CmsBlockRenderer, Living Timeline 2D Renderer, Mode Switcher, Related Artifact Cards | `packages/ui/` | `packages/ui/src/index.ts` | CODE_CONFIRMED | 12/12 ui tests PASS; verified by `thanh` |
| Local data services | PostgreSQL + pgvector, MongoDB và Redis qua Docker Compose; authenticated health checks và named volumes | `infra/` | `infra/compose.yaml` | CODE_CONFIRMED | Compose config validation + runtime smoke/health PASS; verified by `loc` |
| Workspace quality graph | Turbo builds direct workspace dependencies before dependent lint/typecheck so ignored declaration outputs exist on fresh clones | `turbo.json` | root `lint` / `typecheck` tasks | CODE_CONFIRMED | Clean lint 7/7, typecheck 7/7, test 10/10 and build 5/5 tasks PASS locally; hosted integration pending |

## Features

| Feature | Behavior đã merge | Backend/Data | Contract | Status | Limitations | Owner doc |
|---|---|---|---|---|---|---|
| CMS/Admin | Admin Shell layout (Sidebar, Header), CMS Block Form Editor và Live Preview panel đã merge | PostgreSQL cms_pages & cms_sections DDL tables, seed data & DatabaseRepository đã merge | CMS Block types | CODE_CONFIRMED | Chưa nối REST API endpoints lưu trực tiếp vào DB | `03-features/01-admin-cms.md` |
| Web 3D/Map | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/02-web-3d-navigation.md` |
| AI Tour Guide | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/03-ai-tour-guide.md` |
| Recognition | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/04-artifact-recognition.md` |
| Digital Twin | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/05-digital-twin.md` |
| Voice/i18n | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/06-multilingual-voice.md` |
| Auth/History | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/07-auth-user-history.md` |
| Dashboard | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/08-dashboard-analytics.md` |
| Search/Discovery | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/09-search-discovery.md` |
| Indoor Location QR/Photo | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Cần map/dataset | `03-features/10-indoor-location-detection.md` |
| Living Timeline/Dòng thời gian sống | Mode Switcher (`FREE_EXPLORE`/`GUIDED_JOURNEY`), Related Artifact Cards, REST API endpoints (`/api/v1/timeline/*`) và 2D Timeline UI | Sample Narrative Journeys & Related Artifact Links | Shared Zod timeline contracts | CODE_CONFIRMED | Cinematic 3D camera transition là extension sau MVP | `03-features/11-living-timeline.md` |

## Merge history

| Date | Merge/PR/Commit | Task/Feature | Added/Changed | Docs synchronized | Verified by |
|---|---|---|---|---|---|
| 2026-08-03 | `3d8b971` / PR `#2` | `TASK-FOUND-001` | Monorepo/tooling, 5 TypeScript workspace skeletons và 2 Python project skeletons | YES | `thanh` |
| 2026-08-03 | `847251c` / PR `#3` | `TASK-INFRA-001` | PostgreSQL/pgvector, MongoDB, Redis, health checks, volumes, env template và runbook | YES | `loc` |
| 2026-08-03 | `03dfcd4` / PR `#5` | `TASK-WEB-001` | Public Web shell, Heritage design tokens, CMS Block Renderer | YES | `thanh` |
| 2026-08-03 | `8afa7c8` / PR `#4` | `TASK-API-001` | Express API skeleton, health endpoints, correlation ID và Zod error contracts | YES | `thanh` |
| 2026-08-03 | `5ce59f2` / PR `#6` | `TASK-ADMIN-001` | Admin shell layout (Sidebar, Header), CMS Block Form Editor và Live Preview | YES | `thanh` |
| 2026-08-03 | `d75cdf8` / PR `#7` | `TASK-DATA-001` | PostgreSQL DDL migrations, entity DTOs, seed data baseline và DatabaseRepository | YES | `thanh` |
| 2026-08-03 | `92c7caa` / PR `#8` | `TASK-TIMELINE-001` | Living Timeline MVP (FREE_EXPLORE/GUIDED_JOURNEY modes, Related Artifact Cards, REST API endpoints và 2D Timeline UI) | YES | `thanh` |
| 2026-08-03 | `cc1c600` / PR `#9` | `FIX-LINT-001` | Sửa toàn bộ lỗi ESLint rules trên contracts, UI, web, admin và api packages | YES | `thanh` |
| 2026-08-03 | `8bf9c9e` / PR `#7` | `FIX-CLEAN-GATE-001` | Fresh-clone Turbo dependency ordering; remove stale Admin export; restore semantic form/validation/live-preview markers | YES | UNVERIFIED — hosted `TASK-CI-001` rerun pending |

## Quy tắc

- Chỉ ghi capability có bằng chứng trong `develop`.
- Push feature branch không được ghi implemented.
- Ghi location, owner doc, limitation và test evidence.
- Status: `CODE_CONFIRMED`, `DOCS_ONLY`, `DEPRECATED`.
- Không copy toàn bộ flow; liên kết feature owner.
