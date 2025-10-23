import React, { useEffect, useMemo, useState } from "react";
import { FiAward } from "react-icons/fi";
import { TbChartBar, TbPodium } from "react-icons/tb";

/** ───────────────── Types ───────────────── */
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

type PigScore = {
  playerId: string;
  name: string;
  age: number;
  avatarDataUrl: string | null;
  ovr: 75 | 85 | 95;
  shootingStyle: ShootingStyle;
  bestShotsMade: number;
  lastShotsMade: number;
  lastAttempts: number;
  lastAccuracy: number;
  xpTotal: number;
  updatedAt: string;
};

/** ───────────────── Keys ───────────────── */
const USERS_KEY = "basketball_users";
const PIG_KEY = "basketball_pig_scores";

/** ───────────────── Palette ───────────────── */
const BG_FROM = "#1941f5";
const BG_TO = "#070971";
const TEXT_DARK = "#040063";

/** ───────────────── Helpers ───────────────── */
function loadUsers(): Player[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function loadPigScores(): PigScore[] {
  try {
    const raw = localStorage.getItem(PIG_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function topPIG(rows: PigScore[], n = 10) {
  return [...rows]
    .sort((a, b) => (b.bestShotsMade || 0) - (a.bestShotsMade || 0))
    .slice(0, n);
}
function topPractice(players: Player[], n = 10) {
  return [...players]
    .filter((u) => (u.mode ?? "Practice") === "Practice")
    .sort((a, b) => (b.shotsMade || 0) - (a.shotsMade || 0))
    .slice(0, n);
}

/** ───────────────── Avatar ───────────────── */
function Avatar({
  src,
  alt,
  size = 48,
}: {
  src: string | null | undefined;
  alt: string;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderColor: TEXT_DARK,
        borderRadius: "50%",
      }}
      className="overflow-hidden border bg-white shrink-0"
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-[10px]"
          style={{ color: TEXT_DARK }}
        >
          No photo
        </div>
      )}
    </div>
  );
}

/** ───────────────── Main Component ───────────────── */
export default function Leaderboard() {
  const [practiceTop, setPracticeTop] = useState<Player[]>([]);
  const [pigTop, setPigTop] = useState<PigScore[]>([]);
  const [potd, setPotd] = useState<any>(null);

  useEffect(() => {
    const users = loadUsers();
    const pig = loadPigScores();
    const pTop10 = topPractice(users, 10);
    const gTop10 = topPIG(pig, 10);
    setPracticeTop(pTop10);
    setPigTop(gTop10);

    const bestPractice = pTop10[0];
    const bestPig = gTop10[0];

    let candidate: any = null;
    if (bestPractice && bestPig) {
      if ((bestPractice.shotsMade || 0) >= (bestPig.bestShotsMade || 0)) {
        candidate = {
          mode: "Practice",
          name: bestPractice.name,
          avatar: bestPractice.avatarDataUrl,
          ovr: bestPractice.ovr,
          style: bestPractice.shootingStyle,
          shots: bestPractice.shotsMade || 0,
          xp: bestPractice.xp || 0,
        };
      } else {
        candidate = {
          mode: "PIG",
          name: bestPig.name,
          avatar: bestPig.avatarDataUrl,
          ovr: bestPig.ovr,
          style: bestPig.shootingStyle,
          shots: bestPig.bestShotsMade || 0,
          xp: bestPig.xpTotal || 0,
        };
      }
    } else if (bestPractice) {
      candidate = {
        mode: "Practice",
        name: bestPractice.name,
        avatar: bestPractice.avatarDataUrl,
        ovr: bestPractice.ovr,
        style: bestPractice.shootingStyle,
        shots: bestPractice.shotsMade || 0,
        xp: bestPractice.xp || 0,
      };
    } else if (bestPig) {
      candidate = {
        mode: "PIG",
        name: bestPig.name,
        avatar: bestPig.avatarDataUrl,
        ovr: bestPig.ovr,
        style: bestPig.shootingStyle,
        shots: bestPig.bestShotsMade || 0,
        xp: bestPig.xpTotal || 0,
      };
    }
    setPotd(candidate);
  }, []);

  const titlePractice = "Munich Leaderboard — Practice (Shots Made)";
  const titlePig = "Munich Leaderboard — PIG (Best Makes)";

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden text-white sm:flex sm:items-center sm:justify-center"
      style={{
        backgroundImage: `linear-gradient(130deg, ${BG_FROM} 0%, ${BG_TO} 100%)`,
      }}
    >
      <div className="relative z-10 mx-0 w-full max-w-none px-4 py-8 sm:mx-auto sm:w-full sm:max-w-6xl sm:px-6 sm:py-8">
        {/* Player of the Day */}
        <section
          className="rounded-2xl border-0 bg-white/10 p-4 sm:rounded-3xl sm:border sm:p-8 sm:backdrop-blur-xl"
          style={{
            borderColor: TEXT_DARK,
            boxShadow: "0 10px 35px -12px rgba(0,0,0,0.35)",
          }}
        >
          <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:justify-start">
            <FiAward className="h-5 w-5 text-white" />
            <h2 className="text-lg sm:text-xl font-extrabold">
              Player of the Day
            </h2>
            <FiAward className="h-5 w-5 text-white" />
          </div>

          {potd ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 flex-wrap">
              {/* Left: avatar + info */}
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <Avatar src={potd.avatar} alt={potd.name} size={64} />
                <div className="min-w-0">
                  <div className="text-base sm:text-lg font-semibold truncate">
                    {potd.name}
                  </div>
                  <div className="text-xs sm:text-sm text-white/80 truncate">
                    {potd.mode} • OVR {potd.ovr} • {potd.style}
                  </div>
                  <div className="mt-2 h-3 w-full rounded-full bg-white/15">
                    <div
                      className="h-3 rounded-full"
                      style={{
                        width: `${Math.min(100, (potd.xp / 1000) * 100)}%`,
                        background: `linear-gradient(90deg, ${BG_FROM}, ${BG_TO})`,
                      }}
                    />
                  </div>
                  <div className="mt-1 text-[11px] sm:text-xs text-white/85">
                    XP: {potd.xp} / 1000
                  </div>
                </div>
              </div>

              {/* Right on desktop, but LEFT on mobile */}
              <div className="mt-2 sm:mt-0 text-left sm:text-right self-end sm:self-auto">
                <div className="text-xl sm:text-2xl text-right font-bold">
                  {potd.shots}
                </div>
                <div className="text-[11px] sm:text-xs text-white/80">
                  Top Makes
                </div>
              </div>
            </div>
          ) : (
            <div className="text-white/85">No players yet.</div>
          )}
        </section>

        {/* Boards */}
        <div className="mt-6 grid gap-3 sm:gap-6 sm:grid-cols-2">
          <BoardCard
            title={titlePractice}
            icon={<TbChartBar className="h-8 w-8 lg:h-5 lg:w-5 text-white" />}
          >
            <ScrollableTable>
              <TablePractice rows={practiceTop} />
            </ScrollableTable>
          </BoardCard>

          <BoardCard
            title={titlePig}
            icon={<TbPodium className="h-8 w-8 lg:h-5 lg:w-5 text-white" />}
          >
            <ScrollableTable>
              <TablePig rows={pigTop} />
            </ScrollableTable>
          </BoardCard>
        </div>
      </div>
    </div>
  );
}

/** ───────────────── Reusable Card & Table Scroller ───────────────── */
function BoardCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border-0 bg-white/10 p-4 sm:rounded-3xl sm:border sm:p-6 sm:backdrop-blur-xl overflow-hidden"
      style={{
        borderColor: TEXT_DARK,
        boxShadow: "0 10px 35px -12px rgba(0,0,0,0.35)",
      }}
    >
      <div className="mb-3 sm:mb-4 flex items-center">
        <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold">
          {icon}
          {title}
        </h2>
      </div>

      {/* Child scrolls inside; card width matches POTD */}
      <div>{children}</div>
    </section>
  );
}

/** Wraps a table with its own scroll area (both axes) + iOS momentum */
function ScrollableTable({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="
        w-full
        overflow-x-auto overflow-y-auto
        max-h-[60vh]
        rounded-2xl sm:rounded-xl
      "
      // Ensure the inner scroller owns the swipe on mobile Safari/Chrome
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x pan-y" }}
    >
      {children}
    </div>
  );
}

/** ───────────────── Tables ───────────────── */
function TablePractice({ rows }: { rows: Player[] }) {
  return (
    <table className="w-full table-auto border-collapse text-xs sm:text-sm min-w-[520px] whitespace-nowrap">
      <thead>
        <tr
          className="text-left sticky top-0 z-10"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(2px)",
          }}
        >
          <th className="px-1 py-2 sm:px-2 text-white/90 w-6 sm:w-10">#</th>
          {/* remove hard width; let it grow on desktop */}
          <th className="px-1 py-2 sm:px-2 text-white/90">Player</th>
          <th className="px-1 py-2 sm:px-2 text-white/90 w-12 sm:w-16 text-center">
            OVR
          </th>
          <th className="px-1 py-2 sm:px-2 text-white/90 w-20 sm:w-32">
            Style
          </th>
          <th className="px-1 py-2 sm:px-2 text-white/90 w-14 sm:w-20 text-right">
            Shots
          </th>
          <th className="px-1 py-2 sm:px-2 text-white/90 w-20 sm:w-32">XP</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td
              colSpan={6}
              className="px-1 sm:px-2 py-6 text-left text-white/85"
            >
              No players yet.
            </td>
          </tr>
        )}
        {rows.map((p, idx) => (
          <tr
            key={p.id}
            style={{
              background: idx % 2 ? "rgba(255,255,255,0.06)" : "transparent",
            }}
          >
            <td className="px-1 sm:px-2 py-2 align-middle tabular-nums">
              {idx + 1}
            </td>
            <td className="px-1 sm:px-2 py-2 align-middle">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Avatar src={p.avatarDataUrl} alt={p.name} size={40} />
                {/* constrain on mobile, relax on desktop */}
                <div className="min-w-0 max-w-[180px] sm:max-w-[320px]">
                  <div className="font-semibold truncate">{p.name}</div>
                  <div className="text-[11px] sm:text-xs text-white/85 truncate">
                    Age {p.age}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-1 sm:px-2 py-2 align-middle text-center tabular-nums">
              {p.ovr}
            </td>
            <td className="px-1 sm:px-2 py-2 align-middle">
              {p.shootingStyle}
            </td>
            <td className="px-1 sm:px-2 py-2 text-right align-middle tabular-nums">
              {p.shotsMade || 0}
            </td>
            <td className="px-1 sm:px-2 py-2 align-middle">
              <div className="h-2 w-full rounded-full bg-white/15">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, (p.xp || 0) / 10)}%`,
                    background: `linear-gradient(90deg, ${BG_FROM}, ${BG_TO})`,
                  }}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TablePig({ rows }: { rows: PigScore[] }) {
  return (
    <table className="w-full table-auto border-collapse text-xs sm:text-sm min-w-[640px] whitespace-nowrap">
      <thead>
        <tr
          className="text-left sticky top-0 z-10"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(2px)",
          }}
        >
          <th className="px-1 py-2 sm:px-2 text-white/90 w-6 sm:w-10">#</th>
          {/* remove hard width; let it grow on desktop */}
          <th className="px-1 py-2 sm:px-2 text-white/90">Player</th>
          <th className="px-1 py-2 sm:px-2 text-white/90 w-12 sm:w-16 text-center">
            OVR
          </th>
          <th className="px-1 py-2 sm:px-2 text-white/90 w-20 sm:w-32">
            Style
          </th>
          <th className="px-1 py-2 sm:px-2 text-white/90 w-14 sm:w-20 text-right">
            Accuracy
          </th>
          <th className="px-1 py-2 sm:px-2 text-white/90 w-14 sm:w-20 text-right">
            Shots
          </th>
          <th className="px-1 py-2 sm:px-2 text-white/90 w-20 sm:w-32">XP</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td
              colSpan={7}
              className="px-1 sm:px-2 py-6 text-left text-white/85"
            >
              No players yet.
            </td>
          </tr>
        )}
        {rows.map((r, idx) => (
          <tr
            key={r.playerId}
            style={{
              background: idx % 2 ? "rgba(255,255,255,0.06)" : "transparent",
            }}
          >
            <td className="px-1 sm:px-2 py-2 align-middle tabular-nums">
              {idx + 1}
            </td>
            <td className="px-1 sm:px-2 py-2 align-middle">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Avatar src={r.avatarDataUrl} alt={r.name} size={40} />
                {/* constrain on mobile, relax on desktop */}
                <div className="min-w-0 max-w-[180px] sm:max-w-[320px]">
                  <div className="font-semibold truncate">{r.name}</div>
                  <div className="text-[11px] sm:text-xs text-white/85 truncate">
                    Age {r.age}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-1 sm:px-2 py-2 align-middle text-center tabular-nums">
              {r.ovr}
            </td>
            <td className="px-1 sm:px-2 py-2 align-middle">
              {r.shootingStyle}
            </td>
            <td className="px-1 sm:px-2 py-2 align-middle text-right tabular-nums">
              {Number.isFinite(r.lastAccuracy) ? `${r.lastAccuracy}%` : "—"}
            </td>
            <td className="px-1 sm:px-2 py-2 align-middle text-right tabular-nums">
              {r.bestShotsMade || 0}
            </td>
            <td className="px-1 sm:px-2 py-2 align-middle">
              <div className="h-2 w-full rounded-full bg-white/15">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, (r.xpTotal || 0) / 10)}%`,
                    background: `linear-gradient(90deg, ${BG_FROM}, ${BG_TO})`,
                  }}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
