# AGENTS.md

## Scope

This file applies to the whole repository.
Keep the root guide short and place domain-specific rules in closer `AGENTS.md` files.

## Project Snapshot

- `programapp` is an Expo / React Native application.
- Main application code lives in `src/`.
- Use `package.json` scripts as the source of truth for local commands.

## Global Working Rules

- Prefer small, focused changes over large refactors.
- Follow nearby patterns before introducing new abstractions.
- Avoid changing unrelated files in the same task.
- Never edit code directly on `master` or `main`.
- If the user asks for code changes while on `master` or `main`, stop first and propose a branch name before making changes.
- Review local changes before switching branches or rewriting Git history.

## Branch And Commit Discipline

- Treat a new feature, fix, refactor, or unrelated request as a new unit of work.
- Before starting a new unit of work, check whether the current branch and uncommitted changes belong to the previous task.
- If the user appears satisfied with the current work and then asks for something new, suggest committing the finished work before starting the next change.
- If the current branch name no longer matches the requested work, suggest creating a new branch before editing files.
- When suggesting a branch, propose a concrete branch name instead of asking an open-ended question.

## Versioning And Changelog

- After creating or switching to a work branch, use `npm run version:auto`.
- Use `npm run version:status` whenever you need to verify the current branch/version state.
- Prefer branch names like `feat/...`, `fix/...`, or `release/x.y.z`.
- Use `npm run release:prepare -- <version>` for stable releases.
- See `docs/VERSIONING.md` for the full workflow and branch rules.

## Local Guides

- `src/AGENTS.md`: source structure and layering
- `src/Pages/AGENTS.md`: UI and screen work
- `src/Database/AGENTS.md`: schema and data safety
