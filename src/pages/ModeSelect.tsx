import React from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentPlayer, upsertUser } from "../lib/storage";
import type { Player } from "../lib/storage";

import { TbBallBasketball } from "react-icons/tb";
import { RiTrophyLine } from "react-icons/ri";

function useCurrentPlayer(): Player | null {
  return getCurrentPlayer();
}

export default function ModeSelect() {
  const navigate = useNavigate();
  const player = useCurrentPlayer();

  // 🎨 Palette
  const BG_FROM = "#1941f5";
  const BG_TO = "#070971";
  const BTN = "#1941f4";
  const BTN_HOVER = "#f3e752";
  const TEXT_DARK = "#040063";

  const pageStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(130deg, ${BG_FROM} 0%, ${BG_TO} 100%)`,
  };
  const cardStyle: React.CSSProperties = {
    borderColor: TEXT_DARK,
    backdropFilter: "blur(8px)",
  };
  const primaryBtnBase =
    "rounded-2xl px-6 py-3 font-semibold transition-colors duration-150";
  const tileBase =
    "rounded-2xl border p-6 text-left transition-colors duration-150";

  // ModeSelect.tsx
  function pickMode(mode: "Practice" | "PIG") {
    if (!player) return; // no guests
    // set the user's current mode explicitly
    const next = { ...player, mode, savedAt: new Date().toISOString() };
    upsertUser(next);

    if (mode === "Practice") {
      navigate("/practice");
    } else {
      navigate("/pig");
    }
  }

  if (!player) {
    return (
      <div
        className="min-h-screen w-full text-white flex items-center justify-center"
        style={pageStyle}
      >
        <div
          className="w-full max-w-none mx-0 p-6 sm:mx-4 sm:w-full sm:max-w-md sm:rounded-2xl sm:border sm:p-8"
          style={cardStyle}
        >
          <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-center">
            No player yet
          </h1>
          <div className="flex justify-center">
            <a
              href="/signup"
              className={primaryBtnBase}
              style={{
                background: BTN,
                color: "#ffffff",
                border: `1px solid ${TEXT_DARK}`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background =
                  BTN_HOVER;
                (e.currentTarget as HTMLAnchorElement).style.color = TEXT_DARK;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = BTN;
                (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
              }}
            >
              Go to Sign Up
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full text-white flex items-center justify-center"
      style={pageStyle}
    >
      <div
        className="w-full max-w-none mx-0 p-6 sm:mx-4 sm:w-full sm:max-w-2xl sm:rounded-2xl sm:border sm:p-8"
        style={cardStyle}
      >
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-center">
          Choose Your Mode
        </h1>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => pickMode("Practice")}
            className={tileBase}
            style={{
              borderColor: TEXT_DARK,
              background: "rgba(255,255,255,0.12)",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.18)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.12)")
            }
          >
            <div className="flex items-center gap-2 mb-1">
              <TbBallBasketball className="h-7 w-7 md:h-6 md:w-6 text-white" />
              <div className="text-xl font-bold">Practice Mode</div>
            </div>
            <div className="text-sm text-white/80">
              Skill tracking and personal improvement
            </div>
          </button>

          <button
            onClick={() => pickMode("PIG")}
            className={tileBase}
            style={{
              borderColor: TEXT_DARK,
              background: "rgba(255,255,255,0.12)",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.18)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.12)")
            }
          >
            <div className="flex items-center gap-2 mb-1">
              <RiTrophyLine className="h-7 w-7 md:h-6 md:w-6 text-white" />
              <div className="text-xl font-bold">PIG Mode</div>
            </div>
            <div className="text-sm text-white/80">
              Competitive challenges and leaderboards
            </div>
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/leaderboard")}
            className={primaryBtnBase}
            style={{
              background: BTN,
              color: "#ffffff",
              border: `1px solid ${TEXT_DARK}`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                BTN_HOVER;
              (e.currentTarget as HTMLButtonElement).style.color = TEXT_DARK;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = BTN;
              (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
            }}
          >
            View Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
