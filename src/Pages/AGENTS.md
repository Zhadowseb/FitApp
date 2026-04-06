# AGENTS.md

## Scope

This file applies to `src/Pages` and all descendant folders.

## UI Guidance

- Inspect the page component, its style file, and its local components together before editing.
- Reuse themed components and shared design tokens from `src/Resources` before adding new primitives.
- Keep page-specific components inside the relevant page folder unless they are reused across multiple screens.
- Preserve the established navigation, naming, and spacing patterns near the touched screen.
- Make mobile-first changes and avoid layouts that depend on one exact device width.

## Behavior Guidance

- Keep data loading and mutations in services or repositories when that pattern already exists.
- For user-facing flows, account for loading, empty, and error states when behavior changes.
- When editing a nested screen tree, check the immediate parent and child components for side effects before finishing.
