# Implementation Index

Ảnh chụp compact của những gì đã thực sự merge vào `develop`. Không liệt kê code chỉ đang nằm ở feature branch.

## Baseline

- Application source: foundation skeleton đã khởi tạo.
- Last synchronized merge: `8afa7c8` — `TASK-API-001`.
- Shared contracts implemented: ApiErrorResponseSchema, HealthStatusResponseSchema, ApiError class, ErrorCode enum.
- UI components implemented: Heritage Theme tokens, CMS Block Renderer, Public Header & Footer layouts.

## Applications

| App/Service | Capability đã merge | Code location | Entry/Route | Status | Test/Evidence |
|---|---|---|---|---|---|
| Public Web | Public Web shell responsive layout, Header, Footer và CMS Page renderer | `apps/web/` | `apps/web/src/index.ts` | CODE_CONFIRMED | 5/5 web tests PASS; verified by `thanh` |
| Admin | TypeScript build/test skeleton | `apps/admin/` | `apps/admin/src/index.ts` | CODE_CONFIRMED | Root gate + component test PASS |
| API | Express API skeleton, `/health` & `/api/v1/health` endpoints, correlation ID middleware, Zod validator & error handler | `services/api/` | `services/api/src/index.ts` | CODE_CONFIRMED | 7/7 api tests PASS; verified by `thanh` |
| AI service | Python package/test skeleton; chưa có AI runtime behavior | `services/ai/` | `services/ai/src/ai_service/` | CODE_CONFIRMED | Ruff/format + pytest PASS |
| Media worker | Python package/test skeleton; chưa có queue/media runtime behavior | `workers/media/` | `workers/media/src/media_worker/` | CODE_CONFIRMED | Ruff/format + pytest PASS |
| Shared contracts | Base ApiError, ErrorCode, ApiErrorResponseSchema, HealthStatusResponseSchema | `packages/contracts/` | `packages/contracts/src/index.ts` | CODE_CONFIRMED | 1/1 contract test PASS; verified by `thanh` |
| Shared UI | Heritage Modern Dark Theme tokens, CMS Block types và CmsBlockRenderer (Hero, ArtifactGrid, Timeline, Banner) | `packages/ui/` | `packages/ui/src/index.ts` | CODE_CONFIRMED | 8/8 ui tests PASS; verified by `thanh` |
| Local data services | PostgreSQL + pgvector, MongoDB và Redis qua Docker Compose; authenticated health checks và named volumes | `infra/` | `infra/compose.yaml` | CODE_CONFIRMED | Compose config validation + runtime smoke/health PASS; verified by `loc` |

## Features

| Feature | Behavior đã merge | Backend/Data | Contract | Status | Limitations | Owner doc |
|---|---|---|---|---|---|---|
| CMS/Admin | CMS Block DTO & Renderer skeleton đã merge | Chưa có | CMS Block types | CODE_CONFIRMED | Chưa có CMS Admin Form UI | `03-features/01-admin-cms.md` |
| Web 3D/Map | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/02-web-3d-navigation.md` |
| AI Tour Guide | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/03-ai-tour-guide.md` |
| Recognition | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/04-artifact-recognition.md` |
| Digital Twin | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/05-digital-twin.md` |
| Voice/i18n | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/06-multilingual-voice.md` |
| Auth/History | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/07-auth-user-history.md` |
| Dashboard | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/08-dashboard-analytics.md` |
| Search/Discovery | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/09-search-discovery.md` |
| Indoor Location QR/Photo | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Cần map/dataset | `03-features/10-indoor-location-detection.md` |
| Living Timeline/Dòng thời gian sống | Chưa có code | Narrative graph + free/guided + Artifact Relationship PLANNED | Shared QR/Narrative/mode/relation contracts PLANNED | DOCS_ONLY | Concept/modes/relations PLAN_LOCKED; task BLOCKED bởi foundation/CMS/contracts/content | `03-features/11-living-timeline.md` |

## Merge history

| Date | Merge/PR/Commit | Task/Feature | Added/Changed | Docs synchronized | Verified by |
|---|---|---|---|---|---|
| 2026-08-03 | `3d8b971` / PR `#2` | `TASK-FOUND-001` | Monorepo/tooling, 5 TypeScript workspace skeletons và 2 Python project skeletons | YES | `thanh` |
| 2026-08-03 | `847251c` / PR `#3` | `TASK-INFRA-001` | PostgreSQL/pgvector, MongoDB, Redis, health checks, volumes, env template và runbook | YES | `loc` |
| 2026-08-03 | `03dfcd4` / PR `#5` | `TASK-WEB-001` | Public Web shell, Heritage design tokens, CMS Block Renderer | YES | `thanh` |
| 2026-08-03 | `8afa7c8` / PR `#4` | `TASK-API-001` | Express API skeleton, health endpoints, correlation ID và Zod error contracts | YES | `thanh` |

## Quy tắc

- Chỉ ghi capability có bằng chứng trong `develop`.
- Push feature branch không được ghi implemented.
- Ghi location, owner doc, limitation và test evidence.
- Status: `CODE_CONFIRMED`, `DOCS_ONLY`, `DEPRECATED`.
- Không copy toàn bộ flow; liên kết feature owner.
