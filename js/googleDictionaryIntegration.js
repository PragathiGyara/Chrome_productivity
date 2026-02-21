// ======================================================
// GOOGLE DICTIONARY → VOCABULARY VAULT INTEGRATION
// ======================================================

/**
 * Storage Key (keep consistent with words.js)
 */
const STORAGE_KEY = "vocabularyWords";


// ======================================================
// 1️⃣ Dictionary Detection & Extraction
// ======================================================

/**
 * Detects if Google dictionary card is present
 */
function detectDictionaryHeader() {
  return document.querySelector('[data-dobid="hdw"]');
}

/**
 * Extract word + meaning from dictionary card
 */
function extractDictionaryData() {
  const wordElement = detectDictionaryHeader();
  const meaningElement = document.querySelector('[data-dobid="dfn"]');

  let word = wordElement?.innerText?.trim() || "";
  word = capitalizeFirstLetter(word);

  return {
    word,
    meaning: meaningElement?.innerText?.trim() || ""
  };
}

/**
 * Utility: Capitalize first letter
 */
function capitalizeFirstLetter(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}


// ======================================================
// 2️⃣ Button Injection
// ======================================================

function injectAddButton() {
  const header = detectDictionaryHeader();
  if (!header) return;

  if (document.getElementById("vaultInjectBtn")) return;

  const dictionaryCard =
    header.closest("div[jsname]") || header.parentElement;

  if (!dictionaryCard) return;

  dictionaryCard.style.position = "relative";

  const btn = document.createElement("button");
  btn.id = "vaultInjectBtn";
  btn.className = "vault-add-btn";
  btn.innerHTML = "＋";
  btn.title = "Add to Vocabulary Vault";

  Object.assign(btn.style, {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer"
  });

  btn.addEventListener("click", openInjectedForm);
  dictionaryCard.appendChild(btn);
}


// ======================================================
// 3️⃣ Modal Form UI
// ======================================================

function openInjectedForm() {
  if (document.getElementById("vaultPopupForm")) return;

  const data = extractDictionaryData();

  const overlay = document.createElement("div");
  overlay.id = "vaultPopupForm";
  overlay.className = "vault-overlay";

  overlay.innerHTML = `
    <div class="vault-modal">
      <h3>Add to Vocabulary</h3>
      <input id="extWord" value="${data.word}" placeholder="Word" />
      <textarea id="extMeaning" placeholder="Meaning">${data.meaning}</textarea>
      <textarea id="extSentence" placeholder="Example sentence"></textarea>

      <div class="vault-actions">
        <button id="extCancelBtn" class="vault-cancel">Cancel</button>
        <button id="extSaveBtn" class="vault-save">Save</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById("extSaveBtn")
    .addEventListener("click", saveInjectedWord);

  document.getElementById("extCancelBtn")
    .addEventListener("click", () => overlay.remove());
}


// ======================================================
// 4️⃣ Save Logic (with Duplicate Protection)
// ======================================================

function saveInjectedWord() {
  let word = document.getElementById("extWord").value.trim();
  const meaning = document.getElementById("extMeaning").value.trim();
  const sentence = document.getElementById("extSentence").value.trim();

  if (!word || !meaning) {
    showToast("Word and meaning are required");
    return;
  }

  word = capitalizeFirstLetter(word);

  chrome.storage.local.get([STORAGE_KEY], (result) => {
    let words = result[STORAGE_KEY] || [];

    // Case-insensitive duplicate check
    const exists = words.some(
      w => w.word.toLowerCase() === word.toLowerCase()
    );

    if (exists) {
      showToast("Word already exists in Vault ⚠");
      return;
    }

    const newWord = {
      id: Date.now(),
      date: new Date().toISOString(),
      language: "English",
      word,
      meaning,
      sentence,
      display: true
    };

    words.unshift(newWord);

    chrome.storage.local.set({ [STORAGE_KEY]: words }, () => {
      document.getElementById("vaultPopupForm")?.remove();
      showToast("Added to Vocabulary Vault ✓");
    });
  });
}


// ======================================================
// 5️⃣ Toast Notification
// ======================================================

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "vault-toast";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}


// ======================================================
// 6️⃣ Mutation Observer (Google Dynamic Rendering)
// ======================================================

const observer = new MutationObserver(() => {
  injectAddButton();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});


// ======================================================
// 7️⃣ Style Injection (Scoped to Extension)
// ======================================================

injectStyles();

function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    /* Add Button */
    .vault-add-btn {
      background: #6366f1;
      color: white;
      font-weight: bold;
      font-size: 18px;
      transition: all 0.2s ease;
    }

    .vault-add-btn:hover {
      background: #4f46e5;
      transform: scale(1.05);
    }

    /* Modal */
    .vault-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .vault-modal {
      background: #111827;
      padding: 20px;
      width: 340px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .vault-modal input,
    .vault-modal textarea {
      background: #1f2937;
      border: 1px solid #374151;
      border-radius: 6px;
      padding: 8px;
      color: white;
    }

    .vault-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .vault-save {
      background: #6366f1;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      color: white;
      cursor: pointer;
    }

    .vault-cancel {
      background: transparent;
      border: 1px solid #374151;
      padding: 6px 12px;
      border-radius: 6px;
      color: #9ca3af;
      cursor: pointer;
    }

    /* Toast */
    .vault-toast {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -60%);
      background: #111827;
      color: #e5e7eb;
      padding: 14px 22px;
      border-radius: 10px;
      font-size: 14px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      opacity: 0;
      transition: all 0.25s ease;
      z-index: 99999;
    }

    .vault-toast.show {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
  `;

  document.head.appendChild(style);
}