// Prettier owns prose/table wrapping, so MD013 is disabled instead of maintaining a second line-length policy.
// Historical reports may repeat subsection names under different parents; MD024 is scoped to siblings.
const legacyStyleExceptions = [
  // Stable member-registration numbering conflicts with Markdownlint's all-ones ordered-list preference.
  "docs/TEAM.md",
  // Blank template prompts intentionally contain whitespace/extra vertical room for human completion.
  "docs/templates/option-review-template.md",
  "docs/templates/task-work-report-template.md",
  "docs/work/README.md",
  // Merged task evidence is immutable on feature branches; project-specific link/report checks still inspect it.
  "docs/work/TASK-API-001.md",
  "docs/work/TASK-FOUND-001.md",
];

export default {
  config: {
    default: true,
    MD013: false,
    MD024: { siblings_only: true },
    MD033: { allowed_elements: ["br", "details", "summary"] },
    MD041: false,
    MD060: false,
  },
  gitignore: true,
  globs: ["**/*.md"],
  ignores: legacyStyleExceptions,
  noProgress: true,
};
