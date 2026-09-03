import * as THREE from "three";

export type SceneContext = {
  camera: THREE.PerspectiveCamera;
  scrollProgress: number; // 0..1 of total page scroll
  reducedMotion: boolean;
};

export type SceneObject = {
  group: THREE.Group;
  update: (ctx: SceneContext, dt: number, time: number) => void;
  dispose: () => void;
};

export type RhineScene = {
  name: string;
  build: () => SceneObject;
  /** 0..1 — how much this scene should be visible at given scrollProgress */
  weight: (scrollProgress: number) => number;
};

/**
 * Hermite smoothstep — smoother than linear ramp, eases in/out at edges.
 * Used by all scene weight functions to make WebGL crossfades feel organic
 * rather than abrupt. Tuned on 2026-09-03 per user feedback that linear
 * transitions "go to fast".
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Trapezoidal weight with smoothstep edges.
 * ramp:  distance over which to ramp in
 * plateau: distance at full visibility
 * out: distance over which to ramp out
 * center: scrollProgress at peak visibility
 */
export function trapWeight(
  p: number,
  start: number,
  end: number,
  ramp = 0.1
): number {
  if (p <= start - ramp || p >= end + ramp) return 0;
  if (p < start) return smoothstep(start - ramp, start, p);
  if (p > end) return smoothstep(end, end + ramp, p);
  return 1;
}

const NAVY = new THREE.Color("#070e24");
const BLUE_SOFT = new THREE.Color("#7ea7ff");
const BLUE_ACCENT = new THREE.Color("#2c6bff");
const INDIGO = new THREE.Color("#9b7eff");
const GOLD = new THREE.Color("#c4a882");

export const palette = { NAVY, BLUE_SOFT, BLUE_ACCENT, INDIGO, GOLD };
