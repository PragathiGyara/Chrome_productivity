let currentTodoView = "current";

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

function renderTodoSection() {

  // Close any open edit form
  document
    .querySelector(".todo-edit-form")
    ?.remove();

  updateTodoDateDisplay();

  if (currentTodoView === "current") {

    renderTodayTodos();

  } else {

    renderGlobalTodos();

  }

  // Update toggle buttons

  document
    .querySelectorAll(".todo-toggle-btn")
    .forEach(btn => {

      btn.classList.toggle(
        "active",
        btn.dataset.view === currentTodoView
      );

    });

}

function renderTodayTodos() {

  const container =
    document.getElementById("todayTodoList");

  if (!container) return;

  container.innerHTML = "";

  const {
    todoData,
    current
  } = getCurrentTodos();

  // Summary
  const summary =
    document.createElement("div");

  summary.classList.add("todo-summary");

  const completed =
    current.filter(
      item => item.done
    ).length;

  summary.textContent =
    `${completed}/${current.length} done`;

  container.appendChild(summary);

  // Items
  current.forEach(item => {

    const div =
      document.createElement("div");

    div.classList.add("todo-item");

    div.innerHTML = `
      <div class="todo-card ${item.done ? "done" : ""}">
        <input
          type="checkbox"
          ${item.done ? "checked" : ""}
        />
        <span class="todo-text">
          ${item.text}
        </span>
      </div>
    `;

    // Checkbox
    div
      .querySelector("input")
      .addEventListener(
        "change",
        (e) => {

          item.done =
            e.target.checked;

          persistTodos(todoData);

          renderTodayTodos();

        }
      );

    // Edit
    div
      .querySelector(".todo-text")
      .addEventListener(
        "click",
        (e) => {

          e.stopPropagation();

          openEditTodoForm(
            item,
            "current"
          );

        }
      );

    container.appendChild(div);

  });

}

function renderGlobalTodos() {

  const container =
    document.getElementById("todayTodoList");

  if (!container) return;

  container.innerHTML = "";

  const {
    todoData,
    allTime
  } = getAllTimeTodos();

  // Summary
  const summary =
    document.createElement("div");

  summary.classList.add("todo-summary");

  const completed =
    allTime.filter(
      item => item.done
    ).length;

  summary.textContent =
    `${completed}/${allTime.length} done`;

  container.appendChild(summary);

  // Items
  allTime.forEach(item => {

    const div =
      document.createElement("div");

    div.classList.add("todo-item");

    div.innerHTML = `
      <div class="todo-card ${item.done ? "done" : ""}">
        <input
          type="checkbox"
          ${item.done ? "checked" : ""}
        />

        <div class="todo-content">

          <span class="todo-text">
            ${item.text}
          </span>

          ${item.createdAt ? `
            <div class="todo-date">
              Added ${formatTodoDate(item.createdAt)}
            </div>
          ` : ""}

        </div>

      </div>
    `;

    // Checkbox

    div
      .querySelector("input")
      .addEventListener(
        "change",
        (e) => {

          item.done =
            e.target.checked;

          persistTodos(todoData);

          renderGlobalTodos();

        }
      );

    // Edit

    div
      .querySelector(".todo-text")
      .addEventListener(
        "click",
        (e) => {

          e.stopPropagation();

          openEditTodoForm(
            item,
            "allTime"
          );

        }
      );

    container.appendChild(div);

  });

}

function openSidebarTodoForm() {

  const container =
    document.getElementById("todayTodoList");

  if (!container) return;

  if (container.querySelector(".todo-form"))
    return;

  const form =
    document.createElement("div");

  form.classList.add("todo-form");

  form.innerHTML = `

    <input
      type="text"
      id="todoInput"
      placeholder="What needs to be done?"
    />

    <div class="deadline-form-actions">

      <button
        id="saveTodoBtn"
        class="primary-btn"
      >
        Add
      </button>

      <button
        id="cancelTodoBtn"
        class="neutral-btn"
      >
        Cancel
      </button>

    </div>

  `;

  container.prepend(form);

  const input =
    form.querySelector("#todoInput");

  form
    .querySelector("#saveTodoBtn")
    .addEventListener(
      "click",
      () => {

        const text =
          input.value.trim();

        if (!text)
          return;

        const {
          todoData,
          current
        } = getCurrentTodos();

        current.push({

          id: Date.now(),

          text,

          done: false,

          createdAt:
            new Date().toISOString()

        });

        persistTodos(todoData);

        renderTodayTodos();

        form.remove();

      }
    );

  form
    .querySelector("#cancelTodoBtn")
    .addEventListener(
      "click",
      () => {

        form.remove();

      }
    );

}

function openEditTodoForm(item, source) {

  const container =
    document.getElementById("todayTodoList");

  if (!container) return;

  if (container.querySelector(".todo-edit-form"))
    return;

  const form =
    document.createElement("div");

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

  input.addEventListener(
    "input",
    () => {

      updateBtn.disabled =
        input.value.trim() ===
        originalText;

    }
  );

  // ==========================
  // UPDATE
  // ==========================

  updateBtn.addEventListener(
    "click",
    () => {

      const newText =
        input.value.trim();

      if (!newText) {

        alert(
          "Task cannot be empty."
        );

        return;
      }

      item.text = newText;

      let todoData;

      if (source === "current") {

        ({ todoData } =
          getCurrentTodos());

      } else {

        ({ todoData } =
          getAllTimeTodos());

      }

      persistTodos(todoData);

      form.remove();

      renderTodoSection();

      showToast("Task updated");

    }
  );

  // ==========================
  // DELETE
  // ==========================

  deleteBtn.addEventListener(
    "click",
    () => {

      const confirmed =
        confirm(
          `Delete "${item.text}"?`
        );

      if (!confirmed)
        return;

      if (source === "current") {

        const {
          todoData,
          current
        } = getCurrentTodos();

        todoData.current =
          current.filter(
            t =>
              t.id !== item.id
          );

        persistTodos(todoData);

      } else {

        const {
          todoData,
          allTime
        } = getAllTimeTodos();

        todoData.allTime =
          allTime.filter(
            t =>
              t.id !== item.id
          );

        persistTodos(todoData);

      }

      form.remove();

      renderTodoSection();

      showToast("Task deleted");

    }
  );

  // ==========================
  // CANCEL
  // ==========================

  cancelBtn.addEventListener(
    "click",
    () => {

      form.remove();

    }
  );

}

function updateTodoDateDisplay() {

    const el =
        document.getElementById(
            "todoDateDisplay"
        );

    if (!el) return;

    el.textContent = "";

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

