// Geometry helpers for the hoop image

export type Circle = { cx: number; cy: number; r: number };

/** Random point uniformly inside a circle (with optional inner margin) */
export function sampleInsideCircle(c: Circle, margin = 0) {
  const R = Math.max(0, c.r - margin);
  const r = R * Math.sqrt(Math.random());
  const t = Math.random() * Math.PI * 2;
  return { x: c.cx + r * Math.cos(t), y: c.cy + r * Math.sin(t) };
}

/** Random point outside the circle but inside provided rect [0..w, 0..h] */
export function sampleOutsideCircle(
  c: Circle,
  w: number,
  h: number,
  margin = 10,
  maxTries = 120
) {
  for (let i = 0; i < maxTries; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const dist = Math.hypot(x - c.cx, y - c.cy);
    if (dist > c.r + margin) return { x, y };
  }
  // Fallback: near right edge
  return {
    x: Math.min(w - 8, c.cx + c.r + margin + 4),
    y: Math.min(h - 8, c.cy),
  };
}

/** Is a point inside the circle? */
export function isInsideCircle(
  p: { x: number; y: number },
  c: Circle,
  margin = 0
) {
  return Math.hypot(p.x - c.cx, p.y - c.cy) <= c.r - margin;
}
