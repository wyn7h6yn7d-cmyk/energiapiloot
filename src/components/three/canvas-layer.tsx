"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<
  CanvasProps & {
    className?: string;
  }
>;

export function CanvasLayer({ children, className, ...props }: Props) {
  return (
    <div className={className ?? "pointer-events-none fixed inset-0 -z-10"}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        {...props}
      >
        {children}
      </Canvas>
    </div>
  );
}

