import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  color?: string;
  glow?: boolean;
}

export default function Card({ children, className = "", color, glow }: CardProps) {
  return (
    <div
      className={`rounded-2xl border-[3px] border-[var(--ink)] bg-card text-[var(--ink)] hard-shadow ${glow ? "card-glow" : ""} ${className}`}
      style={
        color
          ? { backgroundColor: color }
          : undefined
      }
    >
      {children}
    </div>
  );
}
