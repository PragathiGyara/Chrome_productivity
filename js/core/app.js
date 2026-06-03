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

  renderDashboardView();

  updateLeftPanel();

  setupLeftPanelToggle();

  attachTrackEvents();

  attachManageProjectsEvents();

}