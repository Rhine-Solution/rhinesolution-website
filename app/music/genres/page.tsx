import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import data from "../data/music.json";
import GenreIcon from "../components/GenreIcon";

export const metadata = {
  title: "Genres — Music Trends Local",
  description: "Browse electronic music by genre: synthwave, cyberpunk, techno, and more.",
};

export default function GenresPage() {
  const genres = data.genres.map((g) => {
    const artistCount = data.artists.filter((a) => a.genre === g.id).length;
    const songCount = data.songs.filter((s) => s.genre === g.id).length;
    const topSong = [...data.songs]
      .filter((s) => s.genre === g.id)
      .sort((a, b) => b.popularity - a.popularity)[0];
    return { ...g, artistCount, songCount, topSong };
  });

  return (
    <section className="music-container">
      <div className="section-head">
        <h2>{"// Genres"}</h2>
        <span className="meta">{genres.length} GENRES · {data.songs.length} SONGS TOTAL</span>
      </div>

      <div className="music-grid">
        {genres.map((g) => (
          <article
            key={g.id}
            id={g.id}
            className="music-card"
            style={{ "--card-color": g.color } as React.CSSProperties}
          >
            <div style={{
              color: g.color,
              textAlign: "center",
              padding: "2rem 0 1rem",
              display: "flex",
              justifyContent: "center",
              filter: `drop-shadow(0 0 25px ${g.color})`,
            }}>
              <GenreIcon genreId={g.id} size={56} />
            </div>
            <div className="music-card-body">
              <div className="music-card-title">{g.name}</div>
              <div className="music-card-artist">
                {g.artistCount} artists · {g.songCount} songs
              </div>
              {g.topSong && (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                  Top: {g.topSong.title}
                </p>
              )}
            </div>
            <div className="music-card-meta">
              <Link
                href={`/music/top-songs?genre=${g.id}`}
                className="music-btn"
                style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem" }}
              >
                Explore <FaArrowRight size={10} aria-hidden="true" style={{ verticalAlign: "-1px", marginLeft: "0.25rem" }} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
