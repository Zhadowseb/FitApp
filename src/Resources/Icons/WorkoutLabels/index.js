import Run from "./Run";
import Dumbbell from "./Dumbbell";

export const WORKOUT_ICONS = [
  {
    id: "Resistance",
    short: "Resist...",
    Icon: Dumbbell,
    selectable: true,
  },
  {
    id: "Upperbody",
    short: "Resist...",
    Icon: Dumbbell,
    selectable: false,
  },
  {
    id: "Legs",
    short: "Resist...",
    Icon: Dumbbell,
    selectable: false,
  },
  {
    id: "StrengthTraining",
    short: "Resist...",
    Icon: Dumbbell,
    selectable: false,
  },

  { id: "Run",
    short: "Run",
    Icon: Run,
    selectable: true,
  },
];

export const SELECTABLE_WORKOUT_ICONS = WORKOUT_ICONS.filter(
  (workoutIcon) => workoutIcon.selectable !== false
);

export function getWorkoutIconConfig(label) {
  return WORKOUT_ICONS.find((workoutIcon) => workoutIcon.id === label) ?? null;
}
