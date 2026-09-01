"use client";

import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "./ThemeProvider";

type ThemeToggleProps = {
  className?: string;
  labels?: { theme_toggle_light: string; theme_toggle_dark: string };
};

export default function ThemeToggle({ className, labels }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  const ariaLabel = dark
    ? labels?.theme_toggle_light ?? "Switch to light mode"
    : labels?.theme_toggle_dark ?? "Switch to dark mode";
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      aria-pressed={dark}
      className={className ?? "theme-toggle"}
    >
      {dark ? <FiSun size={18} aria-hidden="true" /> : <FiMoon size={18} aria-hidden="true" />}
    </button>
  );
}