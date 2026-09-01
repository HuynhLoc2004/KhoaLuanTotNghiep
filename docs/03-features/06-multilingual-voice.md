# Đa ngôn ngữ, text và voice

## Implementation status

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Đặc tả | IN_PROGRESS | Baseline v0.1, chờ nhóm review |
| Translation/TTS/Player/Tests | VERIFIED | `TASK-VOICE-001` (`thanh`); merge `1bbbe07` qua PR `#20`; `thanh` tự test `/voice` trên trình duyệt thật (audio + mic) trước merge — xem `docs/work/TASK-VOICE-001.md` |

## Phạm vi

MVP hỗ trợ tiếng Việt và tiếng Anh; schema mở rộng cho ngôn ngữ khác. Nội dung chuyên môn phải được con người duyệt trước khi xuất bản.

## Flow nội dung

1. Bản gốc tiếng Việt được biên tập và duyệt.
2. Bản dịch do người dịch hoặc AI hỗ trợ tạo ở trạng thái draft.
3. Kiểm duyệt thuật ngữ, tên riêng, niên đại và cách đọc.
4. Tạo audio TTS hoặc upload giọng thật.
5. Publish theo từng locale; fallback về tiếng Việt nếu thiếu.

## Thuật toán/quy tắc

- Translation memory theo đoạn và glossary thuật ngữ.
- Cache TTS với hash `normalizedText + voice + speed + locale + engineVersion`.
- SSML điều khiển ngắt, ngày tháng và tên riêng.
- Audio loudness normalization; tạo caption/timestamp khi có thể.

## Ưu/nhược điểm

TTS mở rộng nhanh và rẻ hơn thu âm; cách đọc tên cổ có thể sai. Thu âm người thật giàu cảm xúc nhưng cập nhật chậm. Giải pháp phù hợp là hybrid: nội dung trọng điểm dùng giọng thật, nội dung dài/động dùng TTS đã duyệt.

## Trải nghiệm và accessibility

Player có play/pause, seek, tốc độ, transcript, autoplay mặc định tắt. Không chỉ dựa vào audio; mọi audio có text tương đương.

## Bảo mật/chi phí

API key TTS chỉ ở backend; quota theo vai trò; admin xem ước tính chi phí trước khi tạo hàng loạt; không tái tạo audio nếu hash không đổi.

## Decision log

| Ngày | Quyết định | Lý do/Hệ quả |
|---|---|---|
| 2026-07-29 | Hybrid giọng thật và TTS có kiểm duyệt | Cân bằng cảm xúc, tốc độ cập nhật và chi phí |
| 2026-09-02 | `DEC-VOICE-001` (`PLAN-0039`, `PLAN_LOCKED`): Web Speech API trình duyệt (`SpeechSynthesis` + `SpeechRecognition`) làm engine mặc định cho MVP | Âm thanh thật, miễn phí, không cần credential trong môi trường hiện tại; backend giữ interface `TtsEngine` để cắm cloud TTS/STT thật sau này mà không đổi contract |

## Feature lifecycle và Contribution ledger

Áp dụng `docs/07-delivery/09-work-session-contribution-ledger.md`. Chi tiết session/ledger đầy đủ nằm ở `docs/work/TASK-VOICE-001.md` (task report là nguồn evidence chính); bảng dưới đây chỉ tóm tắt milestone.

| Mốc | Timestamp | Member/Actor | Evidence |
|---|---|---|---|
| Planned | 2026-07-29 | Nhóm | Feature plan baseline |
| Claimed | 2026-09-02T02:30:17+07:00 | `thanh` | Commit `5a742b5` trên `origin/develop` (`PLAN-0039`) |
| IMPLEMENTED | 2026-09-02 | `thanh` | `docs/work/TASK-VOICE-001.md`; 133/133 test PASS trên 4 package |
| VERIFIED | 2026-09-02 | `thanh` | Tự test `/voice` trên trình duyệt thật (audio + mic hoạt động đúng) |
| Merged | 2026-09-02 | `thanh` | Commit `1bbbe07`, PR `#20` vào `develop` |
| Completed | 2026-09-02 | `thanh` | Merge Memory Sync PASS (`PLAN-0040`) |

| Session ID | Contributor | Role | Task/Branch | StartedAt | LastActiveAt | EndedAt | Status | Scope/Output | Tests/Evidence | Handoff/Next |
|---|---|---|---|---|---|---|---|---|---|---|
| WS-TASK-VOICE-001-20260902-01 | `thanh` | implement | TASK-VOICE-001 / `feature/TASK-VOICE-001` | 2026-09-02T02:30:17+07:00 | UNKNOWN | UNKNOWN | `INTERRUPTED` | Implement contracts/API/UI/Web voice modules | `NOT RUN` | Không có handoff rõ ràng; xem chi tiết trong task report |
| WS-TASK-VOICE-001-20260902-02 | `thanh` | implement | TASK-VOICE-001 / `feature/TASK-VOICE-001` | 2026-09-02T02:45:00+07:00 (ước lượng) | 2026-09-02T03:17:38+07:00 | 2026-09-02T03:17:38+07:00 | `CLOSED` | Sửa lỗi type, bổ sung test còn thiếu, format, mở task report | 16/16 turbo task PASS, 133/133 test PASS | Handoff cho `thanh`: review/commit/push/PR |

## Change history

| Ngày | Loại | Thay đổi | Test/Bằng chứng |
|---|---|---|---|
| 2026-07-29 | ADDED | Tạo baseline đa ngôn ngữ và voice | Review tài liệu, chưa có code |
| 2026-09-02 | CHANGED | Khóa `DEC-VOICE-001` (Web Speech API); implement Translation/TTS/Player/Voice command MVP (`TASK-VOICE-001`) | `docs/work/TASK-VOICE-001.md`; 133/133 test PASS; chưa `VERIFIED`/merge |
