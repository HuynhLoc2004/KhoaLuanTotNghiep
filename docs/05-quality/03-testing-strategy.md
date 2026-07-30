# Chiến lược kiểm thử

## Kim tự tháp

- Unit: thuật toán route, permission, cache key, content validation, scoring.
- Integration: API + PostgreSQL/Mongo/Redis bằng container.
- Contract: OpenAPI và event schema giữa Express/Python.
- E2E: Playwright cho public, QR, login, CMS publish và rollback.
- Visual: snapshot có kiểm soát cho component/trang chính.
- Load: k6 theo kịch bản 300–500 concurrent users.
- Security: dependency/secret scan, ZAP baseline, test IDOR/upload/rate limit.
- Configuration: schema validation, missing/malformed value, unsafe default, URL allowlist và environment isolation.
- Code quality: format, lint, typecheck, duplication/complexity review có ngữ cảnh; không dùng metric máy móc thay code review.
- Query/cache: injection/operator/sort tests, query-count/N+1 budget, representative query plan, cache hit/miss authorization, invalidation/stampede và response/log redaction.

## AI/3D

- Dataset test được version hóa, không trộn với training.
- Regression top-k/confidence/latency theo model version.
- Golden questions cho RAG: nguồn đúng, từ chối đúng và đa ngôn ngữ.
- Model 3D: checksum, polygon/texture budget, load time và visual review.

## Test dữ liệu CMS

- Draft/published/scheduled/expired.
- Thiếu bản dịch, thiếu 3D, media lỗi.
- Cache invalidation sau publish.
- Concurrent edit và rollback.

## Definition of Done

Code review, test pass, migration có rollback/forward plan, logging/metrics, tài liệu module/API cập nhật, accessibility cơ bản, không có secret và tiêu chí nghiệm thu được chứng minh. Handoff phải ghi command/phạm vi scan; không được suy ra “không có secret” chỉ vì không nhìn thấy trong diff.
