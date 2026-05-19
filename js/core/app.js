// =====================================================
// APP INITIALIZATION
// =====================================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    loadTracks();

    loadWords();

    renderDashboardView();

    updateLeftPanel();

    setupLeftPanelToggle();

    attachTrackEvents();

  }
);