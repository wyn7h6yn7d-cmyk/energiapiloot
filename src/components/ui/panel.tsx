"use client";

import { type HTMLAttributes } from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Panel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <Card variant="panel" hover="lift" className={className} {...props} />;
}

export function PanelHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <CardHeader className={cn("items-start", className)} {...props} />;
}

export function PanelTitle({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <CardTitle className={className} {...props} />;
}

export function PanelDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <CardDescription className={className} {...props} />;
}

