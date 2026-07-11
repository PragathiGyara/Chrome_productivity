let deadlinesCollapsed = false;
let todosCollapsed = false;




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
    initializeTodoSettings();
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

function renderLeftPanel() {

    renderGlobalDeadlines();

    renderTodoSection();

}





