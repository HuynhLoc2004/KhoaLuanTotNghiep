# TASK-API-001 — Express API skeleton, health endpoint và validation/error contract

## Identity and Git context

- Owner/contributor: `thanh`.
- Branch: `feature/TASK-API-001`.
- Base/shared plan revision: `PLAN-0019`.
- Status: `IMPLEMENTED`.

## Objective and write scope

- Objective: Triển khai Express API skeleton cho backend service (`services/api/`), health endpoint (`/health`, `/api/v1/health`), chuẩn hóa error middleware (`{ code, message, details?, correlationId }`) và Zod validation contract theo [02-api-contract.md](../02-data/02-api-contract.md).
- Owned paths: `services/api/**`, `packages/contracts/**`, `docs/work/TASK-API-001.md`.
- Explicitly excluded: `apps/web/**`, `apps/admin/**`, `services/ai/**`, `infra/**`, shared status/coordination files (`README.md`, `docs/NEXT_WORK.md`, `docs/PROJECT_STATUS.md`).

## PLAN_LOCKED

- Selected Option: Phương án A (Express Modular Service + Shared Zod Contracts Package `@hcmc-museum/contracts`).
- Runtime & Framework: Express.js + TypeScript trong `services/api/`.
- API Base Path: `/api/v1`.
- Health Check Endpoints:
  - `GET /health`: Basic service liveness.
  - `GET /api/v1/health`: Detailed API readiness check.
- Standardized Error Format:
  ```json
  {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": [],
    "correlationId": "uuid-v4"
  }
  ```
- Validation Engine: Zod payload validation middleware.
- Acceptance criteria:
  1. `services/api` chạy và build thành công qua `corepack pnpm --filter @hcmc-museum/api build`.
  2. Endpoint `/health` và `/api/v1/health` trả đúng HTTP 200 JSON status.
  3. Lỗi 404 (Route not found) và 500 (Unhandled exception) trả đúng cấu trúc chuẩn.
  4. Zod validation middleware bắt lỗi 400 Bad Request và trả về `details` dạng formatted error array.
  5. Đã bao gồm unit/integration tests cho health & error handler middleware (7/7 tests PASS).

## Contribution ledger

| Session ID | Contributor | StartedAt | LastActiveAt | EndedAt | Status | Scope/output | Tests/evidence | Next |
|---|---|---|---|---|---|---|---|---|
| S-001 | `thanh` | 2026-08-03T21:16:42+07:00 | 2026-08-03T21:20:30+07:00 | 2026-08-03T21:20:30+07:00 | IMPLEMENTED | Express API skeleton, correlationId, error handler, Zod validator, health endpoints | 7/7 tests PASS, build PASS | Người dùng review/verify & push PR |

## Implementation evidence

- Behavior/files:
  - `packages/contracts/src/common/error.ts`: Định nghĩa `ApiErrorResponseSchema`, `ApiErrorDetailSchema`, `ErrorCode`, và `ApiError` class.
  - `packages/contracts/src/common/health.ts`: Định nghĩa `HealthStatusResponseSchema`.
  - `packages/contracts/src/index.ts`: Export module `error` và `health`.
  - `services/api/src/middleware/correlationId.ts`: Tự động tạo hoặc truyền tiếp header `X-Correlation-Id`.
  - `services/api/src/middleware/errorHandler.ts`: Express Error handling middleware chuẩn hóa response theo `{ code, message, details?, correlationId }` và `notFoundHandler` cho route 404.
  - `services/api/src/middleware/validate.ts`: Middleware validate Zod schema cho `body`, `query`, `params`.
  - `services/api/src/routes/health.ts`: Endpoint `/health` và `/api/v1/health`.
  - `services/api/src/app.ts`: Assembles Express application với `helmet`, `cors`, `json`, `correlationId`, `routes`, `errorHandler`.
  - `services/api/test/api.test.ts`: Integration test suite kiểm thử 200 health, 400 validation error, 403 ApiError, 404 not found, và X-Correlation-Id header.
- Tests: `corepack pnpm -r run build` (PASS), `corepack pnpm -r run test` (PASS: 7/7 tests).
- Security/invariants: Correlation ID tracing, giấu stack trace internal khi không ở mode development, validation nghiêm ngặt bằng Zod.

## Handoff

- Verification status: UNVERIFIED (Chờ người dùng review & test).
- Feature commit/PR: TBD (Người dùng tự push/PR theo quy tắc).
- Merge status: NOT_MERGED.
