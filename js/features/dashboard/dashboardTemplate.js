// =====================================================
// DASHBOARD TEMPLATE
// =====================================================

function getDashboardTemplate() {

  return `

    <!-- 🌟 WORD OF THE DAY -->
    <div id="centerWOTD" class="center-wotd">

        <div class="wotd-main">

            <div class="wotd-header">

                <div class="wotd-title">
                    🌟 Word of the Day —
                    <span id="centerWOTDLanguage"></span>
                </div>

                <div class="wotd-quiz-toggle">

                    <span class="toggle-label">
                        Guess Word
                    </span>

                    <label class="toggle-switch">

                        <input
                            type="checkbox"
                            id="wotdGuessModeToggle"
                        >

                        <span class="slider"></span>

                    </label>

                </div>

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

            <button
                id="wotdRevealBtn"
                class="wotd-action-btn hidden"
            >
                Show Word
            </button>

            <div class="wotd-footer">

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

                <div class="wotd-nav-inline">

                    <button
                      id="wotdPrev"
                      class="wotd-nav"
                    >
                      ←
                    </button>

                    <button
                      id="wotdNext"
                      class="wotd-nav"
                    >
                      →
                    </button>

                </div>

            </div>

        </div>

    </div>

    <!-- HEADER -->
    <div class="center-header">

        <button
          id="dashboardPrevBtn"
          class="dashboard-nav-btn">
          ◀
        </button>

        <h2 id="dashboardTitle">
          My Tracks
        </h2>

        <button
          id="dashboardNextBtn"
          class="dashboard-nav-btn">
          ▶
        </button>

    </div>

    <div class="dashboard-actions">

        <button id="trackSettingsBtn">
            Manage Tracks
        </button>

    </div>

    <!-- DYNAMIC DASHBOARD CONTENT -->
    <div id="dashboardContent"></div>
  `;
}