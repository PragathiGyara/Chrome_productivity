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
// FIND PROJECT
// =====================================================

function findProjectById(projectId) {

  for (const track of tracks) {

    const project =
      (track.projects || []).find(
        project =>
          String(project.id) ===
          String(projectId)
      );

    if (project) {

      return {
        project,
        track
      };

    }

  }

  return null;

}

// =====================================================
// REFRESH PROJECT UI
// =====================================================

function refreshProjectsUI() {

  persistProjects();

  renderProjects();

  renderHourDistribution();

  renderProjectsStats();

  renderProjectsAnalytics();

  updateManageProjectsCounts();

  renderManageProjectsContent();

}

// =====================================================
// POPULATE PROJECT TRACK SELECT
// =====================================================

function populateProjectTrackSelect() {

  const select =
    document.getElementById(
      "projectTrackSelect"
    );

  if (!select) return;

  select.innerHTML = `
    <option value="">
      Select Track
    </option>
  `;

  tracks.forEach(track => {

    const option =
      document.createElement("option");

    option.value =
      track.id;

    option.textContent =
      `${track.icon} ${track.name}`;

    select.appendChild(option);

  });

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

  const trackSelect =
    document.getElementById(
      "projectTrackSelect"
    );

  const name =
    nameInput.value.trim();

  const targetHours =
    Number(targetInput.value);

  const selectedTrackId =
    trackSelect?.value || "";


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

  if (!selectedTrackId) {

    alert(
      "Please select a track."
    );

    return;
  }


  // =========================================
  // FIND SELECTED TRACK
  // =========================================

  const selectedTrack =
    tracks.find(
      track =>
        String(track.id) ===
        String(selectedTrackId)
    );

  if (!selectedTrack) {

    alert(
      "Selected track could not be found."
    );

    populateProjectTrackSelect();

    return;
  }


  // =========================================
  // ENSURE PROJECT ARRAY EXISTS
  // =========================================

  if (!selectedTrack.projects) {

    selectedTrack.projects = [];

  }


  // =========================================
  // DUPLICATE NAME CHECK
  // =========================================

  const duplicateProject =
    selectedTrack.projects.find(
      project =>
        project.name
          .trim()
          .toLowerCase()
        ===
        name.toLowerCase()
    );

  if (duplicateProject) {

    alert(
      "A project with this name already exists in this track."
    );

    return;
  }


  // =========================================
  // CREATE PROJECT
  // =========================================

  const project = {

    id:
      Date.now(),

    name,

    targetHoursPerDay:
      targetHours,

    createdAt:
      new Date().toISOString(),

    status:
      "active",

    logs: {},

    statusHistory: [

      {
        status:
          "active",

        date:
          getLocalDateKey(),

        time:
          getLocalTime()
      }

    ],

    reading: [],

    deadlines: [],

    tasks: [],

    notes: ""

  };


  // =========================================
  // SAVE PROJECT INSIDE SELECTED TRACK
  // =========================================

  selectedTrack.projects.push(
    project
  );


  // =========================================
  // PERSIST TRACKS
  // =========================================

  persistTracks();


  // =========================================
  // RESET FORM
  // =========================================

  nameInput.value = "";

  targetInput.value = "";

  if (trackSelect) {

    trackSelect.value = "";

  }


  // =========================================
  // CONFIRMATION
  // =========================================

  showToast(
    `Project "${name}" added to ${selectedTrack.name}`
  );

}


// =====================================================
// DELETE PROJECT
// =====================================================

function deleteProject(projectId) {

  const result =
    findProjectById(projectId);

  if (!result) return;

  const {
    project,
    track
  } = result;

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

  track.projects =
    track.projects.filter(
      p =>
        String(p.id) !==
        String(projectId)
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

  const result =
    findProjectById(projectId);

  if (!result) return;

  const {
    project
  } = result;

  project.status =
    "paused";

  project.statusHistory.push({

    status:
      "paused",

    date:
      getLocalDateKey(),

    time:
      getLocalTime()

  });

  refreshProjectsUI();

  showToast(
    `Project "${project.name}" paused`
  );
}


// =====================================================
// RESUME PROJECT
// =====================================================

function resumeProject(projectId) {

  const result =
    findProjectById(projectId);

  if (!result) return;

  const {
    project
  } = result;

  project.status =
    "active";

  project.statusHistory.push({

    status:
      "active",

    date:
      getLocalDateKey(),

    time:
      getLocalTime()

  });

  refreshProjectsUI();

  showToast(
    `Project "${project.name}" resumed`
  );
}


// =====================================================
// COMPLETE PROJECT
// =====================================================

function completeProject(projectId) {

  const result =
    findProjectById(projectId);

  if (!result) return;

  const {
    project
  } = result;

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

  project.statusHistory.push({

    status:
      "completed",

    date:
      getLocalDateKey(),

    time:
      getLocalTime()

  });

  refreshProjectsUI();

  showToast(
    `Project "${project.name}" completed`
  );
}