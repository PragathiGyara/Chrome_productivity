// =====================================================
// DASHBOARD VIEW
// =====================================================

function renderDashboardView() {

  const center = document.querySelector(".center");

  center.innerHTML = `

    <!-- 🌟 WORD OF THE DAY -->
    <div id="centerWOTD" class="center-wotd">

        <div class="wotd-main">

            <div class="wotd-title">
                🌟 Word of the Day —
                <span id="centerWOTDLanguage"></span>
            </div>

            <div
              id="centerWOTDWord"
              class="wotd-word"
            ></div>

            <div
              id="centerWOTDMeaning"
              class="wotd-meaning"
            ></div>

            <div
              id="wotdToggleContainer"
              class="wotd-toggle hidden"
            >

                <label class="toggle-switch">

                    <input
                      type="checkbox"
                      id="wotdSentenceToggle"
                    >

                    <span class="slider"></span>

                </label>

                <div class="toggle-label">
                  Show example sentence
                </div>

            </div>

            <div
              id="wotdSentence"
              class="wotd-sentence hidden"
            ></div>
            <div class="wotd-actions">
                <button
                id="wotdLearnBtn"
                class="wotd-action-btn"
                >
                ✓ Learned
                </button>

                <button
                id="wotdVaultBtn"
                class="wotd-action-btn"
                >
                📖 Vault
                </button>
            </div>

        </div>

        <div class="wotd-nav-container">

            <button
              id="wotdPrev"
              class="wotd-nav"
            >
              ◀
            </button>

            <button
              id="wotdNext"
              class="wotd-nav"
            >
              ▶
            </button>

        </div>

    </div>

    <!-- HEADER -->
    <div class="center-header">
        <div class="dashboard-switcher">
            <button
              id="dashboardPrevBtn"
              class="dashboard-nav-btn"
            >
              ◀
            </button>
            <h2 id="dashboardTitle">
              My Tracks
            </h2>
            <button
              id="dashboardNextBtn"
              class="dashboard-nav-btn"
            >
              ▶
            </button>
        </div>
        <button id="trackSettingsBtn">
          ⚙
        </button>
    </div>
    <!-- DYNAMIC DASHBOARD CONTENT -->
    <div id="dashboardContent"></div>
  `;

  renderCurrentDashboardPage();

  renderWordOfTheDay();

  attachDashboardEvents();
}



function renderCurrentDashboardPage() {

  const page =
    dashboardPages[currentDashboardPage];

  const content =
    document.getElementById("dashboardContent");

  const title =
    document.getElementById("dashboardTitle");

  if (!content || !title) return;

  const settingsBtn =
    document.getElementById("trackSettingsBtn");

  // =============================
  // TRACKS PAGE
  // =============================

  if (page === "tracks") {

    settingsBtn?.classList.remove("hidden");

    title.textContent = "My Tracks";

    content.innerHTML = `
      <div id="trackGrid" class="grid"></div>
    `;

    renderTracks();
  }

  // =============================
  // PROJECTS PAGE
  // =============================

  else if (page === "projects") {

    title.textContent = "Projects";

    settingsBtn?.classList.add("hidden");

    content.innerHTML = `

      <div class="projects-header">

        <button
          id="addProjectBtn"
          class="primary-btn"
        >
          + Add Project
        </button>

      </div>

      <div id="projectsList"></div>
    `;

    renderProjectsView();
  }
}

/* =====================================================
   DASHBOARD EVENTS
===================================================== */

function attachDashboardEvents() {

  document
    .getElementById("trackSettingsBtn")
    ?.addEventListener("click", () => {

      openModal("trackSettingsModal");

      renderTrackList();
    });

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
    document
      .getElementById("dashboardNextBtn")
      ?.addEventListener("click", () => {

        currentDashboardPage =
          (currentDashboardPage + 1)
          % dashboardPages.length;

        renderCurrentDashboardPage();
      });

    document
      .getElementById("dashboardPrevBtn")
      ?.addEventListener("click", () => {

        currentDashboardPage =
          (
            currentDashboardPage - 1 +
            dashboardPages.length
          ) % dashboardPages.length;

        renderCurrentDashboardPage();
      });
}


/* =====================================================
   VIEW REFRESH
===================================================== */

function refreshCurrentView() {

  if (currentView === "dashboard") {

    renderDashboardView();

  } else if (currentView === "track") {

    renderTrackWorkspace();
  }
}