// =====================================================
// DASHBOARD TEMPLATE
// =====================================================

function getDashboardTemplate() {

  return `

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