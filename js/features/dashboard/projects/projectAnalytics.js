// =====================================================
// PROJECT ANALYTICS
//
// Responsibilities:
// - Analytics range selection
// - Date range calculations
// - Analytics card rendering
//
// Does NOT:
// - Modify project state
// - Render tracker rows
// - Manage project modal
// =====================================================


// =====================================================
// ANALYTICS STATE
// =====================================================

let currentAnalyticsRange =
  "thisWeek";

let currentAnalyticsView =
  "overview";


// =====================================================
// DATE RANGE
// =====================================================

function getAnalyticsDateRange() {

  const today =
    new Date();

  let startDate = null;

  let endDate =
    new Date();

  switch (
    currentAnalyticsRange
  ) {

    // =====================================
    // THIS WEEK
    // Sunday → Today
    // =====================================

    case "thisWeek":

      startDate =
        new Date(today);

      startDate.setDate(
        today.getDate() -
        today.getDay()
      );

      break;

    // =====================================
    // PREVIOUS WEEK
    // Sunday → Saturday
    // =====================================

    case "previousWeek":

      const currentSunday =
        new Date(today);

      currentSunday.setDate(
        today.getDate() -
        today.getDay()
      );

      endDate =
        new Date(currentSunday);

      endDate.setDate(
        currentSunday.getDate() - 1
      );

      startDate =
        new Date(endDate);

      startDate.setDate(
        endDate.getDate() - 6
      );

      break;

    // =====================================
    // THIS MONTH
    // =====================================

    case "thisMonth":

      startDate =
        new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );

      break;

    // =====================================
    // OVERALL
    // Earliest project → Today
    // =====================================

    case "overall":

      if (
        projects.length > 0
      ) {

        const earliestProject =
          projects.reduce(

            (
              earliest,
              project
            ) =>

              project.createdAt <
              earliest.createdAt

                ? project
                : earliest

          );

        startDate =
          new Date(
            earliestProject.createdAt
          );

      }

      else {

        startDate =
          new Date(today);

      }

      endDate =
        new Date(today);

      break;

  }

  // =====================================
  // NORMALIZE RANGE TO WHOLE DAYS
  // =====================================

  startDate.setHours(
    0, 0, 0, 0
  );

  endDate.setHours(
    23, 59, 59, 999
  );

  return {
    startDate,
    endDate
  };

}

// =====================================================
// EXPECTED DAYS
// =====================================================

function getExpectedDaysForRange(
  project
) {

  const {
    startDate,
    endDate
  } =
    getAnalyticsDateRange();

  // =====================================
  // OVERALL
  // =====================================

  if (
    !startDate &&
    !endDate
  ) {

    const createdDate =
      new Date(
        project.createdAt
      );

    const today =
      new Date();

    const diffDays =
      Math.floor(
        (
          today -
          createdDate
        ) /
        (
          1000 *
          60 *
          60 *
          24
        )
      ) + 1;

    return Math.max(
      diffDays,
      1
    );

  }

  // =====================================
  // RANGE BASED
  // =====================================

  const createdDate =
    new Date(
      project.createdAt
    );

  // Normalize time

  createdDate.setHours(
    0, 0, 0, 0
  );

  const rangeStart =
    new Date(startDate);

  rangeStart.setHours(
    0, 0, 0, 0
  );

  const rangeEnd =
    new Date(endDate);

  rangeEnd.setHours(
    0, 0, 0, 0
  );

  // =====================================
  // PROJECT DID NOT EXIST
  // DURING THIS RANGE
  // =====================================

  if (
    createdDate > rangeEnd
  ) {

    return 0;

  }

  // =====================================
  // EFFECTIVE START
  // =====================================

  const effectiveStart =

    createdDate > rangeStart

      ? createdDate

      : rangeStart;

  const diffDays =
    Math.floor(
      (
        rangeEnd -
        effectiveStart
      ) /
      (
        1000 *
        60 *
        60 *
        24
      )
    ) + 1;

  return Math.max(
    diffDays,
    0
  );

}


// =====================================================
// ANALYTICS CALCULATION
// =====================================================

function calculateProjectAnalytics(
  project
) {

  const {
    startDate,
    endDate
  } =
    getAnalyticsDateRange();

  let actualHours = 0;

  Object.entries(
    project.logs || {}
  ).forEach(
    ([date, hours]) => {

      const logDate =
        parseLocalDate(date);

      const inRange =

        // Overall

        (
          !startDate &&
          !endDate
        )

        ||

        // Date Range

        (
          logDate >= startDate &&
          logDate <= endDate
        );

      if (inRange) {

        actualHours +=
          hours;
      }

    }
  );

  const expectedDays =
    getExpectedDaysForRange(
      project
    );

  const expectedHours =
    project.targetHoursPerDay *
    expectedDays;

  const completionPercent =
    expectedHours > 0

      ? Math.min(
          (
            actualHours /
            expectedHours
          ) * 100,
          100
        )

      : 0;

  return {

    actualHours,

    expectedHours,

    completionPercent,

    remainingPercent:
      100 -
      completionPercent
  };
}

// =====================================================
// PROJECT STATUS
// =====================================================

function getProjectStatusOnDate(
  project,
  dateKey
) {

  // Project didn't exist yet
  if (dateKey < project.createdAt) {
    return null;
  }

  let status = "active";

  // Walk through history in order
  for (const entry of project.statusHistory) {

    if (entry.date > dateKey) {
      break;
    }

    status = entry.status;

  }

  return status;

}

function wasProjectActiveInRange(
  project,
  startDateKey,
  endDateKey
) {

  // Project didn't exist yet
  if (project.createdAt > endDateKey) {
    return false;
  }

  let activeStart = null;

  for (
    let i = 0;
    i < project.statusHistory.length;
    i++
  ) {

    const entry =
      project.statusHistory[i];

    if (
      entry.status === "active"
    ) {

      activeStart =
        entry.date;

    }

    else if (

      (entry.status === "paused" ||
       entry.status === "completed")

      &&

      activeStart

    ) {

      const activeEnd =
        entry.date;

      // Does the active interval overlap
      // the selected range?
      if (

        activeStart <= endDateKey &&

        activeEnd >= startDateKey

      ) {

        return true;

      }

      activeStart = null;

    }

  }

  // Still active after the last status change
  if (activeStart) {

    return (
      activeStart <= endDateKey
    );

  }

  return false;

}


// =====================================================
// RENDER ANALYTICS
// =====================================================

function renderProjectsStats() {

  const container =
    document.getElementById(
      "projectsStats"
    );

  if (!container) return;

  container.innerHTML = "";

  projects

    .filter(
      project =>
        project.status ===
        "active"
    )

    .forEach(project => {

      const analytics =
        calculateProjectAnalytics(
          project
        );

      const card =
        document.createElement(
          "div"
        );

      card.classList.add(
        "analytics-card"
      );

      card.innerHTML = `

        <!-- =============================
             HEADER
        ============================== -->

        <div
          class="analytics-card-header"
        >

          <div
            class="analytics-card-title"
          >
            ${project.name}
          </div>

          <div
            class="analytics-card-percent"
          >
            ${analytics.completionPercent.toFixed(0)}%
          </div>

        </div>

        <!-- =============================
             PROGRESS BAR
        ============================== -->

        <div
          class="analytics-bar"
        >

          <div
            class="analytics-bar-green"
            style="
              width:
              ${analytics.completionPercent}%
            "
          ></div>

          <div
            class="analytics-bar-red"
            style="
              width:
              ${analytics.remainingPercent}%
            "
          ></div>

        </div>

        <!-- =============================
             HOURS
        ============================== -->

        <div
          class="analytics-hours"
        >

        ${formatHours(
          analytics.actualHours
        )}

        /

        ${formatHours(
          analytics.expectedHours
        )}

        </div>
      `;

      container.appendChild(
        card
      );

    });
}


function renderProjectsAnalytics() {

  renderAnalyticsDateRange();

  switch (
    currentAnalyticsView
  ) {

    case "trend":

      renderTrendAnalytics();
      break;

    case "distribution":

      renderDistributionAnalytics();
      break;

    case "insights":

      renderInsightsAnalytics();
      break;

    case "overview":

    default:

      renderOverviewAnalytics();
      break;
  }

}


function renderOverviewAnalytics() {

  const container =
    document.getElementById(
      "projectsAnalyticsContent"
    );

  if (!container) return;

  container.innerHTML = "";

  const {
    startDate,
    endDate
  } =
    getAnalyticsDateRange();

  const activeProjects =
    projects.filter(project => {

      if (
        project.status !==
        "active"
      ) {

        return false;

      }

      // Overall
      if (
        !startDate &&
        !endDate
      ) {

        return true;

      }

      const createdDate =
        new Date(
          project.createdAt
        );

      createdDate.setHours(
        0, 0, 0, 0
      );

      return (
        createdDate <=
        endDate
      );

    });

  if (
    activeProjects.length === 0
  ) {

    container.innerHTML = `
      <div class="analytics-placeholder">
        No active projects.
      </div>
    `;

    return;
  }

  activeProjects.forEach(
    project => {

      const analytics =
        calculateProjectAnalytics(
          project
        );

      const card =
        document.createElement(
          "div"
        );

      card.classList.add(
        "analytics-card"
      );

      card.innerHTML = `

        <!-- =============================
             HEADER
        ============================== -->

        <div
          class="analytics-card-header"
        >

          <div
            class="analytics-card-title"
          >
            ${project.name}
          </div>

          <div
            class="analytics-hours"
          >
            ${formatHours(
              analytics.actualHours
            )}

            /

            ${formatHours(
              analytics.expectedHours
            )}
          </div>

        </div>

        <!-- =============================
             PROGRESS
        ============================== -->

        <div
          class="analytics-bar"
        >

          <div
            class="analytics-bar-green"
            style="
              width:
              ${analytics.completionPercent}%
            "
          ></div>

        </div>

      `;

      container.appendChild(
        card
      );

    }
  );

}


function renderTrendAnalytics() {

  const container =
    document.getElementById(
      "projectsAnalyticsContent"
    );

  if (!container) return;

  const {
    startDate,
    endDate
  } = getAnalyticsDateRange();

  const startDateKey =
    getLocalDateKey(startDate);

  const endDateKey =
    getLocalDateKey(endDate);

  
  console.log(
    "Range:",
    currentAnalyticsRange,
    "Start Key:",
    startDateKey,
    "End Key:",
    endDateKey
  );
  const activeProjects =
    projects.filter(project => {

      const isActive =
        wasProjectActiveInRange(
          project,
          startDateKey,
          endDateKey
        );

      console.log(
        project.name,
        isActive,
        project.statusHistory
      );

      return isActive;

    });

  container.innerHTML =

    activeProjects.length

      ? activeProjects
          .map(project =>
            `<div>${project.name}</div>`
          )
          .join("")

      : `
          <div class="analytics-placeholder">
            No active projects
          </div>
        `;

}


function renderDistributionAnalytics() {

  const container =
    document.getElementById(
      "projectsAnalyticsContent"
    );

  if (!container) return;

  container.innerHTML = `
    <div class="analytics-placeholder">
      Distribution Analytics
    </div>
  `;
}


function renderInsightsAnalytics() {

  const container =
    document.getElementById(
      "projectsAnalyticsContent"
    );

  if (!container) return;

  container.innerHTML = `
    <div class="analytics-placeholder">
      Insights Analytics
    </div>
  `;
}

// =====================================================
// ANALYTICS DATE RANGE
// =====================================================

function renderAnalyticsDateRange() {

  const label =
    document.getElementById(
      "analyticsDateRange"
    );

  if (!label) return;

  const {
    startDate,
    endDate
  } =
    getAnalyticsDateRange();

  if (
    !startDate &&
    !endDate
  ) {

    label.textContent =
      "From project creation to today";

    return;

  }

  label.textContent =
    `${formatDate(startDate)} - ${formatDate(endDate)}`;

}