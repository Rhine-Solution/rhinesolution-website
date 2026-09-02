export default function Loading() {
  return (
    <main
      id="main"
      className="container page"
      style={{
        textAlign: "center",
        padding: "var(--space-7) var(--space-4)",
        minHeight: "40vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        aria-label="Loading"
        style={{
          display: "inline-block",
          width: 32,
          height: 32,
          border: "2px solid rgba(126, 167, 255, 0.2)",
          borderTopColor: "#7ea7ff",
          borderRadius: "50%",
          animation: "rhine-spin 0.9s linear infinite",
        }}
      />
      <style>{`@keyframes rhine-spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
