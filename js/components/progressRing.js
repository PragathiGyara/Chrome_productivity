// =====================================================
// PROGRESS RING COMPONENT
// =====================================================

function createProgressRing({

  radius = 70,

  stroke = 12,

  segments = []

}) {

  const normalizedRadius =
    radius - stroke / 2;

  const circumference =
    normalizedRadius * 2 * Math.PI;

  let offsetAccumulator = 0;

  const circles = segments.map(segment => {

    const segmentLength =
      (segment.value / 100) * circumference;

    const circle = `
      <circle
        class="segment ${segment.className}"
        r="${normalizedRadius}"
        cx="${radius}"
        cy="${radius}"
        stroke-dasharray="
          ${segmentLength}
          ${circumference}
        "
        stroke-dashoffset="
          ${-offsetAccumulator}
        "
        data-label="${segment.label}"
        data-count="${segment.count}"
      />
    `;

    offsetAccumulator += segmentLength;

    return circle;

  }).join("");

  return `
    <svg
      class="progress-ring"
      width="${radius * 2}"
      height="${radius * 2}"
    >
      ${circles}
    </svg>
  `;
}