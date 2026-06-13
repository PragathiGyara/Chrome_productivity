// =====================================================
// TIMELINE VIEW
// =====================================================

// =====================================================
// TIMELINE CONSTANTS
// =====================================================

const TIMELINE_HOUR_WIDTH =
  120;

const HOURS_BEFORE_CURRENT =
  4;

// =====================================================
// TIMELINE DRAG STATE
// =====================================================

let timelineDragStartIndex =
  null;

let timelineDragEndIndex =
  null;

let timelineIsDragging =
  false;

// =====================================================
// RENDERING
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
        class="timeline-scroll-container"
      ></div>

      <div
        id="timelineActivityTooltip"
        class="timeline-tooltip hidden"
      ></div>

    </div>
  `;

  renderTimelineEntries();

  scrollTimelineToDefaultHour();

  attachTimelineEvents();
}

function renderTimelineEntries() {

  const container =
    document.getElementById(
      "timelineEntriesContainer"
    );

  if (!container) {
    return;
  }

  const entries =
    getTimelineEntriesForDate(
      getLocalDateKey()
    )
      .slice()
      .sort(
        (
          a,
          b
        ) =>
          timeToMinutes(
            a.startTime
          )
          -
          timeToMinutes(
            b.startTime
          )
      );


  const timelineWidth =
    24 *
    TIMELINE_HOUR_WIDTH;

  let html = `

    <div
      class="
        timeline-scroll-content
      "
      style="
        width:
        ${timelineWidth}px;
      "
    >

      <!-- =====================
           HOUR HEADER
      ====================== -->

      <div
        class="
          timeline-hour-header
        "
      >
  `;

  for (
    let hour = 0;
    hour < 24;
    hour++
  ) {

    html += `

      <div
        class="
          timeline-hour-cell
        "
      >
        ${String(hour)
          .padStart(
            2,
            "0"
          )}
      </div>

    `;
  }

  const currentTimeLeft =
    (
      getCurrentTimeMinutes()
      / 60
    ) *
    TIMELINE_HOUR_WIDTH;

  html += `
        </div>

        <div
          class="
            timeline-track
          "
        >
        <div
          id="timelineDragPreview"
          class="timeline-drag-preview"
        ></div>

          <div
            class="
              timeline-current-time-line
            "
            style="
              left:
              ${currentTimeLeft}px;
            "
          ></div>
  `;
  for (
    let hour = 0;
    hour < 24;
    hour++
  ) {

    html += `
      <div
        class="
          timeline-hour-line
        "
        style="
          left:
          ${
            hour *
            TIMELINE_HOUR_WIDTH
          }px;
        "
      ></div>
    `;
  }

  if (
    entries.length === 0
  ) {

    html += `

      <div
        class="
          timeline-empty-state
        "
      >
        Drag on the timeline to add an activity
      </div>

    `;
  }

  entries.forEach(
    entry => {

      const startMinutes =
        timeToMinutes(
          entry.startTime
        );

      const endMinutes =
        timeToMinutes(
          entry.endTime
        );

      const left =
        (
          startMinutes /
          60
        ) *
        TIMELINE_HOUR_WIDTH;

      const width =
        (
          (
            endMinutes -
            startMinutes
          ) /
          60
        ) *
        TIMELINE_HOUR_WIDTH;

      const projectName =
        getProjectName(
          entry.projectId
        );

      const trackName =
        getTrackName(
          entry.trackId
        );

      html += `

        <div
          class="
            timeline-activity-block
          "

          data-id="${entry.id}"

          data-activity="${entry.activityName}"

          data-start="${entry.startTime}"

          data-end="${entry.endTime}"

          data-project="${projectName || ""}"

          data-track="${trackName || ""}"

          style="
            left:${left}px;
            width:${width}px;
          "
        >

          <div
            class="
              timeline-activity-name
            "
          >
            ${entry.activityName}
          </div>

          <div
            class="
              timeline-activity-time
            "
          >
            ${entry.startTime}
            -
            ${entry.endTime}
          </div>

          <div
            class="
              timeline-activity-duration
            "
          >
            ${getDurationText(
              entry.startTime,
              entry.endTime
            )}
          </div>

        </div>

      `;
    }
  );

  html += `

      </div>

    </div>

  `;

  container.innerHTML =
    html;

  attachTimelineHoverCards();

  attachTimelineDragEvents();

  renderTimelineDragSelection();
}

function renderTimelineDragSelection() {

  const preview =
    document.getElementById(
      "timelineDragPreview"
    );

  if (!preview) {
    return;
  }

  if (
    timelineDragStartIndex === null
  ) {

    preview.style.display =
      "none";

    return;
  }

  const start =
    Math.min(
      timelineDragStartIndex,
      timelineDragEndIndex ??
      timelineDragStartIndex
    );

  const end =
    Math.max(
      timelineDragStartIndex,
      timelineDragEndIndex ??
      timelineDragStartIndex
    );

  const left =
    (
      start * 10 / 60
    ) *
    TIMELINE_HOUR_WIDTH;

  const width =
    (
      (
        end -
        start +
        1
      ) * 10 / 60
    ) *
    TIMELINE_HOUR_WIDTH;

  preview.style.display =
    "block";

  preview.style.left =
    `${left}px`;

  preview.style.width =
    `${width}px`;
}

// =====================================================
// EVENTS
// =====================================================


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

function attachTimelineHoverCards() {

  const tooltip =
    document.getElementById(
      "timelineActivityTooltip"
    );

  if (!tooltip) {
    return;
  }

  document
    .querySelectorAll(
      ".timeline-activity-block"
    )
    .forEach(block => {

      block.addEventListener(
        "mouseenter",
        () => {

          tooltip.innerHTML = `

            <div
              class="
                timeline-tooltip-title
              "
            >
              ${block.dataset.activity}
            </div>

            <div
              class="
                timeline-tooltip-row
              "
            >
              ${block.dataset.start}
              →
              ${block.dataset.end}
            </div>

            <div
              class="
                timeline-tooltip-row
              "
            >
              ${getDurationText(
                block.dataset.start,
                block.dataset.end
              )}
            </div>

            ${
              block.dataset.project
              ?
              `
              <div
                class="
                  timeline-tooltip-badge
                "
              >
                🏗
                ${block.dataset.project}
              </div>
              `
              :
              ""
            }

            ${
              block.dataset.track
              ?
              `
              <div
                class="
                  timeline-tooltip-badge
                "
              >
                🎯
                ${block.dataset.track}
              </div>
              `
              :
              ""
            }

          `;

          tooltip.classList.remove(
            "hidden"
          );
        }
      );

      block.addEventListener(
        "mousemove",
        e => {

          tooltip.style.left =
            `${e.clientX + 15}px`;

          tooltip.style.top =
            `${e.clientY + 15}px`;
        }
      );

      block.addEventListener(
        "mouseleave",
        () => {

          tooltip.classList.add(
            "hidden"
          );
        }
      );
    });
}

function attachTimelineDragEvents() {

  const track =
    document.querySelector(
      ".timeline-track"
    );

  if (!track) {
    return;
  }

  track.addEventListener(
    "mousedown",
    event => {

      if (
        event.target.closest(
          ".timeline-activity-block"
        )
      ) {
        return;
      }

      const rect =
        track.getBoundingClientRect();

      const scrollContainer =
        document.getElementById(
          "timelineEntriesContainer"
        );

      const x =
        (
          event.clientX
          -
          rect.left
        )
        +
        scrollContainer.scrollLeft;

      timelineDragStartIndex =
        xPositionToTimelineIndex(
          x
        );

      timelineDragEndIndex =
        timelineDragStartIndex;

      timelineIsDragging =
        true;

      renderTimelineDragSelection();
    }
  );

  track.addEventListener(
    "mousemove",
    event => {

      if (
        !timelineIsDragging
      ) {
        return;
      }

      const rect =
        track.getBoundingClientRect();

      const scrollContainer =
        document.getElementById(
          "timelineEntriesContainer"
        );

      const x =
        (
          event.clientX
          -
          rect.left
        )
        +
        scrollContainer.scrollLeft;

      timelineDragEndIndex =
        xPositionToTimelineIndex(
          x
        );

      renderTimelineDragSelection();
    }
  );

  document.addEventListener(
    "mouseup",
    () => {

      timelineIsDragging =
        false;
    }
  );
}


// =====================================================
// SCROLL HELPERS
// =====================================================


function scrollTimelineToDefaultHour() {

  const container =
    document.getElementById(
      "timelineEntriesContainer"
    );

  if (!container) {
    return;
  }

  const currentHour =
    new Date()
      .getHours();

  const visibleHours =
    Math.floor(
      container.clientWidth /
      TIMELINE_HOUR_WIDTH
    );

  const maxStartHour =
    Math.max(
      0,
      24 - visibleHours
    );

  const startHour =
    Math.max(
      0,
      Math.min(
        currentHour -
        HOURS_BEFORE_CURRENT,
        maxStartHour
      )
    );

  container.scrollLeft =
    startHour *
    TIMELINE_HOUR_WIDTH;
}


// =====================================================
// LOOKUP HELPERS
// =====================================================

function getProjectName(
  projectId
) {

  if (!projectId) {
    return null;
  }

  return (
    projects.find(
      project =>
        String(project.id)
        ===
        String(projectId)
    )?.name
    ||
    null
  );
}

function getTrackName(
  trackId
) {

  if (!trackId) {
    return null;
  }

  return (
    tracks.find(
      track =>
        String(track.id)
        ===
        String(trackId)
    )?.name
    ||
    null
  );
}

// =====================================================
// TIME HELPERS
// =====================================================

function timeToMinutes(
  timeString
) {

  const [
    hours,
    minutes
  ] =
  timeString
    .split(":")
    .map(Number);

  return (
    hours * 60 +
    minutes
  );
}

function getCurrentTimeMinutes() {

  const now =
    new Date();

  return (
    now.getHours() * 60
    +
    now.getMinutes()
  );
}

function xPositionToTimelineIndex(
  x
) {

  const minutes =
    (
      x /
      TIMELINE_HOUR_WIDTH
    ) * 60;

  return Math.max(
    0,
    Math.min(
      143,
      Math.floor(
        minutes / 10
      )
    )
  );
}

function getDurationText(
  startTime,
  endTime
) {

  const durationMinutes =
    timeToMinutes(
      endTime
    )
    -
    timeToMinutes(
      startTime
    );

  const hours =
    Math.floor(
      durationMinutes / 60
    );

  const minutes =
    durationMinutes % 60;

  if (
    hours > 0 &&
    minutes > 0
  ) {

    return `
      ${hours}h
      ${minutes}m
    `;
  }

  if (
    hours > 0
  ) {

    return `
      ${hours}h
    `;
  }

  return `
    ${minutes}m
  `;
}

