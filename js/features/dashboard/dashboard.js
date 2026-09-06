// =====================================================
// DASHBOARD VIEW
//
// Responsibilities:
// - Render dashboard layout
// - Switch between dashboard pages
// - Coordinate WOTD and page navigation
//
// Does NOT handle:
// - WOTD logic
// - Track rendering
// - Project rendering
// =====================================================

let currentDashboardPage = 0;

const dashboardPages = [
  "projects",
  "tracks",
  "timeschedule"
];

function renderDashboardView() {

  const center =
    document.querySelector(".center");

  center.innerHTML =
    getDashboardTemplate();

  renderCurrentDashboardPage();

  renderWordOfTheDay();

  attachDashboardEvents();

  attachWOTDEvents();
}

function renderCurrentDashboardPage() {

  const page =
    dashboardPages[currentDashboardPage];

  const content =
    document.getElementById(
      "dashboardContent"
    );

  const title =
    document.getElementById(
      "dashboardTitle"
    );

  if (!content || !title) return;

  const settingsBtn =
    document.getElementById(
      "trackSettingsBtn"
    );


  // ===================================================
  // TRACKS
  // ===================================================

  if (page === "tracks") {

    settingsBtn.style.display =
      "block";

    title.textContent =
      "My Tracks";

    settingsBtn.textContent =
      "Manage Tracks";

    settingsBtn.onclick =
      openTrackSettings;

    content.innerHTML = `

      <div
        id="trackGrid"
        class="grid"
      ></div>

    `;

    renderTracks();

    return;
  }


  // ===================================================
  // PROJECTS
  // ===================================================

  if (page === "projects") {

    settingsBtn.style.display =
      "block";

    title.textContent =
      "Projects";

    settingsBtn.textContent =
      "Manage Projects";

    settingsBtn.onclick =
      openManageProjectsModal;

    renderProjectsView();

    return;
  }


  // ===================================================
  // TIME & SCHEDULE
  // ===================================================

  if (page === "timeschedule") {

    settingsBtn.style.display =
      "none";

    title.textContent =
      "Time & Schedule";

    renderTimeScheduleView();

    return;
  }

}

// =====================================================
// TIME & SCHEDULE VIEW
// =====================================================

let currentTimeScheduleView =
  "timelog";


function renderTimeScheduleView() {
  const content =
    document.getElementById(
      "dashboardContent"
    );

  if (!content) return;

  content.innerHTML = `
    <div class="time-schedule-view">

      <div class="time-schedule-toggle">

        <button
          type="button"
          id="timeScheduleTimetableBtn"
          class="time-schedule-toggle-btn"
        >
          Timetable
        </button>

        <button
          type="button"
          id="timeScheduleTimeLogBtn"
          class="time-schedule-toggle-btn"
        >
          Time Log
        </button>

      </div>

      <div
        id="timeScheduleContent"
      ></div>

    </div>
  `;

  // Timetable is the default view
  currentTimeScheduleView = "timetable";

  attachTimeScheduleEvents();

  renderCurrentTimeScheduleView();
}


// =====================================================
// TIME & SCHEDULE TOGGLE EVENTS
// =====================================================

function attachTimeScheduleEvents() {

  const timetableBtn =
    document.getElementById(
      "timeScheduleTimetableBtn"
    );

  const timeLogBtn =
    document.getElementById(
      "timeScheduleTimeLogBtn"
    );


  // ===================================================
  // TIMETABLE
  // ===================================================

  timetableBtn?.addEventListener(
    "click",
    () => {

      currentTimeScheduleView =
        "timetable";

      renderCurrentTimeScheduleView();

    }
  );


  // ===================================================
  // TIME LOG
  // ===================================================

  timeLogBtn?.addEventListener(
    "click",
    () => {

      currentTimeScheduleView =
        "timelog";

      renderCurrentTimeScheduleView();

    }
  );

}


// =====================================================
// RENDER CURRENT TIME & SCHEDULE VIEW
// =====================================================

function renderCurrentTimeScheduleView() {

  const timeLogBtn =
    document.getElementById(
      "timeScheduleTimeLogBtn"
    );

  const timetableBtn =
    document.getElementById(
      "timeScheduleTimetableBtn"
    );


  if (timeLogBtn) {

    timeLogBtn.classList.toggle(
      "active",
      currentTimeScheduleView ===
      "timelog"
    );

  }


  if (timetableBtn) {

    timetableBtn.classList.toggle(
      "active",
      currentTimeScheduleView ===
      "timetable"
    );

  }


  // ---------------------------------------------------
  // IMPORTANT:
  // Tell the individual view which container to render
  // into instead of replacing dashboardContent.
  // ---------------------------------------------------

  if (
    currentTimeScheduleView ===
    "timelog"
  ) {

    renderTimeLogView(
      "timeScheduleContent"
    );

  } else {

    renderTimetableView(
      "timeScheduleContent"
    );

  }

}

/* =====================================================
   DASHBOARD NAVIGATION
===================================================== */

function nextDashboardPage() {

  currentDashboardPage =
    (currentDashboardPage + 1)
    % dashboardPages.length;

  renderCurrentDashboardPage();
}

function previousDashboardPage() {

  currentDashboardPage =
    (
      currentDashboardPage - 1 +
      dashboardPages.length
    ) % dashboardPages.length;

  renderCurrentDashboardPage();
}



/* =====================================================
   DASHBOARD EVENTS
===================================================== */

function attachDashboardEvents() {

    document
      .getElementById("dashboardNextBtn")
      ?.addEventListener(
        "click",
        nextDashboardPage
      );

    document
      .getElementById("dashboardPrevBtn")
      ?.addEventListener(
        "click",
        previousDashboardPage
      );
}


/* =====================================================
   VIEW REFRESH
===================================================== */

function refreshCurrentView() {

  if (currentView === "dashboard") {

    renderDashboardView();

  } else if (currentView === "track") {

    renderTrackWorkspace();
  }
}