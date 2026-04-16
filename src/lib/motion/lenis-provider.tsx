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

    const mqlReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqlMobile = window.matchMedia("(max-width: 768px)");
    const memory = (navigator as any).deviceMemory ?? 8;
    const cores = navigator.hardwareConcurrency ?? 8;
    const touch =
      "ontouchstart" in window ||
      (navigator as any).maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;
    const conn = (navigator as any).connection as
      | { effectiveType?: string; saveData?: boolean }
      | undefined;
    const saveData = Boolean(conn?.saveData);
    const slowNet = ["slow-2g", "2g"].includes(conn?.effectiveType ?? "");
    const weak = memory <= 4 || cores <= 4 || saveData || slowNet;

    // On mobile/weak/reduced-motion devices prefer native scrolling (less jank).
    if (mqlReduced.matches || mqlMobile.matches || touch || weak) {
      return;
    }

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

