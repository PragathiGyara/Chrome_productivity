// =====================================================
// PROJECTS VIEW
// Handles:
// - Rendering projects dashboard page
// - Project progress rows
// - Quick time logging
// - Add project modal
// - Daily progress calculations
// =====================================================


// =====================================================
// ANALYTICS RANGE STATE
// =====================================================

let currentAnalyticsRange =
  "thisWeek";

// =====================================================
// RENDER PROJECTS VIEW
// =====================================================

function renderProjectsView() {

  const container =
    document.getElementById("dashboardContent");

  if (!container) return;

  container.innerHTML = `

    <!-- =============================
         PROJECTS HEADER
    ============================== -->

    <div class="projects-header">

      <button
        id="addProjectBtn"
        class="primary-btn"
      >
        + Add Project
      </button>

    </div>

    <!-- =============================
        TRACKER SECTION
    ============================== -->

    <div class="projects-tracker-section">

    <div class="projects-tracker-header">

        <div class="projects-section-title">
        Project Time Tracker
        </div>

        <button
        id="calendarBtn"
        class="icon-btn"
        >
        📅
        </button>

    </div>

    <div id="projectsList"></div>

    </div>


    <!-- =============================
        ANALYTICS SECTION
    ============================== -->

    <div class="projects-analytics-section">
        <div class="projects-analytics-header">
        <div class="projects-section-title">
            Analytics
        </div>
        <!-- =============================
            ANALYTICS RANGE SELECTOR
        ============================== -->
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
        <div id="projectsStats"></div>
    </div>
  `;

  renderProjects();

  renderProjectsStats();

  attachProjectEvents();
}


// =====================================================
// RENDER PROJECT ROWS
// =====================================================

function renderProjects() {

  const list =
    document.getElementById("projectsList");

  if (!list) return;

  list.innerHTML = "";

  projects.forEach(project => {

    const todayKey =
      getTodayKey();

    const todayHours =
      project.logs?.[todayKey] || 0;

    const progress =
      Math.min(
        (
          todayHours /
          project.targetHoursPerDay
        ) * 100,
        100
      );

    // =========================================
    // PROJECT ROW
    // =========================================

    const row =
      document.createElement("div");

    row.classList.add("project-row");

    row.innerHTML = `

      <!-- =============================
           PROJECT INFO
      ============================== -->

      <div class="project-info">

        <div class="project-name">
          ${project.name}
        </div>

        <div class="project-hours">

          ${todayHours.toFixed(1)}h
          /
          ${project.targetHoursPerDay}h

        </div>

      </div>

      <!-- =============================
           PROGRESS BAR
      ============================== -->

      <div class="project-progress">

        <div
          class="project-progress-fill"
          style="width: ${progress}%"
        ></div>

      </div>

      <!-- =============================
           QUICK LOG ACTIONS
      ============================== -->

      <div class="project-actions">

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

      </div>
    `;

    // =========================================
    // QUICK LOGGING
    // =========================================

    row
      .querySelectorAll(".project-log-btn")
      .forEach(btn => {

        btn.addEventListener("click", () => {

          const addHours =
            Number(btn.dataset.add);

          if (!project.logs) {
            project.logs = {};
          }

          project.logs[todayKey] =
            (project.logs[todayKey] || 0)
            + addHours;

          persistProjects();

          renderProjects();

          renderProjectsStats();
        });

      });

    list.appendChild(row);
  });
}


// =====================================================
// GET ANALYTICS DATE RANGE
// =====================================================

function getAnalyticsDateRange() {

  const today = new Date();

  let startDate = null;

  let endDate = new Date();

  // =========================================
  // THIS WEEK
  // Sunday → Today
  // =========================================

  if (
    currentAnalyticsRange ===
    "thisWeek"
  ) {

    startDate = new Date(today);

    startDate.setDate(
      today.getDate() -
      today.getDay()
    );
  }

  // =========================================
  // PREVIOUS WEEK
  // Previous Sunday → Saturday
  // =========================================

  else if (
    currentAnalyticsRange ===
    "previousWeek"
  ) {

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
  }

  // =========================================
  // THIS MONTH
  // =========================================

  else if (
    currentAnalyticsRange ===
    "thisMonth"
  ) {

    startDate =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
  }

  // =========================================
  // OVERALL
  // =========================================

  else if (
    currentAnalyticsRange ===
    "overall"
  ) {

    startDate = null;
    endDate = null;
  }

  return {
    startDate,
    endDate
  };
}


// =====================================================
// RENDER PROJECT ANALYTICS
// =====================================================

function renderProjectsStats() {

  const container =
    document.getElementById(
      "projectsStats"
    );

  if (!container) return;

  container.innerHTML = "";

  const {
    startDate,
    endDate
    } = getAnalyticsDateRange();

  // =========================================
  // ANALYTICS PER PROJECT
  // =========================================

  projects.forEach(project => {

    let actualHours = 0;

    let expectedMultiplier = 7;

    // =========================================
    // RANGE MULTIPLIER
    // =========================================

    if (
    currentAnalyticsRange ===
    "thisMonth"
    ) {

    const today = new Date();

    expectedMultiplier =
        today.getDate();
    }

    else if (
    currentAnalyticsRange ===
    "overall"
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
            today - createdDate
        ) / (1000 * 60 * 60 * 24)
        ) + 1;

    expectedMultiplier =
        Math.max(diffDays, 1);
    }

    const expectedHours =
    project.targetHoursPerDay *
    expectedMultiplier;

    // =====================================
    // SUM LAST 7 DAYS
    // =====================================

    Object.entries(
      project.logs || {}
    ).forEach(([date, hours]) => {

      const logDate =
        new Date(date);

    const inRange =

    // OVERALL
    (!startDate && !endDate)

    ||

    // NORMAL RANGE
    (
        logDate >= startDate &&
        logDate <= endDate
    );

    if (inRange) {

    actualHours += hours;
    }

    });

    // =====================================
    // PERCENTAGES
    // =====================================

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

    const remainingPercent =
      100 - completionPercent;

    // =====================================
    // ANALYTICS CARD
    // =====================================

    const card =
      document.createElement("div");

    card.classList.add(
      "analytics-card"
    );

    card.innerHTML = `

      <!-- =============================
           HEADER
      ============================== -->

      <div class="analytics-card-header">

        <div class="analytics-card-title">
          ${project.name}
        </div>

        <div class="analytics-card-percent">
          ${completionPercent.toFixed(0)}%
        </div>

      </div>

      <!-- =============================
           BAR
      ============================== -->

      <div class="analytics-bar">

        <div
          class="analytics-bar-green"
          style="width: ${completionPercent}%"
        ></div>

        <div
          class="analytics-bar-red"
          style="width: ${remainingPercent}%"
        ></div>

      </div>

      <!-- =============================
           HOURS
      ============================== -->

      <div class="analytics-hours">

        ${actualHours.toFixed(1)}h
        /
        ${expectedHours.toFixed(1)}h

      </div>
    `;

    container.appendChild(card);
  });
}

// =====================================================
// PROJECT EVENTS
// =====================================================

function attachProjectEvents() {

  document
    .getElementById("addProjectBtn")
    ?.addEventListener("click", () => {

      openAddProjectModal();

    });
    // =========================================
    // ANALYTICS RANGE
    // =========================================

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
        }
    );
}


// =====================================================
// OPEN ADD PROJECT MODAL
// =====================================================

function openAddProjectModal() {

  const modal =
    document.getElementById(
      "addProjectModal"
    );

  if (!modal) return;

  modal.classList.remove("hidden");

  // Reset fields

  document.getElementById(
    "projectNameInput"
  ).value = "";

  document.getElementById(
    "projectTargetInput"
  ).value = "";
}


// =====================================================
// CLOSE ADD PROJECT MODAL
// =====================================================

function closeAddProjectModal() {

  const modal =
    document.getElementById(
      "addProjectModal"
    );

  if (!modal) return;

  modal.classList.add("hidden");
}

// =====================================================
// INITIALIZE PROJECT MODAL EVENTS
// =====================================================

function initializeProjectModalEvents() {

  const saveBtn =
    document.getElementById(
      "saveProjectBtn"
    );

  const cancelBtn =
    document.getElementById(
      "cancelProjectBtn"
    );

  const closeBtn =
    document.getElementById(
      "closeAddProjectModalBtn"
    );

  const modal =
    document.getElementById(
      "addProjectModal"
    );

  // =========================================
  // SAVE
  // =========================================

  saveBtn?.addEventListener(
    "click",
    saveProject
  );

  // =========================================
  // CLOSE ACTIONS
  // =========================================

  cancelBtn?.addEventListener(
    "click",
    closeAddProjectModal
  );

  closeBtn?.addEventListener(
    "click",
    closeAddProjectModal
  );

  // =========================================
  // BACKDROP CLOSE
  // =========================================

  modal?.addEventListener(
    "click",
    (e) => {

      if (e.target === modal) {

        closeAddProjectModal();
      }

    }
  );
}


// =====================================================
// SAVE PROJECT
// =====================================================

function saveProject() {

  const nameInput =
    document.getElementById(
      "projectNameInput"
    );

  const targetInput =
    document.getElementById(
      "projectTargetInput"
    );

  const name =
    nameInput.value.trim();

  const targetHours =
    Number(targetInput.value);

  // =========================================
  // VALIDATION
  // =========================================

  if (!name) {

    alert("Project name required.");

    return;
  }

  if (
    isNaN(targetHours) ||
    targetHours <= 0
  ) {

    alert(
      "Enter valid target hours."
    );

    return;
  }

  // =========================================
  // CREATE PROJECT
  // =========================================

  projects.push({

    id: Date.now(),

    name,

    targetHoursPerDay:
      targetHours,

    createdAt:
        new Date().toISOString(),

    logs: {}
  });

  persistProjects();

  closeAddProjectModal();

  renderProjects();

  showToast(
    `Project "${name}" added`
  );
}