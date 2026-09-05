"use client";

import { useEffect, useState } from "react";

/**
 * IntroLoader — full-screen overlay shown on first visit for ~1.6s.
 * Plays a brand-mark animation then fades out. Persists a "seen" flag
 * in sessionStorage so it only runs once per tab session.
 * Auto-disabled when prefers-reduced-motion is set.
 */
export default function IntroLoader() {
  const [show, setShow] = useState(false);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let seen = false;
    try {
      seen = Boolean(window.sessionStorage.getItem("rhine-intro-seen"));
    } catch {
      /* storage unavailable */
    }
    if (seen) return;

    setShow(true);
    const t1 = window.setTimeout(() => setHide(true), 1300);
    const t2 = window.setTimeout(() => {
      setShow(false);
      try {
        window.sessionStorage.setItem("rhine-intro-seen", "1");
      } catch {
        /* storage unavailable */
      }
    }, 1900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  if (!show) return null;
  return (
    <div className={`intro-loader ${hide ? "intro-loader-hide" : ""}`} aria-hidden="true">
      <div className="intro-mark">
        <span className="intro-letter" style={{ animationDelay: "0ms" }}>R</span>
        <span className="intro-letter" style={{ animationDelay: "80ms" }}>S</span>
      </div>
      <div className="intro-bar"><div className="intro-bar-fill" /></div>
    </div>
  );
}
