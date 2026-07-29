# Thành viên dự án

File này là nguồn định danh thành viên cho AI và task registry. Không lưu email, token, mật khẩu hoặc thông tin đăng nhập.

## Members

| Member ID | Tên hiển thị | Git author aliases | GitHub username | Trạng thái | Vai trò ưu tiên |
|---|---|---|---|---|---|
| `loc` | Huynh Tan Loc | `Huynh Tan Loc`; `HUYNH TAN LOC` | Chưa khai báo | ACTIVE | Điều phối, full-stack |
| `member-02` | Chưa khai báo | Chưa khai báo | Chưa khai báo | PENDING_PROFILE | Thành viên dự án |

## Quy tắc nhận diện

1. AI đọc `git config user.name` local; không cần quyền GitHub.
2. Chuẩn hóa trim, nhiều khoảng trắng và chữ hoa/thường.
3. So khớp chính xác với alias của member `ACTIVE`.
4. Một kết quả duy nhất: có thể suy ra Member ID, nhưng phải cho phép người dùng sửa.
5. Không có hoặc nhiều kết quả: hỏi người dùng Member ID trước khi claim task.
6. Không tự tạo thành viên hoặc thay alias dựa trên suy đoán.
7. `PENDING_PROFILE` không được auto-match cho đến khi nhóm điền thông tin.

## Khi thành viên thứ hai thiết lập máy

Người đó kiểm tra:

```bash
git config user.name
```

Sau đó cập nhật dòng `member-02` bằng tên hiển thị và alias chính xác trên `develop`. GitHub username là tùy chọn nếu nhóm không dùng API/PR automation.

## Privacy

- Không ghi `user.email` vào file này.
- Không hiển thị email trong onboarding/handoff.
- Không lưu credential, personal access token hoặc OAuth token.
- Nếu cần phân biệt hai người trùng tên, dùng Member ID/alias bổ sung không nhạy cảm.
