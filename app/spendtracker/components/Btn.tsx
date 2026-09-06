import type { ButtonHTMLAttributes, ReactNode } from "react";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export default function Btn({
  color,
  size = "md",
  className = "",
  children,
  ...rest
}: BtnProps) {
  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-xl border-2",
    md: "px-4 py-2 text-sm rounded-xl border-[3px]",
    lg: "px-6 py-3 text-base rounded-2xl border-[3px]",
  };
  const style = color
    ? { backgroundColor: color, borderColor: "var(--ink)", color: "var(--ink)" }
    : undefined;
  return (
    <button
      className={`btn-lift-sm inline-flex items-center justify-center gap-2 font-bold text-[var(--ink)] hard-shadow-sm disabled:pointer-events-none disabled:opacity-40 ${sizes[size]} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </button>
  );
}
