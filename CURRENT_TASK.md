# Công việc hiện tại

## Git context

- Expected branch: `feature/TASK-INFRA-001`.
- Base branch: `develop` at shared plan `PLAN-0015`.
- Shared coordination automation: Markdown-only trên `develop`; implementation branch không tự push/merge.

## Task

- Mã: `TASK-INFRA-001`.
- Owner/contributor: `loc`.
- Mục tiêu: Docker Compose local cho PostgreSQL + pgvector, MongoDB, Redis và health checks.
- Feature owner: `docs/06-devops/01-local-environment.md`.
- Trạng thái: `VERIFIED` bởi người dùng; chờ user-owned commit/push feature branch.
- Session: `WS-TASK-INFRA-001-20260803-01`.
- StartedAt: `2026-08-03T11:50:45+07:00`.
- LastActiveAt: `2026-08-03T12:00:24+07:00`.

## Write scope

- `infra/**`.
- `CURRENT_TASK.md`.
- Branch-local implementation evidence trong `docs/06-devops/01-local-environment.md`.

Không sửa root workspace/tooling, app/service/package/worker skeleton hoặc root `.env.example` thuộc `TASK-FOUND-001`.

## PLAN_LOCKED

- Compose project: `hcm-museum`.
- PostgreSQL: host `15432`, container `5432`.
- MongoDB: host `27018`, container `27017`.
- Redis: host `16379`, container `6379`.
- Named volumes: `postgres_data`, `mongo_data`, `redis_data`.
- Secret thật chỉ ở ignored `infra/.env`; repository chỉ có placeholder `infra/.env.example`.

## Acceptance criteria

- Compose config render hợp lệ.
- Ba service có pinned image, named volume và healthcheck.
- Không commit secret/default production credential.
- Hướng dẫn start/stop/status/log và connection endpoint rõ.
- Runtime smoke test chứng minh cả ba service healthy khi Docker engine khả dụng.

## Current checkpoint

- Docker CLI `28.4.0`, engine `28.4.0` và Compose `v2.39.4-desktop.1`.
- Static Compose config: PASS.
- Runtime health: PostgreSQL/MongoDB/Redis đều `healthy`.
- Smoke: PostgreSQL accepting connections; pgvector available `0.8.5`; Mongo ping `1`; Redis `PONG`.
- User-owned ignored `infra/.env`: config và smoke PASS; credential values không được in/log.
- Containers đang chạy healthy với volumes mới của user verification.
- User `loc` xác nhận `VERIFIED` lúc `2026-08-03T12:00:24+07:00`.
- Tiếp theo: người dùng commit/push feature branch để review/merge; AI không tự push/merge implementation.
