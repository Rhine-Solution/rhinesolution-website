import Link from "next/link";

export default function MusicNav() {
  return (
    <nav className="music-nav" aria-label="Music portal navigation">
      <div className="music-nav-inner">
        <Link href="/music" className="music-nav-brand">
          MUSIC<span>{"//"}</span>TRENDS
        </Link>
        <ul className="music-nav-links">
          <li><Link href="/music">Home</Link></li>
          <li><Link href="/music/top-songs">Top Songs</Link></li>
          <li><Link href="/music/top-artists">Top Artists</Link></li>
          <li><Link href="/music/genres">Genres</Link></li>
        </ul>
      </div>
    </nav>
  );
}
