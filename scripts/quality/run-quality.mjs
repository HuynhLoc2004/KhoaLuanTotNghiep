import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";

const repositoryRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const nodeModules = path.join(repositoryRoot, "node_modules");

const checks = [
  {
    args: [
      path.join(nodeModules, "markdownlint-cli2", "markdownlint-cli2-bin.mjs"),
      "--config",
      "scripts/quality/markdownlint-cli2.mjs",
    ],
    name: "Markdown style",
  },
  {
    args: [
      path.join(nodeModules, "secretlint", "bin", "secretlint.js"),
      "--secretlintrc",
      "scripts/quality/secretlintrc.json",
      "--secretlintignore",
      "scripts/quality/secretlintignore",
      "--format",
      "compact",
      "**/*",
    ],
    name: "Secret scan",
  },
  {
    args: ["--test", "scripts/quality/project-quality.test.mjs"],
    name: "Project quality rule tests",
  },
  {
    args: ["scripts/quality/project-quality.mjs"],
    name: "Project quality policy",
  },
];

for (const check of checks) {
  console.log(`[quality] ${check.name}`);
  const result = spawnSync(process.execPath, check.args, {
    cwd: repositoryRoot,
    env: process.env,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(`[quality] Unable to start ${check.name}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("[quality] PASS");
