"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import {
  FaPlay, FaXmark, FaStar, FaRegStar, FaMagnifyingGlass, FaFilter, FaArrowDownAZ,
  FaTriangleExclamation,
} from "react-icons/fa6";
import data from "./data/music.json";
import PlayButton from "./components/PlayButton";
import GenreIcon from "./components/GenreIcon";

type Song = typeof data.songs[number];

type SortKey = "popularity-desc" | "popularity-asc" | "title" | "year";

export default function SongExplorer() {
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("popularity-desc");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [modalSong, setModalSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
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
    const g = genreFilter !== "all" ? data.genres.find((x) => x.id === genreFilter) : undefined;
    const title = g ? `Top Songs · ${g.name}` : query ? `Search: ${query}` : "Top Songs";
    document.title = `${title} — Music Trends Local`;
  }, [genreFilter, query]);

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
          <h2>{"// Top Songs"}</h2>
          <span className="meta">{filtered.length} / {data.songs.length} SONGS · {favorites.length} <FaStar size={11} aria-hidden="true" style={{ verticalAlign: "-1px", color: "var(--accent-magenta, #fb2576)" }} /></span>
        </div>

        <div className="controls">
          <div style={{ flex: 1, minWidth: 200 }}>
            <label htmlFor="search"><FaMagnifyingGlass size={11} aria-hidden="true" /> SEARCH</label>
            <input
              id="search"
              type="search"
              placeholder="Title or artist..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="genre"><FaFilter size={11} aria-hidden="true" /> GENRE</label>
            <select id="genre" value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
              <option value="all">All ({data.songs.length})</option>
              {data.genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort"><FaArrowDownAZ size={11} aria-hidden="true" /> SORT</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              <option value="popularity-desc">Popularity: high to low</option>
              <option value="popularity-asc">Popularity: low to high</option>
              <option value="title">Title A-Z</option>
              <option value="year">Year: newest</option>
            </select>
          </div>
        </div>

        <div ref={resultsRef} className="music-grid">
          {filtered.length === 0 ? (
            <div className="music-empty" style={{ gridColumn: "1 / -1" }}>
              <FaTriangleExclamation size={18} aria-hidden="true" /> NO RESULTS · Try a different search or genre
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
                    {isFav ? <FaStar size={16} aria-hidden="true" /> : <FaRegStar size={16} aria-hidden="true" />}
                  </button>
                  <PlayButton
                    playable={{ title: song.title, artist: artist?.name ?? "Unknown", genreId: song.genre }}
                  />
                  <Image src={song.image} alt={`${song.title} by ${artist?.name}`} width={400} height={400} />
                  <div className="music-card-body">
                    <div className="music-card-title">{song.title}</div>
                    <div className="music-card-artist">{artist?.name}</div>
                    <span
                      className="music-genre-badge"
                      style={{ "--badge-color": genre?.color, alignSelf: "flex-start" } as React.CSSProperties}
                    >
                      {genre && <GenreIcon genreId={genre.id} size={12} />} {genre?.name}
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
              <h3 id="modal-title">
                <FaPlay size={14} aria-hidden="true" style={{ verticalAlign: "-2px", color: "var(--accent-cyan, #00ffff)" }} />{" "}
                {modalSong.title}
              </h3>
              <button className="music-modal-close" onClick={() => setModalSong(null)} aria-label="Close"><FaXmark size={16} aria-hidden="true" /></button>
            </div>
            <div className="music-modal-body">
              <Image src={modalSong.image} alt={modalSong.title} className="music-modal-img" width={400} height={400} />
              <p style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                {getArtist(modalSong.artist)?.name}
              </p>
              <p>{getArtist(modalSong.artist)?.bio}</p>
              <div className="music-modal-stats">
                <div><span>Genre</span><GenreIcon genreId={modalSong.genre} size={14} /> {getGenre(modalSong.genre)?.name}</div>
                <div><span>Year</span>{modalSong.year}</div>
                <div><span>Popularity</span>{Math.floor(modalSong.popularity)}%</div>
                <div><span>Duration</span>{Math.floor(modalSong.duration / 60)}:{(modalSong.duration % 60).toString().padStart(2, "0")}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", alignSelf: "flex-start" }}>
                <PlayButton
                  playable={{ title: modalSong.title, artist: getArtist(modalSong.artist)?.name ?? "Unknown", genreId: modalSong.genre }}
                />
                <button
                  className={`music-btn ${favorites.includes(modalSong.id) ? "music-btn-primary" : ""}`}
                  onClick={() => toggleFavorite(modalSong.id)}
                >
                  {favorites.includes(modalSong.id) ? (<><FaStar size={14} aria-hidden="true" /> In Favorites</>) : (<><FaRegStar size={14} aria-hidden="true" /> Add to Favorites</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
