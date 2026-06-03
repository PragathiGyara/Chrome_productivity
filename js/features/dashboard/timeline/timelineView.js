// =====================================================
// TIMELINE VIEW
// =====================================================

function renderTimelineView() {

  const container =
    document.getElementById(
      "dashboardContent"
    );

  if (!container) return;

  container.innerHTML = `

    <div class="timeline-section">

      <div class="timeline-header">

        <div class="timeline-title">
          Daily Timeline
        </div>

      </div>

      <div class="timeline-placeholder">

        Timeline coming soon.

      </div>

    </div>

  `;
}