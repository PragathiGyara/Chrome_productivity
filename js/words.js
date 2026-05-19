// ===== Vocabulary Vault Module =====

const STORAGE_KEY = "vocabularyWords";

let words = [];

let pendingWordDeletion = null;

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
  const confirmDeleteBtn =
  document.getElementById("confirmDeleteWordBtn");

  const cancelDeleteBtn =
    document.getElementById("cancelDeleteWordBtn");

  const deleteModal =
    document.getElementById("deleteWordModal");
  
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {

      if (pendingWordDeletion) {
        deleteWord(pendingWordDeletion.id);
        pendingWordDeletion = null;
      }

      deleteModal.classList.add("hidden");
    });
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      pendingWordDeletion = null;
      deleteModal.classList.add("hidden");
    });
  }
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
    display,
    status: "new"
  };

  words.unshift(newWord); // Add to top
  persistWords();
  renderWords();
  renderWordOfTheDay();
  clearForm();
  toggleForm();
}

// ------------------------------
// Render Words
// ------------------------------

function updateStats(words) {
  const total = words.length;
  const learned = words.filter(w => w.status === "learned").length;
  const active = total - learned;

  document.getElementById("totalWords").innerText = total;
  document.getElementById("learnedWords").innerText = learned;
  document.getElementById("learningWords").innerText = active; // rename label later if needed
}

function renderWords() {
  const container = document.getElementById("wordList");
  container.innerHTML = "";

  updateStats(words);

  const activeWords = words
    .filter(w => w.display && w.status !== "learned")
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const learnedWords = words
    .filter(w => w.display && w.status === "learned");
  // ❗ NO SORT HERE

  const finalList = [...activeWords, ...learnedWords];

  finalList.forEach((word, index) => {
    container.appendChild(createWordElement(word, index + 1));
  });
}
// ------------------------------
// Create Word Element
// ------------------------------

function createWordElement(wordObj, number) {
  const div = document.createElement("div");
  div.classList.add("word-item");

  // Fade if learned
  if (wordObj.status === "learned") {
    div.classList.add("learned");
  }

  // Header
  const header = document.createElement("div");
  header.className = "word-header";

  if (number !== null) {
    const num = document.createElement("span");
    num.className = "word-number";
    num.textContent = `${number}.`;
    header.appendChild(num);
  }

  const title = document.createElement("span");
  title.className = "word-title";
  title.textContent = wordObj.word;

  header.appendChild(title);

  // Language
  const language = document.createElement("div");
  language.className = "word-language";
  language.textContent = wordObj.language;

  // Meaning
  const meaning = document.createElement("div");
  meaning.className = "word-meaning";
  meaning.textContent = wordObj.meaning;

  // Sentence
  const sentence = document.createElement("div");
  sentence.className = "word-sentence";
  sentence.textContent = wordObj.sentence || "";

  // Date (NEW)
  const date = document.createElement("div");
  date.className = "word-date";
  date.textContent = new Date(wordObj.date).toLocaleDateString();

  // Button Container
  const actions = document.createElement("div");
  actions.className = "word-actions";

  // Learned button
  const btn = document.createElement("button");
  btn.className = "mark-learned-btn";

  btn.textContent =
    wordObj.status === "learned" ? "↺ Revise" : "✓ Learned";

  btn.addEventListener("click", () => {
    markAsLearned(wordObj.id);
  });

  // Delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-word-btn";
  deleteBtn.innerHTML = "🗑 <span>Delete</span>";

  deleteBtn.addEventListener("click", () => {
    openDeleteWordModal(wordObj);
  });

  actions.append(btn, deleteBtn);

  const footer = document.createElement("div");
  footer.className = "word-footer";
  footer.appendChild(actions);
  div.append(header, language, meaning, sentence, footer, date);
  return div;
}

function markAsLearned(id) {
  let updatedWord = null;

  words = words.filter(w => {
    if (w.id === id) {
      updatedWord = w;
      return false; // remove it
    }
    return true;
  });

  if (!updatedWord) return;

  if (updatedWord.status === "learned") {
    // 🔁 Revise → bring to top
    updatedWord = {
      ...updatedWord,
      status: "active",
      date: new Date().toISOString()
    };

    words.unshift(updatedWord); // top
  } else {
    // ✅ Mark learned → send to bottom
    updatedWord = {
      ...updatedWord,
      status: "learned",
      date: new Date().toISOString()
    };

    words.push(updatedWord); // 🔥 bottom
  }

  persistWords();
  renderWords();
  renderWordOfTheDay();
}
function openDeleteWordModal(wordObj) {
  pendingWordDeletion = wordObj;

  const modal = document.getElementById("deleteWordModal");
  const text = document.getElementById("deleteWordText");

  text.textContent =
    `Are you sure you want to delete "${wordObj.word}"?`;

  modal.classList.remove("hidden");
}
function deleteWord(id) {
  words = words.filter(w => w.id !== id);

  persistWords();
  renderWords();
  renderWordOfTheDay();
}
// ------------------------------
// Local Storage
// ------------------------------

function persistWords() {
  chrome.storage.local.set({ [STORAGE_KEY]: words });
}

function loadWords() {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    words = (result[STORAGE_KEY] || []).map(w => ({
      ...w,
      status: w.status || "active"
    }));

    renderWords();
    renderWordOfTheDay();
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
    display: true,
    status: "new"
  };

  words.unshift(newWord);
  persistWords();
  renderWords();
  renderWordOfTheDay();
}
