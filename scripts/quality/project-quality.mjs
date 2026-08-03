import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";

import ts from "typescript";

const repositoryRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const markdownExtension = ".md";
const runtimeExtensions = new Set([".cjs", ".js", ".mjs", ".py", ".ts", ".tsx"]);
const dangerousQueryMethods = new Set([
  "$executeRaw",
  "$queryRaw",
  "executeRaw",
  "queryRaw",
  "raw",
  "unsafe",
]);
const parameterizedQueryMethods = new Set(["execute", "query"]);
const cacheMethods = new Set(["del", "delete", "get", "mget", "set"]);
const activeStatuses = new Set(["IN_PROGRESS", "PAUSED", "REVIEW"]);
const legacyMermaidExplanationExceptions = new Map([
  [
    "docs/01-architecture/01-system-architecture.md#1",
    "Legacy overview diagram predates the nearby-explanation standard.",
  ],
  [
    "docs/03-features/01-admin-cms.md#1",
    "Legacy feature diagram predates the nearby-explanation standard.",
  ],
  [
    "docs/03-features/05-digital-twin.md#1",
    "Legacy feature diagram predates the nearby-explanation standard.",
  ],
  [
    "docs/03-features/09-search-discovery.md#2",
    "Legacy feature diagram predates the nearby-explanation standard.",
  ],
  [
    "docs/03-features/10-indoor-location-detection.md#2",
    "Legacy feature diagram predates the nearby-explanation standard.",
  ],
]);

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function lineNumber(content, index) {
  return content.slice(0, index).split(/\r?\n/u).length;
}

function diagnostic(rule, file, line, message) {
  return { file: toPosix(file), line, message, rule };
}

function isIgnoredRuntimePath(file) {
  return (
    /(^|\/)(dist|node_modules|coverage)(\/|$)/u.test(file) ||
    /(^|\/)(test|tests|__tests__)(\/|$)/u.test(file) ||
    /\.(spec|test)\.[cm]?[jt]sx?$/u.test(file) ||
    file.startsWith("scripts/quality/")
  );
}

function isDynamicExpression(node) {
  return ts.isTemplateExpression(node) || ts.isBinaryExpression(node);
}

function propertyName(expression) {
  if (ts.isPropertyAccessExpression(expression)) {
    return expression.name.text;
  }
  if (
    ts.isElementAccessExpression(expression) &&
    expression.argumentExpression &&
    ts.isStringLiteralLike(expression.argumentExpression)
  ) {
    return expression.argumentExpression.text;
  }
  if (ts.isIdentifier(expression)) {
    return expression.text;
  }
  return undefined;
}

function receiverText(expression, sourceFile) {
  if (ts.isPropertyAccessExpression(expression) || ts.isElementAccessExpression(expression)) {
    return expression.expression.getText(sourceFile);
  }
  return "";
}

function hasRawQueryReviewMarker(content, node, sourceFile) {
  const start = Math.max(0, node.getStart(sourceFile) - 240);
  return /quality-reviewed:\s*raw-query\s+reason=/iu.test(
    content.slice(start, node.getStart(sourceFile)),
  );
}

export function findTypeScriptPolicyDiagnostics(content, file) {
  const diagnostics = [];
  const scriptKind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true, scriptKind);

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const method = propertyName(node.expression);
      const firstArgument = node.arguments[0];

      if (method === "eval") {
        diagnostics.push(
          diagnostic(
            "CODE_DYNAMIC_EVAL",
            file,
            sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
            "Runtime eval is forbidden; use an explicit parser or allowlist.",
          ),
        );
      }

      if (method && dangerousQueryMethods.has(method)) {
        if (!hasRawQueryReviewMarker(content, node, sourceFile)) {
          diagnostics.push(
            diagnostic(
              "DATA_RAW_QUERY_REVIEW",
              file,
              sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
              "Raw/unsafe query calls require a nearby quality-reviewed marker with a reason.",
            ),
          );
        }
        if (firstArgument && isDynamicExpression(firstArgument)) {
          diagnostics.push(
            diagnostic(
              "DATA_DYNAMIC_QUERY",
              file,
              sourceFile.getLineAndCharacterOfPosition(firstArgument.getStart(sourceFile)).line + 1,
              "Dynamic query construction is forbidden; bind values and allowlist identifiers/operators.",
            ),
          );
        }
      }

      if (
        method &&
        parameterizedQueryMethods.has(method) &&
        firstArgument &&
        isDynamicExpression(firstArgument)
      ) {
        diagnostics.push(
          diagnostic(
            "DATA_DYNAMIC_QUERY",
            file,
            sourceFile.getLineAndCharacterOfPosition(firstArgument.getStart(sourceFile)).line + 1,
            "Dynamic query construction is forbidden; bind values and allowlist identifiers/operators.",
          ),
        );
      }

      if (
        method &&
        cacheMethods.has(method) &&
        firstArgument &&
        isDynamicExpression(firstArgument)
      ) {
        const receiver = receiverText(node.expression, sourceFile);
        const keyExpression = firstArgument.getText(sourceFile);
        if (
          /(cache|redis)/iu.test(receiver) &&
          /\b(req|request)\b|\.(body|params|query)\b/iu.test(keyExpression)
        ) {
          diagnostics.push(
            diagnostic(
              "CACHE_UNSCOPED_INPUT_KEY",
              file,
              sourceFile.getLineAndCharacterOfPosition(firstArgument.getStart(sourceFile)).line + 1,
              "Cache keys must use a validated scoped key builder, not direct request input.",
            ),
          );
        }
      }
    }

    if (ts.isTaggedTemplateExpression(node)) {
      const method = propertyName(node.tag);
      if (
        method &&
        (dangerousQueryMethods.has(method) || parameterizedQueryMethods.has(method)) &&
        ts.isTemplateExpression(node.template)
      ) {
        diagnostics.push(
          diagnostic(
            "DATA_DYNAMIC_QUERY",
            file,
            sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
            "Interpolated query templates are forbidden; use the driver's parameter binding API.",
          ),
        );
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return diagnostics;
}

export function findMarkdownDiagnostics(
  content,
  file,
  root = repositoryRoot,
  pathExists = existsSync,
) {
  const diagnostics = [];
  const linkPattern = /!?\[[^\]]*\]\((<[^>]+>|[^)\s]+)(?:\s+["'][^"']*["'])?\)/gu;
  let linkMatch;

  while ((linkMatch = linkPattern.exec(content)) !== null) {
    const rawTarget = linkMatch[1] ?? "";
    const target = rawTarget.startsWith("<") ? rawTarget.slice(1, -1) : rawTarget;
    if (/^(?:#|data:|https?:|mailto:|tel:)/iu.test(target)) {
      continue;
    }

    let decodedTarget;
    try {
      decodedTarget = decodeURIComponent(target.split(/[?#]/u)[0] ?? "");
    } catch {
      diagnostics.push(
        diagnostic(
          "DOC_LINK_ENCODING",
          file,
          lineNumber(content, linkMatch.index),
          "Local Markdown link contains invalid percent encoding.",
        ),
      );
      continue;
    }

    if (!decodedTarget) {
      continue;
    }

    const currentAbsolutePath = path.resolve(root, file);
    const targetAbsolutePath = decodedTarget.startsWith("/")
      ? path.resolve(root, decodedTarget.slice(1))
      : path.resolve(path.dirname(currentAbsolutePath), decodedTarget);
    const relativeTarget = path.relative(root, targetAbsolutePath);

    if (relativeTarget.startsWith("..") || path.isAbsolute(relativeTarget)) {
      diagnostics.push(
        diagnostic(
          "DOC_LINK_OUTSIDE_REPOSITORY",
          file,
          lineNumber(content, linkMatch.index),
          "Local Markdown links must stay inside the repository.",
        ),
      );
    } else if (!pathExists(targetAbsolutePath)) {
      diagnostics.push(
        diagnostic(
          "DOC_LINK_MISSING",
          file,
          lineNumber(content, linkMatch.index),
          `Local Markdown link target does not exist: ${toPosix(relativeTarget)}`,
        ),
      );
    }
  }

  const mermaidPattern = /```mermaid\r?\n[\s\S]*?\r?\n```/gu;
  let mermaidMatch;
  let mermaidOrdinal = 0;
  while ((mermaidMatch = mermaidPattern.exec(content)) !== null) {
    mermaidOrdinal += 1;
    const afterBlock = content.slice(mermaidPattern.lastIndex);
    const nextSectionIndex = afterBlock.search(/\r?\n##\s/u);
    const sectionTail = afterBlock.slice(0, nextSectionIndex === -1 ? 1_200 : nextSectionIndex);
    const hasExplicitExplanation =
      /(?:^|\n)#{0,4}\s*(?:giải thích|explanation)|flow explanation|sequence explanation/imu.test(
        sectionTail,
      );
    const normalizedTail = sectionTail
      .replace(/[`#|:*-]/gu, " ")
      .replace(/\s+/gu, " ")
      .trim();
    const hasPlainLanguageExplanation =
      normalizedTail.length >= 40 && /[\p{L}\p{N}]/u.test(normalizedTail);
    const exceptionKey = `${toPosix(file)}#${mermaidOrdinal}`;
    if (
      !hasExplicitExplanation &&
      !hasPlainLanguageExplanation &&
      !legacyMermaidExplanationExceptions.has(exceptionKey)
    ) {
      diagnostics.push(
        diagnostic(
          "DOC_MERMAID_EXPLANATION",
          file,
          lineNumber(content, mermaidMatch.index),
          "Every Mermaid block needs a nearby explanation before the next level-two section.",
        ),
      );
    }
  }

  return diagnostics;
}

export function findEnvExampleDiagnostics(content, file) {
  const diagnostics = [];
  const keys = new Set();
  const lines = content.split(/\r?\n/u);

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const match = /^([A-Z][A-Z0-9_]*)=(.*)$/u.exec(trimmed);
    if (!match) {
      diagnostics.push(
        diagnostic(
          "CONFIG_ENV_SYNTAX",
          file,
          index + 1,
          "Environment example lines must use KEY=value syntax.",
        ),
      );
      return;
    }

    const key = match[1] ?? "";
    const rawValue = (match[2] ?? "").trim().replace(/^(["'])(.*)\1$/u, "$2");
    if (keys.has(key)) {
      diagnostics.push(
        diagnostic(
          "CONFIG_ENV_DUPLICATE",
          file,
          index + 1,
          `Environment example key is duplicated: ${key}`,
        ),
      );
    }
    keys.add(key);

    const sensitiveKey = /(?:API_KEY|PASSWORD|PRIVATE_KEY|SECRET|TOKEN)$/u.test(key);
    const placeholder =
      rawValue === "" || /^(?:change-me|example|replace-me|<.+>|\$\{.+\})/iu.test(rawValue);
    if (sensitiveKey && !placeholder) {
      diagnostics.push(
        diagnostic(
          "SECRET_ENV_EXAMPLE_VALUE",
          file,
          index + 1,
          `Sensitive key ${key} must be empty or use an explicit placeholder; value is masked.`,
        ),
      );
    }
    if (/^(?:PUBLIC_|VITE_|NEXT_PUBLIC_)/u.test(key) && sensitiveKey) {
      diagnostics.push(
        diagnostic(
          "SECRET_PUBLIC_CONFIG_NAME",
          file,
          index + 1,
          `Public configuration key ${key} must not be named as a secret credential.`,
        ),
      );
    }
  });

  return { diagnostics, keys };
}

export function findConfigCoverageDiagnostics(files, envKeys) {
  const diagnostics = [];
  const patterns = [
    /process\.env\.([A-Z][A-Z0-9_]*)/gu,
    /import\.meta\.env\.([A-Z][A-Z0-9_]*)/gu,
    /os\.(?:environ\.get|getenv)\(["']([A-Z][A-Z0-9_]*)["']/gu,
    /os\.environ\[["']([A-Z][A-Z0-9_]*)["']\]/gu,
  ];

  for (const { content, file } of files) {
    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const key = match[1] ?? "";
        if (!envKeys.has(key)) {
          diagnostics.push(
            diagnostic(
              "CONFIG_ENV_COVERAGE",
              file,
              lineNumber(content, match.index),
              `Runtime configuration key ${key} is missing from a tracked .env.example.`,
            ),
          );
        }
      }
    }
  }

  return diagnostics;
}

export function findEnvironmentUrlDiagnostics(content, file) {
  const diagnostics = [];
  const urlPattern = /https?:\/\/([^/\s"'`]+)/giu;
  let match;
  while ((match = urlPattern.exec(content)) !== null) {
    const host = match[1] ?? "";
    if (
      /^(?:0\.0\.0\.0|127\.0\.0\.1|localhost)(?::\d+)?$/iu.test(host) ||
      /(?:^|\.)(?:dev|internal|local|qa|staging)(?:[.:-]|$)/iu.test(host)
    ) {
      diagnostics.push(
        diagnostic(
          "CONFIG_ENVIRONMENT_URL",
          file,
          lineNumber(content, match.index),
          "Environment-specific URL is forbidden in runtime source; use validated configuration.",
        ),
      );
    }
  }
  return diagnostics;
}

export function findActiveReportDiagnostics(nextWorkContent, readText, pathExists) {
  const diagnostics = [];
  const taskRows = nextWorkContent
    .split(/\r?\n/u)
    .filter((line) => /^\| (?:TASK|FIX)-/u.test(line));

  for (const row of taskRows) {
    const columns = row
      .slice(1, -1)
      .split("|")
      .map((column) => column.trim().replaceAll("`", ""));
    const taskId = columns[0] ?? "";
    const status = columns[2] ?? "";
    if (!activeStatuses.has(status)) {
      continue;
    }

    const reportFile = `docs/work/${taskId}.md`;
    if (!pathExists(reportFile)) {
      diagnostics.push(
        diagnostic(
          "DOC_ACTIVE_REPORT_MISSING",
          "docs/NEXT_WORK.md",
          1,
          `Active task report is missing: ${reportFile}`,
        ),
      );
      continue;
    }

    const content = readText(reportFile);
    const requiredThemes = [
      ["identity", /^## .*identity/im],
      ["objective", /^## .*objective/im],
      ["scope", /^## .*scope/im],
      ["testing evidence", /^## .*testing.*evidence/im],
      ["contribution ledger", /^## .*contribution ledger/im],
      ["handoff", /^## .*handoff/im],
      ["change history", /^## .*change history/im],
    ];

    for (const [theme, pattern] of requiredThemes) {
      if (!pattern.test(content)) {
        diagnostics.push(
          diagnostic(
            "DOC_ACTIVE_REPORT_SECTION",
            reportFile,
            1,
            `Active task report is missing the required ${theme} section.`,
          ),
        );
      }
    }

    if (!content.includes("PRE_CODE_PLAN_SYNC: PASS")) {
      diagnostics.push(
        diagnostic(
          "DOC_ACTIVE_REPORT_PRE_CODE_SYNC",
          reportFile,
          1,
          "Active task report must record PRE_CODE_PLAN_SYNC: PASS evidence.",
        ),
      );
    }
    if (!content.includes("PLAN_LOCKED")) {
      diagnostics.push(
        diagnostic(
          "DOC_ACTIVE_REPORT_PLAN",
          reportFile,
          1,
          "Active task report must record PLAN_LOCKED or its open gate.",
        ),
      );
    }
    if ((content.match(/```mermaid/gu) ?? []).length < 2) {
      diagnostics.push(
        diagnostic(
          "DOC_ACTIVE_REPORT_DIAGRAMS",
          reportFile,
          1,
          "Active task report needs at least two Mermaid diagrams.",
        ),
      );
    }
  }

  return diagnostics;
}

function listRepositoryFiles(root) {
  const result = spawnSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    {
      cwd: root,
      encoding: "utf8",
    },
  );
  if (result.error || result.status !== 0) {
    throw new Error("Unable to enumerate Git-visible repository files for quality checks.");
  }
  return result.stdout.split("\0").filter(Boolean).map(toPosix);
}

export function runProjectChecks(root = repositoryRoot) {
  const diagnostics = [];
  const repositoryFiles = listRepositoryFiles(root);
  const runtimeFiles = [];
  const envKeys = new Set();

  const readText = (file) => readFileSync(path.resolve(root, file), "utf8");
  const pathExists = (file) => existsSync(path.resolve(root, file));

  for (const file of repositoryFiles) {
    const extension = path.extname(file);
    if (extension === markdownExtension) {
      diagnostics.push(...findMarkdownDiagnostics(readText(file), file, root));
    }

    if (file.endsWith(".env.example")) {
      const result = findEnvExampleDiagnostics(readText(file), file);
      diagnostics.push(...result.diagnostics);
      result.keys.forEach((key) => envKeys.add(key));
    }

    if (runtimeExtensions.has(extension) && !isIgnoredRuntimePath(file)) {
      const content = readText(file);
      runtimeFiles.push({ content, file });
      diagnostics.push(...findEnvironmentUrlDiagnostics(content, file));
      if ([".cjs", ".js", ".mjs", ".ts", ".tsx"].includes(extension)) {
        diagnostics.push(...findTypeScriptPolicyDiagnostics(content, file));
      }
    }
  }

  diagnostics.push(...findConfigCoverageDiagnostics(runtimeFiles, envKeys));
  diagnostics.push(
    ...findActiveReportDiagnostics(readText("docs/NEXT_WORK.md"), readText, pathExists),
  );

  return {
    diagnostics: diagnostics.sort(
      (left, right) =>
        left.file.localeCompare(right.file) ||
        left.line - right.line ||
        left.rule.localeCompare(right.rule),
    ),
    fileCount: repositoryFiles.length,
  };
}

function main() {
  const result = runProjectChecks();
  if (result.diagnostics.length > 0) {
    console.error(`[project-quality] ${String(result.diagnostics.length)} violation(s) found:`);
    for (const item of result.diagnostics) {
      console.error(`${item.file}:${String(item.line)} [${item.rule}] ${item.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`[project-quality] PASS (${String(result.fileCount)} Git-visible files inspected)`);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  main();
}
