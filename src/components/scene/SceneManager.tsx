"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createDriftScene } from "./scenes/drift";
import { createLinesScene } from "./scenes/lines";
import { createRoadsScene } from "./scenes/roads";
import { createGlowScene } from "./scenes/glow";
import type { RhineScene } from "./types";

const SCENES: RhineScene[] = [
  createDriftScene(),
  createLinesScene(),
  createRoadsScene(),
  createGlowScene(),
];

export default function SceneManager() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // WebGL canvas renders on every page.

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setClearColor("#070e24", 1);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6);

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#070e24");

    // Subtle ambient + directional light (mostly for future meshes)
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0x7ea7ff, 0.6);
    dir.position.set(2, 3, 4);
    scene.add(dir);

    // Build all scene objects
    const built = SCENES.map((s) => s.build());

    // Group them under a parent for camera-relative effects
    const scenesParent = new THREE.Group();
    scenesParent.name = "ScenesParent";
    for (const obj of built) {
      scenesParent.add(obj.group);
    }
    scene.add(scenesParent);

    // Scroll state
    let scrollProgress = 0;
    let scrollTarget = 0;
    const onScroll = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Animation loop
    let raf = 0;
    const timer = new THREE.Timer();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      timer.update();
      const dt = Math.min(timer.getDelta(), 0.05);
      const time = timer.getElapsed();

// Smooth scroll lerp
      // Two-stage: body (0..0.7) = 0.05 (slightly slower than the original 0.06
      // per user feedback on 2026-09-03 — start with 0.05 and tune), closing
      // (0.7..1.0) decelerates to 0.025 so the WebGL "settles" as you reach the
      // footer / closing CTA. The deceleration is what makes the page feel
      // like it's ending, not just stopping.
      const lerpFactor = reducedMotion
        ? 1
        : scrollProgress < 0.7
          ? 0.05
          : 0.025;
      scrollProgress += (scrollTarget - scrollProgress) * lerpFactor;

      // Update each scene and modulate group visibility via scale/opacity
      for (let i = 0; i < SCENES.length; i++) {
        const s = SCENES[i];
        const obj = built[i];
        const w = s.weight(scrollProgress);
        obj.group.visible = w > 0.001;
        // Fade-in scale: tiny breathing effect when entering
        const targetScale = w;
        obj.group.scale.lerp(
          new THREE.Vector3(targetScale, targetScale, targetScale),
          0.08
        );
        obj.update(
          { camera, scrollProgress, reducedMotion },
          reducedMotion ? 0 : dt,
          reducedMotion ? 0 : time
        );
      }

      // Subtle camera drift
      if (!reducedMotion) {
        camera.position.x = Math.sin(time * 0.1) * 0.3;
        camera.position.y = Math.cos(time * 0.08) * 0.2;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };
    tick();

    // Resize
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    window.addEventListener("resize", onResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      timer.dispose();
      for (const obj of built) obj.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: -1,
          pointerEvents: "none",
          display: "block",
        }}
      />
    </>
  );
}
