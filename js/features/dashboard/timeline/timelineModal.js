// =====================================================
// TIMELINE MODAL
// =====================================================

let selectedStartTime = null;
let selectedEndTime = null;

function openTimelineModal() {

  populateTimelineDropdowns();

  populateActivitySuggestions();

  attachActivityAutofill();

  selectedStartTime = null;
  selectedEndTime = null;

  renderTimelineClock();

  openModal(
    "timelineModal"
  );
}


function closeTimelineModal() {

  closeModal("timelineModal");
}


function attachTimelineModalEvents() {

  const modal =
    document.getElementById(
      "timelineModal"
    );

  if (!modal) return;

  document
    .getElementById(
      "closeTimelineModalBtn"
    )
    ?.addEventListener(
      "click",
      closeTimelineModal
    );

  modal.addEventListener(
    "click",
    (e) => {

      if (e.target === modal) {

        closeTimelineModal();
      }

    }
  );
}

function saveTimelineEntry() {

  const activityName =
    document.getElementById(
      "timelineActivityInput"
    ).value.trim();

    const startTime =
    selectedStartTime;

    const endTime =
    selectedEndTime;

  const projectId =
    document.getElementById(
      "timelineProjectSelect"
    ).value || null;

  const trackId =
    document.getElementById(
      "timelineTrackSelect"
    ).value || null;

  const today =
    getLocalDateKey();

  const entry = {

    id: Date.now(),

    activityName,

    startTime,

    endTime,

    projectId,

    trackId,

    createdAt:
      new Date().toISOString()
  };

  addTimelineEntry(
    today,
    entry
  );

  renderTimelineEntries();

  closeTimelineModal();
}

function populateTimelineDropdowns() {

  const projectSelect =
    document.getElementById(
      "timelineProjectSelect"
    );

  const trackSelect =
    document.getElementById(
      "timelineTrackSelect"
    );

  projectSelect.innerHTML = `
    <option value="">
      No Project
    </option>
  `;

  trackSelect.innerHTML = `
    <option value="">
      No Track
    </option>
  `;

  projects.forEach(project => {

    projectSelect.innerHTML += `
      <option
        value="${project.id}"
      >
        ${project.name}
      </option>
    `;
  });

  tracks.forEach(track => {

    trackSelect.innerHTML += `
      <option
        value="${track.id}"
      >
        ${track.name}
      </option>
    `;
  });
}

function populateActivitySuggestions() {

  const datalist =
    document.getElementById(
      "timelineActivitySuggestions"
    );

  if (!datalist) return;

  const suggestions =
    getActivitySuggestions();

  datalist.innerHTML = "";

  suggestions.forEach(name => {

    const option =
      document.createElement(
        "option"
      );

    option.value = name;

    datalist.appendChild(
      option
    );
  });
}

function attachActivityAutofill() {

  const activityInput =
    document.getElementById(
      "timelineActivityInput"
    );

  const projectSelect =
    document.getElementById(
      "timelineProjectSelect"
    );

  const trackSelect =
    document.getElementById(
      "timelineTrackSelect"
    );

  if (
    !activityInput ||
    !projectSelect ||
    !trackSelect
  ) {
    return;
  }

  activityInput.addEventListener(
    "change",
    () => {

      const metadata =
        getActivityMetadata(
          activityInput.value
        );

      if (!metadata) return;

      projectSelect.value =
        metadata.projectId || "";

      trackSelect.value =
        metadata.trackId || "";
    }
  );
}

function generateTimeSlots() {

  const slots = [];

  for (
    let hour = 0;
    hour < 24;
    hour++
  ) {

    slots.push(
      `${String(hour).padStart(2,"0")}:00`
    );

    slots.push(
      `${String(hour).padStart(2,"0")}:30`
    );
  }

  return slots;
}

function renderTimeStrip() {

  const strip =
    document.getElementById(
      "timelineTimeStrip"
    );

  if (!strip) return;

  strip.innerHTML = "";

  generateTimeSlots()
    .forEach(time => {

      const btn =
        document.createElement(
          "button"
        );

      btn.classList.add(
        "time-slot-btn"
      );

      btn.textContent = time;

      btn.dataset.time = time;

      btn.addEventListener(
        "click",
        () => selectTimeSlot(time)
      );

      strip.appendChild(btn);
    });

  updateTimeStripUI();
}

function selectTimeSlot(time) {

  if (!selectedStartTime) {

    selectedStartTime = time;

  } else if (!selectedEndTime) {

    selectedEndTime = time;

  } else {

    selectedStartTime = time;

    selectedEndTime = null;
  }

  updateTimeStripUI();
}

function updateTimeStripUI() {

  document.getElementById(
    "selectedStartTime"
  ).textContent =
    selectedStartTime || "--";

  document.getElementById(
    "selectedEndTime"
  ).textContent =
    selectedEndTime || "--";

  document
    .querySelectorAll(
      ".time-slot-btn"
    )
    .forEach(btn => {

      btn.classList.remove(
        "time-slot-start",
        "time-slot-end"
      );

      if (
        btn.dataset.time ===
        selectedStartTime
      ) {

        btn.classList.add(
          "time-slot-start"
        );
      }

      if (
        btn.dataset.time ===
        selectedEndTime
      ) {

        btn.classList.add(
          "time-slot-end"
        );
      }

    });
}