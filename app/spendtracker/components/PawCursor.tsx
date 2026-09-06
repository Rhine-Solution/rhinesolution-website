"use client";

import { useEffect, useRef, useState } from "react";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  color: string;
  rot: number;
}

const SPARKLE_COLORS = ["#ffc4e1", "#bdecd0", "#d7c9ff", "#ffd7b0", "#c4d4ff"];

export default function PawCursor() {
  const pawRef = useRef<HTMLDivElement>(null);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const sparkleId = useRef(0);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    const move = (e: MouseEvent) => {
      if (pawRef.current) {
        pawRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) scale(1)`;
      }
      const shouldSparkle = Math.random() < 0.35;
      if (shouldSparkle) {
        const id = ++sparkleId.current;
        const s: Sparkle = {
          id,
          x: e.clientX + (Math.random() * 16 - 8),
          y: e.clientY + (Math.random() * 16 - 8),
          color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
          rot: Math.floor(Math.random() * 360),
        };
        setSparkles((prev) => [...prev.slice(-30), s]);
        window.setTimeout(() => {
          setSparkles((prev) => prev.filter((p) => p.id !== id));
        }, 700);
      }
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      <div ref={pawRef} className="paw-cursor" aria-hidden="true" />
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="paw-sparkle"
          style={
            {
              left: s.x,
              top: s.y,
              backgroundColor: s.color,
              "--rot": `${s.rot}deg`,
              animation: "fade-in-up 0.7s ease-out forwards",
            } as React.CSSProperties
          }
          aria-hidden="true"
        />
      ))}
    </>
  );
}
