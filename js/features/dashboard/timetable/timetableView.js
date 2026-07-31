// =====================================================
// TIMETABLE VIEW
//
// Responsibilities:
// - Render weekly timetable
// - Display timetable grid
//
// Does NOT handle:
// - Storage
// - Modal
// - Entry rendering
// =====================================================

const timetableDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

function renderTimetableView() {

  const container =
    document.getElementById(
      "dashboardContent"
    );

  if (!container) return;

  let hourRows = "";

  for (
    let hour = 0;
    hour < 24;
    hour++
  ) {

    hourRows += `

      <div class="timetable-hour">
        ${String(hour).padStart(2, "0")}:00
      </div>

      ${timetableDays
        .map(() => `
          <div
            class="timetable-cell"
          ></div>
        `)
        .join("")}
    `;
  }

  container.innerHTML = `

    <div
      class="timetable-section"
    >

      <div
        class="timetable-header"
      >

        <div
          class="projects-section-title"
        >
          Weekly Timetable
        </div>

        <button
          id="addTimetableEntryBtn"
        >
          Add Entry
        </button>

      </div>

      <div
        class="timetable-wrapper"
      >

        <div
          class="timetable-grid"
        >

          <div
            class="timetable-corner"
          ></div>

          ${timetableDays
            .map(day => `
              <div
                class="timetable-day"
              >
                ${day}
              </div>
            `)
            .join("")}

          ${hourRows}

        </div>

      </div>

    </div>

  `;

}