// =====================================================
// STORAGE LAYER
// =====================================================

const TRACK_STORAGE_KEY = "dashboardTracks";
const TODO_STORAGE_KEY = "dailyTodos";
const PROJECT_STORAGE_KEY = "dashboardProjects";


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

  if (!stored) {

    return {
      current: [],
      allTime: []
    };
  }

  const parsed = JSON.parse(stored);

  // =====================================
  // BACKWARD COMPATIBILITY
  // =====================================

  // Old format:
  // [
  //   { date, items }
  // ]

  if (Array.isArray(parsed)) {

    return {
      current: parsed.flatMap(day => day.items),
      allTime: []
    };
  }

  // Previous object format

  if (parsed.daily || parsed.global) {

    return {
      current:
        parsed.daily
          ? parsed.daily.flatMap(day => day.items)
          : [],

      allTime:
        parsed.global || []
    };
  }

  // Current format

  if (!parsed.current) {
    parsed.current = [];
  }

  if (!parsed.allTime) {
    parsed.allTime = [];
  }

  return parsed;
}

function persistTodos(todos) {

  localStorage.setItem(
    TODO_STORAGE_KEY,
    JSON.stringify(todos)
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

  const todoData = loadTodos();

  if (!todoData.current) {

    todoData.current = [];

    persistTodos(todoData);
  }

  return {
    todoData,
    current: todoData.current
  };
}


function getAllTimeTodos() {

  const todoData = loadTodos();

  if (!todoData.allTime) {

    todoData.allTime = [];

    persistTodos(todoData);
  }

  return {
    todoData,
    allTime: todoData.allTime
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
