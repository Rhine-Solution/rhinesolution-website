import * as THREE from "three";
import { trapWeight, type RhineScene, type SceneObject } from "../types";

/**
 * ShaderScene — flowing fbm noise backdrop in the brand palette.
 * Fullscreen background plane behind the hero, animated with scroll.
 */
export function createShaderScene(): RhineScene {
  return {
    name: "Shader",
    weight: (p) => trapWeight(p, 0, 0.3, 0.12),
    build: (): SceneObject => {
      const group = new THREE.Group();
      group.name = "ShaderScene";

      const geo = new THREE.PlaneGeometry(22, 22);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uScroll: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uScroll;
          varying vec2 vUv;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
              mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
              u.y
            );
          }

          float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 4; i++) {
              v += a * noise(p);
              p *= 2.03;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            vec2 uv = vUv;
            vec2 p = uv * vec2(2.2, 1.4);
            float t = uTime * 0.05 + uScroll * 1.2;
            float n = fbm(p + t + vec2(0.0, uScroll * 2.0));
            float n2 = fbm(p * 1.6 - t + vec2(3.0, 1.0));

            vec3 base = vec3(0.027, 0.055, 0.141);   // #070e24 navy
            vec3 blue = vec3(0.494, 0.655, 1.0);     // #7ea7ff
            vec3 indigo = vec3(0.608, 0.494, 1.0);   // #9b7eff
            vec3 gold = vec3(0.769, 0.659, 0.51);    // #c4a882

            float ribbon = smoothstep(0.40, 0.80, n);
            float accent = smoothstep(0.55, 0.90, n2);
            vec3 col = base;
            col = mix(col, blue, ribbon * 0.30);
            col = mix(col, indigo, accent * 0.16);
            col = mix(col, gold, accent * ribbon * 0.08);

            float vig = smoothstep(1.0, 0.35, length(uv - 0.5) * 1.15);
            col *= 0.55 + 0.45 * vig;

            gl_FragColor = vec4(col, 1.0);
          }
        `,
      });

      const plane = new THREE.Mesh(geo, mat);
      plane.position.set(0, 0, -9);
      plane.frustumCulled = false;
      group.add(plane);

      return {
        group,
        update: (ctx, _dt, time) => {
          mat.uniforms.uTime.value = time;
          mat.uniforms.uScroll.value = ctx.scrollProgress;
        },
        dispose: () => {
          geo.dispose();
          mat.dispose();
        },
      };
    },
  };
}