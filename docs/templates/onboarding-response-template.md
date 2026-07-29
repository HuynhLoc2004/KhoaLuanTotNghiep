# Mẫu trả lời onboarding

AI dùng cấu trúc này khi người dùng vừa clone/mở dự án và chỉ yêu cầu đọc/đề xuất việc tiếp theo.

## Tôi hiểu dự án như sau

- Sản phẩm:
- Giai đoạn hiện tại:
- Những phần đã được nhóm xác nhận:
- Những phần mới chỉ là plan:
- Những phần đã merge theo Implementation Index:
- Component/pattern cần tái sử dụng theo UI Registry:

## Nhận diện thành viên

- Git author local:
- Member ID suy ra:
- Confidence: HIGH/UNCONFIRMED
- Cần người dùng xác nhận: Có/Không

Không hiển thị Git email. Nếu chưa khớp duy nhất với `docs/TEAM.md`, dừng trước bước claim task và hỏi Member ID.

## Tình trạng cộng tác

- Task đang `IN_PROGRESS` và owner:
- Phạm vi không nên chạm:
- Task/document có dấu hiệu stale hoặc mâu thuẫn:
- Feature branch của người khác cần checkout: Không, trừ khi được yêu cầu review/hỗ trợ.

## Công việc đề xuất

Tối đa 2–4 task `READY`.

### Lựa chọn 1 — TASK-ID: Tên

- Mục tiêu/giá trị:
- Vì sao nên làm bây giờ:
- Dependency:
- Collision risk:
- Estimate và confidence:
- Branch đề xuất:
- Tài liệu owner cần đọc:
- Codex sẽ thực hiện:
- Người dùng sẽ review/test:

Lặp lại cho các lựa chọn khác.

## Khuyến nghị

Chọn một task và giải thích ngắn bằng dependency, giá trị và mức xung đột; không tự bắt đầu.

## Hướng dẫn theo checkpoint

- Gate hiện tại:
- Bước tiếp theo duy nhất:
- USER ACTION:
- CODEX ACTION sau khi người dùng phản hồi:
- Kết quả mong đợi:
- STOP IF:

## Bước tiếp theo sau khi người dùng chọn

1. Nếu người dùng có task cũ, xử lý Task Switching Protocol trước.
2. Xác nhận/claim task mới trên `develop`.
3. Người dùng đưa coordination change lên remote.
4. Tạo/chuyển feature branch.
5. Codex viết `CURRENT_TASK.md`, kiểm tra code trong scope và triển khai.

Nhắc người dùng: cập nhật `develop` chỉ lấy code đã merge chung; tiếp tục task cũ thì pull đúng branch của mình.

Nếu người dùng mới dùng Git, đọc `docs/07-delivery/07-git-playbook.md`, kiểm tra trạng thái thực tế và hướng dẫn từng bước, giải thích kết quả mong đợi trước khi đưa lệnh tiếp theo.

Kết thúc bằng câu hỏi yêu cầu người dùng chọn task. Không sửa file trong onboarding.
