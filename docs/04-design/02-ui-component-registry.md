# UI Component, Motion and 3D Registry

Nguồn đọc nhanh để hai người xây một sản phẩm thống nhất. Chỉ ghi implemented khi đã merge vào `develop`.

## Baseline

- Identity: “di sản sống trong không gian số”.
- Content/experience: CMS-driven.
- Tiers: Cinematic, Balanced, Lite và reduced motion.
- Detailed owner: `01-ui-ux-design-system.md`.

## Tokens

| Group | Status | Location/version | Usage |
|---|---|---|---|
| Color | DOCS_ONLY | — | Bronze/jade/neutral semantic |
| Typography | DOCS_ONLY | — | Vietnamese + WCAG |
| Spacing/radius/shadow | DOCS_ONLY | — | Một shared source |
| Motion | DOCS_ONLY | — | Quality/reduced tiers |

## Components and shells

| Component/Pattern | Purpose | Status | Location | Variants | Consumers | Do not duplicate |
|---|---|---|---|---|---|---|
| App shell | Public navigation/layout | DOCS_ONLY | — | Mobile/Desktop | Public Web | Có |
| Admin shell | CMS layout | DOCS_ONLY | — | Desktop/Tablet | Admin | Có |
| Content block renderer | CMS sections | DOCS_ONLY | — | Schema-driven | Public Web | Có |
| Audio player | Tour/voice | DOCS_ONLY | — | Compact/Full | Tour/Artifact | Có |
| 3D viewer shell | Scene/model/fallback | DOCS_ONLY | — | Quality tiers | Artifact/Map | Có |

## Motion and 3D patterns

| Pattern | Purpose | Status | Location | Fallback | Consumers |
|---|---|---|---|---|---|
| Reveal | Content entrance | DOCS_ONLY | — | Fade/static | Blocks |
| Spatial transition | Map/3D continuity | DOCS_ONLY | — | Instant/2D | Map/Viewer |
| Immersive Hero | Entry storytelling | DOCS_ONLY | — | Layered image/video | Home/Exhibition |
| Artifact Orbit | Inspect object | DOCS_ONLY | — | 360/gallery | Artifact |

## Reuse gate

1. Tìm theo purpose, không chỉ tên.
2. Mở rộng variant nếu cùng semantics.
3. Tạo mới khi behavior/accessibility/data contract thực sự khác.
4. Pattern mới cần Idea/Decision ID và `PLAN_LOCKED`.
5. Ghi consumers, quality fallback, test và migration.

## Merge update template

| Component/Pattern | Purpose | Status | Location | Variants/Fallback | Consumers | Evidence |
|---|---|---|---|---|---|---|
| Name | | CODE_CONFIRMED | path | | | Story/test/visual/perf |
