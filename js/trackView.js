// =====================================================
// TRACK WORKSPACE MODULE
// Handles:
// - Switching between dashboard and track view
// - Rendering track workspace
// - Managing Deadlines, Reading, Tasks, Notes
// - Handling navigation between tracks
// =====================================================


// =====================================================
// GLOBAL VIEW STATE
// =====================================================

let currentView = "dashboard";
let activeTrackId = null;
let showFinishedTasks = false;
let selectedNewTrackIcon = "📌";
let draggedReadingId = null;


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
      <span class="workspace-track-header">
        <span
          id="workspaceTrackIcon"
          class="workspace-track-icon"
          title="Change icon"
        >
          ${track.icon}
        </span>
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
          <div class="reading-section-title">
            <h3>Reading</h3>

            <div class="reading-stats">
              ${
                track.reading.filter(r => r.completed).length
              } / ${track.reading.length} completed
            </div>
          </div>
          <button id="addReadingBtn">+ Add</button>
        </div>
        <div id="readingList"></div>
      </div>

      <div class="workspace-card">
        <div class="section-header">
          <h3>Tasks</h3>
          <div>
            <button id="addTaskBtn">+ Add</button>          
          </div>
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
// WORKSPACE EVENT BINDING
// =====================================================

function attachWorkspaceEvents() {

  const track = tracks.find(t => t.id === activeTrackId);
  if (!track) return;

  // Navigation buttons
  document.getElementById("backBtn")?.addEventListener("click", backToDashboard);
  document.getElementById("prevTrackBtn")?.addEventListener("click", goToPreviousTrack);
  document.getElementById("nextTrackBtn")?.addEventListener("click", goToNextTrack);

  // Track name editing
  const nameEl = document.getElementById("trackNameDisplay");
  if (nameEl) {
    nameEl.addEventListener("click", () => enableWorkspaceTrackNameEdit(nameEl));
  }
  const iconEl =
  document.getElementById("workspaceTrackIcon");
  if (iconEl) {
    iconEl.addEventListener("click", (e) => {
      e.stopPropagation();
      openWorkspaceIconPicker(iconEl, track);
    });
  }

  // Deadline add button
  document.getElementById("trackAddDeadlineBtn")?.addEventListener(
    "click",
    () => openTrackDeadlineForm(track)
  );

  // Reading add button
  document.getElementById("addReadingBtn")?.addEventListener(
    "click",
    () => openReadingForm(track)
  );

  // Task add button
  document.getElementById("addTaskBtn")?.addEventListener(
    "click",
    () => openTaskForm(track)
  );

  // Notes edit
  const notesEl = document.getElementById("notesDisplay");
  if (notesEl) {
    notesEl.addEventListener("dblclick", () => {
      enableNotesEdit(notesEl, track);
    });
  }

  // Track chips
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
    .sort((a, b) => {
      if (a.status === "finished" && b.status !== "finished") return 1;
      if (a.status !== "finished" && b.status === "finished") return -1;

      return new Date(a.datetime) - new Date(b.datetime);
    })
    .forEach(dl => {

      const computedStatus = getDeadlineStatus(dl);

      const div = document.createElement("div");
      if (dl.status === "finished") {
        div.classList.add("deadline-finished");
      }
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
        openEditDeadlineForm(track, dl,"track");
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
      datetime: datetime.toISOString()
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

function findTrackByDeadline(deadlineId) {
  return tracks.find(t =>
    (t.deadlines || []).some(d => d.id === deadlineId)
  );
}

function openEditDeadlineForm(track, deadline, source="track") {

  let container;

  if (source === "global") {
    container = document.getElementById("globalDeadlineList");
  } else {
    container = document.getElementById("deadlineList");
  }

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

    <!-- 🔥 STATUS ACTIONS -->
    ${deadline.status !== "finished" ? `
      <div class="deadline-status-actions">
        <button type="button" class="status-btn complete-btn" id="markFinishedBtn">
          ✓ Mark Finished
        </button>
      </div>
    ` : ""}

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
  const finishBtn = form.querySelector("#markFinishedBtn");

  updateBtn.disabled = true;

  const originalTitle = deadline.title;
  const originalDatetime = deadline.datetime;

  function checkForChanges() {
    const newTitle = titleInput.value.trim();
    const newDate = dateInput.value;
    const newTime = timeInput.value;

    const newDatetime = newDate && newTime
      ? new Date(`${newDate}T${newTime}`).toISOString()
      : null;

    const isChanged =
      newTitle !== originalTitle ||
      newDatetime !== originalDatetime;

    updateBtn.disabled = !isChanged;
  }
  titleInput.addEventListener("input", checkForChanges);
  dateInput.addEventListener("input", checkForChanges);
  timeInput.addEventListener("input", checkForChanges);

  if (finishBtn) {
    finishBtn.addEventListener("click", () => {

      // 🔥 FIND CORRECT TRACK
      const correctTrack = findTrackByDeadline(deadline.id);

      if (!correctTrack) return;

      deadline.status = "finished";

      persistTracks();

      showToast(`"${deadline.title}" marked as finished`);

      form.remove();

      // 🔥 ONLY UPDATE CORRECT TRACK
      renderDeadlines(correctTrack);

      renderGlobalDeadlines();

      // Optional but safe
      refreshCurrentView();
    });
  }

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

    if (deadline.status === "finished") {
      delete deadline.status;
    }

    persistTracks();

    renderGlobalDeadlines();
  const correctTrack = findTrackByDeadline(deadline.id);

  renderDeadlines(correctTrack);
    refreshCurrentView();  

    showToast("Deadline updated");

    form.remove();
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
  const correctTrack = findTrackByDeadline(deadline.id);

  renderDeadlines(correctTrack);
    });


  cancelBtn.addEventListener("click", () => {
    form.remove();
  });
}

// =====================================================
// READING RENDERING
// =====================================================

function renderReading(track) {
  const container = document.getElementById("readingList");
  if (!container) return;

  container.innerHTML = "";
  const sortedReading = [...track.reading].sort((a, b) => {
    return Number(a.completed) - Number(b.completed);
  });

  sortedReading.forEach((item, index) => {
    const div = document.createElement("div");
    div.draggable = !item.completed;
    div.dataset.id = item.id;
    div.classList.add("deadline-item");

    if (item.completed) {
      div.classList.add("reading-complete");
    }

    const linksHTML =
      item.links && item.links.length
        ? item.links.map((link, index) => `
            <div>
              <a href="${link}"
                target="_blank"
                class="reading-link"
                title="${link}">
                Material ${index + 1}
              </a>
            </div>
          `).join("")
        : "";

    div.innerHTML = `
      <div class="reading-item-content">

        <div class="reading-top-row">

          <div class="reading-header">

            ${
              !item.completed
                ? `<span class="drag-handle">⋮⋮</span>`
                : `<span class="reading-check">✔</span>`
            }

            <strong>
              ${index + 1}. ${item.topic}
            </strong>

          </div>

          ${
            !item.completed
              ? `
                <button class="reading-complete-btn">
                  ✓
                </button>
              `
              : ""
          }

        </div>

        ${linksHTML}

      </div>
    `;

    const completeBtn =
      div.querySelector(".reading-complete-btn");

    if (completeBtn) {

      completeBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        item.completed = true;

        persistTracks();

        renderReading(track);

        refreshCurrentView();

        showToast(`Completed "${item.topic}"`);

      });

    }

    div.addEventListener("dblclick", () => {
      openEditReadingForm(track, item);
    });
    // =====================================
    // DRAG START
    // =====================================

    div.addEventListener("dragstart", () => {
      draggedReadingId = item.id;
      div.classList.add("dragging");
    });

    // =====================================
    // DRAG END
    // =====================================

    div.addEventListener("dragend", () => {
      draggedReadingId = null;
      div.classList.remove("dragging");
    });

    // =====================================
    // DRAG OVER
    // =====================================

    div.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    // =====================================
    // DROP
    // =====================================

    div.addEventListener("drop", () => {

      if (draggedReadingId === item.id) return;

      const fromIndex = track.reading.findIndex(
        r => r.id === draggedReadingId
      );

      const toIndex = track.reading.findIndex(
        r => r.id === item.id
      );

      if (fromIndex === -1 || toIndex === -1) return;

      const [movedItem] =
        track.reading.splice(fromIndex, 1);

      track.reading.splice(toIndex, 0, movedItem);

      persistTracks();

      renderReading(track);
    });

    container.appendChild(div);
  });
}

// =====================================================
// READING FORM
// =====================================================

function openReadingForm(track) {
  const container = document.getElementById("readingList");
  if (container.querySelector(".deadline-form")) return;

  const form = document.createElement("div");
  form.classList.add("deadline-form");

  form.innerHTML = `
    <input type="text" id="readingTopic" placeholder="Topic" />
    <div id="readingLinksContainer"></div>

    <div class="deadline-form-actions">
      <button class="neutral-btn" id="cancelReadingBtn">Cancel</button>
      <button class="primary-btn" id="saveReadingBtn">Save</button>
    </div>
  `;

  container.prepend(form);

  const topicInput = form.querySelector("#readingTopic");
  const linksContainer = form.querySelector("#readingLinksContainer");

  // Add first link field
  addLinkInput(linksContainer);

  form.querySelector("#saveReadingBtn").onclick = () => {
    const topic = topicInput.value.trim();
    if (!topic) {
      alert("Topic required.");
      return;
    }

    const links = Array.from(
      linksContainer.querySelectorAll("input")
    )
      .map(input => input.value.trim())
      .filter(val => val !== "");

    track.reading.push({
      id: Date.now(),
      topic,
      links,
      completed: false
    });

    persistTracks();
    form.remove();
    renderReading(track);
  };

  form.querySelector("#cancelReadingBtn").onclick = () => {
    form.remove();
  };
}


function addLinkInput(container, value = "") {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Link (optional)";
  input.value = value;

  container.appendChild(input);

  input.addEventListener("input", () => {
    const inputs = container.querySelectorAll("input");
    const lastInput = inputs[inputs.length - 1];

    // If typing in last input, create new empty one
    if (input === lastInput && input.value.trim() !== "") {
      addLinkInput(container);
    }
  });
}

// =====================================================
// EDIT READING FORM
// =====================================================

function openEditReadingForm(track, item) {
  const container = document.getElementById("readingList");
  if (container.querySelector(".deadline-form")) return;

  const form = document.createElement("div");
  form.classList.add("deadline-form");

  form.innerHTML = `
    <input type="text" id="editReadingTopic" value="${item.topic}" />
    <div id="editReadingLinksContainer"></div>

    <div class="deadline-form-actions">
      <button class="neutral-btn" id="cancelEditReadingBtn">Cancel</button>
      <button class="primary-btn" id="updateReadingBtn">Update</button>
      <button class="danger-btn" id="deleteReadingBtn">Delete</button>
    </div>
  `;

  container.prepend(form);

  const topicInput = form.querySelector("#editReadingTopic");
  const linksContainer = form.querySelector("#editReadingLinksContainer");

  // Populate existing links
  if (item.links && item.links.length) {
    item.links.forEach(link => {
      addLinkInput(linksContainer, link);
    });
  }

  // Always ensure one empty input exists
  addLinkInput(linksContainer);

  // UPDATE
  form.querySelector("#updateReadingBtn").onclick = () => {
    const newTopic = topicInput.value.trim();
    if (!newTopic) {
      alert("Topic required.");
      return;
    }

    const links = Array.from(
      linksContainer.querySelectorAll("input")
    )
      .map(input => input.value.trim())
      .filter(val => val !== "");

    item.topic = newTopic;
    item.links = links;
    item.completed = false;

    persistTracks();
    form.remove();
    renderReading(track);
  };

  // DELETE
  form.querySelector("#deleteReadingBtn").onclick = () => {
    track.reading = track.reading.filter(r => r.id !== item.id);

    persistTracks();
    form.remove();
    renderReading(track);
  };

  // CANCEL
  form.querySelector("#cancelEditReadingBtn").onclick = () => {
    form.remove();
  };
}

// =====================================================
// TASKS RENDERING
// =====================================================

function formatHours(hours) {

  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);

  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;

  return `${h}h ${m}m`;
}

function attachProgressSlider(slider, span, task, type, track) {

  let previousValue = slider.value;

  slider.addEventListener("mousedown", () => {
    previousValue = slider.value;
  });

  slider.addEventListener("input", (e) => {

    let newValue = Number(e.target.value);

    const max = type === "prereq" ? task.prereqTime : task.taskTime;

    // snap slider to max if close
    if (max - newValue < slider.step) {
      newValue = max;
    }

    // clean floating precision
    newValue = Number(newValue.toFixed(3));

    slider.value = newValue;

    if (type === "prereq") {

      task.prereqSpent = newValue;

      const percent =
        task.prereqTime === 0
          ? 100
          : Math.round((task.prereqSpent / task.prereqTime) * 100);

      span.innerText = `${percent}%`;

      const hours = span.parentElement.querySelector(".progress-hours");
      hours.innerText =
        `${formatHours(task.prereqSpent)} / ${formatHours(task.prereqTime)}`;

    }

    if (type === "task") {

      task.taskSpent = newValue;

      const percent =
        task.taskTime === 0
          ? 100
          : Math.round((task.taskSpent / task.taskTime) * 100);

      span.innerText = `${percent}%`;

      const hours = span.parentElement.querySelector(".progress-hours");
      hours.innerText =
        `${formatHours(task.taskSpent)} / ${formatHours(task.taskTime)}`;

    }

  });

  slider.addEventListener("change", () => {

    persistTracks();

    const EPSILON = 0.05;

    let completed = false;

    if (type === "prereq") {
      completed = task.prereqSpent >= task.prereqTime - EPSILON;
    }

    if (type === "task") {
      completed = task.taskSpent >= task.taskTime - EPSILON;
    }

    if (completed && !task._completionChecked) {

      task._completionChecked = true;

      showTaskDecisionUI(
        track,
        task,
        () => {
          // FINISH
          task.finished = true;
          persistTracks();
          renderTasks(track);
          showTaskCelebration(task.name);
        },
        () => {
          // CANCEL → revert slider
          slider.value = previousValue;

          if (type === "prereq") {
            task.prereqSpent = Number(previousValue);
          }

          if (type === "task") {
            task.taskSpent = Number(previousValue);
          }

          const total = type === "prereq" ? task.prereqTime : task.taskTime;
          span.innerText = `${Math.round((previousValue / total) * 100)}%`;

          task._completionChecked = false;

          persistTracks();
        },
        () => {
          // EXTEND
          openEditTaskForm(track, task);
        }
      );

    }

  });

}

function renderTasks(track) {

  const container = document.getElementById("taskList");
  if (!container) return;

  container.innerHTML = "";

  const activeTasks = track.tasks.filter(t => !t.finished);
  const finishedTasks = track.tasks.filter(t => t.finished);

  const allTasks = [...activeTasks, ...finishedTasks];

  allTasks.forEach(task => {

    const div = document.createElement("div");
    div.classList.add("deadline-item");

    if (task.finished) {
      div.classList.add("task-complete");
    }

    div.innerHTML = `
      <div class="task-main">

        <strong>${task.finished ? "✔ " : ""}${task.name}</strong>

        <div class="task-desc hidden-desc">
          ${task.description || ""}
        </div>

        <div>Prerequisite: ${task.prereq}</div>

        <div class="task-progress-block">
          <label>Prereq Progress</label>

          <input 
            type="range"
            min="0"
            max="${task.prereqTime}"
            value="${task.prereqSpent ?? 0}"
            step="0.01"
            class="prereq-progress"
            ${task.finished ? "disabled" : ""}
          >

          <span class="progress-percent">
            ${task.prereqTime === 0 ? "100%" :
            Math.round(((task.prereqSpent || 0) / task.prereqTime) * 100)}%
          </span>

          <div class="progress-hours">
            ${formatHours(task.prereqSpent || 0)} /
            ${formatHours(task.prereqTime)}
          </div>

        </div>

        <div class="task-progress-block">
          <label>Task Progress</label>

          <input 
            type="range"
            min="0"
            max="${task.taskTime}"
            value="${task.taskSpent ?? 0}"
            step="0.01"
            class="task-progress"
            ${task.finished ? "disabled" : ""}
          >

          <span class="progress-percent">
            ${task.taskTime === 0 ? "100%" :
            Math.round(((task.taskSpent || 0) / task.taskTime) * 100)}%
          </span>

          <div class="progress-hours">
            ${formatHours(task.taskSpent || 0)} /
            ${formatHours(task.taskTime)}
          </div>

        </div>

      </div>
    `;

    const prereqSlider = div.querySelector(".prereq-progress");
    const taskSlider = div.querySelector(".task-progress");

    const prereqSpan = prereqSlider.nextElementSibling;
    const taskSpan = taskSlider.nextElementSibling;

    if (!task.finished) {

      attachProgressSlider(
        prereqSlider,
        prereqSpan,
        task,
        "prereq",
        track
      );

      attachProgressSlider(
        taskSlider,
        taskSpan,
        task,
        "task",
        track
      );

    }

    div.addEventListener("dblclick", () => {
      if (task.finished) {
        showToast("Completed tasks cannot be edited");
        return;
      }
      openEditTaskForm(track, task);
    });

    container.appendChild(div);

  });

}

// =====================================================
// TASK FORM
// =====================================================

function openTaskForm(track) {
  const container = document.getElementById("taskList");
  if (container.querySelector(".deadline-form")) return;

  const form = document.createElement("div");
  form.classList.add("deadline-form");

  form.innerHTML = `
    <input type="text" id="taskName" placeholder="Task name">

    <textarea id="taskDescription" placeholder="Task description"></textarea>

    <input type="text" id="taskPrereq" placeholder="Prerequisite needed">

    <input type="number" step="0.25" min="0" id="taskPrereqTime" placeholder="Prerequisite time (in hours)">
    <input type="number" step="0.25" min="0" id="taskTime" placeholder="Task time (in hours)">
    <div class="deadline-form-actions">
      <button class="neutral-btn" id="cancelTaskBtn">Cancel</button>
      <button class="primary-btn" id="saveTaskBtn">Save</button>
    </div>
  `;

  container.prepend(form);

  const nameInput = form.querySelector("#taskName");
  const descriptionInput = form.querySelector("#taskDescription");
  const prereqInput = form.querySelector("#taskPrereq");
  const prereqTimeInput = form.querySelector("#taskPrereqTime");
  const taskTimeInput = form.querySelector("#taskTime");

  form.querySelector("#saveTaskBtn").onclick = () => {

    const name = nameInput.value.trim();
    const description = descriptionInput.value.trim();
    const prereq = prereqInput.value.trim();
    const prereqTime = Number(prereqTimeInput.value.trim());
    const taskTime = Number(taskTimeInput.value.trim());

    if (!name || isNaN(prereqTime) || isNaN(taskTime)) {
      alert("Invalid time values.");
      return;
    }

    track.tasks.unshift({
      id: Date.now(),
      name,
      description,
      prereq,
      prereqTime,
      taskTime,
      prereqSpent: 0,
      taskSpent: 0
    });

    persistTracks();

    form.remove();

    renderTasks(track);
  };

  form.querySelector("#cancelTaskBtn").onclick = () => {
    form.remove();
  };
}

// =====================================================
// EDIT TASK FORM
// =====================================================

function openEditTaskForm(track, task) {

  const container = document.getElementById("taskList");

  // Prevent multiple edit forms
  if (container.querySelector(".deadline-form")) return;

  const form = document.createElement("div");
  form.classList.add("deadline-form");

  form.innerHTML = `

    <input type="text" id="editTaskName" value="${task.name}" />

    <textarea id="editTaskDescription">${task.description || ""}</textarea>

    <input type="text" id="editTaskPrereq" value="${task.prereq}" />

    <input type="number" id="editTaskPrereqTime" value="${task.prereqTime}" />

    <input type="number" id="editTaskTime" value="${task.taskTime}" />

    <div class="deadline-form-actions">

      <button type="button" class="neutral-btn" id="cancelTaskEditBtn">
        Cancel
      </button>

      <button type="button" class="primary-btn" id="updateTaskBtn">
        Update
      </button>

      <button type="button" class="danger-btn" id="deleteTaskBtn">
        Delete
      </button>

    </div>
  `;

  container.prepend(form);

  const nameInput = form.querySelector("#editTaskName");
  const descInput = form.querySelector("#editTaskDescription");
  const prereqInput = form.querySelector("#editTaskPrereq");
  const prereqTimeInput = form.querySelector("#editTaskPrereqTime");
  const taskTimeInput = form.querySelector("#editTaskTime");

  const updateBtn = form.querySelector("#updateTaskBtn");
  updateBtn.disabled = true;
  const cancelBtn = form.querySelector("#cancelTaskEditBtn");
  const deleteBtn = form.querySelector("#deleteTaskBtn");


  // =====================================================
  // UPDATE TASK
  // =====================================================

  updateBtn.addEventListener("click", () => {

    const newName = nameInput.value.trim();
    const newDesc = descInput.value.trim();
    const newPrereq = prereqInput.value.trim();
    const newPrereqTime = Number(prereqTimeInput.value);
    const newTaskTime = Number(taskTimeInput.value);

    if (!newName || !newPrereq || !newPrereqTime || !newTaskTime) {
      alert("All fields required.");
      return;
    }

    task.name = newName;
    task.description = newDesc;
    task.prereq = newPrereq;
    task.prereqTime = newPrereqTime;
    task.taskTime = newTaskTime;

    task._completionChecked = false;

    persistTracks();
    showToast("Task updated");

    form.remove();
    renderTasks(track);
  });


  // =====================================================
  // DELETE TASK
  // =====================================================

  deleteBtn.addEventListener("click", () => {

    const confirmed = confirm(
      `Are you sure you want to delete "${task.name}"?`
    );

    if (!confirmed) return;

    track.tasks = track.tasks.filter(
      t => t.id !== task.id
    );

    persistTracks();
    showToast(`Task "${task.name}" deleted`);

    form.remove();
    renderTasks(track);
  });


  // =====================================================
  // CANCEL
  // =====================================================

  cancelBtn.addEventListener("click", () => {
    form.remove();
  });

}

function checkTaskCompletion(track, task, slider, previousValue, type, span) {

  const completed =
    task.prereqSpent >= task.prereqTime &&
    task.taskSpent >= task.taskTime;

  if (completed && !task._completionChecked) {

    task._completionChecked = true;

    showTaskDecisionUI(

      track,

      task,

      () => {

        task.finished = true;

        persistTracks();

        renderTasks(track);

        showTaskCelebration(task.name);

      },

      () => {

        slider.value = previousValue;

        if (type === "prereq") {
          task.prereqSpent = Number(previousValue);
        }

        if (type === "task") {
          task.taskSpent = Number(previousValue);
        }

        span.innerText = `${previousValue}/${type === "prereq" ? task.prereqTime : task.taskTime}`;

        task._completionChecked = false;

        persistTracks();

      },

      () => {

        openEditTaskForm(track, task);

      }

    );

  }

}

function showTaskDecisionUI(track, task, finishFn, cancelFn, extendFn) {

  const container = document.getElementById("taskList");

  const box = document.createElement("div");
  box.className = "deadline-form task-decision-ui";

  box.innerHTML = `
    <div style="font-weight:600">
      Time reached for "${task.name}"
    </div>

    <div class="deadline-form-actions">

      <button class="primary-btn">Mark Finished</button>

      <button class="neutral-btn">Add More Time</button>

      <button class="neutral-btn">Cancel</button>

    </div>
  `;

  container.prepend(box);

  const [finishBtn, extendBtn, cancelBtn] =
    box.querySelectorAll("button");

  finishBtn.onclick = () => {
    box.remove();
    finishFn();
  };

  extendBtn.onclick = () => {
    box.remove();
    extendFn();
  };

  cancelBtn.onclick = () => {
    box.remove();
    cancelFn();
  };

}


// =====================================================
// NOTES RENDERING
// =====================================================

function renderNotes(track) {
  const textarea = document.getElementById("notesInput");
  if (!textarea) return;

  textarea.value = track.notes || "";

  textarea.addEventListener("input", () => {
    track.notes = textarea.value;
    persistTracks();
  });
}

// =====================================================
// EDIT NOTES
// =====================================================

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

    <!-- 🌟 WORD OF THE DAY -->
    <div id="centerWOTD" class="center-wotd">

        <div class="wotd-main">

            <!-- Title -->
            <div class="wotd-title">
                🌟 Word of the Day —
                <span id="centerWOTDLanguage"></span>
            </div>

            <!-- Word -->
            <div
              id="centerWOTDWord"
              class="wotd-word"
            ></div>

            <!-- Meaning -->
            <div
              id="centerWOTDMeaning"
              class="wotd-meaning"
            ></div>

            <!-- Toggle Section -->
            <div
              id="wotdToggleContainer"
              class="wotd-toggle hidden"
            >

                <label class="toggle-switch">

                    <input
                      type="checkbox"
                      id="wotdSentenceToggle"
                    >

                    <span class="slider"></span>

                </label>

                <div class="toggle-label">
                  Show example sentence
                </div>

            </div>

            <!-- Sentence -->
            <div
              id="wotdSentence"
              class="wotd-sentence hidden"
            ></div>

        </div>

        <!-- Navigation -->
        <div class="wotd-nav-container">

            <button
              id="wotdPrev"
              class="wotd-nav"
            >
              ◀
            </button>

            <button
              id="wotdNext"
              class="wotd-nav"
            >
              ▶
            </button>

        </div>

    </div>

    <!-- HEADER -->
    <div class="center-header">

        <h2>My Tracks</h2>

        <button id="trackSettingsBtn">
          ⚙
        </button>

    </div>

    <!-- GRID -->
    <div id="trackGrid" class="grid"></div>
  `;

  renderTracks();

  renderWordOfTheDay();

  attachDashboardEvents();
}

function attachDashboardEvents() {

  // =========================================
  // Settings button
  // =========================================

  document
    .getElementById("trackSettingsBtn")
    ?.addEventListener("click", () => {

      document
        .getElementById("trackSettingsModal")
        .classList.remove("hidden");

      renderTrackList();
    });

  // =========================================
  // WOTD navigation
  // =========================================

  document
    .getElementById("wotdNext")
    ?.addEventListener("click", () => {

      currentWOTDIndex++;
      reloadWOTD();
    });

  document
    .getElementById("wotdPrev")
    ?.addEventListener("click", () => {

      currentWOTDIndex--;
      reloadWOTD();
    });

  // =========================================
  // Sentence toggle
  // =========================================

  document
    .getElementById("wotdSentenceToggle")
    ?.addEventListener("change", (e) => {

      const sentenceEl =
        document.getElementById("wotdSentence");

      if (e.target.checked) {
        sentenceEl.classList.remove("hidden");
      } else {
        sentenceEl.classList.add("hidden");
      }

    });

}

// =====================================================
// WORKSPACE TRACK TITLE EDITING
// =====================================================

function enableWorkspaceTrackNameEdit(element) {
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
function openWorkspaceIconPicker(iconElement, track) {

  // Prevent duplicate picker
  const existing =
    document.querySelector(".workspace-icon-picker");

  if (existing) {
    existing.remove();
    return;
  }

  const picker = document.createElement("div");

  picker.className = "workspace-icon-picker";

  TRACK_ICONS.forEach(icon => {

    const option = document.createElement("span");

    option.className = "workspace-icon-option";

    if (icon === track.icon) {
      option.classList.add("selected-icon");
    }

    option.textContent = icon;

    option.addEventListener("click", () => {

      track.icon = icon;

      persistTracks();

      refreshCurrentView();

      showToast("Track icon updated");

    });

    picker.appendChild(option);

  });

  document.body.appendChild(picker);

  // =========================================
  // POSITIONING
  // =========================================

  const rect =
    iconElement.getBoundingClientRect();

  picker.style.top =
    `${rect.bottom + window.scrollY + 8}px`;

  picker.style.left =
    `${rect.left + window.scrollX}px`;

  // =========================================
  // OUTSIDE CLICK CLOSE
  // =========================================

  function closePicker(e) {

    if (!picker.contains(e.target)) {

      picker.remove();

      document.removeEventListener(
        "click",
        closePicker
      );

    }

  }

  setTimeout(() => {
    document.addEventListener(
      "click",
      closePicker
    );
  }, 0);

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

