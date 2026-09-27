// =====================================================
// PROJECT DRAG & DROP
// =====================================================
//
// Projects are displayed as one global list across
// all Tracks.
//
// Dragging changes the global sortOrder.
//
// Dragging NEVER changes a project's Track.
// =====================================================


// =====================================================
// STATE
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


  rows.forEach(
    row => {

      // Prevent duplicate listeners.

      if (
        row.dataset.dragEventsAttached ===
        "true"
      ) {

        return;

      }


      row.dataset.dragEventsAttached =
        "true";


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

    }
  );

}


// =====================================================
// DRAG START
// =====================================================

function handleProjectDragStart(
  e
) {

  draggedProjectRow =
    e.currentTarget;


  draggedProjectRow.classList.add(
    "dragging-project"
  );


  e.dataTransfer.effectAllowed =
    "move";


  e.dataTransfer.setData(
    "text/plain",
    draggedProjectRow.dataset.projectId
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


  if (
    !draggedProjectRow
  ) {

    return;

  }


  const targetRow =
    e.currentTarget;


  if (
    draggedProjectRow ===
    targetRow
  ) {

    return;

  }


  const list =
    document.getElementById(
      "projectsList"
    );


  if (!list) return;


  // =====================================
  // GET CURRENT TRACKER ORDER
  // =====================================

  const rows =
    Array.from(
      list.querySelectorAll(
        ".project-row[draggable='true']"
      )
    );


  const draggedIndex =
    rows.indexOf(
      draggedProjectRow
    );


  const targetIndex =
    rows.indexOf(
      targetRow
    );


  if (
    draggedIndex === -1 ||
    targetIndex === -1
  ) {

    return;

  }


  // =====================================
  // BUILD CURRENT ORDER
  // =====================================

  const orderedIds =
    rows.map(
      row =>
        String(
          row.dataset.projectId
        )
    );


  const draggedId =
    String(
      draggedProjectRow.dataset.projectId
    );


  const targetId =
    String(
      targetRow.dataset.projectId
    );


  // =====================================
  // REMOVE DRAGGED PROJECT
  // =====================================

  const currentIndex =
    orderedIds.indexOf(
      draggedId
    );


  if (
    currentIndex === -1
  ) {

    return;

  }


  orderedIds.splice(
    currentIndex,
    1
  );


  // =====================================
  // FIND TARGET AGAIN
  // =====================================

  let insertionIndex =
    orderedIds.indexOf(
      targetId
    );


  if (
    insertionIndex === -1
  ) {

    return;

  }


  // =====================================
  // DROP ABOVE / BELOW TARGET
  // =====================================

  const targetRect =
    targetRow.getBoundingClientRect();


  const dropBelow =
    e.clientY >
    (
      targetRect.top +
      targetRect.height / 2
    );


  if (
    dropBelow
  ) {

    insertionIndex += 1;

  }


  orderedIds.splice(
    insertionIndex,
    0,
    draggedId
  );


  // =====================================
  // CREATE GLOBAL ORDER MAP
  // =====================================

  const orderMap =
    new Map();


  orderedIds.forEach(
    (
      projectId,
      index
    ) => {

      orderMap.set(
        projectId,
        index
      );

    }
  );


  // =====================================
  // WRITE SORT ORDER TO STORAGE
  // =====================================

  tracks.forEach(
    track => {

      (track.projects || [])
        .forEach(
          project => {

            const projectId =
              String(
                project.id
              );


            if (
              orderMap.has(
                projectId
              )
            ) {

              project.sortOrder =
                orderMap.get(
                  projectId
                );

            }

          }
        );

    }
  );


  // =====================================
  // SAVE
  // =====================================

  persistTracks();


  // =====================================
  // CLEAN UP
  // =====================================

  draggedProjectRow.classList.remove(
    "dragging-project"
  );


  draggedProjectRow =
    null;


  // =====================================
  // RENDER
  // =====================================

  renderProjects();

}


// =====================================================
// DRAG END
// =====================================================

function handleProjectDragEnd() {

  if (
    draggedProjectRow
  ) {

    draggedProjectRow.classList.remove(
      "dragging-project"
    );

  }


  draggedProjectRow =
    null;

}