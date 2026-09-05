import Link from "next/link";
import ChatWidget from "@/components/ChatWidget";

export default function NotFound() {
  const digits = ["4", "0", "4"];
  return (
    <main id="main" className="container page not-found" style={{ textAlign: "center", padding: "var(--space-8) var(--space-4)" }}>
      <div className="not-found-orb" aria-hidden="true" />
      <p className="section-eyebrow not-found-eyebrow">404 · Lost in the void</p>
      <h1 className="not-found-title" aria-label="404">
        {digits.map((d, i) => (
          <span key={i} className="not-found-digit" style={{ animationDelay: `${i * 140}ms` }} aria-hidden="true">
            {d}
          </span>
        ))}
      </h1>
      <p className="not-found-sub">Page not found</p>
      <p className="not-found-text">The link you followed is broken, or the page has been moved.</p>
      <Link href="/en" className="btn btn-primary not-found-cta">
        Back to home
      </Link>
      <ChatWidget />
    </main>
  );
}