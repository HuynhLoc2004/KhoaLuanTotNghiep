# Thành viên dự án

File này là nguồn định danh thành viên cho AI và task registry. Không lưu email, token, mật khẩu hoặc thông tin đăng nhập.

## Members

| Member ID | Tên hiển thị | Git author aliases | GitHub username | Trạng thái | Vai trò ưu tiên |
|---|---|---|---|---|---|
| `loc` | Huynh Tan Loc | `Huynh Tan Loc`; `HUYNH TAN LOC` | Chưa khai báo | ACTIVE | Điều phối, full-stack |

## Quy tắc nhận diện

1. Khi chat mới bắt đầu, AI hỏi người dùng tên hoặc Member ID; không đọc danh sách tên ra để họ chọn và không gọi tên trước khi họ trả lời.
2. Chuẩn hóa câu trả lời bằng trim, nhiều khoảng trắng và chữ hoa/thường rồi so khớp chính xác với Member ID/tên/alias `ACTIVE`.
3. Khớp duy nhất: báo kết quả để người dùng xác nhận hoặc sửa.
4. Không khớp hoặc khớp nhiều: hỏi người dùng muốn đăng ký Member ID nào; không đoán và không tự gán placeholder.
5. Chỉ sau câu trả lời của người dùng, AI có thể đọc `git config user.name` như kiểm tra nhất quán phụ. Git author không phải bằng chứng danh tính vì máy hoặc repository có thể dùng chung.
6. Nếu Git author khác câu trả lời, báo cảnh báo cấu hình nhưng ưu tiên danh tính người dùng vừa xác nhận; không tự sửa Git config.
7. Không tự tạo thành viên hoặc thay alias khi chưa được người dùng/nhóm chấp thuận.

## Khi thành viên mới thiết lập máy

1. Người dùng tự nói tên hoặc Member ID mong muốn.
2. Nhóm thêm một dòng `ACTIVE` vào bảng sau khi xác nhận, không tạo trước dòng tên giả/placeholder.
3. Sau đó có thể kiểm tra:

```bash
git config user.name
```

4. Cập nhật alias chính xác trên `develop` nếu cần. GitHub username là tùy chọn nếu nhóm không dùng API/PR automation.

## Privacy

- Không ghi `user.email` vào file này.
- Không hiển thị email trong onboarding/handoff.
- Không lưu credential, personal access token hoặc OAuth token.
- Nếu cần phân biệt hai người trùng tên, hỏi họ chọn Member ID/alias bổ sung không nhạy cảm.
