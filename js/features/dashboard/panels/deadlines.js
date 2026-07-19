let globalDeadlineFilter = "unfinished";

// --------------------------
// Render Deadlines
// --------------------------

function renderGlobalDeadlines() {

  const container =
    document.getElementById("globalDeadlineList");

  if (!container) return;

  container.innerHTML = "";

  let allDeadlines = tracks.flatMap(track =>

    (track.deadlines || []).map(dl => ({

      deadline: dl,

      track,

      status: getDeadlineStatus(dl)

    }))

  );

  // --------------------------
  // Filter
  // --------------------------

  if (globalDeadlineFilter === "unfinished") {

    allDeadlines = allDeadlines.filter(item =>

      item.status === "upcoming" ||
      item.status === "due-today" ||
      item.status === "missed"

    );

  } else {

    allDeadlines = allDeadlines.filter(item => {

      switch (globalDeadlineFilter) {

        case "upcoming":
          return (
            item.status === "upcoming" ||
            item.status === "due-today"
          );

        case "missed":
          return item.status === "missed";

        case "finished":
          return item.status === "finished";

        case "cancelled":
          return item.status === "cancelled";

        default:
          return true;

      }

    });

  }

  // --------------------------
  // Sort
  // --------------------------

  allDeadlines.sort(
    (a, b) =>
      new Date(a.deadline.datetime) -
      new Date(b.deadline.datetime)
  );

  // --------------------------
  // Render
  // --------------------------

  allDeadlines.forEach(({ deadline, track, status }) => {

    const div = document.createElement("div");

    div.classList.add("deadline-item");

    div.innerHTML = `

      <div class="global-deadline-content">

        <div>

          <strong>${deadline.title}</strong>

          <div>
            ${new Date(deadline.datetime).toLocaleString()}
          </div>

          <small>${track.name}</small>

        </div>

        <div class="deadline-status ${status}">
          ${status.replace("-", " ").toUpperCase()}
        </div>

      </div>

    `;

    div.addEventListener("click", () => {

      openEditDeadlineForm(
        track,
        deadline,
        "global"
      );

    });

    container.appendChild(div);

  });

}

function openSidebarDeadlineForm() {
  const container = document.getElementById("globalDeadlineList");
  if (!container) return;

  if (container.querySelector(".deadline-form")) return;

  const form = document.createElement("div");
  form.classList.add("deadline-form");

  const trackOptions = tracks.map(track =>
    `<option value="${track.id}">${track.name}</option>`
  ).join("");

  form.innerHTML = `
    <input type="text" id="sidebarTitle" placeholder="Deadline name" />

    <select id="sidebarTrackSelect">
      ${trackOptions}
    </select>

    <div class="deadline-datetime-column">
      <input type="date" id="sidebarDate" />
      <input type="time" id="sidebarTime" />
    </div>

    <div class="deadline-form-actions">
      <button type="button" class="neutral-btn" id="sidebarTodayBtn">
        Today EOD
      </button>

      <button type="button" class="primary-btn" id="sidebarSaveBtn">
        Save
      </button>

      <button type="button" class="neutral-btn" id="sidebarCancelBtn">
        Cancel
      </button>
    </div>
  `;

  container.prepend(form);

  // ✅ GET ALL INPUT REFERENCES 
  const titleInput = form.querySelector("#sidebarTitle");
  const trackSelect = form.querySelector("#sidebarTrackSelect");
  const dateInput = form.querySelector("#sidebarDate");
  const timeInput = form.querySelector("#sidebarTime");

  const todayBtn = form.querySelector("#sidebarTodayBtn");
  const saveBtn = form.querySelector("#sidebarSaveBtn");
  const cancelBtn = form.querySelector("#sidebarCancelBtn");

  // ✅ TODAY BUTTON
  todayBtn.addEventListener("click", () => {
    const now = new Date();

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    dateInput.value = `${yyyy}-${mm}-${dd}`;
    timeInput.value = "23:59";
  });

  // ✅ SAVE BUTTON
  saveBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    const trackId = Number(trackSelect.value);

    if (!title || !date || !time) {
      alert("All fields required.");
      return;
    }

    const datetime = new Date(`${date}T${time}`);

    if (isNaN(datetime.getTime())) {
      alert("Invalid date/time.");
      return;
    }

    const selectedTrack = tracks.find(t => t.id === trackId);
    if (!selectedTrack) return;

    selectedTrack.deadlines.push({
      id: Date.now(),
      title,
      datetime: datetime.toISOString(),
      status: "upcoming"
    });

    persistTracks();

    // refresh currently open track view if needed
    if (currentOpenTrackId === trackId) {
      renderDeadlines(selectedTrack);
    }

    form.remove();
  });

  cancelBtn.addEventListener("click", () => {
    form.remove();
  });
}