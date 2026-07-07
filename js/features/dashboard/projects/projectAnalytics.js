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
    // =====================================

    case "overall":

      startDate = null;
      endDate = null;

      break;
  }

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
      parseLocalDate(
        project.createdAt
      );

    const today =
      parseLocalDate(
        getLocalDateKey()
      );

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
    parseLocalDate(
      project.createdAt
    );

  // Project did not exist
  // during this range

  if (
    createdDate > endDate
  ) {

    return 0;
  }

  const effectiveStart =

    createdDate > startDate

      ? createdDate

      : startDate;

  const diffDays =
    Math.floor(
      (
        endDate -
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

  const activeProjects =
    projects.filter(
      project =>
        project.status ===
        "active"
    );

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
             PROJECT TITLE
        ============================== -->

        <div
          class="analytics-card-title"
        >
          ${project.name}
        </div>

        <!-- =============================
             EXPECTED
        ============================== -->

        <div
          class="overview-label"
        >
          Expected
        </div>

        <div
          class="analytics-bar"
        >

          <div
            class="analytics-bar-green"
            style="
              width:100%;
            "
          ></div>

        </div>

        <div
          class="overview-hours"
        >
          ${analytics.expectedHours.toFixed(1)}h
        </div>

        <!-- =============================
             ACTUAL
        ============================== -->

        <div
          class="overview-label"
        >
          Actual
        </div>

        <div
          class="analytics-bar"
        >

          <div
            class="analytics-bar-green"
            style="
              width:${analytics.completionPercent}%;
            "
          ></div>

        </div>

        <div
          class="overview-hours"
        >
          ${analytics.actualHours.toFixed(1)}h
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

  container.innerHTML = `
    <div class="analytics-placeholder">
      Trend Analytics
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