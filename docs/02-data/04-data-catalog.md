# Data catalog

## Phân loại dataset/media

| Nhãn | Ý nghĩa | Được public | Được train AI |
|---|---|---:|---:|
| `DEMO` | Dữ liệu minh họa, không khẳng định là dữ liệu bảo tàng | Có nếu gắn nhãn | Không mặc định |
| `MUSEUM_UNVERIFIED` | Đã thu thập nhưng chưa được chuyên gia duyệt | Không | Chỉ khi có quyền |
| `MUSEUM_VERIFIED` | Nội dung đã được bảo tàng/chuyên gia xác nhận | Có theo publish | Theo license/consent |
| `USER_PRIVATE` | Upload của người dùng | Chỉ chủ sở hữu | Không |
| `USER_CONSENTED_AI` | Upload có consent riêng cho AI | Theo policy | Có trong phạm vi consent |
| `TEST_SYNTHETIC` | Fixture/synthetic test | Không production | Có thể dùng test |

## Metadata bắt buộc

- `source`, `sourceType`, `verificationStatus`.
- `license`, `rightsHolder`, `credit`.
- `capturedAt`, `capturedBy`, `device` khi phù hợp.
- `consentType`, `consentAt`, `retentionUntil` với dữ liệu user.
- `checksum`, `mediaPublicId`, MIME, kích thước.
- `datasetVersion`, split train/validation/test với AI.

## Quy tắc

- Không biến seed/demo thành dữ liệu xác thực.
- Test split không được dùng train hoặc chọn threshold.
- Không public asset thiếu quyền sử dụng/trạng thái duyệt.
- Xóa vật lý media phải qua job và audit; database/media storage phải được đối soát.
