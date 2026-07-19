// =====================================================
// STORAGE LAYER
// =====================================================

const TRACK_STORAGE_KEY = "dashboardTracks";
const TODO_STORAGE_KEY = "dailyTodos";
const PROJECT_STORAGE_KEY = "dashboardProjects";
const TODO_DISPLAY_SETTINGS_KEY = "todoDisplaySettings";


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


function loadTracks() {

  const stored =
    localStorage.getItem(TRACK_STORAGE_KEY);

  tracks = stored
    ? JSON.parse(stored)
    : getDefaultTracks();

  tracks.forEach(track => {

    if (!track.deadlines)
      track.deadlines = [];

    if (!track.tasks)
      track.tasks = [];

    if (!track.reading)
      track.reading = [];

    if (!track.notes)
      track.notes = "";

    track.reading.forEach(item => {

      if (!item.links) {

        item.links =
          item.link ? [item.link] : [];

        delete item.link;
      }

    });

  });
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
      deadlines: [],
      tasks: [],
      reading: [],
      notes: ""
    },

    {
      id: 2,
      name: "Projects",
      icon: "💻",
      deadlines: [],
      tasks: [],
      reading: [],
      notes: ""
    },

    {
      id: 3,
      name: "Learning",
      icon: "🧠",
      deadlines: [],
      tasks: [],
      reading: [],
      notes: ""
    },

    {
      id: 4,
      name: "Health",
      icon: "🏃",
      deadlines: [],
      tasks: [],
      reading: [],
      notes: ""
    }

  ];
}


// =====================================================
// TODO STORAGE
// =====================================================

function loadTodos() {

    const stored =
        localStorage.getItem(
            TODO_STORAGE_KEY
        );

    if (!stored) {

        return {
            tasks: []
        };

    }

    const parsed =
        JSON.parse(stored);

    // =====================================
    // OLD ARRAY FORMAT
    // =====================================

    if (Array.isArray(parsed)) {

        let order = 0;

        return {

            tasks:

                parsed.flatMap(day =>

                    day.items.map(item => ({

                        id: item.id,

                        text: item.text,

                        completed:
                            item.completed ??
                            item.done ??
                            false,

                        archived: false,

                        order: order++,

                        createdAt:
                            item.createdAt ??
                            `${day.date}T00:00:00`,

                        completedAt:
                            item.completed
                                ? `${day.date}T00:00:00`
                                : null

                    }))

                )

        };

    }

    // =====================================
    // PREVIOUS CURRENT / ALLTIME FORMAT
    // =====================================

    if (parsed.current || parsed.allTime) {

        let currentOrder = 0;
        let archivedOrder = 0;

        const current =

            (parsed.current || []).map(task => ({

                id: task.id,

                text: task.text,

                completed:
                    task.completed ??
                    task.done ??
                    false,

                archived: false,

                order:
                    currentOrder++,

                createdAt:
                    task.createdAt ??
                    new Date().toISOString(),

                completedAt:
                    task.completed
                        ? (
                            task.completedAt ??
                            new Date().toISOString()
                        )
                        : null

            }));

        const archived =

            (parsed.allTime || []).map(task => ({

                id: task.id,

                text: task.text,

                completed:
                    task.completed ??
                    task.done ??
                    false,

                archived: true,

                order:
                    archivedOrder++,

                createdAt:
                    task.createdAt ??
                    new Date().toISOString(),

                completedAt:
                    task.completed
                        ? (
                            task.completedAt ??
                            new Date().toISOString()
                        )
                        : null

            }));

        return {

            tasks: [

                ...current,

                ...archived

            ]

        };

    }

    // =====================================
    // CURRENT FORMAT
    // =====================================

    if (!parsed.tasks) {

        parsed.tasks = [];

    }

    // Ensure every task has an order

    let currentOrder = 0;
    let archivedOrder = 0;

    parsed.tasks.forEach(task => {

        if (task.order == null) {

            task.order =
                task.archived
                    ? archivedOrder++
                    : currentOrder++;

        }

    });

    return parsed;

}

function persistTodos(todoData) {

  localStorage.setItem(

    TODO_STORAGE_KEY,

    JSON.stringify(todoData)

  );

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

function persistTodoDisplaySettings(settings) {

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


function getCurrentTodos() {

    const todoData =
        loadTodos();

    return {

        todoData,

        current:
            todoData.tasks.filter(
                task => !task.archived
            )

    };

}


function getAllTimeTodos() {

    const todoData =
        loadTodos();

    return {

        todoData,

        allTime:
            todoData.tasks.filter(
                task => task.archived
            )

    };

}


// =====================================================
// PROJECT STORAGE
// =====================================================

function persistProjects() {

  localStorage.setItem(
    PROJECT_STORAGE_KEY,
    JSON.stringify(projects)
  );
}


function loadProjects() {

  const stored =
    localStorage.getItem(
      PROJECT_STORAGE_KEY
    );

  projects = stored
    ? JSON.parse(stored)
    : [];

  let dataChanged = false;

  // =========================================
  // NORMALIZE PROJECTS
  // =========================================

  projects.forEach(project => {

    if (!project.logs) {

      project.logs = {};
      dataChanged = true;

    }

    if (!project.createdAt) {

      project.createdAt =
        new Date().toISOString();

      dataChanged = true;

    }

    if (

      !project.statusHistory ||

      project.statusHistory.length === 0

    ) {

      const createdAt =
        new Date(
          project.createdAt
        );

      project.statusHistory = [

        {

          status: "active",

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

  // =========================================
  // SAVE MIGRATED PROJECTS
  // =========================================

  if (dataChanged) {

    persistProjects();

  }

}