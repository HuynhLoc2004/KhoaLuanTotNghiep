# Quy trình cộng tác cho nhóm hai người

## Mục tiêu

Để hai thành viên và Codex biết ai đang làm gì, tránh nhận trùng task, sửa trùng contract/migration và phụ thuộc vào thông tin chỉ tồn tại trong một feature branch.

## Danh tính thành viên

`docs/TEAM.md` ánh xạ Member ID với tên/alias. Trong chat mới, AI hỏi người dùng tên hoặc Member ID trước; không tự gọi tên từ Git author hoặc liệt kê placeholder. Sau câu trả lời, `git config user.name` chỉ là kiểm tra nhất quán phụ. Không claim task cho danh tính chưa được người dùng xác nhận.

Mỗi phiên implementation áp dụng `09-work-session-contribution-ledger.md`. Chat mới, đổi branch/task/người hoặc quá 4 giờ từ hoạt động được ghi nhận phải hỏi lại danh tính. Mốc này không làm task tự hết owner.

## Hai loại thay đổi

### Coordination change trên `develop`

Cập nhật shared planning/task coordination gồm `docs/NEXT_WORK.md`, `docs/PLAN_SNAPSHOT.md` và owner/contract/index liên quan khi cần: nhận/trả task, status, owner, branch, dependency, write scope, accepted shared decision và cross-task contract. Đây là thay đổi nhỏ bắt buộc xuất hiện trên remote `develop` để người còn lại chỉ cần pull `develop` là nhìn thấy.

Không giữ shared plan/task change chỉ trên feature branch. Feature branch có thể dùng để thảo luận/review bản nháp, nhưng sau khi nhóm thống nhất phải chuẩn bị coordination-only change trên `develop`, commit/push lên remote và yêu cầu collaborator pull trước khi code phụ thuộc bắt đầu.

Mỗi coordination-only change phải cập nhật `README.md` trong cùng commit: Plan Snapshot revision hiện tại, task active/owner/branch và link đến registry/owner docs. README là bản tóm tắt/router; chi tiết vẫn thuộc `NEXT_WORK`, `PLAN_SNAPSHOT` và owner documents.

### Implementation change trên `feature/*`

Code, test, `CURRENT_TASK.md`, feature specification và change history nằm trong feature branch cho đến khi nhóm review/merge.

## Branch isolation

- Người A làm `feature/A`, người B làm `feature/B`.
- A không cần pull/checkout B; B không cần pull/checkout A.
- Hai người cập nhật `develop` để nhận những gì đã được merge chung.
- Pull `develop` không mang code chưa merge của A/B vào `develop`.
- Remote branch của người khác chỉ được track khi review, hỗ trợ hoặc handoff đã thống nhất.

### Scope isolation không cần theo dõi lẫn nhau

- Thành viên chỉ cần làm task và write scope của mình; không phải nhắn nhắc, xem realtime, pull hoặc đoán nội dung feature branch của người kia.
- Đầu mỗi phiên, Codex fetch/read remote `develop`, đối chiếu task owner/write scope và tự chặn chỉnh sửa ngoài phạm vi.
- Code chưa push của người kia không cản task hiện tại nếu write scope trên `develop` không giao nhau.
- Khi cần shared file/contract hoặc phạm vi của owner khác, Codex dừng trước khi sửa và tự chuẩn bị/publish Markdown coordination request trên `develop`.
- Con người chỉ cần review/test/handoff ở checkpoint; AI chịu trách nhiệm nhắc gate và giữ phạm vi trong từng phiên.

### Git theo tình huống

| Việc cần làm | Các bước |
|---|---|
| Bắt đầu task mới | Switch `develop` -> pull `origin/develop` -> tạo feature branch |
| Tiếp tục task của mình | Switch feature branch -> pull chính branch đó |
| Nhận code chung vừa merge | Cập nhật `develop` -> quay lại feature -> merge `develop` |
| Review/hỗ trợ branch khác | Fetch -> track remote branch sau khi thống nhất |

Không đứng ở feature branch rồi dùng `git pull origin develop` như một thói quen, vì thao tác đó nhập develop vào branch hiện tại theo cách dễ gây nhầm. Tách rõ bước cập nhật develop và bước merge.

## Code isolation, contract alignment

Hai người không cần đọc code dang dở của nhau, nhưng phải đọc cùng integration map và contract accepted trên `develop`.

- UI không tự đoán response API.
- API không tự đổi field mà chưa cập nhật consumer.
- Worker không phát event riêng ngoài event catalog.
- Hai task cần cùng shared contract phải chốt contract trên `develop` trước, sau đó mỗi người triển khai phía mình.
- Nếu một phía chưa sẵn sàng, dùng mock/fixture sinh từ cùng schema, không viết object giả khác contract.

Khi merge, contract/provider nên vào trước hoặc giữ backward compatibility để consumer branch không bị vỡ.

## Publish plan chung

Quyết định ảnh hưởng người còn lại phải được cập nhật trong owner doc và `PLAN_SNAPSHOT.md` trên `develop`. Sau khi hai thành viên xác nhận, Codex tự thực hiện coordination-only commit/push lên remote `develop`, xác minh remote rồi quay lại đúng feature branch. Không để contract/dependency mới chỉ tồn tại trong feature branch rồi yêu cầu người khác tự đoán.

## Quy trình nhận task

1. Đồng bộ local `develop`.
2. Chọn một task `READY`.
3. Hỏi người dùng tên/Member ID, đối chiếu `TEAM.md`, nhận xác nhận, rồi kiểm tra dependency và write scope với task `IN_PROGRESS`.
4. Trên `develop`, cập nhật:
   - Status: `IN_PROGRESS`.
   - Owner.
   - Planned branch.
   - `ClaimedAt`, `LastUpdated`.
   - Write scope.
5. Codex commit/push coordination-only change lên remote `develop` và xác minh commit remote; dừng nếu conflict/divergence/rejected push hoặc có file ngoài scope.
6. Tạo feature branch từ `develop`.
7. Cập nhật `CURRENT_TASK.md` trong feature branch rồi code.

### Pre-code Plan Sync Gate

Sau khi hai thành viên xác nhận owner/write scope nhưng trước dòng code implementation đầu tiên:

1. Codex phải nhắc owner publish task claim, branch, dependency, write scope và shared plan/contract liên quan lên remote `develop`.
2. Người còn lại cập nhật local `develop` từ `origin/develop`; không cần checkout/pull feature branch của owner.
3. Hai bên xác nhận registry/Plan Snapshot mới không chồng file, migration, contract hoặc shared package.
4. Owner chỉ bắt đầu code khi coordination change đã hiện trên remote `develop`, đúng feature branch và working tree không chứa thay đổi của task khác.

Plan chỉ được push trên feature branch chưa phải shared coordination. Nếu nhóm review plan bằng feature branch trước, sau khi thống nhất vẫn phải đưa phần coordination đã chấp nhận lên remote `develop` rồi người còn lại pull về. Mọi thay đổi shared plan/task về sau cũng lặp lại gate này. Codex phải dừng ở checkpoint và không ngầm xem việc “đã nói trong chat” là đã đồng bộ cho cả nhóm.

Codex tự commit/push chỉ các file Markdown của coordination change đã được nhóm xác nhận lên remote `develop`. Ưu tiên một coordination worktree riêng để active feature branch không bị checkout qua lại. Codex không đưa non-Markdown/feature commit vào `develop`, không tự push hoặc merge implementation branch, không force-push và không xử lý conflict bằng reset; các trường hợp bất thường phải dừng để nhóm quyết định. Khi feature hoàn tất, Codex chỉ đề xuất lệnh push/review/merge để người dùng tự thực hiện.

## Write scope

Write scope là khóa mềm, không phải quyền filesystem. Ví dụ:

```text
apps/web/**
packages/ui/**
docs/04-design/01-ui-ux-design-system.md
```

Hoặc:

```text
services/api/src/modules/auth/**
packages/contracts/auth/**
db/migrations/*auth*
docs/03-features/07-auth-user-history.md
```

Nếu hai task cùng cần `packages/contracts`, database migration hoặc root config, ghi ranh giới field/module/file cụ thể hoặc làm tuần tự.

## Collision levels

| Mức | Dấu hiệu | Xử lý |
|---|---|---|
| LOW | Chỉ đọc cùng tài liệu, code khác thư mục | Có thể song song |
| MEDIUM | Cùng shared package nhưng khác module/file | Thống nhất contract trước |
| HIGH | Cùng migration/entity/API/schema/feature owner | Không làm song song nếu chưa chia lát cắt |

## Stale task

Một task có thể được cảnh báo `STALE` khi quá ba ngày làm việc không cập nhật hoặc vượt mốc dự kiến mà không có ghi chú. Đây chỉ là tín hiệu hỏi lại.

AI phải nói:

> Task này có dấu hiệu stale, cần xác nhận với owner trước khi nhận lại.

AI không được tự đổi owner, xóa branch hoặc đặt task về `READY`.

Identity recheck sau 4 giờ và task `STALE` sau ba ngày làm việc là hai cơ chế khác nhau. Recheck chỉ xác nhận ai đang ngồi làm; task vẫn thuộc owner hiện tại cho đến khi có handoff/coordination change.

## Hoàn thành và trả task

1. Agent ghi `IMPLEMENTED`, handoff và test đã chạy trên feature branch.
2. Người dùng test/review.
3. Sau khi người dùng xác nhận và merge, cập nhật registry trên `develop` thành `DONE`.
4. Ghi commit/PR tham chiếu nếu nhóm sử dụng.
5. Task tiếp theo bị dependency có thể chuyển `BLOCKED -> READY`.
6. Sau khi merge, chạy `08-merge-memory-sync.md`; task chưa đồng bộ trí nhớ chung chưa được xem là hoàn tất về tài liệu.

## Task Switching Protocol

Áp dụng khi người dùng muốn chuyển chức năng, nhận task mới, tạm dừng hoặc làm hotfix.

### Đã được nhóm xác nhận

1. Feature status là `VERIFIED`.
2. AI đề xuất commit/push feature branch.
3. Người dùng chạy CI và review/PR.
4. AI có thể đề xuất merge vào `develop`; người dùng tự thực hiện.
5. Sau merge, registry chuyển `DONE` và mở dependency liên quan.

### Code xong nhưng chưa review

1. Giữ `IMPLEMENTED`, không tự nâng `VERIFIED`.
2. Cập nhật handoff và hướng dẫn review.
3. Đề xuất push feature branch để backup/chia sẻ.
4. Không đề xuất merge cho đến khi người dùng xác nhận đã test/review đạt.

### Còn dang dở

1. Ghi phần đã làm, phần chưa làm, test hiện tại và cách tiếp tục.
2. Cập nhật feature Change history và `CURRENT_TASK.md`.
3. Chuyển task thành `PAUSED`, giữ owner/branch/write scope.
4. Đề xuất commit WIP và push feature branch nếu người dùng muốn lưu remote.
5. Không merge vào `develop`.
6. Chỉ nhận task khác nếu write scope không xung đột hoặc người dùng chấp nhận chuyển ngữ cảnh.
7. Đóng session thành `PAUSED`; ghi StartedAt/LastActiveAt/EndedAt, scope, test và next checkpoint vào feature Contribution Ledger.

### Bỏ hoặc chuyển giao task

Không tự đặt lại `READY`. Owner/người dùng phải xác nhận handoff hoặc hủy; ghi lý do, trạng thái, branch và migration/dữ liệu dang dở trước khi giải phóng write scope.

Người nhận bàn giao tạo session row mới bằng danh tính đã tự xác nhận. Không sửa contribution row, thời gian hoặc bằng chứng của người cũ. Nếu phiên cũ không có giờ kết thúc đáng tin cậy, ghi `INTERRUPTED` và `EndedAt: UNKNOWN`.

### Lệnh Git minh họa

AI thay placeholder bằng branch/file thực tế sau khi kiểm tra:

```bash
git status
git add <cac-file-da-review>
git commit -m "feat(scope): mo ta thay doi"
git push -u origin feature/ten-task
```

Merge chỉ được đề xuất sau `VERIFIED`. Không merge feature chưa hoàn thiện chỉ để chuyển sang task khác.

### Bắt đầu task mới

1. Đồng bộ `develop`.
2. Chọn task `READY` không xung đột.
3. Hai thành viên xác nhận owner, dependency và write scope.
4. Claim trên `develop` và đưa coordination change/shared plan lên remote.
5. Người còn lại pull `origin/develop` và xác nhận không collision.
6. Tạo hoặc tiếp tục branch riêng từ shared baseline đã đồng bộ.
7. Viết lại `CURRENT_TASK.md` và thực hiện Definition of Ready.

## Nếu feature branch chưa merge

Người mới clone thấy remote branch nhưng không cần checkout hoặc đọc nó trong onboarding. Registry trên `develop` phải cho biết task đang `IN_PROGRESS`, owner và branch. Chỉ đọc branch đó khi owner yêu cầu review/hỗ trợ/chuyển giao.

## Xử lý ngoại lệ

- Quên claim nhưng đã code: cập nhật registry sớm nhất, kiểm tra collision trước khi tiếp tục.
- Hai người nhận trùng: dừng sửa phần giao nhau, chọn owner chính, chia lại lát cắt và ghi quyết định.
- Owner tạm nghỉ: owner/người dùng xác nhận handoff, cập nhật registry rồi người mới mới tiếp tục.
- Hotfix khẩn: dùng `fix/*`, ghi scope nhỏ và vẫn cập nhật registry nếu chạm task đang làm.
