// =====================================================
// TIME LOG VIEW
// =====================================================
//
// Phase 1:
// - Weekly Time Log structure
// - Monday → Sunday
// - Week navigation
// - Calendar date selection
// - 24-hour grid
//
// Entry behavior will be handled separately.
// =====================================================


// =====================================================
// TIME LOG DAYS
// =====================================================

const timeLogDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];


// =====================================================
// CURRENT TIME LOG WEEK
// =====================================================

let currentTimeLogWeekKey =
  getTimetableWeekKey();


// =====================================================
// RENDER TIME LOG VIEW
// =====================================================

function renderTimelineView() {

  const container =
    document.getElementById(
      "dashboardContent"
    );

  if (!container) return;

  const weekStart =
    getDateFromTimetableWeekKey(
      currentTimeLogWeekKey
    );

  const weekEnd =
    new Date(
      weekStart
    );

  weekEnd.setDate(
    weekEnd.getDate() + 6
  );

  const weekLabel =
    formatTimeLogWeekLabel(
      weekStart,
      weekEnd
    );

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

      ${timeLogDays
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

        <div>

          <div
            class="projects-section-title"
          >
            Time Log
          </div>

          <div
            class="time-log-week-label"
          >
            ${weekLabel}
          </div>

        </div>

        <div
          class="time-log-navigation"
        >

          <button
            type="button"
            id="previousTimeLogWeekBtn"
          >
            ‹
          </button>

          <button
            type="button"
            id="timeLogTodayBtn"
          >
            Today
          </button>

          <button
            type="button"
            id="nextTimeLogWeekBtn"
          >
            ›
          </button>

          <input
            type="date"
            id="timeLogDatePicker"
          />

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

            ${timeLogDays
              .map(
                (day, index) => {

                  const dayDate =
                    new Date(
                      weekStart
                    );

                  dayDate.setDate(
                    dayDate.getDate() +
                    index
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
                }
              )
              .join("")}

            ${hourRows}

          </div>


          <div
            id="timelineEntryLayer"
            class="timetable-entry-layer"
          ></div>

        </div>

      </div>

    </div>

  `;


  attachTimeLogNavigation();

  attachTimeLogCellEvents();

  renderTimeLogEntries();

}


// =====================================================
// WEEK NAVIGATION
// =====================================================

function attachTimeLogNavigation() {

  document
    .getElementById(
      "previousTimeLogWeekBtn"
    )
    ?.addEventListener(
      "click",
      () => {

        const weekStart =
          getDateFromTimetableWeekKey(
            currentTimeLogWeekKey
          );

        weekStart.setDate(
          weekStart.getDate() - 7
        );

        currentTimeLogWeekKey =
          getTimetableWeekKey(
            weekStart
          );

        renderTimelineView();

      }
    );


  document
    .getElementById(
      "nextTimeLogWeekBtn"
    )
    ?.addEventListener(
      "click",
      () => {

        const weekStart =
          getDateFromTimetableWeekKey(
            currentTimeLogWeekKey
          );

        weekStart.setDate(
          weekStart.getDate() + 7
        );

        currentTimeLogWeekKey =
          getTimetableWeekKey(
            weekStart
          );

        renderTimelineView();

      }
    );


  document
    .getElementById(
      "timeLogTodayBtn"
    )
    ?.addEventListener(
      "click",
      () => {

        currentTimeLogWeekKey =
          getTimetableWeekKey();

        renderTimelineView();

      }
    );


  const datePicker =
    document.getElementById(
      "timeLogDatePicker"
    );

  if (!datePicker) return;


  datePicker.addEventListener(
    "change",
    () => {

      if (!datePicker.value) {
        return;
      }

      const selectedDate =
        new Date(
          `${datePicker.value}T00:00:00`
        );

      currentTimeLogWeekKey =
        getTimetableWeekKey(
          selectedDate
        );

      renderTimelineView();

    }
  );

}


// =====================================================
// RENDER TIME LOG ENTRIES
// =====================================================

function renderTimeLogEntries() {

  const layer =
    document.getElementById(
      "timelineEntryLayer"
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


  const weekStart =
    getDateFromTimetableWeekKey(
      currentTimeLogWeekKey
    );


  timeLogDays.forEach(
    (day, dayIndex) => {

      const dayDate =
        new Date(
          weekStart
        );

      dayDate.setDate(
        dayDate.getDate() +
        dayIndex
      );

      const dateKey =
        getLocalDateKey(
          dayDate
        );

      const entries =
        getTimelineEntriesForDate(
          dateKey
        );


      entries.forEach(
        entry => {

          if (
            !entry.startTime ||
            !entry.endTime
          ) {
            return;
          }


          const startMinutes =
            timeToMinutes(
              entry.startTime
            );

          const endMinutes =
            timeToMinutes(
              entry.endTime
            );


          const startHour =
            startMinutes / 60;

          const durationHours =
            (
              endMinutes -
              startMinutes
            ) / 60;


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
              ${
                getTrackName(
                  entry.trackId
                ) || "Time Log"
              }
            </div>

            <div
              class="timetable-entry-title"
            >
              ${entry.activityName}
            </div>

            <div
              class="timetable-entry-time"
            >
              ${entry.startTime}
              -
              ${entry.endTime}
            </div>

          `;


          block.style.left =
            `${dayIndex * cellWidth}px`;

          block.style.top =
            `${startHour * cellHeight}px`;

          block.style.width =
            `${cellWidth}px`;

          block.style.height =
            `${durationHours * cellHeight}px`;


          layer.appendChild(
            block
          );

        }
      );

    }
  );

}


// =====================================================
// CELL EVENTS
// =====================================================

function attachTimeLogCellEvents() {

  document
    .querySelectorAll(
      ".timetable-cell"
    )
    .forEach(
      cell => {

        cell.addEventListener(
          "click",
          () => {

            const weekStart =
              getDateFromTimetableWeekKey(
                currentTimeLogWeekKey
              );

            const dayIndex =
              timeLogDays.indexOf(
                cell.dataset.day
              );

            const selectedDate =
              new Date(
                weekStart
              );

            selectedDate.setDate(
              selectedDate.getDate() +
              dayIndex
            );

            openTimelineModal();

          }
        );

      }
    );

}


// =====================================================
// WEEK LABEL
// =====================================================

function formatTimeLogWeekLabel(
  startDate,
  endDate
) {

  const start =
    startDate.toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric"
      }
    );

  const end =
    endDate.toLocaleDateString(
      undefined,
      {
        month: "short",
        day: "numeric"
      }
    );

  return `${start} - ${end}`;

}