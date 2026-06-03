// =====================================================
// TIMELINE STORAGE
// =====================================================

const TIMELINE_STORAGE_KEY =
  "dashboardTimeline";


// =====================================================
// PRIVATE STATE
// =====================================================

let timelineEntries = {};


// =====================================================
// LOAD / SAVE
// =====================================================

function loadTimelineEntries() {

  const stored =
    localStorage.getItem(
      TIMELINE_STORAGE_KEY
    );

  timelineEntries =
    stored
      ? JSON.parse(stored)
      : {};
}


function persistTimelineEntries() {

  localStorage.setItem(
    TIMELINE_STORAGE_KEY,
    JSON.stringify(
      timelineEntries
    )
  );
}


// =====================================================
// QUERY API
// =====================================================

function getTimelineEntriesForDate(
  date
) {

  return (
    timelineEntries[date] || []
  );
}


function getTimelineEntryById(
  entryId
) {

  for (const date in timelineEntries) {

    const entry =
      timelineEntries[date]
        .find(
          e => e.id === entryId
        );

    if (entry) {
      return entry;
    }
  }

  return null;
}


// =====================================================
// MUTATION API
// =====================================================

function addTimelineEntry(
  date,
  entry
) {

  if (!timelineEntries[date]) {
    timelineEntries[date] = [];
  }

  timelineEntries[date].push(
    entry
  );

  persistTimelineEntries();
}


function updateTimelineEntry(
  date,
  entryId,
  updates
) {

  const entries =
    timelineEntries[date];

  if (!entries) return;

  const entry =
    entries.find(
      e => e.id === entryId
    );

  if (!entry) return;

  Object.assign(
    entry,
    updates
  );

  persistTimelineEntries();
}


function deleteTimelineEntry(
  date,
  entryId
) {

  const entries =
    timelineEntries[date];

  if (!entries) return;

  timelineEntries[date] =
    entries.filter(
      e => e.id !== entryId
    );

  persistTimelineEntries();
}

function getActivitySuggestions(
  searchText = ""
) {

  const suggestions =
    new Set();

  const query =
    searchText
      .trim()
      .toLowerCase();

  for (
    const date
    in timelineEntries
  ) {

    timelineEntries[date]
      .forEach(entry => {

        const name =
          entry.activityName;

        if (!name) return;

        if (
          query &&
          !name
            .toLowerCase()
            .includes(query)
        ) {
          return;
        }

        suggestions.add(name);
      });
  }

  return [...suggestions]
    .sort();
}

function getActivityMetadata(
  activityName
) {

  let latestEntry = null;

  for (
    const date
    in timelineEntries
  ) {

    timelineEntries[date]
      .forEach(entry => {

        if (
          entry.activityName !==
          activityName
        ) {
          return;
        }

        if (
          !latestEntry ||
          entry.createdAt >
          latestEntry.createdAt
        ) {

          latestEntry = entry;
        }
      });
  }

  if (!latestEntry) {
    return null;
  }

  return {

    projectId:
      latestEntry.projectId,

    trackId:
      latestEntry.trackId
  };
}