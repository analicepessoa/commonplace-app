"use client";

import { useEffect, useState } from "react";

function format(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

export default function RestTimer() {
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((value) => {
        if (value > 1) return value - 1;
        setRunning(false);
        try {
          const context = new AudioContext();
          const oscillator = context.createOscillator();
          oscillator.frequency.value = 780;
          oscillator.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.35);
        } catch {
          // O navegador pode bloquear áudio sem interação; o contador ainda funciona.
        }
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  function start(seconds: number) {
    setRemaining(seconds);
    setRunning(true);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--rule-line)]/70 bg-[rgba(59,43,31,0.96)] px-3 py-3 text-paper shadow-[0_-6px_20px_rgba(59,43,31,0.22)]">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2 sm:gap-3">
        <span className="hidden text-xs font-bold uppercase tracking-widest sm:inline">Descanso</span>
        {[45, 60, 90].map((seconds) => (
          <button
            key={seconds}
            onClick={() => start(seconds)}
            className="rounded-full border border-paper/40 px-3 py-1.5 text-sm transition hover:bg-paper/15"
          >
            {seconds}s
          </button>
        ))}
        <button
          onClick={() => { setRunning(false); setRemaining(0); }}
          className="rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-paper"
        >
          Parar
        </button>
        <strong className={`min-w-18 text-center font-mono text-xl tabular-nums ${running ? "text-[#f4c66b]" : "text-paper/75"}`}>
          {format(remaining)}
        </strong>
      </div>
    </div>
  );
}
