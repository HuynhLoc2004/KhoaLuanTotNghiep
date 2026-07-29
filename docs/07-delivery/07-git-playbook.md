# Git playbook cho nhóm hai người

## Mục tiêu

Giúp thành viên biết mình đang ở đâu, lệnh nào an toàn và khi nào cần dừng hỏi. Codex phải dựa trên output thực tế, không đoán trạng thái repository.

## Kiểm tra an toàn trước tiên

```bash
git branch --show-current
git status
git branch -vv
git branch -r
```

Ý nghĩa:

- `branch --show-current`: nhánh local đang checkout.
- `status`: file sửa dở, staged/untracked và trạng thái đồng bộ.
- `branch -vv`: local branch đang track remote nào.
- `branch -r`: remote-tracking branch máy đã biết.

Đây là các lệnh chỉ đọc. Nếu `status` không sạch, Codex phải giải thích lựa chọn commit/stash/giữ thay đổi trước khi switch, pull hoặc merge; không tự chọn thay người dùng.

## Sau khi clone

Git thường chỉ tạo local branch cho default branch của remote.

Ví dụ default là `main`:

```text
Local:
* main

Remote-tracking:
origin/main
origin/develop
origin/feature/A
```

`origin/develop` không phải local `develop`. Lần đầu tạo local tracking:

```bash
git switch --track origin/develop
```

Kết quả:

```text
local develop <-> origin/develop
```

Nếu local `develop` đã có:

```bash
git switch develop
git pull origin develop
```

Tương đương cũ bằng checkout:

```bash
git checkout -b develop origin/develop
```

Playbook ưu tiên `git switch` vì rõ mục đích hơn.

## Bắt đầu chức năng mới

Điều kiện: task đã được claim, working tree sạch và local `develop` tồn tại.

```bash
git switch develop
git pull origin develop
git switch -c feature/ten-task
```

Kết quả: branch mới bắt đầu từ code chung mới nhất. Code trực tiếp trên `develop` là không đúng quy trình nhóm.

Push lần đầu do người dùng thực hiện:

```bash
git push -u origin feature/ten-task
```

`-u` thiết lập tracking để lần sau có thể dùng `git pull`/`git push` ngắn.

## Tiếp tục feature của mình

Nếu local branch đã có:

```bash
git switch feature/ten-task
git pull origin feature/ten-task
```

Pull cùng branch đang làm. Không pull `develop` trực tiếp khi đang ở feature như một thói quen.

## Nhận thay đổi đã merge chung

```bash
git switch develop
git pull origin develop
git switch feature/ten-task
git merge develop
```

Lệnh merge cuối đưa code chung mới vào feature. Nếu có conflict, dừng, xem `git status` và giải quyết theo từng file; không reset/xóa thay đổi tự động.

## Remote feature branch chưa có local

Chỉ dùng khi được yêu cầu review, hỗ trợ hoặc handoff:

```bash
git fetch origin
git switch --track origin/feature/ten-task
```

Fetch cập nhật thông tin remote nhưng không đổi working tree. Switch tạo local branch tracking và thay working tree sang code của branch đó.

Không cần làm bước này cho branch người khác nếu chỉ muốn làm task riêng.

## Pull, fetch và merge khác nhau

| Lệnh | Tác dụng chính | Đổi working tree |
|---|---|---:|
| `git fetch origin` | Cập nhật thông tin/commit remote | Không |
| `git pull origin develop` khi ở develop | Fetch rồi tích hợp origin/develop vào local develop | Có thể |
| `git merge develop` khi ở feature | Đưa local develop vào feature | Có |
| `git switch <branch>` | Chuyển working tree sang branch | Có |

## Khi muốn đổi task

- `VERIFIED`: đề xuất push, review/CI và merge feature vào `develop`.
- `IMPLEMENTED`: push để review, chưa merge.
- `IN_PROGRESS/PAUSED`: ghi WIP, có thể push backup, không merge.

Sau đó mới cập nhật `develop` và tạo branch task mới. Xem Task Switching Protocol trong tài liệu cộng tác.

## Các tình huống phải dừng

### Working tree chưa sạch

Codex phải hỏi người dùng muốn hoàn thiện/commit, stash tạm hay giữ nguyên. Không tự stash vì có thể che mất trạng thái công việc.

### Pull/merge conflict

Chạy:

```bash
git status
```

Gửi danh sách conflicted files cho Codex. Không chạy `reset --hard`.

### Push bị rejected

Không force push ngay. Kiểm tra tracking và remote commits; xác định có người khác cùng push branch hay không.

### Detached HEAD

Không code tiếp như bình thường. Tạo/chuyển về branch đúng sau khi xác định commit cần giữ.

### Không thấy origin/develop

```bash
git remote -v
git fetch origin
git branch -r
```

Nếu vẫn không có, remote chưa có `develop` hoặc người dùng không có quyền đọc; không tự tạo branch có cùng tên mà chưa xác nhận.

## Mẫu Codex hướng dẫn

```text
Bạn đang ở local branch feature/A và working tree sạch.
Mục tiêu của bạn là lấy code đã merge vào develop.

Bước 1: chuyển sang develop.
git switch develop

Lệnh này thay working tree nhưng không thay remote. Chạy xong gửi kết quả nếu có lỗi.
```

Codex hướng dẫn theo từng bước có điểm dừng, đặc biệt với pull, merge, conflict và thay đổi branch.
