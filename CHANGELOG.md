# Changelog

## [0.5.7] - Unreleased
### Added
- Added the first `Day` cloud sync flow with local cloud-id tracking, dirty-state sync flags, and an app-level sync runner that depends on `Microcycle` sync.
### Changed
- `Day` sync reconciles cloud rows before uploading local dirty rows, so locally generated placeholder days from downloaded microcycles can attach to existing cloud days instead of creating duplicates.
- Workout completion updates now mark the owning local `Day` row as dirty, so `done` can be synced later without making direct child-row cloud writes from `Set` or `Exercise_Instance`.

---
## [0.5.6] - Unreleased
### Added
- Added the first `Microcycle` cloud sync flow with local cloud-id tracking, dirty-state sync flags, remote delete queueing, and app-level sync triggers that depend on `Program` and `Mesocycle` sync.
### Changed
- Rebuilds missing local `Day` rows for cloud-downloaded microcycles so remote weeks remain usable locally until `Day` itself gets a dedicated sync layer.
- Aligned local `Program` and `Mesocycle` sync with the new cloud `Mesocycle.cloud_program_id -> Program.id` relationship while keeping local sync-key mappings so stale cloud ids can still be repaired safely.
- Aligned `Microcycle` cloud sync with the new `Microcycle.cloud_mesocycle_id -> Mesocycle.id` relationship, so parent references now use the real cloud mesocycle id instead of the old cloud-local key.
- Keeps local `remote_local_program_id` and `remote_local_mesocycle_id` as sync identities, while cloud relations now use real parent cloud ids.
- Added a one-time local repair that clears stale cached `cloud_program_id`, `cloud_mesocycle_id`, and `cloud_microcycle_id` values and marks the hierarchy dirty so sync can rebuild those ids safely after the cloud FK changes.
- Hardened mesocycle and microcycle uploads so they re-resolve parent cloud ids by sync key before writing children, which prevents stale cached parent ids from causing cloud FK failures.

---
## [0.5.5] - Unreleased
### Changed
- Switched the changelog workflow from a single global `Unreleased` bucket to versioned sections like `## [0.5.x] - Unreleased`, so pending releases are visible per version and `release:prepare` can convert the same section into a dated release entry.
### Added
- Added `npm run release:android -- <version>`, which prepares a stable release version and starts an Android EAS production build using the current EAS login or `EXPO_TOKEN`, with optional `--prebuild` support.

---

## [0.5.4] - Unreleased
### Changed
- Hardened program cloud deletes so a local program deletion only clears the local delete queue after the remote row is actually gone, and explicit program deletes now attempt cloud sync immediately while keeping failed deletes queued for retry.

---

## [0.5.3] - Unreleased
### Changed
- Scoped local SQLite storage to one database file per authenticated user, so logging into another profile no longer exposes the previous user's local programs on the device.

---

## [0.5.2] - Unreleased
### Added
- Added the first `Mesocycle` cloud sync flow with local cloud-id tracking, dirty-state sync flags, remote delete queueing, and app-level sync triggers that depend on `Program` sync.
### Changed
- Fixed `Mesocycle` cloud sync parent mapping so cloud writes use the canonical parent program identity instead of the device-local SQLite `program_id`, which avoids Supabase relationship failures across devices.

---

## [0.5.1] - Unreleased
### Changed
- Updated branch-driven versioning to support `major/...` and `minor/...` feature prefixes, where `minor/...` and `fix/...` both produce patch-level prerelease bumps.

---

## [0.5.0] - Unreleased
### Added
- Added the first `Program` cloud sync flow with local cloud-id tracking, dirty-state sync flags, remote delete queueing, and an app-level sync runner that uploads local program changes and pulls remote-only programs.
### Changed
- Normalized `Program.start_date` between local SQLite `dd.MM.yyyy` strings and cloud PostgreSQL `date` values to avoid sync failures and mixed local date formats.

---

## [0.4.2] - 2026-04-09
### Changed
- Renamed the local `Workout` table to `Workout_Type_Instance`, added a local `Workout_Type` table, and introduced a safe migration that preserves existing workout rows while backfilling `workout_type`.
- Aligned the local `Exercise` catalog with the cloud naming model, moved muscle-group counts to runtime calculation, and safely migrated `Exercise_Instance` to `exercise_instance_id` and `workout_type_instance_id` without breaking existing set relationships.
- Renamed the local `Sets` table to `Set` and safely migrated its `exercise_id` relation to `exercise_instance_id` without breaking existing set rows.

---

## [0.4.1] - 2026-04-09
### Changed
- Removed `program_id` from the local `Microcycle` table and added a safe migration that rebuilds the table without changing existing `microcycle_id` relationships.

---

## [0.4.0] - 2026-04-07
### Added
- Branch-based versioning scripts for branch, sync, status, and release workflows.
### Changed
- `CHANGELOG.md` now keeps versioned release entries in git history.

---

## [0.3.0] - 2026-03-25
### Added
- Login page

## [0.2.2.2] - 2026-03-25
### Fix
- Potential fix for location tracking again.
### Added
- Moving timer "restart" button to bottomsheet.
- "finish" timer button now sets workout as done.

---

## [0.2.2.1] - 2026-03-25
### Fix
- Fix bug that corrupted loading of all SQLite info.

---

## [0.2.2] - 2026-03-25
### Added
- Location tracking feature

## [0.2.1] - 2026-03-25
### Added
- Version 0.2 type styling for "Run" type workout.

---

## [0.2.0] - 2026-03-22
### Changed
- Full UI redesign (AI-assisted)

---

## [0.1.0] - 2026-03-XX
### Added
- Initial version
