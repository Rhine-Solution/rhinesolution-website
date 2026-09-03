"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileStatus =
  | { state: "loading" }
  | { state: "ready"; token: string }
  | { state: "expired" }
  | { state: "error" };

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        opts: {
          sitekey: string;
          theme: "dark" | "light" | "auto";
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string | undefined;
      reset: (widgetId?: string) => void;
    };
  }
}

type TurnstileProps = {
  onToken: (token: string) => void;
  onExpired?: () => void;
  theme?: "dark" | "light" | "auto";
};

function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();
    const existing = document.querySelector(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("failed to load")));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("failed to load"));
    document.head.appendChild(s);
  });
}

let scriptLoading: Promise<void> | null = null;
function ensureScript(): Promise<void> {
  if (!scriptLoading) scriptLoading = loadTurnstileScript();
  return scriptLoading;
}

export default function Turnstile({ onToken, onExpired, theme = "dark" }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const [status, setStatus] = useState<TurnstileStatus>({ state: "loading" });
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    let cancelled = false;
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    if (!siteKey) {
      setStatus({ state: "error" });
      return;
    }

    ensureScript()
      .then(() => {
        if (cancelled || !window.turnstile || !containerRef.current) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token: string) => {
            onToken(token);
            setStatus({ state: "ready", token });
          },
          "expired-callback": () => {
            onExpiredRef.current?.();
            setStatus({ state: "expired" });
          },
          "error-callback": () => {
            setStatus({ state: "error" });
          },
        });
        setStatus({ state: "loading" });
      })
      .catch(() => {
        setStatus({ state: "error" });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`turnstile turnstile--${status.state}`}>
      <div
        ref={containerRef}
        className="turnstile-widget"
        aria-label="Verification"
        role="region"
      />
      {status.state === "error" && (
        <p className="turnstile-error">Verification unavailable.</p>
      )}
    </div>
  );
}
