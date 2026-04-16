"use client";

import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

export type HeroPerfMode = "full" | "lite";

export type HeroUniverseCanvasProps = {
  /** 0..1 scroll progress across the page story */
  progress: number;
  /** Automatically pick lite mode for mobile/weak devices */
  mode?: HeroPerfMode;
  /** Portion of page progress used to evolve the hero (default 0.22) */
  heroRangeEnd?: number;
  /** Reveal floating 3D UI panels (default true in full mode) */
  panels?: boolean;
  /** Overall intensity multiplier for glow/pulses (default 1) */
  intensity?: number;
};

export function HeroUniverseCanvas({
  progress,
  mode = "full",
  heroRangeEnd = 0.22,
  panels,
  intensity = 1,
}: HeroUniverseCanvasProps) {
  const showPanels = panels ?? mode !== "lite";

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        dpr={mode === "lite" ? [1, 1.1] : [1, 1.6]}
        frameloop="demand"
        gl={{
          antialias: mode !== "lite",
          powerPreference: mode === "lite" ? "default" : "high-performance",
          alpha: false,
        }}
        camera={{ fov: 42, position: [0, 0.32, 6.1] }}
      >
        <color attach="background" args={["#070A12"]} />
        <HeroUniverseScene
          progress={progress}
          mode={mode}
          heroRangeEnd={heroRangeEnd}
          showPanels={showPanels}
          intensity={intensity}
        />
        {mode !== "lite" ? <Environment preset="city" /> : null}
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/80" />
    </div>
  );
}

const HeroUniverseScene = React.memo(function HeroUniverseScene({
  progress,
  mode,
  heroRangeEnd,
  showPanels,
  intensity,
}: {
  progress: number;
  mode: HeroPerfMode;
  heroRangeEnd: number;
  showPanels: boolean;
  intensity: number;
}) {
  const group = useRef<THREE.Group>(null);
  const particles = useRef<THREE.Points>(null);
  const grid = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const uiPanels = useRef<THREE.Group>(null);
  const flash = useRef<THREE.PointLight>(null);
  const key = useRef<THREE.PointLight>(null);
  const fill = useRef<THREE.PointLight>(null);

  const { invalidate, camera } = useThree();

  useEffect(() => {
    invalidate();
  }, [progress, invalidate]);

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const p = clamp01(progress);

    // Hero evolution: raw → structured.
    const heroT = clamp01(p / Math.max(0.001, heroRangeEnd));
    const clarity = smoothstep(heroT);
    const chaos = 1 - clarity;

    // Handoff: slight move into the next story beat after hero.
    const handoff = smoothstep((p - heroRangeEnd * 0.9) / (heroRangeEnd * 0.7));

    const { pos, lookAt, drift } = sampleHeroCamera(p, mode);
    camera.position.lerp(
      pos
        .clone()
        .add(
          new THREE.Vector3(
            Math.sin(t * 0.32) * drift,
            Math.cos(t * 0.28) * drift * 0.5,
            0
          )
        )
        .add(new THREE.Vector3(0, -handoff * 0.06, -handoff * 0.25)),
      1 - Math.pow(0.001, dt)
    );
    camera.lookAt(lookAt);

    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        (p - 0.5) * 0.55,
        1 - Math.pow(0.001, dt)
      );
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -0.12 + p * 0.22,
        1 - Math.pow(0.001, dt)
      );
    }

    if (core.current) {
      const baseX = mode === "lite" ? 1.0 : 1.3;
      core.current.position.x = THREE.MathUtils.lerp(
        core.current.position.x,
        baseX + handoff * 0.1,
        1 - Math.pow(0.001, dt)
      );
      core.current.position.y = THREE.MathUtils.lerp(
        core.current.position.y,
        0.12 +
          Math.sin(t * 0.55) * (mode === "lite" ? 0.04 : 0.06) +
          chaos * 0.08,
        1 - Math.pow(0.001, dt)
      );
      core.current.position.z = THREE.MathUtils.lerp(
        core.current.position.z,
        -0.18 - handoff * 0.2,
        1 - Math.pow(0.001, dt)
      );
      core.current.rotation.y += dt * (0.22 + clarity * 0.16);
      core.current.rotation.x = Math.sin(t * 0.25) * (0.05 + chaos * 0.08);
      core.current.rotation.z = Math.cos(t * 0.22) * (0.04 + chaos * 0.1);
      const s = THREE.MathUtils.lerp(1.02, 1.18, clarity) * (1 - handoff * 0.05);
      core.current.scale.setScalar(
        THREE.MathUtils.lerp(core.current.scale.x, s, 1 - Math.pow(0.001, dt))
      );
    }

    if (grid.current) {
      grid.current.position.y = THREE.MathUtils.lerp(
        grid.current.position.y,
        -1.25,
        1 - Math.pow(0.001, dt)
      );
      grid.current.rotation.x = THREE.MathUtils.lerp(
        grid.current.rotation.x,
        -Math.PI / 2,
        1 - Math.pow(0.001, dt)
      );
      grid.current.rotation.z = Math.sin(t * 0.1) * 0.015;
    }

    if (particles.current) {
      const mat = particles.current.material as THREE.PointsMaterial;
      const targetOpacity =
        mode === "lite"
          ? 0.16
          : THREE.MathUtils.lerp(0.55, 0.24, clarity) * intensity;
      mat.opacity = THREE.MathUtils.lerp(
        mat.opacity,
        targetOpacity,
        1 - Math.pow(0.001, dt)
      );
    }

    if (uiPanels.current) {
      const reveal = showPanels
        ? smoothstep((p - heroRangeEnd * 0.35) / (heroRangeEnd * 0.9))
        : 0;
      uiPanels.current.visible = reveal > 0.01;
      uiPanels.current.scale.setScalar(reveal);
      uiPanels.current.position.x = THREE.MathUtils.lerp(
        uiPanels.current.position.x,
        0.15,
        1 - Math.pow(0.001, dt)
      );
      uiPanels.current.position.y = THREE.MathUtils.lerp(
        uiPanels.current.position.y,
        0.06,
        1 - Math.pow(0.001, dt)
      );
      uiPanels.current.position.z = THREE.MathUtils.lerp(
        uiPanels.current.position.z,
        -0.75 - handoff * 0.15,
        1 - Math.pow(0.001, dt)
      );
      uiPanels.current.rotation.y = THREE.MathUtils.lerp(
        uiPanels.current.rotation.y,
        -0.24,
        1 - Math.pow(0.001, dt)
      );
      uiPanels.current.rotation.x = THREE.MathUtils.lerp(
        uiPanels.current.rotation.x,
        0.06,
        1 - Math.pow(0.001, dt)
      );
    }

    // Lighting: green/cyan accents + occasional distant flash.
    if (key.current) {
      key.current.intensity = THREE.MathUtils.lerp(
        key.current.intensity,
        (mode === "lite" ? 9 : 14) * intensity,
        1 - Math.pow(0.001, dt)
      );
    }
    if (fill.current) {
      fill.current.intensity = THREE.MathUtils.lerp(
        fill.current.intensity,
        (mode === "lite" ? 6 : 10) * intensity,
        1 - Math.pow(0.001, dt)
      );
    }
    if (flash.current && mode !== "lite") {
      const chance = THREE.MathUtils.lerp(0.026, 0.008, clarity);
      const doFlash = pseudoRand(t) < chance * (0.7 + chaos * 0.9);
      const target = doFlash ? 48 * intensity : 0;
      flash.current.intensity = THREE.MathUtils.lerp(
        flash.current.intensity,
        target,
        1 - Math.pow(0.0002, dt)
      );
      flash.current.position.x = Math.sin(t * 1.7) * 5.5;
      flash.current.position.y = 2.2 + Math.sin(t * 0.7) * 0.4;
      flash.current.position.z = -6.5;
    }
  });

  return (
    <group ref={group}>
      <fog attach="fog" args={["#070A12", 8, 18]} />
      <ambientLight intensity={0.28} />
      <directionalLight position={[4, 3, 2]} intensity={1.05} />

      <pointLight
        ref={key}
        position={[2.4, 0.8, 1.8]}
        intensity={(mode === "lite" ? 9 : 14) * intensity}
        color={new THREE.Color("#2BC3FF")}
        distance={14}
      />
      <pointLight
        ref={fill}
        position={[-2.4, 1.2, 2.4]}
        intensity={(mode === "lite" ? 6 : 10) * intensity}
        color={new THREE.Color("#2EF2B5")}
        distance={16}
      />
      <pointLight
        ref={flash}
        position={[0, 2.2, -6.5]}
        intensity={0}
        color={new THREE.Color("#B7F5FF")}
        distance={20}
      />

      <EnergyParticles ref={particles} mode={mode} />

      <group ref={grid}>
        <EnergyGrid mode={mode} progress={progress} heroRangeEnd={heroRangeEnd} />
      </group>

      <group ref={core}>
        <IntelligenceCore mode={mode} progress={progress} heroRangeEnd={heroRangeEnd} intensity={intensity} />
      </group>

      <group ref={uiPanels}>{showPanels ? <DataPanels /> : null}</group>
    </group>
  );
});

const EnergyParticles = forwardRef<THREE.Points, { mode: HeroPerfMode }>(
  ({ mode }, ref) => {
    const geom = useMemo(() => {
      const count = mode === "lite" ? 420 : 1200;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const c1 = new THREE.Color("#2BC3FF");
      const c2 = new THREE.Color("#2EF2B5");
      for (let i = 0; i < count; i++) {
        const r = 5.2 * Math.sqrt(Math.random());
        const a = Math.random() * Math.PI * 2;
        positions[i * 3 + 0] = Math.cos(a) * r;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1.6;
        positions[i * 3 + 2] = Math.sin(a) * r;
        const col = c1.clone().lerp(c2, Math.random());
        colors[i * 3 + 0] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      return g;
    }, [mode]);

    const mat = useMemo(
      () =>
        new THREE.PointsMaterial({
          size: mode === "lite" ? 0.02 : 0.028,
          transparent: true,
          opacity: mode === "lite" ? 0.22 : 0.38,
          vertexColors: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      [mode]
    );

    return <points ref={ref} geometry={geom} material={mat} />;
  }
);
EnergyParticles.displayName = "EnergyParticles";

function IntelligenceCore({
  mode,
  progress,
  heroRangeEnd,
  intensity,
}: {
  mode: HeroPerfMode;
  progress: number;
  heroRangeEnd: number;
  intensity: number;
}) {
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);

  const outerGeo = useMemo(() => new THREE.IcosahedronGeometry(0.95, 2), []);
  const innerGeo = useMemo(() => new THREE.SphereGeometry(0.56, 32, 32), []);
  const ringGeo = useMemo(() => new THREE.TorusGeometry(0.92, 0.02, 10, 220), []);
  const glowGeo = useMemo(() => new THREE.SphereGeometry(1.15, 24, 24), []);

  const outerMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#07111F"),
        metalness: 0.65,
        roughness: 0.22,
        emissive: new THREE.Color("#061A22"),
        emissiveIntensity: 1.1,
      }),
    []
  );
  const innerMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#081021"),
        metalness: 0.2,
        roughness: 0.18,
        emissive: new THREE.Color("#2BC3FF"),
        emissiveIntensity: 1.6,
      }),
    []
  );
  const ringMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#0A1526"),
        metalness: 0.85,
        roughness: 0.25,
        emissive: new THREE.Color("#2EF2B5"),
        emissiveIntensity: 0.9,
      }),
    []
  );
  const glowMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#2BC3FF"),
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const heroT = clamp01(progress / Math.max(0.001, heroRangeEnd));
    const clarity = smoothstep(heroT);
    const chaos = 1 - clarity;

    if (outer.current) {
      outer.current.rotation.y += dt * (0.12 + clarity * 0.18);
      outer.current.rotation.x += dt * (0.08 + chaos * 0.18);
    }
    if (inner.current) {
      const mat = inner.current.material as THREE.MeshStandardMaterial;
      const pulse = 0.9 + Math.sin(t * (mode === "lite" ? 1.1 : 1.8)) * 0.12;
      const raw = 1.55 + chaos * 0.85;
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        raw * pulse * intensity,
        1 - Math.pow(0.001, dt)
      );
      inner.current.scale.setScalar(
        THREE.MathUtils.lerp(inner.current.scale.x, 1.0 + chaos * 0.06, 1 - Math.pow(0.001, dt))
      );
    }
    if (ring.current) {
      ring.current.rotation.z += dt * (0.45 + clarity * 0.32);
      ring.current.rotation.x = THREE.MathUtils.lerp(ring.current.rotation.x, 0.3 + clarity * 0.22, 1 - Math.pow(0.001, dt));
      const mat = ring.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, (0.6 + clarity * 1.2) * intensity, 1 - Math.pow(0.001, dt));
    }
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, mode === "lite" ? 0.05 : 0.11 + chaos * 0.07, 1 - Math.pow(0.001, dt));
    }
  });

  return (
    <group>
      <mesh ref={glow} geometry={glowGeo} material={glowMat} />
      <mesh ref={outer} geometry={outerGeo} material={outerMat} />
      <mesh ref={inner} geometry={innerGeo} material={innerMat} position={[0, 0, 0.02]} />
      <mesh ref={ring} geometry={ringGeo} material={ringMat} rotation={[0.4, 0.2, 0]} />
    </group>
  );
}

function EnergyGrid({
  mode,
  progress,
  heroRangeEnd,
}: {
  mode: HeroPerfMode;
  progress: number;
  heroRangeEnd: number;
}) {
  const grid = useMemo(() => {
    const size = 18;
    const div = mode === "lite" ? 24 : 40;
    const g = new THREE.GridHelper(size, div, "#2BC3FF", "#0F1E2A");
    (g.material as THREE.Material).transparent = true;
    (g.material as THREE.Material).opacity = mode === "lite" ? 0.2 : 0.28;
    return g;
  }, [mode]);

  const nodes = useMemo(() => {
    const count = mode === "lite" ? 26 : 72;
    const geo = new THREE.SphereGeometry(0.03, 10, 10);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#2EF2B5"),
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const inst = new THREE.InstancedMesh(geo, mat, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      dummy.position.set((Math.random() - 0.5) * 12, 0, (Math.random() - 0.5) * 12);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    return inst;
  }, [mode]);

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const heroT = clamp01(progress / Math.max(0.001, heroRangeEnd));
    const clarity = smoothstep(heroT);
    const gmat = grid.material as THREE.Material;
    gmat.opacity = THREE.MathUtils.lerp(
      gmat.opacity,
      mode === "lite" ? 0.18 : THREE.MathUtils.lerp(0.34, 0.22, clarity),
      1 - Math.pow(0.001, dt)
    );

    const nmat = nodes.material as THREE.MeshBasicMaterial;
    // Pulse feels "raw" at top and becomes stable.
    const pulse = 0.55 + Math.sin(t * (mode === "lite" ? 0.9 : 1.2)) * (0.12 + (1 - clarity) * 0.08);
    nmat.opacity = THREE.MathUtils.lerp(nmat.opacity, mode === "lite" ? 0.55 : pulse, 1 - Math.pow(0.001, dt));
    nodes.rotation.y = Math.sin(t * 0.06) * 0.08;
    nodes.position.y = -1.24 + Math.sin(t * 0.3) * 0.02;
  });

  return (
    <group position={[0, -1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <primitive object={grid} />
      <primitive object={nodes} />
    </group>
  );
}

function DataPanels() {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#0A1222"),
        transparent: true,
        opacity: 0.22,
        blending: THREE.NormalBlending,
      }),
    []
  );
  const edge = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#2BC3FF"),
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const geo = useMemo(() => new THREE.PlaneGeometry(1.4, 0.9, 1, 1), []);
  const outline = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pts = [
      new THREE.Vector3(-0.7, -0.45, 0),
      new THREE.Vector3(0.7, -0.45, 0),
      new THREE.Vector3(0.7, 0.45, 0),
      new THREE.Vector3(-0.7, 0.45, 0),
      new THREE.Vector3(-0.7, -0.45, 0),
    ];
    g.setFromPoints(pts);
    return g;
  }, []);

  const line1 = useMemo(() => new THREE.Line(outline, edge), [outline, edge]);
  const line2 = useMemo(() => new THREE.Line(outline, edge), [outline, edge]);

  return (
    <group>
      <mesh geometry={geo} material={mat} position={[0.0, 0.0, 0]} rotation={[0, 0.1, 0]} />
      <primitive object={line1} position={[0.0, 0.0, 0.002]} />
      <mesh geometry={geo} material={mat} position={[0.25, -0.62, -0.18]} rotation={[0, 0.28, 0]} scale={0.78} />
      <primitive object={line2} position={[0.25, -0.62, -0.178]} rotation={[0, 0.28, 0]} scale={0.78} />
    </group>
  );
}

function sampleHeroCamera(t01: number, mode: HeroPerfMode) {
  // Keep left copy readable; look slightly right into the data/core.
  const z = mode === "lite" ? 6.4 : 6.15;
  const keys = [
    { pos: new THREE.Vector3(-0.2, 0.32, z), lookAt: new THREE.Vector3(0.55, 0.12, 0.0), drift: 0.08 },
    { pos: new THREE.Vector3(-0.55, 0.42, z + 0.15), lookAt: new THREE.Vector3(0.75, 0.1, 0.0), drift: 0.07 },
    { pos: new THREE.Vector3(-0.25, 0.28, z), lookAt: new THREE.Vector3(0.65, 0.08, 0.0), drift: 0.06 },
    { pos: new THREE.Vector3(-0.35, 0.46, z - 0.1), lookAt: new THREE.Vector3(0.5, 0.0, 0.0), drift: 0.05 },
  ];

  const n = keys.length;
  const x = THREE.MathUtils.clamp(t01, 0, 1) * (n - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = keys[Math.min(i, n - 1)];
  const b = keys[Math.min(i + 1, n - 1)];
  const e = f * f * (3 - 2 * f);
  return {
    pos: a.pos.clone().lerp(b.pos, e),
    lookAt: a.lookAt.clone().lerp(b.lookAt, e),
    drift: THREE.MathUtils.lerp(a.drift, b.drift, e),
  };
}

function smoothstep(x: number) {
  const t = THREE.MathUtils.clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function pseudoRand(x: number) {
  const s = Math.sin(x * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

