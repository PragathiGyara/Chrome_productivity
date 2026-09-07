// =====================================================
// APPLICATION ENTRY POINT
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);

function initializeApp() {

  loadTracks();

  loadTimetableEntries();

  renderDashboardView();

  initializeLeftPanel();

  attachTrackEvents();

  attachManageProjectsEvents();

  initializeTimetableModal();

  initializeTimeLogModal();

  attachQuizEvents();

}