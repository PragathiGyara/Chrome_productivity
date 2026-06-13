// =====================================================
// WOTD EVENTS
// =====================================================

function attachWOTDEvents() {

  document
    .getElementById("wotdNext")
    ?.addEventListener("click", () => {

      nextWOTDLanguage();

    });

  document
    .getElementById("wotdPrev")
    ?.addEventListener("click", () => {

      prevWOTDLanguage();

    });

  document
    .getElementById("wotdSentenceToggle")
    ?.addEventListener("change", (e) => {

      const sentenceEl =
        document.getElementById("wotdSentence");

      if (e.target.checked) {

        sentenceEl.classList.remove("hidden");

      } else {

        sentenceEl.classList.add("hidden");

      }

    });

  document
    .getElementById("wotdGuessModeToggle")
    ?.addEventListener("change", (e) => {

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

        sentenceToggle.checked = false;

        sentenceEl.classList.add(
          "hidden"
        );

      }

      renderWordOfTheDay();

    });

  document
    .getElementById("wotdRevealBtn")
    ?.addEventListener("click", () => {

      wotdRevealed = true;

      renderWordOfTheDay();

    });

  document
    .getElementById("wotdLearnBtn")
    ?.addEventListener("click", () => {

      if (!currentWOTDWord) return;

      const learnedWord =
        currentWOTDWord.word;

      markAsLearned(currentWOTDWord.id);

      showToast(
        `"${learnedWord}" marked as learned`
      );

    });

  document
    .getElementById("wotdVaultBtn")
    ?.addEventListener("click", () => {

      goToCurrentWOTDInVault();

    });
}