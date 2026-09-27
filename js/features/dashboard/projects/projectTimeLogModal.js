// =====================================================
// PROJECT TIME LOG MODAL
// =====================================================
//
// Separate modal used when adding time directly
// from the Project Time Tracker.
//
// IMPORTANT:
// This does NOT use the existing Time Log modal.
//
// It writes to the SAME timeLogEntries storage,
// so entries created here automatically appear
// inside Time Log.
// =====================================================


// =====================================================
// STATE
// =====================================================

let projectTimeLogProjectId = null;
let projectTimeLogTrackId = null;


// =====================================================
// INITIALIZE
// =====================================================

function initializeProjectTimeLogModal() {

  const closeBtn =
    document.getElementById(
      "closeProjectTimeLogModalBtn"
    );

  const saveBtn =
    document.getElementById(
      "saveProjectTimeLogBtn"
    );


  closeBtn?.addEventListener(
    "click",
    closeProjectTimeLogModal
  );


  saveBtn?.addEventListener(
    "click",
    saveProjectTimeLogActivity
  );


  const modal =
    document.getElementById(
      "projectTimeLogModal"
    );


  modal?.addEventListener(
    "click",
    e => {

      if (
        e.target === modal
      ) {

        closeProjectTimeLogModal();

      }

    }
  );

}


// =====================================================
// OPEN MODAL
// =====================================================

function openProjectTimeLogModal(
  project,
  selectedDate
) {

  if (!project) return;


  // -------------------------------------
  // FIND TRACK
  // -------------------------------------

  let owningTrack = null;

  for (const track of tracks) {

    const foundProject =
      (track.projects || []).find(
        item =>
          String(item.id) ===
          String(project.id)
      );

    if (foundProject) {

      owningTrack = track;

      break;

    }

  }


  if (!owningTrack) {

    console.error(
      "Could not find track for project:",
      project.id
    );

    return;

  }


  // -------------------------------------
  // STORE CONTEXT
  // -------------------------------------

  projectTimeLogProjectId =
    project.id;

  projectTimeLogTrackId =
    owningTrack.id;


  // -------------------------------------
  // ACTIVITY
  // -------------------------------------

  const activityInput =
    document.getElementById(
      "projectTimeLogActivityInput"
    );

  if (activityInput) {

    activityInput.value = "";

  }


  // -------------------------------------
  // TRACK
  // -------------------------------------

  const trackSelect =
    document.getElementById(
      "projectTimeLogTrackSelect"
    );

  if (trackSelect) {

    trackSelect.innerHTML = "";

    const trackOption =
      document.createElement("option");

    trackOption.value =
      owningTrack.id;

    trackOption.textContent =
      owningTrack.name;

    trackOption.selected = true;

    trackSelect.appendChild(
      trackOption
    );

  }


  // -------------------------------------
  // PROJECT
  // -------------------------------------

  const projectSelect =
    document.getElementById(
      "projectTimeLogProjectSelect"
    );

  if (projectSelect) {

    projectSelect.innerHTML = "";

    const projectOption =
      document.createElement("option");

    projectOption.value =
      project.id;

    projectOption.textContent =
      project.name;

    projectOption.selected = true;

    projectSelect.appendChild(
      projectOption
    );

  }


  // -------------------------------------
  // DATE
  // -------------------------------------

  const dateInput =
    document.getElementById(
      "projectTimeLogDateInput"
    );

  if (dateInput) {

    dateInput.value =
      selectedDate ||
      getLocalDateKey(new Date());

  }


  // -------------------------------------
  // TIME
  // -------------------------------------

  populateProjectTimeLogTimes(
    "09:00",
    "10:00"
  );


  // -------------------------------------
  // OPEN
  // -------------------------------------

  const modal =
    document.getElementById(
      "projectTimeLogModal"
    );

  if (!modal) return;


  modal.classList.remove(
    "hidden"
  );


  // -------------------------------------
  // FOCUS ACTIVITY
  // -------------------------------------

  setTimeout(
    () => {

      activityInput?.focus();

    },
    50
  );

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


  modal.classList.add(
    "hidden"
  );


  projectTimeLogProjectId =
    null;

  projectTimeLogTrackId =
    null;

}


// =====================================================
// POPULATE TIMES
// =====================================================

function populateProjectTimeLogTimes(
  startTime = "09:00",
  endTime = "10:00"
) {

  const startSelect =
    document.getElementById(
      "projectTimeLogStartTime"
    );

  const endSelect =
    document.getElementById(
      "projectTimeLogEndTime"
    );


  if (!startSelect || !endSelect) {
    return;
  }


  startSelect.innerHTML = "";
  endSelect.innerHTML = "";


  // -------------------------------------
  // GENERATE HOURLY OPTIONS
  // -------------------------------------

  for (
    let hour = 0;
    hour < 24;
    hour++
  ) {

    const value =
      `${String(hour).padStart(2, "0")}:00`;


    const label =
      value;


    const startOption =
      document.createElement("option");

    startOption.value =
      value;

    startOption.textContent =
      label;

    startSelect.appendChild(
      startOption
    );


    const endOption =
      document.createElement("option");

    endOption.value =
      value;

    endOption.textContent =
      label;

    endSelect.appendChild(
      endOption
    );

  }


  // -------------------------------------
  // ENSURE SELECTED VALUES EXIST
  // -------------------------------------

  ensureProjectTimeLogTimeOption(
    startSelect,
    startTime
  );

  ensureProjectTimeLogTimeOption(
    endSelect,
    endTime
  );


  startSelect.value =
    startTime;

  endSelect.value =
    endTime;

}


// =====================================================
// ENSURE TIME OPTION
// =====================================================

function ensureProjectTimeLogTimeOption(
  select,
  value
) {

  if (
    !value ||
    select.querySelector(
      `option[value="${value}"]`
    )
  ) {

    return;

  }


  const option =
    document.createElement("option");

  option.value =
    value;

  option.textContent =
    value;

  select.appendChild(
    option
  );

}


// =====================================================
// SAVE
// =====================================================

function saveProjectTimeLogActivity() {

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


  const activity =
    activityInput?.value.trim();


  const date =
    dateInput?.value;


  const start =
    startSelect?.value;


  const end =
    endSelect?.value;


  // -------------------------------------
  // VALIDATION
  // -------------------------------------

  if (!activity) {

    alert(
      "Please enter an activity."
    );

    activityInput?.focus();

    return;

  }


  if (!date) {

    alert(
      "Please select a date."
    );

    return;

  }


  if (!start || !end) {

    alert(
      "Please select a start and end time."
    );

    return;

  }


  if (start >= end) {

    alert(
      "End time must be after start time."
    );

    return;

  }


  if (
    !projectTimeLogTrackId ||
    !projectTimeLogProjectId
  ) {

    alert(
      "Project information is missing."
    );

    return;

  }


  // -------------------------------------
  // LOAD CURRENT TIME LOG
  // -------------------------------------

  const timeLogEntries =
    loadTimeLogEntriesFromStorage();


  // -------------------------------------
  // CHECK OVERLAP
  // -------------------------------------

  const hasOverlap =
    timeLogEntries.some(
      entry => {

        if (
          entry.date !== date
        ) {

          return false;

        }


        const existingStart =
          entry.start;

        const existingEnd =
          entry.end;


        return (
          start < existingEnd &&
          end > existingStart
        );

      }
    );


  if (hasOverlap) {

    alert(
      "This time overlaps with an existing Time Log entry."
    );

    return;

  }


  // -------------------------------------
  // CREATE ENTRY
  // -------------------------------------

  const newEntry = {

    id: Date.now(),

    title:
      activity,

    trackId:
      projectTimeLogTrackId,

    projectId:
      projectTimeLogProjectId,

    start:
      start,

    end:
      end,

    date:
      date

  };


  timeLogEntries.push(
    newEntry
  );


  // -------------------------------------
  // SAVE
  // -------------------------------------

  saveTimeLogEntriesToStorage(
    timeLogEntries
  );


  // -------------------------------------
  // CLOSE
  // -------------------------------------

  closeProjectTimeLogModal();


  // -------------------------------------
  // REFRESH TIME LOG
  // -------------------------------------

  if (
    typeof renderTimeLogEntries ===
    "function"
  ) {

    renderTimeLogEntries();

  }

}


// =====================================================
// INITIALIZE AFTER DOM LOAD
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    initializeProjectTimeLogModal();

  }
);