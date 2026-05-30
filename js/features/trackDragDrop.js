function handleDragStart(e) {
  isDragging = true;
  this.classList.add("dragging");
}

function handleDragOver(e) {
  e.preventDefault(); // required for drop

  const draggingElement = document.querySelector(".dragging");
  if (!draggingElement || this === draggingElement) return;

  const grid = document.getElementById("trackGrid");
  const children = [...grid.children];

  const draggedIndex = children.indexOf(draggingElement);
  const targetIndex = children.indexOf(this);

  if (draggedIndex < targetIndex) {
    grid.insertBefore(draggingElement, this.nextSibling);
  } else {
    grid.insertBefore(draggingElement, this);
  }
}

function handleDrop(e) {
  e.stopPropagation();
}

function handleDragEnd() {
  this.classList.remove("dragging");

  updateTrackOrderFromDOM();

  // small delay so click doesn't fire immediately
  setTimeout(() => {
    isDragging = false;
  }, 50);

  showToast("Track order updated");
}

function updateTrackOrderFromDOM() {
  const grid = document.getElementById("trackGrid");
  const cards = Array.from(grid.children);

  // FIRST — get initial positions
  const firstRects = new Map();
  cards.forEach(card => {
    firstRects.set(card.dataset.id, card.getBoundingClientRect());
  });

  // Update internal tracks order
  const newOrder = [];
  cards.forEach(card => {
    const id = Number(card.dataset.id);
    const track = tracks.find(t => t.id === id);
    if (track) newOrder.push(track);
  });
  tracks = newOrder;

  // LAST — get new positions after DOM already changed
  requestAnimationFrame(() => {
    cards.forEach(card => {
      const lastRect = card.getBoundingClientRect();
      const firstRect = firstRects.get(card.dataset.id);

      const dx = firstRect.left - lastRect.left;
      const dy = firstRect.top - lastRect.top;

      // INVERT
      card.style.transform = `translate(${dx}px, ${dy}px)`;

      // PLAY
      requestAnimationFrame(() => {
        card.style.transform = "";
      });
    });
  });

  persistTracks();
}


// --------------------------
// Drag and Drop Tracks
// --------------------------

function enableDragMode() {
  dragModeEnabled = true;

  document.querySelectorAll(".card").forEach(card => {
    card.classList.add("drag-enabled");
  });

  showToast("Drag mode enabled");
}