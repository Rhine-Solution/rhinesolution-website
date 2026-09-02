"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#070e24",
          color: "#F2F5FF",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "1rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 600,
              marginBottom: "1rem",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: "rgba(226, 234, 255, 0.85)",
              marginBottom: "1.5rem",
            }}
          >
            A fatal error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.6rem 1.25rem",
              border: "1px solid rgba(126, 167, 255, 0.5)",
              background: "#2c6bff",
              color: "#fff",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
