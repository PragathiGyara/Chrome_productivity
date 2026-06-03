// =====================================================
// TIMELINE VIEW
// =====================================================

function renderTimelineView() {

  const container =
    document.getElementById(
      "dashboardContent"
    );

  if (!container) return;

  container.innerHTML = `

    <div class="timeline-section">

      <div class="timeline-header">

        <button
          id="addTimelineEntryBtn"
        >
          + Add Activity
        </button>

      </div>

      <div
        id="timelineEntriesContainer"
      ></div>

    </div>
  `;

  renderTimelineEntries();

  attachTimelineEvents();
}

function renderTimelineEntries() {

  const container =
    document.getElementById(
      "timelineEntriesContainer"
    );

  if (!container) return;

  const entries =
    getTimelineEntriesForDate(
      getLocalDateKey()
    );

  if (entries.length === 0) {

    container.innerHTML = `
      <div class="timeline-empty">
        No activities yet.
      </div>
    `;

    return;
  }

  container.innerHTML = "";

  entries.forEach(entry => {

    const card =
      document.createElement("div");

    card.classList.add(
      "timeline-entry-card"
    );

    card.innerHTML = `

      <div
        class="timeline-entry-time"
      >
        ${entry.startTime}
        -
        ${entry.endTime}
      </div>

      <div
        class="timeline-entry-name"
      >
        ${entry.activityName}
      </div>

    `;

    container.appendChild(card);
  });
}


function attachTimelineEvents() {

  document
    .getElementById(
      "addTimelineEntryBtn"
    )
    ?.addEventListener(
      "click",
      openTimelineModal
    );

  document
    .getElementById(
      "saveTimelineEntryBtn"
    )
    ?.addEventListener(
      "click",
      saveTimelineEntry
    );
}