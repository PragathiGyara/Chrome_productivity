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

function getLocalDateKey() {

  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      now.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}