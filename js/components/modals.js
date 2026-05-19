// =====================================================
// MODAL HELPERS
// =====================================================

function openModal(id) {

  const modal =
    document.getElementById(id);

  if (!modal) return;

  modal.classList.remove("hidden");
}


function closeModal(id) {

  const modal =
    document.getElementById(id);

  if (!modal) return;

  modal.classList.add("hidden");
}


/* =====================================================
   CLOSE ON BACKDROP CLICK
===================================================== */

function attachModalBackdropClose(
  modal,
  onClose = null
) {

  modal.addEventListener("click", (e) => {

    if (e.target !== modal) return;

    if (onClose) {

      onClose();

    } else {

      modal.classList.add("hidden");
    }

  });
}