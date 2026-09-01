import { NextRequest, NextResponse } from "next/server";
import { GENRE_TERMS } from "../../lib/genre-terms";

export type PreviewTrack = {
  trackName: string;
  artistName: string;
  previewUrl: string;
  durationSec: number;
};

const cache = new Map<string, PreviewTrack[]>();

export async function GET(req: NextRequest) {
  const genre = req.nextUrl.searchParams.get("genre") ?? "";
  const term = GENRE_TERMS[genre];
  if (!term) {
    return NextResponse.json({ error: "Unknown genre" }, { status: 400 });
  }
  const cached = cache.get(genre);
  if (cached) {
    return NextResponse.json({ tracks: cached });
  }

  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", term);
  url.searchParams.set("media", "music");
  url.searchParams.set("limit", "5");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }
    const data = await res.json();
    const tracks: PreviewTrack[] = (data.results ?? [])
      .map((t: any) => ({
        trackName: t.trackName ?? "Unknown",
        artistName: t.artistName ?? "Unknown",
        previewUrl: t.previewUrl ?? "",
        durationSec: Math.round((t.trackTimeMillis ?? 0) / 1000),
      }))
      .filter((t: PreviewTrack) => t.previewUrl);
    cache.set(genre, tracks);
    return NextResponse.json({ tracks });
  } catch {
    return NextResponse.json({ error: "Upstream unavailable" }, { status: 502 });
  }
}
