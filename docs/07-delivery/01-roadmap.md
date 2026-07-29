# Roadmap và chia việc

## Pha 0 — Chuẩn hóa (1 tuần)

Chốt phạm vi, user flow, wireframe, dataset mẫu, quyền nội dung, convention và Definition of Done.

## Pha 1 — Nền tảng (2 tuần)

Monorepo, Docker, database migration, auth/RBAC, OpenAPI, logging, CI và design tokens.

## Pha 2 — CMS + website nội dung (3 tuần)

Media library, artifact/exhibition/zone, page builder, menu/banner, workflow publish, public pages, search và cache.

## Pha 3 — QR Tour + voice (2 tuần)

PWA camera, QR resolver, tour stops, audio player, đa ngôn ngữ, history/analytics.

## Pha 4 — Bản đồ 3D (3 tuần)

Viewer, floor/POI editor, graph navigation A*, 2D fallback, tối ưu LOD.

## Pha 5 — AI nhận diện + guide (3 tuần)

Dataset pipeline, embedding retrieval, RAG có nguồn, job queue, confidence/fallback, model evaluation.

## Pha 6 — Digital Twin + dashboard (2–3 tuần)

Quy trình scan mẫu, version/review/publish model, dashboard content/AI/job.

## Pha 7 — Hardening (2 tuần)

Load 500 users, security test, accessibility, backup/restore, demo script, báo cáo thuật toán và số liệu.

## Chia luồng nhóm

- FE Public/PWA.
- FE Admin/CMS.
- BE/API/Data/Auth.
- AI/CV/RAG.
- 3D/Digital Twin.
- QA/DevOps có thể là trách nhiệm luân phiên.

Mọi thay đổi schema/API đi qua `packages/contracts` và migration; không để hai thành viên tự định nghĩa cùng entity khác nhau.

## Ưu tiên nếu thiếu thời gian

CMS động + QR Tour + viewer 3D có sẵn + recognition top-k là lõi. Tạo 3D hoàn toàn tự động, indoor localization liên tục và Kafka là phần mở rộng, không được làm trễ lõi.
