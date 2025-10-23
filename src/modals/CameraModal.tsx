import { useEffect, useRef } from "react";

function CameraModal({
  open,
  onClose,
  onCapture,
  facing = "user",
}: {
  open: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  facing?: "user" | "environment";
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 🎨 match SignUp palette
  const BG_FROM = "#1941f5";
  const BG_TO = "#070971";
  const BTN = "#1941f4";
  const BTN_HOVER = "#f3e752";
  const TEXT_DARK = "#040063";

  useEffect(() => {
    async function start() {
      if (!open) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        onClose();
      }
    }
    start();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [open, facing, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.60)" }} // same overlay feel
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border backdrop-blur-xl"
        style={{
          borderColor: TEXT_DARK,
          background: "rgba(255,255,255,0.10)",
          boxShadow: "0 10px 35px -12px rgba(0,0,0,0.35)",
        }}
      >
        {/* header */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b"
          style={{
            borderColor: TEXT_DARK,
            background: `linear-gradient(90deg, ${BG_FROM}, ${BG_TO})`,
          }}
        >
          <h2 className="text-white font-semibold">Take a photo</h2>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-white/90 hover:text-white hover:bg-white/10"
          >
            Close
          </button>
        </div>

        {/* body */}
        <div className="p-4">
          <video
            ref={videoRef}
            className="h-64 w-full rounded-lg object-cover bg-white"
            style={{ border: `1px solid ${TEXT_DARK}` }}
            playsInline
            muted
          />
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                const canvas = document.createElement("canvas");
                const w = v.videoWidth || 512;
                const h = v.videoHeight || 512;
                const size = Math.min(w, h);
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                const sx = (w - size) / 2;
                const sy = (h - size) / 2;
                ctx.drawImage(v, sx, sy, size, size, 0, 0, size, size);
                const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
                onCapture(dataUrl);
                onClose();
              }}
              className="flex-1 rounded-xl px-4 py-3 font-semibold transition-colors duration-150"
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
              Capture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CameraModal;
