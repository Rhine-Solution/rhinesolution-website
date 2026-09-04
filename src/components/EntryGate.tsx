"use client";

import { useEffect, useState } from "react";
import Turnstile from "./Turnstile";

const STORAGE_KEY = "rhine-verified";

type EntryGateProps = {
  locale: string;
  eyebrow: string;
  title: string;
  body: string;
  verifiedLabel: string;
};

export default function EntryGate({
  locale,
  eyebrow,
  title,
  body,
  verifiedLabel,
}: EntryGateProps) {
  const [verified, setVerified] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string>("");
  const [widgetFailed, setWidgetFailed] = useState(false);

  // If Turnstile isn't configured yet (during rollout / no site key),
  // never block the site — the gate simply doesn't appear.
  const configured =
    typeof process !== "undefined" && Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "verified") {
        setVerified(true);
      }
    } catch {
      /* storage unavailable — treat as not verified */
    }
  }, []);

  // Once we have a Turnstile token, validate it server-side.
  useEffect(() => {
    if (!token || verified || checking) return;
    let cancelled = false;
    setChecking(true);
    setError("");
    fetch("/api/verify-human", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json().catch(() => ({})))
      .then((data: { ok?: boolean }) => {
        if (cancelled) return;
        if (data.ok) {
          try {
            localStorage.setItem(STORAGE_KEY, "verified");
          } catch {
            /* ignore */
          }
          setVerified(true);
        } else {
          setError("Verification failed. Please try again.");
          setChecking(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError("Verification failed. Please try again.");
        setChecking(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, verified]);

  if (!configured) return null;
  if (verified) return null;

  return (
    <div className="entry-gate" role="dialog" aria-modal="true" aria-label="Verification">
      <div className="entry-gate-card">
        <p className="entry-gate-eyebrow">{eyebrow}</p>
        <h1 className="entry-gate-title">{title}</h1>
        <p className="entry-gate-body">{body}</p>

        <div className="entry-gate-challenge">
          <Turnstile
            onToken={(t) => setToken(t)}
            onExpired={() => setToken("")}
            onError={() => setWidgetFailed(true)}
            theme="dark"
          />
          {checking && <p className="entry-gate-status">Verifying…</p>}
          {error && <p className="entry-gate-error" role="alert">{error}</p>}
          {verified && <p className="entry-gate-verified">{verifiedLabel}</p>}
          {widgetFailed && (
            <div className="entry-gate-fallback">
              <p className="entry-gate-error" role="alert">
                Verification is temporarily unavailable.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  try {
                    localStorage.setItem(STORAGE_KEY, "verified");
                  } catch {
                    /* ignore */
                  }
                  setVerified(true);
                }}
              >
                Continue
              </button>
            </div>
          )}
        </div>

        <p className="entry-gate-hint">
          <span lang={locale === "nl" ? "nl" : "en"}>rhinesolution.com</span> · verifies you&apos;re human
        </p>
      </div>
    </div>
  );
}
