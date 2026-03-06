# FitApp

A React Native / Expo app for planning and tracking training with a local SQLite database.

The project started as a replacement for Google Sheets workout programs, and now supports:
- **Strength training** (exercises, sets, reps, weight, notes) - still in development
- **Running** (warmup/working/cooldown sets, timer, and location logging) - still in development
- **Program structure** (Program → Mesocycle → Microcycle → Week/Day → Workout)

---

## Table of Contents
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data and Domain Model](#data-and-domain-model)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Roadmap Ideas](#roadmap-ideas)

---

## Tech Stack

- **Framework:** Expo + React Native
- **Navigation:** `@react-navigation/native` + native stack
- **Database:** `expo-sqlite` (local SQLite on device)
- **Background tasks:** `expo-task-manager`
- **Location:** `expo-location`
- **Theming/UI:** custom themed components under `src/Resources/ThemedComponents`

Main entry points:
- `App.js` (navigation, DB provider, background location task)
- `src/Database/db.js` (database initialization + schema)

---

## Project Structure

```text
FitApp/
├── App.js
├── src/
│   ├── Database/
│   │   └── db.js
│   ├── Pages/
│   │   ├── HomePage/
│   │   ├── ProgramPage/
│   │   ├── ProgramOverviewPage/
│   │   ├── MesocyclePage/
│   │   ├── MicrocyclePage/
│   │   ├── WeekPage/
│   │   ├── WorkoutPage/
│   │   │   └── WorkoutTypes/
│   │   │       ├── StrengthTraining/
│   │   │       └── Run/
│   │   ├── SetPage/
│   │   └── ExerciseStoragePage/
│   ├── Resources/
│   │   ├── ThemedComponents/
│   │   ├── Icons/
│   │   └── GlobalStyling/
│   └── Utils/
│       └── timeUtils.js
└── README.md
```

---

## Data and Domain Model

The database is created in `initializeDatabase()` in `src/Database/db.js`.

### Program hierarchy
- `Program`
- `Mesocycle`
- `Microcycle`
- `Day`
- `Workout`

### Strength training
- `Exercise` (exercises per workout)
- `Sets` (set data: reps, weight, RPE, rest, note, failed/done)
- `Estimated_Set` (estimated working weights per program/exercise)
- `Exercise_storage` (predefined + user-defined exercise names)

### Running
- `Run` (sets for run workouts)
  - types: `WARMUP`, `WORKING_SET`, `COOLDOWN`
  - fields for e.g. `distance`, `pace`, `time`, `heartrate`, `is_pause`

### Location
- `LocationLog` stores GPS points for active workouts.

---

## Getting Started

### 1) Requirements
- Node.js (LTS recommended)
- npm
- Expo CLI via `npx` (no global install required)
- Android Studio/Xcode if you want to run native builds locally

### 2) Install dependencies
```bash
npm install
```

### 3) Start development server
```bash
npm run start
```

Then you can run with:
- Expo Go
- Emulator/simulator
- Web preview

---

## Scripts

From `package.json`:

```bash
npm run start    # expo start
npm run android  # expo run:android
npm run ios      # expo run:ios
npm run web      # expo start --web
```

### DB migration / schema issues
The project mainly uses “create if not exists” at startup.
For bigger schema changes, you may need to reset local app data or add explicit migrations.

---

## Roadmap Ideas
