"use client";

import { useSyncExternalStore } from "react";
import { FaPlay, FaPause } from "react-icons/fa6";
import { subscribe, getState, play } from "../lib/playback-store";
import type { Playable } from "../lib/playback-store";

export default function PlayButton({ playable }: { playable: Playable }) {
  const state = useSyncExternalStore(subscribe, getState, getState);
  const isCurrent =
    state.playable?.genreId === playable.genreId &&
    state.playable?.title === playable.title;
  const isPlaying = isCurrent && state.status === "playing";

  return (
    <button
      className={`music-play-btn ${isCurrent ? "active" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        play(playable);
      }}
      aria-label={isPlaying ? `Pause ${playable.title}` : `Play ${playable.title}`}
    >
      {isPlaying ? <FaPause size={14} aria-hidden="true" /> : <FaPlay size={14} aria-hidden="true" />}
    </button>
  );
}
