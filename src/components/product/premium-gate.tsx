"use client";

import {
  LockedResultZone,
  DEFAULT_PREMIUM_VALUE_POINTS,
  type LockedCta,
  type PremiumTeaseVariant,
} from "@/components/product/locked-result-zone";
import { PremiumReportDeliverableTease } from "@/components/product/premium-report-deliverable";
import { useUnlockSnapshot } from "@/hooks/use-unlock-snapshot";
import type { UnlockEntitlement } from "@/lib/unlock/types";

export type PremiumGateProps = {
  children: React.ReactNode;
  className?: string;
  /** Which purchased capability opens this gate (presentation is separate — see `LockedResultZone`). */
  requireEntitlement?: UnlockEntitlement;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  valuePoints?: string[];
  secondaryCta?: LockedCta;
  tertiaryCta?: LockedCta;
  teaseVariant?: PremiumTeaseVariant;
  /** When true, adds backdrop blur on the obscuring veil (off by default for easier testing). */
  useObfuscationBlur?: boolean;
  showDemoCta?: boolean;
  showBadge?: boolean;
  showPlasma?: boolean;
  peekMaxHeightClass?: string;
  /** When locked, show PDF / deliverable teaser in the paywall card */
  showReportDeliverable?: boolean;
};

export function PremiumGate({
  children,
  className,
  requireEntitlement = "premium_results",
  title = "Täisvaade on veel kinni",
  description = "Siit algab päris otsus: domeenihinnang, pikk rahavoog, tundlikkus ja eelduste lõik — ühes vaates, mida saab ka edasi kanda.",
  ctaLabel = "Ava täisvaade",
  ctaHref = "/pricing#avamine",
  valuePoints,
  secondaryCta = {
    href: "/pricing#avamine",
    label: "Ava täiskokkuvõte",
    checkoutOfferId: "ep_offer_report",
  },
  tertiaryCta = {
    href: "/pricing#avamine",
    label: "Laadi PDF alla",
    checkoutOfferId: "ep_offer_download",
  },
  teaseVariant = "featured",
  useObfuscationBlur = false,
  showDemoCta = true,
  showBadge = true,
  showPlasma = true,
  peekMaxHeightClass,
  showReportDeliverable = true,
}: PremiumGateProps) {
  const { isGranted } = useUnlockSnapshot();
  const unlocked = isGranted(requireEntitlement);

  return (
    <LockedResultZone
      locked={!unlocked}
      className={className}
      peekMaxHeightClass={peekMaxHeightClass}
      showBadge={showBadge}
      showPlasma={showPlasma}
      useObfuscationBlur={useObfuscationBlur}
      teaseVariant={teaseVariant}
      headline={title}
      subline={description}
      valuePoints={valuePoints ?? [...DEFAULT_PREMIUM_VALUE_POINTS]}
      primaryCta={{ href: ctaHref, label: ctaLabel, checkoutOfferId: "ep_offer_premium_results" }}
      secondaryCta={secondaryCta}
      tertiaryCta={tertiaryCta}
      showDemoCta={showDemoCta}
      reportDeliverable={showReportDeliverable ? <PremiumReportDeliverableTease /> : undefined}
    >
      {children}
    </LockedResultZone>
  );
}

export { DEFAULT_PREMIUM_VALUE_POINTS } from "@/components/product/locked-result-zone";
