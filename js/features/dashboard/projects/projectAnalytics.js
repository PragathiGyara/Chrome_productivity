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

let currentTrendProjectFilter =
  "active";

let selectedTrendProjectId =
  null;

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

  const filterContainer =
    document.getElementById(
      "trendProjectFilterContainer"
    );

  if (filterContainer) {

    filterContainer.innerHTML = "";

  }

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

  const filterContainer =
    document.getElementById(
      "trendProjectFilterContainer"
    );

  if (filterContainer) {

    filterContainer.innerHTML = `

      <select
        id="trendProjectFilter"
        class="analytics-range-select"
      >

        <option value="active">
          Active Projects
        </option>

        <option value="paused">
          Paused Projects
        </option>

        <option value="completed">
          Completed Projects
        </option>

      </select>

    `;

    filterContainer
      .querySelector(
        "#trendProjectFilter"
      )
      .value =
        currentTrendProjectFilter;

  }

  const {
    startDate,
    endDate
  } = getAnalyticsDateRange();

  const startDateKey =
    getLocalDateKey(startDate);

  const endDateKey =
    getLocalDateKey(endDate);

  const activeProjects =
    projects.filter(project => {

      if (
        project.status !==
        currentTrendProjectFilter
      ) {

        return false;

      }

      return wasProjectActiveInRange(
        project,
        startDateKey,
        endDateKey
      );

    });

  if (
    activeProjects.length === 0
  ) {

    selectedTrendProjectId =
      null;

    container.innerHTML = `
      <div class="analytics-placeholder">
        No projects
      </div>
    `;

    return;

  }

  const selectedProject =
    activeProjects.find(project =>

      project.id ===
      selectedTrendProjectId

    );

  container.innerHTML = `

    <div class="trend-project-list">

      ${activeProjects.map(project => `

        <button
          class="trend-project-chip
            ${
              project.id ===
              selectedTrendProjectId
                ? "active"
                : ""
            }
          "
          data-project-id="${project.id}"
          type="button"
        >

          ${project.name}

        </button>

      `).join("")}

    </div>

    <div
      id="trendGraphContainer"
      class="trend-graph-container"
    >

      ${
        selectedProject

        ? ""

        : `
          <div
            class="analytics-placeholder"
          >
            Select a project to view its trend.
          </div>
        `
      }

    </div>

  `;

  if (
    selectedProject
  ) {

    renderTrendGraph(
      selectedProject
    );

  }

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

function drawTrendBarGraph(
  canvas,
  graphData,
  yAxis
) {

  const ctx =
    canvas.getContext("2d");

  const padding = {

    top: 30,

    right: 25,

    bottom: 70,

    left: 60

  };

  const chartWidth =
    canvas.width -
    padding.left -
    padding.right;

  const chartHeight =
    canvas.height -
    padding.top -
    padding.bottom;

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.font =
    "12px Arial";

  ctx.lineWidth = 1;

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  drawTrendAxes(

    ctx,

    padding,

    chartWidth,

    chartHeight,

    yAxis

  );

  drawTrendBars(

    ctx,

    graphData,

    padding,

    chartWidth,

    chartHeight,

    yAxis

  );

  drawTrendLabels(

    ctx,

    graphData,

    padding,

    chartWidth,

    chartHeight,

    yAxis

  );

}

function renderTrendGraph(
  project
) {

  const container =
    document.getElementById(
      "trendGraphContainer"
    );

  if (!container) return;

  container.innerHTML = "";

  const graphData =
    getTrendGraphData(
      project
    );

  if (
    !graphData.length
  ) {

    container.innerHTML = `
      <div class="analytics-empty-state">
        No data available.
      </div>
    `;

    return;

  }

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = 900;
  canvas.height = 420;

  container.appendChild(
    canvas
  );

  const yAxis =
    calculateTrendYAxis(
      graphData
    );

  drawTrendBarGraph(
    canvas,
    graphData,
    yAxis
  );

}

function getTrendGraphData(
  project
) {

  if (
    !project ||
    !project.logs
  ) {

    return [];

  }

  const {
    startDate,
    endDate
  } =
    getAnalyticsDateRange();

  switch (
    currentAnalyticsRange
  ) {

    case "thisWeek":

    case "previousWeek":

      return getDailyTrendData(
        project,
        startDate,
        endDate
      );

    case "thisMonth":

      return getWeeklyTrendData(
        project,
        startDate,
        endDate
      );

    case "overall":

      const createdAt =
        new Date(
          project.createdAt
        );

      const ageInDays =
        Math.floor(
          (
            endDate -
            createdAt
          ) /
          86400000
        );

      if (
        ageInDays < 60
      ) {

        return getWeeklyTrendData(
          project,
          createdAt,
          endDate
        );

      }

      return getMonthlyTrendData(
        project
      );

    default:

      return [];

  }

}

function getDailyTrendData(
  project,
  startDate,
  endDate
) {

  const graphData = [];

  const currentDate =
    new Date(startDate);

  while (
    currentDate <= endDate
  ) {

    const dateKey =
      getLocalDateKey(
        currentDate
      );

    graphData.push({

      label:
        currentDate.toLocaleDateString(
          "en-IN",
          {
            weekday: "short"
          }
        ),

      value:
        project.logs[
          dateKey
        ] || 0,

      date: dateKey

    });

    currentDate.setDate(
      currentDate.getDate() + 1
    );

  }

  return graphData;

}

function getWeeklyTrendData(
  project,
  startDate,
  endDate
) {

  const graphData = [];

  let weekStart =
    new Date(startDate);

  while (
    weekStart <= endDate
  ) {

    const weekEnd =
      new Date(weekStart);

    weekEnd.setDate(
      weekEnd.getDate() + 6
    );

    if (
      weekEnd > endDate
    ) {

      weekEnd.setTime(
        endDate.getTime()
      );

    }

    let totalHours = 0;

    const currentDay =
      new Date(weekStart);

    while (
      currentDay <= weekEnd
    ) {

      const dateKey =
        getLocalDateKey(
          currentDay
        );

      totalHours +=
        project.logs[
          dateKey
        ] || 0;

      currentDay.setDate(
        currentDay.getDate() + 1
      );

    }

    graphData.push({

      label:
        `${weekStart.toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short"
          }
        )} - ${weekEnd.toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short"
          }
        )}`,

      value:
        Number(
          totalHours.toFixed(2)
        ),

      startDate:
        getLocalDateKey(
          weekStart
        ),

      endDate:
        getLocalDateKey(
          weekEnd
        )

    });

    weekStart.setDate(
      weekStart.getDate() + 7
    );

  }

  return graphData;

}

function getMonthlyTrendData(
  project
) {

  const monthlyTotals =
    {};

  Object.entries(
    project.logs
  ).forEach(([dateKey, hours]) => {

    const date =
      parseLocalDate(
        dateKey
      );

    const monthKey =
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

    if (
      !monthlyTotals[
        monthKey
      ]
    ) {

      monthlyTotals[
        monthKey
      ] = {
        total: 0,
        date
      };

    }

    monthlyTotals[
      monthKey
    ].total += hours;

  });

  return Object
    .entries(
      monthlyTotals
    )
    .sort(
      ([a], [b]) =>
        a.localeCompare(b)
    )
    .map(
      ([, data]) => ({

        label:
          data.date.toLocaleDateString(
            "en-IN",
            {
              month: "short",
              year: "2-digit"
            }
          ),

        value:
          Number(
            data.total.toFixed(2)
          )

      })
    );

}

function calculateTrendYAxis(
  graphData
) {

  const maxValue =
    Math.max(
      ...graphData.map(
        item => item.value
      ),
      1
    );

  let maxY;

  if (
    maxValue <= 2
  ) {

    maxY = 2;

  } else if (
    maxValue <= 5
  ) {

    maxY = 5;

  } else if (
    maxValue <= 10
  ) {

    maxY = 10;

  } else {

    const magnitude =
      Math.pow(
        10,
        Math.floor(
          Math.log10(
            maxValue
          )
        )
      );

    maxY =
      Math.ceil(
        maxValue /
        magnitude
      ) * magnitude;

  }

  const divisions = 5;

  return {

    max: maxY,

    step:
      maxY /
      divisions,

    divisions

  };

}

function drawTrendAxes(

  ctx,

  padding,

  chartWidth,

  chartHeight,

  yAxis

) {

  const left =
    padding.left;

  const top =
    padding.top;

  const right =
    left + chartWidth;

  const bottom =
    top + chartHeight;

  // Horizontal grid lines

  ctx.strokeStyle =
    "#e5e7eb";

  ctx.fillStyle =
    "#6b7280";

  ctx.lineWidth = 1;

  ctx.font =
    "12px Arial";

  ctx.textAlign =
    "right";

  ctx.textBaseline =
    "middle";

  for (

    let i = 0;

    i <= yAxis.divisions;

    i++

  ) {

    const y =

      bottom -

      (
        i /
        yAxis.divisions
      ) *
      chartHeight;

    // Grid line

    ctx.beginPath();

    ctx.moveTo(
      left,
      y
    );

    ctx.lineTo(
      right,
      y
    );

    ctx.stroke();

    // Tick label

    const value =
      (
        yAxis.step *
        i
      ).toFixed(1);

    ctx.fillText(

      value.replace(
        /\.0$/,
        ""
      ),

      left - 10,

      y

    );

  }

  // Axes

  ctx.strokeStyle =
    "#9ca3af";

  ctx.lineWidth = 2;

  // Y-axis

  ctx.beginPath();

  ctx.moveTo(
    left,
    top
  );

  ctx.lineTo(
    left,
    bottom
  );

  ctx.stroke();

  // X-axis

  ctx.beginPath();

  ctx.moveTo(
    left,
    bottom
  );

  ctx.lineTo(
    right,
    bottom
  );

  ctx.stroke();

}

function drawTrendBars(

  ctx,

  graphData,

  padding,

  chartWidth,

  chartHeight,

  yAxis

) {

  const left =
    padding.left;

  const bottom =
    padding.top +
    chartHeight;

  const slotWidth =
    chartWidth /
    graphData.length;

  const barWidth =
    Math.min(
      slotWidth * 0.65,
      50
    );

  graphData.forEach(

    (item, index) => {

      const barHeight =

        yAxis.max === 0
          ? 0
          : (
              item.value /
              yAxis.max
            ) *
            chartHeight;

      const x =

        left +

        index *
        slotWidth +

        (
          slotWidth -
          barWidth
        ) / 2;

      const y =
        bottom -
        barHeight;

      // Draw bar

      ctx.fillStyle =
        "#4f46e5";

      ctx.beginPath();

      ctx.roundRect(

        x,

        y,

        barWidth,

        barHeight,

        [
          6,
          6,
          0,
          0
        ]

      );

      ctx.fill();

      // Value above bar

      if (
        item.value > 0
      ) {

        ctx.fillStyle =
          "#111827";

        ctx.font =
          "11px Arial";

        ctx.textAlign =
          "center";

        ctx.textBaseline =
          "bottom";

        ctx.fillText(

          formatHours(
            item.value
          ),

          x +
            barWidth / 2,

          y - 6

        );

      }

    }

  );

}

function drawTrendBars(

  ctx,

  graphData,

  padding,

  chartWidth,

  chartHeight,

  yAxis

) {

  const left =
    padding.left;

  const bottom =
    padding.top +
    chartHeight;

  const slotWidth =
    chartWidth /
    graphData.length;

  const barWidth =
    Math.min(
      slotWidth * 0.65,
      50
    );

  graphData.forEach(

    (item, index) => {

      const barHeight =

        yAxis.max === 0
          ? 0
          : (
              item.value /
              yAxis.max
            ) *
            chartHeight;

      const x =

        left +

        index *
        slotWidth +

        (
          slotWidth -
          barWidth
        ) / 2;

      const y =
        bottom -
        barHeight;

      // Draw bar

      ctx.fillStyle =
        "#4f46e5";

      ctx.beginPath();

      ctx.roundRect(

        x,

        y,

        barWidth,

        barHeight,

        [
          6,
          6,
          0,
          0
        ]

      );

      ctx.fill();

      // Value above bar

      if (
        item.value > 0
      ) {

        ctx.fillStyle =
          "#111827";

        ctx.font =
          "11px Arial";

        ctx.textAlign =
          "center";

        ctx.textBaseline =
          "bottom";

        ctx.fillText(

          formatHours(
            item.value
          ),

          x +
            barWidth / 2,

          y - 6

        );

      }

    }

  );

}