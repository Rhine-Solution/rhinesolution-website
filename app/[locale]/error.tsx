"use client";

import Link from "next/link";

export default function LocaleError({ reset }: { reset: () => void }) {
  return (
    <main
      id="main"
      className="container page not-found"
      style={{ textAlign: "center", padding: "var(--space-7) var(--space-4)" }}
    >
      <p
        className="section-eyebrow"
        style={{
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          fontSize: "0.85rem",
          fontWeight: 600,
          color: "#7ea7ff",
          marginBottom: "var(--space-3)",
        }}
      >
        Something went wrong
      </p>
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(2rem, 6vw, 3.5rem)",
          fontWeight: 600,
          lineHeight: 1.1,
          marginBottom: "var(--space-4)",
        }}
      >
        Unexpected error
      </h1>
      <p
        style={{
          color: "rgba(226, 234, 255, 0.85)",
          maxWidth: "46ch",
          marginInline: "auto",
          marginBottom: "var(--space-5)",
        }}
      >
        The page hit an error while loading. You can try again, or head back home.
      </p>
      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/en" className="btn btn-secondary">
          Back to home
        </Link>
      </div>
    </main>
  );
}
