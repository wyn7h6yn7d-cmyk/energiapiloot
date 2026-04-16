"use client";

import { cn } from "@/lib/utils";

export type PremiumGateProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * Legacy props kept for compatibility — gating is disabled in full-access test mode.
   * (No paywall, no blur lock, no purchase prompts.)
   */
  requireEntitlement?: unknown;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  valuePoints?: string[];
  secondaryCta?: unknown;
  tertiaryCta?: unknown;
  teaseVariant?: unknown;
  useObfuscationBlur?: boolean;
  showDemoCta?: boolean;
  showBadge?: boolean;
  showPlasma?: boolean;
  peekMaxHeightClass?: string;
  showReportDeliverable?: boolean;
};

export function PremiumGate({
  children,
  className,
  // Props intentionally ignored in full-access mode:
  requireEntitlement: _requireEntitlement,
  title: _title,
  description: _description,
  ctaLabel: _ctaLabel,
  ctaHref: _ctaHref,
  valuePoints: _valuePoints,
  secondaryCta: _secondaryCta,
  tertiaryCta: _tertiaryCta,
  teaseVariant: _teaseVariant,
  useObfuscationBlur: _useObfuscationBlur,
  showDemoCta: _showDemoCta,
  showBadge: _showBadge,
  showPlasma: _showPlasma,
  peekMaxHeightClass: _peekMaxHeightClass,
  showReportDeliverable: _showReportDeliverable,
}: PremiumGateProps) {
  return <div className={cn(className)}>{children}</div>;
}

export const DEFAULT_PREMIUM_VALUE_POINTS: readonly string[] = [];
