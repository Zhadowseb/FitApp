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

## Sync Rules

- Treat `Workout_Type_Instance` as the lowest-level cloud sync boundary for workout data.
- Changes to `Set`, `Exercise_Instance`, or other workout-child rows should update local state immediately, but should not trigger direct cloud writes on their own.
- Child-row changes should instead mark the owning `Workout_Type_Instance` as dirty so the full workout payload can be synced together later.
- Prefer syncing workout-child data when the owning `Workout_Type_Instance` is completed or when an explicit higher-level workout sync runs.

## Related Guides

- See `src/Pages/AGENTS.md` for UI-specific guidance.
- See `src/Database/AGENTS.md` for schema and persistence guidance.
