// =====================================================
// WORD OF THE DAY EVENTS
// =====================================================

function attachWOTDEvents() {

  // ===================================================
  // COLLAPSE / EXPAND WOTD
  // ===================================================

  document
    .getElementById("wotdCollapseBtn")
    ?.addEventListener("click", () => {

      const content =
        document.getElementById(
          "wotdCollapsibleContent"
        );

      const button =
        document.getElementById(
          "wotdCollapseBtn"
        );

      if (!content || !button) return;

      const isCollapsed =
        content.classList.toggle(
          "collapsed"
        );

      button.textContent =
        isCollapsed
          ? "▼"
          : "▲";

      button.title =
        isCollapsed
          ? "Expand Word of the Day"
          : "Collapse Word of the Day";

      button.setAttribute(
        "aria-label",
        isCollapsed
          ? "Expand Word of the Day"
          : "Collapse Word of the Day"
      );

    });


  // ===================================================
  // PREVIOUS WOTD
  // ===================================================

  document
    .getElementById("wotdPrev")
    ?.addEventListener(
      "click",
      () => {
        prevWOTDLanguage();
      }
    );


  // ===================================================
  // NEXT WOTD
  // ===================================================

  document
    .getElementById("wotdNext")
    ?.addEventListener(
      "click",
      () => {
        nextWOTDLanguage();
      }
    );


  // ===================================================
  // EXAMPLE SENTENCE TOGGLE
  // ===================================================

  document
    .getElementById("wotdSentenceToggle")
    ?.addEventListener(
      "change",
      (e) => {

        const sentenceEl =
          document.getElementById(
            "wotdSentence"
          );

        if (!sentenceEl) return;

        if (e.target.checked) {

          sentenceEl.classList.remove(
            "hidden"
          );

        } else {

          sentenceEl.classList.add(
            "hidden"
          );

        }

      }
    );


  // ===================================================
  // GUESS WORD MODE
  // ===================================================

  document
    .getElementById("wotdGuessModeToggle")
    ?.addEventListener(
      "change",
      (e) => {

        wotdGuessMode =
          e.target.checked;

        wotdRevealed = false;


        const sentenceToggle =
          document.getElementById(
            "wotdSentenceToggle"
          );

        const sentenceEl =
          document.getElementById(
            "wotdSentence"
          );


        if (wotdGuessMode) {

          if (sentenceToggle) {
            sentenceToggle.checked = false;
          }

          if (sentenceEl) {
            sentenceEl.classList.add(
              "hidden"
            );
          }

        }


        renderWordOfTheDay();

      }
    );


  // ===================================================
  // REVEAL WORD
  // ===================================================

  document
    .getElementById("wotdRevealBtn")
    ?.addEventListener(
      "click",
      () => {

        wotdRevealed = true;

        renderWordOfTheDay();

      }
    );


  // ===================================================
  // MARK AS LEARNED
  // ===================================================

  document
    .getElementById("wotdLearnBtn")
    ?.addEventListener(
      "click",
      () => {

        if (!currentWOTDWord) return;


        const learnedWord =
          currentWOTDWord.word;


        markAsLearned(
          currentWOTDWord.id
        );


        showToast(
          `"${learnedWord}" marked as learned`
        );

      }
    );


  // ===================================================
  // OPEN WORD IN VAULT
  // ===================================================

  document
    .getElementById("wotdVaultBtn")
    ?.addEventListener(
      "click",
      () => {

        goToCurrentWOTDInVault();

      }
    );

}