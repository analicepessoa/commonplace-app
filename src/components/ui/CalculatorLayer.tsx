"use client";

/**
 * CalculatorLayer — botão flutuante que abre calculadoras arrastáveis. Pode
 * abrir várias ao mesmo tempo (cada uma é independente), pra fazer várias
 * contas sem fechar nenhuma. Coloque <CalculatorLayer /> em qualquer página.
 */

import { useRef, useState } from "react";

let SEQ = 0;

export default function CalculatorLayer() {
  const [calcs, setCalcs] = useState<{ id: number; x: number; y: number }[]>([]);

  function addCalc() {
    SEQ += 1;
    const offset = (calcs.length % 5) * 28;
    const baseX = typeof window !== "undefined" ? window.innerWidth - 280 : 200;
    setCalcs((prev) => [...prev, { id: SEQ, x: baseX - offset, y: 90 + offset }]);
  }
  function close(id: number) {
    setCalcs((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <>
      <button
        onClick={addCalc}
        className="fixed bottom-4 right-4 z-[80] flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-paper shadow-lg transition hover:opacity-90"
        title="Abrir uma calculadora flutuante"
      >
        🧮 Calculadora
      </button>
      {calcs.map((c) => (
        <FloatingCalculator key={c.id} initialX={c.x} initialY={c.y} onClose={() => close(c.id)} />
      ))}
    </>
  );
}

/* ── helpers de cálculo ── */
function fmt(n: number): string {
  if (!isFinite(n)) return "Erro";
  const r = Math.round((n + Number.EPSILON) * 1e8) / 1e8;
  return String(r);
}
function apply(a: number, b: number, op: string): number {
  switch (op) {
    case "+": return a + b;
    case "−": return a - b;
    case "×": return a * b;
    case "÷": return b === 0 ? NaN : a / b;
    default: return b;
  }
}

function FloatingCalculator({
  initialX,
  initialY,
  onClose,
}: {
  initialX: number;
  initialY: number;
  onClose: () => void;
}) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const [display, setDisplay] = useState("0");
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [waiting, setWaiting] = useState(false);

  function onPointerDown(e: React.PointerEvent) {
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    function move(ev: PointerEvent) {
      if (!drag.current) return;
      setPos({ x: ev.clientX - drag.current.dx, y: ev.clientY - drag.current.dy });
    }
    function up() {
      drag.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function digit(d: string) {
    if (waiting) {
      setDisplay(d);
      setWaiting(false);
    } else {
      setDisplay((s) => (s === "0" ? d : s + d));
    }
  }
  function dot() {
    if (waiting) {
      setDisplay("0.");
      setWaiting(false);
    } else if (!display.includes(".")) {
      setDisplay((s) => s + ".");
    }
  }
  function clearAll() {
    setDisplay("0");
    setAcc(null);
    setOp(null);
    setWaiting(false);
  }
  function sign() {
    setDisplay((s) => fmt(-Number(s)));
  }
  function percent() {
    setDisplay((s) => fmt(Number(s) / 100));
  }
  function chooseOp(next: string) {
    const v = Number(display);
    if (op !== null && !waiting && acc !== null) {
      const r = apply(acc, v, op);
      setAcc(r);
      setDisplay(fmt(r));
    } else {
      setAcc(v);
    }
    setOp(next);
    setWaiting(true);
  }
  function equals() {
    if (op !== null && acc !== null) {
      const r = apply(acc, Number(display), op);
      setDisplay(fmt(r));
      setAcc(null);
      setOp(null);
      setWaiting(true);
    }
  }

  const Btn = ({
    children,
    onClick,
    variant = "num",
    wide = false,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: "num" | "op" | "fn" | "eq";
    wide?: boolean;
  }) => {
    const cls =
      variant === "eq"
        ? "bg-accent text-paper hover:opacity-90"
        : variant === "op"
          ? "bg-paper-shade/70 text-accent font-bold hover:bg-paper-shade"
          : variant === "fn"
            ? "bg-paper-shade/50 text-ink-soft hover:bg-paper-shade/70"
            : "bg-paper/70 text-ink hover:bg-paper-shade/40";
    return (
      <button
        onClick={onClick}
        className={`${wide ? "col-span-2" : ""} rounded-lg py-2.5 text-lg font-medium transition ${cls}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div
      className="fixed z-[90] w-60 select-none rounded-2xl border border-[var(--rule-line)] bg-paper shadow-2xl"
      style={{ left: pos.x, top: pos.y }}
    >
      {/* Cabeçalho (alça de arraste) */}
      <div
        onPointerDown={onPointerDown}
        className="flex cursor-grab items-center justify-between rounded-t-2xl border-b border-[var(--rule-line)]/50 bg-paper-shade/40 px-3 py-1.5 active:cursor-grabbing"
      >
        <span className="font-hand text-lg text-ink">Calculadora</span>
        <button onClick={onClose} className="px-1 text-ink-soft transition hover:text-accent" title="Fechar">×</button>
      </div>

      {/* Visor */}
      <div className="px-3 pt-3">
        <div className="overflow-x-auto rounded-lg bg-paper-shade/30 px-3 py-2 text-right font-mono text-2xl text-ink tabular-nums">
          {display}
        </div>
      </div>

      {/* Teclado */}
      <div className="grid grid-cols-4 gap-1.5 p-3">
        <Btn variant="fn" onClick={clearAll}>C</Btn>
        <Btn variant="fn" onClick={sign}>±</Btn>
        <Btn variant="fn" onClick={percent}>%</Btn>
        <Btn variant="op" onClick={() => chooseOp("÷")}>÷</Btn>

        <Btn onClick={() => digit("7")}>7</Btn>
        <Btn onClick={() => digit("8")}>8</Btn>
        <Btn onClick={() => digit("9")}>9</Btn>
        <Btn variant="op" onClick={() => chooseOp("×")}>×</Btn>

        <Btn onClick={() => digit("4")}>4</Btn>
        <Btn onClick={() => digit("5")}>5</Btn>
        <Btn onClick={() => digit("6")}>6</Btn>
        <Btn variant="op" onClick={() => chooseOp("−")}>−</Btn>

        <Btn onClick={() => digit("1")}>1</Btn>
        <Btn onClick={() => digit("2")}>2</Btn>
        <Btn onClick={() => digit("3")}>3</Btn>
        <Btn variant="op" onClick={() => chooseOp("+")}>+</Btn>

        <Btn wide onClick={() => digit("0")}>0</Btn>
        <Btn onClick={dot}>,</Btn>
        <Btn variant="eq" onClick={equals}>=</Btn>
      </div>
    </div>
  );
}
