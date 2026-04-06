# AGENTS.md

## Scope

This file applies to everything inside `src/`.

## Source Layout

- `Pages/`: screen-level UI, local components, and styles
- `Database/`: SQLite schema, database setup, and Supabase wiring
- `Repository/`: data access functions close to persistence concerns
- `Services/`: business logic and multi-step app flows
- `Contexts/`: React context and app-level state
- `Resources/`: shared UI components, theme, icons, and design primitives
- `Sync/`: sync-related flows
- `Utils/`: reusable helpers with minimal side effects

## Structure Rules

- Keep logic close to the feature that owns it before extracting shared abstractions.
- Prefer the existing layer boundaries over bypassing them with shortcut imports or direct database calls from screens.
- When moving or renaming files, update imports in the same change.
- Reuse `Resources` and existing services/repositories before creating parallel patterns.

## Related Guides

- See `src/Pages/AGENTS.md` for UI-specific guidance.
- See `src/Database/AGENTS.md` for schema and persistence guidance.
