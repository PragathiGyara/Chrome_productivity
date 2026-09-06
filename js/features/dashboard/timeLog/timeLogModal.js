// =====================================================
// TIME LOG MODAL
// =====================================================

let editingTimeLogEntryId = null;

let timeLogEntries = [];

let selectedTimeLogDate = null;


// =====================================================
// INITIALIZE TIME LOG MODAL
// =====================================================

function initializeTimeLogModal() {

  const closeBtn =
    document.getElementById(
      "closeTimeLogModalBtn"
    );

  const saveBtn =
    document.getElementById(
      "saveTimeLogEntryBtn"
    );

  const deleteBtn =
    document.getElementById(
      "deleteTimeLogEntryBtn"
    );

  const modal =
    document.getElementById(
      "timeLogModal"
    );


  closeBtn?.addEventListener(
    "click",
    closeTimeLogModal
  );


  saveBtn?.addEventListener(
    "click",
    saveTimeLogActivity
  );


  deleteBtn?.addEventListener(
    "click",
    deleteTimeLogActivity
  );


  attachModalBackdropClose(
    modal,
    closeTimeLogModal
  );

}


// =====================================================
// OPEN TIME LOG MODAL
// =====================================================

function openTimeLogModal(
  selectedDate = null,
  startTime = "09:00",
  endTime = "10:00",
  entry = null
) {

  const activityInput =
    document.getElementById(
      "timeLogActivityInput"
    );

  const saveBtn =
    document.getElementById(
      "saveTimeLogEntryBtn"
    );

  const deleteBtn =
    document.getElementById(
      "deleteTimeLogEntryBtn"
    );

  const modalTitle =
    document.getElementById(
      "timeLogModalTitle"
    );


  // ===================================================
  // EDIT EXISTING ENTRY
  // ===================================================

  if (entry) {

    editingTimeLogEntryId =
      entry.id;


    if (activityInput) {

      activityInput.value =
        entry.title || "";

    }


    if (modalTitle) {

      modalTitle.textContent =
        "Edit Activity";

    }


    if (saveBtn) {

      saveBtn.textContent =
        "Save Changes";

    }


    if (deleteBtn) {

      deleteBtn.style.display =
        "inline-flex";

    }


    populateTimeLogTracks(
      entry.trackId
    );


    populateTimeLogTimes(
      entry.start || "09:00",
      entry.end || "10:00"
    );


    selectedTimeLogDate =
      entry.date ||
      getDateKey(
        new Date()
      );

  }


  // ===================================================
  // ADD NEW ENTRY
  // ===================================================

  else {

    editingTimeLogEntryId =
      null;


    if (activityInput) {

      activityInput.value = "";

    }


    if (modalTitle) {

      modalTitle.textContent =
        "Add Activity";

    }


    if (saveBtn) {

      saveBtn.textContent =
        "Save";

    }


    if (deleteBtn) {

      deleteBtn.style.display =
        "none";

    }


    populateTimeLogTracks();


    populateTimeLogTimes(
      startTime,
      endTime
    );


    selectedTimeLogDate =
      selectedDate
        ? getDateKey(
            selectedDate
          )
        : getDateKey(
            new Date()
          );

  }


  openModal(
    "timeLogModal"
  );


  // ===================================================
  // FOCUS ACTIVITY INPUT
  // ===================================================

  if (activityInput) {

    setTimeout(
      () => {

        activityInput.focus();

      },
      0
    );

  }

}


// =====================================================
// CLOSE TIME LOG MODAL
// =====================================================

function closeTimeLogModal() {

  closeModal(
    "timeLogModal"
  );

  editingTimeLogEntryId =
    null;

}


// =====================================================
// SET DATE
// =====================================================

function setTimeLogDate(
  selectedDate
) {

  const dateInput =
    document.getElementById(
      "timeLogDateInput"
    );


  if (!selectedDate) {

    return;

  }


  /*
     Keep the date internally even
     when the current modal does not
     contain a date input.
  */

  if (
    selectedDate instanceof Date
  ) {

    selectedTimeLogDate =
      getDateKey(
        selectedDate
      );

  }

  else {

    selectedTimeLogDate =
      selectedDate;

  }


  /*
     If a date input exists,
     update it as well.
  */

  if (!dateInput) {

    return;

  }


  dateInput.value =
    selectedTimeLogDate;

}


// =====================================================
// POPULATE TRACK DROPDOWN
// =====================================================

function populateTimeLogTracks(
  selectedTrackId = null
) {

  const select =
    document.getElementById(
      "timeLogTrackSelect"
    );

  if (!select) return;


  select.innerHTML = "";


  // ===================================================
  // OTHERS / GENERAL
  // ===================================================

  const othersOption =
    document.createElement(
      "option"
    );

  othersOption.value =
    "";

  othersOption.textContent =
    "📌 Others";


  if (
    selectedTrackId == null
  ) {

    othersOption.selected =
      true;

  }


  select.appendChild(
    othersOption
  );


  // ===================================================
  // TRACKS
  // ===================================================

  tracks.forEach(
    track => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        track.id;


      option.textContent =
        `${track.icon || "📌"} ${track.name}`;


      if (
        Number(track.id) ===
        Number(selectedTrackId)
      ) {

        option.selected =
          true;

      }


      select.appendChild(
        option
      );

    }
  );

}


// =====================================================
// POPULATE TIME DROPDOWNS
// =====================================================

function populateTimeLogTimes(
  selectedStart = "09:00",
  selectedEnd = "10:00"
) {

  const startSelect =
    document.getElementById(
      "timeLogStartTime"
    );

  const endSelect =
    document.getElementById(
      "timeLogEndTime"
    );


  if (
    !startSelect ||
    !endSelect
  ) {

    return;

  }


  startSelect.innerHTML =
    "";

  endSelect.innerHTML =
    "";


  // ===================================================
  // 24 HOURS
  // ===================================================

  for (
    let hour = 0;
    hour < 24;
    hour++
  ) {

    const time =
      `${String(hour).padStart(2, "0")}:00`;


    const startOption =
      document.createElement(
        "option"
      );


    startOption.value =
      time;

    startOption.textContent =
      time;


    if (
      time === selectedStart
    ) {

      startOption.selected =
        true;

    }


    startSelect.appendChild(
      startOption
    );


    const endOption =
      document.createElement(
        "option"
      );


    endOption.value =
      time;

    endOption.textContent =
      time;


    if (
      time === selectedEnd
    ) {

      endOption.selected =
        true;

    }


    endSelect.appendChild(
      endOption
    );

  }


  attachTimeLogTimeControls();

}


// =====================================================
// TIME LOG TIME CONTROLS
// =====================================================

function attachTimeLogTimeControls() {

  const startSelect =
    document.getElementById(
      "timeLogStartTime"
    );

  const endSelect =
    document.getElementById(
      "timeLogEndTime"
    );


  if (
    !startSelect ||
    !endSelect
  ) {

    return;

  }


  const startContainer =
    startSelect.parentElement;

  const endContainer =
    endSelect.parentElement;


  if (
    !startContainer ||
    !endContainer
  ) {

    return;

  }


  if (
    startContainer.querySelector(
      ".timetable-time-controls"
    )
  ) {

    return;

  }


  createTimeLogTimeControls(
    startContainer,
    startSelect
  );


  createTimeLogTimeControls(
    endContainer,
    endSelect
  );

}


// =====================================================
// CREATE TIME CONTROLS
// =====================================================

function createTimeLogTimeControls(
  container,
  select
) {

  const controls =
    document.createElement(
      "div"
    );


  controls.className =
    "timetable-time-controls";


  // ===================================================
  // MINUS BUTTON
  // ===================================================

  const minusBtn =
    document.createElement(
      "button"
    );


  minusBtn.type =
    "button";

  minusBtn.className =
    "timetable-time-adjust-btn";

  minusBtn.textContent =
    "−5";

  minusBtn.title =
    "Subtract 5 minutes";


  // ===================================================
  // PLUS BUTTON
  // ===================================================

  const plusBtn =
    document.createElement(
      "button"
    );


  plusBtn.type =
    "button";

  plusBtn.className =
    "timetable-time-adjust-btn";

  plusBtn.textContent =
    "+5";

  plusBtn.title =
    "Add 5 minutes";


  // ===================================================
  // EVENTS
  // ===================================================

  minusBtn.addEventListener(
    "click",
    () => {

      adjustTimeLogTime(
        select,
        -5
      );

    }
  );


  plusBtn.addEventListener(
    "click",
    () => {

      adjustTimeLogTime(
        select,
        5
      );

    }
  );


  controls.appendChild(
    minusBtn
  );


  controls.appendChild(
    plusBtn
  );


  container.appendChild(
    controls
  );

}


// =====================================================
// ADJUST TIME
// =====================================================

function adjustTimeLogTime(
  select,
  amount
) {

  const currentMinutes =
    timeToMinutes(
      select.value
    );


  const newMinutes =
    currentMinutes +
    amount;


  if (
    newMinutes < 0 ||
    newMinutes >
      23 * 60 + 55
  ) {

    return;

  }


  const newTime =
    minutesToTime(
      newMinutes
    );


  let option =
    Array.from(
      select.options
    ).find(
      item =>
        item.value ===
        newTime
    );


  if (!option) {

    option =
      document.createElement(
        "option"
      );


    option.value =
      newTime;


    option.textContent =
      newTime;


    select.appendChild(
      option
    );

  }


  select.value =
    newTime;

}


// =====================================================
// CHECK TIME LOG OVERLAP
// =====================================================

function hasTimeLogOverlap(
  date,
  start,
  end,
  excludeEntryId = null
) {

  const newStart =
    timeToMinutes(
      start
    );


  const newEnd =
    timeToMinutes(
      end
    );


  return timeLogEntries.find(
    entry => {

      // ===============================================
      // IGNORE CURRENTLY EDITED ENTRY
      // ===============================================

      if (
        entry.id ===
        excludeEntryId
      ) {

        return false;

      }


      // ===============================================
      // ONLY SAME DATE
      // ===============================================

      if (
        entry.date !==
        date
      ) {

        return false;

      }


      const existingStart =
        timeToMinutes(
          entry.start
        );


      const existingEnd =
        timeToMinutes(
          entry.end
        );


      return (
        newStart <
          existingEnd &&
        newEnd >
          existingStart
      );

    }
  );

}


// =====================================================
// SAVE TIME LOG ACTIVITY
// =====================================================

function saveTimeLogActivity() {

  const activityInput =
    document.getElementById(
      "timeLogActivityInput"
    );


  const activity =
    activityInput
      ? activityInput.value.trim()
      : "";


  if (!activity) {

    activityInput?.focus();

    return;

  }


  // ===================================================
  // TRACK
  // ===================================================

  const trackValue =
    document.getElementById(
      "timeLogTrackSelect"
    )?.value;


  const trackId =
    trackValue === "" ||
    trackValue == null
      ? null
      : Number(
          trackValue
        );


  // ===================================================
  // TIME
  // ===================================================

  const start =
    document.getElementById(
      "timeLogStartTime"
    )?.value;


  const end =
    document.getElementById(
      "timeLogEndTime"
    )?.value;


  if (
    !start ||
    !end
  ) {

    return;

  }


  if (
    timeToMinutes(start) >=
    timeToMinutes(end)
  ) {

    alert(
      "End time must be after start time."
    );

    return;

  }


  // ===================================================
  // DATE
  // ===================================================

  let date = null;


  const dateInput =
    document.getElementById(
      "timeLogDateInput"
    );


  if (
    dateInput &&
    dateInput.value
  ) {

    date =
      dateInput.value;

  }


  if (!date) {

    date =
      getTimeLogSelectedDate();

  }


  if (!date) {

    alert(
      "Please select a date."
    );

    return;

  }


  // ===================================================
  // CHECK OVERLAP
  // ===================================================

  const conflictingEntry =
    hasTimeLogOverlap(
      date,
      start,
      end,
      editingTimeLogEntryId
    );


  if (conflictingEntry) {

    alert(
      `⚠️ Time conflict!\n\n` +
      `"${activity}" overlaps with ` +
      `"${conflictingEntry.title}" ` +
      `(${conflictingEntry.start} - ${conflictingEntry.end}).`
    );

    return;

  }


  // ===================================================
  // EDIT EXISTING ENTRY
  // ===================================================

  if (
    editingTimeLogEntryId !==
    null
  ) {

    const entry =
      timeLogEntries.find(
        item =>
          item.id ===
          editingTimeLogEntryId
      );


    if (entry) {

      entry.title =
        activity;

      entry.trackId =
        trackId;

      entry.start =
        start;

      entry.end =
        end;

      entry.date =
        date;

    }

  }


  // ===================================================
  // ADD NEW ENTRY
  // ===================================================

  else {

    timeLogEntries.push({

      id:
        Date.now(),

      title:
        activity,

      trackId:
        trackId,

      start:
        start,

      end:
        end,

      date:
        date

    });

  }


  // ===================================================
  // SAVE TO TIME LOG STORAGE ONLY
  // ===================================================

  saveTimeLogEntriesToStorage(
    timeLogEntries
  );


  // ===================================================
  // CLOSE
  // ===================================================

  closeTimeLogModal();


  // ===================================================
  // REFRESH VIEW
  // ===================================================

  if (
    typeof renderTimeLogEntries ===
    "function"
  ) {

    renderTimeLogEntries();

  }
  else if (
    typeof renderTimeLogView ===
    "function"
  ) {

    renderTimeLogView();

  }

}


// =====================================================
// DELETE TIME LOG ACTIVITY
// =====================================================

function deleteTimeLogActivity() {

  if (
    editingTimeLogEntryId ===
    null
  ) {

    return;

  }


  const confirmed =
    confirm(
      "Are you sure you want to delete this time log activity?"
    );


  if (!confirmed) {

    return;

  }


  timeLogEntries =
    timeLogEntries.filter(
      entry =>
        entry.id !==
        editingTimeLogEntryId
    );


  // ===================================================
  // SAVE TO TIME LOG STORAGE ONLY
  // ===================================================

  saveTimeLogEntriesToStorage(
    timeLogEntries
  );


  editingTimeLogEntryId =
    null;


  closeTimeLogModal();


  // ===================================================
  // REFRESH VIEW
  // ===================================================

  if (
    typeof renderTimeLogEntries ===
    "function"
  ) {

    renderTimeLogEntries();

  }
  else if (
    typeof renderTimeLogView ===
    "function"
  ) {

    renderTimeLogView();

  }

}


// =====================================================
// GET SELECTED TIME LOG DATE
// =====================================================

function getTimeLogSelectedDate() {

  if (
    selectedTimeLogDate
  ) {

    return selectedTimeLogDate;

  }


  return getDateKey(
    new Date()
  );

}


// =====================================================
// TIME HELPERS
// =====================================================

function timeToMinutes(
  time
) {

  const [
    hours,
    minutes
  ] =
    time
      .split(":")
      .map(Number);


  return (
    hours * 60 +
    minutes
  );

}


function minutesToTime(
  totalMinutes
) {

  const hours =
    Math.floor(
      totalMinutes / 60
    );


  const minutes =
    totalMinutes % 60;


  return (
    `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  );

}