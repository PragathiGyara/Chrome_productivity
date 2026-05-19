// =====================================================
// ICON PICKER
// =====================================================

const TRACK_ICONS = [

  "📚", "💻", "🧠", "🏃",
  "🎨", "🎵", "📈", "🛠️",
  "🎯", "📝", "🌱", "🚀",
  "🎬", "📷", "💰", "🧩"

];


/* =====================================================
   CREATE ICON PICKER
===================================================== */

function createIconPicker({

  container,

  selectedIcon = "📚",

  onSelect

}) {

  if (!container) return;

  container.innerHTML = "";

  TRACK_ICONS.forEach(icon => {

    const option =
      document.createElement("div");

    option.className = "icon-option";

    if (icon === selectedIcon) {

      option.classList.add("selected-icon");
    }

    option.textContent = icon;

    option.addEventListener("click", () => {

      container
        .querySelectorAll(".icon-option")
        .forEach(el => {

          el.classList.remove(
            "selected-icon"
          );

        });

      option.classList.add(
        "selected-icon"
      );

      if (onSelect) {

        onSelect(icon);
      }

    });

    container.appendChild(option);

  });
}