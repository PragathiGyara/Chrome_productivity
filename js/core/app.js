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

  loadTimetableEntries();

  renderDashboardView();

  initializeLeftPanel();

  attachTrackEvents();

  attachManageProjectsEvents();

  attachTimelineModalEvents();

  initializeTimetableModal();

  attachQuizEvents();

}