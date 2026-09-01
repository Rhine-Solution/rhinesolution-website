"use client";

import { useState, useEffect, useMemo } from "react";
import data from "./data/music.json";
import PlayButton from "./components/PlayButton";

type Artist = typeof data.artists[number];
type SortKey = "popularity-desc" | "name" | "songs-desc";

export default function ArtistExplorer() {
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("popularity-desc");
  const [modalArtist, setModalArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [dynamicTitle, setDynamicTitle] = useState("Top Artists");

  useEffect(() => {
    setTimeout(() => setLoading(false), 400);
  }, []);

  useEffect(() => {
    document.title = `${dynamicTitle} — Music Trends Local`;
  }, [dynamicTitle]);

  useEffect(() => {
    if (genreFilter !== "all") {
      const g = data.genres.find((x) => x.id === genreFilter);
      setDynamicTitle(`Top Artists · ${g?.name}`);
    } else if (query) {
      setDynamicTitle(`Artists matching: ${query}`);
    } else {
      setDynamicTitle("Top Artists");
    }
  }, [genreFilter, query]);

  const artists = useMemo(() => {
    let arr = [...data.artists];
    if (genreFilter !== "all") {
      arr = arr.filter((a) => a.genre === genreFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((a) => a.name.toLowerCase().includes(q) || a.bio.toLowerCase().includes(q));
    }
    arr.sort((a, b) => {
      switch (sort) {
        case "popularity-desc": return b.popularity - a.popularity;
        case "name": return a.name.localeCompare(b.name);
        case "songs-desc": {
          const aCount = data.songs.filter((s) => s.artist === a.id).length;
          const bCount = data.songs.filter((s) => s.artist === b.id).length;
          return bCount - aCount;
        }
      }
    });
    return arr;
  }, [genreFilter, query, sort]);

  const getGenre = (id: string) => data.genres.find((g) => g.id === id);
  const getArtistSongs = (id: string) => data.songs.filter((s) => s.artist === id);

  return (
    <>
      {loading && <div className="music-loading">LOADING</div>}

      <section className="music-container">
        <div className="section-head">
          <h2>// Top Artists</h2>
          <span className="meta">{artists.length} / {data.artists.length} ARTISTS</span>
        </div>

        <div className="controls">
          <div style={{ flex: 1, minWidth: 200 }}>
            <label htmlFor="artist-search">▸ SEARCH</label>
            <input
              id="artist-search"
              type="search"
              placeholder="Artist name or bio..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="artist-genre">▸ GENRE</label>
            <select id="artist-genre" value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
              <option value="all">All</option>
              {data.genres.map((g) => (
                <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="artist-sort">▸ SORT</label>
            <select id="artist-sort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              <option value="popularity-desc">Popularity ↓</option>
              <option value="name">Name A-Z</option>
              <option value="songs-desc">Songs count ↓</option>
            </select>
          </div>
        </div>

        <div className="music-grid">
          {artists.length === 0 ? (
            <div className="music-empty" style={{ gridColumn: "1 / -1" }}>
              ▢ NO RESULTS
            </div>
          ) : (
            artists.map((artist) => {
              const genre = getGenre(artist.genre);
              const songs = getArtistSongs(artist.id);
              const topSong = songs.sort((a, b) => b.popularity - a.popularity)[0];
              return (
                <article
                  key={artist.id}
                  className="music-card"
                  style={{ "--card-color": genre?.color } as React.CSSProperties}
                  onClick={() => setModalArtist(artist)}
                >
                  {topSong && (
                    <img src={topSong.image} alt={`${artist.name} album`} width={400} height={400} />
                  )}
                  <div className="music-card-body">
                    <div className="music-card-title">{artist.name}</div>
                    <div className="music-card-artist">{genre?.name} · {songs.length} songs</div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      {artist.bio}
                    </p>
                  </div>
                  <div className="music-card-meta">
                    <span>{Math.floor(artist.popularity)}%</span>
                    <span>{genre?.icon}</span>
                  </div>
                  <div className="popularity-bar">
                    <div className="popularity-bar-fill" style={{ width: `${artist.popularity}%`, background: genre?.color }} />
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {modalArtist && (
        <div className="music-modal-overlay" onClick={() => setModalArtist(null)}>
          <div className="music-modal" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="music-modal-header">
              <h3>▶ {modalArtist.name}</h3>
              <button className="music-modal-close" onClick={() => setModalArtist(null)} aria-label="Close">✕</button>
            </div>
            <div className="music-modal-body">
              <p style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>
                {getGenre(modalArtist.genre)?.icon} {getGenre(modalArtist.genre)?.name}
              </p>
              <p>{modalArtist.bio}</p>
              <h4 style={{ marginTop: "1rem" }}>▸ Top 3 Songs</h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {getArtistSongs(modalArtist.id)
                  .sort((a, b) => b.popularity - a.popularity)
                  .slice(0, 3)
                  .map((s) => (
                    <li key={s.id} style={{
                      fontFamily: "var(--font-mono)",
                      padding: "0.5rem",
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)"
                    }}>
                      ▸ {s.title} <span style={{ color: "var(--text-muted)" }}>({s.year}) · {Math.floor(s.popularity)}%</span>
                      <PlayButton
                        playable={{ title: s.title, artist: modalArtist.name, genreId: s.genre }}
                      />
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
