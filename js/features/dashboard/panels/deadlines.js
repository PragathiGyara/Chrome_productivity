let globalDeadlineFilter = "unfinished";

// --------------------------
// Render Deadlines
// --------------------------

function formatGlobalDeadlineDate(datetime) {

  const date =
    new Date(datetime);

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }


  const day =
    String(
      date.getDate()
    ).padStart(2, "0");


  const month =
    date.toLocaleString(
      "en-US",
      {
        month: "long"
      }
    );


  const shortMonth =
    month;


  const year =
    String(
      date.getFullYear()
    ).slice(-2);


  const time =
    date.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit"
      }
    );


  return (
    `${day} ${shortMonth} '${year}, ${time}`
  );

}

function renderGlobalDeadlines() {

  const container =
    document.getElementById(
      "globalDeadlineList"
    );

  if (!container) return;

  container.innerHTML = "";


  // =====================================================
  // COLLECT ALL PROJECT DEADLINES
  // =====================================================

  let allDeadlines = [];


  tracks.forEach(track => {

    (track.projects || []).forEach(project => {

      (project.deadlines || []).forEach(deadline => {

        allDeadlines.push({

          deadline,

          track,

          project,

          status:
            getDeadlineStatus(deadline)

        });

      });

    });

  });


  // =====================================================
  // FILTER
  // =====================================================

  if (
    globalDeadlineFilter ===
    "unfinished"
  ) {

    allDeadlines =
      allDeadlines.filter(item =>

        item.status === "upcoming" ||
        item.status === "due-today" ||
        item.status === "missed"

      );

  } else {

    allDeadlines =
      allDeadlines.filter(item => {

        switch (
          globalDeadlineFilter
        ) {

          case "upcoming":

            return (
              item.status === "upcoming" ||
              item.status === "due-today"
            );


          case "missed":

            return (
              item.status === "missed"
            );


          case "finished":

            return (
              item.status === "finished"
            );


          case "cancelled":

            return (
              item.status === "cancelled"
            );


          default:

            return true;

        }

      });

  }


  // =====================================================
  // SORT
  // =====================================================

  allDeadlines.sort(
    (a, b) =>
      new Date(
        a.deadline.datetime
      ) -
      new Date(
        b.deadline.datetime
      )
  );


  // =====================================================
  // RENDER
  // =====================================================

  allDeadlines.forEach(
    ({
      deadline,
      track,
      project,
      status
    }) => {

      const div =
        document.createElement(
          "div"
        );

      div.classList.add(
        "deadline-item"
      );


      div.innerHTML = `

        <div
          class="global-deadline-content"
        >

          <div>

            <strong>
              ${deadline.title}
            </strong>


            <div class="global-deadline-datetime">
              ${
                formatGlobalDeadlineDate(
                  deadline.datetime
                )
              }
            </div>


            <div class="global-deadline-location">

              <span class="global-deadline-track">
                ${track.name}
              </span>

              <span class="global-deadline-separator">
                ·
              </span>

              <span class="global-deadline-project">
                ${project.name}
              </span>

            </div>

          </div>


          <div
            class="deadline-status ${status}"
          >

            ${
              status
                .replace(
                  "-",
                  " "
                )
                .toUpperCase()
            }

          </div>

        </div>

      `;


      // ===================================================
      // OPEN EDIT FORM
      // ===================================================

      div.addEventListener(
        "click",
        () => {

          openEditDeadlineForm(
            project,
            deadline,
            "global"
          );

        }
      );


      container.appendChild(
        div
      );

    }
  );

}

function openSidebarDeadlineForm() {

  const container =
    document.getElementById(
      "globalDeadlineList"
    );

  if (!container) return;


  // =====================================================
  // PREVENT MULTIPLE FORMS
  // =====================================================

  if (
    container.querySelector(
      ".deadline-form"
    )
  ) {
    return;
  }


  // =====================================================
  // CREATE FORM
  // =====================================================

  const form =
    document.createElement(
      "div"
    );

  form.classList.add(
    "deadline-form"
  );


  const trackOptions =
    tracks.map(track =>

      `<option value="${track.id}">
        ${track.name}
      </option>`

    ).join("");


  form.innerHTML = `

    <input
      type="text"
      id="sidebarTitle"
      placeholder="Deadline name"
    />


    <select
      id="sidebarTrackSelect"
    >

      ${trackOptions}

    </select>


    <select
      id="sidebarProjectSelect"
    >

      <option value="">
        Select Project
      </option>

    </select>


    <div
      class="deadline-datetime-column"
    >

      <input
        type="date"
        id="sidebarDate"
      />

      <input
        type="time"
        id="sidebarTime"
      />

    </div>


    <div
      class="deadline-form-actions"
    >

      <button
        type="button"
        class="neutral-btn"
        id="sidebarTodayBtn"
      >
        Today EOD
      </button>


      <button
        type="button"
        class="primary-btn"
        id="sidebarSaveBtn"
      >
        Save
      </button>


      <button
        type="button"
        class="neutral-btn"
        id="sidebarCancelBtn"
      >
        Cancel
      </button>

    </div>

  `;


  container.prepend(
    form
  );


  // =====================================================
  // REFERENCES
  // =====================================================

  const titleInput =
    form.querySelector(
      "#sidebarTitle"
    );

  const trackSelect =
    form.querySelector(
      "#sidebarTrackSelect"
    );

  const projectSelect =
    form.querySelector(
      "#sidebarProjectSelect"
    );

  const dateInput =
    form.querySelector(
      "#sidebarDate"
    );

  const timeInput =
    form.querySelector(
      "#sidebarTime"
    );

  const todayBtn =
    form.querySelector(
      "#sidebarTodayBtn"
    );

  const saveBtn =
    form.querySelector(
      "#sidebarSaveBtn"
    );

  const cancelBtn =
    form.querySelector(
      "#sidebarCancelBtn"
    );


  // =====================================================
  // UPDATE PROJECT DROPDOWN
  // =====================================================

  function updateProjectDropdown() {

    const trackId =
      Number(
        trackSelect.value
      );

    const selectedTrack =
      tracks.find(
        track =>
          track.id === trackId
      );


    projectSelect.innerHTML = `
      <option value="">
        Select Project
      </option>
    `;


    if (!selectedTrack) return;


    (selectedTrack.projects || [])
      .forEach(project => {

        const option =
          document.createElement(
            "option"
          );

        option.value =
          project.id;

        option.textContent =
          project.name;

        projectSelect.appendChild(
          option
        );

      });


    // Automatically select General
    const generalProject =
      (selectedTrack.projects || [])
        .find(
          project =>
            String(project.id) ===
            "general"
        );

    if (generalProject) {

      projectSelect.value =
        generalProject.id;

    }

  }


  // =====================================================
  // INITIAL PROJECT LIST
  // =====================================================

  updateProjectDropdown();


  // =====================================================
  // TRACK CHANGE
  // =====================================================

  trackSelect.addEventListener(
    "change",
    () => {

      updateProjectDropdown();

    }
  );


  // =====================================================
  // TODAY EOD
  // =====================================================

  todayBtn.addEventListener(
    "click",
    () => {

      const now =
        new Date();


      const yyyy =
        now.getFullYear();

      const mm =
        String(
          now.getMonth() + 1
        ).padStart(
          2,
          "0"
        );

      const dd =
        String(
          now.getDate()
        ).padStart(
          2,
          "0"
        );


      dateInput.value =
        `${yyyy}-${mm}-${dd}`;

      timeInput.value =
        "23:59";

    }
  );


  // =====================================================
  // SAVE
  // =====================================================

  saveBtn.addEventListener(
    "click",
    () => {

      const title =
        titleInput.value.trim();

      const date =
        dateInput.value;

      const time =
        timeInput.value;

      const trackId =
        Number(
          trackSelect.value
        );

      const projectId =
        projectSelect.value;


      if (
        !title ||
        !date ||
        !time ||
        !projectId
      ) {

        alert(
          "All fields required."
        );

        return;

      }


      const datetime =
        new Date(
          `${date}T${time}`
        );


      if (
        isNaN(
          datetime.getTime()
        )
      ) {

        alert(
          "Invalid date/time."
        );

        return;

      }


      const selectedTrack =
        tracks.find(
          track =>
            track.id === trackId
        );


      if (!selectedTrack) return;


      const selectedProject =
        (selectedTrack.projects || [])
          .find(
            project =>
              String(project.id) ===
              String(projectId)
          );


      if (!selectedProject) return;


      if (
        !Array.isArray(
          selectedProject.deadlines
        )
      ) {

        selectedProject.deadlines =
          [];

      }


      // =================================================
      // DUPLICATE CHECK
      // =================================================

      const alreadyExists =
        selectedProject.deadlines.some(
          deadline =>
            deadline.title === title &&
            deadline.datetime ===
              datetime.toISOString()
        );


      if (alreadyExists) {

        alert(
          "This deadline already exists."
        );

        return;

      }


      // =================================================
      // CREATE DEADLINE
      // =================================================

      selectedProject.deadlines.push({

        id:
          Date.now(),

        title,

        datetime:
          datetime.toISOString(),

        status:
          "upcoming"

      });


      persistTracks();


      // =================================================
      // REFRESH GLOBAL LIST
      // =================================================

      renderGlobalDeadlines();


      // =================================================
      // REFRESH CURRENT WORKSPACE
      // =================================================

      if (
        currentView === "track" &&
        activeTrackId === trackId
      ) {

        const currentProject =
          (
            selectedTrack.projects ||
            []
          ).find(
            project =>
              String(project.id) ===
              String(projectId)
          );

        if (currentProject) {

          renderDeadlines(
            currentProject
          );

        }

      }


      showToast(
        `Deadline "${title}" saved`
      );


      form.remove();

    }
  );


  // =====================================================
  // CANCEL
  // =====================================================

  cancelBtn.addEventListener(
    "click",
    () => {

      form.remove();

    }
  );

}