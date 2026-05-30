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