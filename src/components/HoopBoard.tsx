import React, { useMemo, useRef, useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { HOOP_SCALE, getRimPx, sampleMake, sampleMiss } from "../utils/hoop";

const HOOP_IMG = "/images/basket-hoop.png";

export type Marker = {
  x: number; // wrapper-local px
  y: number; // wrapper-local px
  inside: boolean;
};

export function HoopCanvas({
  onMakePoint,
  onMissPoint,
  disabled,
  secondsLeft,
  pulse,
}: {
  onMakePoint: (grade: number) => void;
  onMissPoint: () => void;
  disabled: boolean;
  secondsLeft: number;
  pulse: null | 10 | 20;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [marker, setMarker] = useState<Marker | null>(null);

  // timer colors
  const mm = String(Math.floor(secondsLeft / 60)).padStart(1, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const urgency = Math.min(1, Math.max(0, (20 - secondsLeft) / 20));
  const gAndB = Math.round(255 - 175 * urgency);
  const textColor = `rgb(255, ${gAndB}, ${gAndB})`;
  const borderColor = `rgba(255, ${gAndB}, ${gAndB}, 0.45)`;
  const glow = `0 0 ${8 + urgency * 18}px rgba(255, ${gAndB}, ${gAndB}, ${
    0.35 + 0.4 * urgency
  })`;

  function doMake() {
    if (disabled || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const res = sampleMake(r.width, r.height);
    setMarker({ x: res.x, y: res.y, inside: true });
    onMakePoint(res.grade);
  }

  function doMiss() {
    if (disabled || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const res = sampleMiss(r.width, r.height);
    setMarker({ x: res.x, y: res.y, inside: false });
    onMissPoint();
  }

  // debug circle (optional): draw the rim we use for math
  const rimStyle = useMemo(() => {
    if (!wrapRef.current) return {};
    const r = wrapRef.current.getBoundingClientRect();
    const { cx, cy, r: rr } = getRimPx(r.width, r.height);
    return {
      left: cx - rr,
      top: cy - rr,
      width: rr * 2,
      height: rr * 2,
    };
  }, [wrapRef.current?.clientWidth, wrapRef.current?.clientHeight]);

  return (
    <section className="relative rounded-2xl border bg-white/5 border-white/15 overflow-hidden p-3 sm:p-4">
      {/* Timer */}
      <div
        className={`absolute top-3 left-3 z-20 rounded-lg border px-2.5 py-1 text-sm font-extrabold bg-black/45 backdrop-blur ${
          pulse
            ? "timer-pulse"
            : secondsLeft <= 20 && secondsLeft > 0
            ? "timer-tick"
            : ""
        }`}
        style={{ borderColor, color: textColor, boxShadow: glow }}
      >
        ⏱ {mm}:{ss}
      </div>

      {/* Hoop wrapper: aspect-square, image scaled 1.5x */}
      <div
        ref={wrapRef}
        className="relative w-full aspect-square rounded-xl bg-white/70 overflow-hidden"
      >
        <img
          src={HOOP_IMG}
          alt="Hoop"
          className="absolute inset-0 w-full h-full object-contain"
          style={{
            transform: `scale(${HOOP_SCALE})`, // ✅ bigger image x2
            transformOrigin: "50% 50%",
            pointerEvents: "none",
          }}
          draggable={false}
        />

        {/* marker background circle + icon */}
        {marker && (
          <>
            <div
              className="absolute rounded-full opacity-60"
              style={{
                left: marker.x - 90,
                top: marker.y - 90,
                width: 180,
                height: 180,
                background: marker.inside ? "#36d39933" : "#ef444433", // green/red with alpha
                border: `2px solid ${
                  marker.inside ? "#16a34a88" : "#ef444488"
                }`,
              }}
            />
            <div
              className="absolute grid place-items-center"
              style={{
                left: marker.x - 14,
                top: marker.y - 14,
                width: 28,
                height: 28,
                borderRadius: 9999,
                background: marker.inside
                  ? "radial-gradient(circle at 35% 35%, #8CFFB0, #10B981)"
                  : "radial-gradient(circle at 35% 35%, #FF9A9A, #EF4444)",
                boxShadow: marker.inside
                  ? "0 0 10px rgba(16,185,129,.6)"
                  : "0 0 10px rgba(239,68,68,.6)",
                color: "#0b0b0b",
              }}
            >
              {marker.inside ? <FiCheck /> : <FiX />}
            </div>
          </>
        )}

        {/* DEBUG: uncomment to see the mathematical rim we use */}
        {/* <div className="absolute rounded-full border-2 border-emerald-400/70" style={rimStyle} /> */}
      </div>

      {/* Controls */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          onClick={doMake}
          disabled={disabled}
          className="rounded-2xl px-6 py-3 font-bold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "#1941f4",
            color: "#fff",
            border: "1px solid #040063",
          }}
        >
          Make
        </button>
        <button
          onClick={doMiss}
          disabled={disabled}
          className="rounded-2xl px-6 py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "#ffffff",
            color: "#040063",
            border: "1px solid #040063",
          }}
        >
          Miss
        </button>
      </div>
    </section>
  );
}
