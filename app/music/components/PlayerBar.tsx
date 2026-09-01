"use client";

import { useSyncExternalStore } from "react";
import { FaPlay, FaPause, FaXmark } from "react-icons/fa6";
import { subscribe, getState, toggle, close } from "../lib/playback-store";

export default function PlayerBar() {
  const state = useSyncExternalStore(subscribe, getState, getState);
  if (state.status === "idle") return null;

  const isPlaying = state.status === "playing";

  return (
    <div className="music-player-bar" role="region" aria-label="Now playing">
      <button
        className="music-player-toggle"
        onClick={toggle}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <FaPause size={16} aria-hidden="true" /> : <FaPlay size={16} aria-hidden="true" />}
      </button>
      <div className="music-player-info">
        <span className="music-player-title">{state.playable?.title}</span>
        {state.status === "loading" && (
          <span className="music-player-live">LOADING PREVIEW…</span>
        )}
        {state.track && (
          <span className="music-player-live">
            LIVE PREVIEW · {state.track.artistName} — {state.track.trackName}
          </span>
        )}
        {state.status === "error" && (
          <span className="music-player-live">{state.message}</span>
        )}
      </div>
      <button className="music-player-close" onClick={close} aria-label="Close player">
        <FaXmark size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
