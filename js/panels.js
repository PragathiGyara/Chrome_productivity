document.addEventListener("DOMContentLoaded", () => {

  const app = document.querySelector(".app");

  const rightBtn = document.getElementById("rightToggleBtn");
  const leftBtn = document.getElementById("leftToggleBtn");

  if (rightBtn) {
    rightBtn.addEventListener("click", () => {
      app.classList.toggle("right-collapsed");
    });
  }

  if (leftBtn) {
    leftBtn.addEventListener("click", () => {
      app.classList.toggle("left-collapsed");
    });
  }

});

function enableSmartScrollbar(element) {
  let scrollTimeout;

  element.addEventListener("scroll", () => {
    element.classList.add("scrolling");

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      element.classList.remove("scrolling");
    }, 700); // disappears 700ms after scrolling stops
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".panel, .center").forEach(el => {
    enableSmartScrollbar(el);
  });
});

