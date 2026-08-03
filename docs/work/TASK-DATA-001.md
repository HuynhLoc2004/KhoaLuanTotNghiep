# TASK-DATA-001 — PostgreSQL migration foundation và entity baseline

## Identity and Git context

- Owner/contributor: `thanh`.
- Branch: `feature/TASK-DATA-001`.
- Base/shared plan revision: `PLAN-0021`.
- Status: `IMPLEMENTED`.

## Objective and write scope

- Objective: Khởi tạo nền tảng database migration (Knex / Kysely / DDL schema definition) và entity baseline cho PostgreSQL + pgvector, định nghĩa các bảng `roles`, `users`, `cms_pages`, `cms_sections`, `artifacts`, `media_assets` cùng seed data baseline theo [01-data-model.md](../02-data/01-data-model.md).
- Owned paths: `services/api/src/db/**`, `migrations/**`, `docs/work/TASK-DATA-001.md`.
- Explicitly excluded: `apps/web/**`, `apps/admin/**`, `infra/**`, `.github/workflows/**`, shared status/coordination files (`README.md`, `docs/NEXT_WORK.md`, `docs/PROJECT_STATUS.md`).

## PLAN_LOCKED

- Database Framework: PostgreSQL 16 + pgvector extensión.
- Schema Entities:
  1. `roles` & `users`: Quản lý tài khoản & phân quyền RBAC (`ADMIN`, `CURATOR`, `VISITOR`).
  2. `cms_pages` & `cms_sections`: Quản lý trang & các khối nội dung (`hero`, `artifact_grid`, `timeline_preview`, `banner`).
  3. `artifacts` & `media_assets`: Quản lý hiện vật bảo tàng & tài nguyên 3D/hình ảnh.
- Seeds: Script khởi tạo dữ liệu mẫu cho dev/testing (`roles`, `users`, sample `cms_page`, `artifacts` Trống Đồng Đông Sơn & Tượng Thần Vishnu Óc Eo).
- Acceptance criteria:
  1. DDL SQL migration scripts chạy khởi tạo bảng thành công không có lỗi syntax.
  2. Entity types & DTO definitions đầy đủ trong TypeScript (`schema.ts`).
  3. Seed script chạy tạo dữ liệu mẫu thành công (`seed.ts`).
  4. Unit/integration tests cho Database Repository & Migration Runner (12/12 tests PASS).

## Contribution ledger

| Session ID | Contributor | StartedAt | LastActiveAt | EndedAt | Status | Scope/output | Tests/evidence | Next |
|---|---|---|---|---|---|---|---|---|
| S-001 | `thanh` | 2026-08-03T21:49:58+07:00 | 2026-08-03T21:51:30+07:00 | 2026-08-03T21:51:30+07:00 | IMPLEMENTED | Database DDL migrations, Entity DTOs, Seed data baseline, DatabaseRepository class | 12/12 tests PASS, build PASS | Người dùng review/verify & push PR |

## Implementation evidence

- Behavior/files:
  - `services/api/src/db/schema.ts`: Định nghĩa TypeScript interfaces & DTOs cho `RoleEntity`, `UserEntity`, `CmsPageEntity`, `CmsSectionEntity`, `ArtifactEntity`, `MediaAssetEntity`.
  - `services/api/src/db/migrations.ts`: `BASELINE_MIGRATIONS` DDL SQL statements và `MigrationRunner` module.
  - `services/api/src/db/seed.ts`: Seed data baseline cho Roles, Users (`vithanh135`, `huynhtanloc2004`), CMS Page, CMS Sections và Artifacts (`Trống Đồng Đông Sơn`, `Tượng Thần Vishnu Óc Eo`).
  - `services/api/src/db/client.ts`: `DatabaseRepository` abstraction quản lý query/mutation và fallback in-memory store cho unit test.
  - `services/api/src/index.ts`: Export database schema, migrations, seed, repository và `createApp`.
  - `services/api/test/db.test.ts`: Test suite kiểm thử MigrationRunner, Default Seeding, Artifact Queries & Creation (12/12 PASS).
- Tests: `corepack pnpm --filter @hcmc-museum/api build` (PASS), `corepack pnpm --filter @hcmc-museum/api test` (PASS: 12/12 tests).
- Security/invariants: Strict primary key IDs, relational FK constraints, JSONB column configurations.

## Handoff

- Verification status: UNVERIFIED (Chờ người dùng review & test).
- Feature commit/PR: TBD (Người dùng tự push/PR theo quy tắc).
- Merge status: NOT_MERGED.
