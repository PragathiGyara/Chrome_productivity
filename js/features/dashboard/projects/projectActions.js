// =====================================================
// PROJECT ACTIONS
//
// Responsibilities:
// - Create projects
// - Delete projects
// - Pause projects
// - Resume projects
// - Complete projects
//
// Does NOT:
// - Render tracker UI
// - Render analytics UI
// - Render modal UI
//
// After modifying project data,
// always call refreshProjectsUI().
// =====================================================


// =====================================================
// REFRESH PROJECT UI
// =====================================================

function refreshProjectsUI() {

  persistProjects();

  renderProjects();

  renderProjectsStats();

  renderProjectsAnalytics();

  updateManageProjectsCounts();

  renderManageProjectsContent();

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

    alert(
      "Project name required."
    );

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
  // DUPLICATE NAME CHECK
  // =========================================

  const duplicateProject =
    projects.find(project =>

      project.name
        .trim()
        .toLowerCase()

      ===

      name.toLowerCase()
    );

  if (duplicateProject) {

    alert(
      "A project with this name already exists."
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
      getLocalDateKey(),

    status:
      "active",

    logs: {}

  });

  nameInput.value = "";
  targetInput.value = "";

  refreshProjectsUI();

  showToast(
    `Project "${name}" added`
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

  refreshProjectsUI();

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

  project.status =
    "paused";

  refreshProjectsUI();

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

  project.status =
    "active";

  refreshProjectsUI();

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

  project.status =
    "completed";

  refreshProjectsUI();

  showToast(
    `Project "${project.name}" completed`
  );
}