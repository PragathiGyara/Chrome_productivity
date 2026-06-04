// =====================================================
// CLOCK STATE
// =====================================================

let clockStartIndex = null;

let clockEndIndex = null;

// =====================================================
// CLOCK RENDERING
// =====================================================

function renderTimelineClock() {

  const container =
    document.getElementById(
      "timelineClockContainer"
    );

  if (!container) return;

  container.innerHTML = "";

  const clock =
    document.createElement("div");

  clock.className =
    "timeline-clock";

  // ======================
  // SEGMENTS
  // ======================

  for (let i = 0; i < 144; i++) {

    // 24 hours × 6 segments per hour
    // = 144 selectable 10-minute segments
    const segment =
      document.createElement("div");

    segment.className =
    i % 6 === 0
        ? "clock-segment major"
        : "clock-segment minor";

    segment.dataset.index = i;

    // 360° / 144 segments
    // = 2.5° per segment

    segment.style.transform =
      `translateX(-50%) rotate(${i * 2.5}deg)`;

    segment.addEventListener(
        "mouseenter",
        () =>
            highlightHour(i)
        );  

    segment.addEventListener(
        "click",
        () =>
            onClockSegmentClick(i)
        );  

    clock.appendChild(segment);
  }

  renderClockLabels(clock);

  container.appendChild(clock);
}

function renderClockLabels(clock) {

  const radius = 195;

  for (let hour = 0; hour < 24; hour++) {

    const label =
      document.createElement("div");

    label.className =
    "clock-hour-label";

    label.dataset.hour =
    hour;

    label.textContent =
      String(hour).padStart(2, "0");

    const angle =
      (hour / 24) * (2 * Math.PI)
      - Math.PI / 2;

    const x =
      Math.cos(angle) * radius;

    const y =
      Math.sin(angle) * radius;

    label.style.left =
      `calc(50% + ${x}px)`;

    label.style.top =
      `calc(50% + ${y}px)`;

    clock.appendChild(label);
  }
}

// =====================================================
// CLOCK INTERACTION
// =====================================================

function highlightHour(
  segmentIndex
) {

  const hour =
    Math.floor(
      segmentIndex / 6
    );

  document
    .querySelectorAll(
      ".clock-segment"
    )
    .forEach(seg => {

      seg.classList.remove(
        "hour-hover"
      );
    });

  document
    .querySelectorAll(
      ".clock-segment"
    )
    .forEach(seg => {

      const index =
        Number(
          seg.dataset.index
        );

      if (
        Math.floor(index / 6)
        === hour
      ) {

        seg.classList.add(
          "hour-hover"
        );
      }

    });
    document
        .querySelectorAll(
            ".clock-hour-label"
        )
        .forEach(label => {

            label.classList.remove(
            "hour-label-hover"
            );

            if (
            Number(label.dataset.hour)
            === hour
            ) {

            label.classList.add(
                "hour-label-hover"
            );
            }
        });
}

function onClockSegmentClick(
  index
) {

  if (
    clockStartIndex === null
  ) {

    clockStartIndex =
      index;

  } else if (
    clockEndIndex === null
  ) {

    clockEndIndex =
      index;

  } else {

    clockStartIndex =
      index;

    clockEndIndex =
      null;
  }

  updateClockDisplay();
}

// =====================================================
// CLOCK HELPERS
// =====================================================

function indexToTime(
  index
) {

  const totalMinutes =
    index * 10;

  const hours =
    Math.floor(
      totalMinutes / 60
    );

  const minutes =
    totalMinutes % 60;

  return (
    String(hours)
      .padStart(2, "0")
    +
    ":"
    +
    String(minutes)
      .padStart(2, "0")
  );
}

function updateClockDisplay() {

  document.getElementById(
    "selectedStartTime"
  ).textContent =
    clockStartIndex === null
      ? "--:--"
      : indexToTime(
          clockStartIndex
        );

  document.getElementById(
    "selectedEndTime"
  ).textContent =
    clockEndIndex === null
      ? "--:--"
      : indexToTime(
          clockEndIndex
        );
}