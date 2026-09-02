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

const NAVY = new THREE.Color("#070e24");
const BLUE_SOFT = new THREE.Color("#7ea7ff");
const BLUE_ACCENT = new THREE.Color("#2c6bff");
const INDIGO = new THREE.Color("#9b7eff");
const GOLD = new THREE.Color("#c4a882");

export const palette = { NAVY, BLUE_SOFT, BLUE_ACCENT, INDIGO, GOLD };
