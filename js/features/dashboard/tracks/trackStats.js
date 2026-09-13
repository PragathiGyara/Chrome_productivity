// --------------------------
// Track Overview
// --------------------------

// --------------------------
// Track Overview
// --------------------------

// --------------------------
// Track Overview
// --------------------------

function computeTrackOverview(track) {

  const now = new Date();

  const projects =
    Array.isArray(track.projects)
      ? track.projects
      : [];

  const projectCount =
    projects.length;


  // =====================================================
  // COLLECT ITEMS FROM ALL PROJECTS
  // =====================================================

  const tasks =
    projects.flatMap(project =>
      Array.isArray(project.tasks)
        ? project.tasks
        : []
    );

  const reading =
    projects.flatMap(project =>
      Array.isArray(project.reading)
        ? project.reading
        : []
    );

  const deadlines =
    projects.flatMap(project =>
      Array.isArray(project.deadlines)
        ? project.deadlines
        : []
    );


  // =====================================================
  // TASK COUNTS
  // =====================================================

  const completedTasks =
    tasks.filter(
      task => task.finished
    ).length;

  const remainingTasks =
    tasks.length -
    completedTasks;


  // =====================================================
  // DEADLINE COUNTS
  // =====================================================

  const missedDeadlines =
    deadlines.filter(deadline =>
      new Date(deadline.datetime) < now &&
      deadline.status !== "finished"
    ).length;


  const upcomingDeadlines =
    deadlines.filter(deadline =>
      new Date(deadline.datetime) >= now &&
      deadline.status !== "finished"
    );


  // =====================================================
  // NEXT DEADLINE
  // =====================================================

  const sortedUpcoming =
    [...upcomingDeadlines].sort(
      (a, b) =>
        new Date(a.datetime) -
        new Date(b.datetime)
    );


  let nextDeadline = null;
  let nextDeadlineCount = 0;


  if (sortedUpcoming.length > 0) {

    nextDeadline =
      new Date(
        sortedUpcoming[0].datetime
      );


    nextDeadlineCount =
      sortedUpcoming.filter(deadline =>
        new Date(
          deadline.datetime
        ).getTime() ===
        nextDeadline.getTime()
      ).length;

  }


  // =====================================================
  // RETURN TRACK STATISTICS
  // =====================================================

  return {

    projectCount,

    completedTasks,

    remainingTasks,

    readingCount:
      reading.length,

    upcomingDeadlines:
      upcomingDeadlines.length,

    missedDeadlines,

    total:
      tasks.length +
      reading.length +
      deadlines.length,

    nextDeadline,

    nextDeadlineCount

  };

}

function formatDateTime(date) {

  const now = new Date();

  const isToday =
    date.toDateString() === now.toDateString();

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  const isTomorrow =
    date.toDateString() === tomorrow.toDateString();

  const timePart = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  if (isToday) {
    return `Today, ${timePart} (${getRelativeTime(date)})`;
  }

  if (isTomorrow) {
    return `Tomorrow, ${timePart}`;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getRelativeTime(date) {

  const diff = date - new Date();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (minutes < 60) {
    return `in ${minutes}m`;
  }

  return `in ${hours}h`;
}