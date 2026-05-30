
let currentLeftView = "deadlines"; // "deadlines" | "todos"

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