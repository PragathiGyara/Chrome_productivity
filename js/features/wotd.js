// =====================================================
// WORD OF THE DAY
// =====================================================

let currentLanguageIndex = 0;


/* =====================================================
   GET DISPLAY WORDS
===================================================== */

function getDisplayWords() {

  return words.filter(
    word => word.display
  );
}


/* =====================================================
   GET LANGUAGES
===================================================== */

function getAvailableLanguages() {

  const visibleWords =
    getDisplayWords();

  return [
    ...new Set(
      visibleWords.map(
        word => word.language
      )
    )
  ];
}


/* =====================================================
   GET DAILY WORD
===================================================== */

function getDailyWord(language) {

  const languageWords =
    getDisplayWords()
      .filter(word =>
        word.language === language
      );

  if (!languageWords.length) {
    return null;
  }

  const today =
    new Date();

  const daySeed =
    Math.floor(
      today.getTime() /
      (1000 * 60 * 60 * 24)
    );

  const wordIndex =
    daySeed %
    languageWords.length;

  return languageWords[wordIndex];
}


/* =====================================================
   RENDER WOTD
===================================================== */

function renderWordOfTheDay() {

  const languages =
    getAvailableLanguages();

  const wordEl =
    document.getElementById(
      "centerWOTDWord"
    );

  const meaningEl =
    document.getElementById(
      "centerWOTDMeaning"
    );

  const languageEl =
    document.getElementById(
      "centerWOTDLanguage"
    );

  const sentenceEl =
    document.getElementById(
      "wotdSentence"
    );

  const toggleContainer =
    document.getElementById(
      "wotdToggleContainer"
    );

  const prevBtn =
    document.getElementById(
      "wotdPrev"
    );

  const nextBtn =
    document.getElementById(
      "wotdNext"
    );

  if (!languages.length) {

    if (wordEl) {
      wordEl.textContent =
        "No words available";
    }

    if (meaningEl) {
      meaningEl.textContent = "";
    }

    return;
  }

  currentLanguageIndex =
    (
      (
        currentLanguageIndex %
        languages.length
      ) + languages.length
    ) % languages.length;

  const currentLanguage =
    languages[currentLanguageIndex];

  const word =
    getDailyWord(currentLanguage);

  if (!word) return;

  languageEl.textContent =
    currentLanguage;

  wordEl.textContent =
    word.word;

  meaningEl.textContent =
    word.meaning;

  sentenceEl.textContent =
    word.sentence || "";

  if (word.sentence) {

    toggleContainer
      .classList.remove("hidden");

  } else {

    toggleContainer
      .classList.add("hidden");
  }

  // Hide nav if only one language
  const showNav =
    languages.length > 1;

  prevBtn.style.display =
    showNav ? "block" : "none";

  nextBtn.style.display =
    showNav ? "block" : "none";
}


/* =====================================================
   NAVIGATION
===================================================== */

function nextWOTDLanguage() {

  currentLanguageIndex++;

  renderWordOfTheDay();
}


function prevWOTDLanguage() {

  currentLanguageIndex--;

  renderWordOfTheDay();
}