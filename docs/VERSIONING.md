# Versioning

## Goals

- Keep app versioning predictable across branches.
- Keep `package.json` and `app.json` aligned.
- Reserve build number increments for real releases.
- Keep `CHANGELOG.md` stable with an `Unreleased` section plus release entries.
- Make versioning mostly automatic from the active branch.

## Branch Rules

- `feat/...` or `feature/...`: next `minor` prerelease
- `fix/...`, `bugfix/...`, `hotfix/...`, `quickfix/...`: next `patch` prerelease
- `major/...` or `breaking/...`: next `major` prerelease
- `release/x.y.z`: exact stable release version

Examples:

- `feat/program-calendar` from stable `0.3.1` becomes `0.4.0-feat-program-calendar.1`
- `fix/set-counter` from stable `0.3.1` becomes `0.3.2-fix-set-counter.1`
- `release/0.4.0` becomes `0.4.0`

If a branch name does not match the convention, use:

```bash
npm run version:branch -- minor
```

## Commands

```bash
npm run version:status
npm run version:auto
npm run version:branch
npm run version:branch -- patch
npm run version:branch -- feat/example dry-run
npm run release:prepare -- 0.4.0 dry-run
npm run version:sync -- 0.4.0 skip-changelog
```

## What Each Command Updates

`npm run version:status`

- Shows current branch
- Shows `package.json` and `app.json` versions
- Tells whether versions are aligned
- Tells what command to run next

`npm run version:auto`

- Reads the current branch name
- Uses branch rules automatically
- Runs branch prerelease logic on `feat/...`, `fix/...`, and similar work branches
- Runs release logic on `release/x.y.z`
- Refuses to work on `master` and `main`

`npm run version:branch`

- Updates `package.json > version`
- Updates `app.json > expo.version`
- Ensures `CHANGELOG.md` contains `## [Unreleased]`
- Does not increment `android.versionCode`
- Does not increment `ios.buildNumber`

`npm run release:prepare -- <version>`

- Updates `package.json > version`
- Updates `app.json > expo.version`
- Increments `app.json > expo.android.versionCode`
- Sets `app.json > expo.ios.buildNumber` to the same incremented build number
- Creates or refreshes the release entry in `CHANGELOG.md`

## Recommended Workflow

1. Create a branch with a meaningful prefix like `feat/...`, `fix/...`, or `release/x.y.z`.
2. Run `npm run version:auto`.
3. Use `npm run version:status` whenever you want to verify the current state.
4. Do the work.
5. Replace the placeholder text in `CHANGELOG.md` before shipping.
6. For a stable release branch, run `npm run release:prepare -- x.y.z`.

## Codex Workflow

- If you ask for code changes while the repo is on `master` or `main`, Codex should first propose a branch name and wait before editing.
- When you move on to a new request after being satisfied with the previous one, Codex should suggest committing the finished work before starting the next task.
- When Codex creates or switches to a work branch, it should run `npm run version:auto` so you do not have to think about versioning manually.
