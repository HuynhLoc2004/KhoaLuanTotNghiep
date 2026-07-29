# Merge Memory Sync Gate

## Mục tiêu

Sau khi code merge vào `develop`, cập nhật trí nhớ chung để Codex khác hiểu ngay những gì đã có và tái sử dụng đúng hướng.

## Push khác merge

| Sự kiện | Ý nghĩa | Trí nhớ chung |
|---|---|---|
| Push `feature/*` | Backup/review | Vẫn IN_PROGRESS/IMPLEMENTED |
| Merge vào `develop` | Tích hợp chung | Bắt buộc Merge Memory Sync |
| Merge `develop` vào `main` | Release/demo | Ghi release/deploy evidence |

## Điều kiện

- Người dùng xác nhận đã merge vào `develop`.
- Code merge tồn tại trên local `develop`.
- Có merge/PR/commit reference nếu dùng.
- Feature được người dùng xác nhận `VERIFIED` hoặc có ngoại lệ rõ.

## Checklist

- Feature owner: status, flow/algorithm, decision/change history, limitations, merge ref.
- `IMPLEMENTATION_INDEX.md`: capability, route, location, contract, test.
- UI Registry: component/token/motion/3D pattern, variants, consumers, fallback.
- Project Status và NEXT_WORK: milestone, DONE và dependency mở.
- Traceability: requirement/test/acceptance.
- Integration/Contract/Data: producer, consumer, version, migration order.
- Idea Backlog/Concept: trạng thái và evidence.
- AI Context: chỉ sửa nếu baseline toàn dự án đổi.

## Kết quả

```text
MERGE_MEMORY_SYNC: PASS/FAIL
Merge ref:
Feature/task:
Indexes updated:
Contracts/integration updated:
UI registry updated:
Tests/evidence:
Remaining limitation:
Next tasks unblocked:
```

Feature chưa đạt PASS có code nhưng chưa có trí nhớ tích hợp hoàn chỉnh.

## Chống lệch giao diện

- Component mới đăng ký purpose, variants và consumers.
- Token/preset mới nằm trong shared source.
- Page mới dùng app shell, typography và motion grammar hiện hành.
- Visual deviation cần Creative Concept/Decision ID.
- Có visual review/regression theo breakpoint và quality tier.
