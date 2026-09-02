"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AudioCues — WebAudio SFX provider mirroring hubtown's audio system:
 *   - hover, click, modalOpen, secondaryHover, homeTransition
 *
 * Implementation: pure WebAudio synth (no audio files needed).
 * Muted by default. Toggle persisted in localStorage. Toggle UI in bottom-right.
 */

type CueName = "hover" | "click" | "modalOpen" | "secondaryHover" | "homeTransition";

const CUE_DEFS: Record<CueName, { freq: number; dur: number; type: OscillatorType; gain: number }> = {
  hover: { freq: 800, dur: 0.08, type: "sine", gain: 0.03 },
  secondaryHover: { freq: 600, dur: 0.06, type: "sine", gain: 0.025 },
  click: { freq: 220, dur: 0.12, type: "square", gain: 0.04 },
  modalOpen: { freq: 440, dur: 0.18, type: "triangle", gain: 0.05 },
  homeTransition: { freq: 180, dur: 0.5, type: "sawtooth", gain: 0.04 },
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  enabled = false;

  ensure() {
    if (!this.ctx) {
      const Ctor =
        (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) this.ctx = new Ctor();
    }
    return this.ctx;
  }

  play(cue: CueName) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();

    const def = CUE_DEFS[cue];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = def.type;
    osc.frequency.value = def.freq;
    // Slight pitch glide for richness
    osc.frequency.exponentialRampToValueAtTime(
      def.freq * 0.7,
      ctx.currentTime + def.dur
    );
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(def.gain, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + def.dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + def.dur);
  }
}

let engine: AudioEngine | null = null;
function getEngine() {
  if (typeof window === "undefined") return null;
  if (!engine) engine = new AudioEngine();
  return engine;
}

export function playCue(cue: CueName) {
  const e = getEngine();
  if (e) e.play(cue);
}

export default function AudioCues() {
  const [enabled, setEnabled] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    const e = getEngine();
    if (!e) return;
    const stored = window.localStorage.getItem("rhine-audio");
    if (stored === "on") {
      setEnabled(true);
      e.enabled = true;
    }
  }, []);

  const toggle = () => {
    const e = getEngine();
    if (!e) return;
    const next = !enabled;
    setEnabled(next);
    e.enabled = next;
    window.localStorage.setItem("rhine-audio", next ? "on" : "off");
    if (next) {
      // Unlock audio context on user gesture
      e.ensure();
      e.play("click");
    }
  };

  if (!initializedRef.current) initializedRef.current = true;

  return (
    <button
      onClick={toggle}
      aria-label={enabled ? "Mute audio cues" : "Enable audio cues"}
      title={enabled ? "Audio cues on" : "Audio cues off"}
      style={{
        position: "fixed",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
        right: "1rem",
        zIndex: 110,
        width: "3rem",
        height: "3rem",
        borderRadius: "50%",
        border: "1px solid rgba(126, 167, 255, 0.4)",
        background: enabled ? "rgba(44, 107, 255, 0.2)" : "rgba(7, 14, 36, 0.6)",
        color: "#e6ecff",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        backdropFilter: "blur(8px)",
        fontSize: "1.1rem",
      }}
      className="audio-toggle"
    >
      {enabled ? "🔊" : "🔇"}
    </button>
  );
}
