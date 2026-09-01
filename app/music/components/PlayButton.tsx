"use client";

import { useSyncExternalStore } from "react";
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
      {isPlaying ? "❚❚" : "▶"}
    </button>
  );
}
