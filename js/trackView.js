// =====================================================
// TRACK WORKSPACE VIEW
// Handles drill-down view for individual tracks
// =====================================================

let currentView = "dashboard";
let activeTrackId = null;


// =====================================================
// VIEW SWITCHING
// =====================================================

function openTrackView(trackId) {
  activeTrackId = trackId;
  currentView = "track";
  renderTrackWorkspace();
}

function backToDashboard() {
  currentView = "dashboard";
  activeTrackId = null;
  renderDashboardView();
}


// =====================================================
// WORKSPACE RENDERING
// =====================================================

function renderTrackWorkspace() {
  const center = document.querySelector(".center");
  const track = tracks.find(t => t.id === activeTrackId);
  if (!track) return;

  center.innerHTML = `
    <div class="workspace-header">
      <button id="backBtn">← Back</button>

    <div class="track-navigation">
    <div class="nav-left">
        <button id="prevTrackBtn" class="nav-btn">
        ← <span>Prev</span>
        </button>
    </div>
    <h2 class="track-title">
    <span class="editable-track-name">
        ${track.icon} 
        <span 
        id="trackNameDisplay" 
        class="editable-track-name"
        >
        ${track.name}
        </span>
    </span>
    </h2>
    <div class="nav-right">
        <button id="nextTrackBtn" class="nav-btn">
        <span>Next</span> →
        </button>
    </div>

    </div>

    <div class="workspace-divider">
      ${tracks.map(t => `
        <span 
          class="track-chip ${t.id === activeTrackId ? "active-chip" : ""}" 
          data-id="${t.id}">
          ${t.icon} ${t.name}
        </span>
      `).join("")}
    </div>

    <div class="workspace-layout">

      <div class="workspace-card">
        <div class="section-header">
          <h3>Reading</h3>
          <button id="addReadingBtn">+ Add</button>
        </div>
        <div id="readingList"></div>
      </div>

      <div class="workspace-card">
        <div class="section-header">
          <h3>Tasks</h3>
          <button id="addTaskBtn">+ Add</button>
        </div>
        <div id="taskList"></div>
      </div>

      <div class="workspace-card">
        <div class="deadline-header">
          <h3>Deadlines</h3>
          <button id="trackAddDeadlineBtn">+ Add</button>
        </div>
        <div id="deadlineList"></div>
      </div>

      <div class="workspace-card workspace-notes">
        <h3>Notes</h3>
        <div id="notesDisplay" class="editable-notes">
          ${track.notes || "Double-click to add notes..."}
        </div>
      </div>

    </div>
  `;

  attachWorkspaceEvents();
  renderDeadlines(track); 
  renderReading(track);
  renderTasks(track);
  renderNotes(track);
  const divider = document.querySelector(".workspace-divider");
  if (divider) enableSmartScrollbar(divider);
}


// =====================================================
// WORKSPACE EVENTS
// =====================================================

function attachWorkspaceEvents() {

    const nameEl = document.getElementById("trackNameDisplay");
    nameEl.addEventListener("click", () => {
    enableInlineEdit(nameEl);
    });

    const addBtn = document.getElementById("trackAddDeadlineBtn");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const track = tracks.find(t => t.id === activeTrackId);
        if (track) {
          openTrackDeadlineForm(track);
        }
      });
    }

    const readingBtn = document.getElementById("addReadingBtn");
    if (readingBtn) {
      readingBtn.onclick = () => {
        const track = tracks.find(t => t.id === activeTrackId);
        openReadingForm(track);
      };
    }

    const taskBtn = document.getElementById("addTaskBtn");
    if (taskBtn) {
      taskBtn.onclick = () => {
        const track = tracks.find(t => t.id === activeTrackId);
        openTaskForm(track);
      };
    }
    const notesEl = document.getElementById("notesDisplay");
    if (notesEl) {
      notesEl.addEventListener("dblclick", () => {
        const track = tracks.find(t => t.id === activeTrackId);
        enableNotesEdit(notesEl, track);
      });
    }

  document
    .getElementById("backBtn")
    .addEventListener("click", backToDashboard);

  document
    .getElementById("prevTrackBtn")
    .addEventListener("click", goToPreviousTrack);

  document
    .getElementById("nextTrackBtn")
    .addEventListener("click", goToNextTrack);

  document.querySelectorAll(".track-chip").forEach(el => {
    el.addEventListener("click", () => {
      openTrackView(Number(el.dataset.id));
    });
  });
}


// =====================================================
// DEADLINE RENDERING
// =====================================================

function renderDeadlines(track) {
  const container = document.getElementById("deadlineList");
    
  if (!track.deadlines) {
    track.deadlines = [];
  }

  container.innerHTML = "";

  track.deadlines
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
    .forEach(dl => {

      const computedStatus = getDeadlineStatus(dl);

      const div = document.createElement("div");
      div.classList.add("deadline-item");

      div.innerHTML = `
        <div>
          <strong>${dl.title}</strong>
          <div>${new Date(dl.datetime).toLocaleString()}</div>
        </div>

        <div class="deadline-status ${computedStatus}">
          ${computedStatus}
        </div>
      `;
    
      div.addEventListener("dblclick", () => {
        openEditDeadlineForm(track, dl);
        });

      container.appendChild(div);
    });
}

function getDeadlineStatus(deadline) {
  if (deadline.status === "finished") return "finished";
  if (deadline.status === "cancelled") return "cancelled";

  const now = new Date();
  const due = new Date(deadline.datetime);

  return due < now ? "missed" : "upcoming";
}


// =====================================================
// DEADLINE FORM
// =====================================================

function openTrackDeadlineForm(track) {

  const container = document.getElementById("deadlineList");

  // Prevent multiple forms
  if (container.querySelector(".deadline-form")) return;

  const form = document.createElement("div");
  form.classList.add("deadline-form");

  form.innerHTML = `
    <input type="text" id="deadlineTitle" placeholder="Deadline name" />

    <div class="deadline-datetime-row">
      <input type="date" id="deadlineDate" />
      <input type="time" id="deadlineTime" />
    </div>

    <div class="deadline-form-actions">
    <button type="button" class="neutral-btn" id="todayEODBtn">
        Today EOD
    </button>

    <button type="button" class="primary-btn" id="saveDeadlineBtn" disabled>
        Save
    </button>

    <button type="button" class="neutral-btn" id="cancelDeadlineBtn">
        Cancel
    </button>
    </div>

  `;

  container.prepend(form);

  // Scoped DOM references
  const titleInput = form.querySelector("#deadlineTitle");
  const dateInput = form.querySelector("#deadlineDate");
  const timeInput = form.querySelector("#deadlineTime");
  const todayBtn = form.querySelector("#todayEODBtn");
  const saveBtn = form.querySelector("#saveDeadlineBtn");
  const cancelBtn = form.querySelector("#cancelDeadlineBtn");

  // ---------------------------------------------------
  // VALIDATION
  // ---------------------------------------------------

  function validateForm() {
    const title = titleInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;

    saveBtn.disabled = !(title && date && time);
  }

  titleInput.addEventListener("input", validateForm);
  dateInput.addEventListener("input", validateForm);
  timeInput.addEventListener("input", validateForm);

  // ---------------------------------------------------
  // TODAY EOD BUTTON
  // ---------------------------------------------------

  todayBtn.addEventListener("click", () => {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    dateInput.value = `${year}-${month}-${day}`;
    timeInput.value = "23:59";

    validateForm(); // important
  });

  // ---------------------------------------------------
  // SAVE DEADLINE
  // ---------------------------------------------------

  function saveDeadline() {

    const title = titleInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;

    const datetime = new Date(`${date}T${time}`);

    if (isNaN(datetime.getTime())) {
      alert("Invalid date/time.");
      return;
    }

    // Prevent duplicate
    const alreadyExists = track.deadlines.some(dl =>
      dl.title === title &&
      dl.datetime === datetime.toISOString()
    );

    if (alreadyExists) {
      alert("This deadline already exists.");
      return;
    }

    saveBtn.disabled = true;

    track.deadlines.push({
      id: Date.now(),
      title,
      datetime: datetime.toISOString(),
      status: "upcoming"
    });

    persistTracks();              // saves + refreshes sidebar

    showToast(`Deadline "${title}" saved`);

    form.remove();                // remove form first
    renderDeadlines(track);       // re-render only track list
  }

  saveBtn.addEventListener("click", saveDeadline);

  // Enter key support
  form.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !saveBtn.disabled) {
      e.preventDefault();
      saveDeadline();
    }
  });

  // ---------------------------------------------------
  // CANCEL
  // ---------------------------------------------------

  cancelBtn.addEventListener("click", () => {
    form.remove();
  });
}

// =====================================================
// EDIT DEADLINE FORM
// =====================================================

function openEditDeadlineForm(track, deadline) {

  const container = document.getElementById("deadlineList");

  // Prevent multiple edit forms
  if (container.querySelector(".deadline-form")) return;

  const form = document.createElement("div");
  form.classList.add("deadline-form");

  const existingDate = new Date(deadline.datetime);

  const yyyy = existingDate.getFullYear();
  const mm = String(existingDate.getMonth() + 1).padStart(2, "0");
  const dd = String(existingDate.getDate()).padStart(2, "0");
  const hh = String(existingDate.getHours()).padStart(2, "0");
  const min = String(existingDate.getMinutes()).padStart(2, "0");

  form.innerHTML = `
    <input type="text" id="editTitle" value="${deadline.title}" />

    <div class="deadline-datetime-row">
      <input type="date" id="editDate" value="${yyyy}-${mm}-${dd}" />
      <input type="time" id="editTime" value="${hh}:${min}" />
    </div>

    <div class="deadline-form-actions">
    <button type="button" class="neutral-btn" id="cancelEditBtn">Cancel</button>
    <button type="button" class="primary-btn" id="updateDeadlineBtn">Update</button>
    <button type="button" class="danger-btn" id="deleteDeadlineBtn">Delete</button>
    </div>

  `;

  container.prepend(form);

  const titleInput = form.querySelector("#editTitle");
  const dateInput = form.querySelector("#editDate");
  const timeInput = form.querySelector("#editTime");
  const updateBtn = form.querySelector("#updateDeadlineBtn");
  const cancelBtn = form.querySelector("#cancelEditBtn");
  const deleteBtn = form.querySelector("#deleteDeadlineBtn");


  updateBtn.addEventListener("click", () => {

    const newTitle = titleInput.value.trim();
    const newDate = dateInput.value;
    const newTime = timeInput.value;

    if (!newTitle || !newDate || !newTime) {
      alert("All fields required.");
      return;
    }

    const newDatetime = new Date(`${newDate}T${newTime}`);

    if (isNaN(newDatetime.getTime())) {
      alert("Invalid date/time.");
      return;
    }

    // Update the object directly
    deadline.title = newTitle;
    deadline.datetime = newDatetime.toISOString();

    persistTracks();
    renderGlobalDeadlines();
    showToast("Deadline updated");

    form.remove();
    renderDeadlines(track);
  });

  deleteBtn.addEventListener("click", () => {

    const confirmed = confirm(
        `Are you sure you want to delete "${deadline.title}"?`
    );

    if (!confirmed) return;

    track.deadlines = track.deadlines.filter(
        dl => dl.id !== deadline.id
    );

    persistTracks();
    renderGlobalDeadlines();
    showToast(`Deadline "${deadline.title}" deleted`);

    form.remove();
    renderDeadlines(track);
    });


  cancelBtn.addEventListener("click", () => {
    form.remove();
  });
}


// =====================================================
// TRACK NAVIGATION
// =====================================================

function goToPreviousTrack() {
  const index = tracks.findIndex(t => t.id === activeTrackId);
  if (index > 0) openTrackView(tracks[index - 1].id);
}

function goToNextTrack() {
  const index = tracks.findIndex(t => t.id === activeTrackId);
  if (index < tracks.length - 1)
    openTrackView(tracks[index + 1].id);
}


// =====================================================
// DASHBOARD VIEW RESTORE
// =====================================================

function renderDashboardView() {
  const center = document.querySelector(".center");

  center.innerHTML = `
    <div class="center-header">
      <h2>My Tracks</h2>
      <button id="trackSettingsBtn">⚙</button>
    </div>
    <div id="trackGrid" class="grid"></div>
  `;

  renderTracks();

  document
    .getElementById("trackSettingsBtn")
    .addEventListener("click", () => {
      document
        .getElementById("trackSettingsModal")
        .classList.remove("hidden");

      renderTrackList();
    });
}

function enableInlineEdit(element) {
  element.setAttribute("contenteditable", "true");
  element.focus();

  // Move cursor to end
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(element);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);

  element.classList.add("editing");

    function save() {
    const newName = element.textContent.trim();

    const track = tracks.find(t => t.id === activeTrackId);
    if (!track) return;

    if (!newName) {
        // revert if empty
        element.textContent = track.name;
    } else {
        updateTrackName(activeTrackId, newName);
    }

    element.removeAttribute("contenteditable");
    element.classList.remove("editing");

    refreshCurrentView();   
    }

  element.addEventListener("blur", save, { once: true });

  element.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      element.blur();
    }
    if (e.key === "Escape") {
      element.textContent =
        tracks.find(t => t.id === activeTrackId).name;
      element.blur();
    }
  });
}

function refreshCurrentView() {
  if (currentView === "dashboard") {
    renderDashboardView();
  } else if (currentView === "track") {
    renderTrackWorkspace();
  }
}

function enableSmartScrollbar(element) {
  if (!element) return;

  let scrollTimeout;

  element.addEventListener("scroll", () => {
    element.classList.add("scrolling");

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      element.classList.remove("scrolling");
    }, 600);
  });
}


function renderReading(track) {
  const container = document.getElementById("readingList");
  if (!container) return;

  container.innerHTML = "";

  track.reading.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("deadline-item"); // reuse styling

    div.innerHTML = `
      <div>
        <strong>${item.topic}</strong>
        ${item.link ? `<div><a href="${item.link}" target="_blank">Open Link</a></div>` : ""}
      </div>
    `;

    container.appendChild(div);
  });
}

function renderTasks(track) {
  const container = document.getElementById("taskList");
  if (!container) return;

  container.innerHTML = "";

  track.tasks.forEach(task => {
    const div = document.createElement("div");
    div.classList.add("deadline-item");

    div.innerHTML = `
      <div>
        <strong>${task.name}</strong>
        <div>Prereq: ${task.prereq}</div>
        <div>Prereq Time: ${task.prereqTime}</div>
        <div>Task Time: ${task.taskTime}</div>
      </div>
    `;

    container.appendChild(div);
  });
}

function renderNotes(track) {
  const textarea = document.getElementById("notesInput");
  if (!textarea) return;

  textarea.value = track.notes || "";

  textarea.addEventListener("input", () => {
    track.notes = textarea.value;
    persistTracks();
  });
}

function openReadingForm(track) {
  const container = document.getElementById("readingList");
  if (container.querySelector(".deadline-form")) return;

  const form = document.createElement("div");
  form.classList.add("deadline-form");

  form.innerHTML = `
    <input type="text" id="readingTopic" placeholder="Topic" />
    <input type="text" id="readingLink" placeholder="Link (optional)" />

    <div class="deadline-form-actions">
      <button class="neutral-btn" id="cancelReadingBtn">Cancel</button>
      <button class="primary-btn" id="saveReadingBtn">Save</button>
    </div>
  `;

  container.prepend(form);

  const topicInput = form.querySelector("#readingTopic");
  const linkInput = form.querySelector("#readingLink");

  form.querySelector("#saveReadingBtn").onclick = () => {
    const topic = topicInput.value.trim();
    const link = linkInput.value.trim();

    if (!topic) {
      alert("Topic required.");
      return;
    }

    track.reading.push({
      id: Date.now(),
      topic,
      link
    });

    persistTracks();
    form.remove();
    renderReading(track);
  };

  form.querySelector("#cancelReadingBtn").onclick = () => {
    form.remove();
  };
}

function openTaskForm(track) {
  const container = document.getElementById("taskList");
  if (container.querySelector(".deadline-form")) return;

  const form = document.createElement("div");
  form.classList.add("deadline-form");

  form.innerHTML = `
    <input type="text" id="taskName" placeholder="Task name" />
    <input type="text" id="taskPrereq" placeholder="Prerequisite needed" />
    <input type="text" id="taskPrereqTime" placeholder="Estimated time for prereq" />
    <input type="text" id="taskTime" placeholder="Estimated time for task" />

    <div class="deadline-form-actions">
      <button class="neutral-btn" id="cancelTaskBtn">Cancel</button>
      <button class="primary-btn" id="saveTaskBtn">Save</button>
    </div>
  `;

  container.prepend(form);

  const nameInput = form.querySelector("#taskName");
  const prereqInput = form.querySelector("#taskPrereq");
  const prereqTimeInput = form.querySelector("#taskPrereqTime");
  const taskTimeInput = form.querySelector("#taskTime");

  form.querySelector("#saveTaskBtn").onclick = () => {
    const name = nameInput.value.trim();
    const prereq = prereqInput.value.trim();
    const prereqTime = prereqTimeInput.value.trim();
    const taskTime = taskTimeInput.value.trim();

    if (!name || !prereq || !prereqTime || !taskTime) {
      alert("All fields required.");
      return;
    }

    track.tasks.push({
      id: Date.now(),
      name,
      prereq,
      prereqTime,
      taskTime
    });

    persistTracks();
    form.remove();
    renderTasks(track);
  };

  form.querySelector("#cancelTaskBtn").onclick = () => {
    form.remove();
  };
}


function enableNotesEdit(element, track) {
  element.setAttribute("contenteditable", "true");
  element.focus();

  element.classList.add("editing");

  function save() {
    track.notes = element.textContent.trim();
    persistTracks();
    element.removeAttribute("contenteditable");
    element.classList.remove("editing");
  }

  element.addEventListener("blur", save, { once: true });

  element.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      element.blur();
    }
  });
}
