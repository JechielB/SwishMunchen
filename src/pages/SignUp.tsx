import React, { useId, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CameraModal from "../modals/CameraModal";
import { BsPersonCircle } from "react-icons/bs";
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

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [shootingStyle, setShootingStyle] = useState<"" | ShootingStyle>("");
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [welcome, setWelcome] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const inputId = useId();

  // 🎨 Colors
  const BG_FROM = "#1941f5";
  const BG_TO = "#070971";
  const BTN = "#1941f4";
  const BTN_HOVER = "#f3e752";
  const TEXT_DARK = "#040063";
  const USER_GREY = "#797979ff";

  const courtBg = useMemo(
    () => ({
      backgroundImage: `linear-gradient(130deg, ${BG_FROM} 0%, ${BG_TO} 100%)`,
    }),
    []
  );

  function getErrors() {
    const errs: { name?: string; age?: string; preview?: string } = {};
    if (!name.trim()) errs.name = "Please enter your name";
    const ageNum = typeof age === "number" ? age : Number(age);
    if (age === "" || Number.isNaN(ageNum)) errs.age = "Please enter your age";
    else if (ageNum < 5 || ageNum > 120)
      errs.age = "Age must be between 5 and 120";
    if (!preview) errs.preview = "Please add a photo";
    return errs;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errs = getErrors();
    if (Object.keys(errs).length > 0) return;

    const ovrChoices = [75, 85, 95] as const;
    const ovr = ovrChoices[Math.floor(Math.random() * ovrChoices.length)];
    const chosenStyle: ShootingStyle = (shootingStyle ||
      "All-Around") as ShootingStyle;

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: name.trim(),
      age: typeof age === "number" ? age : Number(age),
      avatarDataUrl: preview,
      ovr,
      shootingStyle: chosenStyle,
      xp: 0,
      shotsMade: 0,
      mode: "Practice",
      savedAt: new Date().toISOString(),
    };

    const all = loadUsers();
    all.push(newPlayer);
    saveUsers(all);

    setWelcome(
      `Welcome ${newPlayer.name} — [${newPlayer.ovr} OVR] | [${newPlayer.shootingStyle}]`
    );
    setTimeout(() => {
      setWelcome(null);
      navigate("/modes");
    }, 1700);
  }

  const hasError = (key: "name" | "age" | "preview") =>
    submitted && !!getErrors()[key];

  const inputBase = "w-full rounded-lg px-3 py-2 text-sm outline-none";

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={courtBg}>
      {/* Narrower container on desktop to keep columns close */}
      <div className="relative mx-auto max-w-none sm:max-w-2xl sm:px-4 sm:py-10 md:max-w-4xl md:px-5 md:py-10">
        {/* Card shell. Note: NO blur on mobile; blur only on desktop and as a sibling layer. */}
        <div
          className="relative w-full sm:rounded-2xl sm:border"
          style={{
            borderColor: TEXT_DARK,
            boxShadow: "0 10px 35px -12px rgba(0,0,0,0.35)",
          }}
        >
          {/* Desktop-only blur sits BEHIND content to avoid native-select bugs */}
          <div
            className="pointer-events-none absolute inset-0 hidden sm:block rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(12px)",
            }}
          />

          {/* Content (no transform/overflow on ancestors near select) */}
          <div className="relative">
            <div
              className="hidden h-1.5 w-full rounded-t-2xl sm:block"
              style={{
                background: `linear-gradient(90deg, ${BG_FROM}, ${BG_TO})`,
              }}
            />

            {/* Desktop: centered app icon + centered title outside columns */}
            <div className="hidden md:flex flex-col items-center gap-3 pt-6 text-center">
              <img
                src="/images/logo.svg"
                alt="App Logo"
                className="h-12 w-auto drop-shadow"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                Create Your Player Card
              </h1>
            </div>

            {/* Grid (columns) */}
            <div className="grid gap-6 p-10 sm:p-8 md:grid-cols-2 md:gap-6 md:pt-6">
              {/* Left column: photo + actions */}
              <div className="flex flex-col items-center md:items-start gap-4">
                {/* Mobile icon + title */}
                <div className="md:hidden flex flex-col items-center text-center">
                  <img
                    src="/images/logo.svg"
                    alt="App Logo"
                    className="h-16 w-auto drop-shadow mb-2"
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                  <h1 className="text-xl font-extrabold tracking-tight text-white">
                    Create Your Player Card
                  </h1>
                </div>

                <div className="w-full max-w-[12rem]">
                  <div
                    className="group relative aspect-square w-full overflow-hidden rounded-full border-2 shadow-lg bg-white"
                    style={{
                      borderColor: hasError("preview") ? "#D2344E" : TEXT_DARK,
                    }}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Avatar preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BsPersonCircle
                          style={{
                            color: USER_GREY,
                            opacity: 0.85,
                            width: "100%",
                            height: "100%",
                          }}
                          aria-label="Default user"
                        />
                      </div>
                    )}
                  </div>

                  {submitted && getErrors().preview && (
                    <div
                      className="mt-1 text-center text-xs"
                      style={{ color: "#FFE1E6" }}
                    >
                      {getErrors().preview}
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-1 gap-1">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.mediaDevices.getUserMedia({
                            video: true,
                          });
                          setCameraOpen(true);
                        } catch {}
                      }}
                      className="rounded-xl px-4 py-2 text-xs font-semibold transition-colors duration-150"
                      style={{ background: BTN, color: "#ffffff" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = BTN_HOVER;
                        e.currentTarget.style.color = TEXT_DARK;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = BTN;
                        e.currentTarget.style.color = "#ffffff";
                      }}
                    >
                      Open Camera
                    </button>

                    {preview && (
                      <button
                        type="button"
                        onClick={() => setPreview(null)}
                        className="rounded-xl px-4 py-2 text-xs font-semibold transition-colors duration-150"
                        style={{ background: "#ffffff", color: TEXT_DARK }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f6f7ff")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "#ffffff")
                        }
                      >
                        Remove photo
                      </button>
                    )}

                    <div className="text-center mt-1">
                      <label
                        htmlFor={`${inputId}-upload`}
                        className="cursor-pointer text-xs font-semibold underline"
                        style={{ color: "#ffffff", textUnderlineOffset: "3px" }}
                      >
                        Upload Images
                      </label>
                      <input
                        id={`${inputId}-upload`}
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;
                          const f = files[0];
                          const reader = new FileReader();
                          reader.onload = () =>
                            setPreview(reader.result as string);
                          reader.readAsDataURL(f);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column: inputs (native select everywhere) */}
              <form
                id="signup-form"
                className="flex flex-col gap-3"
                onSubmit={onSubmit}
                noValidate
              >
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className={inputBase}
                    style={{
                      background: "#ffffff",
                      color: TEXT_DARK,
                      border: `1px solid ${
                        submitted && getErrors().name ? "#D2344E" : TEXT_DARK
                      }`,
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.border = `1px solid ${BTN}`)
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.border = `1px solid ${
                        submitted && getErrors().name ? "#D2344E" : TEXT_DARK
                      }`)
                    }
                  />
                  {submitted && getErrors().name && (
                    <div className="mt-1 text-xs" style={{ color: "#FFE1E6" }}>
                      {getErrors().name}
                    </div>
                  )}
                </div>

                <div>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={5}
                    max={120}
                    value={age}
                    onChange={(e) =>
                      setAge(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="Age"
                    className={inputBase}
                    style={{
                      background: "#ffffff",
                      color: TEXT_DARK,
                      border: `1px solid ${
                        submitted && getErrors().age ? "#D2344E" : TEXT_DARK
                      }`,
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.border = `1px solid ${BTN}`)
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.border = `1px solid ${
                        submitted && getErrors().age ? "#D2344E" : TEXT_DARK
                      }`)
                    }
                  />
                  {submitted && getErrors().age && (
                    <div className="mt-1 text-xs" style={{ color: "#FFE1E6" }}>
                      {getErrors().age}
                    </div>
                  )}
                </div>

                <div>
                  {/* Native select (mobile + desktop) */}
                  <select
                    value={shootingStyle}
                    onChange={(e) =>
                      setShootingStyle(e.target.value as "" | ShootingStyle)
                    }
                    className={`${inputBase} pr-8`}
                    style={{
                      background: "#ffffff",
                      color: TEXT_DARK,
                      border: `1px solid ${TEXT_DARK}`,
                      WebkitAppearance: "menulist-button", // keep native
                      appearance: "menulist", // keep native
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.border = `1px solid ${BTN}`)
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.border = `1px solid ${TEXT_DARK}`)
                    }
                  >
                    <option value="" disabled className="text-gray-400">
                      Shooting Style
                    </option>
                    {(
                      [
                        "All-Around",
                        "Sharpshooter",
                        "Shot Creator",
                        "Slasher",
                      ] as ShootingStyle[]
                    ).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* MOBILE submit (inside columns) */}
                <button
                  type="submit"
                  className="mt-1 inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-bold transition-colors duration-150 active:scale-[0.99] md:hidden"
                  style={{
                    background: BTN,
                    color: "#ffffff",
                    boxShadow: "0 6px 16px -8px rgba(0,0,0,0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = BTN_HOVER;
                    e.currentTarget.style.color = TEXT_DARK;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = BTN;
                    e.currentTarget.style.color = "#ffffff";
                  }}
                >
                  Create Profile
                </button>
              </form>
            </div>

            {/* DESKTOP submit (outside columns, centered, same size) */}
            <div className="hidden md:flex justify-center pb-8">
              <button
                type="submit"
                form="signup-form"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-bold transition-colors duration-150 active:scale-[0.99]"
                style={{
                  background: BTN,
                  color: "#ffffff",
                  boxShadow: "0 6px 16px -8px rgba(0,0,0,0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = BTN_HOVER;
                  e.currentTarget.style.color = TEXT_DARK;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = BTN;
                  e.currentTarget.style.color = "#ffffff";
                }}
              >
                Create Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Camera modal */}
      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(dataUrl) => setPreview(dataUrl)}
      />

      {/* Welcome overlay */}
      {welcome && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="w-full max-w-md sm:rounded-2xl sm:border bg-white/10 p-8 text-center text-white"
            style={{ borderColor: "rgba(255,255,255,0.25)" }}
          >
            <div className="text-xl font-bold mb-2">{welcome}</div>
            <div className="mt-4">
              <div className="mx-auto h-3 w-full max-w-xs rounded-full bg-white/20">
                <div
                  className="h-3 w-[0%] rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${BG_FROM}, ${BG_TO})`,
                  }}
                />
              </div>
              <div className="mt-1 text-xs text-white/85">XP: 0 / 1000</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
