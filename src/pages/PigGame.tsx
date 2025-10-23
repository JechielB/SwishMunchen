import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ---- Types (same as before)
type ShootingStyle = "All-Around" | "Sharpshooter" | "Shot Creator" | "Slasher";
type Player = {
  id: string;
  name: string;
  age: number;
  avatarDataUrl: string | null;
  ovr: 75 | 85 | 95;
  shootingStyle: ShootingStyle;
  xp: number; // 0..1000
  shotsMade: number; // (Practice legacy)
  mode?: "Practice" | "PIG";
  savedAt: string;
};

// ---- Storage
const USERS_KEY = "basketball_users";
const PIG_KEY = "basketball_pig_scores";

type PigScore = {
  playerId: string;
  name: string;
  age: number;
  avatarDataUrl: string | null;
  ovr: 75 | 85 | 95;
  shootingStyle: "All-Around" | "Sharpshooter" | "Shot Creator" | "Slasher";
  bestShotsMade: number; // ranked by this
  lastShotsMade: number; // last session
  lastAttempts: number; // makes + misses
  lastAccuracy: number; // 0..100 integer
  xpTotal: number; // snapshot of player's XP after this session
  updatedAt: string;
};

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

const loadPigScores = (): PigScore[] => {
  try {
    const raw = localStorage.getItem(PIG_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};
const savePigScores = (rows: PigScore[]) =>
  localStorage.setItem(PIG_KEY, JSON.stringify(rows));

// 🎨 Palette (match SignUp)
const BG_FROM = "#1941f5";
const BG_TO = "#070971";
const BTN = "#1941f4";
const BTN_HOVER = "#f3e752";
const TEXT_DARK = "#040063";

export default function PigGame() {
  const navigate = useNavigate();

  // game state
  const [makes, setMakes] = useState(0);
  const [misses, setMisses] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const total = makes + misses;

  // UI blips
  const [flash, setFlash] = useState<string | null>(null);

  // Animation control
  const [arcKey, setArcKey] = useState(0);
  const [lastResult, setLastResult] = useState<"make" | "miss" | null>(null);

  // Summary modal
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState({ line1: "", line2: "" });

  const accuracy = total ? Math.round((makes / total) * 100) : 0;

  // retrigger on every shot
  useEffect(() => {
    if (total > 0) setArcKey((k) => k + 1);
  }, [total]);

  function recordMake() {
    setMakes((m) => m + 1);
    setXpGained((x) => Math.min(1000, x + 5));
    setLastResult("make");
  }

  function recordMiss() {
    const next = misses + 1;
    setMisses(next);
    setLastResult("miss");
    setFlash(`Letter Earned: ${next === 1 ? "P" : next === 2 ? "PI" : "PIG"}`);
    setTimeout(() => setFlash(null), 800);
  }

  // End game when misses === 3
  useEffect(() => {
    if (misses < 3) return;

    const users = loadUsers();
    const current: Player | null = users.length
      ? users[users.length - 1]
      : null;

    const totalAttempts = makes + misses;
    const acc = totalAttempts ? Math.round((makes / totalAttempts) * 100) : 0;

    // Build summary text (leader based on PIG board)
    const pigRows = loadPigScores();
    const currentPigLeader =
      pigRows.length > 0
        ? pigRows.reduce(
            (best, r) =>
              (r.bestShotsMade || 0) > (best.bestShotsMade || 0) ? r : best,
            pigRows[0]
          )
        : null;

    const line1 = `You made ${makes} shots | ${acc}% accuracy | +${xpGained} XP.`;
    let line2 = "No leader yet.";
    if (currentPigLeader) {
      const diff = currentPigLeader.bestShotsMade - makes;
      if (diff > 0) {
        line2 = `You're ${diff} shots behind ${currentPigLeader.name} – current leader with ${currentPigLeader.bestShotsMade} makes.`;
      } else if (diff === 0) {
        line2 = `You're tied with ${currentPigLeader.name} – current leader with ${currentPigLeader.bestShotsMade} makes.`;
      } else {
        line2 = `You're the new leader! (${makes} makes)`;
      }
    }

    // If guest, just show modal and exit
    if (!current) {
      setSummaryText({ line1, line2 });
      setShowSummary(true);
      return;
    }

    // Logged-in user: update XP in USERS
    const updatedUsers = [...users];
    const idx = updatedUsers.length - 1;
    updatedUsers[idx] = {
      ...current,
      xp: Math.min(1000, (current.xp || 0) + xpGained),
      savedAt: new Date().toISOString(),
    };
    saveUsers(updatedUsers);

    // Upsert into PIG store
    const pig = loadPigScores();
    const now = new Date().toISOString();
    const existingIndex = pig.findIndex((r) => r.playerId === current.id);
    const base: PigScore =
      existingIndex >= 0
        ? pig[existingIndex]
        : {
            playerId: current.id,
            name: current.name,
            age: current.age,
            avatarDataUrl: current.avatarDataUrl,
            ovr: current.ovr,
            shootingStyle: current.shootingStyle,
            bestShotsMade: 0,
            lastShotsMade: 0,
            lastAttempts: 0,
            lastAccuracy: 0,
            xpTotal: updatedUsers[idx].xp || 0,
            updatedAt: now,
          };

    const next: PigScore = {
      ...base,
      name: current.name,
      age: current.age,
      avatarDataUrl: current.avatarDataUrl,
      ovr: current.ovr,
      shootingStyle: current.shootingStyle,
      lastShotsMade: makes,
      lastAttempts: totalAttempts,
      lastAccuracy: acc,
      bestShotsMade: Math.max(base.bestShotsMade || 0, makes),
      xpTotal: updatedUsers[idx].xp || 0,
      updatedAt: now,
    };

    if (existingIndex >= 0) pig[existingIndex] = next;
    else pig.push(next);
    savePigScores(pig);

    // Show summary
    setSummaryText({ line1, line2 });
    setShowSummary(true);
  }, [misses, makes, xpGained]);

  function setSummaryFor(updated: PigScore | null) {
    const line1 = `You made ${makes} shots | ${accuracy}% accuracy | +${xpGained} XP.`;

    const pig = loadPigScores();
    const leader =
      pig.length > 0
        ? pig.reduce((best, s) =>
            s.bestShotsMade > best.bestShotsMade ? s : best
          )
        : null;

    let line2 = "No leader yet.";
    if (leader) {
      const diff = leader.bestShotsMade - makes;
      if (diff > 0) {
        line2 = `You're ${diff} shots behind ${leader.name} – current PIG leader with ${leader.bestShotsMade} makes.`;
      } else if (diff === 0) {
        line2 = `You're tied with ${leader.name} – current PIG leader with ${leader.bestShotsMade} makes.`;
      } else {
        line2 = `You're the new PIG leader! (${makes} makes)`;
      }
    }

    setSummaryText({ line1, line2 });
    setShowSummary(true);
  }

  return (
    <div
      className="min-h-screen w-full text-white flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(130deg, ${BG_FROM} 0%, ${BG_TO} 100%)`,
      }}
    >
      <div
        className="w-full max-w-none mx-0 p-6 sm:mx-4 sm:w-full sm:max-w-3xl sm:rounded-2xl sm:border sm:p-8 sm:backdrop-blur-xl"
        style={{ borderColor: TEXT_DARK }}
      >
        {/* P I G letters */}
        <div className="flex items-center justify-center gap-3 mb-4">
          {["P", "I", "G"].map((L, i) => {
            const active = i < misses;
            return (
              <div
                key={L}
                className="h-10 w-10 flex items-center justify-center rounded-full font-extrabold"
                style={{
                  background: active ? BTN_HOVER : "rgba(255,255,255,0.12)",
                  color: active ? TEXT_DARK : "#fff",
                  border: `1px solid ${TEXT_DARK}`,
                }}
              >
                {L}
              </div>
            );
          })}
        </div>

        {/* Arc animation container */}
        <div
          className="relative overflow-hidden rounded-xl border mb-4"
          style={{
            borderColor: TEXT_DARK,
            background: "rgba(255,255,255,0.10)",
          }}
        >
          <div className="aspect-[16/5] w-full relative">
            {/* New animated shot */}
            <ShotArc outcome={lastResult} fireToken={arcKey} />
          </div>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
          <Stat label="Made" value={makes} />
          <Stat label="Missed" value={misses} />
          <Stat label="Accuracy" value={`${accuracy}%`} />
          <div
            className="rounded-xl border p-3"
            style={{
              borderColor: TEXT_DARK,
              background: "rgba(255,255,255,0.08)",
            }}
          >
            <div className="text-xs text-white/80 mb-1">XP</div>
            <div
              className="h-2 w-full rounded-full"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(xpGained / 1000) * 100}%`,
                  background: `linear-gradient(90deg, ${BG_FROM}, ${BG_TO})`,
                }}
              />
            </div>
            <div className="mt-1 text-xs text-white/85">+{xpGained} / 1000</div>
          </div>
        </div>

        {/* Demo controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={recordMake}
            className="rounded-2xl px-6 py-3 font-bold transition-colors duration-150"
            style={{
              background: BTN,
              color: "#fff",
              border: `1px solid ${TEXT_DARK}`,
            }}
            onMouseEnter={(e) => {
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
            onClick={recordMiss}
            className="rounded-2xl px-6 py-3 font-bold transition-colors duration-150"
            style={{
              background: "#ffffff",
              color: TEXT_DARK,
              border: `1px solid ${TEXT_DARK}`,
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "#f6f7ff")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "#ffffff")
            }
          >
            Miss
          </button>
        </div>

        {/* Flash on miss */}
        {flash && (
          <div className="mt-4 text-center">
            <span
              className="inline-block rounded-full px-4 py-2 font-bold"
              style={{
                background: BTN_HOVER,
                color: TEXT_DARK,
                border: `1px solid ${TEXT_DARK}`,
              }}
            >
              {flash}
            </span>
          </div>
        )}
      </div>

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
            <div className="text-sm mb-1">{summaryText.line1}</div>
            <div className="text-sm text-white/85">{summaryText.line2}</div>

            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => navigate("/leaderboard")}
                className="rounded-2xl px-5 py-2.5 font-bold transition-colors duration-150"
                style={{
                  background: BTN,
                  color: "#fff",
                  border: `1px solid ${TEXT_DARK}`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    BTN_HOVER;
                  (e.currentTarget as HTMLButtonElement).style.color =
                    TEXT_DARK;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = BTN;
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                }}
              >
                View Leaderboard
              </button>
              <button
                onClick={() => navigate(-1)}
                className="rounded-2xl px-5 py-2.5 font-bold"
                style={{
                  background: "#ffffff",
                  color: TEXT_DARK,
                  border: `1px solid ${TEXT_DARK}`,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  const TEXT_DARK = "#040063";
  return (
    <div
      className="rounded-xl border p-3"
      style={{ borderColor: TEXT_DARK, background: "rgba(255,255,255,0.08)" }}
    >
      <div className="text-xs text-white/80">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

/* =========================
   Framer Motion Shot Arc
   ========================= */
function ShotArc({
  outcome,
  fireToken,
}: {
  outcome: "make" | "miss" | null;
  fireToken: number;
}) {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!outcome) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1100);
    return () => clearTimeout(t);
  }, [outcome, fireToken]);

  // Tweak these to match your layout
  const makeX = [0, 120, 220];
  const makeY = [0, -110, -8];
  const missX = [0, 120, 220, 200];
  const missY = [0, -100, -2, 30];

  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Hoop (top-right) */}
      <div className="absolute right-8 top-4 w-16 h-10">
        <div className="mx-auto h-2 w-14 rounded-full bg-white/85" />
        <div className="mx-auto mt-1 h-6 w-10 border-t-4 border-white/70 border-dashed" />
      </div>

      <AnimatePresence>
        {show && outcome && (
          <motion.div
            key={fireToken}
            className="absolute left-6 bottom-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {/* Ball */}
            <motion.div
              className="h-6 w-6 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, #ff9a00 20%, #e86b00 60%)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.35)",
              }}
              animate={{
                x: outcome === "make" ? makeX : missX,
                y: outcome === "make" ? makeY : missY,
                rotate: outcome === "make" ? [0, 180, 360] : [0, 240, 300, 360],
              }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            />

            {/* Swish highlight on make */}
            {outcome === "make" && (
              <motion.div
                className="absolute -right-1 top-12 h-3 w-12 rounded-full bg-white/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0], y: [0, 6, 10] }}
                transition={{ duration: 0.35, delay: 0.65 }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
