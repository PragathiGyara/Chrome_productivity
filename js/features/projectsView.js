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
         PROJECTS LIST
    ============================== -->

    <div id="projectsList"></div>

    <!-- =============================
        PROJECT STATS
    ============================== -->

    <div id="projectsStats"></div>
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
// RENDER PROJECT STATS
// =====================================================

function renderProjectsStats() {

  const container =
    document.getElementById(
      "projectsStats"
    );

  if (!container) return;

  // =========================================
  // WEEKLY CALCULATIONS
  // =========================================

  let expectedHours = 0;

  let actualHours = 0;

  const today = new Date();

  projects.forEach(project => {

    // Expected

    expectedHours +=
      project.targetHoursPerDay * 7;

    // Actual

    Object.entries(
      project.logs || {}
    ).forEach(([date, hours]) => {

      const logDate =
        new Date(date);

      const diff =
        (
          today - logDate
        ) / (1000 * 60 * 60 * 24);

      if (diff >= 0 && diff < 7) {

        actualHours += hours;
      }

    });

  });

  // =========================================
  // PROGRESS
  // =========================================

  const percentage =
    expectedHours > 0
      ? Math.min(
          (
            actualHours /
            expectedHours
          ) * 100,
          100
        )
      : 0;

  // =========================================
  // RENDER
  // =========================================

  container.innerHTML = `

    <div class="projects-stats-card">

      <div class="projects-stats-title">

        Weekly Progress

      </div>

      <div class="projects-stats-hours">

        <span>
          ${actualHours.toFixed(1)}h
        </span>

        <span class="stats-divider">
          /
        </span>

        <span>
          ${expectedHours.toFixed(1)}h
        </span>

      </div>

      <div class="project-progress">

        <div
          class="project-progress-fill"
          style="width: ${percentage}%"
        ></div>

      </div>

      <div class="projects-stats-percent">

        ${percentage.toFixed(0)}%
        completed

      </div>

    </div>
  `;
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

    logs: {}
  });

  persistProjects();

  closeAddProjectModal();

  renderProjects();

  showToast(
    `Project "${name}" added`
  );
}