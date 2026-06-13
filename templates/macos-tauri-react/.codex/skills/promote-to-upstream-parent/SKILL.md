---
name: promote-to-upstream-parent
description: "Promote reusable changes from a derived project into its upstream parent repository. Use only when the user explicitly invokes $promote-to-upstream-parent or asks to use this skill; do not trigger implicitly from ordinary upstream or parent mentions."
---

# Promote to Upstream Parent

## Purpose

Promote reusable fixes, features, tests, docs, or tooling from the current derived project into its upstream parent repository.

Use this skill only after an explicit invocation. If the prompt does not clearly identify the change to promote or the parent repository, infer it from local project guidance only when it is unambiguous. Otherwise, ask the user for the missing detail.

## Upstream Parent Path

- The upstream parent project is located at: `~/www/my_projects_code/TauriStarterKit`
- The parent repo's main branch is `master`.

## Promotion Check

Before editing the parent, decide whether the change belongs upstream.

1. Read the current repo and parent repo guidance files that are relevant to the touched area, such as `AGENTS.md`, `README.md`, docs, package metadata, or local skill instructions.
2. Inspect the source change and the matching parent files. Prefer `git diff`, `rg`, and direct file reads over guessing.
3. When considering the change, plan how to apply the change, so it fits the parent repo's structure, naming, and placeholders. If it's going to cause a major refactor of parent, ask user confirmation before editing.
4. If the change is not clearly generic, or requires a large refactor, pause and ask the user to confirm. State the specific reason it may not belong upstream.

## Parent Mapping

Choose the parent source of truth deliberately.

- Follow the parent repo's existing organization. Update the canonical implementation first, then update generated, copied, or template files only when the parent already keeps those copies in sync.
- Prefer the smallest equivalent parent change over copying files wholesale from the derived project.
- Preserve parent placeholders, naming conventions, public APIs, and generated-file boundaries.
- When promoting project-local skills or agent instructions, keep descriptions short, generic, and free of derived-project paths or names.

Never copy derived-project identifiers directly upstream. Replace app names, package names, bundle IDs, routes, local paths, and copy with parent placeholders or generic wording.

## Workflow

1. Plan the change first, and which files to be applied in the parent's structure.
2. Check parent repos' guidance and classify the change as suitable to apply.
3. Add or update parent tests when the promoted behavior is testable.
4. Run the narrowest useful validation from the parent repo, using its existing scripts and documented workflow.
5. Report what was promoted, what was intentionally not promoted, and any validation that could not run.

Do not commit, merge, rebase, or release unless the user explicitly asks.
