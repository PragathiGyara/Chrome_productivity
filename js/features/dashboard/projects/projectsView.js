// =====================================================
// PROJECT TRACKER VIEW
//
// Responsibilities:
// - Render project tracker UI
// - Render project rows
// - Quick time logging
// - Date selection
//
// Delegates:
// - Analytics → projectAnalytics.js
// - Project Actions → projectActions.js
// - Project Modal → projectModal.js
// =====================================================


// =====================================================
// TRACKER STATE
// =====================================================

let selectedProjectDate =
  getLocalDateKey();

let isProjectsTrackerCollapsed =
  false;


// =====================================================
// RENDER PROJECTS VIEW
// =====================================================

function renderProjectsView() {

  const container =
    document.getElementById(
      "dashboardContent"
    );

  if (!container) return;

  container.innerHTML = `

    <!-- =============================
         PROJECT TRACKER
    ============================== -->

    <div
      class="projects-tracker-section"
    >

      <div
        class="projects-tracker-header"
      >

      <div
        class="projects-section-title
              tracker-collapse-toggle"
        id="trackerCollapseToggle"
      >

        <span
          class="tracker-collapse-icon"
        >
          ${
            isProjectsTrackerCollapsed
              ? "▶"
              : "▼"
          }
        </span>

        Project Time Tracker

      </div>

      ${
        !isProjectsTrackerCollapsed
          ? `
            <div
              class="projects-date-picker"
            >

              <span
                class="projects-date-icon"
              >
                📅
              </span>

              <input
                type="date"
                id="projectsDateInput"
                value="${selectedProjectDate}"
              />

            </div>
          `
          : ""
      }

      </div>

      <div
        id="projectsTrackerContent"
        class="
          ${
            isProjectsTrackerCollapsed
              ? "tracker-collapsed"
              : ""
          }
        "
      >

        <div id="projectsList"></div>

      </div>

    </div>


    <!-- =============================
         ANALYTICS
    ============================== -->

    <div
      class="projects-analytics-section"
    >

      <div
        class="projects-analytics-header"
      >

        <div
          class="projects-section-title"
        >
          Analytics
        </div>

        <select
          id="analyticsRangeSelect"
          class="analytics-range-select"
        >

          <option value="thisWeek">
            This Week
          </option>

          <option value="previousWeek">
            Previous Week
          </option>

          <option value="thisMonth">
            This Month
          </option>

          <option value="overall">
            Overall
          </option>

        </select>

      </div>

      <div
        class="analytics-tabs"
      >

        <button
          class="analytics-tab active"
          data-view="overview"
        >
          Overview
        </button>

        <button
          class="analytics-tab"
          data-view="trend"
        >
          Trend
        </button>

        <button
          class="analytics-tab"
          data-view="distribution"
        >
          Distribution
        </button>

        <button
          class="analytics-tab"
          data-view="insights"
        >
          Insights
        </button>

      </div>

      <div
        id="analyticsDateRange"
        class="analytics-date-range"
      ></div>

      <div
        id="trendProjectFilterContainer"
      ></div>

      <div
        id="projectsAnalyticsContent"
      ></div>

    </div>
  `;

  renderProjects();

  renderProjectsAnalytics();

  attachProjectEvents();
}


// =====================================================
// RENDER PROJECT ROWS
// =====================================================

function renderProjects() {

  if (
    isProjectsTrackerCollapsed
  ) {
    return;
  }

  const list =
    document.getElementById(
      "projectsList"
    );

  if (!list) return;

  list.innerHTML = "";

  projects

    // =====================================
    // FILTER
    // =====================================

    .filter(project => {

      const status =
        project.status ||
        "active";

      if (
        status === "completed"
      ) {

        return false;
      }

      const createdDateKey =
        getDateKey(
          new Date(
            project.createdAt
          )
        );

      if (
        selectedProjectDate <
        createdDateKey
      ) {

        return false;
      }

      return true;
    })

    // =====================================
    // RENDER
    // =====================================

    .forEach(project => {

      const todayKey =
        selectedProjectDate;

      const todayHours =
        project.logs?.[
          todayKey
        ] || 0;

      const progress =

        project.targetHoursPerDay > 0

        ? Math.min(
            (
              todayHours /
              project.targetHoursPerDay
            ) * 100,
            100
          )

        : 0;

      const row =
        document.createElement(
          "div"
        );

      row.classList.add(
        "project-row"
      );

      // =====================================
      // DRAG ENABLED
      // =====================================

      if (
        project.status ===
        "active"
      ) {

        row.draggable = true;

      }

      if (
        project.status ===
        "paused"
      ) {

        row.classList.add(
          "paused-project-row"
        );

      }

      row.dataset.projectId =
        project.id;

      row.innerHTML = `

        <div
          class="project-info"
        >

          <div
            class="project-name"
          >

            ${project.name}

            ${
              project.status ===
              "paused"

              ? `
                <span
                  class="project-paused-tag"
                >
                  Paused
                </span>
              `

              : ""
            }

          </div>

          <div
            class="project-hours"
          >

            ${formatHours(todayHours)}
            /
            ${formatHours(project.targetHoursPerDay)}

          </div>

        </div>

        <div
          class="project-progress"
        >

          <div
            class="project-progress-fill"
            style="
              width:
              ${progress}%
            "
          >

            <div
              class="project-progress-thumb"
            ></div>

          </div>

        </div>

        <div
          class="project-actions"
        >

          <button
            class="project-log-btn"
            data-add="0.083"
          >
            +5m
          </button>

          <button
            class="project-log-btn"
            data-add="0.25"
          >
            +15m
          </button>

          <button
            class="project-log-btn"
            data-add="0.5"
          >
            +30m
          </button>

          <button
            class="project-log-btn"
            data-add="1"
          >
            +1h
          </button>

          ${
            project.status !==
            "paused"

            ? `

              <button
                class="project-pause-btn"
              >
                Pause
              </button>

              <button
                class="project-complete-btn"
              >
                Complete
              </button>

            `

            : `

              <button
                class="project-resume-btn"
              >
                Resume
              </button>

            `
          }

          <button
            class="project-delete-btn"
          >
            Delete
          </button>

        </div>
      `;

      attachProjectRowEvents(
        row,
        project,
        todayKey
      );

      list.appendChild(
        row
      );

    });

  initializeProjectDragDrop();

}


// =====================================================
// PROJECT ROW EVENTS
// =====================================================

function attachProjectRowEvents(
  row,
  project,
  todayKey
) {

  if (
    project.status ===
    "paused"
  ) {

    row
      .querySelectorAll(
        ".project-log-btn"
      )
      .forEach(btn => {

        btn.disabled = true;

        btn.classList.add(
          "disabled-project-btn"
        );
      });
  }

  // =====================================
  // QUICK LOGGING
  // =====================================

  row
    .querySelectorAll(
      ".project-log-btn"
    )
    .forEach(btn => {

      btn.addEventListener(
        "click",
        () => {

          if (
            project.status ===
            "paused"
          ) {

            return;
          }

          const addHours =
            Number(
              btn.dataset.add
            );

          if (
            !project.logs
          ) {

            project.logs = {};
          }

          project.logs[
            todayKey
          ] = (

            project.logs[
              todayKey
            ] || 0

          ) + addHours;

          refreshProjectsUI();
        }
      );
    });

  row
    .querySelector(
      ".project-delete-btn"
    )
    ?.addEventListener(
      "click",
      () =>
        deleteProject(
          project.id
        )
    );

  row
    .querySelector(
      ".project-pause-btn"
    )
    ?.addEventListener(
      "click",
      () =>
        pauseProject(
          project.id
        )
    );

  row
    .querySelector(
      ".project-resume-btn"
    )
    ?.addEventListener(
      "click",
      () =>
        resumeProject(
          project.id
        )
    );

  row
    .querySelector(
      ".project-complete-btn"
    )
    ?.addEventListener(
      "click",
      () =>
        completeProject(
          project.id
        )
    );

    // =====================================
    // DRAG SLIDER
    // =====================================

    row
      .querySelector(
        ".project-progress"
      )
      ?.addEventListener(
        "mousedown",
        e => {

        startProjectSliderDrag(
          e,
          project,
          todayKey,
          row
        );

        }
      );
}

// =====================================================
// PROJECT SLIDER
// =====================================================

let draggedProject = null;

let draggedDateKey = null;

let draggedProgressBar = null;

let draggedRow = null;


// =====================================================
// START DRAG
// =====================================================

function startProjectSliderDrag(
  e,
  project,
  todayKey,
  row
) {

  draggedProject =
    project;

  draggedDateKey =
    todayKey;

  draggedProgressBar =
    row.querySelector(
      ".project-progress"
    );

  draggedRow =
    row;

  updateProjectSlider(e);

  document.addEventListener(
    "mousemove",
    updateProjectSlider
  );

  document.addEventListener(
    "mouseup",
    finishProjectSliderDrag
  );

}


// =====================================================
// UPDATE SLIDER
// =====================================================

function updateProjectSlider(
  e
) {

  if (
    !draggedProject ||
    !draggedProgressBar ||
    !draggedRow
  ) {
    return;
  }

  const rect =
    draggedProgressBar.getBoundingClientRect();

  let percent =
    (
      (e.clientX - rect.left) /
      rect.width
    ) * 100;

  percent =
    Math.max(
      0,
      Math.min(
        100,
        percent
      )
    );

  const hours =
    (
      percent / 100
    ) *
    draggedProject.targetHoursPerDay;

  if (
    !draggedProject.logs
  ) {

    draggedProject.logs = {};

  }

  draggedProject.logs[
    draggedDateKey
  ] = hours;

  // Update fill

  draggedRow
    .querySelector(
      ".project-progress-fill"
    )
    .style.width =
      `${percent}%`;

  // Update hours text

  draggedRow
    .querySelector(
      ".project-hours"
    )
    .textContent =

      `${formatHours(hours)} / ${formatHours(draggedProject.targetHoursPerDay)}`;

}


// =====================================================
// FINISH DRAG
// =====================================================

function finishProjectSliderDrag() {

  document.removeEventListener(
    "mousemove",
    updateProjectSlider
  );

  document.removeEventListener(
    "mouseup",
    finishProjectSliderDrag
  );

  refreshProjectsUI();

  draggedProject = null;

  draggedDateKey = null;

  draggedProgressBar = null;

  draggedRow = null;

}


// =====================================================
// PROJECT EVENTS
// =====================================================

function attachProjectEvents() {

  document
    .getElementById(
      "projectsDateInput"
    )
    ?.addEventListener(
      "change",
      (e) => {

        selectedProjectDate =
          e.target.value;

        renderProjects();
      }
    );

  document
    .getElementById(
      "analyticsRangeSelect"
    )
    ?.addEventListener(
      "change",
      (e) => {

        currentAnalyticsRange =
          e.target.value;

        renderProjectsStats();
        renderProjectsAnalytics();
      }
    );

  document
    .getElementById(
      "trackerCollapseToggle"
    )
    ?.addEventListener(
      "click",
      () => {

        isProjectsTrackerCollapsed =
          !isProjectsTrackerCollapsed;

        renderProjectsView();

      }
    );

  document
    .querySelectorAll(
      ".analytics-tab"
    )
    .forEach(tab => {

      tab.addEventListener(
        "click",
        () => {

          currentAnalyticsView =
            tab.dataset.view;

          document
            .querySelectorAll(
              ".analytics-tab"
            )
            .forEach(btn => {

              btn.classList.remove(
                "active"
              );

            });

          tab.classList.add(
            "active"
          );

          renderProjectsAnalytics();
        }
      );

    });

  document.addEventListener(
    "change",
    (e) => {

      if (
        e.target.id !==
        "trendProjectFilter"
      ) {

        return;

      }

      currentTrendProjectFilter =
        e.target.value;

      renderTrendAnalytics();

    }
  );

}
