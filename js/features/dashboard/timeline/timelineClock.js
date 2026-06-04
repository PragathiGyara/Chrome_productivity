// =====================================================
// CLOCK GEOMETRY
// =====================================================

// Tick 0 points upward.
//
// We want:
//
//          06
//           |
// 00 -------+------- 12
//           |
//           18
//

const CLOCK_HOUR_OFFSET = 6;

// =====================================================
// CLOCK STATE
// =====================================================

let clockStartIndex = null;

let clockEndIndex = null;

let clockHoverIndex = null;

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

    const tooltip =
        document.createElement("div");

    tooltip.id =
        "clockTimeTooltip";

    tooltip.className =
        "clock-time-tooltip";

    clock.appendChild(
        tooltip
        );

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

        const visualIndex =
        (
        i
        -
        36
        +
        144
        ) % 144;

        segment.style.transform =
        `translateX(-50%) rotate(${visualIndex * 2.5}deg)`;

        clock.appendChild(segment);
    }

    renderClockLabels(clock);

        clock.addEventListener(
            "mouseleave",
            clearClockHover
        );

        clock.addEventListener(
            "mousemove",
            (event) => {
                const segmentIndex =
                getSegmentFromMousePosition(
                    event
                );

                if (
                    segmentIndex === null
                    ) {

                    clockHoverIndex =
                        null;

                    renderClockSelection();

                    hideTimeTooltip();

                    return;
                }

            console.log(
                segmentIndex,
                indexToTime(segmentIndex)
            );

            clockHoverIndex =
            segmentIndex;

            renderClockSelection();

            showTimeTooltip(
            event,
            segmentIndex
        );
        }
    );

        clock.addEventListener(
        "click",
        (event) => {

            const segmentIndex =
            getSegmentFromMousePosition(
                event
            );

            if (
            segmentIndex === null
            ) {
            return;
            }

            onClockSegmentClick(
            segmentIndex
            );
        }
        );

    container.appendChild(clock);
}

function renderClockLabels(
  clock
) {

  const radius = 165;

  for (
    let hour = 0;
    hour < 24;
    hour++
  ) {

    const label =
      document.createElement(
        "div"
      );

    label.className =
      "clock-hour-label";

    label.dataset.hour =
      hour;

    label.textContent =
      String(hour)
        .padStart(2, "0");

    const visualHour =
      (
        hour -
        CLOCK_HOUR_OFFSET +
        24
      ) % 24;

    const angle =
      (
        visualHour / 24
      ) *
      2 *
      Math.PI
      -
      Math.PI / 2;

    const x =
      Math.cos(angle) *
      radius;

    const y =
      Math.sin(angle) *
      radius;

    label.style.left =
      `calc(50% + ${x}px)`;

    label.style.top =
      `calc(50% + ${y}px)`;

    clock.appendChild(
      label
    );
  }
}

// =====================================================
// CLOCK POSITION HELPERS
// =====================================================

function getSegmentFromMousePosition(
  event
) {

  const clock =
    document.querySelector(
      ".timeline-clock"
    );

  if (!clock) {
    return null;
  }

  const rect =
    clock.getBoundingClientRect();

  const centerX =
    rect.width / 2;

  const centerY =
    rect.height / 2;

  const x =
    event.clientX
    - rect.left
    - centerX;

  const y =
    event.clientY
    - rect.top
    - centerY;

  const distance =
    Math.sqrt(
      x * x +
      y * y
    );

  // ==========================
  // Only allow interaction
  // on the clock ring
  // ==========================

  if (
    distance < 100 ||
    distance > 160
  ) {

    return null;
  }
  let angle =
  Math.atan2(
    y,
    x
  );

    angle +=
    Math.PI / 2;

    if (
    angle < 0
    ) {

    angle +=
        2 * Math.PI;
    }

    const visualIndex =
    Math.floor(
        (
        angle *
        180 /
        Math.PI
        ) / 2.5
    );

    const actualIndex =
    (
    visualIndex
    +
    36
    ) % 144;

    return actualIndex;

}

// =====================================================
// CLOCK INTERACTION
// =====================================================

// function highlightHour(
//   segmentIndex
// ) {

//   const hour =
//     Math.floor(
//       segmentIndex / 6
//     );

//   document
//     .querySelectorAll(
//       ".clock-segment"
//     )
//     .forEach(seg => {

//       seg.classList.remove(
//         "hour-hover"
//       );
//     });

//   document
//     .querySelectorAll(
//       ".clock-segment"
//     )
//     .forEach(seg => {

//       const index =
//         Number(
//           seg.dataset.index
//         );

//       if (
//         Math.floor(index / 6)
//         === hour
//       ) {

//         seg.classList.add(
//           "hour-hover"
//         );
//       }

//     });
//     document
//         .querySelectorAll(
//             ".clock-hour-label"
//         )
//         .forEach(label => {

//             label.classList.remove(
//             "hour-label-hover"
//             );

//             if (
//             Number(label.dataset.hour)
//             === hour
//             ) {

//             label.classList.add(
//                 "hour-label-hover"
//             );
//             }
//         });
// }

function clearClockHover() {

  clockHoverIndex = null;

  renderClockSelection();

  hideTimeTooltip();
}

function showTimeTooltip(
  event,
  segmentIndex
) {

  const tooltip =
    document.getElementById(
      "clockTimeTooltip"
    );

  if (!tooltip) return;

  tooltip.textContent =
    indexToTime(
      segmentIndex
    );

  tooltip.classList.add(
    "visible"
  );

  moveTimeTooltip(
    event
  );
}

function moveTimeTooltip(
  event
) {

  const tooltip =
    document.getElementById(
      "clockTimeTooltip"
    );

  if (!tooltip) return;

  const clock =
    document.querySelector(
      ".timeline-clock"
    );

  if (!clock) return;

  const rect =
    clock.getBoundingClientRect();

  tooltip.style.left =
    `${event.clientX - rect.left + 20}px`;

  tooltip.style.top =
    `${event.clientY - rect.top - 20}px`;
}

function hideTimeTooltip() {

  const tooltip =
    document.getElementById(
      "clockTimeTooltip"
    );

  if (!tooltip) return;

  tooltip.classList.remove(
    "visible"
  );
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

    clockHoverIndex =
      null;

    if (
      clockEndIndex <
      clockStartIndex
    ) {

      [
        clockStartIndex,
        clockEndIndex
      ] = [
        clockEndIndex,
        clockStartIndex
      ];
    }

  } else {

    clockStartIndex =
      index;

    clockEndIndex =
      null;

    clockHoverIndex =
      null;
  }

  updateClockDisplay();

  renderClockSelection();
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

function renderClockSelection() {

  const segments =
    document.querySelectorAll(
      ".clock-segment"
    );

  segments.forEach(segment => {

    segment.classList.remove(
      "clock-selection-preview",
      "clock-selection-start",
      "clock-selection-end",
      "clock-hovered"
    );
  });

    if (
    clockStartIndex === null
    ) {

    if (
        clockHoverIndex !== null
    ) {

        segments[
        clockHoverIndex
        ]?.classList.add(
        "clock-hovered"
        );
    }

    return;
    }

  segments[
    clockStartIndex
  ]?.classList.add(
    "clock-selection-start"
  );

  // ==========================
  // LIVE PREVIEW
  // ==========================

  if (
    clockEndIndex === null &&
    clockHoverIndex !== null
  ) {

    const start =
      Math.min(
        clockStartIndex,
        clockHoverIndex
      );

    const end =
      Math.max(
        clockStartIndex,
        clockHoverIndex
      );

    for (
      let i = start;
      i <= end;
      i++
    ) {

      if (
        i !== clockStartIndex
      ) {

        segments[i]
          ?.classList.add(
            "clock-selection-preview"
          );
      }
    }

    return;
  }

  // ==========================
  // FINAL RANGE
  // ==========================

  if (
    clockEndIndex !== null
  ) {

    segments[
      clockEndIndex
    ]?.classList.add(
      "clock-selection-end"
    );

    for (
      let i =
        clockStartIndex + 1;
      i < clockEndIndex;
      i++
    ) {

      segments[i]
        ?.classList.add(
          "clock-selection-preview"
        );
    }
  }
}
