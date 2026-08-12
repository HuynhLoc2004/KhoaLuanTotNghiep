# Repository quality policy

This directory owns deterministic repository checks that supplement the generic
format, lint, type-check, test, and build gates. The checks inspect only
Git-visible tracked or unignored files and never read ignored local `.env`
files.

## Gate composition

1. `markdownlint-cli2` enforces generic Markdown style.
2. Secretlint detects credential patterns and masks suspected values.
3. `project-quality.mjs` enforces project-specific documentation, configuration,
   URL, TypeScript data-access, and active-report rules.
4. API tests exercise validation and error-redaction behavior with synthetic
   input.
5. The hosted OSV job scans all committed JavaScript and Python lockfiles.

Any exception below is exact and reviewable. New files or rules do not inherit
an exception automatically.

## Markdown style exceptions

| Exact path | Reason | Compensating control |
|---|---|---|
| `docs/TEAM.md` | Stable member-registration numbering conflicts with the generic ordered-list style rule. | Project-specific link and Mermaid checks still inspect the file. |
| `docs/templates/option-review-template.md` | Blank prompts intentionally reserve vertical room for human completion. | Reports created from the template are checked when active. |
| `docs/templates/task-work-report-template.md` | Blank prompts intentionally reserve vertical room for human completion. | Active reports must satisfy required-section and diagram rules. |
| `docs/work/README.md` | Human-fillable examples intentionally preserve placeholder spacing. | Project-specific link and Mermaid checks still inspect the file. |
| `docs/work/TASK-API-001.md` | Merged historical evidence is outside this task's write scope. | Project-specific link and Mermaid checks still inspect the file. |
| `docs/work/TASK-FOUND-001.md` | Merged historical evidence is outside this task's write scope. | Project-specific link and Mermaid checks still inspect the file. |

## Secret scan exceptions

| Scope | Reason | Compensating control |
|---|---|---|
| Database-connection rule, literal placeholder `<local-password>` only | Local-environment documentation uses this non-secret token in example URLs. | Other preset rules remain enabled and suspected values remain masked. |
| `pnpm-lock.yaml` and every `uv.lock` | Generated integrity hashes produce noisy generic secret matches. | The pinned hosted OSV job scans the root pnpm lockfile and both Python lockfiles. |

No exception permits a real credential value. Committed `.env.example` files
must use empty values or explicit placeholders for sensitive keys.

## Mermaid explanation debt

The following exception key combines an exact path and a one-based Mermaid
ordinal. Moving or adding a diagram changes the key and makes the gate fail
closed until the documentation is corrected or the exception is reviewed.

| Exact key | Reason |
|---|---|
| `docs/01-architecture/01-system-architecture.md#1` | Legacy overview diagram predates the nearby-explanation standard. |
| `docs/03-features/01-admin-cms.md#1` | Legacy feature diagram predates the nearby-explanation standard. |
| `docs/03-features/05-digital-twin.md#1` | Legacy feature diagram predates the nearby-explanation standard. |
| `docs/03-features/09-search-discovery.md#2` | Legacy feature diagram predates the nearby-explanation standard. |
| `docs/03-features/10-indoor-location-detection.md#2` | Legacy feature diagram predates the nearby-explanation standard. |

These exceptions record debt; they do not certify the diagrams as explained.
The owning feature or architecture task should add the required plain-language
explanation and remove the corresponding key.

## Data-access applicability

The current API baseline uses an in-memory repository and has no production SQL
adapter, query-plan surface, or Redis/cache implementation. This task therefore
provides:

- TypeScript AST policy for dangerous raw or dynamically constructed queries;
- TypeScript AST policy against request-derived cache keys;
- synthetic API validation and unknown-error redaction regression tests; and
- positive and negative unit fixtures for the custom policy.

Runtime query-plan performance and cache invalidation tests are not applicable
until an owning implementation introduces those seams. Static checks must not
be reported as runtime database or cache evidence.

## Review protocol

When a rule reports a false positive, prefer fixing the source. If an exception
is unavoidable, scope it to the smallest file, rule, token, or diagram ordinal;
record the reason and compensating control here; and add a regression test that
proves unrelated input still fails.
