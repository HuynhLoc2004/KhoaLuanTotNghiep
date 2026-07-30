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

Mỗi runtime dùng một config module typed/schema-validated và fail fast khi biến bắt buộc thiếu hoặc sai. Business logic không đọc `process.env` trực tiếp. Chỉ biến có nhãn public mới được expose vào frontend; server secret không được dùng prefix/public injection. External origin, callback, provider endpoint, timeout và quota phụ thuộc môi trường không được hard-code trong runtime source. Internal API route/event vẫn thuộc shared contract, không biến thành environment variable.

## Thiết lập theo pha

1. Cài Docker Desktop, Git, Node LTS, pnpm, Python phù hợp.
2. Copy `.env.example`, tạo key local.
3. `docker compose up` hạ tầng.
4. Chạy migration và seed demo qua command có kiểm soát.
5. Chạy web/admin/api/worker hoặc toàn bộ bằng Compose.

## CI

Lint -> typecheck -> unit -> integration -> build -> image scan -> E2E smoke. Migration kiểm tra trên database rỗng và bản snapshot gần production. Deploy staging trước production; production cần approval và rollback image.

## Lưu ý Windows

Dùng LF qua `.gitattributes`, tránh mount quá nhiều file gây chậm, ưu tiên named volume cho database và chạy command thống nhất qua package scripts.
