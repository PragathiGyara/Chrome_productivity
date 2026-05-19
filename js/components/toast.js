// =====================================================
// TOAST SYSTEM
// =====================================================

let toastTimeout = null;


function showToast(message) {

  const toast =
    document.getElementById("toastMessage");

  if (toastTimeout) {

    clearTimeout(toastTimeout);
  }

  toast.textContent = message;

  toast.classList.remove("hidden");

  toastTimeout = setTimeout(() => {

    toast.classList.add("hidden");

  }, 2500);
}