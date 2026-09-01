
// =====================================================
// TIME LOG MODAL
// =====================================================

let selectedTimeLogSlot = null;

let editingTimeLogEntryId = null;


/* =====================================================
   INITIALIZE TIME LOG MODAL
===================================================== */

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


/* =====================================================
   OPEN TIME LOG MODAL
===================================================== */

function openTimeLogModal(
  selectedDate,
  start,
  end,
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


  // Store selected slot
  selectedTimeLogSlot = {

    date:
      selectedDate,

    start:
      start,

    end:
      end

  };


  if (entry) {

    editingTimeLogEntryId =
      entry.id;


    if (activityInput) {

      activityInput.value =
        entry.activity;

    }


    if (modalTitle) {

      modalTitle.textContent =
        "Edit Time Log Entry";

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
      entry.start,
      entry.end
    );

  }

  else {

    editingTimeLogEntryId =
      null;


    if (activityInput) {

      activityInput.value =
        "";

    }


    if (modalTitle) {

      modalTitle.textContent =
        "Add Time Log Entry";

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
      start,
      end
    );

  }


  openModal(
    "timeLogModal"
  );


  activityInput?.focus();

}


/* =====================================================
   CLOSE TIME LOG MODAL
===================================================== */

function closeTimeLogModal() {

  closeModal(
    "timeLogModal"
  );

}


/* =====================================================
   POPULATE TRACK DROPDOWN
===================================================== */

function populateTimeLogTracks(
  selectedTrackId = null
) {

  const select =
    document.getElementById(
      "timeLogTrackSelect"
    );

  if (!select) return;


  select.innerHTML = "";


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


  tracks.forEach(
    track => {

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

        option.selected =
          true;

      }


      select.appendChild(
        option
      );

    }
  );

}


/* =====================================================
   POPULATE TIME DROPDOWNS
===================================================== */

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
      time ===
      selectedStart
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
      time ===
      selectedEnd
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


/* =====================================================
   TIME LOG TIME CONTROLS
===================================================== */

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
    startContainer.querySelector(
      ".time-log-time-controls"
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


/* =====================================================
   CREATE TIME CONTROLS
===================================================== */

function createTimeLogTimeControls(
  container,
  select
) {

  const controls =
    document.createElement(
      "div"
    );


  controls.className =
    "time-log-time-controls";


  const minusBtn =
    document.createElement(
      "button"
    );


  minusBtn.type =
    "button";


  minusBtn.className =
    "time-log-time-adjust-btn";


  minusBtn.textContent =
    "−5";


  minusBtn.title =
    "Subtract 5 minutes";


  const plusBtn =
    document.createElement(
      "button"
    );


  plusBtn.type =
    "button";


  plusBtn.className =
    "time-log-time-adjust-btn";


  plusBtn.textContent =
    "+5";


  plusBtn.title =
    "Add 5 minutes";


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


/* =====================================================
   ADJUST TIME LOG TIME
===================================================== */

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
    newMinutes > 23 * 60 + 55
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


/* =====================================================
   TIME HELPERS
===================================================== */

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


/* =====================================================
   SAVE TIME LOG ACTIVITY
===================================================== */

function saveTimeLogActivity() {

  console.log(
    "Time Log save clicked"
  );

}


/* =====================================================
   DELETE TIME LOG ACTIVITY
===================================================== */

function deleteTimeLogActivity() {

  console.log(
    "Time Log delete clicked"
  );

}
