let currentTrendProjectFilter =
  "active";

let selectedTrendProjectId =
  null;

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
    activeProjects.find(
      project =>
        project.id ===
        selectedTrendProjectId
    );

  let projectInfoHtml = "";

  if (selectedProject) {

    const projectStartDate =
      formatDate(
        new Date(
          selectedProject.createdAt
        )
      );

    if (
      currentTrendProjectFilter ===
      "completed"
    ) {

      const completedEntry =
        selectedProject.statusHistory.find(
          entry =>
            entry.status ===
            "completed"
        );

      const projectEndDate =
        completedEntry
          ? formatDate(
              parseLocalDate(
                completedEntry.date
              )
            )
          : "-";

      projectInfoHtml = `

        <div class="trend-project-dates">

          <div>

            <strong>Started:</strong>
            ${projectStartDate}

          </div>

          <div>

            <strong>Ended:</strong>
            ${projectEndDate}

          </div>

        </div>

      `;

    } else {

      const statusText =
        currentTrendProjectFilter ===
        "paused"
          ? "Paused"
          : "Ongoing";

      projectInfoHtml = `

        <div class="trend-project-dates">

          <div>

            <strong>Started:</strong>
            ${projectStartDate}

          </div>

          <div>

            <strong>Status:</strong>
            ${statusText}

          </div>

        </div>

      `;

    }

  }

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

    ${projectInfoHtml}

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

    bottom: 85,

    left: 75

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

  const targetHours =

    (
      currentAnalyticsRange ===
        "thisWeek"

      ||

      currentAnalyticsRange ===
        "previousWeek"

    )

      ? project.targetHoursPerDay

      : null;

  const yAxis =
    calculateTrendYAxis(
      graphData,
      targetHours
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

  let graphEndDate =
    endDate;

  if (
    currentAnalyticsRange === "overall" &&
    project.status === "completed"
  ) {

    const completedEntry =
      project.statusHistory.find(
        entry =>
          entry.status ===
          "completed"
      );

    if (
      completedEntry
    ) {

      graphEndDate =
        parseLocalDate(
          completedEntry.date
        );

    }

  }

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
            graphEndDate -
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
          graphEndDate
        );

      }

      return getMonthlyTrendData(
        project,
        createdAt,
        graphEndDate
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
  graphData,
  targetHours = null
) {

  const maxLogged =
    Math.max(
      ...graphData.map(
        item => item.value
      ),
      0
    );

  let maxY =
    maxLogged;

  if (
    targetHours !== null
  ) {

    maxY =
      Math.max(
        maxLogged,
        targetHours
      );

  }

  if (
    maxY === 0
  ) {

    maxY = 1;

  }

  const divisions = 5;

  return {

    max: maxY,

    step:
      maxY /
      divisions,

    divisions,

    target:
      targetHours

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

  // ==========================
  // GRID
  // ==========================

  ctx.strokeStyle =
    "rgba(255,255,255,0.18)";

  ctx.lineWidth = 1;

  ctx.fillStyle =
    "#d1d5db";

  ctx.font =
    "13px Arial";

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

      left - 12,

      y

    );

  }

  // ==========================
  // TARGET LINE
  // ==========================

  if (

    yAxis.target !== null

  ) {

    const targetY =

      bottom -

      (
        yAxis.target /
        yAxis.max
      ) *
      chartHeight;

    ctx.save();

    ctx.strokeStyle =
      "#22c55e";

    ctx.lineWidth = 2;

    ctx.setLineDash(
      [6, 6]
    );

    ctx.beginPath();

    ctx.moveTo(
      left,
      targetY
    );

    ctx.lineTo(
      right,
      targetY
    );

    ctx.stroke();

    ctx.restore();

  }

  // ==========================
  // AXES
  // ==========================

  ctx.strokeStyle =
    "#ffffff";

  ctx.lineWidth = 2;

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
      slotWidth * 0.72,
      60
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

        index * slotWidth +

        (
          slotWidth -
          barWidth
        ) / 2;

      const y =
        bottom -
        barHeight;

      // ======================
      // SHADOW
      // ======================

      ctx.save();

      ctx.shadowColor =
        "rgba(79,70,229,0.45)";

      ctx.shadowBlur =
        16;

      ctx.shadowOffsetX =
        0;

      ctx.shadowOffsetY =
        4;

      // ======================
      // BAR GRADIENT
      // ======================

      const gradient =

        ctx.createLinearGradient(

          0,

          y,

          0,

          bottom

        );

      gradient.addColorStop(
        0,
        "#7367ff"
      );

      gradient.addColorStop(
        1,
        "#4f46e5"
      );

      ctx.fillStyle =
        gradient;

      ctx.beginPath();

      ctx.roundRect(

        x,

        y,

        barWidth,

        barHeight,

        [
          8,
          8,
          0,
          0
        ]

      );

      ctx.fill();

      ctx.restore();

      // ======================
      // VALUE
      // ======================

      if (
        item.value > 0
      ) {

        ctx.fillStyle =
          "#ffffff";

        ctx.font =
          "bold 13px Arial";

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

          y - 10

        );

      }

    }

  );

}

function drawTrendLabels(

  ctx,

  graphData,

  padding,

  chartWidth,

  chartHeight

) {

  const left =
    padding.left;

  const bottom =
    padding.top +
    chartHeight;

  const slotWidth =
    chartWidth /
    graphData.length;

  ctx.fillStyle =
    "#d1d5db";

  ctx.font =
    "13px Arial";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "top";

  graphData.forEach(

    (item, index) => {

      const x =

        left +

        index *

        slotWidth +

        slotWidth / 2;

      ctx.fillText(

        item.label,

        x,

        bottom + 12

      );

    }

  );

}