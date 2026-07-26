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

function getLocalDateKey(
  date = new Date()
) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;

}

// =====================================================
// TIME FORMAT
// =====================================================

function formatHours(
  hours
) {

  const totalMinutes =
    Math.round(
      hours * 60
    );

  const wholeHours =
    Math.floor(
      totalMinutes / 60
    );

  const minutes =
    totalMinutes % 60;

  if (
    wholeHours === 0
  ) {

    return `${minutes}m`;

  }

  if (
    minutes === 0
  ) {

    return `${wholeHours}h`;

  }

  return `${wholeHours}h ${minutes}m`;

}

// =====================================================
// DATE FORMAT
// =====================================================

function formatDate(
  date
) {

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}

function getLocalTime(
  date = new Date()
) {

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour12: false
    }
  );

}

function getProjectCompletionDate(
  project
) {

  const completedEntry =
    project.statusHistory.find(
      entry =>
        entry.status ===
        "completed"
    );

  if (!completedEntry) {

    return null;

  }

  return parseLocalDate(
    completedEntry.date
  );

}