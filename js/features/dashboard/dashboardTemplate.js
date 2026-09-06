// =====================================================
// DASHBOARD TEMPLATE
// =====================================================

function getDashboardTemplate() {

  return `

    <!-- 🌟 WORD OF THE DAY -->
    <div id="centerWOTD" class="center-wotd">

        <div class="wotd-main">

            <!-- =========================================
                 WOTD HEADER
            ========================================== -->

            <div class="wotd-header">

                <div class="wotd-header-left">

                    <!-- COLLAPSE BUTTON -->

                    <button
                        type="button"
                        id="wotdCollapseBtn"
                        class="wotd-collapse-btn"
                        title="Collapse Word of the Day"
                        aria-label="Collapse Word of the Day"
                    >
                        ▲
                    </button>


                    <!-- TITLE -->

                    <div class="wotd-title">
                        🌟 Word of the Day —
                        <span id="centerWOTDLanguage"></span>
                    </div>

                </div>


                <!-- GUESS WORD TOGGLE -->

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


            <!-- =========================================
                 COLLAPSIBLE WOTD CONTENT
            ========================================== -->

            <div
                id="wotdCollapsibleContent"
                class="wotd-collapsible-content"
            >

                <!-- WORD -->

                <div
                    id="centerWOTDWord"
                    class="wotd-word"
                ></div>


                <!-- MEANING -->

                <div
                    id="centerWOTDMeaning"
                    class="wotd-meaning"
                ></div>


                <!-- SENTENCE TOGGLE -->

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


                <!-- SENTENCE -->

                <div
                    id="wotdSentence"
                    class="wotd-sentence hidden"
                ></div>


                <!-- REVEAL BUTTON -->

                <button
                    id="wotdRevealBtn"
                    class="wotd-action-btn hidden"
                >
                    Show Word
                </button>


                <!-- =====================================
                     FOOTER
                ====================================== -->

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


                    <!-- WOTD PREVIOUS / NEXT -->

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

    </div>


    <!-- ================================================
         DASHBOARD HEADER
    ================================================= -->

    <div class="center-header">

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


    <!-- ================================================
         DASHBOARD ACTIONS
    ================================================= -->

    <div class="dashboard-actions">

        <button id="trackSettingsBtn">
            Manage Tracks
        </button>

    </div>


    <!-- ================================================
         DYNAMIC DASHBOARD CONTENT
    ================================================= -->

    <div id="dashboardContent"></div>

  `;

}