// ===== Vocabulary Vault Module =====

const STORAGE_KEY = "vocabularyWords";

let words = [];

// ------------------------------
// Initialization
// ------------------------------

document.addEventListener("DOMContentLoaded", () => {
  loadWords(); // render happens inside loadWords
  attachEventListeners();
});

// ------------------------------
// Event Listeners
// ------------------------------

function attachEventListeners() {
  const addBtn = document.querySelector(".add-word-btn");
  const saveBtn = document.querySelector(".save-word-btn");

  if (addBtn) addBtn.addEventListener("click", toggleForm);
  if (saveBtn) saveBtn.addEventListener("click", saveWord);
}

// ------------------------------
// Toggle Form
// ------------------------------

function toggleForm() {
  const form = document.getElementById("wordForm");
  form.classList.toggle("hidden");
}

// ------------------------------
// Save Word
// ------------------------------

function saveWord() {
  const language = document.getElementById("languageInput").value;
  const word = document.getElementById("wordInput").value.trim();
  const meaning = document.getElementById("meaningInput").value.trim();
  const sentence = document.getElementById("sentenceInput").value.trim();
  const display = document.getElementById("displayInput").checked;

  if (!word || !meaning) {
    alert("Word and meaning are required.");
    return;
  }

  const newWord = {
    id: Date.now(),
    date: new Date().toISOString(),
    language,
    word,
    meaning,
    sentence,
    display
  };

  words.unshift(newWord); // Add to top
  persistWords();
  renderWords();
  clearForm();
  toggleForm();
}

// ------------------------------
// Render Words
// ------------------------------

function renderWords() {
  const container = document.getElementById("wordList");
  container.innerHTML = "";

  words
    .filter(w => w.display)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(word => {
      const wordElement = createWordElement(word);
      container.appendChild(wordElement);
    });
}

// ------------------------------
// Create Word Element
// ------------------------------

function createWordElement(wordObj) {
  const div = document.createElement("div");
  div.classList.add("word-item");

  const language = document.createElement("div");
  language.className = "word-language";
  language.textContent = wordObj.language;

  const title = document.createElement("div");
  title.className = "word-title";
  title.textContent = wordObj.word;

  const meaning = document.createElement("div");
  meaning.className = "word-meaning";
  meaning.textContent = wordObj.meaning;

  const sentence = document.createElement("div");
  sentence.className = "word-sentence";
  sentence.textContent = wordObj.sentence || "";

  div.append(language, title, meaning, sentence);

  return div;
}

// ------------------------------
// Local Storage
// ------------------------------

function persistWords() {
  chrome.storage.local.set({ [STORAGE_KEY]: words });
}

function loadWords() {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    words = result[STORAGE_KEY] || [];
    renderWords();
  });
}

// ------------------------------
// Clear Form
// ------------------------------

function clearForm() {
  document.getElementById("wordInput").value = "";
  document.getElementById("meaningInput").value = "";
  document.getElementById("sentenceInput").value = "";
  document.getElementById("displayInput").checked = true;
}


// ------------------------------
// Public API: Add Word Programmatically
// ------------------------------

function addWordToVault(wordData) {
  const newWord = {
    id: Date.now(),
    date: new Date().toISOString(),
    language: wordData.language || "English",
    word: wordData.word,
    meaning: wordData.meaning,
    sentence: wordData.sentence || "",
    display: true
  };

  words.unshift(newWord);
  persistWords();
  renderWords();
}
