import { useEffect, useState } from "react";

export function useCountdown(seconds: number, onEnd: () => void) {
  const [left, setLeft] = useState(seconds);
  const [pulse, setPulse] = useState<null | 10 | 20>(null);

  useEffect(() => {
    const start = Date.now();
    setLeft(seconds);
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remain = Math.max(0, seconds - elapsed);
      setLeft(remain);
      if (remain === 20 || remain === 10) {
        setPulse(remain as 10 | 20);
        setTimeout(() => setPulse(null), 700);
      }
      if (remain === 0) {
        clearInterval(id);
        onEnd();
      }
    }, 250);
    return () => clearInterval(id);
  }, [seconds, onEnd]);

  return { left, pulse };
}
