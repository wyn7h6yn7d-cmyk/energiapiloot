"use client";

import { PropsWithChildren } from "react";

import { LenisProvider } from "@/lib/motion/lenis-provider";

export function Providers({ children }: PropsWithChildren) {
  return <LenisProvider>{children}</LenisProvider>;
}

