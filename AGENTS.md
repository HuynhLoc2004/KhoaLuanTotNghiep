# Project instructions for humans and coding agents

Before changing code or architecture, read [PROJECT_BRAIN.md](PROJECT_BRAIN.md) and the relevant feature document under `docs/03-features/`.

For an active implementation, also read `CURRENT_TASK.md`, `docs/00-product/03-business-invariants.md`, applicable ADRs, and relevant contracts listed in `docs/02-data/03-contract-catalog.md`.

Before claiming work, ask the current collaborator for their name or Member ID, then confirm it against `docs/TEAM.md`. Do not identify or address a person from local Git metadata alone; shared machines and inherited repository config make that unreliable. GitHub access is not required.

For Git/branch questions or before changing development context, read `docs/07-delivery/07-git-playbook.md`.

Before implementing a feature that consumes or exposes shared behavior, read `docs/01-architecture/03-integration-map.md` and the owning shared contracts.

## Token-efficient context loading

Do not read every Markdown file or scan the whole codebase by default.

1. For “read/understand this project” requests, read only `docs/AI_CONTEXT.md`, `docs/PROJECT_STATUS.md`, `docs/NEXT_WORK.md` and `docs/TEAM.md`.
2. Use `docs/CONTEXT_ROUTER.md` to select the smallest relevant document set.
3. Read `PROJECT_BRAIN.md` in full only before implementation/architecture changes or when the compact context reports a conflict.
4. For a feature question, read its owner file plus the router's required shared documents; do not read unrelated feature specs.
5. Inspect source code only after a task is selected, and only within the task write scope plus direct imports/contracts/tests needed to understand it.
6. Expand context one hop at a time when a referenced contract, invariant, ADR or dependency is actually relevant.
7. In the response, state which documents were read and what was intentionally not inspected.

## Fresh-clone onboarding mode

When a user has just cloned/opened the repository and asks what to do next:

1. Enter documentation-only onboarding mode.
2. Read `docs/AI_CONTEXT.md`, `docs/PROJECT_STATUS.md`, `docs/NEXT_WORK.md` and `docs/TEAM.md`. Use `docs/CONTEXT_ROUTER.md`; do not load all detailed plans.
2a. Ask the user for their name or Member ID. Only after they answer, compare it with `docs/TEAM.md`; local `git config user.name` is a secondary consistency check, not identity proof.
3. Do not inspect application source code, install dependencies or edit files yet.
4. Do not assume the current branch or another developer's unfinished task is the work the new user should continue.
5. Summarize project status and propose 2–4 independent `READY` tasks from `docs/NEXT_WORK.md`.
6. For each proposal give: objective, why now, dependencies, estimated effort/confidence, suggested branch, owning Markdown files, what Codex will implement and how the user will verify it.
7. Ask the user to choose a task. Only after selection enter implementation mode, check the branch and inspect only the relevant code.
8. If the documentation is incomplete or stale, propose a documentation reconciliation task; do not silently infer completed code from an absent record.
9. Follow `docs/07-delivery/06-two-person-collaboration.md` when suggesting or claiming work. A task is not safely claimed until its owner, branch, claimed date and write scope are visible on `develop`.
10. Check task write scopes before proposing parallel work. Do not propose two tasks that own the same migration, contract, shared package or feature document unless an explicit coordination boundary is recorded.
11. Do not infer or announce a name/Member ID before the user identifies themselves. After their answer, state the confirmed/matched Member ID and confidence. If no unique match exists, ask how they want to be registered before claiming a task; do not guess or assign placeholder identities.

Rules:

1. Check and report the current Git branch before editing.
2. Never rebase or merge implementation branches unless the user explicitly asks. For accepted shared plan/task coordination, Codex is authorized and required to commit/push the coordination-only change to remote `develop`, verify success, then switch back to the confirmed owner's feature branch. For other Git actions, obtain explicit user authorization and explain the expected result.
3. Feature code belongs on a `feature/*` branch created from `develop`; fixes use `fix/*`; documentation that governs the whole project may be updated on `develop` when the user approves.
4. Do not hard-code public content, menus, banners, tours, artifacts or translations in React components. Public content must come from the CMS/API.
5. Every feature change must update its Markdown specification: flow, data, API/events, algorithm, alternatives, advantages, disadvantages, suitability, scalability, security, fallback, testing and acceptance criteria.
6. Preserve the chosen service boundaries and database responsibilities unless an ADR explicitly changes them.
7. Secrets belong only in ignored environment files or a secret manager. Commit only `.env.example` without values.
8. Do not report a feature complete until its documented acceptance criteria can be tested.
9. Documentation is persistent project memory, not an optional final step. In the same change as the code, record the actual implementation status, decisions, deviations, known limitations, tests run and next work in the correct feature document.
10. Never put all change notes into one generic file. Feature-specific knowledge belongs in that feature file; cross-cutting architecture decisions belong in an ADR; current project progress belongs in `docs/PROJECT_STATUS.md`.
11. Before editing, read the existing “Implementation status”, “Decision log” and “Change history” of the relevant feature so that new work extends rather than contradicts previous work.
12. Treat every user request as a documentation intake. If it introduces behavior that has no owning specification, automatically create a new file from `docs/templates/feature-template.md`, add it to `README.md` and `docs/PROJECT_STATUS.md`, then implement. Do not wait for the user to explicitly request documentation.
13. If the request extends an existing feature, update that feature file instead of creating a duplicate. If it affects several features, choose one owner and add concise cross-links from the others.
14. Preserve previous plans and decisions. Never silently rewrite history or delete an old decision because implementation changed. Mark it superseded, record the new decision, reason, migration and impact.
15. Before implementation, add a delivery estimate when enough information exists: optimistic/expected/pessimistic range, assumptions, dependencies, risks and included scope. Record actual effort/completion date after the team confirms completion. Estimates are planning aids, not guarantees.
16. Resolve conflicting information using the authority order in `PROJECT_BRAIN.md`. Never silently choose one source; report material conflicts and record the resolution.
17. Trace every implemented requirement to its feature, contract/data impact, tests and acceptance criteria. Update `docs/07-delivery/05-traceability-matrix.md` for behavior that reaches implementation.
18. Business invariants are non-negotiable unless the user explicitly approves an architectural decision that supersedes one. Add regression tests for affected invariants.
19. Keep `CURRENT_TASK.md` focused on the active branch. At handoff, move durable knowledge to the owning documents and leave a concise current status; do not use it as the permanent changelog.
20. End implementation handoffs using `docs/templates/handoff-template.md`.
21. `CURRENT_TASK.md` describes the task of the currently checked-out branch; it is not an instruction for a newly cloned collaborator to take over someone else's unfinished work. New-work selection comes from `docs/NEXT_WORK.md`.
22. Treat stale information as a warning, not permission to overwrite. Ask the team before reassigning a stale task or changing another owner's files.
23. Onboarding answers must use `docs/templates/onboarding-response-template.md` so the user receives status, recommended tasks, branch names, Codex scope, review steps and conflicts consistently.
24. If the user wants to switch to another feature, follow the Task Switching Protocol in `docs/07-delivery/06-two-person-collaboration.md` before proposing new work.
25. Proactively recommend the correct Git handoff: verified work may be proposed for merge after push/review; implemented-but-unverified work should be pushed for review but not merged; incomplete work may be pushed as WIP and marked `PAUSED` but must not be merged.
26. Codex may show exact Git commands after checking branch/status, but must not execute commit, push, PR or merge under the team's standing instruction.
27. Do not print, persist or use Git email for identity matching. After the user states their identity, `user.name` aliases may be used only as a consistency warning; never use local Git metadata to override the user's answer or store credentials/tokens in `docs/TEAM.md`.
28. Identity inference does not authorize actions. The user must still choose a task, and `docs/NEXT_WORK.md` remains the source of task ownership.
29. Respect branch isolation: each member normally reads/edits/pulls only their own feature branch. Do not fetch, track, inspect or modify another member's feature branch unless the user explicitly asks for review, support or handoff.
30. Treat `origin/develop` as the shared integration source. Pulling `develop` retrieves only work already merged/pushed to `develop`; it does not bring another feature branch's code into the working tree.
31. Before a new feature, recommend updating local `develop` and creating the new branch from it. To continue an existing feature, recommend switching to and pulling that same feature branch. Never tell the user to recreate an existing branch from `develop`.
32. To bring newly merged shared work into an active feature, recommend updating `develop` first and then merging `develop` into the user's feature branch. Check for a clean working tree before pull/switch/merge.
33. Give Git guidance from observed state, not assumptions. First inspect current branch, status, local branches, tracking information and relevant remote branches with read-only commands.
34. Before every proposed Git command, explain its purpose, expected result and whether it changes files/history/remote state. Use one small command group at a time and wait for the user's result when failure or conflicts are possible.
35. Never describe `origin/develop` as a local branch. After clone, explain that only the remote default branch normally becomes local automatically; other branches require first-time tracking.
36. If the user appears unfamiliar with Git, prefer `git switch` terminology, show the equivalent `checkout` only when helpful, and never mix both styles in one primary workflow.
37. On conflicts, detached HEAD, missing tracking, dirty working tree or rejected push, stop the normal flow and diagnose. Do not recommend destructive reset/force-push as a shortcut.
38. Enforce “code isolation, contract alignment”: edit only the claimed write scope, but design against the same accepted entities, API/event contracts, permissions, design tokens and invariants as other features.
39. Do not inspect another member's unfinished source merely to infer an integration. Use accepted documentation/contracts on `develop`. If the required contract is missing, ambiguous or only exists in another feature branch, stop and propose a coordination change on `develop`.
40. A shared contract change must identify producers, consumers, compatibility, migration order and affected task owners before implementation. Never create a parallel DTO/entity/event with a different name to avoid coordination.
41. At handoff, run a cross-feature consistency check: integration map, contract versions, permission names, entity IDs, error codes, cache invalidation, shared UI tokens and dependency status.
42. When a meaningful implementation choice exists, enter `DESIGN_OPTIONS` before coding. Present 2–4 viable options using `docs/templates/option-review-template.md`; include flow/algorithm, advantages, disadvantages, project suitability, scale, security, cost, complexity and fallback.
43. Recommend one option with evidence, but do not choose on the user's behalf when the choice materially changes product behavior, architecture, cost, data or maintainability.
44. After the user chooses, record the decision as `PLAN_LOCKED` in the owning feature Decision log or an ADR. Implementation must follow that locked plan.
45. Do not silently substitute a different library, algorithm, model, schema or flow during coding. If new evidence invalidates the plan, stop, explain the evidence, create a plan revision, obtain approval and only then continue.
46. “Modern” means actively maintained, stable enough, compatible, secure, licensed appropriately and valuable for this project—not merely newest. Verify time-sensitive technology claims from primary/official sources when making the actual selection.
47. Never use “understand the project” as permission to recursively read all source files. Start from docs, identify ownership and dependencies, then inspect scoped code only if the user chooses implementation or asks for code diagnosis.
48. Guide collaborators through the accepted plan using `docs/templates/guided-execution-template.md`. Do not merely list tasks; explain the recommended sequence and lead the user through one safe checkpoint at a time.
49. Every guided step must state: objective, why it is next, prerequisites, exact user/Codex action, expected result, verification, documentation impact and stop condition.
50. Do not advance past a gate without evidence: identity confirmed, task claim shared on `develop`, correct branch, Definition of Ready, `PLAN_LOCKED` where needed, tests, documentation and user review.
51. Distinguish actions clearly: `USER ACTION`, `CODEX ACTION`, `CHECKPOINT`, `STOP IF`. Codex must never imply it executed a user-owned Git action.
52. If the user asks for the full roadmap, provide it briefly but still identify exactly one recommended next step. Avoid overwhelming a new collaborator with all future commands.
53. If the user explicitly asks to read `src`, source, or existing code to explain the project, enter `CODEBASE_OVERVIEW` from `docs/CONTEXT_ROUTER.md`. Verify source existence from the filesystem; do not infer it only from `PROJECT_STATUS.md`.
54. In `CODEBASE_OVERVIEW`, read file names, manifests, workspace/build config, entry points, routers/module registries, shared contracts and primary database schema. Sample representative modules only; do not read every component, test, asset or generated file.
55. Compare code evidence with docs and label each conclusion `CODE_CONFIRMED`, `DOCS_ONLY` or `DOCS_STALE`. A read/report request does not authorize documentation fixes.
56. Treat every new product/design idea as a `CREATIVE_CONCEPT` intake. Record it in `docs/IDEA_BACKLOG.md`, find/create its feature owner, and use `docs/templates/creative-concept-template.md` before implementation.
57. Do not merely implement the first phrasing of an idea. Propose 2–4 distinct, feasible concepts with a signature “wow moment”, visual/storytelling identity, 3D/motion behavior, interaction flow, fallback and measurable value.
58. Creative proposals must still analyze algorithm/technique, advantages, disadvantages, originality risk, project suitability, performance tiers, accessibility, CMS configurability, security/privacy, dependencies, confidence and optimistic/expected/pessimistic effort.
59. Recommend a concept but wait for the user to choose. Record the chosen concept as `PLAN_LOCKED`; keep unchosen ideas as `DEFERRED` or `REJECTED` with reasons, never silently discard them.
60. Creativity does not waive invariants. All immersive effects require `Balanced/Lite` and reduced-motion fallbacks, asset budgets, mobile testing and admin-driven content/configuration.
61. Before designing or coding, scan `docs/IMPLEMENTATION_INDEX.md` and `docs/04-design/02-ui-component-registry.md` for merged capabilities and reusable UI/motion/3D patterns. Do not recreate an existing component, flow or contract under a new name.
62. Distinguish pushed from integrated work: code only on `feature/*` remains branch-local; only code merged into `develop` belongs to the shared implemented baseline.
63. After the user confirms a merge into `develop`, run the Merge Memory Sync Gate in `docs/07-delivery/08-merge-memory-sync.md`.
64. Shared memory is incomplete until indexes record what was added, location, reuse, status/version, tests, limitations and consumers.
65. New UI must reuse registered tokens, primitives, motion grammar and scene presets unless a `PLAN_LOCKED` concept explicitly extends the system.
66. Treat `develop` as the published plan feed. Accepted changes that affect another task, shared contract, dependency, UI system, invariant or roadmap must be prepared as a small coordination update on `develop`; do not leave them discoverable only inside one feature branch.
67. Update `docs/PLAN_SNAPSHOT.md` whenever an accepted plan revision changes shared direction. Increment the revision, summarize affected owners/tasks/contracts and link to detailed owner documents.
68. Keep branch-local implementation notes in the feature branch, but publish cross-team decisions before dependent work begins. Never copy full details into the snapshot; it is a change feed/router.
69. At the beginning of implementation after a pull, compare the Plan Snapshot revision and re-read only changed owner documents relevant to the task.
70. Remind the user that plans become visible to collaborators only after the documentation change is committed and pushed/merged to remote `develop`; local edits and feature-only docs are not shared.
71. Every implemented feature must satisfy `docs/templates/feature-report-standard.md`. Its owner Markdown must contain rendered Mermaid diagrams and plain-language explanations, not only prose or code references.
72. At minimum document: actor/user flow, system sequence, data/state flow, authentication/authorization path, algorithm/pseudocode, technology/dependency inventory, alternatives, advantages/disadvantages, suitability, scalability, security, estimate and actual evidence.
73. Diagrams must match the implemented behavior. After code changes, update nodes, branches, states, API names and failure paths; stale diagrams make the feature documentation incomplete.
74. Explain each diagram below it: entry condition, numbered steps, decision points, errors/fallback, output and persisted/audited data. Do not assume the thesis reader understands implementation jargon.
75. A feature cannot be handed off as `IMPLEMENTED` when its required report sections are missing; record `IN_PROGRESS` and list the documentation gaps.
76. Before the first implementation action in a new chat, changed branch/task, uncertain continuation, or after at least four hours since recorded activity, ask the user for their name or Member ID again. The four-hour threshold revalidates identity only; it never releases task ownership.
77. Every implementation session must follow `docs/07-delivery/09-work-session-contribution-ledger.md`: record session ID, confirmed contributor, task/branch, start/last-active/end timestamps, scope, output, tests and handoff in the feature owner.
78. If a prior session has no reliable end, mark it `INTERRUPTED` with `EndedAt: UNKNOWN`; never invent duration, completion time or active effort from wall-clock absence.
79. A different contributor continuing work requires confirmed handoff/coordination, a new ledger row and preserved prior attribution. Do not overwrite another contributor's timestamps, scope or evidence.
80. Track feature lifecycle milestones from claim through implementation, verification, merge and completion. `VERIFIED`, merged/completed timestamps and actual effort require user/team evidence.
81. After members confirm a task owner/write scope but before any implementation code, enforce `PRE_CODE_PLAN_SYNC`: remind the owner to publish the accepted task claim, branch, dependency, write scope and shared plan/contract changes to remote `develop`; local edits, chat confirmation and a feature-only push do not pass this gate.
82. Do not start implementation until the collaborator has pulled the updated `origin/develop` and confirmed the new Plan Snapshot/registry does not overlap their files, migration, contract or shared package. Record `PRE_CODE_PLAN_SYNC: PASS` evidence in the active task/feature owner.
83. All shared planning and task-coordination changes belong on `develop`: task status/owner/branch/dependency/write scope, shared plan revisions, accepted contracts, cross-task decisions and roadmap changes. Do not leave these discoverable only on a feature branch; publish them to remote `develop` so collaborators receive them by pulling `develop`.
84. Feature branches keep implementation code, tests, `CURRENT_TASK.md` and branch-local implementation evidence. When a feature-branch discussion changes shared direction, prepare and publish the smallest coordination update on `develop` before dependent coding continues.
85. After team confirmation, Codex owns the coordination Git sequence: verify branch/status/remote, isolate only shared planning files, update local `develop` safely, commit and push to `origin/develop`, verify the remote commit, then switch to the task owner's confirmed feature branch and re-check status. Do not ask the user to remember this sequence. Stop on dirty unrelated files, divergence, conflict, rejected push, missing remote/tracking or ambiguous ownership; never force-push or discard changes.
