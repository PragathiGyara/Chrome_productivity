// =====================================================
// VOCABULARY SYSTEM
// =====================================================

let vocabularyWords = [];


/* =====================================================
   LOAD WORDS
===================================================== */

function loadWords() {

  const stored =
    localStorage.getItem("vocabularyWords");

  vocabularyWords =
    stored
      ? JSON.parse(stored)
      : [];

  return vocabularyWords;
}


/* =====================================================
   SAVE WORDS
===================================================== */

function persistWords() {

  localStorage.setItem(
    "vocabularyWords",
    JSON.stringify(vocabularyWords)
  );
}


/* =====================================================
   ADD WORD
===================================================== */

function addWord(wordData) {

  vocabularyWords.unshift({

    id: Date.now(),

    learned: false,

    createdAt:
      new Date().toISOString(),

    ...wordData

  });

  persistWords();

  renderWordList();

  updateVocabularyStats();

  updateWOTD(vocabularyWords);
}


/* =====================================================
   DELETE WORD
===================================================== */

function deleteWord(wordId) {

  vocabularyWords =
    vocabularyWords.filter(
      word => word.id !== wordId
    );

  persistWords();

  renderWordList();

  updateVocabularyStats();

  updateWOTD(vocabularyWords);
}


/* =====================================================
   TOGGLE LEARNED
===================================================== */

function toggleWordLearned(wordId) {

  const word =
    vocabularyWords.find(
      word => word.id === wordId
    );

  if (!word) return;

  word.learned = !word.learned;

  persistWords();

  renderWordList();

  updateVocabularyStats();
}


/* =====================================================
   VOCABULARY STATS
===================================================== */

function updateVocabularyStats() {

  const total =
    vocabularyWords.length;

  const learned =
    vocabularyWords.filter(
      word => word.learned
    ).length;

  const learning =
    total - learned;

  document.getElementById(
    "totalWords"
  ).textContent = total;

  document.getElementById(
    "learningWords"
  ).textContent = learning;

  document.getElementById(
    "learnedWords"
  ).textContent = learned;
}