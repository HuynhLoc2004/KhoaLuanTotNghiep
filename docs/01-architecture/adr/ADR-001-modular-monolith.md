# ADR-001 — Modular monolith cho API

- Ngày: 2026-07-29
- Trạng thái: ACCEPTED

## Bối cảnh

Nhóm hai người cần triển khai nhanh nhưng vẫn tách module rõ ràng. AI/3D có dependency và workload khác API web.

## Quyết định

Express API triển khai dạng modular monolith. AI và media/3D chạy worker/service riêng qua queue.

## Phương án đã cân nhắc

- Microservices toàn phần: scale độc lập nhưng tăng contract, network và DevOps.
- Monolith duy nhất kể cả AI: đơn giản deploy nhưng phụ thuộc Python/GPU và job dài làm API khó cô lập.

## Hệ quả

Module phải có boundary và contract nội bộ. Chỉ tách service mới khi có bằng chứng về tải, ownership hoặc deployment.
