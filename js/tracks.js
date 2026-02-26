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

let currentOpenTrackId = null;

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
  renderGlobalDeadlines();
  attachTrackEvents();
  const addBtn = document.getElementById("addDeadlineBtn");
  if (addBtn) {
    addBtn.addEventListener("click", openSidebarDeadlineForm);
  }
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
// Render Deadlines
// --------------------------

function renderGlobalDeadlines() {
  const container = document.getElementById("globalDeadlineList");
  if (!container) return;

  container.innerHTML = "";

  const allDeadlines = tracks.flatMap(track =>
    (track.deadlines || []).map(dl => ({
      ...dl,
      trackId: track.id,
      trackName: track.name
    }))
  );

  allDeadlines
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
    .forEach(dl => {
      const div = document.createElement("div");
      div.classList.add("deadline-item");

      div.innerHTML = `
        <div>
          <strong>${dl.title}</strong>
          <div>${new Date(dl.datetime).toLocaleString()}</div>
          <small>${dl.trackName}</small>
        </div>
      `;

      container.appendChild(div);
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
    deadlines: [],
    tasks: [],
    reading: [],
    notes: ""
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
  renderGlobalDeadlines();
}

function loadTracks() {
  const stored = localStorage.getItem(TRACK_STORAGE_KEY);
  tracks = stored ? JSON.parse(stored) : getDefaultTracks();
  tracks.forEach(track => {
    if (!track.deadlines) track.deadlines = [];
    if (!track.tasks) track.tasks = [];
    if (!track.reading) track.reading = [];
    if (!track.notes) track.notes = "";
    
    track.reading.forEach(item => {
      if (!item.links) {
        item.links = item.link ? [item.link] : [];
        delete item.link;
      }
    });
  });
}

function getDefaultTracks() {
  return [
    { 
      id: 1, 
      name: "College", 
      icon: "📚", 
      deadlines: [], 
      tasks: [], 
      reading: [], 
      notes: ""
    },
    { 
      id: 2, 
      name: "Projects", 
      icon: "💻", 
      deadlines: [],
      tasks: [], 
      reading: [], 
      notes: ""
    },
    { 
      id: 3, 
      name: "Learning", 
      icon: "🧠", 
      deadlines: [],
      tasks: [], 
      reading: [], 
      notes: "" 
    },
    { 
      id: 4, 
      name: "Health", 
      icon: "🏃", 
      deadlines: [],
      tasks: [], 
      reading: [], 
      notes: ""  
    }
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


function openSidebarDeadlineForm() {
  const container = document.getElementById("globalDeadlineList");
  if (!container) return;

  if (container.querySelector(".deadline-form")) return;

  const form = document.createElement("div");
  form.classList.add("deadline-form");

  const trackOptions = tracks.map(track =>
    `<option value="${track.id}">${track.name}</option>`
  ).join("");

  form.innerHTML = `
    <input type="text" id="sidebarTitle" placeholder="Deadline name" />

    <select id="sidebarTrackSelect">
      ${trackOptions}
    </select>

    <div class="deadline-datetime-column">
      <input type="date" id="sidebarDate" />
      <input type="time" id="sidebarTime" />
    </div>

    <div class="deadline-form-actions">
      <button type="button" class="neutral-btn" id="sidebarTodayBtn">
        Today EOD
      </button>

      <button type="button" class="primary-btn" id="sidebarSaveBtn">
        Save
      </button>

      <button type="button" class="neutral-btn" id="sidebarCancelBtn">
        Cancel
      </button>
    </div>
  `;

  container.prepend(form);

  // ✅ GET ALL INPUT REFERENCES (YOU WERE MISSING THESE)
  const titleInput = form.querySelector("#sidebarTitle");
  const trackSelect = form.querySelector("#sidebarTrackSelect");
  const dateInput = form.querySelector("#sidebarDate");
  const timeInput = form.querySelector("#sidebarTime");

  const todayBtn = form.querySelector("#sidebarTodayBtn");
  const saveBtn = form.querySelector("#sidebarSaveBtn");
  const cancelBtn = form.querySelector("#sidebarCancelBtn");

  // ✅ TODAY BUTTON
  todayBtn.addEventListener("click", () => {
    const now = new Date();

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    dateInput.value = `${yyyy}-${mm}-${dd}`;
    timeInput.value = "23:59";
  });

  // ✅ SAVE BUTTON
  saveBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    const trackId = Number(trackSelect.value);

    if (!title || !date || !time) {
      alert("All fields required.");
      return;
    }

    const datetime = new Date(`${date}T${time}`);

    if (isNaN(datetime.getTime())) {
      alert("Invalid date/time.");
      return;
    }

    const selectedTrack = tracks.find(t => t.id === trackId);
    if (!selectedTrack) return;

    selectedTrack.deadlines.push({
      id: Date.now(),
      title,
      datetime: datetime.toISOString(),
      status: "upcoming"
    });

    persistTracks();

    // refresh currently open track view if needed
    if (currentOpenTrackId === trackId) {
      renderDeadlines(selectedTrack);
    }

    form.remove();
  });

  cancelBtn.addEventListener("click", () => {
    form.remove();
  });
}

