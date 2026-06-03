// =====================================================
// TIMELINE MODAL
// =====================================================

function openTimelineModal() {

  populateTimelineDropdowns();

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
    document.getElementById(
      "timelineStartTime"
    ).value;

  const endTime =
    document.getElementById(
      "timelineEndTime"
    ).value;

  const projectId =
    document.getElementById(
      "timelineProjectSelect"
    ).value || null;

  const trackId =
    document.getElementById(
      "timelineTrackSelect"
    ).value || null;

  const today =
    getTodayKey();

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