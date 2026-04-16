"use client";

import { useEffect, useMemo, useState } from "react";

import { ensureGsap } from "@/lib/motion/gsap";

export type PerfMode = "full" | "lite";

export type DeviceProfile = {
  mode: PerfMode;
  isMobile: boolean;
  isTouch: boolean;
  reducedMotion: boolean;
  lowEnd: boolean;
  /** If true, prefer non-3D hero fallback on mobile */
  preferMobileFallback: boolean;
};

function getConnection() {
  return (navigator as any).connection as
    | { effectiveType?: string; saveData?: boolean }
    | undefined;
}

export function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>({
    mode: "full",
    isMobile: false,
    isTouch: false,
    reducedMotion: false,
    lowEnd: false,
    preferMobileFallback: false,
  });

  useEffect(() => {
    const mqlMobile = window.matchMedia("(max-width: 768px)");
    const mqlReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const evalMode = () => {
      const memory = (navigator as any).deviceMemory ?? 8;
      const cores = navigator.hardwareConcurrency ?? 8;
      const mobile = mqlMobile.matches;
      const reduced = mqlReduced.matches;
      const touch =
        "ontouchstart" in window ||
        (navigator as any).maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0;
      const conn = getConnection();
      const saveData = Boolean(conn?.saveData);
      const slowNet = ["slow-2g", "2g"].includes(conn?.effectiveType ?? "");

      const weak = memory <= 4 || cores <= 4 || saveData || slowNet;
      const mode: PerfMode = mobile || reduced || weak ? "lite" : "full";
      const preferMobileFallback = mobile && (reduced || weak);

      setProfile({
        mode,
        isMobile: mobile,
        isTouch: touch,
        reducedMotion: reduced,
        lowEnd: weak,
        preferMobileFallback,
      });
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

  return profile;
}

export function usePerfMode(): PerfMode {
  return useDeviceProfile().mode;
}

export function useScrollStory({
  container,
  sectionCount,
  mode = "full",
}: {
  container: React.RefObject<HTMLElement | null>;
  sectionCount: number;
  mode?: PerfMode;
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

    // Lite mode: avoid GSAP/ScrollTrigger; use native scroll.
    if (mode === "lite") {
      let raf = 0;
      const onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const viewport = window.innerHeight || 1;
          const total = rect.height - viewport;
          const scrolled = -rect.top;
          const p = clamp01(total <= 0 ? 0 : scrolled / total);
          setProgress(p);
          setActiveIndex(nearestIndex(p, snapPoints));
        });
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
        cancelAnimationFrame(raf);
      };
    }

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
  }, [container, mode, snapPoints]);

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

