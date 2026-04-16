"use client";

import { useEffect } from "react";

import { ensureGsap } from "@/lib/motion/gsap";

export function useScrollChoreography({
  container,
  mode,
}: {
  container: React.RefObject<HTMLElement | null>;
  mode: "full" | "lite";
}) {
  useEffect(() => {
    const root = container.current;
    if (!root) return;

    // Accessibility + perf: keep choreography minimal in lite mode.
    if (mode === "lite") {
      // Ensure content is visible (no stuck opacity/transform)
      const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
      for (const el of els) {
        el.style.opacity = "1";
        el.style.transform = "none";
        (el.style as any).filter = "none";
      }
      return;
    }

    const { gsap, ScrollTrigger } = ensureGsap();
    const ctx = gsap.context(() => {
      // HERO: subtle entrance + optional pin for cinematic pacing.
      const hero = root.querySelector<HTMLElement>("[data-section='hero']");
      const heroPin = root.querySelector<HTMLElement>("[data-hero-pin]");

      if (hero) {
        const heroTl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.9 },
          scrollTrigger: {
            trigger: hero,
            start: "top 75%",
            end: "bottom top",
            toggleActions: "play none none reverse",
          },
        });

        heroTl.fromTo(
          hero.querySelectorAll("[data-reveal]"),
          { autoAlpha: 0, y: 16, filter: "blur(4px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", stagger: 0.08 }
        );

        if (heroPin) {
          ScrollTrigger.create({
            trigger: hero,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * 0.6)}`,
            pin: heroPin,
            pinSpacing: true,
            anticipatePin: 1,
          });
        }
      }

      // STORY sections: purpose-driven reveals (left then right).
      const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-section='story']"));
      for (const s of sections) {
        const left = s.querySelectorAll("[data-reveal='left']");
        const right = s.querySelectorAll("[data-reveal='right']");

        const tl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.8 },
          scrollTrigger: {
            trigger: s,
            start: "top 75%",
            end: "bottom top",
            toggleActions: "play none none reverse",
          },
        });

        if (left.length) {
          tl.fromTo(left, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0 }, 0);
        }
        if (right.length) {
          tl.fromTo(right, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0 }, 0.1);
        }
      }

      // Refresh after setup (handles dynamic heights / fonts).
      ScrollTrigger.refresh();
    }, root);

    return () => {
      ctx.revert();
    };
  }, [container, mode]);
}

