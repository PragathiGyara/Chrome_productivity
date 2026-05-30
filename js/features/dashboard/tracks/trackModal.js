// =====================================================
// TRACK MODAL
//
// Responsibilities:
// - Open track settings modal
// - Edit track metadata
// - Create tracks
// - Delete tracks
// - Validate track names
//
// Does NOT handle:
// - Track rendering
// - Track statistics
// - Drag & drop
// =====================================================


let activeTrackEditId = null;
let trackPendingDeletion = null;


/* =====================================================
   TRACK SETTINGS
===================================================== */

function openTrackSettings() {

  openModal(
    "trackSettingsModal"
  );

  renderTrackList();
}


function validateTrackName(name, currentTrackId = null) {

  const trimmed = name.trim();

  if (!trimmed) {
    return "Track name cannot be empty.";
  }

  if (trimmed.length > 40) {
    return "Track name is too long.";
  }

  const duplicate = tracks.find(track =>
    track.id !== currentTrackId &&
    track.name.toLowerCase() === trimmed.toLowerCase()
  );

  if (duplicate) {
    return "Track name already exists.";
  }

  return null;
}

function enableTrackModalEdit(row, track) {

  if (activeTrackEditId !== null) return;

  activeTrackEditId = track.id;

  let selectedIcon = track.icon;

  const originalHTML = row.innerHTML;

  const iconGrid = TRACK_ICONS.map(icon => `
    <span
      class="icon-option ${
        icon === track.icon ? "selected-icon" : ""
      }"
      data-icon="${icon}"
    >
      ${icon}
    </span>
  `).join("");

  row.innerHTML = `

    <div class="edit-container">

      <div class="edit-preview">

        <span class="preview-icon">
          ${selectedIcon}
        </span>

        <span class="preview-name">
          ${track.name}
        </span>

      </div>

      <input
        class="edit-name"
        value="${track.name}"
      />

      <div class="icon-picker">
        ${iconGrid}
      </div>

    </div>

    <div class="track-actions">

      <button class="save-edit-btn">
        ✔
      </button>

      <button class="cancel-edit-btn">
        ✖
      </button>

    </div>
  `;

  const nameInput = row.querySelector(".edit-name");

  const previewIcon =
    row.querySelector(".preview-icon");

  const previewName =
    row.querySelector(".preview-name");

  // =========================================
  // LIVE NAME PREVIEW
  // =========================================

  nameInput.addEventListener("input", () => {

    previewName.textContent =
      nameInput.value.trim() || "Untitled";

  });

  // =========================================
  // ICON SELECTION
  // =========================================

  row.querySelectorAll(".icon-option")
    .forEach(el => {

      el.addEventListener("click", () => {

        row.querySelectorAll(".icon-option")
          .forEach(i =>
            i.classList.remove("selected-icon")
          );

        el.classList.add("selected-icon");

        selectedIcon = el.dataset.icon;

        previewIcon.textContent = selectedIcon;

      });

    });

  // =========================================
  // SAVE
  // =========================================

  row.querySelector(".save-edit-btn")
    .addEventListener("click", () => {

      const newName = nameInput.value.trim();

      const error =
        validateTrackName(newName, track.id);

      if (error) {
        alert(error);
        return;
      }

      track.name = newName;
      track.icon = selectedIcon;

      persistTracks();

      refreshCurrentView();

      renderTrackList();

      showToast("Track updated");

      activeTrackEditId = null;

    });

  // =========================================
  // CANCEL
  // =========================================

  row.querySelector(".cancel-edit-btn")
    .addEventListener("click", () => {

      row.innerHTML = originalHTML;

      activeTrackEditId = null;

      // Reattach listeners manually
      row.querySelector(".edit-track-btn")
        ?.addEventListener("click", () =>
          enableTrackModalEdit(row, track)
        );

      row.querySelector(".delete-track-btn")
        ?.addEventListener("click", () =>
          openDeleteConfirmModal(track)
        );

    });

}


// --------------------------
// Inline Add Logic
// --------------------------

function openInlineAdd() {
  if (activeTrackEditId) return;

  activeTrackEditId = "new-track";

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
    deadlines: [],
    tasks: [],
    reading: [],
    notes: ""
    });

    persistTracks();
    renderTracks();
    renderTrackList();
    showToast(`Track "${name}" added`);

    activeTrackEditId = null;
  });

  row.querySelector(".cancel-edit-btn").addEventListener("click", () => {
    activeTrackEditId = null;
    row.remove();
  });
}


// --------------------------
// Modal Close Handling
// --------------------------

function attemptCloseModal() {

  const modal =
    document.getElementById("trackSettingsModal");

  if (activeTrackEditId !== null) {

    const confirmed = confirm(
      "Discard current edit?"
    );

    if (!confirmed) {
      return;
    }

  }

  activeTrackEditId = null;

  closeModal("trackSettingsModal");
}


// --------------------------
// Delete Confirmation
// --------------------------

function openDeleteConfirmModal(track) {
  trackPendingDeletion = track;

  const modal = document.getElementById("deleteConfirmModal");
  const text = document.getElementById("deleteConfirmText");

  text.textContent = `Are you sure you want to delete "${track.name}"?`;
  openModal("deleteConfirmModal");
}

function deleteTrack(id) {
  tracks = tracks.filter(
    track => track.id !== id
  );

  persistTracks();
  refreshCurrentView();
  renderTrackList();
}


function updateTrackName(trackId, newName) {
  const track = tracks.find(t => t.id === trackId);
  if (!track) return;

  track.name = newName;
  persistTracks();
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
      .addEventListener("click", () => enableTrackModalEdit(row, track));

    row.querySelector(".delete-track-btn")
      .addEventListener("click", () => openDeleteConfirmModal(track));

    list.appendChild(row);
  });
}
