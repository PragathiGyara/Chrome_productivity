// =====================================================
// PROJECT TIME LOG MODAL
// =====================================================
//
// Separate modal for adding time from the Project
// Time Tracker.
//
// Saves directly into the same timeLogEntries storage
// used by the Time Log.
//
// Track + Project are locked because the modal is opened
// from a specific project row.
// =====================================================


// =====================================================
// STATE
// =====================================================

let projectTimeLogProjectId = null;
let projectTimeLogTrackId = null;


// =====================================================
// OPEN MODAL
// =====================================================


function openProjectTimeLogModal(projectOrId, selectedDate) {

  const modal =
    document.getElementById("projectTimeLogModal");

  if (!modal) return;


  // =====================================================
  // RESOLVE PROJECT ID
  // =====================================================

  let projectId;

  if (
    projectOrId &&
    typeof projectOrId === "object"
  ) {
    projectId = projectOrId.id;
  } else {
    projectId = projectOrId;
  }


  // =====================================================
  // FIND PROJECT IN ACTUAL TRACK DATA
  // =====================================================

  let foundProject = null;
  let foundTrack = null;

  for (const track of tracks) {

    const project =
      (track.projects || []).find(
        item =>
          String(item.id) ===
          String(projectId)
      );

    if (project) {

      foundProject = project;
      foundTrack = track;

      break;
    }
  }


  // =====================================================
  // PROJECT NOT FOUND
  // =====================================================

  if (!foundProject || !foundTrack) {

    console.error(
      "Project Time Log: project not found",
      {
        requestedProjectId: projectId,
        originalArgument: projectOrId,
        availableProjects:
          tracks.flatMap(track =>
            (track.projects || []).map(project => ({
              id: project.id,
              name: project.name,
              trackId: track.id,
              trackName: track.name
            }))
          )
      }
    );

    alert("Project not found.");

    return;
  }


  // =====================================================
  // SAVE STATE
  // =====================================================

  projectTimeLogProjectId =
    foundProject.id;

  projectTimeLogTrackId =
    foundTrack.id;


  // =====================================================
  // ACTIVITY
  // =====================================================

  const activityInput =
    document.getElementById(
      "projectTimeLogActivityInput"
    );

  if (activityInput) {
    activityInput.value = "";
  }


  // =====================================================
  // TRACK
  // =====================================================

  const trackSelect =
    document.getElementById(
      "projectTimeLogTrackSelect"
    );

  if (trackSelect) {

    trackSelect.innerHTML = "";

    const option =
      document.createElement("option");

    option.value =
      foundTrack.id;

    option.textContent =
      `${foundTrack.icon || "📁"} ${foundTrack.name}`;

    trackSelect.appendChild(option);

    trackSelect.value =
      String(foundTrack.id);
  }


  // =====================================================
  // PROJECT
  // =====================================================

  const projectSelect =
    document.getElementById(
      "projectTimeLogProjectSelect"
    );

  if (projectSelect) {

    projectSelect.innerHTML = "";

    const option =
      document.createElement("option");

    option.value =
      foundProject.id;

    option.textContent =
      foundProject.name;

    projectSelect.appendChild(option);

    projectSelect.value =
      String(foundProject.id);
  }


  // =====================================================
  // DATE
  // =====================================================

  const dateInput =
    document.getElementById(
      "projectTimeLogDateInput"
    );

  if (dateInput) {

    dateInput.value =
      selectedDate ||
      getLocalDateKey(new Date());
  }


  // =====================================================
  // TIME
  // =====================================================

  populateProjectTimeLogTimeSelects();


  // =====================================================
  // OPEN
  // =====================================================

  modal.classList.remove("hidden");
}



// =====================================================
// CLOSE MODAL
// =====================================================

function closeProjectTimeLogModal() {

  const modal =
    document.getElementById(
      "projectTimeLogModal"
    );

  if (!modal) return;

  modal.classList.add("hidden");

  projectTimeLogProjectId = null;
  projectTimeLogTrackId = null;
}


// =====================================================
// POPULATE TIME SELECTS
// =====================================================

function populateProjectTimeLogTimeSelects() {

  const startSelect =
    document.getElementById(
      "projectTimeLogStartTime"
    );

  const endSelect =
    document.getElementById(
      "projectTimeLogEndTime"
    );

  if (!startSelect || !endSelect) return;


  startSelect.innerHTML = "";
  endSelect.innerHTML = "";


  for (
    let minutes = 0;
    minutes < 24 * 60;
    minutes += 5
  ) {

    const hours =
      Math.floor(minutes / 60);

    const mins =
      minutes % 60;

    const value =
      `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

    const label =
      value;


    // Start

    const startOption =
      document.createElement("option");

    startOption.value = value;
    startOption.textContent = label;

    startSelect.appendChild(startOption);


    // End

    const endOption =
      document.createElement("option");

    endOption.value = value;
    endOption.textContent = label;

    endSelect.appendChild(endOption);
  }


  // ---------------------------------------------------
  // Default times
  // ---------------------------------------------------

  const now =
    new Date();

  const currentMinutes =
    now.getHours() * 60 +
    now.getMinutes();

  const roundedMinutes =
    Math.floor(currentMinutes / 5) * 5;

  const startMinutes =
    Math.max(
      0,
      roundedMinutes - 30
    );

  const endMinutes =
    Math.min(
      23 * 60 + 55,
      roundedMinutes
    );


  startSelect.value =
    minutesToTime(startMinutes);

  endSelect.value =
    minutesToTime(endMinutes);


  // Make sure end is after start

  if (
    timeToMinutes(endSelect.value) <=
    timeToMinutes(startSelect.value)
  ) {

    endSelect.value =
      minutesToTime(
        Math.min(
          startMinutes + 30,
          23 * 60 + 55
        )
      );
  }
}


// =====================================================
// TIME HELPERS
// =====================================================

function timeToMinutes(time) {

  if (!time) return 0;

  const parts =
    time.split(":");

  const hours =
    Number(parts[0]);

  const minutes =
    Number(parts[1]);

  return (
    hours * 60 +
    minutes
  );
}


function minutesToTime(minutes) {

  minutes =
    Math.max(
      0,
      Math.min(
        23 * 60 + 55,
        minutes
      )
    );

  const hours =
    Math.floor(minutes / 60);

  const mins =
    minutes % 60;

  return (
    `${String(hours).padStart(2, "0")}:` +
    `${String(mins).padStart(2, "0")}`
  );
}


// =====================================================
// ADJUST TIME
// =====================================================

function adjustProjectTimeLogTime(
  selectId,
  amount
) {

  const select =
    document.getElementById(selectId);

  if (!select) return;

  const currentMinutes =
    timeToMinutes(select.value);

  const newMinutes =
    currentMinutes + amount;


  // Don't allow times outside the day

  if (
    newMinutes < 0 ||
    newMinutes > 23 * 60 + 55
  ) {
    return;
  }


  select.value =
    minutesToTime(newMinutes);
}


// =====================================================
// OVERLAP CHECK
// =====================================================

function hasProjectTimeLogOverlap(
  entries,
  date,
  start,
  end
) {

  const newStart =
    timeToMinutes(start);

  const newEnd =
    timeToMinutes(end);


  return entries.some(entry => {

    if (entry.date !== date) {
      return false;
    }

    const existingStart =
      timeToMinutes(entry.start);

    const existingEnd =
      timeToMinutes(entry.end);


    return (
      newStart < existingEnd &&
      newEnd > existingStart
    );
  });
}


// =====================================================
// SAVE
// =====================================================

function saveProjectTimeLog() {

  const activityInput =
    document.getElementById(
      "projectTimeLogActivityInput"
    );

  const dateInput =
    document.getElementById(
      "projectTimeLogDateInput"
    );

  const startSelect =
    document.getElementById(
      "projectTimeLogStartTime"
    );

  const endSelect =
    document.getElementById(
      "projectTimeLogEndTime"
    );


  const title =
    activityInput?.value.trim();

  const date =
    dateInput?.value;

  const start =
    startSelect?.value;

  const end =
    endSelect?.value;


  // ---------------------------------------------------
  // Validation
  // ---------------------------------------------------

  if (!title) {

    alert("Please enter an activity.");

    return;
  }

  if (!date) {

    alert("Please select a date.");

    return;
  }

  if (!start || !end) {

    alert("Please select start and end times.");

    return;
  }


  const startMinutes =
    timeToMinutes(start);

  const endMinutes =
    timeToMinutes(end);


  if (endMinutes <= startMinutes) {

    alert(
      "End time must be after start time."
    );

    return;
  }


  if (!projectTimeLogProjectId ||
      !projectTimeLogTrackId) {

    alert(
      "Project or track information is missing."
    );

    return;
  }


  // ---------------------------------------------------
  // Load existing time logs
  // ---------------------------------------------------

  const entries =
    loadTimeLogEntriesFromStorage();


  // ---------------------------------------------------
  // Check overlap
  // ---------------------------------------------------

  if (
    hasProjectTimeLogOverlap(
      entries,
      date,
      start,
      end
    )
  ) {

    alert(
      "This time overlaps with an existing Time Log entry."
    );

    return;
  }


  // ---------------------------------------------------
  // Create entry
  // ---------------------------------------------------

  const entry = {

    id: Date.now(),

    title,

    trackId:
      projectTimeLogTrackId,

    projectId:
      projectTimeLogProjectId,

    start,

    end,

    date
  };


  entries.push(entry);


  // ---------------------------------------------------
  // Save
  // ---------------------------------------------------

  saveTimeLogEntriesToStorage(
    entries
  );


  // ---------------------------------------------------
  // Close
  // ---------------------------------------------------

  closeProjectTimeLogModal();


  // ---------------------------------------------------
  // Refresh Time Log
  // ---------------------------------------------------

  if (
    typeof renderTimeLogEntries ===
    "function"
  ) {

    renderTimeLogEntries();
  }


  // Refresh project tracker if available

  if (
    typeof renderProjects ===
    "function"
  ) {

    renderProjects();
  }
}


// =====================================================
// EVENT BINDING
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const closeBtn =
      document.getElementById(
        "closeProjectTimeLogModalBtn"
      );

    const saveBtn =
      document.getElementById(
        "saveProjectTimeLogBtn"
      );


    // -------------------------------------------------
    // Close
    // -------------------------------------------------

    if (closeBtn) {

      closeBtn.addEventListener(
        "click",
        closeProjectTimeLogModal
      );
    }


    // -------------------------------------------------
    // Save
    // -------------------------------------------------

    if (saveBtn) {

      saveBtn.addEventListener(
        "click",
        saveProjectTimeLog
      );
    }


    // -------------------------------------------------
    // Start -5
    // -------------------------------------------------

    const startMinus5 =
      document.getElementById(
        "projectTimeLogStartMinus5"
      );

    if (startMinus5) {

      startMinus5.addEventListener(
        "click",
        () => {

          adjustProjectTimeLogTime(
            "projectTimeLogStartTime",
            -5
          );

        }
      );
    }


    // -------------------------------------------------
    // Start +5
    // -------------------------------------------------

    const startPlus5 =
      document.getElementById(
        "projectTimeLogStartPlus5"
      );

    if (startPlus5) {

      startPlus5.addEventListener(
        "click",
        () => {

          adjustProjectTimeLogTime(
            "projectTimeLogStartTime",
            5
          );

        }
      );
    }


    // -------------------------------------------------
    // End -5
    // -------------------------------------------------

    const endMinus5 =
      document.getElementById(
        "projectTimeLogEndMinus5"
      );

    if (endMinus5) {

      endMinus5.addEventListener(
        "click",
        () => {

          adjustProjectTimeLogTime(
            "projectTimeLogEndTime",
            -5
          );

        }
      );
    }


    // -------------------------------------------------
    // End +5
    // -------------------------------------------------

    const endPlus5 =
      document.getElementById(
        "projectTimeLogEndPlus5"
      );

    if (endPlus5) {

      endPlus5.addEventListener(
        "click",
        () => {

          adjustProjectTimeLogTime(
            "projectTimeLogEndTime",
            5
          );

        }
      );
    }

  }
);