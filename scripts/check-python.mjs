import { spawnSync } from "node:child_process";
import { fileURLToPath, URL } from "node:url";
import path from "node:path";

const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const uvCommand = process.platform === "win32" ? "uv.exe" : "uv";
const projects = ["services/ai", "workers/media"];
const checks = [
  ["run", "--locked", "ruff", "check", "."],
  ["run", "--locked", "ruff", "format", "--check", "."],
  ["run", "--locked", "pytest"],
];

for (const project of projects) {
  const workingDirectory = path.join(repositoryRoot, project);

  for (const arguments_ of checks) {
    const result = spawnSync(uvCommand, arguments_, {
      cwd: workingDirectory,
      stdio: "inherit",
    });

    if (result.error?.code === "ENOENT") {
      console.error(
        "uv was not found. Install the PLAN_LOCKED uv 0.11.x toolchain before running Python checks.",
      );
      process.exit(1);
    }

    if (result.status !== 0) {
      process.exit(result.status ?? 1);
    }
  }
}
