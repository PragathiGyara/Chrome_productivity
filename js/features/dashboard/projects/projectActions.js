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
    nameInput?.value.trim();

  const targetHours =
    Number(
      targetInput?.value
    );

  const trackId =
    trackSelect?.value;


  // =====================================
  // VALIDATION
  // =====================================

  if (!name) {

    alert(
      "Please enter a project name."
    );

    return;

  }


  if (
    !targetHours ||
    targetHours <= 0
  ) {

    alert(
      "Please enter valid hours per day."
    );

    return;

  }


  if (!trackId) {

    alert(
      "Please select a track."
    );

    return;

  }


  // =====================================
  // FIND TRACK
  // =====================================

  const track =
    tracks.find(
      item =>
        String(item.id) ===
        String(trackId)
    );


  if (!track) {

    alert(
      "Track not found."
    );

    return;

  }


  // =====================================
  // DUPLICATE NAME CHECK
  // =====================================

  const duplicate =
    (track.projects || []).some(
      project =>
        String(project.id) !== "general" &&
        project.name.trim().toLowerCase() ===
          name.toLowerCase()
    );


  if (duplicate) {

    alert(
      "A project with this name already exists in this track."
    );

    return;

  }


  // =====================================
  // CREATE PROJECT
  // =====================================

  const today =
    getLocalDateKey(
      new Date()
    );


  const project = {

    id:
      Date.now(),

    name:
      name,

    targetHoursPerDay:
      targetHours,

    targetHoursHistory: [

      {
        hours:
          targetHours,

        date:
          today
      }

    ],

    createdAt:
      new Date().toISOString(),

    status:
      "active",

    statusHistory: [

      {
        status:
          "active",

        date:
          today,

        time:
          getLocalTime(
            new Date()
          )
      }

    ],

    logs: {},

    reading: [],

    deadlines: [],

    tasks: [],

    notes: ""

  };


  // =====================================
  // ADD TO TRACK
  // =====================================

  if (!track.projects) {

    track.projects = [];

  }


  track.projects.push(
    project
  );


  // =====================================
  // SAVE
  // =====================================

  persistTracks();


  // =====================================
  // CLEAR FORM
  // =====================================

  if (nameInput) {

    nameInput.value = "";

  }

  if (targetInput) {

    targetInput.value = "";

  }

  if (trackSelect) {

    trackSelect.value = "";

  }


  // =====================================
  // REFRESH UI
  // =====================================

  renderManageProjectsContent();

  updateManageProjectsCounts();

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

// =====================================================
// EDIT PROJECT
// =====================================================

function editProject(
  projectId,
  newName,
  newTargetHours
) {

  const result =
    findProjectById(
      projectId
    );


  if (!result) {

    alert(
      "Project not found."
    );

    return false;

  }


  const project =
    result.project;

  const track =
    result.track;


  const name =
    newName.trim();

  const targetHours =
    Number(
      newTargetHours
    );


  // =====================================
  // VALIDATE NAME
  // =====================================

  if (!name) {

    alert(
      "Please enter a project name."
    );

    return false;

  }


  // =====================================
  // VALIDATE HOURS
  // =====================================

  if (
    !targetHours ||
    targetHours <= 0
  ) {

    alert(
      "Please enter valid hours per day."
    );

    return false;

  }


  // =====================================
  // DUPLICATE NAME CHECK
  // =====================================

  const duplicate =
    (track.projects || []).some(
      otherProject =>

        String(otherProject.id) !==
          String(project.id) &&

        String(otherProject.id) !==
          "general" &&

        otherProject.name
          .trim()
          .toLowerCase() ===
          name.toLowerCase()

    );


  if (duplicate) {

    alert(
      "A project with this name already exists in this track."
    );

    return false;

  }


  // =====================================
  // UPDATE NAME
  // =====================================

  project.name =
    name;


  // =====================================
  // UPDATE TARGET HOURS
  // =====================================

  const today =
    getLocalDateKey(
      new Date()
    );


  if (
    !Array.isArray(
      project.targetHoursHistory
    )
  ) {

    project.targetHoursHistory = [];

  }


  const todayHistoryEntry =
    project.targetHoursHistory.find(
      entry =>
        entry.date === today
    );


  if (todayHistoryEntry) {

    todayHistoryEntry.hours =
      targetHours;

  } else {

    project.targetHoursHistory.push({

      hours:
        targetHours,

      date:
        today

    });

  }


  project.targetHoursPerDay =
    targetHours;


  // =====================================
  // SAVE
  // =====================================

  persistTracks();


  return true;

}