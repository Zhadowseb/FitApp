# AGENTS.md

## Scope

This file applies to `src/Database` and all descendant folders.

## Database Rules

- Treat schema changes as compatibility work, not isolated text edits.
- When adding, renaming, or removing schema fields, trace reads and writes through `Repository`, `Services`, and affected screens.
- Prefer additive changes and safe defaults over destructive changes.
- Do not assume existing local SQLite data can be dropped or recreated without explicit approval.
- Keep table and column naming stable unless the task explicitly requires a rename.

## Migration Safety

- Check how existing rows will behave after a schema change, especially defaults and null handling.
- Update dependent insert, select, and update logic in the same task when schema behavior changes.
- If a database change is intended to ship to users, make sure version metadata and `CHANGELOG.md` are updated before release.
