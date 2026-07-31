// =====================================================
// TIMETABLE VIEW
//
// Responsibilities:
// - Render weekly timetable
// - Display timetable grid
// - Render timetable entries
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

    const startTime =
      `${String(hour).padStart(2, "0")}:00`;

    const endTime =
      `${String((hour + 1) % 24).padStart(2, "0")}:00`;

    hourRows += `

      <div
        class="timetable-hour"
      >
        ${startTime}
      </div>

      ${timetableDays
        .map(day => `
          <div
            class="timetable-cell"
            data-day="${day}"
            data-start="${startTime}"
            data-end="${endTime}"
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

      </div>

      <div
        class="timetable-wrapper"
      >

        <div
          class="timetable-grid-container"
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

          <div
            id="timetableEntryLayer"
            class="timetable-entry-layer"
          ></div>

        </div>

      </div>

    </div>

  `;

  attachTimetableCellEvents();

  renderTimetableEntries();

}

// =====================================================
// RENDER TIMETABLE ENTRIES
// =====================================================

function renderTimetableEntries() {

  const layer =
    document.getElementById(
      "timetableEntryLayer"
    );

  if (!layer) return;

  layer.innerHTML = "";

  const firstCell =
    document.querySelector(
      ".timetable-cell"
    );

  if (!firstCell) return;

  const cellWidth =
    firstCell.offsetWidth;

  const cellHeight =
    firstCell.offsetHeight;

  timetableEntries.forEach(
    entry => {

      const dayIndex =
        timetableDays.indexOf(
          entry.day
        );

      if (
        dayIndex === -1
      ) {
        return;
      }

      const startHour =
        parseInt(
          entry.start.split(":")[0],
          10
        );

      const endHour =
        parseInt(
          entry.end.split(":")[0],
          10
        );

      const block =
        document.createElement(
          "div"
        );

      block.className =
        "timetable-entry";

      block.textContent =
        entry.title;

      block.style.left =
        `${dayIndex * cellWidth}px`;

      block.style.top =
        `${startHour * cellHeight}px`;

      block.style.width =
        `${cellWidth}px`;

      block.style.height =
        `${(endHour - startHour) * cellHeight}px`;

      block.addEventListener(
        "click",
        () => {

          openTimetableModal(
            entry.day,
            entry.start,
            entry.end,
            entry
          );

        }
      );

      layer.appendChild(
        block
      );

    }
  );

}

// =====================================================
// TIMETABLE CELL EVENTS
// =====================================================

function attachTimetableCellEvents() {

  document
    .querySelectorAll(
      ".timetable-cell"
    )
    .forEach(cell => {

      cell.addEventListener(
        "click",
        () => {

          openTimetableModal(
            cell.dataset.day,
            cell.dataset.start,
            cell.dataset.end
          );

        }
      );

    });

}