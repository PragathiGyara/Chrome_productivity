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
    localStorage.getItem(TODO_STORAGE_KEY);

  // =====================================
  // FIRST RUN
  // =====================================

  if (!stored) {

    return {
      tasks: []
    };

  }

  const parsed =
    JSON.parse(stored);

  // =====================================
  // OLD FORMAT
  // [
  //   { date, items }
  // ]
  // =====================================

  if (Array.isArray(parsed)) {

    return {

      tasks:

        parsed.flatMap(day =>

          day.items.map(item => ({

            id: item.id,

            text: item.text,

            completed: item.completed,

            archived: false,

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
  // CURRENT FORMAT
  // {
  //   current: [],
  //   allTime: []
  // }
  // =====================================

  if (parsed.current || parsed.allTime) {

    const current =

      (parsed.current || []).map(task => ({

        id: task.id,

        text: task.text,

        completed:
          task.done,

        archived: false,

        createdAt:
          task.createdAt ??
          new Date().toISOString(),

        completedAt:
          task.done
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
          task.done,

        archived: true,

        createdAt:
          task.createdAt ??
          new Date().toISOString(),

        completedAt:
          task.done
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
  // NEW FORMAT
  // =====================================

  if (!parsed.tasks) {

    parsed.tasks = [];

  }

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
            todoData.tasks

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

  // =========================================
  // NORMALIZE PROJECTS
  // =========================================

  projects.forEach(project => {

    if (!project.logs) {
      project.logs = {};
    }

    if (!project.createdAt) {

      project.createdAt =
        new Date().toISOString();
    }

  });
}
