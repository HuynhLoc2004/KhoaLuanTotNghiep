# Traceability matrix

Matrix nối yêu cầu với feature, contract/data, test và tiêu chí nghiệm thu. Chỉ thêm dòng khi requirement bắt đầu được triển khai; không cần liệt kê mọi ý tưởng chưa ưu tiên.

| Requirement | Feature owner | Invariant | Contract/Data | Test/Bằng chứng | Acceptance | Trạng thái |
|---|---|---|---|---|---|---|
| REQ-CMS-001 Nội dung public không hard-code | `01-admin-cms.md` | INV-CONTENT-002 | CMS block schema | Chưa có | Admin đổi nội dung không deploy | PLANNED |
| REQ-CMS-002 Draft không public | `01-admin-cms.md` | INV-CONTENT-001 | Public content API | Chưa có | Draft không xuất hiện | PLANNED |
| REQ-MAP-001 Tính tuyến trong bảo tàng | `02-web-3d-navigation.md` | INV-UX-002 | Map graph API/tables | Chưa có | A* đúng route và accessibility | PLANNED |
| REQ-GUIDE-001 QR mở đúng stop | `03-ai-tour-guide.md` | INV-CONTENT-001 | QR resolver API | Chưa có | Dùng được không login | PLANNED |
| REQ-AI-001 Recognition xử lý unknown | `04-artifact-recognition.md` | INV-AI-002 | Recognition job/result | Chưa có | Top-k/confidence/fallback | PLANNED |
| REQ-3D-001 Thiếu model vẫn xem được | `05-digital-twin.md` | INV-3D-001 | Artifact media contract | Chưa có | Media/text fallback | PLANNED |
| REQ-AUTH-001 Ownership history | `07-auth-user-history.md` | INV-AUTH-002 | User history API | Chưa có | Không truy cập chéo user | PLANNED |

Trạng thái: `PLANNED`, `IMPLEMENTED`, `VERIFIED`, `DEFERRED`. Coding agent không tự đặt `VERIFIED`.
