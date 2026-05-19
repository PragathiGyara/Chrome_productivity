// =====================================================
// PANEL TOGGLES
// =====================================================

function setupPanelToggles() {

  const app =
    document.querySelector(".app");

  const rightBtn =
    document.getElementById(
      "rightToggleBtn"
    );

  const leftBtn =
    document.getElementById(
      "leftToggleBtn"
    );

  if (rightBtn && app) {

    rightBtn.addEventListener(
      "click",
      () => {

        app.classList.toggle(
          "right-collapsed"
        );

      }
    );
  }

  if (leftBtn && app) {

    leftBtn.addEventListener(
      "click",
      () => {

        app.classList.toggle(
          "left-collapsed"
        );

      }
    );
  }
}


/* =====================================================
   SMART SCROLLBARS
===================================================== */

function enableSmartScrollbar(
  element
) {

  let scrollTimeout;

  element.addEventListener(
    "scroll",
    () => {

      element.classList.add(
        "scrolling"
      );

      clearTimeout(scrollTimeout);

      scrollTimeout =
        setTimeout(() => {

          element.classList.remove(
            "scrolling"
          );

        }, 700);

    }
  );
}


function setupSmartScrollbars() {

  document
    .querySelectorAll(
      ".panel, .center"
    )
    .forEach(el => {

      enableSmartScrollbar(el);

    });
}


/* =====================================================
   INIT
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupPanelToggles();

    setupSmartScrollbars();

  }
);