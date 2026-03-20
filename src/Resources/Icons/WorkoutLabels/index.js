import Run from "./Run";
import StrengthTraining from "./StrengthTraining";

export const WORKOUT_ICONS = [
  {
    id: "Resistance",
    short: "Resist...",
    Icon: StrengthTraining,
    selectable: true,
  },
  {
    id: "Upperbody",
    short: "Resist...",
    Icon: StrengthTraining,
    selectable: false,
  },
  {
    id: "Legs",
    short: "Resist...",
    Icon: StrengthTraining,
    selectable: false,
  },
  {
    id: "StrengthTraining",
    short: "Resist...",
    Icon: StrengthTraining,
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
