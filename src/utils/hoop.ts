export type RimPct = { cx: number; cy: number; r: number };

// ✅ Bigger hoop scale (x2)
export const HOOP_SCALE = 2.0;

export const RIM_PCT: RimPct = {
  cx: 0.5,
  cy: 0.5,
  r: 0.35,
};

export type SampleResult = {
  x: number;
  y: number;
  inside: boolean;
  grade: number;
};

export function getRimPx(wrapperW: number, wrapperH: number) {
  const s = Math.min(wrapperW, wrapperH);
  const cx = s * RIM_PCT.cx;
  const cy = s * RIM_PCT.cy;
  const r = s * RIM_PCT.r * HOOP_SCALE;
  return { cx, cy, r, side: s };
}

function uniformPointInCircle(cx: number, cy: number, r: number, margin = 10) {
  const rr = (r - margin) * Math.sqrt(Math.random());
  const theta = Math.random() * Math.PI * 2;
  return { x: cx + rr * Math.cos(theta), y: cy + rr * Math.sin(theta) };
}

export function sampleMake(wrapperW: number, wrapperH: number): SampleResult {
  const { cx, cy, r } = getRimPx(wrapperW, wrapperH);
  const { x, y } = uniformPointInCircle(cx, cy, r, 10);
  const d = Math.hypot(x - cx, y - cy);
  const grade = Math.max(0, Math.min(100, 100 * (1 - d / r)));
  return { x, y, inside: true, grade };
}

export function sampleMiss(wrapperW: number, wrapperH: number): SampleResult {
  const { cx, cy, r } = getRimPx(wrapperW, wrapperH);
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * wrapperW;
    const y = Math.random() * wrapperH;
    if (Math.hypot(x - cx, y - cy) > r + 15) {
      return { x, y, inside: false, grade: 0 };
    }
  }
  return { x: cx + r + 20, y: cy, inside: false, grade: 0 };
}
