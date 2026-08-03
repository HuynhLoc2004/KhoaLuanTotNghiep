# Docker, môi trường và CI/CD

## Cấu trúc repository dự kiến

```text
apps/web
apps/admin
services/api
services/ai
workers/media
packages/ui
packages/contracts
infra/nginx
infra/docker
docs
```

Monorepo dùng pnpm workspace/Turborepo cho TypeScript; Python quản lý riêng bằng uv/Poetry. Không buộc mọi ngôn ngữ vào cùng package manager.

## Container local

- `web`, `admin`, `api`, `ai-worker`, `media-worker`.
- `postgres`, `mongo`, `redis`, `nginx`.
- Tùy chọn `minio` để mô phỏng object storage khi không muốn dùng Cloudinary local.
- Healthcheck và named volume; migration chạy bằng job riêng, không chạy đồng thời ở mọi API replica.

### Local service contract — BRANCH-LOCAL PLAN_LOCKED

Compose project dùng tên `hcm-museum`. Port trong container giữ port chuẩn; port publish lên host dùng dải riêng để giảm xung đột với dịch vụ đã cài trên máy phát triển.

| Service | Compose name | Host port | Container port | Trạng thái |
|---|---|---:|---:|---|
| PostgreSQL | `postgres` | `15432` | `5432` | TASK-INFRA-001 |
| MongoDB | `mongo` | `27018` | `27017` | TASK-INFRA-001 |
| Redis | `redis` | `16379` | `6379` | TASK-INFRA-001 |
| API | `api` | `3000` | `3000` | Reserved |
| AI worker/service | `ai-worker` | `8000` | `8000` | Reserved |
| Media worker | `media-worker` | `8001` | `8001` | Reserved |
| Public Web | `web` | `5173` | `5173` | Reserved |
| Admin | `admin` | `5174` | `5174` | Reserved |
| Nginx | `nginx` | `8080` | `80` | Reserved |
| MinIO API | `minio` | `19000` | `9000` | Optional/reserved |
| MinIO Console | `minio` | `19001` | `9001` | Optional/reserved |

Container-to-container connection dùng Compose DNS và container port (`postgres:5432`, `mongo:27017`, `redis:6379`). Process chạy trực tiếp trên host dùng `localhost` và host port tương ứng. Reserved port chưa cho phép TASK-INFRA-001 tạo app container ngoài write scope.

Named volume baseline: `postgres_data`, `mongo_data`, `redis_data`. Database local mặc định là `museum`, PostgreSQL role ứng dụng là `museum_app`; credential thật phải đến từ ignored local environment hoặc Docker secret.

## Biến môi trường

```dotenv
NODE_ENV=
DATABASE_URL=
MONGODB_URI=
REDIS_URL=
JWT_PRIVATE_KEY=
JWT_PUBLIC_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
AI_PROVIDER_API_KEY=
PUBLIC_API_ORIGIN=
MEDIA_ORIGIN=
```

File thật là `.env.local`/Docker secret và bị ignore. `.env.example` chỉ để tên và mô tả.

Ví dụ endpoint local không chứa secret thật:

```dotenv
# Dùng từ container trong Compose network
DATABASE_URL=postgresql://museum_app:<local-password>@postgres:5432/museum
MONGODB_URI=mongodb://mongo:27017/museum
REDIS_URL=redis://redis:6379

# Dùng khi runtime chạy trực tiếp trên host
DATABASE_URL_HOST=postgresql://museum_app:<local-password>@localhost:15432/museum
MONGODB_URI_HOST=mongodb://localhost:27018/museum
REDIS_URL_HOST=redis://localhost:16379
```

Tên có hậu tố `_HOST` là tài liệu phân biệt ngữ cảnh, không mặc định yêu cầu runtime hỗ trợ hai bộ biến cùng lúc. Mỗi runtime vẫn nhận đúng một `DATABASE_URL`, `MONGODB_URI` và `REDIS_URL` đã được typed validation.

Mỗi runtime dùng một config module typed/schema-validated và fail fast khi biến bắt buộc thiếu hoặc sai. Business logic không đọc `process.env` trực tiếp. Chỉ biến có nhãn public mới được expose vào frontend; server secret không được dùng prefix/public injection. External origin, callback, provider endpoint, timeout và quota phụ thuộc môi trường không được hard-code trong runtime source. Internal API route/event vẫn thuộc shared contract, không biến thành environment variable.

## Thiết lập theo pha

1. Cài Docker Desktop, Git, Node LTS, pnpm, Python phù hợp.
2. Copy `.env.example`, tạo key local.
3. `docker compose up` hạ tầng.
4. Chạy migration và seed demo qua command có kiểm soát.
5. Chạy web/admin/api/worker hoặc toàn bộ bằng Compose.

## CI

Lint -> typecheck -> unit -> integration -> build -> image scan -> E2E smoke. Migration kiểm tra trên database rỗng và bản snapshot gần production. Deploy staging trước production; production cần approval và rollback image.

### Foundation quality gate — IMPLEMENTED / VERIFIED

- Workflow: `.github/workflows/quality.yml`; merge `be2a18e` / PR `#4`.
- Trigger: push vào `develop`/`main`, pull request hướng tới `develop`, hoặc manual dispatch; run cũ cùng ref bị hủy bằng concurrency group.
- Flow: checkout read-only không persist credential -> cài Node/pnpm/uv/Python đã pin -> `pnpm install --frozen-lockfile` -> chạy root `pnpm check`.
- Security: workflow chỉ có `contents: read`, không dùng project secret, không khởi động Compose, không deploy và không truy cập dữ liệu production.
- Evidence: GitHub Actions run `30832872900` `SUCCESS` trên exact merge commit `be2a18e`; `thanh` xác nhận `VERIFIED` ngày 2026-08-03.
- Limitation/fallback: một job tuần tự, không dependency cache và chưa gồm image scan/E2E/deploy. Khi GitHub outage có thể chạy cùng root gate local để chẩn đoán, nhưng local evidence không thay hosted status.

## Lưu ý Windows

Dùng LF qua `.gitattributes`, tránh mount quá nhiều file gây chậm, ưu tiên named volume cho database và chạy command thống nhất qua package scripts.

## Delivery estimate

- Optimistic: 1 person-day.
- Expected: 2 person-days.
- Pessimistic: 3 person-days.
- Confidence: MEDIUM.
- Bao gồm: Compose cho PostgreSQL/MongoDB/Redis, health checks, named volumes, `.env.example` liên quan và smoke verification.
- Không bao gồm: app container, migration nghiệp vụ, production deployment, Nginx và MinIO implementation.
- Dependency/risk: cấu trúc root/Compose entrypoint từ `TASK-FOUND-001`; xung đột port trên máy; Docker Desktop/Windows filesystem.

## Implementation status

- `TASK-INFRA-001`: `DONE`; owner `loc`, `VERIFIED` tại 2026-08-03T12:00:24+07:00, merge vào `develop` tại `847251c`; Merge Memory Sync PASS.
- Implemented baseline: PostgreSQL + pgvector, MongoDB, Redis, named volumes, authenticated health checks, ignored local environment và runbook trong `infra/`.
- Evidence: Compose config validation và runtime smoke/health PASS theo `docs/work/TASK-INFRA-001.md`.
- Limitation: chỉ là local development infrastructure; chưa có production secret manager, backup/restore automation, TLS, monitoring hoặc schema/migration nghiệp vụ.
- Local service/port contract: branch-local `PLAN_LOCKED` bởi `loc` ngày 2026-08-03 và đã được hai thành viên đồng thuận; chưa là shared plan cho đến khi xuất hiện trên remote `develop`.
- Compose, health checks và smoke test: `PLANNED`.
- `TASK-CI-001`: `DONE`; owner `loc`, merge `be2a18e`, hosted run `30832872900` PASS, Merge Memory Sync PASS.

## Decision log

| Ngày | ID | Trạng thái | Quyết định | Lý do và phương án không chọn |
|---|---|---|---|---|
| 2026-08-03 | `DEC-INFRA-LOCAL-PORTS-001` | IMPLEMENTED; VERIFIED | Giữ port chuẩn trong container, dùng host ports `15432`, `27018`, `16379`; Compose DNS dùng `postgres`, `mongo`, `redis`; reserve dải app/proxy theo bảng trên. | Giảm va chạm với dịch vụ local nhưng vẫn giữ kết nối nội bộ theo convention. Không chọn publish trực tiếp toàn bộ port chuẩn vì dễ collision trên máy phát triển. |
| 2026-08-03 | `OPTION-CI-001/A` | IMPLEMENTED; VERIFIED | Dùng một deterministic cross-runtime GitHub Actions job gọi root `pnpm check`, pin tool/action, frozen install, least privilege và không cache. | Giữ một nguồn orchestration và bề mặt bảo trì nhỏ. Chưa chọn parallel/reusable workflows vì chưa có evidence về thời gian hay nhiều consumer. |

## Change history

| Ngày | Loại | Thay đổi | Evidence |
|---|---|---|---|
| 2026-08-03 | ADDED | Chuẩn bị đề xuất service naming, host/container ports, volume/database naming và estimate cho `TASK-INFRA-001` trên feature branch. | User `loc` chọn Phương án B; chờ nhóm thống nhất; implementation/test chưa chạy. |
| 2026-08-03 | IMPLEMENTED | Thêm Compose cho PostgreSQL+pgvector, MongoDB, Redis, health checks, volumes, env template và runbook. | Runtime smoke/health PASS; `loc` xác nhận `VERIFIED`. |
| 2026-08-03 | MERGED | Tích hợp `TASK-INFRA-001` vào `develop` và promote shared implementation memory. | Merge `847251c`; Merge Memory Sync PASS. |
| 2026-08-03 | MERGED / VERIFIED | Tích hợp `TASK-CI-001` và promote Foundation hosted quality gate. | Merge `be2a18e`; hosted run `30832872900` SUCCESS; Merge Memory Sync PASS. |
