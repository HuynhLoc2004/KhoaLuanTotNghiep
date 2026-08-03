# TASK-ADMIN-001 — Admin shell + navigation + CMS form foundation

## Identity and Git context

- Owner/contributor: `thanh`.
- Branch: `feature/TASK-ADMIN-001`.
- Base/shared plan revision: `PLAN-0021`.
- Status: `IMPLEMENTED`.

## Objective and write scope

- Objective: Triển khai trang quản trị Admin CMS shell (`apps/admin/`), bộ điều hướng Sidebar & Header cho quản trị viên, cùng CMS Form Foundation cho phép tạo, sửa và quản lý danh sách các CMS Content Blocks (`hero`, `artifact_grid`, `timeline_preview`, `banner`) theo [01-admin-cms.md](../03-features/01-admin-cms.md).
- Owned paths: `apps/admin/**`, `packages/contracts/**`, `docs/work/TASK-ADMIN-001.md`.
- Explicitly excluded: `apps/web/**`, `services/api/**`, `infra/**`, `.github/workflows/**`, shared status/coordination files (`README.md`, `docs/NEXT_WORK.md`, `docs/PROJECT_STATUS.md`).

## PLAN_LOCKED

- Selected Option: Phương án A (Modular Admin Shell + Interactive CMS Form Builder + Live Preview).
- UI Stack: React + TypeScript + Vite + Heritage Design Tokens từ `@hcmc-museum/ui`.
- Layout: Sidebar navigation (Dashboard, Quản lý nội dung CMS, Quản lý hiện vật, Dòng thời gian, Cấu hình), Header thanh công cụ Admin, Main Workspace Panel.
- CMS Form Foundation: Form editor tương tác hỗ trợ chọn loại block (`HERO`, `ARTIFACT_GRID`, `TIMELINE_PREVIEW`, `BANNER`), nhập các trường dữ liệu DTO, validate payload và xem bản hiển thị trực tiếp (Live Preview) thông qua `renderCmsBlock` từ `@hcmc-museum/ui`.
- Acceptance criteria:
  1. `apps/admin` build thành công qua `corepack pnpm --filter @hcmc-museum/admin build`.
  2. Trang Admin hiển thị layout hoàn chỉnh với Sidebar, Header, Form Editor và Live Preview Panel.
  3. Form biên tập CMS block cho phép chọn loại block và nhập các trường tương ứng với Zod schema validation (`validateBlockData`).
  4. Đã có unit/component tests cho Admin Shell & CMS Form Editor (7/7 tests PASS).

## Contribution ledger

| Session ID | Contributor | StartedAt | LastActiveAt | EndedAt | Status | Scope/output | Tests/evidence | Next |
|---|---|---|---|---|---|---|---|---|
| S-001 | `thanh` | 2026-08-03T21:45:02+07:00 | 2026-08-03T21:47:40+07:00 | 2026-08-03T21:47:40+07:00 | IMPLEMENTED | Admin Sidebar, Admin Header, CMS Form Editor, Live Preview Panel, Validate Block Data | 7/7 tests PASS, build PASS | Người dùng review/verify & push PR |

## Implementation evidence

- Behavior/files:
  - `apps/admin/src/shell/layout.ts`: `renderAdminSidebar` và `renderAdminHeader` responsive navigation components.
  - `apps/admin/src/forms/cmsFormBuilder.ts`: `validateBlockData`, `renderCmsBlockFormEditor` và `renderLivePreviewPanel`.
  - `apps/admin/src/shell/adminShell.ts`: `renderAdminShellPage` ghép nối Sidebar, Header, Form Editor và Live Preview Panel thành trang Admin hoàn chỉnh.
  - `apps/admin/src/index.ts`: Export package identity, layouts, form builders và shell page renderer.
  - `apps/admin/test/admin.test.ts`: Integration test suite kiểm thử Admin Sidebar, Header, Form Editor, Block Payload Validation và Admin Shell Renderer (7/7 PASS).
- Tests: `corepack pnpm --filter @hcmc-museum/admin build` (PASS), `corepack pnpm --filter @hcmc-museum/admin test` (PASS: 7/7 tests).
- Security/invariants: Validation dữ liệu đầu vào nghiêm ngặt, giấu dữ liệu nhạy cảm.

## Handoff

- Verification status: UNVERIFIED (Chờ người dùng review & test).
- Feature commit/PR: TBD (Người dùng tự push/PR theo quy tắc).
- Merge status: NOT_MERGED.
