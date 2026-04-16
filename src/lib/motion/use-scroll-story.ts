"use client";

import { useEffect, useMemo, useState } from "react";

import { ensureGsap } from "@/lib/motion/gsap";

export type PerfMode = "full" | "lite";

export function usePerfMode(): PerfMode {
  const [mode, setMode] = useState<PerfMode>("full");

  useEffect(() => {
    const mqlMobile = window.matchMedia("(max-width: 768px)");
    const mqlReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const evalMode = () => {
      const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
      const cores = navigator.hardwareConcurrency ?? 8;
      const mobile = mqlMobile.matches;
      const reduced = mqlReduced.matches;
      const weak = memory <= 4 || cores <= 4;
      setMode(mobile || reduced || weak ? "lite" : "full");
    };

    evalMode();
    mqlMobile.addEventListener?.("change", evalMode);
    mqlReduced.addEventListener?.("change", evalMode);
    window.addEventListener("resize", evalMode);

    return () => {
      mqlMobile.removeEventListener?.("change", evalMode);
      mqlReduced.removeEventListener?.("change", evalMode);
      window.removeEventListener("resize", evalMode);
    };
  }, []);

  return mode;
}

export function useScrollStory({
  container,
  sectionCount,
}: {
  container: React.RefObject<HTMLElement | null>;
  sectionCount: number;
}) {
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const snapPoints = useMemo(() => {
    const n = Math.max(1, sectionCount);
    return Array.from({ length: n }, (_, i) => i / (n - 1 || 1));
  }, [sectionCount]);

  useEffect(() => {
    const el = container.current;
    if (!el) return;

    const { ScrollTrigger } = ensureGsap();

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate(self) {
        const p = clamp01(self.progress);
        setProgress(p);
        const idx = nearestIndex(p, snapPoints);
        setActiveIndex(idx);
      },
    });

    return () => {
      st.kill();
    };
  }, [container, snapPoints]);

  return { progress, activeIndex };
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function nearestIndex(v: number, points: number[]) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < points.length; i++) {
    const d = Math.abs(points[i] - v);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

