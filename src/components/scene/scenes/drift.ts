import * as THREE from "three";
import { palette, type RhineScene, type SceneObject } from "../types";

/**
 * DriftScene — sparse particles + slow-rotating wireframe cubes.
 * Top of the home (scrollProgress 0–0.25).
 */
export function createDriftScene(): RhineScene {
  return {
    name: "Drift",
    weight: (p) => {
      // Full at 0, fade out by 0.25
      if (p < 0.0) return 0;
      if (p > 0.25) return 0;
      return 1 - p / 0.25;
    },
    build: (): SceneObject => {
      const group = new THREE.Group();
      group.name = "DriftScene";

      // Particles (additive blending, glowing)
      const particleCount = 600;
      const positions = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);
      const phases = new Float32Array(particleCount);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 14;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
        sizes[i] = Math.random() * 2.5 + 0.6;
        phases[i] = Math.random() * Math.PI * 2;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: palette.BLUE_SOFT.clone() },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        },
        vertexShader: /* glsl */ `
          attribute float aSize;
          attribute float aPhase;
          uniform float uTime;
          uniform float uPixelRatio;
          varying float vAlpha;
          void main() {
            vec3 pos = position;
            pos.y += sin(uTime * 0.3 + aPhase) * 0.18;
            pos.x += cos(uTime * 0.22 + aPhase * 1.3) * 0.12;
            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = aSize * uPixelRatio * (90.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
            vAlpha = clamp(1.0 - (-mv.z / 14.0), 0.15, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor;
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float glow = exp(-d * 5.5);
            gl_FragColor = vec4(uColor, glow * vAlpha * 0.7);
          }
        `,
      });

      const points = new THREE.Points(geo, mat);
      group.add(points);

      // Wireframe cubes — sparse, slow rotation
      const cubes: THREE.LineSegments[] = [];
      const cubeCount = 14;
      for (let i = 0; i < cubeCount; i++) {
        const size = 0.4 + Math.random() * 0.8;
        const cubeGeo = new THREE.BoxGeometry(size, size, size);
        const edges = new THREE.EdgesGeometry(cubeGeo);
        const lineMat = new THREE.LineBasicMaterial({
          color: palette.BLUE_SOFT.clone(),
          transparent: true,
          opacity: 0.35,
        });
        const lines = new THREE.LineSegments(edges, lineMat);
        lines.position.set(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6 - 2
        );
        lines.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        const userData = {
          rotSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 0.15,
            (Math.random() - 0.5) * 0.15,
            (Math.random() - 0.5) * 0.15
          ),
          floatPhase: Math.random() * Math.PI * 2,
        };
        lines.userData = userData;
        cubes.push(lines);
        group.add(lines);
      }

      return {
        group,
        update: (ctx, dt, time) => {
          mat.uniforms.uTime.value = time;
          // Theatre-driven field rotation
          const theatre = group.userData.theatre as
            | { particleSpeed: number; fieldRotation: number }
            | undefined;
          const fieldRot = theatre?.fieldRotation ?? 0;
          const particleSpeed = theatre?.particleSpeed ?? 1;
          group.rotation.y = (fieldRot * Math.PI) / 180;
          // Use uTime but scale by particleSpeed
          // The shader's uTime is set above; we adjust dt for cube spin to feel faster
          const scaledDt = dt * particleSpeed;
          for (const lines of cubes) {
            const u = lines.userData as {
              rotSpeed: THREE.Vector3;
              floatPhase: number;
            };
            lines.rotation.x += u.rotSpeed.x * scaledDt;
            lines.rotation.y += u.rotSpeed.y * scaledDt;
            lines.rotation.z += u.rotSpeed.z * scaledDt;
            lines.position.y += Math.sin(time * 0.4 + u.floatPhase) * 0.001;
          }
          for (const lines of cubes) {
            (lines.material as THREE.LineBasicMaterial).opacity = 0.35;
          }
        },
        dispose: () => {
          geo.dispose();
          mat.dispose();
          for (const lines of cubes) {
            lines.geometry.dispose();
            (lines.material as THREE.Material).dispose();
          }
        },
      };
    },
  };
}
