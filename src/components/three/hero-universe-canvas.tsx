"use client";

import React, {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
} from "react";
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
  heroRangeEnd = 0.26,
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
  const coreWorld = useRef(new THREE.Vector3());
  const lightningMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#E8FDFF"),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );
  const lightningGeoms = useMemo(() => {
    const boltCount = mode === "lite" ? 1 : 4;
    const ptCount = mode === "lite" ? 7 : 11;
    return Array.from({ length: boltCount }, () => {
      const geo = new THREE.BufferGeometry();
      const arr = new Float32Array(ptCount * 3);
      geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
      return geo;
    });
  }, [mode]);

  const lightningLines = useMemo(
    () => lightningGeoms.map((g) => new THREE.Line(g, lightningMat)),
    [lightningGeoms, lightningMat]
  );

  const { invalidate, camera } = useThree();

  useEffect(() => {
    invalidate();
  }, [progress, invalidate]);

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const p = clamp01(progress);
    const story = remapStoryProgress(p);

    // Hero evolution: raw → structured.
    const heroT = clamp01(story / Math.max(0.001, heroRangeEnd));
    const clarity = smoothstep(heroT);
    const chaos = 1 - clarity;

    // Handoff: slight move into the next story beat after hero.
    const handoff = smoothstep((story - heroRangeEnd * 0.9) / (heroRangeEnd * 0.7));

    const { pos, lookAt, drift } = sampleHeroCamera(story, mode);
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
        (story - 0.5) * 0.55,
        1 - Math.pow(0.001, dt)
      );
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -0.12 + story * 0.22,
        1 - Math.pow(0.001, dt)
      );
      group.current.position.x = THREE.MathUtils.lerp(
        group.current.position.x,
        (chaos - 0.5) * 0.18,
        1 - Math.pow(0.001, dt)
      );
    }

    if (core.current) {
      const baseX = mode === "lite" ? 1.42 : 1.78;
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
        ? smoothstep((story - heroRangeEnd * 0.35) / (heroRangeEnd * 0.9))
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

    // Lightning arcs: intense while chaotic, calm pulses as the story clarifies.
    if (core.current) {
      core.current.getWorldPosition(coreWorld.current);
    }
    const tg = coreWorld.current;
    const tw = state.clock.getElapsedTime();
    const lx = chaos * intensity;
    const strike = lx > 0.06 && frac(tw * 2.65) < 0.12 + lx * 0.26;
    lightningMat.opacity = strike ? 0.68 * lx : 0.035 * lx + 0.012 * (1 - chaos);

    const nPts = (lightningGeoms[0]?.getAttribute("position") as THREE.BufferAttribute | undefined)?.count ?? 0;
    if (nPts >= 2) {
      for (let b = 0; b < lightningGeoms.length; b++) {
        const geo = lightningGeoms[b];
        const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        const sx = tg.x + (hash01(b, 11) - 0.5) * 3.2 * Math.min(1, lx * 1.15 + 0.12);
        const sy = 3.15 + hash01(b, 13) * 0.55;
        const sz = tg.z - 0.75 + (hash01(b, 17) - 0.5) * 2.6;
        arr[0] = sx;
        arr[1] = sy;
        arr[2] = sz;
        for (let i = 1; i < nPts - 1; i++) {
          const u = i / (nPts - 1);
          const bx = THREE.MathUtils.lerp(sx, tg.x, u);
          const by = THREE.MathUtils.lerp(sy, tg.y, u);
          const bz = THREE.MathUtils.lerp(sz, tg.z, u);
          const jx = (pseudoRand(tw * 1.65 + b * 0.37 + i * 0.19) - 0.5) * lx * (1 - u) * 2.5;
          const jz = (pseudoRand(tw * 2.05 + i * 0.33) - 0.5) * lx * (1 - u) * 1.75;
          arr[i * 3] = bx + jx;
          arr[i * 3 + 1] = by;
          arr[i * 3 + 2] = bz + jz;
        }
        arr[(nPts - 1) * 3] = tg.x;
        arr[(nPts - 1) * 3 + 1] = tg.y;
        arr[(nPts - 1) * 3 + 2] = tg.z;
        posAttr.needsUpdate = true;
      }
    }

    invalidate();
  });

  return (
    <group ref={group}>
      <fog attach="fog" args={["#070A12", 7, 16.5]} />
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
        <EnergyGrid
          key={mode}
          mode={mode}
          progress={remapStoryProgress(clamp01(progress))}
          heroRangeEnd={heroRangeEnd}
        />
      </group>

      <group ref={core}>
        <IntelligenceCore
          mode={mode}
          progress={remapStoryProgress(clamp01(progress))}
          heroRangeEnd={heroRangeEnd}
          intensity={intensity}
        />
      </group>

      <group ref={uiPanels}>{showPanels ? <HolographicPanels /> : null}</group>

      <group>
        {lightningLines.map((ln, i) => (
          <primitive key={i} object={ln} />
        ))}
      </group>
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
        const u1 = hash01(i, 11);
        const u2 = hash01(i, 17);
        const u3 = hash01(i, 23);
        const u4 = hash01(i, 29);
        const r = 5.2 * Math.sqrt(u1);
        const a = u2 * Math.PI * 2;
        positions[i * 3 + 0] = Math.cos(a) * r;
        positions[i * 3 + 1] = (u3 - 0.5) * 1.6;
        positions[i * 3 + 2] = Math.sin(a) * r;
        const col = c1.clone().lerp(c2, u4);
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
  const cage = useRef<THREE.LineSegments>(null);
  const innerPulse = useRef<THREE.Mesh>(null);

  const outerGeo = useMemo(() => new THREE.IcosahedronGeometry(0.95, 2), []);
  const innerGeo = useMemo(() => new THREE.SphereGeometry(0.56, 32, 32), []);
  const ringGeo = useMemo(() => new THREE.TorusGeometry(0.92, 0.02, 10, 220), []);
  const glowGeo = useMemo(() => new THREE.SphereGeometry(1.15, 24, 24), []);
  const cageGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.02, 1)), []);
  const pulseGeo = useMemo(() => new THREE.TorusGeometry(0.62, 0.012, 8, 96), []);

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const heroT = clamp01(progress / Math.max(0.001, heroRangeEnd));
    const clarity = smoothstep(heroT);
    const chaos = 1 - clarity;

    if (outer.current) {
      outer.current.rotation.y += dt * (0.12 + clarity * 0.2);
      outer.current.rotation.x += dt * (0.08 + chaos * 0.22);
    }
    if (inner.current) {
      const mat = inner.current.material as THREE.MeshStandardMaterial;
      const pulse = 0.9 + Math.sin(t * (mode === "lite" ? 1.1 : 1.95)) * 0.14;
      const raw = 1.35 + chaos * 1.05 + clarity * 0.55;
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        raw * pulse * intensity,
        1 - Math.pow(0.001, dt)
      );
      inner.current.scale.setScalar(
        THREE.MathUtils.lerp(inner.current.scale.x, 1.0 + chaos * 0.08, 1 - Math.pow(0.001, dt))
      );
    }
    if (ring.current) {
      ring.current.rotation.z += dt * (0.45 + clarity * 0.38);
      ring.current.rotation.x = THREE.MathUtils.lerp(
        ring.current.rotation.x,
        0.28 + clarity * 0.26,
        1 - Math.pow(0.001, dt)
      );
      const mat = ring.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        (0.55 + clarity * 1.35 + chaos * 0.35) * intensity,
        1 - Math.pow(0.001, dt)
      );
    }
    if (glow.current) {
      const mat = glow.current.material as THREE.MeshBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(
        mat.opacity,
        mode === "lite" ? 0.06 : 0.1 + chaos * 0.12 + clarity * 0.06,
        1 - Math.pow(0.001, dt)
      );
    }
    if (cage.current) {
      const mat = cage.current.material as THREE.LineBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.07 + chaos * 0.42 + clarity * 0.12, 1 - Math.pow(0.001, dt));
      cage.current.rotation.y += dt * (0.05 + chaos * 0.12);
      cage.current.rotation.x = Math.sin(t * 0.31) * (0.04 + chaos * 0.1);
    }
    if (innerPulse.current) {
      innerPulse.current.rotation.z += dt * (1.1 + clarity * 0.9);
      innerPulse.current.rotation.x = 0.52 + clarity * 0.2;
      const mat = innerPulse.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + chaos * 0.35 + Math.sin(t * 3.2) * 0.04 * chaos;
    }
  });

  return (
    <group>
      <mesh ref={glow} geometry={glowGeo}>
        <meshBasicMaterial
          color={new THREE.Color("#2BC3FF")}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <lineSegments ref={cage} geometry={cageGeo}>
        <lineBasicMaterial
          color={new THREE.Color("#7AE8FF")}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
      <mesh ref={outer} geometry={outerGeo}>
        <meshStandardMaterial
          color={new THREE.Color("#07111F")}
          metalness={0.72}
          roughness={0.2}
          emissive={new THREE.Color("#061A22")}
          emissiveIntensity={1.15}
        />
      </mesh>
      <mesh ref={inner} geometry={innerGeo} position={[0, 0, 0.02]}>
        <meshStandardMaterial
          color={new THREE.Color("#081021")}
          metalness={0.25}
          roughness={0.16}
          emissive={new THREE.Color("#2BC3FF")}
          emissiveIntensity={1.6}
        />
      </mesh>
      <mesh ref={innerPulse} geometry={pulseGeo} rotation={[0.55, 0.2, 0]}>
        <meshBasicMaterial
          color={new THREE.Color("#2EF2B5")}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ring} geometry={ringGeo} rotation={[0.4, 0.2, 0]}>
        <meshStandardMaterial
          color={new THREE.Color("#0A1526")}
          metalness={0.88}
          roughness={0.22}
          emissive={new THREE.Color("#2EF2B5")}
          emissiveIntensity={0.9}
        />
      </mesh>
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
  const nodesPivot = useRef<THREE.Group>(null);

  const { gridDiv, nodeCount } = useMemo(() => {
    return {
      gridDiv: mode === "lite" ? 24 : 40,
      nodeCount: mode === "lite" ? 26 : 72,
    };
  }, [mode]);

  const { grid, nodes } = useMemo(() => {
    const size = 18;
    const g = new THREE.GridHelper(size, gridDiv, "#2BC3FF", "#0F1E2A");
    const gmat = g.material as THREE.Material;
    gmat.transparent = true;
    gmat.opacity = mode === "lite" ? 0.2 : 0.28;

    const geo = new THREE.SphereGeometry(0.03, 10, 10);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#2EF2B5"),
      transparent: true,
      opacity: mode === "lite" ? 0.55 : 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const inst = new THREE.InstancedMesh(geo, mat, nodeCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < nodeCount; i++) {
      const x = (hash01(i, 41) - 0.5) * 12;
      const z = (hash01(i, 47) - 0.5) * 12;
      dummy.position.set(x, 0, z);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;

    return { grid: g, nodes: inst };
  }, [gridDiv, mode, nodeCount]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const heroT = clamp01(progress / Math.max(0.001, heroRangeEnd));
    const clarity = smoothstep(heroT);
    const chaos = 1 - clarity;
    const pivot = nodesPivot.current;
    if (!pivot) return;
    pivot.rotation.y = Math.sin(t * 0.06) * (0.06 + chaos * 0.05);
    pivot.position.y = Math.sin(t * 0.3) * (0.012 + chaos * 0.018);

    const gmat = grid.material as THREE.Material | THREE.Material[];
    const mats = Array.isArray(gmat) ? gmat : [gmat];
    const breathe = 0.2 + Math.sin(t * (1.15 + chaos * 0.9)) * 0.035 * chaos + clarity * 0.08;
    for (const m of mats) {
      (m as THREE.Material & { opacity?: number }).opacity = mode === "lite" ? 0.19 : breathe;
    }
  });

  return (
    <group position={[0, -1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <primitive object={grid} />
      <StormGridPulse progress={progress} heroRangeEnd={heroRangeEnd} mode={mode} />
      <group ref={nodesPivot}>
        <primitive object={nodes} />
      </group>
    </group>
  );
}

function StormGridPulse({
  progress,
  heroRangeEnd,
  mode,
}: {
  progress: number;
  heroRangeEnd: number;
  mode: HeroPerfMode;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const ringGeo = useMemo(() => new THREE.RingGeometry(0.35, 0.37, 56), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#3ED0FF"),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    const heroT = clamp01(progress / Math.max(0.001, heroRangeEnd));
    const clarity = smoothstep(heroT);
    const phase = (t * (0.26 + clarity * 0.24)) % 1;
    mesh.current.scale.setScalar(1.6 + phase * 11);
    mat.opacity = (1 - phase) * 0.13 * (0.4 + clarity) * (mode === "lite" ? 0.55 : 1);
    mesh.current.rotation.z = t * 0.045;
  });

  return <mesh ref={mesh} geometry={ringGeo} material={mat} position={[0, 0.02, 0]} />;
}

function HolographicPanels() {
  const glass = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#071018"),
        transparent: true,
        opacity: 0.38,
        blending: THREE.NormalBlending,
      }),
    []
  );
  const glowBack = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#2BC3FF"),
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );
  const edge = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#5AE8FF"),
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
      }),
    []
  );
  const geo = useMemo(() => new THREE.PlaneGeometry(1.45, 0.92, 1, 1), []);
  const glowGeo = useMemo(() => new THREE.PlaneGeometry(1.62, 1.05, 1, 1), []);
  const outline = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const w = 0.725;
    const h = 0.46;
    const pts = [
      new THREE.Vector3(-w, -h, 0),
      new THREE.Vector3(w, -h, 0),
      new THREE.Vector3(w, h, 0),
      new THREE.Vector3(-w, h, 0),
      new THREE.Vector3(-w, -h, 0),
    ];
    g.setFromPoints(pts);
    return g;
  }, []);

  const line1 = useMemo(() => new THREE.Line(outline, edge), [outline, edge]);
  const line2 = useMemo(() => new THREE.Line(outline, edge), [outline, edge]);

  const chartPts = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pts: THREE.Vector3[] = [];
    let y = -0.28;
    for (let i = 0; i < 14; i++) {
      const x = -0.55 + (i / 13) * 1.1;
      y += (hash01(i, 91) - 0.42) * 0.05;
      y = THREE.MathUtils.clamp(y, -0.32, 0.28);
      pts.push(new THREE.Vector3(x, y, 0.004));
    }
    g.setFromPoints(pts);
    return g;
  }, []);
  const chartLine = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#2EF2B5"),
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  const chartLineObj = useMemo(() => new THREE.Line(chartPts, chartLine), [chartPts, chartLine]);

  const heights = useMemo(() => [0.14, 0.22, 0.31, 0.26, 0.38, 0.2], []);

  return (
    <group>
      <mesh geometry={glowGeo} material={glowBack} position={[0.02, -0.02, -0.06]} rotation={[0, 0.12, 0]} />
      <mesh geometry={geo} material={glass} position={[0, 0, 0]} rotation={[0, 0.12, 0]} />
      <primitive object={line1} position={[0, 0, 0.003]} rotation={[0, 0.12, 0]} />
      <primitive object={chartLineObj} position={[0, 0.02, 0.008]} rotation={[0, 0.12, 0]} />

      {heights.map((h, i) => (
        <mesh
          key={i}
          position={[-0.42 + i * 0.16, -0.34 + h * 0.5, 0.012]}
          rotation={[0, 0.12, 0]}
        >
          <boxGeometry args={[0.1, h, 0.03]} />
          <meshStandardMaterial
            color="#050c14"
            metalness={0.82}
            roughness={0.18}
            emissive="#2EF2B5"
            emissiveIntensity={1.15}
            transparent
            opacity={0.92}
          />
        </mesh>
      ))}

      <mesh geometry={geo} material={glass} position={[0.28, -0.64, -0.2]} rotation={[0, 0.32, 0]} scale={0.76} />
      <primitive object={line2} position={[0.28, -0.64, -0.198]} rotation={[0, 0.32, 0]} scale={0.76} />
    </group>
  );
}

function sampleHeroCamera(t01: number, mode: HeroPerfMode) {
  // Frame the energy core in the right third; keep the optical weight off the headline column.
  const z = mode === "lite" ? 6.45 : 6.18;
  const keys = [
    { pos: new THREE.Vector3(-0.42, 0.34, z), lookAt: new THREE.Vector3(0.92, 0.1, -0.1), drift: 0.072 },
    { pos: new THREE.Vector3(-0.68, 0.44, z + 0.12), lookAt: new THREE.Vector3(1.02, 0.08, -0.12), drift: 0.064 },
    { pos: new THREE.Vector3(-0.38, 0.3, z), lookAt: new THREE.Vector3(0.96, 0.06, -0.08), drift: 0.056 },
    { pos: new THREE.Vector3(-0.52, 0.48, z - 0.1), lookAt: new THREE.Vector3(0.88, 0.02, -0.1), drift: 0.048 },
    { pos: new THREE.Vector3(-0.58, 0.4, z + 0.06), lookAt: new THREE.Vector3(0.98, 0.05, -0.12), drift: 0.044 },
    { pos: new THREE.Vector3(-0.46, 0.36, z - 0.06), lookAt: new THREE.Vector3(0.94, 0.04, -0.08), drift: 0.04 },
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

function frac(v: number) {
  return v - Math.floor(v);
}

function hash01(i: number, salt: number) {
  // Deterministic [0,1) — avoids impure RNG during render/memo.
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453123;
  return x - Math.floor(x);
}

function remapStoryProgress(p: number) {
  // Make scroll progression feel like intentional “beats”, not linear time.
  // Monotonic, mostly linear — but front-loaded so the hero evolves early,
  // then the world keeps tightening as the story sections advance.
  const x = clamp01(p);
  const a = 0.12;
  const b = 0.32;
  const c = 0.62;

  if (x <= a) return (x / a) * 0.34;
  if (x <= b) return 0.34 + ((x - a) / (b - a)) * 0.28;
  if (x <= c) return 0.62 + ((x - b) / (c - b)) * 0.22;
  return 0.84 + ((x - c) / (1 - c)) * 0.16;
}

