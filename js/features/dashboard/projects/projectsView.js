// =====================================================
// PROJECT TRACKER VIEW
//
// Responsibilities:
// - Render project tracker UI
// - Render project rows
// - Quick time logging
// - Date selection
//
// Delegates:
// - Analytics → projectAnalytics.js
// - Project Actions → projectActions.js
// - Project Modal → projectModal.js
// =====================================================


// =====================================================
// TRACKER STATE
// =====================================================

let selectedProjectDate =
  getLocalDateKey();

let isProjectsTrackerCollapsed =
  true;

let isHourDistributionCollapsed =
  false;

let isAnalyticsCollapsed =
  true;

// =====================================================
// RENDER PROJECTS VIEW
// =====================================================

function renderProjectsView() {

  const container =
    document.getElementById(
      "dashboardContent"
    );

  if (!container) return;

  container.innerHTML = `

    <!-- =============================
         PROJECT TRACKER
    ============================== -->

    <div
      class="projects-tracker-section"
    >

      <div
        class="projects-tracker-header"
      >

        <div
          class="projects-section-title
                 tracker-collapse-toggle"
          id="trackerCollapseToggle"
        >

          <span
            class="tracker-collapse-icon"
          >
            ${
              isProjectsTrackerCollapsed
                ? "▶"
                : "▼"
            }
          </span>

          Project Time Tracker

        </div>

        ${
          !isProjectsTrackerCollapsed
            ? `
              <div
                class="projects-date-picker"
              >

                <span
                  class="projects-date-icon"
                >
                  📅
                </span>

                <input
                  type="date"
                  id="projectsDateInput"
                  value="${selectedProjectDate}"
                />

              </div>
            `
            : ""
        }

      </div>

      <div
        id="projectsTrackerContent"
        class="${
          isProjectsTrackerCollapsed
            ? "tracker-collapsed"
            : ""
        }"
      >

        <div id="projectsList"></div>

      </div>

    </div>


    <!-- =============================
         HOUR DISTRIBUTION
    ============================== -->

    <div
      class="projects-hour-distribution-section"
    >

      <div
        class="projects-tracker-header"
      >

        <div
          class="projects-section-title
                 tracker-collapse-toggle"
          id="hourDistributionCollapseToggle"
        >

          <span
            class="tracker-collapse-icon"
          >
            ${
              isHourDistributionCollapsed
                ? "▶"
                : "▼"
            }
          </span>

          Hour Distribution

        </div>

        ${
          !isHourDistributionCollapsed
            ? `
              <div
                class="projects-selected-date"
              >

                <span>
                  📅
                </span>

                <span>
                  ${selectedProjectDate}
                </span>

              </div>
            `
            : ""
        }

      </div>

      <div
        id="hourDistributionContent"
        class="${
          isHourDistributionCollapsed
            ? "tracker-collapsed"
            : ""
        }"
      >

        <div
          class="hour-distribution-grid"
        >

          <!-- Expected -->

          <div
            class="hour-distribution-card"
          >

            <div
              class="hour-distribution-header"
            >

              <div
                class="hour-distribution-title"
              >
                Expected Time
              </div>

              <div
                id="expectedHoursTotal"
                class="hour-distribution-total"
              >
                0h
              </div>

            </div>

            <div
              class="hour-distribution-body"
            >

              <canvas
                id="expectedHourDistributionCanvas"
                width="260"
                height="260"
              ></canvas>

              <div
                id="expectedHourDistributionLegend"
                class="hour-distribution-legend"
              ></div>

            </div>

          </div>

          <!-- Actual -->

          <div
            class="hour-distribution-card"
          >

            <div
              class="hour-distribution-header"
            >

              <div
                class="hour-distribution-title"
              >
                Actual Time
              </div>

              <div
                id="actualHoursTotal"
                class="hour-distribution-total"
              >
                0h
              </div>

            </div>

            <div
              class="hour-distribution-body"
            >

              <canvas
                id="actualHourDistributionCanvas"
                width="260"
                height="260"
              ></canvas>

              <div
                id="actualHourDistributionLegend"
                class="hour-distribution-legend"
              ></div>

            </div>

          </div>

        </div>

      </div>

    </div>


    <!-- =============================
         ANALYTICS
    ============================== -->

    <div
      class="projects-analytics-section"
    >

      <div
        class="projects-analytics-header"
      >

        <div
          class="projects-section-title
                 tracker-collapse-toggle"
          id="analyticsCollapseToggle"
        >

          <span
            class="tracker-collapse-icon"
          >
            ${
              isAnalyticsCollapsed
                ? "▶"
                : "▼"
            }
          </span>

          Analytics

        </div>

        ${
          !isAnalyticsCollapsed
            ? `
              <select
                id="analyticsRangeSelect"
                class="analytics-range-select"
              >

                <option value="thisWeek">
                  This Week
                </option>

                <option value="previousWeek">
                  Previous Week
                </option>

                <option value="thisMonth">
                  This Month
                </option>

                <option value="overall">
                  Overall
                </option>

              </select>
            `
            : ""
        }

      </div>

      <div
        id="analyticsContent"
        class="${
          isAnalyticsCollapsed
            ? "tracker-collapsed"
            : ""
        }"
      >

        <div
          class="analytics-tabs"
        >

          <button
            class="analytics-tab active"
            data-view="overview"
          >
            Overview
          </button>

          <button
            class="analytics-tab"
            data-view="trend"
          >
            Trend
          </button>

          <button
            class="analytics-tab"
            data-view="distribution"
          >
            Distribution
          </button>

          <button
            class="analytics-tab"
            data-view="insights"
          >
            Insights
          </button>

        </div>

        <div
          id="analyticsDateRange"
          class="analytics-date-range"
        ></div>

        <div
          id="trendProjectFilterContainer"
        ></div>

        <div
          id="projectsAnalyticsContent"
        ></div>

      </div>

    </div>

  `;

  renderProjects();

  renderProjectsAnalytics();

  renderHourDistribution();

  attachProjectEvents();

}


// =====================================================
// RENDER PROJECT ROWS
// =====================================================

// =====================================================
// GET PROJECTS FOR SELECTED DATE
// =====================================================

function getProjectsForSelectedDate() {

  const allProjects =
    tracks.flatMap(
      track =>
        (track.projects || [])
          .filter(
            project =>
              String(project.id) !==
              "general"
          )
          .map(
            project => ({
              ...project,

              trackId:
                track.id,

              trackName:
                track.name,

              trackIcon:
                track.icon
            })
          )
    );


  // =====================================
  // SORT BY GLOBAL PROJECT ORDER
  // =====================================

  allProjects.sort(
    (a, b) => {

      const aOrder =
        Number.isFinite(
          Number(a.sortOrder)
        )
          ? Number(a.sortOrder)
          : Number.MAX_SAFE_INTEGER;


      const bOrder =
        Number.isFinite(
          Number(b.sortOrder)
        )
          ? Number(b.sortOrder)
          : Number.MAX_SAFE_INTEGER;


      return (
        aOrder -
        bOrder
      );

    }
  );


  // =====================================
  // DATE FILTER
  // =====================================

  return allProjects.filter(
    project => {

      const createdDateKey =
        getDateKey(
          new Date(
            project.createdAt
          )
        );


      if (
        selectedProjectDate <
        createdDateKey
      ) {

        return false;

      }


      const completedEntry =
        project.statusHistory?.find(
          entry =>
            entry.status ===
            "completed"
        );


      if (
        completedEntry &&
        selectedProjectDate >
          completedEntry.date
      ) {

        return false;

      }


      return true;

    }
  );

}

// =====================================================
// RENDER PROJECT ROWS
// =====================================================

function renderProjects() {

  if (
    isProjectsTrackerCollapsed
  ) {
    return;
  }


  const list =
    document.getElementById(
      "projectsList"
    );

  if (!list) return;


  list.innerHTML = "";


  getProjectsForSelectedDate()
    .forEach(project => {

      const todayKey =
        selectedProjectDate;


      // =====================================
      // TODAY'S HOURS
      // =====================================

      const todayHours =
        project.logs?.[
          todayKey
        ] || 0;


      // =====================================
      // PROGRESS
      // =====================================

      const progress =

        project.targetHoursPerDay > 0

        ? Math.min(
            (
              todayHours /
              project.targetHoursPerDay
            ) * 100,
            100
          )

        : 0;


      // =====================================
      // COMPLETED STATUS
      // =====================================

      const completedEntry =
        project.statusHistory?.find(
          entry =>
            entry.status ===
            "completed"
        );


      const isCompleted =
        !!completedEntry;


      // =====================================
      // CREATE ROW
      // =====================================

      const row =
        document.createElement(
          "div"
        );


      row.classList.add(
        "project-row"
      );


      // =====================================
      // COMPLETED CLASS
      // =====================================

      if (
        isCompleted
      ) {

        row.classList.add(
          "completed-project-row"
        );

      }


      // =====================================
      // DRAG ENABLED
      //
      // Active and paused projects can
      // be reordered.
      //
      // Completed projects remain fixed.
      // =====================================

      if (
        !isCompleted
      ) {

        row.draggable = true;

      }


      // =====================================
      // PAUSED CLASS
      // =====================================

      if (
        project.status ===
        "paused"
      ) {

        row.classList.add(
          "paused-project-row"
        );

      }


      // =====================================
      // PROJECT ID
      // =====================================

      row.dataset.projectId =
        project.id;


      // =====================================
      // ROW HTML
      // =====================================

      row.innerHTML = `

        <!-- =================================
             PROJECT INFORMATION
        ================================== -->

        <div
          class="project-info"
        >

          <div
            class="project-name"
          >

            ${project.name}

            ${
              project.status ===
              "paused"

              ? `
                <span
                  class="project-paused-tag"
                >
                  Paused
                </span>
              `

              : ""
            }


            ${
              isCompleted

              ? `
                <span
                  class="project-completed-tag"
                >
                  Completed
                </span>
              `

              : ""
            }

          </div>


          <div
            class="project-hours"
          >

            ${formatHours(todayHours)}
            /
            ${formatHours(
              project.targetHoursPerDay
            )}

          </div>

        </div>


        <!-- =================================
             VISUAL PROGRESS BAR

             This is ONLY visual.

             There is NO slider behaviour.
             There is NO event listener.
        ================================== -->

        <div
          class="project-progress"
        >

          <div
            class="project-progress-fill"
            style="
              width: ${progress}%;
            "
          >
          </div>

        </div>


        <!-- =================================
             PROJECT ACTIONS
        ================================== -->

        <div
          class="project-actions"
        >

          ${
            !isCompleted

            ? `

              <!-- ADD TIME -->

              <button
                class="project-add-btn"
              >
                + Add
              </button>


              ${
                project.status !==
                "paused"

                ? `

                  <!-- PAUSE -->

                  <button
                    class="project-pause-btn"
                  >
                    Pause
                  </button>


                  <!-- COMPLETE -->

                  <button
                    class="project-complete-btn"
                  >
                    Complete
                  </button>

                `

                : `

                  <!-- RESUME -->

                  <button
                    class="project-resume-btn"
                  >
                    Resume
                  </button>

                `
              }

            `

            : ""
          }


          <!-- DELETE -->

          <button
            class="project-delete-btn"
          >
            Delete
          </button>

        </div>

      `;


      // =====================================
      // ROW CLICK → EDIT PROJECT
      // =====================================
      //
      // Clicking the project row opens
      // the Edit Project modal.
      //
      // Clicking a button does NOT open
      // the Edit modal because buttons have
      // their own actions.
      // =====================================

      row.addEventListener(
        "click",
        e => {

          if (
            e.target.closest(
              "button"
            )
          ) {

            return;

          }


          openEditProjectModal(
            project.id
          );

        }
      );


      // =====================================
      // PROJECT ACTIONS
      // =====================================

      attachProjectRowEvents(
        row,
        project,
        todayKey
      );


      // =====================================
      // ADD TO DOM
      // =====================================

      list.appendChild(
        row
      );

    });


  // =====================================
  // INITIALIZE DRAG & DROP
  // =====================================

  initializeProjectDragDrop();

}
// =====================================================
// PROJECT ROW EVENTS
// =====================================================

function attachProjectRowEvents(
  row,
  project,
  todayKey
) {

  // =====================================
  // PAUSED PROJECT
  // =====================================

  if (
    project.status ===
    "paused"
  ) {

    row
      .querySelectorAll(
        ".project-add-btn"
      )
      .forEach(btn => {

        btn.disabled = true;

        btn.classList.add(
          "disabled-project-btn"
        );

      });

  }


  // =====================================
  // ADD TIME
  // =====================================

  row
    .querySelector(
      ".project-add-btn"
    )
    ?.addEventListener(
      "click",
      () => {

        if (
          project.status ===
          "paused"
        ) {

          return;

        }


        openProjectTimeLogModal(
          project,
          todayKey
        );

      }
    );


  // =====================================
  // DELETE
  // =====================================

  row
    .querySelector(
      ".project-delete-btn"
    )
    ?.addEventListener(
      "click",
      () =>
        deleteProject(
          project.id
        )
    );


  // =====================================
  // PAUSE
  // =====================================

  row
    .querySelector(
      ".project-pause-btn"
    )
    ?.addEventListener(
      "click",
      () =>
        pauseProject(
          project.id
        )
    );


  // =====================================
  // RESUME
  // =====================================

  row
    .querySelector(
      ".project-resume-btn"
    )
    ?.addEventListener(
      "click",
      () =>
        resumeProject(
          project.id
        )
    );


  // =====================================
  // COMPLETE
  // =====================================

  row
    .querySelector(
      ".project-complete-btn"
    )
    ?.addEventListener(
      "click",
      () =>
        completeProject(
          project.id
        )
    );

}


// =====================================================
// PROJECT SLIDER
// =====================================================

let draggedProject = null;

let draggedDateKey = null;

let draggedProgressBar = null;

let draggedRow = null;


// =====================================================
// START DRAG
// =====================================================

function startProjectSliderDrag(
  e,
  project,
  todayKey,
  row
) {

  draggedProject =
    project;

  draggedDateKey =
    todayKey;

  draggedProgressBar =
    row.querySelector(
      ".project-progress"
    );

  draggedRow =
    row;

  updateProjectSlider(e);

  document.addEventListener(
    "mousemove",
    updateProjectSlider
  );

  document.addEventListener(
    "mouseup",
    finishProjectSliderDrag
  );

}


// =====================================================
// UPDATE SLIDER
// =====================================================

function updateProjectSlider(
  e
) {

  if (
    !draggedProject ||
    !draggedProgressBar ||
    !draggedRow
  ) {
    return;
  }

  const rect =
    draggedProgressBar.getBoundingClientRect();

  let percent =
    (
      (e.clientX - rect.left) /
      rect.width
    ) * 100;

  percent =
    Math.max(
      0,
      Math.min(
        100,
        percent
      )
    );

  const hours =
    (
      percent / 100
    ) *
    draggedProject.targetHoursPerDay;

  if (
    !draggedProject.logs
  ) {

    draggedProject.logs = {};

  }

  draggedProject.logs[
    draggedDateKey
  ] = hours;

  // Update fill

  draggedRow
    .querySelector(
      ".project-progress-fill"
    )
    .style.width =
      `${percent}%`;

  // Update hours text

  draggedRow
    .querySelector(
      ".project-hours"
    )
    .textContent =

      `${formatHours(hours)} / ${formatHours(draggedProject.targetHoursPerDay)}`;

}


// =====================================================
// FINISH DRAG
// =====================================================

function finishProjectSliderDrag() {

  document.removeEventListener(
    "mousemove",
    updateProjectSlider
  );

  document.removeEventListener(
    "mouseup",
    finishProjectSliderDrag
  );

  refreshProjectsUI();

  draggedProject = null;

  draggedDateKey = null;

  draggedProgressBar = null;

  draggedRow = null;

}


// =====================================================
// PROJECT EVENTS
// =====================================================

function attachProjectEvents() {

  document
    .getElementById(
      "projectsDateInput"
    )
    ?.addEventListener(
      "change",
      (e) => {

        selectedProjectDate =
          e.target.value;

        renderProjectsView();

      }
    );

  document
    .getElementById(
      "analyticsRangeSelect"
    )
    ?.addEventListener(
      "change",
      (e) => {

        currentAnalyticsRange =
          e.target.value;

        renderProjectsStats();
        renderProjectsAnalytics();
      }
    );

  document
    .getElementById(
      "trackerCollapseToggle"
    )
    ?.addEventListener(
      "click",
      () => {

        isProjectsTrackerCollapsed =
          !isProjectsTrackerCollapsed;

        renderProjectsView();

      }
    );

  document
    .getElementById(
      "hourDistributionCollapseToggle"
    )
    ?.addEventListener(
      "click",
      () => {

        isHourDistributionCollapsed =
          !isHourDistributionCollapsed;

        renderProjectsView();

      }
    );

  document
    .getElementById(
      "analyticsCollapseToggle"
    )
    ?.addEventListener(
      "click",
      () => {

        isAnalyticsCollapsed =
          !isAnalyticsCollapsed;

        renderProjectsView();

      }
    );

  document
    .querySelectorAll(
      ".analytics-tab"
    )
    .forEach(tab => {

      tab.addEventListener(
        "click",
        () => {

          currentAnalyticsView =
            tab.dataset.view;

          document
            .querySelectorAll(
              ".analytics-tab"
            )
            .forEach(btn => {

              btn.classList.remove(
                "active"
              );

            });

          tab.classList.add(
            "active"
          );

          renderProjectsAnalytics();
        }
      );

    });

  document.addEventListener(
    "change",
    (e) => {

      if (
        e.target.id !==
        "trendProjectFilter"
      ) {

        return;

      }

      currentTrendProjectFilter =
        e.target.value;

      renderTrendAnalytics();

    }
  );

  document.addEventListener(
    "click",
    (e) => {

      const chip =
        e.target.closest(
          ".trend-project-chip"
        );

      if (!chip) {

        return;

      }

      selectedTrendProjectId =
        Number(
          chip.dataset.projectId
        );

      projects.find(project =>

        String(project.id) ===
        chip.dataset.projectId

      );

      renderTrendAnalytics();

    }
  );

}