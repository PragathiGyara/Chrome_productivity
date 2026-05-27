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
// CURRENT TRACKER DATE
// =====================================================

let selectedProjectDate =
  getTodayKey();


// =====================================================
// MANAGE PROJECTS TAB STATE
// =====================================================

let currentManageProjectsTab =
  "current";

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
      id="manageProjectsBtn"
      class="primary-btn"
    >
      Manage Projects
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

        <div class="projects-date-picker">

          <span class="projects-date-icon">
            📅
          </span>

          <input
            type="date"
            id="projectsDateInput"
            value="${selectedProjectDate}"
          />

        </div>

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

  initializeManageProjectsEvents();
}


// =====================================================
// RENDER PROJECT ROWS
// =====================================================

function renderProjects() {

  const list =
    document.getElementById("projectsList");

  if (!list) return;

  list.innerHTML = "";

  projects

    // =====================================
    // FILTER PROJECTS
    // =====================================

    .filter(project => {

      const status =
        project.status || "active";

      // hide completed projects
      if (status === "completed") {
        return false;
      }

      const createdDateKey =
        getDateKey(
          new Date(project.createdAt)
        );

      // don't show before creation date
      if (
        selectedProjectDate <
        createdDateKey
      ) {
        return false;
      }

      return true;
    })

    // =====================================
    // ACTIVE FIRST, PAUSED LAST
    // =====================================

    .sort((a, b) => {

      const aPaused =
        (a.status || "active")
        === "paused";

      const bPaused =
        (b.status || "active")
        === "paused";

      return aPaused - bPaused;
    })

    // =====================================
    // RENDER ROWS
    // =====================================

    .forEach(project => {

      const todayKey =
        selectedProjectDate;

      const todayHours =
        project.logs?.[todayKey] || 0;

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

      // =====================================
      // PROJECT ROW
      // =====================================

      const row =
        document.createElement("div");

      row.classList.add("project-row");

      if (
        project.status === "paused"
      ) {

        row.classList.add(
          "paused-project-row"
        );
      }

      row.innerHTML = `

        <!-- =============================
             PROJECT INFO
        ============================== -->

        <div class="project-info">

          <div class="project-name">

            ${project.name}

            ${
              project.status === "paused"
                ? `
                  <span class="project-paused-tag">
                    Paused
                  </span>
                `
                : ""
            }

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

          ${
            project.status !== "paused"
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

      // =====================================
      // DISABLE BUTTONS IF PAUSED
      // =====================================

      if (
        project.status === "paused"
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
                Number(btn.dataset.add);

              if (!project.logs) {
                project.logs = {};
              }

              project.logs[todayKey] =
                (
                  project.logs[todayKey]
                  || 0
                ) + addHours;

              persistProjects();

              renderProjects();

              renderProjectsStats();
            }
          );

        });

      // =====================================
      // DELETE
      // =====================================

      row
        .querySelector(
          ".project-delete-btn"
        )
        ?.addEventListener(
          "click",
          () => {

            deleteProject(project.id);

          }
        );


      // =====================================
      // PAUSE
      // =====================================

      row
        .querySelector(
          ".project-pause-btn"
        )
        ?.addEventListener(
          "click",
          () => {

            pauseProject(project.id);

          }
        );


      // =====================================
      // RESUME
      // =====================================

      row
        .querySelector(
          ".project-resume-btn"
        )
        ?.addEventListener(
          "click",
          () => {

            resumeProject(project.id);

          }
        );


      // =====================================
      // COMPLETE
      // =====================================

      row
        .querySelector(
          ".project-complete-btn"
        )
        ?.addEventListener(
          "click",
          () => {

            completeProject(project.id);

          }
        );

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

  projects
    .filter(
      project =>
        project.status === "active"
    )
    .forEach(project => {

    let actualHours = 0;

    let expectedMultiplier = 7;

    // =========================================
    // RANGE MULTIPLIER
    // =========================================

    if (
      currentAnalyticsRange ===
      "thisWeek"
    ) {

      const today = new Date();

      // Sunday = 0
      // Monday = 1
      // ...
      // Saturday = 6

      expectedMultiplier =
        today.getDay() + 1;
    }

    else if (
      currentAnalyticsRange ===
      "previousWeek"
    ) {

      expectedMultiplier = 7;
    }

    else if (
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

    // =====================================
    // SUM LAST 7 DAYS
    // =====================================

    Object.entries(
      project.logs || {}
    ).forEach(([date, hours]) => {

      const logDate =
        parseLocalDate(date);

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


    const expectedHours =
    project.targetHoursPerDay *
    expectedMultiplier;

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
    .getElementById("manageProjectsBtn")
    ?.addEventListener("click", () => {

      openManageProjectsModal();

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

    // =========================================
    // DATE PICKER
    // =========================================

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
}

// =====================================================
// OPEN MANAGE PROJECTS MODAL
// =====================================================

function openManageProjectsModal() {

  const modal =
    document.getElementById(
      "manageProjectsModal"
    );

  if (!modal) return;

  modal.classList.remove("hidden");
  
  // =========================================
  // RESET TAB STATE
  // =========================================

  currentManageProjectsTab =
    "current";

  document
    .querySelectorAll(
      ".manage-projects-tab"
    )
    .forEach(tab => {

      tab.classList.remove("active");

      if (
        tab.dataset.tab === "current"
      ) {

        tab.classList.add("active");
      }
    });

  updateManageProjectsCounts();

  renderManageProjectsContent();
}


// =====================================================
// CLOSE MANAGE PROJECTS MODAL
// =====================================================

function closeManageProjectsModal() {

  const modal =
    document.getElementById(
      "manageProjectsModal"
    );

  if (!modal) return;

  modal.classList.add("hidden");
}


// =====================================================
// RENDER MANAGE PROJECTS CONTENT
// =====================================================

function renderManageProjectsContent() {

  const container =
    document.getElementById(
      "manageProjectsContent"
    );

  if (!container) return;

  container.innerHTML = "";

  // =========================================
  // FILTERED PROJECTS
  // =========================================

  let filteredProjects = [];

  if (
    currentManageProjectsTab ===
    "current"
  ) {

    filteredProjects =
      projects.filter(
        project =>
          project.status ===
          "active"
      );
  }

  else if (
    currentManageProjectsTab ===
    "paused"
  ) {

    filteredProjects =
      projects.filter(
        project =>
          project.status ===
          "paused"
      );
  }

  else if (
    currentManageProjectsTab ===
    "completed"
  ) {

    filteredProjects =
      projects.filter(
        project =>
          project.status ===
          "completed"
      );
  }

  // =========================================
  // EMPTY STATE
  // =========================================

  if (
    filteredProjects.length === 0
  ) {

    container.innerHTML = `

      <div class="manage-projects-empty">

        No projects here yet.

      </div>
    `;

    return;
  }

  // =========================================
  // RENDER ROWS
  // =========================================

  filteredProjects.forEach(project => {

    const row =
      document.createElement("div");

    row.classList.add(
      "manage-project-row"
    );

    row.innerHTML = `

      <div class="manage-project-name">

        ${project.name}

      </div>

      <div class="manage-project-actions">

        ${
          project.status ===
          "active"

          ? `

            <button
              class="manage-pause-btn"
            >
              Pause
            </button>

            <button
              class="manage-complete-btn"
            >
              Complete
            </button>
          `

          : ""
        }

        ${
          project.status ===
          "paused"

          ? `

            <button
              class="manage-resume-btn"
            >
              Resume
            </button>
          `

          : ""
        }
        <button
          class="manage-delete-btn"
        >
          Delete
        </button>

      </div>
    `;

    // =====================================
    // PAUSE
    // =====================================

    row
      .querySelector(
        ".manage-pause-btn"
      )
      ?.addEventListener(
        "click",
        () => {

          pauseProject(project.id);

        }
      );

    // =====================================
    // COMPLETE
    // =====================================

    row
      .querySelector(
        ".manage-complete-btn"
      )
      ?.addEventListener(
        "click",
        () => {

          completeProject(project.id);

        }
      );

    // =====================================
    // RESUME
    // =====================================

    row
      .querySelector(
        ".manage-resume-btn"
      )
      ?.addEventListener(
        "click",
        () => {

          resumeProject(project.id);

        }
      );

      // =====================================
      // DELETE
      // =====================================

      row
        .querySelector(
          ".manage-delete-btn"
        )
        ?.addEventListener(
          "click",
          () => {

            deleteProject(project.id);

          }
        );

    container.appendChild(row);
  });
}


// =====================================================
// UPDATE PROJECT TAB COUNTS
// =====================================================

function updateManageProjectsCounts() {

  const currentCount =
    projects.filter(
      project =>
        project.status === "active"
    ).length;

  const pausedCount =
    projects.filter(
      project =>
        project.status === "paused"
    ).length;

  const completedCount =
    projects.filter(
      project =>
        project.status === "completed"
    ).length;

  // =========================================
  // UPDATE UI
  // =========================================

  const currentTab =
    document.getElementById(
      "currentProjectsTab"
    );

  const pausedTab =
    document.getElementById(
      "pausedProjectsTab"
    );

  const completedTab =
    document.getElementById(
      "completedProjectsTab"
    );

  if (currentTab) {

    currentTab.textContent =
      `Current (${currentCount})`;
  }

  if (pausedTab) {

    pausedTab.textContent =
      `Paused (${pausedCount})`;
  }

  if (completedTab) {

    completedTab.textContent =
      `Completed (${completedCount})`;
  }
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
  // DUPLICATE NAME CHECK
  // =========================================

  const duplicateProject =
    projects.find(project =>

      project.name
        .trim()
        .toLowerCase()

      ===

      name
        .toLowerCase()
    );

  if (duplicateProject) {

    alert(
      "A project with this name already exists."
    );

    return;
  }

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

    status: "active",

    logs: {}
  });

  persistProjects();

  nameInput.value = "";
  targetInput.value = "";

  renderProjects();

  renderProjectsStats();

  updateManageProjectsCounts();

  renderManageProjectsContent();

  showToast(
    `Project "${name}" added`
  );
}

// =====================================================
// INITIALIZE MANAGE PROJECTS EVENTS
// =====================================================

function initializeManageProjectsEvents() {

  // =========================================
  // BACKDROP CLOSE
  // =========================================

  const manageModal =
    document.getElementById(
      "manageProjectsModal"
    );

  manageModal?.addEventListener(
    "click",
    (e) => {

      if (e.target === manageModal) {

        closeManageProjectsModal();
      }

    }
  );

  // =========================================
  // CLOSE
  // =========================================

  document
    .getElementById(
      "closeManageProjectsModalBtn"
    )
    ?.addEventListener(
      "click",
      closeManageProjectsModal
    );

  // =========================================
  // TABS
  // =========================================

  document
    .querySelectorAll(
      ".manage-projects-tab"
    )
    .forEach(tab => {

      tab.addEventListener(
        "click",
        () => {

          currentManageProjectsTab =
            tab.dataset.tab;

          document
            .querySelectorAll(
              ".manage-projects-tab"
            )
            .forEach(t => {

              t.classList.remove(
                "active"
              );
            });

          tab.classList.add(
            "active"
          );

          renderManageProjectsContent();
        }
      );
    });

    document
    .getElementById(
      "saveProjectBtn"
    )
    ?.addEventListener(
      "click",
      saveProject
    );

}


// =====================================================
// DELETE PROJECT
// =====================================================

function deleteProject(projectId) {

  const project =
    projects.find(
      p => p.id === projectId
    );

  if (!project) return;

  const confirmed =
    confirm(

`Delete "${project.name}"?

This will permanently remove:
• all logged hours
• analytics history
• project progress data

This action cannot be undone.`

    );

  if (!confirmed) {
    return;
  }

  projects =
    projects.filter(
      p => p.id !== projectId
    );

  persistProjects();

  renderProjects();

  renderProjectsStats();

  updateManageProjectsCounts();

  renderManageProjectsContent();

  showToast(
    `Project "${project.name}" deleted`
  );
}

// =====================================================
// PAUSE PROJECT
// =====================================================

function pauseProject(projectId) {

  const project =
    projects.find(
      p => p.id === projectId
    );

  if (!project) return;

  project.status = "paused";

  persistProjects();

  renderProjects();

  renderProjectsStats();

  updateManageProjectsCounts();

  renderManageProjectsContent();

  showToast(
    `Project "${project.name}" paused`
  );
}


// =====================================================
// RESUME PROJECT
// =====================================================

function resumeProject(projectId) {

  const project =
    projects.find(
      p => p.id === projectId
    );

  if (!project) return;

  project.status = "active";

  persistProjects();

  renderProjects();

  renderProjectsStats();

  updateManageProjectsCounts();

  renderManageProjectsContent();

  showToast(
    `Project "${project.name}" resumed`
  );
}


// =====================================================
// COMPLETE PROJECT
// =====================================================

function completeProject(projectId) {

  const project =
    projects.find(
      p => p.id === projectId
    );

  if (!project) return;

  const confirmed =
    confirm(

`Mark "${project.name}" as completed?

The project will be removed from active tracking
but its analytics history will be preserved.`

    );

  if (!confirmed) {
    return;
  }

  project.status = "completed";

  persistProjects();

  renderProjects();

  renderProjectsStats();

  updateManageProjectsCounts();

  renderManageProjectsContent();

  showToast(
    `Project "${project.name}" completed`
  );
}


// =========================================
// HELPERS
// =========================================

function parseLocalDate(dateString) {

  const [year, month, day] =
    dateString.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

function getDateKey(date) {

  return date
    .toISOString()
    .split("T")[0];
}