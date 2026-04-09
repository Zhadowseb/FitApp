export function parseCustomDate(dateString) {
  const [day, month, year] = dateString.split(".").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

function isValidDateParts({ day, month, year }) {
  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year)
  ) {
    return false;
  }

  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function normalizeLocalDateString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  const localMatch = trimmedValue.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

  if (localMatch) {
    const [, day, month, year] = localMatch;
    const dateParts = {
      day: Number(day),
      month: Number(month),
      year: Number(year),
    };

    if (!isValidDateParts(dateParts)) {
      return null;
    }

    return `${day}.${month}.${year}`;
  }

  const isoMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!isoMatch) {
    return null;
  }

  const [, year, month, day] = isoMatch;
  const dateParts = {
    day: Number(day),
    month: Number(month),
    year: Number(year),
  };

  if (!isValidDateParts(dateParts)) {
    return null;
  }

  return `${day}.${month}.${year}`;
}

export function normalizeIsoDateString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  const isoMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const dateParts = {
      day: Number(day),
      month: Number(month),
      year: Number(year),
    };

    if (!isValidDateParts(dateParts)) {
      return null;
    }

    return `${year}-${month}-${day}`;
  }

  const localMatch = trimmedValue.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);

  if (!localMatch) {
    return null;
  }

  const [, day, month, year] = localMatch;
  const dateParts = {
    day: Number(day),
    month: Number(month),
    year: Number(year),
  };

  if (!isValidDateParts(dateParts)) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

export function getTodaysDate() {
  const today = new Date();
  return formatDate(today);
}

