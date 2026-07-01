// =====================================================
// TRACKS VIEW
//
// Responsibilities:
// - Render track cards
// - Render track management list
// - Open tracks
// - Create tracks
//
// Delegates:
// - Track statistics → trackStats.js
// - Drag & Drop → trackDragDrop.js
// - Track modal editing → trackModal.js
// =====================================================

let isDragging = false;

let draggedTrackId = null;


const BASE_LANGUAGES = ["English", "Hindi", "Telugu", "Marathi"];


// --------------------------
// In-Memory State
// --------------------------

let tracks = [];
let projects = [];


// --------------------------
// Event Binding
// --------------------------

function attachTrackEvents() {
  
  const modal = document.getElementById("trackSettingsModal");
  const closeBtn = document.getElementById("closeTrackModalBtn");
  const modalContent = modal.querySelector(".modal-content");
  const deleteModal =
    document.getElementById("deleteConfirmModal");

  const backupDeleteBtn =
    document.getElementById("backupDeleteBtn");

  const confirmBtn =
    document.getElementById("confirmDeleteBtn");

  const cancelBtn =
    document.getElementById("cancelDeleteBtn");

  const addTrackModal =
  document.getElementById("addTrackModal");
  const saveNewTrackBtn =
    document.getElementById("saveNewTrackBtn");
  const cancelNewTrackBtn =
    document.getElementById("cancelNewTrackBtn");
  const closeAddTrackModalBtn =
    document.getElementById("closeAddTrackModalBtn");

  saveNewTrackBtn.onclick = () => {
    const input =
      document.getElementById("newTrackName");
    const name = input.value.trim();
    if (!name) {
      alert("Track name required.");
      return;
    }
    tracks.push({
      id: Date.now(),
      name,
      icon: selectedNewTrackIcon,
      deadlines: [],
      tasks: [],
      reading: [],
      notes: ""
    });
    persistTracks();
    renderTracks();
    closeModal("addTrackModal");
    showToast(`Track "${name}" added`);
  };
  function closeAddTrackModal() {
    closeModal("addTrackModal");
  }
  cancelNewTrackBtn?.addEventListener(
    "click",
    closeAddTrackModal
  );
  closeAddTrackModalBtn?.addEventListener(
    "click",
    closeAddTrackModal
  );
  addTrackModal?.addEventListener("click", (e) => {
    if (e.target === addTrackModal) {
      closeAddTrackModal();
    }
  });

  // Close button (top-right X)
  closeBtn.addEventListener("click", attemptCloseModal);

  // Backdrop click (only when clicking actual overlay)
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      attemptCloseModal();
    }
  });

  // Prevent bubbling inside modal
  modalContent.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Inline Add Button
  document.getElementById("addTrackInlineBtn")
    .addEventListener("click", openInlineAdd);


  backupDeleteBtn.addEventListener("click", () => {

      if (!trackPendingDeletion) return;

      generateTrackBackupPDF(
          trackPendingDeletion
      );

      deleteTrack(
          trackPendingDeletion.id
      );

      showToast(
          `Track "${trackPendingDeletion.name}" backed up and deleted`
      );

      trackPendingDeletion = null;

      closeModal("deleteConfirmModal");

  });
  // Delete Confirm Buttons
  confirmBtn.addEventListener("click", () => {

      if (!trackPendingDeletion) return;

      deleteTrack(
          trackPendingDeletion.id
      );

      showToast(
          `Track "${trackPendingDeletion.name}" deleted`
      );

      trackPendingDeletion = null;

      closeModal("deleteConfirmModal");

  });
  cancelBtn.addEventListener("click", () => {
    trackPendingDeletion = null;
    closeModal("deleteConfirmModal");
  });

  // Optional: close delete modal on backdrop click
  deleteModal.addEventListener("click", (e) => {
    if (e.target === deleteModal) {
      closeModal("deleteConfirmModal");
      trackPendingDeletion = null;
    }
  });
}

// --------------------------
// Render Center Grid
// --------------------------

function renderTracks() {

  const grid = document.getElementById("trackGrid");
  grid.innerHTML = "";

  tracks.forEach((track, index) => {

    const stats = computeTrackOverview(track);

    const now = new Date();

    let isUrgent = false;

    if (stats.nextDeadline) {
      const diff = stats.nextDeadline - now;
      isUrgent = diff > 0 && diff <= 24 * 60 * 60 * 1000;
    }

    const div = document.createElement("div");
    div.classList.add("card");

    if (isUrgent) {
      div.classList.add("urgent-deadline");
    }

    const total = stats.total || 0;

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    // Proper segment totals
    const completedValue = stats.completedTasks;
    const remainingValue =
      stats.remainingTasks +
      stats.readingCount +
      stats.upcomingDeadlines;

    const missedValue = stats.missedDeadlines;

    const completedLength =
      total > 0 ? (completedValue / total) * circumference : 0;

    const remainingLength =
      total > 0 ? (remainingValue / total) * circumference : 0;

    const missedLength =
      total > 0 ? (missedValue / total) * circumference : 0;

    div.innerHTML = `
      <div class="card-header">
        <span class="track-title">${track.icon} ${track.name}</span>
      </div>

      <div class="progress-ring-wrapper">

        <svg viewBox="0 0 100 100" class="progress-ring">

          <circle class="ring-bg" cx="50" cy="50" r="${radius}" />

          <circle
            class="ring-completed segment"
            data-type="completed"
            cx="50" cy="50" r="${radius}"
            stroke-dasharray="${completedLength} ${circumference}"
          />

          <circle
            class="ring-remaining segment"
            data-type="remaining"
            cx="50" cy="50" r="${radius}"
            stroke-dasharray="${remainingLength} ${circumference}"
            stroke-dashoffset="-${completedLength}"
          />

          <circle
            class="ring-missed segment"
            data-type="missed"
            cx="50" cy="50" r="${radius}"
            stroke-dasharray="${missedLength} ${circumference}"
            stroke-dashoffset="-${completedLength + remainingLength}"
          />

        </svg>

        <div class="ring-center">
          <div class="ring-total">${total}</div>
          <div class="ring-label">items</div>
        </div>

        <div class="ring-tooltip-dynamic"></div>

      </div>

      <div class="card-footer">
        ${
          stats.nextDeadline
            ? `Next deadline: ${formatDateTime(stats.nextDeadline)} (${stats.nextDeadlineCount})`
            : "No upcoming deadlines"
        }
      </div>
    `;

    div.dataset.id = track.id;
    div.dataset.index = index;

    // Click
    div.addEventListener("click", () => {
      if (isDragging) return;
      openTrackView(track.id);
    });

    // Drag
    div.setAttribute("draggable", true);
    div.addEventListener("dragstart", handleDragStart);
    div.addEventListener("dragover", handleDragOver);
    div.addEventListener("drop", handleDrop);
    div.addEventListener("dragend", handleDragEnd);

    grid.appendChild(div);

    // ================================
    // SEGMENT HOVER TOOLTIP LOGIC
    // ================================

    const tooltip = div.querySelector(".ring-tooltip-dynamic");
    const segments = div.querySelectorAll(".segment");

    segments.forEach(segment => {

      segment.addEventListener("mouseenter", () => {

        const type = segment.dataset.type;

        if (type === "remaining") {
          tooltip.innerHTML = `
            <div class="tooltip-heading remaining">
              <span class="status-dot"></span>
              Remaining
            </div>
            <ul class="tooltip-list">
              <li>
                <span class="item-label">
                  <span class="item-icon">⏳</span>
                  Deadlines
                </span>
                <span class="item-value">${stats.upcomingDeadlines}</span>
              </li>
              <li>
                <span class="item-label">
                  <span class="item-icon">✔</span>
                  Tasks
                </span>
                <span class="item-value">${stats.remainingTasks}</span>
              </li>
              <li>
                <span class="item-label">
                  <span class="item-icon">📖</span>
                  Reading
                </span>
                <span class="item-value">${stats.readingCount}</span>
              </li>
            </ul>
          `;
        }

        if (type === "completed") {
          tooltip.innerHTML = `
            <div class="tooltip-heading completed">
              <span class="status-dot"></span>
              Completed
            </div>
            <ul class="tooltip-list">
              <li>
                <span class="item-label">
                  <span class="item-icon">✔</span>
                  Tasks
                </span>
                <span class="item-value">${stats.completedTasks}</span>
              </li>
            </ul>
          `;
        }

        if (type === "missed") {
          tooltip.innerHTML = `
            <div class="tooltip-heading missed">
              <span class="status-dot"></span>
              Missed
            </div>
            <ul class="tooltip-list">
              <li>
                <span class="item-label">
                  <span class="item-icon">⏳</span>
                  Deadlines
                </span>
                <span class="item-value">${stats.missedDeadlines}</span>
              </li>
            </ul>
          `;
        }

        tooltip.classList.add("visible");
      });

      segment.addEventListener("mouseleave", () => {
        tooltip.classList.remove("visible");
      });

    });

  });
  // =====================================
  // Add Track Card
  // =====================================

  const addCard = document.createElement("div");

  addCard.classList.add(
    "card",
    "add-track-card"
  );

  addCard.innerHTML = `
    <div class="add-track-content">

      <div class="add-track-plus">
        +
      </div>

      <div class="add-track-text">
        Add Track
      </div>

    </div>
  `;

  addCard.addEventListener("click", () => {
    openAddTrackModal();
  });

  grid.appendChild(addCard);
}

function openAddTrackModal() {

  const modal =
    document.getElementById("addTrackModal");

  const iconPicker =
    document.getElementById("newTrackIconPicker");

  const nameInput =
    document.getElementById("newTrackName");

  modal.classList.remove("hidden");

  iconPicker.innerHTML = "";

  nameInput.value = "";

  selectedNewTrackIcon = "📌";

  TRACK_ICONS.forEach(icon => {

    const span = document.createElement("span");

    span.classList.add("icon-option");

    if (icon === selectedNewTrackIcon) {
      span.classList.add("selected-icon");
    }

    span.dataset.icon = icon;
    span.textContent = icon;

    span.addEventListener("click", () => {

      iconPicker
        .querySelectorAll(".icon-option")
        .forEach(el =>
          el.classList.remove("selected-icon")
        );

      span.classList.add("selected-icon");

      selectedNewTrackIcon = icon;
    });

    iconPicker.appendChild(span);
  });

  nameInput.focus();
}






