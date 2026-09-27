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

  populateProjectTrackSelect();

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


// =====================================================
// GET PROJECTS FOR CURRENT TAB
// =====================================================

function getProjectsForCurrentTab() {

  const statusMap = {

    current:
      "active",

    paused:
      "paused",

    completed:
      "completed"

  };

  const targetStatus =
    statusMap[
      currentManageProjectsTab
    ];

  return tracks.flatMap(track =>

    (track.projects || [])

      .filter(
        project =>
          String(project.id) !==
          "general"
      )

      .map(project => ({

        ...project,

        trackId:
          track.id,

        trackName:
          track.name,

        trackIcon:
          track.icon

      }))

  ).filter(

    project =>
      project.status ===
      targetStatus

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

  filteredProjects.forEach(
    project => {

      const row =
        document.createElement(
          "div"
        );


      row.classList.add(
        "manage-project-row"
      );


      row.innerHTML = `

        <div class="manage-project-name">
          ${project.name}
        </div>


        <div class="manage-project-actions">

          <button
            class="manage-edit-btn"
          >
            Edit
          </button>


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


      container.appendChild(
        row
      );

    }
  );

}


// =====================================================
// ROW ACTIONS
// =====================================================

function attachProjectRowActions(
  row,
  project
) {

  // =====================================
  // EDIT PROJECT
  //
  // Clicking anywhere on the project row
  // opens the edit modal.
  // =====================================

  row.addEventListener(
    "click",
    e => {

      // Do not open Edit when clicking
      // one of the action buttons.

      if (
        e.target.closest(
          "button"
        )
      ) {

        return;

      }


      openEditProjectModal(
        project.id
      );

    }
  );


  // =====================================
  // EDIT BUTTON
  // =====================================

  row
    .querySelector(
      ".manage-edit-btn"
    )
    ?.addEventListener(
      "click",
      () => {

        openEditProjectModal(
          project.id
        );

      }
    );


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

        pauseProject(
          project.id
        );

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

        completeProject(
          project.id
        );

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

        resumeProject(
          project.id
        );

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

  const allProjects =
    tracks.flatMap(
      track =>
        (track.projects || [])
          .filter(
            project =>
              String(project.id) !==
              "general"
          )
    );

  const currentCount =
    allProjects.filter(
      project =>
        project.status ===
        "active"
    ).length;

  const pausedCount =
    allProjects.filter(
      project =>
        project.status ===
        "paused"
    ).length;

  const completedCount =
    allProjects.filter(
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
    e => {

      if (
        e.target === modal
      ) {

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
    .forEach(
      tab => {

        tab.addEventListener(
          "click",
          () => {

            currentManageProjectsTab =
              tab.dataset.tab;


            document
              .querySelectorAll(
                ".manage-projects-tab"
              )
              .forEach(
                t => {

                  t.classList.remove(
                    "active"
                  );

                }
              );


            tab.classList.add(
              "active"
            );


            renderManageProjectsContent();

          }
        );

      }
    );


  // =====================================
  // CREATE PROJECT
  // =====================================

  document
    .getElementById(
      "saveProjectBtn"
    )
    ?.addEventListener(
      "click",
      saveProject
    );


  // =====================================
  // EDIT PROJECT MODAL
  // =====================================

  const editModal =
    document.getElementById(
      "editProjectModal"
    );


  editModal?.addEventListener(
    "click",
    e => {

      if (
        e.target === editModal
      ) {

        closeEditProjectModal();

      }

    }
  );


  document
    .getElementById(
      "closeEditProjectModalBtn"
    )
    ?.addEventListener(
      "click",
      closeEditProjectModal
    );


  document
    .getElementById(
      "saveEditProjectBtn"
    )
    ?.addEventListener(
      "click",
      saveEditedProject
    );

}

// =====================================================
// EDIT PROJECT MODAL STATE
// =====================================================

let editingProjectId = null;


// =====================================================
// OPEN EDIT PROJECT MODAL
// =====================================================

function openEditProjectModal(
  projectId
) {

  const result =
    findProjectById(
      projectId
    );


  if (!result) {

    alert(
      "Project not found."
    );

    return;

  }


  const project =
    result.project;

  const track =
    result.track;


  editingProjectId =
    project.id;


  // =====================================
  // PROJECT NAME
  // =====================================

  const nameInput =
    document.getElementById(
      "editProjectNameInput"
    );


  if (nameInput) {

    nameInput.value =
      project.name;

  }


  // =====================================
  // TARGET HOURS
  // =====================================

  const targetInput =
    document.getElementById(
      "editProjectTargetInput"
    );


  if (targetInput) {

    targetInput.value =
      project.targetHoursPerDay || "";

  }


  // =====================================
  // TRACK
  // =====================================

  const trackDisplay =
    document.getElementById(
      "editProjectTrackDisplay"
    );


  if (trackDisplay) {

    trackDisplay.value =
      track.name;

  }


  // =====================================
  // OPEN
  // =====================================

  const modal =
    document.getElementById(
      "editProjectModal"
    );


  if (!modal) return;


  modal.classList.remove(
    "hidden"
  );


  setTimeout(
    () => {

      nameInput?.focus();

    },
    50
  );

}


// =====================================================
// CLOSE EDIT PROJECT MODAL
// =====================================================

function closeEditProjectModal() {

  const modal =
    document.getElementById(
      "editProjectModal"
    );


  if (!modal) return;


  modal.classList.add(
    "hidden"
  );


  editingProjectId =
    null;

}


// =====================================================
// SAVE EDITED PROJECT
// =====================================================

function saveEditedProject() {

  if (
    editingProjectId === null
  ) {

    return;

  }


  const nameInput =
    document.getElementById(
      "editProjectNameInput"
    );

  const targetInput =
    document.getElementById(
      "editProjectTargetInput"
    );


  const name =
    nameInput?.value.trim();

  const targetHours =
    Number(
      targetInput?.value
    );


  const saved =
    editProject(
      editingProjectId,
      name,
      targetHours
    );


  if (!saved) {

    return;

  }


  closeEditProjectModal();


  renderManageProjectsContent();

  updateManageProjectsCounts();


  // Refresh project tracker if it
  // exists on the current page.

  if (
    typeof renderProjects ===
    "function"
  ) {

    renderProjects();

  }

}