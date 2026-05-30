---
name: __APP_SLUG__-build-and-release
description: Use for __APP_NAME__ local release, build, update, install, or patch-version bump requests. Runs tests, bumps the patch version, builds the macOS .app bundle, and upgrades the local __APP_NAME__ app.
---

# __APP_NAME__ Build And Release

Run from the __APP_NAME__ project root:

```bash
npm run release:local
```

The release script runs checks first, then bumps the patch version, builds the `.app` bundle, quits a running __APP_NAME__ app if needed, upgrades `/Users/shane/Applications/__APP_NAME__.app`, and reopens it.

If a sandbox or local permission error blocks the release, do not retry with escalated permissions. Report the exact command the user should run manually outside Codex.

Do not run `git merge` or `git rebase`.
