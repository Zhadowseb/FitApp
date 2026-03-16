# FitApp

FitApp is an Expo / React Native training app for planning and tracking workouts with a local SQLite database on the device.

The app started as a replacement for spreadsheet-based training programs and is currently centered around:
- Program planning with `Program -> Mesocycle -> Microcycle -> Day -> Workout`
- Strength training workouts with exercises, sets, reps, weight, notes, failed sets, and workout timer
- Running workouts with structured run sets, timer, and background location logging
- Program-specific "Program bests" and estimated 1RM tracking

---

## Table of Contents
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Notes](#notes)

---

## Tech Stack

- Framework: Expo + React Native
- Database: `expo-sqlite`

Main entry points:
- `App.js`: navigation, SQLite provider, background location task
- `src/Database/db.js`: database initialization

---

## Architecture

The app is structured in three layers around the local database:

- `src/Database`
  Contains schema definitions and database initialization only.
- `src/Repository`
  Contains raw SQL queries and persistence operations.
- `src/Services`
  Contains app-level workflows, calculations, transactions, and multi-step domain logic.

---

## Project Structure

```text
FitApp/
|-- App.js
|-- src/
|   |-- Database/
|   |   |-- db.js
|   |   `-- schema/
|   |       |-- location.js
|   |       |-- program.js
|   |       |-- running.js
|   |       `-- weightlifting.js
|   |-- Repository/
|   |   |-- index.js
|   |   |-- locationRepository.js
|   |   |-- programRepository.js
|   |   |-- runningRepository.js
|   |   |-- weightliftingRepository.js
|   |   `-- workoutRepository.js
|   |-- Services/
|   |   |-- index.js
|   |   |-- locationService.js
|   |   |-- programService.js
|   |   |-- runningService.js
|   |   |-- shared.js
|   |   |-- weightliftingService.js
|   |   `-- workoutService.js
|   |-- Pages/
|   |   |-- ExerciseStoragePage/
|   |   |-- HomePage/
|   |   |-- MicrocyclePage/
|   |   |-- ProgramOverviewPage/
|   |   |-- ProgramPage/
|   |   |-- SetPage/
|   |   |-- WeekPage/
|   |   `-- WorkoutPage/
|   |-- Resources/
|   `-- Utils/
`-- README.md
```

---

## Data Model

The schema is initialized in `src/Database/db.js`.

### Program hierarchy
- `Program`
- `Mesocycle`
- `Microcycle`
- `Day`
- `Workout`

### Strength training hierarchy
- `Exercise`
  Exercises attached to a workout
- `Sets`
  Set data such as set number, reps, weight, pause, RPE, note, done, and failed
- `Estimated_Set`
  Estimated working weights / estimated 1RM support per program and exercise
- `Exercise_storage`
  Stored exercise names for dropdowns and reuse
- `Program_Best_Exercise`
  Program-specific selection of which exercises should be shown in "Program bests"

### Running
- `Run`
  Structured run sets for a workout

### Location (development currently paused)
- `LocationLog`
  GPS points logged while an active workout is running

---

## Feature Notes

### Program Overview
- Shows mesocycles for the current program
- Shows "Program bests" for selected exercises
- Lets the user choose which exercises should be tracked in "Program bests"
- Shows estimated 1RM entries per program

### Program bests
- Exercise visibility is persisted per program in the database
- Best set values are calculated in `programService`
- Strength bests are based on completed sets only
- Multi-rep bests use the Brzycki formula to estimate 1RM

### Strength training
- Exercise list can hide or show completed exercises
- Set rows support marking a set as failed
- Workout timer state is persisted so the timer can recover after app restarts

### Running
- Supports warmup, working sets, cooldown, and pauses
- Tracks workout timer and location data while active

---

## Getting Started

### Requirements
- Node.js
- npm
- Android Studio and/or Xcode for local native builds

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run start
```

### Run on device / emulator

```bash
npm run android
npm run ios
```

---

## Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
```

---

## Notes

- The app currently uses a local SQLite database, not a remote backend, but will in the future as the app develops to the next stage.
- `WeekPage` still exists in the codebase, but the main flow from `MicrocyclePage` now navigates more directly into workouts. This means WeekPage currently isn't used, but will potentially be reintroduced at some point.
- Larger schema changes may require explicit migrations or a reset of local app data during development.
