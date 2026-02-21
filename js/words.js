// ===== Vocabulary Vault Module =====

const STORAGE_KEY = "vocabularyWords";

let words = [];

// ------------------------------
// Initialization
// ------------------------------

document.addEventListener("DOMContentLoaded", () => {
  loadWords();
  renderWords();
  attachEventListeners();
});

// ------------------------------
// Event Listeners
// ------------------------------

function attachEventListeners() {
  const addBtn = document.querySelector(".add-word-btn");
  const saveBtn = document.querySelector(".save-word-btn");

  addBtn.addEventListener("click", toggleForm);
  saveBtn.addEventListener("click", saveWord);
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

  div.innerHTML = `
    <div class="word-language">${wordObj.language}</div>
    <div class="word-title">${wordObj.word}</div>
    <div class="word-meaning">${wordObj.meaning}</div>
    <div class="word-sentence">${wordObj.sentence || ""}</div>
  `;

  return div;
}

// ------------------------------
// Local Storage
// ------------------------------

function persistWords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

function loadWords() {
  const stored = localStorage.getItem(STORAGE_KEY);
  words = stored ? JSON.parse(stored) : [];
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
