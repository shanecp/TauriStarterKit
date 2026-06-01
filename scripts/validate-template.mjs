#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateDir = path.join(rootDir, "templates", "macos-tauri-react");
const validationDir = path.join(rootDir, "tmp", "validate-template-app");
const textExtensions = new Set([
  ".css",
  ".html",
  ".json",
  ".md",
  ".mjs",
  ".rs",
  ".sh",
  ".toml",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);
const ignoredDirectoryNames = new Set(["dist", "node_modules"]);

await assertPath(templateDir);
await assertMissing(path.join(templateDir, "src", "features", "network"));
await assertMissing(path.join(templateDir, "src", "features", "services"));
await assertMissing(path.join(templateDir, "src", "features", "vms"));
await assertMissing(path.join(templateDir, "src", "features", "hosts"));
await assertMissing(path.join(templateDir, "src", "features", "system-files"));

await assertOnlySharedTauriInvoke(templateDir);
await assertOnlySharedFileOpening(templateDir);
await assertTemplateTokens(templateDir);

await rm(validationDir, { recursive: true, force: true });
run("node", [
  "scripts/create-app.mjs",
  "--app-name",
  "Validation Utility",
  "--app-slug",
  "validation-utility",
  "--package-name",
  "validation-utility",
  "--bundle-id",
  "com.shaneperera.validationutility",
  "--dest",
  validationDir,
  "--force",
]);

await assertNoGeneratedTokens(validationDir);
await assertNoForbiddenGeneratedResidue(validationDir);
await rm(validationDir, { recursive: true, force: true });

console.log("Template validation passed.");

async function assertOnlySharedTauriInvoke(dir) {
  const offenders = [];
  for (const file of await listFiles(dir)) {
    if (!isTextPath(file)) {
      continue;
    }

    const source = await readFile(file, "utf8");
    if (!source.includes("@tauri-apps/api/core") && !source.includes("invoke(")) {
      continue;
    }

    const relative = path.relative(dir, file);
    if (relative !== path.join("src", "shared", "lib", "tauri.ts")) {
      offenders.push(relative);
    }
  }

  if (offenders.length > 0) {
    fail(`Tauri invoke must stay in src/shared/lib/tauri.ts:\n${offenders.join("\n")}`);
  }
}

async function assertOnlySharedFileOpening(dir) {
  const offenders = [];
  const allowed = path.join(
    "src-tauri",
    "src",
    "system",
    "file_opening",
    "open.rs",
  );

  for (const file of await listFiles(dir)) {
    if (path.extname(file) !== ".rs") {
      continue;
    }

    const source = await readFile(file, "utf8");
    if (!source.includes("/usr/bin/open")) {
      continue;
    }

    const relative = path.relative(dir, file);
    if (relative !== allowed) {
      offenders.push(relative);
    }
  }

  if (offenders.length > 0) {
    fail(
      `File opening must stay in ${allowed}; do not call /usr/bin/open directly:\n${offenders.join("\n")}`,
    );
  }
}

async function assertTemplateTokens(dir) {
  const source = await readTextTree(dir);
  const requiredTokens = [
    "__APP_NAME__",
    "__APP_DEV_NAME__",
    "__APP_SLUG__",
    "__PACKAGE_NAME__",
    "__RUST_CRATE_NAME__",
    "__RUST_LIB_NAME__",
    "__BUNDLE_ID__",
    "__DEV_BUNDLE_ID__",
    "__INSTALL_ENV_PREFIX__",
    "__THEME_PREFIX__",
    "__GITHUB_REPO__",
  ];

  const missing = requiredTokens.filter((token) => !source.includes(token));
  if (missing.length > 0) {
    fail(`Template is missing required tokens: ${missing.join(", ")}`);
  }
}

async function assertNoGeneratedTokens(dir) {
  const offenders = [];
  const tokenPattern = /__[A-Z0-9_]+__/;

  for (const targetPath of await listPaths(dir)) {
    if (tokenPattern.test(path.relative(dir, targetPath))) {
      offenders.push(path.relative(dir, targetPath));
    }
  }

  for (const file of await listFiles(dir)) {
    if (!isTextPath(file)) {
      continue;
    }

    if (tokenPattern.test(await readFile(file, "utf8"))) {
      offenders.push(path.relative(dir, file));
    }
  }

  if (offenders.length > 0) {
    fail(`Generated output still has template tokens:\n${offenders.join("\n")}`);
  }
}

async function assertNoForbiddenGeneratedResidue(dir) {
  const offenders = [];
  const forbidden = /\bPrism\b|prism|PRISM|com\.shaneperera\.prism/;

  for (const file of await listFiles(dir)) {
    if (!isTextPath(file)) {
      continue;
    }

    if (forbidden.test(await readFile(file, "utf8"))) {
      offenders.push(path.relative(dir, file));
    }
  }

  if (offenders.length > 0) {
    fail(`Generated output contains Prism-specific residue:\n${offenders.join("\n")}`);
  }
}

async function readTextTree(dir) {
  const chunks = [];
  for (const file of await listFiles(dir)) {
    if (isTextPath(file)) {
      chunks.push(await readFile(file, "utf8"));
    }
  }
  return chunks.join("\n");
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (isIgnoredDirectory(fullPath)) {
        continue;
      }

      files.push(...await listFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function listPaths(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const paths = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && isIgnoredDirectory(fullPath)) {
      continue;
    }

    paths.push(fullPath);
    if (entry.isDirectory()) {
      paths.push(...await listPaths(fullPath));
    }
  }

  return paths;
}

async function assertPath(targetPath) {
  try {
    await stat(targetPath);
  } catch {
    fail(`Missing required path: ${targetPath}`);
  }
}

async function assertMissing(targetPath) {
  try {
    await stat(targetPath);
    fail(`Path should not exist in template: ${targetPath}`);
  } catch {
    // Missing is expected.
  }
}

function isTextPath(file) {
  return textExtensions.has(path.extname(file).toLowerCase());
}

function isIgnoredDirectory(targetPath) {
  const basename = path.basename(targetPath);
  if (ignoredDirectoryNames.has(basename)) {
    return true;
  }

  const segments = targetPath.split(path.sep);
  return (
    segments.length >= 2 &&
    segments[segments.length - 2] === "src-tauri" &&
    segments[segments.length - 1] === "target"
  );
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    fail(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
