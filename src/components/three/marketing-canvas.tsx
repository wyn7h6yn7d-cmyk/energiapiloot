"use client";

import React, { forwardRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  progress: number; // 0..1 page scroll progress
  mode?: "full" | "lite";
};

export function MarketingCanvas({ progress, mode = "full" }: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        dpr={mode === "lite" ? [1, 1.2] : [1, 1.6]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 42, position: [0, 0.25, 6] }}
      >
        <color attach="background" args={["#070A12"]} />
        <Scene progress={progress} mode={mode} />
        <Environment preset="city" />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/80" />
    </div>
  );
}

function Scene({ progress, mode }: Required<Props>) {
  const group = useRef<THREE.Group>(null);
  const particles = useRef<THREE.Points>(null);
  const core = useRef<THREE.Group>(null);
  const arcs = useRef<THREE.Group>(null);
  const grid = useRef<THREE.Group>(null);
  const uiPanels = useRef<THREE.Group>(null);
  const { invalidate } = useThree();
  const { camera } = useThree();

  useEffect(() => {
    // Re-render on scroll-driven updates while keeping the rest static.
    invalidate();
  }, [progress, invalidate]);

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const p = THREE.MathUtils.clamp(progress, 0, 1);
    const heroT = clamp01(p / 0.22); // hero transformation window
    const clarity = smoothstep(heroT); // 0 chaotic → 1 structured
    const chaos = 1 - clarity;
    const { pos, lookAt, drift } = sampleKeyframes(p, mode);

    if (group.current) {
      // Slow cinematic drift + scroll-driven tilt.
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        (p - 0.5) * 0.7,
        1 - Math.pow(0.001, dt)
      );
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -0.15 + p * 0.25,
        1 - Math.pow(0.001, dt)
      );
    }

    // Camera keyframes (kept subtle; the scene does the storytelling).
    camera.position.lerp(
      pos.clone().add(
        new THREE.Vector3(
          Math.sin(t * 0.32) * drift,
          Math.cos(t * 0.28) * drift * 0.5,
          0
        )
      ),
      1 - Math.pow(0.001, dt)
    );
    const target = new THREE.Vector3().copy(lookAt);
    camera.lookAt(target);

    if (core.current) {
      // Place on right; evolve from raw → stable.
      const baseX = mode === "lite" ? 1.05 : 1.35;
      const wobble = chaos * 0.12 + Math.sin(t * 0.9) * chaos * 0.06;
      core.current.position.x = THREE.MathUtils.lerp(core.current.position.x, baseX, 1 - Math.pow(0.001, dt));
      core.current.position.y = THREE.MathUtils.lerp(
        core.current.position.y,
        0.15 + Math.sin(t * 0.55) * (mode === "lite" ? 0.04 : 0.06) + wobble,
        1 - Math.pow(0.001, dt)
      );
      core.current.position.z = THREE.MathUtils.lerp(core.current.position.z, -0.15, 1 - Math.pow(0.001, dt));

      core.current.rotation.y += dt * (0.22 + clarity * 0.18);
      core.current.rotation.x = Math.sin(t * 0.25) * (0.06 + chaos * 0.08);
      core.current.rotation.z = Math.cos(t * 0.22) * (0.04 + chaos * 0.1);

      const s = THREE.MathUtils.lerp(1.05, 1.22, clarity);
      core.current.scale.setScalar(THREE.MathUtils.lerp(core.current.scale.x, s, 1 - Math.pow(0.001, dt)));
    }

    if (arcs.current) {
      arcs.current.rotation.y += dt * (0.12 + chaos * 0.35);
      arcs.current.rotation.z = (p - 0.5) * 0.15 + Math.sin(t * 0.25) * 0.05;
    }

    if (particles.current) {
      const mat = particles.current.material as THREE.PointsMaterial;
      const targetOpacity = mode === "lite" ? 0.18 : THREE.MathUtils.lerp(0.55, 0.26, clarity);
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 1 - Math.pow(0.001, dt));
    }

    if (grid.current) {
      grid.current.position.y = THREE.MathUtils.lerp(grid.current.position.y, -1.25, 1 - Math.pow(0.001, dt));
      grid.current.rotation.x = THREE.MathUtils.lerp(grid.current.rotation.x, -Math.PI / 2, 1 - Math.pow(0.001, dt));
      grid.current.rotation.z = Math.sin(t * 0.1) * 0.015;
    }

    if (uiPanels.current) {
      uiPanels.current.position.x = THREE.MathUtils.lerp(uiPanels.current.position.x, 0.2, 1 - Math.pow(0.001, dt));
      uiPanels.current.position.y = THREE.MathUtils.lerp(uiPanels.current.position.y, 0.05, 1 - Math.pow(0.001, dt));
      uiPanels.current.position.z = THREE.MathUtils.lerp(uiPanels.current.position.z, -0.7, 1 - Math.pow(0.001, dt));
      uiPanels.current.rotation.y = THREE.MathUtils.lerp(uiPanels.current.rotation.y, -0.22, 1 - Math.pow(0.001, dt));
      uiPanels.current.rotation.x = THREE.MathUtils.lerp(uiPanels.current.rotation.x, 0.06, 1 - Math.pow(0.001, dt));
      const fade = mode === "lite" ? 0.0 : THREE.MathUtils.lerp(0.0, 1.0, smoothstep((p - 0.08) / 0.2));
      uiPanels.current.visible = fade > 0.01;
      uiPanels.current.scale.setScalar(fade);
    }
  });

  return (
    <group ref={group}>
      <fog attach="fog" args={["#070A12", 8, 18]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[4, 3, 2]} intensity={1.2} />
      <LightingRig mode={mode} progress={progress} />

      <EnergyField ref={particles} mode={mode} />

      <group ref={grid}>
        <StormGrid mode={mode} progress={progress} />
      </group>

      <group ref={core}>
        <LightningIntelligenceCore mode={mode} progress={progress} />
      </group>

      <group ref={arcs}>
        <LightningArcs mode={mode} progress={progress} />
      </group>

      <group ref={uiPanels}>
        <DataPanels />
      </group>
    </group>
  );
}

const EnergyField = forwardRef<THREE.Points, { mode: "full" | "lite" }>(
  ({ mode }, ref) => {
    const geom = useMemo(() => {
      const count = mode === "lite" ? 450 : 1400;
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
        const mix = Math.random();
        const col = c1.clone().lerp(c2, mix);
        colors[i * 3 + 0] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      return g;
    }, [mode]);

    const mat = useMemo(() => {
      const m = new THREE.PointsMaterial({
        size: mode === "lite" ? 0.02 : 0.028,
        transparent: true,
        opacity: mode === "lite" ? 0.25 : 0.4,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      return m;
    }, [mode]);

    return <points ref={ref} geometry={geom} material={mat} position={[0, 0.0, 0]} />;
  }
);
EnergyField.displayName = "EnergyField";

function smoothstep(x: number) {
  const t = THREE.MathUtils.clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
}

function sampleKeyframes(t01: number, mode: "full" | "lite") {
  // Composition: keep core on the right, keep left copy readable.
  const z = mode === "lite" ? 6.4 : 6.15;
  const keys = [
    { pos: new THREE.Vector3(-0.2, 0.32, z), lookAt: new THREE.Vector3(0.6, 0.12, 0.0), drift: 0.08 },
    { pos: new THREE.Vector3(-0.55, 0.42, z + 0.15), lookAt: new THREE.Vector3(0.8, 0.1, 0.0), drift: 0.07 },
    { pos: new THREE.Vector3(-0.25, 0.28, z), lookAt: new THREE.Vector3(0.7, 0.08, 0.0), drift: 0.06 },
    { pos: new THREE.Vector3(-0.35, 0.46, z - 0.1), lookAt: new THREE.Vector3(0.55, 0.0, 0.0), drift: 0.05 },
    { pos: new THREE.Vector3(-0.2, 0.34, z + 0.05), lookAt: new THREE.Vector3(0.6, 0.06, 0.0), drift: 0.05 },
    { pos: new THREE.Vector3(-0.35, 0.32, z + 0.2), lookAt: new THREE.Vector3(0.7, 0.12, 0.0), drift: 0.06 },
    { pos: new THREE.Vector3(-0.25, 0.4, z + 0.22), lookAt: new THREE.Vector3(0.55, 0.14, 0.0), drift: 0.06 },
    { pos: new THREE.Vector3(-0.2, 0.32, z), lookAt: new THREE.Vector3(0.6, 0.12, 0.0), drift: 0.07 },
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

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function LightingRig({
  mode,
  progress,
}: {
  mode: "full" | "lite";
  progress: number;
}) {
  const flash = useRef<THREE.PointLight>(null);
  const key = useRef<THREE.PointLight>(null);
  const fill = useRef<THREE.PointLight>(null);

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const p = clamp01(progress);
    const heroT = clamp01(p / 0.22);
    const clarity = smoothstep(heroT);
    const chaos = 1 - clarity;

    if (key.current) {
      key.current.intensity = THREE.MathUtils.lerp(key.current.intensity, mode === "lite" ? 9 : 14, 1 - Math.pow(0.001, dt));
    }
    if (fill.current) {
      fill.current.intensity = THREE.MathUtils.lerp(fill.current.intensity, mode === "lite" ? 6 : 10, 1 - Math.pow(0.001, dt));
    }

    if (!flash.current || mode === "lite") return;
    // Occasional distant lightning flash: more chaotic at top, rarer as it stabilizes.
    const chance = THREE.MathUtils.lerp(0.028, 0.008, clarity);
    const doFlash = pseudoRand(t) < chance * (0.6 + 0.9 * chaos);
    const target = doFlash ? 55 : 0;
    flash.current.intensity = THREE.MathUtils.lerp(flash.current.intensity, target, 1 - Math.pow(0.0002, dt));
    flash.current.position.x = Math.sin(t * 1.7) * 5.5;
    flash.current.position.y = 2.2 + Math.sin(t * 0.7) * 0.4;
    flash.current.position.z = -6.5;
  });

  return (
    <>
      <pointLight
        ref={key}
        position={[2.4, 0.8, 1.8]}
        intensity={mode === "lite" ? 9 : 14}
        color={new THREE.Color("#2BC3FF")}
        distance={14}
      />
      <pointLight
        ref={fill}
        position={[-2.4, 1.2, 2.4]}
        intensity={mode === "lite" ? 6 : 10}
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
    </>
  );
}

function LightningIntelligenceCore({
  mode,
  progress,
}: {
  mode: "full" | "lite";
  progress: number;
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
        emissiveIntensity: 1.2,
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
    const heroT = clamp01(progress / 0.22);
    const clarity = smoothstep(heroT);
    const chaos = 1 - clarity;

    if (outer.current) {
      outer.current.rotation.y += dt * (0.12 + clarity * 0.22);
      outer.current.rotation.x += dt * (0.08 + chaos * 0.22);
    }
    if (inner.current) {
      const mat = inner.current.material as THREE.MeshStandardMaterial;
      const pulse = 0.9 + Math.sin(t * (mode === "lite" ? 1.2 : 1.9)) * 0.12;
      const raw = 1.7 + chaos * 1.0;
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, raw * pulse, 1 - Math.pow(0.001, dt));
      inner.current.scale.setScalar(THREE.MathUtils.lerp(inner.current.scale.x, 1.0 + chaos * 0.07, 1 - Math.pow(0.001, dt)));
    }
    if (ring.current) {
      ring.current.rotation.z += dt * (0.45 + clarity * 0.35);
      ring.current.rotation.x = THREE.MathUtils.lerp(ring.current.rotation.x, 0.3 + clarity * 0.25, 1 - Math.pow(0.001, dt));
      const mat = ring.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.6 + clarity * 1.2, 1 - Math.pow(0.001, dt));
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

function LightningArcs({ mode, progress }: { mode: "full" | "lite"; progress: number }) {
  const group = useRef<THREE.Group>(null);
  const arcCount = mode === "lite" ? 3 : 6;

  const arcs = useMemo(() => {
    return Array.from({ length: arcCount }, (_, i) => {
      const seed = i * 19.17 + 3.1;
      const color = i % 2 === 0 ? new THREE.Color("#2BC3FF") : new THREE.Color("#2EF2B5");
      return { seed, color };
    });
  }, [arcCount]);

  return (
    <group ref={group}>
      {arcs.map((a, idx) => (
        <DynamicArc key={idx} seed={a.seed} color={a.color} mode={mode} progress={progress} />
      ))}
    </group>
  );
}

function DynamicArc({
  seed,
  color,
  mode,
  progress,
}: {
  seed: number;
  color: THREE.Color;
  mode: "full" | "lite";
  progress: number;
}) {
  const geom = useMemo(() => new THREE.BufferGeometry(), []);
  const mat = useMemo(() => {
    const m = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    return m;
  }, [color]);

  const points = useMemo(() => {
    const n = mode === "lite" ? 22 : 34;
    const arr = new Float32Array(n * 3);
    geom.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return { n, arr };
  }, [geom, mode]);

  const lineObj = useMemo(() => new THREE.Line(geom, mat), [geom, mat]);

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const heroT = clamp01(progress / 0.22);
    const clarity = smoothstep(heroT);
    const chaos = 1 - clarity;

    const baseR = 1.05;
    const jitter = (mode === "lite" ? 0.12 : 0.18) * (0.35 + chaos);
    const phase = t * (mode === "lite" ? 1.2 : 1.8) + seed;

    // Flash probability: more frequent at top, rarer later.
    const flashChance = mode === "lite" ? 0.0 : THREE.MathUtils.lerp(0.085, 0.03, clarity);
    const flashing = pseudoRand(t * 1.7 + seed) < flashChance;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, flashing ? (0.75 + chaos * 0.2) : 0.05, 1 - Math.pow(0.0005, dt));

    const pos = geom.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < points.n; i++) {
      const u = i / (points.n - 1);
      const ang = u * Math.PI * 2 + phase * 0.6;
      const wave = Math.sin(ang * 3 + phase) * jitter;
      const r = baseR + wave;
      const y = (Math.sin(ang + phase) * 0.3 + Math.cos(phase * 0.7) * 0.06) * (0.6 + chaos * 0.8);
      const x = Math.cos(ang) * r;
      const z = Math.sin(ang) * r;

      // Pull arcs into structure as clarity increases: less y/noise.
      pos.setXYZ(i, x, THREE.MathUtils.lerp(y, y * 0.18, clarity), z);
    }
    pos.needsUpdate = true;
  });

  return <primitive object={lineObj} position={[1.35, 0.15, -0.15]} />;
}

function StormGrid({ mode, progress }: { mode: "full" | "lite"; progress: number }) {
  const grid = useMemo(() => {
    const size = 18;
    const div = mode === "lite" ? 24 : 40;
    const g = new THREE.GridHelper(size, div, "#2BC3FF", "#0F1E2A");
    (g.material as THREE.Material).transparent = true;
    (g.material as THREE.Material).opacity = mode === "lite" ? 0.2 : 0.28;
    return g;
  }, [mode]);

  const nodes = useMemo(() => {
    const count = mode === "lite" ? 30 : 80;
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
    const heroT = clamp01(progress / 0.22);
    const clarity = smoothstep(heroT);
    const chaos = 1 - clarity;
    const gmat = grid.material as THREE.Material;
    gmat.opacity = THREE.MathUtils.lerp(gmat.opacity, mode === "lite" ? 0.18 : THREE.MathUtils.lerp(0.34, 0.22, clarity), 1 - Math.pow(0.001, dt));

    const nmat = nodes.material as THREE.MeshBasicMaterial;
    nmat.opacity = THREE.MathUtils.lerp(nmat.opacity, mode === "lite" ? 0.55 : 0.72, 1 - Math.pow(0.001, dt));
    // Gentle traveling pulse through nodes.
    nodes.rotation.y = Math.sin(t * 0.06) * 0.08;
    nodes.position.y = -1.24 + Math.sin(t * 0.3) * 0.02 + chaos * 0.01;
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

function pseudoRand(x: number) {
  // deterministic-ish 0..1
  const s = Math.sin(x * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

