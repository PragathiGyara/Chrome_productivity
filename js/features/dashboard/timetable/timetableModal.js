// =====================================================
// TIMETABLE MODAL
// =====================================================

let selectedTimetableSlot = null;

/* =====================================================
   INITIALIZE TIMETABLE MODAL
===================================================== */

function initializeTimetableModal() {

  console.log("Initializing timetable modal");

  const closeBtn =
    document.getElementById(
      "closeTimetableModalBtn"
    );

  const saveBtn =
    document.getElementById(
      "saveTimetableEntryBtn"
    );

  const modal =
    document.getElementById(
      "timetableModal"
    );

  console.log(closeBtn);
  console.log(saveBtn);
  console.log(modal);

  closeBtn?.addEventListener(
    "click",
    () => {
      console.log("Close clicked");
      closeTimetableModal();
    }
  );

  saveBtn?.addEventListener(
    "click",
    () => {
      console.log("Save clicked");
      saveTimetableEntry();
    }
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
  end
) {

  selectedTimetableSlot = {
    day,
    start,
    end
  };

  document.getElementById(
    "timetableTaskInput"
  ).value = "";

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

  timetableEntries.push({

    title: task,

    day:
      selectedTimetableSlot.day,

    start:
      selectedTimetableSlot.start,

    end:
      selectedTimetableSlot.end

  });

  persistTimetableEntries();

  closeTimetableModal();

  renderTimetableEntries();

}