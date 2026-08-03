# Task work reports

Mỗi implementation task có đúng một file `docs/work/<TASK-ID>.md` trên feature branch của owner.

Task report chứa plan lock, branch/write scope, contribution ledger, decisions, implementation evidence, tests, limitations và handoff. Feature branch chỉ sửa report của chính task đó; không sửa report task khác hoặc shared status files.

Sau feature merge, Merge Memory Sync đọc task report và cập nhật owner docs, `IMPLEMENTATION_INDEX`, registries, project status và README trên `develop`. Task report được giữ làm evidence, không thay thế owner specification.

