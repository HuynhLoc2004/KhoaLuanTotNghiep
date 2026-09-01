# Implementation Index

Ảnh chụp compact của những gì đã thực sự merge vào `develop`. Không liệt kê code chỉ đang nằm ở feature branch.

## Baseline

- Application source: foundation skeleton đã khởi tạo.
- Last synchronized merge: `7c63cbb` — `FIX-DOC-QUALITY-CI-001` and dependent `TASK-DOC-QUALITY-001` (`VERIFIED`; hosted run `30841444661` SUCCESS; Merge Memory Sync PASS).
- Shared contracts implemented: ApiErrorResponseSchema, HealthStatusResponseSchema, ApiError class, ErrorCode enum, Database Entity DTOs, Living Timeline Zod Schemas (ExplorationMode, NarrativeJourney, NarrativeNode, RelatedArtifact).
- UI components implemented: Heritage Theme tokens, CMS Block Renderer, Admin Shell (Sidebar, Header), Public Header & Footer layouts, Living Timeline 2D Renderer, Mode Switcher, Related Artifact Cards.

## Applications

| App/Service | Capability đã merge | Code location | Entry/Route | Status | Test/Evidence |
|---|---|---|---|---|---|
| Public Web | Public Web shell responsive layout, Header, Footer, CMS Page renderer và Living Timeline Page renderer | `apps/web/` | `apps/web/src/index.ts` | CODE_CONFIRMED | 5/5 web tests PASS; verified by `thanh` |
| Admin | Admin shell layout (Sidebar, Header), semantic CMS Block Form with validation control, and integrated Live Preview panel | `apps/admin/` | `apps/admin/src/index.ts` | CODE_CONFIRMED | 7/7 admin tests PASS locally; hosted integrated gate PASS in run `30832872900` |
| API | Express API skeleton, health endpoints, correlation ID middleware, Zod validator & error handler; Database DDL migrations, Entity DTOs, seed data & DatabaseRepository; REST API endpoints `/api/v1/timeline/*` | `services/api/` | `services/api/src/index.ts` | CODE_CONFIRMED | 17/17 api tests PASS; verified by `thanh` |
| AI service | Python package/test skeleton; chưa có AI runtime behavior | `services/ai/` | `services/ai/src/ai_service/` | CODE_CONFIRMED | Ruff/format + pytest PASS |
| Media worker | Python package/test skeleton; chưa có queue/media runtime behavior | `workers/media/` | `workers/media/src/media_worker/` | CODE_CONFIRMED | Ruff/format + pytest PASS |
| Shared contracts | Base ApiError, ErrorCode, ApiErrorResponseSchema, HealthStatusResponseSchema, Living Timeline Zod schemas | `packages/contracts/` | `packages/contracts/src/index.ts` | CODE_CONFIRMED | 5/5 contract tests PASS; verified by `thanh` |
| Shared UI | Heritage Modern Dark Theme tokens, CMS Block types, CmsBlockRenderer, Living Timeline 2D Renderer, Mode Switcher, Related Artifact Cards | `packages/ui/` | `packages/ui/src/index.ts` | CODE_CONFIRMED | 12/12 ui tests PASS; verified by `thanh` |
| Local data services | PostgreSQL + pgvector, MongoDB và Redis qua Docker Compose; authenticated health checks và named volumes | `infra/` | `infra/compose.yaml` | CODE_CONFIRMED | Compose config validation + runtime smoke/health PASS; verified by `loc` |
| Workspace quality graph | Turbo builds direct workspace dependencies before dependent lint/typecheck so ignored declaration outputs exist on fresh clones | `turbo.json` | root `lint` / `typecheck` tasks | CODE_CONFIRMED | Clean lint 7/7, typecheck 7/7, test 10/10 and build 5/5 tasks PASS locally; hosted run `30832872900` PASS |
| Foundation CI quality gate | Deterministic cross-runtime GitHub Actions job with pinned Node/pnpm/uv/Python setup, frozen install, least-privilege checkout and root `pnpm check` | `.github/workflows/quality.yml` | push `develop`/`main`; PR to `develop`; manual dispatch | CODE_CONFIRMED | Hosted run `30832872900` SUCCESS on exact merge commit `be2a18e`; verified by `thanh` |
| Repository policy and dependency quality gate | Markdownlint, Secretlint, project-specific report/link/Mermaid/config/URL/TypeScript AST policies, synthetic API security regressions and a direct pinned OSV scan of one pnpm plus two uv lockfiles | `scripts/quality/`, `services/api/test/`, `.github/workflows/quality.yml` | root `pnpm check`; `Node and Python quality`; `OSV lockfile vulnerability scan` | CODE_CONFIRMED | Local root gate PASS; PR run `30841432956` and exact develop run `30841444661` both PASS; verified by `thanh` |

## Features

| Feature | Behavior đã merge | Backend/Data | Contract | Status | Limitations | Owner doc |
|---|---|---|---|---|---|---|
| CMS/Admin | Admin Shell layout (Sidebar, Header), CMS Block Form Editor và Live Preview panel đã merge | PostgreSQL cms_pages & cms_sections DDL tables, seed data & DatabaseRepository đã merge | CMS Block types | CODE_CONFIRMED | Chưa nối REST API endpoints lưu trực tiếp vào DB | `03-features/01-admin-cms.md` |
| Web 3D/Map | 3D Experience Viewer /3d-experience, Orbit Controls, Hotspots & `A*` Graph Router /api/v1/3d/* | In-memory Museum Floor Map Graph & Sample 3D GLB configs | ThreeDModelConfigSchema, ThreeDHotspotSchema, ThreeDFloorPoiSchema, ThreeDRouteRequestSchema | CODE_CONFIRMED | Full WebGL Model Viewer / Three.js Canvas | `03-features/02-web-3d-navigation.md` |
| AI Tour Guide | Chat Widget /ai-guide, RAG Hybrid Router /api/v1/ai/guide/query & /speak TTS | In-memory Museum Knowledge Base & Citation Gating | AiGuideQueryRequestSchema, AiGuideQueryResponseSchema, AiGuideAudioSpeakRequestSchema | CODE_CONFIRMED | Full Vector Store (pgvector/Pinecone) & Live TTS Stream là extension ở pha sau | `03-features/03-ai-tour-guide.md` |
| Recognition | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Baseline plan | `03-features/04-artifact-recognition.md` |
| Digital Twin | 3D Digital Twin Viewer, Single-Photo AI Reconstruction Pipeline & PBR Shaders | AI Depth Map Estimation & Gaussian Splatting Worker Specs | ThreeDModelConfigSchema, ThreeDHotspotSchema | CODE_CONFIRMED | Production AI Worker Cloud Pipeline là extension ở pha sau | `03-features/05-digital-twin.md` |
| Voice/i18n | Voice Player Widget `/voice`, `SpeechSynthesis`/`SpeechRecognition` client integration và REST API `/api/v1/voice/*` (scripts, synthesize, command, admin config/cost-estimate) | In-memory Script/Glossary/Admin-config store, TTS cache theo hash `plainText+voiceId+speed+locale+engineVersion` | VoiceScriptSchema, VoiceSynthesizeRequestSchema, VoiceCommandRequestSchema, VoiceAdminConfigSchema | CODE_CONFIRMED | Chưa có Admin CMS UI cho script/glossary (chỉ REST endpoint); engine mặc định là Web Speech API trình duyệt, cloud TTS/STT thật là extension sau này (`DEC-VOICE-001`) | `03-features/06-multilingual-voice.md` |
| Auth/History | Keycloak IAM Container (Port 18080), AuthHeaderBadge, AuthModal, UserProfileDrawer, /profile Web page và REST API /api/v1/auth/* | Keycloak OIDC/JWT Auth Verifier, PostgreSQL auth_users & In-memory bookmarks/history | AuthTokenRequestSchema, UserProfileSchema, UserBookmarkItemSchema, UserHistoryItemSchema | CODE_CONFIRMED | Full Keycloak Realm Export json là extension ở pha sản xuất | `03-features/07-auth-user-history.md` |
| Dashboard | Admin Dashboard Page /dashboard, MetricCards, TopArtifactsTable, TrafficChart và REST API /api/v1/dashboard/* | Pre-aggregated summary metrics & 7-day traffic series | DashboardOverviewMetricSchema, DashboardPopularArtifactSchema, DashboardSummaryResponseSchema | CODE_CONFIRMED | Real-time HyperLogLog & MongoDB raw event aggregation là extension sau MVP | `03-features/08-dashboard-analytics.md` |
| Search/Discovery | SearchBar, Facet Filters, SearchResultCard, SearchPage UI và GET /api/v1/search & /suggest endpoints với unaccent Vietnamese matching | In-memory unaccent Vietnamese normalization & relevance matching | SearchQueryRequestSchema, SearchResponseSchema, SearchSuggestRequestSchema | CODE_CONFIRMED | Dedicated search cluster (Meilisearch/OpenSearch) là extension sau MVP | `03-features/09-search-discovery.md` |
| Indoor Location QR/Photo | Chưa có code | Chưa có | Chưa có | DOCS_ONLY | Cần map/dataset | `03-features/10-indoor-location-detection.md` |
| Living Timeline/Dòng thời gian sống | Mode Switcher (`FREE_EXPLORE`/`GUIDED_JOURNEY`), Related Artifact Cards, REST API endpoints (`/api/v1/timeline/*`) và 2D Timeline UI | Sample Narrative Journeys & Related Artifact Links | Shared Zod timeline contracts | CODE_CONFIRMED | Cinematic 3D camera transition là extension sau MVP | `03-features/11-living-timeline.md` |

## Merge history

| Date | Merge/PR/Commit | Task/Feature | Added/Changed | Docs synchronized | Verified by |
|---|---|---|---|---|---|
| 2026-09-02 | `1bbbe07` / PR `#20` | `TASK-VOICE-001` | Voice Zod Contracts, Express Voice API Router (`/api/v1/voice/*`), Web Speech API client engine, UI Voice Player Widget & Web `/voice` page | YES | `thanh` (tự test trình duyệt thật trước merge) |
| 2026-08-17 | `7a4264d` / PR `#15` | `TASK-3D-NAV-001` | 3D Zod Contracts, Express A* Indoor Route API Router, UI 3D Model Viewer & Web /3d-experience page | YES | `loc` |
| 2026-08-17 | `cae46a2` / PR `#14` | `TASK-AI-GUIDE-001` | AI Guide Zod Contracts, Express RAG & TTS API Router, UI Chat Widget components & Web /ai-guide page | YES | `loc` |
| 2026-08-12 | `1439807` / PR `#13` | `TASK-DASHBOARD-001` | Dashboard Zod Contracts, Express Analytics API Router, UI Dashboard components & Admin Dashboard page | YES | `loc` |
| 2026-08-12 | `8e76271` / PR `#12` | `TASK-AUTH-001` | Keycloak IAM Docker Service, Auth Zod Contracts, Express Auth Router, UI Auth components & Web Profile page | YES | `loc` |
| 2026-08-12 | `400d328` / PR `#11` | `TASK-SEARCH-001` | Search Zod contracts, Express API search router, unaccent Vietnamese matching, UI Search components & Web search page | YES | `loc` |
| 2026-08-03 | `3d8b971` / PR `#2` | `TASK-FOUND-001` | Monorepo/tooling, 5 TypeScript workspace skeletons và 2 Python project skeletons | YES | `thanh` |
| 2026-08-03 | `847251c` / PR `#3` | `TASK-INFRA-001` | PostgreSQL/pgvector, MongoDB, Redis, health checks, volumes, env template và runbook | YES | `loc` |
| 2026-08-03 | `03dfcd4` / PR `#5` | `TASK-WEB-001` | Public Web shell, Heritage design tokens, CMS Block Renderer | YES | `thanh` |
| 2026-08-03 | `8afa7c8` / PR `#4` | `TASK-API-001` | Express API skeleton, health endpoints, correlation ID và Zod error contracts | YES | `thanh` |
| 2026-08-03 | `5ce59f2` / PR `#6` | `TASK-ADMIN-001` | Admin shell layout (Sidebar, Header), CMS Block Form Editor và Live Preview | YES | `thanh` |
| 2026-08-03 | `d75cdf8` / PR `#7` | `TASK-DATA-001` | PostgreSQL DDL migrations, entity DTOs, seed data baseline và DatabaseRepository | YES | `thanh` |
| 2026-08-03 | `92c7caa` / PR `#8` | `TASK-TIMELINE-001` | Living Timeline MVP (FREE_EXPLORE/GUIDED_JOURNEY modes, Related Artifact Cards, REST API endpoints và 2D Timeline UI) | YES | `thanh` |
| 2026-08-03 | `cc1c600` / PR `#9` | `FIX-LINT-001` | Sửa toàn bộ lỗi ESLint rules trên contracts, UI, web, admin và api packages | YES | `thanh` |
| 2026-08-03 | `8d199db` / PR `#6` | `FIX-FORMAT-001` | Prettier normalization for Admin/contracts/UI plus recorded Web header compatibility call-site and test alignment | YES | `thanh`; hosted integrated run `30832872900` PASS |
| 2026-08-03 | `8bf9c9e` / PR `#7` | `FIX-CLEAN-GATE-001` | Fresh-clone Turbo dependency ordering; remove stale Admin export; restore semantic form/validation/live-preview markers | YES | `thanh`; hosted integrated run `30832872900` PASS |
| 2026-08-03 | `be2a18e` / PR `#4` | `TASK-CI-001` | Pinned, least-privilege Foundation quality workflow running the accepted root TypeScript/Python gate | YES | `thanh`; hosted run `30832872900` SUCCESS |
| 2026-08-04 | `e0c4139` / PR `#9` | `TASK-DOC-QUALITY-001` | Repository-controlled Markdown, secret, config/URL, TypeScript AST and API security-regression quality policies plus hosted OSV integration | YES | `thanh`; integrated develop run `30841444661` SUCCESS |
| 2026-08-04 | `7c63cbb` / PR `#10` | `FIX-DOC-QUALITY-CI-001` | Replaced permission-incompatible reusable OSV workflow with direct pinned read-only action job | YES | `thanh`; PR run `30841432956` and develop run `30841444661` SUCCESS |

## Quy tắc

- Chỉ ghi capability có bằng chứng trong `develop`.
- Push feature branch không được ghi implemented.
- Ghi location, owner doc, limitation và test evidence.
- Status: `CODE_CONFIRMED`, `DOCS_ONLY`, `DEPRECATED`.
- Không copy toàn bộ flow; liên kết feature owner.
