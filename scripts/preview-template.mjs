#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const previewDir = path.join(rootDir, "tmp", "template-preview");
const nextDir = path.join(rootDir, "tmp", "template-preview-next");
const metaFileName = ".preview-template-cache.json";

const allowedArgs = new Set(["--prepare-only", "--skip-install"]);
const args = new Set(process.argv.slice(2));
for (const arg of args) {
  if (!allowedArgs.has(arg)) {
    fail(`Unknown argument: ${arg}`);
  }
}

const prepareOnly = args.has("--prepare-only");
const skipInstall = args.has("--skip-install");
const previousMeta = await readJson(path.join(previewDir, metaFileName));

await rm(nextDir, { recursive: true, force: true });
run("node", [
  "scripts/create-app.mjs",
  "--app-name",
  "Template Preview",
  "--app-slug",
  "template-preview",
  "--package-name",
  "template-preview",
  "--bundle-id",
  "com.shaneperera.templatepreview",
  "--dest",
  nextDir,
  "--force",
]);

const preserved = [];
if (await moveIfExists(path.join(previewDir, "node_modules"), path.join(nextDir, "node_modules"))) {
  preserved.push("node_modules");
}

if (
  await moveIfExists(
    path.join(previewDir, "src-tauri", "target"),
    path.join(nextDir, "src-tauri", "target"),
  )
) {
  preserved.push("src-tauri/target");
}

const dependencyFingerprint = await hashFiles(nextDir, [
  "package.json",
  "package-lock.json",
]);
const hasNodeModules = await pathExists(path.join(nextDir, "node_modules"));
const dependenciesChanged = previousMeta?.dependencyFingerprint !== dependencyFingerprint;

if (!hasNodeModules && skipInstall) {
  fail("Cannot skip install because tmp/template-preview/node_modules does not exist.");
}

if (!skipInstall && (!hasNodeModules || dependenciesChanged)) {
  run("npm", ["install", "--prefer-offline", "--no-audit", "--no-fund"], {
    cwd: nextDir,
  });
} else {
  console.log("Reusing existing node_modules.");
}

await writeJson(path.join(nextDir, metaFileName), {
  dependencyFingerprint,
  preserved,
  updatedAt: new Date().toISOString(),
});

await rm(previewDir, { recursive: true, force: true });
await mkdir(path.dirname(previewDir), { recursive: true });
await rename(nextDir, previewDir);

console.log(`Prepared template preview at ${path.relative(rootDir, previewDir)}.`);

if (!prepareOnly) {
  run("npm", ["run", "tauri:dev"], { cwd: previewDir });
}

async function moveIfExists(from, to) {
  if (!await pathExists(from)) {
    return false;
  }

  await rm(to, { recursive: true, force: true });
  await mkdir(path.dirname(to), { recursive: true });
  await rename(from, to);
  return true;
}

async function hashFiles(dir, relativeFiles) {
  const hash = createHash("sha256");

  for (const relativeFile of relativeFiles) {
    hash.update(relativeFile);
    hash.update(await readFile(path.join(dir, relativeFile)));
  }

  return hash.digest("hex");
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch {
    return null;
  }
}

async function writeJson(file, data) {
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

function run(command, commandArgs, options = {}) {
  console.log(`$ ${[command, ...commandArgs].join(" ")}`);
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd ?? rootDir,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    fail(`${command} ${commandArgs.join(" ")} failed with exit code ${result.status}`);
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
