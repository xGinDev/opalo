"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Enums } from "@/types/database";
import {
  BLOBS_FRAGMENT,
  FLAT_FRAGMENT,
  FULLSCREEN_VERTEX,
  PETALS_FRAGMENT,
  PETALS_VERTEX,
  RAIN_VERTEX,
  ROUND_POINT_FRAGMENT,
  SNOW_VERTEX,
  STARS_VERTEX,
} from "./shaders";

type Rgb = [number, number, number];

export type SceneProps = {
  /** Draw the animated lights (bg_kind = 'color'); otherwise the canvas is transparent. */
  showBlobs: boolean;
  palette: { accent: Rgb; warm: Rgb; cool: Rgb; darkAccent: Rgb; darkWarm: Rgb; darkCool: Rgb };
  particles: Enums<"particle_kind">;
  /** Freeze time: no drifting lights or moving particles. */
  still: boolean;
};

/** Desktop counts; halved under 768px wide. */
const COUNTS: Record<Exclude<Enums<"particle_kind">, "none">, number> = {
  stars: 160,
  rain: 220,
  snow: 140,
  petals: 46,
};

/** Shared clock that stops when `still`, so reduced motion renders a single frozen frame. */
function useUniforms(still: boolean) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uPixelRatio: { value: 1 },
    }),
    [],
  );
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);

  // three.js uniforms are meant to be mutated every frame without re-rendering React.
  /* eslint-disable react-hooks/immutability */
  useFrame((_, delta) => {
    if (!still) uniforms.uTime.value += Math.min(delta, 0.1);
    uniforms.uAspect.value = size.width / Math.max(size.height, 1);
    uniforms.uPixelRatio.value = dpr;
  });
  /* eslint-enable react-hooks/immutability */
  return uniforms;
}

function Blobs({ palette, shared }: { palette: SceneProps["palette"]; shared: ReturnType<typeof useUniforms> }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: FULLSCREEN_VERTEX,
        fragmentShader: BLOBS_FRAGMENT,
        uniforms: {
          ...shared,
          uAccent: { value: new THREE.Color(...palette.accent) },
          uWarm: { value: new THREE.Color(...palette.warm) },
          uCool: { value: new THREE.Color(...palette.cool) },
          uDarkAccent: { value: new THREE.Color(...palette.darkAccent) },
          uDarkWarm: { value: new THREE.Color(...palette.darkWarm) },
          uDarkCool: { value: new THREE.Color(...palette.darkCool) },
        },
        depthTest: false,
        depthWrite: false,
      }),
    [palette, shared],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh frustumCulled={false} renderOrder={0} material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

function seeds(count: number) {
  const seed = new Float32Array(count * 4);
  const phase = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    seed[i * 4] = Math.random() * 2 - 1;
    seed[i * 4 + 1] = Math.random() * 2 - 1;
    seed[i * 4 + 2] = 1 + Math.random() * 2.2;
    seed[i * 4 + 3] = Math.random();
    phase[i] = Math.random() * Math.PI * 2;
  }
  return { seed, phase };
}

function Particles({
  kind,
  color,
  shared,
}: {
  kind: Exclude<Enums<"particle_kind">, "none">;
  color: Rgb;
  shared: ReturnType<typeof useUniforms>;
}) {
  const width = useThree((s) => s.size.width);
  const count = Math.round(COUNTS[kind] * (width < 768 ? 0.5 : 1));

  const object = useMemo(() => {
    const { seed, phase } = seeds(count);
    const uniforms = { ...shared, uColor: { value: new THREE.Color(...color) } };
    const base = { uniforms, transparent: true, depthTest: false, depthWrite: false };

    if (kind === "rain") {
      // Two vertices per drop, sharing the drop's seed.
      const geometry = new THREE.BufferGeometry();
      const pairSeed = new Float32Array(count * 8);
      const pairPhase = new Float32Array(count * 2);
      const end = new Float32Array(count * 2);
      for (let i = 0; i < count; i++) {
        for (let j = 0; j < 2; j++) {
          pairSeed.set(seed.subarray(i * 4, i * 4 + 4), (i * 2 + j) * 4);
          pairPhase[i * 2 + j] = phase[i];
          end[i * 2 + j] = j;
        }
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 6), 3));
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(pairSeed, 4));
      geometry.setAttribute("aPhase", new THREE.BufferAttribute(pairPhase, 1));
      geometry.setAttribute("aEnd", new THREE.BufferAttribute(end, 1));
      const material = new THREE.ShaderMaterial({ ...base, vertexShader: RAIN_VERTEX, fragmentShader: FLAT_FRAGMENT });
      return new THREE.LineSegments(geometry, material);
    }

    if (kind === "petals") {
      const plane = new THREE.PlaneGeometry(2, 2);
      const geometry = new THREE.InstancedBufferGeometry();
      geometry.setIndex(plane.getIndex());
      geometry.setAttribute("position", plane.getAttribute("position"));
      geometry.setAttribute("uv", plane.getAttribute("uv"));
      geometry.instanceCount = count;
      geometry.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seed, 4));
      geometry.setAttribute("aPhase", new THREE.InstancedBufferAttribute(phase, 1));
      const material = new THREE.ShaderMaterial({
        ...base,
        vertexShader: PETALS_VERTEX,
        fragmentShader: PETALS_FRAGMENT,
        side: THREE.DoubleSide,
      });
      return new THREE.Mesh(geometry, material);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    const material = new THREE.ShaderMaterial({
      ...base,
      vertexShader: kind === "snow" ? SNOW_VERTEX : STARS_VERTEX,
      fragmentShader: ROUND_POINT_FRAGMENT,
    });
    return new THREE.Points(geometry, material);
  }, [kind, count, color, shared]);

  useEffect(
    () => () => {
      object.geometry.dispose();
      (object.material as THREE.Material).dispose();
    },
    [object],
  );

  return <primitive object={object} frustumCulled={false} renderOrder={1} />;
}

function SceneContent({ showBlobs, palette, particles, still }: SceneProps) {
  const shared = useUniforms(still);
  const particleColor: Rgb = particles === "petals" ? palette.warm : [1, 1, 1];
  return (
    <>
      {showBlobs && <Blobs palette={palette} shared={shared} />}
      {particles !== "none" && <Particles kind={particles} color={particleColor} shared={shared} />}
    </>
  );
}

/** The profile background canvas. Loaded with next/dynamic (ssr: false) so three.js stays off other routes. */
export default function ProfileScene(props: SceneProps) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.5]}
      // offsetSize ignores CSS transforms, so the canvas still fills the scaled desktop preview.
      resize={{ offsetSize: true }}
      frameloop={hidden || props.still ? "demand" : "always"}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <SceneContent {...props} />
    </Canvas>
  );
}
