// =====================================================
// PROJECT DRAG & DROP
// =====================================================

let draggedProjectRow = null;


// =====================================================
// INITIALIZE
// =====================================================

function initializeProjectDragDrop() {

  const rows =
    document.querySelectorAll(
      ".project-row[draggable='true']"
    );

  rows.forEach(row => {

    row.addEventListener(
      "dragstart",
      handleProjectDragStart
    );

    row.addEventListener(
      "dragover",
      handleProjectDragOver
    );

    row.addEventListener(
      "drop",
      handleProjectDrop
    );

    row.addEventListener(
      "dragend",
      handleProjectDragEnd
    );

  });

}


// =====================================================
// DRAG START
// =====================================================

function handleProjectDragStart(
  e
) {

  draggedProjectRow =
    e.currentTarget;

  e.dataTransfer.effectAllowed =
    "move";

  draggedProjectRow.classList.add(
    "dragging-project"
  );

}


// =====================================================
// DRAG OVER
// =====================================================

function handleProjectDragOver(
  e
) {

  e.preventDefault();

  e.dataTransfer.dropEffect =
    "move";

}


// =====================================================
// DROP
// =====================================================

function handleProjectDrop(
  e
) {

  e.preventDefault();

  const targetRow =
    e.currentTarget;

  if (
    !draggedProjectRow ||
    draggedProjectRow === targetRow
  ) {

    return;

  }

  const draggedId =
    Number(
      draggedProjectRow.dataset.projectId
    );

  const targetId =
    Number(
      targetRow.dataset.projectId
    );

  const draggedIndex =
    projects.findIndex(
      project =>
        project.id === draggedId
    );

  const targetIndex =
    projects.findIndex(
      project =>
        project.id === targetId
    );

  if (
    draggedIndex === -1 ||
    targetIndex === -1
  ) {

    return;

  }

  const [
    draggedProject
  ] =
    projects.splice(
      draggedIndex,
      1
    );

  projects.splice(
    targetIndex,
    0,
    draggedProject
  );

  refreshProjectsUI();

}


// =====================================================
// DRAG END
// =====================================================

function handleProjectDragEnd() {

  draggedProjectRow
    ?.classList.remove(
      "dragging-project"
    );

  draggedProjectRow =
    null;

}