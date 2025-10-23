import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiX, FiCheck } from "react-icons/fi";

/* ───────── Types ───────── */
type ShootingStyle = "All-Around" | "Sharpshooter" | "Shot Creator" | "Slasher";
type Player = {
  id: string;
  name: string;
  age: number;
  avatarDataUrl: string | null;
  ovr: 75 | 85 | 95;
  shootingStyle: ShootingStyle;
  xp: number;
  shotsMade: number;
  mode?: "Practice" | "PIG";
  savedAt: string;
};

/* ───────── Storage ───────── */
const USERS_KEY = "basketball_users";
const loadUsers = (): Player[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};
const saveUsers = (users: Player[]) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

/* 🎨 Palette */
const BG_FROM = "#1941f5";
const BG_TO = "#070971"; // dark blue
const BTN = "#1941f4";
const BTN_HOVER = "#f3e752";
const TEXT_DARK = "#040063";
const ORANGE = "#e78940";

/* Assets */
const HOOP_IMG = "/images/basket-hoop.png";
const PLAYER_IMG = "/images/player-gesture.png";

/* Indicators */
type Dot = {
  id: number;
  x: number; // px relative to rim wrapper
  y: number; // px relative to rim wrapper
  kind: "make" | "miss";
  grade: number; // 0..100
};

export default function PracticeGame() {
  const navigate = useNavigate();

  // user/session
  const [player, setPlayer] = useState<Player | null>(null);
  const [startXp, setStartXp] = useState(0);

  // stats
  const [made, setMade] = useState(0);
  const [missed, setMissed] = useState(0);
  const attempts = made + missed;
  const fgPct = attempts ? Math.round((made / attempts) * 100) : 0;
  const [streak, setStreak] = useState(0);
  const [xpGain, setXpGain] = useState(0);
  const currentXP = Math.min(1000, startXp + xpGain);
  const xpPercent = (currentXP / 1000) * 100;
  const [lastGrade, setLastGrade] = useState(0);

  // timer
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isOver, setIsOver] = useState(false);
  const [pulse, setPulse] = useState<null | 10 | 20>(null);
  const [xpPulse, setXpPulse] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // indicator (keep last only)
  const [dot, setDot] = useState<Dot | null>(null);
  const seqRef = useRef(1);

  // geometry
  const rimRef = useRef<HTMLDivElement | null>(null);

  /* Prepare player */
  useEffect(() => {
    const list = loadUsers();
    const current = list.length ? list[list.length - 1] : null;
    if (!current) {
      setPlayer(null);
      return;
    }
    let updated = current;
    if (current.mode !== "Practice") {
      updated = {
        ...current,
        mode: "Practice",
        savedAt: new Date().toISOString(),
      };
      list[list.length - 1] = updated;
      saveUsers(list);
    }
    setPlayer(updated);
    setStartXp(updated.xp || 0);
  }, []);

  /* Countdown 60 → 0 */
  useEffect(() => {
    setSecondsLeft(60);
    setIsOver(false);
    setShowSummary(false);

    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          finishSession();
          return 0;
        }
        const next = prev - 1;
        if (next === 20 || next === 10) {
          setPulse(next as 10 | 20);
          setTimeout(() => setPulse(null), 700);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Make/Miss handlers */
  const onMake = () => {
    if (isOver) return;
    setMade((m) => m + 1);
    setStreak((s) => s + 1);
    setXpGain((x) => Math.min(1000, x + 5));
    placeIndicator("make");
    setXpPulse(true);
    setTimeout(() => setXpPulse(false), 550);
  };

  const onMiss = () => {
    if (isOver) return;
    setMissed((m) => m + 1);
    setStreak(0);
    placeIndicator("miss");
  };

  /* End session + persist + modal */
  const finishSession = () => {
    if (isOver) return;
    if (player) {
      const users = loadUsers();
      if (users.length) {
        const last = users[users.length - 1];
        if (last.id === player.id) {
          users[users.length - 1] = {
            ...last,
            shotsMade: (last.shotsMade || 0) + made,
            xp: Math.min(1000, (last.xp || 0) + xpGain),
            mode: "Practice",
            savedAt: new Date().toISOString(),
          };
          saveUsers(users);
          setPlayer(users[users.length - 1]);
        }
      }
    }
    setIsOver(true);
    setShowSummary(true);
  };

  /* Timer visuals (white → red in last 20s) */
  const mm = String(Math.floor(secondsLeft / 60));
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const urgency = Math.min(1, Math.max(0, (20 - secondsLeft) / 20));
  const gAndB = Math.round(255 - 175 * urgency); // 255→80
  const textColor = `rgb(255, ${gAndB}, ${gAndB})`;
  const borderColor = `rgba(255, ${gAndB}, ${gAndB}, 0.45)`;
  const glow = `0 0 ${8 + urgency * 18}px rgba(255, ${gAndB}, ${gAndB}, ${
    0.35 + 0.4 * urgency
  })`;

  /* Geometry — treat hoop as centered circle inside the square rim wrapper */
  function rimGeometry(wrapperEl: HTMLElement) {
    const rect = wrapperEl.getBoundingClientRect();
    const s = Math.min(rect.width, rect.height);
    const rPct = 0.36; // tuned to PNG inner rim
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const r = s * rPct;
    return { rect, cx, cy, r };
  }

  function placeIndicator(kind: "make" | "miss") {
    const wrapper = rimRef.current;
    if (!wrapper) return;

    const { rect, cx, cy, r } = rimGeometry(wrapper);
    const margin = 10;

    let x = cx;
    let y = cy;
    let grade = 0;

    if (kind === "make") {
      const rr = (r - margin) * Math.sqrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      x = cx + rr * Math.cos(theta);
      y = cy + rr * Math.sin(theta);
      const d = Math.hypot(x - cx, y - cy);
      grade = Math.max(0, Math.min(100, 100 * (1 - d / (r - margin))));
    } else {
      for (let i = 0; i < 200; i++) {
        const tryX = Math.random() * rect.width;
        const tryY = Math.random() * rect.height;
        const dist = Math.hypot(tryX - cx, tryY - cy);
        if (dist > r + margin) {
          x = tryX;
          y = tryY;
          break;
        }
      }
      grade = 0;
    }

    setDot({ id: seqRef.current++, x, y, kind, grade });
    setLastGrade(grade);
  }

  const pageStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(130deg, ${BG_FROM} 0%, ${BG_TO} 100%)`,
  };

  if (!player) {
    return (
      <div
        className="min-h-screen w-full text-white flex items-center justify-center px-4"
        style={pageStyle}
      >
        <div
          className="w-full max-w-md rounded-2xl border p-8 text-center bg-white/10 backdrop-blur-xl"
          style={{ borderColor: TEXT_DARK }}
        >
          <h1 className="text-2xl font-bold mb-3">No player yet</h1>
          <a
            href="/signup"
            className="rounded-2xl px-6 py-3 font-semibold inline-block"
            style={{
              background: BTN,
              color: "#fff",
              border: `1px solid ${TEXT_DARK}`,
            }}
          >
            Go to Sign Up
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen h-full w-full relative text-white"
      style={pageStyle}
    >
      {/* MAIN layout — fills viewport height (footer is floating) */}
      <div
        className="mx-auto max-w-[1500px] px-3 sm:px-4 pt-6 pb-24"
        style={{ minHeight: "100vh" }}
      >
        {/* Grid: stacks on mobile, 3 cols on lg+ */}
        <div className="grid h-full gap-4 sm:gap-5 lg:gap-7 lg:grid-cols-3 appGrid">
          {/* LEFT: stat cards (bigger, fixed size) */}
          <section className="min-h-0 flex flex-row flex-wrap lg:flex-col items-center justify-center gap-3 sm:gap-4">
            <StatCard label="SHOTS MADE" value={made} />
            <StatCard label="GRADE" value={`${lastGrade.toFixed(1)}%`} />
            <StatCard label="FG%" value={`${fgPct}%`} />
            <StatCard label="STREAK" value={streak} />
          </section>

          {/* CENTER: hoop area */}
          <section
            className="h-full min-h-[320px] relative rounded-3xl border overflow-hidden bg-white/5 backdrop-blur-xl p-3 sm:p-4 lg:p-6 flex"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            {/* Timer */}
            <div
              className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-20 rounded-xl border px-2.5 sm:px-3 py-1 sm:py-1.5 text-sm sm:text-base font-extrabold bg-black/45 backdrop-blur ${
                pulse
                  ? "timer-pulse"
                  : secondsLeft <= 20 && secondsLeft > 0
                  ? "timer-tick"
                  : ""
              }`}
              style={{ borderColor, color: textColor, boxShadow: glow }}
              aria-live="polite"
            >
              ⏱ {mm}:{ss}
            </div>

            {/* Center the square wrapper via flex */}
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <div
                ref={rimRef}
                className="relative"
                style={{
                  height: "100%",
                  aspectRatio: "1 / 1",
                  width: "min(100%, 90vh)",
                  maxHeight: "100%",
                  maxWidth: "100%",
                }}
              >
                <img
                  src={HOOP_IMG}
                  alt="Hoop"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                  draggable={false}
                />

                {/* last indicator */}
                {dot && (
                  <div
                    className="absolute"
                    style={{
                      left: dot.x - 32,
                      top: dot.y - 32,
                      width: 64,
                      height: 64,
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background:
                          dot.kind === "make"
                            ? "radial-gradient(circle at 35% 35%, rgba(140,255,176,0.35), rgba(39,194,106,0.35))"
                            : "radial-gradient(circle at 35% 35%, rgba(255,154,154,0.35), rgba(230,64,64,0.35))",
                        boxShadow:
                          dot.kind === "make"
                            ? "0 0 22px rgba(39,194,106,.45)"
                            : "0 0 22px rgba(230,64,64,.45)",
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        boxShadow:
                          dot.kind === "make"
                            ? "0 0 0 3px rgba(39,194,106,0.95) inset"
                            : "0 0 0 3px rgba(230,64,64,0.95) inset",
                      }}
                    />
                    <div className="absolute inset-0 grid place-items-center">
                      {dot.kind === "make" ? (
                        <FiCheck className="w-8 h-8" />
                      ) : (
                        <FiX className="w-8 h-8" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* RIGHT: player feed */}
          <section
            className="h-full min-h-[260px] rounded-3xl border bg-white/5 backdrop-blur-xl p-0 overflow-hidden"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            <div className="w-full h-full max-h-full bg-black/30">
              <img
                src={PLAYER_IMG}
                alt="Player"
                className="w-full h-full object-cover pointer-events-none select-none"
                draggable={false}
              />
            </div>
          </section>
        </div>

        {/* Buttons row under the three containers */}
        <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onMake}
            disabled={isOver}
            className="rounded-2xl px-6 sm:px-7 py-3 sm:py-3.5 text-base sm:text-lg font-bold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: BTN,
              color: "#fff",
              border: `1px solid ${TEXT_DARK}`,
            }}
            onMouseEnter={(e) => {
              if ((e.currentTarget as HTMLButtonElement).disabled) return;
              (e.currentTarget as HTMLButtonElement).style.background =
                BTN_HOVER;
              (e.currentTarget as HTMLButtonElement).style.color = TEXT_DARK;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = BTN;
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
          >
            Make
          </button>
          <button
            onClick={onMiss}
            disabled={isOver}
            className="rounded-2xl px-6 sm:px-7 py-3 sm:py-3.5 text-base sm:text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "#fff",
              color: TEXT_DARK,
              border: `1px solid ${TEXT_DARK}`,
            }}
          >
            Miss
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="fixed left-0 right-0 bottom-0"
        style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)" }}
      >
        <div
          className="h-[3px] w-full"
          style={{ background: `linear-gradient(90deg, ${BG_FROM}, ${BG_TO})` }}
        />
        <div className="mx-auto max-w-[1400px] px-3 sm:px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm sm:text-base">
            <span className="font-extrabold">
              PLAYER: <span className="font-semibold">{player.name}</span>
            </span>
            <span className="hidden sm:inline-block text-white/50">|</span>
            <span className="font-extrabold">
              STYLE:{" "}
              <span className="font-semibold">{player.shootingStyle}</span>
            </span>
            <span className="hidden sm:inline-block text-white/50">|</span>
            <span className="font-extrabold">
              SESSION:{" "}
              <span className="font-semibold">
                {made} / {attempts}
              </span>
            </span>
            <span className="font-extrabold relative">
              &nbsp;XP:{" "}
              <span className="font-semibold">{currentXP} / 1000</span>
              {xpPulse && (
                <span
                  className="absolute -top-4 -right-8 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: BTN_HOVER,
                    color: TEXT_DARK,
                    border: `1px solid ${TEXT_DARK}`,
                  }}
                >
                  +5
                </span>
              )}
            </span>
          </div>

          <div className="mt-2 h-2 w-full rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-2 rounded-full transition-[width] duration-300"
              style={{
                width: `${xpPercent}%`,
                background: `linear-gradient(90deg, ${BG_FROM}, ${BG_TO})`,
              }}
            />
          </div>
        </div>
      </footer>

      {/* Summary Modal */}
      {showSummary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        >
          <div
            className="w-full max-w-md sm:rounded-2xl sm:border bg-white/10 p-6 text-white text-center backdrop-blur-xl"
            style={{ borderColor: "rgba(255,255,255,0.25)" }}
          >
            <div className="text-lg font-bold mb-2">Game Over</div>
            <div className="text-sm mb-1">
              You made {made} shots • {fgPct}% FG • +{xpGain} XP
            </div>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => navigate("/leaderboard")}
                className="rounded-2xl px-5 py-2.5 font-bold transition-colors duration-150"
                style={{
                  background: BTN,
                  color: "#fff",
                  border: `1px solid ${TEXT_DARK}`,
                }}
              >
                View Leaderboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded-2xl px-5 py-2.5 font-bold"
                style={{
                  background: "#ffffff",
                  color: TEXT_DARK,
                  border: `1px solid ${TEXT_DARK}`,
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timer animations + desktop column widths + stat sizes */}
      <style>{`
        .timer-pulse { animation: timerPulse 700ms ease-out 1; }
        .timer-tick  { animation: timerTick 1000ms ease-in-out infinite; }
        @keyframes timerPulse {
          0% { transform: scale(1); filter: brightness(1); }
          30% { transform: scale(1.35); filter: brightness(1.25); }
          60% { transform: scale(1.05); filter: brightness(1.1); }
          100% { transform: scale(1); filter: brightness(1); }
        }
        @keyframes timerTick {
          0% { transform: scale(1); }
          50% { transform: scale(1.58); }
          100% { transform: scale(1); }
        }

        /* Desktop: explicit column widths so the center dominates */
        @media (min-width: 1024px) {
          .appGrid {
            grid-template-columns:
              clamp(240px, 22vw, 320px)   /* left (stats a bit wider to fit bigger chips) */
              minmax(0, 1fr)              /* center (hoop) */
              clamp(220px, 20vw, 500px);  /* right (feed)  */
          }
        }

        /* 🔳 Fixed starting size for stat chips, with responsive bumps */
        .statCard {
          width: 200px;
          height: 120px;
        }
        @media (min-width: 640px) {
          .statCard {
            width: 220px;
            height: 130px;
          }
        }
        @media (min-width: 1024px) {
          .statCard {
            width: 240px;
            height: 140px;
          }
        }
      `}</style>
    </div>
  );
}

/* ───────── Bigger, fixed-size stat card ───────── */
function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="
        statCard
        inline-flex flex-col items-center justify-center
        rounded-xl border-2
        shadow-[0_0_0_3px_rgba(231,137,64,0.15)_inset]
      "
      style={{
        background: `linear-gradient(180deg, ${BG_TO} 0%, rgba(7,9,113,0.85) 100%)`,
        borderColor: "#e78940",
      }}
    >
      <div
        className="text-xs sm:text-sm tracking-wide"
        style={{ color: "#f7caa2" }}
      >
        {label}
      </div>
      <div
        className="mt-1 text-3xl sm:text-4xl font-extrabold"
        style={{ color: "#fff" }}
      >
        {value}
      </div>
    </div>
  );
}
