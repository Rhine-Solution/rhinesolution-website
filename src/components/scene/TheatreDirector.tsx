"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { getProject, types } from "@theatre/core";

/**
 * TheatreDirector — declares keyframeable objects per scene (mirroring hubtown's
 * `G.theatre.objects[SceneName][Prop]`), then scrubs their values from
 * scroll each frame (mirroring their GSAP ScrollTrigger pattern).
 *
 * Per-scene values are mirrored onto THREE.Group.userData so per-scene
 * `update` functions can read them.
 */
export default function TheatreDirector({
  scrollProgressRef,
  sceneObjects,
}: {
  scrollProgressRef: React.MutableRefObject<number>;
  sceneObjects: {
    drift: THREE.Group;
    lines: THREE.Group;
    roads: THREE.Group;
    glow: THREE.Group;
  };
}) {
  const refs = useRef<{
    drift: ReturnType<typeof getProject> extends never ? never : {
      value: { particleSpeed: number; fieldRotation: number };
    };
    lines: { value: { ringRotation: number } };
    roads: { value: { revealProgress: number } };
    glow: { value: { glowPulse: number; orbitSpeed: number } };
  } | null>(null);

  useEffect(() => {
    const project = getProject("RhineSolution");
    const driftObj = project.sheet("Drift").object("DriftScene", {
      particleSpeed: types.number(1, { range: [0, 2] }),
      fieldRotation: types.number(0, { range: [0, 360] }),
    });
    const linesObj = project.sheet("Lines").object("LinesScene", {
      ringRotation: types.number(0, { range: [0, 360] }),
    });
    const roadsObj = project.sheet("Roads").object("RoadsScene", {
      revealProgress: types.number(0, { range: [0, 1] }),
    });
    const glowObj = project.sheet("Glow").object("GlowScene", {
      glowPulse: types.number(0, { range: [0, 1] }),
      orbitSpeed: types.number(1, { range: [0, 2] }),
    });

    refs.current = {
      drift: driftObj as unknown as {
        value: { particleSpeed: number; fieldRotation: number };
      },
      lines: linesObj as unknown as { value: { ringRotation: number } },
      roads: roadsObj as unknown as { value: { revealProgress: number } },
      glow: glowObj as unknown as {
        value: { glowPulse: number; orbitSpeed: number };
      },
    };

    return () => {
      refs.current = null;
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const o = refs.current;
      if (!o) return;
      const p = scrollProgressRef.current;

      // Drift: speed up + rotate as user scrolls into the page
      o.drift.value.particleSpeed = 1 + Math.max(0, 0.25 - p) * 4;
      o.drift.value.fieldRotation = p * 720;

      // Lines: slow ring rotation
      o.lines.value.ringRotation = p * 540;

      // Roads: reveal ramps up
      const roadReveal = Math.max(0, Math.min(1, (p - 0.48) / 0.30));
      o.roads.value.revealProgress = roadReveal;

      // Glow: pulse + faster orbit
      const glowT = Math.max(0, (p - 0.76) / 0.24);
      o.glow.value.glowPulse = glowT;
      o.glow.value.orbitSpeed = 1 + glowT * 1.5;

      // Mirror to THREE userData for scene update funcs
      sceneObjects.drift.userData.theatre = {
        particleSpeed: o.drift.value.particleSpeed,
        fieldRotation: o.drift.value.fieldRotation,
      };
      sceneObjects.lines.userData.theatre = { ringRotation: o.lines.value.ringRotation };
      sceneObjects.roads.userData.theatre = { revealProgress: o.roads.value.revealProgress };
      sceneObjects.glow.userData.theatre = {
        glowPulse: o.glow.value.glowPulse,
        orbitSpeed: o.glow.value.orbitSpeed,
      };
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [scrollProgressRef, sceneObjects]);

  return null;
}
