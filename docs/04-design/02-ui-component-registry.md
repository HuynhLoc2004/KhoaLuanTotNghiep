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
| Color | CODE_CONFIRMED | `packages/ui/src/tokens/theme.ts` | Primary Red (`#9E1B1B`), Gold Accent (`#D4AF37`), Bronze, Dark Charcoal, Silk White |
| Typography | CODE_CONFIRMED | `packages/ui/src/tokens/theme.ts` | Outfit, Cinzel, Inter, Roboto font families |
| Spacing/radius/shadow | CODE_CONFIRMED | `packages/ui/src/tokens/theme.ts` | Glassmorphism card backdrop-filter & shadow |
| Motion | CODE_CONFIRMED | `packages/ui/src/tokens/theme.ts` | Fast, Normal, Slow transitions & pulseGlow |

## Components and shells

| Component/Pattern | Purpose | Status | Location | Variants | Consumers | Do not duplicate |
|---|---|---|---|---|---|---|
| App shell | Public navigation/layout | CODE_CONFIRMED | `apps/web/src/shell/layout.ts`, `apps/web/src/shell/webShell.ts` | Responsive Mobile/Desktop Header & Footer | Public Web | Có |
| Admin shell | CMS layout | CODE_CONFIRMED | `apps/admin/src/shell/layout.ts`, `apps/admin/src/shell/adminShell.ts` | Sidebar navigation, Header, Content Form Editor & Live Preview Panel | Admin | Có |
| Content block renderer | CMS sections | CODE_CONFIRMED | `packages/ui/src/cms/renderer.ts` | Hero, ArtifactGrid, TimelinePreview, Banner | Public Web, Admin | Có |
| Audio player | Tour/voice | DOCS_ONLY | — | Compact/Full | Tour/Artifact | Có |
| 3D viewer shell | Scene/model/fallback | DOCS_ONLY | — | Quality tiers | Artifact/Map | Có |

## Motion and 3D patterns

| Pattern | Purpose | Status | Location | Fallback | Consumers |
|---|---|---|---|---|---|
| Reveal | Content entrance | DOCS_ONLY | — | Fade/static | Blocks |
| Spatial transition | Map/3D continuity | DOCS_ONLY | — | Instant/2D | Map/Viewer |
| Immersive Hero | Entry storytelling | DOCS_ONLY | — | Layered image/video | Home/Exhibition |
| Artifact Orbit | Inspect object | DOCS_ONLY | — | 360/gallery | Artifact |
| Living Timeline | Narrative graph/timeline nối hiện vật và bối cảnh | DOCS_ONLY | `docs/03-features/11-living-timeline.md` | `FREE_EXPLORE` artifact detail; `GUIDED_JOURNEY` vertical cards/lines; static 2D/reduced-motion; Cinematic scene là extension | Timeline, Tour, Artifact, AI Guide |
| Related Artifact Card | Hiển thị target artifact cùng relation type, localized reason/source và approved 3D/media fallback | DOCS_ONLY | `docs/03-features/11-living-timeline.md` | Compact rail/list; không relation thì ẩn và dùng search/map fallback | Artifact Detail, Timeline, AI Guide |

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
