// =====================================================
// DATE UTILITIES
// =====================================================

function getTodayKey() {

  return getDateKey(
    new Date()
  );
}

function getDateKey(date) {

  return date
    .toISOString()
    .split("T")[0];
}

function parseLocalDate(dateString) {

  const [year, month, day] =
    dateString
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}