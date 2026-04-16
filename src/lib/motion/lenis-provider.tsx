"use client";

import Lenis from "lenis";
import { PropsWithChildren, useEffect, useRef } from "react";

import { ensureGsap } from "@/lib/motion/gsap";

/**
 * Single smooth-scroll layer (marketing + app).
 * We keep this lightweight; per-page GSAP/ScrollTrigger hooks can opt-in.
 */
export function LenisProvider({ children }: PropsWithChildren) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const { ScrollTrigger } = ensureGsap();
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      ScrollTrigger.update();
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return children;
}

