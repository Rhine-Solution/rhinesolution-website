import Link from "next/link";
import ChatWidget from "@/components/ChatWidget";

export default function NotFound() {
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
        404
      </p>
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(2.5rem, 8vw, 5rem)",
          fontWeight: 600,
          lineHeight: 1.05,
          marginBottom: "var(--space-4)",
        }}
      >
        Page not found
      </h1>
      <p
        style={{
          color: "rgba(226, 234, 255, 0.85)",
          maxWidth: "46ch",
          marginInline: "auto",
          marginBottom: "var(--space-5)",
        }}
      >
        The link you followed is broken, or the page has been moved.
      </p>
      <Link href="/en" className="btn btn-primary">
        Back to home
      </Link>
      <ChatWidget />
    </main>
  );
}
