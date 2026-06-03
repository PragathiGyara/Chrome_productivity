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

  updateLeftPanel();

  setupLeftPanelToggle();

  attachTrackEvents();

  attachManageProjectsEvents();

  attachTimelineModalEvents();

}