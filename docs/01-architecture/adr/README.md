# Architecture Decision Records

ADR ghi quyết định kiến trúc có ảnh hưởng xuyên module. Trạng thái: `PROPOSED`, `ACCEPTED`, `SUPERSEDED`, `REJECTED`.

| ADR | Trạng thái | Quyết định |
|---|---|---|
| [ADR-001](ADR-001-modular-monolith.md) | ACCEPTED | Modular monolith cho API, tách AI/3D worker |
| [ADR-002](ADR-002-data-responsibilities.md) | ACCEPTED | Trách nhiệm PostgreSQL, MongoDB, Redis và media storage |
| [ADR-003](ADR-003-bullmq-before-kafka.md) | ACCEPTED | BullMQ trước Kafka |
| [ADR-004](ADR-004-admin-driven-experience.md) | ACCEPTED | CMS schema-driven, không arbitrary code |

ADR mới dùng số tiếp theo. Nếu thay quyết định, tạo ADR mới và đánh dấu ADR cũ `SUPERSEDED BY ADR-xxx`.
