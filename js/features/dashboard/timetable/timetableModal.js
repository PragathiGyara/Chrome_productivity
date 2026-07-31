// =====================================================
// TIMETABLE MODAL
// =====================================================

let selectedTimetableSlot = null;

let editingTimetableEntryId = null;

/* =====================================================
   INITIALIZE TIMETABLE MODAL
===================================================== */

function initializeTimetableModal() {

  const closeBtn =
    document.getElementById(
      "closeTimetableModalBtn"
    );

  const saveBtn =
    document.getElementById(
      "saveTimetableEntryBtn"
    );

  const deleteBtn =
    document.getElementById(
      "deleteTimetableEntryBtn"
    );

  const modal =
    document.getElementById(
      "timetableModal"
    );

  closeBtn?.addEventListener(
    "click",
    closeTimetableModal
  );

  saveBtn?.addEventListener(
    "click",
    saveTimetableEntry
  );

  deleteBtn?.addEventListener(
    "click",
    deleteTimetableEntry
  );

  attachModalBackdropClose(
    modal,
    closeTimetableModal
  );

}


/* =====================================================
   OPEN TIMETABLE MODAL
===================================================== */

function openTimetableModal(
  day,
  start,
  end,
  entry = null
) {

  const taskInput =
    document.getElementById(
      "timetableTaskInput"
    );

  const saveBtn =
    document.getElementById(
      "saveTimetableEntryBtn"
    );

  const deleteBtn =
    document.getElementById(
      "deleteTimetableEntryBtn"
    );

  const modalTitle =
    document.getElementById(
      "timetableModalTitle"
    );

  if (entry) {

    editingTimetableEntryId =
      entry.id;

    taskInput.value =
      entry.title;

    modalTitle.textContent =
      "Edit Timetable Entry";

    saveBtn.textContent =
      "Save Changes";

    deleteBtn.style.display =
      "inline-flex";

    populateTimetableTracks(
      entry.categoryId
    );

    populateTimetableTimes(
      entry.start,
      entry.end
    );

    renderTimetableDaySelector(
      entry.days
    );

  }

  else {

    editingTimetableEntryId =
      null;

    taskInput.value = "";

    modalTitle.textContent =
      "Add Timetable Entry";

    saveBtn.textContent =
      "Save";

    deleteBtn.style.display =
      "none";

    populateTimetableTracks();

    populateTimetableTimes(
      start,
      end
    );

    renderTimetableDaySelector(
      [day]
    );

  }

  openModal(
    "timetableModal"
  );

}


/* =====================================================
   CLOSE TIMETABLE MODAL
===================================================== */

function closeTimetableModal() {

  closeModal(
    "timetableModal"
  );

}

/* =====================================================
   SAVE TIMETABLE ENTRY
===================================================== */

let timetableEntries = [];

/* =====================================================
   SAVE ENTRY
===================================================== */

function saveTimetableEntry() {

  const taskInput =
    document.getElementById(
      "timetableTaskInput"
    );

  const task =
    taskInput.value.trim();

  if (!task) {

    taskInput.focus();

    return;

  }

  const trackValue =
    document.getElementById(
      "timetableTrackSelect"
    ).value;

  const trackId =
    trackValue === ""
      ? null
      : Number(
          trackValue
        );

  const start =
    document.getElementById(
      "timetableStartTime"
    ).value;

  const end =
    document.getElementById(
      "timetableEndTime"
    ).value;

  if (start >= end) {

    alert(
      "End time must be after start time."
    );

    return;

  }

  const days =
    Array.from(

      document.querySelectorAll(
        ".timetable-day-chip.selected"
      )

    ).map(
      chip =>
        chip.dataset.day
    );

  if (
    days.length === 0
  ) {

    alert(
      "Select at least one day."
    );

    return;

  }

  if (
    editingTimetableEntryId !==
    null
  ) {

    const entry =
      timetableEntries.find(

        item =>
          item.id ===
          editingTimetableEntryId

      );

    if (entry) {

      entry.title =
        task;

      entry.trackId =
        trackId;

      entry.start =
        start;

      entry.end =
        end;

      entry.days =
        days;

    }

  }

  else {

    timetableEntries.push({

      id:
        Date.now(),

      title:
        task,

      trackId:
        trackId,

      start:
        start,

      end:
        end,

      days:
        days

    });

  }

  persistTimetableEntries();

  closeTimetableModal();

  renderTimetableEntries();

}

/* =====================================================
   DELETE ENTRY
===================================================== */

function deleteTimetableEntry() {

  if (

    editingTimetableEntryId ===
    null

  ) {

    return;

  }

  const confirmed =
    confirm(
      "Are you sure you want to delete this timetable entry?"
    );

  if (!confirmed) {

    return;

  }

  timetableEntries =
    timetableEntries.filter(
      entry =>
        entry.id !==
        editingTimetableEntryId
    );

  persistTimetableEntries();

  closeTimetableModal();

  renderTimetableEntries();

}

/* =====================================================
   POPULATE TRACK DROPDOWN
===================================================== */

function populateTimetableTracks(
  selectedTrackId = null
) {

  const select =
    document.getElementById(
      "timetableTrackSelect"
    );

  if (!select) return;

  select.innerHTML = "";

  const othersOption =
    document.createElement(
      "option"
    );

  othersOption.value = "";

  othersOption.textContent =
    "📌 Others";

  if (
    selectedTrackId == null
  ) {

    othersOption.selected = true;

  }

  select.appendChild(
    othersOption
  );

  tracks.forEach(track => {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      track.id;

    option.textContent =
      `${track.icon} ${track.name}`;

    if (
      track.id ===
      selectedTrackId
    ) {

      option.selected = true;

    }

    select.appendChild(
      option
    );

  });

}

/* =====================================================
   POPULATE TIME DROPDOWNS
===================================================== */

function populateTimetableTimes(
  selectedStart = "09:00",
  selectedEnd = "10:00"
) {

  const startSelect =
    document.getElementById(
      "timetableStartTime"
    );

  const endSelect =
    document.getElementById(
      "timetableEndTime"
    );

  if (
    !startSelect ||
    !endSelect
  ) {
    return;
  }

  startSelect.innerHTML = "";
  endSelect.innerHTML = "";

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

      startOption.selected = true;

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

      endOption.selected = true;

    }

    endSelect.appendChild(
      endOption
    );

  }

}


/* =====================================================
   RENDER DAY CHIPS
===================================================== */

function renderTimetableDaySelector(
  selectedDays = []
) {

  const container =
    document.getElementById(
      "timetableDaySelector"
    );

  if (!container) return;

  container.innerHTML = "";

  timetableDays.forEach(
    day => {

      const chip =
        document.createElement(
          "button"
        );

      chip.type = "button";

      chip.className =
        "timetable-day-chip";

      chip.dataset.day =
        day;

      chip.textContent =
        day.slice(0, 3);

      if (

        selectedDays.includes(
          day
        )

      ) {

        chip.classList.add(
          "selected"
        );

      }

      chip.addEventListener(
        "click",
        () => {

          chip.classList.toggle(
            "selected"
          );

        }
      );

      container.appendChild(
        chip
      );

    }
  );

}

