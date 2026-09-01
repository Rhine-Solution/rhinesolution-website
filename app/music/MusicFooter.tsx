import Link from "next/link";

export default function MusicFooter() {
  return (
    <footer className="music-footer">
      <div className="music-footer-inner">
        <Link href="/en" className="music-footer-back">
          ◀ Rhine Solution
        </Link>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          MUSIC_TRENDS_LOCAL v1.0 — Built by Rhine Solution
        </span>
      </div>
    </footer>
  );
}

