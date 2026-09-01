"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import data from "./data/music.json";

type Song = typeof data.songs[number];
type Genre = typeof data.genres[number];
type Artist = typeof data.artists[number];

type SortKey = "popularity-desc" | "popularity-asc" | "title" | "year";

export default function SongExplorer() {
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("popularity-desc");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [modalSong, setModalSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [dynamicTitle, setDynamicTitle] = useState("Top Songs");
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("rhine-music-favorites");
      if (stored) setFavorites(JSON.parse(stored));
    } catch {}
    setTimeout(() => setLoading(false), 400);
  }, []);

  // Persist favorites
  useEffect(() => {
    try {
      localStorage.setItem("rhine-music-favorites", JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  // Dynamic page title
  useEffect(() => {
    if (genreFilter !== "all") {
      const g = data.genres.find((x) => x.id === genreFilter);
      setDynamicTitle(`Top Songs · ${g?.name}`);
    } else if (query) {
      setDynamicTitle(`Search: ${query}`);
    } else {
      setDynamicTitle("Top Songs");
    }
    document.title = `${dynamicTitle} — Music Trends Local`;
  }, [genreFilter, query, dynamicTitle]);

  const filtered = useMemo(() => {
    let songs = [...data.songs];
    if (genreFilter !== "all") {
      songs = songs.filter((s) => s.genre === genreFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      songs = songs.filter((s) => {
        const artist = data.artists.find((a) => a.id === s.artist);
        return (
          s.title.toLowerCase().includes(q) ||
          (artist?.name.toLowerCase().includes(q) ?? false)
        );
      });
    }
    songs.sort((a, b) => {
      switch (sort) {
        case "popularity-desc": return b.popularity - a.popularity;
        case "popularity-asc": return a.popularity - b.popularity;
        case "title": return a.title.localeCompare(b.title);
        case "year": return b.year - a.year;
      }
    });
    return songs;
  }, [genreFilter, query, sort]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const getArtist = (id: string) => data.artists.find((a) => a.id === id);
  const getGenre = (id: string) => data.genres.find((g) => g.id === id);

  return (
    <>
      {loading && <div className="music-loading">LOADING</div>}

      <section className="music-container">
        <div className="section-head">
          <h2>// Top Songs</h2>
          <span className="meta">{filtered.length} / {data.songs.length} SONGS · {favorites.length} ★</span>
        </div>

        <div className="controls">
          <div style={{ flex: 1, minWidth: 200 }}>
            <label htmlFor="search">▸ SEARCH</label>
            <input
              id="search"
              type="search"
              placeholder="Title or artist..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="genre">▸ GENRE</label>
            <select id="genre" value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
              <option value="all">All ({data.songs.length})</option>
              {data.genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.icon} {g.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort">▸ SORT</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              <option value="popularity-desc">Popularity ↓</option>
              <option value="popularity-asc">Popularity ↑</option>
              <option value="title">Title A-Z</option>
              <option value="year">Year (newest)</option>
            </select>
          </div>
        </div>

        <div ref={resultsRef} className="music-grid">
          {filtered.length === 0 ? (
            <div className="music-empty" style={{ gridColumn: "1 / -1" }}>
              ▢ NO RESULTS · Try a different search or genre
            </div>
          ) : (
            filtered.map((song) => {
              const artist = getArtist(song.artist);
              const genre = getGenre(song.genre);
              const isFav = favorites.includes(song.id);
              return (
                <article
                  key={song.id}
                  className="music-card"
                  style={{ "--card-color": genre?.color } as React.CSSProperties}
                  onClick={() => setModalSong(song)}
                >
                  <button
                    className={`music-card-favorite ${isFav ? "active" : ""}`}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(song.id); }}
                    aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                    aria-pressed={isFav}
                  >
                    {isFav ? "★" : "☆"}
                  </button>
                  <img src={song.image} alt={`${song.title} by ${artist?.name}`} width={400} height={400} />
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
            })
          )}
        </div>
      </section>

      {modalSong && (
        <div className="music-modal-overlay" onClick={() => setModalSong(null)}>
          <div className="music-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="modal-title">
            <div className="music-modal-header">
              <h3 id="modal-title">▶ {modalSong.title}</h3>
              <button className="music-modal-close" onClick={() => setModalSong(null)} aria-label="Close">✕</button>
            </div>
            <div className="music-modal-body">
              <img src={modalSong.image} alt={modalSong.title} className="music-modal-img" width={400} height={400} />
              <p style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                {getArtist(modalSong.artist)?.name}
              </p>
              <p>{getArtist(modalSong.artist)?.bio}</p>
              <div className="music-modal-stats">
                <div><span>Genre</span>{getGenre(modalSong.genre)?.icon} {getGenre(modalSong.genre)?.name}</div>
                <div><span>Year</span>{modalSong.year}</div>
                <div><span>Popularity</span>{Math.floor(modalSong.popularity)}%</div>
                <div><span>Duration</span>{Math.floor(modalSong.duration / 60)}:{(modalSong.duration % 60).toString().padStart(2, "0")}</div>
              </div>
              <button
                className={`music-btn ${favorites.includes(modalSong.id) ? "music-btn-primary" : ""}`}
                onClick={() => toggleFavorite(modalSong.id)}
                style={{ alignSelf: "flex-start" }}
              >
                {favorites.includes(modalSong.id) ? "★ In Favorites" : "☆ Add to Favorites"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
