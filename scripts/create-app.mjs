#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { cp, mkdir, readdir, readFile, rm, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templateDir = path.join(rootDir, "templates", "macos-tauri-react");
const binaryExtensions = new Set([
  ".icns",
  ".ico",
  ".jpg",
  ".jpeg",
  ".pdf",
  ".png",
  ".webp",
]);

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const required = ["app-name", "app-slug", "package-name", "bundle-id", "dest"];
for (const name of required) {
  if (!options[name]) {
    fail(`Missing required --${name}.`);
  }
}

const appName = options["app-name"];
const appSlug = options["app-slug"];
const packageName = options["package-name"];
const bundleId = options["bundle-id"];
const destDir = path.resolve(options.dest);
const appDevName = options["app-dev-name"] ?? `${appName} Dev`;
const devBundleId = options["dev-bundle-id"] ?? `${bundleId}.dev`;
const rustCrateName = options["rust-crate-name"] ?? slugToSnakeCase(appSlug);
const rustLibName = options["rust-lib-name"] ?? `${rustCrateName}_lib`;
const installEnvPrefix = options["install-env-prefix"] ?? slugToUpperSnakeCase(appSlug);
const themePrefix = options["theme-prefix"] ?? appSlug;
const githubRepo = options["github-repo"] ?? "";

validateSlug(appSlug);
validateRustIdentifier(rustCrateName, "Rust crate name");
validateRustIdentifier(rustLibName, "Rust lib name");
validateBundleId(bundleId);
validateBundleId(devBundleId);

await prepareDestination(destDir, Boolean(options.force));
await cp(templateDir, destDir, {
  recursive: true,
  filter: (source) => !source.includes(`${path.sep}node_modules${path.sep}`),
});

const replacements = new Map([
  ["__APP_NAME__", appName],
  ["__APP_DEV_NAME__", appDevName],
  ["__APP_SLUG__", appSlug],
  ["__PACKAGE_NAME__", packageName],
  ["__RUST_CRATE_NAME__", rustCrateName],
  ["__RUST_LIB_NAME__", rustLibName],
  ["__BUNDLE_ID__", bundleId],
  ["__DEV_BUNDLE_ID__", devBundleId],
  ["__INSTALL_ENV_PREFIX__", installEnvPrefix],
  ["__THEME_PREFIX__", themePrefix],
  ["__GITHUB_REPO__", githubRepo],
]);

await replaceTokensInFiles(destDir, replacements);
await replaceTokensInPaths(destDir, replacements);

const remainingTokens = await findRemainingTokens(destDir);
if (remainingTokens.length > 0) {
  fail(`Generated app still contains template tokens:\n${remainingTokens.join("\n")}`);
}

if (options.install) {
  run("npm", ["install"], { cwd: destDir });
}

console.log(`Created ${appName} at ${destDir}`);

function parseArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      fail(`Unexpected argument: ${arg}`);
    }

    const key = arg.slice(2);
    if (key === "help" || key === "install" || key === "force") {
      parsed[key] = true;
      continue;
    }

    const value = args[index + 1];
    if (!value || value.startsWith("--")) {
      fail(`Missing value for --${key}.`);
    }

    parsed[key] = value;
    index += 1;
  }

  return parsed;
}

function printHelp() {
  console.log(`Usage:
node scripts/create-app.mjs \\
  --app-name "Sample Utility" \\
  --app-slug sample-utility \\
  --package-name sample-utility \\
  --bundle-id com.example.sampleutility \\
  --dest /path/to/SampleUtility [--install] [--force]`);
}

async function prepareDestination(dest, force) {
  const exists = await pathExists(dest);
  if (!exists) {
    await mkdir(dest, { recursive: true });
    return;
  }

  const entries = await readdir(dest);
  if (entries.length === 0) {
    return;
  }

  if (!force) {
    fail(`Destination is not empty: ${dest}. Use --force to overwrite it.`);
  }

  await rm(dest, { recursive: true, force: true });
  await mkdir(dest, { recursive: true });
}

async function replaceTokensInFiles(dir, replacements) {
  for (const file of await listFiles(dir)) {
    if (isBinaryPath(file)) {
      continue;
    }

    const source = await readFile(file, "utf8");
    const next = replaceTokens(source, replacements);
    if (next !== source) {
      await writeFile(file, next);
    }
  }
}

async function replaceTokensInPaths(dir, replacements) {
  const paths = await listPaths(dir);
  paths.sort((a, b) => b.length - a.length);

  for (const currentPath of paths) {
    const parent = path.dirname(currentPath);
    const basename = path.basename(currentPath);
    const nextBasename = replaceTokens(basename, replacements);

    if (nextBasename !== basename) {
      await rename(currentPath, path.join(parent, nextBasename));
    }
  }
}

function replaceTokens(source, replacements) {
  let next = source;
  for (const [token, value] of replacements) {
    next = next.split(token).join(value);
  }

  return next;
}

async function findRemainingTokens(dir) {
  const matches = [];
  const tokenPattern = /__[A-Z0-9_]+__/;

  for (const targetPath of await listPaths(dir)) {
    if (tokenPattern.test(path.relative(dir, targetPath))) {
      matches.push(path.relative(dir, targetPath));
    }
  }

  for (const file of await listFiles(dir)) {
    if (isBinaryPath(file)) {
      continue;
    }

    const source = await readFile(file, "utf8");
    if (tokenPattern.test(source)) {
      matches.push(path.relative(dir, file));
    }
  }

  return matches;
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
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
    paths.push(fullPath);
    if (entry.isDirectory()) {
      paths.push(...await listPaths(fullPath));
    }
  }

  return paths;
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

function isBinaryPath(file) {
  return binaryExtensions.has(path.extname(file).toLowerCase());
}

function slugToSnakeCase(slug) {
  return slug.replace(/-/g, "_");
}

function slugToUpperSnakeCase(slug) {
  return slugToSnakeCase(slug).toUpperCase();
}

function validateSlug(slug) {
  if (!/^[a-z][a-z0-9-]*$/.test(slug)) {
    fail("--app-slug must start with a lowercase letter and contain only lowercase letters, digits, and hyphens.");
  }
}

function validateRustIdentifier(value, label) {
  if (!/^[a-z_][a-z0-9_]*$/.test(value)) {
    fail(`${label} must be a valid snake_case Rust identifier.`);
  }
}

function validateBundleId(value) {
  if (!/^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/.test(value)) {
    fail(`Invalid bundle identifier: ${value}`);
  }
}

function run(command, args, options) {
  console.log(`$ ${[command, ...args].join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: options.cwd,
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
