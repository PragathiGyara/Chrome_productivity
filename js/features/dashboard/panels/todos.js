let currentTodoView = "current";
let todoDisplaySettings =
    loadTodoDisplaySettings();

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

function initializeTodoSettings() {

    const settingsBtn =
        document.getElementById(
            "todoSettingsBtn"
        );

    const menu =
        document.getElementById(
            "todoSettingsMenu"
        );

    const showCompleted =
        document.getElementById(
            "showCompletedToggle"
        );

    const showDates =
        document.getElementById(
            "showDatesToggle"
        );

    if (!settingsBtn || !menu) {
        return;
    }

    // Restore UI

    showCompleted.checked =
        todoDisplaySettings.showCompleted;

    showDates.checked =
        todoDisplaySettings.showDates;

    // Toggle popup

    settingsBtn.addEventListener(
        "click",
        e => {

            e.stopPropagation();

            menu.classList.toggle(
                "hidden"
            );

        }
    );

    // Close on outside click

    document.addEventListener(
        "click",
        () => {

            menu.classList.add(
                "hidden"
            );

        }
    );

    menu.addEventListener(
        "click",
        e => {

            e.stopPropagation();

        }
    );

    // Save settings

    showCompleted.addEventListener(
        "change",
        () => {

            todoDisplaySettings.showCompleted =
                showCompleted.checked;

            persistTodoDisplaySettings(
                todoDisplaySettings
            );

            renderTodoSection();

        }
    );

    showDates.addEventListener(
        "change",
        () => {

            todoDisplaySettings.showDates =
                showDates.checked;

            persistTodoDisplaySettings(
                todoDisplaySettings
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
        document.getElementById(
            "todayTodoList"
        );

    if (!container) return;

    container.innerHTML = "";

    const {
        todoData,
        current
    } = getCurrentTodos();

    const visibleTasks =
        todoDisplaySettings.showCompleted
            ? current
            : current.filter(
                item => !item.completed
            );

    const summary =
        document.createElement("div");

    summary.classList.add(
        "todo-summary"
    );

    const completed =
        current.filter(
            item => item.completed
        ).length;

    summary.textContent =
        `${completed}/${current.length} done`;

    container.appendChild(
        summary
    );

    visibleTasks.forEach(item => {

        const div =
            document.createElement("div");

        div.classList.add(
            "todo-item"
        );

        div.innerHTML = `
            <div class="todo-card ${item.completed ? "done" : ""}">
                <input
                    type="checkbox"
                    ${item.completed ? "checked" : ""}
                />
                <div class="todo-content">
                    <span class="todo-text">
                        ${item.text}
                    </span>
                    ${
                        todoDisplaySettings.showDates &&
                        item.createdAt
                            ? `
                            <div class="todo-date">
                                Added ${formatTodoDate(item.createdAt)}
                            </div>
                            `
                            : ""
                    }
                </div>
            </div>
        `;

        div
            .querySelector("input")
            .addEventListener(
                "change",
                e => {

                    const task =
                        todoData.tasks.find(
                            t => t.id === item.id
                        );

                    if (!task) return;

                    task.completed =
                        e.target.checked;

                    task.completedAt =
                        task.completed
                            ? new Date().toISOString()
                            : null;

                    persistTodos(
                        todoData
                    );

                    renderTodayTodos();

                }
            );

        div
            .querySelector(".todo-text")
            .addEventListener(
                "click",
                e => {

                    e.stopPropagation();

                    openEditTodoForm(
                        item,
                        "current"
                    );

                }
            );

        container.appendChild(
            div
        );

    });

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
        allTime
    } = getAllTimeTodos();

    const visibleTasks =
        todoDisplaySettings.showCompleted
            ? allTime
            : allTime.filter(
                item => !item.completed
            );

    const summary =
        document.createElement("div");

    summary.classList.add(
        "todo-summary"
    );

    const completed =
        allTime.filter(
            item => item.completed
        ).length;

    summary.textContent =
        `${completed}/${allTime.length} done`;

    container.appendChild(
        summary
    );

    visibleTasks.forEach(item => {

        const div =
            document.createElement("div");

        div.classList.add(
            "todo-item"
        );

        div.innerHTML = `

            <div class="todo-card ${item.completed ? "done" : ""}">

                <input
                    type="checkbox"
                    ${item.completed ? "checked" : ""}
                />

                <div class="todo-content">

                    <span class="todo-text">

                        ${item.text}

                    </span>

                    ${
                        todoDisplaySettings.showDates &&
                        item.createdAt
                            ? `
                            <div class="todo-date">
                                Added ${formatTodoDate(item.createdAt)}
                            </div>
                            `
                            : ""
                    }

                </div>

            </div>

        `;

        div
            .querySelector("input")
            .addEventListener(
                "change",
                e => {

                    const task =
                        todoData.tasks.find(
                            t => t.id === item.id
                        );

                    if (!task) return;

                    task.completed =
                        e.target.checked;

                    task.completedAt =
                        task.completed
                            ? new Date().toISOString()
                            : null;

                    persistTodos(
                        todoData
                    );

                    renderGlobalTodos();

                }
            );

        div
            .querySelector(".todo-text")
            .addEventListener(
                "click",
                e => {

                    e.stopPropagation();

                    openEditTodoForm(
                        item,
                        "allTime"
                    );

                }
            );

        container.appendChild(
            div
        );

    });

}
function openSidebarTodoForm() {

    const container =
        document.getElementById(
            "todayTodoList"
        );

    if (!container) return;

    if (
        container.querySelector(
            ".todo-form"
        )
    ) {
        return;
    }

    const form =
        document.createElement("div");

    form.classList.add(
        "todo-form"
    );

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
        form.querySelector(
            "#todoInput"
        );

    form
        .querySelector("#saveTodoBtn")
        .addEventListener(
            "click",
            () => {

                const text =
                    input.value.trim();

                if (!text) {
                    return;
                }

                const todoData =
                    loadTodos();

                todoData.tasks.push({

                    id: Date.now(),

                    text,

                    completed: false,

                    archived: false,

                    createdAt:
                        new Date().toISOString(),

                    completedAt: null

                });

                persistTodos(todoData);

                renderTodoSection();

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
        document.getElementById(
            "todayTodoList"
        );

    if (!container) return;

    if (
        container.querySelector(
            ".todo-edit-form"
        )
    ) {
        return;
    }

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
        form.querySelector(
            "#editTodoText"
        );

    const updateBtn =
        form.querySelector(
            "#updateTodoBtn"
        );

    const cancelBtn =
        form.querySelector(
            "#cancelTodoEditBtn"
        );

    const deleteBtn =
        form.querySelector(
            "#deleteTodoBtn"
        );

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

            const todoData =
                loadTodos();

            const task =
                todoData.tasks.find(
                    t => t.id === item.id
                );

            if (!task) return;

            task.text =
                newText;

            persistTodos(
                todoData
            );

            form.remove();

            renderTodoSection();

            showToast(
                "Task updated"
            );

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

            const todoData =
                loadTodos();

            todoData.tasks =
                todoData.tasks.filter(
                    task =>
                        task.id !== item.id
                );

            persistTodos(
                todoData
            );

            form.remove();

            renderTodoSection();

            showToast(
                "Task deleted"
            );

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

