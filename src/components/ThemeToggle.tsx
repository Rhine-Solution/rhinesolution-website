"use client";

import { useTheme } from "./ThemeProvider";

type ThemeToggleProps = {
  className?: string;
};

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      aria-pressed={theme === "dark"}
      className={className ?? "theme-toggle"}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
