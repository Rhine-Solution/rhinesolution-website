import * as THREE from "three";
import { palette, type RhineScene, type SceneObject } from "../types";

/**
 * LinesScene — wireframe grid floor + vertical extruded lines.
 * Suggests "structured / architectural" — middle scroll band (0.20–0.50).
 */
export function createLinesScene(): RhineScene {
  return {
    name: "Lines",
    weight: (p) => {
      // ramp 0.20->0.30, plateau, fade 0.45->0.55
      if (p < 0.18 || p > 0.55) return 0;
      if (p < 0.30) return (p - 0.18) / 0.12;
      if (p > 0.45) return 1 - (p - 0.45) / 0.10;
      return 1;
    },
    build: (): SceneObject => {
      const group = new THREE.Group();
      group.name = "LinesScene";

      // Grid floor — wireframe plane subdivided
      const floorGeo = new THREE.PlaneGeometry(40, 40, 24, 24);
      const floorEdges = new THREE.EdgesGeometry(floorGeo);
      const floorMat = new THREE.LineBasicMaterial({
        color: palette.INDIGO.clone(),
        transparent: true,
        opacity: 0.35,
      });
      const floor = new THREE.LineSegments(floorEdges, floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -2.5;
      group.add(floor);

      // Vertical "pillar" lines — extruded
      const pillars: THREE.Line[] = [];
      const pillarCount = 18;
      for (let i = 0; i < pillarCount; i++) {
        const angle = (i / pillarCount) * Math.PI * 2;
        const radius = 4 + (i % 3) * 1.2;
        const points = [
          new THREE.Vector3(
            Math.cos(angle) * radius,
            -2.5,
            Math.sin(angle) * radius
          ),
          new THREE.Vector3(
            Math.cos(angle) * radius,
            3 + (i % 4) * 0.6,
            Math.sin(angle) * radius
          ),
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
          color: i % 2 === 0 ? palette.BLUE_SOFT.clone() : palette.INDIGO.clone(),
          transparent: true,
          opacity: 0.4,
        });
        const line = new THREE.Line(geo, mat);
        line.userData = { baseY: 3 + (i % 4) * 0.6, phase: i * 0.4 };
        pillars.push(line);
        group.add(line);
      }

      // Perspective tunnel rings — concentric
      const rings: THREE.Line[] = [];
      const ringCount = 8;
      for (let i = 0; i < ringCount; i++) {
        const radius = 1.5 + i * 0.6;
        const seg = 64;
        const pts: THREE.Vector3[] = [];
        for (let j = 0; j <= seg; j++) {
          const a = (j / seg) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({
          color: palette.BLUE_ACCENT.clone(),
          transparent: true,
          opacity: 0.25,
        });
        const ring = new THREE.Line(geo, mat);
        ring.position.z = -i * 1.2;
        rings.push(ring);
        group.add(ring);
      }

      return {
        group,
        update: (ctx, dt, time) => {
          // Theatre-driven ring rotation
          const theatre = group.userData.theatre as
            | { ringRotation: number }
            | undefined;
          const ringRot = theatre?.ringRotation ?? 0;
          group.rotation.y = (ringRot * Math.PI) / 180;
          // Pillars gently pulse
          for (const line of pillars) {
            const u = line.userData as { baseY: number; phase: number };
            const scale = 1 + Math.sin(time * 0.5 + u.phase) * 0.04;
            line.scale.y = scale;
          }
        },
        dispose: () => {
          floorGeo.dispose();
          floorEdges.dispose();
          (floor.material as THREE.Material).dispose();
          for (const line of pillars) {
            line.geometry.dispose();
            (line.material as THREE.Material).dispose();
          }
          for (const ring of rings) {
            ring.geometry.dispose();
            (ring.material as THREE.Material).dispose();
          }
        },
      };
    },
  };
}
