"use client";

import Lenis from "lenis";
import { PropsWithChildren, useEffect, useRef } from "react";

/**
 * Single smooth-scroll layer (marketing + app).
 * We keep this lightweight; per-page GSAP/ScrollTrigger hooks can opt-in.
 */
export function LenisProvider({ children }: PropsWithChildren) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return children;
}

