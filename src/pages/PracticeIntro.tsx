import React from "react";
import { useNavigate } from "react-router-dom";
import { TbBallBasketball, TbTargetArrow } from "react-icons/tb";
import { LuFlame } from "react-icons/lu";

// 🎨 Palette (shared across app)
const BG_FROM = "#1941f5";
const BG_TO = "#070971";
const BTN = "#1941f4";
const BTN_HOVER = "#f3e752";
const TEXT_DARK = "#040063";

export default function PracticeIntro() {
  const navigate = useNavigate();

  const pageStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(130deg, ${BG_FROM} 0%, ${BG_TO} 100%)`,
  };

  const cardStyle: React.CSSProperties = {
    borderColor: TEXT_DARK,
    backdropFilter: "blur(8px)",
  };

  const darkBoxStyle: React.CSSProperties = {
    backgroundColor: "#070971", // deep blue
    borderColor: TEXT_DARK,
  };

  return (
    <div
      className="min-h-screen w-full text-white flex items-center justify-center px-4"
      style={pageStyle}
    >
      <div
        className="w-full max-w-md mx-auto p-6 sm:rounded-2xl sm:border sm:p-8 sm:backdrop-blur-xl text-center"
        style={cardStyle}
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <TbBallBasketball className="h-10 w-10 md:h-12 md:w-12" />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Practice Mode
          </h1>
          <p className="text-white/85 text-sm md:text-base max-w-prose">
            Track your shots. Build streaks. Earn XP.
          </p>
        </div>

        {/* How it Works (centered + shorter) */}
        <div
          className="mt-6 rounded-2xl border p-5 text-left mx-auto"
          style={{ ...darkBoxStyle, maxWidth: "28rem" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TbTargetArrow className="h-6 w-6" />
            <h2 className="text-lg font-bold">How it works</h2>
          </div>

          <ul className="space-y-2 text-sm leading-6 text-white/90">
            <li>
              • Each made shot earns <b>+5 XP</b>.
            </li>
            <li>
              • Your <b>FG%</b> and <b>streak</b> update live.
            </li>
            <li>
              • Streak 3+ shows a <LuFlame className="inline animate-pulse" />{" "}
              flame indicator.
            </li>
            <li>• End the session anytime to save progress.</li>
            <li>• Earn XP and rise up the leaderboard.</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/practice/play")}
            className="rounded-2xl px-6 py-3 font-semibold transition-colors duration-150"
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
            Start Practice
          </button>

          <button
            onClick={() => navigate(-1)}
            className="rounded-2xl px-6 py-3 font-semibold"
            style={{
              background: "#ffffff",
              color: TEXT_DARK,
              border: `1px solid ${TEXT_DARK}`,
            }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
