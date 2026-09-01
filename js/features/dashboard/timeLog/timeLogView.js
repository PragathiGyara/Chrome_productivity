// =====================================================
// TIME LOG VIEW
// =====================================================
//
// Responsibilities:
// - Render weekly time log
// - Display time log grid
// - Week navigation
// - Calendar date selection
// - 24-hour grid
// - Open Time Log modal
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

function renderTimeLogView() {

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
          Time Log
        </div>


        <div
          class="timetable-navigation"
        >

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


            ${timeLogDays
              .map((day, index) => {

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

              })
              .join("")}


            ${hourRows}

          </div>

        </div>

      </div>

    </div>

  `;


  attachTimeLogNavigation();

  attachTimeLogCellEvents();

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


  previousBtn?.addEventListener(
    "click",
    () => {

      changeTimeLogWeek(
        -7
      );

    }
  );


  nextBtn?.addEventListener(
    "click",
    () => {

      changeTimeLogWeek(
        7
      );

    }
  );


  todayBtn?.addEventListener(
    "click",
    () => {

      currentTimeLogWeekKey =
        getTimetableWeekKey();


      renderTimeLogView();

    }
  );


  weekPickerBtn?.addEventListener(
    "click",
    () => {

      datePicker?.showPicker?.();

      datePicker?.focus();

    }
  );


  datePicker?.addEventListener(
    "change",
    () => {

      if (!datePicker.value) {
        return;
      }


      currentTimeLogWeekKey =
        getTimetableWeekKey(
          new Date(
            `${datePicker.value}T00:00:00`
          )
        );


      renderTimeLogView();

    }
  );

}


// =====================================================
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
              new Date(
                weekStart
              );


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
// TIME LOG WEEK LABEL
// =====================================================

function formatTimeLogWeekLabel(
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
