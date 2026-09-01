// =====================================================
// APPLICATION ENTRY POINT
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);

function initializeApp() {

  loadTracks();

  loadProjects();

  loadTimetableEntries();

  renderDashboardView();

  initializeLeftPanel();

  attachTrackEvents();

  attachManageProjectsEvents();

  initializeTimetableModal();

  initializeTimeLogModal();

  attachQuizEvents();

}