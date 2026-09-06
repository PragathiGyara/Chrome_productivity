// =====================================================
// TIMETABLE VIEW / TIME PLAN VIEW
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

let currentTimetableWeekKey =
  getTimetableWeekKey();

function renderTimetableView(
  containerId = "dashboardContent"
) {

  const container =
    document.getElementById(
      containerId
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

  const weekStart =
    getTimetableWeekStartFromKey(
      currentTimetableWeekKey
    );

  const weekEnd =
    new Date(weekStart);

  weekEnd.setDate(
    weekEnd.getDate() + 6
  );

  const weekLabel =
    formatTimetableWeekRange(
      weekStart,
      weekEnd
    );

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

        <div
          class="timetable-navigation"
        >

          <button
            type="button"
            id="timetablePreviousWeekBtn"
            class="timetable-nav-btn"
            title="Previous week"
          >
            ‹
          </button>

          <button
            type="button"
            id="timetableWeekPickerBtn"
            class="timetable-week-picker-btn"
          >
            📅 ${weekLabel}
          </button>

          <button
            type="button"
            id="timetableNextWeekBtn"
            class="timetable-nav-btn"
            title="Next week"
          >
            ›
          </button>

          <button
            type="button"
            id="timetableTodayBtn"
            class="timetable-today-btn"
          >
            Today
          </button>

          <input
            type="date"
            id="timetableDatePicker"
            class="timetable-date-picker"
          >

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
              .map((day, index) => {

                const dayDate =
                  new Date(weekStart);

                dayDate.setDate(
                  dayDate.getDate() + index
                );

                const dateLabel =
                  dayDate.toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric"
                    }
                  );

                return `

                  <div
                    class="timetable-day"
                  >

                    <div
                      class="timetable-day-name"
                    >
                      ${day}
                    </div>

                    <div
                      class="timetable-day-date"
                    >
                      ${dateLabel}
                    </div>

                  </div>

                `;

              })
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

  attachTimetableNavigation();

  attachTimetableCellEvents();

  renderTimetableEntries();

}

// =====================================================
// TIMETABLE WEEK HELPERS
// =====================================================

function getTimetableWeekStartFromKey(
  weekKey
) {

  const [
    year,
    month,
    day
  ] =
    weekKey
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );

}


function formatTimetableWeekRange(
  startDate,
  endDate
) {

  const options = {
    month: "short",
    day: "numeric"
  };

  const start =
    startDate.toLocaleDateString(
      undefined,
      options
    );

  const end =
    endDate.toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    );

  return `${start} - ${end}`;

}

// =====================================================
// TIMETABLE NAVIGATION
// =====================================================

function attachTimetableNavigation() {

  const previousBtn =
    document.getElementById(
      "timetablePreviousWeekBtn"
    );

  const nextBtn =
    document.getElementById(
      "timetableNextWeekBtn"
    );

  const todayBtn =
    document.getElementById(
      "timetableTodayBtn"
    );

  const weekPickerBtn =
    document.getElementById(
      "timetableWeekPickerBtn"
    );

  const datePicker =
    document.getElementById(
      "timetableDatePicker"
    );


  // ===================================================
  // PREVIOUS WEEK
  // ===================================================

  previousBtn?.addEventListener(
    "click",
    () => {

      changeTimetableWeek(-7);

    }
  );


  // ===================================================
  // NEXT WEEK
  // ===================================================

  nextBtn?.addEventListener(
    "click",
    () => {

      changeTimetableWeek(7);

    }
  );


  // ===================================================
  // TODAY
  // ===================================================

  todayBtn?.addEventListener(
    "click",
    () => {

      currentTimetableWeekKey =
        getTimetableWeekKey();


      currentTimeLogWeekKey =
        currentTimetableWeekKey;


      loadTimetableEntries(
        currentTimetableWeekKey
      );


      renderCurrentTimeScheduleView();

    }
  );


  // ===================================================
  // WEEK PICKER
  // ===================================================

  weekPickerBtn?.addEventListener(
    "click",
    () => {

      datePicker?.showPicker?.();

      datePicker?.focus();

    }
  );


  // ===================================================
  // DATE PICKER
  // ===================================================

  datePicker?.addEventListener(
    "change",
    () => {

      if (!datePicker.value) {
        return;
      }


      currentTimetableWeekKey =
        getTimetableWeekKey(
          new Date(
            `${datePicker.value}T00:00:00`
          )
        );


      currentTimeLogWeekKey =
        currentTimetableWeekKey;


      loadTimetableEntries(
        currentTimetableWeekKey
      );


      renderCurrentTimeScheduleView();

    }
  );

}

// =====================================================
// CHANGE TIMETABLE WEEK
// =====================================================

function changeTimetableWeek(
  days
) {

  const currentWeekStart =
    getTimetableWeekStartFromKey(
      currentTimetableWeekKey
    );


  currentWeekStart.setDate(
    currentWeekStart.getDate() +
    days
  );


  currentTimetableWeekKey =
    getTimetableWeekKey(
      currentWeekStart
    );


  currentTimeLogWeekKey =
    currentTimetableWeekKey;


  loadTimetableEntries(
    currentTimetableWeekKey
  );


  renderCurrentTimeScheduleView();

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

      const track =
        tracks.find(
          track =>
            track.id ===
            entry.trackId
        );

      entry.days.forEach(
        day => {

          const dayIndex =
            timetableDays.indexOf(
              day
            );

          if (
            dayIndex === -1
          ) {

            return;

          }

          const startMinutes =
            timeToMinutes(
              entry.start
            );

          const endMinutes =
            timeToMinutes(
              entry.end
            );

          if (
            endMinutes <= startMinutes
          ) {

            return;

          }

          const minutesPerHour =
            60;

          const minutesToPixels =
            cellHeight /
            minutesPerHour;

          const block =
            document.createElement(
              "div"
            );

          block.className =
            "timetable-entry";

          block.innerHTML = `

            <div
              class="timetable-entry-category"
            >
              ${track ? track.icon : "📌"}
              ${
                track
                  ? track.name
                  : "General"
              }
            </div>

            <div
              class="timetable-entry-title"
            >
              ${entry.title}
            </div>

            <div
              class="timetable-entry-time"
            >
              ${entry.start}
              -
              ${entry.end}
            </div>

          `;

          block.style.left =
            `${dayIndex * cellWidth}px`;

          block.style.top =
            `${startMinutes * minutesToPixels}px`;

          block.style.width =
            `${cellWidth}px`;

          block.style.height =
            `${
              (endMinutes - startMinutes)
              * minutesToPixels
            }px`;

          block.addEventListener(
            "click",
            event => {

              event.stopPropagation();

              openTimetableModal(
                day,
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