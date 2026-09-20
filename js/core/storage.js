// =====================================================
// STORAGE LAYER
// =====================================================


// =====================================================
// STORAGE KEYS
// =====================================================

const TRACK_STORAGE_KEY =
  "dashboardTracks";

const TODO_DISPLAY_SETTINGS_KEY =
  "todoDisplaySettings";

const TIMETABLE_STORAGE_KEY =
  "timetableEntries";

const TIME_LOG_STORAGE_KEY =
  "timeLogEntries";




// =====================================================
// TRACK STORAGE
// =====================================================

function persistTracks() {

  localStorage.setItem(
    TRACK_STORAGE_KEY,
    JSON.stringify(tracks)
  );

  renderGlobalDeadlines();

}

function createDefaultProject() {

  return {

    id: "general",

    name: "General",

    reading: [],

    tasks: [],

    deadlines: [],

    todos: [],

    notes: "",

    logs: {},

    createdAt:
      new Date().toISOString(),

    status: "active",

    statusHistory: [

      {

        status: "active",

        date:
          getLocalDateKey(
            new Date()
          ),

        time:
          getLocalTime(
            new Date()
          )

      }

    ]

  };

}


function loadTracks() {

  const stored =
    localStorage.getItem(
      TRACK_STORAGE_KEY
    );


  // =====================================
  // LOAD OR CREATE TRACKS
  // =====================================

  let dataChanged = false;


  if (stored) {

    tracks =
      JSON.parse(stored);

  } else {

    tracks =
      getDefaultTracks();

    dataChanged = true;

  }


  // =====================================
  // NORMALIZE TRACKS
  // =====================================

  tracks.forEach(track => {

    // ===================================
    // TRACK PROJECTS
    // ===================================

    if (!Array.isArray(track.projects)) {

      track.projects = [];

      dataChanged = true;

    }


    // ===================================
    // ENSURE GENERAL PROJECT
    // ===================================

    let generalProject =
      track.projects.find(
        project =>
          String(project.id) ===
          "general"
      );


    if (!generalProject) {

      generalProject =
        createDefaultProject();

      track.projects.unshift(
        generalProject
      );

      dataChanged = true;

    }


    // ===================================
    // NORMALIZE PROJECTS
    // ===================================

    track.projects.forEach(project => {

      // =================================
      // PROJECT ID
      // =================================

      if (!project.id) {

        project.id =
          `project-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`;

        dataChanged = true;

      }


      // =================================
      // PROJECT NAME
      // =================================

      if (!project.name) {

        project.name =
          "Untitled Project";

        dataChanged = true;

      }


      // =================================
      // PROJECT READING
      // =================================

      if (
        !Array.isArray(
          project.reading
        )
      ) {

        project.reading = [];

        dataChanged = true;

      }


      project.reading.forEach(item => {

        if (!item.links) {

          item.links =
            item.link
              ? [item.link]
              : [];

          delete item.link;

          dataChanged = true;

        }

      });


      // =================================
      // PROJECT TASKS
      // =================================

      if (
        !Array.isArray(
          project.tasks
        )
      ) {

        project.tasks = [];

        dataChanged = true;

      }


      // =================================
      // PROJECT DEADLINES
      // =================================

      if (
        !Array.isArray(
          project.deadlines
        )
      ) {

        project.deadlines = [];

        dataChanged = true;

      }


      // =================================
      // PROJECT TODOS
      // =================================

      if (
        !Array.isArray(
          project.todos
        )
      ) {

        project.todos = [];

        dataChanged = true;

      }


      // =================================
      // NORMALIZE PROJECT TODOS
      // =================================

      project.todos.forEach(
        (todo, index) => {

          if (!todo.id) {

            todo.id =
              Date.now() +
              index;

            dataChanged = true;

          }


          if (
            typeof todo.text !==
            "string"
          ) {

            todo.text = "";

            dataChanged = true;

          }


          if (
            typeof todo.completed !==
            "boolean"
          ) {

            todo.completed =
              todo.done ??
              false;

            dataChanged = true;

          }


          if (
            typeof todo.archived !==
            "boolean"
          ) {

            todo.archived =
              false;

            dataChanged = true;

          }


          if (
            todo.order == null
          ) {

            todo.order =
              index;

            dataChanged = true;

          }


          if (!todo.createdAt) {

            todo.createdAt =
              new Date().toISOString();

            dataChanged = true;

          }


          if (
            todo.completedAt ===
            undefined
          ) {

            todo.completedAt =
              todo.completed
                ? todo.createdAt
                : null;

            dataChanged = true;

          }

        }
      );


      // =================================
      // PROJECT NOTES
      // =================================

      if (
        typeof project.notes !==
        "string"
      ) {

        project.notes = "";

        dataChanged = true;

      }


      // =================================
      // PROJECT LOGS
      // =================================

      if (!project.logs) {

        project.logs = {};

        dataChanged = true;

      }


      // =================================
      // PROJECT CREATED DATE
      // =================================

      if (!project.createdAt) {

        project.createdAt =
          new Date().toISOString();

        dataChanged = true;

      }


      // =================================
      // PROJECT STATUS
      // =================================

      if (!project.status) {

        project.status =
          "active";

        dataChanged = true;

      }


      // =================================
      // PROJECT STATUS HISTORY
      // =================================

      if (
        !Array.isArray(
          project.statusHistory
        ) ||
        project.statusHistory.length === 0
      ) {

        const createdAt =
          new Date(
            project.createdAt
          );


        project.statusHistory = [

          {

            status:
              project.status,

            date:
              getLocalDateKey(
                createdAt
              ),

            time:
              getLocalTime(
                createdAt
              )

          }

        ];

        dataChanged = true;

      }

    });

  });


  // =====================================
  // SAVE DATA
  // =====================================

  if (dataChanged) {

    persistTracks();

  }

}



// =====================================================
// DEFAULT TRACKS
// =====================================================

function getDefaultTracks() {

  return [

    {
      id: 1,

      name: "College",

      icon: "📚",

      projects: [
        createDefaultProject()
      ]

    },


    {
      id: 2,

      name: "Projects",

      icon: "💻",

      projects: [
        createDefaultProject()
      ]

    },


    {
      id: 3,

      name: "Learning",

      icon: "🧠",

      projects: [
        createDefaultProject()
      ]

    },


    {
      id: 4,

      name: "Health",

      icon: "🏃",

      projects: [
        createDefaultProject()
      ]

    }

  ];

}





// =====================================================
// TODO DISPLAY SETTINGS
// =====================================================

function loadTodoDisplaySettings() {

  const stored =
    localStorage.getItem(
      TODO_DISPLAY_SETTINGS_KEY
    );

  if (!stored) {

    return {

      showCompleted: true,

      showDates: true

    };

  }

  return JSON.parse(stored);

}


function persistTodoDisplaySettings(
  settings
) {

  localStorage.setItem(
    TODO_DISPLAY_SETTINGS_KEY,
    JSON.stringify(settings)
  );

}




// =====================================================
// TODAY HELPERS
// =====================================================

function getTodayKey() {

  return new Date()
    .toISOString()
    .split("T")[0];

}



// =====================================================
// WEEK HELPERS
// =====================================================

function getTimetableWeekKey(
  date = new Date()
) {

  const localDate =
    new Date(date);

  const day =
    localDate.getDay();

  // Sunday is the start of the week

  localDate.setDate(
    localDate.getDate() - day
  );

  return (
    `${localDate.getFullYear()}-` +
    `${String(
      localDate.getMonth() + 1
    ).padStart(2, "0")}-` +
    `${String(
      localDate.getDate()
    ).padStart(2, "0")}`
  );

}

function getDateFromTimetableWeekKey(
  weekKey
) {

  return new Date(
    `${weekKey}T00:00:00`
  );

}




// =====================================================
// TIMETABLE STORAGE
// =====================================================

function persistTimetableEntries() {

  const allTimetableData =
    JSON.parse(
      localStorage.getItem(
        TIMETABLE_STORAGE_KEY
      )
    ) || {};

  const weekKey =
    getTimetableWeekKey();

  allTimetableData[weekKey] =
    timetableEntries;

  localStorage.setItem(
    TIMETABLE_STORAGE_KEY,
    JSON.stringify(
      allTimetableData
    )
  );

}


function loadTimetableEntries(
  weekKey =
    getTimetableWeekKey()
) {

  const stored =
    localStorage.getItem(
      TIMETABLE_STORAGE_KEY
    );

  const allTimetableData =
    stored
      ? JSON.parse(stored)
      : {};

  timetableEntries =
    allTimetableData[weekKey] || [];

}




// =====================================================
// TIME LOG STORAGE
// =====================================================

function saveTimeLogEntriesToStorage(
  entries
) {

  localStorage.setItem(
    TIME_LOG_STORAGE_KEY,
    JSON.stringify(entries)
  );

}


function loadTimeLogEntriesFromStorage() {

  const stored =
    localStorage.getItem(
      TIME_LOG_STORAGE_KEY
    );

  if (!stored) {

    return [];

  }


  try {

    const parsed =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];

  }

  catch (error) {

    console.error(
      "Failed to load time log entries:",
      error
    );

    return [];

  }

}