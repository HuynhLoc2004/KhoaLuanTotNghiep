# ADR-004 — Trải nghiệm do CMS điều khiển

- Ngày: 2026-07-29
- Trạng thái: ACCEPTED

## Quyết định

Admin quản lý content, section order, layout variant, theme, motion preset, scene, camera path, hotspot và fallback qua schema/registry đã kiểm thử.

Admin không nhập JavaScript, CSS hoặc shader tùy ý.

## Lý do

Đạt mục tiêu không hard-code và tái sử dụng ngay khi thêm dữ liệu, đồng thời bảo vệ responsive, accessibility, bảo mật và performance.

## Hệ quả

Component/motion/scene mới cần code và schema version mới trước khi Admin sử dụng. Unknown preset phải fallback an toàn.
