# Changelog

All changes to the project are logged here.



All changes to the project are logged here.



All changes to the project are logged here.



All changes to the project are logged here.

## [Unreleased]
### Changed
- Updated branch-driven versioning to support `major/...` and `minor/...` feature prefixes, where `minor/...` and `fix/...` both produce patch-level prerelease bumps.
- Renamed the local `Workout` table to `Workout_Type_Instance`, added a local `Workout_Type` table, and introduced a safe migration that preserves existing workout rows while backfilling `workout_type`.
- Aligned the local `Exercise` catalog with the cloud naming model, moved muscle-group counts to runtime calculation, and safely migrated `Exercise_Instance` to `exercise_instance_id` and `workout_type_instance_id` without breaking existing set relationships.
- Renamed the local `Sets` table to `Set` and safely migrated its `exercise_id` relation to `exercise_instance_id` without breaking existing set rows.
- Added the first `Program` cloud sync flow with local cloud-id tracking, dirty-state sync flags, remote delete queueing, and an app-level sync runner that uploads local program changes and pulls remote-only programs.
- Added the first `Mesocycle` cloud sync flow with local cloud-id tracking, dirty-state sync flags, remote delete queueing, and app-level sync triggers that depend on `Program` sync.
- Normalized `Program.start_date` between local SQLite `dd.MM.yyyy` strings and cloud PostgreSQL `date` values to avoid sync failures and mixed local date formats.
- Fixed `Mesocycle` cloud sync parent mapping so cloud writes use the canonical remote `Program.local_program_id` instead of the device-local SQLite `program_id`, which avoids Supabase RLS insert failures across devices.

---

## [0.4.1] - 2026-04-09
### Changed
- Removed `program_id` from the local `Microcycle` table and added a safe migration that rebuilds the table without changing existing `microcycle_id` relationships.

---

## [0.4.0] - 2026-04-07
### Added
- Branch-based versioning scripts for branch, sync, status, and release workflows.
### Changed
- `CHANGELOG.md` now keeps an `Unreleased` section ahead of versioned release entries.

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
