export const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const paddedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  if (hours > 0) {
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
};

export const formatWorkoutStart = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);

  const pad = (num) => String(num).padStart(2, "0");

  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1); // måneder starter fra 0
  const year = date.getFullYear();

  return `${hours}:${minutes} - ${day}-${month}-${year}`;
};