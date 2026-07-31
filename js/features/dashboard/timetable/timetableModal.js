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

  selectedTimetableSlot = {
    day,
    start,
    end
  };

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

    if (deleteBtn) {

      deleteBtn.style.display =
        "inline-flex";

    }

  }

  else {

    editingTimetableEntryId =
      null;

    taskInput.value = "";

    modalTitle.textContent =
      "Add Timetable Entry";

    saveBtn.textContent =
      "Save";

    if (deleteBtn) {

      deleteBtn.style.display =
        "none";

    }

  }

  document.getElementById(
    "timetableSelectedDay"
  ).textContent = day;

  document.getElementById(
    "timetableSelectedTime"
  ).textContent =
    `${start} - ${end}`;

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

      entry.title = task;

      entry.day =
        selectedTimetableSlot.day;

      entry.start =
        selectedTimetableSlot.start;

      entry.end =
        selectedTimetableSlot.end;

    }

  }

  else {

    timetableEntries.push({

      id: Date.now(),

      title: task,

      day:
        selectedTimetableSlot.day,

      start:
        selectedTimetableSlot.start,

      end:
        selectedTimetableSlot.end

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

