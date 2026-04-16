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
      const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
      for (const el of els) {
        el.style.opacity = "1";
        el.style.transform = "none";
        (el.style as CSSStyleDeclaration & { filter?: string }).filter = "none";
      }
      const staggerEls = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal-stagger]"));
      for (const el of staggerEls) {
        el.style.opacity = "1";
        el.style.transform = "none";
      }
      return;
    }

    const { gsap, ScrollTrigger } = ensureGsap();
    const hero = root.querySelector<HTMLElement>("[data-section='hero']");
    const heroPin = root.querySelector<HTMLElement>("[data-hero-pin]");
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      if (!hero || !heroPin) return;
      return ScrollTrigger.create({
        trigger: hero,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * 0.52)}`,
        pin: heroPin,
        pinSpacing: true,
        anticipatePin: 1,
      });
    });

    const ctx = gsap.context(() => {
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
          { autoAlpha: 0, y: 14, filter: "blur(3px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", stagger: 0.08 }
        );
      }

      const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-section='story']"));
      for (const s of sections) {
        const left = s.querySelectorAll("[data-reveal='left']");
        const right = s.querySelectorAll("[data-reveal='right']");
        const staggerEls = s.querySelectorAll("[data-reveal-stagger]");
        const parallax = s.querySelector<HTMLElement>("[data-story-parallax='panel']");

        gsap.fromTo(
          left,
          { autoAlpha: 0, y: 28, filter: "blur(6px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            ease: "none",
            scrollTrigger: {
              trigger: s,
              start: "top 88%",
              end: "top 40%",
              scrub: 0.65,
            },
          }
        );

        gsap.fromTo(
          right,
          { autoAlpha: 0, y: 22, scale: 0.98 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: s,
              start: "top 90%",
              end: "top 36%",
              scrub: 0.72,
            },
          }
        );

        if (staggerEls.length) {
          gsap.fromTo(
            staggerEls,
            { autoAlpha: 0, y: 16 },
            {
              autoAlpha: 1,
              y: 0,
              stagger: 0.07,
              ease: "none",
              scrollTrigger: {
                trigger: s,
                start: "top 78%",
                end: "top 38%",
                scrub: 0.85,
              },
            }
          );
        }

        if (parallax) {
          gsap.fromTo(
            parallax,
            { y: 28 },
            {
              y: -18,
              ease: "none",
              scrollTrigger: {
                trigger: s,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }
      }

      ScrollTrigger.refresh();
    }, root);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, [container, mode]);
}
