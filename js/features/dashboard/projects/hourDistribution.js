const DISTRIBUTION_COLORS = [

  "#0b5c0e",

  "#00745e",

  "#0085a8",

  "#478dd7",

  "#b38cdb",

  "#f391bf",

  "#ffab9e",

  "#ffd391"

];

// =====================================================
// HOUR DISTRIBUTION
// =====================================================

function renderHourDistribution() {

  renderExpectedHourDistribution();

}


function renderExpectedHourDistribution() {

  const totalElement =
    document.getElementById("expectedHoursTotal");

  const canvas =
    document.getElementById("expectedHourDistributionCanvas");

  const legend =
    document.getElementById("expectedHourDistributionLegend");

  if (!totalElement || !canvas || !legend) {
    return;
  }

  const activeProjects =
    getProjectsForSelectedDate();

  const data =
    activeProjects.map(project => ({
      name: project.name,
      value: project.targetHoursPerDay
    }));

  const totalHours =
    data.reduce(
      (sum, project) =>
        sum + project.value,
      0
    );

  totalElement.textContent =
    formatHours(totalHours);

  drawPieChart(canvas, data);

  renderPieLegend(legend, data);

}

// =====================================================
// DRAW PIE CHART
// =====================================================

function drawPieChart(
  canvas,
  data
) {

  const ctx =
    canvas.getContext("2d");

  const width =
    canvas.width;

  const height =
    canvas.height;

  const centerX =
    width / 2;

  const centerY =
    height / 2;

  const radius =
    Math.min(
      width,
      height
    ) / 2 - 10;

  ctx.clearRect(
    0,
    0,
    width,
    height
  );

  const total =
    data.reduce(
      (sum, item) =>
        sum + item.value,
      0
    );

  if (total === 0) {

    ctx.fillStyle =
      "#888";

    ctx.font =
      "16px sans-serif";

    ctx.textAlign =
      "center";

    ctx.fillText(
      "No Data",
      centerX,
      centerY
    );

    return;

  }

  let startAngle =
    -Math.PI / 2;

  data.forEach(
    (item, index) => {

      const sliceAngle =
        (item.value / total) *
        Math.PI *
        2;

      ctx.beginPath();

      ctx.moveTo(
        centerX,
        centerY
      );

      ctx.arc(
        centerX,
        centerY,
        radius,
        startAngle,
        startAngle +
          sliceAngle
      );

      ctx.closePath();

      ctx.fillStyle =
        DISTRIBUTION_COLORS[
          index %
          DISTRIBUTION_COLORS.length
        ];

      ctx.fill();

    startAngle +=
        sliceAngle;

    }

  );

}


// =====================================================
// GENERATE PIE COLORS
// =====================================================

function generatePieColors(
  count
) {

  const colors = [];

  for (
    let i = 0;
    i < count;
    i++
  ) {

    const hue =
      (360 / count) * i;

    colors.push(
      `hsl(${hue}, 70%, 60%)`
    );

  }

  return colors;

}

// =====================================================
// RENDER PIE LEGEND
// =====================================================

function renderPieLegend(
  legend,
  data
) {

  legend.innerHTML = "";

  data.forEach(
    (item, index) => {

      const row =
        document.createElement(
          "div"
        );

      row.className =
        "hour-distribution-legend-item";

      row.innerHTML = `

        <div
          class="hour-distribution-legend-left"
        >

          <span
            class="hour-distribution-legend-color"
            style="
              background:
              ${
                DISTRIBUTION_COLORS[
                  index %
                  DISTRIBUTION_COLORS.length
                ]
              };
            "
          ></span>

          <span>
            ${item.name}
          </span>

        </div>

        <span>
          ${formatHours(
            item.value
          )}
        </span>

      `;

      legend.appendChild(
        row
      );

    }

  );

}