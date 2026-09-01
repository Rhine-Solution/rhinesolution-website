import music from "./data/music.json";
import Link from "next/link";

export const metadata = {
  title: "Music Trends Local — Discover Electronic Music",
};

export default function MusicHome() {
  const totalSongs = music.songs.length;
  const totalArtists = music.artists.length;
  const topSongs = [...music.songs].sort((a, b) => b.popularity - a.popularity).slice(0, 6);
  const genres = music.genres;

  return (
    <div>
      <section className="music-hero">
        <h1>Music Trends Local</h1>
        <p>
          Curated electronic, synthwave, and cyberpunk music. {totalSongs} songs, {totalArtists} artists,
          {" "}{genres.length} genres. Built with local data — no API, no tracking, just music.
        </p>
        <div className="music-hero-cta">
          <Link href="/music/top-songs" className="music-btn music-btn-primary">
            ▸ Top Songs
          </Link>
          <Link href="/music/genres" className="music-btn">
            ◢ Genres
          </Link>
          <Link href="/music/top-artists" className="music-btn">
            ◆ Artists
          </Link>
        </div>
      </section>

      <section className="music-container">
        <div className="section-head">
          <h2>// Trending Now</h2>
          <span className="meta">TOP {topSongs.length} BY POPULARITY</span>
        </div>
        <div className="music-grid" style={{ marginBottom: "4rem" }}>
          {topSongs.map((song) => {
            const artist = music.artists.find((a) => a.id === song.artist);
            const genre = music.genres.find((g) => g.id === song.genre);
            return (
              <article
                key={song.id}
                className="music-card"
                style={{ "--card-color": genre?.color } as React.CSSProperties}
              >
                <img src={song.image} alt={`${song.title} cover`} width={400} height={400} />
                <div className="music-card-body">
                  <div className="music-card-title">{song.title}</div>
                  <div className="music-card-artist">{artist?.name}</div>
                  <span
                    className="music-genre-badge"
                    style={{ "--badge-color": genre?.color, alignSelf: "flex-start" } as React.CSSProperties}
                  >
                    {genre?.icon} {genre?.name}
                  </span>
                </div>
                <div className="music-card-meta">
                  <span>{song.year}</span>
                  <span>{Math.floor(song.popularity)}%</span>
                </div>
                <div className="popularity-bar">
                  <div className="popularity-bar-fill" style={{ width: `${song.popularity}%`, background: genre?.color }} />
                </div>
              </article>
            );
          })}
        </div>

        <div className="section-head">
          <h2>// Browse by Genre</h2>
          <span className="meta">{genres.length} GENRES</span>
        </div>
        <div className="music-grid">
          {genres.map((g) => (
            <Link
              key={g.id}
              href={`/music/genres#${g.id}`}
              className="music-card"
              style={{ "--card-color": g.color, textDecoration: "none" } as React.CSSProperties}
            >
              <div style={{
                fontSize: "3rem",
                color: g.color,
                textAlign: "center",
                padding: "2rem 0",
                fontFamily: "var(--font-mono)",
                textShadow: `0 0 20px ${g.color}`
              }}>
                {g.icon}
              </div>
              <div className="music-card-body">
                <div className="music-card-title">{g.name}</div>
                <div className="music-card-artist">
                  {music.artists.filter((a) => a.genre === g.id).length} artists · {" "}
                  {music.songs.filter((s) => s.genre === g.id).length} songs
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
