// =====================================================
// DEADLINE HELPERS
// =====================================================

function getDeadlineStatus(deadline) {

  if (deadline.status === "cancelled") {
    return "cancelled";
  }

  if (deadline.status === "finished") {
    return "finished";
  }

  const now = new Date();

  const dueDate =
    new Date(deadline.datetime);

  return dueDate < now
    ? "missed"
    : "upcoming";
}


/* =====================================================
   SORT DEADLINES
===================================================== */

function sortDeadlines(deadlines) {

  return [...deadlines].sort((a, b) => {

    return (
      new Date(a.datetime) -
      new Date(b.datetime)
    );

  });
}


/* =====================================================
   UPCOMING DEADLINES
===================================================== */

function getUpcomingDeadlines(
  deadlines
) {

  return deadlines.filter(deadline => {

    return (
      getDeadlineStatus(deadline)
      === "upcoming"
    );

  });
}


/* =====================================================
   MISSED DEADLINES
===================================================== */

function getMissedDeadlines(
  deadlines
) {

  return deadlines.filter(deadline => {

    return (
      getDeadlineStatus(deadline)
      === "missed"
    );

  });
}


/* =====================================================
   FINISHED DEADLINES
===================================================== */

function getFinishedDeadlines(
  deadlines
) {

  return deadlines.filter(deadline => {

    return (
      getDeadlineStatus(deadline)
      === "finished"
    );

  });
}


/* =====================================================
   FORMAT DEADLINE DATE
===================================================== */

function formatDeadlineDate(
  datetime
) {

  const date =
    new Date(datetime);

  return date.toLocaleString([], {

    month: "short",

    day: "numeric",

    hour: "2-digit",

    minute: "2-digit"

  });
}