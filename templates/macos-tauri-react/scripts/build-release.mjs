#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dryRun = process.argv.includes("--dry-run");
const cargoPackageName = "__RUST_CRATE_NAME__";
const appName = "__APP_NAME__";

const files = {
  packageJson: path.join(rootDir, "package.json"),
  packageLock: path.join(rootDir, "package-lock.json"),
  cargoToml: path.join(rootDir, "src-tauri", "Cargo.toml"),
  cargoLock: path.join(rootDir, "src-tauri", "Cargo.lock"),
  tauriConfig: path.join(rootDir, "src-tauri", "tauri.conf.json"),
  buildInfo: path.join(rootDir, "src", "shared", "buildInfo.ts"),
};

const releaseFiles = [
  "package.json",
  "package-lock.json",
  "src-tauri/Cargo.toml",
  "src-tauri/Cargo.lock",
  "src-tauri/tauri.conf.json",
  "src/shared/buildInfo.ts",
];

const packageJson = await readJson(files.packageJson);
const packageLock = await readJson(files.packageLock);
const tauriConfig = await readJson(files.tauriConfig);
const cargoToml = await readText(files.cargoToml);
const cargoLock = await readText(files.cargoLock);

const versions = {
  packageJson: packageJson.version,
  packageLock: packageLock.version,
  packageLockRoot: packageLock.packages?.[""]?.version,
  cargoToml: readCargoTomlVersion(cargoToml),
  cargoLock: readCargoLockPackageVersion(cargoLock, cargoPackageName),
  tauriConfig: tauriConfig.version,
};

assertSyncedVersions(versions);

const currentVersion = versions.packageJson;
const nextVersion = bumpPatchVersion(currentVersion);
const releaseDate = localDateString(new Date());

if (dryRun) {
  printDryRun(currentVersion, nextVersion, releaseDate);
  process.exit(0);
}

printDirtyStatus();
run("npm", ["run", "build"]);
run("npm", ["test"]);
run("cargo", ["test"], { cwd: path.join(rootDir, "src-tauri") });
run("cargo", ["fmt", "--check"], { cwd: path.join(rootDir, "src-tauri") });

await updateVersions(nextVersion, releaseDate);

try {
  await rm(path.join(rootDir, "src-tauri", "target", "release", "bundle", "dmg"), {
    force: true,
    recursive: true,
  });

  run("npx", ["tauri", "build", "--bundles", "app", "--ci"]);
} catch (error) {
  console.warn("App-only Tauri build failed; falling back to full npm run tauri:build.");
  console.warn(error instanceof Error ? error.message : String(error));
  run("npm", ["run", "tauri:build"]);
}

run("npm", ["run", "upgrade:local"]);

console.log("");
console.log(`${appName} local release complete.`);
console.log(`Version: ${currentVersion} -> ${nextVersion}`);
console.log(`Release date: ${formatDisplayDate(releaseDate)}`);
console.log(`Built app: src-tauri/target/release/bundle/macos/${appName}.app`);
console.log(`Updated local app: ${process.env.HOME}/Applications/${appName}.app`);
console.log(`Opened local app: ${process.env.HOME}/Applications/${appName}.app`);

async function updateVersions(version, buildDate) {
  packageJson.version = version;
  packageLock.version = version;
  packageLock.packages[""].version = version;
  tauriConfig.version = version;

  await writeJson(files.packageJson, packageJson);
  await writeJson(files.packageLock, packageLock);
  await writeJson(files.tauriConfig, tauriConfig);
  await writeFile(files.cargoToml, replaceCargoTomlVersion(cargoToml, version));
  await writeFile(
    files.cargoLock,
    replaceCargoLockPackageVersion(cargoLock, cargoPackageName, version),
  );
  await writeFile(files.buildInfo, buildInfoSource(version, buildDate));

  console.log(`Bumped ${appName} version to ${version}.`);
}

function run(command, args, options = {}) {
  console.log(`$ ${[command, ...args].join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? rootDir,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

function capture(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    encoding: "utf8",
  });

  if (result.error || result.status !== 0) {
    return "";
  }

  return result.stdout.trim();
}

function printDirtyStatus() {
  const status = capture("git", ["status", "--short"]);

  if (!status) {
    return;
  }

  console.log("Current git status before release:");
  console.log(status);
  console.log("");
}

function printDryRun(currentVersion, nextVersion, buildDate) {
  console.log(`${appName} local release dry run.`);
  console.log(`Current version: ${currentVersion}`);
  console.log(`Next version: ${nextVersion}`);
  console.log(`Release date: ${formatDisplayDate(buildDate)}`);
  console.log("");
  console.log("Files to update:");
  for (const file of releaseFiles) {
    console.log(`- ${file}`);
  }
  console.log("");
  console.log("Commands to run:");
  console.log("- npm run build");
  console.log("- npm test");
  console.log("- cd src-tauri && cargo test");
  console.log("- cd src-tauri && cargo fmt --check");
  console.log("- npx tauri build --bundles app --ci");
  console.log(`- npm run upgrade:local (quits running ${appName} before replacement, then opens it)`);
}

function assertSyncedVersions(versionMap) {
  const entries = Object.entries(versionMap);
  const [source, version] = entries[0];

  if (!isPatchVersion(version)) {
    throw new Error(`${source} has unsupported version "${version}". Expected x.y.z.`);
  }

  for (const [name, candidate] of entries.slice(1)) {
    if (candidate !== version) {
      throw new Error(
        `Version mismatch: ${source}=${version}, ${name}=${candidate}. Sync versions before releasing.`,
      );
    }
  }
}

function bumpPatchVersion(version) {
  if (!isPatchVersion(version)) {
    throw new Error(`Unsupported version "${version}". Expected x.y.z.`);
  }

  const [major, minor, patch] = version.split(".").map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

function isPatchVersion(version) {
  return typeof version === "string" && /^\d+\.\d+\.\d+$/.test(version);
}

function readCargoTomlVersion(source) {
  const match = source.match(/^version = "([^"]+)"$/m);
  if (!match) {
    throw new Error("Unable to read src-tauri/Cargo.toml package version.");
  }

  return match[1];
}

function replaceCargoTomlVersion(source, version) {
  return source.replace(/^version = "[^"]+"$/m, `version = "${version}"`);
}

function packageLockPattern(packageName) {
  return new RegExp(
    `(\\[\\[package\\]\\]\\nname = "${escapeRegExp(packageName)}"\\nversion = ")([^"]+)(")`,
  );
}

function readCargoLockPackageVersion(source, packageName) {
  const match = source.match(packageLockPattern(packageName));
  if (!match) {
    throw new Error(`Unable to read ${packageName} package version in src-tauri/Cargo.lock.`);
  }

  return match[2];
}

function replaceCargoLockPackageVersion(source, packageName, version) {
  return source.replace(packageLockPattern(packageName), `$1${version}$3`);
}

function buildInfoSource(version, buildDate) {
  return `import { formatDate } from "./lib/format";\n\nexport const BUILD_VERSION = "${version}";\nexport const BUILD_DATE = "${buildDate}";\nexport const BUILD_LABEL = \`Build v\${BUILD_VERSION} · \${formatDate(BUILD_DATE)}\`;\n`;
}

function localDateString(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDisplayDate(isoDate) {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return isoDate;
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function readJson(file) {
  return JSON.parse(await readText(file));
}

async function writeJson(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function readText(file) {
  return readFile(file, "utf8");
}
