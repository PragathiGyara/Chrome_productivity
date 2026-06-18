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

      <h3>
        Choose Quiz Type
      </h3>

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

      <button id="startQuizBtn">
        Start Quiz
      </button>

      <button id="viewQuizHistoryBtn">
        View Previous Quizzes
      </button>

    </div>
  `;

  // Start Quiz

  document
    .getElementById("startQuizBtn")
    ?.addEventListener(
      "click",
      startQuiz
    );

  // History

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

  chrome.storage.local.get(
    ["vocabularyWords"],
    result => {

      quizWords =
        (result.vocabularyWords || [])
          .filter(
            word =>
              word.status !== "learned"
          );

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

  // No words

  if (!quizWords.length) {

    content.innerHTML = `

      <h3>
        No words available
      </h3>

      <p>
        Add some words to the Vocabulary Vault first.
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

    return;
  }

  const word =
    quizWords[currentQuizIndex];



  // ---------------------------------------------------
  // WORD → MEANING
  // ---------------------------------------------------

  if (
    currentQuizType ===
    "wordToMeaning"
  ) {

    content.innerHTML = `

      <h3>
        What does this word mean?
      </h3>

      <div class="quiz-question">
        ${word.word}
      </div>

    `;

    return;
  }



  // ---------------------------------------------------
  // MEANING → WORD
  // ---------------------------------------------------

  if (
    currentQuizType ===
    "meaningToWord"
  ) {

    content.innerHTML = `

      <h3>
        Which word matches this meaning?
      </h3>

      <div class="quiz-question">
        ${word.meaning}
      </div>

    `;

  }
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