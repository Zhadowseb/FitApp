import ArmMuscle from "./ArmMuscle";
import LegMuscle from "./LegMuscle";
import RunningShoes from "./RunningShoes";
import Rest from "./Rest";
import BoxingGlove from "./BoxingGlove";
import SkippingRope from "./SkippingRope";
import Treadmil from "./Treadmil";

export const WORKOUT_ICONS = [
  { id: "Upperbody",
    short: "Upper", 
    Icon: ArmMuscle },

  { id: "Legs", 
    short: "Legs",
    Icon: LegMuscle },

  { id: "Cardio", 
    short: "Cardio",
    Icon: RunningShoes },

  { id: "Rest",
    short: "Rest", 
    Icon: Rest },

  { id: "Boxing", 
    short: "Boxing",
    Icon: BoxingGlove },

  { id: "Skipping Rope",
    short: "Skipping", 
    Icon: SkippingRope},

  { id: "Treadmil", 
    short: "Treadmil",
    Icon: Treadmil},
];
