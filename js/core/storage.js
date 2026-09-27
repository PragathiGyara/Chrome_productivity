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


// =====================================================
// LOAD TRACKS
// =====================================================

function loadTracks() {

  const saved =
    localStorage.getItem(
      TRACK_STORAGE_KEY
    );


  // =====================================================
  // CREATE DEFAULT TRACKS IF NOTHING EXISTS
  // =====================================================

  if (!saved) {

    tracks = [

      {
        id: "college",
        name: "College",
        icon: "🎓",
        color: "#4A90E2",
        projects: [
          createDefaultProject()
        ]
      },

      {
        id: "projects",
        name: "Projects",
        icon: "🚀",
        color: "#E67E22",
        projects: [
          createDefaultProject()
        ]
      },

      {
        id: "learning",
        name: "Learning",
        icon: "📚",
        color: "#9B59B6",
        projects: [
          createDefaultProject()
        ]
      },

      {
        id: "health",
        name: "Health",
        icon: "❤️",
        color: "#2ECC71",
        projects: [
          createDefaultProject()
        ]
      }

    ];


    persistTracks();

    return tracks;

  }


  // =====================================================
  // PARSE SAVED DATA
  // =====================================================

  try {

    tracks =
      JSON.parse(saved);

  } catch (error) {

    console.error(
      "Failed to load tracks:",
      error
    );


    tracks = [

      {
        id: "college",
        name: "College",
        icon: "🎓",
        color: "#4A90E2",
        projects: [
          createDefaultProject()
        ]
      },

      {
        id: "projects",
        name: "Projects",
        icon: "🚀",
        color: "#E67E22",
        projects: [
          createDefaultProject()
        ]
      },

      {
        id: "learning",
        name: "Learning",
        icon: "📚",
        color: "#9B59B6",
        projects: [
          createDefaultProject()
        ]
      },

      {
        id: "health",
        name: "Health",
        icon: "❤️",
        color: "#2ECC71",
        projects: [
          createDefaultProject()
        ]
      }

    ];

  }


  // =====================================================
  // NORMALIZE TRACKS
  // =====================================================

  if (!Array.isArray(tracks)) {

    tracks = [];

  }


  tracks =
    tracks.map(
      track => {

        // -----------------------------------------------
        // NORMALIZE TRACK
        // -----------------------------------------------

        track.id =
          track.id ??
          `track-${Date.now()}-${Math.random()}`;

        track.name =
          track.name ??
          "Unnamed Track";

        track.icon =
          track.icon ??
          "📁";

        track.color =
          track.color ??
          "#888888";


        // -----------------------------------------------
        // NORMALIZE PROJECT ARRAY
        // -----------------------------------------------

        if (
          !Array.isArray(
            track.projects
          )
        ) {

          track.projects = [];

        }


        // =================================================
        // NORMALIZE PROJECTS
        // =================================================

        track.projects =
          track.projects.map(
            project => {

              // -------------------------------------------
              // BASIC PROJECT DATA
              // -------------------------------------------

              project.id =
                project.id ??
                `project-${Date.now()}-${Math.random()}`;

              project.name =
                project.name ??
                "Unnamed Project";


              // -------------------------------------------
              // TARGET HOURS
              // -------------------------------------------

              project.targetHoursPerDay =
                Number(
                  project.targetHoursPerDay
                ) || 0;


              // -------------------------------------------
              // CREATED DATE
              // -------------------------------------------

              if (
                !project.createdAt
              ) {

                project.createdAt =
                  new Date().toISOString();

              }


              // -------------------------------------------
              // TARGET HOURS HISTORY
              //
              // Existing projects did not previously have
              // this field, so create an initial record
              // using their existing target.
              // -------------------------------------------

              if (
                !Array.isArray(
                  project.targetHoursHistory
                )
              ) {

                project.targetHoursHistory = [

                  {
                    hours:
                      project.targetHoursPerDay,

                    date:
                      getLocalDateKey(
                        new Date(
                          project.createdAt
                        )
                      )

                  }

                ];

              }


              // -------------------------------------------
              // READING
              // -------------------------------------------

              if (
                !Array.isArray(
                  project.reading
                )
              ) {

                project.reading = [];

              }


              // -------------------------------------------
              // TASKS
              // -------------------------------------------

              if (
                !Array.isArray(
                  project.tasks
                )
              ) {

                project.tasks = [];

              }


              // -------------------------------------------
              // DEADLINES
              // -------------------------------------------

              if (
                !Array.isArray(
                  project.deadlines
                )
              ) {

                project.deadlines = [];

              }


              // -------------------------------------------
              // TODOS
              // -------------------------------------------

              if (
                !Array.isArray(
                  project.todos
                )
              ) {

                project.todos = [];

              }


              // -------------------------------------------
              // NOTES
              // -------------------------------------------

              if (
                typeof project.notes !==
                "string"
              ) {

                project.notes = "";

              }


              // -------------------------------------------
              // LOGS
              //
              // Kept for compatibility with existing
              // project data.
              // -------------------------------------------

              if (
                !project.logs ||
                typeof project.logs !==
                  "object" ||
                Array.isArray(
                  project.logs
                )
              ) {

                project.logs = {};

              }


              // -------------------------------------------
              // STATUS
              // -------------------------------------------

              project.status =
                project.status ??
                "active";


              // -------------------------------------------
              // STATUS HISTORY
              // -------------------------------------------

              if (
                !Array.isArray(
                  project.statusHistory
                )
              ) {

                project.statusHistory = [

                  {
                    status:
                      project.status,

                    date:
                      getLocalDateKey(
                        new Date(
                          project.createdAt
                        )
                      ),

                    time:
                      getLocalTime(
                        new Date(
                          project.createdAt
                        )
                      )

                  }

                ];

              }


              return project;

            }
          );


        // =================================================
        // ENSURE GENERAL PROJECT EXISTS
        // =================================================

        const hasGeneralProject =
          track.projects.some(
            project =>
              String(project.id) ===
              "general"
          );


        if (
          !hasGeneralProject
        ) {

          track.projects.unshift(
            createDefaultProject()
          );

        }


        return track;

      }
    );


  // =====================================================
  // SAVE NORMALIZED DATA
  // =====================================================

  persistTracks();


  return tracks;

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