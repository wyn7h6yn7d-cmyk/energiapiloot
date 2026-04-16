"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Line } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

type Props = {
  progress: number; // 0..1 page scroll progress
};

export function MarketingCanvas({ progress }: Props) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 42, position: [0, 0.2, 6] }}
      >
        <color attach="background" args={["#070A12"]} />
        <Scene progress={progress} />
        <Environment preset="city" />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/80" />
    </div>
  );
}

function Scene({ progress }: Props) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const lineGroup = useRef<THREE.Group>(null);
  const { invalidate } = useThree();

  const curve = useMemo(() => {
    const pts = [
      new THREE.Vector3(-3.8, -0.6, 0),
      new THREE.Vector3(-1.6, 0.8, 0.2),
      new THREE.Vector3(1.1, -0.2, -0.2),
      new THREE.Vector3(3.6, 0.7, 0),
    ];
    return new THREE.CatmullRomCurve3(pts);
  }, []);

  useEffect(() => {
    // Re-render on scroll-driven updates while keeping the rest static.
    invalidate();
  }, [progress, invalidate]);

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const p = THREE.MathUtils.clamp(progress, 0, 1);

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

    if (ring.current) {
      ring.current.rotation.z += dt * 0.25;
      ring.current.position.y = THREE.MathUtils.lerp(
        ring.current.position.y,
        -0.1 + Math.sin(t * 0.6) * 0.08 + (p - 0.5) * 0.2,
        1 - Math.pow(0.001, dt)
      );
      ring.current.scale.setScalar(THREE.MathUtils.lerp(1.0, 1.25, smoothstep(p)));
    }

    if (lineGroup.current) {
      lineGroup.current.rotation.z = (p - 0.5) * 0.2;
      lineGroup.current.position.y = THREE.MathUtils.lerp(0.2, -0.25, p);
    }
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 3, 2]} intensity={1.2} />
      <pointLight
        position={[-2.2, 1.4, 2.6]}
        intensity={20}
        color={new THREE.Color("#2EF2B5")}
        distance={12}
      />
      <pointLight
        position={[2.6, 0.4, 2.2]}
        intensity={18}
        color={new THREE.Color("#2BC3FF")}
        distance={12}
      />

      <mesh ref={ring} position={[0, -0.1, 0]}>
        <torusKnotGeometry args={[1.15, 0.36, 220, 20, 2, 3]} />
        <meshStandardMaterial
          color={new THREE.Color("#0B111F")}
          metalness={0.85}
          roughness={0.25}
          emissive={new THREE.Color("#0A2B3A")}
          emissiveIntensity={1.4}
        />
      </mesh>

      <group ref={lineGroup}>
        <Line
          points={curve.getPoints(240)}
          color="#2BC3FF"
          opacity={0.75}
          transparent
          lineWidth={1}
        />
      </group>

      <GridPlane />
    </group>
  );
}

function GridPlane() {
  const grid = useMemo(() => {
    const size = 14;
    const div = 40;
    const g = new THREE.GridHelper(size, div, "#1E4D6A", "#0F1E2A");
    (g.material as THREE.Material).transparent = true;
    (g.material as THREE.Material).opacity = 0.35;
    return g;
  }, []);

  return <primitive object={grid} position={[0, -1.45, 0]} />;
}

function smoothstep(x: number) {
  const t = THREE.MathUtils.clamp(x, 0, 1);
  return t * t * (3 - 2 * t);
}

