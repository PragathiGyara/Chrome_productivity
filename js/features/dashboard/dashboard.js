
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
  "tracks",
  "projects",
  "timeline",
  "timetable"
];

function renderDashboardView() {

  const center = document.querySelector(".center");

  center.innerHTML = getDashboardTemplate();

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

  switch (page) {

    case "tracks":

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

      break;

    case "projects":

      settingsBtn.style.display =
        "block";

      title.textContent =
        "Projects";

      settingsBtn.textContent =
        "Manage Projects";

      settingsBtn.onclick =
        openManageProjectsModal;

      renderProjectsView();

      break;

    case "timeline":

      title.textContent =
        "Timeline";

      settingsBtn.style.display =
        "none";

      renderTimelineView();

      break;

    case "timetable":

      title.textContent =
        "Timetable";

      settingsBtn.style.display =
        "none";

      renderTimetableView();

      break;

    default:

      title.textContent =
        "My Tracks";

      content.innerHTML = `
        <div
          id="trackGrid"
          class="grid"
        ></div>
      `;

      renderTracks();

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