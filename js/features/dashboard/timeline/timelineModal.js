// =====================================================
// TIMELINE MODAL
// =====================================================

// =====================================================
// MODAL OPEN / CLOSE
// =====================================================

function openTimelineModal() {

  populateTimelineDropdowns();

  populateActivitySuggestions();

  attachActivityAutofill();
  clockStartIndex = null;
  clockEndIndex = null;
  
  renderTimelineClock();
  
  updateClockDisplay();

  openModal(
    "timelineModal"
  );
}


function closeTimelineModal() {

  closeModal("timelineModal");
}


// =====================================================
// EVENT BINDING
// =====================================================

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

// =====================================================
// SAVE ENTRY
// =====================================================

function saveTimelineEntry() {

  const activityName =
    document.getElementById(
      "timelineActivityInput"
    ).value.trim();

    const startTime =
    clockStartIndex === null
        ? null
        : indexToTime(
            clockStartIndex
        );

    const endTime =
    clockEndIndex === null
        ? null
        : indexToTime(
            clockEndIndex
        );

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


// =====================================================
// DROPDOWNS
// =====================================================

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

// =====================================================
// ACTIVITY SUGGESTIONS
// =====================================================

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
