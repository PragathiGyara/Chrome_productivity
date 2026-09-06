// =====================================================
// TIME LOG VIEW
// =====================================================
//
// Phase 2:
// - Weekly Time Log structure
// - Monday → Sunday
// - Week navigation
// - Calendar date selection
// - 24-hour grid
// - Saved activity rendering
// - Activity click → edit
//
// Time Log uses its own storage.
// Timetable is NOT modified.
// =====================================================


// =====================================================
// TIME LOG DAYS
// =====================================================

const timeLogDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];


// =====================================================
// CURRENT WEEK
// =====================================================

let currentTimeLogWeekKey =
  getTimetableWeekKey();


// =====================================================
// RENDER TIME LOG VIEW
// =====================================================

function renderTimeLogView(
  containerId = "dashboardContent"
) {

  const container =
    document.getElementById(
      containerId
    );

  if (!container) return;


  const weekStart =
    getDateFromTimetableWeekKey(
      currentTimeLogWeekKey
    );


  const weekEnd =
    new Date(weekStart);

  weekEnd.setDate(
    weekEnd.getDate() + 6
  );


  const weekLabel =
    formatTimeLogWeekLabel(
      weekStart,
      weekEnd
    );


  let hourRows = "";


  // ===================================================
  // BUILD 24-HOUR GRID
  // ===================================================

  for (
    let hour = 0;
    hour < 24;
    hour++
  ) {

    const startTime =
      `${String(hour).padStart(2, "0")}:00`;


    const endTime =
      `${String(hour + 1).padStart(2, "0")}:00`;


    hourRows += `

      <div class="timetable-hour">
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


  // ===================================================
  // RENDER HTML
  // ===================================================

  container.innerHTML = `

    <div class="timetable-section">

      <div class="timetable-header">

        <div class="projects-section-title">
          Time Log
        </div>


        <div class="timetable-navigation">

          <button
            type="button"
            id="previousTimeLogWeekBtn"
            class="timetable-nav-btn"
            title="Previous week"
          >
            ‹
          </button>


          <button
            type="button"
            id="timeLogWeekPickerBtn"
            class="timetable-week-picker-btn"
          >
            📅 ${weekLabel}
          </button>


          <button
            type="button"
            id="nextTimeLogWeekBtn"
            class="timetable-nav-btn"
            title="Next week"
          >
            ›
          </button>


          <button
            type="button"
            id="timeLogTodayBtn"
            class="timetable-today-btn"
          >
            Today
          </button>


          <input
            type="date"
            id="timeLogDatePicker"
            class="timetable-date-picker"
          />

        </div>

      </div>


      <div class="timetable-wrapper">

        <div class="timetable-grid-container">

          <div class="timetable-grid">

            <div class="timetable-corner"></div>


            ${timeLogDays
              .map((day, index) => {

                const dayDate =
                  new Date(weekStart);

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

                  <div class="timetable-day">

                    <div class="timetable-day-name">
                      ${day}
                    </div>

                    <div class="timetable-day-date">
                      ${dateLabel}
                    </div>

                  </div>

                `;

              })
              .join("")}


            ${hourRows}

          </div>

        </div>

      </div>

    </div>

  `;


  // ===================================================
  // ATTACH EVENTS
  // ===================================================

  attachTimeLogNavigation();

  attachTimeLogCellEvents();


  // ===================================================
  // RENDER SAVED ENTRIES
  // ===================================================

  renderTimeLogEntries();

}


// =====================================================
// TIME LOG NAVIGATION
// =====================================================

function attachTimeLogNavigation() {

  const previousBtn =
    document.getElementById(
      "previousTimeLogWeekBtn"
    );

  const nextBtn =
    document.getElementById(
      "nextTimeLogWeekBtn"
    );

  const todayBtn =
    document.getElementById(
      "timeLogTodayBtn"
    );

  const weekPickerBtn =
    document.getElementById(
      "timeLogWeekPickerBtn"
    );

  const datePicker =
    document.getElementById(
      "timeLogDatePicker"
    );


  // ===================================================
  // PREVIOUS WEEK
  // ===================================================

  previousBtn?.addEventListener(
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

      currentTimetableWeekKey =
        currentTimeLogWeekKey;

      renderCurrentTimeScheduleView();

    }
  );


  // ===================================================
  // NEXT WEEK
  // ===================================================

  nextBtn?.addEventListener(
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

      currentTimetableWeekKey =
        currentTimeLogWeekKey;

      renderCurrentTimeScheduleView();

    }
  );


  // ===================================================
  // TODAY
  // ===================================================

  todayBtn?.addEventListener(
    "click",
    () => {

      currentTimeLogWeekKey =
        getTimetableWeekKey();

      currentTimetableWeekKey =
        currentTimeLogWeekKey;

      renderCurrentTimeScheduleView();


      // Wait for the new grid to render
      setTimeout(() => {

        highlightTodayColumn();

      }, 50);

    }
  );


  // ===================================================
  // WEEK PICKER BUTTON
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

      const selectedDate =
        new Date(
          `${datePicker.value}T00:00:00`
        );

      currentTimeLogWeekKey =
        getTimetableWeekKey(
          selectedDate
        );

      currentTimetableWeekKey =
        currentTimeLogWeekKey;

      renderCurrentTimeScheduleView();

    }
  );

}

// =====================================================
// TIME LOG CELL EVENTS
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
              new Date(weekStart);


            selectedDate.setDate(
              selectedDate.getDate() +
              dayIndex
            );


            openTimeLogModal(
              selectedDate,
              cell.dataset.start,
              cell.dataset.end
            );

          }
        );

      }
    );

}


// =====================================================
// RENDER TIME LOG ENTRIES
// =====================================================

function renderTimeLogEntries() {

  const weekStart =
    getDateFromTimetableWeekKey(
      currentTimeLogWeekKey
    );


  // ===================================================
  // LOAD TIME LOG DATA
  // ===================================================

  timeLogEntries =
    loadTimeLogEntriesFromStorage();


  if (!Array.isArray(timeLogEntries)) {

    timeLogEntries = [];

  }


  // ===================================================
  // REMOVE OLD ENTRY LAYERS
  // ===================================================

  document
    .querySelectorAll(
      ".time-log-entry-layer"
    )
    .forEach(
      layer => layer.remove()
    );


  // ===================================================
  // RENDER EACH ENTRY
  // ===================================================

  timeLogEntries.forEach(
    entry => {

      if (!entry.date) return;


      const entryDate =
        new Date(
          `${entry.date}T00:00:00`
        );


      // ===============================================
      // DETERMINE DAY INDEX
      // ===============================================

      const dayIndex =
        Math.floor(
          (
            entryDate -
            weekStart
          ) /
          (
            1000 *
            60 *
            60 *
            24
          )
        );


      // Entry is outside current week
      if (
        dayIndex < 0 ||
        dayIndex > 6
      ) {

        return;

      }


      // ===============================================
      // FIND GRID COLUMN
      // ===============================================

      const day =
        timeLogDays[dayIndex];


      const cells =
        document.querySelectorAll(
          `.timetable-cell[data-day="${day}"]`
        );


      if (!cells.length) return;


      // ===============================================
      // ENTRY TIMES
      // ===============================================

      const startMinutes =
        timeToMinutes(
          entry.start
        );


      const endMinutes =
        timeToMinutes(
          entry.end
        );


      if (
        endMinutes <=
        startMinutes
      ) {

        return;

      }


      // ===============================================
      // FIND FIRST CELL FOR DAY
      // ===============================================

      const firstCell =
        cells[0];


      const gridColumn =
        firstCell
          .getBoundingClientRect();


      // ===============================================
      // CREATE ENTRY LAYER
      // ===============================================

      const layer =
        document.createElement(
          "div"
        );


      layer.className =
        "time-log-entry-layer";


      layer.style.position =
        "absolute";


      layer.style.left =
        `${gridColumn.left}px`;


      layer.style.top =
        "0px";


      layer.style.width =
        `${gridColumn.width}px`;


      layer.style.height =
        "100%";


      layer.style.pointerEvents =
        "none";


      // ===============================================
      // CREATE ENTRY
      // ===============================================

      const entryElement =
        document.createElement(
          "div"
        );


      entryElement.className =
        "timetable-entry";


      entryElement.dataset.entryId =
        entry.id;


      entryElement.style.position =
        "absolute";


      entryElement.style.left =
        "4px";


      entryElement.style.right =
        "4px";


      // Each timetable hour row has a height.
      // Calculate vertical position from the
      // actual grid cells rather than assuming
      // a fixed pixel height.
      // ===============================================

      const hourIndex =
        Math.floor(
          startMinutes / 60
        );


      const minuteOffset =
        startMinutes % 60;


      const durationMinutes =
        endMinutes -
        startMinutes;


      const hourCell =
        cells[hourIndex];


      if (!hourCell) return;


      const hourHeight =
        hourCell.getBoundingClientRect().height;


      entryElement.style.top =
        `${
          (hourIndex * hourHeight) +
          (
            minuteOffset /
            60
          ) *
          hourHeight
        }px`;


      entryElement.style.height =
        `${
          (
            durationMinutes /
            60
          ) *
          hourHeight
        }px`;


      // ===============================================
      // ENTRY CONTENT
      // ===============================================

      const track =
        tracks.find(
          item =>
            Number(item.id) ===
            Number(entry.trackId)
        );


      const trackLabel =
        track
          ? `${track.icon || "📌"} ${track.name}`
          : "📌 Others";


      entryElement.innerHTML = `

        <div class="timetable-entry-title">
          ${entry.title || "Untitled"}
        </div>

        <div class="timetable-entry-time">
          ${entry.start} - ${entry.end}
        </div>

        <div class="timetable-entry-track">
          ${trackLabel}
        </div>

      `;


      // ===============================================
      // CLICK → EDIT
      // ===============================================

      entryElement.addEventListener(
        "click",
        event => {

          event.stopPropagation();


          openTimeLogModal(
            null,
            entry.start,
            entry.end,
            entry
          );

        }
      );


      layer.appendChild(
        entryElement
      );


      // ===============================================
      // ATTACH LAYER TO GRID
      // ===============================================

      const grid =
        document.querySelector(
          ".timetable-grid"
        );


      if (!grid) return;


      const gridRect =
        grid.getBoundingClientRect();


      layer.style.left =
        `${
          gridColumn.left -
          gridRect.left
        }px`;


      layer.style.top =
        "0px";


      grid.appendChild(
        layer
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
        day: "numeric",
        year: "numeric"
      }
    );


  return `${start} - ${end}`;

}