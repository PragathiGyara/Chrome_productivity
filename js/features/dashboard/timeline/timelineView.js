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
      >

        No activities yet.

      </div>

    </div>
  `;

  attachTimelineEvents();
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