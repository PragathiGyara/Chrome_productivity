// =====================================================
// PROJECT MANAGEMENT MODAL
//
// Responsibilities:
// - Open / Close project management modal
// - Manage Current / Paused / Completed tabs
// - Render project rows inside modal
// - Connect modal actions to projectActions.js
//
// Depends On:
// - projects
// - saveProject()
// - deleteProject()
// - pauseProject()
// - resumeProject()
// - completeProject()
//
// Does NOT:
// - Render project tracker
// - Render analytics
// - Modify project data directly
// =====================================================


// =====================================================
// MODAL STATE
// =====================================================

let currentManageProjectsTab =
  "current";


// =====================================================
// OPEN MODAL
// =====================================================

function openManageProjectsModal() {

  const modal =
    document.getElementById(
      "manageProjectsModal"
    );

  if (!modal) return;

  modal.classList.remove("hidden");

  resetManageProjectsTabs();

  updateManageProjectsCounts();

  renderManageProjectsContent();
}


// =====================================================
// CLOSE MODAL
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
// TAB HELPERS
// =====================================================

function resetManageProjectsTabs() {

  currentManageProjectsTab =
    "current";

  document
    .querySelectorAll(
      ".manage-projects-tab"
    )
    .forEach(tab => {

      tab.classList.remove("active");

      if (
        tab.dataset.tab ===
        "current"
      ) {

        tab.classList.add("active");
      }

    });
}


function getProjectsForCurrentTab() {

  const statusMap = {

    current:
      "active",

    paused:
      "paused",

    completed:
      "completed"
  };

  return projects.filter(
    project =>
      project.status ===
      statusMap[
        currentManageProjectsTab
      ]
  );
}


// =====================================================
// RENDER CONTENT
// =====================================================

function renderManageProjectsContent() {

  const container =
    document.getElementById(
      "manageProjectsContent"
    );

  if (!container) return;

  container.innerHTML = "";

  const filteredProjects =
    getProjectsForCurrentTab();

  // =========================================
  // EMPTY STATE
  // =========================================

  if (
    filteredProjects.length === 0
  ) {

    container.innerHTML = `

      <div
        class="manage-projects-empty"
      >

        No projects here yet.

      </div>
    `;

    return;
  }

  // =========================================
  // PROJECT ROWS
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
          project.status === "active"

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
          project.status === "paused"

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

    attachProjectRowActions(
      row,
      project
    );

    container.appendChild(row);
  });
}


// =====================================================
// ROW ACTIONS
// =====================================================

function attachProjectRowActions(
  row,
  project
) {

  row
    .querySelector(
      ".manage-pause-btn"
    )
    ?.addEventListener(
      "click",
      () => {

        pauseProject(
          project.id
        );

      }
    );

  row
    .querySelector(
      ".manage-complete-btn"
    )
    ?.addEventListener(
      "click",
      () => {

        completeProject(
          project.id
        );

      }
    );

  row
    .querySelector(
      ".manage-resume-btn"
    )
    ?.addEventListener(
      "click",
      () => {

        resumeProject(
          project.id
        );

      }
    );

  row
    .querySelector(
      ".manage-delete-btn"
    )
    ?.addEventListener(
      "click",
      () => {

        deleteProject(
          project.id
        );

      }
    );
}


// =====================================================
// TAB COUNTS
// =====================================================

function updateManageProjectsCounts() {

  const currentCount =
    projects.filter(
      project =>
        project.status ===
        "active"
    ).length;

  const pausedCount =
    projects.filter(
      project =>
        project.status ===
        "paused"
    ).length;

  const completedCount =
    projects.filter(
      project =>
        project.status ===
        "completed"
    ).length;

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
// EVENT BINDING
//
// Called ONCE during app startup.
// Never call from renderProjectsView().
// =====================================================

function attachManageProjectsEvents() {

  const modal =
    document.getElementById(
      "manageProjectsModal"
    );

  modal?.addEventListener(
    "click",
    (e) => {

      if (e.target === modal) {

        closeManageProjectsModal();
      }

    }
  );

  document
    .getElementById(
      "closeManageProjectsModalBtn"
    )
    ?.addEventListener(
      "click",
      closeManageProjectsModal
    );

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