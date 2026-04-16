"use client";

import React, { forwardRef, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

const BG = "#020510";
const FOG_NEAR = 5.2;
const FOG_FAR = 20;

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
        dpr={mode === "lite" ? [1, 1.15] : [1, 2]}
        frameloop="demand"
        gl={{
          antialias: mode !== "lite",
          powerPreference: mode === "lite" ? "default" : "high-performance",
          alpha: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: mode === "lite" ? 0.92 : 1.05,
        }}
        camera={{ fov: 40, position: [0, 0.34, 6.05] }}
      >
        <color attach="background" args={[BG]} />
        <HeroUniverseScene
          progress={progress}
          mode={mode}
          heroRangeEnd={heroRangeEnd}
          showPanels={showPanels}
          intensity={intensity}
        />
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
  const rim = useRef<THREE.SpotLight>(null);
  const coreWorld = useRef(new THREE.Vector3());

  const boltCount = mode === "lite" ? 2 : 7;
  const ptCount = mode === "lite" ? 9 : 14;

  const lightningMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#F4FDFF"),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );
  const branchMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#5AE8FF"),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  const lightningGeoms = useMemo(() => {
    return Array.from({ length: boltCount }, () => {
      const geo = new THREE.BufferGeometry();
      const arr = new Float32Array(ptCount * 3);
      geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
      return geo;
    });
  }, [boltCount, ptCount]);

  const branchGeoms = useMemo(() => {
    const branches = mode === "lite" ? 0 : boltCount;
    const bPts = 5;
    return Array.from({ length: branches }, () => {
      const geo = new THREE.BufferGeometry();
      const arr = new Float32Array(bPts * 3);
      geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
      return geo;
    });
  }, [boltCount, mode]);

  const lightningLines = useMemo(
    () => lightningGeoms.map((g) => new THREE.Line(g, lightningMat)),
    [lightningGeoms, lightningMat]
  );
  const branchLines = useMemo(
    () => branchGeoms.map((g) => new THREE.Line(g, branchMat)),
    [branchGeoms, branchMat]
  );

  const { invalidate, camera } = useThree();

  useEffect(() => {
    invalidate();
  }, [progress, invalidate]);

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const p = clamp01(progress);
    const story = remapStoryProgress(p);

    const heroT = clamp01(story / Math.max(0.001, heroRangeEnd));
    const clarity = smoothstep(heroT);
    const chaos = 1 - clarity;

    const handoff = smoothstep((story - heroRangeEnd * 0.9) / (heroRangeEnd * 0.7));

    const { pos, lookAt, drift } = sampleHeroCamera(story, mode, clarity);
    camera.position.lerp(
      pos
        .clone()
        .add(
          new THREE.Vector3(
            Math.sin(t * 0.32) * drift * (0.85 + chaos * 0.35),
            Math.cos(t * 0.28) * drift * 0.5 * (0.9 + chaos * 0.25),
            0
          )
        )
        .add(new THREE.Vector3(0, -handoff * 0.07, -handoff * 0.28)),
      1 - Math.pow(0.001, dt)
    );
    camera.lookAt(lookAt);

    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        (story - 0.5) * 0.48,
        1 - Math.pow(0.001, dt)
      );
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -0.1 + story * 0.18 + chaos * 0.04,
        1 - Math.pow(0.001, dt)
      );
      group.current.position.x = THREE.MathUtils.lerp(
        group.current.position.x,
        (chaos - 0.5) * 0.14,
        1 - Math.pow(0.001, dt)
      );
    }

    if (core.current) {
      const baseX = mode === "lite" ? 1.55 : 2.05;
      core.current.position.x = THREE.MathUtils.lerp(
        core.current.position.x,
        baseX + handoff * 0.12 + chaos * 0.04,
        1 - Math.pow(0.001, dt)
      );
      core.current.position.y = THREE.MathUtils.lerp(
        core.current.position.y,
        0.1 + Math.sin(t * 0.55) * (mode === "lite" ? 0.035 : 0.055) + chaos * 0.07,
        1 - Math.pow(0.001, dt)
      );
      core.current.position.z = THREE.MathUtils.lerp(
        core.current.position.z,
        -0.22 - handoff * 0.22,
        1 - Math.pow(0.001, dt)
      );
      core.current.rotation.y += dt * (0.18 + clarity * 0.22);
      core.current.rotation.x = Math.sin(t * 0.25) * (0.05 + chaos * 0.1);
      core.current.rotation.z = Math.cos(t * 0.21) * (0.04 + chaos * 0.08);
      const s = THREE.MathUtils.lerp(1.0, 1.14, clarity) * (1 - handoff * 0.04);
      core.current.scale.setScalar(THREE.MathUtils.lerp(core.current.scale.x, s, 1 - Math.pow(0.001, dt)));
    }

    if (grid.current) {
      grid.current.position.y = THREE.MathUtils.lerp(grid.current.position.y, -1.28, 1 - Math.pow(0.001, dt));
      grid.current.rotation.x = THREE.MathUtils.lerp(grid.current.rotation.x, -Math.PI / 2, 1 - Math.pow(0.001, dt));
      grid.current.rotation.z = Math.sin(t * 0.1) * (0.012 + chaos * 0.02);
    }

    if (particles.current) {
      const mat = particles.current.material as THREE.PointsMaterial;
      const targetOpacity =
        mode === "lite"
          ? 0.14
          : THREE.MathUtils.lerp(0.52, 0.2, clarity) * intensity;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 1 - Math.pow(0.001, dt));
    }

    if (uiPanels.current) {
      const reveal = showPanels
        ? smoothstep((story - heroRangeEnd * 0.32) / (heroRangeEnd * 0.92))
        : 0;
      uiPanels.current.visible = reveal > 0.01;
      uiPanels.current.scale.setScalar(reveal);
      uiPanels.current.position.x = THREE.MathUtils.lerp(uiPanels.current.position.x, 0.02, 1 - Math.pow(0.001, dt));
      uiPanels.current.position.y = THREE.MathUtils.lerp(uiPanels.current.position.y, 0.02, 1 - Math.pow(0.001, dt));
      uiPanels.current.position.z = THREE.MathUtils.lerp(
        uiPanels.current.position.z,
        -0.82 - handoff * 0.18,
        1 - Math.pow(0.001, dt)
      );
      uiPanels.current.rotation.y = THREE.MathUtils.lerp(uiPanels.current.rotation.y, -0.22, 1 - Math.pow(0.001, dt));
      uiPanels.current.rotation.x = THREE.MathUtils.lerp(uiPanels.current.rotation.x, 0.05, 1 - Math.pow(0.001, dt));
    }

    if (key.current) {
      key.current.intensity = THREE.MathUtils.lerp(
        key.current.intensity,
        (mode === "lite" ? 10 : 16) * intensity * (0.92 + chaos * 0.12),
        1 - Math.pow(0.001, dt)
      );
    }
    if (fill.current) {
      fill.current.intensity = THREE.MathUtils.lerp(
        fill.current.intensity,
        (mode === "lite" ? 5.5 : 9) * intensity * (0.88 + clarity * 0.18),
        1 - Math.pow(0.001, dt)
      );
    }
    if (rim.current && mode !== "lite") {
      rim.current.intensity = THREE.MathUtils.lerp(
        rim.current.intensity,
        4.2 * intensity * (0.65 + clarity * 0.45),
        1 - Math.pow(0.001, dt)
      );
    }
    if (flash.current && mode !== "lite") {
      const chance = THREE.MathUtils.lerp(0.032, 0.009, clarity);
      const doFlash = pseudoRand(t) < chance * (0.75 + chaos * 1.1);
      const target = doFlash ? 62 * intensity : 0;
      flash.current.intensity = THREE.MathUtils.lerp(flash.current.intensity, target, 1 - Math.pow(0.0002, dt));
      flash.current.position.x = Math.sin(t * 1.85) * 6.2;
      flash.current.position.y = 2.35 + Math.sin(t * 0.72) * 0.45;
      flash.current.position.z = -7.2;
    }

    if (core.current) {
      core.current.getWorldPosition(coreWorld.current);
    }
    const tg = coreWorld.current;
    const tw = t;
    const lx = chaos * intensity;
    const strike = lx > 0.05 && frac(tw * 2.85) < 0.11 + lx * 0.32;
    const strikeN = strike ? 1 : 0;
    lightningMat.opacity = strike ? 0.82 * lx : 0.045 * lx + 0.015 * (1 - chaos);
    branchMat.opacity = strike ? 0.55 * lx : 0.02 * lx + 0.01 * (1 - chaos);

    const nPts = (lightningGeoms[0]?.getAttribute("position") as THREE.BufferAttribute | undefined)?.count ?? 0;
    if (nPts >= 2) {
      for (let b = 0; b < lightningGeoms.length; b++) {
        const geo = lightningGeoms[b];
        const posAttr = geo.getAttribute("position") as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        const sx = tg.x + (hash01(b, 11) - 0.5) * 4.1 * Math.min(1, lx * 1.2 + 0.15);
        const sy = 3.35 + hash01(b, 13) * 0.65 + chaos * 0.35;
        const sz = tg.z - 0.85 + (hash01(b, 17) - 0.5) * 3.1;
        arr[0] = sx;
        arr[1] = sy;
        arr[2] = sz;
        for (let i = 1; i < nPts - 1; i++) {
          const u = i / (nPts - 1);
          const bx = THREE.MathUtils.lerp(sx, tg.x, u);
          const by = THREE.MathUtils.lerp(sy, tg.y, u);
          const bz = THREE.MathUtils.lerp(sz, tg.z, u);
          const jitter =
            (1 - u) *
            lx *
            (1.15 + strikeN * 1.4) *
            (0.55 + 0.45 * Math.sin(tw * 6.2 + b + i * 0.37));
          const jx = (pseudoRand(tw * 1.72 + b * 0.41 + i * 0.21) - 0.5) * jitter * 2.8;
          const jy = (pseudoRand(tw * 2.11 + i * 0.29) - 0.5) * jitter * 0.55 * chaos;
          const jz = (pseudoRand(tw * 2.33 + i * 0.51) - 0.5) * jitter * 2.1;
          arr[i * 3] = bx + jx;
          arr[i * 3 + 1] = by + jy;
          arr[i * 3 + 2] = bz + jz;
        }
        arr[(nPts - 1) * 3] = tg.x;
        arr[(nPts - 1) * 3 + 1] = tg.y;
        arr[(nPts - 1) * 3 + 2] = tg.z;
        posAttr.needsUpdate = true;

        if (branchGeoms[b]) {
          const bgeo = branchGeoms[b];
          const bAttr = bgeo.getAttribute("position") as THREE.BufferAttribute;
          const br = bAttr.array as Float32Array;
          const mid = Math.floor(nPts / 2);
          const mx = arr[mid * 3];
          const my = arr[mid * 3 + 1];
          const mz = arr[mid * 3 + 2];
          const fork = new THREE.Vector3(
            (hash01(b, 101) - 0.5) * 1.35,
            -0.35 - hash01(b, 103) * 0.85,
            (hash01(b, 107) - 0.5) * 1.15
          );
          br[0] = mx;
          br[1] = my;
          br[2] = mz;
          br[3] = mx + fork.x * 0.45;
          br[4] = my + fork.y * 0.45;
          br[5] = mz + fork.z * 0.45;
          br[6] = mx + fork.x * 0.92 + (pseudoRand(tw + b) - 0.5) * lx;
          br[7] = my + fork.y * 0.92;
          br[8] = mz + fork.z * 0.92 + (pseudoRand(tw * 1.1 + b) - 0.5) * lx;
          br[9] = tg.x * 0.55 + mx * 0.45;
          br[10] = tg.y * 0.4 + my * 0.6;
          br[11] = tg.z * 0.55 + mz * 0.45;
          br[12] = tg.x;
          br[13] = tg.y;
          br[14] = tg.z;
          bAttr.needsUpdate = true;
        }
      }
    }

    invalidate();
  });

  return (
    <group ref={group}>
      <fog attach="fog" args={[BG, FOG_NEAR, FOG_FAR]} />
      <ambientLight intensity={0.18} color="#0a1a2e" />
      <directionalLight position={[5.5, 5.2, 3.2]} intensity={0.35} color="#b8dcff" />

      <spotLight
        ref={rim}
        position={[-4.2, 2.8, 2.4]}
        angle={0.55}
        penumbra={0.92}
        intensity={mode === "lite" ? 0 : 4.2 * intensity}
        color="#2bc3ff"
        distance={22}
        decay={2}
      />

      <pointLight
        ref={key}
        position={[2.85, 0.65, 1.95]}
        intensity={(mode === "lite" ? 10 : 16) * intensity}
        color={new THREE.Color("#2BC3FF")}
        distance={15}
      />
      <pointLight
        ref={fill}
        position={[-2.85, 1.15, 2.55]}
        intensity={(mode === "lite" ? 5.5 : 9) * intensity}
        color={new THREE.Color("#2EF2B5")}
        distance={17}
      />
      <pointLight
        ref={flash}
        position={[0, 2.35, -7.2]}
        intensity={0}
        color={new THREE.Color("#E8FBFF")}
        distance={24}
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
        <LightningIntelligenceCore
          mode={mode}
          progress={remapStoryProgress(clamp01(progress))}
          heroRangeEnd={heroRangeEnd}
          intensity={intensity}
        />
        <ConductiveNetwork
          mode={mode}
          progress={remapStoryProgress(clamp01(progress))}
          heroRangeEnd={heroRangeEnd}
          intensity={intensity}
        />
      </group>

      <group ref={uiPanels}>{showPanels ? <HolographicPanels /> : null}</group>

      <group>
        {lightningLines.map((ln, i) => (
          <primitive key={`b-${i}`} object={ln} />
        ))}
        {branchLines.map((ln, i) => (
          <primitive key={`br-${i}`} object={ln} />
        ))}
      </group>
    </group>
  );
});

const EnergyParticles = forwardRef<THREE.Points, { mode: HeroPerfMode }>(({ mode }, ref) => {
  const geom = useMemo(() => {
    const count = mode === "lite" ? 380 : 980;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const c1 = new THREE.Color("#2BC3FF");
    const c2 = new THREE.Color("#2EF2B5");
    const cStorm = new THREE.Color("#dfefff");
    for (let i = 0; i < count; i++) {
      const u1 = hash01(i, 11);
      const u2 = hash01(i, 17);
      const u3 = hash01(i, 23);
      const u4 = hash01(i, 29);
      const layer = u1 < 0.22 ? 1.35 : 5.0 * Math.sqrt(u1);
      const a = u2 * Math.PI * 2;
      positions[i * 3 + 0] = Math.cos(a) * layer;
      positions[i * 3 + 1] = (u3 - 0.5) * (u1 < 0.22 ? 3.2 : 1.45);
      positions[i * 3 + 2] = Math.sin(a) * layer;
      const col = u1 < 0.15 ? cStorm.clone().lerp(c1, u4) : c1.clone().lerp(c2, u4);
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
        size: mode === "lite" ? 0.018 : 0.024,
        transparent: true,
        opacity: mode === "lite" ? 0.18 : 0.34,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    [mode]
  );

  return <points ref={ref} geometry={geom} material={mat} />;
});
EnergyParticles.displayName = "EnergyParticles";

function LightningIntelligenceCore({
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
  const root = useRef<THREE.Group>(null);
  const innerOct = useRef<THREE.Mesh>(null);
  const plasmaA = useRef<THREE.Mesh>(null);
  const plasmaB = useRef<THREE.Mesh>(null);
  const cage = useRef<THREE.LineSegments>(null);
  const ortho = useRef<THREE.Group>(null);
  const laminations = useRef<THREE.Group>(null);

  const octInnerGeo = useMemo(() => new THREE.OctahedronGeometry(0.46, 0), []);
  const octShellGeo = useMemo(() => new THREE.OctahedronGeometry(0.98, 1), []);
  const plasmaAGeo = useMemo(() => new THREE.OctahedronGeometry(1.32, 2), []);
  const plasmaBGeo = useMemo(() => new THREE.OctahedronGeometry(0.78, 1), []);
  const cageGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1.08, 1)), []);

  const laminationDefs = useMemo(
    () => [
      { sx: 0.05, sy: 1.05, sz: 1.05, pz: 0 },
      { sx: 0.045, sy: 0.92, sz: 0.92, pz: 0.09 },
      { sx: 0.04, sy: 0.8, sz: 0.8, pz: -0.09 },
      { sx: 0.038, sy: 0.68, sz: 0.68, pz: 0.16 },
      { sx: 0.036, sy: 0.56, sz: 0.56, pz: -0.16 },
    ],
    []
  );

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const heroT = clamp01(progress / Math.max(0.001, heroRangeEnd));
    const clarity = smoothstep(heroT);
    const chaos = 1 - clarity;

    if (root.current) {
      root.current.rotation.y += dt * (0.08 + clarity * 0.2 + chaos * 0.05);
    }
    if (innerOct.current) {
      const mat = innerOct.current.material as THREE.MeshPhysicalMaterial;
      const pulse = 0.88 + Math.sin(t * (1.55 + chaos * 0.9)) * 0.18;
      mat.emissiveIntensity = THREE.MathUtils.lerp(
        mat.emissiveIntensity,
        (2.1 + chaos * 1.45 + clarity * 1.05) * pulse * intensity,
        1 - Math.pow(0.001, dt)
      );
    }
    if (plasmaA.current) {
      const m = plasmaA.current.material as THREE.MeshBasicMaterial;
      m.opacity = THREE.MathUtils.lerp(
        m.opacity,
        (mode === "lite" ? 0.05 : 0.07) + chaos * 0.16 + clarity * 0.05,
        1 - Math.pow(0.001, dt)
      );
      plasmaA.current.rotation.y += dt * (0.04 + chaos * 0.1);
      plasmaA.current.scale.setScalar(1 + Math.sin(t * 1.65) * 0.04 * chaos);
    }
    if (plasmaB.current) {
      const m = plasmaB.current.material as THREE.MeshBasicMaterial;
      m.opacity = THREE.MathUtils.lerp(
        m.opacity,
        (mode === "lite" ? 0.06 : 0.09) + chaos * 0.12,
        1 - Math.pow(0.001, dt)
      );
      plasmaB.current.rotation.y -= dt * (0.11 + clarity * 0.08);
    }
    if (cage.current) {
      const mat = cage.current.material as THREE.LineBasicMaterial;
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.12 + chaos * 0.38 + clarity * 0.22, 1 - Math.pow(0.001, dt));
      cage.current.rotation.y += dt * (0.06 + chaos * 0.1);
      cage.current.rotation.x = Math.sin(t * 0.34) * (0.05 + chaos * 0.12);
    }
    if (ortho.current) {
      ortho.current.rotation.x += dt * (0.05 + chaos * 0.14);
      ortho.current.rotation.y += dt * (0.1 + clarity * 0.18);
      ortho.current.rotation.z = Math.sin(t * 0.27) * (0.03 + chaos * 0.08);
    }
    if (laminations.current) {
      laminations.current.rotation.y = Math.sin(t * 0.18) * (0.04 + chaos * 0.08);
      laminations.current.rotation.z = Math.cos(t * 0.15) * (0.03 + chaos * 0.06);
    }
  });

  return (
    <group ref={root}>
      <mesh ref={plasmaA} geometry={plasmaAGeo}>
        <meshBasicMaterial
          color={new THREE.Color("#1cb7ff")}
          transparent
          opacity={0.07}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={plasmaB} geometry={plasmaBGeo} rotation={[0.35, 0.6, 0.2]}>
        <meshBasicMaterial
          color={new THREE.Color("#7cf9ff")}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <lineSegments ref={cage} geometry={cageGeo}>
        <lineBasicMaterial
          color={new THREE.Color("#B8F7FF")}
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      <mesh geometry={octShellGeo}>
        <meshStandardMaterial
          color={new THREE.Color("#040a12")}
          metalness={0.9}
          roughness={0.14}
          emissive={new THREE.Color("#061a28")}
          emissiveIntensity={1.05}
        />
      </mesh>

      <mesh ref={innerOct} geometry={octInnerGeo}>
        <meshPhysicalMaterial
          color={new THREE.Color("#020810")}
          metalness={0.42}
          roughness={0.06}
          transmission={mode === "lite" ? 0 : 0.28}
          thickness={0.55}
          ior={1.45}
          clearcoat={mode === "lite" ? 0 : 1}
          clearcoatRoughness={0.12}
          emissive={new THREE.Color("#1ee8ff")}
          emissiveIntensity={2.2}
        />
      </mesh>

      <group ref={laminations}>
        {laminationDefs.map((d, i) => (
          <mesh key={i} position={[0, 0, d.pz]} rotation={[0, i * 0.09, 0]}>
            <boxGeometry args={[d.sx, d.sy, d.sz]} />
            <meshStandardMaterial
              color={new THREE.Color("#060f1c")}
              metalness={0.94}
              roughness={0.18}
              emissive={new THREE.Color("#1a5c6e")}
              emissiveIntensity={0.42}
            />
          </mesh>
        ))}
      </group>

      <group ref={ortho}>
        <mesh>
          <boxGeometry args={[2.15, 0.022, 0.022]} />
          <meshStandardMaterial
            color={new THREE.Color("#0a1524")}
            metalness={0.93}
            roughness={0.16}
            emissive={new THREE.Color("#2ef2b5")}
            emissiveIntensity={0.95}
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[2.05, 0.018, 0.018]} />
          <meshStandardMaterial
            color={new THREE.Color("#0a1524")}
            metalness={0.93}
            roughness={0.16}
            emissive={new THREE.Color("#2bc3ff")}
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[2.12, 0.016, 0.016]} />
          <meshStandardMaterial
            color={new THREE.Color("#0a1524")}
            metalness={0.93}
            roughness={0.16}
            emissive={new THREE.Color("#9ae9ff")}
            emissiveIntensity={0.42}
          />
        </mesh>
      </group>
    </group>
  );
}

function ConductiveNetwork({
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
  const lines = useRef<THREE.LineSegments>(null);
  const nodeCount = mode === "lite" ? 30 : 54;

  const { geometry, bases } = useMemo(() => {
    const positions = new Float32Array(nodeCount * 2 * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const b: { a: number; r: number; y: number; zOff: number }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const ring = i % 3;
      const a = (i / nodeCount) * Math.PI * 2 + ring * 0.45;
      const r = 1.15 + ring * 0.38 + hash01(i, 61) * 0.22;
      const y = (hash01(i, 67) - 0.5) * 0.55;
      const zOff = (hash01(i, 71) - 0.5) * 0.35;
      b.push({ a, r, y, zOff });
    }
    return { geometry: g, bases: b };
  }, [nodeCount]);

  const mat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#5AE8FF"),
        transparent: true,
        opacity: mode === "lite" ? 0.14 : 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [mode]
  );

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const heroT = clamp01(progress / Math.max(0.001, heroRangeEnd));
    const clarity = smoothstep(heroT);
    const chaos = 1 - clarity;

    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const pulse = 0.5 + 0.5 * Math.sin(t * (2.2 + clarity * 1.8));

    for (let i = 0; i < nodeCount; i++) {
      const { a, r, y, zOff } = bases[i]!;
      const wobble =
        chaos *
        (0.14 * Math.sin(t * 2.4 + i * 0.31) + 0.1 * Math.sin(t * 3.1 + i * 0.17));
      const nx = Math.cos(a + chaos * 0.08 * Math.sin(t * 0.9 + i)) * (r + wobble);
      const ny = y + chaos * 0.12 * Math.sin(t * 1.7 + i * 0.23);
      const nz = Math.sin(a + chaos * 0.06 * Math.cos(t * 0.85 + i)) * (r + wobble) + zOff;

      const pull = THREE.MathUtils.lerp(0.12, 0.42, clarity) + pulse * 0.06 * clarity;
      const hx = nx * pull;
      const hy = ny * pull * 0.85;
      const hz = nz * pull;

      arr[i * 6 + 0] = nx;
      arr[i * 6 + 1] = ny;
      arr[i * 6 + 2] = nz;
      arr[i * 6 + 3] = hx;
      arr[i * 6 + 4] = hy;
      arr[i * 6 + 5] = hz;
    }
    attr.needsUpdate = true;

    mat.opacity = THREE.MathUtils.lerp(
      mat.opacity,
      (mode === "lite" ? 0.12 : 0.18 + chaos * 0.16 + clarity * 0.2) * intensity,
      1 - Math.pow(0.001, dt)
    );
  });

  return <lineSegments ref={lines} geometry={geometry} material={mat} />;
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
      gridDiv: mode === "lite" ? 22 : 36,
      nodeCount: mode === "lite" ? 22 : 64,
    };
  }, [mode]);

  const { grid, nodes } = useMemo(() => {
    const size = 18;
    const g = new THREE.GridHelper(size, gridDiv, "#2BC3FF", "#0c1826");
    const gmat = g.material as THREE.Material;
    gmat.transparent = true;
    gmat.opacity = mode === "lite" ? 0.16 : 0.24;

    const geo = new THREE.SphereGeometry(0.028, 10, 10);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#2EF2B5"),
      transparent: true,
      opacity: mode === "lite" ? 0.45 : 0.72,
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
    pivot.rotation.y = Math.sin(t * 0.055) * (0.05 + chaos * 0.06);
    pivot.position.y = Math.sin(t * 0.28) * (0.01 + chaos * 0.02);

    const gmat = grid.material as THREE.Material | THREE.Material[];
    const mats = Array.isArray(gmat) ? gmat : [gmat];
    const breathe =
      0.17 +
      Math.sin(t * (1.05 + chaos * 1.1)) * 0.04 * chaos +
      clarity * (0.08 + 0.04 * Math.sin(t * 0.65));
    for (const m of mats) {
      (m as THREE.Material & { opacity?: number }).opacity = mode === "lite" ? 0.15 : breathe;
    }
  });

  return (
    <group position={[0, -1.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
  const ringGeo = useMemo(() => new THREE.RingGeometry(0.35, 0.37, 64), []);
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
    const phase = (t * (0.22 + clarity * 0.28)) % 1;
    mesh.current.scale.setScalar(1.55 + phase * 12);
    mat.opacity = (1 - phase) * 0.12 * (0.45 + clarity) * (mode === "lite" ? 0.55 : 1);
    mesh.current.rotation.z = t * 0.042;
  });

  return <mesh ref={mesh} geometry={ringGeo} material={mat} position={[0, 0.02, 0]} />;
}

function HolographicPanels() {
  const glass = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#050c14"),
        transparent: true,
        opacity: 0.42,
        blending: THREE.NormalBlending,
      }),
    []
  );
  const glowBack = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#2BC3FF"),
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );
  const edge = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#7AE8FF"),
        transparent: true,
        opacity: 0.62,
        blending: THREE.AdditiveBlending,
      }),
    []
  );
  const arcMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#2EF2B5"),
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    []
  );

  const geo = useMemo(() => new THREE.PlaneGeometry(1.48, 0.94, 1, 1), []);
  const glowGeo = useMemo(() => new THREE.PlaneGeometry(1.64, 1.06, 1, 1), []);
  const arcGeo = useMemo(() => new THREE.RingGeometry(0.42, 0.425, 64, 1, 0, Math.PI * 1.12), []);

  const outline = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const w = 0.74;
    const h = 0.47;
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
    for (let i = 0; i < 16; i++) {
      const x = -0.58 + (i / 15) * 1.16;
      y += (hash01(i, 91) - 0.42) * 0.045;
      y = THREE.MathUtils.clamp(y, -0.34, 0.3);
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
        opacity: 0.72,
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
      <mesh geometry={arcGeo} material={arcMat} position={[-0.08, 0.18, 0.01]} rotation={[0, 0.12, 0.35]} />
      <primitive object={chartLineObj} position={[0, 0.02, 0.008]} rotation={[0, 0.12, 0]} />

      {heights.map((h, i) => (
        <mesh key={i} position={[-0.42 + i * 0.16, -0.34 + h * 0.5, 0.012]} rotation={[0, 0.12, 0]}>
          <boxGeometry args={[0.1, h, 0.03]} />
          <meshStandardMaterial
            color="#050c14"
            metalness={0.86}
            roughness={0.16}
            emissive="#2EF2B5"
            emissiveIntensity={1.25}
            transparent
            opacity={0.94}
          />
        </mesh>
      ))}

      <mesh geometry={geo} material={glass} position={[0.28, -0.64, -0.2]} rotation={[0, 0.32, 0]} scale={0.76} />
      <primitive object={line2} position={[0.28, -0.64, -0.198]} rotation={[0, 0.32, 0]} scale={0.76} />
    </group>
  );
}

function sampleHeroCamera(t01: number, mode: HeroPerfMode, clarity: number) {
  const z = mode === "lite" ? 6.52 : 6.22;
  const cx = THREE.MathUtils.lerp(-0.52, -0.38, clarity);
  const keys = [
    { pos: new THREE.Vector3(cx, 0.36, z), lookAt: new THREE.Vector3(1.08, 0.08, -0.12), drift: 0.068 },
    { pos: new THREE.Vector3(cx - 0.18, 0.46, z + 0.12), lookAt: new THREE.Vector3(1.12, 0.06, -0.14), drift: 0.058 },
    { pos: new THREE.Vector3(cx + 0.06, 0.32, z), lookAt: new THREE.Vector3(1.06, 0.05, -0.1), drift: 0.052 },
    { pos: new THREE.Vector3(cx - 0.1, 0.5, z - 0.1), lookAt: new THREE.Vector3(1.02, 0.02, -0.12), drift: 0.046 },
    { pos: new THREE.Vector3(cx - 0.14, 0.42, z + 0.06), lookAt: new THREE.Vector3(1.1, 0.04, -0.14), drift: 0.042 },
    { pos: new THREE.Vector3(cx - 0.02, 0.38, z - 0.06), lookAt: new THREE.Vector3(1.08, 0.03, -0.1), drift: 0.038 },
  ];

  const n = keys.length;
  const x = THREE.MathUtils.clamp(t01, 0, 1) * (n - 1);
  const i = Math.floor(x);
  const f = x - i;
  const a = keys[Math.min(i, n - 1)]!;
  const b = keys[Math.min(i + 1, n - 1)]!;
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
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453123;
  return x - Math.floor(x);
}

function remapStoryProgress(p: number) {
  const x = clamp01(p);
  const a = 0.12;
  const b = 0.32;
  const c = 0.62;

  if (x <= a) return (x / a) * 0.34;
  if (x <= b) return 0.34 + ((x - a) / (b - a)) * 0.28;
  if (x <= c) return 0.62 + ((x - b) / (c - b)) * 0.22;
  return 0.84 + ((x - c) / (1 - c)) * 0.16;
}
