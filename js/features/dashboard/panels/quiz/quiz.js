// =====================================================
// VOCABULARY QUIZ
//
// Responsibilities:
// - Open / close quiz modal
// - Show quiz home screen
// - Start quiz
// - Render quiz questions
// - Show quiz history
//
// Future:
// - Score tracking
// - MCQ generation
// - Quiz results
// - Quiz analytics
// =====================================================



// =====================================================
// QUIZ STATE
// =====================================================

let currentQuizType = null;
let selectedQuizLanguage = "All";

let quizWords = [];
let currentQuizIndex = 0;


// =====================================================
// OPEN QUIZ
// =====================================================

function openQuiz() {

  const modal =
    document.getElementById("quizModal");

  if (!modal) return;

  modal.classList.remove("hidden");

  renderQuizHome();
}



// =====================================================
// CLOSE QUIZ
// =====================================================

function closeQuiz() {

  const modal =
    document.getElementById("quizModal");

  if (!modal) return;

  modal.classList.add("hidden");
}



// =====================================================
// QUIZ HOME SCREEN
// =====================================================

function renderQuizHome() {

  const content =
    document.getElementById("quizContent");

  if (!content) return;

  content.innerHTML = `
    <div class="quiz-home">

      <h3>Choose Quiz Type</h3>

      <label>
        <input
          type="radio"
          name="quizType"
          value="wordToMeaning"
          checked
        >
        Word → Meaning
      </label>

      <br><br>

      <label>
        <input
          type="radio"
          name="quizType"
          value="meaningToWord"
        >
        Meaning → Word
      </label>

      <br><br>

      <h3>Choose Languages</h3>

      <div id="quizLanguageContainer">
        Loading...
      </div>

      <br>

      <button
        id="startQuizBtn"
        disabled
      >
        Start Quiz
      </button>

      <button
        id="viewQuizHistoryBtn"
      >
        View Previous Quizzes
      </button>

    </div>
  `;

  chrome.storage.local.get(
    ["vocabularyWords"],
    result => {

      const words =
        result.vocabularyWords || [];

      const languages =
        [...new Set(
          words.map(
            w => w.language
          )
        )]
        .filter(Boolean)
        .sort();

      const container =
        document.getElementById(
          "quizLanguageContainer"
        );

      if (!languages.length) {

        container.innerHTML =
          "<p>No languages found</p>";

        return;
      }

      container.innerHTML = `

        <label
          style="
            display:block;
            margin-bottom:10px;
            font-weight:600;
          "
        >
          <input
            type="checkbox"
            id="allLanguagesCheckbox"
          >
          All Languages
        </label>

        ${languages.map(language => `
          <label
            style="
              display:block;
              margin-bottom:6px;
            "
          >
            <input
              type="checkbox"
              class="quiz-language-checkbox"
              value="${language}"
            >
            ${language}
          </label>
        `).join("")}
      `;

      const startBtn =
        document.getElementById(
          "startQuizBtn"
        );

      const allCheckbox =
        document.getElementById(
          "allLanguagesCheckbox"
        );

      const languageCheckboxes =
        document.querySelectorAll(
          ".quiz-language-checkbox"
        );

      function updateStartButton() {

        const quizTypeSelected =
          document.querySelector(
            'input[name="quizType"]:checked'
          );

        const languageSelected =
          document.querySelector(
            ".quiz-language-checkbox:checked"
          );

        startBtn.disabled =
          !quizTypeSelected ||
          !languageSelected;
      }

      // ====================================
      // ALL LANGUAGES
      // ====================================

      allCheckbox.addEventListener(
        "change",
        () => {

          languageCheckboxes.forEach(
            checkbox => {
              checkbox.checked =
                allCheckbox.checked;
            }
          );

          updateStartButton();
        }
      );

      // ====================================
      // INDIVIDUAL LANGUAGES
      // ====================================

      languageCheckboxes.forEach(
        checkbox => {

          checkbox.addEventListener(
            "change",
            () => {

              const checkedCount =
                [
                  ...languageCheckboxes
                ].filter(
                  cb => cb.checked
                ).length;

              if (
                checkedCount !==
                languageCheckboxes.length
              ) {

                allCheckbox.checked =
                  false;
              }

              else {

                allCheckbox.checked =
                  true;
              }

              updateStartButton();
            }
          );

        }
      );

      // ====================================
      // QUIZ TYPE
      // ====================================

      document
        .querySelectorAll(
          'input[name="quizType"]'
        )
        .forEach(radio => {

          radio.addEventListener(
            "change",
            updateStartButton
          );

        });

      updateStartButton();
    }
  );

  document
    .getElementById("startQuizBtn")
    ?.addEventListener(
      "click",
      startQuiz
    );

  document
    .getElementById("viewQuizHistoryBtn")
    ?.addEventListener(
      "click",
      showQuizHistory
    );
}


// =====================================================
// START QUIZ
// =====================================================

function startQuiz() {

  const selectedType =
    document.querySelector(
      'input[name="quizType"]:checked'
    );

  if (!selectedType) return;

  currentQuizType =
    selectedType.value;

  const selectedLanguages =
    [
      ...document.querySelectorAll(
        ".quiz-language-checkbox:checked"
      )
    ]
    .map(
      checkbox => checkbox.value
    );

  if (
    selectedLanguages.length === 0
  ) {

    alert(
      "Please select at least one language."
    );

    return;
  }

  chrome.storage.local.get(
    ["vocabularyWords"],
    result => {

      quizWords =
        (result.vocabularyWords || [])
        .filter(word =>
          selectedLanguages.includes(
            word.language
          )
        );

      if (!quizWords.length) {

        const content =
          document.getElementById(
            "quizContent"
          );

        content.innerHTML = `
          <h3>No words found</h3>

          <p>
            No words available for the
            selected languages.
          </p>

          <button
            id="backToQuizHomeBtn"
          >
            Back
          </button>
        `;

        document
          .getElementById(
            "backToQuizHomeBtn"
          )
          .addEventListener(
            "click",
            renderQuizHome
          );

        return;
      }

      currentQuizIndex = 0;

      renderQuizQuestion();
    }
  );
}


// =====================================================
// RENDER QUESTION
// =====================================================

function renderQuizQuestion() {

  const content =
    document.getElementById("quizContent");

  if (!content) return;

  const question =
    generateQuestion();

  if (!question) {

    content.innerHTML = `
      <h3>
        No learned words yet
      </h3>

      <p>
        Mark some words as learned
        before taking quizzes.
      </p>

      <button id="backToQuizHomeBtn">
        Back
      </button>
    `;

    document
      .getElementById("backToQuizHomeBtn")
      .addEventListener(
        "click",
        renderQuizHome
      );

    return;
  }

  const options =
    generateOptions(question);

  renderMCQQuestion(
    question,
    options
  );
}

// =====================================================
// GENERATE QUESTION
// =====================================================

function generateQuestion() {

  const learnedWords =
    quizWords.filter(
      word => word.status === "learned"
    );

  if (!learnedWords.length) {
    return null;
  }

  return learnedWords[
    Math.floor(
      Math.random() *
      learnedWords.length
    )
  ];
}


// =====================================================
// GENERATE OPTIONS
// =====================================================

function generateOptions(question) {

  const options = [];

  options.push(question);

  const remainingWords =
    quizWords.filter(
      word =>
        word.word !== question.word
    );

  while (
    options.length < 4 &&
    remainingWords.length
  ) {

    const randomIndex =
      Math.floor(
        Math.random() *
        remainingWords.length
      );

    options.push(
      remainingWords.splice(
        randomIndex,
        1
      )[0]
    );
  }

  return shuffleArray(options);
}


// =====================================================
// SHUFFLE
// =====================================================

function shuffleArray(array) {

  const copy = [...array];

  for (
    let i = copy.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [copy[i], copy[j]] =
      [copy[j], copy[i]];
  }

  return copy;
}


// =====================================================
// RENDER MCQ
// =====================================================

function renderMCQQuestion(
  question,
  options
) {

  const content =
    document.getElementById("quizContent");

  const questionText =
    currentQuizType === "wordToMeaning"
      ? question.word
      : question.meaning;

  const optionsHTML =
    options.map(option => {

      const label =
        currentQuizType === "wordToMeaning"
          ? option.meaning
          : option.word;

      return `
        <button
          class="quiz-option"
          data-answer="${option.word}"
        >
          ${label}
        </button>
      `;
    }).join("");

  content.innerHTML = `
    <div class="quiz-question-container">

      <h3>
        ${
          currentQuizType === "wordToMeaning"
            ? "What does this word mean?"
            : "Which word matches this meaning?"
        }
      </h3>

      <div class="quiz-question">
        ${questionText}
      </div>

      <div class="quiz-options">
        ${optionsHTML}
      </div>

    </div>
  `;

  content
    .querySelectorAll(".quiz-option")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const isCorrect =
            button.dataset.answer ===
            question.word;

          alert(
            isCorrect
              ? "Correct!"
              : `Wrong!\nCorrect answer: ${question.word}`
          );

          renderQuizQuestion();
        }
      );

    });
}



// =====================================================
// QUIZ HISTORY
// =====================================================

function showQuizHistory() {

  const content =
    document.getElementById("quizContent");

  if (!content) return;

  content.innerHTML = `

    <h3>
      Previous Quizzes
    </h3>

    <p>
      No quizzes taken yet.
    </p>

    <button id="backToQuizHomeBtn">
      Back
    </button>

  `;

  document
    .getElementById("backToQuizHomeBtn")
    ?.addEventListener(
      "click",
      renderQuizHome
    );
}



// =====================================================
// EVENT BINDING
// =====================================================

function attachQuizEvents() {

  document
    .getElementById("takeQuizBtn")
    ?.addEventListener(
      "click",
      openQuiz
    );

  document
    .getElementById("closeQuizBtn")
    ?.addEventListener(
      "click",
      closeQuiz
    );
}