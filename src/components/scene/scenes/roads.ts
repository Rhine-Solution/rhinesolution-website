import * as THREE from "three";
import { palette, trapWeight, type RhineScene, type SceneObject } from "../types";

/**
 * RoadsScene — wireframe extruded "road" / building silhouettes.
 * Mirrors hubtown's roads reveal (HomeThird→HomeFourth).
 * Scroll band (0.50–0.80). trapWeight for smooth crossfade.
 */
export function createRoadsScene(): RhineScene {
  return {
    name: "Roads",
    weight: (p) => trapWeight(p, 0.50, 0.78, 0.10),
    build: (): SceneObject => {
      const group = new THREE.Group();
      group.name = "RoadsScene";

      // Procedural building silhouettes — extruded rectangles
      const buildings: THREE.LineSegments[] = [];
      const buildingCount = 9;
      for (let i = 0; i < buildingCount; i++) {
        const w = 1 + Math.random() * 1.2;
        const h = 2 + Math.random() * 4;
        const d = 1 + Math.random() * 1.2;
        const geo = new THREE.BoxGeometry(w, h, d);
        const edges = new THREE.EdgesGeometry(geo);
        const mat = new THREE.LineBasicMaterial({
          color: i % 2 === 0 ? palette.BLUE_SOFT.clone() : palette.INDIGO.clone(),
          transparent: true,
          opacity: 0.45,
        });
        const lines = new THREE.LineSegments(edges, mat);
        const angle = (i / buildingCount) * Math.PI * 2;
        const radius = 5 + (i % 3) * 1.5;
        lines.position.set(Math.cos(angle) * radius, h / 2 - 2, Math.sin(angle) * radius - 2);
        lines.rotation.y = -angle + Math.PI / 2;
        lines.userData = { revealStart: 0.0, baseY: lines.position.y };
        buildings.push(lines);
        group.add(lines);
      }

      // Horizontal "road" lines stretching across
      const roads: THREE.Line[] = [];
      const roadCount = 5;
      for (let i = 0; i < roadCount; i++) {
        const y = -2 + i * 1.0;
        const points = [
          new THREE.Vector3(-12, y, -3 - i * 0.5),
          new THREE.Vector3(12, y, -3 - i * 0.5),
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const mat = new THREE.LineBasicMaterial({
          color: palette.BLUE_ACCENT.clone(),
          transparent: true,
          opacity: 0.55,
        });
        const line = new THREE.Line(geo, mat);
        roads.push(line);
        group.add(line);
      }

      // Ground grid — perspective floor for the roads
      const gridSize = 30;
      const gridDiv = 30;
      const grid = new THREE.GridHelper(gridSize, gridDiv, palette.BLUE_SOFT, palette.BLUE_SOFT);
      (grid.material as THREE.Material).transparent = true;
      (grid.material as THREE.LineBasicMaterial).opacity = 0.18;
      grid.position.y = -2;
      grid.position.z = -2;
      group.add(grid);

      let revealProgress = 0;

      return {
        group,
        update: () => {
          // Theatre-driven reveal progress
          const theatre = group.userData.theatre as
            | { revealProgress: number }
            | undefined;
          const targetReveal = theatre?.revealProgress ?? 0;
          revealProgress += (targetReveal - revealProgress) * 0.08;

          for (const b of buildings) {
            const baseY = (b.userData as { baseY: number }).baseY;
            b.position.y = baseY - (1 - revealProgress) * 4;
            (b.material as THREE.LineBasicMaterial).opacity = 0.45 * revealProgress;
          }
          for (const r of roads) {
            (r.material as THREE.LineBasicMaterial).opacity = 0.55 * revealProgress;
          }
        },
        dispose: () => {
          for (const b of buildings) {
            b.geometry.dispose();
            (b.material as THREE.Material).dispose();
          }
          for (const r of roads) {
            r.geometry.dispose();
            (r.material as THREE.Material).dispose();
          }
          grid.geometry.dispose();
          (grid.material as THREE.Material).dispose();
        },
      };
    },
  };
}
