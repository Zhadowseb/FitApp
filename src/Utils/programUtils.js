import { formatDate, parseCustomDate } from "./dateUtils";

export function getProgramEndDate (startDate, dayCount) {
  if (!startDate) {
    return "";
  }

  const endDate = parseCustomDate(startDate);
  endDate.setDate(endDate.getDate() + dayCount);
  return formatDate(endDate);
};

export function getAverageSessionsPerWeek (workoutCount, weekCount) {
  if (!weekCount) {
    return "0.0";
  }

  return (workoutCount / weekCount).toFixed(1);
};