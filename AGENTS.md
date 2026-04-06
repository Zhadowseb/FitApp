# AGENTS.md

## Project Overview

This repository contains `programapp`, an Expo / React Native application.
The codebase includes UI screens, workout/program logic, and local database schema definitions under `src`.

## Main Technologies

- Expo
- React Native
- React
- Expo SQLite
- Supabase

## Repository Structure

- `App.js`: app entry setup
- `index.js`: runtime entry point
- `src/`: main application code
- `src/Database/`: schema and database-related logic
- `assets/`: static assets
- `android/`: native Android project files

## Common Commands

- `npm run start`: start Expo dev client
- `npm run start:go`: start Expo Go
- `npm run android`: run Android build locally
- `npm run ios`: run iOS build locally
- `npm run web`: run the web target
- `npm run changelog`: update `CHANGELOG.md`

## Working Agreements

- Prefer small, focused changes over large refactors.
- Preserve existing project structure unless a task explicitly requires restructuring.
- Avoid changing unrelated files in the same task.
- When editing database schema or app flows, check for dependent code in `src` before changing names or behavior.

## Code Style Notes

- Follow the existing style in nearby files before introducing new patterns.
- Keep components and helpers easy to scan and consistent with the surrounding code.
- Add comments only when a block is not self-explanatory.
- Reuse existing utilities and patterns where possible.

## Git Guidance

- Work from the branch that matches the task when possible.
- Do not delete or rewrite existing branches unless explicitly requested.
- Review local changes before switching branches to avoid conflicts.

## Notes For Future Agents

- Start by checking `package.json` scripts and the relevant feature folder inside `src`.
- For UI changes, inspect the screen/component tree before editing.
- For database-related changes, verify schema usage across inserts, reads, and update flows.
