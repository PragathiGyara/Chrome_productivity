// =====================================================
// TRACK MANAGEMENT MODULE
// Handles:
// - Rendering center track grid
// - Track overview visual ring
// - Drag & drop reordering (with FLIP animation)
// - Inline track editing (name + icon)
// - Inline track creation
// - Track deletion with confirmation modal
// - Modal close protection (unsaved changes)
// - Persistence using localStorage
// =====================================================


// --------------------------
// Constants
// --------------------------

let currentDashboardSection = "tracks";

let currentOpenTrackId = null;

let isDragging = false;

let draggedTrackId = null;

let currentLeftView = "deadlines"; // "deadlines" | "todos"

let currentDashboardPage = 0;

const dashboardPages = [
  "tracks",
  "projects"
];

const BASE_LANGUAGES = ["English", "Hindi", "Telugu", "Marathi"];


// --------------------------
// In-Memory State
// --------------------------

let tracks = [];
let projects = [];
let activeTrackEditId = null;
let trackPendingDeletion = null;


// --------------------------
// Initialization
// --------------------------

document.addEventListener("DOMContentLoaded", () => {

  loadTracks();

  loadProjects();

  renderDashboardView();

  updateLeftPanel();

  setupLeftPanelToggle();

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

  // Open settings modal
  settingsBtn.addEventListener("click", () => {
    openModal("trackSettingsModal");
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

function setupLeftPanelToggle() {
  const toggle = document.getElementById("viewToggle");

  toggle.addEventListener("click", (e) => {
    if (!e.target.classList.contains("toggle-option")) return;

    currentLeftView = e.target.dataset.view;

    // Update UI state
    toggle.querySelectorAll(".toggle-option")
      .forEach(el => el.classList.remove("active"));

    e.target.classList.add("active");

    updateLeftPanel();
  });
}

// --------------------------
// Track Overview
// --------------------------

function computeTrackOverview(track) {

  const now = new Date();

  const tasks = track.tasks || [];
  const reading = track.reading || [];
  const deadlines = track.deadlines || [];

  const completedTasks = tasks.filter(t => t.finished).length;
  const remainingTasks = tasks.length - completedTasks;

  const missedDeadlines = deadlines.filter(d =>
    new Date(d.datetime) < now &&
    d.status !== "finished"
  ).length;

  const upcomingDeadlines = deadlines.filter(d =>
    new Date(d.datetime) >= now &&
    d.status !== "finished"
  );

  const sortedUpcoming = [...upcomingDeadlines].sort(
    (a, b) => new Date(a.datetime) - new Date(b.datetime)
  );

  let nextDeadline = null;
  let nextDeadlineCount = 0;

  if (sortedUpcoming.length > 0) {
    nextDeadline = new Date(sortedUpcoming[0].datetime);

    nextDeadlineCount = sortedUpcoming.filter(d =>
      new Date(d.datetime).getTime() === nextDeadline.getTime()
    ).length;
  }

  return {
    completedTasks,
    remainingTasks,
    readingCount: reading.length,
    upcomingDeadlines: upcomingDeadlines.length,
    missedDeadlines,
    total:
      tasks.length +
      reading.length +
      deadlines.length,
    nextDeadline,
    nextDeadlineCount
  };
}

function formatDateTime(date) {

  const now = new Date();

  const isToday =
    date.toDateString() === now.toDateString();

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);

  const isTomorrow =
    date.toDateString() === tomorrow.toDateString();

  const timePart = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  if (isToday) {
    return `Today, ${timePart} (${getRelativeTime(date)})`;
  }

  if (isTomorrow) {
    return `Tomorrow, ${timePart}`;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getRelativeTime(date) {

  const diff = date - new Date();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (minutes < 60) {
    return `in ${minutes}m`;
  }

  return `in ${hours}h`;
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

// --------------------------
// Left Panel
// --------------------------

function updateLeftPanel() {
  const title = document.getElementById("leftPanelTitle");
  const btn = document.getElementById("addDeadlineBtn");

  if (!title || !btn) {
    console.error("Left panel elements not found");
    return;
  }

  if (currentLeftView === "deadlines") {
    title.textContent = "Deadlines";
    renderGlobalDeadlines();

    btn.textContent = "+ New Deadline";
    btn.onclick = openSidebarDeadlineForm;

  } else {
    title.textContent = "Today";
    renderTodayTodos();

    btn.textContent = "+ Add Task";
    btn.onclick = openSidebarTodoForm;
  }
}

// --------------------------
// Render TO DO
// --------------------------


function renderTodayTodos() {
  const container = document.getElementById("globalDeadlineList");
  if (!container) return;

  container.innerHTML = "";

  const { todos, today } = getTodayTodos();

  // Optional summary
  const summary = document.createElement("div");
  summary.classList.add("todo-summary");

  const completed = today.items.filter(i => i.done).length;
  summary.textContent = `${completed}/${today.items.length} done`;

  container.appendChild(summary);

  // Items
  today.items.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("todo-item");

    div.innerHTML = `
      <div class="todo-card ${item.done ? "done" : ""}">
        <input type="checkbox" ${item.done ? "checked" : ""} />
        <span class="todo-text">${item.text}</span>
      </div>
    `;

    div.querySelector("input").addEventListener("change", (e) => {
      item.done = e.target.checked;
      persistTodos(todos);
      renderTodayTodos();
    });

    container.appendChild(div);
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
    (track.deadlines || [])
      .filter(dl => dl.status !== "finished")  
      .map(dl => ({
        deadline: dl,
        track: track
      }))
  );

  allDeadlines
    .sort((a, b) => new Date(a.deadline.datetime) - new Date(b.deadline.datetime))
    .forEach(({ deadline, track }) => {

      const div = document.createElement("div");
      div.classList.add("deadline-item");

      div.innerHTML = `
        <div>
          <strong>${deadline.title}</strong>
          <div>${new Date(deadline.datetime).toLocaleString()}</div>
          <small>${track.name}</small>
        </div>
      `;

      div.addEventListener("click", () => {
        openEditDeadlineForm(track, deadline,"global");
      });

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
      .addEventListener("click", () => enableTrackModalEdit(row, track));

    row.querySelector(".delete-track-btn")
      .addEventListener("click", () => openDeleteConfirmModal(track));

    list.appendChild(row);
  });
}

// --------------------------
// Drag and Drop Tracks
// --------------------------

function enableDragMode() {
  dragModeEnabled = true;

  document.querySelectorAll(".card").forEach(card => {
    card.classList.add("drag-enabled");
  });

  showToast("Drag mode enabled");
}

function handleDragStart(e) {
  isDragging = true;
  this.classList.add("dragging");
}

function handleDragOver(e) {
  e.preventDefault(); // required for drop

  const draggingElement = document.querySelector(".dragging");
  if (!draggingElement || this === draggingElement) return;

  const grid = document.getElementById("trackGrid");
  const children = [...grid.children];

  const draggedIndex = children.indexOf(draggingElement);
  const targetIndex = children.indexOf(this);

  if (draggedIndex < targetIndex) {
    grid.insertBefore(draggingElement, this.nextSibling);
  } else {
    grid.insertBefore(draggingElement, this);
  }
}

function handleDrop(e) {
  e.stopPropagation();
}

function handleDragEnd() {
  this.classList.remove("dragging");

  updateTrackOrderFromDOM();

  // small delay so click doesn't fire immediately
  setTimeout(() => {
    isDragging = false;
  }, 50);

  showToast("Track order updated");
}

function updateTrackOrderFromDOM() {
  const grid = document.getElementById("trackGrid");
  const cards = Array.from(grid.children);

  // FIRST — get initial positions
  const firstRects = new Map();
  cards.forEach(card => {
    firstRects.set(card.dataset.id, card.getBoundingClientRect());
  });

  // Update internal tracks order
  const newOrder = [];
  cards.forEach(card => {
    const id = Number(card.dataset.id);
    const track = tracks.find(t => t.id === id);
    if (track) newOrder.push(track);
  });
  tracks = newOrder;

  // LAST — get new positions after DOM already changed
  requestAnimationFrame(() => {
    cards.forEach(card => {
      const lastRect = card.getBoundingClientRect();
      const firstRect = firstRects.get(card.dataset.id);

      const dx = firstRect.left - lastRect.left;
      const dy = firstRect.top - lastRect.top;

      // INVERT
      card.style.transform = `translate(${dx}px, ${dy}px)`;

      // PLAY
      requestAnimationFrame(() => {
        card.style.transform = "";
      });
    });
  });

  persistTracks();
}

// =====================================================
// TRACK MODAL EDITING
// =====================================================

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

function openSidebarTodoForm() {
  const container = document.getElementById("globalDeadlineList");
  if (!container) return;

  if (container.querySelector(".todo-form")) return;

  const form = document.createElement("div");
  form.classList.add("todo-form");

  form.innerHTML = `
    <input type="text" id="todoInput" placeholder="What needs to be done today?" />

    <div class="deadline-form-actions">
      <button id="saveTodoBtn" class="primary-btn">Add</button>
      <button id="cancelTodoBtn" class="neutral-btn">Cancel</button>
    </div>
  `;

  container.prepend(form);

  const input = form.querySelector("#todoInput");

  form.querySelector("#saveTodoBtn").addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;

    const { todos, today } = getTodayTodos();

    today.items.push({
      id: Date.now(),
      text,
      done: false
    });

    persistTodos(todos);
    renderTodayTodos();
    form.remove();
  });

  form.querySelector("#cancelTodoBtn").addEventListener("click", () => {
    form.remove();
  });
}

