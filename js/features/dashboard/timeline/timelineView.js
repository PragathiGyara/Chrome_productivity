// =====================================================
// TIMELINE VIEW
// =====================================================

// =====================================================
// TIMELINE CONSTANTS
// =====================================================

const TIMELINE_HOUR_WIDTH =
  120;

const TIMELINE_DEFAULT_HOUR =
  9;

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
            class="
              timeline-current-time-line
            "
            style="
              left:
              ${currentTimeLeft}px;
            "
          ></div>
  `;

  if (
    entries.length === 0
  ) {

    html += `

      <div
        class="
          timeline-empty-state
        "
      >
        No activities recorded today
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

  container.scrollLeft =
    9 *
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

