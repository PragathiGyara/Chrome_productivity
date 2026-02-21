// =====================================================
// TRACK MANAGEMENT MODULE
// Handles:
// - Rendering center track grid
// - Inline track editing (name + icon)
// - Inline track creation
// - Track deletion with confirmation modal
// - Modal close protection (unsaved changes)
// - Persistence using localStorage
// =====================================================


// --------------------------
// Constants
// --------------------------

const TRACK_STORAGE_KEY = "dashboardTracks";

const TRACK_ICONS = [
  "📌",
  "📚","💻","🧠","🏃","🎯",
  "💡","📝","📖","🔬","💰",
  "📅","🚀","🔥","🎨","⚙"
];


// --------------------------
// In-Memory State
// --------------------------

let tracks = [];
let isEditingTrack = false;
let trackPendingDeletion = null;
let toastTimeout = null;


// --------------------------
// Initialization
// --------------------------

document.addEventListener("DOMContentLoaded", () => {
  loadTracks();
  renderTracks();
  attachTrackEvents();
});


// --------------------------
// Event Binding
// --------------------------

function attachTrackEvents() {
  const settingsBtn = document.getElementById("trackSettingsBtn");
  const modal = document.getElementById("trackSettingsModal");
  const closeBtn = document.getElementById("closeTrackModalBtn");
  const modalContent = modal.querySelector(".modal-content");

  const deleteModal = document.getElementById("deleteConfirmModal");
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  const cancelBtn = document.getElementById("cancelDeleteBtn");

  // Open settings modal
  settingsBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    renderTrackList();
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

  // Delete Confirm Buttons
  confirmBtn.addEventListener("click", () => {
    if (trackPendingDeletion) {
      deleteTrack(trackPendingDeletion.id);
      showToast(`Track "${trackPendingDeletion.name}" deleted`);
      trackPendingDeletion = null;
    }
    deleteModal.classList.add("hidden");
  });

  cancelBtn.addEventListener("click", () => {
    trackPendingDeletion = null;
    deleteModal.classList.add("hidden");
  });

  // Optional: close delete modal on backdrop click
  deleteModal.addEventListener("click", (e) => {
    if (e.target === deleteModal) {
      deleteModal.classList.add("hidden");
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

  tracks.forEach(track => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `${track.icon} ${track.name}`;
    div.addEventListener("click", () => {
    openTrackView(track.id);
    });
    grid.appendChild(div);
  });
}


// --------------------------
// Render Modal Track List
// --------------------------

function renderTrackList() {
  const list = document.getElementById("trackList");
  list.innerHTML = "";

  tracks.forEach(track => {
    const row = document.createElement("div");
    row.classList.add("track-row");

    row.innerHTML = `
      <div class="track-display">
        <span>${track.icon} ${track.name}</span>
      </div>
      <div class="track-actions">
        <button class="edit-track-btn">✏</button>
        <button class="delete-track-btn">🗑</button>
      </div>
    `;

    row.querySelector(".edit-track-btn")
      .addEventListener("click", () => enableInlineEdit(row, track));

    row.querySelector(".delete-track-btn")
      .addEventListener("click", () => openDeleteConfirmModal(track));

    list.appendChild(row);
  });
}


// --------------------------
// Inline Edit Logic
// --------------------------

function enableInlineEdit(row, track) {
  if (isEditingTrack) return;

  isEditingTrack = true;

  let selectedIcon = track.icon;

  const iconGrid = TRACK_ICONS.map(icon =>
    `<span class="icon-option ${icon === track.icon ? "selected-icon" : ""}" data-icon="${icon}">
      ${icon}
    </span>`
  ).join("");

  row.innerHTML = `
    <div class="edit-container">

      <div class="edit-preview">
        <span class="preview-icon">${selectedIcon}</span>
        <span class="preview-name">${track.name}</span>
      </div>

      <input class="edit-name" value="${track.name}" />

      <div class="icon-picker">
        ${iconGrid}
      </div>

    </div>

    <div class="track-actions">
      <button class="save-edit-btn">✔</button>
      <button class="cancel-edit-btn">✖</button>
    </div>
  `;

  const nameInput = row.querySelector(".edit-name");
  const previewIcon = row.querySelector(".preview-icon");
  const previewName = row.querySelector(".preview-name");

  // Live preview name update
  nameInput.addEventListener("input", () => {
    previewName.textContent = nameInput.value || "Untitled";
  });

  // Icon selection
  row.querySelectorAll(".icon-option").forEach(el => {
    el.addEventListener("click", () => {
      row.querySelectorAll(".icon-option")
        .forEach(i => i.classList.remove("selected-icon"));

      el.classList.add("selected-icon");
      selectedIcon = el.dataset.icon;
      previewIcon.textContent = selectedIcon;
    });
  });

  // Save
  row.querySelector(".save-edit-btn").addEventListener("click", () => {
    const newName = nameInput.value.trim();
    if (!newName) return;

    track.name = newName;
    track.icon = selectedIcon;

    persistTracks();
    renderTracks();
    renderTrackList();
    showToast("Track updated");

    isEditingTrack = false;
  });

  // Cancel
  row.querySelector(".cancel-edit-btn").addEventListener("click", () => {
    isEditingTrack = false;
    renderTrackList();
  });
}


// --------------------------
// Inline Add Logic
// --------------------------

function openInlineAdd() {
  if (isEditingTrack) return;

  isEditingTrack = true;

  const list = document.getElementById("trackList");

  let selectedIcon = "📌";

  const iconGrid = TRACK_ICONS.map(icon =>
    `<span class="icon-option ${icon === "📌" ? "selected-icon" : ""}" data-icon="${icon}">
      ${icon}
    </span>`
  ).join("");

  const row = document.createElement("div");
  row.classList.add("track-row");

  row.innerHTML = `
    <div class="edit-container">

      <div class="edit-preview">
        <span class="preview-icon">${selectedIcon}</span>
        <span class="preview-name">New Track</span>
      </div>

      <input class="edit-name" placeholder="Track name" />

      <div class="icon-picker">
        ${iconGrid}
      </div>

    </div>

    <div class="track-actions">
      <button class="save-edit-btn">✔</button>
      <button class="cancel-edit-btn">✖</button>
    </div>
  `;

  list.appendChild(row);

  const nameInput = row.querySelector(".edit-name");
  const previewIcon = row.querySelector(".preview-icon");
  const previewName = row.querySelector(".preview-name");

  nameInput.addEventListener("input", () => {
    previewName.textContent = nameInput.value || "New Track";
  });

  row.querySelectorAll(".icon-option").forEach(el => {
    el.addEventListener("click", () => {
      row.querySelectorAll(".icon-option")
        .forEach(i => i.classList.remove("selected-icon"));

      el.classList.add("selected-icon");
      selectedIcon = el.dataset.icon;
      previewIcon.textContent = selectedIcon;
    });
  });

  row.querySelector(".save-edit-btn").addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) return;

    tracks.push({
    id: Date.now(),
    name,
    icon: selectedIcon,
    deadlines: []
    });

    persistTracks();
    renderTracks();
    renderTrackList();
    showToast(`Track "${name}" added`);

    isEditingTrack = false;
  });

  row.querySelector(".cancel-edit-btn").addEventListener("click", () => {
    isEditingTrack = false;
    row.remove();
  });
}


// --------------------------
// Modal Close Handling
// --------------------------

function attemptCloseModal() {
  const modal = document.getElementById("trackSettingsModal");

  if (isEditingTrack) {
    if (!confirm("You have unsaved changes. Discard them?")) {
      return;
    }
  }

  isEditingTrack = false;
  modal.classList.add("hidden");
}


// --------------------------
// Delete Confirmation
// --------------------------

function openDeleteConfirmModal(track) {
  trackPendingDeletion = track;

  const modal = document.getElementById("deleteConfirmModal");
  const text = document.getElementById("deleteConfirmText");

  text.textContent = `Are you sure you want to delete "${track.name}"?`;
  modal.classList.remove("hidden");
}

function deleteTrack(id) {
  tracks = tracks.filter(track => track.id !== id);
  persistTracks();
  renderTracks();
  renderTrackList();
}


// --------------------------
// Persistence Layer
// --------------------------

function persistTracks() {
  localStorage.setItem(TRACK_STORAGE_KEY, JSON.stringify(tracks));
}

function loadTracks() {
  const stored = localStorage.getItem(TRACK_STORAGE_KEY);
  tracks = stored ? JSON.parse(stored) : getDefaultTracks();
}

function getDefaultTracks() {
  return [
    { id: 1, name: "College", icon: "📚", deadlines: [] },
    { id: 2, name: "Projects", icon: "💻", deadlines: [] },
    { id: 3, name: "Learning", icon: "🧠", deadlines: [] },
    { id: 4, name: "Health", icon: "🏃", deadlines: [] }
  ];
}

// --------------------------
// Toast Notification
// --------------------------

function showToast(message) {
  const toast = document.getElementById("toastMessage");

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toast.textContent = message;
  toast.classList.remove("hidden");

  toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2500);
}

function updateTrackName(trackId, newName) {
  const track = tracks.find(t => t.id === trackId);
  if (!track) return;

  track.name = newName;
  persistTracks();
}
