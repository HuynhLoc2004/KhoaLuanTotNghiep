# FIX-LINT-001 — Fix Workspace ESLint Rules Across Merged Packages

## Identity and Git context

- Owner/contributor: `thanh`.
- Branch: `fix/workspace-lint`.
- Base/shared plan revision: `PLAN-0021`.
- Status: `IMPLEMENTED`.

## Objective and write scope

- Objective: Sửa tất cả các lỗi ESLint rules trong `packages/contracts`, `packages/ui`, `apps/web`, `apps/admin`, `services/api` do CI Quality Gate kiểm tra để đảm bảo toàn bộ workspace pass 100% `corepack pnpm -r run lint`.
- Owned paths: `packages/contracts/**`, `packages/ui/**`, `apps/web/**`, `apps/admin/**`, `services/api/**`, `docs/work/FIX-LINT-001.md`.
- Explicitly excluded: `.github/workflows/**`, `infra/**`, `feature/TASK-CI-001` (của Lộc).

## Contribution ledger

| Session ID | Contributor | StartedAt | LastActiveAt | EndedAt | Status | Scope/output | Tests/evidence | Next |
|---|---|---|---|---|---|---|---|---|
| S-001 | `thanh` | 2026-08-03T22:02:24+07:00 | 2026-08-03T22:08:15+07:00 | 2026-08-03T22:08:15+07:00 | IMPLEMENTED | Fixed deprecation, nullish coalescing, template literal restrictions, floating promises, no-base-to-string & array types across packages | 5/5 ESLint packages PASS, 28/28 build/tests PASS | Bàn giao cho user review/push/merge |

## Implementation evidence

- Behavior/files:
  - `packages/contracts/src/common/error.ts`: Sửa `z.uuid()` deprecation & duplicate optional type constituent.
  - `packages/contracts/test/timeline.test.ts`: Thêm `void` operator cho floating promise `test()`.
  - `packages/ui/src/cms/renderer.ts`: Thay `||` bằng `??` và ép kiểu `String(idx)` trong template string.
  - `packages/ui/src/timeline/renderer.ts`: Thay `||` bằng `??` và ép kiểu `String(index + 1)`.
  - `packages/ui/test/*.test.ts`: Thêm `void` operator cho floating promises `test()`.
  - `apps/web/src/shell/webShell.ts` & `apps/web/src/timeline/page.ts`: Thay `||` bằng `??`.
  - `apps/web/test/*.test.ts`: Thêm `void` operator cho floating promises `test()`.
  - `apps/admin/src/forms/cmsFormBuilder.ts`: Sửa `Array<T>` thành `T[]`, sửa `no-base-to-string` khi validate `unknown` fields.
  - `apps/admin/src/shell/adminShell.ts`: Bỏ import dư thừa `renderLivePreviewPanel`, thay `||` bằng `??`.
  - `apps/admin/test/admin.test.ts`: Thêm `void` operator cho floating promise `test()`.
  - `services/api/src/db/migrations.ts`: Sửa generic constructor & `Array<T>` thành `T[]`.
  - `services/api/src/middleware/correlationId.ts`: Thêm `eslint-disable` cho `Express` namespace declaration merging.
  - `services/api/src/middleware/errorHandler.ts`: Bỏ `if (issue.code)` thừa.
  - `services/api/src/middleware/validate.ts`: Dùng `z.ZodType` thay cho `ZodSchema` đã deprecated.
  - `services/api/src/routes/timeline.ts`: Dùng `dot-notation` và `??`.
  - `services/api/test/*.test.ts`: Thêm `void` operator cho `test()` và ép kiểu `String()`.
- Quality Gate Verification:
  - `corepack pnpm -r run lint`: **PASS 100% (5/5 projects)**
  - `corepack pnpm -r run build`: **PASS 100%**
  - `corepack pnpm -r run test`: **PASS 100% (28/28 tests)**

## Handoff

- Verification status: UNVERIFIED (Chờ người dùng review)
- Feature commit/PR: TBD (Người dùng tự push/merge)
- Merge status: NOT_MERGED
