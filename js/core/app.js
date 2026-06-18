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

  loadTimelineEntries();

  renderDashboardView();

  initializeLeftPanel();

  attachTrackEvents();

  attachManageProjectsEvents();

  attachTimelineModalEvents();

  attachQuizEvents();

}