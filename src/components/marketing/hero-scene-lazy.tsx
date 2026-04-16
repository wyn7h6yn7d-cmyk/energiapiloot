"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

import { cn } from "@/lib/utils";

const HeroUniverseCanvasLazy = dynamic(
  () => import("@/components/three/hero-universe-canvas").then((m) => m.HeroUniverseCanvas),
  {
    ssr: false,
    loading: () => <HeroSceneLoading />,
  }
);

const ThreeOverlayLazy = dynamic(
  () => import("@/components/three/three-overlay").then((m) => m.ThreeOverlay),
  { ssr: false }
);

export function HeroSceneLazy({
  progress,
  mode,
  heroRangeEnd,
  panels,
  intensity,
}: {
  progress: number;
  mode: "full" | "lite";
  heroRangeEnd: number;
  panels: boolean;
  intensity: number;
}) {
  return (
    <Suspense fallback={<HeroSceneLoading />}>
      <HeroUniverseCanvasLazy
        progress={progress}
        mode={mode}
        heroRangeEnd={heroRangeEnd}
        panels={panels}
        intensity={intensity}
      />
      <ThreeOverlayLazy />
    </Suspense>
  );
}

function HeroSceneLoading() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 ep-electric-gradient",
          "after:absolute after:inset-0 after:content-[''] after:ep-grid-overlay",
          "opacity-95"
        )}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background/80"
      />
    </div>
  );
}

