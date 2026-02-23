/**
 * Returns a Tailwind-compatible inline color for heatmap tiles.
 * ratio: 0 = best (green), 1 = worst (red)
 */
export function scaleColor(ratio: number, inverted = false): string {
  const t = inverted ? 1 - Math.max(0, Math.min(1, ratio)) : Math.max(0, Math.min(1, ratio));

  // Green (22, 163, 74) → Amber (234, 179, 8) → Red (220, 38, 38)
  let r: number, g: number, b: number;
  if (t < 0.5) {
    const s = t * 2;
    r = Math.round(22 + s * (234 - 22));
    g = Math.round(163 + s * (179 - 163));
    b = Math.round(74 + s * (8 - 74));
  } else {
    const s = (t - 0.5) * 2;
    r = Math.round(234 + s * (220 - 234));
    g = Math.round(179 + s * (38 - 179));
    b = Math.round(8 + s * (38 - 8));
  }
  return `rgb(${r},${g},${b})`;
}

/**
 * Compute a 0–1 ratio for a given metric across all cities.
 */
export function metricRatio(
  value: number,
  allValues: number[],
): number {
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}
