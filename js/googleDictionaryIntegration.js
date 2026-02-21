// ===== Google Dictionary Integration =====

function detectDictionaryCard() {
  return document.querySelector('[data-dobid="hdw"]');
}

function extractDictionaryData() {
  const wordElement = document.querySelector('[data-dobid="hdw"]');
  const meaningElement = document.querySelector('[data-dobid="dfn"]');

  return {
    word: wordElement?.innerText || "",
    meaning: meaningElement?.innerText || ""
  };
}

function injectAddButton() {
  const header = detectDictionaryCard();
  if (!header) return;

  if (document.getElementById("vaultInjectBtn")) return;

  const btn = document.createElement("button");
  btn.id = "vaultInjectBtn";
  btn.innerText = "📚 Add to Vault";

  btn.style.marginTop = "8px";
  btn.style.padding = "6px 10px";
  btn.style.background = "#16a34a";
  btn.style.color = "white";
  btn.style.border = "none";
  btn.style.borderRadius = "6px";
  btn.style.cursor = "pointer";

  btn.addEventListener("click", openInjectedForm);

  header.parentElement.appendChild(btn);
}

function openInjectedForm() {
  if (document.getElementById("vaultPopupForm")) return;

  const data = extractDictionaryData();

  const form = document.createElement("div");
  form.id = "vaultPopupForm";

  form.style.position = "fixed";
  form.style.top = "20%";
  form.style.right = "20px";
  form.style.width = "300px";
  form.style.padding = "16px";
  form.style.background = "#111827";
  form.style.color = "white";
  form.style.borderRadius = "8px";
  form.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
  form.style.zIndex = "9999";

  form.innerHTML = `
    <h3>Add to Vocabulary</h3>
    <input id="extWord" value="${data.word}" placeholder="Word" style="width:100%; margin-bottom:8px;" />
    <input id="extMeaning" value="${data.meaning}" placeholder="Meaning" style="width:100%; margin-bottom:8px;" />
    <textarea id="extSentence" placeholder="Example sentence" style="width:100%; margin-bottom:8px;"></textarea>
    <button id="extSaveBtn">Save</button>
    <button id="extCancelBtn">Cancel</button>
  `;

  document.body.appendChild(form);

  document.getElementById("extSaveBtn").addEventListener("click", saveInjectedWord);
  document.getElementById("extCancelBtn").addEventListener("click", () => form.remove());
}

function saveInjectedWord() {
  const word = document.getElementById("extWord").value.trim();
  const meaning = document.getElementById("extMeaning").value.trim();
  const sentence = document.getElementById("extSentence").value.trim();

  if (!word || !meaning) {
    alert("Word and meaning required.");
    return;
  }

  // 🔥 Call your original vault system
  addWordToVault({
    word,
    meaning,
    sentence,
    language: "English"
  });

  document.getElementById("vaultPopupForm").remove();
  alert("Saved to Vocabulary Vault");
}

const observer = new MutationObserver(() => {
  injectAddButton();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});