# Docker, môi trường và CI/CD

Tài liệu này là feature owner cho foundation môi trường phát triển. Tiêu đề lịch sử vẫn bao gồm Docker và CI/CD, nhưng `TASK-FOUND-001` chỉ triển khai monorepo tooling, skeleton và local quality gate. Docker, hạ tầng runtime và CI automation được bảo lưu cho các task kế tiếp; chúng không được mô tả như code đã tồn tại.

## 1. Feature summary

### Implementation status

| Trường | Giá trị |
|---|---|
| Task | `TASK-FOUND-001` |
| Branch | `feature/TASK-FOUND-001` |
| Owner/contributor | `thanh` |
| Status | `IMPLEMENTED` — chưa `VERIFIED`, chưa merge |
| Version | Foundation `0.1.0` |
| Decision | `DEC-FOUND-TOOLING-001` — `PLAN_LOCKED` ngày 2026-08-03 |
| Runtime behavior | Không có; skeleton chỉ xuất metadata tĩnh để kiểm tra boundary |

- **Mục tiêu:** tạo baseline đa runtime có thể cài từ lockfile, phát hiện package, kiểm tra chất lượng và build lặp lại.
- **Actor/persona:** cộng tác viên phát triển, reviewer và CI runner tương lai; không phải khách tham quan hay quản trị viên nghiệp vụ.
- **Giá trị:** mọi task sau có chung cấu trúc package, compiler/linter/test runner, quy tắc secret và một quality gate fail-fast.
- **Status semantics:** `IMPLEMENTED` nghĩa là source/config/lock/test đã có và root gate đã PASS với toolchain khóa. Chỉ người dùng/nhóm đổi sang `VERIFIED` sau review/fresh-clone verification.

### Trong phạm vi

- Root pnpm workspace, Turborepo task graph, TypeScript/ESLint/Prettier config và lockfile.
- Skeleton tối thiểu cho Web, Admin, API, AI service, media worker, UI package và contract package.
- Format, lint, typecheck, unit test, build và root verification entrypoint.
- Hai Python project/lockfile độc lập với Ruff và pytest.
- Secret/config inventory, ignored artifacts, LF/Windows compatibility và tài liệu triển khai.

### Ngoài phạm vi

- `infra/**`, Docker Compose, Nginx, database/migration và runtime healthcheck (`TASK-INFRA-001`).
- React/Admin shell (`TASK-WEB-001`, `TASK-ADMIN-001`).
- Express/FastAPI endpoint, validation/error contract và auth runtime (`TASK-API-001`).
- OpenAPI/DTO/event/CMS schema nghiệp vụ và CI quality automation (`TASK-DOC-QUALITY-001`).
- Production content, external provider call, database query, cache/queue nghiệp vụ, upload và 3D/motion.

### Code locations

| Boundary | Vị trí |
|---|---|
| Root orchestration | `package.json`, `.node-version`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `turbo.json` |
| TypeScript quality | `tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore` |
| Repository hygiene | `.editorconfig`, `.gitattributes`, `.gitignore`, `.env.example` |
| Python orchestration | `scripts/check-python.mjs` |
| TypeScript skeletons | `apps/web`, `apps/admin`, `services/api`, `packages/ui`, `packages/contracts` |
| Python skeletons | `services/ai`, `workers/media` |
| Python locks | `services/ai/uv.lock`, `workers/media/uv.lock` |
| Component tests | Mỗi TypeScript workspace có `test/component.test.ts`; mỗi Python project có `tests/test_descriptor.py` |

## 2. User/Business Flow

~~~mermaid
flowchart TD
  A[Contributor có fresh clone] --> B{Đúng branch và toolchain?}
  B -->|Không| X[Dừng; cài đúng Node, pnpm, Python và uv]
  B -->|Có| C[Cài dependency bằng lockfile]
  C --> D{Lockfile và workspace hợp lệ?}
  D -->|Không| Y[Dừng; không tự cập nhật lock trong quality gate]
  D -->|Có| E[Chạy pnpm check]
  E --> F[Kiểm tra 5 TypeScript workspace]
  F --> G[Kiểm tra 2 Python project]
  G --> H{Mọi command exit 0?}
  H -->|Không| Z[Sửa source/config rồi chạy lại]
  H -->|Có| I[Baseline sẵn sàng để review]
~~~

### Giải thích

1. **Entry condition:** contributor đã xác nhận task/branch, working tree không có xung đột và dùng toolchain trong version range đã khóa.
2. **Main steps:** cài dependency frozen/locked, chạy root gate, để Turbo điều phối 5 TypeScript workspace rồi để `check-python.mjs` kiểm tra lần lượt 2 uv project.
3. **Decision points:** sai toolchain, lockfile không đồng bộ, workspace cycle hoặc bất kỳ quality command trả mã khác 0 đều chặn luồng.
4. **Error/fallback:** thông báo lỗi của command được giữ nguyên; contributor sửa nguyên nhân và chạy lại. Khi Turbo không dùng được, có thể chạy `pnpm -r` theo fallback đã khóa; Python project vẫn kiểm tra độc lập.
5. **Output:** mã thoát 0 và log PASS cho format/lint/typecheck/test/build; không tạo dữ liệu nghiệp vụ.
6. **Persisted/audited data:** source, manifest và lockfile là dữ liệu commit được; `dist`, `.turbo`, `.venv` và test cache chỉ ở local, bị ignore. Git history sau khi người dùng commit là audit trail; task này không có audit store runtime.

## 3. System Sequence

~~~mermaid
sequenceDiagram
  actor C as Contributor
  participant P as pnpm root script
  participant T as Turborepo
  participant W as 5 TS workspaces
  participant J as check-python.mjs
  participant U as uv
  participant Y as 2 Python projects
  participant F as Local filesystem

  C->>P: pnpm install --frozen-lockfile
  P->>F: Đọc package manifests + pnpm-lock.yaml
  F-->>P: Dependency graph đã khóa
  C->>P: pnpm check
  P->>P: Prettier check + root ESLint
  P->>T: lint / typecheck / test / build
  T->>W: Chạy task theo dependency graph
  W-->>T: Exit code + dist/test result
  T-->>P: Tổng hợp trạng thái
  P->>J: node scripts/check-python.mjs
  loop services/ai, workers/media
    J->>U: uv run --locked Ruff/pytest
    U->>F: Đọc pyproject.toml + uv.lock
    U->>Y: Chạy check trong project cô lập
    Y-->>J: Exit code + test result
  end
  alt Có command thất bại
    P-->>C: Exit khác 0; dừng ngay
  else Tất cả thành công
    P-->>C: Exit 0; baseline reviewable
  end
~~~

### Giải thích

1. **Request:** đây là local CLI sequence, không có HTTP request. Contributor gọi install/check từ root repository.
2. **Validation:** pnpm đối chiếu lockfile và workspace; Turbo dùng task graph; uv dùng `--locked` để không âm thầm đổi dependency resolution.
3. **Permission:** process chỉ kế thừa quyền filesystem/network của OS user. Không có token/session/role nghiệp vụ.
4. **Transaction/cache/queue:** không có database transaction hay queue. Turbo chỉ dùng cache local `.turbo`; remote caching bị tắt.
5. **Timeout/retry:** root script không tự retry hoặc che lỗi. Package registry timeout thuộc package manager; command thất bại trả mã khác 0 để caller quyết định chạy lại.
6. **Response:** log console và exit code. Build output `dist/**` là local artifact; không deploy hoặc publish package.

## 4. Data and State Flow

~~~mermaid
stateDiagram-v2
  [*] --> CLONED
  CLONED --> TOOLCHAIN_READY: version range hợp lệ
  TOOLCHAIN_READY --> DEPENDENCIES_LOCKED: frozen/locked install
  DEPENDENCIES_LOCKED --> CHECKING: chạy quality gate
  CHECKING --> CHECK_FAILED: bất kỳ exit code khác 0
  CHECK_FAILED --> TOOLCHAIN_READY: sửa toolchain/config
  CHECK_FAILED --> DEPENDENCIES_LOCKED: sửa source/lock có chủ đích
  CHECKING --> IMPLEMENTED: mọi check thành phần PASS
  IMPLEMENTED --> VERIFIED: người dùng/nhóm review
~~~

### Giải thích

1. **Entry condition:** repository ở trạng thái `CLONED`; lockfile và source là nguồn sự thật.
2. **Main steps:** xác nhận toolchain, materialize dependency local, chạy check và chuyển sang `IMPLEMENTED` khi bằng chứng kỹ thuật đạt.
3. **Decision points:** mismatch toolchain/lock quay lại bước chuẩn bị; lỗi source/config quay lại dependency-ready state sau khi sửa.
4. **Error/fallback:** không tự chuyển sang `IMPLEMENTED` nếu command fail; fallback `pnpm -r` chỉ thay orchestration, không bỏ check.
5. **Output:** source/lock không bị quality gate sửa; dependency, cache và build artifact local có thể xóa/tái tạo.
6. **Persisted/audited data:** task không đọc/ghi user data, database, object storage hay log audit runtime.

| Dữ liệu | Nguồn | Validate | Nơi lưu | Retention | Consumer |
|---|---|---|---|---|---|
| Workspace manifests | Root và 5 `package.json` | pnpm workspace discovery; TypeScript/ESLint parse | Git | Theo lịch sử repository | pnpm, Turbo, developer |
| JS dependency resolution | `pnpm-lock.yaml` | `--frozen-lockfile`, integrity metadata | Git | Theo lịch sử repository | pnpm/CI |
| Python dependency resolution | Hai `uv.lock` | `uv run --locked` | Git | Theo lịch sử repository | uv/CI |
| Source và component tests | `src/**`, `test/**`, `tests/**` | formatter, lint, compiler, test runner | Git | Theo lịch sử repository | Task sau và reviewer |
| Environment-name template | `.env.example` | Chỉ tên/ghi chú; mọi assignment để trống | Git | Theo lịch sử repository | Runtime task sau |
| Dependency/cache/build local | `node_modules`, `.venv`, `.turbo`, `dist` | Tạo lại từ manifest/lock | Local, bị ignore | Xóa tùy lúc | Developer/CI job |

### Query, index and cache evidence

| Query/cache owner | Input/authorization | Shape/projection/pagination | Index + plan evidence | Cache key/TTL/invalidation | p50/p95/rows/query count | Security/fallback |
|---|---|---|---|---|---|---|
| Turborepo local cache | Source/config/lock; quyền OS user | Task output, không có query/pagination | `turbo.json` khai báo `dist/**` cho build | Turbo content hash; không TTL; xóa `.turbo` để invalidate | Không áp dụng DB metrics; warm-cache log chỉ là test evidence, không phải benchmark | Không chứa secret/runtime data trong foundation; remote cache tắt; fallback `pnpm -r` |
| Database/query cache | Không có | Không áp dụng | Không áp dụng | Không áp dụng | 0 query | Task runtime tương lai phải bổ sung evidence |

## 5. Authentication and Authorization Flow

~~~mermaid
flowchart TD
  A[Local CLI invocation] --> B{OS user đọc được repository?}
  B -->|Không| E[Filesystem permission error]
  B -->|Có| C{Install cần package registry?}
  C -->|Có| D[Registry client xác minh lock integrity]
  C -->|Không| F[Dùng dependency đã materialize]
  D --> G{Credential runtime được đọc?}
  F --> G
  G -->|Không, luôn đúng trong foundation| H[Chạy quality gate]
  G -->|Có| X[Dừng: secret không thuộc foundation]
  H --> I{Remote cache?}
  I -->|Tắt| J[Chỉ cache local và trả exit code]
~~~

### Giải thích

1. **Auth method:** không có runtime server, route, token, session, permission hay ownership check trong task này. Quyền duy nhất là OS/filesystem và package-registry access của developer.
2. **Credential boundary:** `JWT_*`, Google OAuth, Cloudinary và AI provider chỉ là tên trống trong `.env.example`; source skeleton không đọc chúng.
3. **Authorization:** pnpm/Turbo/uv không cấp quyền nghiệp vụ. Private registry nếu xuất hiện sau này phải inject credential từ CI secret store, không commit vào repository.
4. **Audit:** console logs, exit code và Git history là bằng chứng phát triển; không có runtime audit event.
5. **CSRF/CORS/rate limit/privacy:** không áp dụng vì không có HTTP/browser runtime hoặc personal data. Owner của API/Web phải bổ sung trước khi triển khai route.
6. **Error/fallback/output:** thiếu quyền filesystem/registry làm install fail; không bypass lockfile. Remote cache tắt nên không có credential hoặc fallback remote-cache trong foundation.

## 6. Algorithm/Business Rule Flow

~~~mermaid
flowchart TD
  I[Manifest, lockfile và source] --> V[Validate toolchain + frozen install]
  V --> W{Workspace graph hợp lệ, không cycle?}
  W -->|Không| F[Exit khác 0]
  W -->|Có| T[Prettier + ESLint + TypeScript]
  T --> N[Node component tests + build]
  N --> P[Hai uv project: Ruff check/format + pytest]
  P --> R{Mọi bước exit 0?}
  R -->|Không| F
  R -->|Có| O[Exit 0 + reproducible evidence]
~~~

### Pseudocode

~~~text
function verifyFoundation():
  require Node in [22.13.0, 23) or [24.0.0, 25)
  prefer Node == 24.18.0 from .node-version
  require pnpm == 11.18.0
  installPnpmDependencies(frozenLockfile = true)
  assert discoverWorkspaces() == {
    web, admin, api, ui, contracts
  }
  rejectWorkspaceCycles()

  runOrFail(prettierCheck)
  runOrFail(turboLintForce)     // root acceptance gate bypasses cache
  runOrFail(rootEslint)
  runOrFail(turboTypecheckForce)
  runOrFail(turboTestForce)     // test depends on build
  runOrFail(turboBuildForce)

  for project in [services/ai, workers/media]:
    runOrFail(uv(project, "--locked", "ruff check ."))
    runOrFail(uv(project, "--locked", "ruff format --check ."))
    runOrFail(uv(project, "--locked", "pytest"))

  return exitCode(0)
~~~

- **Input/output:** input là repository source/config/locks; output là exit code, logs và `dist/**` local.
- **Business rule:** một lỗi chặn toàn gate; không bỏ package, không tự sửa format, không tự cập nhật lock trong command kiểm tra.
- **Complexity:** xấp xỉ O(F + D + T), với F là file được scan, D là dependency graph và T là số test. Task phát triển riêng có thể dùng Turbo cache; root acceptance gate bỏ cache để kết quả không bị dùng chéo giữa Node 22/24.
- **Parameters/threshold:** 5 TypeScript workspaces, 2 Python projects; Node `>=22.13.0 <23 || >=24.0.0 <25`, target `24.18.0`; Python `>=3.11 <3.14`; pnpm đúng `11.18.0`; uv `>=0.11 <0.12`.
- **Dataset/assumptions:** không có dataset nghiệp vụ. Assumption là public registry/lock artifacts khả dụng lúc install và tool binary nằm trên `PATH`.
- **Metrics/confidence:** 5/5 Node component tests và 2/2 pytest đã PASS; confidence MEDIUM cho fresh-clone portability đến khi reviewer chạy root gate trên môi trường sạch.
- **Failure modes:** thiếu shim pnpm/uv, version mismatch, stale/tampered lock, workspace cycle, format/lint/type/test/build failure, registry/network error hoặc filesystem permission error.

## 7. Technology inventory

Không có runtime dependency nghiệp vụ. Các dependency dưới đây chỉ phục vụ toolchain/build/test hoặc Python packaging.

| Technology | Version/range | Module/location | Vai trò | Lý do chọn | Ưu điểm | Nhược điểm | License/cost/security | Scale/replacement |
|---|---|---|---|---|---|---|---|---|
| Node.js | Engine `>=22.13.0 <23 || >=24.0.0 <25`; target `24.18.0` trong `.node-version`; tested `22.16.0` và `24.18.0` | Root và 5 TS workspace | JS runtime, compiler/test host | Chỉ nhận hai LTS major đã chấp nhận, có `node:test` | Tránh vô tình dùng odd/non-target major; một runtime cho tooling và service TS | Cần quản lý version/shim trên Windows | OSS; không phí runtime; phải theo dõi security release | Thay range qua decision + lock/tool compatibility review |
| Corepack | Tested `0.32.0`; host tool tùy chọn | Developer machine | Có thể materialize pnpm đã pin khi shim khả dụng | Đọc `packageManager` tự động | Giảm drift trên host đã cấu hình | `corepack enable pnpm` bị EPERM khi không có quyền ghi `C:\Program Files\nodejs` | Không lưu project secret | Fallback đã kiểm chứng: pnpm exact qua `npx`, không cần global install |
| pnpm | `11.18.0` exact | `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` | Workspace/install/script runner | Store hiệu quả, lockfile chung, cycle guard | Nhanh, deterministic, workspace protocol-ready | Cần binary/shim hoặc bootstrap qua npx | OSS/no runtime fee; frozen lock + integrity | `npx --yes pnpm@11.18.0`; đổi manager cần plan revision |
| Turborepo | `2.10.8` exact | `turbo.json` | Task graph và local cache | Nhẹ, khớp monorepo nhỏ | Dependency-aware, repeated checks nhanh | Thêm cache semantics/tool binary | OSS/no remote-cache cost trong scope; remote cache tắt | Fallback `pnpm -r`; remote cache chỉ sau security review |
| TypeScript | `6.0.3` exact | Root dev dependency, `tsconfig.base.json` | Strict compiler và declaration build | Shared type safety | Strict, NodeNext, reusable config | Compiler upgrade có thể lộ breaking diagnostics | OSS/no runtime dependency | Upgrade tập trung qua root lock |
| Node types | `@types/node 22.20.1` exact | Root dev dependency | Type definitions cho Node APIs | Khớp minimum supported Node major | Stable compile surface | Không đại diện API chỉ có ở Node 24 | OSS/dev-only | Nâng sau compatibility review |
| ESLint stack | `eslint 10.8.0`, `@eslint/js 10.0.1`, `typescript-eslint 8.65.0` | `eslint.config.mjs` | JS/TS static analysis | Strict/stylistic type-aware rules | Một flat config cho workspace | Type-aware lint tốn thời gian hơn | OSS/dev-only; không xử lý secret scan | Có thể thay rule set, không thay package boundary |
| Prettier | `3.9.6` exact | Root config/scripts | Deterministic formatting | Giảm style drift | Cross-platform, check/write tách biệt | Markdown/lockfile được ignore có chủ đích | OSS/dev-only | Có thể chạy riêng khi Turbo unavailable |
| Node test runner | Bundled với Node | Mỗi `test/component.test.ts` | Component boundary tests | Không thêm framework cho skeleton | Nhẹ, TAP output | Chưa có mocking/E2E utilities | Theo Node; không thêm supply-chain package | Task feature có thể bổ sung test framework nếu PLAN_LOCKED |
| Python | `>=3.11 <3.14`; tested `3.11.9` | Hai `pyproject.toml` | AI/media package runtime baseline | Tách dependency workload Python | Project độc lập, typing/dataclass chuẩn | Hai environment cần sync riêng | OSS; runtime security theo Python release | Nâng range sau dependency compatibility review |
| uv | Required `>=0.11 <0.12`; lock format v1 revision 3 | `scripts/check-python.mjs`, hai `pyproject.toml` và `uv.lock` | Locked sync/run | Nhanh, project isolation rõ | `--locked`, lock riêng, tool major/minor guard trong cả hai project | Binary phải có trên `PATH`; patch được phép thay trong dòng 0.11 | OSS/no service cost; không dùng credential cache | Fallback chạy tool trong từng venv chỉ để chẩn đoán; CI phải dùng uv |
| Hatchling | Exact `1.31.0`, có trong cả hai `uv.lock` | Hai `pyproject.toml`/locks | PEP 517 build backend và dev dependency | Package `src/` layout tối thiểu, build backend tái lập | Nhẹ; source/wheel hash được lock | Thêm build dependency vào mỗi environment | OSS/build-only; exact pin giảm build drift | Có thể thay backend qua plan revision và regenerate cả hai lock |
| Ruff | Declared `>=0.16 <0.17`; locked `0.16.1` | Hai `pyproject.toml`/locks | Python lint + format check | Một binary, nhanh | Cross-platform, deterministic | Rule changes theo minor range | OSS/dev-only | Rule set có owner tại project config |
| pytest | Declared `>=9.1 <10`; locked `9.1.1` | Hai `pyproject.toml`/locks | Python unit tests | Ecosystem chuẩn | Strict config/markers, readable | Chưa có coverage/plugin | OSS/dev-only | Bổ sung plugin khi feature cần và lock riêng |

### Tool configuration inventory

| Config | Giá trị/owner | Validation | Output/fallback |
|---|---|---|---|
| Node/pnpm engines | Root `package.json`; `.node-version` target `24.18.0`; `pnpm-workspace.yaml` bật `engineStrict: true` | Positive install trên Node 24; negative install trên Node 26 | Fail install ngoài range; chỉ dùng Node 22 hoặc 24 đúng range |
| Workspace patterns | `apps/*`, `packages/*`, `services/api` | pnpm đã discover root + 5 workspaces | Không đưa Python vào pnpm; chúng do uv sở hữu |
| Workspace cycles | `disallowWorkspaceCycles: true` | pnpm install | Fail thay vì chấp nhận cycle |
| Turbo cache | Local, build output `dist/**`; remote tắt; root global inputs gồm `.node-version`, ESLint, package/lock/workspace và base tsconfig | Root `check*` dùng `--force`; task lẻ vẫn dùng content hash | Acceptance gate không dùng chéo cache Node 22/24; xóa `.turbo` hoặc dùng `pnpm -r` khi chẩn đoán |
| TypeScript strictness | strict, exact optional, unchecked index, NodeNext, ES2023 | `tsc --noEmit`/build | Fail compile |
| Line ending/encoding | UTF-8, LF; batch/cmd CRLF | Editor/Git normalization | `.gitattributes` là source of truth |
| Ignored local artifacts | env, virtualenv, cache, build, logs, IDE | `git check-ignore` evidence | Không commit; tái tạo từ lock/source |

### Configuration and secret inventory

Foundation chỉ commit tên biến và mô tả. Không biến nào được skeleton đọc; vì vậy validation/runtime requirement phải được owner của feature tương ứng triển khai bằng typed schema trước khi route/worker chạy.

| Config/secret name | Runtime owner dự kiến | Public/server-only | Required/default/range | Validation hiện tại/tương lai | Source/injection | Redaction/rotation | Failure/fallback |
|---|---|---|---|---|---|---|---|
| `NODE_ENV` | Server runtimes | Server-only | Trống trong template; enum do runtime owner khóa | Chưa đọc; tương lai schema enum | `.env.local`/container env | Không phải secret; không log config dump đầy đủ | Foundation không cần; runtime fail fast nếu invalid |
| `DATABASE_URL` | API | Server-only secret | Trống; requirement do data task quyết định | Chưa đọc; tương lai URL schema | Secret manager/local ignored env | Redact credential; rotate DB user | Không fallback sang URL hard-code |
| `MONGODB_URI` | API/content owner | Server-only secret | Trống | Chưa đọc; tương lai URI schema | Secret manager/local ignored env | Redact credential; rotate DB user | Fail fast khi feature yêu cầu |
| `REDIS_URL` | API/cache/queue owner | Server-only secret | Trống | Chưa đọc; tương lai URI schema | Secret manager/local ignored env | Redact credential; rotate Redis credential | Degraded mode phải do feature owner ghi rõ |
| `JWT_PRIVATE_KEY` | API auth | Server-only secret | Trống | Chưa đọc; tương lai key-format/schema | Secret manager/file mount | Không log; rotation cần key-version plan | Không tạo key mặc định |
| `JWT_PUBLIC_KEY` | API/auth consumers | Server-only config | Trống | Chưa đọc; tương lai key-format/schema | Trusted config/secret manager | Có thể phân phối theo contract; version hóa khi rotate | Fail closed nếu signature verification cần mà key thiếu |
| `GOOGLE_CLIENT_ID` | API OAuth | Server-only config | Trống | Chưa đọc; tương lai non-empty/schema | Secret manager/local ignored env | Không ghi token; rotate app credential khi cần | OAuth route không được enable nếu thiếu |
| `GOOGLE_CLIENT_SECRET` | API OAuth | Server-only secret | Trống | Chưa đọc; tương lai non-empty/schema | Secret manager/local ignored env | Redact và rotate tại provider | Không fallback sang giá trị demo |
| `CLOUDINARY_CLOUD_NAME` | Media owner | Server-only config | Trống | Chưa đọc; tương lai allowlist/schema | Secret manager/local ignored env | Không log cùng secret | Media integration không enable nếu thiếu |
| `CLOUDINARY_API_KEY` | Media owner | Server-only secret | Trống | Chưa đọc; tương lai schema | Secret manager/local ignored env | Redact/rotate provider key | Không inject vào browser |
| `CLOUDINARY_API_SECRET` | Media owner | Server-only secret | Trống | Chưa đọc; tương lai schema | Secret manager/local ignored env | Redact/rotate provider secret | Không inject vào browser |
| `AI_PROVIDER_API_KEY` | AI service | Server-only secret | Trống | Chưa đọc; tương lai schema + provider selection | Secret manager/local ignored env | Redact/rotate; không cache prompt credential | AI feature phải có degraded behavior riêng |
| `PUBLIC_API_ORIGIN` | Web/Admin build/runtime | Browser-safe | Trống; URL/origin do deploy env cung cấp | Chưa đọc; tương lai absolute-origin allowlist | Public build config | Không secret; vẫn tránh log môi trường không cần thiết | Không hard-code environment URL |
| `MEDIA_ORIGIN` | Web/Admin/media | Browser-safe | Trống; URL/origin do deploy env cung cấp | Chưa đọc; tương lai absolute-origin allowlist | Public build config | Không secret | Không hard-code provider endpoint |

External API timeout/retry/rate limit, egress/redirect allowlist và degraded behavior chưa tồn tại vì foundation không gọi external API. Feature owner phải bổ sung trước khi sử dụng các credential trên.

## 8. Alternatives and suitability

Tiêu chí đã dùng khi khóa plan: phù hợp dự án 30%, bảo trì 25%, tái lập/bảo mật 20%, độ phức tạp 15%, khả năng mở rộng CI 10%.

| Phương án | Flow/algorithm | Ưu điểm | Nhược điểm | Security/scale/cost | O/E/P | Điểm/phù hợp | Trạng thái |
|---|---|---|---|---|---|---|---|
| A: pnpm + Turbo + uv | pnpm/Turbo điều phối TS; uv lock/run từng Python project | Task graph/cache nhẹ, boundary rõ, khớp baseline | Thêm Turbo/uv CLI và cache inputs cần quản lý | Frozen/locked; remote cache tắt; không phí service; scale tốt cho repo hiện tại | 1/1.5/2.5 ngày | 91, cao nhất | `PLAN_LOCKED` |
| B: pnpm workspace + uv | `pnpm -r` tuần tự/song song; uv giữ nguyên | Ít config, fallback đơn giản | Không dependency-aware cache; CI chạy dư | Bề mặt tool nhỏ hơn nhưng build cost tăng theo workspace | 0.75/1.25/2 ngày | 80 | `DEFERRED`, fallback |
| C: pnpm + Turbo + Poetry | Turbo cho TS; Poetry cho Python | Poetry ổn định, quen thuộc | Install/CI nặng và dài dòng hơn với hai Python project | Lock tốt nhưng thêm tool overhead; không lợi runtime scale | 1.25/2/3 ngày | 76 | `DEFERRED` |
| D: pnpm + Nx + uv | Nx project graph/affected; uv giữ nguyên | Boundary/affected mạnh | Convention/plugin nhiều hơn nhu cầu nhóm hai người | Có thể scale repo lớn; complexity/maintenance cost cao hơn | 1.5/2.5/4 ngày | 73 | `DEFERRED` |

### DEC-FOUND-TOOLING-001 — PLAN_LOCKED

- **Người xác nhận:** `thanh`.
- **Ngày:** 2026-08-03.
- **Chọn:** phương án A.
- **Compatibility:** Node `24.18.0` là target; Node 22 LTS được hỗ trợ, còn Node 23/25 bị loại khỏi engine range. pnpm `11.18.0`, Turbo `2.10.8`; Python `>=3.11 <3.14`; uv `>=0.11 <0.12`.
- **Boundary:** AI/media có project và lockfile riêng để tránh dependency conflict; pnpm không quản lý Python package.
- **Cache/security:** chỉ cache local; không remote credential, không secret trong cache contract, không commit environment thật.
- **Fallback:** dùng `pnpm -r` thay Turbo; hai uv project không đổi.
- **Điều kiện mở lại:** incompatibility toolchain, dependency conflict, security advisory, CI benchmark bất lợi hoặc maintenance cost vượt lợi ích.
- **Plan conformance:** implementation dùng đúng phương án A; không có library/algorithm/schema thay thế ngoài plan.

## 9. Performance and scalability

- **Workload/SLO:** đây là developer build workload, không phải request path; chưa có runtime SLO.
- **Cache/index/queue:** chỉ Turbo local cache; không database index, application cache hay queue.
- **300–500 concurrent users:** không liên quan trực tiếp vì không có server/client runtime. Foundation không được dùng làm bằng chứng rằng hệ thống chịu được 300–500 user.
- **Backpressure/degraded mode:** task graph fail-fast theo exit code. Fallback bỏ Turbo và chạy `pnpm -r`; không bỏ lint/type/test/build.
- **Scale path:** khi workspace tăng, có thể dùng Turbo affected/remote cache sau khi khóa credential, tenant, retention và cache poisoning controls. Quyết định đó nằm ngoài task.
- **Benchmark evidence:** Turbo nhận diện 5 package và PASS 5 lint, 5 typecheck, 5 test/build graph. Root acceptance gate luôn dùng `--force`; cache local chỉ tối ưu task phát triển riêng. Chưa ghi p50/p95/cold-build benchmark.
- **Desktop/mobile/browser:** không áp dụng; skeleton không render UI và không chạy browser.
- **LCP/INP/long task/JS chunk:** không áp dụng; không có frontend bundle.
- **FPS/scene/asset budget:** không áp dụng; không animation, 3D, texture hay model.
- **Cinematic/Balanced/Lite/reduced-motion/no-WebGL:** không áp dụng cho foundation. Feature UI/3D tương lai vẫn phải thực hiện đầy đủ các tier/fallback này.

## 10. Security and privacy

| Threat | Control đã triển khai | Evidence/gap |
|---|---|---|
| Dependency drift/tampered resolution | Commit pnpm/uv lock; pnpm frozen install; uv dùng `--locked` + `required-version`; Hatchling exact `1.31.0` có hash trong cả hai lock | pnpm frozen install, hai uv locked sync và root cross-runtime gate đều PASS |
| Secret commit | Ignore toàn bộ `.env*` (gồm `.envrc`), chỉ allow `.env.example`; ignore `.direnv`; template chứa assignment trống | `git check-ignore` PASS; scan template không thấy value |
| Secret leak qua cache | Remote Turbo cache tắt; skeleton không đọc env | `turbo.json` không cấu hình remote cache/env input |
| Generated artifact commit | Ignore `node_modules`, `.venv`, `.turbo`, `dist`, coverage, logs | `git check-ignore` PASS cho đại diện mỗi nhóm |
| Malicious/unsafe source behavior | Skeleton chỉ trả immutable/static descriptor; không network, shell từ input, upload hay eval | 7 component tests kiểm tra descriptor boundary |
| Supply-chain vulnerability/license drift | Version JS pin exact, Python resolved exact trong lock | Automated vulnerability/license/SBOM scan chưa có; giao cho CI quality task |

- **Validation/authz/rate limit:** không có server input/authz/rate limit trong scope; không được coi là đã giải quyết cho runtime.
- **Upload/SSRF/XSS/CSRF/injection/IDOR:** không có endpoint, DOM, query hay upload path nên không áp dụng. Các task tạo boundary này phải thêm regression/security test.
- **Privacy/consent/retention:** foundation không thu thập hoặc lưu personal data. Local cache/build chỉ chứa source-derived artifact.
- **Logs/redaction:** console chỉ có tool/test output; không có SQL, schema hoặc secret runtime. Task tương lai phải cấu hình redaction.
- **Audit/monitoring:** Git history và CI logs tương lai; chưa có application monitoring.
- **Security tests:** hygiene/secret-regex checks và ba point-in-time dependency audits PASS; chưa có automated malware/SBOM/license/dedicated secret/container scan vì CI/container ngoài scope.

## 11. Delivery estimate and actual

| Field | Value |
|---|---|
| Registry estimate gốc | 1–2 person-days, confidence MEDIUM |
| Optimistic | 1 person-day |
| Expected | 1.5 person-days |
| Pessimistic | 2.5 person-days |
| Assumptions/dependencies | Baseline docs hợp lệ; không thêm business framework/infra; Node 22 hoặc target 24.18, pnpm 11, Python 3.11+, uv 0.11 khả dụng |
| Risks | Windows shim permission, lockfile/platform compatibility, tool version drift |
| Included scope | Root tooling, 7 skeleton boundaries, lock/test/hygiene/docs |
| Confidence | MEDIUM |
| Actual effort | Chờ người dùng/nhóm xác nhận; không suy ra từ wall-clock |
| Completion date | Chờ người dùng/nhóm xác nhận |

### Feature lifecycle

| Mốc | Timestamp | Member/Actor | Evidence |
|---|---|---|---|
| Planned | 2026-07-29 | Nhóm | `TASK-FOUND-001` trong `docs/NEXT_WORK.md` |
| Claimed | 2026-08-03T10:57:18+07:00 | `thanh` | Coordination claim trên `origin/develop` |
| Implementation started | 2026-08-03T11:14:29+07:00 | `thanh` | `WS-TASK-FOUND-001-20260803-01` |
| First `IMPLEMENTED` | 2026-08-03T11:45:04+07:00 | `thanh` | Source/config/locks, forced root gate và dependency audits PASS trên feature branch |
| `VERIFIED` | — | — | Chỉ sau người dùng/nhóm review |
| Merged to develop | — | — | Chỉ sau bằng chứng merge |
| Completed | — | — | Chỉ sau Merge Memory Sync PASS |

### Contributors and work sessions

| Session ID | Contributor | Role | Task/Branch | StartedAt | LastActiveAt | EndedAt | Status | Scope/Output | Tests/Evidence | Handoff/Next |
|---|---|---|---|---|---|---|---|---|---|---|
| `WS-TASK-FOUND-001-20260803-01` | `thanh` | implement | `TASK-FOUND-001` / `feature/TASK-FOUND-001` | 2026-08-03T11:14:29+07:00 | 2026-08-03T11:52:48+07:00 | 2026-08-03T11:52:48+07:00 | CLOSED | PLAN_LOCKED; root tooling; 5 TS và 2 Python skeleton; locks, tests, hygiene và feature report | Node 24 forced root gate PASS; 5/5 package ở mỗi lint/typecheck/test/build, 5 Node tests, 2 pytest, frozen/locked sync, ignore/env checks và 3 dependency audits PASS | Handoff ở trạng thái IMPLEMENTED; user review/fresh-clone verification trước VERIFIED |

Không suy ra active effort từ khoảng thời gian calendar; actual effort vẫn `UNKNOWN`. `EndedAt` chỉ ghi thời điểm đóng phiên, không phải thời lượng làm việc liên tục.

## 12. Testing and evidence

Môi trường evidence: Windows; host Node `22.16.0`; target Node `24.18.0` được materialize qua npx; pnpm `11.18.0`; uv `0.11.32`; Python `3.11.9`; pytest `9.1.1`; Ruff `0.16.1`.

| Type | Command/scenario | Expected | Result/evidence |
|---|---|---|---|
| Dependency | pnpm `11.18.0 install --frozen-lockfile` dưới Node `24.18.0` | Lock không đổi; discover đúng workspace | PASS; root + 5 workspace, lock up to date |
| Runtime guard | Cùng frozen install dưới Node `26.5.0` | Engine ngoài policy bị chặn | PASS negative test; pnpm trả lỗi `ERR_PNPM_UNSUPPORTED_ENGINE` nhờ workspace setting |
| Inventory | pnpm `list -r --depth -1 --json` | Root, admin, web, contracts, UI, API | PASS; đúng 6 project entries |
| TypeScript gate | Root `pnpm check` với `TURBO_FORCE=true` | Prettier, Turbo lint/typecheck/test/build và root ESLint exit 0 | PASS; 5/5 package ở mỗi lint/typecheck/test/build; mọi Turbo execution đều bypass cache |
| Node unit/component | 5 `node --test dist/test/component.test.js` | Descriptor đúng name/kind và immutable | PASS; 5/5 test, 0 fail |
| Python lint/format | Ruff `check` và `format --check` trực tiếp trong mỗi resolved venv | Hai project sạch | PASS; mỗi project 3 file formatted, lint clean |
| Python unit | pytest trực tiếp trong mỗi resolved venv | Descriptor AI/media đúng role | PASS; 2/2 test, 0 fail |
| Root cross-runtime | `pnpm check` gọi `scripts/check-python.mjs` dưới Node `24.18.0`, pnpm `11.18.0`, uv `0.11.32` | Một command chạy toàn bộ TS và Python | PASS; format/lint/typecheck/test/build + hai Ruff/format/pytest project exit 0, remote cache disabled |
| Secret/config hygiene | `git check-ignore -v --no-index ...`; kiểm tra assignment `.env.example` | `.envrc`, `.env.local`, `.direnv`, venv/cache/dist bị ignore; template không có value | PASS |
| Cycle guard | Static `disallowWorkspaceCycles: true` + frozen install | pnpm từ chối graph có cycle | CONFIGURED; chưa chạy destructive negative-cycle fixture |
| Integration/E2E | Runtime request/browser/database | Không thuộc foundation | NOT APPLICABLE |
| Performance/visual/AI | Cold benchmark, browser/mobile, model quality | Không có runtime | NOT RUN/NOT APPLICABLE |
| Security scan | `pnpm audit --audit-level high`; `uv export --all-groups --locked` + `pip-audit` cho mỗi Python project; secret regex | Không có known vulnerability/secret value | PASS tại 2026-08-03; SBOM, dedicated secret scanner và image scan chưa có |

### Acceptance criteria foundation

- [x] pnpm cài dependency từ lockfile frozen mà không cần secret thật và discover đủ 5 TypeScript workspace.
- [x] Workspace bật `disallowWorkspaceCycles`; frozen install hiện tại PASS.
- [x] Root scripts bao phủ format, lint, typecheck, unit test, build và Python checks theo fail-fast order.
- [x] Năm TypeScript skeleton lint/typecheck/build và 5 component tests PASS.
- [x] AI/media có project + lockfile độc lập; Ruff/format và 2 pytest PASS trong resolved environment.
- [x] `.env*`, virtual environment, cache và build output bị ignore; `.env.example` không có giá trị thật.
- [x] Không có production content, endpoint, database, migration, Compose hoặc contract nghiệp vụ giả.
- [x] Sơ đồ, inventory, algorithm, security, test, limitation và decision history khớp code hiện tại.
- [x] Root cross-runtime gate PASS trên target Node `24.18.0`, pnpm `11.18.0` và uv `0.11.32`.
- [x] Engine guard chặn Node ngoài hai range LTS; negative install trên Node `26.5.0` trả lỗi như mong đợi.
- [ ] Reviewer chạy cùng gate trên fresh clone trước khi xác nhận `VERIFIED`.
- [ ] Negative cycle fixture, automated license/SBOM/dedicated secret/container scan và CI evidence được bổ sung ở task chất lượng phù hợp.
- [ ] Người dùng/nhóm review và đổi trạng thái từ `IMPLEMENTED` sang `VERIFIED`.

## 13. Limitations, fallback and next work

### Known limitations

- Skeleton chỉ xuất static metadata; chưa có React, HTTP server, AI model, queue/worker loop hoặc media processing.
- Không có Dockerfile, Compose, Nginx, database, migration, healthcheck hay CI workflow; thư mục `infra` chưa tồn tại.
- `.env.example` là inventory, chưa phải typed runtime config module.
- uv được guard ở `>=0.11 <0.12`; patch chưa pin tuyệt đối để nhận bản vá tương thích, còn Hatchling build backend đã pin exact `1.31.0` trong cả hai lock.
- Root `pnpm check` cần uv trên `PATH`; host không thể tạo Corepack shim trong `C:\Program Files\nodejs` do EPERM, nên evidence dùng pnpm exact qua npx và uv `0.11.32` trong user-writable temporary tool environment.
- uv cảnh báo hardlink không khả dụng giữa cache/target filesystem và tự fallback sang full copy; đúng chức năng nhưng sync có thể chậm hơn trên Windows.
- Chưa có coverage threshold, integration/E2E, negative cycle fixture, automated license/SBOM/dedicated secret/container scan hoặc cold-build benchmark. Dependency audit hiện tại chỉ là bằng chứng tại thời điểm 2026-08-03.

### Fallback

- Nếu Corepack không thể tạo shim hệ thống, dùng `npx --yes pnpm@11.18.0 <command>` hoặc cài pnpm vào user-owned path; nếu Turbo lỗi/không phù hợp, chạy cùng task bằng `pnpm -r`. Không bỏ quality step nào.
- Nếu local cache nghi ngờ stale, xóa `.turbo` và `dist`, rồi chạy lại frozen install/check.
- Mỗi Python project có thể chẩn đoán độc lập trong venv, nhưng verification/CI chính thức phải dùng uv `--locked`.
- Nếu registry/network unavailable sau khi dependency đã materialize, có thể chạy check offline; fresh install không được giả thành PASS.

### Next work

- `TASK-INFRA-001`: Docker/Compose/Nginx/data services, healthcheck, volume và migration job.
- `TASK-WEB-001`, `TASK-ADMIN-001`: application shell theo UI registry/tokens.
- `TASK-API-001`: API runtime, typed config, auth/authz, validation/error contract.
- `TASK-DOC-QUALITY-001`: CI quality gate, security/license/SBOM scan và fresh-clone automation.
- Khi dependency/runtime thật được thêm, owner phải cập nhật technology inventory, config schema, auth path, query/cache evidence và acceptance test tại feature tương ứng.

### Kế hoạch Docker/CI được bảo lưu, chưa triển khai

Repository target vẫn dự kiến có:

~~~text
apps/web
apps/admin
services/api
services/ai
workers/media
packages/ui
packages/contracts
infra/nginx       # future TASK-INFRA-001
infra/docker      # future TASK-INFRA-001
docs
~~~

Kế hoạch hạ tầng cũ vẫn gồm `web`, `admin`, `api`, `ai-worker`, `media-worker`, PostgreSQL, MongoDB, Redis, Nginx và tùy chọn MinIO. Healthcheck, named volume và migration job riêng vẫn là yêu cầu thiết kế cho `TASK-INFRA-001`; không runtime nào trong số này được tạo bởi foundation.

Trình tự tương lai được bảo lưu:

1. Cài Git, Node/pnpm, Python/uv và Docker Desktop theo version đã chấp nhận.
2. Tạo local ignored env từ `.env.example`; không commit giá trị.
3. Dùng Compose để khởi động hạ tầng sau khi `TASK-INFRA-001` cung cấp file thật.
4. Chạy migration/seed bằng command có kiểm soát sau khi data owner chấp nhận contract.
5. Chạy app/worker và CI pipeline sau khi feature owner cung cấp runtime behavior.

CI target vẫn là lint -> typecheck -> unit -> integration -> build -> image/security scan -> E2E smoke; staging trước production, production cần approval và rollback image. Đây là roadmap, không phải implementation evidence.

Windows tiếp tục dùng LF qua `.gitattributes`, CRLF riêng cho `.bat/.cmd`, named volume cho database tương lai và package scripts thống nhất để tránh command drift.

## 14. Decision and change history

### Decision log

| Decision | Ngày | Người xác nhận | Trạng thái | Nội dung |
|---|---|---|---|---|
| `DEC-FOUND-TOOLING-001` | 2026-08-03 | `thanh` | `PLAN_LOCKED` | Chọn pnpm `11.18.0` + Turbo `2.10.8` + hai uv project độc lập; local cache only; fallback `pnpm -r` |

### Change history

| Ngày | Thay đổi | Evidence/status |
|---|---|---|
| 2026-07-29 | Foundation task và estimate được đưa vào backlog | `PLANNED` |
| 2026-08-03 | `thanh` claim `TASK-FOUND-001` và xác nhận branch | Claim trên `origin/develop` |
| 2026-08-03 | So sánh 4 tooling option; chọn phương án A | `DEC-FOUND-TOOLING-001 / PLAN_LOCKED` |
| 2026-08-03 | Thêm root workspace/tooling, 5 TS skeleton, 2 Python skeleton, locks, tests và repository hygiene | `IMPLEMENTED`, chưa `VERIFIED` |
| 2026-08-03 | Cập nhật feature report với flow/sequence/state/auth/algorithm/inventory/test/limitation | Khớp source/config evidence trên feature branch |
| 2026-08-03 | Siết Node LTS range bằng `engineStrict`, Turbo global cache inputs, uv guard/Hatchling lock và env ignore; buộc root gate bỏ cache giữa Node 22/24; chạy Node 24 gate, Node 26 negative test và ba dependency audit | PASS; không có code defect còn mở, vẫn chờ user review |

- **Deviation:** không có deviation khỏi PLAN_LOCKED.
- **Merge reference:** chưa có; không suy diễn commit/push/merge.
- **Verified-by:** chưa có; chờ người dùng/nhóm.
- **Superseded history:** không có decision cũ bị xóa. Kế hoạch Docker/CI lịch sử được giữ dưới future scope.

## Completion checklist

- [x] User/business flow, system sequence, data/state, auth boundary và algorithm phản ánh code hiện tại.
- [x] Mỗi sơ đồ có entry condition, main steps, decision, error/fallback, output và persisted/audited data phù hợp.
- [x] Technology/dependency inventory ghi version/range, owner, vai trò, trade-off, security/cost và replacement boundary.
- [x] Config/secret inventory không chứa giá trị thật và phân biệt browser-safe/server-only.
- [x] Algorithm có pseudocode, input/output, complexity, parameters, assumptions, metrics và failure modes.
- [x] Alternatives, PLAN_LOCKED, ưu/nhược điểm, scale/security/cost và fallback được bảo lưu.
- [x] Auth/authz/security/privacy ghi rõ không có runtime boundary thay vì giả định đã hoàn tất.
- [x] Estimate, contribution ledger, test evidence, limitation và next work đã có.
- [x] Không có environment-specific URL trong runtime source; skeleton không đọc environment.
- [x] Query/index/cache và UI/motion/3D mục không áp dụng đã được ghi rõ; không tuyên bố performance/visual chưa đo.
- [x] Root cross-runtime check PASS trên target Node/pnpm/uv đúng version, buộc Turbo bỏ cache.
- [ ] Reviewer lặp lại frozen/locked install và root gate trên fresh clone.
- [ ] Code review và user review hoàn tất; trạng thái được người có thẩm quyền đổi sang `VERIFIED`.
- [x] Project Status và Traceability ghi đúng trạng thái `IMPLEMENTED` branch-local.
- [ ] Implementation Index, NEXT_WORK và Merge Memory Sync được cập nhật sau bằng chứng push/merge.
- [ ] Automated dependency/license/SBOM/dedicated secret/container scan được CI task triển khai; audit thủ công hiện tại chỉ là point-in-time evidence.
