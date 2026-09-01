"use client";

export type Playable = {
  title: string;
  artist: string;
  genreId: string;
};

export type PreviewTrack = {
  trackName: string;
  artistName: string;
  previewUrl: string;
  durationSec: number;
};

export type PlayerState = {
  status: "idle" | "loading" | "playing" | "paused" | "error";
  playable: Playable | null;
  track: PreviewTrack | null;
  message: string | null;
};

const listeners = new Set<() => void>();
const trackCache = new Map<string, PreviewTrack[]>();
const indexByGenre = new Map<string, number>();

let state: PlayerState = { status: "idle", playable: null, track: null, message: null };
let audio: HTMLAudioElement | null = null;

function setState(next: PlayerState) {
  state = next;
  listeners.forEach((cb) => cb());
}

function ensureAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio();
    audio.addEventListener("ended", () => {
      setState({ ...state, status: "paused" });
    });
  }
  return audio;
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getState(): PlayerState {
  return state;
}

export async function play(playable: Playable): Promise<void> {
  const el = ensureAudio();

  if (state.playable && state.playable.genreId === playable.genreId && state.playable.title === playable.title) {
    if (el.paused) {
      await el.play();
      setState({ ...state, status: "playing" });
    } else {
      el.pause();
      setState({ ...state, status: "paused" });
    }
    return;
  }

  setState({ status: "loading", playable, track: null, message: null });

  try {
    let tracks = trackCache.get(playable.genreId);
    if (!tracks) {
      const res = await fetch(`/music/api/tracks?genre=${encodeURIComponent(playable.genreId)}`);
      if (!res.ok) throw new Error("upstream");
      const data = await res.json();
      const fetched: PreviewTrack[] = data.tracks ?? [];
      trackCache.set(playable.genreId, fetched);
      tracks = fetched;
    }
    if (!tracks || tracks.length === 0) {
      setState({ status: "error", playable, track: null, message: "No preview available for this genre" });
      return;
    }
    const idx = indexByGenre.get(playable.genreId) ?? 0;
    indexByGenre.set(playable.genreId, idx + 1);
    const track = tracks[idx % tracks.length];
    el.src = track.previewUrl;
    await el.play();
    setState({ status: "playing", playable, track, message: null });
  } catch {
    setState({ status: "error", playable, track: null, message: "No preview available for this genre" });
  }
}

export function toggle() {
  if (!audio) return;
  if (audio.paused) {
    audio.play();
    setState({ ...state, status: "playing" });
  } else {
    audio.pause();
    setState({ ...state, status: "paused" });
  }
}

export function close() {
  if (audio) {
    audio.pause();
    audio.removeAttribute("src");
  }
  setState({ status: "idle", playable: null, track: null, message: null });
}
