let currentTodoView = "current";
let draggedTodoId = null;
let currentTodoTrack = "all";
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

function initializeTodoTrackFilter() {

    const filter =
        document.getElementById(
            "todoTrackFilter"
        );

    if (!filter) return;

    filter.innerHTML = `
        <option value="all">
            All
        </option>
    `;


    // =====================================
    // TRACK OPTIONS
    // =====================================

    tracks.forEach(track => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            track.id;

        option.textContent =
            `${track.icon} ${track.name}`;

        filter.appendChild(
            option
        );

    });


    // =====================================
    // RESTORE CURRENT FILTER
    // =====================================

    const trackExists =
        currentTodoTrack === "all" ||
        tracks.some(
            track =>
                String(track.id) ===
                String(currentTodoTrack)
        );

    if (trackExists) {

        filter.value =
            currentTodoTrack;

    } else {

        currentTodoTrack =
            "all";

        filter.value =
            "all";

    }


    // =====================================
    // FILTER CHANGE
    // =====================================

    filter.addEventListener(
        "change",
        event => {

            currentTodoTrack =
                event.target.value;

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

// =====================================================
// FIND TODO
// =====================================================

function findTodoById(todoId) {

    for (const track of tracks) {

        for (const project of (track.projects || [])) {

            const todo =
                (project.todos || []).find(
                    todo =>
                        String(todo.id) ===
                        String(todoId)
                );

            if (todo) {

                return todo;

            }

        }

    }

    return null;

}

// =====================================================
// DELETE TODO
// =====================================================

function deleteTodoById(todoId) {

    for (const track of tracks) {

        for (const project of (track.projects || [])) {

            if (!Array.isArray(project.todos)) {
                continue;
            }


            const originalLength =
                project.todos.length;


            project.todos =
                project.todos.filter(
                    todo =>
                        String(todo.id) !==
                        String(todoId)
                );


            if (
                project.todos.length !==
                originalLength
            ) {

                return true;

            }

        }

    }

    return false;

}

function renderTodoList(tasks, source) {

    const container =
        document.getElementById(
            "todayTodoList"
        );

    if (!container) return;

    container.innerHTML = "";


    // =====================================
    // VISIBLE TASKS
    // =====================================

    const visibleTasks =
        (
            todoDisplaySettings.showCompleted
                ? [...tasks]
                : tasks.filter(
                    task =>
                        !task.completed
                )
        ).sort(
            (a, b) =>
                (a.order ?? 0) -
                (b.order ?? 0)
        );


    // =====================================
    // SUMMARY
    // =====================================

    const summary =
        document.createElement(
            "div"
        );

    summary.classList.add(
        "todo-summary"
    );

    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;

    const total =
        tasks.length;

    const remaining =
        total - completed;

    summary.textContent =
        `Remaining: ${remaining}  |  Completed: ${completed}  |  Total: ${total}`;

    container.appendChild(
        summary
    );


    // =====================================
    // RENDER TASKS
    // =====================================

    visibleTasks.forEach(
        item => {

            const div =
                document.createElement(
                    "div"
                );

            div.classList.add(
                "todo-item"
            );


            // =====================================
            // ACTION
            // =====================================

            let action = null;

            if (item.completed) {

                action = {
                    icon: "✕",
                    title: "Delete Task",
                    type: "delete"
                };

            } else if (
                source === "current" ||
                !item.archived
            ) {

                action = {
                    icon: "→",
                    title: "Move to Archived",
                    type: "archive"
                };

            } else {

                action = {
                    icon: "←",
                    title: "Move to Current",
                    type: "restore"
                };

            }


            // =====================================
            // TRACK DISPLAY
            // =====================================

            const trackDisplay =
                item.trackIcon
                    ? `${item.trackIcon} ${item.trackName}`
                    : item.trackName ||
                      "Unknown Track";


            // =====================================
            // PROJECT DISPLAY
            // =====================================

            const projectDisplay =
                item.projectName ||
                "General";


            // =====================================
            // HTML
            // =====================================

            div.innerHTML = `

                <div
                    class="todo-card ${
                        item.completed
                            ? "done"
                            : ""
                    }"
                >

                    <input
                        type="checkbox"
                        ${
                            item.completed
                                ? "checked"
                                : ""
                        }
                    />

                    <div class="todo-content">

                        <span class="todo-text">
                            ${item.text}
                        </span>

                        <div class="todo-track">
                            ${trackDisplay}
                        </div>

                        <div class="todo-project">
                            ${projectDisplay}
                        </div>

                        ${
                            todoDisplaySettings.showDates &&
                            item.createdAt
                                ? `
                                    <div class="todo-date">
                                        Added
                                        ${formatTodoDate(
                                            item.createdAt
                                        )}
                                    </div>
                                `
                                : ""
                        }

                    </div>

                    <button
                        class="todo-action-btn"
                        data-action="${action.type}"
                        title="${action.title}"
                    >
                        ${action.icon}
                    </button>

                </div>

            `;


            // =====================================
            // COMPLETE / UNCOMPLETE
            // =====================================

            div
                .querySelector("input")
                .addEventListener(
                    "change",
                    event => {

                        const todo =
                            findTodoById(
                                item.id
                            );

                        if (!todo) return;

                        todo.completed =
                            event.target.checked;

                        todo.completedAt =
                            todo.completed
                                ? new Date().toISOString()
                                : null;

                        persistTracks();

                        renderTodoSection();

                    }
                );


            // =====================================
            // EDIT
            // =====================================

            if (!item.completed) {

                div
                    .querySelector(
                        ".todo-text"
                    )
                    .addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();

                            openEditTodoForm(
                                item,
                                source
                            );

                        }
                    );

            }


            // =====================================
            // ARCHIVE / RESTORE / DELETE
            // =====================================

            div
                .querySelector(
                    ".todo-action-btn"
                )
                .addEventListener(
                    "click",
                    event => {

                        event.stopPropagation();

                        const todo =
                            findTodoById(
                                item.id
                            );

                        if (!todo) return;


                        switch (
                            event.target.dataset.action
                        ) {

                            case "archive":

                                todo.archived =
                                    true;

                                showToast(
                                    "Task archived"
                                );

                                break;


                            case "restore":

                                todo.archived =
                                    false;

                                showToast(
                                    "Task moved to Current"
                                );

                                break;


                            case "delete":

                                if (
                                    !confirm(
                                        `Delete "${todo.text}"?`
                                    )
                                ) {
                                    return;
                                }

                                deleteTodoById(
                                    todo.id
                                );

                                showToast(
                                    "Task deleted"
                                );

                                break;

                        }


                        persistTracks();

                        renderTodoSection();

                    }
                );


            // =====================================
            // DRAG / DROP
            // =====================================

            attachTodoDragEvents(
                div,
                item,
                source
            );

            container.appendChild(
                div
            );

        }
    );

}

function renderTodayTodos() {

    const current = [];


    // =====================================
    // COLLECT CURRENT TODOS
    // =====================================

    tracks.forEach(track => {

        (track.projects || []).forEach(project => {

            (project.todos || []).forEach(todo => {

                // ---------------------------------
                // Current = not archived
                // ---------------------------------

                if (todo.archived) {
                    return;
                }


                current.push({

                    ...todo,

                    trackId:
                        track.id,

                    trackName:
                        track.name,

                    trackIcon:
                        track.icon,

                    projectId:
                        project.id,

                    projectName:
                        project.name

                });

            });

        });

    });


    // =====================================
    // FILTER BY TRACK
    // =====================================

    const filteredTodos =
        currentTodoTrack === "all"
            ? current
            : current.filter(
                task =>
                    String(task.trackId) ===
                    String(currentTodoTrack)
            );


    // =====================================
    // RENDER
    // =====================================

    renderTodoList(
        filteredTodos,
        "current"
    );

}

function renderGlobalTodos() {

    const archivedTodos = [];

    tracks.forEach(track => {

        (track.projects || []).forEach(project => {

            (project.todos || []).forEach(todo => {

                if (!todo.archived) {
                    return;
                }

                archivedTodos.push({
                    ...todo,

                    trackId:
                        track.id,

                    trackName:
                        track.name,

                    trackIcon:
                        track.icon,

                    projectId:
                        project.id,

                    projectName:
                        project.name
                });

            });

        });

    });


    // =====================================
    // TRACK FILTER
    // =====================================

    const filteredTodos =
        currentTodoTrack === "all"
            ? archivedTodos
            : archivedTodos.filter(
                task =>
                    String(task.trackId) ===
                    String(currentTodoTrack)
            );


    // =====================================
    // RENDER
    // =====================================

    renderTodoList(
        filteredTodos,
        "allTime"
    );

}

// =====================================================
// TODO DRAG & DROP
// =====================================================

function attachTodoDragEvents(
    div,
    item,
    source
) {

    // Only current, unfinished tasks are draggable

    if (
        source !== "current" ||
        item.completed
    ) {
        return;
    }


    div.draggable = true;

    div.dataset.id =
        item.id;


    // ==========================
    // DRAG START
    // ==========================

    div.addEventListener(
        "dragstart",
        () => {

            draggedTodoId =
                item.id;

            div.classList.add(
                "dragging"
            );

        }
    );


    // ==========================
    // DRAG END
    // ==========================

    div.addEventListener(
        "dragend",
        () => {

            draggedTodoId =
                null;

            div.classList.remove(
                "dragging"
            );

        }
    );


    // ==========================
    // DRAG OVER
    // ==========================

    div.addEventListener(
        "dragover",
        e => {

            e.preventDefault();

        }
    );


    // ==========================
    // DROP
    // ==========================

    div.addEventListener(
        "drop",
        () => {

            if (
                draggedTodoId ===
                item.id
            ) {
                return;
            }


            // =====================================
            // FIND CURRENT TODOS
            // =====================================

            const currentTodos = [];


            tracks.forEach(
                track => {

                    (track.projects || [])
                        .forEach(
                            project => {

                                (project.todos || [])
                                    .forEach(
                                        todo => {

                                            if (
                                                !todo.archived
                                            ) {

                                                currentTodos.push({

                                                    todo,

                                                    project

                                                });

                                            }

                                        }
                                    );

                            }
                        );

                }
            );


            // =====================================
            // FIND DRAGGED TODO
            // =====================================

            const fromIndex =
                currentTodos.findIndex(
                    entry =>
                        String(
                            entry.todo.id
                        ) ===
                        String(
                            draggedTodoId
                        )
                );


            // =====================================
            // FIND TARGET TODO
            // =====================================

            const toIndex =
                currentTodos.findIndex(
                    entry =>
                        String(
                            entry.todo.id
                        ) ===
                        String(
                            item.id
                        )
                );


            if (
                fromIndex === -1 ||
                toIndex === -1
            ) {
                return;
            }


            // =====================================
            // REORDER AGGREGATED LIST
            // =====================================

            const [
                movedEntry
            ] =
                currentTodos.splice(
                    fromIndex,
                    1
                );


            currentTodos.splice(
                toIndex,
                0,
                movedEntry
            );


            // =====================================
            // UPDATE GLOBAL ORDER
            // =====================================

            currentTodos.forEach(
                (
                    entry,
                    index
                ) => {

                    entry.todo.order =
                        index;

                }
            );


            // =====================================
            // PERSIST
            // =====================================

            persistTracks();


            // =====================================
            // REFRESH
            // =====================================

            renderTodoSection();

        }
    );

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

        <select id="todoTrackSelect">

            <option value="" disabled selected>
                Select track
            </option>

            ${tracks.map(track => `
                <option value="${track.id}">
                    ${track.icon} ${track.name}
                </option>
            `).join("")}

        </select>

        <select
            id="todoProjectSelect"
            disabled
        >

            <option value="" disabled selected>
                Select project
            </option>

        </select>

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

    const trackSelect =
        form.querySelector(
            "#todoTrackSelect"
        );

    const projectSelect =
        form.querySelector(
            "#todoProjectSelect"
        );

    const saveBtn =
        form.querySelector(
            "#saveTodoBtn"
        );

    const cancelBtn =
        form.querySelector(
            "#cancelTodoBtn"
        );


    // =====================================================
    // TRACK → PROJECT
    // =====================================================

    trackSelect.addEventListener(
        "change",
        () => {

            const selectedTrack =
                tracks.find(
                    track =>
                        String(track.id) ===
                        String(trackSelect.value)
                );

            projectSelect.innerHTML = `
                <option value="" disabled selected>
                    Select project
                </option>
            `;

            if (!selectedTrack) {

                projectSelect.disabled = true;

                return;
            }

            (selectedTrack.projects || [])
                .forEach(project => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        project.id;

                    option.textContent =
                        project.name;

                    projectSelect.appendChild(
                        option
                    );
                });

            projectSelect.disabled = false;
        }
    );


    revealTodoForm(form);


    // =====================================================
    // SAVE
    // =====================================================

    saveBtn.addEventListener(
        "click",
        () => {

            const text =
                input.value.trim();

            if (!text) {
                return;
            }

            const selectedTrack =
                tracks.find(
                    track =>
                        String(track.id) ===
                        String(trackSelect.value)
                );

            if (!selectedTrack) {

                alert(
                    "Please select a track."
                );

                return;
            }

            const selectedProject =
                (selectedTrack.projects || [])
                    .find(
                        project =>
                            String(project.id) ===
                            String(projectSelect.value)
                    );

            if (!selectedProject) {

                alert(
                    "Please select a project."
                );

                return;
            }

            if (
                !Array.isArray(
                    selectedProject.todos
                )
            ) {
                selectedProject.todos = [];
            }

            selectedProject.todos.push({

                id: Date.now(),

                text,

                completed: false,

                archived: false,

                order:
                    selectedProject.todos.length,

                createdAt:
                    new Date().toISOString(),

                completedAt: null

            });

            persistTracks();

            renderTodoSection();

            form.remove();

        }
    );


    // =====================================================
    // CANCEL
    // =====================================================

    cancelBtn.addEventListener(
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


    // =====================================
    // CURRENT TRACK / PROJECT
    // =====================================

    const currentTrackId =
        item.trackId;

    const currentProjectId =
        item.projectId;


    // =====================================
    // FORM
    // =====================================

    form.innerHTML = `

        <input
            type="text"
            id="editTodoText"
            value="${item.text}"
        />

        <select id="editTodoTrackSelect">

            <option
                value=""
                disabled
            >
                Select track
            </option>

            ${tracks.map(track => `
                <option
                    value="${track.id}"
                    ${
                        String(currentTrackId) ===
                        String(track.id)
                            ? "selected"
                            : ""
                    }
                >
                    ${track.icon} ${track.name}
                </option>
            `).join("")}

        </select>

        <select id="editTodoProjectSelect">

            <option
                value=""
                disabled
            >
                Select project
            </option>

        </select>

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


    // =====================================
    // REVEAL / SCROLL TO EDIT FORM
    // =====================================

    revealTodoForm(form);


    const input =
        form.querySelector(
            "#editTodoText"
        );

    const trackSelect =
        form.querySelector(
            "#editTodoTrackSelect"
        );

    const projectSelect =
        form.querySelector(
            "#editTodoProjectSelect"
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

    const originalTrackId =
        String(currentTrackId);

    const originalProjectId =
        String(currentProjectId);


    // =====================================
    // POPULATE PROJECTS
    // =====================================

    function populateProjects(
        trackId,
        selectedProjectId = null
    ) {

        const selectedTrack =
            tracks.find(
                track =>
                    String(track.id) ===
                    String(trackId)
            );

        projectSelect.innerHTML = `
            <option
                value=""
                disabled
            >
                Select project
            </option>
        `;

        if (!selectedTrack) {

            projectSelect.disabled = true;

            return;
        }

        const projects =
            selectedTrack.projects || [];

        projects.forEach(project => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                project.id;

            option.textContent =
                project.name;

            if (
                selectedProjectId !== null &&
                String(project.id) ===
                String(selectedProjectId)
            ) {
                option.selected = true;
            }

            projectSelect.appendChild(
                option
            );

        });

        projectSelect.disabled = false;
    }


    populateProjects(
        currentTrackId,
        currentProjectId
    );


    // =====================================
    // INITIAL BUTTON STATE
    // =====================================

    updateBtn.disabled = true;


    // =====================================
    // CHECK FOR CHANGES
    // =====================================

    function updateButtonState() {

        const textChanged =
            input.value.trim() !==
            originalText;

        const trackChanged =
            trackSelect.value !==
            originalTrackId;

        const projectChanged =
            projectSelect.value !==
            originalProjectId;

        updateBtn.disabled =
            !textChanged &&
            !trackChanged &&
            !projectChanged;

    }


    input.addEventListener(
        "input",
        updateButtonState
    );


    trackSelect.addEventListener(
        "change",
        () => {

            populateProjects(
                trackSelect.value
            );

            updateButtonState();

        }
    );


    projectSelect.addEventListener(
        "change",
        updateButtonState
    );


    // =====================================
    // UPDATE
    // =====================================

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


            const selectedTrack =
                tracks.find(
                    track =>
                        String(track.id) ===
                        String(trackSelect.value)
                );

            if (!selectedTrack) {

                alert(
                    "Please select a track."
                );

                return;
            }


            const newProject =
                (selectedTrack.projects || [])
                    .find(
                        project =>
                            String(project.id) ===
                            String(projectSelect.value)
                    );

            if (!newProject) {

                alert(
                    "Please select a project."
                );

                return;
            }


            // =====================================
            // FIND ORIGINAL TODO
            // =====================================

            let originalProject =
                null;

            let todo =
                null;

            for (const track of tracks) {

                for (
                    const project of
                    (track.projects || [])
                ) {

                    const found =
                        (project.todos || [])
                            .find(
                                todoItem =>
                                    String(todoItem.id) ===
                                    String(item.id)
                            );

                    if (found) {

                        originalProject =
                            project;

                        todo =
                            found;

                        break;
                    }
                }

                if (todo) break;
            }


            if (!todo) {
                return;
            }


            // =====================================
            // UPDATE TEXT
            // =====================================

            todo.text =
                newText;


            // =====================================
            // MOVE TODO IF PROJECT CHANGED
            // =====================================

            if (
                originalProject !==
                newProject
            ) {

                if (
                    Array.isArray(
                        originalProject.todos
                    )
                ) {

                    originalProject.todos =
                        originalProject.todos.filter(
                            todoItem =>
                                String(todoItem.id) !==
                                String(todo.id)
                        );

                }


                if (
                    !Array.isArray(
                        newProject.todos
                    )
                ) {

                    newProject.todos = [];

                }


                todo.order =
                    newProject.todos.length;

                newProject.todos.push(
                    todo
                );

            }


            // =====================================
            // SAVE
            // =====================================

            persistTracks();

            form.remove();

            renderTodoSection();

            showToast(
                "Task updated"
            );

        }
    );


    // =====================================
    // DELETE
    // =====================================

    deleteBtn.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    `Delete "${item.text}"?`
                );

            if (!confirmed) {
                return;
            }

            deleteTodoById(
                item.id
            );

            persistTracks();

            form.remove();

            renderTodoSection();

            showToast(
                "Task deleted"
            );

        }
    );


    // =====================================
    // CANCEL
    // =====================================

    cancelBtn.addEventListener(
        "click",
        () => {

            form.remove();

        }
    );

}

// =====================================================
// TODO FORM HELPERS
// =====================================================

function revealTodoForm(form) {

    if (!form) return;

    const sidebar =
        document.getElementById("leftPanel");

    if (!sidebar) return;

    // Give the browser a moment to insert and lay out the form
    requestAnimationFrame(() => {

        const formRect =
            form.getBoundingClientRect();

        const sidebarRect =
            sidebar.getBoundingClientRect();

        const isVisible =
            formRect.top >= sidebarRect.top &&
            formRect.bottom <= sidebarRect.bottom;

        const highlight = () => {

            form.classList.add(
                "todo-form-highlight"
            );

            setTimeout(() => {

                form.classList.remove(
                    "todo-form-highlight"
                );

            }, 2000);

            form
                .querySelector(
                    "input, textarea, select"
                )
                ?.focus();

        };

        if (isVisible) {

            highlight();

            return;

        }

        // Scroll the left panel so the form is visible
        const scrollOffset =
            formRect.top -
            sidebarRect.top -
            20;

        sidebar.scrollBy({

            top: scrollOffset,

            behavior: "smooth"

        });

        // Highlight after the scroll has started
        setTimeout(

            highlight,

            350

        );

    });

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

