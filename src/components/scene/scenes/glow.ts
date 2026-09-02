import * as THREE from "three";
import { palette, type RhineScene, type SceneObject } from "../types";

/**
 * GlowScene — clustered wireframe forms around a central glow point.
 * Bottom of the home (0.78–1.0) — "settle" energy.
 */
export function createGlowScene(): RhineScene {
  return {
    name: "Glow",
    weight: (p) => {
      if (p < 0.76) return 0;
      if (p > 0.96) return 1 - (p - 0.96) / 0.04;
      return (p - 0.76) / 0.20;
    },
    build: (): SceneObject => {
      const group = new THREE.Group();
      group.name = "GlowScene";

      // Central glow sprite — additive blending
      const glowCanvas = document.createElement("canvas");
      glowCanvas.width = 128;
      glowCanvas.height = 128;
      const ctx2d = glowCanvas.getContext("2d");
      if (ctx2d) {
        const grad = ctx2d.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, "rgba(196, 168, 130, 1)"); // gold
        grad.addColorStop(0.4, "rgba(126, 167, 255, 0.6)");
        grad.addColorStop(1, "rgba(7, 14, 36, 0)");
        ctx2d.fillStyle = grad;
        ctx2d.fillRect(0, 0, 128, 128);
      }
      const glowTex = new THREE.CanvasTexture(glowCanvas);
      const glowMat = new THREE.SpriteMaterial({
        map: glowTex,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0.85,
      });
      const glow = new THREE.Sprite(glowMat);
      glow.scale.set(8, 8, 1);
      glow.position.set(0, 0, 0);
      group.add(glow);

      // Orbiting wireframe polyhedra around the glow
      const orbits: { mesh: THREE.LineSegments; orbit: { radius: number; angle: number; speed: number; yOff: number; tilt: number } }[] = [];
      const orbitCount = 6;
      for (let i = 0; i < orbitCount; i++) {
        const radius = 3.5 + (i % 3) * 0.8;
        // Mix of cube, octahedron, tetrahedron via different geometry
        const kind = i % 3;
        let geo: THREE.BufferGeometry;
        if (kind === 0) geo = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.7, 0.7, 0.7));
        else if (kind === 1) geo = new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.5));
        else geo = new THREE.EdgesGeometry(new THREE.TetrahedronGeometry(0.55));
        const mat = new THREE.LineBasicMaterial({
          color: i % 2 === 0 ? palette.GOLD.clone() : palette.BLUE_SOFT.clone(),
          transparent: true,
          opacity: 0.6,
        });
        const lines = new THREE.LineSegments(geo, mat);
        const orbit = {
          radius,
          angle: (i / orbitCount) * Math.PI * 2,
          speed: 0.15 + (i % 4) * 0.05,
          yOff: (i % 5) * 0.4 - 1,
          tilt: i * 0.3,
        };
        lines.userData = { orbit };
        orbits.push({ mesh: lines, orbit });
        group.add(lines);
      }

      return {
        group,
        update: (ctx, dt, time) => {
          // Theatre-driven pulse + orbit speed
          const theatre = group.userData.theatre as
            | { glowPulse: number; orbitSpeed: number }
            | undefined;
          const pulseT = theatre?.glowPulse ?? 0;
          const orbitSpeed = theatre?.orbitSpeed ?? 1;
          const scaledDt = dt * orbitSpeed;

          // Pulse the central glow
          const pulse = 1 + Math.sin(time * 0.6) * 0.08;
          glow.scale.set(8 * pulse, 8 * pulse, 1);
          glowMat.opacity = (0.7 + Math.sin(time * 0.6) * 0.15) * (0.6 + pulseT * 0.4);

          // Orbit the polyhedra
          for (const { mesh, orbit } of orbits) {
            orbit.angle += orbit.speed * scaledDt;
            mesh.position.set(
              Math.cos(orbit.angle) * orbit.radius,
              Math.sin(time * 0.4 + orbit.tilt) * 0.5 + orbit.yOff,
              Math.sin(orbit.angle) * orbit.radius
            );
            mesh.rotation.x += scaledDt * 0.4;
            mesh.rotation.y += scaledDt * 0.6;
          }
        },
        dispose: () => {
          glowTex.dispose();
          glowMat.dispose();
          for (const { mesh } of orbits) {
            mesh.geometry.dispose();
            (mesh.material as THREE.Material).dispose();
          }
        },
      };
    },
  };
}
