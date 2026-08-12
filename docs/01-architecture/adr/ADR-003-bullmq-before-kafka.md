# ADR-003 — BullMQ trước Kafka

- Ngày: 2026-07-29
- Trạng thái: ACCEPTED

## Quyết định

MVP dùng BullMQ/Redis cho AI, media, TTS và 3D jobs.

## Lý do

Phù hợp nhóm nhỏ và tải mục tiêu; vận hành nhẹ hơn Kafka.

## Điều kiện xem xét Kafka

Cần replay event dài hạn, nhiều consumer độc lập, throughput đã đo vượt khả năng BullMQ hoặc Redis trở thành nút thắt được chứng minh.

## Hệ quả

Event contract vẫn được version hóa để có đường chuyển đổi sau này.
