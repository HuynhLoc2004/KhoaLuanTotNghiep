import assert from "node:assert/strict";
import test from "node:test";

import {
  findActiveReportDiagnostics,
  findConfigCoverageDiagnostics,
  findEnvExampleDiagnostics,
  findEnvironmentUrlDiagnostics,
  findMarkdownDiagnostics,
  findTypeScriptPolicyDiagnostics,
} from "./project-quality.mjs";

void test("Markdown links and Mermaid explanations fail closed", () => {
  const markdown = `
[Valid](exists.md)
[Missing](missing.md)

\`\`\`mermaid
flowchart TD
  A --> B
\`\`\`
`;
  const diagnostics = findMarkdownDiagnostics(markdown, "docs/example.md", "/repo", (target) =>
    target.endsWith("exists.md"),
  );

  assert.deepEqual(diagnostics.map((item) => item.rule).sort(), [
    "DOC_LINK_MISSING",
    "DOC_MERMAID_EXPLANATION",
  ]);
});

void test("Legacy Mermaid exceptions are path and ordinal scoped", () => {
  const markdown = `\`\`\`mermaid
flowchart TD
  A --> B
\`\`\`
`;

  assert.equal(
    findMarkdownDiagnostics(markdown, "docs/01-architecture/01-system-architecture.md").length,
    0,
  );
  assert.equal(findMarkdownDiagnostics(markdown, "docs/another-file.md").length, 1);
});

void test("Environment examples accept placeholders and mask sensitive values", () => {
  const safe = findEnvExampleDiagnostics("API_SECRET=change-me-api\nPORT=3000\n", ".env.example");
  assert.equal(safe.diagnostics.length, 0);

  const unsafe = findEnvExampleDiagnostics("API_SECRET=do-not-print-this\n", ".env.example");
  assert.equal(unsafe.diagnostics.length, 1);
  assert.equal(unsafe.diagnostics[0]?.rule, "SECRET_ENV_EXAMPLE_VALUE");
  assert.equal(unsafe.diagnostics[0]?.message.includes("do-not-print-this"), false);
});

void test("Runtime config use must be covered by a tracked environment example", () => {
  const diagnostics = findConfigCoverageDiagnostics(
    [{ content: "const mode = process.env.MISSING_MODE;", file: "services/api/src/config.ts" }],
    new Set(["NODE_ENV"]),
  );
  assert.equal(diagnostics[0]?.rule, "CONFIG_ENV_COVERAGE");
});

void test("Environment-specific runtime URLs are rejected", () => {
  const diagnostics = findEnvironmentUrlDiagnostics(
    'const endpoint = "http://localhost:3000/api";',
    "apps/web/src/config.ts",
  );
  assert.equal(diagnostics[0]?.rule, "CONFIG_ENVIRONMENT_URL");
});

void test("TypeScript policy rejects dynamic queries and request-derived cache keys", () => {
  const source = `
    db.query("SELECT * FROM artifacts WHERE " + req.query.filter);
    redis.get(\`artifact:\${req.params.id}\`);
  `;
  const diagnostics = findTypeScriptPolicyDiagnostics(source, "services/api/src/data.ts");
  assert.deepEqual(diagnostics.map((item) => item.rule).sort(), [
    "CACHE_UNSCOPED_INPUT_KEY",
    "DATA_DYNAMIC_QUERY",
  ]);
});

void test("TypeScript policy accepts bound values and scoped cache builders", () => {
  const source = `
    db.query("SELECT * FROM artifacts WHERE id = $1", [artifactId]);
    redis.get(buildArtifactCacheKey({ artifactId, locale, audience }));
  `;
  assert.equal(findTypeScriptPolicyDiagnostics(source, "services/api/src/data.ts").length, 0);
});

void test("Active task reports require synchronization, evidence and diagrams", () => {
  const nextWork =
    "| TASK-X-001 | Example | IN_PROGRESS | owner | now | deps | estimate | scope | report |";
  const report = "# TASK-X-001\n\n## Identity\n\n## Objective\n";
  const diagnostics = findActiveReportDiagnostics(
    nextWork,
    () => report,
    (file) => file === "docs/work/TASK-X-001.md",
  );
  assert.ok(diagnostics.some((item) => item.rule === "DOC_ACTIVE_REPORT_PRE_CODE_SYNC"));
  assert.ok(diagnostics.some((item) => item.rule === "DOC_ACTIVE_REPORT_DIAGRAMS"));
});
