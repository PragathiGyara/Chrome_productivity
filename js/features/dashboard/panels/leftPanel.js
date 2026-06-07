let deadlinesCollapsed = false;
let todosCollapsed = false;

let currentTodoView = "today";


function initializeLeftPanel() {

    document
        .getElementById("addDeadlineBtn")
        ?.addEventListener(
            "click",
            openSidebarDeadlineForm
        );

    document
        .getElementById("addTodoBtn")
        ?.addEventListener(
            "click",
            openSidebarTodoForm
        );

    initializeTodoToggle();
    initializeSectionCollapse();
    updateSectionCollapseUI();
    renderLeftPanel();

}


function initializeSectionCollapse() {

    document
        .getElementById("toggleDeadlinesBtn")
        ?.addEventListener("click", () => {

            deadlinesCollapsed =
                !deadlinesCollapsed;

            updateSectionCollapseUI();
        });

    document
        .getElementById("toggleTodosBtn")
        ?.addEventListener("click", () => {

            todosCollapsed =
                !todosCollapsed;

            updateSectionCollapseUI();
        });

}


function updateSectionCollapseUI() {

    const deadlinesBody =
        document.getElementById("deadlinesSectionBody");

    const todosBody =
        document.getElementById("todosSectionBody");

    const deadlineToggle =
        document.getElementById("toggleDeadlinesBtn");

    const todoToggle =
        document.getElementById("toggleTodosBtn");

    deadlinesBody.style.display =
        deadlinesCollapsed
            ? "none"
            : "";

    todosBody.style.display =
        todosCollapsed
            ? "none"
            : "";

    deadlineToggle.textContent =
        deadlinesCollapsed
            ? "▶"
            : "▼";

    todoToggle.textContent =
        todosCollapsed
            ? "▶"
            : "▼";
}

function initializeTodoToggle() {

    const toggle =
        document.getElementById(
            "todoViewToggle"
        );

    if (!toggle) return;

    toggle.addEventListener(
        "click",
        (e) => {

            const btn =
                e.target.closest(
                    ".todo-toggle-btn"
                );

            if (!btn) return;

            currentTodoView =
                btn.dataset.view;

            toggle
                .querySelectorAll(
                    ".todo-toggle-btn"
                )
                .forEach(b =>
                    b.classList.remove(
                        "active"
                    )
                );

            btn.classList.add(
                "active"
            );

            renderTodoSection();
        }
    );
}


function renderLeftPanel() {

    renderGlobalDeadlines();

    renderTodoSection();

}

function renderTodoSection() {

    updateTodoDateDisplay();

    if (
        currentTodoView === "today"
    ) {

        renderTodayTodos();

    } else {

        renderGlobalTodos();

    }
    const addBtn =
      document.getElementById(
          "addTodoBtn"
      );

    if (addBtn) {

        addBtn.textContent =
            currentTodoView === "today"
                ? "+ Add Today Task"
                : "+ Add Global Task";
    }
}

function renderGlobalTodos() {

    const container =
        document.getElementById(
            "todayTodoList"
        );

    if (!container) return;

    container.innerHTML = "";

    const {
        todoData,
        global
    } = getGlobalTodos();

    if (global.length === 0) {

        container.innerHTML = `
            <div class="todo-empty-state">
                No global tasks
            </div>
        `;

        return;
    }

    global.forEach(item => {

        const div =
            document.createElement("div");

        div.classList.add(
            "todo-item"
        );

        div.innerHTML = `
            <div
                class="todo-card
                ${item.done ? "done" : ""}"
            >

                <input
                    type="checkbox"
                    ${item.done ? "checked" : ""}
                />

                <div>

                    <div class="todo-text">
                        ${item.text}
                    </div>

                    <div class="todo-date">
                        Added ${formatTodoDate(item.createdAt)}
                    </div>

                </div>

            </div>
        `;

        div.querySelector("input")
            .addEventListener(
                "change",
                (e) => {

                    item.done =
                        e.target.checked;

                    persistTodos(
                        todoData
                    );

                    renderGlobalTodos();
                }
            );
        const textEl =
            div.querySelector(".todo-text");

        textEl.addEventListener(
            "click",
            (e) => {

                e.stopPropagation();

                openEditTodoForm(
                    item,
                    "global"
                );

            }
        );
        container.appendChild(div);

    });

}


function renderTodayTodos() {
  const container = document.getElementById("todayTodoList");
  if (!container) return;

  container.innerHTML = "";

  const { todoData, today } = getTodayTodos();

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
      persistTodos(todoData);
      renderTodayTodos();
    })
    const textEl =
        div.querySelector(".todo-text");

    textEl.addEventListener(
        "click",
        (e) => {

            e.stopPropagation();

            openEditTodoForm(
                item,
                "today"
            );

        }
    );

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

  // ✅ GET ALL INPUT REFERENCES 
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
  const container = document.getElementById("todayTodoList");
  if (!container) return;

  if (container.querySelector(".todo-form")) return;

  const form = document.createElement("div");
  form.classList.add("todo-form");

  form.innerHTML = `
    <input type="text" id="todoInput" placeholder="${
        currentTodoView === "today"
            ? "What needs to be done today?"
            : "What should not be forgotten?"
    }" />

    <div class="deadline-form-actions">
      <button id="saveTodoBtn" class="primary-btn">Add</button>
      <button id="cancelTodoBtn" class="neutral-btn">Cancel</button>
    </div>
  `;

  container.prepend(form);

  const input = form.querySelector("#todoInput");

  form.querySelector("#saveTodoBtn").addEventListener("click", () => {
    const text =
        input.value.trim();

    if (!text) return;

    if (
        currentTodoView === "today"
    ) {

        const {
            todoData,
            today
        } = getTodayTodos();

        today.items.push({

            id: Date.now(),

            text,

            done: false

        });

        persistTodos(todoData);

        renderTodayTodos();

    } else {

        const {
            todoData,
            global
        } = getGlobalTodos();

        global.push({

            id: Date.now(),

            text,

            done: false,

            createdAt:
                new Date().toISOString()

        });

        persistTodos(todoData);

        renderGlobalTodos();
    }

    form.remove();
  });

  form.querySelector("#cancelTodoBtn").addEventListener("click", () => {
    form.remove();
  });
}

function openEditTodoForm(item, source) {

  const container =
    document.getElementById("todayTodoList");

  if (!container) return;

  if (container.querySelector(".todo-edit-form")) return;

  const form = document.createElement("div");

  form.classList.add(
    "deadline-form",
    "todo-edit-form"
  );

  form.innerHTML = `

    <input
      type="text"
      id="editTodoText"
      value="${item.text}"
    />

    <div class="deadline-form-actions">

      <button
        type="button"
        class="neutral-btn"
        id="cancelTodoEditBtn"
      >
        Cancel
      </button>

      <button
        type="button"
        class="primary-btn"
        id="updateTodoBtn"
      >
        Update
      </button>

      <button
        type="button"
        class="danger-btn"
        id="deleteTodoBtn"
      >
        Delete
      </button>

    </div>
  `;

  container.prepend(form);

  const input =
    form.querySelector("#editTodoText");

  const updateBtn =
    form.querySelector("#updateTodoBtn");

  const cancelBtn =
    form.querySelector("#cancelTodoEditBtn");

  const deleteBtn =
    form.querySelector("#deleteTodoBtn");

  const originalText =
    item.text;

  updateBtn.disabled = true;

  input.addEventListener("input", () => {

    updateBtn.disabled =
      input.value.trim() === originalText;

  });

  updateBtn.addEventListener("click", () => {

    const newText =
      input.value.trim();

    if (!newText) {
      alert("Task cannot be empty.");
      return;
    }

    item.text = newText;

    let todoData;

    if (source === "today") {

      ({ todoData } =
        getTodayTodos());

    } else {

      ({ todoData } =
        getGlobalTodos());

    }

    persistTodos(todoData);

    form.remove();

    renderTodoSection();

    showToast("Task updated");

  });

  deleteBtn.addEventListener("click", () => {

    const confirmed = confirm(
      `Delete "${item.text}"?`
    );

    if (!confirmed) return;

    if (source === "today") {

      const {
        todoData,
        today
      } = getTodayTodos();

      today.items =
        today.items.filter(
          t => t.id !== item.id
        );

      persistTodos(todoData);

    } else {

      const {
          todoData,
          global
      } = getGlobalTodos();

      todoData.global =
          global.filter(
              t => t.id !== item.id
          );

      persistTodos(todoData);

    }

    form.remove();

    renderTodoSection();

    showToast("Task deleted");

  });

  cancelBtn.addEventListener("click", () => {

    form.remove();

  });

}

function updateTodoDateDisplay() {

    const el =
        document.getElementById(
            "todoDateDisplay"
        );

    if (!el) return;

    if (
        currentTodoView === "today"
    ) {

        el.textContent =
            new Date().toLocaleDateString(
                undefined,
                {
                    weekday: "short",
                    day: "numeric",
                    month: "short"
                }
            );

    } else {

        el.textContent = "";
    }

}

function formatTodoDate(dateString) {

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short"
        }
    );
}