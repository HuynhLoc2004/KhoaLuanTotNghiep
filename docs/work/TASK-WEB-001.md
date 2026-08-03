# TASK-WEB-001 — Public Web shell + design tokens + CMS renderer skeleton

## Identity and Git context

- Owner/contributor: `thanh`.
- Branch: `feature/TASK-WEB-001`.
- Base/shared plan revision: `PLAN-0019`.
- Status: `IMPLEMENTED`.

## Objective and write scope

- Objective: Triển khai ứng dụng Public Web shell (`apps/web/`), hệ thống Design Tokens và reusable UI components (`packages/ui/`), cùng CMS renderer skeleton hỗ trợ render layout và component từ CMS response DTO theo [01-ui-ux-design-system.md](../04-design/01-ui-ux-design-system.md).
- Owned paths: `apps/web/**`, `packages/ui/**`, `docs/work/TASK-WEB-001.md`.
- Explicitly excluded: `apps/admin/**`, `services/api/**`, `infra/**`, `.github/workflows/**`, shared status/coordination files (`README.md`, `docs/NEXT_WORK.md`, `docs/PROJECT_STATUS.md`).

## PLAN_LOCKED

- Selected Option: Phương án A (Shared UI Package `@hcmc-museum/ui` + Dynamic CMS Block Renderer).
- UI Stack: React + TypeScript + Vite + Tailwind CSS / Heritage Modern Dark design tokens.
- Design System Tokens: Predefined CSS variables và theme constants cho màu sắc di sản (Primary Red `#9E1B1B`, Heritage Gold `#D4AF37`, Bronze, Dark Charcoal, Silk White), typography (Outfit/Cinzel/Inter), micro-animations, glassmorphism, và responsive breakpoints.
- Dynamic CMS Renderer: Component Registry Pattern ánh xạ `type` từ CMS DTO (`hero`, `artifact_grid`, `timeline_preview`, `banner`) sang UI blocks tương ứng.
- Acceptance criteria:
  1. `apps/web` và `packages/ui` build thành công qua `corepack pnpm -r run build`.
  2. Public Web hiển thị shell responsive, có header navigation (Logo, Trang chủ, Hiện vật, Dòng thời gian, Bản đồ 3D, AI Guide) và footer.
  3. Design Tokens được định nghĩa tập trung trong `packages/ui` và được tiêu thụ bởi `apps/web`.
  4. CMS Renderer skeleton nhận JSON DTO và render đúng các component giao diện mà không hardcode dữ liệu production.
  5. Đã có unit/component tests cho UI components và CMS renderer (13/13 tests PASS).

## Contribution ledger

| Session ID | Contributor | StartedAt | LastActiveAt | EndedAt | Status | Scope/output | Tests/evidence | Next |
|---|---|---|---|---|---|---|---|---|
| S-001 | `thanh` | 2026-08-03T21:28:52+07:00 | 2026-08-03T21:32:30+07:00 | 2026-08-03T21:32:30+07:00 | IMPLEMENTED | Heritage Design Tokens, UI primitives, CMS Block Renderer, Web Shell Layout | 13/13 tests PASS, build PASS | Người dùng review/verify & push PR |

## Implementation evidence

- Behavior/files:
  - `packages/ui/src/tokens/theme.ts`: `heritageTheme` chứa bảng màu di sản, typography, glassmorphism, và micro-animations.
  - `packages/ui/src/cms/types.ts`: Định nghĩa DTO interfaces cho CMS blocks (`CmsHeroBlock`, `CmsArtifactGridBlock`, `CmsTimelinePreviewBlock`, `CmsBannerBlock`, `CmsPagePayload`).
  - `packages/ui/src/cms/renderer.ts`: `renderCmsBlock` registry renderer biến đổi CMS DTO thành HTML/CSS components.
  - `packages/ui/src/index.ts`: Export theme tokens, types, và renderer functions.
  - `apps/web/src/shell/layout.ts`: `renderHeader` và `renderFooter` layout components.
  - `apps/web/src/shell/webShell.ts`: `renderWebShellPage` và `getSampleMuseumPagePayload` ghép nối trang Public Web hoàn chỉnh.
  - `apps/web/src/index.ts`: Export web shell renderer và layouts.
  - `packages/ui/test/ui.test.ts`: Test suite kiểm thử Design Tokens và 5 CMS Block renderers (8/8 PASS).
  - `apps/web/test/web.test.ts`: Integration test suite kiểm thử Web Shell Layout, Header, Footer và CMS Page renderer (5/5 PASS).
- Tests: `corepack pnpm -r run build` (PASS), `corepack pnpm -r run test` (PASS: 13/13 tests across packages).
- Security/invariants: Không hardcode dữ liệu production, sanitize render layout từ CMS DTO.

## Handoff

- Verification status: UNVERIFIED (Chờ người dùng review & test).
- Feature commit/PR: TBD (Người dùng tự push/PR theo quy tắc).
- Merge status: NOT_MERGED.
